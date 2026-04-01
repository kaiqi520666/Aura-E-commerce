<script setup>
import { onMounted, ref, watch } from 'vue'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  createOrderAction: {
    type: Function,
    required: true,
  },
  captureOrderAction: {
    type: Function,
    required: true,
  },
})

const { withLoading } = useGlobalLoading()
const toast = useGlobalToast()
const containerRef = ref(null)
const sdkError = ref('')
const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || ''
const currency = import.meta.env.VITE_PAYPAL_CURRENCY || 'USD'
const currentPaymentNo = ref('')
const currentPaypalOrderId = ref('')
let renderVersion = 0
let sdkPromise = null

function getSdkSrc() {
  const params = new URLSearchParams({
    'client-id': clientId,
    components: 'buttons',
    currency,
  })
  return `https://www.paypal.com/sdk/js?${params.toString()}`
}

function ensureSdkLoaded() {
  if (!clientId) {
    throw new Error('PayPal client id is missing.')
  }

  const sdkSrc = getSdkSrc()
  if (window.paypal?.Buttons) {
    const currentScript = document.querySelector('script[data-paypal-sdk="true"]')
    if (currentScript?.src === sdkSrc) {
      return Promise.resolve(window.paypal)
    }
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-paypal-sdk="true"]')
      if (existing && existing.src !== sdkSrc) {
        existing.remove()
      }

      const script = document.createElement('script')
      script.src = sdkSrc
      script.async = true
      script.dataset.paypalSdk = 'true'
      script.onload = () => resolve(window.paypal)
      script.onerror = () => {
        sdkPromise = null
        reject(new Error('Failed to load the PayPal SDK.'))
      }

      document.head.appendChild(script)
    })
  }

  return sdkPromise
}

async function renderButtons() {
  const version = ++renderVersion
  sdkError.value = ''

  if (!containerRef.value) return
  containerRef.value.innerHTML = ''

  if (props.disabled) {
    return
  }

  try {
    const paypal = await ensureSdkLoaded()
    if (version !== renderVersion || !containerRef.value) return

    const buttons = paypal.Buttons({
      style: {
        layout: 'vertical',
        shape: 'pill',
        color: 'gold',
        label: 'paypal',
      },
      createOrder: async () => {
        const result = await props.createOrderAction()
        currentPaymentNo.value = result.paymentNo
        currentPaypalOrderId.value = result.paypalOrderId
        return result.paypalOrderId
      },
      onApprove: async (data) => {
        const paypalOrderId = data.orderID || currentPaypalOrderId.value
        const result = await withLoading(
          () =>
            props.captureOrderAction({
              paymentNo: currentPaymentNo.value,
              paypalOrderId,
            }),
          'Confirming PayPal payment...'
        )
        window.location.href = result.redirectUrl
      },
      onCancel: () => {
        toast.info('PayPal payment cancelled.')
      },
      onError: (error) => {
        toast.error(error?.message || 'PayPal payment failed.')
      },
    })

    if (!buttons.isEligible()) {
      sdkError.value = 'PayPal is currently unavailable on this device.'
      return
    }

    await buttons.render(containerRef.value)
  } catch (error) {
    sdkError.value = error.message || 'Unable to load PayPal.'
  }
}

onMounted(renderButtons)
watch(() => props.disabled, renderButtons)
</script>

<template>
  <div class="space-y-3">
    <div ref="containerRef" class="min-h-11"></div>
    <p v-if="sdkError" class="text-sm text-red-600">{{ sdkError }}</p>
    <p v-if="!clientId" class="text-sm text-[var(--color-muted)]">
      Configure <code>VITE_PAYPAL_CLIENT_ID</code> to enable PayPal checkout.
    </p>
  </div>
</template>

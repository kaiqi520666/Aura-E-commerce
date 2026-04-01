<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PayPalButtons from '@/components/payment/PayPalButtons.vue'
import { useGlobalConfirm } from '@/composables/useGlobalConfirm'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import {
  capturePaypalOrder,
  createOrderPayment,
  createPaypalOrder,
  createProxyLink,
  getOrderDetail,
} from '@/lib/shop'

const route = useRoute()
const { confirm } = useGlobalConfirm()
const { withLoading } = useGlobalLoading()
const toast = useGlobalToast()
const order = ref(null)
const paymentMethod = ref('paypal')
const proxyLink = ref('')

const showNextStepHint = computed(() => route.query.from === 'checkout' && order.value?.status === 'PENDING_PAYMENT')

async function loadOrder() {
  order.value = await getOrderDetail(route.params.id)
}

async function continuePayment() {
  if (!order.value || order.value.status !== 'PENDING_PAYMENT') return
  try {
    await withLoading(async () => {
      const result = await createOrderPayment(order.value.id, paymentMethod.value)
      window.location.href = result.checkoutUrl
    }, 'Redirecting to payment...')
  } catch (error) {
    toast.error(error.message || 'Unable to start payment.')
  }
}

async function createPaypalPaymentOrder() {
  return createPaypalOrder(order.value.id)
}

async function capturePaypalPaymentOrder(payload) {
  return capturePaypalOrder(payload.paymentNo, payload.paypalOrderId)
}

async function makeProxyLink() {
  if (!order.value) return

  const hasExistingProxy = Boolean(order.value.proxyToken || proxyLink.value)
  if (hasExistingProxy) {
    const approved = await confirm({
      title: 'Generate a new proxy link?',
      message: 'The previous proxy payment link for this order will stop working.',
      confirmText: 'Replace link',
      cancelText: 'Keep current link',
    })
    if (!approved) return
  }

  try {
    const result = await createProxyLink(order.value.id)
    proxyLink.value = `${window.location.origin}${result.proxyUrl}`
    order.value.proxyToken = result.proxyToken
    toast.success('Proxy payment link generated.')
  } catch (error) {
    toast.error(error.message || 'Unable to generate a proxy payment link.')
  }
}

async function copyProxyLink() {
  if (!proxyLink.value) return
  try {
    await navigator.clipboard.writeText(proxyLink.value)
    toast.success('Proxy payment link copied.')
  } catch {
    toast.error('Copy failed. Please copy the link manually.')
  }
}

onMounted(loadOrder)
</script>

<template>
  <section v-if="order" class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="eyebrow">Order Detail</p>
        <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">{{ order.orderNo }}</h1>
      </div>
    </div>

    <div v-if="showNextStepHint" class="mb-6 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <p class="text-sm font-semibold text-[var(--color-ink)]">Order created successfully</p>
      <p class="mt-3 text-sm leading-7 text-[var(--color-muted)]">
        This order is currently unpaid. Continue to payment yourself, or generate a proxy payment link for someone else.
      </p>
    </div>

    <div v-if="proxyLink" class="mb-6 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <p class="text-sm font-semibold text-[var(--color-ink)]">Proxy payment link</p>
      <p class="mt-3 break-all rounded-2xl bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-wine)]">
        {{ proxyLink }}
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <button class="primary-pill !px-5" type="button" @click="copyProxyLink">Copy link</button>
      </div>
      <p class="mt-4 text-sm text-[var(--color-muted)]">
        This link currently does not expire automatically. Generating a new proxy link for the same order will replace the previous one.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
        <div class="space-y-4">
          <article v-for="item in order.items" :key="item.id" class="grid gap-4 rounded-[1.1rem] border border-[var(--color-border)] p-4 sm:grid-cols-[88px_1fr_auto] sm:items-center">
            <img :alt="item.productName" :src="item.productImage" class="h-22 w-22 rounded-[1rem] object-cover" />
            <div>
              <h2 class="font-semibold text-[var(--color-ink)]">{{ item.productName }}</h2>
              <p class="text-sm text-[var(--color-muted)]">Qty {{ item.quantity }}</p>
            </div>
            <p class="text-sm font-semibold text-[var(--color-wine)]">${{ Number(item.lineTotal).toFixed(2) }}</p>
          </article>
        </div>
      </section>

      <aside class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
        <p class="eyebrow mb-4">Summary</p>
        <div class="space-y-3 text-sm text-[var(--color-muted)]">
          <div class="flex items-center justify-between"><span>Status</span><span>{{ order.status }}</span></div>
          <div class="flex items-center justify-between"><span>Payment</span><span>{{ order.paymentMethod || 'Not paid yet' }}</span></div>
          <div class="flex items-center justify-between"><span>Items</span><span>{{ order.itemCount }}</span></div>
          <div class="flex items-center justify-between text-base font-semibold text-[var(--color-ink)]"><span>Total</span><span>${{ Number(order.totalAmount).toFixed(2) }}</span></div>
        </div>

        <div v-if="order.status === 'PENDING_PAYMENT'" class="mt-6 rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-cream)] p-4">
          <p class="font-semibold text-[var(--color-ink)]">Choose how to complete payment</p>
          <div class="mt-4 space-y-3">
            <label class="flex cursor-pointer items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-white p-4">
              <input v-model="paymentMethod" type="radio" value="paypal" />
              <div>
                <p class="font-semibold text-[var(--color-ink)]">PayPal</p>
                <p class="text-sm text-[var(--color-muted)]">Classic wallet checkout for card and PayPal balance.</p>
              </div>
            </label>
            <label class="flex cursor-pointer items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-white p-4">
              <input v-model="paymentMethod" type="radio" value="epusdt" />
              <div>
                <p class="font-semibold text-[var(--color-ink)]">USDT via epusdt</p>
                <p class="text-sm text-[var(--color-muted)]">Crypto checkout with an external confirmation callback.</p>
              </div>
            </label>
          </div>

          <div class="mt-4 grid gap-3">
            <PayPalButtons
              v-if="paymentMethod === 'paypal'"
              :create-order-action="createPaypalPaymentOrder"
              :capture-order-action="capturePaypalPaymentOrder"
            />
            <button
              v-else
              class="primary-pill w-full justify-center"
              type="button"
              @click="continuePayment"
            >
              Pay now
            </button>
            <button class="secondary-pill w-full justify-center" type="button" @click="makeProxyLink">Generate proxy link</button>
          </div>
        </div>

        <div class="mt-6 rounded-[1.1rem] bg-[var(--color-cream)] p-4 text-sm text-[var(--color-muted)]">
          <p class="font-semibold text-[var(--color-ink)]">Ship to</p>
          <p class="mt-2">{{ order.addressSnapshot.firstName }} {{ order.addressSnapshot.lastName }}</p>
          <p>{{ order.addressSnapshot.addressLine1 }} {{ order.addressSnapshot.addressLine2 }}</p>
          <p>{{ order.addressSnapshot.city }}, {{ order.addressSnapshot.state }} {{ order.addressSnapshot.postalCode }}</p>
          <p>{{ order.addressSnapshot.country }} • {{ order.addressSnapshot.phone }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Star } from 'lucide-vue-next'
import PayPalButtons from '@/components/payment/PayPalButtons.vue'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import {
  captureProxyPaypalOrder,
  createProxyPayment,
  createProxyPaypalOrder,
  getProxyDetail,
} from '@/lib/shop'

const route = useRoute()
const { withLoading } = useGlobalLoading()
const toast = useGlobalToast()
const loading = ref(true)
const detail = ref(null)
const provider = ref('paypal')
const errorMessage = ref('')

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await getProxyDetail(route.params.token)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

async function submitProxyPayment() {
  errorMessage.value = ''
  try {
    await withLoading(async () => {
      const result = await createProxyPayment(route.params.token, provider.value)
      window.location.href = result.checkoutUrl
    }, 'Redirecting to payment...')
  } catch (error) {
    errorMessage.value = error.message || 'Unable to start proxy payment.'
    toast.error(errorMessage.value)
  }
}

async function createPaypalPaymentOrder() {
  return createProxyPaypalOrder(route.params.token)
}

async function capturePaypalPaymentOrder(payload) {
  return captureProxyPaypalOrder(
    route.params.token,
    payload.paymentNo,
    payload.paypalOrderId
  )
}

onMounted(loadDetail)
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8">
      <p class="eyebrow">Proxy Payment</p>
      <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">Pay on behalf of a friend.</h1>
      <p class="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">This page shows a locked order summary. Product lines and shipping details cannot be edited here.</p>
    </div>

    <div v-if="loading" class="h-60 animate-pulse rounded-[1.1rem] bg-white"></div>

    <div v-else-if="detail" class="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div class="space-y-4">
        <article v-for="item in detail.items" :key="item.id" class="grid gap-4 rounded-[1.1rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.04)] sm:grid-cols-[110px_1fr_auto] sm:items-center">
          <img :alt="item.productName" :src="item.productImage" class="aspect-square w-full rounded-[1rem] object-cover" />
          <div>
            <h2 class="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">{{ item.productName }}</h2>
            <p class="mt-2 text-sm text-[var(--color-muted)]">Qty {{ item.quantity }}</p>
          </div>
          <p class="text-base font-semibold text-[var(--color-wine)]">${{ Number(item.lineTotal).toFixed(2) }}</p>
        </article>

        <div v-if="detail.reviewPreview?.length" class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
          <p class="eyebrow mb-4">Review Preview</p>
          <div class="grid gap-4 md:grid-cols-2">
            <article v-for="review in detail.reviewPreview" :key="review.id" class="rounded-[1.1rem] bg-[var(--color-cream)] p-4">
              <div class="inline-flex items-center gap-1 text-[var(--color-accent)]">
                <Star v-for="value in review.rating" :key="value" class="h-4 w-4 fill-current" />
              </div>
              <p class="mt-3 text-sm leading-7 text-[var(--color-muted)]">{{ review.content }}</p>
              <p class="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--color-wine)]">{{ review.userName }}</p>
            </article>
          </div>
        </div>
      </div>

      <aside class="h-fit rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.05)]">
        <p class="eyebrow">Order Summary</p>

        <div class="mt-4 flex items-center gap-3 rounded-[1rem] bg-[var(--color-cream)] px-4 py-3">
          <img
            v-if="detail.owner?.avatarUrl"
            :alt="detail.owner?.displayName"
            :src="detail.owner.avatarUrl"
            class="h-12 w-12 rounded-full object-cover"
          />
          <div
            v-else
            class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-semibold uppercase text-[var(--color-wine)]"
          >
            {{ detail.owner?.displayName?.slice(0, 1) || 'A' }}
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Paying for</p>
            <p class="mt-1 text-sm font-semibold text-[var(--color-ink)]">{{ detail.owner?.displayName || 'A***a' }}</p>
          </div>
        </div>

        <p class="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Order number</p>
        <p class="mt-2 truncate text-lg font-semibold text-[var(--color-ink)]" :title="detail.orderNo">{{ detail.orderNo }}</p>
        <p class="mt-4 text-sm text-[var(--color-muted)]">Status: {{ detail.status }}</p>
        <p class="mt-1 text-sm text-[var(--color-muted)]">Total: ${{ Number(detail.totalAmount).toFixed(2) }}</p>

        <div class="mt-4 rounded-[1rem] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-muted)]">
          This proxy link currently does not expire automatically.
        </div>

        <div v-if="!detail.canPay" class="mt-4 rounded-[1rem] bg-[rgba(34,197,94,0.1)] px-4 py-3 text-sm text-green-700">
          This order has already been paid. No further action is required from the proxy payer.
        </div>

        <div class="mt-6 space-y-3">
          <label class="flex cursor-pointer items-center gap-3 rounded-[1.1rem] border border-[var(--color-border)] p-4">
            <input v-model="provider" type="radio" value="paypal" />
            <span>PayPal</span>
          </label>
          <label class="flex cursor-pointer items-center gap-3 rounded-[1.1rem] border border-[var(--color-border)] p-4">
            <input v-model="provider" type="radio" value="epusdt" />
            <span>USDT via epusdt</span>
          </label>
        </div>

        <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
        <div class="mt-6">
          <PayPalButtons
            v-if="detail.canPay && provider === 'paypal'"
            :create-order-action="createPaypalPaymentOrder"
            :capture-order-action="capturePaypalPaymentOrder"
          />
          <button
            v-else
            :disabled="!detail.canPay"
            class="primary-pill w-full justify-center disabled:opacity-50"
            type="button"
            @click="submitProxyPayment"
          >
            {{ detail.canPay ? 'Continue to payment' : 'Order already paid' }}
          </button>
        </div>
        <p v-if="detail.canPay" class="mt-3 text-sm text-[var(--color-muted)]">
          After successful payment, you will be redirected to a confirmation page with the order number and payment reference.
        </p>
      </aside>
    </div>

    <div v-else class="rounded-[1.1rem] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center text-[var(--color-muted)]">
      {{ errorMessage || 'Proxy payment link not found.' }}
    </div>
  </section>
</template>

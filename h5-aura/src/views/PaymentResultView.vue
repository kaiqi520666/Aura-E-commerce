<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle2, Clock3, XCircle } from 'lucide-vue-next'

const route = useRoute()
const status = computed(() => route.query.status || 'pending')
const paymentNo = computed(() => route.query.paymentNo || '')
const orderNo = computed(() => route.query.orderNo || '')
const isProxyPayment = computed(() => route.query.proxy === '1')

const pageMeta = computed(() => {
  if (status.value === 'success') {
    return {
      title: isProxyPayment.value ? 'Proxy payment confirmed' : 'Payment confirmed',
      description: isProxyPayment.value
        ? 'This order has been paid successfully on behalf of a friend. The order owner can now continue with fulfillment and delivery.'
        : 'Your order has been marked as paid and is now ready for the next operational step.',
      icon: CheckCircle2,
      tone: 'text-green-600',
    }
  }
  if (status.value === 'failed') {
    return {
      title: isProxyPayment.value ? 'Proxy payment failed' : 'Payment failed',
      description: isProxyPayment.value
        ? 'The proxy payment did not complete. You can reopen the link and try another payment method.'
        : 'The payment did not complete. You can return to the order and try another method.',
      icon: XCircle,
      tone: 'text-red-600',
    }
  }
  return {
    title: isProxyPayment.value ? 'Proxy payment pending' : 'Payment pending',
    description: isProxyPayment.value
      ? 'We are waiting for the proxy payment confirmation callback from the selected provider.'
      : 'We are waiting for the payment confirmation callback from the selected provider.',
    icon: Clock3,
    tone: 'text-amber-600',
  }
})
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <div class="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-10 text-center shadow-[0_24px_60px_rgba(17,17,17,0.06)]">
      <component :is="pageMeta.icon" :class="['mx-auto h-14 w-14', pageMeta.tone]" />
      <p class="eyebrow mt-6">Payment Result</p>
      <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">{{ pageMeta.title }}</h1>
      <p class="mt-5 text-base leading-8 text-[var(--color-muted)]">{{ pageMeta.description }}</p>

      <div class="mt-8 rounded-[1.25rem] bg-[var(--color-cream)] p-5 text-left">
        <p class="text-sm font-semibold text-[var(--color-ink)]">Payment reference</p>
        <div class="mt-4 grid gap-3 text-sm text-[var(--color-muted)]">
          <div class="flex items-center justify-between gap-4">
            <span>Payment type</span>
            <span class="text-right text-[var(--color-ink)]">{{ isProxyPayment ? 'Proxy payment' : 'Order payment' }}</span>
          </div>
          <div v-if="orderNo" class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span>Order number</span>
            <span class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-[var(--color-ink)] sm:text-right" :title="orderNo">{{ orderNo }}</span>
          </div>
          <div v-if="paymentNo" class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span>Payment number</span>
            <span class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-[var(--color-ink)] sm:text-right" :title="paymentNo">{{ paymentNo }}</span>
          </div>
        </div>
      </div>

      <p v-if="isProxyPayment && status === 'success'" class="mt-5 text-sm leading-7 text-[var(--color-muted)]">
        Save the order number and payment number if you need to confirm the proxy payment with the order owner.
      </p>

      <div class="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        <RouterLink v-if="!isProxyPayment" class="primary-pill justify-center" to="/orders">View orders</RouterLink>
        <RouterLink v-else class="primary-pill justify-center" to="/">Back to home</RouterLink>
        <RouterLink class="secondary-pill justify-center" to="/shop">Continue shopping</RouterLink>
      </div>
    </div>
  </section>
</template>

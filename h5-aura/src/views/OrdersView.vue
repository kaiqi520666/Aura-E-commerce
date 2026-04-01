<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalConfirm } from '@/composables/useGlobalConfirm'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { createProxyLink, getOrders } from '@/lib/shop'

const router = useRouter()
const { confirm } = useGlobalConfirm()
const toast = useGlobalToast()
const loading = ref(true)
const orders = ref([])
const proxyLink = ref('')
const proxyOrderId = ref(null)

async function loadOrders() {
  loading.value = true
  try {
    const result = await getOrders()
    orders.value = result.list || []
  } finally {
    loading.value = false
  }
}

async function makeProxyLink(order) {
  const hasExistingProxy = Boolean(order.proxyToken || (proxyOrderId.value === order.id && proxyLink.value))
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
    const result = await createProxyLink(order.id)
    proxyLink.value = `${window.location.origin}${result.proxyUrl}`
    proxyOrderId.value = order.id
    order.proxyToken = result.proxyToken
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

onMounted(loadOrders)
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8">
      <p class="eyebrow">Orders</p>
      <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">Order history</h1>
      <div v-if="proxyLink" class="mt-4 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-5 shadow-sm">
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
    </div>

    <div v-if="loading" class="grid gap-4">
      <article
        v-for="index in 4"
        :key="index"
        class="skeleton-panel p-6"
      >
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-3">
            <div class="skeleton-block skeleton-line w-44"></div>
            <div class="skeleton-block h-10 w-36 rounded-[1.1rem]"></div>
            <div class="skeleton-block skeleton-line w-28"></div>
          </div>
          <div class="flex flex-wrap gap-3">
            <div class="skeleton-block h-12 w-28 rounded-full"></div>
            <div class="skeleton-block h-12 w-34 rounded-full"></div>
          </div>
        </div>
      </article>
    </div>

    <div v-else-if="orders.length" class="grid gap-4">
      <article v-for="order in orders" :key="order.id" class="flex flex-col gap-5 rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="eyebrow">{{ order.orderNo }}</p>
          <h2 class="mt-2 font-[var(--font-display)] text-3xl text-[var(--color-ink)]">{{ order.status }}</h2>
          <p class="mt-2 text-sm text-[var(--color-muted)]">{{ order.itemCount }} items • ${{ Number(order.totalAmount).toFixed(2) }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="secondary-pill" type="button" @click="router.push({ name: 'order-detail', params: { id: order.id } })">View detail</button>
          <button v-if="order.status === 'PENDING_PAYMENT'" class="primary-pill" type="button" @click="makeProxyLink(order)">Create proxy link</button>
        </div>
      </article>
    </div>

    <div v-else class="rounded-[1.1rem] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center text-[var(--color-muted)]">
      No orders yet.
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { createOrder } from '@/lib/shop'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const { withLoading } = useGlobalLoading()
const toast = useGlobalToast()
const selectedAddressId = ref(null)

const canSubmit = computed(() => Boolean(selectedAddressId.value && cartStore.items.length))

onMounted(async () => {
  await Promise.all([userStore.fetchAddresses(), cartStore.fetchCart()])
  selectedAddressId.value = userStore.addresses.find((item) => item.isDefault)?.id || userStore.addresses[0]?.id || null
})

async function submitOrder() {
  if (!canSubmit.value) return
  try {
    await withLoading(async () => {
      const order = await createOrder(selectedAddressId.value)
      cartStore.reset()
      await router.push({ name: 'order-detail', params: { id: order.id }, query: { from: 'checkout' } })
    }, 'Creating your order...')
  } catch (error) {
    toast.error(error.message || 'Unable to create your order.')
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8">
      <p class="eyebrow">Checkout</p>
      <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">Confirm your order.</h1>
    </div>

    <div v-if="!userStore.addresses.length" class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-10 text-center">
      <p class="text-[var(--color-muted)]">Add a shipping address in your account before placing an order.</p>
      <RouterLink class="primary-pill mx-auto mt-5 inline-flex" to="/account">Go to account</RouterLink>
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div class="space-y-6">
        <section class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
          <p class="eyebrow mb-4">Shipping Address</p>
          <div class="grid gap-4">
            <label v-for="address in userStore.addresses" :key="address.id" class="flex cursor-pointer items-start gap-3 rounded-[1.1rem] border border-[var(--color-border)] p-4">
              <input v-model="selectedAddressId" :value="address.id" class="mt-1" type="radio" />
              <div>
                <p class="font-semibold text-[var(--color-ink)]">{{ address.firstName }} {{ address.lastName }}</p>
                <p class="mt-1 text-sm text-[var(--color-muted)]">{{ address.addressLine1 }} {{ address.addressLine2 }}</p>
                <p class="text-sm text-[var(--color-muted)]">{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
                <p class="text-sm text-[var(--color-muted)]">{{ address.country }} • {{ address.phone }}</p>
              </div>
            </label>
          </div>
        </section>

        <section class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
          <p class="eyebrow mb-4">Next Step</p>
          <div class="rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-cream)] p-5">
            <p class="font-semibold text-[var(--color-ink)]">Create the order first, then choose how to pay.</p>
            <p class="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              After the order is created, you will enter the order detail page. There you can continue to payment yourself or generate a proxy payment link for someone else.
            </p>
          </div>
        </section>
      </div>

      <aside class="h-fit rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.05)]">
        <p class="eyebrow">Summary</p>
        <div class="mt-5 space-y-4">
          <div v-for="item in cartStore.items" :key="item.id" class="flex items-center gap-3">
            <img :alt="item.product?.name" :src="item.product?.mainImage" class="h-16 w-16 rounded-[1rem] object-cover" />
            <div class="flex-1">
              <p class="text-sm font-semibold text-[var(--color-ink)]">{{ item.product?.name }}</p>
              <p class="text-sm text-[var(--color-muted)]">Qty {{ item.quantity }}</p>
            </div>
            <p class="text-sm font-semibold text-[var(--color-wine)]">${{ Number(item.lineTotal).toFixed(2) }}</p>
          </div>
        </div>
        <div class="mt-6 border-t border-[var(--color-border)] pt-6">
          <div class="flex items-center justify-between text-lg font-semibold text-[var(--color-ink)]">
            <span>Total</span>
            <span>${{ Number(cartStore.total).toFixed(2) }}</span>
          </div>
          <button :disabled="!canSubmit" class="primary-pill mt-6 w-full justify-center disabled:opacity-50" type="button" @click="submitOrder">Place order</button>
          <p class="mt-3 text-sm text-[var(--color-muted)]">
            This creates an unpaid order. Payment or proxy payment is chosen on the next page.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>

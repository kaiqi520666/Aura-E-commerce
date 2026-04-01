<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Minus, Plus, Trash2 } from 'lucide-vue-next'
import { useGlobalConfirm } from '@/composables/useGlobalConfirm'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const { confirm } = useGlobalConfirm()
const toast = useGlobalToast()

async function removeItem(id) {
  const approved = await confirm({
    title: 'Remove this item?',
    message: 'This product will be removed from your cart.',
    confirmText: 'Remove',
    cancelText: 'Keep',
    tone: 'danger',
  })
  if (!approved) return

  try {
    await cartStore.removeItem(id)
    toast.success('Item removed from your cart.')
  } catch (error) {
    toast.error(error.message || 'Unable to remove this item.')
  }
}

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await cartStore.fetchCart()
  }
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8 flex items-end justify-between">
      <div>
        <p class="eyebrow">Shopping Bag</p>
        <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">Cart</h1>
      </div>
      <p class="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">{{ cartStore.count }} items</p>
    </div>

    <div v-if="!userStore.isLoggedIn" class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-10 text-center">
      <p class="text-[var(--color-muted)]">Sign in to view and manage your cart.</p>
      <RouterLink class="primary-pill mx-auto mt-5 inline-flex" :to="{ name: 'auth', query: { redirect: '/cart' } }">Go to login</RouterLink>
    </div>

    <div v-else-if="cartStore.items.length" class="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div class="space-y-4">
        <article v-for="item in cartStore.items" :key="item.id" class="grid gap-5 rounded-[1.1rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.04)] sm:grid-cols-[120px_1fr_auto] sm:items-center">
          <img :alt="item.product?.name" :src="item.product?.mainImage" class="aspect-square w-full rounded-[1.1rem] object-cover" />
          <div>
            <RouterLink :to="{ name: 'product-detail', params: { id: item.productId } }" class="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">{{ item.product?.name }}</RouterLink>
            <p class="mt-2 text-sm leading-7 text-[var(--color-muted)]">{{ item.product?.subtitle }}</p>
            <p class="mt-3 text-lg font-semibold text-[var(--color-wine)]">${{ Number(item.product?.price).toFixed(2) }}</p>
          </div>
          <div class="flex flex-col items-end gap-4">
            <div class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-2 py-2">
              <button class="icon-button !h-9 !w-9" type="button" @click="cartStore.updateItem(item.id, Math.max(item.quantity - 1, 1))">
                <Minus class="h-4 w-4" />
              </button>
              <span class="w-8 text-center text-sm font-semibold">{{ item.quantity }}</span>
              <button class="icon-button !h-9 !w-9" type="button" @click="cartStore.updateItem(item.id, item.quantity + 1)">
                <Plus class="h-4 w-4" />
              </button>
            </div>
            <button class="inline-flex items-center gap-2 text-sm text-[var(--color-muted)]" type="button" @click="removeItem(item.id)">
              <Trash2 class="h-4 w-4" />
              Remove
            </button>
          </div>
        </article>
      </div>

      <aside class="h-fit rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.05)]">
        <p class="eyebrow">Order Summary</p>
        <div class="mt-5 space-y-4 text-sm text-[var(--color-muted)]">
          <div class="flex items-center justify-between">
            <span>Items</span>
            <span>{{ cartStore.summary.quantity }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Subtotal</span>
            <span>${{ Number(cartStore.summary.totalAmount).toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
        </div>
        <div class="mt-6 border-t border-[var(--color-border)] pt-6">
          <div class="flex items-center justify-between text-lg font-semibold text-[var(--color-ink)]">
            <span>Total</span>
            <span>${{ Number(cartStore.total).toFixed(2) }}</span>
          </div>
          <button class="primary-pill mt-6 w-full justify-center" type="button" @click="router.push('/checkout')">Proceed to checkout</button>
        </div>
      </aside>
    </div>

    <div v-else class="rounded-[1.1rem] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center text-[var(--color-muted)]">
      Your cart is empty.
      <div>
        <RouterLink class="primary-pill mx-auto mt-6 inline-flex" to="/shop">Start shopping</RouterLink>
      </div>
    </div>
  </section>
</template>

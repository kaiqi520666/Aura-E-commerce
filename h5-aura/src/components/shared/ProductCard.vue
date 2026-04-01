<script setup>
import { computed } from 'vue'
import { Heart, ShoppingBag, Star } from 'lucide-vue-next'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()
const cartStore = useCartStore()

const isFavorite = computed(() => favoriteStore.ids.includes(props.product.id))
const categorySlug = computed(() => props.product.category?.slug || props.product.categorySlug)

async function toggleFavoriteItem() {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'auth', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  await favoriteStore.toggle(props.product.id)
}

async function quickAdd() {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'auth', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  await cartStore.addItem(props.product.id, 1)
}
</script>

<template>
  <article class="group flex h-full flex-col rounded-[1.1rem] border border-[var(--color-border)] bg-white p-4 shadow-[0_18px_45px_rgba(17,17,17,0.05)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(17,17,17,0.09)]">
    <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="relative overflow-hidden rounded-[1.1rem] bg-[var(--color-cream)]">
      <img :alt="product.name" :src="product.mainImage" class="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" />
      <button type="button" class="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[var(--color-wine)] shadow-sm" @click.prevent="toggleFavoriteItem">
        <Heart :class="['h-4 w-4', isFavorite ? 'fill-current' : '']" />
      </button>
      <span v-if="product.bestSeller" class="absolute left-3 top-3 rounded-full bg-[var(--color-wine)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">Best Seller</span>
    </RouterLink>

    <div class="flex flex-1 flex-col px-1 pt-4">
      <p class="eyebrow text-left">{{ product.category?.name || categorySlug || 'Curated pick' }}</p>
      <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="mt-2 font-[var(--font-display)] text-2xl leading-tight text-[var(--color-ink)]">
        {{ product.name }}
      </RouterLink>
      <p class="mt-2 text-sm leading-6 text-[var(--color-muted)]">{{ product.subtitle }}</p>

      <div class="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <div class="inline-flex items-center gap-1 text-[var(--color-accent)]">
          <Star class="h-4 w-4 fill-current" />
          <span class="font-medium text-[var(--color-ink)]">{{ product.rating || 4.8 }}</span>
        </div>
        <span>•</span>
        <span>{{ product.reviewCount || 0 }} reviews</span>
      </div>

      <div class="mt-auto flex items-end justify-between gap-4 pt-5">
        <div>
          <p class="text-lg font-semibold text-[var(--color-wine)]">${{ Number(product.price).toFixed(2) }}</p>
          <p v-if="product.comparePrice" class="text-sm text-[var(--color-muted)] line-through">${{ Number(product.comparePrice).toFixed(2) }}</p>
        </div>
        <button type="button" class="inline-flex min-w-[9.75rem] flex-none items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-ink)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white" @click="quickAdd">
          <ShoppingBag class="h-4 w-4" />
          Quick Add
        </button>
      </div>
    </div>
  </article>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import ProductCard from '@/components/shared/ProductCard.vue'
import { useFavoriteStore } from '@/stores/favorite'

const favoriteStore = useFavoriteStore()
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    await favoriteStore.fetchItems()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8">
      <p class="eyebrow">Saved Items</p>
      <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">
        Favorites
      </h1>
    </div>

    <div v-if="loading" class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="index in 4"
        :key="index"
        class="skeleton-panel overflow-hidden p-4"
      >
        <div class="skeleton-block aspect-[4/5] w-full rounded-[1.1rem]"></div>
        <div class="mt-5 space-y-3">
          <div class="skeleton-block skeleton-line w-3/4"></div>
          <div class="skeleton-block skeleton-line w-1/2"></div>
          <div class="skeleton-block skeleton-line w-1/3"></div>
        </div>
      </article>
    </div>

    <div v-else-if="favoriteStore.items.length" class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <ProductCard
        v-for="entry in favoriteStore.items"
        :key="entry.id"
        :product="entry.product || entry"
      />
    </div>

    <div
      v-else
      class="rounded-[1.1rem] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center text-[var(--color-muted)]"
    >
      No saved items yet.
    </div>
  </section>
</template>

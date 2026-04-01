<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/shared/ProductCard.vue'
import { fallbackCategories } from '@/data/content'
import { fetchCategories, fetchProducts } from '@/lib/shop'

const route = useRoute()
const router = useRouter()
const categories = ref(fallbackCategories)
const loading = ref(true)
const result = ref({ list: [], pagination: { page: 1, size: 12, total: 0 } })

const filters = reactive({
  keyword: route.query.keyword || '',
  categorySlug: route.query.categorySlug || '',
  minPrice: route.query.minPrice || '',
  maxPrice: route.query.maxPrice || '',
  sort: route.query.sort || '',
})

const activeCategory = computed(() => categories.value.find((item) => item.slug === filters.categorySlug))

async function loadCategories() {
  categories.value = await fetchCategories()
}

async function loadProducts() {
  loading.value = true
  try {
    result.value = await fetchProducts({ ...filters, page: 1, size: 12 })
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  router.replace({
    name: 'shop',
    query: {
      keyword: filters.keyword || undefined,
      categorySlug: filters.categorySlug || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      sort: filters.sort || undefined,
    },
  })
}

watch(
  () => route.query,
  async () => {
    filters.keyword = route.query.keyword || ''
    filters.categorySlug = route.query.categorySlug || ''
    filters.minPrice = route.query.minPrice || ''
    filters.maxPrice = route.query.maxPrice || ''
    filters.sort = route.query.sort || ''
    await loadProducts()
  },
)

onMounted(async () => {
  await Promise.all([loadCategories(), loadProducts()])
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="eyebrow">Catalog</p>
        <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">{{ activeCategory?.name || 'Curated collection' }}</h1>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          {{ activeCategory?.description || 'Filter by category, search by keyword, and browse a concise storefront designed for quick product discovery.' }}
        </p>
      </div>
      <p class="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">{{ result.pagination.total }} products</p>
    </div>

    <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside class="h-fit rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.05)]">
        <p class="eyebrow mb-4">Search & Filter</p>
        <div class="space-y-5">
          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Keyword</span>
            <input v-model="filters.keyword" class="field-input" placeholder="Lip tint, perfume..." type="text" />
          </label>
          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Category</span>
            <select v-model="filters.categorySlug" class="field-input">
              <option value="">All</option>
              <option v-for="category in categories" :key="category.slug" :value="category.slug">{{ category.name }}</option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label>
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Min</span>
              <input v-model="filters.minPrice" class="field-input" min="0" placeholder="0" type="number" />
            </label>
            <label>
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Max</span>
              <input v-model="filters.maxPrice" class="field-input" min="0" placeholder="200" type="number" />
            </label>
          </div>
          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Sort</span>
            <select v-model="filters.sort" class="field-input">
              <option value="">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </label>
          <button class="primary-pill w-full justify-center" type="button" @click="applyFilters">Apply Filters</button>
        </div>
      </aside>

      <div>
        <div v-if="loading" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="index in 6" :key="index" class="aspect-[4/5] animate-pulse rounded-[1.1rem] bg-white/70"></div>
        </div>
        <div v-else-if="result.list.length" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ProductCard v-for="product in result.list" :key="product.id" :product="product" />
        </div>
        <div v-else class="rounded-[1.1rem] border border-dashed border-[var(--color-border)] bg-white/70 px-6 py-14 text-center text-[var(--color-muted)]">
          No products match the current filters.
        </div>
      </div>
    </div>
  </section>
</template>

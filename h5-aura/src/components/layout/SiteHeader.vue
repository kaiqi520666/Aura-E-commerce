<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, Search, ShoppingBag, User, Menu, X } from 'lucide-vue-next'
import { fallbackCategories } from '@/data/content'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const searchTerm = ref('')
const mobileOpen = ref(false)

const primaryLinks = computed(() => fallbackCategories)

function submitSearch() {
  router.push({ name: 'shop', query: { keyword: searchTerm.value } })
  mobileOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[color:rgba(248,246,244,0.94)] backdrop-blur-md">
    <div class="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] md:hidden"
        @click="mobileOpen = !mobileOpen"
      >
        <Menu v-if="!mobileOpen" class="h-4 w-4" />
        <X v-else class="h-4 w-4" />
      </button>

      <RouterLink to="/" class="font-[var(--font-body)] text-[1.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-wine)]">
        Aura
      </RouterLink>

      <nav class="hidden flex-1 items-center justify-center gap-8 md:flex">
        <RouterLink
          v-for="item in primaryLinks"
          :key="item.slug"
          :to="{ name: 'shop', query: { categorySlug: item.slug } }"
          class="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
        >
          {{ item.name }}
        </RouterLink>
      </nav>

      <form class="hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-2 lg:flex" @submit.prevent="submitSearch">
        <Search class="h-4 w-4 text-[var(--color-muted)]" />
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search lipstick, fragrance..."
          class="w-52 border-none bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
        />
      </form>

      <div class="ml-auto flex items-center gap-2">
        <RouterLink to="/favorites" class="icon-button hidden sm:inline-flex">
          <Heart class="h-4 w-4" />
        </RouterLink>
        <RouterLink :to="userStore.isLoggedIn ? '/account' : '/auth'" class="icon-button">
          <User class="h-4 w-4" />
        </RouterLink>
        <RouterLink to="/cart" class="icon-button relative">
          <ShoppingBag class="h-4 w-4" />
          <span
            v-if="cartStore.count"
            class="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-semibold text-white"
          >
            {{ cartStore.count }}
          </span>
        </RouterLink>
      </div>
    </div>

    <div v-if="mobileOpen" class="border-t border-[var(--color-border)] bg-white px-4 py-5 md:hidden">
      <form class="mb-4 flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-2" @submit.prevent="submitSearch">
        <Search class="h-4 w-4 text-[var(--color-muted)]" />
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search products"
          class="w-full border-none bg-transparent text-sm outline-none"
        />
      </form>
      <div class="grid gap-2">
        <RouterLink
          v-for="item in primaryLinks"
          :key="item.slug"
          :to="{ name: 'shop', query: { categorySlug: item.slug } }"
          class="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm uppercase tracking-[0.16em] text-[var(--color-ink)]"
          @click="mobileOpen = false"
        >
          {{ item.name }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>

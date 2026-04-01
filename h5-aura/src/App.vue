<script setup>
import { onMounted } from 'vue'
import GlobalConfirm from '@/components/global/GlobalConfirm.vue'
import GlobalLoading from '@/components/global/GlobalLoading.vue'
import GlobalToast from '@/components/global/GlobalToast.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'

const userStore = useUserStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()

onMounted(async () => {
  if (userStore.isLoggedIn) {
    try {
      await Promise.all([
        userStore.fetchProfile(),
        userStore.fetchAddresses(),
        cartStore.fetchCart(),
        favoriteStore.fetchIds(),
      ])
    } catch {
      await userStore.logout()
      cartStore.reset()
      favoriteStore.reset()
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
    <SiteHeader />
    <main class="min-h-[60vh]">
      <RouterView />
    </main>
    <SiteFooter />
    <GlobalLoading />
    <GlobalConfirm />
    <GlobalToast />
  </div>
</template>

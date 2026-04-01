import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getFavoriteIds, getFavorites, toggleFavorite } from '@/lib/shop'

export const useFavoriteStore = defineStore('favorite', () => {
  const ids = ref([])
  const items = ref([])

  async function fetchIds() {
    ids.value = await getFavoriteIds()
    return ids.value
  }

  async function fetchItems() {
    items.value = await getFavorites()
    return items.value
  }

  async function toggle(productId) {
    const result = await toggleFavorite(productId)
    await fetchIds()
    return result
  }

  function reset() {
    ids.value = []
    items.value = []
  }

  return {
    ids,
    items,
    fetchIds,
    fetchItems,
    toggle,
    reset,
  }
})

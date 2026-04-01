import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartQuantity,
} from '@/lib/shop'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const summary = ref({ quantity: 0, totalAmount: 0 })
  const loading = ref(false)

  const count = computed(() => summary.value.quantity || 0)
  const total = computed(() => summary.value.totalAmount || 0)

  async function fetchCart() {
    loading.value = true
    try {
      const result = await getCart()
      items.value = result.list || []
      summary.value = result.summary || { quantity: 0, totalAmount: 0 }
      return result
    } finally {
      loading.value = false
    }
  }

  async function addItem(productId, quantity = 1) {
    const result = await addToCart({ productId, quantity })
    items.value = result.list || []
    summary.value = result.summary || { quantity: 0, totalAmount: 0 }
    return result
  }

  async function updateItem(id, quantity) {
    const result = await updateCartQuantity({ id, quantity })
    items.value = result.list || []
    summary.value = result.summary || { quantity: 0, totalAmount: 0 }
    return result
  }

  async function removeItem(id) {
    const result = await removeCartItem(id)
    items.value = result.list || []
    summary.value = result.summary || { quantity: 0, totalAmount: 0 }
    return result
  }

  async function clear() {
    const result = await clearCart()
    items.value = result.list || []
    summary.value = result.summary || { quantity: 0, totalAmount: 0 }
    return result
  }

  function reset() {
    items.value = []
    summary.value = { quantity: 0, totalAmount: 0 }
  }

  return {
    items,
    summary,
    loading,
    count,
    total,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clear,
    reset,
  }
})

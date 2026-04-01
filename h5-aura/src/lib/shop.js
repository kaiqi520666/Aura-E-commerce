import { apiClient } from './api'
import { fallbackCategories, fallbackProducts, fallbackReviews } from '@/data/content'

function buildQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })
  const result = search.toString()
  return result ? `?${result}` : ''
}

export async function fetchHomeData() {
  try {
    return await apiClient.get('/app/mall/product/home')
  } catch {
    return {
      categories: fallbackCategories,
      bestSellers: fallbackProducts.filter((item) => item.bestSeller).slice(0, 4),
      featuredProducts: fallbackProducts.filter((item) => item.featured).slice(0, 8),
    }
  }
}

export async function fetchCategories() {
  try {
    return await apiClient.get('/app/mall/category/list')
  } catch {
    return fallbackCategories
  }
}

export async function fetchProducts(filters = {}) {
  try {
    return await apiClient.get(`/app/mall/product/page${buildQuery(filters)}`)
  } catch {
    const category = fallbackCategories.find((item) => item.slug === filters.categorySlug)
    const list = fallbackProducts.filter((item) => {
      const byCategory = !filters.categorySlug || item.categoryId === category?.id
      const keyword = String(filters.keyword || '').toLowerCase()
      const byKeyword = !keyword || `${item.name} ${item.subtitle}`.toLowerCase().includes(keyword)
      const byMin = !filters.minPrice || item.price >= Number(filters.minPrice)
      const byMax = !filters.maxPrice || item.price <= Number(filters.maxPrice)
      return byCategory && byKeyword && byMin && byMax
    })
    return {
      list,
      pagination: {
        page: Number(filters.page || 1),
        size: Number(filters.size || 12),
        total: list.length,
      },
    }
  }
}

export async function fetchProductDetail(id) {
  try {
    return await apiClient.get(`/app/mall/product/detail?id=${id}`)
  } catch {
    const product = fallbackProducts.find((item) => item.id === Number(id))
    if (!product) throw new Error('Product not found')
    return {
      ...product,
      category: fallbackCategories.find((item) => item.id === product.categoryId),
      relatedProducts: fallbackProducts
        .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
        .slice(0, 4),
    }
  }
}

export async function fetchReviews(productId) {
  try {
    return await apiClient.get(`/app/mall/review/list?productId=${productId}`)
  } catch {
    return fallbackReviews.filter((item) => item.productId === Number(productId))
  }
}

export async function login(payload) {
  return apiClient.post('/app/user/login/password', payload)
}

export async function register(payload) {
  return apiClient.post('/app/user/login/register', payload)
}

export async function refreshToken(refreshToken) {
  return apiClient.post('/app/user/login/refreshToken', { refreshToken })
}

export async function getProfile() {
  return apiClient.get('/app/user/info/person')
}

export async function updateProfile(payload) {
  return apiClient.post('/app/user/info/updatePerson', payload)
}

export async function updatePassword(payload) {
  return apiClient.post('/app/user/info/updatePassword', payload)
}

export async function logoff() {
  return apiClient.post('/app/user/info/logoff')
}

export async function getAddresses() {
  return apiClient.post('/app/user/address/list')
}

export async function getDefaultAddress() {
  return apiClient.get('/app/user/address/default')
}

export async function saveAddress(payload) {
  const endpoint = payload.id ? '/app/user/address/update' : '/app/user/address/add'
  return apiClient.post(endpoint, payload)
}

export async function deleteAddress(id) {
  return apiClient.post('/app/user/address/delete', { ids: [id] })
}

export async function getCart() {
  return apiClient.get('/app/mall/cart/list')
}

export async function addToCart(payload) {
  return apiClient.post('/app/mall/cart/add', payload)
}

export async function updateCartQuantity(payload) {
  return apiClient.post('/app/mall/cart/updateQuantity', payload)
}

export async function removeCartItem(id) {
  return apiClient.post('/app/mall/cart/remove', { id })
}

export async function clearCart() {
  return apiClient.post('/app/mall/cart/clear')
}

export async function getFavoriteIds() {
  return apiClient.get('/app/mall/favorite/ids')
}

export async function getFavorites() {
  return apiClient.get('/app/mall/favorite/list')
}

export async function toggleFavorite(productId) {
  return apiClient.post('/app/mall/favorite/toggle', { productId })
}

export async function createOrder(addressId) {
  return apiClient.post('/app/mall/checkout/submit', { addressId })
}

export async function createOrderPayment(orderId, provider) {
  return apiClient.post('/app/mall/checkout/pay', { orderId, provider })
}

export async function createPaypalOrder(orderId) {
  return apiClient.post('/app/mall/checkout/paypal/createOrder', { orderId })
}

export async function capturePaypalOrder(paymentNo, paypalOrderId) {
  return apiClient.post('/app/mall/checkout/paypal/captureOrder', {
    paymentNo,
    paypalOrderId,
  })
}

export async function getOrders(params = {}) {
  return apiClient.get(`/app/mall/order/page${buildQuery(params)}`)
}

export async function getOrderDetail(id) {
  return apiClient.get(`/app/mall/order/detail?id=${id}`)
}

export async function createProxyLink(orderId) {
  return apiClient.post('/app/mall/order/proxyLink', { orderId })
}

export async function createProxyPaypalOrder(token) {
  return apiClient.post('/open/mall/proxy/paypal/createOrder', { token })
}

export async function captureProxyPaypalOrder(token, paymentNo, paypalOrderId) {
  return apiClient.post('/open/mall/proxy/paypal/captureOrder', {
    token,
    paymentNo,
    paypalOrderId,
  })
}

export async function addReview(payload) {
  return apiClient.post('/app/mall/review/add', payload)
}

export async function getProxyDetail(token) {
  return apiClient.get(`/open/mall/proxy/detail?token=${token}`)
}

export async function createProxyPayment(token, provider) {
  return apiClient.post('/open/mall/proxy/pay', { token, provider })
}

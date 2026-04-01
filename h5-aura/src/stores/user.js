import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getProfile,
  getAddresses,
  login,
  register,
  saveAddress,
  deleteAddress,
  updatePassword,
  updateProfile,
} from '@/lib/shop'
import { getStoredToken, getStoredRefreshToken, setAuthTokens } from '@/lib/api'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref(getStoredToken() || '')
    const refreshToken = ref(getStoredRefreshToken() || '')
    const profile = ref(null)
    const addresses = ref([])
    const loading = ref(false)

    const isLoggedIn = computed(() => Boolean(token.value))
    const displayName = computed(() => profile.value?.nickName || profile.value?.email || 'Guest')

    function applyTokens(payload) {
      token.value = payload?.token || ''
      refreshToken.value = payload?.refreshToken || ''
      setAuthTokens(token.value, refreshToken.value)
    }

    async function signIn(payload) {
      loading.value = true
      try {
        const result = await login(payload)
        applyTokens(result)
        await Promise.all([fetchProfile(), fetchAddresses()])
        return result
      } finally {
        loading.value = false
      }
    }

    async function signUp(payload) {
      loading.value = true
      try {
        const result = await register(payload)
        applyTokens(result)
        await Promise.all([fetchProfile(), fetchAddresses()])
        return result
      } finally {
        loading.value = false
      }
    }

    async function fetchProfile() {
      if (!token.value) return null
      profile.value = await getProfile()
      return profile.value
    }

    async function fetchAddresses() {
      if (!token.value) {
        addresses.value = []
        return []
      }
      addresses.value = await getAddresses()
      return addresses.value
    }

    async function saveAddressAction(payload) {
      await saveAddress(payload)
      return fetchAddresses()
    }

    async function deleteAddressAction(id) {
      await deleteAddress(id)
      return fetchAddresses()
    }

    async function updateProfileAction(payload) {
      await updateProfile(payload)
      return fetchProfile()
    }

    async function updatePasswordAction(payload) {
      return updatePassword(payload)
    }

    async function logout() {
      token.value = ''
      refreshToken.value = ''
      profile.value = null
      addresses.value = []
      setAuthTokens('', '')
    }

    return {
      token,
      refreshToken,
      profile,
      addresses,
      loading,
      isLoggedIn,
      displayName,
      signIn,
      signUp,
      fetchProfile,
      fetchAddresses,
      saveAddress: saveAddressAction,
      deleteAddress: deleteAddressAction,
      updateProfile: updateProfileAction,
      updatePassword: updatePasswordAction,
      logout,
    }
  },
  {
    persist: true,
  },
)

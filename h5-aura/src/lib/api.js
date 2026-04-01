import axios from 'axios'

const tokenStorageKey = 'mall_token'
const refreshStorageKey = 'mall_refresh_token'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey)
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (payload && typeof payload === 'object') {
      if (payload.code !== undefined && payload.code !== 1000 && payload.code !== 0) {
        throw new Error(payload.message || 'Request failed')
      }
      return payload.data ?? payload
    }
    return payload
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  },
)

export function setAuthTokens(token, refreshToken) {
  if (token) {
    localStorage.setItem(tokenStorageKey, token)
  } else {
    localStorage.removeItem(tokenStorageKey)
  }

  if (refreshToken) {
    localStorage.setItem(refreshStorageKey, refreshToken)
  } else {
    localStorage.removeItem(refreshStorageKey)
  }
}

export function getStoredToken() {
  return localStorage.getItem(tokenStorageKey)
}

export function getStoredRefreshToken() {
  return localStorage.getItem(refreshStorageKey)
}

/**
 * @deprecated Use '@/shared/api/client' instead
 * This file is kept for backward compatibility during migration
 */
import api from '@/shared/api/client'
export default api

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // Skip refresh logic for refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    // Check if error is due to expired/invalid token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // List of public endpoints that should not trigger login redirect
      const publicEndpoints = [
        '/properties/',
        '/buildings/',
        '/organizations/',
        '/credit-products',
        '/financing-offers'
      ]
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      )
      
      // If it's a public endpoint and user is not authenticated, just reject the error
      // Don't redirect to login for public endpoints
      if (isPublicEndpoint && !authStore.isAuthenticated) {
        return Promise.reject(error)
      }
      
      // Check if it's a JWT expiration error
      const isJwtError = error.response?.data?.message?.includes('expired') || 
                        error.response?.data?.message?.includes('JWT') ||
                        error.response?.data?.error === 'Authentication Failed'
      
      if (isJwtError && authStore.refreshTokenMethod && authStore.refreshToken && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return api(originalRequest)
            })
            .catch(err => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const newAuthData = await authStore.refreshTokenMethod()
          processQueue(null, newAuthData.accessToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAuthData.accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          // Refresh failed, logout user
          await authStore.logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // Not a JWT error or no refresh token
        // Only redirect to login if user was authenticated (had a token)
        if (authStore.isAuthenticated) {
          await authStore.logout()
          window.location.href = '/login'
        }
        // If user is not authenticated and it's not a public endpoint, just reject
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api

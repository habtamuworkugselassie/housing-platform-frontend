/**
 * Shared API Client
 * 
 * Base axios instance with interceptors for authentication and error handling.
 * This is the foundation for all API communication.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
// Note: useAuthStore is imported dynamically in interceptors to avoid circular dependencies

// API base URL from env (set at build time, e.g. VITE_API_BASE_URL / BACKEND_URL in Docker). Fallback: relative /api/v1 (dev proxy or same-origin).
const getBaseURL = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl != null && typeof envUrl === 'string') {
    const trimmed = envUrl.trim()
    if (trimmed !== '') return trimmed
  }
  return '/api/v1'
}

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  
  failedQueue = []
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Import dynamically to avoid circular dependency issues
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config
    // Import dynamically to avoid circular dependency issues
    const { useAuthStore } = await import('@/features/auth')
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
        '/financing-offers',
        '/exhibition/'
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
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAuthData.accessToken}`
          }
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

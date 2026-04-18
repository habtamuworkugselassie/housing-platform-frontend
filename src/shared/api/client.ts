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
    if (trimmed !== '') {
      // If the app is loaded over HTTPS, never use an HTTP API base URL from build-time env.
      // Fallback to same-origin /api/v1 to avoid mixed-content/CORS issues with legacy IP URLs.
      if (
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        trimmed.startsWith('http://')
      ) {
        return '/api/v1'
      }
      return trimmed
    }
  }
  return '/api/v1'
}

/** Backend origin for media/upload URLs. Use VITE_BACKEND_ORIGIN to force a host:port (e.g. :8080); else derived from VITE_API_BASE_URL. */
function getBackendOrigin(): string {
  const origin = import.meta.env.VITE_BACKEND_ORIGIN
  if (origin != null && typeof origin === 'string') {
    const trimmed = origin.trim()
    if (trimmed !== '') return trimmed.replace(/\/$/, '')
  }
  const base = getBaseURL()
  if (base.startsWith('http://') || base.startsWith('https://')) {
    try {
      return new URL(base).origin
    } catch {
      return ''
    }
  }
  return ''
}

/** Resolve a relative API path (e.g. /api/v1/uploads/...) to a full URL using backend origin. Use for img/video src. */
export function mediaUrl(path: string | null | undefined): string {
  if (path == null || path === '') return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getBackendOrigin()
  if (!origin) return path
  return origin + (path.startsWith('/') ? path : '/' + path)
}

/**
 * User profile must not use property image URLs (legacy bad data). Prefer /api/v1/uploads/... from
 * GET /users/me or re-upload.
 */
export function sanitizeProfileImageUrl(url: string | null | undefined): string | undefined {
  if (url == null || url === '') return undefined
  if (url.includes('/api/v1/properties/')) return undefined
  return url
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

// Request interceptor to add auth token and fix multipart uploads
api.interceptors.request.use(
  (config) => {
    // For FormData, do not set Content-Type so the browser sets multipart/form-data with boundary.
    // Otherwise the default application/json would break file uploads.
    if (config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type')
      } else {
        delete config.headers['Content-Type']
      }
    }
    // Import dynamically to avoid circular dependency issues
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`)
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Perform logout using raw axios (not the intercepted `api` instance).
 *
 * IMPORTANT: Never use `api.post('/auth/logout')` inside this interceptor.
 * Doing so would re-enter this same response interceptor on a 401, causing
 * an infinite loop. Instead we use a plain axios call and clear state directly.
 */
const performLogout = async (): Promise<void> => {
  const accessToken = localStorage.getItem('accessToken')
  try {
    // Plain axios — NOT the `api` singleton — to avoid interceptor re-entry.
    await axios.post(
      `${getBaseURL()}/auth/logout`,
      {},
      {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      }
    )
  } catch {
    // Swallow backend errors: the endpoint is UNSECURED so it should always
    // succeed, but even if it doesn't we must still clear client-side state.
  }

  // Clear all persisted auth state
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  // Sync Pinia store if it is already instantiated (won't fail if it isn't)
  try {
    const { getActivePinia } = await import('pinia')
    const { useAuthStore } = await import('@/features/auth')
    if (getActivePinia()) {
      const authStore = useAuthStore()
      authStore.$patch({ token: null, refreshToken: null, user: null } as any)
    }
  } catch {
    // Pinia may not be ready during early boot — localStorage is already cleared.
  }
}

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config

    // Skip ALL auth endpoints (login, refresh, logout, otp, etc.)
    // This prevents the interceptor from looping on auth-related 401s.
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error)
    }

    // Check if error is due to expired/invalid token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Public endpoints that should NOT trigger a login redirect.
      // Note: /sponsorships/active is a PROTECTED endpoint — omitted intentionally.
      const publicEndpoints = [
        '/properties/',
        '/buildings/',
        '/organizations/',
        '/credit-products',
        '/financing-offers',
        '/exhibition/',
        '/public/support/'
      ]

      const isPublicEndpoint = publicEndpoints.some(endpoint =>
        originalRequest.url?.includes(endpoint)
      )

      // For public endpoints with no active session, just let the error through
      if (isPublicEndpoint && !localStorage.getItem('accessToken')) {
        return Promise.reject(error)
      }

      // Detect JWT-related 401s (expired or invalid token)
      const isJwtError = error.response?.data?.message?.includes('expired') ||
        error.response?.data?.message?.includes('JWT') ||
        error.response?.data?.error === 'Authentication Failed'

      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (isJwtError && storedRefreshToken && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue concurrent requests that arrive while a refresh is in-flight
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
          const { useAuthStore } = await import('@/features/auth')
          const authStore = useAuthStore()
          const newAuthData = await authStore.refreshTokenMethod()
          processQueue(null, newAuthData.accessToken)

          // Retry the original request with the fresh token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAuthData.accessToken}`
          }
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          // Token refresh failed — force full logout and redirect
          await performLogout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // Not a JWT error, or no refresh token is stored.
        // Only force logout+redirect when the user had an active session.
        if (localStorage.getItem('accessToken')) {
          await performLogout()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api

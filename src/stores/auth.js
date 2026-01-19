/**
 * @deprecated Use '@/features/auth' instead
 * This file is kept for backward compatibility during migration
 */
export { useAuthStore } from '@/features/auth/composables/useAuth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('accessToken'))
  const refreshTokenValue = ref(localStorage.getItem('refreshToken'))

  const isAuthenticated = computed(() => !!token.value)
  
  const hasRole = (role) => {
    return user.value?.roles?.includes(role) || false
  }

  const hasScope = (scope) => {
    return user.value?.scopes?.includes(scope) || false
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      setAuth(response.data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      setAuth(response.data)
      return response.data
    } catch (error) {
      // Preserve the full error response structure for proper error handling
      const errorData = error.response?.data || { message: error.message || 'Registration failed' }
      const enhancedError = {
        ...errorData,
        response: error.response,
        message: errorData.message || error.message || 'Registration failed'
      }
      throw enhancedError
    }
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint if user is authenticated
      if (token.value) {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          // Even if backend call fails, continue with client-side logout
          console.warn('Logout API call failed, continuing with client-side logout:', error)
        }
      }
    } catch (error) {
      // Ignore errors and continue with client-side logout
      console.warn('Error during logout:', error)
    } finally {
      // Always clear client-side state
      user.value = null
      token.value = null
      refreshTokenValue.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  const refreshToken = async () => {
    if (!refreshTokenValue.value) {
      throw new Error('No refresh token available')
    }
    
    try {
      // Use axios directly to avoid interceptor issues
      const axios = (await import('axios')).default
      const response = await axios.post('/api/v1/auth/refresh', null, {
        headers: {
          Authorization: `Bearer ${refreshTokenValue.value}`,
          'Content-Type': 'application/json'
        }
      })
      setAuth(response.data)
      return response.data
    } catch (error) {
      // If refresh fails, logout user
      await logout()
      throw error.response?.data || error
    }
  }

  const setAuth = (authData) => {
    token.value = authData.accessToken
    refreshTokenValue.value = authData.refreshToken
    user.value = {
      id: authData.userId,
      email: authData.email,
      firstName: authData.firstName,
      lastName: authData.lastName,
      roles: authData.roles || [],
      scopes: authData.scopes || []
    }
    localStorage.setItem('accessToken', authData.accessToken)
    localStorage.setItem('refreshToken', authData.refreshToken)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  // Load user from storage on initialization
  loadUserFromStorage()

  return {
    user,
    token,
    refreshToken: refreshTokenValue,
    isAuthenticated,
    hasRole,
    hasScope,
    login,
    register,
    logout,
    refreshTokenMethod: refreshToken,
    setAuth
  }
})

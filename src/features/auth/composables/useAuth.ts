/**
 * Auth Composable
 * 
 * Business logic for authentication.
 * Separated from the store to allow reuse and testing.
 */
import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../api/auth.api'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../api/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const user: Ref<User | null> = ref(null)
  const token: Ref<string | null> = ref(localStorage.getItem('accessToken'))
  const refreshTokenValue: Ref<string | null> = ref(localStorage.getItem('refreshToken'))

  const isAuthenticated = computed(() => !!token.value)
  
  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) || false
  }

  const hasScope = (scope: string): boolean => {
    return user.value?.scopes?.includes(scope) || false
  }

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const authData = await authApi.login(credentials)
      setAuth(authData)
      return authData
    } catch (error: any) {
      throw error.response?.data || error
    }
  }

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const authData = await authApi.register(userData)
      setAuth(authData)
      return authData
    } catch (error: any) {
      const errorData = error.response?.data || { message: error.message || 'Registration failed' }
      const enhancedError = {
        ...errorData,
        response: error.response,
        message: errorData.message || error.message || 'Registration failed'
      }
      throw enhancedError
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout()
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error)
    } finally {
      token.value = null
      refreshTokenValue.value = null
      user.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  const refreshToken = async (): Promise<RefreshTokenResponse> => {
    if (!refreshTokenValue.value) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authApi.refreshToken(refreshTokenValue.value)
      token.value = response.accessToken
      refreshTokenValue.value = response.refreshToken
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      return response
    } catch (error: any) {
      // Refresh failed, clear auth state
      await logout()
      throw error.response?.data || error
    }
  }

  const setAuth = (authData: AuthResponse): void => {
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

  const loadUserFromStorage = (): void => {
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

/**
 * Auth Composable
 * 
 * Business logic for authentication.
 * Separated from the store to allow reuse and testing.
 */
import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { sanitizeProfileImageUrl } from '@/shared/api/client'
import { authApi } from '../api/auth.api'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
  User
} from '../api/auth.types'

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

  const hydrateUser = async (): Promise<void> => {
    if (!token.value) return
    try {
      const me = await authApi.getCurrentUser()
      const roles = Array.isArray(me.roles)
        ? (me.roles as unknown as string[])
        : user.value?.roles ?? []
      user.value = {
        id: String(me.id),
        email: me.email,
        firstName: me.firstName,
        lastName: me.lastName,
        phoneNumber: me.phoneNumber ?? user.value?.phoneNumber,
        profileImageUrl: sanitizeProfileImageUrl(me.profileImageUrl ?? undefined),
        roles,
        scopes: user.value?.scopes ?? []
      }
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch {
      // Network or 401 — keep minimal user from setAuth / storage
    }
  }

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const authData = await authApi.login(credentials)
      setAuth(authData)
      await hydrateUser()
      return authData
    } catch (error: any) {
      throw error.response?.data || error
    }
  }

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const authData = await authApi.register(userData)
      setAuth(authData)
      await hydrateUser()
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
      const parsed = JSON.parse(storedUser) as User
      user.value = {
        ...parsed,
        profileImageUrl: sanitizeProfileImageUrl(parsed.profileImageUrl)
      }
    }
  }

  // Load user from storage on initialization, then refresh profile from API (correct profileImageUrl)
  loadUserFromStorage()
  if (token.value) {
    void hydrateUser()
  }

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
    setAuth,
    hydrateUser
  }
})

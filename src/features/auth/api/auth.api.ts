/**
 * Auth API Service
 * 
 * API client for authentication endpoints.
 * This is the contract between the frontend and backend auth API.
 */
import api from '@/shared/api/client'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse
} from './auth.types'

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData)
    return response.data
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken
    })
    return response.data
  },

  /**
   * Logout user (if backend supports it)
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  }
}

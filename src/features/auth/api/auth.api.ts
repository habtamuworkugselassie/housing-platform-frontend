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
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
  QuickRegisterRequest,
  GoogleLoginRequest
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
   * Minimal buyer registration (full name + phone; email/password optional). Signs the user in.
   */
  quickRegister: async (data: QuickRegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/quick-register', data)
    return response.data
  },

  /**
   * Sign in (or register as BUYER) with a Google ID token from Google Identity Services.
   */
  loginWithGoogle: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google', data)
    return response.data
  },

  /**
   * Send a WhatsApp sign-in code to a registered phone number.
   */
  requestOtpLogin: async (phoneNumber: string): Promise<void> => {
    await api.post('/auth/login/otp/send', { phoneNumber })
  },

  /**
   * Exchange a WhatsApp sign-in code for tokens.
   */
  confirmOtpLogin: async (phoneNumber: string, code: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/otp/confirm', { phoneNumber, code })
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
   * Current user (includes profileImageUrl from server — avoids stale localStorage URLs).
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },

  /**
   * Logout user (if backend supports it)
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  /**
   * Request password reset email (link sent to email if account exists)
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post('/auth/forgot-password', data)
  },

  /**
   * Reset password using token from email link
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/auth/reset-password', data)
  },

  /**
   * Upload profile image
   */
  uploadProfileImage: async (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<User>('/users/me/profile-image', formData)
    return response.data
  }
}

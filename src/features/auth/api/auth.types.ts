/**
 * Auth API Types
 * 
 * Type definitions for authentication API contracts.
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  role: 'BUYER' | 'REALTOR' | 'BANKER' | 'SUPPLIER'
  /** Approved organization on the marketplace, when joining an existing org */
  organizationId?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  userId: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  scopes: string[]
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  /** From GET /users/me or profile-image upload; use /api/v1/uploads/... for new uploads */
  profileImageUrl?: string | null
  roles: string[]
  scopes: string[]
}

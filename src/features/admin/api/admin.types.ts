/**
 * Admin API Types
 * 
 * Type definitions for admin management API contracts.
 */

// Types for admin management

export interface AdminStats {
  totalUsers: number
  totalOrganizations: number
  totalProperties: number
  totalBuildings: number
  totalProjects: number
  totalLoanApplications: number
  pendingApprovals: number
  activeSponsorships: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'USER_REGISTERED' | 'ORGANIZATION_CREATED' | 'PROPERTY_CREATED' | 'LOAN_APPLIED' | 'ORGANIZATION_APPROVED'
  description: string
  timestamp: string
  userId?: string
  userName?: string
}

export interface UserManagementRequest {
  email?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  roles?: string[]
  enabled?: boolean
  status?: string
  organizationId?: string
  /** When true, backend clears organization link (use with empty org selection on edit). */
  clearOrganization?: boolean
}

/** Create user (admin only). Allows any role including ADMIN. */
export interface UserCreateRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  roles: string[]
  organizationId?: string
}

export interface OrganizationManagementRequest {
  name?: string
  email?: string
  phoneNumber?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

/** Single phone with country code (for organization multiple phones) */
export interface OrganizationPhoneDto {
  countryCode: string
  number: string
}

/** Organization types: real estate and construction related */
export type OrganizationType =
  | 'REAL_ESTATE_COMPANY'
  | 'BANK'
  | 'SUPPLIER'
  | 'CONTRACTOR'
  | 'DEVELOPER'
  | 'INSURANCE'
  | 'CONSULTANT_ARCHITECT'
  | 'FINISHING_CONTRACTOR'

/** Full organization create/update payload for admin */
export interface OrganizationCreateRequest {
  name: string
  registrationNumber?: string
  type: OrganizationType
  address?: string
  city?: string
  country?: string
  latitude?: number | null
  longitude?: number | null
  /** Multiple phones with country code. Preferred over phoneNumber. */
  phoneNumbers?: OrganizationPhoneDto[]
  /** @deprecated Use phoneNumbers */
  phoneNumber?: string
  email?: string
  website?: string
  facebookUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
  description?: string
  primaryContactUserId?: string
  /** When creating as admin: APPROVED, PENDING_APPROVAL, etc. */
  initialStatus?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  /** When type is SUPPLIER: material marketplace subcategories (cement, steel, …). */
  supplierSubcategoryIds?: string[]
}

/** Admin workflow for a single uploaded verification document */
export type OrganizationDocumentReviewStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_REVISION'

/** PATCH /organizations/:id/document-reviews — only send fields to update */
export interface OrganizationDocumentReviewsPatchRequest {
  businessRegistrationReviewStatus?: OrganizationDocumentReviewStatus | null
  businessRegistrationReviewComment?: string | null
  licenseReviewStatus?: OrganizationDocumentReviewStatus | null
  licenseReviewComment?: string | null
  vatRegistrationReviewStatus?: OrganizationDocumentReviewStatus | null
  vatRegistrationReviewComment?: string | null
  tinRegistrationReviewStatus?: OrganizationDocumentReviewStatus | null
  tinRegistrationReviewComment?: string | null
}

/** Same fields for update (all optional except what is being changed) */
export interface OrganizationUpdateRequest {
  name?: string
  registrationNumber?: string
  type?: OrganizationType
  address?: string
  city?: string
  country?: string
  latitude?: number | null
  longitude?: number | null
  phoneNumbers?: OrganizationPhoneDto[]
  phoneNumber?: string
  email?: string
  website?: string
  facebookUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
  description?: string
  primaryContactUserId?: string
  /** When type is SUPPLIER: replaces linked subcategories when provided. */
  supplierSubcategoryIds?: string[]
}

/** Construction material supplier marketplace subcategory */
export interface SupplierSubcategory {
  id: string
  name: string
  slug: string
  sortOrder: number
  active: boolean
}

export interface SupplierSubcategoryRequest {
  name: string
  slug?: string
  sortOrder?: number
  active?: boolean
}

export interface PropertyManagementRequest {
  title?: string
  description?: string
  type?: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CONDOMINIUM' | 'TOWNHOUSE' | 'LAND' | 'COMMERCIAL'
  status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'WITHDRAWN'
  priceETB?: number | null
  priceUSD?: number | null
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  latitude?: number | null
  longitude?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  floorNumber?: number | null
  totalFloors?: number | null
  constructionStatus?: 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION' | 'PLANNED' | 'COMPLETED'
  category?: 'FOR_SALE' | 'FOR_RENTAL'
  constructionPercentage?: number | null
  isFullyFurnished?: boolean
  featured?: boolean
  realEstateCompanyId?: string
  agentId?: string
}

export interface AdminFilters {
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

/** GET /admin/exhibition-interests (Spring Page content item) */
export interface AdminExhibitionInterest {
  id: string
  createdAt: string
  email: string
  phoneNumber?: string | null
  interestType: string
  company?: string | null
  message?: string | null
  organizationId?: string | null
  organizationName?: string | null
  organizationType?: string | null
  organizationStatus?: string | null
  sponsorshipId?: string | null
  sponsorshipPackageName?: string | null
  /** ISO timestamp when admin verified registrant contact (exhibition lead workflow). */
  contactVerifiedAt?: string | null
  /** Set when the org has a primary contact user (often after verify-contact). */
  primaryContactUserId?: string | null
}

/** Create primary org user (admin sets first password); same body for exhibition verify-contact and sponsorship verify-user. */
export interface ProvisionOrganizationPrimaryUserPayload {
  password: string
  firstName: string
  lastName: string
}

/** @deprecated use ProvisionOrganizationPrimaryUserPayload */
export type VerifyExhibitionContactPayload = ProvisionOrganizationPrimaryUserPayload

/** Public landing timings (ms); admin GET/PUT /admin/display-settings */
export interface DisplaySettings {
  sponsorCarouselAutoplayMs: number
  sidebarMediaRotationMs: number
  sidebarLayoutRotationMs: number
  exhibitionSponsorshipPackagesVisible: boolean
  exhibitionSponsorshipPackagePricesVisible: boolean
}

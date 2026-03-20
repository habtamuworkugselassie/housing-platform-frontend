import type { OrganizationPhoneDto } from '@/features/admin/api/admin.types'

/**
 * Logical grouping of organization contact/reachability data.
 * The API still returns these fields flat on the organization object; use
 * {@link viewOrganizationContact} when you want a single object for forms or display.
 */
export interface OrganizationContact {
  email?: string
  website?: string
  phoneNumbers?: OrganizationPhoneDto[]
  facebookUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
}

/** Build a contact view from a flat organization payload (API response or form state). */
export function viewOrganizationContact(org: {
  email?: string
  website?: string
  phoneNumbers?: OrganizationPhoneDto[]
  phoneNumber?: string
  facebookUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
} | null | undefined): OrganizationContact {
  if (!org) return {}
  return {
    email: org.email,
    website: org.website,
    phoneNumbers: org.phoneNumbers,
    facebookUrl: org.facebookUrl,
    instagramUrl: org.instagramUrl,
    linkedinUrl: org.linkedinUrl,
    twitterUrl: org.twitterUrl,
    youtubeUrl: org.youtubeUrl
  }
}

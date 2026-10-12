/** Presentation helpers for the admin organizations list. */

export type OrgStatus = 'PENDING_APPROVAL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'SPONSORSHIP_PENDING'

export interface OrgLike {
  name?: string | null
  status?: string | null
  city?: string | null
  country?: string | null
  address?: string | null
  businessRegistration?: string | null
  license?: string | null
  vatRegistration?: string | null
  tinRegistration?: string | null
  businessRegistrationReviewStatus?: string | null
  licenseReviewStatus?: string | null
  vatRegistrationReviewStatus?: string | null
  tinRegistrationReviewStatus?: string | null
  createdAt?: string | null
}

/** Status filter tabs, in workflow order. PENDING covers PENDING_APPROVAL. */
export const STATUS_TABS = ['', 'PENDING', 'SPONSORSHIP_PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'] as const
export type StatusTab = (typeof STATUS_TABS)[number]

export function isPending(status?: string | null): boolean {
  return status === 'PENDING' || status === 'PENDING_APPROVAL'
}

export function matchesStatus(org: OrgLike, tab: string): boolean {
  if (!tab) return true
  return tab === 'PENDING' ? isPending(org.status) : org.status === tab
}

/** i18n key and theme-safe badge classes for a status. */
export function statusMeta(status?: string | null): { key: string; badge: string } {
  if (isPending(status)) return { key: 'admin.orgList.status.PENDING', badge: 'bg-admin-warn/15 text-admin-warn ring-admin-warn/30' }
  switch (status) {
    case 'APPROVED':
      return { key: 'admin.orgList.status.APPROVED', badge: 'bg-admin-ok/15 text-admin-ok ring-admin-ok/30' }
    case 'SPONSORSHIP_PENDING':
      return { key: 'admin.orgList.status.SPONSORSHIP_PENDING', badge: 'bg-admin-info/15 text-admin-info ring-admin-info/30' }
    case 'SUSPENDED':
      return { key: 'admin.orgList.status.SUSPENDED', badge: 'bg-admin-faint/15 text-admin-muted ring-admin-faint/30' }
    case 'REJECTED':
      return { key: 'admin.orgList.status.REJECTED', badge: 'bg-admin-danger/15 text-admin-danger ring-admin-danger/30' }
    default:
      return { key: 'admin.orgList.status.UNKNOWN', badge: 'bg-admin-faint/15 text-admin-muted ring-admin-faint/30' }
  }
}

/** "Addis Ababa, Ethiopia", or whichever parts exist; never a lone comma. */
export function locationOf(org: OrgLike): string {
  return [org.city, org.country].map((p) => (p ?? '').trim()).filter(Boolean).join(', ')
}

/** Organizations created from an exhibition interest form are named "Exhibition: <email>". */
const EXHIBITION_PREFIX = /^\s*exhibition:\s*/i
export function displayName(org: OrgLike): { name: string; fromExhibition: boolean } {
  const raw = (org.name ?? '').trim()
  if (EXHIBITION_PREFIX.test(raw)) return { name: raw.replace(EXHIBITION_PREFIX, ''), fromExhibition: true }
  return { name: raw, fromExhibition: false }
}

export function initials(name: string): string {
  const words = name.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean)
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '?'
}

const DOCS = [
  ['businessRegistration', 'businessRegistrationReviewStatus'],
  ['license', 'licenseReviewStatus'],
  ['vatRegistration', 'vatRegistrationReviewStatus'],
  ['tinRegistration', 'tinRegistrationReviewStatus']
] as const

/** Uploaded verification documents and how far their review has got. */
export function documentSummary(org: OrgLike): { uploaded: number; approved: number; toReview: number; needsFix: number } {
  let uploaded = 0
  let approved = 0
  let toReview = 0
  let needsFix = 0
  for (const [file, review] of DOCS) {
    if (!String(org[file] ?? '').trim()) continue
    uploaded++
    const s = org[review]
    if (s === 'APPROVED') approved++
    else if (s === 'REJECTED' || s === 'NEEDS_REVISION') needsFix++
    else toReview++
  }
  return { uploaded, approved, toReview, needsFix }
}

export type SortKey = 'newest' | 'oldest' | 'name'

export function sortOrganizations<T extends OrgLike>(list: T[], key: SortKey): T[] {
  const time = (o: OrgLike) => (o.createdAt ? new Date(o.createdAt).getTime() : 0)
  const copy = [...list]
  if (key === 'name') return copy.sort((a, b) => displayName(a).name.localeCompare(displayName(b).name))
  if (key === 'oldest') return copy.sort((a, b) => time(a) - time(b))
  return copy.sort((a, b) => time(b) - time(a))
}

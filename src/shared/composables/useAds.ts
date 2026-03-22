/**
 * Ads Composable
 *
 * Business logic for managing sponsored ads from sponsorships.
 * State is shared (singleton) so sponsor carousel and layout use the same data;
 * whenReady() lets the feature section wait until sponsor content has loaded first.
 */
import { ref, computed } from 'vue'
import { propertyApi } from '../../features/property/api/property.api'
import type { PropertyResponse } from '../../features/property/api/property.types'
import api from '../api/client'
import { normalizeSponsorshipType } from '../utils/sponsorshipTier'

// Shared state so PublicLayout, SponsorCarouselSection and ExhibitionLandingView see the same ads
const loading = ref(false)
const error = ref<unknown>(null)
const allAds = ref<AdContent[]>([])
const sponsorships = ref<SponsorshipResponse[]>([])
const sponsorshipTypeMap = ref<Map<string, number>>(new Map())
let loadResolve: () => void
const loadPromise = new Promise<void>((resolve) => { loadResolve = resolve })
let loadStarted = false

export interface BuildingResponse {
  id: string
  name: string
  description?: string
  address: string
  city: string
  country: string
  buildingType: string
  category: string
  status: string
  images?: Array<{ imageUrl: string }>
  isSponsored?: boolean
  sponsorshipType?: string
  realEstateCompanyId?: string
  realEstateCompanyName?: string
  realEstateCompanyVerified?: boolean
  realEstateCompanyVerificationLevel?: string
}

export interface SponsorshipResponse {
  id: string
  name: string
  description?: string
  type: string
  basePrice: number
  features?: string
  status: string
}

export interface AdMediaItem {
  url: string
  mediaKind: string
}

export interface AdContent {
  id: string
  title: string
  logoUrl?: string
  imageUrl?: string
  videoUrl?: string
  mediaItems?: AdMediaItem[]
  priceETB?: number
  priceUSD?: number
  city?: string
  address?: string
  type: 'property' | 'building' | 'organization'
  sponsorshipType: string
  basePrice: number
  /** Organization.OrganizationType name when type is organization (e.g. REAL_ESTATE_COMPANY). */
  organizationType?: string
  realEstateCompanyName?: string
  realEstateCompanyId?: string
  realEstateCompanyVerified?: boolean
  realEstateCompanyVerificationLevel?: string
  companyEmail?: string
  companyPhone?: string
}

export interface SponsoredOrganizationResponse {
  id: string
  name: string
  logoUrl?: string
  videoUrl?: string
  address?: string
  city?: string
  country?: string
  sponsorshipType: string
  basePrice: number
  organizationType?: string
}

interface FirstPropertyMediaResponse {
  imageUrl?: string | null
  videoUrl?: string | null
}

interface OrganizationDetailForAds {
  /** Organization.OrganizationType enum name from public org API, e.g. BANK */
  type?: string
  logoUrl?: string
  verificationLevel?: string
  verified?: boolean
  media?: Array<{
    url?: string
    mediaKind?: string
  }>
}

function organizationTypeFromOrgPayload(org: OrganizationDetailForAds | null | undefined): string {
  if (!org) return ''
  const t = org.type as unknown
  if (t == null || t === '') return ''
  if (typeof t === 'string') return normalizeType(t)
  if (typeof t === 'object' && t !== null && 'name' in t) {
    return normalizeType(String((t as { name?: string }).name))
  }
  return normalizeType(String(t))
}

const normalizeType = (type: string | undefined | null): string =>
  normalizeSponsorshipType(type)

const isExclusiveTier = (type: string | undefined | null): boolean =>
  normalizeType(type) === 'EXCLUSIVE'

const isPremiumTier = (type: string | undefined | null): boolean => {
  const t = normalizeType(type)
  return t === 'PLATINUM' || t === 'PREMIUM'
}

const isGoldTier = (type: string | undefined | null): boolean =>
  normalizeType(type) === 'GOLD'

const sponsorshipTierRank = (type: string | undefined | null): number => {
  const t = normalizeType(type)
  if (t === 'EXCLUSIVE') return -1
  if (t === 'PLATINUM' || t === 'PREMIUM') return 0
  if (t === 'GOLD') return 1
  if (t === 'SILVER') return 2
  if (t === 'SPECIAL') return 3
  return 4
}

const isVideoUrl = (url: string | undefined | null): boolean =>
  /\.(mp4|mov|avi|webm|mkv)(\?|$)/i.test(String(url || ''))

const normalizeMediaKind = (mediaKind: string | undefined | null, url: string): string => {
  const kind = normalizeType(mediaKind)
  if (kind) return kind
  return isVideoUrl(url) ? 'VIDEO' : 'IMAGE'
}

const appendUniqueMedia = (items: AdMediaItem[], url: string | undefined | null, mediaKind?: string | null) => {
  const normalizedUrl = String(url || '').trim()
  if (!normalizedUrl) return
  if (items.some(item => item.url === normalizedUrl)) return
  items.push({
    url: normalizedUrl,
    mediaKind: normalizeMediaKind(mediaKind, normalizedUrl)
  })
}

const dedupeOrganizationAds = (ads: AdContent[]): AdContent[] => {
  const map = new Map<string, AdContent>()
  ads
    .filter(ad => ad.type === 'organization')
    .forEach((ad) => {
      const key = ad.realEstateCompanyId || ad.id
      const existing = map.get(key)
      if (!existing) {
        map.set(key, ad)
        return
      }
      const existingMediaCount = existing.mediaItems?.length || 0
      const currentMediaCount = ad.mediaItems?.length || 0
      const shouldReplace =
        currentMediaCount > existingMediaCount ||
        (!!ad.videoUrl && !existing.videoUrl)
      if (shouldReplace) {
        map.set(key, ad)
      }
    })
  return [...map.values()]
}

export function useAds() {
  const enrichOrganizationAdsMedia = async (orgAds: AdContent[]): Promise<void> => {
    if (!orgAds.length) return

    try {
      const details = await Promise.all(
        orgAds.map((ad) =>
          api
            .get<OrganizationDetailForAds>(`/organizations/${ad.id}`)
            .then((r: any) => r.data)
            .catch(() => null)
        )
      )

      orgAds.forEach((ad, index) => {
        const org = details[index]
        const mediaItems: AdMediaItem[] = []
        const orgMedia = Array.isArray(org?.media) ? org.media : []
        const nonLogoMedia = orgMedia.filter((item: any) => normalizeType(item?.mediaKind) !== 'LOGO')
        ad.logoUrl = ad.logoUrl || org?.logoUrl || undefined
        const resolvedOrgType = organizationTypeFromOrgPayload(org)
        if (resolvedOrgType) {
          ad.organizationType = resolvedOrgType
        }
        ad.realEstateCompanyVerificationLevel = org?.verificationLevel ?? ad.realEstateCompanyVerificationLevel
        ad.realEstateCompanyVerified = org?.verified ?? ad.realEstateCompanyVerified

        nonLogoMedia.forEach((item: any) => {
          appendUniqueMedia(mediaItems, item?.url, item?.mediaKind)
        })
        appendUniqueMedia(mediaItems, ad.videoUrl, 'VIDEO')

        // Keep media items for shuffling; display URLs are assigned after fallback resolution.
        ad.mediaItems = mediaItems
      })

      // If org has no usable media (non-logo image/video), fallback to first property media.
      const missingMediaAds = orgAds.filter(ad => !ad.mediaItems || ad.mediaItems.length === 0)
      if (missingMediaAds.length > 0) {
        const fallbackResults = await Promise.all(
          missingMediaAds.map((ad) =>
            api
              .get<FirstPropertyMediaResponse>(`/properties/organization/${ad.id}/first-media`)
              .then((r: any) => r.data)
              .catch(() => null)
          )
        )

        missingMediaAds.forEach((ad, i) => {
          const fallback = fallbackResults[i]
          if (!fallback) return
          const current = Array.isArray(ad.mediaItems) ? ad.mediaItems : []
          appendUniqueMedia(current, fallback.videoUrl, 'VIDEO')
          appendUniqueMedia(current, fallback.imageUrl, 'IMAGE')
          ad.mediaItems = current
        })
      }

      // Pick display media from prepared media list (keep logo / prior imageUrl as fallback for banner).
      orgAds.forEach((ad) => {
        const current = Array.isArray(ad.mediaItems) ? ad.mediaItems : []
        const firstVideo = current.find(item => item.mediaKind === 'VIDEO')
        const firstImage = current.find(item => item.mediaKind !== 'VIDEO')
        ad.videoUrl = firstVideo?.url
        const img =
          firstImage?.url ||
          ad.imageUrl ||
          (ad.logoUrl ? String(ad.logoUrl).trim() : '') ||
          undefined
        ad.imageUrl = img
      })
    } catch (err) {
      console.error('Failed to enrich sponsored organization media:', err)
    } finally {
      allAds.value = [...allAds.value]
    }
  }

  /**
   * Load sponsorships from backend to get dynamic types and base prices
   */
  const loadSponsorships = async (): Promise<void> => {
    try {
      const response = await api.get('/sponsorships/active')
      const activeSponsorships = Array.isArray(response.data) ? response.data : []

      // Sort by basePrice descending
      activeSponsorships.sort((a: any, b: any) => (b.basePrice || 0) - (a.basePrice || 0))

      sponsorships.value = activeSponsorships

      // Create a map of sponsorship type to base price
      const typeMap = new Map<string, number>()
      activeSponsorships.forEach((sponsorship: any) => {
        typeMap.set(normalizeType(sponsorship.type), sponsorship.basePrice || 0)
      })
      sponsorshipTypeMap.value = typeMap
    } catch (err) {
      console.error('Failed to load sponsorships:', err)
      sponsorships.value = []
      sponsorshipTypeMap.value = new Map()
    }
  }

  /**
   * Fetch all sponsored content. Two-phase for fast carousel:
   * Phase 1: sponsorships + sponsored-organizations → set allAds (carousel can render) → resolve whenReady().
   * Phase 2 (background): enrich organization media, then properties + buildings; merge into allAds.
   */
  const loadAllAds = async (limit: number = 20): Promise<void> => {
    if (loadStarted) return
    loadStarted = true
    loading.value = true
    error.value = null

    try {
      // Phase 1: Sponsored organizations only – carousel/side-panels can render immediately
      let orgAds: AdContent[] = []
      try {
        const [_, orgResponse] = await Promise.all([
          loadSponsorships(),
          api.get<SponsoredOrganizationResponse[]>('/sponsorships/sponsored-organizations')
        ])
        const orgs = Array.isArray(orgResponse.data) ? orgResponse.data : []
        orgAds = orgs.map((org: any) => {
          const mediaItems: AdMediaItem[] = []
          appendUniqueMedia(mediaItems, org.videoUrl, 'VIDEO')
          appendUniqueMedia(mediaItems, org.splashImageUrl, 'IMAGE')
          const splash = String(org.splashImageUrl || '').trim()
          return {
            id: org.id,
            title: org.name,
            logoUrl: org.logoUrl,
            imageUrl: splash || undefined,
            videoUrl: org.videoUrl ?? undefined,
            mediaItems,
            city: org.city,
            address: org.address,
            type: 'organization' as const,
            sponsorshipType: normalizeType(org.sponsorshipType),
            basePrice: typeof org.basePrice === 'number' ? org.basePrice : Number(org.basePrice) || 0,
            organizationType: org.organizationType
              ? normalizeType(org.organizationType)
              : undefined,
            realEstateCompanyName: org.name,
            realEstateCompanyId: org.id
          }
        })
        allAds.value = [...orgAds]
        loadResolve()
      } catch (err) {
        console.error('Failed to load sponsored organizations for ads:', err)
        loadResolve()
      } finally {
        loading.value = false
      }

      // Enrich organization ads media in background to support sidebar media shuffling.
      void enrichOrganizationAdsMedia(orgAds)

      const loadRest = async () => {
        let propertyAds: AdContent[] = []
        let buildingAds: AdContent[] = []

        try {
          const propertiesResponse = await propertyApi.getProperties(
            { status: 'AVAILABLE' },
            { page: 0, size: 100 }
          )
          const properties = 'content' in propertiesResponse
            ? propertiesResponse.content
            : (propertiesResponse as PropertyResponse[])
          propertyAds = (properties || [])
            .filter((p: PropertyResponse & { isSponsored?: boolean }) => p.isSponsored && (p as PropertyResponse & { sponsorshipType?: string }).sponsorshipType)
            .map((prop: PropertyResponse & { sponsorshipType?: string; realEstateCompanyName?: string; realEstateCompanyId?: string; realEstateCompanyVerified?: boolean; realEstateCompanyVerificationLevel?: string; imageUrls?: string[] }) => ({
              id: prop.id,
              title: prop.title,
              imageUrl: prop.images?.[0]?.imageUrl || prop.imageUrls?.[0],
              priceETB: prop.priceETB,
              priceUSD: prop.priceUSD,
              city: prop.city,
              address: prop.address,
              type: 'property' as const,
              sponsorshipType: normalizeType(prop.sponsorshipType),
              basePrice: sponsorshipTypeMap.value.get(normalizeType(prop.sponsorshipType)) || 0,
              realEstateCompanyName: prop.realEstateCompanyName,
              realEstateCompanyId: prop.realEstateCompanyId,
              realEstateCompanyVerified: prop.realEstateCompanyVerified,
              realEstateCompanyVerificationLevel: prop.realEstateCompanyVerificationLevel
            }))
        } catch (err) {
          console.error('Failed to load properties for ads:', err)
        }

        try {
          const buildingsResponse = await api.get('/buildings')
          const buildings = Array.isArray(buildingsResponse.data) ? (buildingsResponse.data as BuildingResponse[]) : []
          buildingAds = buildings
            .filter(b => b.isSponsored && b.sponsorshipType)
            .map(building => ({
              id: building.id,
              title: building.name,
              imageUrl: building.images?.[0]?.imageUrl,
              city: building.city,
              address: building.address,
              type: 'building' as const,
              sponsorshipType: normalizeType(building.sponsorshipType),
              basePrice: sponsorshipTypeMap.value.get(normalizeType(building.sponsorshipType)) || 0,
              realEstateCompanyName: building.realEstateCompanyName,
              realEstateCompanyId: building.realEstateCompanyId,
              realEstateCompanyVerified: building.realEstateCompanyVerified,
              realEstateCompanyVerificationLevel: building.realEstateCompanyVerificationLevel
            }))
        } catch (err) {
          console.error('Failed to load buildings for ads:', err)
        }

        const nonOrganizationAds = [...propertyAds, ...buildingAds]
          .sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))
        const remaining = Math.max(0, limit - orgAds.length)
        allAds.value = [...orgAds, ...nonOrganizationAds.slice(0, remaining)]
      }
      void loadRest()
    } catch (err) {
      console.error('Failed to load ads:', err)
      error.value = err
      allAds.value = []
      loading.value = false
      loadResolve()
    }
  }

  /**
   * Legacy: Fetch PREMIUM sponsored properties for banner ads (deprecated - use loadAllAds)
   */
  const loadPremierAds = async (limit: number = 5): Promise<void> => {
    await loadAllAds(limit)
  }

  /**
   * Legacy: Fetch GOLD sponsored properties and buildings for sidebar ads (deprecated - use loadAllAds)
   */
  const loadBasicAds = async (limit: number = 10): Promise<void> => {
    await loadAllAds(limit)
  }

  /**
   * Landing carousel: exclusive and premium sponsored organizations (exclusive first).
   */
  const premiumSponsorSlides = computed<AdContent[]>(() => {
    const organizations = dedupeOrganizationAds(allAds.value)
      .filter(ad => isExclusiveTier(ad.sponsorshipType) || isPremiumTier(ad.sponsorshipType))
    return organizations.sort((a, b) => {
      const rankDiff = sponsorshipTierRank(a.sponsorshipType) - sponsorshipTierRank(b.sponsorshipType)
      if (rankDiff !== 0) return rankDiff
      return (b.basePrice || 0) - (a.basePrice || 0)
    })
  })

  /**
   * Top banner pool: GOLD-sponsored organizations of a given {@link Organization.OrganizationType}
   * name (e.g. REAL_ESTATE_COMPANY, BANK). Used by HomeView and marketplace category pages.
   */
  const goldSponsorBannerAdsForOrganizationType = (organizationType: string): AdContent[] => {
    const want = normalizeType(organizationType)
    if (!want) return []
    const list = dedupeOrganizationAds(allAds.value).filter(
      (ad) =>
        ad.type === 'organization' &&
        isGoldTier(ad.sponsorshipType) &&
        normalizeType(ad.organizationType) === want
    )
    if (list.length === 0) return []
    return [...list].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0)).slice(0, 3)
  }

  /** Home / real-estate: GOLD real estate companies under the nav banner. */
  const topAds = computed<AdContent[]>(() =>
    goldSponsorBannerAdsForOrganizationType('REAL_ESTATE_COMPANY')
  )

  /**
   * Side panel ads: all sponsored organizations (exclusive, premium, gold), exclusive first.
   */
  const sideAds = computed<AdContent[]>(() => {
    const organizations = dedupeOrganizationAds(allAds.value)
    return organizations
      .filter(ad => isExclusiveTier(ad.sponsorshipType) || isPremiumTier(ad.sponsorshipType) || isGoldTier(ad.sponsorshipType))
      .sort((a, b) => {
        const rankDiff = sponsorshipTierRank(a.sponsorshipType) - sponsorshipTierRank(b.sponsorshipType)
        if (rankDiff !== 0) return rankDiff
        const priceDiff = (b.basePrice || 0) - (a.basePrice || 0)
        if (priceDiff !== 0) return priceDiff
        return (a.title || '').localeCompare(b.title || '')
      })
  })

  /**
   * Legacy: Premium ads (for backward compatibility)
   */
  const premierAds = computed<AdContent[]>(() => topAds.value)

  /**
   * Legacy: Gold ads (for backward compatibility)
   */
  const basicAds = computed<AdContent[]>(() => sideAds.value)

  /**
   * Get a random ad from the collection (for rotation)
   */
  const getRandomPremierAd = (): AdContent | null => {
    const ads = topAds.value
    if (ads.length === 0) return null
    return ads[Math.floor(Math.random() * ads.length)]
  }

  const getRandomBasicAd = (): AdContent | null => {
    const ads = sideAds.value
    if (ads.length === 0) return null
    return ads[Math.floor(Math.random() * ads.length)]
  }

  const getRandomTopAd = (): AdContent | null => getRandomPremierAd()
  const getRandomSideAd = (): AdContent | null => getRandomBasicAd()

  /** Resolves when the initial sponsor/carousel load has completed (so feature section can load after). */
  const whenReady = (): Promise<void> => loadPromise

  return {
    loading,
    error,
    allAds,
    sponsorships,
    premiumSponsorSlides,
    topAds,
    sideAds,
    premierAds, // Legacy compatibility
    basicAds, // Legacy compatibility
    loadAllAds,
    loadPremierAds, // Legacy compatibility
    loadBasicAds, // Legacy compatibility
    getRandomPremierAd, // Legacy compatibility
    getRandomBasicAd, // Legacy compatibility
    getRandomTopAd,
    getRandomSideAd,
    whenReady,
    goldSponsorBannerAdsForOrganizationType
  }
}

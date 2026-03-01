/**
 * Ads Composable
 * 
 * Business logic for managing sponsored ads from sponsorships.
 */
import { ref, computed } from 'vue'
import { propertyApi } from '@/features/property/api/property.api'
import type { PropertyResponse } from '@/features/property/api/property.types'
import api from '@/shared/api/client'

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

export interface AdContent {
  id: string
  title: string
  imageUrl?: string
  /** Optional video URL for sponsor carousel (e.g. ad video). */
  videoUrl?: string
  priceETB?: number
  priceUSD?: number
  city?: string
  address?: string
  type: 'property' | 'building' | 'organization'
  sponsorshipType: string
  basePrice: number
  realEstateCompanyName?: string
  realEstateCompanyId?: string
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
}

export interface FirstPropertyMediaResponse {
  imageUrl?: string | null
  videoUrl?: string | null
}

export function useAds() {
  const loading = ref(false)
  const error = ref(null)
  const allAds = ref<AdContent[]>([])
  const sponsorships = ref<SponsorshipResponse[]>([])
  const sponsorshipTypeMap = ref<Map<string, number>>(new Map())

  /**
   * Load sponsorships from backend to get dynamic types and base prices
   */
  const loadSponsorships = async (): Promise<void> => {
    try {
      const response = await api.get('/sponsorships/active')
      const activeSponsorships = Array.isArray(response.data) ? response.data : []
      
      // Sort by basePrice descending
      activeSponsorships.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))
      
      sponsorships.value = activeSponsorships
      
      // Create a map of sponsorship type to base price
      const typeMap = new Map<string, number>()
      activeSponsorships.forEach(sponsorship => {
        typeMap.set(sponsorship.type, sponsorship.basePrice || 0)
      })
      sponsorshipTypeMap.value = typeMap
    } catch (err) {
      console.error('Failed to load sponsorships:', err)
      sponsorships.value = []
      sponsorshipTypeMap.value = new Map()
    }
  }

  /**
   * Fetch all sponsored content: organizations (active sponsorship), properties, and buildings; ordered by base price.
   */
  const loadAllAds = async (limit: number = 20): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // First, load sponsorships to get base prices
      await loadSponsorships()

      // Load sponsored organizations (landing carousel – organizations with active sponsorship)
      let orgAds: AdContent[] = []
      try {
        const orgResponse = await api.get<SponsoredOrganizationResponse[]>('/sponsorships/sponsored-organizations')
        const orgs = Array.isArray(orgResponse.data) ? orgResponse.data : []
        orgAds = orgs.map(org => ({
          id: org.id,
          title: org.name,
          imageUrl: org.logoUrl ?? undefined,
          videoUrl: org.videoUrl ?? undefined,
          city: org.city,
          address: org.address,
          type: 'organization' as const,
          sponsorshipType: org.sponsorshipType || '',
          basePrice: typeof org.basePrice === 'number' ? org.basePrice : Number(org.basePrice) || 0,
          realEstateCompanyName: org.name,
          realEstateCompanyId: org.id
        }))
        // If an organization has no logo/video, use first media from its properties
        const needFallback = orgAds.filter(ad => !ad.imageUrl || !ad.videoUrl)
        if (needFallback.length > 0) {
          const fallbackResults = await Promise.all(
            needFallback.map(ad =>
              api.get<FirstPropertyMediaResponse>(`/properties/organization/${ad.id}/first-media`).then(r => r.data)
            )
          )
          needFallback.forEach((ad, i) => {
            const fallback = fallbackResults[i]
            if (fallback) {
              if (!ad.imageUrl && fallback.imageUrl) ad.imageUrl = fallback.imageUrl
              if (!ad.videoUrl && fallback.videoUrl) ad.videoUrl = fallback.videoUrl
            }
          })
        }
      } catch (err) {
        console.error('Failed to load sponsored organizations for ads:', err)
      }

      // Load sponsored properties
      const propertiesResponse = await propertyApi.getProperties(
        { status: 'AVAILABLE' },
        { page: 0, size: 100 }
      )

      const properties = 'content' in propertiesResponse
        ? propertiesResponse.content
        : propertiesResponse as PropertyResponse[]

      // Load sponsored buildings
      let buildings: BuildingResponse[] = []
      try {
        const buildingsResponse = await api.get('/buildings')
        buildings = Array.isArray(buildingsResponse.data)
          ? buildingsResponse.data as BuildingResponse[]
          : []
      } catch (err) {
        console.error('Failed to load buildings for ads:', err)
      }

      // Combine properties and buildings, filter for sponsored items
      const propertyAds: AdContent[] = properties
        .filter(p => p.isSponsored && p.sponsorshipType)
        .map(prop => ({
          id: prop.id,
          title: prop.title,
          imageUrl: prop.images?.[0]?.imageUrl || prop.imageUrls?.[0],
          priceETB: prop.priceETB,
          priceUSD: prop.priceUSD,
          city: prop.city,
          address: prop.address,
          type: 'property' as const,
          sponsorshipType: prop.sponsorshipType || '',
          basePrice: sponsorshipTypeMap.value.get(prop.sponsorshipType || '') || 0,
          realEstateCompanyName: prop.realEstateCompanyName,
          realEstateCompanyId: prop.realEstateCompanyId
        }))

      const buildingAds: AdContent[] = buildings
        .filter(b => b.isSponsored && b.sponsorshipType)
        .map(building => ({
          id: building.id,
          title: building.name,
          imageUrl: building.images?.[0]?.imageUrl,
          city: building.city,
          address: building.address,
          type: 'building' as const,
          sponsorshipType: building.sponsorshipType || '',
          basePrice: sponsorshipTypeMap.value.get(building.sponsorshipType || '') || 0,
          realEstateCompanyName: building.realEstateCompanyName,
          realEstateCompanyId: building.realEstateCompanyId
        }))

      // Combine organizations first (for carousel), then properties and buildings; sort by basePrice descending
      const combined = [...orgAds, ...propertyAds, ...buildingAds]
        .sort((a, b) => b.basePrice - a.basePrice)
        .slice(0, limit)

      allAds.value = combined
    } catch (err) {
      console.error('Failed to load ads:', err)
      error.value = err
      allAds.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Legacy: Fetch PREMIER sponsored properties for banner ads (deprecated - use loadAllAds)
   */
  const loadPremierAds = async (limit: number = 5): Promise<void> => {
    await loadAllAds(limit)
  }

  /**
   * Legacy: Fetch BASIC sponsored properties and buildings for sidebar ads (deprecated - use loadAllAds)
   */
  const loadBasicAds = async (limit: number = 10): Promise<void> => {
    await loadAllAds(limit)
  }

  /**
   * Premium & Gold sponsor slides for landing carousel (top two tiers by base price).
   * Deduplicated by realEstateCompanyId so each company appears once.
   */
  const premiumSponsorSlides = computed<AdContent[]>(() => {
    if (allAds.value.length === 0) return []
    const prices = [...new Set(allAds.value.map(a => a.basePrice || 0))].sort((a, b) => b - a)
    const topPrices = prices.slice(0, 2) // premium (highest) and gold (second)
    const seen = new Set<string>()
    return allAds.value
      .filter(ad => topPrices.includes(ad.basePrice || 0))
      .filter(ad => {
        const key = ad.realEstateCompanyId || ad.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))
  })

  /**
   * Top ads (highest base_price) - for banner display
   */
  const topAds = computed<AdContent[]>(() => {
    if (allAds.value.length === 0) return []
    
    // Get the highest base price
    const basePrices = allAds.value.map(ad => ad.basePrice || 0)
    if (basePrices.length === 0) return []
    
    const maxBasePrice = Math.max(...basePrices)
    
    // Return ads with the highest base price (top 2-3 for banner)
    return allAds.value
      .filter(ad => (ad.basePrice || 0) === maxBasePrice)
      .slice(0, 3)
  })

  /**
   * Side ads (lower base_price) - for left/right sidebar display
   */
  const sideAds = computed<AdContent[]>(() => {
    if (allAds.value.length === 0) return []
    
    // Get the highest base price
    const basePrices = allAds.value.map(ad => ad.basePrice || 0)
    if (basePrices.length === 0) return []
    
    const maxBasePrice = Math.max(...basePrices)
    
    // Return ads with lower base price than the top
    return allAds.value
      .filter(ad => (ad.basePrice || 0) < maxBasePrice)
  })

  /**
   * Legacy: Premier ads (for backward compatibility)
   */
  const premierAds = computed<AdContent[]>(() => {
    return topAds.value
  })

  /**
   * Legacy: Basic ads (for backward compatibility)
   */
  const basicAds = computed<AdContent[]>(() => {
    return sideAds.value
  })

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

  const getRandomTopAd = (): AdContent | null => {
    return getRandomPremierAd()
  }

  const getRandomSideAd = (): AdContent | null => {
    return getRandomBasicAd()
  }

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
    getRandomSideAd
  }
}

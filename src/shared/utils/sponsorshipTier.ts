/** Sponsorship tier helpers (Ethio Build Connect expo packages; legacy PREMIUM = PLATINUM). */

export function normalizeSponsorshipType(type: string | undefined | null): string {
  return String(type || '').trim().toUpperCase()
}

/** Hero carousel / top banner: exclusive + platinum tiers */
export function isHeroCarouselSponsorshipType(type: string | undefined | null): boolean {
  const t = normalizeSponsorshipType(type)
  return t === 'EXCLUSIVE' || t === 'PLATINUM' || t === 'PREMIUM'
}

/** Property/building card “premier” styling (star, gold border) */
export function isPremierListingTier(type: string | undefined | null): boolean {
  const t = normalizeSponsorshipType(type)
  return t === 'EXCLUSIVE' || t === 'PLATINUM' || t === 'PREMIUM'
}

export function isGoldListingTier(type: string | undefined | null): boolean {
  return normalizeSponsorshipType(type) === 'GOLD'
}

/** Lower number sorts first (better placement). */
export function listingSortTierRank(type: string | undefined | null): number {
  const t = normalizeSponsorshipType(type)
  if (t === 'EXCLUSIVE') return 0
  if (t === 'PLATINUM' || t === 'PREMIUM') return 1
  if (t === 'GOLD') return 2
  if (t === 'SILVER') return 3
  if (t === 'SPECIAL') return 4
  return 100
}

/**
 * Public landing display timings (sponsor carousel + sidebar rotations).
 * Loaded from GET /public/display-settings; defaults apply if the request fails.
 */
import { reactive } from 'vue'
import api from '@/shared/api/client'
import { coerceDisplayBool } from '@/shared/utils/displaySettingsBooleans'

/** Footer contact from base organization (GET /public/display-settings). */
export interface FooterContact {
  address: string
  phoneDisplay: string
  phoneTel: string
  websiteLabel: string
  websiteUrl: string
}

export interface DisplaySettings {
  sponsorCarouselAutoplayMs: number
  sidebarMediaRotationMs: number
  sidebarLayoutRotationMs: number
  /** Feature flag: exhibition landing sponsorship packages section (default on). */
  exhibitionSponsorshipPackagesVisible?: boolean
  /** Feature flag: show prices on sponsorship package cards / details (default on). */
  exhibitionSponsorshipPackagePricesVisible?: boolean
  footer?: FooterContact | null
}

const defaults: DisplaySettings = {
  sponsorCarouselAutoplayMs: 10_000,
  sidebarMediaRotationMs: 12_000,
  sidebarLayoutRotationMs: 35_000,
  exhibitionSponsorshipPackagesVisible: true,
  exhibitionSponsorshipPackagePricesVisible: true
}

export const displaySettings = reactive<DisplaySettings>({ ...defaults })

let loadPromise: Promise<void> | null = null

export function mergeDisplaySettings(data: DisplaySettings) {
  const next: Record<string, unknown> = { ...data }
  if (Object.prototype.hasOwnProperty.call(data, 'exhibitionSponsorshipPackagesVisible')) {
    next.exhibitionSponsorshipPackagesVisible = coerceDisplayBool(
      data.exhibitionSponsorshipPackagesVisible,
      true
    )
  }
  if (Object.prototype.hasOwnProperty.call(data, 'exhibitionSponsorshipPackagePricesVisible')) {
    next.exhibitionSponsorshipPackagePricesVisible = coerceDisplayBool(
      data.exhibitionSponsorshipPackagePricesVisible,
      true
    )
  }
  Object.assign(displaySettings, next)
}

export function useDisplaySettings() {
  function loadDisplaySettings() {
    if (loadPromise) return loadPromise
    loadPromise = api
      .get<DisplaySettings>('/public/display-settings')
      .then((res) => {
        mergeDisplaySettings(res.data)
      })
      .catch(() => {
        mergeDisplaySettings({ ...defaults })
      })
      .then(() => undefined)
    return loadPromise
  }

  return {
    settings: displaySettings,
    loadDisplaySettings,
    mergeDisplaySettings
  }
}

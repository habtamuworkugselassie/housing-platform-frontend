/**
 * Public landing display timings (sponsor carousel + sidebar rotations).
 * Loaded from GET /public/display-settings; defaults apply if the request fails.
 */
import { reactive } from 'vue'
import api from '@/shared/api/client'

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
  footer?: FooterContact | null
}

const defaults: DisplaySettings = {
  sponsorCarouselAutoplayMs: 10_000,
  sidebarMediaRotationMs: 12_000,
  sidebarLayoutRotationMs: 35_000
}

export const displaySettings = reactive<DisplaySettings>({ ...defaults })

let loadPromise: Promise<void> | null = null

export function mergeDisplaySettings(data: DisplaySettings) {
  Object.assign(displaySettings, data)
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

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
  /** Live broadcast: master on/off for the exhibition "Live now" zone (default off). */
  exhibitionLiveVisible?: boolean
  /** Live broadcast source: 'EXTERNAL_EMBED' (YouTube/Facebook) or 'HLS' (self-hosted). */
  liveSourceType?: 'EXTERNAL_EMBED' | 'HLS'
  /** External live watch/embed URL (YouTube or Facebook Live). */
  liveEmbedUrl?: string
  /** Self-hosted HLS (.m3u8) stream URL. */
  liveHlsUrl?: string
  /** Heading shown above the live player. */
  liveTitle?: string
  /** "Watch on" social links for the live zone. */
  liveYoutubeUrl?: string
  liveTiktokUrl?: string
  liveFacebookUrl?: string
  /** Feature flag: show the visitor video-feedback section on the exhibition page (default off). */
  exhibitionFeedbackVisible?: boolean
  /** When true, submitted feedback videos are published immediately; when false they await admin approval (default off). */
  exhibitionFeedbackAutoPublish?: boolean
  /** When true, a broadcast auto-simulcasts to all enabled RTMP destinations on go-live (default off). */
  exhibitionLiveAutoSimulcast?: boolean
  footer?: FooterContact | null
}

const defaults: DisplaySettings = {
  sponsorCarouselAutoplayMs: 10_000,
  sidebarMediaRotationMs: 12_000,
  sidebarLayoutRotationMs: 35_000,
  exhibitionSponsorshipPackagesVisible: true,
  exhibitionSponsorshipPackagePricesVisible: true,
  exhibitionLiveVisible: false,
  liveSourceType: 'EXTERNAL_EMBED',
  exhibitionFeedbackVisible: false,
  exhibitionFeedbackAutoPublish: false,
  exhibitionLiveAutoSimulcast: false
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
  if (Object.prototype.hasOwnProperty.call(data, 'exhibitionLiveVisible')) {
    next.exhibitionLiveVisible = coerceDisplayBool(data.exhibitionLiveVisible, false)
  }
  if (Object.prototype.hasOwnProperty.call(data, 'exhibitionFeedbackVisible')) {
    next.exhibitionFeedbackVisible = coerceDisplayBool(data.exhibitionFeedbackVisible, false)
  }
  if (Object.prototype.hasOwnProperty.call(data, 'exhibitionLiveAutoSimulcast')) {
    next.exhibitionLiveAutoSimulcast = coerceDisplayBool(data.exhibitionLiveAutoSimulcast, false)
  }
  if (Object.prototype.hasOwnProperty.call(data, 'exhibitionFeedbackAutoPublish')) {
    next.exhibitionFeedbackAutoPublish = coerceDisplayBool(data.exhibitionFeedbackAutoPublish, false)
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

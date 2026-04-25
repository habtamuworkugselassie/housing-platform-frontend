<template>
  <div v-if="adContent || (adContents && adContents.length > 0)">
    <!-- Top banner: exhibition tier chrome (EXCLUSIVE / PLATINUM / GOLD from shared theme) -->
    <div
      v-if="size === 'banner'"
      class="flex h-full min-h-[5.5rem] sm:min-h-28 w-full gap-2 sm:gap-3"
    >
      <template v-if="adContents && adContents.length > 0">
        <div
          v-for="ad in adContents.slice(0, 2)"
          :key="ad.id"
          role="link"
          tabindex="0"
          class="flex-1 min-w-0 flex flex-col rounded-lg border border-white/10 overflow-hidden transition-all hover:border-black/40 cursor-pointer"
          :class="tierFor(ad).shadowGlow"
          @click="handleAdClick(ad)"
          @keydown.enter.prevent="handleAdClick(ad)"
        >
          <div
            class="h-1 w-full shrink-0"
            :class="[tierFor(ad).stripe, tierFor(ad).stripeAnimate ? 'ad-tier-stripe-shimmer' : '']"
          />
          <div
            class="flex-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 min-h-0"
            :class="tierFor(ad).headerBg"
          >
            <div
              v-if="bannerThumbUrl(ad)"
              class="flex-shrink-0 w-14 sm:w-20 h-14 sm:h-20 rounded-md overflow-hidden ring-1 ring-white/15 bg-violet-950/30"
            >
              <img
                :src="mediaUrl(bannerThumbUrl(ad))"
                :alt="ad.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                <span
                  v-if="ad.sponsorshipType"
                  class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  :class="tierFor(ad).hintChip"
                >
                  {{ String(ad.sponsorshipType).toUpperCase() }}
                </span>
                <span
                  v-else
                  class="inline-flex rounded-md border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-100"
                >
                  SPONSORED
                </span>
              </div>
              <h3 class="text-xs sm:text-sm font-semibold text-white truncate">
                {{ ad.title }}
              </h3>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-0 text-[11px] sm:text-xs mt-0.5">
                <span v-if="ad.city" class="truncate text-gray-400">{{ ad.city }}</span>
                <span
                  v-if="ad.priceETB"
                  class="font-semibold whitespace-nowrap"
                  :class="tierFor(ad).price"
                >
                  {{ formatPrice(ad.priceETB, 'ETB') }}
                </span>
              </div>
              <div v-if="ad.realEstateCompanyName" class="flex items-center gap-1 text-[11px] mt-1 flex-wrap">
                <svg class="w-3 h-3 shrink-0 opacity-90" :class="tierFor(ad).eyebrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span class="font-medium truncate text-gray-200">{{ ad.realEstateCompanyName }}</span>
                <VerifiedBadge :level="ad.realEstateCompanyVerificationLevel || (ad.realEstateCompanyVerified ? 'FULL' : null)" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="adContent">
        <div
          role="link"
          tabindex="0"
          class="flex-1 w-full flex flex-col rounded-lg border border-white/10 overflow-hidden transition-all hover:border-black/40 cursor-pointer"
          :class="tierFor(adContent).shadowGlow"
          @click="handleClick"
          @keydown.enter.prevent="handleClick"
        >
          <div
            class="h-1 w-full shrink-0"
            :class="[tierFor(adContent).stripe, tierFor(adContent).stripeAnimate ? 'ad-tier-stripe-shimmer' : '']"
          />
          <div
            class="flex-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 min-h-0"
            :class="tierFor(adContent).headerBg"
          >
            <div
              v-if="bannerThumbUrl(adContent)"
              class="flex-shrink-0 w-16 sm:w-24 h-16 sm:h-24 rounded-md overflow-hidden ring-1 ring-white/15 bg-violet-950/30"
            >
              <img
                :src="mediaUrl(bannerThumbUrl(adContent))"
                :alt="adContent.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                <span
                  v-if="adContent.sponsorshipType"
                  class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  :class="tierFor(adContent).hintChip"
                >
                  {{ String(adContent.sponsorshipType).toUpperCase() }}
                </span>
                <span
                  v-else
                  class="inline-flex rounded-md border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-100"
                >
                  SPONSORED
                </span>
              </div>
              <h3 class="text-sm sm:text-base font-semibold text-white truncate">
                {{ adContent.title }}
              </h3>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-0 text-xs mt-0.5">
                <span v-if="adContent.city" class="text-gray-400 truncate">{{ adContent.city }}</span>
                <span
                  v-if="adContent.priceETB"
                  class="font-semibold whitespace-nowrap"
                  :class="tierFor(adContent).price"
                >
                  {{ formatPrice(adContent.priceETB, 'ETB') }}
                </span>
              </div>
              <div v-if="adContent.realEstateCompanyName" class="flex items-center gap-1 text-xs mt-1 flex-wrap">
                <svg class="w-3 h-3 shrink-0 opacity-90" :class="tierFor(adContent).eyebrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span class="font-medium truncate text-gray-200">{{ adContent.realEstateCompanyName }}</span>
                <VerifiedBadge :level="adContent.realEstateCompanyVerificationLevel || (adContent.realEstateCompanyVerified ? 'FULL' : null)" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Sidebar / rectangle: same exhibition tier system -->
    <div
      v-else
      class="h-full flex flex-col rounded-lg border border-white/10 overflow-hidden cursor-pointer transition-all hover:border-black/40 w-full"
      :class="[
        sidebarTier.shadowGlow,
        size === 'sidebar' ? 'min-h-[300px]' : '',
        size === 'rectangle' ? 'min-h-[8rem] sm:min-h-[10rem]' : ''
      ]"
      role="link"
      tabindex="0"
      @click="handleClick"
      @keydown.enter.prevent="handleClick"
    >
      <div
        class="h-1 w-full shrink-0"
        :class="[sidebarTier.stripe, sidebarTier.stripeAnimate ? 'ad-tier-stripe-shimmer' : '']"
      />
      <div
        v-if="currentSidebarMedia"
        :class="[
          'w-full overflow-hidden relative bg-zinc-950',
          size === 'sidebar' ? 'h-48' : 'h-32'
        ]"
      >
        <video
          v-if="currentSidebarMedia.isVideo"
          :key="'ad-video-' + currentSidebarMediaIndex + '-' + currentSidebarMedia.url"
          :src="mediaUrl(currentSidebarMedia.url)"
          :poster="sidebarVideoPosterSrc ? mediaUrl(sidebarVideoPosterSrc) : ''"
          autoplay
          muted
          loop
          playsinline
          class="w-full h-full object-cover"
        />
        <img
          v-else
          :src="mediaUrl(currentSidebarMedia.url)"
          :alt="adContent.title"
          class="w-full h-full object-cover"
        />
        <span
          v-if="sidebarMediaItems.length > 1"
          class="absolute top-2 right-2 rounded-full bg-violet-950/60 px-2 py-0.5 text-[10px] font-semibold text-white"
        >
          {{ currentSidebarMediaIndex + 1 }} / {{ sidebarMediaItems.length }}
        </span>
      </div>
      <div
        v-else
        :class="[
          'w-full flex items-center justify-center bg-zinc-900',
          size === 'sidebar' ? 'h-48' : 'h-32'
        ]"
      >
        <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
      <div class="flex-1 p-3 flex flex-col border-t border-white/5" :class="sidebarTier.headerBg">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span
            v-if="adContent.sponsorshipType"
            class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            :class="sidebarTier.hintChip"
          >
            {{ adContent.sponsorshipType.toUpperCase() }}
          </span>
          <span
            v-else
            class="inline-flex rounded-md border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-100"
          >
            SPONSORED
          </span>
        </div>
        <h3 class="text-sm font-semibold mb-1 line-clamp-2 text-white">
          {{ adContent.title }}
        </h3>
        <div class="mt-auto space-y-1">
          <div v-if="adContent.city" class="text-xs text-gray-400">
            {{ adContent.city }}
          </div>
          <div v-if="adContent.priceETB" class="text-sm font-bold" :class="sidebarTier.price">
            {{ formatPrice(adContent.priceETB, 'ETB') }}
          </div>
          <div v-if="adContent.realEstateCompanyName" class="flex items-center gap-1 text-xs pt-2 border-t border-white/10 flex-wrap">
            <svg class="w-3 h-3 shrink-0 opacity-90" :class="sidebarTier.eyebrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="font-medium truncate text-gray-200">{{ adContent.realEstateCompanyName }}</span>
            <VerifiedBadge :level="adContent.realEstateCompanyVerificationLevel || (adContent.realEstateCompanyVerified ? 'FULL' : null)" size="sm" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Placeholder when no ad content -->
  <div
    v-else
    :class="[
      'rounded-lg flex items-center justify-center',
      dark ? 'bg-zinc-800 border border-white/10' : 'bg-gray-100 border border-gray-200',
      size === 'banner' ? 'h-24 sm:h-28' : '',
      size === 'sidebar' ? 'w-full min-h-[300px]' : '',
      size === 'rectangle' ? 'h-32 sm:h-40' : ''
    ]"
  >
    <div class="text-center p-4">
      <div class="text-gray-400 text-sm mb-2">Advertisement</div>
      <div
        :class="[
          'text-gray-500 text-xs',
          size === 'banner' ? 'text-sm' : '',
          size === 'sidebar' ? 'text-xs' : ''
        ]"
      >
        {{ size === 'banner' ? '728 x 90' : size === 'sidebar' ? '300 x 600' : '300 x 250' }}
      </div>
      <div class="text-gray-400 text-xs mt-1">Ad Space</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'
import { useRouter } from 'vue-router'
import { mediaUrl } from '@/shared/api/client'
import { useMediaWarmup } from '@/shared/composables/useMediaWarmup'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'
import { getTierModalTheme } from '@/shared/utils/exhibitionSponsorshipTierTheme'
import VerifiedBadge from './VerifiedBadge.vue'

const props = defineProps({
  size: {
    type: String,
    default: 'banner',
    validator: (value) => ['banner', 'sidebar', 'rectangle'].includes(value)
  },
  dark: { type: Boolean, default: false },
  adContent: {
    type: Object,
    default: null
  },
  adContents: {
    type: Array,
    default: null
  },
  /** Sidebar media rotation (ms). Omit to use admin / public display settings. */
  sidebarMediaRotationMs: { type: Number, default: undefined }
})

function tierFor(ad) {
  return getTierModalTheme(ad?.sponsorshipType)
}

const sidebarTier = computed(() => getTierModalTheme(props.adContent?.sponsorshipType))

const { settings } = useDisplaySettings()
const effectiveSidebarMediaMs = computed(() => {
  if (props.sidebarMediaRotationMs !== undefined && props.sidebarMediaRotationMs !== null) {
    return props.sidebarMediaRotationMs
  }
  return settings.sidebarMediaRotationMs
})

const router = useRouter()
const currentSidebarMediaIndex = ref(0)
let sidebarMediaInterval = null

const isVideoUrl = (url = '') => /\.(mp4|mov|avi|webm|mkv)(\?|$)/i.test(String(url))

/** Banner thumbnails: prefer property/building image, else org splash, else logo. */
function bannerThumbUrl(ad) {
  if (!ad) return ''
  const img = String(ad.imageUrl || '').trim()
  if (img) return img
  const logo = String(ad.logoUrl || '').trim()
  return logo
}

const sidebarMediaItems = computed(() => {
  if (!props.adContent) return []
  const list = []
  const seen = new Set()
  const addMedia = (url, mediaKind) => {
    const normalizedUrl = String(url || '').trim()
    if (!normalizedUrl || seen.has(normalizedUrl)) return
    seen.add(normalizedUrl)
    const kind = String(mediaKind || '').toUpperCase()
    list.push({
      url: normalizedUrl,
      isVideo: kind === 'VIDEO' || isVideoUrl(normalizedUrl)
    })
  }

  if (Array.isArray(props.adContent.mediaItems)) {
    props.adContent.mediaItems.forEach(item => addMedia(item?.url, item?.mediaKind))
  }
  addMedia(props.adContent.videoUrl, 'VIDEO')
  addMedia(props.adContent.imageUrl, 'IMAGE')
  
  return list.sort((a, b) => {
    if (a.isVideo && !b.isVideo) return -1
    if (!a.isVideo && b.isVideo) return 1
    return 0
  })
})

const currentSidebarMedia = computed(() => {
  if (!sidebarMediaItems.value.length) return null
  return sidebarMediaItems.value[currentSidebarMediaIndex.value] || sidebarMediaItems.value[0]
})

/** Poster for video items so we do not embed MP4 in sidebar HTML on every route. */
const sidebarVideoPosterSrc = computed(() => {
  const poster = bannerThumbUrl(props.adContent)
  if (poster) return poster
  return String(props.adContent?.logoUrl || '').trim()
})

const adMediaUrlsForWarmup = computed(() => {
  const urls = []
  if (Array.isArray(props.adContents)) {
    props.adContents.forEach((ad) => {
      const u = bannerThumbUrl(ad)
      if (u) urls.push(u)
    })
  }
  const single = bannerThumbUrl(props.adContent)
  if (single) urls.push(single)
  if (props.adContent?.videoUrl) urls.push(props.adContent.videoUrl)
  sidebarMediaItems.value.forEach((m) => {
    if (m?.url) urls.push(m.url)
  })
  return urls
})

useMediaWarmup(adMediaUrlsForWarmup)

const resetSidebarMediaRotation = () => {
  if (sidebarMediaInterval) {
    clearInterval(sidebarMediaInterval)
    sidebarMediaInterval = null
  }
  currentSidebarMediaIndex.value = 0
  if (props.size !== 'sidebar' || sidebarMediaItems.value.length <= 1) return
  const ms = effectiveSidebarMediaMs.value
  if (ms <= 0) return
  sidebarMediaInterval = setInterval(() => {
    if (!sidebarMediaItems.value.length) return
    currentSidebarMediaIndex.value = (currentSidebarMediaIndex.value + 1) % sidebarMediaItems.value.length
  }, ms)
}

watch(
  () => [props.size, props.adContent?.id, sidebarMediaItems.value.length, effectiveSidebarMediaMs.value],
  resetSidebarMediaRotation,
  { immediate: true }
)

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const handleClick = () => {
  if (!props.adContent) return

  if (props.adContent.type === 'property') {
    router.push(`/properties/${props.adContent.id}`)
  } else if (props.adContent.type === 'building') {
    router.push(`/buildings/${props.adContent.id}`)
  } else if (props.adContent.type === 'organization') {
    router.push(`/organizations/${props.adContent.id}`)
  }
}

const handleAdClick = (ad) => {
  if (!ad) return

  if (ad.type === 'property') {
    router.push(`/properties/${ad.id}`)
  } else if (ad.type === 'building') {
    router.push(`/buildings/${ad.id}`)
  } else if (ad.type === 'organization') {
    router.push(`/organizations/${ad.id}`)
  }
}

onUnmounted(() => {
  if (sidebarMediaInterval) {
    clearInterval(sidebarMediaInterval)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Match exhibition package stripe pulse (EXCLUSIVE / PLATINUM) */
@keyframes ad-tier-stripe-shimmer {
  0%,
  100% {
    opacity: 0.88;
    filter: brightness(1);
  }
  50% {
    opacity: 1;
    filter: brightness(1.12);
  }
}
.ad-tier-stripe-shimmer {
  animation: ad-tier-stripe-shimmer 2.8s ease-in-out infinite;
}
</style>

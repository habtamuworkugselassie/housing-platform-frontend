<template>
  <section class="relative flex w-full flex-col overflow-hidden m-0 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06),inset_0_-30px_30px_-20px_rgba(255,255,255,0.04)]">
    <!-- Carousel area: inset blur border (visible inside overflow) -->
    <!-- No z-index lift: sponsor strip (z-10) stays above carousel edge on all breakpoints -->
    <div class="relative w-full overflow-hidden flex-shrink-0 rounded-b-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_0_40px_rgba(255,255,255,0.04)]" :class="heightClass">
      <!-- Placeholder when no sponsors (optional message) -->
      <div
        v-if="slides.length === 0 && !loading"
        class="absolute inset-0 flex items-center justify-center text-white/50 text-sm"
      >
        {{ $t('exhibition.sponsorCarousel.noSponsors') }}
      </div>

      <template v-else-if="slides.length > 0">
        <!-- Slider track - fluid transition like Cityscape -->
        <div
          class="absolute inset-0 flex will-change-transform"
          :style="{
            transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
            transition: 'transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)'
          }"
        >
          <div
            v-for="(slide, index) in slides"
            :key="slide.id + (slide.realEstateCompanyId || '')"
            class="relative flex-shrink-0 w-full h-full"
          >
            <!-- Media: load video only for current and next slide; lazy-load images for others -->
            <div class="absolute inset-0 z-0">
              <template v-if="getSlideActiveMedia(index)">
                <template v-if="getSlideActiveMedia(index).isVideo && (index === currentIndex || index === (currentIndex + 1) % slides.length)">
                  <div class="relative h-full w-full bg-zinc-950/50">
                    <video
                      :key="'v-' + slide.id + index + '-' + getSlideActiveMedia(index).url"
                      :src="mediaUrl(getSlideActiveMedia(index).url)"
                      :poster="slidePoster(slide) ? mediaUrl(slidePoster(slide)) : ''"
                      autoplay
                      muted
                      loop
                      playsinline
                      preload="auto"
                      class="absolute inset-0 h-full w-full object-contain bg-zinc-950/50"
                    />
                  </div>
                </template>
                <template v-else>
                  <img
                    :key="'img-' + slide.id + index + '-' + getSlideActiveMedia(index).url"
                    :src="mediaUrl(getSlideActiveMedia(index).url)"
                    :alt="slide.realEstateCompanyName || slide.title"
                    :loading="index <= currentIndex + 1 || (currentIndex === slides.length - 1 && index === 0) ? 'eager' : 'lazy'"
                    class="w-full h-full object-contain bg-zinc-950/50 transition-opacity duration-500"
                  />
                </template>
              </template>
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900"
              />
              <div v-if="slidesMediaMap[index] && slidesMediaMap[index].length > 1 && index === currentIndex" class="absolute top-4 right-4 z-20 flex gap-1.5 pointer-events-none">
                <div v-for="(_m, mIdx) in slidesMediaMap[index]" :key="mIdx" class="h-1.5 rounded-full bg-white/80 transition-all duration-300 shadow-sm" :class="((slideMediaIndexes[slide.id] || 0) % slidesMediaMap[index].length) === mIdx ? 'w-4' : 'w-1.5 opacity-50'" />
              </div>
              <!-- Readability scrim: stronger on desktop so the card reads over bright media -->
              <div class="absolute inset-x-0 top-0 h-28 md:h-36 bg-gradient-to-b from-black/55 to-transparent pointer-events-none md:from-black/50" aria-hidden="true" />
              <div class="absolute inset-x-0 bottom-0 h-36 md:h-48 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none md:from-black/75 md:via-black/30" aria-hidden="true" />
            </div>

            <!-- Lower third, flush left; pb-16 matches sponsor strip -mt-16 so card bottom edge meets strip top -->
            <div class="relative z-10 flex h-full w-full items-end justify-start pl-3 pr-4 pb-16 sm:pl-4 sm:pr-6 md:pl-5 md:pr-8 lg:pl-6 lg:pr-10 xl:pl-8 xl:pr-12">
              <component
                :is="slide.realEstateCompanyId ? 'router-link' : 'div'"
                :to="slide.realEstateCompanyId ? `/organizations/${slide.realEstateCompanyId}?from=${$route.path}` : undefined"
                class="group block h-auto min-h-0 w-full max-w-[min(100%,12.5rem)] sm:w-fit sm:max-w-md md:w-[min(100%,28rem)] text-left rounded-lg sm:rounded-2xl md:rounded-3xl border border-white/10 md:border-white/15 md:border-l-4 md:border-l-black bg-violet-950/20 sm:bg-violet-950/35 md:bg-gradient-to-br md:from-black/55 md:via-black/40 md:to-zinc-900/45 backdrop-blur-sm sm:backdrop-blur-md md:backdrop-blur-xl px-2 py-2 sm:px-6 sm:py-7 md:px-8 md:py-8 lg:px-9 lg:py-9 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.45)] md:shadow-[inset_0_1px_0_0_rgba(250,204,21,0.06),0_32px_64px_-16px_rgba(0,0,0,0.55),0_0_40px_-8px_rgba(250,204,21,0.12)] transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-1 hover:border-black/35 md:hover:border-l-black hover:shadow-[0_36px_70px_-18px_rgba(0,0,0,0.6),0_0_48px_-6px_rgba(250,204,21,0.18)] cursor-pointer shrink-0"
              >
                <!-- Mobile: single horizontal strip (short). sm+: stacked / desktop layout -->
                <div class="flex flex-row items-center gap-2 sm:flex-col sm:items-stretch sm:gap-0 md:flex-row md:items-center md:gap-5 lg:gap-6">
                  <div
                    v-if="slide.logoUrl && useLogo"
                    class="mb-0 sm:mb-4 md:mb-0 h-9 w-9 sm:h-24 sm:w-24 md:h-24 md:w-24 lg:h-28 lg:w-28 flex-shrink-0 rounded-md sm:rounded-xl md:rounded-2xl overflow-hidden bg-white/[0.08] flex items-center justify-center ring-1 ring-white/15 md:ring-2 md:ring-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                  >
                    <img
                      :src="mediaUrl(slide.logoUrl)"
                      :alt="slide.realEstateCompanyName || slide.title"
                      loading="lazy"
                      class="h-full w-full object-contain p-0.5 sm:p-1 md:p-2"
                    />
                  </div>
                  <div
                    v-else
                    class="mb-0 sm:mb-4 md:mb-0 flex h-9 w-9 sm:h-24 sm:w-24 md:h-24 md:w-24 lg:h-28 lg:w-28 flex-shrink-0 items-center justify-center rounded-full sm:rounded-full md:rounded-2xl bg-gradient-to-br from-white/25 to-white/10 text-sm sm:text-3xl md:text-3xl lg:text-4xl font-bold text-white ring-1 ring-white/20"
                  >
                    {{ (slide.realEstateCompanyName || slide.title).charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1 break-words md:pl-1 lg:pl-2">
                    <p class="hidden md:block text-[11px] font-semibold uppercase tracking-[0.22em] text-white mb-1.5 lg:mb-2">
                      {{ $t('exhibition.sponsorCarousel.featuredPartner') }}
                    </p>
                    <h3 class="text-xs sm:text-2xl md:text-2xl lg:text-[1.65rem] font-bold text-white uppercase md:normal-case md:font-semibold md:tracking-tight flex items-start sm:items-center gap-1 sm:gap-2 md:gap-2.5 flex-wrap leading-snug sm:leading-tight md:leading-snug line-clamp-2 sm:line-clamp-none">
                      <span class="min-w-0">{{ slide.realEstateCompanyName || slide.title }}</span>
                      <span class="hidden sm:inline-flex shrink-0 md:translate-y-px">
                        <VerifiedBadge :level="slide.realEstateCompanyVerificationLevel || (slide.realEstateCompanyVerified ? 'FULL' : null)" size="md" />
                      </span>
                    </h3>
                    <p v-if="slide.address" class="hidden sm:block mt-1 sm:mt-2 md:mt-2.5 text-xs sm:text-base md:text-[15px] text-white/85 md:text-white/85 leading-relaxed line-clamp-2 sm:line-clamp-none md:line-clamp-2 lg:line-clamp-none">
                      {{ slide.address }}{{ slide.city ? `, ${slide.city}` : '' }}
                    </p>
                    <p v-else-if="slide.city" class="hidden sm:block mt-1 sm:mt-2 md:mt-2.5 text-xs sm:text-base md:text-[15px] text-white/85">
                      {{ slide.city }}
                    </p>
                    <span
                      class="mt-1 max-sm:mt-0.5 sm:mt-3 md:mt-4 inline-block rounded px-1.5 py-0.5 sm:rounded-md sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider md:tracking-[0.12em]"
                      :class="tierBadgeClass(slide)"
                    >
                      {{ slide.sponsorshipType || $t('exhibition.sponsorCarousel.sponsor') }}
                    </span>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

        <!-- Arrows - subtle, fluid -->
        <template v-if="slides.length > 1">
          <button
            type="button"
            class="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-violet-950/35 p-2.5 text-white backdrop-blur-md transition-all duration-300 hover:bg-violet-950/55 hover:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/50 sm:left-6 md:left-8 md:p-3 border border-white/10 shadow-lg md:shadow-xl"
            aria-label="Previous"
            @click="prev"
          >
            <ChevronLeftIcon class="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </button>
          <button
            type="button"
            class="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-violet-950/35 p-2.5 text-white backdrop-blur-md transition-all duration-300 hover:bg-violet-950/55 hover:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/50 sm:right-6 md:right-8 md:p-3 border border-white/10 shadow-lg md:shadow-xl"
            aria-label="Next"
            @click="next"
          >
            <ChevronRightIcon class="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </button>
        </template>
      </template>
    </div>

    <!-- Sponsor list at bottom: blurred violet-950 transition (no solid), bordered -->
    <div
      v-if="slides.length > 0"
      class="sponsor-strip relative z-10 -mt-16 flex-shrink-0 border-t border-white/10 px-4 py-2 pt-4 md:px-8 lg:px-12 backdrop-blur-xl bg-gradient-to-b from-transparent via-black/40 to-black/80 shadow-[inset_0_25px_40px_-15px_rgba(255,255,255,0.06)]"
    >
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id + (slide.realEstateCompanyId || '') + index"
          type="button"
          class="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-md overflow-hidden bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-black hover:bg-violet-950/30 hover:border-black border border-transparent"
          :class="currentIndex === index ? 'ring-2 ring-white sm:scale-110 scale-105' : ''"
          :aria-label="(slide.realEstateCompanyName || slide.title) + (currentIndex === index ? ' (current)' : '')"
          :title="slide.realEstateCompanyName || slide.title"
          @click="goTo(index)"
        >
          <img
            v-if="slide.logoUrl"
            :src="mediaUrl(slide.logoUrl)"
            :alt="slide.realEstateCompanyName || slide.title"
            loading="lazy"
            class="h-full w-full object-contain p-0.5"
          />
          <span
            v-else
            class="text-xs sm:text-sm font-bold text-white"
          >
            {{ (slide.realEstateCompanyName || slide.title).charAt(0).toUpperCase() }}
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import { mediaUrl } from '@/shared/api/client'
import { useMediaWarmup } from '@/shared/composables/useMediaWarmup'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'
import { useAds } from '@/shared/composables/useAds'
import { getTierModalTheme } from '@/shared/utils/exhibitionSponsorshipTierTheme'
import { VerifiedBadge } from '@/shared/components'

const props = defineProps({
  /** Height class (e.g. h-[320px] or h-[50vh]) - fluid hero feel */
  heightClass: { type: String, default: 'min-h-[280px] h-[45vh] sm:h-[50vh] max-h-[560px]' },
  /** Use organization logo in card; else use initial letter */
  useLogo: { type: Boolean, default: true },
  /** Auto-advance interval in ms (0 = off). Omit to use admin / public display settings. */
  autoplayMs: { type: Number, default: undefined }
})

const { settings } = useDisplaySettings()
const { premiumSponsorSlides, loading } = useAds()

const effectiveAutoplayMs = computed(() => {
  if (props.autoplayMs !== undefined && props.autoplayMs !== null) return props.autoplayMs
  return settings.sponsorCarouselAutoplayMs
})

const currentIndex = ref(0)
let autoplayTimer = null

const slides = computed(() => premiumSponsorSlides.value)

const slideMediaIndexes = ref({})

const isVideoUrl = (url = '') => /\.(mp4|mov|avi|webm|mkv)(\?|$)/i.test(String(url))

function getMediaItemsForSlide(slide) {
  if (!slide) return []
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

  if (Array.isArray(slide.mediaItems)) {
    slide.mediaItems.forEach(item => addMedia(item?.url, item?.mediaKind))
  }
  addMedia(slide.videoUrl, 'VIDEO')
  addMedia(slide.imageUrl, 'IMAGE')
  
  return list.sort((a, b) => {
    if (a.isVideo && !b.isVideo) return -1
    if (!a.isVideo && b.isVideo) return 1
    return 0
  })
}

const slidesMediaMap = computed(() => {
  return slides.value.map(slide => getMediaItemsForSlide(slide))
})

function getSlideActiveMedia(index) {
  const items = slidesMediaMap.value[index]
  if (!items || !items.length) return null
  
  const slideId = slides.value[index]?.id
  const mIndex = slideMediaIndexes.value[slideId] || 0
  
  return items[mIndex % items.length] || items[0]
}

function markSlideActive(index) {
  const slideId = slides.value[index]?.id
  if (!slideId) return
  if (slideMediaIndexes.value[slideId] === undefined) {
    slideMediaIndexes.value[slideId] = 0
  } else {
    slideMediaIndexes.value[slideId] += 1
  }
}

const sponsorSlideMediaUrlsForWarmup = computed(() => {
  const urls = []
  for (const s of slides.value) {
    if (s?.logoUrl) urls.push(s.logoUrl)
    const items = getMediaItemsForSlide(s)
    items.forEach(i => urls.push(i.url))
  }
  return urls
})

useMediaWarmup(sponsorSlideMediaUrlsForWarmup)

function slidePoster(slide) {
  return String(slide?.logoUrl || slide?.imageUrl || '').trim()
}

function goTo(index) {
  if (slides.value.length === 0) return
  currentIndex.value = (index + slides.value.length) % slides.value.length
  markSlideActive(currentIndex.value)
  resetAutoplay()
}

function next() {
  goTo(currentIndex.value + 1)
}

function prev() {
  goTo(currentIndex.value - 1)
}

function tierBadgeClass(slide) {
  const theme = getTierModalTheme(slide?.sponsorshipType)
  return [
    'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 sm:rounded-md sm:px-3 sm:py-1',
    'text-[9px] sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider md:tracking-[0.12em]',
    theme.hintChip
  ].join(' ')
}

function resetAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
  if (effectiveAutoplayMs.value > 0 && slides.value.length > 1) {
    autoplayTimer = setInterval(next, effectiveAutoplayMs.value)
  }
}

watch(slides, (val) => {
  if (val.length > 0 && currentIndex.value >= val.length) currentIndex.value = 0
  if (val.length > 0) {
    const slideId = val[currentIndex.value]?.id
    if (slideId && slideMediaIndexes.value[slideId] === undefined) {
      slideMediaIndexes.value[slideId] = 0
    }
  }
  resetAutoplay()
}, { immediate: true })

watch(effectiveAutoplayMs, () => resetAutoplay())

onUnmounted(() => {
  if (autoplayTimer) clearInterval(autoplayTimer)
})
</script>

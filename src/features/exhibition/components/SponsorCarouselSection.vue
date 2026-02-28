<template>
  <section class="relative flex w-full flex-col bg-black overflow-hidden m-0">
    <!-- Carousel area -->
    <div class="relative w-full overflow-hidden flex-shrink-0" :class="heightClass">
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
          <!-- Video or image background -->
          <div class="absolute inset-0 z-0">
            <video
              v-if="slide.videoUrl"
              :src="slide.videoUrl"
              autoplay
              muted
              loop
              playsinline
              class="w-full h-full object-cover"
            />
            <img
              v-else-if="slide.imageUrl"
              :src="slide.imageUrl"
              :alt="slide.realEstateCompanyName || slide.title"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900"
            />
            <div class="absolute inset-0 bg-black/60" />
          </div>

          <!-- Content overlay: logo/name/address -->
          <div class="relative z-10 flex h-full items-center justify-center px-6 sm:px-10">
            <div class="max-w-2xl text-center">
              <!-- Logo or initial -->
              <div
                v-if="slide.imageUrl && useLogo"
                class="mx-auto mb-4 h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center"
              >
                <img
                  :src="slide.imageUrl"
                  :alt="slide.realEstateCompanyName || slide.title"
                  class="h-full w-full object-contain"
                />
              </div>
              <div
                v-else
                class="mx-auto mb-4 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/20 text-2xl sm:text-3xl font-bold text-white"
              >
                {{ (slide.realEstateCompanyName || slide.title).charAt(0).toUpperCase() }}
              </div>
              <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                {{ slide.realEstateCompanyName || slide.title }}
              </h3>
              <p v-if="slide.address" class="mt-2 text-sm sm:text-base text-white/90">
                {{ slide.address }}{{ slide.city ? `, ${slide.city}` : '' }}
              </p>
              <p v-else-if="slide.city" class="mt-2 text-sm sm:text-base text-white/90">
                {{ slide.city }}
              </p>
              <span
                class="mt-3 inline-block rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                :class="tierBadgeClass(slide)"
              >
                {{ slide.sponsorshipType || $t('exhibition.sponsorCarousel.sponsor') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Arrows - subtle, fluid -->
      <template v-if="slides.length > 1">
        <button
          type="button"
          class="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/50 sm:left-6"
          aria-label="Previous"
          @click="prev"
        >
          <ChevronLeftIcon class="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          type="button"
          class="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/50 sm:right-6"
          aria-label="Next"
          @click="next"
        >
          <ChevronRightIcon class="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </template>
    </template>
    </div>

    <!-- Sponsor list at bottom: overlaps carousel with blur mix (no solid line) -->
    <div
      v-if="slides.length > 0"
      class="sponsor-strip relative z-10 -mt-16 flex-shrink-0 py-4 pt-8 px-4 backdrop-blur-md bg-gradient-to-b from-transparent via-black/50 to-black/90"
    >
      <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id + (slide.realEstateCompanyId || '') + index"
          type="button"
          class="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-400 border border-transparent"
          :class="currentIndex === index ? 'ring-2 ring-white scale-110' : ''"
          :aria-label="(slide.realEstateCompanyName || slide.title) + (currentIndex === index ? ' (current)' : '')"
          :title="slide.realEstateCompanyName || slide.title"
          @click="goTo(index)"
        >
          <img
            v-if="slide.imageUrl"
            :src="slide.imageUrl"
            :alt="slide.realEstateCompanyName || slide.title"
            class="h-full w-full object-contain p-0.5"
          />
          <span
            v-else
            class="text-sm sm:text-base font-bold text-white"
          >
            {{ (slide.realEstateCompanyName || slide.title).charAt(0).toUpperCase() }}
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import { useAds } from '@/shared/composables/useAds'

const props = defineProps({
  /** Height class (e.g. h-[320px] or h-[50vh]) - fluid hero feel */
  heightClass: { type: String, default: 'min-h-[280px] h-[45vh] sm:h-[50vh] max-h-[560px]' },
  /** Use first image as logo in circle; else use initial letter */
  useLogo: { type: Boolean, default: true },
  /** Auto-advance interval in ms (0 = off) */
  autoplayMs: { type: Number, default: 5500 }
})

const { loadAllAds, premiumSponsorSlides, loading } = useAds()

const currentIndex = ref(0)
let autoplayTimer = null

const slides = computed(() => premiumSponsorSlides.value)

function goTo(index) {
  if (slides.value.length === 0) return
  currentIndex.value = (index + slides.value.length) % slides.value.length
  resetAutoplay()
}

function next() {
  goTo(currentIndex.value + 1)
}

function prev() {
  goTo(currentIndex.value - 1)
}

function tierBadgeClass(slide) {
  const t = (slide.sponsorshipType || '').toUpperCase()
  if (t.includes('PREMIER') || t.includes('PREMIUM')) return 'bg-amber-500/90 text-black'
  if (t.includes('GOLD')) return 'bg-yellow-600/90 text-white'
  return 'bg-white/20 text-white'
}

function resetAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
  if (props.autoplayMs > 0 && slides.value.length > 1) {
    autoplayTimer = setInterval(next, props.autoplayMs)
  }
}

watch(slides, (val) => {
  if (val.length > 0 && currentIndex.value >= val.length) currentIndex.value = 0
  resetAutoplay()
}, { immediate: true })

onMounted(() => {
  loadAllAds(20).then(resetAutoplay)
})

onUnmounted(() => {
  if (autoplayTimer) clearInterval(autoplayTimer)
})
</script>

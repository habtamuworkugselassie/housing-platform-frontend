<template>
  <section class="relative flex w-full flex-col overflow-hidden m-0 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06),inset_0_-30px_30px_-20px_rgba(255,255,255,0.04)]">
    <!-- Carousel area: inset blur border (visible inside overflow) -->
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
              <template v-if="slide.videoUrl && (index === currentIndex || index === (currentIndex + 1) % slides.length)">
                <video
                  :key="'v-' + index"
                  :src="mediaUrl(slide.videoUrl)"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="metadata"
                  class="w-full h-full object-cover"
                />
              </template>
              <template v-else-if="slide.imageUrl">
                <img
                  :src="mediaUrl(slide.imageUrl)"
                  :alt="slide.realEstateCompanyName || slide.title"
                  :loading="index <= currentIndex + 1 || (currentIndex === slides.length - 1 && index === 0) ? 'eager' : 'lazy'"
                  class="w-full h-full object-cover"
                />
              </template>
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900"
              />
              <!-- Blurred black overlay (not solid) – soft blur + gradient for attractive hero -->
              <div class="absolute inset-0 backdrop-blur-[3px] bg-gradient-to-b from-black/25 via-black/35 to-black/60" aria-hidden="true" />
            </div>

            <!-- Content overlay: previous design, aligned to left -->
            <div class="relative z-10 flex h-full items-center justify-start px-6 sm:px-10">
              <div class="max-w-2xl text-left rounded-2xl bg-black/30 backdrop-blur-md px-8 py-8 sm:px-10 sm:py-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_30px_rgba(255,255,255,0.06),0_20px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.15)]">
                <div
                  v-if="slide.logoUrl && useLogo"
                  class="mb-4 h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),inset_0_0_20px_rgba(255,255,255,0.06)]"
                >
                  <img
                    :src="mediaUrl(slide.logoUrl)"
                    :alt="slide.realEstateCompanyName || slide.title"
                    loading="lazy"
                    class="h-full w-full object-contain"
                  />
                </div>
                <div
                  v-else
                  class="mb-4 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/20 text-2xl sm:text-3xl font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),inset_0_0_20px_rgba(255,255,255,0.06)]"
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

    <!-- Sponsor list at bottom: blurred black transition (no solid), bordered -->
    <div
      v-if="slides.length > 0"
      class="sponsor-strip relative z-10 -mt-16 flex-shrink-0 py-4 pt-8 px-4 backdrop-blur-xl bg-gradient-to-b from-transparent via-black/40 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_25px_40px_-15px_rgba(255,255,255,0.06)]"
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
            v-if="slide.logoUrl"
            :src="mediaUrl(slide.logoUrl)"
            :alt="slide.realEstateCompanyName || slide.title"
            loading="lazy"
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
import { mediaUrl } from '@/shared/api/client'
import { useAds } from '@/shared/composables/useAds'

const props = defineProps({
  /** Height class (e.g. h-[320px] or h-[50vh]) - fluid hero feel */
  heightClass: { type: String, default: 'min-h-[280px] h-[45vh] sm:h-[50vh] max-h-[560px]' },
  /** Use organization logo in card; else use initial letter */
  useLogo: { type: Boolean, default: true },
  /** Auto-advance interval in ms (0 = off) */
  autoplayMs: { type: Number, default: 5500 }
})

const { premiumSponsorSlides, loading } = useAds()

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
  if (t.includes('PREMIUM')) return 'bg-amber-500/90 text-black'
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
  resetAutoplay()
})

onUnmounted(() => {
  if (autoplayTimer) clearInterval(autoplayTimer)
})
</script>

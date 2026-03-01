<template>
  <section
    class="message-carousel relative flex w-full flex-col overflow-hidden bg-zinc-950 m-0 min-h-[300px] sm:min-h-[340px] md:min-h-[380px]"
    :class="heightClass"
  >
    <div class="relative flex-1 min-h-0 w-full overflow-hidden">
      <div
        class="flex h-full will-change-transform"
        :style="{
          transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
          transition: 'transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)'
        }"
      >
        <div
          v-for="(slide, slideIndex) in slides"
          :key="slideIndex"
          class="flex h-full min-h-0 w-full min-w-0 flex-shrink-0 flex-col md:flex-row"
        >
          <!-- Imagery: responsive height on mobile, fixed ratio on desktop -->
          <div
            class="relative h-36 flex-shrink-0 sm:h-40 md:h-full md:min-h-0 md:min-w-[260px] md:w-2/5 lg:h-full lg:min-w-[340px] xl:min-w-[400px]"
            :class="slide.imagePosition === 'right' ? 'md:order-2' : ''"
          >
            <img
              v-if="slide.imageUrl"
              :src="slide.imageUrl"
              :alt="slide.imageAlt"
              class="h-full w-full object-cover object-center"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-zinc-800/80 text-zinc-500"
            >
              <PhotoIcon class="h-12 w-12 sm:h-16 sm:w-16" />
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-transparent to-transparent md:from-zinc-950/60"
              :class="slide.imagePosition === 'right' ? 'from-transparent via-transparent to-zinc-950/60' : ''"
              aria-hidden
            />
          </div>
          <!-- Content: responsive padding, typography, spacing; top-aligned on mobile, centered on desktop -->
          <div
            class="flex min-h-0 min-w-0 flex-1 flex-col justify-start overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 md:justify-center md:overflow-visible md:px-8 md:py-10 lg:px-12 lg:py-12 xl:px-16 xl:py-14"
            :class="slide.imagePosition === 'right' ? 'md:order-1' : ''"
          >
            <div class="max-w-xl">
              <h2 class="text-base font-bold uppercase leading-snug tracking-wider text-white sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
                {{ $t(slide.titleKey) }}
              </h2>
              <p class="mt-2.5 text-sm leading-relaxed text-gray-400 sm:mt-3 sm:text-base md:mt-4 md:leading-6">
                {{ $t(slide.bodyKey) }}
              </p>
              <ul class="mt-2.5 space-y-1.5 text-sm leading-snug text-gray-400 sm:mt-4 sm:space-y-2 sm:text-base md:space-y-2.5">
                <li v-for="(bulletKey, i) in slide.bulletKeys" :key="i" class="flex items-start gap-2 sm:gap-2.5">
                  <span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/80" />
                  <span class="min-w-0">{{ $t(bulletKey) }}</span>
                </li>
              </ul>
              <a
                :href="slide.ctaHref"
                class="mt-4 inline-flex w-fit flex-shrink-0 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 sm:mt-6 sm:px-5 sm:py-3 sm:text-sm md:mt-8 md:px-6"
              >
                {{ $t(slide.ctaKey) }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dots: responsive padding -->
    <div class="flex flex-shrink-0 justify-center py-3 sm:py-4">
      <div class="flex items-center gap-2">
        <button
          v-for="(_, index) in slides.length"
          :key="index"
          type="button"
          class="h-2 w-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          :class="currentIndex === index ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'"
          :aria-label="`Slide ${index + 1}`"
          @click="currentIndex = index"
        />
      </div>
    </div>

    <!-- Arrows - subtle, match sponsor carousel -->
    <button
      type="button"
      class="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/50 sm:left-6"
      aria-label="Previous"
      @click="prev"
    >
      <ChevronLeftIcon class="h-5 w-5" />
    </button>
    <button
      type="button"
      class="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/50 sm:right-6"
      aria-label="Next"
      @click="next"
    >
      <ChevronRightIcon class="h-5 w-5" />
    </button>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  heightClass: { type: String, default: 'min-h-[260px] h-[38vh] sm:h-[42vh] max-h-[480px]' },
  autoplayMs: { type: Number, default: 6000 }
})

// Slide config: imagery + i18n keys. Replace imageUrl with your own assets (e.g. /img/why-exhibit.jpg).
const slides = [
  {
    titleKey: 'exhibition.whyExhibit.title',
    bodyKey: 'exhibition.whyExhibit.body',
    bulletKeys: ['exhibition.whyExhibit.bullet1', 'exhibition.whyExhibit.bullet2', 'exhibition.whyExhibit.bullet3'],
    ctaKey: 'exhibition.whyExhibit.bookStand',
    ctaHref: '#register',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178bf58e770f?w=800&q=80',
    imageAlt: 'Exhibition hall',
    imagePosition: 'left'
  },
  {
    titleKey: 'exhibition.whyVisit.title',
    bodyKey: 'exhibition.whyVisit.body',
    bulletKeys: ['exhibition.whyVisit.bullet1', 'exhibition.whyVisit.bullet2', 'exhibition.whyVisit.bullet3'],
    ctaKey: 'exhibition.whyVisit.registerToVisit',
    ctaHref: '#register',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    imageAlt: 'Real estate and future of living',
    imagePosition: 'right'
  }
]

const currentIndex = ref(0)
let autoplayTimer = null

function next() {
  currentIndex.value = (currentIndex.value + 1) % slides.length
  resetAutoplay()
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length
  resetAutoplay()
}

function resetAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
  if (props.autoplayMs > 0) autoplayTimer = setInterval(next, props.autoplayMs)
}

onMounted(resetAutoplay)
onUnmounted(() => {
  if (autoplayTimer) clearInterval(autoplayTimer)
})
</script>

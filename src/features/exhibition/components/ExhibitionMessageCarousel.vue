<template>
  <section
    class="message-carousel relative flex w-full flex-col overflow-hidden bg-zinc-950 m-0"
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
          class="flex h-full w-full flex-shrink-0 flex-col md:flex-row"
        >
          <!-- Imagery - full bleed -->
          <div
            class="relative h-48 flex-shrink-0 md:h-full md:min-w-[300px] md:w-2/5 lg:min-w-[380px]"
            :class="slide.imagePosition === 'right' ? 'md:order-2' : ''"
          >
            <img
              v-if="slide.imageUrl"
              :src="slide.imageUrl"
              :alt="slide.imageAlt"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-zinc-800/80 text-zinc-500"
            >
              <PhotoIcon class="h-16 w-16" />
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-transparent to-transparent md:from-zinc-950/60"
              :class="slide.imagePosition === 'right' ? 'from-transparent via-transparent to-zinc-950/60' : ''"
              aria-hidden
            />
          </div>
          <!-- Content -->
          <div
            class="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-14 lg:px-16"
            :class="slide.imagePosition === 'right' ? 'md:order-1' : ''"
          >
            <h2 class="text-xl font-bold uppercase tracking-wider text-white sm:text-2xl md:text-3xl">
              {{ $t(slide.titleKey) }}
            </h2>
            <p class="mt-4 text-sm leading-relaxed text-gray-400 sm:text-base">
              {{ $t(slide.bodyKey) }}
            </p>
            <ul class="mt-5 space-y-2.5 text-sm text-gray-400 sm:text-base">
              <li v-for="(bulletKey, i) in slide.bulletKeys" :key="i" class="flex items-start gap-3">
                <span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/80" />
                <span>{{ $t(bulletKey) }}</span>
              </li>
            </ul>
            <a
              :href="slide.ctaHref"
              class="mt-8 inline-flex w-fit bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {{ $t(slide.ctaKey) }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Dots - minimal, fluid -->
    <div class="flex flex-shrink-0 justify-center py-4">
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

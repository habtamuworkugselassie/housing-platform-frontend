<template>
  <!-- "Why exhibit / why visit" stories: one rounded brand-violet panel in the same rhythm as the
       CTA band. The image lives in its own rounded tile, and the arrows sit in a control row with
       the dots so they never cover the copy (they used to float over the headline on phones). -->
  <section class="message-carousel bg-violet-50 px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
    <div
      v-reveal
      class="on-dark relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-primary-900 text-white"
    >
      <div class="dots-bg absolute inset-0 opacity-20" aria-hidden="true" />
      <div class="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/25 blur-3xl" aria-hidden="true" />
      <div class="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

      <div class="relative overflow-hidden">
        <div
          class="flex will-change-transform"
          :style="{
            transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
            transition: 'transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)'
          }"
        >
          <article
            v-for="(slide, slideIndex) in slides"
            :key="slideIndex"
            class="grid w-full min-w-0 flex-shrink-0 gap-6 p-5 sm:p-8 md:grid-cols-2 md:items-center lg:gap-12 lg:p-12"
            :aria-hidden="currentIndex !== slideIndex"
          >
            <!-- Imagery tile -->
            <div
              class="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-white/15 md:aspect-[4/3] lg:aspect-[5/4]"
              :class="slide.imagePosition === 'right' ? 'md:order-2' : ''"
            >
              <img
                v-if="slide.imageUrl"
                :src="slide.imageUrl"
                :alt="slide.imageAlt"
                loading="lazy"
                class="h-full w-full object-cover object-center"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-white/10 text-white/50">
                <PhotoIcon class="h-12 w-12 sm:h-16 sm:w-16" />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-transparent to-transparent" aria-hidden="true" />
              <span
                class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-primary-950/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md ring-1 ring-white/20"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                {{ $t(slide.tagKey) }}
              </span>
            </div>

            <!-- Copy -->
            <div class="min-w-0" :class="slide.imagePosition === 'right' ? 'md:order-1' : ''">
              <h2 class="text-2xl font-extrabold leading-[1.08] tracking-tight sm:text-3xl lg:text-4xl xl:text-[2.75rem]">
                {{ $t(slide.titleKey) }}
              </h2>
              <p class="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                {{ $t(slide.bodyKey) }}
              </p>
              <ul class="mt-5 space-y-2.5 text-sm text-white/90 sm:text-base">
                <li v-for="(bulletKey, i) in slide.bulletKeys" :key="i" class="flex items-start gap-3">
                  <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-400 text-primary-950" aria-hidden="true">
                    <CheckIcon class="h-3 w-3" />
                  </span>
                  <span class="min-w-0">{{ $t(bulletKey) }}</span>
                </li>
              </ul>
              <a
                :href="slide.ctaHref"
                class="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-bold text-primary-950 shadow-lg shadow-gold-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300/70"
              >
                {{ $t(slide.ctaKey) }}
                <ArrowRightIcon class="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </div>

      <!-- Controls: arrows and dots in their own row, never over the copy -->
      <div class="relative flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4 sm:px-8 lg:px-12">
        <div class="flex items-center gap-1">
          <button
            v-for="(_, index) in slides.length"
            :key="index"
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            :aria-label="`Slide ${index + 1}`"
            :aria-current="currentIndex === index ? 'true' : undefined"
            @click="goTo(index)"
          >
            <span
              class="h-2 rounded-full transition-all duration-300"
              :class="currentIndex === index ? 'w-7 bg-gold-400' : 'w-2 bg-white/40 hover:bg-white/70'"
            />
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:border-gold-400/60 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            aria-label="Previous"
            @click="prev"
          >
            <ChevronLeftIcon class="h-5 w-5" />
          </button>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:border-gold-400/60 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            aria-label="Next"
            @click="next"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, PhotoIcon, CheckIcon, ArrowRightIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  autoplayMs: { type: Number, default: 6000 }
})

// Slide config: imagery + i18n keys. Local assets: the Unsplash hot-links this used to carry
// broke in production (the first slide rendered its alt text), and a third party can remove
// a photo at any time.
const slides = [
  {
    tagKey: 'nav.whyExhibit',
    titleKey: 'exhibition.whyExhibit.title',
    bodyKey: 'exhibition.whyExhibit.body',
    bulletKeys: ['exhibition.whyExhibit.bullet1', 'exhibition.whyExhibit.bullet2', 'exhibition.whyExhibit.bullet3'],
    ctaKey: 'exhibition.whyExhibit.bookStand',
    ctaHref: '#register',
    imageUrl: '/images/exhibition/sectors/construction-tools.jpg',
    imageAlt: 'Tools laid out on a workbench',
    imagePosition: 'left'
  },
  {
    tagKey: 'nav.whyVisit',
    titleKey: 'exhibition.whyVisit.title',
    bodyKey: 'exhibition.whyVisit.body',
    bulletKeys: ['exhibition.whyVisit.bullet1', 'exhibition.whyVisit.bullet2', 'exhibition.whyVisit.bullet3'],
    ctaKey: 'exhibition.whyVisit.registerToVisit',
    ctaHref: '#register',
    imageUrl: '/images/exhibition/sectors/intelligent-building.jpg',
    imageAlt: 'Real estate and future of living',
    imagePosition: 'right'
  }
]

const currentIndex = ref(0)
let autoplayTimer = null

function goTo(index) {
  currentIndex.value = index
  resetAutoplay()
}

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

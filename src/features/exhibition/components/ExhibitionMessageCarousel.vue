<template>
  <!-- "Why exhibit / why visit" stories: one rounded brand-violet panel in the same rhythm as the
       CTA band. A segmented toggle picks the story (no hidden dots), the photo carries two
       floating stat cards, and the panel answers swipes and arrow keys. Autoplay shows its
       progress in the gold bar and pauses while the pointer or focus is inside. -->
  <section class="message-carousel bg-violet-50 px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
    <div
      v-reveal
      class="on-dark relative mx-auto max-w-7xl overflow-clip rounded-[1.75rem] bg-primary-900 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      role="region"
      aria-roledescription="carousel"
      :aria-label="$t('exhibition.stories.toggleLabel')"
      tabindex="0"
      @keydown.left.prevent="prev"
      @keydown.right.prevent="next"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
      @focusin="paused = true"
      @focusout="paused = false"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="dots-bg absolute inset-0 opacity-20" aria-hidden="true" />
      <div class="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/25 blur-3xl" aria-hidden="true" />
      <div class="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

      <!-- Story toggle -->
      <div class="relative flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-8 lg:px-12 lg:pt-10">
        <div
          class="inline-flex w-full rounded-full bg-white/10 p-1 ring-1 ring-white/15 sm:w-auto"
          role="tablist"
          :aria-label="$t('exhibition.stories.toggleLabel')"
        >
          <button
            v-for="(slide, index) in slides"
            :key="slide.tagKey"
            type="button"
            role="tab"
            class="flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 sm:px-5"
            :class="currentIndex === index ? 'bg-gold-400 text-primary-950 shadow-md' : 'text-white/80 hover:text-white'"
            :aria-selected="currentIndex === index"
            @click="goTo(index)"
          >
            {{ $t(slide.tagKey) }}
          </button>
        </div>
        <div class="hidden items-center gap-2 sm:flex">
          <button type="button" :class="arrowClass" aria-label="Previous" @click="prev">
            <ChevronLeftIcon class="h-5 w-5" />
          </button>
          <button type="button" :class="arrowClass" aria-label="Next" @click="next">
            <ChevronRightIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Slides -->
      <div class="relative overflow-clip">
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
            class="grid w-full min-w-0 flex-shrink-0 grid-cols-1 gap-6 p-5 sm:p-8 md:grid-cols-2 md:items-center lg:gap-12 lg:p-12"
            :aria-hidden="currentIndex !== slideIndex"
            :inert="currentIndex !== slideIndex"
          >
            <!-- Imagery tile with floating stat cards -->
            <div
              class="relative w-full min-w-0 aspect-[16/11] md:aspect-[4/3] lg:aspect-[5/4]"
              :class="slide.imagePosition === 'right' ? 'md:order-2' : ''"
            >
              <div class="absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-white/15">
                <img
                  v-if="slide.imageUrl"
                  :src="slide.imageUrl"
                  :alt="slide.imageAlt"
                  loading="lazy"
                  class="h-full w-full object-cover object-center transition-transform duration-[1200ms] ease-out"
                  :class="currentIndex === slideIndex ? 'scale-100' : 'scale-105'"
                />
                <div v-else class="flex h-full w-full items-center justify-center bg-white/10 text-white/50">
                  <PhotoIcon class="h-12 w-12 sm:h-16 sm:w-16" />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-950/10 to-transparent" aria-hidden="true" />
              </div>

              <div
                v-for="(stat, i) in slide.stats"
                :key="stat.valueKey"
                class="absolute flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2 text-primary-950 shadow-[0_18px_40px_-20px_rgba(46,16,101,0.6)] sm:gap-3 sm:px-4 sm:py-3"
                :class="[i === 0 ? 'float -left-2 bottom-5 sm:-left-4 sm:bottom-8' : 'float--slow float -right-2 top-5 sm:-right-4 sm:top-8']"
              >
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-primary-950 sm:h-9 sm:w-9" aria-hidden="true">
                  <component :is="stat.icon" class="h-4 w-4" />
                </span>
                <span class="leading-tight">
                  <span class="block text-base font-extrabold sm:text-lg">{{ $t(stat.valueKey) }}</span>
                  <span class="block text-[10px] font-semibold uppercase tracking-wider text-primary-700 sm:text-[11px]">{{ $t(stat.labelKey) }}</span>
                </span>
              </div>
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

      <!-- Phone controls + autoplay progress -->
      <div class="relative flex items-center justify-between gap-4 px-5 pb-5 sm:hidden">
        <span class="text-xs font-semibold text-white/60">{{ currentIndex + 1 }} / {{ slides.length }}</span>
        <div class="flex items-center gap-2">
          <button type="button" :class="arrowClass" aria-label="Previous" @click="prev">
            <ChevronLeftIcon class="h-5 w-5" />
          </button>
          <button type="button" :class="arrowClass" aria-label="Next" @click="next">
            <ChevronRightIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
      <div class="relative h-1 w-full bg-white/10" aria-hidden="true">
        <div
          class="h-full bg-gold-400"
          :style="{ width: `${progress}%`, transition: progress === 0 ? 'none' : 'width 120ms linear' }"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  CheckIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  MicrophoneIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  autoplayMs: { type: Number, default: 7000 }
})

const arrowClass =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:border-gold-400/60 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60'

// Slide config: imagery + i18n keys. Photos are local (public/images/exhibition/CREDITS.md) so a
// third party cannot break the page by removing or moving them.
const slides = [
  {
    tagKey: 'nav.whyExhibit',
    titleKey: 'exhibition.whyExhibit.title',
    bodyKey: 'exhibition.whyExhibit.body',
    bulletKeys: ['exhibition.whyExhibit.bullet1', 'exhibition.whyExhibit.bullet2', 'exhibition.whyExhibit.bullet3'],
    ctaKey: 'exhibition.whyExhibit.bookStand',
    ctaHref: '#register',
    imageUrl: '/images/exhibition/stories/why-exhibit.jpg',
    imageAlt: 'A speaker presenting to a full hall at an industry event',
    imagePosition: 'left',
    stats: [
      { icon: BuildingStorefrontIcon, valueKey: 'exhibition.stories.statExhibitors', labelKey: 'exhibition.stories.statExhibitorsLabel' },
      { icon: CalendarDaysIcon, valueKey: 'exhibition.hero.statDays', labelKey: 'exhibition.hero.statDaysNote' }
    ]
  },
  {
    tagKey: 'nav.whyVisit',
    titleKey: 'exhibition.whyVisit.title',
    bodyKey: 'exhibition.whyVisit.body',
    bulletKeys: ['exhibition.whyVisit.bullet1', 'exhibition.whyVisit.bullet2', 'exhibition.whyVisit.bullet3'],
    ctaKey: 'exhibition.whyVisit.registerToVisit',
    ctaHref: '#register',
    imageUrl: '/images/exhibition/stories/why-visit.jpg',
    imageAlt: 'Visitors seated in a conference auditorium',
    imagePosition: 'right',
    stats: [
      { icon: MicrophoneIcon, valueKey: 'exhibition.stories.statSpeakers', labelKey: 'exhibition.stories.statSpeakersLabel' },
      { icon: Squares2X2Icon, valueKey: 'exhibition.stories.statStages', labelKey: 'exhibition.stories.statStagesLabel' }
    ]
  }
]

const currentIndex = ref(0)
const paused = ref(false)
const progress = ref(0)
let ticker = null
let elapsed = 0
const TICK_MS = 120
let touchStartX = null

function goTo(index) {
  currentIndex.value = (index + slides.length) % slides.length
  restart()
}
function next() {
  goTo(currentIndex.value + 1)
}
function prev() {
  goTo(currentIndex.value - 1)
}

function onTouchStart(e) {
  touchStartX = e.changedTouches[0]?.clientX ?? null
}
function onTouchEnd(e) {
  if (touchStartX === null) return
  const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
  touchStartX = null
  if (Math.abs(dx) < 40) return
  dx < 0 ? next() : prev()
}

// Autoplay ticks so the progress bar can show how long until the next story; it stands still
// while the pointer or focus is inside the panel, and under prefers-reduced-motion it stays off.
function restart() {
  elapsed = 0
  progress.value = 0
  if (ticker) clearInterval(ticker)
  if (props.autoplayMs <= 0) return
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  ticker = setInterval(() => {
    if (paused.value) return
    elapsed += TICK_MS
    progress.value = Math.min(100, (elapsed / props.autoplayMs) * 100)
    if (elapsed >= props.autoplayMs) next()
  }, TICK_MS)
}

onMounted(restart)
onUnmounted(() => {
  if (ticker) clearInterval(ticker)
})
</script>

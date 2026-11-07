<template>
  <section class="landing-hero relative overflow-hidden border-b border-gray-200 bg-white" aria-label="Ethio Build Connect Exhibition">
    <!-- Quiet grid behind the hero, fading out towards the edges. -->
    <div class="grid-bg landing-hero__grid absolute inset-0" aria-hidden="true" />

    <div class="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
      <div class="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <!-- Copy -->
        <div class="landing-hero__copy max-w-2xl">
          <p class="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700">
            <span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
            {{ $t('exhibition.hero.eventName') }}
          </p>

          <h1 class="mt-6 text-[2.5rem] font-extrabold leading-[1.04] tracking-tight text-gray-900 sm:text-5xl lg:text-[4.25rem]">
            {{ headline.lead }}
            <span class="swash text-primary-700">
              {{ headline.accent }}
              <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M6 16 C 60 6, 120 4, 180 10 S 270 20, 294 12" />
              </svg>
            </span>
          </h1>

          <!-- The dates and venue stay visible here: the ExhibitionEvent rich result is
               held to agreeing with the page, so they must be on it, not only in markup. -->
          <p class="mt-6 inline-flex max-w-full items-center gap-2 rounded-xl bg-primary-50 px-3.5 py-2 text-sm font-semibold text-primary-800">
            <svg class="h-4 w-4 shrink-0 text-primary-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" /></svg>
            <span>{{ $t('exhibition.hero.dateVenue') }}</span>
          </p>
          <ExpoCountdown />

          <p class="mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            {{ $t('exhibition.hero.subtitle') }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <router-link
              :to="{ path: '/', query: { interest: 'exhibitor' }, hash: '#register' }"
              class="group inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3.5 text-sm font-bold text-primary-950 shadow-[0_12px_28px_-12px_rgba(217,159,63,0.8)] transition-all hover:bg-gold-300 hover:shadow-[0_16px_32px_-12px_rgba(217,159,63,0.9)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
            >
              {{ $t('exhibition.hero.registerInterest') }}
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 6l6 6-6 6M5 12h14" /></svg>
            </router-link>
            <a
              href="#brochure"
              class="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition-colors hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              {{ $t('exhibition.hero.downloadBrochure') }}
            </a>
          </div>

          <!-- Three facts, divided like a ruler. -->
          <dl class="mt-10 grid max-w-xl grid-cols-3 gap-4 text-sm text-gray-500 sm:gap-7">
            <div v-for="(stat, i) in stats" :key="stat.value" :class="i > 0 ? 'border-l border-gray-200 pl-4 sm:pl-7' : ''">
              <dt class="sr-only">{{ stat.note }}</dt>
              <dd class="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">{{ stat.value }}</dd>
              <dd class="mt-0.5 text-xs sm:text-sm">{{ stat.note }}</dd>
            </div>
          </dl>
        </div>

        <!-- Visual: the expo floor -->
        <div class="landing-hero__visual relative mx-auto w-full max-w-md lg:max-w-none">
          <div class="on-dark dots-bg relative aspect-[5/6] overflow-hidden rounded-[2rem] bg-primary-900 text-white shadow-[0_30px_80px_-30px_rgba(46,16,101,0.6)]">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(244,201,119,0.22),transparent_38%),radial-gradient(circle_at_20%_90%,rgba(255,255,255,0.1),transparent_40%)]" aria-hidden="true" />

            <!-- Hall plan with the visitor route from the entrance to the main stage -->
            <svg class="absolute inset-0 h-full w-full" viewBox="0 0 480 576" fill="none" aria-hidden="true">
              <g class="landing-hero__halls" stroke="rgba(255,255,255,0.14)" fill="rgba(255,255,255,0.06)">
                <rect x="56" y="88" width="132" height="92" rx="14" />
                <rect x="212" y="88" width="212" height="92" rx="14" />
                <rect x="56" y="206" width="212" height="112" rx="14" />
                <rect x="296" y="206" width="128" height="112" rx="14" />
                <rect x="56" y="344" width="110" height="96" rx="14" />
                <rect x="190" y="344" width="234" height="96" rx="14" />
              </g>
              <g class="landing-hero__stands" fill="rgba(255,255,255,0.12)">
                <rect x="80" y="112" width="22" height="22" rx="5" /><rect x="112" y="112" width="22" height="22" rx="5" /><rect x="144" y="112" width="22" height="22" rx="5" />
                <rect x="236" y="112" width="22" height="22" rx="5" /><rect x="268" y="112" width="22" height="22" rx="5" /><rect x="300" y="112" width="22" height="22" rx="5" /><rect x="332" y="112" width="22" height="22" rx="5" /><rect x="364" y="112" width="22" height="22" rx="5" />
                <rect x="80" y="368" width="22" height="22" rx="5" /><rect x="112" y="368" width="22" height="22" rx="5" />
                <rect x="320" y="230" width="22" height="22" rx="5" /><rect x="352" y="230" width="22" height="22" rx="5" /><rect x="384" y="230" width="22" height="22" rx="5" />
                <rect x="214" y="368" width="22" height="22" rx="5" /><rect x="246" y="368" width="22" height="22" rx="5" /><rect x="278" y="368" width="22" height="22" rx="5" /><rect x="310" y="368" width="22" height="22" rx="5" />
              </g>
              <!-- route -->
              <path class="landing-hero__route-glow" d="M78 500 C 150 500, 140 262, 240 262 S 350 300, 332 190 S 380 120, 408 120" stroke="rgba(244,201,119,0.28)" stroke-width="16" stroke-linecap="round" />
              <path class="landing-hero__route" d="M78 500 C 150 500, 140 262, 240 262 S 350 300, 332 190 S 380 120, 408 120" stroke="#f4c977" stroke-width="5" stroke-linecap="round" stroke-dasharray="14 12" />
              <!-- entrance -->
              <circle cx="78" cy="500" r="18" fill="#ffffff" />
              <path d="M72 494h12v12H72z M78 494v12" stroke="#4c1d95" stroke-width="2" stroke-linejoin="round" />
              <!-- main stage -->
              <circle cx="408" cy="120" r="30" fill="rgba(244,201,119,0.25)" class="landing-hero__pulse" />
              <circle cx="408" cy="120" r="19" fill="#f4c977" />
              <path d="M408 110l3 6.3 7 .9-5.1 4.8 1.3 6.9-6.2-3.4-6.2 3.4 1.3-6.9-5.1-4.8 7-.9z" fill="#2e1065" />
            </svg>

            <span class="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <span class="h-1.5 w-1.5 rounded-full bg-gold-400 motion-safe:animate-pulse" aria-hidden="true" />
              {{ $t('exhibition.hero.panelLabel') }}
            </span>
            <span class="float absolute left-[48%] top-[42%] -translate-x-1/2 rounded-xl border border-white/15 bg-primary-950/80 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur">
              {{ $t('exhibition.hero.panelStage') }}
            </span>
            <span class="absolute bottom-[8%] left-[27%] rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
              {{ $t('exhibition.hero.panelEntrance') }}
            </span>
          </div>

          <!-- Floating fact cards (desktop); the same facts sit in the copy on small screens. -->
          <div class="float--slow float absolute -right-4 -top-6 z-10 hidden rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xl sm:block">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" /></svg>
              </span>
              <div>
                <p class="text-[11px] font-medium text-gray-500">{{ $t('exhibition.hero.datesLabel') }}</p>
                <p class="text-sm font-bold text-gray-900">{{ $t('exhibition.hero.datesValue') }}</p>
              </div>
            </div>
          </div>
          <div class="float absolute -bottom-6 -left-4 z-10 hidden rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xl sm:block">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-6.3 7-11.5A7 7 0 005 9.5C5 14.7 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              </span>
              <div>
                <p class="text-[11px] font-medium text-gray-500">{{ $t('exhibition.hero.venueLabel') }}</p>
                <p class="text-sm font-bold text-gray-900">{{ $t('exhibition.hero.venueValue') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Take part: the three ways in, each deep-linking to the form with its interest set. -->
      <div class="mt-14 lg:mt-20">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm font-bold uppercase tracking-[0.12em] text-gray-900">{{ $t('home.expoCardTitle') }}</p>
          <span class="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-700">{{ $t('exhibition.planning.badge') }}</span>
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-3">
          <router-link
            v-for="(opt, i) in options"
            :key="opt.key"
            :to="{ path: '/', query: { interest: opt.interest }, hash: '#register' }"
            class="hover-lift group relative flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 hover:border-primary-300"
          >
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors group-hover:bg-gold-100 group-hover:text-gold-800">
              <component :is="opt.icon" class="h-6 w-6" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2">
                <strong class="text-base font-bold text-gray-900">{{ $t(opt.titleKey) }}</strong>
                <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">0{{ i + 1 }}</span>
              </span>
              <span class="mt-0.5 block text-sm leading-snug text-gray-600">{{ $t(opt.hintKey) }}</span>
            </span>
            <svg class="h-5 w-5 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" /></svg>
          </router-link>
        </div>
        <router-link to="/properties" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-900 hover:underline">
          {{ $t('home.expoMarketplaceLink') }} →
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { BuildingStorefrontIcon, TicketIcon, StarIcon } from '@heroicons/vue/24/outline'
import ExpoCountdown from '@/features/exhibition/components/ExpoCountdown.vue'
import { getSponsoredOrganizations } from '@/features/exhibition/api/exhibition.api'
import { splitHeadline } from '@/shared/utils/headline'

const { t } = useI18n()
const companyCount = ref(null)

const headline = computed(() => splitHeadline(t('home.expoHeadline')))

const options = [
  { key: 'exhibit', interest: 'exhibitor', icon: BuildingStorefrontIcon, titleKey: 'home.expoExhibit', hintKey: 'home.expoExhibitHint' },
  { key: 'visit', interest: 'visitor', icon: TicketIcon, titleKey: 'home.expoVisit', hintKey: 'home.expoVisitHint' },
  { key: 'sponsor', interest: 'partner', icon: StarIcon, titleKey: 'home.expoSponsor', hintKey: 'home.expoSponsorHint' },
]

const stats = computed(() => {
  const list = [
    { value: t('exhibition.hero.statDays'), note: t('exhibition.hero.statDaysNote') },
    { value: t('exhibition.hero.statVenue'), note: t('exhibition.hero.statVenueNote') },
  ]
  if (companyCount.value != null && companyCount.value > 0) {
    list.push({ value: formatNumber(companyCount.value), note: t('home.partnerCompanies') })
  } else {
    list.push({ value: t('exhibition.hero.statOpen'), note: t('home.expoRegistrationsOpen') })
  }
  return list
})

function formatNumber(n) {
  try { return Number(n).toLocaleString() } catch { return String(n) }
}

onMounted(async () => {
  try {
    const orgs = await getSponsoredOrganizations()
    if (Array.isArray(orgs)) companyCount.value = orgs.length
  } catch { /* the third stat falls back to "registrations open" */ }
})
</script>

<style scoped>
.landing-hero__grid {
  -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000 35%, transparent 78%);
  mask-image: radial-gradient(ellipse at 50% 40%, #000 35%, transparent 78%);
}
@media (prefers-reduced-motion: no-preference) {
  .landing-hero__route { animation: ebc-route 2.4s linear infinite; }
  @keyframes ebc-route { to { stroke-dashoffset: -52; } }
  .landing-hero__pulse { transform-origin: 408px 120px; animation: ebc-pulse 2.6s ease-out infinite; }
  @keyframes ebc-pulse {
    0% { transform: scale(0.6); opacity: 0.9; }
    100% { transform: scale(1.6); opacity: 0; }
  }
}
</style>

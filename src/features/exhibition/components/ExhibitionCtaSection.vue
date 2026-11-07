<template>
  <!-- The "get involved" band: one rounded brand-violet panel with a dotted texture and two
       soft glows, and inside it the two ways in — exhibit/sponsor, or visit. on-dark keeps
       the light theme from recolouring the white text (styles/light-app.css). -->
  <section id="get-involved" class="scroll-mt-24 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
    <div
      v-reveal
      class="on-dark relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-primary-900 px-5 py-12 text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20"
    >
      <div class="dots-bg absolute inset-0 opacity-20" aria-hidden="true" />
      <div class="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-gold-400/30 blur-3xl" aria-hidden="true" />
      <div class="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

      <div class="relative">
        <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
          <span class="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
          {{ $t('exhibition.cta.eyebrow') }}
        </span>
        <h2 class="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
          {{ $t('exhibition.cta.title') }}
        </h2>
        <p class="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
          {{ $t('exhibition.cta.body') }}
        </p>

        <div class="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
          <article
            v-for="card in cards"
            :key="card.key"
            class="hover-lift flex flex-col rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm sm:p-7"
          >
            <div class="flex items-start justify-between gap-4">
              <span class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
                {{ $t(card.tagKey) }}
              </span>
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold-300">
                <component :is="card.icon" class="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <h3 class="mt-5 text-xl font-bold sm:text-2xl">{{ $t(card.titleKey) }}</h3>
            <p class="mt-2 flex-1 text-sm leading-relaxed text-white/75 sm:text-[15px]">{{ $t(card.bodyKey) }}</p>
            <div class="mt-6 flex flex-col gap-3 sm:flex-row">
              <router-link
                :to="card.primary.to"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-5 py-3 text-sm font-bold text-primary-950 transition-colors hover:bg-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
              >
                {{ $t(card.primary.labelKey) }}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 6l6 6-6 6M5 12h14" /></svg>
              </router-link>
              <component
                :is="card.secondary.href ? 'a' : 'router-link'"
                v-bind="card.secondary.href ? { href: card.secondary.href, target: '_blank', rel: 'noopener noreferrer' } : { to: card.secondary.to }"
                class="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {{ $t(card.secondary.labelKey) }}
              </component>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { BuildingStorefrontIcon, TicketIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  /** Print-ready brochure URL for the exhibitor card's second button. */
  brochureHref: { type: String, default: '/docs/ethio-build-connect-expo-2027-brochure.html' },
})

const cards = computed(() => [
  {
    key: 'exhibit',
    icon: BuildingStorefrontIcon,
    tagKey: 'exhibition.cta.exhibitorsTag',
    titleKey: 'exhibition.cta.exhibitorsTitle',
    bodyKey: 'exhibition.cta.exhibitorsBody',
    primary: { labelKey: 'exhibition.cta.standEnquiry', to: { path: '/', query: { interest: 'exhibitor' }, hash: '#register' } },
    secondary: { labelKey: 'exhibition.cta.viewBrochure', href: props.brochureHref },
  },
  {
    key: 'visit',
    icon: TicketIcon,
    tagKey: 'exhibition.cta.visitorsTag',
    titleKey: 'exhibition.planVisit.title',
    bodyKey: 'exhibition.cta.visitorsBody',
    primary: { labelKey: 'exhibition.planVisit.planYourVisit', to: { path: '/', query: { interest: 'visitor' }, hash: '#register' } },
    secondary: { labelKey: 'home.expoMarketplaceLink', to: '/properties' },
  },
])
</script>

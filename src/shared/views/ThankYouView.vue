<template>
  <div class="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-3xl mx-auto">
    <span
      class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-300 ring-1 ring-green-500/40"
      aria-hidden="true"
    >
      <span class="material-icons">check</span>
    </span>

    <p class="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
      {{ $t('thankYou.badge') }}
    </p>
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.06] tracking-tight text-gray-900">
      {{ $t('thankYou.title') }}
    </h1>
    <p class="mt-4 text-sm text-white/80 leading-relaxed">{{ $t('thankYou.body') }}</p>

    <p class="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/15">
      <span class="material-icons !text-[18px] leading-none text-green-800" aria-hidden="true">schedule</span>
      {{ $t('thankYou.responseTime') }}
    </p>

    <h2 class="mt-12 text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
      {{ $t('thankYou.nextTitle') }}
    </h2>
    <ul class="mt-5 space-y-5 text-sm">
      <li v-for="link in links" :key="link.labelKey">
        <router-link
          :to="link.to"
          class="inline-block py-2 -my-1 font-medium text-white underline decoration-white/30 hover:decoration-white"
        >
          {{ $t(link.labelKey) }}
        </router-link>
        <p class="mt-1 text-white/60">{{ $t(link.blurbKey) }}</p>
      </li>
    </ul>

    <p class="mt-12 text-sm text-white/60">
      {{ $t('thankYou.supportLabel') }}
      <a :href="supportMailto" class="inline-block py-2 -my-1 text-white underline hover:no-underline">{{ supportEmail }}</a>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

// A confirmation page is a dead end unless it offers somewhere to go next, so it
// points at what a visitor who just registered is most likely to want.
const links = [
  { to: '/properties', labelKey: 'thankYou.links.properties', blurbKey: 'thankYou.links.propertiesBlurb' },
  {
    to: '/marketplace/real-estate',
    labelKey: 'thankYou.links.marketplace',
    blurbKey: 'thankYou.links.marketplaceBlurb'
  },
  { to: { name: 'Home', hash: '#brochure' }, labelKey: 'thankYou.links.brochure', blurbKey: 'thankYou.links.brochureBlurb' },
  { to: '/', labelKey: 'thankYou.links.home', blurbKey: 'thankYou.links.homeBlurb' }
]

const supportEmail = computed(
  () => import.meta.env.VITE_SUPPORT_EMAIL || 'ethiobuildconnect@gmail.com'
)
const supportMailto = computed(() => `mailto:${supportEmail.value}`)
</script>

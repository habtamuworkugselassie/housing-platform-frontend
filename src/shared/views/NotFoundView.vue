<template>
  <div class="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-3xl mx-auto">
    <p class="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
      {{ $t('pageNotFound.badge') }}
    </p>
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.06] tracking-tight text-gray-900">
      {{ $t('pageNotFound.title') }}
    </h1>
    <p class="mt-4 text-sm text-white/80 leading-relaxed">{{ $t('pageNotFound.body') }}</p>

    <p class="mt-6 text-xs text-white/50 break-all">
      {{ $t('pageNotFound.requestedLabel') }} <span class="font-mono">{{ requestedPath }}</span>
    </p>

    <ul class="mt-10 space-y-5 text-sm">
      <li v-for="link in links" :key="link.labelKey">
        <RouterLink
          :to="link.to"
          class="inline-block py-2 -my-1 font-medium text-white underline decoration-white/30 hover:decoration-white"
        >
          {{ $t(link.labelKey) }}
        </RouterLink>
        <p class="mt-1 text-white/60">{{ $t(link.blurbKey) }}</p>
      </li>
    </ul>

    <p class="mt-12 text-sm text-white/60">
      {{ $t('pageNotFound.supportLabel') }}
      <a :href="supportMailto" class="inline-block py-2 -my-1 text-white underline hover:no-underline">{{ supportEmail }}</a>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

// A 404 is a dead end for crawlers and a wrong turn for people, so the page
// spends its space on the four routes that actually carry the business:
// listings, the marketplace directory, the expo, and the registration form.
const links = [
  { to: '/', labelKey: 'pageNotFound.links.home', blurbKey: 'pageNotFound.links.homeBlurb' },
  { to: '/properties', labelKey: 'pageNotFound.links.properties', blurbKey: 'pageNotFound.links.propertiesBlurb' },
  {
    to: '/marketplace/real-estate',
    labelKey: 'pageNotFound.links.marketplace',
    blurbKey: 'pageNotFound.links.marketplaceBlurb'
  },
  {
    to: { name: 'Home', hash: '#register' },
    labelKey: 'pageNotFound.links.register',
    blurbKey: 'pageNotFound.links.registerBlurb'
  }
]

const route = useRoute()
const requestedPath = computed(() => route.fullPath)

const supportEmail = computed(
  () => import.meta.env.VITE_SUPPORT_EMAIL || 'ethiobuildconnect@gmail.com'
)
const supportMailto = computed(() => `mailto:${supportEmail.value}`)
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-3xl mx-auto">
    <p class="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
      {{ $t('legal.badge') }}
    </p>
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.06] tracking-tight text-gray-900">
      {{ $t('legal.hub.title') }}
    </h1>
    <p class="mt-4 text-sm text-white/80 leading-relaxed">{{ $t('legal.hub.body') }}</p>
    <ul class="mt-8 space-y-4 text-sm">
      <li>
        <RouterLink
          to="/privacy"
          class="font-medium text-white underline decoration-white/30 hover:decoration-white"
        >
          {{ $t('legal.navPrivacy') }}
        </RouterLink>
        <p class="mt-1 text-white/60">{{ $t('legal.hub.privacyBlurb') }}</p>
      </li>
      <li>
        <RouterLink
          to="/terms"
          class="font-medium text-white underline decoration-white/30 hover:decoration-white"
        >
          {{ $t('legal.navTerms') }}
        </RouterLink>
        <p class="mt-1 text-white/60">{{ $t('legal.hub.termsBlurb') }}</p>
      </li>
      <li>
        <RouterLink
          to="/cookies"
          class="font-medium text-white underline decoration-white/30 hover:decoration-white"
        >
          {{ $t('legal.navCookies') }}
        </RouterLink>
        <p class="mt-1 text-white/60">{{ $t('legal.hub.cookiesBlurb') }}</p>
      </li>
    </ul>
    <p class="mt-10 text-sm text-white/60">
      {{ $t('legal.hub.supportLabel') }}
      <a :href="supportMailto" class="inline-block py-2 -my-1 text-white underline hover:no-underline">{{ supportEmail }}</a>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const supportEmail = computed(
  () => import.meta.env.VITE_SUPPORT_EMAIL || 'ethiobuildconnect@gmail.com'
)

const supportMailto = computed(() => `mailto:${supportEmail.value}`)
</script>

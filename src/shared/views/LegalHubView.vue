<template>
  <div class="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-3xl mx-auto">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-2">
      {{ $t('legal.badge') }}
    </p>
    <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
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
    </ul>
    <p class="mt-10 text-sm text-white/60">
      {{ $t('legal.hub.supportLabel') }}
      <a :href="supportMailto" class="text-white underline hover:no-underline">{{ supportEmail }}</a>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const supportEmail = computed(
  () => import.meta.env.VITE_SUPPORT_EMAIL || 'info@ethiobuildconnect.et'
)

const supportMailto = computed(() => `mailto:${supportEmail.value}`)
</script>

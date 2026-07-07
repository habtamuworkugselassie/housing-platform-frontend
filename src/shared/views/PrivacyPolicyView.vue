<template>
  <div class="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-3xl mx-auto">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-2">
      {{ $t('legal.badge') }}
    </p>
    <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
      {{ $t('legal.privacy.title') }}
    </h1>
    <p class="mt-2 text-sm text-white/60">{{ $t('legal.lastUpdated') }}</p>
    <p class="mt-6 text-sm text-white/80 leading-relaxed">{{ $t('legal.operator') }}</p>
    <p class="mt-4 text-sm text-white/80 leading-relaxed">{{ $t('legal.privacy.intro') }}</p>

    <section
      v-for="(block, idx) in sections"
      :key="idx"
      class="mt-10 border-t border-white/10 pt-8"
    >
      <h2 class="text-lg font-semibold text-white">{{ block.heading }}</h2>
      <p class="mt-3 text-sm text-white/75 leading-relaxed whitespace-pre-line">{{ block.body }}</p>
    </section>

    <p class="mt-12 text-sm text-white/60">
      {{ $t('legal.privacy.contactLabel') }}
      <a :href="supportMailto" class="text-white underline hover:no-underline">{{ supportEmail }}</a>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n()

const sections = computed(() => {
  const raw = tm('legal.privacy.sections')
  return Array.isArray(raw) ? raw : []
})

const supportEmail = computed(
  () => import.meta.env.VITE_SUPPORT_EMAIL || 'info@ethiobuildconnect.et'
)

const supportMailto = computed(() => `mailto:${supportEmail.value}`)
</script>

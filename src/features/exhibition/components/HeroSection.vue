<template>
  <section class="relative min-h-screen flex flex-col overflow-hidden bg-black">
    <!-- Background: image with optional video placeholder -->
    <div class="absolute inset-0 z-0">
      <img
        src="/images/exhibition/hero-bg.png"
        alt=""
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/70" />
    </div>

    <!-- Hero content: Cityscape pattern (main nav is in App.vue NavBar) -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white uppercase tracking-tight leading-[1.1] max-w-5xl mx-auto">
        Bold Projects.<br />
        Big Connections.<br />
        Bigger Opportunities.
      </h1>

      <!-- Single line: date - venue - city (Cityscape style) -->
      <p class="mt-8 text-sm sm:text-base text-white/95 tracking-wide uppercase font-medium">
        10–13 November 2026 — Exhibition & Convention Center — Addis Ababa, Ethiopia
      </p>

      <p class="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-white/80">
        Meet global visionaries, explore iconic projects, and unlock pathways to growth and collaboration at the region’s biggest real estate and construction show.
      </p>

      <!-- CTAs: primary + secondary -->
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="#register"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors min-w-[240px]"
        >
          Register your interest 2026
        </a>
        <a
          href="#brochure"
          class="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors min-w-[240px]"
        >
          Download event brochure
        </a>
      </div>
    </div>

    <!-- Foundation Partners strip: exclusive sponsors only -->
    <div class="relative z-10 bg-black/50 py-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_25px_40px_-15px_rgba(255,255,255,0.08)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] mb-5">
          {{ $t('exhibition.hero.foundationPartners') }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <template v-if="partners.length">
            <a
              v-for="partner in partners"
              :key="partner.id"
              :href="`/organizations/${partner.id}`"
              class="flex flex-col items-center gap-1 transition-all duration-200 hover:border-yellow-400 hover:bg-yellow-500/20 rounded-lg border border-transparent p-2"
              :class="isExclusive(partner) ? 'border-yellow-400/60 bg-yellow-500/10' : 'border-white/10 bg-white/5'"
            >
              <div class="h-10 w-16 sm:h-12 sm:w-24 flex items-center justify-center overflow-hidden rounded bg-white/10">
                <img
                  v-if="partner.logoUrl"
                  :src="mediaUrl(partner.logoUrl)"
                  :alt="partner.name"
                  class="max-h-full max-w-full object-contain"
                />
                <span v-else class="text-white/70 text-[10px] sm:text-xs font-semibold truncate px-1">{{ (partner.name || '').charAt(0) }}</span>
              </div>
              <span class="text-[10px] sm:text-xs text-white/80 max-w-[6rem] truncate" :title="partner.name">{{ partner.name }}</span>
              <span
                v-if="isExclusive(partner)"
                class="text-[9px] uppercase tracking-wider text-yellow-400 font-semibold"
              >
                {{ $t('exhibition.hero.featured') }}
              </span>
            </a>
          </template>
          <template v-else>
            <div
              v-for="i in 6"
              :key="'slot-' + i"
              class="h-14 w-24 sm:h-8 sm:w-28 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-[10px] sm:text-xs"
            >
              {{ $t('exhibition.partners.slotAvailable') }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { mediaUrl } from '@/shared/api/client'
import { getExclusiveOrganizations } from '@/features/exhibition/api/exhibition.api'

const partners = ref([])

function isExclusive(partner) {
  return (partner.sponsorshipType || '').toUpperCase() === 'EXCLUSIVE'
}

onMounted(async () => {
  try {
    const list = await getExclusiveOrganizations()
    partners.value = list || []
  } catch (err) {
    console.error('Failed to load partners for hero:', err)
  }
})
</script>

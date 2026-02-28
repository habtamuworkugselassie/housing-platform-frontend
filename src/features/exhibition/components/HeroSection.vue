<template>
  <section class="relative min-h-screen flex flex-col overflow-hidden bg-black">
    <!-- Background: image with optional video placeholder -->
    <div class="absolute inset-0 z-0">
      <img
        src="/images/exhibition/hero-bg.png"
        alt=""
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/70"></div>
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

    <!-- {{ $t('exhibition.hero.foundationPartners') }} strip -->
    <div class="relative z-10 border-t border-white/20 bg-black/50 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] mb-5">
          {{ $t('exhibition.hero.foundationPartners') }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div
            v-for="i in 6"
            :key="i"
            class="h-6 w-20 sm:h-8 sm:w-28 bg-white/10 flex items-center justify-center text-white/30 text-[10px] sm:text-xs"
          >
            {{ $t('exhibition.hero.partner') }} {{ i }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<template>
  <section
    class="relative w-full overflow-hidden border-b border-white/10"
    aria-label="Welcome"
  >
    <!-- Background: gradient + subtle grid pattern -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black"
      aria-hidden="true"
    />
    <div
      class="absolute inset-0 opacity-[0.03]"
      style="background-image: linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px); background-size: 48px 48px;"
      aria-hidden="true"
    />
    <div
      class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none"
      aria-hidden="true"
    />

    <!-- Content (compact hero) -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
      <div class="max-w-2xl">
        <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
          {{ $t('home.heroHeadline') }}
        </h1>
        <p class="mt-2 sm:mt-3 text-sm text-gray-400 max-w-xl leading-relaxed">
          {{ $t('home.heroSubtext') }}
        </p>
        <div class="mt-3 sm:mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            @click="scrollToListings"
            class="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 text-sm font-semibold text-black bg-white rounded-lg hover:bg-yellow-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            {{ $t('home.heroCta') }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <p v-if="listingCount != null && companyCount != null" class="mt-2 text-xs sm:text-sm text-gray-500">
          {{ listingCount }} {{ listingCount === 1 ? $t('home.trustListingsOne') : $t('home.trustListings') }}
          <span class="mx-2" aria-hidden="true">·</span>
          {{ companyCount }} {{ companyCount === 1 ? $t('home.company') : $t('home.companies') }}
        </p>
        <p v-else class="mt-2 text-xs sm:text-sm text-gray-500">
          {{ $t('home.heroTrustLine') }}
        </p>
      </div>
    </div>

    <!-- Scroll hint -->
    <div class="relative z-10 flex justify-center pb-2">
      <button
        type="button"
        @click="scrollToListings"
        class="inline-flex flex-col items-center gap-1 text-gray-500 hover:text-yellow-400 transition-colors"
        aria-label="Scroll to listings"
      >
        <span class="text-xs uppercase tracking-wider">Scroll</span>
        <svg class="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  listingCount: { type: Number, default: null },
  companyCount: { type: Number, default: null }
})

function scrollToListings() {
  const el = document.getElementById('main-listings')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <!-- Fluid top block: no gap between carousels -->
  <div class="flex w-full flex-col gap-0">
    <div class="min-w-0 w-full m-0">
      <SponsorCarouselSection />
    </div>
    <div class="min-w-0 w-full">
      <ExhibitionMessageCarousel />
    </div>
  </div>
</template>

<script setup>
import SponsorCarouselSection from './SponsorCarouselSection.vue'
import ExhibitionMessageCarousel from './ExhibitionMessageCarousel.vue'
</script>

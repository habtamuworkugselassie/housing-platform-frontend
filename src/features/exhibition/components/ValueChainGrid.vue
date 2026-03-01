<template>
  <section class="py-24 lg:py-32 bg-zinc-950 border-t border-white/10 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400 mb-2">
        {{ $t('exhibition.valueChain.eyebrow') }}
      </p>
      <div class="mb-16">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-4 text-white">
          {{ $t('exhibition.valueChain.title') }}
        </h2>
        <p class="text-lg text-gray-400 max-w-2xl">
          {{ $t('exhibition.valueChain.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        <div
          v-for="(item, index) in sectorConfigs"
          :key="index"
          class="group relative h-44 sm:h-48 overflow-hidden rounded-xl border border-white/10 hover:border-yellow-400 transition-all duration-300"
        >
          <!-- Fallback gradient (shows when image fails or is loading) -->
          <div class="absolute inset-0 z-0 bg-gradient-to-br from-zinc-700 to-zinc-900" aria-hidden="true" />
          <!-- Background image -->
          <img
            :src="item.imageUrl"
            :alt="''"
            class="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            @error="(e) => (e.target.style.opacity = '0')"
          />
          <!-- Dark overlay for readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30 z-[1] transition-opacity duration-300 group-hover:from-black/90" />
          <!-- Content -->
          <div class="relative z-10 p-4 sm:p-5 h-full flex flex-col justify-end">
            <h3 class="text-sm sm:text-base font-semibold text-white drop-shadow-sm group-hover:text-yellow-400 transition-colors">
              {{ $t(item.labelKey) }}
            </h3>
            <div class="w-0 group-hover:w-10 h-0.5 bg-yellow-400 mt-2 transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Each sector: labelKey (i18n) + local background image (Picsum photos downloaded to public/images/exhibition/sectors/).
const sectorConfigs = [
  { labelKey: 'exhibition.valueChain.buildingMaterials', imageUrl: '/images/exhibition/sectors/building-materials.jpg' },
  { labelKey: 'exhibition.valueChain.concreteCement', imageUrl: '/images/exhibition/sectors/concrete-cement.jpg' },
  { labelKey: 'exhibition.valueChain.interiorsFinishes', imageUrl: '/images/exhibition/sectors/interiors-finishes.jpg' },
  { labelKey: 'exhibition.valueChain.urbanDesign', imageUrl: '/images/exhibition/sectors/urban-design.jpg' },
  { labelKey: 'exhibition.valueChain.buildingServices', imageUrl: '/images/exhibition/sectors/building-services.jpg' },
  { labelKey: 'exhibition.valueChain.constructionTools', imageUrl: '/images/exhibition/sectors/construction-tools.jpg' },
  { labelKey: 'exhibition.valueChain.hvacCooling', imageUrl: '/images/exhibition/sectors/hvac-cooling.jpg' },
  { labelKey: 'exhibition.valueChain.digitalConstruction', imageUrl: '/images/exhibition/sectors/digital-construction.jpg' },
  { labelKey: 'exhibition.valueChain.solarEnergy', imageUrl: '/images/exhibition/sectors/solar-energy.jpg' },
  { labelKey: 'exhibition.valueChain.heavyMachinery', imageUrl: '/images/exhibition/sectors/heavy-machinery.jpg' },
  { labelKey: 'exhibition.valueChain.intelligentBuilding', imageUrl: '/images/exhibition/sectors/intelligent-building.jpg' },
  { labelKey: 'exhibition.valueChain.sustainableConstruction', imageUrl: '/images/exhibition/sectors/sustainable-construction.jpg' }
]
</script>

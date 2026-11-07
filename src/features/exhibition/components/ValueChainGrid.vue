<template>
  <section id="sectors" class="py-16 lg:py-24 bg-white text-gray-900 scroll-mt-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        v-reveal
        :eyebrow="$t('exhibition.valueChain.eyebrow')"
        :title="$t('exhibition.valueChain.title')"
        :subtitle="$t('exhibition.valueChain.subtitle')"
      />

      <div v-reveal data-stagger class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        <div
          v-for="(item, index) in sectorConfigs"
          :key="index"
          class="group hover-lift relative h-44 sm:h-48 overflow-hidden rounded-2xl border border-gray-200 hover:border-primary-400"
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
            <h3 class="text-sm sm:text-base font-semibold text-white drop-shadow-sm group-hover:text-white transition-colors">
              {{ $t(item.labelKey) }}
            </h3>
            <div class="w-0 group-hover:w-10 h-0.5 bg-primary-500 mt-2 transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import SectionHeader from '@/shared/components/SectionHeader.vue'
// Each sector: labelKey (i18n) + background photo (Unsplash, see src/assets/exhibition/CREDITS.md).
// The photos are imported rather than served from public/ so Vite fingerprints the file
// names: nginx caches images for a year as immutable, and a replaced photo under the same
// name never reached returning visitors.
const sectorPhotos = import.meta.glob('../../../assets/exhibition/sectors/*.jpg', { eager: true, import: 'default' })
const photo = (name) => sectorPhotos[`../../../assets/exhibition/sectors/${name}.jpg`]
const sectorConfigs = [
  { labelKey: 'exhibition.valueChain.buildingMaterials', imageUrl: photo('building-materials') },
  { labelKey: 'exhibition.valueChain.concreteCement', imageUrl: photo('concrete-cement') },
  { labelKey: 'exhibition.valueChain.interiorsFinishes', imageUrl: photo('interiors-finishes') },
  { labelKey: 'exhibition.valueChain.urbanDesign', imageUrl: photo('urban-design') },
  { labelKey: 'exhibition.valueChain.buildingServices', imageUrl: photo('building-services') },
  { labelKey: 'exhibition.valueChain.constructionTools', imageUrl: photo('construction-tools') },
  { labelKey: 'exhibition.valueChain.hvacCooling', imageUrl: photo('hvac-cooling') },
  { labelKey: 'exhibition.valueChain.digitalConstruction', imageUrl: photo('digital-construction') },
  { labelKey: 'exhibition.valueChain.solarEnergy', imageUrl: photo('solar-energy') },
  { labelKey: 'exhibition.valueChain.heavyMachinery', imageUrl: photo('heavy-machinery') },
  { labelKey: 'exhibition.valueChain.intelligentBuilding', imageUrl: photo('intelligent-building') },
  { labelKey: 'exhibition.valueChain.sustainableConstruction', imageUrl: photo('sustainable-construction') }
]
</script>

<template>
  <!-- Endless strip of the sectors on show. Two copies of the list scroll as one track;
       the second is hidden from assistive tech so nothing is read twice. -->
  <section class="border-y border-gray-200 bg-white py-3.5" :aria-label="$t('exhibition.ticker.label')">
    <div class="marquee" style="--marquee-duration: 56s">
      <div class="marquee__track">
        <ul v-for="copy in 2" :key="copy" class="flex items-center gap-3" :aria-hidden="copy === 2 ? 'true' : undefined">
          <li v-for="s in sectors" :key="s.key" class="flex items-center gap-3">
            <span class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
              <component :is="s.icon" class="h-4 w-4 text-primary-600" aria-hidden="true" />
              {{ $t(`exhibition.valueChain.${s.key}`) }}
            </span>
            <span class="h-1 w-1 rounded-full bg-gold-400" aria-hidden="true" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  CubeIcon,
  BuildingOffice2Icon,
  PaintBrushIcon,
  MapIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  CloudIcon,
  CpuChipIcon,
  SunIcon,
  TruckIcon,
  SignalIcon,
  GlobeAltIcon,
} from '@heroicons/vue/24/outline'

// Same order and keys as ValueChainGrid, so the strip previews what that section expands on.
const sectors = [
  { key: 'buildingMaterials', icon: CubeIcon },
  { key: 'concreteCement', icon: BuildingOffice2Icon },
  { key: 'interiorsFinishes', icon: PaintBrushIcon },
  { key: 'urbanDesign', icon: MapIcon },
  { key: 'buildingServices', icon: WrenchScrewdriverIcon },
  { key: 'constructionTools', icon: Cog6ToothIcon },
  { key: 'hvacCooling', icon: CloudIcon },
  { key: 'digitalConstruction', icon: CpuChipIcon },
  { key: 'solarEnergy', icon: SunIcon },
  { key: 'heavyMachinery', icon: TruckIcon },
  { key: 'intelligentBuilding', icon: SignalIcon },
  { key: 'sustainableConstruction', icon: GlobeAltIcon },
]
</script>

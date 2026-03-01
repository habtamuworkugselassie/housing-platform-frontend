<template>
  <section :class="compact ? '' : (dark ? 'py-24 lg:py-32' : 'py-24 lg:py-32 bg-gray-50')">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="!compact" class="text-center mb-16">
        <p :class="[dark ? 'text-amber-400' : 'text-amber-600', 'text-sm font-semibold tracking-[0.2em] uppercase mb-4']">{{ $t('exhibition.pillar.whyParticipate') }}</p>
        <h2 :class="dark ? 'text-white' : 'text-gray-900'" class="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          {{ $t('exhibition.pillar.title') }}
        </h2>
        <p :class="dark ? 'text-gray-400' : 'text-gray-600'" class="text-lg max-w-2xl mx-auto">
          {{ $t('exhibition.pillar.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div
          v-for="(pillar, index) in pillars"
          :key="index"
          :class="[
            'group p-8 rounded-lg transition-all duration-300',
            dark
              ? 'bg-white/5 border border-white/10 hover:border-yellow-400 hover:bg-yellow-500/20'
              : 'bg-white border border-gray-200 hover:border-yellow-400 hover:bg-yellow-500/20 hover:shadow-lg'
          ]"
        >
          <div :class="['w-12 h-12 flex items-center justify-center mb-6 transition-colors', dark ? 'text-gray-400 group-hover:text-yellow-400' : 'text-gray-400 group-hover:text-yellow-500']">
            <component :is="pillar.icon" class="w-8 h-8" />
          </div>
          <h3 :class="['text-xl font-bold mb-3 tracking-tight', dark ? 'text-white' : 'text-gray-900']">{{ pillar.title }}</h3>
          <p :class="['leading-relaxed text-sm', dark ? 'text-gray-400' : 'text-gray-600']">{{ pillar.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  compact: { type: Boolean, default: false },
  dark: { type: Boolean, default: false }
})
import {
  UserGroupIcon,
  LightBulbIcon,
  PresentationChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const pillars = [
  {
    title: t('exhibition.pillar.expandBusiness'),
    description: t('exhibition.pillar.expandBusinessDesc'),
    icon: UserGroupIcon
  },
  {
    title: t('exhibition.pillar.showcaseProducts'),
    description: t('exhibition.pillar.showcaseProductsDesc'),
    icon: LightBulbIcon
  },
  {
    title: t('exhibition.pillar.meetBuyers'),
    description: t('exhibition.pillar.meetBuyersDesc'),
    icon: PresentationChartBarIcon
  },
  {
    title: t('exhibition.pillar.generateLeads'),
    description: t('exhibition.pillar.generateLeadsDesc'),
    icon: CurrencyDollarIcon
  }
]
</script>

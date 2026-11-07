<template>
  <section :class="compact ? '' : (dark ? 'py-24 lg:py-32' : 'py-24 lg:py-32 bg-gray-50')">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="!compact" class="text-center mb-16">
        <p :class="[dark ? 'text-amber-400' : 'text-amber-600', 'text-sm font-semibold mb-4']">{{ $t('exhibition.pillar.whyParticipate') }}</p>
        <h2 :class="dark ? 'text-white' : 'text-gray-900'" class="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          {{ $t('exhibition.pillar.title') }}
        </h2>
        <p :class="dark ? 'text-white/80' : 'text-gray-600'" class="text-lg max-w-2xl mx-auto">
          {{ $t('exhibition.pillar.subtitle') }}
        </p>
      </div>

      <div v-reveal data-stagger class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        <div
          v-for="(pillar, index) in pillars"
          :key="index"
          :class="[
            'group hover-lift relative p-6 sm:p-7 rounded-2xl',
            dark
              ? 'bg-white/5 border border-white/10 hover:border-primary-400 hover:bg-primary-100/20'
              : 'bg-white border border-gray-200 hover:border-primary-300'
          ]"
        >
          <div class="mb-6 flex items-center justify-between">
            <div :class="['flex h-12 w-12 items-center justify-center rounded-full transition-colors', dark ? 'bg-white/10 text-white/85 group-hover:text-white' : 'bg-primary-50 text-primary-600 group-hover:bg-gold-100 group-hover:text-gold-800']">
              <component :is="pillar.icon" class="w-6 h-6" aria-hidden="true" />
            </div>
            <span :class="['rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider', dark ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-500']">0{{ index + 1 }}</span>
          </div>
          <h3 :class="['text-xl font-bold mb-3 tracking-tight', dark ? 'text-white' : 'text-gray-900']">{{ pillar.title }}</h3>
          <p :class="['leading-relaxed text-sm', dark ? 'text-white/80' : 'text-gray-600']">{{ pillar.description }}</p>
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

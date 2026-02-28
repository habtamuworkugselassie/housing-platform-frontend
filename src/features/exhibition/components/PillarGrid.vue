<template>
  <section :class="compact ? '' : 'py-24 lg:py-32 bg-gray-50'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="!compact" class="text-center mb-16">
        <p class="text-amber-600 text-sm font-semibold tracking-[0.2em] uppercase mb-4">Why Participate</p>
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Connect with industry leaders
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the latest innovations and high-level networking that drives the sector forward.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div
          v-for="(pillar, index) in pillars"
          :key="index"
          class="group bg-white p-8 rounded-sm border border-gray-200 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300"
        >
          <div class="w-12 h-12 flex items-center justify-center mb-6 text-gray-400 group-hover:text-amber-600 transition-colors">
            <component :is="pillar.icon" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3 tracking-tight">{{ pillar.title }}</h3>
          <p class="text-gray-600 leading-relaxed text-sm">{{ pillar.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  compact: { type: Boolean, default: false }
})
import {
  UserGroupIcon,
  LightBulbIcon,
  PresentationChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const pillars = [
  {
    title: 'Expand your business',
    description: 'Establish new partnerships and grow your network in the rapidly expanding market.',
    icon: UserGroupIcon
  },
  {
    title: 'Showcase your products',
    description: 'Display your latest innovations to thousands of potential customers and decision-makers.',
    icon: LightBulbIcon
  },
  {
    title: 'Meet serious buyers',
    description: 'Connect directly with procurement managers, architects, and developers.',
    icon: PresentationChartBarIcon
  },
  {
    title: 'Generate quality leads',
    description: 'Fill your pipeline with high-value contacts and real business opportunities.',
    icon: CurrencyDollarIcon
  }
]
</script>

<template>
  <div 
    v-if="adContent || (adContents && adContents.length > 0)"
    :class="adContainerClass"
  >
    <!-- Banner Ad Layout - Supports single or multiple ads -->
    <div v-if="size === 'banner'" class="h-full flex items-center gap-3 p-2 sm:p-3">
      <!-- Multiple ads (for PREMIER banner) -->
      <template v-if="adContents && adContents.length > 0">
        <div 
          v-for="(ad, index) in adContents.slice(0, 2)" 
          :key="ad.id"
          class="flex-1 flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
          @click="handleAdClick(ad)"
        >
          <div 
            v-if="ad.imageUrl"
            class="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden bg-gray-200"
          >
            <img 
              :src="ad.imageUrl" 
              :alt="ad.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span 
                v-if="ad.sponsorshipType"
                :class="[
                  'text-xs font-bold px-2 py-0.5 rounded',
                  ad.sponsorshipType.toUpperCase().includes('PREMIER') || 
                  ad.sponsorshipType.toUpperCase().includes('PREMIUM') ||
                  ad.sponsorshipType.toUpperCase().includes('GOLD')
                    ? 'text-yellow-600 bg-yellow-100'
                    : 'text-blue-600 bg-blue-100'
                ]"
              >
                {{ ad.sponsorshipType.toUpperCase() }}
              </span>
              <span 
                v-else
                class="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded"
              >
                SPONSORED
              </span>
            </div>
            <h3 class="text-xs sm:text-sm font-semibold text-gray-900 truncate mb-1">
              {{ ad.title }}
            </h3>
            <div class="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <span v-if="ad.city" class="truncate">{{ ad.city }}</span>
              <span v-if="ad.priceETB" class="font-semibold text-primary-600 whitespace-nowrap">
                {{ formatPrice(ad.priceETB, 'ETB') }}
              </span>
            </div>
            <div v-if="ad.realEstateCompanyName" class="flex items-center gap-1 text-xs">
              <svg class="w-3 h-3 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span class="text-primary-600 font-medium truncate">{{ ad.realEstateCompanyName }}</span>
            </div>
          </div>
          <!-- Divider between ads (except for last) -->
          <div 
            v-if="index < adContents.slice(0, 2).length - 1" 
            class="hidden sm:block w-px h-12 bg-gray-300 mx-1"
          ></div>
        </div>
      </template>
      
      <!-- Single ad (fallback) -->
      <template v-else-if="adContent">
        <div 
          class="flex-1 flex items-center gap-3 p-2"
          @click="handleClick"
        >
          <div 
            v-if="adContent.imageUrl"
            class="flex-shrink-0 w-20 sm:w-24 h-20 sm:h-24 rounded-lg overflow-hidden bg-gray-200"
          >
            <img 
              :src="adContent.imageUrl" 
              :alt="adContent.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span 
                v-if="adContent.sponsorshipType"
                :class="[
                  'text-xs font-bold px-2 py-0.5 rounded',
                  adContent.sponsorshipType.toUpperCase().includes('PREMIER') || 
                  adContent.sponsorshipType.toUpperCase().includes('PREMIUM') ||
                  adContent.sponsorshipType.toUpperCase().includes('GOLD')
                    ? 'text-yellow-600 bg-yellow-100'
                    : 'text-blue-600 bg-blue-100'
                ]"
              >
                {{ adContent.sponsorshipType.toUpperCase() }}
              </span>
              <span 
                v-else
                class="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded"
              >
                SPONSORED
              </span>
            </div>
            <h3 class="text-sm sm:text-base font-semibold text-gray-900 truncate mb-1">
              {{ adContent.title }}
            </h3>
            <div class="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <span v-if="adContent.city">{{ adContent.city }}</span>
              <span v-if="adContent.priceETB" class="font-semibold text-primary-600">
                {{ formatPrice(adContent.priceETB, 'ETB') }}
              </span>
            </div>
            <div v-if="adContent.realEstateCompanyName" class="flex items-center gap-1 text-xs">
              <svg class="w-3 h-3 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span class="text-primary-600 font-medium truncate">{{ adContent.realEstateCompanyName }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Sidebar/Rectangle Ad Layout -->
    <div v-else class="h-full flex flex-col">
      <div 
        v-if="adContent.imageUrl"
        :class="[
          'w-full overflow-hidden',
          dark ? 'bg-zinc-700' : 'bg-gray-200',
          size === 'sidebar' ? 'h-48' : 'h-32'
        ]"
      >
        <img 
          :src="adContent.imageUrl" 
          :alt="adContent.title"
          class="w-full h-full object-cover"
        />
      </div>
      <div 
        v-else
        :class="[
          'w-full flex items-center justify-center',
          dark ? 'bg-zinc-700' : 'bg-gray-200',
          size === 'sidebar' ? 'h-48' : 'h-32'
        ]"
      >
        <svg :class="['w-12 h-12', dark ? 'text-gray-500' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
      <div class="flex-1 p-3 flex flex-col">
        <div class="flex items-center gap-2 mb-2">
          <span 
            v-if="adContent.sponsorshipType"
            :class="[
              'text-xs font-bold px-2 py-0.5 rounded',
              dark
                ? (adContent.sponsorshipType.toUpperCase().includes('PREMIER') || adContent.sponsorshipType.toUpperCase().includes('PREMIUM') || adContent.sponsorshipType.toUpperCase().includes('GOLD') ? 'text-amber-200 bg-amber-900/50' : 'text-blue-200 bg-blue-900/50')
                : (adContent.sponsorshipType.toUpperCase().includes('PREMIER') || adContent.sponsorshipType.toUpperCase().includes('PREMIUM') || adContent.sponsorshipType.toUpperCase().includes('GOLD') ? 'text-yellow-600 bg-yellow-100' : 'text-blue-600 bg-blue-100')
            ]"
          >
            {{ adContent.sponsorshipType.toUpperCase() }}
          </span>
          <span 
            v-else
            :class="dark ? 'text-xs font-semibold text-blue-200 bg-blue-900/50 px-2 py-0.5 rounded' : 'text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded'"
          >
            SPONSORED
          </span>
        </div>
        <h3 :class="['text-sm font-semibold mb-1 line-clamp-2', dark ? 'text-white' : 'text-gray-900']">
          {{ adContent.title }}
        </h3>
        <div class="mt-auto space-y-1">
          <div v-if="adContent.city" :class="['text-xs', dark ? 'text-gray-400' : 'text-gray-600']">
            {{ adContent.city }}
          </div>
          <div v-if="adContent.priceETB" :class="['text-sm font-bold', dark ? 'text-primary-400' : 'text-primary-600']">
            {{ formatPrice(adContent.priceETB, 'ETB') }}
          </div>
          <div v-if="adContent.realEstateCompanyName" :class="['flex items-center gap-1 text-xs pt-1 border-t', dark ? 'border-white/20' : 'border-gray-200']">
            <svg :class="['w-3 h-3 flex-shrink-0', dark ? 'text-primary-400' : 'text-primary-600']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span :class="['font-medium truncate', dark ? 'text-primary-400' : 'text-primary-600']">{{ adContent.realEstateCompanyName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Placeholder when no ad content -->
  <div 
    v-else
    :class="[
      'rounded-lg flex items-center justify-center',
      dark ? 'bg-zinc-800 border border-white/10' : 'bg-gray-100 border border-gray-200',
      size === 'banner' ? 'h-24 sm:h-28' : '',
      size === 'sidebar' ? 'w-full min-h-[300px]' : '',
      size === 'rectangle' ? 'h-32 sm:h-40' : ''
    ]"
  >
    <div class="text-center p-4">
      <div class="text-gray-400 text-sm mb-2">Advertisement</div>
      <div 
        :class="[
          'text-gray-500 text-xs',
          size === 'banner' ? 'text-sm' : '',
          size === 'sidebar' ? 'text-xs' : ''
        ]"
      >
        {{ size === 'banner' ? '728 x 90' : size === 'sidebar' ? '300 x 600' : '300 x 250' }}
      </div>
      <div class="text-gray-400 text-xs mt-1">Ad Space</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const props = defineProps({
  size: {
    type: String,
    default: 'banner',
    validator: (value) => ['banner', 'sidebar', 'rectangle'].includes(value)
  },
  dark: { type: Boolean, default: false },
  adContent: {
    type: Object,
    default: null
  },
  adContents: {
    type: Array,
    default: null
  }
})

const router = useRouter()

const adContainerClass = computed(() => {
  const baseClasses = [
    'border rounded-lg overflow-hidden transition-all'
  ]
  
  if (props.size === 'banner') {
    baseClasses.push('h-24 sm:h-28')
  } else if (props.size === 'sidebar') {
    baseClasses.push('w-full min-h-[300px] cursor-pointer hover:shadow-lg')
  } else if (props.size === 'rectangle') {
    baseClasses.push('h-32 sm:h-40 cursor-pointer hover:shadow-lg')
  }
  
  // Check sponsorship type from either single ad or first ad in array
  const checkAd = props.adContents && props.adContents.length > 0 
    ? props.adContents[0] 
    : props.adContent
  
  // Dynamic sponsorship styling - check if it's a top-tier sponsorship (highest base price)
  // For now, we'll use a general check - can be enhanced to check actual base price
  if (props.dark) {
    baseClasses.push('bg-zinc-800 border-white/10 hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors')
  } else if (checkAd && checkAd.sponsorshipType) {
    const isPremium = checkAd.sponsorshipType.toUpperCase().includes('PREMIER') || 
                      checkAd.sponsorshipType.toUpperCase().includes('PREMIUM') ||
                      checkAd.sponsorshipType.toUpperCase().includes('GOLD')
    if (isPremium) {
      baseClasses.push('bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-300')
    } else {
      baseClasses.push('bg-white border-gray-200')
    }
  } else {
    baseClasses.push('bg-white border-gray-200')
  }
  
  return baseClasses
})

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const handleClick = () => {
  if (!props.adContent) return
  
  if (props.adContent.type === 'property') {
    router.push(`/properties/${props.adContent.id}`)
  } else if (props.adContent.type === 'building') {
    router.push(`/buildings/${props.adContent.id}`)
  }
}

const handleAdClick = (ad) => {
  if (!ad) return
  
  if (ad.type === 'property') {
    router.push(`/properties/${ad.id}`)
  } else if (ad.type === 'building') {
    router.push(`/buildings/${ad.id}`)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

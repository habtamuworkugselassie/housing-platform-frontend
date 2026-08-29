<template>
  <div
    class="relative bg-white rounded-lg overflow-hidden transition-all cursor-pointer hover:shadow-lg"
    :class="{
      'border border-gray-200 hover:border-primary-300': !item.isSponsored,
      'border-2 border-gold-400/70': item.isSponsored && isPremierListingTier(item.sponsorshipType),
      'border-2 border-gold-400/40 hover:border-gold-400/70': item.isSponsored && isGoldListingTier(item.sponsorshipType)
    }"
    @click="item.type === 'property' ? $router.push(`/properties/${item.id}`) : $router.push(`/buildings/${item.id}`)"
  >
    <!-- Type Badge (Building) -->
    <div v-if="item.type === 'building'" class="absolute top-2 left-2 z-20">
      <div class="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg ring-1 ring-white/40 flex items-center gap-1">
        <span class="material-icons !text-[14px] leading-none" aria-hidden="true">apartment</span>
        <span>{{ $t('common.buildingBadge') }}</span>
      </div>
    </div>
    
    <!-- Sponsored Badge - Prominent Display -->
    <div v-if="item.isSponsored" class="relative">
      <div
        :class="{
          'bg-primary-950 text-gold-300 shadow-lg': isPremierListingTier(item.sponsorshipType),
          'bg-gold-400 text-primary-950 shadow-lg': isGoldListingTier(item.sponsorshipType)
        }"
        class="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-extrabold z-20 flex items-center gap-1 sm:gap-1.5 ring-1 ring-white/40"
      >
        <span class="material-icons !text-[14px] leading-none" aria-hidden="true">star</span>
        <span class="hidden sm:inline uppercase tracking-wide">{{ isPremierListingTier(item.sponsorshipType) ? $t('property.premier') : (isGoldListingTier(item.sponsorshipType) ? 'GOLD' : $t('property.sponsored')) }}</span>
        <span class="sm:hidden uppercase">{{ isPremierListingTier(item.sponsorshipType) ? 'P' : 'S' }}</span>
      </div>
    </div>
    
    <div class="h-40 sm:h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <span v-if="!item.images && !item.imageUrls" class="material-icons text-gray-500 !text-5xl" aria-hidden="true">{{ item.type === 'property' ? 'home' : 'apartment' }}</span>
      <img
        v-else
        :src="mediaUrl(item.images?.[0]?.imageUrl || item.imageUrls?.[0])"
        :alt="item.title || item.name"
        :class="{
          'w-full h-full object-cover transition-transform duration-300': true,
          'brightness-110 contrast-110 scale-105 hover:scale-110': item.isSponsored && isPremierListingTier(item.sponsorshipType),
          'brightness-105 scale-102 hover:scale-105': item.isSponsored && isGoldListingTier(item.sponsorshipType)
        }"
      />
      <!-- Sponsored Overlay Gradient - More Prominent -->
      <div 
        v-if="item.isSponsored"
        :class="{
          'absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent': isPremierListingTier(item.sponsorshipType),
          'absolute inset-0 bg-gradient-to-t from-blue-400/25 via-blue-300/10 to-transparent': isGoldListingTier(item.sponsorshipType)
        }"
      ></div>
    </div>
    <div class="p-4 sm:p-6">
      <div class="flex items-start justify-between mb-2 gap-2 flex-wrap">
        <h3 class="flex-1 min-w-0 text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
          {{ item.title || item.name }}
          <VerifiedBadge :level="getVerificationLevel(item)" size="sm" />
        </h3>
      </div>
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <!-- Property Price -->
        <div v-if="item.type === 'property'" class="flex flex-col gap-1">
          <p v-if="item.priceETB" class="text-xl sm:text-2xl font-bold text-primary-700">{{ formatPrice(item.priceETB, 'ETB') }}</p>
          <p v-if="item.priceUSD" class="text-base sm:text-lg font-semibold text-gray-500">{{ formatPrice(item.priceUSD, 'USD') }}</p>
          <p v-if="!item.priceETB && !item.priceUSD" class="text-base sm:text-lg text-gray-500">
            {{ $t('property.priceNotSet') }}
          </p>
        </div>
        <!-- Building Units Info -->
        <div v-else class="flex flex-col gap-1">
          <p class="text-xl sm:text-2xl font-bold text-primary-700">{{ item.totalUnits || 0 }} {{ $t('property.unitsCount') }}</p>
          <p class="text-sm text-gray-500">{{ item.availableUnits || 0 }} {{ $t('property.availableCount') }}</p>
        </div>
        <span v-if="item.category" :class="{
          'bg-blue-500/30 text-blue-700': item.category === 'FOR_SALE',
          'bg-green-500/30 text-green-700': item.category === 'FOR_RENTAL'
        }" class="px-2 py-0.5 rounded text-xs font-medium">
          {{ item.category === 'FOR_SALE' ? $t('property.saleShort') : $t('property.rentalShort') }}
        </span>
        <span v-if="item.isFullyFurnished" class="px-2 py-0.5 bg-purple-500/30 text-purple-700 rounded text-xs font-medium">
          {{ $t('property.furnished') }}
        </span>
      </div>
      <p class="text-sm text-gray-500 mb-2">
        <span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">location_on</span> {{ item.city }}, {{ item.country }}
      </p>
      <div v-if="item.constructionPercentage !== null && item.constructionPercentage !== undefined" class="mb-2">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">{{ $t('property.constructionLabel') }}:</span>
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-primary-500 h-2 rounded-full transition-all"
              :style="{ width: item.constructionPercentage + '%' }"
            ></div>
          </div>
          <span class="text-xs text-gray-500">{{ item.constructionPercentage }}%</span>
        </div>
      </div>
      <div v-if="item.realEstateCompanyName" class="flex items-center gap-2 mb-2 flex-wrap">
        <svg class="w-3 h-3 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
        <span class="text-xs font-semibold text-gray-700">{{ item.realEstateCompanyName }}</span>
      </div>
      <!-- Property Features -->
      <div v-if="item.type === 'property'" class="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
        <span v-if="item.bedrooms"><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">bed</span> {{ item.bedrooms }} {{ $t('property.beds') }}</span>
        <span v-if="item.bathrooms"><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">shower</span> {{ item.bathrooms }} {{ $t('property.baths') }}</span>
        <span v-if="item.area"><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">square_foot</span> {{ item.area }} {{ $t('property.areaUnit') }}</span>
      </div>
      <!-- Building Features -->
      <div v-else class="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
        <span><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">apartment</span> {{ item.totalUnits || 0 }} {{ $t('property.unitsCount') }}</span>
        <span v-if="item.totalFloors"><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">layers</span> {{ item.totalFloors }} {{ $t('building.floorsLabel') }}</span>
        <span v-if="item.availableUnits" class="text-green-600 font-semibold">{{ item.availableUnits }} {{ $t('property.availableCount') }}</span>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <span
          :class="{
            'bg-green-500/30 text-green-700': item.status === 'AVAILABLE' || item.status === 'COMPLETED',
            'bg-primary-500/30 text-primary-700': item.status === 'RESERVED' || item.status === 'UNDER_CONSTRUCTION',
            'bg-gray-500/30 text-gray-600': item.status === 'SOLD' || item.status === 'PLANNED'
          }"
          class="inline-block px-2 py-1 text-xs font-semibold rounded"
        >
          {{ item.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { mediaUrl } from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice, getVerificationLevel } from '@/shared/utils'
import { VerifiedBadge } from '@/shared/components'
import { isPremierListingTier, isGoldListingTier } from '@/shared/utils/sponsorshipTier'

/**
 * The one listing card: image with a single tier badge top-right and a type
 * badge top-left, title + one Verified, gold ETB price, three facts, status.
 * Renders both properties and buildings; the parent decides navigation.
 */
defineProps({
  item: { type: Object, required: true }
})

const formatPrice = (price, currency = 'ETB') => formatCurrencyPrice(price, currency || 'ETB')
</script>

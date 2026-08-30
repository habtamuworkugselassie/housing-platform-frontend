<template>
  <div
    class="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    :class="{
      'border border-gray-200 hover:border-primary-300': !item.isSponsored,
      'border-2 border-gold-400/70': item.isSponsored && isPremierListingTier(item.sponsorshipType),
      'border-2 border-gold-400/50 hover:border-gold-400/80': item.isSponsored && isGoldListingTier(item.sponsorshipType)
    }"
    @click="item.type === 'property' ? $router.push(`/properties/${item.id}`) : $router.push(`/buildings/${item.id}`)"
  >
    <!-- Image -->
    <div class="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
      <div v-if="!item.images && !item.imageUrls" class="flex h-full w-full items-center justify-center">
        <span class="material-icons !text-5xl text-gray-300" aria-hidden="true">{{ item.type === 'property' ? 'home' : 'apartment' }}</span>
      </div>
      <img
        v-else
        :src="mediaUrl(item.images?.[0]?.imageUrl || item.imageUrls?.[0])"
        :alt="item.title || item.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <!-- Sponsored overlay gradient -->
      <div
        v-if="item.isSponsored"
        :class="{
          'bg-gradient-to-t from-black/40 via-black/10 to-transparent': isPremierListingTier(item.sponsorshipType),
          'bg-gradient-to-t from-black/30 via-transparent to-transparent': isGoldListingTier(item.sponsorshipType)
        }"
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
      ></div>

      <!-- Type badge (building) -->
      <div v-if="item.type === 'building'" class="absolute left-3 top-3 z-10">
        <div class="flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-1 text-xs font-bold text-white shadow-md ring-1 ring-white/40">
          <span class="material-icons !text-[14px] leading-none" aria-hidden="true">apartment</span>
          <span>{{ $t('common.buildingBadge') }}</span>
        </div>
      </div>

      <!-- Sponsored badge -->
      <div
        v-if="item.isSponsored"
        :class="{
          'bg-primary-950 text-gold-300': isPremierListingTier(item.sponsorshipType),
          'bg-gold-400 text-primary-950': isGoldListingTier(item.sponsorshipType)
        }"
        class="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide shadow-md ring-1 ring-white/40"
      >
        <span class="material-icons !text-[14px] leading-none" aria-hidden="true">star</span>
        <span class="hidden sm:inline">{{ isPremierListingTier(item.sponsorshipType) ? $t('property.premier') : (isGoldListingTier(item.sponsorshipType) ? 'GOLD' : $t('property.sponsored')) }}</span>
      </div>

      <!-- Status pill -->
      <span
        v-if="item.status"
        :class="{
          'bg-green-600/90 text-white': item.status === 'AVAILABLE' || item.status === 'COMPLETED',
          'bg-primary-600/90 text-white': item.status === 'RESERVED' || item.status === 'UNDER_CONSTRUCTION',
          'bg-gray-800/80 text-white': item.status === 'SOLD' || item.status === 'PLANNED'
        }"
        class="absolute bottom-3 left-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm"
      >
        {{ item.status }}
      </span>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-4">
      <!-- Price + category -->
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <template v-if="item.type === 'property'">
            <p v-if="item.priceETB" class="text-xl font-bold tracking-tight text-primary-700">
              {{ formatPrice(item.priceETB, 'ETB') }}<span v-if="item.category === 'FOR_RENTAL'" class="text-sm font-medium text-gray-500">/{{ $t('property.month') || 'mo' }}</span>
            </p>
            <p v-else class="text-base font-semibold text-gray-500">{{ $t('property.priceNotSet') }}</p>
            <p v-if="item.priceUSD" class="text-sm font-medium text-gray-500">{{ formatPrice(item.priceUSD, 'USD') }}</p>
          </template>
          <template v-else>
            <p class="text-xl font-bold tracking-tight text-primary-700">{{ item.totalUnits || 0 }} {{ $t('property.unitsCount') }}</p>
            <p class="text-sm text-gray-500">{{ item.availableUnits || 0 }} {{ $t('property.availableCount') }}</p>
          </template>
        </div>
        <div class="flex shrink-0 flex-col items-end gap-1">
          <span
            v-if="item.category"
            :class="{ 'bg-blue-100 text-blue-700': item.category === 'FOR_SALE', 'bg-green-100 text-green-700': item.category === 'FOR_RENTAL' }"
            class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            {{ item.category === 'FOR_SALE' ? $t('property.saleShort') : $t('property.rentalShort') }}
          </span>
          <span v-if="item.isFullyFurnished" class="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
            {{ $t('property.furnished') }}
          </span>
        </div>
      </div>

      <!-- Title -->
      <h3 class="mt-2 flex items-center gap-1.5 text-base font-semibold text-gray-900">
        <span class="line-clamp-1">{{ item.title || item.name }}</span>
        <VerifiedBadge :level="getVerificationLevel(item)" size="sm" />
      </h3>

      <!-- Location -->
      <p class="mt-1 flex items-center gap-1 text-sm text-gray-500">
        <span class="material-icons !text-[16px] leading-none text-gray-400" aria-hidden="true">location_on</span>
        <span class="truncate">{{ item.city }}{{ item.country ? `, ${item.country}` : '' }}</span>
      </p>

      <!-- Construction progress (buildings) -->
      <div v-if="item.constructionPercentage !== null && item.constructionPercentage !== undefined" class="mt-3">
        <div class="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>{{ $t('property.constructionLabel') }}</span>
          <span class="font-semibold text-gray-700">{{ item.constructionPercentage }}%</span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div class="h-1.5 rounded-full bg-primary-500 transition-all" :style="{ width: item.constructionPercentage + '%' }"></div>
        </div>
      </div>

      <!-- Facts -->
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
        <template v-if="item.type === 'property'">
          <span v-if="item.bedrooms" class="inline-flex items-center gap-1"><span class="material-icons !text-[16px] leading-none text-gray-400" aria-hidden="true">bed</span>{{ item.bedrooms }} {{ $t('property.beds') }}</span>
          <span v-if="item.bathrooms" class="inline-flex items-center gap-1"><span class="material-icons !text-[16px] leading-none text-gray-400" aria-hidden="true">shower</span>{{ item.bathrooms }} {{ $t('property.baths') }}</span>
          <span v-if="item.area" class="inline-flex items-center gap-1"><span class="material-icons !text-[16px] leading-none text-gray-400" aria-hidden="true">square_foot</span>{{ item.area }} {{ $t('property.areaUnit') }}</span>
        </template>
        <template v-else>
          <span class="inline-flex items-center gap-1"><span class="material-icons !text-[16px] leading-none text-gray-400" aria-hidden="true">apartment</span>{{ item.totalUnits || 0 }} {{ $t('property.unitsCount') }}</span>
          <span v-if="item.totalFloors" class="inline-flex items-center gap-1"><span class="material-icons !text-[16px] leading-none text-gray-400" aria-hidden="true">layers</span>{{ item.totalFloors }} {{ $t('building.floorsLabel') }}</span>
          <span v-if="item.availableUnits" class="font-semibold text-green-600">{{ item.availableUnits }} {{ $t('property.availableCount') }}</span>
        </template>
      </div>

      <!-- Company footer -->
      <p v-if="item.realEstateCompanyName" class="mt-auto flex items-center gap-1.5 pt-3 text-xs text-gray-500">
        <svg class="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span class="truncate font-medium">{{ item.realEstateCompanyName }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { mediaUrl } from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice, getVerificationLevel } from '@/shared/utils'
import { VerifiedBadge } from '@/shared/components'
import { isPremierListingTier, isGoldListingTier } from '@/shared/utils/sponsorshipTier'

/**
 * Premium listing card: a photo-forward card with tier/type/status badges on
 * the image, then a prominent price, title + Verified, location, key facts and
 * a company footer. Renders both properties and buildings; the parent decides
 * navigation.
 */
defineProps({
  item: { type: Object, required: true }
})

const formatPrice = (price, currency = 'ETB') => formatCurrencyPrice(price, currency || 'ETB')
</script>

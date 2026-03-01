<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Ad Space under NavBar - PREMIER Sponsored Properties (Two Side by Side) -->
    <div class="bg-zinc-900 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AdSpace 
          v-if="currentPremierAds && currentPremierAds.length > 0"
          size="banner" 
          :ad-contents="currentPremierAds"
        />
        <AdSpace v-else size="banner" />
      </div>
    </div>

    <!-- Top Search Bar with Filters -->
    <div class="bg-zinc-900 shadow-sm border-b border-white/10 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <!-- Search Filters -->
          <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <!-- Service Type Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.serviceType"
                class="w-full appearance-none bg-white/5 border border-white/20 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 cursor-pointer"
              >
                <option value="">{{ $t('home.serviceType') }}</option>
                <option value="rental">{{ $t('home.rental') }}</option>
                <option value="sale">{{ $t('home.sale') }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <!-- Location Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.location"
                class="w-full appearance-none bg-white/5 border border-white/20 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 cursor-pointer"
              >
                <option value="">{{ $t('home.location') }}</option>
                <option value="Bole">{{ $t('home.bole') }}</option>
                <option value="Megenagna">{{ $t('home.megenagna') }}</option>
                <option value="Addis Ababa">{{ $t('home.addisAbaba') }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <!-- Price Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.priceRange"
                class="w-full appearance-none bg-white/5 border border-white/20 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 cursor-pointer"
              >
                <option value="">{{ $t('home.priceRange') }}</option>
                <option value="0-5000">ብ0 - ብ5,000</option>
                <option value="5000-10000">ብ5,000 - ብ10,000</option>
                <option value="10000-20000">ብ10,000 - ብ20,000</option>
                <option value="20000+">ብ20,000+</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <!-- Instant Booking Toggle -->
            <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                v-model="filters.instantBooking"
                class="w-4 h-4 text-yellow-400 border-white/30 rounded focus:ring-yellow-400"
              />
              <span class="text-xs sm:text-sm text-gray-300">{{ $t('home.instantBooking') }}</span>
            </label>

            <!-- Free Cancellation Toggle -->
            <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                v-model="filters.freeCancellation"
                class="w-4 h-4 text-yellow-400 border-white/30 rounded focus:ring-yellow-400"
              />
              <span class="text-xs sm:text-sm text-gray-300">{{ $t('home.freeCancellation') }}</span>
            </label>

            <!-- Clear Filters Button -->
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-3 sm:px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-yellow-400 transition-colors whitespace-nowrap"
            >
              {{ $t('filters.clearFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Property List in Two Columns (anchor for hero CTA) -->
    <div id="main-listings" class="min-h-[calc(100vh-88px)] sm:min-h-[calc(100vh-120px)] bg-black scroll-mt-4">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <!-- Loading State -->
        <div v-if="loadingOrgs" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div v-for="i in 4" :key="i" class="bg-white/10 animate-pulse rounded-xl h-96"></div>
        </div>

        <!-- Search and pagination for organization list -->
        <div v-if="!loadingOrgs && organizationsList.length > 0" class="space-y-4 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <label class="sr-only" for="org-search">{{ $t('home.searchCompanies') }}</label>
            <input
              id="org-search"
              v-model.trim="searchQuery"
              type="search"
              :placeholder="$t('home.searchCompanies')"
              class="flex-1 min-w-0 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-4 py-2.5 text-sm"
            />
            <div class="flex items-center gap-3 text-sm text-gray-400">
              <span>{{ filteredByOrganization.length }} {{ filteredByOrganization.length === 1 ? $t('home.company') : $t('home.companies') }}</span>
            </div>
          </div>
          <div
            v-if="totalOrganizationPages > 1"
            class="flex flex-wrap items-center justify-between gap-2"
          >
            <span class="text-sm text-gray-400">
              {{ $t('common.page') }} {{ organizationListPage }} / {{ totalOrganizationPages }}
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                :disabled="organizationListPage <= 1"
                @click="setOrganizationListPage(organizationListPage - 1)"
                class="px-3 py-1.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50"
              >
                {{ $t('common.previous') }}
              </button>
              <button
                type="button"
                :disabled="organizationListPage >= totalOrganizationPages"
                @click="setOrganizationListPage(organizationListPage + 1)"
                class="px-3 py-1.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50"
              >
                {{ $t('common.next') }}
              </button>
            </div>
          </div>
          <p v-if="searchQuery && filteredByOrganization.length === 0" class="text-gray-400 text-sm">
            {{ $t('home.noCompaniesMatch') }}
          </p>
        </div>

        <!-- Properties and buildings grouped by organization (collapsible, with org details and paging) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" v-if="!loadingOrgs && organizationsList.length > 0 && paginatedOrganizations.length > 0">
          <template v-for="org in paginatedOrganizations" :key="org.id">
            <!-- Collapsible organization header: logo, name, address, contact (from org API) -->
            <div
              class="col-span-full mt-8 first:mt-0 rounded-xl border border-white/10 bg-zinc-900 overflow-hidden"
            >
              <button
                type="button"
                class="w-full text-left px-4 py-4 sm:px-5 sm:py-5 flex flex-wrap items-center gap-3 sm:gap-4 hover:bg-white/5 transition-colors"
                @click="toggleExpanded(org.id)"
              >
                <div
                  v-if="org.logoUrl"
                  class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-white/10"
                >
                  <img
                    :src="mediaUrl(org.logoUrl)"
                    :alt="org.name"
                    class="w-full h-full object-contain"
                  />
                </div>
                <div
                  v-else
                  class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold text-white"
                >
                  {{ (org.name || 'O').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span class="text-yellow-400">🏢</span>
                    {{ org.name }}
                  </h2>
                  <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-gray-400">
                    <span v-if="org.address">{{ org.address }}</span>
                    <span v-if="org.city">{{ org.city }}</span>
                    <template v-if="org.phoneNumber">
                      <a :href="`tel:${org.phoneNumber}`" class="text-yellow-400 hover:underline">{{ org.phoneNumber }}</a>
                    </template>
                    <template v-if="org.email">
                      <a :href="`mailto:${org.email}`" class="text-yellow-400 hover:underline">{{ org.email }}</a>
                    </template>
                    <a v-if="org.website" :href="org.website" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">{{ $t('admin.orgWebsite') }}</a>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500">{{ getFilteredItemsForOrg(org.id).length }} {{ getFilteredItemsForOrg(org.id).length === 1 ? $t('property.title') : $t('property.properties') }}</span>
                  <svg
                    class="w-5 h-5 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': isExpanded(org.id) }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </button>

              <!-- Expanded: paginated property cards (or loading skeleton) -->
              <div v-show="isExpanded(org.id)" class="border-t border-white/10 px-4 py-4 sm:px-5 sm:py-5">
                <div v-if="orgListingsLoading[org.id]" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div v-for="i in 4" :key="i" class="bg-white/10 animate-pulse rounded-xl h-64"></div>
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div
                    v-for="item in getPaginatedItems(getFilteredItemsForOrg(org.id), org.id)"
                    :key="`${item.type}-${item.id}`"
            class="col-span-full md:col-span-1"
            :data-property-id="item.type === 'property' ? item.id : null"
            :data-building-id="item.type === 'building' ? item.id : null"
            @click="item.type === 'property' ? selectProperty(item) : selectBuilding(item)"
            :class="[
              'relative rounded-xl shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-2 hover:border-yellow-400 hover:bg-yellow-500/10',
              item.isSponsored && item.sponsorshipType === 'PREMIER' 
                ? 'bg-zinc-900 border-yellow-400/60 shadow-lg' 
                : item.isSponsored && item.sponsorshipType === 'BASIC'
                ? 'bg-zinc-900 border-blue-400/50 shadow-md'
                : 'bg-zinc-900 border-white/10'
            ]"
          >
            <!-- Sponsored Badges - top right: Featured next to PREMIER/SPONSORED -->
            <div v-if="item.isSponsored" class="absolute top-3 right-3 z-20 flex items-center gap-2">
              <div
                v-if="item.sponsorshipType === 'PREMIER'"
                class="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1"
              >
                <span>👑</span>
                <span>{{ $t('property.featured') }}</span>
              </div>
              <div
                :class="{
                  'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-yellow-900 shadow-2xl': item.sponsorshipType === 'PREMIER',
                  'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-blue-900 shadow-xl': item.sponsorshipType === 'BASIC'
                }"
                class="px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 animate-pulse border-2 border-white"
              >
                <span v-if="item.sponsorshipType === 'PREMIER'" class="text-base">⭐</span>
                <span v-else class="text-base">✨</span>
                <span class="uppercase tracking-wide">{{ item.sponsorshipType === 'PREMIER' ? 'PREMIER' : 'SPONSORED' }}</span>
              </div>
            </div>
            
            <!-- Building Type Badge (for non-sponsored buildings) -->
            <div v-if="item.type === 'building' && !item.isSponsored" class="absolute top-3 left-3 z-20">
              <div class="bg-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
                <span>🏢</span>
                <span>{{ $t('common.buildingBadge') }}</span>
              </div>
            </div>
            
            <!-- Property/Building Image -->
            <div class="relative h-48 sm:h-56 md:h-64 bg-white/10 overflow-hidden">
              <img
                v-if="(item.images && item.images.length > 0) || (item.imageUrls && item.imageUrls.length > 0)"
                :src="item.images?.[0]?.imageUrl || item.imageUrls?.[0]"
                :alt="item.title || item.name"
                :class="{
                  'w-full h-full object-cover transition-transform duration-300': true,
                  'brightness-110 contrast-110 scale-105 hover:scale-110': item.isSponsored && item.sponsorshipType === 'PREMIER',
                  'brightness-105 scale-102 hover:scale-105': item.isSponsored && item.sponsorshipType === 'BASIC'
                }"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg v-if="item.type === 'property'" class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <svg v-else class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-1 4h1m4 0h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <!-- Sponsored Overlay Gradient - More Prominent -->
              <div 
                v-if="item.isSponsored"
                :class="{
                  'absolute inset-0 bg-gradient-to-t from-yellow-400/30 via-yellow-300/10 to-transparent': item.sponsorshipType === 'PREMIER',
                  'absolute inset-0 bg-gradient-to-t from-blue-400/25 via-blue-300/10 to-transparent': item.sponsorshipType === 'BASIC'
                }"
              ></div>
              <!-- Premier Glow Effect -->
              <div 
                v-if="item.isSponsored && item.sponsorshipType === 'PREMIER'"
                class="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-transparent to-amber-200/20 animate-pulse"
              ></div>
            </div>

            <!-- Price/Units overlay above badges so price is never hidden -->
            <div
              v-if="item.type === 'property' && item.priceETB"
              :class="{
                'bg-zinc-800/90 border border-white/20': !item.isSponsored,
                'bg-yellow-500/30 border-2 border-yellow-400 shadow-xl': item.isSponsored && item.sponsorshipType === 'PREMIER',
                'bg-blue-500/30 border-2 border-blue-400 shadow-lg': item.isSponsored && item.sponsorshipType === 'BASIC'
              }"
              class="absolute top-4 left-4 px-3 py-1.5 rounded-lg shadow-md z-30"
            >
              <div class="flex flex-col">
                <span 
                  :class="{
                    'text-white font-bold': !item.isSponsored,
                    'text-yellow-200 font-extrabold': item.isSponsored && item.sponsorshipType === 'PREMIER',
                    'text-blue-200 font-bold': item.isSponsored && item.sponsorshipType === 'BASIC'
                  }"
                  class="text-lg"
                >{{ formatPrice(item.priceETB, 'ETB') }}</span>
                <span 
                  v-if="item.priceUSD"
                  :class="{
                    'text-gray-300': !item.isSponsored,
                    'text-yellow-200/90 font-bold': item.isSponsored && item.sponsorshipType === 'PREMIER',
                    'text-blue-200/90 font-semibold': item.isSponsored && item.sponsorshipType === 'BASIC'
                  }"
                  class="text-sm font-semibold"
                >{{ formatPrice(item.priceUSD, 'USD') }}</span>
                <span v-if="item.category === 'FOR_RENTAL'" class="text-xs text-gray-400">/month</span>
              </div>
            </div>
            <div
              v-else-if="item.type === 'building'"
              class="absolute top-4 left-4 px-3 py-1.5 rounded-lg shadow-md z-30 bg-zinc-800/90 border border-white/20"
            >
              <div class="flex flex-col">
                <span class="text-lg font-bold text-white">{{ item.totalUnits || 0 }} Units</span>
                <span class="text-xs text-gray-400">{{ item.availableUnits || 0 }} Available</span>
              </div>
            </div>

            <!-- Property/Building Details -->
            <div class="p-5">
              <!-- Title and Rating -->
              <div class="flex items-start justify-between mb-2">
                <h3 
                  class="flex-1 pr-2 text-lg font-semibold text-white"
                >{{ item.title || item.name }}</h3>
                <div v-if="item.type === 'property'" class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-300">4.8</span>
                </div>
              </div>

              <!-- Location -->
              <p class="text-sm text-gray-400 mb-3">{{ item.city }}, {{ item.country || 'Ethiopia' }}</p>

              <!-- Property Features (for properties) or Building Info (for buildings) -->
              <div v-if="item.type === 'property'" class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-3">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  <span>{{ item.bedrooms || 'N/A' }} beds</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                  </svg>
                  <span>{{ item.bathrooms || 'N/A' }} baths</span>
                </div>
                <div v-if="item.area" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l9 9m0-9V4m0 4h-4"/>
                  </svg>
                  <span>{{ item.area }} m²</span>
                </div>
              </div>
              
              <!-- Building Features -->
              <div v-else class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-3">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span>{{ item.totalUnits || 0 }} Units</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  <span>{{ item.totalFloors || 'N/A' }} Floors</span>
                </div>
                <div v-if="item.availableUnits" class="flex items-center gap-1">
                  <span class="text-green-400 font-semibold">{{ item.availableUnits }} Available</span>
                </div>
              </div>

              <!-- Property Type/Building Type and Real Estate Company -->
              <div class="flex flex-col gap-2 pt-3 border-t border-white/10">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-500 uppercase">{{ item.type === 'property' ? (item.propertyType || item.type || 'Apartment') : (item.buildingType || 'Building') }}</span>
                  <div class="flex items-center gap-2" v-if="item.type === 'property' && item.agentName">
                    <span class="text-xs text-gray-400">{{ $t('property.agentLabel') }}:</span>
                    <span class="text-xs font-medium text-white">{{ item.agentName }}</span>
                  </div>
                </div>
                <div v-if="item.realEstateCompanyName" class="flex items-center gap-2">
                  <svg class="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span class="text-xs font-semibold text-yellow-400">{{ item.realEstateCompanyName }}</span>
                </div>
              </div>
            </div>
                  </div>
                  <!-- Paging for this organization -->
                  <div v-if="totalPagesForGroup(getFilteredItemsForOrg(org.id)) > 1" class="col-span-full flex flex-wrap items-center justify-between gap-2 pt-4">
                    <span class="text-sm text-gray-400">
                      {{ $t('common.page') }} {{ groupPage[org.id] || 1 }} / {{ totalPagesForGroup(getFilteredItemsForOrg(org.id)) }}
                    </span>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        :disabled="(groupPage[org.id] || 1) <= 1"
                        @click="setGroupPage(org.id, (groupPage[org.id] || 1) - 1)"
                        class="px-3 py-1.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50"
                      >
                        {{ $t('common.previous') }}
                      </button>
                      <button
                        type="button"
                        :disabled="(groupPage[org.id] || 1) >= totalPagesForGroup(getFilteredItemsForOrg(org.id))"
                        @click="setGroupPage(org.id, (groupPage[org.id] || 1) + 1)"
                        class="px-3 py-1.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50"
                      >
                        {{ $t('common.next') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>


        <!-- Empty State -->
        <div v-if="!loadingOrgs && organizationsList.length === 0" class="col-span-full text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-white">{{ $t('home.noPropertiesFound') }}</h3>
            <p class="mt-1 text-sm text-gray-400">{{ $t('home.tryAdjustingFilters') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'
import { AdSpace } from '@/shared/components'
import { useAds } from '@/shared/composables/useAds'

const router = useRouter()
const authStore = useAuthStore()
const { loadAllAds, topAds, getRandomTopAd } = useAds()

const loadingOrgs = ref(false)
const organizationsList = ref([])
const rawOrgListings = ref({})
const orgListingsLoading = ref({})
const currentPremierAdIndex = ref(0)

// Get current top ads (two ads side by side, rotates through available ads)
// These are ads with the highest base_price
const currentPremierAds = computed(() => {
  if (topAds.value.length === 0) return []
  
  const ads = []
  const startIndex = currentPremierAdIndex.value % topAds.value.length
  
  // Get two ads, wrapping around if needed
  for (let i = 0; i < 2; i++) {
    const index = (startIndex + i) % topAds.value.length
    ads.push(topAds.value[index])
  }
  
  return ads
})

const filters = ref({
  serviceType: '',
  location: '',
  priceRange: '',
  instantBooking: false,
  freeCancellation: false
})

// Load real estate organizations (marketplace) – single fast request
async function loadOrganizations() {
  loadingOrgs.value = true
  try {
    const res = await api.get('/organizations/marketplace', {
      params: { type: 'REAL_ESTATE_COMPANY' }
    })
    organizationsList.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Failed to load organizations:', err)
    organizationsList.value = []
  } finally {
    loadingOrgs.value = false
  }
}

// Fetch properties and buildings for one organization (current page only)
async function fetchListingsForOrg(orgId) {
  if (rawOrgListings.value[orgId] !== undefined) return
  orgListingsLoading.value = { ...orgListingsLoading.value, [orgId]: true }
  try {
    const [propsRes, buildsRes] = await Promise.all([
      api.get(`/properties/organization/${orgId}/list`),
      api.get(`/buildings/organization/${orgId}/list`)
    ])
    const properties = Array.isArray(propsRes.data) ? propsRes.data : []
    const buildings = Array.isArray(buildsRes.data) ? buildsRes.data : []
    const combined = [
      ...properties.map((p) => ({ ...p, type: 'property' })),
      ...buildings.map((b) => ({ ...b, type: 'building', title: b.name }))
    ]
    rawOrgListings.value = { ...rawOrgListings.value, [orgId]: combined }
  } catch (err) {
    console.error('Failed to load listings for org:', orgId, err)
    rawOrgListings.value = { ...rawOrgListings.value, [orgId]: [] }
  } finally {
    orgListingsLoading.value = { ...orgListingsLoading.value, [orgId]: false }
  }
}

// Apply location, category, price filters and sort (client-side on fetched data)
function getFilteredItemsForOrg(orgId) {
  const raw = rawOrgListings.value[orgId] || []
  let list = [...raw]
  const { location, serviceType, priceRange } = filters.value
  if (location) {
    list = list.filter(
      (item) => item.city && item.city.toLowerCase() === location.toLowerCase()
    )
  }
  if (serviceType) {
    const category = serviceType === 'rental' ? 'FOR_RENTAL' : 'FOR_SALE'
    list = list.filter((item) => item.category === category)
  }
  if (priceRange && priceRange !== '') {
    list = list.filter((item) => {
      if (item.type === 'building') return true
      const price = item.priceETB || 0
      if (priceRange === '0-5000') return price >= 0 && price <= 5000
      if (priceRange === '5000-10000') return price > 5000 && price <= 10000
      if (priceRange === '10000-20000') return price > 10000 && price <= 20000
      if (priceRange === '20000+') return price > 20000
      return true
    })
  }
  list.sort((a, b) => {
    const aPriority =
      a.isSponsored && a.sponsorshipType === 'PREMIER'
        ? 0
        : a.isSponsored && a.sponsorshipType === 'BASIC'
          ? 1
          : 2
    const bPriority =
      b.isSponsored && b.sponsorshipType === 'PREMIER'
        ? 0
        : b.isSponsored && b.sponsorshipType === 'BASIC'
          ? 1
          : 2
    if (aPriority !== bPriority) return aPriority - bPriority
    const aDate = new Date(a.createdAt || 0)
    const bDate = new Date(b.createdAt || 0)
    return bDate - aDate
  })
  return list
}

const selectBuilding = (building) => {
  router.push(`/buildings/${building.id}`)
}

const selectProperty = (property) => {
  if (property.type === 'building') {
    selectBuilding(property)
    return
  }
  // Navigate directly to property details page
  router.push(`/properties/${property.id}`)
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const PAGE_SIZE = 6
const expandedGroups = ref({})
const groupPage = ref({})

function isExpanded(groupKey) {
  return expandedGroups.value[groupKey] !== false
}
function toggleExpanded(groupKey) {
  expandedGroups.value = { ...expandedGroups.value, [groupKey]: !isExpanded(groupKey) }
}

function getPaginatedItems(items, groupKey) {
  const page = groupPage.value[groupKey] || 1
  const start = (page - 1) * PAGE_SIZE
  return items.slice(start, start + PAGE_SIZE)
}
function totalPagesForGroup(items) {
  return Math.max(1, Math.ceil((items?.length || 0) / PAGE_SIZE))
}
function setGroupPage(groupKey, page) {
  groupPage.value = { ...groupPage.value, [groupKey]: page }
}

function mediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_API_BASE_URL || ''
  return base ? `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}` : url
}

// Search and pagination for the organization list (orgs from API have name, address, etc.)
const searchQuery = ref('')
const ORGANIZATIONS_PER_PAGE = 5
const organizationListPage = ref(1)

const filteredByOrganization = computed(() => {
  const orgs = organizationsList.value || []
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return orgs
  return orgs.filter((org) => {
    const name = (org.name || '').toLowerCase()
    const address = (org.address || '').toLowerCase()
    const city = (org.city || '').toLowerCase()
    const country = (org.country || '').toLowerCase()
    const email = (org.email || '').toLowerCase()
    const phone = (org.phoneNumber || '').replace(/\s/g, '')
    const website = (org.website || '').toLowerCase()
    const qNorm = q.replace(/\s/g, '')
    return (
      name.includes(q) ||
      address.includes(q) ||
      city.includes(q) ||
      country.includes(q) ||
      email.includes(q) ||
      phone.includes(qNorm) ||
      website.includes(q)
    )
  })
})

const totalOrganizationPages = computed(() =>
  Math.max(1, Math.ceil(filteredByOrganization.value.length / ORGANIZATIONS_PER_PAGE))
)

const paginatedOrganizations = computed(() => {
  const list = filteredByOrganization.value
  const page = organizationListPage.value
  const start = (page - 1) * ORGANIZATIONS_PER_PAGE
  return list.slice(start, start + ORGANIZATIONS_PER_PAGE)
})

function setOrganizationListPage(page) {
  organizationListPage.value = Math.max(1, Math.min(page, totalOrganizationPages.value))
}

watch(searchQuery, () => {
  organizationListPage.value = 1
})

watch(totalOrganizationPages, (total) => {
  if (organizationListPage.value > total) organizationListPage.value = 1
})

// When the current page of orgs changes, fetch listings for any org we don't have yet
watch(
  paginatedOrganizations,
  (orgs) => {
    orgs.forEach((org) => {
      if (org?.id && rawOrgListings.value[org.id] === undefined && !orgListingsLoading.value[org.id]) {
        fetchListingsForOrg(org.id)
      }
    })
  },
  { immediate: true, deep: true }
)

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.value.serviceType !== '' ||
         filters.value.location !== '' ||
         filters.value.priceRange !== '' ||
         filters.value.instantBooking ||
         filters.value.freeCancellation
})

// Clear all filters
const clearFilters = () => {
  filters.value = {
    serviceType: '',
    location: '',
    priceRange: '',
    instantBooking: false,
    freeCancellation: false
  }
}

// Rotate premier ads every 10 seconds
let adRotationInterval = null

onMounted(() => {
  loadOrganizations()
  loadAllAds(20).then(() => {
    // Start rotating top ads (highest base_price) every 10 seconds
    adRotationInterval = setInterval(() => {
      if (topAds.value.length > 0) {
        currentPremierAdIndex.value = (currentPremierAdIndex.value + 1) % topAds.value.length
      }
    }, 10000)
  })
})

// Cleanup interval on unmount
onUnmounted(() => {
  if (adRotationInterval) {
    clearInterval(adRotationInterval)
  }
})
</script>

<style scoped>
/* Custom scrollbar - dark theme */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #27272a;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #52525b;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa;
}
</style>
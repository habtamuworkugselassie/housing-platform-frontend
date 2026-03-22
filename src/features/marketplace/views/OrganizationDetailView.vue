<template>
  <div class="min-h-screen bg-black text-white">
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="text-center">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-400" />
        <p class="mt-4 text-gray-400">Loading organization details...</p>
      </div>
    </div>

    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
        {{ error }}
      </div>
    </div>

    <div v-else-if="organization" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <button
        @click="goBack"
        type="button"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-yellow-400 focus:outline-none"
      >
        <span aria-hidden="true">&larr;</span>
        <span>{{ $t('common.back') }}</span>
      </button>

      <section class="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <div class="relative h-56 sm:h-72 lg:h-80 bg-white/10">
          <template v-if="currentMedia">
            <img
              v-if="!currentMediaIsVideo"
              :src="currentMediaUrl"
              :alt="organization.name"
              class="h-full w-full object-contain bg-zinc-950/50"
            />
            <video
              v-else
              :key="currentMediaUrl"
              :src="currentMediaUrl"
              class="h-full w-full object-contain bg-zinc-950/50"
              autoplay
              muted
              playsinline
              controls
              preload="auto"
            />
          </template>
          <div v-else class="flex h-full items-center justify-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-3xl font-bold text-white">
              {{ organizationInitial }}
            </div>
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            v-if="galleryMedia.length > 1"
            type="button"
            class="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-yellow-400 hover:text-black"
            @click="previousMedia"
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <button
            v-if="galleryMedia.length > 1"
            type="button"
            class="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-yellow-400 hover:text-black"
            @click="nextMedia"
          >
            <span aria-hidden="true">&gt;</span>
          </button>

          <div class="absolute right-4 top-4 flex items-center gap-2">
            <span class="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-wide text-gray-100">
              {{ orgTypeLabel }}
            </span>
            <span :class="statusBadgeClass" class="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              {{ organization.status || 'N/A' }}
            </span>
          </div>

          <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div class="flex items-end gap-4">
              <div v-if="organization.logoUrl" class="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 bg-white shadow-lg">
                <img :src="mediaUrl(organization.logoUrl)" :alt="organization.name" class="h-full w-full object-contain p-1" />
              </div>
              <div v-else class="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-xl border-2 border-white/20 bg-zinc-800 text-2xl font-bold text-white shadow-lg">
                {{ organizationInitial }}
              </div>
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-white drop-shadow-md flex items-center flex-wrap gap-2">
                  {{ organization.name }}
                  <VerifiedBadge :level="getVerificationLevel(organization)" size="md" />
                </h1>
                <p class="mt-1 text-sm text-gray-200 drop-shadow-md">{{ locationText || 'Location not provided' }}</p>
                <div
                  v-if="hasSocialLinks"
                  class="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3"
                >
                  <OrganizationSocialLinks
                    compact
                    :facebook-url="organization.facebookUrl"
                    :instagram-url="organization.instagramUrl"
                    :linkedin-url="organization.linkedinUrl"
                    :twitter-url="organization.twitterUrl"
                    :youtube-url="organization.youtubeUrl"
                  />
                </div>
              </div>
            </div>
            <div v-if="galleryMedia.length > 1" class="mt-4 flex flex-wrap items-center gap-2">
              <button
                v-for="(item, index) in galleryMedia"
                :key="item.id || item.url || index"
                type="button"
                :class="[
                  'h-12 w-16 overflow-hidden rounded-md border-2 object-cover transition-all',
                  currentMediaIndex === index ? 'border-yellow-400 opacity-100 shadow-md transform scale-105 bg-white/10' : 'border-transparent opacity-60 hover:opacity-100 bg-white/5 hover:border-white/30'
                ]"
                @click="currentMediaIndex = index"
              >
                <template v-if="!isVideoItem(item)">
                  <img
                    :src="mediaUrl(item.url)"
                    :alt="organization.name"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                </template>
                <template v-else>
                  <video
                    :src="mediaUrl(item.url)"
                    class="h-full w-full object-cover"
                    muted
                    playsinline
                    preload="none"
                  />
                </template>
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 border-t border-white/10 bg-white/5 p-3 sm:grid-cols-4 sm:p-4">
          <div class="rounded-lg border border-white/10 bg-zinc-900/60 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500">Contact Channels</p>
            <p class="mt-1 text-lg font-semibold text-white">{{ contactChannelsCount }}</p>
          </div>
          <div class="rounded-lg border border-white/10 bg-zinc-900/60 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500">Phone Lines</p>
            <p class="mt-1 text-lg font-semibold text-white">{{ organizationPhoneDisplay.length }}</p>
          </div>
          <div class="rounded-lg border border-white/10 bg-zinc-900/60 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500">Media Items</p>
            <p class="mt-1 text-lg font-semibold text-white">{{ galleryMedia.length }}</p>
          </div>
          <div class="rounded-lg border border-white/10 bg-zinc-900/60 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500">Registered</p>
            <p class="mt-1 text-sm font-semibold text-white">{{ createdAtDisplay || 'N/A' }}</p>
          </div>
        </div>
      </section>

      <section class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
            <h2 class="text-xl font-bold text-white">Organization Profile</h2>
            <p v-if="organization.description" class="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-300">
              {{ organization.description }}
            </p>
            <p v-else class="mt-4 text-sm text-gray-500">
              No organization description available.
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
            <h2 class="text-xl font-bold text-white">Business Information</h2>
            <dl class="mt-5 space-y-3">
              <div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt class="text-sm font-medium text-gray-400">{{ $t('admin.orgType') }}</dt>
                <dd class="text-sm font-semibold text-white text-right">{{ orgTypeLabel }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt class="text-sm font-medium text-gray-400">Status</dt>
                <dd class="text-sm font-semibold text-white text-right">{{ organization.status || 'N/A' }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt class="text-sm font-medium text-gray-400">{{ $t('admin.registrationNumber') }}</dt>
                <dd class="text-sm font-semibold text-white text-right">{{ organization.registrationNumber || 'N/A' }}</dd>
              </div>
              <div class="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                <dt class="text-sm font-medium text-gray-400">{{ $t('admin.orgAddress') }}</dt>
                <dd class="text-sm font-semibold text-white text-right max-w-[65%]">{{ organization.address || 'N/A' }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt class="text-sm font-medium text-gray-400">{{ $t('admin.orgCity') }}</dt>
                <dd class="text-sm font-semibold text-white text-right">{{ organization.city || 'N/A' }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt class="text-sm font-medium text-gray-400">{{ $t('admin.orgCountry') }}</dt>
                <dd class="text-sm font-semibold text-white text-right">{{ organization.country || 'N/A' }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-sm font-medium text-gray-400">{{ $t('admin.orgWebsite') }}</dt>
                <dd class="text-sm font-semibold text-right">
                  <a
                    v-if="organization.website"
                    :href="websiteHref"
                    target="_blank"
                    rel="noopener"
                    class="text-yellow-300 hover:text-yellow-200 hover:underline"
                  >
                    {{ websiteDisplay }}
                  </a>
                  <span v-else class="text-white">N/A</span>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Location map: only when organization has coordinates -->
          <div class="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
            <h2 class="text-xl font-bold text-white mb-4">{{ $t('building.locationMap') }}</h2>
            <OsmMap
              v-if="organization.latitude != null && organization.longitude != null"
              :latitude="organization.latitude"
              :longitude="organization.longitude"
              :marker-title="organization.name"
              height="320px"
              :zoom="14"
            />
            <a
              v-if="organization.latitude != null && organization.longitude != null"
              :href="googleMapsDirectionsUrl(organization.latitude, organization.longitude)"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {{ $t('common.openInGoogleMaps') || 'Open in Google Maps' }}
            </a>
            <div
              v-else
              class="bg-white/10 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center"
              style="height: 280px;"
            >
              <p class="text-gray-400 px-4">{{ $t('property.locationNotAvailable') || 'Location not available' }}</p>
            </div>
          </div>

          <div class="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-xl font-bold text-white">Media Gallery</h2>
              <p class="text-xs text-gray-400">{{ imageMedia.length }} images, {{ videoMedia.length }} videos</p>
            </div>
            <div v-if="galleryMedia.length" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                v-for="(item, index) in galleryMedia"
                :key="item.id || item.url || index"
                type="button"
                class="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5"
                @click="openGallery(index)"
              >
                <img
                  v-if="!isVideoItem(item)"
                  :src="mediaUrl(item.url)"
                  :alt="organization.name"
                  class="h-24 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
                <video
                  v-else
                  :src="mediaUrl(item.url)"
                  class="h-24 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  muted
                  playsinline
                  preload="none"
                />
                <span
                  :class="[
                    'absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-black/60 text-white'
                  ]"
                >
                  {{ item.mediaKind || 'MEDIA' }}
                </span>
              </button>
            </div>
            <p v-else class="mt-4 text-sm text-gray-500">No media uploaded for this organization.</p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
            <h2 class="text-xl font-bold text-white">Contact Information</h2>
            <div class="mt-4 space-y-3 text-sm">
              <div v-if="organizationPhoneDisplay.length" class="rounded-lg border border-white/10 bg-white/5 p-3">
                <p class="text-xs uppercase tracking-wide text-gray-500">{{ $t('admin.orgPhone') }}</p>
                <div class="mt-2 space-y-1">
                  <a
                    v-for="(phone, index) in organizationPhoneDisplay"
                    :key="`${phone}-${index}`"
                    :href="`tel:${phone}`"
                    class="block text-yellow-300 hover:text-yellow-200 hover:underline"
                  >
                    {{ phone }}
                  </a>
                </div>
              </div>

              <div class="rounded-lg border border-white/10 bg-white/5 p-3">
                <p class="text-xs uppercase tracking-wide text-gray-500">{{ $t('admin.orgEmail') }}</p>
                <a
                  v-if="organization.email"
                  :href="`mailto:${organization.email}`"
                  class="mt-2 block text-yellow-300 hover:text-yellow-200 hover:underline break-all"
                >
                  {{ organization.email }}
                </a>
                <p v-else class="mt-2 text-white">N/A</p>
              </div>

              <div class="rounded-lg border border-white/10 bg-white/5 p-3">
                <p class="text-xs uppercase tracking-wide text-gray-500">{{ $t('admin.orgWebsite') }}</p>
                <a
                  v-if="organization.website"
                  :href="websiteHref"
                  target="_blank"
                  rel="noopener"
                  class="mt-2 block text-yellow-300 hover:text-yellow-200 hover:underline break-all"
                >
                  {{ websiteDisplay }}
                </a>
                <p v-else class="mt-2 text-white">N/A</p>
              </div>

              <div v-if="hasSocialLinks" class="rounded-lg border border-white/10 bg-white/5 p-3">
                <OrganizationSocialLinks
                  :facebook-url="organization.facebookUrl"
                  :instagram-url="organization.instagramUrl"
                  :linkedin-url="organization.linkedinUrl"
                  :twitter-url="organization.twitterUrl"
                  :youtube-url="organization.youtubeUrl"
                />
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
            <h2 class="text-xl font-bold text-white">Activity Log</h2>
            <div v-if="timelineEntries.length" class="mt-4 space-y-3">
              <div
                v-for="entry in timelineEntries"
                :key="entry.key"
                class="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <p class="text-xs uppercase tracking-wide text-gray-500">{{ entry.label }}</p>
                <p class="mt-1 text-sm font-semibold text-white">{{ entry.value }}</p>
              </div>
            </div>
            <p v-else class="mt-4 text-sm text-gray-500">No activity logs available.</p>
          </div>
        </div>
      </section>

      <section id="properties-section" v-if="organization.type === 'REAL_ESTATE_COMPANY'" class="mt-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white">{{ t('property.propertiesAndBuildings') || 'Properties & Buildings' }}</h2>
        </div>
        
        <div v-if="loadingLinkedItems" class="flex items-center justify-center py-12">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-400"></div>
        </div>
        
        <div v-else-if="linkedItems.length">
          <div class="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in paginatedLinkedItems"
              :key="`${item.type}-${item.id}`"
            :class="{
              'bg-zinc-900 border border-white/10 rounded-lg overflow-hidden transition-all cursor-pointer hover:border-yellow-400 hover:bg-yellow-500/20': !item.isSponsored,
              'bg-zinc-900 border-2 border-yellow-400 rounded-lg overflow-hidden transition-all cursor-pointer hover:bg-yellow-500/20': item.isSponsored && isPremierListingTier(item.sponsorshipType),
              'bg-zinc-900 border-2 border-blue-400/60 rounded-lg overflow-hidden transition-all cursor-pointer hover:border-yellow-400 hover:bg-yellow-500/20': item.isSponsored && isGoldListingTier(item.sponsorshipType)
            }"
            @click="item.type === 'property' ? $router.push(`/properties/${item.id}`) : $router.push(`/buildings/${item.id}`)"
          >
            <!-- Type Badge (Building) -->
            <div v-if="item.type === 'building'" class="absolute top-2 left-2 z-20">
              <div class="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
                <span>🏢</span>
                <span>{{ $t('common.buildingBadge') }}</span>
              </div>
            </div>
            
            <!-- Sponsored Badge -->
            <div v-if="item.isSponsored" class="relative">
              <div
                :class="{
                  'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-yellow-900 shadow-2xl': isPremierListingTier(item.sponsorshipType),
                  'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-blue-900 shadow-xl': isGoldListingTier(item.sponsorshipType)
                }"
                class="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-extrabold z-20 flex items-center gap-1 sm:gap-1.5 animate-pulse border-2 border-white"
              >
                <span v-if="isPremierListingTier(item.sponsorshipType)" class="text-sm sm:text-base">⭐</span>
                <span v-else class="text-sm sm:text-base">✨</span>
                <span class="hidden sm:inline uppercase tracking-wide">{{ isPremierListingTier(item.sponsorshipType) ? $t('property.premier') : (isGoldListingTier(item.sponsorshipType) ? 'GOLD' : $t('property.sponsored')) }}</span>
                <span class="sm:hidden uppercase">{{ isPremierListingTier(item.sponsorshipType) ? 'P' : 'S' }}</span>
              </div>
              <div v-if="isPremierListingTier(item.sponsorshipType) && item.type === 'property'" class="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
                <div class="bg-yellow-400 text-yellow-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
                  <span class="text-xs sm:text-sm">👑</span>
                  <span class="hidden sm:inline">{{ $t('property.featured') }}</span>
                </div>
              </div>
            </div>
            
            <div class="h-40 sm:h-48 bg-zinc-800 flex items-center justify-center relative overflow-hidden">
              <span v-if="!item.images && !item.imageUrls" class="text-gray-500 text-4xl">{{ item.type === 'property' ? '🏠' : '🏢' }}</span>
              <img
                v-else
                :src="mediaUrl(item.images?.[0]?.imageUrl || item.imageUrls?.[0] || '')"
                :alt="item.title || item.name"
                :class="{
                  'w-full h-full object-cover transition-transform duration-300': true,
                  'brightness-110 contrast-110 scale-105 hover:scale-110': item.isSponsored && isPremierListingTier(item.sponsorshipType),
                  'brightness-105 scale-102 hover:scale-105': item.isSponsored && isGoldListingTier(item.sponsorshipType)
                }"
              />
              <div 
                v-if="item.isSponsored"
                :class="{
                  'absolute inset-0 bg-gradient-to-t from-yellow-400/30 via-yellow-300/10 to-transparent': isPremierListingTier(item.sponsorshipType),
                  'absolute inset-0 bg-gradient-to-t from-blue-400/25 via-blue-300/10 to-transparent': isGoldListingTier(item.sponsorshipType)
                }"
              ></div>
              <div 
                v-if="item.isSponsored && isPremierListingTier(item.sponsorshipType)"
                class="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-transparent to-amber-200/20 animate-pulse"
              ></div>
            </div>
            <div class="p-4 sm:p-6">
              <div class="flex items-start justify-between mb-2">
                <h3 class="flex-1 pr-2 text-lg sm:text-xl font-semibold text-white">{{ item.title || item.name }}</h3>
              </div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <template v-if="item.type === 'property'">
                  <div class="flex flex-col gap-1">
                    <p v-if="item.priceETB" class="text-xl sm:text-2xl font-bold text-yellow-400">{{ formatPrice(item.priceETB, 'ETB') }}</p>
                    <p v-if="item.priceUSD" class="text-base sm:text-lg font-semibold text-gray-400">{{ formatPrice(item.priceUSD, 'USD') }}</p>
                    <p v-if="!item.priceETB && !item.priceUSD" class="text-base sm:text-lg text-gray-500">
                      {{ $t('property.priceNotSet') }}
                    </p>
                  </div>
                </template>
                <template v-else>
                  <div class="flex flex-col gap-1">
                    <p class="text-xl sm:text-2xl font-bold text-yellow-400">{{ item.totalUnits || 0 }} {{ $t('property.unitsCount') }}</p>
                    <p class="text-sm text-gray-400">{{ item.availableUnits || 0 }} {{ $t('property.availableCount') }}</p>
                  </div>
                </template>
                <span v-if="item.category" :class="{
                  'bg-blue-500/30 text-blue-200': item.category === 'FOR_SALE',
                  'bg-green-500/30 text-green-200': item.category === 'FOR_RENTAL'
                }" class="px-2 py-0.5 rounded text-xs font-medium">
                  {{ item.category === 'FOR_SALE' ? $t('property.saleShort') : $t('property.rentalShort') }}
                </span>
                <span v-if="item.isFullyFurnished" class="px-2 py-0.5 bg-purple-500/30 text-purple-200 rounded text-xs font-medium">
                  {{ $t('property.furnished') }}
                </span>
              </div>
              <p class="text-sm text-gray-400 mb-2">
                📍 {{ item.city }}, {{ item.country }}
              </p>
              <div v-if="item.constructionPercentage !== null && item.constructionPercentage !== undefined" class="mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">{{ $t('property.constructionLabel') }}:</span>
                  <div class="flex-1 bg-zinc-700 rounded-full h-2">
                    <div 
                      class="bg-yellow-400 h-2 rounded-full transition-all"
                      :style="{ width: item.constructionPercentage + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-400">{{ item.constructionPercentage }}%</span>
                </div>
              </div>
              <div v-if="item.type === 'property'" class="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 gap-2 sm:gap-4">
                <span v-if="item.bedrooms">🛏️ {{ item.bedrooms }} {{ $t('property.beds') }}</span>
                <span v-if="item.bathrooms">🚿 {{ item.bathrooms }} {{ $t('property.baths') }}</span>
                <span v-if="item.area">📐 {{ item.area }} {{ $t('property.areaUnit') }}</span>
              </div>
              <div v-else class="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 gap-2 sm:gap-4">
                <span>🏢 {{ item.totalUnits || 0 }} {{ $t('property.unitsCount') }}</span>
                <span v-if="item.totalFloors">📊 {{ item.totalFloors }} {{ $t('building.floorsLabel') }}</span>
                <span v-if="item.availableUnits" class="text-green-400 font-semibold">{{ item.availableUnits }} {{ $t('property.availableCount') }}</span>
              </div>
              <div class="mt-4 flex items-center justify-between">
                <span
                  :class="{
                    'bg-green-500/30 text-green-200': item.status === 'AVAILABLE' || item.status === 'COMPLETED',
                    'bg-yellow-500/30 text-yellow-200': item.status === 'RESERVED' || item.status === 'UNDER_CONSTRUCTION',
                    'bg-gray-500/30 text-gray-300': item.status === 'SOLD' || item.status === 'PLANNED'
                  }"
                  class="inline-block px-2 py-1 text-xs font-semibold rounded"
                >
                  {{ item.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="linkedItemsTotalPages > 1" class="mt-8 flex justify-center">
          <nav class="flex space-x-2">
              <button
                @click="changeLinkedItemsPage(linkedItemsPage - 1)"
                :disabled="linkedItemsPage === 0"
                class="px-4 py-2 rounded-md text-sm font-medium bg-white text-black hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50 transition-colors"
              >
                {{ $t('common.previous') || 'Previous' }}
              </button>
              <span class="px-4 py-2 text-sm text-gray-300">
                {{ $t('common.page') || 'Page' }} {{ linkedItemsPage + 1 }} {{ $t('common.of') || 'of' }} {{ linkedItemsTotalPages }}
              </span>
              <button
                @click="changeLinkedItemsPage(linkedItemsPage + 1)"
                :disabled="linkedItemsPage >= linkedItemsTotalPages - 1"
                class="px-4 py-2 rounded-md text-sm font-medium bg-white text-black hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50 transition-colors"
              >
                {{ $t('common.next') || 'Next' }}
              </button>
            </nav>
          </div>
        </div>
        
        <div v-else class="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
          <p class="text-gray-400">{{ t('property.noPropertiesOrBuildings') || 'No properties or buildings found.' }}</p>
        </div>
      </section>

    <!-- Gallery Modal -->
    <div
      v-if="showGalleryModal && galleryMedia.length > 0"
      class="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
      @click.self="showGalleryModal = false"
    >
      <button
        @click="showGalleryModal = false"
        class="absolute top-4 right-4 text-white hover:text-yellow-400 z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="w-full h-full flex flex-col">
        <!-- Main Image -->
        <div class="flex-1 flex items-center justify-center p-4">
          <img
            v-if="!isVideoItem(galleryMedia[galleryIndex])"
            :src="mediaUrl(galleryMedia[galleryIndex]?.url)"
            :alt="`${organization?.name} - Image ${galleryIndex + 1}`"
            class="max-w-full max-h-full object-contain"
          />
          <video
            v-else
            :src="mediaUrl(galleryMedia[galleryIndex]?.url)"
            class="max-w-full max-h-full object-contain"
            controls
            autoplay
            muted
            playsinline
            preload="metadata"
          />
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between p-4 bg-black/50">
          <button
            @click="previousGalleryImage"
            class="text-white hover:text-gray-300 p-2"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div class="flex-1 text-center text-white">
            <p class="text-sm font-medium">{{ galleryIndex + 1 }} / {{ galleryMedia.length }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ organization?.name }}</p>
          </div>

          <button
            @click="nextGalleryImage"
            class="text-white hover:text-gray-300 p-2"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Thumbnail Strip -->
        <div class="p-4 bg-black/50 overflow-x-auto">
          <div class="flex gap-2 justify-center">
            <button
              v-for="(item, index) in galleryMedia"
              :key="index"
              @click="galleryIndex = index"
              :class="[
                'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                galleryIndex === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-75'
              ]"
            >
              <img
                v-if="!isVideoItem(item)"
                :src="mediaUrl(item.url)"
                :alt="`Thumbnail ${index + 1}`"
                class="w-full h-full object-cover"
              />
              <video
                v-else
                :src="mediaUrl(item.url)"
                class="w-full h-full object-cover"
                muted
                playsinline
                preload="none"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div> <!-- Closes the organization block -->

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="rounded-xl border border-white/10 bg-zinc-900 p-6 text-center">
        <p class="text-gray-400">Organization not found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api, { mediaUrl } from '@/shared/api/client'
import { useMediaWarmup } from '@/shared/composables/useMediaWarmup'
import { formatOrganizationPhones, formatPrice as formatCurrencyPrice, getVerificationLevel } from '@/shared/utils'
import { VerifiedBadge, OsmMap } from '@/shared/components'
import OrganizationSocialLinks from '@/shared/components/OrganizationSocialLinks.vue'
import {
  isPremierListingTier,
  isGoldListingTier,
  listingSortTierRank
} from '@/shared/utils/sponsorshipTier'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const organization = ref(null)
const loading = ref(true)
const error = ref(null)
const currentMediaIndex = ref(0)
const showGalleryModal = ref(false)
const galleryIndex = ref(0)

const linkedItems = ref([])
const loadingLinkedItems = ref(false)

const linkedItemsPage = ref(0)
const linkedItemsPageSize = 9

const paginatedLinkedItems = computed(() => {
  const start = linkedItemsPage.value * linkedItemsPageSize
  const end = start + linkedItemsPageSize
  return linkedItems.value.slice(start, end)
})

const linkedItemsTotalPages = computed(() => {
  return Math.ceil(linkedItems.value.length / linkedItemsPageSize)
})

const changeLinkedItemsPage = (page) => {
  if (page >= 0 && page < linkedItemsTotalPages.value) {
    linkedItemsPage.value = page
    const section = document.getElementById('properties-section')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

const typeToLabelKey = {
  REAL_ESTATE_COMPANY: 'nav.marketplaceRealEstate',
  BANK: 'nav.marketplaceBanks',
  INSURANCE: 'nav.marketplaceInsurance',
  CONTRACTOR: 'nav.marketplaceContractors',
  CONSULTANT_ARCHITECT: 'nav.marketplaceConsultantsArchitects',
  SUPPLIER: 'nav.marketplaceSuppliers',
  FINISHING_CONTRACTOR: 'nav.marketplaceFinishingWork',
  DEVELOPER: 'admin.typeDeveloper'
}

const orgTypeLabel = computed(() => {
  const type = organization.value?.type
  if (!type) return 'N/A'
  const key = typeToLabelKey[type] || ''
  return key ? t(key) : type
})

const organizationInitial = computed(() => (organization.value?.name || 'O').charAt(0).toUpperCase())

const organizationPhoneDisplay = computed(() => formatOrganizationPhones(organization.value || {}))

const locationText = computed(() => {
  const org = organization.value || {}
  const cityCountry = [org.city, org.country].filter(Boolean).join(', ')
  if (cityCountry) return cityCountry
  return org.address || ''
})

const galleryMedia = computed(() => {
  const org = organization.value || {}
  const items = []
  const seen = new Set()

  const mediaList = Array.isArray(org.media) ? org.media : []
  mediaList.forEach((item) => {
    if (!item?.url || seen.has(item.url)) return
    if (item.mediaKind === 'LOGO') return
    items.push({
      id: item.id || item.url,
      url: item.url,
      mediaKind: item.mediaKind || 'MEDIA'
    })
    seen.add(item.url)
  })

  return items
})

const organizationMediaUrlsForWarmup = computed(() => {
  const org = organization.value
  if (!org) return []
  const urls = []
  if (org.logoUrl) urls.push(org.logoUrl)
  galleryMedia.value.forEach((item) => {
    if (item?.url) urls.push(item.url)
  })
  return urls
})

useMediaWarmup(organizationMediaUrlsForWarmup)

const isVideoItem = (item) => {
  const kind = String(item?.mediaKind || '').toUpperCase()
  if (kind === 'VIDEO') return true
  return /\.((mp4)|(mov)|(avi)|(webm)|(mkv))($|\?)/i.test(String(item?.url || ''))
}

const currentMedia = computed(() => {
  if (!galleryMedia.value.length) return null
  return galleryMedia.value[currentMediaIndex.value] || galleryMedia.value[0]
})

const currentMediaIsVideo = computed(() => isVideoItem(currentMedia.value))
const currentMediaUrl = computed(() => (currentMedia.value?.url ? mediaUrl(currentMedia.value.url) : ''))

const imageMedia = computed(() => galleryMedia.value.filter((item) => !isVideoItem(item)))
const videoMedia = computed(() => galleryMedia.value.filter((item) => isVideoItem(item)))

const websiteHref = computed(() => {
  const website = String(organization.value?.website || '').trim()
  if (!website) return ''
  if (/^https?:\/\//i.test(website)) return website
  return `https://${website}`
})

const websiteDisplay = computed(() => {
  const website = String(organization.value?.website || '').trim()
  if (!website) return ''
  return website.replace(/^https?:\/\//i, '').replace(/\/$/, '')
})

const hasSocialLinks = computed(() => {
  const o = organization.value || {}
  return ['facebookUrl', 'instagramUrl', 'linkedinUrl', 'twitterUrl', 'youtubeUrl'].some(
    (k) => String(o[k] || '').trim()
  )
})

const contactChannelsCount = computed(() => {
  let count = 0
  if (organizationPhoneDisplay.value.length) count += 1
  if (organization.value?.email) count += 1
  if (organization.value?.website) count += 1
  const o = organization.value || {}
  ;['facebookUrl', 'instagramUrl', 'linkedinUrl', 'twitterUrl', 'youtubeUrl'].forEach((k) => {
    if (String(o[k] || '').trim()) count += 1
  })
  return count
})

const createdAtDisplay = computed(() => formatDate(organization.value?.createdAt))

const timelineEntries = computed(() => {
  const org = organization.value || {}
  const candidates = [
    { key: 'createdAt', label: 'Created', value: org.createdAt },
    { key: 'updatedAt', label: 'Last Updated', value: org.updatedAt },
    { key: 'approvedAt', label: 'Approved', value: org.approvedAt },
    { key: 'rejectedAt', label: 'Rejected', value: org.rejectedAt },
    { key: 'suspendedAt', label: 'Suspended', value: org.suspendedAt }
  ]
  return candidates
    .filter((entry) => entry.value)
    .map((entry) => ({
      key: entry.key,
      label: entry.label,
      value: formatDate(entry.value)
    }))
})

const statusBadgeClass = computed(() => {
  const status = String(organization.value?.status || '').toUpperCase()
  if (status === 'APPROVED') return 'border-green-400/50 bg-green-500/30 text-green-200'
  if (status === 'PENDING' || status === 'PENDING_APPROVAL') return 'border-yellow-400/50 bg-yellow-500/30 text-yellow-200'
  if (status === 'SUSPENDED') return 'border-orange-400/50 bg-orange-500/30 text-orange-200'
  if (!status) return 'border-white/20 bg-white/10 text-gray-200'
  return 'border-red-400/50 bg-red-500/30 text-red-200'
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/marketplace/banks')
  }
}

function previousMedia() {
  if (!galleryMedia.value.length) return
  currentMediaIndex.value = (currentMediaIndex.value - 1 + galleryMedia.value.length) % galleryMedia.value.length
}

function nextMedia() {
  if (!galleryMedia.value.length) return
  currentMediaIndex.value = (currentMediaIndex.value + 1) % galleryMedia.value.length
}

const openGallery = (index) => {
  galleryIndex.value = index
  showGalleryModal.value = true
}

const nextGalleryImage = () => {
  if (galleryMedia.value && galleryMedia.value.length > 0) {
    galleryIndex.value = (galleryIndex.value + 1) % galleryMedia.value.length
  }
}

const previousGalleryImage = () => {
  if (galleryMedia.value && galleryMedia.value.length > 0) {
    galleryIndex.value = galleryIndex.value === 0 
      ? galleryMedia.value.length - 1 
      : galleryIndex.value - 1
  }
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const googleMapsDirectionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const loadLinkedItems = async () => {
  if (!organization.value || organization.value.type !== 'REAL_ESTATE_COMPANY') {
    linkedItems.value = []
    return
  }
  
  loadingLinkedItems.value = true
  try {
    const orgId = organization.value.id
    const [propertiesRes, buildingsRes] = await Promise.all([
      api.get(`/properties/organization/${orgId}/list`).catch((e) => {
        console.warn('Failed to fetch properties', e)
        return { data: [] }
      }),
      api.get(`/buildings/organization/${orgId}/list`).catch((e) => {
        console.warn('Failed to fetch buildings', e)
        return { data: [] }
      })
    ])
    
    const properties = Array.isArray(propertiesRes.data) ? propertiesRes.data : []
    const buildings = Array.isArray(buildingsRes.data) ? buildingsRes.data : []
    
    const combined = [
      ...properties.map(p => ({ ...p, type: 'property' })),
      ...buildings.map(b => ({ ...b, type: 'building', title: b.name }))
    ]
    
    // Sort by sponsorship then by creation date
    combined.sort((a, b) => {
      const aPriority = a.isSponsored ? listingSortTierRank(a.sponsorshipType) : 100
      const bPriority = b.isSponsored ? listingSortTierRank(b.sponsorshipType) : 100

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      const aDate = new Date(a.createdAt || 0)
      const bDate = new Date(b.createdAt || 0)
      return bDate - aDate
    })
    
    linkedItems.value = combined
    linkedItemsPage.value = 0
  } catch (err) {
    console.error('Failed to load linked items:', err)
    linkedItems.value = []
  } finally {
    loadingLinkedItems.value = false
  }
}

async function loadOrganization() {
  const id = route.params.id
  if (!id) {
    loading.value = false
    organization.value = null
    return
  }
  loading.value = true
  error.value = null
  currentMediaIndex.value = 0
  try {
    const res = await api.get(`/organizations/${id}`)
    organization.value = res.data
    
    if (organization.value?.type === 'REAL_ESTATE_COMPANY') {
      loadLinkedItems()
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to load organization'
    organization.value = null
  } finally {
    loading.value = false
  }
}

watch(galleryMedia, (items) => {
  if (!items.length) {
    currentMediaIndex.value = 0
    return
  }
  if (currentMediaIndex.value > items.length - 1) {
    currentMediaIndex.value = 0
  }
})

onMounted(loadOrganization)
watch(() => route.params.id, loadOrganization)
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p class="mt-4 text-gray-400">{{ $t('property.loadingDetails') }}</p>
      </div>
    </div>

    <!-- Property Not Found -->
    <div v-else-if="!property" class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12">
      <div class="text-center py-12">
        <p class="text-gray-400 mb-4">{{ $t('property.notFound') }}</p>
        <router-link to="/properties" class="inline-block text-white hover:text-yellow-400 font-medium">
          ← Back to Properties
        </router-link>
      </div>
    </div>

    <!-- Property Content -->
    <div v-else class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
      <!-- Back Button -->
      <button
        @click="$router.back()"
        class="mb-6 flex items-center gap-2 text-white hover:text-yellow-400 font-medium transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back
      </button>

      <!-- Hero Section: Image Gallery & Key Info -->
      <div class="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden mb-6">
        <!-- Image Gallery -->
        <div class="relative h-48 sm:h-64 md:h-80 bg-white/10">
          <!-- Main Image -->
          <div v-if="property.images && property.images.length > 0" class="relative h-full w-full">
            <img
              :src="mediaUrl(property.images[currentImageIndex]?.imageUrl)"
              :alt="property.title"
              class="w-full h-full object-cover transition-opacity duration-300"
            />
            
            <!-- Image Navigation -->
            <button
              v-if="property.images.length > 1"
              @click="previousImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-yellow-400 text-black rounded-full p-2 shadow-lg transition-all z-10"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              v-if="property.images.length > 1"
              @click="nextImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-yellow-400 text-black rounded-full p-2 shadow-lg transition-all z-10"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <!-- Image Indicators -->
            <div v-if="property.images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              <button
                v-for="(img, index) in property.images"
                :key="index"
                @click="currentImageIndex = index"
                :class="[
                  'h-2 rounded-full transition-all',
                  currentImageIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                ]"
              />
            </div>

            <!-- Image Counter -->
            <div v-if="property.images.length > 1" class="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
              {{ currentImageIndex + 1 }} / {{ property.images.length }}
            </div>
          </div>
          
          <!-- Placeholder -->
          <div v-else class="h-full w-full flex items-center justify-center">
            <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        </div>

        <!-- Header Info Bar -->
        <div class="p-4 sm:p-6 border-b border-white/10">
            <div class="flex flex-col gap-3">
            <div class="flex items-start gap-3 flex-wrap">
              <h1 class="text-2xl sm:text-3xl font-bold text-white flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                {{ property.title }}
                <VerifiedBadge :level="getVerificationLevel(property)" size="md" />
              </h1>
              <span
                :class="{
                  'bg-green-500/30 text-green-200 border-green-400/50': property.status === 'AVAILABLE',
                  'bg-yellow-500/30 text-yellow-200 border-yellow-400/50': property.status === 'RESERVED',
                  'bg-gray-500/30 text-gray-200 border-white/20': property.status === 'SOLD'
                }"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg border-2 whitespace-nowrap"
              >
                {{ property.status }}
              </span>
            </div>
            
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 text-gray-400 mb-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="text-sm">{{ property.address }}, {{ property.city }}{{ property.country ? `, ${property.country}` : '' }}</span>
                </div>

                <!-- Price -->
                <div class="flex flex-col gap-0.5">
                  <div v-if="property.priceETB" class="text-2xl sm:text-3xl font-bold text-yellow-400">
                    {{ formatPrice(property.priceETB, 'ETB') }}
                    <span v-if="property.category === 'FOR_RENTAL'" class="text-base text-gray-400 font-normal">/month</span>
                  </div>
                  <div v-if="property.priceUSD" class="text-lg sm:text-xl font-semibold text-gray-400">
                    {{ formatPrice(property.priceUSD, 'USD') }}
                    <span v-if="property.category === 'FOR_RENTAL'" class="text-sm text-gray-500 font-normal">/month</span>
                  </div>
                  <p v-if="!property.priceETB && !property.priceUSD" class="text-base text-gray-500">
                    {{ $t('property.priceNotSet') }}
                  </p>
                </div>
              </div>

              <!-- Action Buttons Row -->
              <div class="flex gap-2">
                <button
                  v-if="canCreatePropertyLoan"
                  @click="showLoanModal = true"
                  class="px-4 py-2 bg-emerald-500/90 text-white rounded-lg font-medium hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Create Property Credit
                </button>
                <button 
                  @click="showContactModal = true"
                  class="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  {{ $t('property.contact') }}
                </button>
                <button 
                  @click="toggleFavorite"
                  :class="[
                    'px-3 py-2 border-2 rounded-lg transition-colors',
                    isFavorite ? 'border-red-400 bg-red-500/30' : 'border-white/20 hover:border-yellow-400 hover:bg-yellow-500/20'
                  ]"
                >
                  <svg 
                    :class="['w-4 h-4', isFavorite ? 'text-red-400 fill-current' : 'text-gray-400']" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
                <button 
                  @click="showGalleryModal = true"
                  class="px-3 py-2 border-2 border-white/20 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="p-3 sm:p-4 bg-white/5 border-t border-white/10">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div v-if="property.bedrooms" class="text-center">
              <div class="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full mx-auto mb-1">
                <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <p class="text-xl font-bold text-white">{{ property.bedrooms }}</p>
              <p class="text-xs text-gray-400">{{ $t('property.bedrooms') }}</p>
            </div>
            <div v-if="property.bathrooms" class="text-center">
              <div class="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full mx-auto mb-1">
                <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                </svg>
              </div>
              <p class="text-xl font-bold text-white">{{ property.bathrooms }}</p>
              <p class="text-xs text-gray-400">{{ $t('property.bathrooms') }}</p>
            </div>
            <div v-if="property.area" class="text-center">
              <div class="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full mx-auto mb-1">
                <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
              </div>
              <p class="text-xl font-bold text-white">{{ property.area }}</p>
              <p class="text-xs text-gray-400">{{ $t('property.sqMeters') }}</p>
            </div>
            <div v-if="property.floorNumber" class="text-center">
              <div class="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full mx-auto mb-1">
                <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <p class="text-xl font-bold text-white">{{ property.floorNumber }}{{ property.totalFloors ? `/${property.totalFloors}` : '' }}</p>
              <p class="text-xs text-gray-400">{{ $t('property.floor') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="space-y-6">
        <!-- Row 1: Property Details and Location Map -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Property Details Card -->
          <div class="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 class="text-2xl font-bold text-white mb-6">{{ $t('property.propertyDetails') }}</h2>
            
            <div class="space-y-4 mb-6">
              <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{{ $t('property.propertyInformation') }}</h3>
                <dl class="space-y-3">
                  <div class="flex items-center justify-between py-2 border-b border-white/10">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.type') }}</dt>
                    <dd class="text-sm font-semibold text-white">{{ property.type || $t('property.na') }}</dd>
                  </div>
                  <div v-if="property.constructionStatus" class="flex items-center justify-between py-2 border-b border-white/10">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.construction') }}</dt>
                    <dd class="text-sm font-semibold text-white">{{ property.constructionStatus }}</dd>
                  </div>
                  <div v-if="property.constructionPercentage !== null && property.constructionPercentage !== undefined" class="flex items-center justify-between py-2 border-b border-white/10">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.progress') }}</dt>
                    <dd class="text-sm font-semibold text-white">{{ property.constructionPercentage }}%</dd>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-white/10">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.category') }}</dt>
                    <dd>
                      <span :class="{
                        'bg-blue-500/30 text-blue-200': property.category === 'FOR_SALE',
                        'bg-green-500/30 text-green-200': property.category === 'FOR_RENTAL'
                      }" class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ property.category === 'FOR_SALE' ? $t('common.forSale') : $t('common.forRental') }}
                      </span>
                    </dd>
                  </div>
                  <div v-if="property.isFullyFurnished" class="flex items-center justify-between py-2">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.furnished') }}</dt>
                    <dd>
                      <span class="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-xs font-semibold">{{ $t('common.fullyFurnished') }}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{{ $t('property.location') }}</h3>
                <dl class="space-y-3">
                  <div class="flex items-start justify-between py-2 border-b border-white/10">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.address') }}</dt>
                    <dd class="text-sm font-semibold text-white text-right max-w-[60%]">{{ property.address }}</dd>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-white/10">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.city') }}</dt>
                    <dd class="text-sm font-semibold text-white">{{ property.city }}</dd>
                  </div>
                  <div v-if="property.state" class="flex items-center justify-between py-2 border-b border-white/10">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.state') }}</dt>
                    <dd class="text-sm font-semibold text-white">{{ property.state }}</dd>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-white/10">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.country') }}</dt>
                    <dd class="text-sm font-semibold text-white">{{ property.country }}</dd>
                  </div>
                  <div v-if="property.zipCode" class="flex items-center justify-between py-2">
                    <dt class="text-sm font-medium text-gray-400">{{ $t('property.zipCode') }}</dt>
                    <dd class="text-sm font-semibold text-white">{{ property.zipCode }}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Description -->
            <div v-if="property.description" class="mt-6 pt-6 border-t border-white/10">
              <h3 class="text-lg font-semibold text-white mb-3">{{ $t('property.description') }}</h3>
              <p class="text-gray-400 whitespace-pre-line leading-relaxed">{{ property.description }}</p>
            </div>
          </div>

          <!-- Map Section -->
          <div class="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 class="text-2xl font-bold text-white mb-6">{{ $t('property.locationMap') }}</h2>
            <OsmMap
              v-if="property.latitude != null && property.longitude != null"
              :latitude="property.latitude"
              :longitude="property.longitude"
              :marker-title="property.title"
              height="400px"
              :zoom="15"
            />
            <a
              v-if="property.latitude != null && property.longitude != null"
              :href="googleMapsDirectionsUrl(property.latitude, property.longitude)"
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
              style="height: 400px;"
            >
              <p class="text-gray-400 px-4">{{ $t('property.locationNotAvailable') || 'Location not available' }}</p>
            </div>
          </div>
        </div>

        <!-- Row 2: Company Details and Photo Gallery -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Company Information Card -->
          <div v-if="company" class="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h3 class="text-xl font-bold text-white mb-4">{{ $t('property.realEstateCompany') }}</h3>
            <div class="space-y-4">
              <div>
                <h4 class="text-lg font-semibold text-white mb-3 flex items-center gap-2 flex-wrap">
                  {{ company.name }}
                  <VerifiedBadge :level="getVerificationLevel(property)" size="md" />
                </h4>
                <p v-if="company.description" class="text-sm text-gray-400 mb-4">{{ company.description }}</p>
                <div
                  v-if="hasSocialOnOrg(company)"
                  class="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-white/10"
                >
                  <OrganizationSocialLinks
                    compact
                    :facebook-url="company.facebookUrl"
                    :instagram-url="company.instagramUrl"
                    :linkedin-url="company.linkedinUrl"
                    :twitter-url="company.twitterUrl"
                    :youtube-url="company.youtubeUrl"
                  />
                </div>
              </div>

              <div class="space-y-3">
                <a v-if="company.email" :href="`mailto:${company.email}`" class="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors group">
                  <div class="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors">
                    <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-white flex-1">{{ company.email }}</span>
                </a>

                <a
                  v-for="(phone, idx) in companyPhones"
                  :key="idx"
                  :href="`tel:${phone}`"
                  class="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors group"
                >
                  <div class="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors">
                    <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-white flex-1">{{ phone }}</span>
                </a>

                <div v-if="company.address" class="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-400">{{ company.address }}{{ company.city ? `, ${company.city}` : '' }}{{ company.country ? `, ${company.country}` : '' }}</p>
                  </div>
                </div>

                <a v-if="company.website" :href="company.website" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors group">
                  <div class="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors">
                    <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-yellow-400 flex-1 truncate">{{ company.website }}</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Company Name Only (if full details not loaded) -->
          <div v-else-if="property.realEstateCompanyName" class="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h3 class="text-xl font-bold text-white mb-2">{{ $t('property.realEstateCompany') }}</h3>
            <p class="text-lg font-semibold text-white mb-2 flex items-center gap-2 flex-wrap">
              {{ property.realEstateCompanyName }}
              <VerifiedBadge :level="getVerificationLevel(property)" size="md" />
            </p>
            <p class="text-sm text-gray-500">{{ $t('property.contactInformationNotAvailable') }}</p>
          </div>

          <!-- Gallery Section -->
          <div v-if="property.images && property.images.length > 0" class="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-white">{{ $t('property.photoGallery') }}</h2>
              <button 
                @click="showGalleryModal = true"
                class="text-yellow-400 hover:text-yellow-300 font-medium text-sm flex items-center gap-2"
              >
                {{ $t('common.viewAll') }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="(image, index) in property.images.slice(0, 6)"
                :key="index"
                @click="openGallery(index)"
                class="relative aspect-square bg-white/10 rounded-lg overflow-hidden cursor-pointer group hover:border-yellow-400 hover:bg-yellow-500/10 border border-white/10 transition-colors"
              >
                <img
                  :src="mediaUrl(image.imageUrl)"
                  :alt="`${property.title} - Image ${index + 1}`"
                  class="w-full h-full object-cover"
                />
                <div v-if="index === 5 && property.images.length > 6" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span class="text-white font-semibold">+{{ property.images.length - 6 }} {{ $t('property.more') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 3: Financing Offers (Full Width) -->
        <div v-if="financingOffers.length" class="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 class="text-2xl font-bold text-white mb-6">{{ $t('property.financingOptions') }}</h2>
          <div class="space-y-4">
            <div
              v-for="offer in financingOffers"
              :key="offer.id"
              class="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h4 class="text-xl font-bold text-white">{{ offer.creditProductName || 'Financing Offer' }}</h4>
                    <span class="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-xs font-semibold">
                      {{ $t('banking.active') }}
                    </span>
                  </div>
                  <p v-if="offer.creditProductDescription" class="text-sm text-gray-400 mb-4">{{ offer.creditProductDescription }}</p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-if="offer.maxLoanToValueRatio" class="bg-zinc-800/50 rounded-lg p-4 text-center border border-white/10">
                      <p class="text-xs font-medium text-gray-500 mb-1">{{ $t('loan.ltvRatio') }}</p>
                      <p class="text-lg font-bold text-white">{{ (offer.maxLoanToValueRatio * 100).toFixed(0) }}%</p>
                    </div>
                  </div>
                  
                  <div v-if="offer.specialTerms" class="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <p class="text-xs font-semibold text-gray-400 mb-2">{{ $t('loan.specialTerms') }}</p>
                    <p class="text-sm text-gray-400">{{ offer.specialTerms }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <div
      v-if="showContactModal"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      @click.self="showContactModal = false"
    >
      <div class="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">{{ $t('property.contactInformation') }}</h3>
          <button
            @click="showContactModal = false"
            class="text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div v-if="company">
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-white mb-2">{{ company.name }}</h4>
            <p v-if="company.description" class="text-sm text-gray-400">{{ company.description }}</p>
            <div
              v-if="hasSocialOnOrg(company)"
              class="mt-4 flex flex-wrap items-center gap-2 pb-4 border-b border-white/10"
            >
              <OrganizationSocialLinks
                compact
                :facebook-url="company.facebookUrl"
                :instagram-url="company.instagramUrl"
                :linkedin-url="company.linkedinUrl"
                :twitter-url="company.twitterUrl"
                :youtube-url="company.youtubeUrl"
              />
            </div>
          </div>

          <div class="space-y-4">
            <a
              v-if="company.email"
              :href="`mailto:${company.email}`"
              class="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors group"
            >
              <div class="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors">
                <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xs text-gray-500 mb-1">{{ $t('auth.email') }}</p>
                <p class="text-base font-semibold text-white">{{ company.email }}</p>
              </div>
            </a>

            <a
              v-for="(phone, idx) in companyPhones"
              :key="idx"
              :href="`tel:${phone}`"
              class="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors group"
            >
              <div class="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors">
                <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xs text-gray-500 mb-1">{{ $t('building.phoneLabel') }}</p>
                <p class="text-base font-semibold text-white">{{ phone }}</p>
              </div>
            </a>

            <div v-if="company.address" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">{{ $t('property.address') }}</p>
                  <p class="text-sm text-gray-900">{{ company.address }}{{ company.city ? `, ${company.city}` : '' }}{{ company.country ? `, ${company.country}` : '' }}</p>
                </div>
              </div>
            </div>

            <a
              v-if="company.website"
              :href="company.website"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xs text-gray-500 mb-1">{{ $t('building.websiteLabel') }}</p>
                <p class="text-base font-semibold text-primary-600 truncate">{{ company.website }}</p>
              </div>
            </a>
          </div>
        </div>

        <div v-else-if="property.realEstateCompanyName" class="text-center py-8">
          <p class="text-gray-600 mb-2 flex items-center justify-center gap-2 flex-wrap">
            {{ property.realEstateCompanyName }}
            <VerifiedBadge :level="getVerificationLevel(property)" size="sm" />
          </p>
          <p class="text-sm text-gray-500">{{ $t('property.contactInformationNotAvailable') }}</p>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-gray-600">{{ $t('property.contactInformationNotAvailable') }}</p>
        </div>
      </div>
    </div>

    <!-- Gallery Modal -->
    <div
      v-if="showGalleryModal && property.images && property.images.length > 0"
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
            :src="mediaUrl(property.images[galleryIndex]?.imageUrl)"
            :alt="`${property.title} - Image ${galleryIndex + 1}`"
            class="max-w-full max-h-full object-contain"
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
            <p class="text-sm font-medium">{{ galleryIndex + 1 }} / {{ property.images.length }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ property.title }}</p>
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
              v-for="(image, index) in property.images"
              :key="index"
              @click="galleryIndex = index"
              :class="[
                'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                galleryIndex === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-75'
              ]"
            >
              <img
                :src="mediaUrl(image.imageUrl)"
                :alt="`${property.title} - Thumbnail ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <PropertyLoanLinkModal
      :show="showLoanModal"
      :property-id="property?.id || String(route.params.id || '')"
      :property-label="property ? `${property.title} (${property.city}, ${property.country})` : ''"
      title="Create Property Credit"
      @close="showLoanModal = false"
      @created="handlePropertyLoanCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api, { mediaUrl } from '@/shared/api/client'
import {
  getPublicSiteUrl,
  truncateMetaDescription,
  setJsonLdById,
  removeJsonLdById
} from '@/utils/seo'
import { useDynamicSeo } from '@/shared/composables/useDynamicSeo'
import { useMediaWarmup } from '@/shared/composables/useMediaWarmup'
import { formatPrice as formatCurrencyPrice, formatOrganizationPhones, getVerificationLevel } from '@/shared/utils'
import { VerifiedBadge, OsmMap } from '@/shared/components'
import OrganizationSocialLinks from '@/shared/components/OrganizationSocialLinks.vue'
import { useAuthStore } from '@/features/auth'
import PropertyLoanLinkModal from '@/features/banking/components/PropertyLoanLinkModal.vue'

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()

const PROPERTY_JSON_LD_ID = 'dynamic-property-jsonld'

function syncPropertySeo(p) {
  if (!p) return
  const title = `${p.title} | Ethio Build Connect`
  const locationLine = [p.address, p.city, p.country].filter(Boolean).join(', ')
  const priceLine =
    p.priceETB != null
      ? `${formatCurrencyPrice(p.priceETB, 'ETB')}${p.category === 'FOR_RENTAL' ? ' /month' : ''}`
      : p.priceUSD != null
        ? formatCurrencyPrice(p.priceUSD, 'USD')
        : ''
  const fallbackDesc = [p.type, priceLine, locationLine].filter(Boolean).join(' · ')
  const description = truncateMetaDescription(
    (p.description && String(p.description).trim()) || fallbackDesc
  )
  const firstImg = p.images?.[0]?.imageUrl
  
  seoOptions.value = {
    title,
    description,
    imageUrl: firstImg,
    pagePath: `/properties/${p.id}`
  }

  const offerPrice = p.priceETB ?? p.priceUSD
  const currency = p.priceETB != null ? 'ETB' : 'USD'
  const listingLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: p.title,
    url: `${getPublicSiteUrl()}/properties/${p.id}`
  }
  if (offerPrice != null) {
    listingLd.offers = {
      '@type': 'Offer',
      priceCurrency: currency,
      price: String(offerPrice)
    }
  }
  if (locationLine) {
    listingLd.address = {
      '@type': 'PostalAddress',
      streetAddress: p.address || undefined,
      addressLocality: p.city || undefined,
      addressCountry: p.country || undefined
    }
  }
  setJsonLdById(PROPERTY_JSON_LD_ID, listingLd)
}
const property = ref(null)
const seoOptions = ref({})
useDynamicSeo(seoOptions)

const company = ref(null)
const companyPhones = computed(() => formatOrganizationPhones(company.value || {}))

function hasSocialOnOrg(org) {
  if (!org) return false
  return ['facebookUrl', 'instagramUrl', 'linkedinUrl', 'twitterUrl', 'youtubeUrl'].some((k) =>
    String(org[k] || '').trim()
  )
}
const financingOffers = ref([])
const loading = ref(true)
const currentImageIndex = ref(0)
const showContactModal = ref(false)
const showGalleryModal = ref(false)
const showLoanModal = ref(false)
const galleryIndex = ref(0)
const isFavorite = ref(false)
const canCreatePropertyLoan = computed(
  () =>
    authStore.isAuthenticated &&
    (authStore.hasRole('REALTOR') || authStore.hasRole('ADMIN'))
)

const propertyPageMediaUrlsForWarmup = computed(() => {
  const urls = []
  const imgs = property.value?.images
  if (Array.isArray(imgs)) {
    imgs.forEach((i) => {
      if (i?.imageUrl) urls.push(i.imageUrl)
    })
  }
  if (company.value?.logoUrl) urls.push(company.value.logoUrl)
  return urls
})

useMediaWarmup(propertyPageMediaUrlsForWarmup)

const FAVORITES_STORAGE_KEY = 'housing_platform_favorites'

const loadFavorites = () => {
  try {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]')
    return favorites
  } catch (err) {
    console.error('Failed to load favorites:', err)
    return []
  }
}

const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
  } catch (err) {
    console.error('Failed to save favorites:', err)
  }
}

const checkFavorite = () => {
  if (!property.value) return
  const favorites = loadFavorites()
  isFavorite.value = favorites.includes(property.value.id)
}

const toggleFavorite = () => {
  if (!property.value) return
  const favorites = loadFavorites()
  
  if (isFavorite.value) {
    const index = favorites.indexOf(property.value.id)
    if (index > -1) {
      favorites.splice(index, 1)
    }
    isFavorite.value = false
  } else {
    favorites.push(property.value.id)
    isFavorite.value = true
  }
  
  saveFavorites(favorites)
}

const loadProperty = async () => {
  try {
    const response = await api.get(`/properties/${route.params.id}`)
    property.value = response.data

    // Check favorite status
    checkFavorite()

    // Load company information
    if (property.value.realEstateCompanyId) {
      try {
        const companyResponse = await api.get(`/organizations/${property.value.realEstateCompanyId}`)
        company.value = companyResponse.data
      } catch (err) {
        console.error('Failed to load company:', err)
      }
    }

    // Load financing offers
    try {
      const offersResponse = await api.get(`/properties/${route.params.id}/financing-offers`)
      financingOffers.value = offersResponse.data
    } catch (err) {
      console.error('Failed to load financing offers:', err)
    }

    syncPropertySeo(property.value)
  } catch (err) {
    console.error('Failed to load property:', err)
    property.value = null
    removeJsonLdById(PROPERTY_JSON_LD_ID)
  } finally {
    loading.value = false
  }
}

const googleMapsDirectionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const nextImage = () => {
  if (property.value?.images && property.value.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % property.value.images.length
  }
}

const previousImage = () => {
  if (property.value?.images && property.value.images.length > 0) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? property.value.images.length - 1 
      : currentImageIndex.value - 1
  }
}

const openGallery = (index) => {
  galleryIndex.value = index
  showGalleryModal.value = true
}

const nextGalleryImage = () => {
  if (property.value?.images && property.value.images.length > 0) {
    galleryIndex.value = (galleryIndex.value + 1) % property.value.images.length
  }
}

const previousGalleryImage = () => {
  if (property.value?.images && property.value.images.length > 0) {
    galleryIndex.value = galleryIndex.value === 0 
      ? property.value.images.length - 1 
      : galleryIndex.value - 1
  }
}

const handlePropertyLoanCreated = async () => {
  showLoanModal.value = false
  await loadProperty()
}

// Keyboard navigation for gallery
const handleKeyPress = (e) => {
  if (!showGalleryModal.value) return
  
  if (e.key === 'ArrowLeft') {
    previousGalleryImage()
  } else if (e.key === 'ArrowRight') {
    nextGalleryImage()
  } else if (e.key === 'Escape') {
    showGalleryModal.value = false
  }
}


onMounted(() => {
  loadProperty()
  window.addEventListener('keydown', handleKeyPress)
})

watch(
  () => route.params.id,
  () => {
    loading.value = true
    removeJsonLdById(PROPERTY_JSON_LD_ID)
    loadProperty()
  }
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  removeJsonLdById(PROPERTY_JSON_LD_ID)
})
</script>

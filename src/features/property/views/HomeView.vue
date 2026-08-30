<template>
  <div class="property-marketplace min-h-screen bg-violet-50 pb-14">
    <!-- Ad Space under NavBar — GOLD-sponsored real estate companies (two side by side) -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AdSpace 
          v-if="currentTopBannerAds && currentTopBannerAds.length > 0"
          size="banner" 
          :ad-contents="currentTopBannerAds"
        />
        <AdSpace v-else size="banner" />
      </div>
    </div>

    <!-- Top Search Bar with Filters -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <!-- Search Filters -->
          <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <!-- Service Type Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.serviceType"
                class="w-full appearance-none bg-white border border-gray-300 text-gray-900 rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-400 focus:border-primary-400 cursor-pointer"
              >
                <option value="">{{ $t('home.serviceType') }}</option>
                <option value="rental">{{ $t('home.rental') }}</option>
                <option value="sale">{{ $t('home.sale') }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <!-- Location Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.location"
                class="w-full appearance-none bg-white border border-gray-300 text-gray-900 rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-400 focus:border-primary-400 cursor-pointer"
              >
                <option value="">{{ $t('home.location') }}</option>
                <option value="Bole">{{ $t('home.bole') }}</option>
                <option value="Megenagna">{{ $t('home.megenagna') }}</option>
                <option value="Addis Ababa">{{ $t('home.addisAbaba') }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <!-- Price Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.priceRange"
                class="w-full appearance-none bg-white border border-gray-300 text-gray-900 rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-400 focus:border-primary-400 cursor-pointer"
              >
                <option value="">{{ $t('home.priceRange') }}</option>
                <option value="0-5000">ብ0 - ብ5,000</option>
                <option value="5000-10000">ብ5,000 - ብ10,000</option>
                <option value="10000-20000">ብ10,000 - ብ20,000</option>
                <option value="20000+">ብ20,000+</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>


            <!-- Clear Filters Button -->
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
            >
              {{ $t('filters.clearFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Property List in Two Columns (anchor for hero CTA) -->
    <div id="main-listings" class="min-h-[calc(100vh-88px)] sm:min-h-[calc(100vh-120px)] bg-violet-50 scroll-mt-4">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <!-- Loading State -->
        <div v-if="loadingOrgs" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div v-for="i in 4" :key="i" class="bg-gray-100 animate-pulse rounded-xl h-96"></div>
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
              class="flex-1 min-w-0 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 px-4 py-2.5 text-sm"
            />
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span>{{ filteredByOrganization.length }} {{ filteredByOrganization.length === 1 ? $t('home.company') : $t('home.companies') }}</span>
            </div>
          </div>
          <div
            v-if="totalOrganizationPages > 1"
            class="flex flex-wrap items-center justify-between gap-2"
          >
            <span class="text-sm text-gray-500">
              {{ $t('common.page') }} {{ organizationListPage }} / {{ totalOrganizationPages }}
            </span>
            <div class="flex items-center gap-2">
              <AppButton
                variant="secondary"
                size="sm"
                :disabled="organizationListPage <= 1"
                @click="setOrganizationListPage(organizationListPage - 1)"
              >
                {{ $t('common.previous') }}
              </AppButton>
              <AppButton
                variant="secondary"
                size="sm"
                :disabled="organizationListPage >= totalOrganizationPages"
                @click="setOrganizationListPage(organizationListPage + 1)"
              >
                {{ $t('common.next') }}
              </AppButton>
            </div>
          </div>
          <p v-if="searchQuery && filteredByOrganization.length === 0" class="text-gray-500 text-sm">
            {{ $t('home.noCompaniesMatch') }}
          </p>
        </div>

        <!-- Properties and buildings grouped by organization (collapsible, with org details and paging) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" v-if="!loadingOrgs && organizationsList.length > 0 && paginatedOrganizations.length > 0">
          <template v-for="org in paginatedOrganizations" :key="org.id">
            <!-- Collapsible organization header: logo, name, address, contact (from org API) -->
            <div
              class="col-span-full mt-8 first:mt-0 rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <button
                type="button"
                class="w-full text-left px-4 py-4 sm:px-5 sm:py-5 flex flex-wrap items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors"
                @click="toggleExpanded(org.id)"
              >
                <div
                  v-if="org.logoUrl"
                  class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    :src="mediaUrl(org.logoUrl)"
                    :alt="org.name"
                    class="w-full h-full object-contain"
                  />
                </div>
                <div
                  v-else
                  class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-900"
                >
                  {{ (org.name || 'O').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span class="material-icons !text-[18px] leading-none text-primary-600" aria-hidden="true">apartment</span>
                    {{ org.name }}
                  </h2>
                  <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-gray-500">
                    <span v-if="org.address">{{ org.address }}</span>
                    <span v-if="org.city && !(org.address || '').toLowerCase().includes(org.city.toLowerCase())">{{ org.city }}</span>
                    <template v-if="orgPhones(org).length">
                      <template v-for="(phone, i) in orgPhones(org)" :key="i">
                        <span v-if="i > 0">, </span>
                        <a :href="`tel:${phone}`" class="text-primary-700 hover:underline">{{ phone }}</a>
                      </template>
                    </template>
                    <template v-if="org.email">
                      <a :href="`mailto:${org.email}`" class="text-primary-700 hover:underline">{{ org.email }}</a>
                    </template>
                    <a v-if="org.website" :href="org.website" target="_blank" rel="noopener" class="text-primary-700 hover:underline">{{ $t('admin.orgWebsite') }}</a>
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
                <p
                  v-else-if="!getFilteredItemsForOrg(org.id).length"
                  class="py-6 text-center text-sm text-gray-500"
                >
                  {{ $t('property.noListingsYet') }}
                </p>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <ListingCard
                    v-for="item in getPaginatedItems(getFilteredItemsForOrg(org.id), org.id)"
                    :key="`${item.type}-${item.id}`"
                    :item="item"
                  />
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
                        class="px-3 py-1.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:bg-white/50"
                      >
                        {{ $t('common.previous') }}
                      </button>
                      <button
                        type="button"
                        :disabled="(groupPage[org.id] || 1) >= totalPagesForGroup(getFilteredItemsForOrg(org.id))"
                        @click="setGroupPage(org.id, (groupPage[org.id] || 1) + 1)"
                        class="px-3 py-1.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:bg-white/50"
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
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('home.noPropertiesFound') }}</h3>
            <p class="mt-1 text-sm text-gray-400">{{ $t('home.tryAdjustingFilters') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AppButton } from '@/shared/components/ui'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api, { mediaUrl } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice, formatOrganizationPhones, getVerificationLevel } from '@/shared/utils'
import { AdSpace, VerifiedBadge, ListingCard } from '@/shared/components'
import { useAds } from '@/shared/composables/useAds'
import {
  isPremierListingTier,
  isGoldListingTier,
  listingSortTierRank
} from '@/shared/utils/sponsorshipTier'

const router = useRouter()
const authStore = useAuthStore()
const { loadAllAds, topAds } = useAds()

const loadingOrgs = ref(false)
const organizationsList = ref([])
const rawOrgListings = ref({})
const orgListingsLoading = ref({})
const currentTopBannerAdIndex = ref(0)

// Top banner: GOLD-tier real estate orgs from useAds.topAds (rotates two slots)
const currentTopBannerAds = computed(() => {
  if (topAds.value.length === 0) return []

  const ads = []
  const startIndex = currentTopBannerAdIndex.value % topAds.value.length

  for (let i = 0; i < 2; i++) {
    const index = (startIndex + i) % topAds.value.length
    ads.push(topAds.value[index])
  }

  return ads
})

const filters = ref({
  serviceType: '',
  location: '',
  priceRange: ''
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
    const aPriority = a.isSponsored ? listingSortTierRank(a.sponsorshipType) : 100
    const bPriority = b.isSponsored ? listingSortTierRank(b.sponsorshipType) : 100
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

// Search and pagination for the organization list (orgs from API have name, address, etc.)
const searchQuery = ref('')
const ORGANIZATIONS_PER_PAGE = 5
const organizationListPage = ref(1)

function orgPhones(org) {
  return formatOrganizationPhones(org || {})
}

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
    const phone = orgPhones(org).join('').replace(/\s/g, '')
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
         filters.value.priceRange !== ''
})

// Clear all filters
const clearFilters = () => {
  filters.value = {
    serviceType: '',
    location: '',
    priceRange: ''
  }
}

// Rotate premier ads every 10 seconds
let adRotationInterval = null

onMounted(() => {
  loadOrganizations()
  loadAllAds(20).then(() => {
    // Rotate GOLD real-estate banner slots every 15 seconds
    adRotationInterval = setInterval(() => {
      if (topAds.value.length > 0) {
        currentTopBannerAdIndex.value = (currentTopBannerAdIndex.value + 1) % topAds.value.length
      }
    }, 15000)
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

<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        {{ pageTitle }}
      </h1>
      <p class="text-gray-400 text-sm sm:text-base mb-6">
        {{ $t('marketplace.organizationsByType') }}
      </p>

      <div v-if="!loading && !error && organizations.length" class="mb-6 rounded-xl border border-white/10 bg-zinc-900/80 p-4 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="w-full sm:max-w-md">
            <label for="marketplace-org-search" class="sr-only">{{ $t('common.search') }}</label>
            <input
              id="marketplace-org-search"
              v-model.trim="searchQuery"
              type="search"
              :placeholder="$t('home.searchCompanies')"
              class="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
            />
          </div>
          <p class="text-xs text-gray-400">
            Showing {{ paginationStart }}-{{ paginationEnd }} of {{ filteredOrganizations.length }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">
        {{ error }}
      </div>

      <div v-else-if="!organizations.length" class="rounded-lg border border-white/10 bg-zinc-900/50 p-8 text-center text-gray-400">
        {{ $t('marketplace.noOrganizations') }}
      </div>

      <div v-else-if="!filteredOrganizations.length" class="rounded-lg border border-white/10 bg-zinc-900/50 p-8 text-center text-gray-400">
        {{ $t('home.noCompaniesMatch') }}
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <router-link
          v-for="org in paginatedOrganizations"
          :key="org.id"
          :to="{ path: `/organizations/${org.id}`, query: { from: route.fullPath } }"
          class="group block overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 hover:border-yellow-400/70 transition-colors"
        >
          <div class="h-1 w-full bg-gradient-to-r from-yellow-400/80 via-orange-300/70 to-transparent" />
          <div class="p-4 sm:p-5">
            <div class="flex items-start gap-4">
              <div
                v-if="org.logoUrl"
                class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/10 border border-white/10"
              >
                <img
                  :src="mediaUrl(org.logoUrl)"
                  :alt="org.name"
                  class="w-full h-full object-contain"
                />
              </div>
              <div
                v-else
                class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl font-bold text-white"
              >
                {{ (org.name || 'O').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <h2 class="text-base sm:text-lg font-semibold text-white truncate flex items-center flex-wrap gap-2">
                  {{ org.name }}
                  <VerifiedBadge :level="getVerificationLevel(org)" size="sm" />
                </h2>
                <p class="mt-1 inline-flex rounded-full border border-white/20 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gray-300">
                  {{ getOrganizationTypeLabel(org.type) }}
                </p>
                <p v-if="locationLabel(org)" class="text-xs text-gray-400 mt-2">
                  {{ locationLabel(org) }}
                </p>
              </div>
            </div>

            <p v-if="org.description" class="mt-4 text-sm text-gray-300 line-clamp-2 min-h-[2.5rem]">
              {{ org.description }}
            </p>
            <p v-else class="mt-4 text-sm text-gray-500 min-h-[2.5rem]">
              {{ org.address || '-' }}
            </p>

            <div class="mt-4 space-y-2 text-xs text-gray-300">
              <div v-if="primaryPhone(org)" class="flex items-center gap-2">
                <span class="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px]">TEL</span>
                <span class="truncate">{{ primaryPhone(org) }}</span>
              </div>
              <div v-if="org.email" class="flex items-center gap-2">
                <span class="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px]">@</span>
                <span class="truncate">{{ org.email }}</span>
              </div>
              <div v-if="org.website" class="flex items-center gap-2">
                <span class="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px]">WEB</span>
                <span class="truncate">{{ normalizedWebsite(org.website) }}</span>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <span class="text-xs font-medium text-yellow-300/90">{{ $t('common.viewDetails') }}</span>
              <span class="text-yellow-300 transition-transform duration-200 group-hover:translate-x-1">-&gt;</span>
            </div>
          </div>
        </router-link>
      </div>

      <div
        v-if="!loading && !error && filteredOrganizations.length > pageSize"
        class="mt-6 flex items-center justify-center gap-2"
      >
        <button
          type="button"
          @click="goToPreviousPage"
          :disabled="currentPage <= 1"
          class="px-3 py-1.5 rounded-md border border-white/20 text-sm text-gray-200 hover:border-yellow-400 hover:text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="text-xs text-gray-400">Page {{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          @click="goToNextPage"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1.5 rounded-md border border-white/20 text-sm text-gray-200 hover:border-yellow-400 hover:text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api, { mediaUrl } from '@/shared/api/client'
import { formatOrganizationPhones, getVerificationLevel } from '@/shared/utils'
import { VerifiedBadge } from '@/shared/components'

const route = useRoute()
const { t } = useI18n()

const categoryToType = {
  banks: { type: 'BANK', titleKey: 'nav.marketplaceBanks' },
  insurance: { type: 'INSURANCE', titleKey: 'nav.marketplaceInsurance' },
  contractors: { type: 'CONTRACTOR', titleKey: 'nav.marketplaceContractors' },
  'consultants-and-architects': { type: 'CONSULTANT_ARCHITECT', titleKey: 'nav.marketplaceConsultantsArchitects' },
  suppliers: { type: 'SUPPLIER', titleKey: 'nav.marketplaceSuppliers' },
  'finishing-work': { type: 'FINISHING_CONTRACTOR', titleKey: 'nav.marketplaceFinishingWork' }
}

const typeLabelKeys = {
  BANK: 'nav.marketplaceBanks',
  INSURANCE: 'nav.marketplaceInsurance',
  CONTRACTOR: 'nav.marketplaceContractors',
  SUPPLIER: 'nav.marketplaceSuppliers',
  FINISHING_CONTRACTOR: 'nav.marketplaceFinishingWork',
  CONSULTANT_ARCHITECT: 'nav.marketplaceConsultantsArchitects',
  DEVELOPER: 'admin.typeDeveloper',
  REAL_ESTATE_COMPANY: 'admin.typeRealEstate'
}

const config = computed(() => {
  const category = route.params.category || route.path.replace(/^\/marketplace\/?/, '') || ''
  return categoryToType[category] || null
})

const pageTitle = computed(() => {
  if (!config.value) return t('nav.marketplace')
  return t(config.value.titleKey)
})

const organizations = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 9

const filteredOrganizations = computed(() => {
  const list = Array.isArray(organizations.value) ? organizations.value : []
  const query = (searchQuery.value || '').trim().toLowerCase()
  if (!query) return list
  return list.filter((org) => {
    const searchable = [
      org.name,
      org.description,
      org.address,
      org.city,
      org.country,
      org.email,
      org.website,
      ...formatOrganizationPhones(org)
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return searchable.includes(query)
  })
})

const totalPages = computed(() => {
  const pages = Math.ceil(filteredOrganizations.value.length / pageSize)
  return pages > 0 ? pages : 1
})

const paginatedOrganizations = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrganizations.value.slice(start, start + pageSize)
})

const paginationStart = computed(() => {
  if (!filteredOrganizations.value.length) return 0
  return (currentPage.value - 1) * pageSize + 1
})

const paginationEnd = computed(() => {
  if (!filteredOrganizations.value.length) return 0
  return Math.min(currentPage.value * pageSize, filteredOrganizations.value.length)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

const getOrganizationTypeLabel = (type) => {
  if (!type) return ''
  if (typeLabelKeys[type]) return t(typeLabelKeys[type])
  return type
}

const primaryPhone = (org) => {
  const phones = formatOrganizationPhones(org)
  return phones.length ? phones[0] : ''
}

const locationLabel = (org) => {
  const cityCountry = [org.city, org.country].filter(Boolean).join(', ')
  if (cityCountry) return cityCountry
  return org.address || ''
}


const normalizedWebsite = (website) => {
  if (!website) return ''
  return String(website).replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

async function loadOrganizations() {
  if (!config.value?.type) {
    organizations.value = []
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  searchQuery.value = ''
  currentPage.value = 1
  try {
    const res = await api.get('/organizations/marketplace', {
      params: { type: config.value.type }
    })
    organizations.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to load organizations'
    organizations.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadOrganizations)
watch(() => route.params.category, loadOrganizations)
watch(() => route.path, loadOrganizations)
</script>

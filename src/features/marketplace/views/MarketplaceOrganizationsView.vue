<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        {{ pageTitle }}
      </h1>
      <p class="text-gray-400 text-sm sm:text-base mb-6">
        {{ $t('marketplace.organizationsByType') }}
      </p>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">
        {{ error }}
      </div>

      <div v-else-if="!organizations.length" class="rounded-lg border border-white/10 bg-zinc-900/50 p-8 text-center text-gray-400">
        {{ $t('marketplace.noOrganizations') }}
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <router-link
          v-for="org in organizations"
          :key="org.id"
          :to="{ path: `/organizations/${org.id}`, query: { from: route.fullPath } }"
          class="block rounded-lg border border-white/10 bg-zinc-900 p-4 sm:p-5 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors"
        >
          <div class="flex items-start gap-4">
            <div
              v-if="org.logoUrl"
              class="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white/10"
            >
              <img
                :src="mediaUrl(org.logoUrl)"
                :alt="org.name"
                class="w-full h-full object-contain"
              />
            </div>
            <div
              v-else
              class="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold text-white"
            >
              {{ (org.name || 'O').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-base sm:text-lg font-semibold text-white truncate">
                {{ org.name }}
              </h2>
              <p v-if="org.city" class="text-sm text-gray-400 mt-0.5">
                {{ org.city }}{{ org.country ? `, ${org.country}` : '' }}
              </p>
              <p v-if="org.address" class="text-xs text-gray-500 mt-1 line-clamp-2">
                {{ org.address }}
              </p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'

const route = useRoute()
const { t } = useI18n()

const categoryToType = {
  banks: { type: 'BANK', titleKey: 'nav.marketplaceBanks' },
  insurance: { type: 'INSURANCE', titleKey: 'nav.marketplaceInsurance' },
  contractors: { type: 'CONTRACTOR', titleKey: 'nav.marketplaceContractors' },
  'consultants-and-architects': { type: 'CONSULTANT,ARCHITECT', titleKey: 'nav.marketplaceConsultantsArchitects' },
  suppliers: { type: 'SUPPLIER', titleKey: 'nav.marketplaceSuppliers' },
  'finishing-work': { type: 'FINISHING_CONTRACTOR', titleKey: 'nav.marketplaceFinishingWork' }
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

function mediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (!base) return url
  const p = url.replace(/^\/api\/v1/, '')
  return `${base.replace(/\/$/, '')}${p.startsWith('/') ? p : '/' + p}`
}

async function loadOrganizations() {
  if (!config.value?.type) {
    organizations.value = []
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
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

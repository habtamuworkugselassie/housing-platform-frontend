<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-link
        :to="backLink"
        class="inline-flex items-center text-sm text-gray-400 hover:text-yellow-400 mb-6"
      >
        ← {{ $t('common.back') }}
      </router-link>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">
        {{ error }}
      </div>

      <div v-else-if="organization" class="rounded-lg border border-white/10 bg-zinc-900 p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row sm:items-start gap-4">
          <div
            v-if="organization.logoUrl"
            class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-white/10"
          >
            <img
              :src="mediaUrl(organization.logoUrl)"
              :alt="organization.name"
              class="w-full h-full object-contain"
            />
          </div>
          <div v-else class="flex-shrink-0 w-24 h-24 rounded-lg bg-white/10 flex items-center justify-center text-3xl font-bold text-white">
            {{ (organization.name || 'O').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="text-xl sm:text-2xl font-bold text-white">{{ organization.name }}</h1>
            <p v-if="organization.type" class="text-gray-400 text-sm mt-1">{{ orgTypeLabel }}</p>
          </div>
        </div>
        <dl class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <template v-if="organization.address">
            <dt class="text-xs font-medium text-gray-500">{{ $t('admin.orgAddress') }}</dt>
            <dd class="text-sm text-white">{{ organization.address }}</dd>
          </template>
          <template v-if="organization.city">
            <dt class="text-xs font-medium text-gray-500">{{ $t('admin.orgCity') }}</dt>
            <dd class="text-sm text-white">{{ organization.city }}</dd>
          </template>
          <template v-if="organization.country">
            <dt class="text-xs font-medium text-gray-500">{{ $t('admin.orgCountry') }}</dt>
            <dd class="text-sm text-white">{{ organization.country }}</dd>
          </template>
          <template v-if="organization.email">
            <dt class="text-xs font-medium text-gray-500">{{ $t('admin.orgEmail') }}</dt>
            <dd class="text-sm text-white">
              <a :href="`mailto:${organization.email}`" class="text-yellow-400 hover:underline">{{ organization.email }}</a>
            </dd>
          </template>
          <template v-if="organization.phoneNumber">
            <dt class="text-xs font-medium text-gray-500">{{ $t('admin.orgPhone') }}</dt>
            <dd class="text-sm text-white">{{ organization.phoneNumber }}</dd>
          </template>
          <template v-if="organization.website">
            <dt class="text-xs font-medium text-gray-500">{{ $t('admin.orgWebsite') }}</dt>
            <dd class="text-sm text-white">
              <a :href="organization.website" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">{{ organization.website }}</a>
            </dd>
          </template>
        </dl>
        <p v-if="organization.description" class="mt-4 text-sm text-gray-400">
          {{ organization.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const organization = ref(null)
const loading = ref(true)
const error = ref(null)

const typeToLabelKey = {
  REAL_ESTATE_COMPANY: 'admin.typeRealEstate',
  BANK: 'admin.typeBank',
  SUPPLIER: 'admin.typeSupplier',
  CONTRACTOR: 'admin.typeContractor',
  DEVELOPER: 'admin.typeDeveloper',
  INSURANCE: 'admin.typeInsurance',
  CONSULTANT: 'admin.typeConsultant',
  ARCHITECT: 'admin.typeArchitect',
  FINISHING_CONTRACTOR: 'admin.typeFinishingContractor'
}
const orgTypeLabel = computed(() => {
  const type = organization.value?.type
  if (!type) return ''
  const key = typeToLabelKey[type] || ''
  return key ? t(key) : type
})

const backLink = computed(() => {
  const from = route.query.from
  if (from && typeof from === 'string' && from.startsWith('/marketplace')) return from
  return '/marketplace/banks'
})

function mediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (!base) return url
  const p = url.replace(/^\/api\/v1/, '')
  return `${base.replace(/\/$/, '')}${p.startsWith('/') ? p : '/' + p}`
}

async function loadOrganization() {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/organizations/${id}`)
    organization.value = res.data
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to load organization'
    organization.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadOrganization)
watch(() => route.params.id, loadOrganization)
</script>

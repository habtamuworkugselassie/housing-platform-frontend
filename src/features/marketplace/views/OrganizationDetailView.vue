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
      <router-link
        :to="backLink"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
      >
        <span aria-hidden="true">&larr;</span>
        <span>{{ $t('common.back') }}</span>
      </router-link>

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
              :src="currentMediaUrl"
              class="h-full w-full object-contain bg-zinc-950/50"
              controls
              muted
              playsinline
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
                <h1 class="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">{{ organization.name }}</h1>
                <p class="mt-1 text-sm text-gray-200 drop-shadow-md">{{ locationText || 'Location not provided' }}</p>
              </div>
            </div>
            <div v-if="galleryMedia.length > 1" class="mt-4 flex items-center gap-2">
              <button
                v-for="(item, index) in galleryMedia"
                :key="item.id || item.url || index"
                type="button"
                :class="[
                  'h-2 rounded-full transition-all',
                  currentMediaIndex === index ? 'w-8 bg-white shadow-sm' : 'w-2 bg-white/50 hover:bg-white/70'
                ]"
                @click="currentMediaIndex = index"
              />
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
                @click="currentMediaIndex = index"
              >
                <img
                  v-if="!isVideoItem(item)"
                  :src="mediaUrl(item.url)"
                  :alt="organization.name"
                  class="h-24 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  v-else
                  class="flex h-24 w-full items-center justify-center bg-black/40 text-xs text-white"
                >
                  VIDEO
                </div>
                <span
                  :class="[
                    'absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    currentMediaIndex === index ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white'
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
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="rounded-xl border border-white/10 bg-zinc-900 p-6 text-center">
        <p class="text-gray-400">Organization not found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api, { mediaUrl } from '@/shared/api/client'
import { formatOrganizationPhones } from '@/shared/utils'

const route = useRoute()
const { t } = useI18n()

const organization = ref(null)
const loading = ref(true)
const error = ref(null)
const currentMediaIndex = ref(0)

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

const contactChannelsCount = computed(() => {
  let count = 0
  if (organizationPhoneDisplay.value.length) count += 1
  if (organization.value?.email) count += 1
  if (organization.value?.website) count += 1
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

const backLink = computed(() => {
  const from = route.query.from
  if (from && typeof from === 'string' && from.startsWith('/marketplace')) return from
  return '/marketplace/banks'
})

function previousMedia() {
  if (!galleryMedia.value.length) return
  currentMediaIndex.value = (currentMediaIndex.value - 1 + galleryMedia.value.length) % galleryMedia.value.length
}

function nextMedia() {
  if (!galleryMedia.value.length) return
  currentMediaIndex.value = (currentMediaIndex.value + 1) % galleryMedia.value.length
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
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

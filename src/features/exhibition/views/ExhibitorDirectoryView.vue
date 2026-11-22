<template>
  <div class="bg-violet-50 text-gray-900">
    <section class="bg-violet-950 py-14 text-white sm:py-20">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{{ $t('exhibition.directory.eyebrow') }}</p>
        <h1 class="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">{{ $t('exhibition.directory.title') }}</h1>
        <p class="mt-4 max-w-2xl text-base text-white/80">{{ $t('exhibition.directory.intro') }}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <router-link :to="localized('/reserve')" class="rounded-full bg-gold-400 px-6 py-3 text-sm font-bold text-primary-950 hover:bg-gold-500">{{ $t('exhibition.directory.reserveCta') }}</router-link>
          <router-link :to="localized('/register-visitor')" class="rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">{{ $t('exhibition.directory.visitCta') }}</router-link>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p v-if="loading" class="py-12 text-center text-sm text-gray-500">{{ $t('exhibition.directory.loading') }}</p>
      <template v-else>
        <div v-if="all.length" class="mb-6 flex flex-wrap items-center gap-2" data-testid="directory-filters">
          <input v-model.trim="q" type="search" :placeholder="$t('exhibition.directory.search')" class="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm sm:w-72" data-testid="directory-search" />
          <button type="button" :class="chipCls(!sector)" @click="sector = ''">{{ $t('exhibition.directory.allSectors') }}</button>
          <button v-for="s in sectors" :key="s" type="button" :class="chipCls(sector === s)" :data-testid="`sector-${s}`" @click="sector = sector === s ? '' : s">{{ typeLabel(s) }}</button>
          <span class="ml-auto text-xs text-gray-500">{{ $t('exhibition.directory.count', { n: filtered.length }) }}</span>
        </div>

        <div v-if="!all.length" class="rounded-2xl border border-dashed border-primary-200 bg-white p-10 text-center" data-testid="directory-empty">
          <h2 class="text-xl font-bold">{{ $t('exhibition.directory.emptyTitle') }}</h2>
          <p class="mt-2 text-sm text-gray-600">{{ $t('exhibition.directory.emptyBody') }}</p>
          <router-link :to="localized('/reserve')" class="mt-5 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700">{{ $t('exhibition.directory.reserveCta') }}</router-link>
        </div>
        <p v-else-if="!filtered.length" class="py-12 text-center text-sm text-gray-500">{{ $t('exhibition.directory.noMatch') }}</p>
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="directory-grid">
          <router-link v-for="e in filtered" :key="e.organizationId" :to="`/organizations/${e.organizationId}`" class="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md" :data-testid="`exhibitor-${e.organizationId}`">
            <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <img v-if="e.logoUrl" :src="mediaUrl(e.logoUrl)" :alt="e.name" class="h-full w-full object-contain p-1" loading="lazy" />
              <span v-else class="text-2xl font-extrabold text-primary-300">{{ initials(e.name) }}</span>
            </div>
            <div class="min-w-0">
              <span class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" :class="tierCls(e.packageType)">{{ tierLabel(e) }}</span>
              <h2 class="mt-1 truncate text-base font-bold group-hover:text-primary-700">{{ e.name }}</h2>
              <p class="text-xs text-gray-600">{{ typeLabel(e.organizationType) }}<span v-if="e.city"> · {{ e.city }}</span></p>
              <p v-if="e.boothCodes && e.boothCodes.length" class="mt-1 text-xs font-semibold text-primary-800">{{ $t('exhibition.directory.booth', { codes: e.boothCodes.join(', ') }) }}</p>
            </div>
          </router-link>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getExhibitors } from '@/features/exhibition/api/exhibition.api'
import { mediaUrl } from '@/shared/api/client'
import { localePrefix } from '@/i18n/localeRoutes'

const { t, locale } = useI18n()
const loading = ref(true)
const all = ref([])
const q = ref('')
const sector = ref('')

const TIER_ORDER = ['EXCLUSIVE', 'PLATINUM', 'GOLD', 'SILVER', 'SPECIAL']
const sectors = computed(() => [...new Set(all.value.map((e) => e.organizationType).filter(Boolean))].sort())
const filtered = computed(() => {
  const needle = q.value.toLowerCase()
  return all.value
    .filter((e) => !sector.value || e.organizationType === sector.value)
    .filter((e) => !needle || (e.name || '').toLowerCase().includes(needle) || (e.city || '').toLowerCase().includes(needle))
    .sort((a, b) => tierRank(a.packageType) - tierRank(b.packageType) || (a.name || '').localeCompare(b.name || ''))
})

function tierRank(tier) {
  const i = TIER_ORDER.indexOf((tier || '').toUpperCase())
  return i < 0 ? TIER_ORDER.length : i
}
function tierLabel(e) {
  if ((e.partnerRole || '').toUpperCase() === 'MEDIA_PARTNER') return t('exhibition.directory.mediaPartner')
  const key = (e.packageType || '').toUpperCase()
  return key ? t(`exhibition.directory.tier.${key}`) : t('exhibition.directory.exhibitor')
}
function tierCls(tier) {
  const k = (tier || '').toUpperCase()
  if (k === 'EXCLUSIVE') return 'bg-violet-950 text-gold-300'
  if (k === 'PLATINUM') return 'bg-slate-800 text-white'
  if (k === 'GOLD') return 'bg-gold-400 text-primary-950'
  if (k === 'SILVER') return 'bg-slate-200 text-slate-800'
  return 'bg-primary-100 text-primary-800'
}
function typeLabel(type) {
  if (!type) return ''
  const key = `exhibition.directory.types.${type}`
  const v = t(key)
  return v === key ? type.replaceAll('_', ' ').toLowerCase() : v
}
function initials(name) {
  return (name || '').split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase()
}
function chipCls(active) {
  return ['rounded-full px-3 py-1.5 text-xs font-semibold', active ? 'bg-primary-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:border-primary-300']
}
function localized(path) {
  return `${localePrefix(String(locale.value || 'en').toLowerCase().startsWith('am') ? 'am' : 'en')}${path}`
}

onMounted(async () => {
  try {
    all.value = await getExhibitors()
  } catch {
    all.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-violet-950 py-10 px-4 text-white sm:px-6">
    <div class="absolute top-4 right-4 z-50"><LocaleSwitcher /></div>
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="flex flex-col items-center text-center">
        <router-link :to="localized('/')" class="mb-5 hover:opacity-90"><img src="/images/branding/ethio-build-connect-banner.png" alt="Ethio Build Connect" class="h-9 w-auto object-contain" /></router-link>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em]">{{ $t('reservation.eyebrow') }}</p>
        <h1 class="mb-2 text-2xl font-bold uppercase tracking-tight sm:text-3xl">{{ $t('reservation.title') }}</h1>
        <p class="max-w-xl text-sm text-white/80">{{ $t('reservation.pageIntro') }}</p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white p-5 text-gray-900 shadow-2xl sm:p-8">
        <p v-if="loading" class="py-8 text-center text-sm text-gray-500">{{ $t('reservation.loadingPackages') }}</p>
        <template v-else>
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-primary-700">{{ $t('reservation.choose') }}</p>
          <div class="mb-6 grid gap-3 sm:grid-cols-2" role="radiogroup">
            <button
              v-for="p in packages"
              :key="p.id"
              type="button"
              role="radio"
              :aria-checked="selected && selected.id === p.id"
              :class="['rounded-xl border px-4 py-3 text-left transition-colors', selected && selected.id === p.id ? 'border-primary-600 bg-violet-50 ring-2 ring-primary-300' : 'border-gray-200 hover:border-primary-300']"
              :data-testid="`pkg-${p.id}`"
              @click="selected = p"
            >
              <p class="font-bold text-gray-900">{{ p.name }}</p>
              <p class="text-sm text-gray-700">{{ money(p.basePrice) }} ETB</p>
            </button>
          </div>
          <SponsorshipReservationForm :key="selected ? selected.id : 'none'" :pkg="selected" :source="source" :prefill="prefill" @done="goHome" />
        </template>
      </div>
      <p class="text-center text-xs text-white/60">{{ $t('reservation.pageFoot') }} <a :href="localized('/#sponsorship-packages')" class="underline">{{ $t('reservation.seePackages') }}</a></p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import LocaleSwitcher from '@/shared/components/LocaleSwitcher.vue'
import SponsorshipReservationForm from '../components/SponsorshipReservationForm.vue'
import { getActiveSponsorshipPackages } from '@/features/exhibition/api/exhibition.api'
import { localePrefix } from '@/i18n/localeRoutes'

const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const packages = ref([])
const selected = ref(null)
const loading = ref(true)
const source = typeof route.query.src === 'string' ? route.query.src.slice(0, 40) : 'reserve-page'
const qs = (k, max = 200) => (typeof route.query[k] === 'string' ? route.query[k].slice(0, max) : '')
/** Invitation and interest links carry the organization and contact so nothing is retyped. */
const prefill = {
  organizationId: qs('org', 40),
  organizationName: qs('company'),
  company: qs('company'),
  contactName: qs('contact'),
  email: qs('email', 255),
  phone: qs('phone', 50)
}

function localized(path) {
  return `${localePrefix(String(locale.value || 'en').toLowerCase().startsWith('am') ? 'am' : 'en')}${path}`
}
function money(v) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}
function goHome() {
  router.push(localized('/'))
}

onMounted(async () => {
  try {
    const list = await getActiveSponsorshipPackages()
    packages.value = [...list].sort((a, b) => (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0))
    const wanted = typeof route.query.package === 'string' ? route.query.package : ''
    selected.value = packages.value.find((p) => p.id === wanted) || null
  } catch {
    packages.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-violet-950 flex flex-col justify-center items-center py-12 px-4 text-white">
    <div class="max-w-md w-full space-y-6">
      <router-link :to="localized('/')" class="block text-center hover:opacity-90 no-print">
        <img src="/images/branding/ethio-build-connect-banner.png" alt="Ethio Build Connect" class="mx-auto h-9 w-auto object-contain" />
      </router-link>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        <div v-if="loading" class="py-10 text-center text-white/70">{{ $t('visitor.loading') }}</div>
        <div v-else-if="error" class="py-10 text-center space-y-3">
          <p class="text-red-300 font-medium">{{ error }}</p>
          <router-link :to="localized('/register-visitor')" class="inline-block rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-primary-950">{{ $t('visitor.registerCta') }}</router-link>
        </div>
        <VisitorBadgeCard v-else :badge="badge" @again="goRegister" />
        <p v-if="badge && badge.status === 'CHECKED_IN'" class="mt-4 rounded-lg bg-green-500/15 px-3 py-2 text-center text-sm text-green-200">{{ $t('visitor.checkedInNote') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import VisitorBadgeCard from './VisitorBadgeCard.vue'
import { visitorApi } from '@/features/visitor/api/visitor.api'
import { localePrefix } from '@/i18n/localeRoutes'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const badge = ref(null)

function localized(path) {
  return `${localePrefix(String(locale.value || 'en').toLowerCase().startsWith('am') ? 'am' : 'en')}${path}`
}
function goRegister() {
  router.push(localized('/register-visitor'))
}

onMounted(async () => {
  try {
    badge.value = await visitorApi.badge(String(route.params.code || ''))
  } catch (e) {
    error.value = e?.response?.status === 404 ? t('visitor.notFound') : t('visitor.errors.generic')
  } finally {
    loading.value = false
  }
})
</script>

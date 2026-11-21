<template>
  <div class="min-h-screen bg-violet-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-white relative">
    <div class="absolute top-4 right-4 z-50">
      <LocaleSwitcher />
    </div>

    <div class="max-w-xl w-full space-y-8">
      <div class="flex flex-col items-center">
        <router-link :to="localized('/')" class="mb-6 hover:opacity-90 transition-opacity">
          <img src="/images/branding/ethio-build-connect-banner.png" alt="Ethio Build Connect" class="h-9 w-auto object-contain" />
        </router-link>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-2 text-center">{{ $t('visitor.eyebrow') }}</p>
        <h1 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-3 text-white text-center">{{ $t('visitor.title') }}</h1>
        <p class="text-white/80 text-center text-sm mb-2 max-w-md">{{ $t('visitor.subtitle') }}</p>
        <p class="text-sm font-medium text-green-300 text-center">{{ $t('visitor.free') }}</p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        <VisitorBadgeCard v-if="badge" :badge="badge" :already="badge.alreadyRegistered" @again="badge = null" />

        <form v-else class="space-y-5" novalidate data-testid="visitor-form" @submit.prevent="submit">
          <div>
            <label for="v-name" class="mb-1 block text-sm font-medium text-white/90">{{ $t('visitor.name') }}</label>
            <input id="v-name" v-model.trim="form.fullName" type="text" autocomplete="name" required maxlength="200" :class="inputCls(errors.fullName)" />
            <p v-if="errors.fullName" class="mt-1 text-xs text-red-300">{{ errors.fullName }}</p>
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="v-email" class="mb-1 block text-sm font-medium text-white/90">{{ $t('visitor.email') }}</label>
              <input id="v-email" v-model.trim="form.email" type="email" autocomplete="email" required maxlength="255" :class="inputCls(errors.email)" />
              <p v-if="errors.email" class="mt-1 text-xs text-red-300">{{ errors.email }}</p>
            </div>
            <div>
              <label for="v-phone" class="mb-1 block text-sm font-medium text-white/90">{{ $t('visitor.phone') }}</label>
              <input id="v-phone" v-model.trim="form.phone" type="tel" autocomplete="tel" maxlength="50" placeholder="+251 9…" :class="inputCls(false)" />
            </div>
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="v-org" class="mb-1 block text-sm font-medium text-white/90">{{ $t('visitor.organization') }}</label>
              <input id="v-org" v-model.trim="form.organization" type="text" autocomplete="organization" maxlength="200" :class="inputCls(false)" />
            </div>
            <div>
              <label for="v-type" class="mb-1 block text-sm font-medium text-white/90">{{ $t('visitor.type') }}</label>
              <select id="v-type" v-model="form.visitorType" :class="inputCls(false)" data-testid="visitor-type">
                <option v-for="t in VISITOR_TYPES" :key="t" :value="t">{{ $t(`visitor.types.${t}`) }}</option>
              </select>
            </div>
          </div>
          <div>
            <label for="v-interests" class="mb-1 block text-sm font-medium text-white/90">{{ $t('visitor.interests') }}</label>
            <textarea id="v-interests" v-model.trim="form.interests" rows="2" maxlength="1000" :placeholder="$t('visitor.interestsPlaceholder')" :class="inputCls(false)"></textarea>
          </div>
          <div class="hidden" aria-hidden="true">
            <label>Website <input v-model="form.website" type="text" tabindex="-1" autocomplete="off" /></label>
          </div>
          <p v-if="submitError" class="text-sm text-red-300 font-medium" role="alert">{{ submitError }}</p>
          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-3.5 px-6 bg-gold-400 text-primary-950 font-semibold text-sm uppercase tracking-wider rounded-lg hover:bg-gold-500 transition-colors disabled:opacity-50"
            data-testid="visitor-submit"
          >
            {{ submitting ? $t('visitor.submitting') : $t('visitor.submit') }}
          </button>
          <p class="text-xs text-white/60 text-center">{{ $t('visitor.privacy') }}</p>
        </form>
      </div>

      <div class="grid grid-cols-3 gap-3 text-center text-xs text-white/80">
        <div class="rounded-xl border border-white/10 bg-white/5 p-3"><p class="font-bold text-white">{{ $t('visitor.factDate') }}</p><p>{{ $t('visitor.factDateValue') }}</p></div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3"><p class="font-bold text-white">{{ $t('visitor.factVenue') }}</p><p>{{ $t('visitor.factVenueValue') }}</p></div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3"><p class="font-bold text-white">{{ $t('visitor.factEntry') }}</p><p>{{ $t('visitor.factEntryValue') }}</p></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import LocaleSwitcher from '@/shared/components/LocaleSwitcher.vue'
import VisitorBadgeCard from './VisitorBadgeCard.vue'
import { visitorApi, VISITOR_TYPES } from '@/features/visitor/api/visitor.api'
import { trackEvent } from '@/utils/analytics'
import { localePrefix } from '@/i18n/localeRoutes'

const { t, locale } = useI18n()
const route = useRoute()

const form = reactive({ fullName: '', email: '', phone: '', organization: '', visitorType: 'HOMEBUYER', interests: '', website: '' })
const errors = reactive({ fullName: '', email: '' })
const submitting = ref(false)
const submitError = ref('')
const badge = ref(null)

function isAm() {
  return String(locale.value || 'en').toLowerCase().startsWith('am')
}
function localized(path) {
  return `${localePrefix(isAm() ? 'am' : 'en')}${path}`
}

function inputCls(invalid) {
  return [
    'w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400',
    invalid ? 'border-red-400' : 'border-white/20'
  ]
}

function validate() {
  errors.fullName = form.fullName ? '' : t('visitor.errors.name')
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : t('visitor.errors.email')
  return !errors.fullName && !errors.email
}

async function submit() {
  submitError.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    badge.value = await visitorApi.register({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      organization: form.organization || undefined,
      visitorType: form.visitorType,
      interests: form.interests || undefined,
      locale: isAm() ? 'am' : 'en',
      source: typeof route.query.src === 'string' ? route.query.src.slice(0, 40) : 'web',
      website: form.website || undefined
    })
    trackEvent('visitor_registration', { visitor_type: form.visitorType })
  } catch (e) {
    const status = e?.response?.status
    submitError.value = status === 429 ? t('visitor.errors.tooMany') : e?.response?.data?.message || t('visitor.errors.generic')
  } finally {
    submitting.value = false
  }
}
</script>

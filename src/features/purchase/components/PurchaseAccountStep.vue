<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-gray-900">{{ $t('purchase.account.title') }}</h2>
      <p class="mt-1 text-sm text-gray-500">{{ $t('purchase.account.subtitle') }}</p>
    </header>

    <!-- Google -->
    <div v-if="google.available.value" class="space-y-2">
      <div ref="googleContainer" class="flex min-h-[44px] justify-center" data-testid="google-button"></div>
      <p v-if="google.loading.value" class="text-center text-xs text-gray-400">{{ $t('common.loading') }}</p>
      <div class="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
        <span class="h-px flex-1 bg-gray-200"></span>{{ $t('common.or') }}<span class="h-px flex-1 bg-gray-200"></span>
      </div>
    </div>

    <!-- Mode switch -->
    <div class="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 text-sm font-semibold" role="tablist">
      <button type="button" role="tab" :aria-selected="mode === 'register'" class="rounded-lg px-3 py-2 transition-colors" :class="mode === 'register' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'" @click="switchMode('register')">
        {{ $t('purchase.account.newHere') }}
      </button>
      <button type="button" role="tab" :aria-selected="mode === 'login'" class="rounded-lg px-3 py-2 transition-colors" :class="mode === 'login' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'" @click="switchMode('login')">
        {{ $t('purchase.account.haveAccount') }}
      </button>
    </div>

    <!-- Quick sign-up -->
    <form v-if="mode === 'register'" class="space-y-4" novalidate @submit.prevent="submitRegister">
      <div>
        <label for="acc-name" class="block text-sm font-medium text-gray-700">{{ $t('purchase.account.fullName') }} <span class="text-red-600" aria-hidden="true">*</span></label>
        <input id="acc-name" v-model="register.fullName" type="text" autocomplete="name" class="mt-1 w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400" :class="attempted && registerErrors.fullName ? 'border-red-400' : 'border-gray-300'" :placeholder="$t('purchase.agreement.signatoryPlaceholder')" />
        <p v-if="attempted && registerErrors.fullName" class="mt-1 text-xs text-red-600">{{ $t(registerErrors.fullName) }}</p>
      </div>
      <div>
        <label for="acc-phone" class="block text-sm font-medium text-gray-700">{{ $t('purchase.contact.phone') }} <span class="text-red-600" aria-hidden="true">*</span></label>
        <CountryCodePhoneInput id="acc-phone" v-model:country-code="registerCountryCode" v-model:number="registerNational" variant="light" class="mt-1" required :invalid="Boolean(attempted && registerErrors.phone)" :placeholder="registerCountryCode === '+251' ? $t('purchase.contact.nationalPlaceholderEt') : $t('purchase.contact.phone')" :button-label="$t('purchase.contact.countryCode')" :search-placeholder="$t('purchase.contact.searchCountry')" :no-match-label="$t('purchase.contact.noCountryMatch', { query: '{query}' })" />
        <p class="mt-1 text-xs" :class="attempted && registerErrors.phone ? 'text-red-600' : 'text-gray-500'">
          <template v-if="attempted && registerErrors.phone">{{ $t(registerErrors.phone) }}</template>
          <template v-else-if="normalizedPhone">{{ $t('purchase.contact.phoneStoredAs', { phone: normalizedPhone }) }}</template>
          <template v-else>{{ $t('purchase.account.phoneHelp') }}</template>
        </p>
      </div>
      <div>
        <label for="acc-email" class="block text-sm font-medium text-gray-700">{{ $t('purchase.contact.email') }} <span class="ml-1 text-xs font-normal text-gray-400">({{ $t('purchase.optional') }})</span></label>
        <input id="acc-email" v-model="register.email" type="email" autocomplete="email" class="mt-1 w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400" :class="attempted && registerErrors.email ? 'border-red-400' : 'border-gray-300'" />
        <p v-if="attempted && registerErrors.email" class="mt-1 text-xs text-red-600">{{ $t(registerErrors.email) }}</p>
      </div>
      <details class="rounded-xl border border-dashed border-gray-300 p-3 text-sm">
        <summary class="cursor-pointer font-medium text-gray-700">{{ $t('purchase.account.passwordOptional') }}</summary>
        <p class="mt-2 text-xs text-gray-500">{{ $t('purchase.account.passwordHelp') }}</p>
        <input id="acc-password" v-model="register.password" type="password" autocomplete="new-password" class="mt-2 w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400" :class="attempted && registerErrors.password ? 'border-red-400' : 'border-gray-300'" :aria-label="$t('purchase.account.passwordOptional')" />
        <p v-if="attempted && registerErrors.password" class="mt-1 text-xs text-red-600">{{ $t(registerErrors.password) }}</p>
      </details>
      <p class="text-xs text-gray-500">{{ $t('purchase.account.consent') }}</p>
      <p v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{{ error }}</p>
      <button type="submit" class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60" :disabled="busy" :aria-busy="busy ? 'true' : 'false'">
        <span v-if="busy" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        {{ $t('purchase.account.createAndContinue') }}
      </button>
    </form>

    <!-- Sign in with a WhatsApp code -->
    <form v-else class="space-y-4" novalidate @submit.prevent="codeSent ? confirmCode() : sendCode()">
      <div>
        <label for="login-phone" class="block text-sm font-medium text-gray-700">{{ $t('purchase.contact.phone') }}</label>
        <CountryCodePhoneInput id="login-phone" v-model:country-code="loginCountryCode" v-model:number="loginNational" variant="light" class="mt-1" :disabled="codeSent" :invalid="Boolean(attempted && loginErrors.phone)" :placeholder="loginCountryCode === '+251' ? $t('purchase.contact.nationalPlaceholderEt') : $t('purchase.contact.phone')" :button-label="$t('purchase.contact.countryCode')" :search-placeholder="$t('purchase.contact.searchCountry')" :no-match-label="$t('purchase.contact.noCountryMatch', { query: '{query}' })" />
        <p v-if="attempted && loginErrors.phone" class="mt-1 text-xs text-red-600">{{ $t(loginErrors.phone) }}</p>
      </div>
      <div v-if="codeSent">
        <label for="login-code" class="block text-sm font-medium text-gray-700">{{ $t('purchase.account.code') }}</label>
        <input id="login-code" v-model="login.code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" class="mt-1 w-full rounded-xl border px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400" :class="attempted && loginErrors.code ? 'border-red-400' : 'border-gray-300'" />
        <p class="mt-1 text-xs text-gray-500">{{ $t('purchase.account.codeHelp') }}</p>
        <button type="button" class="mt-1 text-xs font-semibold text-primary-700 hover:underline" :disabled="busy" @click="codeSent = false; login.code = ''">{{ $t('purchase.account.changePhone') }}</button>
      </div>
      <p v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{{ error }}</p>
      <button type="submit" class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60" :disabled="busy" :aria-busy="busy ? 'true' : 'false'">
        <span v-if="busy" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        {{ codeSent ? $t('purchase.account.verifyAndContinue') : $t('purchase.account.sendCode') }}
      </button>
      <p class="text-center text-xs text-gray-500">
        {{ $t('purchase.account.preferPassword') }}
        <router-link :to="{ name: 'Login', query: { redirect: redirectPath } }" class="font-semibold text-primary-700 hover:underline">{{ $t('purchase.account.passwordLogin') }}</router-link>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authApi } from '@/features/auth/api/auth.api'
import type { AuthResponse } from '@/features/auth/api/auth.types'
import { useAuthStore } from '@/features/auth'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'
import { usePhoneParts } from '../composables/usePhoneParts'
import { isValidEmail, isValidPhone, normalizePhone } from '../utils/phone'
import { useGoogleIdentity } from '../composables/useGoogleIdentity'

/**
 * Step 0 of the wizard for visitors. Three doors, all ending in a signed-in BUYER:
 * Google (verified email), a quick sign-up (name + phone), or a WhatsApp code for an existing
 * phone. On success the parent receives what we learned so later steps are pre-filled.
 */
export interface AccountDetails {
  fullName?: string
  phone?: string
  email?: string
}

const emit = defineEmits<{ (e: 'authenticated', details: AccountDetails): void }>()

const route = useRoute()
const { t, te, locale } = useI18n()
const authStore = useAuthStore()
const google = useGoogleIdentity()
const googleContainer = ref<HTMLElement | null>(null)

const mode = ref<'register' | 'login'>('register')
const attempted = ref(false)
const busy = ref(false)
const error = ref<string | null>(null)
const codeSent = ref(false)

const register = reactive({ fullName: '', phone: '', email: '', password: '' })
const login = reactive({ phone: '', code: '' })
/** Country-code selector + national number for each form, kept in sync with the single string. */
const { countryCode: registerCountryCode, national: registerNational } = usePhoneParts(toRef(register, 'phone'))
const { countryCode: loginCountryCode, national: loginNational } = usePhoneParts(toRef(login, 'phone'))

const redirectPath = computed(() => route.fullPath)
const normalizedPhone = computed(() => normalizePhone(register.phone))

const registerErrors = computed(() => {
  const errors: Record<string, string> = {}
  if (register.fullName.trim().length < 2) errors.fullName = 'purchase.account.errors.nameRequired'
  if (!register.phone.trim()) errors.phone = 'purchase.errors.phoneRequired'
  else if (!isValidPhone(register.phone)) errors.phone = 'purchase.errors.phoneInvalid'
  if (register.email.trim() && !isValidEmail(register.email)) errors.email = 'validation.email'
  if (register.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(register.password)) {
    errors.password = 'purchase.account.errors.passwordWeak'
  }
  return errors
})
const loginErrors = computed(() => {
  const errors: Record<string, string> = {}
  if (!login.phone.trim()) errors.phone = 'purchase.errors.phoneRequired'
  else if (!isValidPhone(login.phone)) errors.phone = 'purchase.errors.phoneInvalid'
  if (codeSent.value && !/^\d{6}$/.test(login.code.trim())) errors.code = 'purchase.account.errors.codeInvalid'
  return errors
})

function fail(err: any, fallbackKey: string) {
  const message = err?.response?.data?.message
  error.value = typeof message === 'string' && message ? message : t(fallbackKey)
  // A phone that already has an account: steer to the sign-in tab with the number kept.
  if (err?.response?.status === 409 && mode.value === 'register') {
    login.phone = register.phone
    mode.value = 'login'
  }
}

function finish(auth: AuthResponse, details: AccountDetails) {
  authStore.setAuth(auth)
  emit('authenticated', details)
}

async function submitRegister() {
  attempted.value = true
  error.value = null
  if (Object.keys(registerErrors.value).length) return
  busy.value = true
  try {
    const phone = normalizePhone(register.phone)!
    const auth = await authApi.quickRegister({
      fullName: register.fullName.trim(),
      phoneNumber: phone,
      email: register.email.trim() || undefined,
      password: register.password || undefined
    })
    finish(auth, { fullName: register.fullName.trim(), phone, email: register.email.trim() || undefined })
  } catch (err) {
    fail(err, 'purchase.account.errors.registerFailed')
  } finally {
    busy.value = false
  }
}

async function sendCode() {
  attempted.value = true
  error.value = null
  if (loginErrors.value.phone) return
  busy.value = true
  try {
    await authApi.requestOtpLogin(normalizePhone(login.phone)!)
    codeSent.value = true
    attempted.value = false
  } catch (err) {
    fail(err, 'purchase.account.errors.codeSendFailed')
  } finally {
    busy.value = false
  }
}

async function confirmCode() {
  attempted.value = true
  error.value = null
  if (Object.keys(loginErrors.value).length) return
  busy.value = true
  try {
    const phone = normalizePhone(login.phone)!
    const auth = await authApi.confirmOtpLogin(phone, login.code.trim())
    finish(auth, { phone, email: auth.email || undefined, fullName: [auth.firstName, auth.lastName].filter(Boolean).join(' ') || undefined })
  } catch (err) {
    fail(err, 'purchase.account.errors.codeInvalid')
  } finally {
    busy.value = false
  }
}

async function onGoogleCredential(idToken: string) {
  busy.value = true
  error.value = null
  try {
    const auth = await authApi.loginWithGoogle({ idToken })
    finish(auth, { email: auth.email || undefined, fullName: [auth.firstName, auth.lastName].filter(Boolean).join(' ') || undefined })
  } catch (err) {
    fail(err, 'purchase.account.errors.googleFailed')
  } finally {
    busy.value = false
  }
}

async function mountGoogle() {
  await nextTick()
  if (googleContainer.value) {
    await google.renderButton(googleContainer.value, onGoogleCredential, locale.value)
  }
}
onMounted(mountGoogle)
/** A manual tab switch starts clean; a programmatic switch (409 → sign in) keeps its message. */
function switchMode(next: 'register' | 'login') {
  mode.value = next
  error.value = null
  attempted.value = false
}

defineExpose({ mode, registerErrors, loginErrors })
void te
</script>

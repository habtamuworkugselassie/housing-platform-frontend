<template>
  <div class="min-h-screen flex items-center justify-center bg-violet-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
    <div class="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_24px_60px_-30px_rgba(46,16,101,0.35)] sm:p-10 space-y-8">
      <div>
        <div class="text-center"><p class="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />{{ $t('auth.loginEyebrow') }}</p></div><h2 class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {{ $t('auth.login') }}
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- Email vs Phone toggle -->
        <div class="flex rounded-full border border-gray-200 bg-gray-100 p-1">
          <button
            type="button"
            :class="loginMode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            class="flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors"
            @click="loginMode = 'email'"
          >
            {{ $t('auth.loginWithEmail') }}
          </button>
          <button
            type="button"
            :class="loginMode === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            class="flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors"
            @click="loginMode = 'phone'"
          >
            {{ $t('auth.loginWithPhone') }}
          </button>
        </div>

        <div class="space-y-3">
          <div v-if="loginMode === 'email'">
            <label for="username" class="sr-only">{{ $t('auth.email') }}</label>
            <input
              id="username"
              v-model="form.username"
              type="email"
              required
              autocomplete="email"
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
              :placeholder="$t('auth.emailAddress')"
            />
          </div>
          <div v-else class="rounded-xl border border-gray-300 bg-white px-3 py-2">
            <label for="login-phone" class="sr-only">{{ $t('auth.phoneNumber') }}</label>
            <CountryCodePhoneInput
              id="login-phone"
              v-model:country-code="loginPhoneCountryCode"
              v-model:number="loginPhoneNumber"
              :placeholder="$t('auth.phoneNumber')"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
              :placeholder="$t('auth.password')"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('common.loading') }}</span>
            <span v-else>{{ $t('auth.login') }}</span>
          </button>
        </div>

        <div class="text-center space-y-1">
          <div>
            <router-link to="/forgot-password" class="inline-block py-2 -my-1 text-sm font-medium text-primary-700 hover:text-primary-900">
              {{ $t('auth.forgotPassword') }}
            </router-link>
          </div>
          <div>
            <router-link to="/register" class="inline-block py-2 -my-1 text-sm font-medium text-primary-700 hover:text-primary-900">
              {{ $t('auth.dontHaveAccount') }} {{ $t('auth.register') }}
            </router-link>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()

const loginMode = ref('email')
const loginPhoneCountryCode = ref('+251')
const loginPhoneNumber = ref('')

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  if (loginMode.value === 'phone') {
    const number = (loginPhoneNumber.value || '').trim().replace(/\s/g, '')
    if (!number) {
      error.value = t('auth.enterPhoneNumber')
      loading.value = false
      return
    }
    form.value.username = loginPhoneCountryCode.value + number
  }

  try {
    await authStore.login(form.value)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (err) {
    error.value = err.message || 'Invalid credentials. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

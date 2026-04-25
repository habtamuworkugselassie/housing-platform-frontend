<template>
  <div class="min-h-screen flex items-center justify-center bg-violet-950 py-12 px-4 sm:px-6 lg:px-8 text-white">
    <div class="max-w-md w-full space-y-8 p-8 rounded-lg bg-zinc-900 border border-white/10">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          {{ $t('auth.login') }}
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- Email vs Phone toggle -->
        <div class="flex rounded-lg border border-white/20 bg-white/5 p-1">
          <button
            type="button"
            :class="loginMode === 'email' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'"
            class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors"
            @click="loginMode = 'email'"
          >
            {{ $t('auth.loginWithEmail') }}
          </button>
          <button
            type="button"
            :class="loginMode === 'phone' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'"
            class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors"
            @click="loginMode = 'phone'"
          >
            {{ $t('auth.loginWithPhone') }}
          </button>
        </div>

        <div class="rounded-md -space-y-px">
          <div v-if="loginMode === 'email'">
            <label for="username" class="sr-only">{{ $t('auth.email') }}</label>
            <input
              id="username"
              v-model="form.username"
              type="email"
              required
              autocomplete="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
              :placeholder="$t('auth.emailAddress')"
            />
          </div>
          <div v-else class="rounded-t-md border border-white/20 bg-white/5 px-3 py-2">
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
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
              :placeholder="$t('auth.password')"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-900/40 border border-red-500/30 p-4">
          <div class="text-sm text-red-200">{{ error }}</div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-violet-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-black disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('common.loading') }}</span>
            <span v-else>{{ $t('auth.login') }}</span>
          </button>
        </div>

        <div class="text-center space-y-1">
          <div>
            <router-link to="/forgot-password" class="text-sm text-white hover:text-black">
              {{ $t('auth.forgotPassword') }}
            </router-link>
          </div>
          <div>
            <router-link to="/register" class="text-sm text-white hover:text-black">
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

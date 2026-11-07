<template>
  <div class="min-h-screen flex items-center justify-center bg-violet-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
    <div class="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_24px_60px_-30px_rgba(46,16,101,0.35)] sm:p-10 space-y-8">
      <div>
        <div class="text-center"><p class="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />{{ $t('auth.accountEyebrow') }}</p></div><h2 class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {{ $t('auth.resetPasswordTitle') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('auth.resetPasswordSubtitle') }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-3">
          <div>
            <label for="newPassword" class="sr-only">{{ $t('auth.newPassword') }}</label>
            <input
              id="newPassword"
              v-model="form.newPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
              :placeholder="$t('auth.newPassword')"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">{{ $t('auth.confirmNewPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
              :placeholder="$t('auth.confirmNewPassword')"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>

        <div v-if="success" class="rounded-md bg-green-900/40 border border-green-500/30 p-4">
          <div class="text-sm text-green-200">
            {{ $t('auth.resetSuccessMessage') }}
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !token"
            class="flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('auth.resetting') }}</span>
            <span v-else>{{ $t('auth.resetPasswordButton') }}</span>
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-sm font-medium text-primary-700 hover:text-primary-900">
            {{ $t('auth.backToLogin') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authApi } from '../api/auth.api'

const { t } = useI18n()
const route = useRoute()
const token = computed(() => (route.query.token || '').trim())

const form = ref({
  newPassword: '',
  confirmPassword: ''
})
const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(() => {
  if (!token.value) {
    error.value = t('auth.invalidResetLink')
  }
})

const handleSubmit = async () => {
  if (!token.value) return
  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = t('auth.passwordsDoNotMatch')
    return
  }
  if (form.value.newPassword.length < 8) {
    error.value = t('auth.passwordMinLength')
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await authApi.resetPassword({
      token: token.value,
      newPassword: form.value.newPassword
    })
    success.value = true
  } catch (err) {
    error.value = err?.message || t('auth.linkExpiredError')
  } finally {
    loading.value = false
  }
}
</script>

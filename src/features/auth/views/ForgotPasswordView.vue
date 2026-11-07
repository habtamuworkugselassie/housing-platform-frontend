<template>
  <div class="min-h-screen flex items-center justify-center bg-violet-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
    <div class="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_24px_60px_-30px_rgba(46,16,101,0.35)] sm:p-10 space-y-8">
      <div>
        <div class="text-center"><p class="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />{{ $t('auth.accountEyebrow') }}</p></div><h2 class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {{ $t('auth.forgotPasswordTitle') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('auth.forgotPasswordSubtitle') }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="sr-only">{{ $t('auth.emailAddress') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary-400 focus:border-primary-400 focus:z-10 sm:text-sm"
            :placeholder="$t('auth.emailAddress')"
          />
        </div>

        <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>

        <div v-if="success" class="rounded-md bg-green-900/40 border border-green-500/30 p-4">
          <div class="text-sm text-green-200">
            {{ $t('auth.forgotSuccessMessage') }}
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('auth.sending') }}</span>
            <span v-else>{{ $t('auth.sendResetLink') }}</span>
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authApi } from '../api/auth.api'

const { t } = useI18n()
const form = ref({ email: '' })
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    await authApi.forgotPassword({ email: form.value.email.trim() })
    success.value = true
  } catch (err) {
    error.value = err?.message || t('auth.somethingWentWrong')
  } finally {
    loading.value = false
  }
}
</script>

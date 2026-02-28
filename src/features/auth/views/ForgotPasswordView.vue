<template>
  <div class="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 text-white">
    <div class="max-w-md w-full space-y-8 p-8 rounded-lg bg-zinc-900 border border-white/10">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          {{ $t('auth.forgotPasswordTitle') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-400">
          {{ $t('auth.forgotPasswordSubtitle') }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
            :placeholder="$t('auth.emailAddress')"
          />
        </div>

        <div v-if="error" class="rounded-md bg-red-900/40 border border-red-500/30 p-4">
          <div class="text-sm text-red-200">{{ error }}</div>
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
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-yellow-400 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('auth.sending') }}</span>
            <span v-else>{{ $t('auth.sendResetLink') }}</span>
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-sm text-white hover:text-yellow-400">
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

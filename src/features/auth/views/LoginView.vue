<template>
  <div class="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 text-white">
    <div class="max-w-md w-full space-y-8 p-8 rounded-lg bg-zinc-900 border border-white/10">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          {{ $t('auth.login') }}
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md -space-y-px">
          <div>
            <label for="username" class="sr-only">Email or Phone</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.email') + ' ' + $t('common.or') + ' ' + $t('auth.phoneNumber')"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
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
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-yellow-400 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('common.loading') }}</span>
            <span v-else>{{ $t('auth.login') }}</span>
          </button>
        </div>

        <div class="text-center space-y-1">
          <div>
            <router-link to="/forgot-password" class="text-sm text-white hover:text-yellow-400">
              {{ $t('auth.forgotPassword') }}
            </router-link>
          </div>
          <div>
            <router-link to="/register" class="text-sm text-white hover:text-yellow-400">
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
import { useAuthStore } from '@/features/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

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

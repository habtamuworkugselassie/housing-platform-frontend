<template>
  <div class="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 text-white">
    <div class="max-w-md w-full space-y-8 p-8 rounded-lg bg-zinc-900 border border-white/10">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          {{ $t('register.title') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-400">
          {{ $t('register.subtitle') }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md -space-y-px">
          <div>
            <label for="firstName" class="sr-only">First Name</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.firstName')"
            />
          </div>
          <div>
            <label for="lastName" class="sr-only">Last Name</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.lastName')"
            />
          </div>
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.email')"
            />
          </div>
          <div>
            <label for="phoneNumber" class="sr-only">Phone Number</label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              type="tel"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
              :placeholder="$t('register.phoneOptional')"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
              :placeholder="$t('register.passwordHint')"
            />
          </div>
          <div>
            <label for="role" class="sr-only">Role</label>
            <select
              id="role"
              v-model="form.role"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 bg-white/5 text-white rounded-b-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
            >
              <option value="">{{ $t('register.selectRole') }}</option>
              <option value="BUYER">{{ $t('register.buyer') }}</option>
              <option value="REALTOR">{{ $t('register.realtor') }}</option>
              <option value="BANKER">{{ $t('register.banker') }}</option>
              <option value="SUPPLIER">{{ $t('register.supplier') }}</option>
            </select>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-900/40 border border-red-500/30 p-4">
          <div class="text-sm text-red-200">{{ error }}</div>
        </div>
        
        <div v-if="fieldErrors && fieldErrors.length > 0" class="rounded-md bg-red-900/40 border border-red-500/30 p-4">
          <div class="text-sm font-medium text-red-200 mb-2">{{ $t('register.fixErrors') }}</div>
          <ul class="list-disc list-inside text-sm text-red-200 space-y-1">
            <li v-for="fieldError in fieldErrors" :key="fieldError.field">
              <strong>{{ fieldError.field }}:</strong> {{ fieldError.message }}
            </li>
          </ul>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-yellow-400 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('register.registering') }}</span>
            <span v-else>{{ $t('auth.register') }}</span>
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-sm text-white hover:text-yellow-400">
            {{ $t('register.alreadyHaveAccount') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  role: ''
})

const loading = ref(false)
const error = ref('')
const fieldErrors = ref([])

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  fieldErrors.value = []

  try {
    await authStore.register(form.value)
    router.push('/dashboard')
  } catch (err) {
    // Handle validation errors with fieldErrors
    // The auth store throws error.response.data, so err is already the data object
    if (err.fieldErrors && Array.isArray(err.fieldErrors)) {
      fieldErrors.value = err.fieldErrors
      error.value = err.message || 'Please fix the validation errors above.'
    } else if (err.response?.data?.fieldErrors && Array.isArray(err.response.data.fieldErrors)) {
      // Fallback: check response.data if error structure is different
      fieldErrors.value = err.response.data.fieldErrors
      error.value = err.response.data.message || 'Please fix the validation errors above.'
    } else {
      // Handle other errors
      error.value = err.message || err.response?.data?.message || 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

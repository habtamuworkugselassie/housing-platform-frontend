<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-8">
        <h2 class="text-2xl font-bold text-white mb-6">Create New Agent</h2>
        <p class="text-sm text-gray-400 mb-6">
          Create a new user account and register them as an agent for your organization.
        </p>
        
        <form @submit.prevent="handleSubmit">
          <div class="space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-400">First Name *</label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-400">Last Name *</label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-400">Email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-400">Phone Number</label>
              <input
                id="phoneNumber"
                v-model="form.phoneNumber"
                type="tel"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-400">Password *</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                :placeholder="$t('register.passwordPlaceholder')"
              />
              <p class="mt-1 text-sm text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, and a number.
              </p>
            </div>

            <div>
              <label for="licenseNumber" class="block text-sm font-medium text-gray-400">License Number</label>
              <input
                id="licenseNumber"
                v-model="form.licenseNumber"
                type="text"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                :placeholder="$t('register.licensePlaceholder')"
              />
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-gray-400">Additional Notes</label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                :placeholder="$t('register.notesPlaceholder')"
              />
            </div>
          </div>

          <div v-if="error" class="mt-4 rounded-md bg-red-500/30 border border-red-400/50 p-4">
            <div class="text-sm text-red-200">{{ error }}</div>
          </div>

          <div v-if="fieldErrors && fieldErrors.length > 0" class="mt-4 rounded-md bg-red-500/30 border border-red-400/50 p-4">
            <div class="text-sm font-medium text-red-200 mb-2">{{ $t('register.fixFollowingErrors') }}</div>
            <ul class="list-disc list-inside text-sm text-red-200 space-y-1">
              <li v-for="fieldError in fieldErrors" :key="fieldError.field">
                <strong>{{ fieldError.field }}:</strong> {{ fieldError.message }}
              </li>
            </ul>
          </div>

          <div v-if="success" class="mt-4 rounded-md bg-green-500/30 border border-green-400/50 p-4">
            <div class="text-sm text-green-200">{{ success }}</div>
          </div>

          <div class="mt-6 flex space-x-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 flex justify-center py-2 px-4 rounded-md text-sm font-medium text-black bg-white hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:bg-white/50"
            >
              <span v-if="loading">Creating Agent...</span>
              <span v-else>Create Agent</span>
            </button>
            <button
              type="button"
              @click="$router.push('/dashboard')"
              class="flex-1 flex justify-center py-2 px-4 rounded-md text-sm font-medium text-black bg-white hover:bg-yellow-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'

const router = useRouter()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  licenseNumber: '',
  notes: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const fieldErrors = ref([])

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  fieldErrors.value = []

  try {
    await api.post('/real-estate-agents/create', form.value)
    success.value = 'Agent created successfully!'
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (err) {
    // Handle validation errors with fieldErrors
    if (err.fieldErrors && Array.isArray(err.fieldErrors)) {
      fieldErrors.value = err.fieldErrors
      error.value = err.message || 'Please fix the validation errors above.'
    } else if (err.response?.data?.fieldErrors && Array.isArray(err.response.data.fieldErrors)) {
      fieldErrors.value = err.response.data.fieldErrors
      error.value = err.response.data.message || 'Please fix the validation errors above.'
    } else {
      // Handle other errors
      error.value = err.message || err.response?.data?.message || 'Failed to create agent. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

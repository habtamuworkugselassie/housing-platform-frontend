<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
    <div class="bg-zinc-900 border border-white/10 shadow rounded-lg p-8">
      <h2 class="text-2xl font-bold text-white mb-6">Register Real Estate Company</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="name" class="block text-sm font-medium text-gray-300">Company Name *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label for="registrationNumber" class="block text-sm font-medium text-gray-300">Legal Registration Number</label>
            <input
              id="registrationNumber"
              v-model="form.registrationNumber"
              type="text"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-300">Email *</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-300">Phone Number *</label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              type="tel"
              required
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-300">Street Address</label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label for="city" class="block text-sm font-medium text-gray-300">City *</label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              required
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label for="country" class="block text-sm font-medium text-gray-300">Country *</label>
            <input
              id="country"
              v-model="form.country"
              type="text"
              required
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div class="sm:col-span-2">
            <label for="website" class="block text-sm font-medium text-gray-300">Website</label>
            <input
              id="website"
              v-model="form.website"
              type="url"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div class="sm:col-span-2">
            <label for="description" class="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        </div>

        <div v-if="error" class="mt-4 rounded-md bg-red-900/40 border border-red-500/30 p-4">
          <div class="text-sm text-red-200">{{ error }}</div>
        </div>

        <div v-if="success" class="mt-4 rounded-md bg-green-900/40 border border-green-500/30 p-4">
          <div class="text-sm text-green-200">{{ success }}</div>
        </div>

        <div class="mt-6">
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-black bg-white hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 transition-colors"
          >
            <span v-if="loading">Submitting...</span>
            <span v-else>Register Company</span>
          </button>
        </div>

        <p class="mt-4 text-sm text-gray-400">
          * Required fields. Your company will be reviewed and approved by administrators before you can add agents and list properties.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'

const router = useRouter()

const form = ref({
  name: '',
  registrationNumber: '',
  email: '',
  phoneNumber: '',
  address: '',
  city: '',
  country: '',
  website: '',
  description: '',
  type: 'REAL_ESTATE_COMPANY'
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const hasOrganization = ref(false)

// Check if user already has an organization
const checkExistingOrganization = async () => {
  try {
    const response = await api.get('/organizations/my-company')
    if (response.data) {
      hasOrganization.value = true
      // Redirect to dashboard if they already have a company
      router.push('/dashboard')
    }
  } catch (err) {
    // User doesn't have an organization yet, allow registration
    hasOrganization.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await api.post('/organizations', form.value)
    success.value = 'Company registration submitted successfully! It will be reviewed by administrators.'
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to register company. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkExistingOrganization()
})
</script>

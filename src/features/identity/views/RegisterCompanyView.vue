<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white shadow rounded-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Register Real Estate Company</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="name" class="block text-sm font-medium text-gray-700">Company Name *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="registrationNumber" class="block text-sm font-medium text-gray-700">Legal Registration Number</label>
            <input
              id="registrationNumber"
              v-model="form.registrationNumber"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              type="tel"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-700">Street Address</label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="city" class="block text-sm font-medium text-gray-700">City *</label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="country" class="block text-sm font-medium text-gray-700">Country *</label>
            <input
              id="country"
              v-model="form.country"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div class="sm:col-span-2">
            <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
            <input
              id="website"
              v-model="form.website"
              type="url"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div class="sm:col-span-2">
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-800">{{ error }}</div>
        </div>

        <div v-if="success" class="mt-4 rounded-md bg-green-50 p-4">
          <div class="text-sm text-green-800">{{ success }}</div>
        </div>

        <div class="mt-6">
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="loading">Submitting...</span>
            <span v-else>Register Company</span>
          </button>
        </div>

        <p class="mt-4 text-sm text-gray-600">
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

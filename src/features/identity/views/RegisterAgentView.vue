<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white shadow rounded-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Register as Real Estate Agent</h2>
      
      <div v-if="!companies.length && !loadingCompanies" class="mb-6 rounded-md bg-yellow-50 p-4">
        <div class="text-sm text-yellow-800">
          No approved real estate companies found. Please register a company first and wait for approval.
        </div>
        <router-link to="/register-company" class="mt-2 inline-block text-sm font-medium text-yellow-900 hover:text-yellow-700">
          Register Company →
        </router-link>
      </div>

      <form @submit.prevent="handleSubmit" v-if="companies.length">
        <div class="space-y-6">
          <div>
            <label for="organizationId" class="block text-sm font-medium text-gray-700">Select Real Estate Company *</label>
            <select
              id="organizationId"
              v-model="form.organizationId"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose a company...</option>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.name }} ({{ company.status }})
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500">You can only register with an approved company.</p>
          </div>

          <div>
            <label for="licenseNumber" class="block text-sm font-medium text-gray-700">License Number</label>
            <input
              id="licenseNumber"
              v-model="form.licenseNumber"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional: Your real estate license number"
            />
          </div>

          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Any additional information..."
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
            <span v-if="loading">Registering...</span>
            <span v-else>Register as Agent</span>
          </button>
        </div>
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
  organizationId: '',
  licenseNumber: '',
  notes: ''
})

const companies = ref([])
const loadingCompanies = ref(true)
const loading = ref(false)
const error = ref('')
const success = ref('')

const loadCompanies = async () => {
  try {
    const response = await api.get('/organizations', {
      params: { type: 'REAL_ESTATE_COMPANY', status: 'APPROVED' }
    })
    companies.value = response.data
  } catch (err) {
    console.error('Failed to load companies:', err)
  } finally {
    loadingCompanies.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await api.post('/real-estate-agents/register', form.value)
    success.value = 'Successfully registered as a real estate agent!'
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to register as agent. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompanies()
})
</script>

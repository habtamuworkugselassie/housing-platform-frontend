<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-8">
        <h2 class="text-2xl font-bold text-white mb-6">{{ $t('register.registerAsRealEstateAgent') }}</h2>
        
        <div v-if="!companies.length && !loadingCompanies" class="mb-6 rounded-md bg-yellow-500/20 border border-yellow-400/50 p-4">
          <div class="text-sm text-yellow-200">
            No approved real estate companies found. Please register a company first and wait for approval.
          </div>
          <router-link to="/register-company" class="mt-2 inline-block text-sm font-medium text-yellow-400 hover:text-yellow-300">
            Register Company →
          </router-link>
        </div>

        <form @submit.prevent="handleSubmit" v-if="companies.length">
          <div class="space-y-6">
            <div>
              <label for="organizationId" class="block text-sm font-medium text-gray-400">Select Real Estate Company *</label>
              <select
                id="organizationId"
                v-model="form.organizationId"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">{{ $t('register.chooseCompany') }}</option>
                <option v-for="company in companies" :key="company.id" :value="company.id">
                  {{ company.name }} ({{ company.status }})
                </option>
              </select>
              <p class="mt-1 text-sm text-gray-500">{{ $t('register.onlyApprovedCompany') }}</p>
            </div>

            <div>
              <label for="licenseNumber" class="block text-sm font-medium text-gray-400">License Number</label>
              <input
                id="licenseNumber"
                v-model="form.licenseNumber"
                type="text"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                :placeholder="$t('register.licenseOptionalPlaceholder')"
              />
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-gray-400">Additional Notes</label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                :placeholder="$t('register.additionalInfoPlaceholder')"
              />
            </div>
          </div>

          <div v-if="error" class="mt-4 rounded-md bg-red-500/30 border border-red-400/50 p-4">
            <div class="text-sm text-red-200">{{ error }}</div>
          </div>

          <div v-if="success" class="mt-4 rounded-md bg-green-500/30 border border-green-400/50 p-4">
            <div class="text-sm text-green-200">{{ success }}</div>
          </div>

          <div class="mt-6">
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-black bg-white hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:bg-white/50"
            >
              <span v-if="loading">Registering...</span>
              <span v-else>{{ $t('dashboard.registerAsAgentShort') }}</span>
            </button>
          </div>
        </form>
      </div>
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

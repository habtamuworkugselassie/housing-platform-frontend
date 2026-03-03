<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
    @click.self="$emit('close')"
  >
    <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-white">{{ title }}</h3>
        <button
          type="button"
          @click="$emit('close')"
          class="text-gray-400 hover:text-yellow-400 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitLink" class="space-y-4">
        <p v-if="error" class="text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-md px-3 py-2">
          {{ error }}
        </p>

        <div class="bg-white/5 border border-white/10 rounded-md px-3 py-2">
          <label class="block text-xs font-medium text-gray-400">Selected Property</label>
          <p class="text-sm text-white mt-1">{{ propertyLabel || propertyId }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300">Bank *</label>
          <select
            v-model="form.bankId"
            required
            :disabled="loadingLookups"
            class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50"
            @change="onBankChanged"
          >
            <option value="">Select bank</option>
            <option v-for="bank in banks" :key="bank.id" :value="bank.id">
              {{ bank.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300">Loan Coverage (%) *</label>
          <input
            v-model.number="form.coveragePercentage"
            type="number"
            min="1"
            max="100"
            step="0.01"
            required
            class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>




        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting || loadingLookups"
            class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 disabled:opacity-60 transition-colors"
          >
            {{ submitting ? 'Creating...' : 'Create Property Credit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import api from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const props = defineProps({
  show: { type: Boolean, required: true },
  propertyId: { type: String, required: true },
  propertyLabel: { type: String, default: '' },
  title: { type: String, default: 'Create Property Credit' }
})

const emit = defineEmits(['close', 'created'])

const submitting = ref(false)
const loadingLookups = ref(false)
const error = ref('')
const banks = ref([])


const form = ref({
  bankId: '',
  coveragePercentage: 80
})

watch(
  () => props.show,
  async (visible) => {
    if (!visible) return
    form.value = {
      bankId: '',
      coveragePercentage: 80
    }
    error.value = ''
    await loadBanks()
  }
)

const loadBanks = async () => {
  loadingLookups.value = true
  try {
    const banksResponse = await api.get('/organizations?type=BANK&status=APPROVED')
    banks.value = banksResponse.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load banks'
    banks.value = []
  } finally {
    loadingLookups.value = false
  }
}

const onBankChanged = () => {
  // Logic after bank selection can be added here if needed
}

const submitLink = async () => {
  error.value = ''
  if (!form.value.bankId) {
    error.value = 'Bank is required'
    return
  }
  if (!form.value.coveragePercentage || form.value.coveragePercentage <= 0 || form.value.coveragePercentage > 100) {
    error.value = 'Coverage percentage must be greater than 0 and up to 100'
    return
  }

  submitting.value = true
  try {
    const response = await api.post(
      `/properties/${props.propertyId}/financing-offers`,
      {
        coveragePercentage: form.value.coveragePercentage
      },
      {
        params: {
          bankId: form.value.bankId
        }
      }
    )
    emit('created', response.data)
    emit('close')
  } catch (err) {
    error.value =
      err.response?.data?.message || 'Failed to create credit product offer for the selected property'
  } finally {
    submitting.value = false
  }
}

const formatPrice = (amount, currency = 'ETB') => formatCurrencyPrice(amount, currency || 'ETB')
</script>

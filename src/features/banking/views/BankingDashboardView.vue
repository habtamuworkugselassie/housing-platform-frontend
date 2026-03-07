<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">Banking Dashboard</h1>
      <p class="mt-2 text-sm text-gray-400">{{ $t('banking.dashboardSubtitle') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      <p class="mt-2 text-sm text-gray-400">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-200">{{ error }}</p>
    </div>

    <!-- Bank Info -->
    <div v-if="bank" class="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-white">Bank Information</h2>
        <button
          type="button"
          @click="openEditBankModal"
          class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
        >
          Edit bank
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-400">Bank Name</label>
          <p class="mt-1 text-sm text-white">{{ bank.name }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">Status</label>
          <p class="mt-1">
            <span :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              bank.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
            ]">
              {{ bank.status }}
            </span>
          </p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">Email</label>
          <p class="mt-1 text-sm text-white">{{ bank.email || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">Phone</label>
          <p class="mt-1 text-sm text-white">{{ bank.phoneNumber || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">Business Registration</label>
          <p v-if="bank.businessRegistrationNumber" class="mt-1 text-sm text-white">Number: {{ bank.businessRegistrationNumber }}</p>
          <p class="mt-1 text-sm text-white">
            <a v-if="isDocumentUrl(bank.businessRegistration)" :href="mediaUrl(bank.businessRegistration)" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">View document</a>
            <span v-else>{{ bank.businessRegistration || 'N/A' }}</span>
          </p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">License</label>
          <p v-if="bank.licenseNumber" class="mt-1 text-sm text-white">Number: {{ bank.licenseNumber }}</p>
          <p class="mt-1 text-sm text-white">
            <a v-if="isDocumentUrl(bank.license)" :href="mediaUrl(bank.license)" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">View document</a>
            <span v-else>{{ bank.license || 'N/A' }}</span>
          </p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">VAT Registration</label>
          <p v-if="bank.vatNumber" class="mt-1 text-sm text-white">Number: {{ bank.vatNumber }}</p>
          <p class="mt-1 text-sm text-white">
            <a v-if="isDocumentUrl(bank.vatRegistration)" :href="mediaUrl(bank.vatRegistration)" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">View document</a>
            <span v-else>{{ bank.vatRegistration || 'N/A' }}</span>
          </p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">TIN Registration</label>
          <p v-if="bank.tinNumber" class="mt-1 text-sm text-white">Number: {{ bank.tinNumber }}</p>
          <p class="mt-1 text-sm text-white">
            <a v-if="isDocumentUrl(bank.tinRegistration)" :href="mediaUrl(bank.tinRegistration)" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">View document</a>
            <span v-else>{{ bank.tinRegistration || 'N/A' }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Edit Bank Modal -->
    <div
      v-if="showEditBankModal"
      class="fixed inset-0 bg-black/70 overflow-y-auto z-50 flex items-start justify-center pt-12 pb-12"
      @click.self="showEditBankModal = false"
    >
      <div class="relative mx-auto p-6 border border-white/10 w-full max-w-2xl rounded-lg bg-zinc-900 text-white">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-white">Edit bank</h3>
          <button type="button" @click="showEditBankModal = false" class="text-gray-400 hover:text-yellow-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form @submit.prevent="updateBank" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300">Bank name *</label>
              <input v-model="bankForm.name" type="text" required class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">Registration number</label>
              <input v-model="bankForm.registrationNumber" type="text" class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300">Business Registration</label>
              <input v-model="bankForm.businessRegistrationNumber" type="text" placeholder="Registration number" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
              <input v-model="bankForm.businessRegistration" type="text" placeholder="Document URL or upload below" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
              <div class="mt-1 flex items-center gap-2">
                <input type="file" accept=".pdf,image/*,.doc,.docx" class="hidden" :ref="el => { bankDocInputRefs.businessRegistration = el }" @change="ev => onUploadBankDocument(ev, 'BUSINESS_REGISTRATION', 'businessRegistration')" />
                <button type="button" :disabled="bankDocUploading.businessRegistration" class="text-sm px-2 py-1 border border-white/20 rounded text-gray-300 hover:border-yellow-400 disabled:opacity-50" @click="bankDocInputRefs.businessRegistration?.click()">{{ bankDocUploading.businessRegistration ? 'Uploading…' : 'Upload document' }}</button>
                <a v-if="isDocumentUrl(bankForm.businessRegistration)" :href="mediaUrl(bankForm.businessRegistration)" target="_blank" rel="noopener" class="text-sm text-yellow-400 hover:underline">View document</a>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">License</label>
              <input v-model="bankForm.licenseNumber" type="text" placeholder="License number" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
              <input v-model="bankForm.license" type="text" placeholder="Document URL or upload below" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
              <div class="mt-1 flex items-center gap-2">
                <input type="file" accept=".pdf,image/*,.doc,.docx" class="hidden" :ref="el => { bankDocInputRefs.license = el }" @change="ev => onUploadBankDocument(ev, 'LICENSE', 'license')" />
                <button type="button" :disabled="bankDocUploading.license" class="text-sm px-2 py-1 border border-white/20 rounded text-gray-300 hover:border-yellow-400 disabled:opacity-50" @click="bankDocInputRefs.license?.click()">{{ bankDocUploading.license ? 'Uploading…' : 'Upload document' }}</button>
                <a v-if="isDocumentUrl(bankForm.license)" :href="mediaUrl(bankForm.license)" target="_blank" rel="noopener" class="text-sm text-yellow-400 hover:underline">View document</a>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">VAT Registration</label>
              <input v-model="bankForm.vatNumber" type="text" placeholder="VAT number" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
              <input v-model="bankForm.vatRegistration" type="text" placeholder="Document URL or upload below" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
              <div class="mt-1 flex items-center gap-2">
                <input type="file" accept=".pdf,image/*,.doc,.docx" class="hidden" :ref="el => { bankDocInputRefs.vatRegistration = el }" @change="ev => onUploadBankDocument(ev, 'VAT_REGISTRATION', 'vatRegistration')" />
                <button type="button" :disabled="bankDocUploading.vatRegistration" class="text-sm px-2 py-1 border border-white/20 rounded text-gray-300 hover:border-yellow-400 disabled:opacity-50" @click="bankDocInputRefs.vatRegistration?.click()">{{ bankDocUploading.vatRegistration ? 'Uploading…' : 'Upload document' }}</button>
                <a v-if="isDocumentUrl(bankForm.vatRegistration)" :href="mediaUrl(bankForm.vatRegistration)" target="_blank" rel="noopener" class="text-sm text-yellow-400 hover:underline">View document</a>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">TIN Registration</label>
              <input v-model="bankForm.tinNumber" type="text" placeholder="TIN number" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
              <input v-model="bankForm.tinRegistration" type="text" placeholder="Document URL or upload below" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
              <div class="mt-1 flex items-center gap-2">
                <input type="file" accept=".pdf,image/*,.doc,.docx" class="hidden" :ref="el => { bankDocInputRefs.tinRegistration = el }" @change="ev => onUploadBankDocument(ev, 'TIN_REGISTRATION', 'tinRegistration')" />
                <button type="button" :disabled="bankDocUploading.tinRegistration" class="text-sm px-2 py-1 border border-white/20 rounded text-gray-300 hover:border-yellow-400 disabled:opacity-50" @click="bankDocInputRefs.tinRegistration?.click()">{{ bankDocUploading.tinRegistration ? 'Uploading…' : 'Upload document' }}</button>
                <a v-if="isDocumentUrl(bankForm.tinRegistration)" :href="mediaUrl(bankForm.tinRegistration)" target="_blank" rel="noopener" class="text-sm text-yellow-400 hover:underline">View document</a>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Address</label>
            <input v-model="bankForm.address" type="text" class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300">City</label>
              <input v-model="bankForm.city" type="text" class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">Country</label>
              <input v-model="bankForm.country" type="text" class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('property.locationMap') }} / {{ $t('admin.pickLocation') }}</label>
            <OsmMapPicker
              :model-value="(bankForm.latitude != null && bankForm.longitude != null) ? { lat: bankForm.latitude, lng: bankForm.longitude } : null"
              @update:latitude="(v) => (bankForm.latitude = v)"
              @update:longitude="(v) => (bankForm.longitude = v)"
              height="240px"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Phone numbers</label>
            <div v-for="(phone, idx) in bankForm.phoneNumbers" :key="idx" class="flex gap-2 mb-2">
              <CountryCodePhoneInput
                :country-code="phone.countryCode"
                :number="phone.number"
                placeholder="Phone"
                class="flex-1"
                @update:country-code="phone.countryCode = $event"
                @update:number="phone.number = $event"
              />
              <button v-if="bankForm.phoneNumbers.length > 1" type="button" class="p-2 text-gray-400 hover:text-red-400 border border-white/20 rounded" @click="bankForm.phoneNumbers.splice(idx, 1)">×</button>
            </div>
            <button type="button" class="text-sm text-yellow-400 hover:text-yellow-300" @click="bankForm.phoneNumbers.push({ countryCode: DEFAULT_COUNTRY_CODE, number: '' })">+ Add phone</button>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Email</label>
            <input v-model="bankForm.email" type="email" class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Website</label>
            <input v-model="bankForm.website" type="url" class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Description</label>
            <textarea v-model="bankForm.description" rows="3" class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showEditBankModal = false" class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20">Cancel</button>
            <button type="submit" :disabled="bankFormSaving" class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 disabled:opacity-50">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Credit Products</p>
            <p class="text-2xl font-semibold text-white">{{ stats.creditProducts }}</p>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Active Offers</p>
            <p class="text-2xl font-semibold text-white">{{ stats.activeOffers }}</p>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Pending Offers</p>
            <p class="text-2xl font-semibold text-white">{{ stats.pendingOffers }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
      <h2 class="text-xl font-semibold text-white mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <router-link
          :to="bank ? `/banking/${bank.id}/credit-products` : '#'"
          :class="[
            'flex items-center p-4 border-2 rounded-lg transition-colors text-white',
            bank ? 'border-white/10 hover:border-yellow-400 hover:bg-yellow-500/20' : 'border-white/10 opacity-50 cursor-not-allowed'
          ]"
        >
          <div class="flex-shrink-0 bg-yellow-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-white">Manage Credit Products</h3>
            <p class="text-sm text-gray-400">{{ $t('banking.createManageCreditProducts') }}</p>
          </div>
        </router-link>

        <router-link
          :to="bank ? `/banking/${bank.id}/financing-offers` : '#'"
          :class="[
            'flex items-center p-4 border-2 rounded-lg transition-colors text-white',
            bank ? 'border-white/10 hover:border-yellow-400 hover:bg-yellow-500/20' : 'border-white/10 opacity-50 cursor-not-allowed'
          ]"
        >
          <div class="flex-shrink-0 bg-green-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-white">Manage Financing Offers</h3>
            <p class="text-sm text-gray-400">{{ $t('banking.createManageFinancingOffers') }}</p>
          </div>
        </router-link>

        <router-link
          to="/banking/loan-applications"
          class="flex items-center p-4 border-2 border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors cursor-pointer text-white"
        >
          <div class="flex-shrink-0 bg-purple-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-white">Review Loan Applications</h3>
            <p class="text-sm text-gray-400">{{ $t('banking.reviewApproveLoans') }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-white/10">
        <h2 class="text-xl font-semibold text-white">Recent Credit Products</h2>
      </div>
      <div class="p-6">
        <div v-if="recentProducts.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-400">{{ $t('banking.noCreditProductsCreateFirst') }}</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="product in recentProducts"
            :key="product.id"
            class="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors"
          >
            <div>
              <h3 class="text-sm font-medium text-white">{{ product.name }}</h3>
              <p class="text-xs text-gray-400 mt-1">{{ product.productType }} • {{ product.interestRate }}% interest</p>
            </div>
            <span :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              product.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
            ]">
              {{ product.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api, { mediaUrl } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'
import { OsmMapPicker } from '@/shared/components'
import { DEFAULT_COUNTRY_CODE } from '@/shared/data/countryCodes'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const bank = ref(null)
const stats = ref({
  creditProducts: 0,
  activeOffers: 0,
  pendingOffers: 0
})
const recentProducts = ref([])
const showEditBankModal = ref(false)
const bankFormSaving = ref(false)
const bankForm = ref({
  name: '',
  registrationNumber: '',
  businessRegistration: '',
  license: '',
  vatRegistration: '',
  tinRegistration: '',
  businessRegistrationNumber: '',
  licenseNumber: '',
  vatNumber: '',
  tinNumber: '',
  address: '',
  city: '',
  country: '',
  latitude: null,
  longitude: null,
  phoneNumbers: [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }],
  email: '',
  website: '',
  description: ''
})
const bankDocUploading = ref({ businessRegistration: false, license: false, vatRegistration: false, tinRegistration: false })
const bankDocInputRefs = { businessRegistration: null, license: null, vatRegistration: null, tinRegistration: null }

function isDocumentUrl(value) {
  if (value == null || typeof value !== 'string') return false
  const v = value.trim()
  return v.startsWith('/api/') || v.startsWith('http://') || v.startsWith('https://')
}

function openEditBankModal() {
  if (!bank.value) return
  const b = bank.value
  bankForm.value = {
    name: b.name || '',
    registrationNumber: b.registrationNumber || '',
    businessRegistration: b.businessRegistration || '',
    license: b.license || '',
    vatRegistration: b.vatRegistration || '',
    tinRegistration: b.tinRegistration || '',
    businessRegistrationNumber: b.businessRegistrationNumber || '',
    licenseNumber: b.licenseNumber || '',
    vatNumber: b.vatNumber || '',
    tinNumber: b.tinNumber || '',
    address: b.address || '',
    city: b.city || '',
    country: b.country || '',
    latitude: b.latitude ?? null,
    longitude: b.longitude ?? null,
    phoneNumbers: (b.phoneNumbers && b.phoneNumbers.length > 0)
      ? b.phoneNumbers.map(p => ({ countryCode: p.countryCode || DEFAULT_COUNTRY_CODE, number: p.number || '' }))
      : (b.phoneNumber ? [{ countryCode: DEFAULT_COUNTRY_CODE, number: (b.phoneNumber || '').replace(/^\+\d+\s*/, '') }] : [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }]),
    email: b.email || '',
    website: b.website || '',
    description: b.description || ''
  }
  showEditBankModal.value = true
}

async function updateBank() {
  if (!bank.value?.id) return
  bankFormSaving.value = true
  try {
    const phoneNumbers = (bankForm.value.phoneNumbers || [])
      .filter(p => (p.number || '').trim())
      .map(p => ({ countryCode: p.countryCode || DEFAULT_COUNTRY_CODE, number: (p.number || '').trim() }))
    const { data } = await api.put(`/organizations/${bank.value.id}`, {
      name: bankForm.value.name,
      registrationNumber: bankForm.value.registrationNumber || undefined,
      businessRegistration: bankForm.value.businessRegistration || undefined,
      license: bankForm.value.license || undefined,
      vatRegistration: bankForm.value.vatRegistration || undefined,
      tinRegistration: bankForm.value.tinRegistration || undefined,
      businessRegistrationNumber: bankForm.value.businessRegistrationNumber || undefined,
      licenseNumber: bankForm.value.licenseNumber || undefined,
      vatNumber: bankForm.value.vatNumber || undefined,
      tinNumber: bankForm.value.tinNumber || undefined,
      type: bank.value.type,
      address: bankForm.value.address || undefined,
      city: bankForm.value.city || undefined,
      country: bankForm.value.country || undefined,
      latitude: bankForm.value.latitude ?? undefined,
      longitude: bankForm.value.longitude ?? undefined,
      phoneNumbers: phoneNumbers.length ? phoneNumbers : [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }],
      email: bankForm.value.email || undefined,
      website: bankForm.value.website || undefined,
      description: bankForm.value.description || undefined
    })
    bank.value = data
    showEditBankModal.value = false
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update bank')
  } finally {
    bankFormSaving.value = false
  }
}

async function onUploadBankDocument(ev, documentType, formKey) {
  const file = ev.target?.files?.[0]
  if (!file || !bank.value?.id) {
    ev.target.value = ''
    return
  }
  bankDocUploading.value[formKey] = true
  try {
    const formData = new FormData()
    formData.append('documentType', documentType)
    formData.append('file', file)
    const { data } = await api.post(`/organizations/${bank.value.id}/documents`, formData)
    bank.value = data
    bankForm.value[formKey] = data[formKey] ?? ''
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to upload document')
  } finally {
    bankDocUploading.value[formKey] = false
    ev.target.value = ''
  }
}

const loadDashboardData = async () => {
  if (!authStore.hasRole('BANKER')) {
    error.value = 'You must be a banker to access this page'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Load bank information
    const bankResponse = await api.get('/organizations/my-bank')
    bank.value = bankResponse.data

    // Load credit products
    const productsResponse = await api.get(`/banks/${bank.value.id}/credit-products`)
    const products = productsResponse.data
    stats.value.creditProducts = products.length
    recentProducts.value = products.slice(0, 5)

    // Load financing offers
    const offersResponse = await api.get(`/banks/${bank.value.id}/financing-offers`)
    const offers = offersResponse.data
    stats.value.activeOffers = offers.filter(o => o.status === 'ACTIVE').length
    stats.value.pendingOffers = offers.filter(o => o.status === 'PENDING_APPROVAL').length
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
    error.value = err.response?.data?.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>
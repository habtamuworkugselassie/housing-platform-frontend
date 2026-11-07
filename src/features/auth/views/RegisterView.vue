<template>
  <div class="min-h-screen flex items-center justify-center bg-violet-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
    <div class="max-w-lg w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_24px_60px_-30px_rgba(46,16,101,0.35)] sm:p-10 space-y-8">
      <div>
        <div class="text-center"><p class="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />{{ $t('auth.registerEyebrow') }}</p></div><h2 class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {{ $t('register.title') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('register.subtitle') }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-3">
          <div>
            <label for="firstName" class="sr-only">First Name</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
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
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
              :placeholder="$t('auth.lastName')"
            />
          </div>
          <div>
            <label for="email" class="sr-only">{{ $t('auth.emailAddress') }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
              :placeholder="$t('auth.email')"
            />
          </div>
          <div>
            <label for="phoneNumber" class="sr-only">{{ $t('auth.phoneNumber') }}</label>
            <CountryCodePhoneInput
              v-model:country-code="form.phoneCountryCode"
              v-model:number="form.phoneNumber"
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
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
              :placeholder="$t('register.passwordHint')"
            />
          </div>
          <div>
            <label for="role" class="sr-only">Role</label>
            <select
              id="role"
              v-model="form.role"
              required
              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60 sm:text-sm"
              @change="onRoleChange"
            >
              <option value="">{{ $t('register.selectRole') }}</option>
              <option value="BUYER">{{ $t('register.buyer') }}</option>
              <option value="REALTOR">{{ $t('register.realtor') }}</option>
              <option value="BANKER">{{ $t('register.banker') }}</option>
              <option value="SUPPLIER">{{ $t('register.supplier') }}</option>
            </select>
          </div>
        </div>

        <!-- Organization: join verified org or register new (pending approval) -->
        <div
          v-if="needsOrganizationChoice"
          class="rounded-2xl border border-gray-200 bg-violet-50 p-4 space-y-4"
        >
          <p class="text-sm font-medium text-white">Organization</p>
          <p class="text-xs text-gray-400">
            Join an existing verified organization on the marketplace, or register a new one (admin approval required
            before it appears publicly).
          </p>
          <div class="flex flex-col gap-2">
            <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-300">
              <input v-model="form.orgMode" type="radio" value="existing" class="text-white focus:ring-primary-400" />
              Join a verified organization
            </label>
            <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-300">
              <input v-model="form.orgMode" type="radio" value="new" class="text-white focus:ring-primary-400" />
              Register a new organization
            </label>
          </div>

          <div v-if="form.orgMode === 'existing'" class="space-y-2">
            <label class="block text-xs font-medium text-gray-400">Select organization</label>
            <div v-if="loadingMarketplaceOrgs" class="text-sm text-gray-600">Loading organizations…</div>
            <select
              v-else
              v-model="form.organizationId"
              required
              class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            >
              <option disabled value="">Choose one…</option>
              <option v-for="o in marketplaceOrgs" :key="o.id" :value="o.id">
                {{ o.name }}
              </option>
            </select>
            <p v-if="!loadingMarketplaceOrgs && marketplaceOrgs.length === 0" class="text-xs text-amber-200/90">
              No verified organizations yet for this category. Use “Register a new organization” instead.
            </p>
          </div>

          <div v-if="form.orgMode === 'new'" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-400">Legal / display name *</label>
              <input
                v-model="newOrg.name"
                type="text"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-400">Organization email *</label>
              <input
                v-model="newOrg.email"
                type="email"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-400">City *</label>
              <input
                v-model="newOrg.city"
                type="text"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-400">Country *</label>
              <input
                v-model="newOrg.country"
                type="text"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-400">Street address</label>
              <input
                v-model="newOrg.address"
                type="text"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-400">Registration number</label>
              <input
                v-model="newOrg.registrationNumber"
                type="text"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-400 mb-1">Organization phone *</label>
              <CountryCodePhoneInput
                v-model:country-code="newOrg.phoneCountryCode"
                v-model:number="newOrg.phoneNumber"
                :placeholder="$t('admin.orgPhonePlaceholder')"
              />
            </div>
          </div>
        </div>

        <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>

        <div v-if="fieldErrors && fieldErrors.length > 0" class="rounded-xl border border-red-200 bg-red-50 p-4">
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
            class="flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('register.registering') }}</span>
            <span v-else>{{ $t('auth.register') }}</span>
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-sm font-medium text-primary-700 hover:text-primary-900">
            {{ $t('register.alreadyHaveAccount') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'
import { DEFAULT_COUNTRY_CODE } from '@/shared/data/countryCodes'
import api from '@/shared/api/client'

const router = useRouter()
const authStore = useAuthStore()

const ORG_ROLES = ['REALTOR', 'BANKER', 'SUPPLIER']

const ROLE_TO_MARKETPLACE_TYPE = {
  REALTOR: 'REAL_ESTATE_COMPANY',
  BANKER: 'BANK',
  SUPPLIER: 'SUPPLIER'
}

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneCountryCode: DEFAULT_COUNTRY_CODE,
  phoneNumber: '',
  password: '',
  role: '',
  orgMode: 'existing',
  organizationId: ''
})

const newOrg = ref({
  name: '',
  email: '',
  city: '',
  country: '',
  address: '',
  registrationNumber: '',
  phoneCountryCode: DEFAULT_COUNTRY_CODE,
  phoneNumber: ''
})

const marketplaceOrgs = ref([])
const loadingMarketplaceOrgs = ref(false)

const loading = ref(false)
const error = ref('')
const fieldErrors = ref([])

const needsOrganizationChoice = computed(() => ORG_ROLES.includes(form.value.role))

function marketplaceTypeForRole(role) {
  return ROLE_TO_MARKETPLACE_TYPE[role] || null
}

async function loadMarketplaceOrgs() {
  const type = marketplaceTypeForRole(form.value.role)
  if (!type) {
    marketplaceOrgs.value = []
    return
  }
  loadingMarketplaceOrgs.value = true
  try {
    const { data } = await api.get('/organizations/marketplace', { params: { type } })
    marketplaceOrgs.value = Array.isArray(data) ? data : []
  } catch {
    marketplaceOrgs.value = []
  } finally {
    loadingMarketplaceOrgs.value = false
  }
}

function onRoleChange() {
  form.value.organizationId = ''
  if (!needsOrganizationChoice.value) {
    form.value.orgMode = 'existing'
    marketplaceOrgs.value = []
    return
  }
  newOrg.value.email = form.value.email
  if (form.value.orgMode === 'existing') {
    loadMarketplaceOrgs()
  }
}

watch(
  () => [form.value.role, form.value.orgMode],
  () => {
    if (needsOrganizationChoice.value && form.value.orgMode === 'existing') {
      loadMarketplaceOrgs()
    }
  }
)

watch(
  () => form.value.email,
  (e) => {
    if (needsOrganizationChoice.value && form.value.orgMode === 'new' && !newOrg.value.email) {
      newOrg.value.email = e
    }
  }
)

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  fieldErrors.value = []

  if (needsOrganizationChoice.value) {
    if (form.value.orgMode === 'existing') {
      if (!form.value.organizationId) {
        error.value = 'Please select a verified organization.'
        loading.value = false
        return
      }
    } else {
      const phoneOk = (newOrg.value.phoneNumber || '').trim()
      if (!phoneOk) {
        error.value = 'Organization phone is required when registering a new organization.'
        loading.value = false
        return
      }
    }
  }

  try {
    const { phoneCountryCode, phoneNumber, orgMode, organizationId, ...rest } = form.value
    const combinedPhone = (phoneNumber || '').trim()
      ? (phoneCountryCode || DEFAULT_COUNTRY_CODE) + (phoneNumber || '').trim()
      : undefined

    const payload = {
      ...rest,
      phoneNumber: combinedPhone
    }

    if (needsOrganizationChoice.value && orgMode === 'existing') {
      payload.organizationId = organizationId
    }

    await authStore.register(payload)

    if (needsOrganizationChoice.value && orgMode === 'new') {
      const orgType = marketplaceTypeForRole(form.value.role)
      const pn = (newOrg.value.phoneNumber || '').trim()
      const phoneNumbers = pn
        ? [
            {
              countryCode: newOrg.value.phoneCountryCode || DEFAULT_COUNTRY_CODE,
              number: pn
            }
          ]
        : []
      try {
        await api.post('/organizations', {
          type: orgType,
          name: newOrg.value.name.trim(),
          email: (newOrg.value.email || form.value.email).trim(),
          city: newOrg.value.city.trim(),
          country: newOrg.value.country.trim(),
          address: newOrg.value.address?.trim() || undefined,
          registrationNumber: newOrg.value.registrationNumber?.trim() || undefined,
          phoneNumbers
        })
      } catch (orgErr) {
        error.value =
          orgErr?.response?.data?.message ||
          'Your account was created, but submitting the organization failed. Try registering the organization again from the dashboard (company / bank / supplier flow).'
        loading.value = false
        return
      }
    }

    router.push('/dashboard')
  } catch (err) {
    if (err.fieldErrors && Array.isArray(err.fieldErrors)) {
      fieldErrors.value = err.fieldErrors
      error.value = err.message || 'Please fix the validation errors above.'
    } else if (err.response?.data?.fieldErrors && Array.isArray(err.response.data.fieldErrors)) {
      fieldErrors.value = err.response.data.fieldErrors
      error.value = err.response.data.message || 'Please fix the validation errors above.'
    } else {
      error.value = err.message || err.response?.data?.message || 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

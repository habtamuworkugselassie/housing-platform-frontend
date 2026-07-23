<template>
  <div class="min-h-screen bg-violet-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-white relative">
    <!-- Floating Language Switcher -->
    <div class="absolute top-4 right-4 z-50">
      <LocaleSwitcher />
    </div>

    <!-- Center Card -->
    <div class="max-w-xl w-full space-y-8">
      <div class="flex flex-col items-center">
        <!-- Logo -->
        <router-link to="/" class="mb-6 hover:opacity-90 transition-opacity">
          <img
            src="/images/branding/ethio-build-connect-banner.png"
            alt="Ethio Build Connect"
            class="h-9 w-auto object-contain"
          />
        </router-link>
        
        <!-- Header -->
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-2 text-center">
          {{ $t('exhibition.registerInterest.eyebrow') }}
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-3 text-white text-center">
          {{ $t('exhibition.registerInterest.title') }}
        </h1>
        <p class="text-white/80 text-center text-sm mb-2 max-w-md">
          {{ $t('exhibition.registerInterest.subtitle') }}
        </p>
      </div>

      <!-- Form container -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        <form
          v-if="!interestSubmitted"
          class="space-y-6"
          @submit.prevent="submitInterest"
        >
          <ExhibitionInterestFormFields
            v-model="interestForm"
            :interest-packages="interestPackages"
            :interest-packages-loading="interestPackagesLoading"
            field-id-prefix="standalone-register"
          />
          <p v-if="interestError" class="text-sm text-red-400 font-medium">{{ interestError }}</p>
          
          <button
            type="submit"
            :disabled="interestSubmitting"
            class="w-full py-3.5 px-6 bg-white text-violet-950 font-semibold text-sm uppercase tracking-wider rounded-lg hover:bg-violet-100 hover:text-violet-950 transition-colors disabled:opacity-50 disabled:bg-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-950"
          >
            {{ interestSubmitting ? $t('exhibition.registerInterest.submitting') : $t('exhibition.registerInterest.submit') }}
          </button>
        </form>

        <div
          v-else
          class="rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center space-y-4"
        >
          <div class="w-12 h-12 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto text-green-300">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 class="text-green-200 font-semibold text-lg mb-1">{{ $t('exhibition.registerInterest.successTitle') }}</h3>
            <p class="text-sm text-white/80 leading-relaxed">{{ $t('exhibition.registerInterest.successMessage') }}</p>
          </div>
          <div class="pt-4">
            <router-link
              to="/"
              class="inline-flex items-center gap-2 px-5 py-2 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
            >
              Back to Home
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { exhibitionApi, getActiveSponsorshipPackages } from '@/features/exhibition/api/exhibition.api'
import ExhibitionInterestFormFields from '@/features/exhibition/components/ExhibitionInterestFormFields.vue'
import LocaleSwitcher from '@/shared/components/LocaleSwitcher.vue'
import { DEFAULT_COUNTRY_CODE } from '@/shared/data/countryCodes'

const { t } = useI18n()

// Register interest form (exhibition)
const interestForm = ref({
  email: '',
  phoneCountryCode: DEFAULT_COUNTRY_CODE,
  phoneNumber: '',
  organizationType: '',
  interestType: '',
  partnerRole: 'MEDIA_PARTNER',
  visibilityScope: 'BOTH',
  contributionMode: 'IN_KIND',
  sponsorshipId: '',
  company: '',
  message: ''
})
const interestPackages = ref([])
const interestPackagesLoading = ref(false)
const interestSubmitting = ref(false)
const interestSubmitted = ref(false)
const interestError = ref('')

async function loadInterestPackages() {
  interestPackagesLoading.value = true
  try {
    interestPackages.value = await getActiveSponsorshipPackages()
  } catch (err) {
    console.error('Failed to load sponsorship packages for interest form:', err)
    interestPackages.value = []
  } finally {
    interestPackagesLoading.value = false
  }
}

async function submitInterest() {
  interestError.value = ''
  const it = interestForm.value.interestType || 'visitor'
  if (it === 'exhibitor' && !(interestForm.value.sponsorshipId || '').trim()) {
    interestError.value = t('exhibition.registerInterest.sponsorshipPackageRequired')
    return
  }
  if (!(interestForm.value.organizationType || '').trim()) {
    interestError.value = t('exhibition.registerInterest.organizationCategoryRequired')
    return
  }
  interestSubmitting.value = true
  try {
    const combinedPhone = (interestForm.value.phoneNumber || '').trim()
      ? (interestForm.value.phoneCountryCode || DEFAULT_COUNTRY_CODE) + (interestForm.value.phoneNumber || '').trim()
      : undefined
    const payload = {
      email: interestForm.value.email,
      phoneNumber: combinedPhone,
      organizationType: interestForm.value.organizationType,
      interestType: it,
      company: interestForm.value.company || undefined,
      message: interestForm.value.message || undefined
    }
    if ((it === 'exhibitor' || it === 'partner') && interestForm.value.sponsorshipId) {
      payload.sponsorshipId = interestForm.value.sponsorshipId
    }
    if (it === 'partner') {
      payload.partnerRole = interestForm.value.partnerRole
      payload.visibilityScope = interestForm.value.visibilityScope
      payload.contributionMode = interestForm.value.contributionMode
    }
    await exhibitionApi.registerInterest(payload)
    interestSubmitted.value = true
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || true
    interestError.value = typeof msg === 'string' ? msg : t('exhibition.registerInterest.errorGeneric')
  } finally {
    interestSubmitting.value = false
  }
}

onMounted(() => {
  loadInterestPackages()
})
</script>

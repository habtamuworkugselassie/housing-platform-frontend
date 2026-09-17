<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <Breadcrumbs v-if="property" :items="breadcrumbs" class="mb-4" />

      <!-- Loading -->
      <div v-if="loadingProperty || form.loadingPreview" class="py-20 text-center">
        <div class="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-500">{{ $t('purchase.loading') }}</p>
      </div>

      <!-- Hard errors -->
      <div v-else-if="propertyError || form.previewError" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-red-700">{{ translate(propertyError || form.previewError) }}</p>
        <router-link :to="`/properties/${propertyId}`" class="mt-4 inline-block font-medium text-primary-700 hover:underline">
          {{ $t('purchase.backToProperty') }}
        </router-link>
      </div>

      <!-- Wizard -->
      <div v-else-if="property && form.preview" class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 class="text-2xl font-bold text-gray-900">{{ $t('purchase.title') }}</h1>
              <PurchaseWizardSteps :steps="form.steps" :current="form.step" :completed="form.stepValid" @select="form.goTo" />
            </div>

            <form novalidate @submit.prevent="onPrimary">
              <PurchaseContactStep v-if="form.step === 'contact'" :attempted="attempted.contact" />
              <PurchaseFinancingStep v-else-if="form.step === 'financing'" :attempted="attempted.financing" />
              <PurchaseAgreementStep v-else-if="form.step === 'agreement'" :attempted="attempted.agreement" />
              <PurchaseReviewStep v-else :property-title="property.title" />

              <!-- Submission errors -->
              <div v-if="form.step === 'review' && form.submitError" class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                <p>{{ translate(form.submitError) }}</p>
                <ul v-if="Object.keys(form.serverFieldErrors).length" class="mt-2 list-disc pl-5">
                  <li v-for="(msg, field) in form.serverFieldErrors" :key="field">{{ field }}: {{ msg }}</li>
                </ul>
              </div>

              <!-- Navigation -->
              <div class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  :disabled="form.stepIndex === 0 || form.submitting"
                  @click="form.back()"
                >
                  {{ $t('common.back') }}
                </button>

                <button
                  v-if="form.step !== 'review'"
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  {{ $t('common.next') }}
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </button>
                <button
                  v-else
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="!form.canSubmit"
                  :aria-busy="form.submitting ? 'true' : 'false'"
                >
                  <span v-if="form.submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
                  {{ form.submitting ? $t('purchase.review.submitting') : $t('purchase.review.submit') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Property summary sidebar -->
        <aside class="lg:col-span-1">
          <div class="space-y-4 lg:sticky lg:top-24">
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <img v-if="coverImage" :src="coverImage" :alt="property.title" class="h-40 w-full object-cover" />
              <div class="p-5">
                <h2 class="text-base font-bold text-gray-900">{{ property.title }}</h2>
                <p class="text-sm text-gray-500">{{ [property.unitNumber, property.address, property.city].filter(Boolean).join(' · ') }}</p>
                <p class="mt-3 text-2xl font-bold text-gray-900">{{ formatPrice(form.preview.listedPrice, form.preview.currency) }}</p>
                <p v-if="property.realEstateCompanyName" class="mt-1 text-xs text-gray-500">{{ $t('purchase.listedBy', { company: property.realEstateCompanyName }) }}</p>
              </div>
            </div>

            <div class="rounded-2xl border p-5 text-sm" :class="form.preview.financingAvailable ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700'">
              <p class="font-semibold">
                {{ form.preview.financingAvailable ? $t('purchase.sidebar.financingAvailable') : $t('purchase.sidebar.cashOnly') }}
              </p>
              <p class="mt-1 text-xs opacity-80">
                {{ form.preview.financingAvailable ? $t('purchase.sidebar.financingAvailableHelp', { count: form.preview.financingOffers.length }) : $t('purchase.sidebar.cashOnlyHelp') }}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api, { mediaUrl } from '@/shared/api/client'
import { formatPrice } from '@/shared/utils'
import { Breadcrumbs } from '@/shared/components'
import { useAuthStore } from '@/features/auth'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'
import PurchaseWizardSteps from '../components/PurchaseWizardSteps.vue'
import PurchaseContactStep from '../components/PurchaseContactStep.vue'
import PurchaseFinancingStep from '../components/PurchaseFinancingStep.vue'
import PurchaseAgreementStep from '../components/PurchaseAgreementStep.vue'
import PurchaseReviewStep from '../components/PurchaseReviewStep.vue'

const route = useRoute()
const router = useRouter()
const { t, te } = useI18n()
const authStore = useAuthStore()
const form = usePurchaseOrderFormStore()

const propertyId = computed(() => String(route.params.id))
const property = ref<any>(null)
const loadingProperty = ref(true)
const propertyError = ref<string | null>(null)

/** Per-step "the buyer tried to continue" flags; errors show after that, or after blur. */
const attempted = reactive({ contact: false, financing: false, agreement: false })

const coverImage = computed(() => {
  const first = property.value?.images?.[0]
  const url = first?.url || first?.imageUrl || property.value?.imageUrl
  return url ? mediaUrl(url) : ''
})

const breadcrumbs = computed(() => [
  { label: t('nav.properties') || 'Properties', to: '/properties' },
  { label: property.value?.title ?? '', to: `/properties/${propertyId.value}` },
  { label: t('purchase.title') }
])

/** Server messages come back verbatim; our own fall-backs are i18n keys. */
function translate(message: string | null) {
  if (!message) return ''
  return te(message) ? t(message) : message
}

async function load() {
  loadingProperty.value = true
  propertyError.value = null
  try {
    const response = await api.get(`/properties/${propertyId.value}`)
    property.value = response.data
    if (property.value.category !== 'FOR_SALE' || property.value.status !== 'AVAILABLE') {
      propertyError.value = 'purchase.errors.notPurchasable'
      return
    }
    await form.init(propertyId.value, authStore.user as any, undefined)
  } catch (err: any) {
    propertyError.value = err?.response?.status === 404 ? 'property.notFound' : 'purchase.errors.previewFailed'
  } finally {
    loadingProperty.value = false
  }
}

async function onPrimary() {
  if (form.step === 'review') {
    const order = await form.submit()
    if (order) {
      router.push({ name: 'PurchaseOrderDetails', params: { id: order.id }, query: { created: '1' } })
    }
    return
  }
  attempted[form.step as 'contact' | 'financing' | 'agreement'] = true
  form.next()
}

// Reset the "attempted" flag when a step is re-entered so errors appear only after interaction.
watch(
  () => form.step,
  (s) => {
    if (s in attempted) attempted[s as 'contact' | 'financing' | 'agreement'] = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
)

onMounted(load)
onBeforeUnmount(() => form.saveDraft())
</script>

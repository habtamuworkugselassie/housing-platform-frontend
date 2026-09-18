<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-gray-900">{{ $t('purchase.contact.title') }}</h2>
      <p class="mt-1 text-sm text-gray-500">{{ $t('purchase.contact.subtitle') }}</p>
    </header>

    <div>
      <label for="po-phone" class="block text-sm font-medium text-gray-700">
        {{ $t('purchase.contact.phone') }} <span class="text-red-600" aria-hidden="true">*</span>
      </label>
      <CountryCodePhoneInput
        id="po-phone"
        v-model:country-code="countryCode"
        v-model:number="national"
        variant="light"
        class="mt-1"
        required
        :invalid="showError('phone')"
        describedby="po-phone-help"
        :placeholder="nationalPlaceholder"
        :button-label="$t('purchase.contact.countryCode')"
        :search-placeholder="$t('purchase.contact.searchCountry')"
        :no-match-label="$t('purchase.contact.noCountryMatch', { query: '{query}' })"
        @blur="touched.phone = true"
      />
      <p id="po-phone-help" class="mt-1 text-xs" :class="showError('phone') ? 'text-red-600' : 'text-gray-500'">
        <template v-if="showError('phone')">{{ $t(form.contactErrors.phone) }}</template>
        <template v-else-if="normalized">{{ $t('purchase.contact.phoneStoredAs', { phone: normalized }) }}</template>
        <template v-else>{{ $t('purchase.contact.phoneHelp') }}</template>
      </p>
    </div>

    <div>
      <label for="po-email" class="block text-sm font-medium text-gray-700">
        {{ $t('purchase.contact.email') }}
        <span class="ml-1 text-xs font-normal text-gray-400">({{ $t('purchase.optional') }})</span>
      </label>
      <input
        id="po-email"
        v-model="form.contact.email"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        class="mt-1 w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        :class="showError('email') ? 'border-red-400' : 'border-gray-300'"
        :aria-invalid="showError('email') ? 'true' : 'false'"
        @blur="touched.email = true"
      />
      <p v-if="showError('email')" class="mt-1 text-xs text-red-600">{{ $t(form.contactErrors.email) }}</p>
      <p v-else class="mt-1 text-xs text-gray-500">{{ $t('purchase.contact.emailHelp') }}</p>
    </div>

    <div>
      <label for="po-message" class="block text-sm font-medium text-gray-700">
        {{ $t('purchase.contact.message') }}
        <span class="ml-1 text-xs font-normal text-gray-400">({{ $t('purchase.optional') }})</span>
      </label>
      <textarea
        id="po-message"
        v-model="form.contact.message"
        rows="3"
        maxlength="2000"
        class="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        :placeholder="$t('purchase.contact.messagePlaceholder')"
      />
      <p class="mt-1 text-right text-xs text-gray-400">{{ form.contact.message.length }}/2000</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'
import { usePhoneParts } from '../composables/usePhoneParts'
import { normalizePhone } from '../utils/phone'

const { t } = useI18n()
const form = usePurchaseOrderFormStore()
const touched = reactive({ phone: false, email: false })

/** Country-code selector + national number, both writing back to the single stored string. */
const { countryCode, national } = usePhoneParts(toRef(form.contact, 'phone'))
const nationalPlaceholder = computed(() =>
  countryCode.value === '+251' ? t('purchase.contact.nationalPlaceholderEt') : t('purchase.contact.phone')
)

const normalized = computed(() => normalizePhone(form.contact.phone))

/** Errors surface after the field was touched, or once the buyer tried to move on. */
const props = defineProps<{ attempted?: boolean }>()
function showError(field: 'phone' | 'email') {
  return Boolean(form.contactErrors[field]) && (touched[field] || props.attempted)
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-gray-900">{{ $t('purchase.agreement.title') }}</h2>
      <p class="mt-1 text-sm text-gray-500">{{ $t('purchase.agreement.subtitle') }}</p>
    </header>

    <div v-if="!form.promiseAgreement" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {{ $t('purchase.errors.agreementUnavailable') }}
    </div>

    <AgreementReviewPanel
      v-else
      :title="form.promiseAgreement.title"
      :content="form.promiseAgreement.content"
      :version="form.promiseAgreement.version"
      :provider-name="providerName"
      :accepted="form.agreement.accepted"
      :signatory-name="form.agreement.signatoryFullName"
      :scrolled-to-end="form.agreement.scrolledToEnd"
      :attempted="attempted"
      @update:accepted="form.agreement.accepted = $event"
      @update:signatory-name="form.agreement.signatoryFullName = $event"
      @update:scrolled-to-end="form.agreement.scrolledToEnd = $event"
    />

    <!-- Reservation deposit terms: signed together so the deposit can be paid right away. -->
    <AgreementReviewPanel
      v-if="form.promiseAgreement && form.depositTermsAgreement"
      class="border-t border-gray-200 pt-5"
      data-testid="deposit-terms-panel"
      :title="form.depositTermsAgreement.title"
      :content="form.depositTermsAgreement.content"
      :version="form.depositTermsAgreement.version"
      :provider-name="providerName"
      :accepted="form.depositAgreement.accepted"
      :signatory-name="form.agreement.signatoryFullName"
      :scrolled-to-end="form.depositAgreement.scrolledToEnd"
      :attempted="attempted"
      @update:accepted="form.depositAgreement.accepted = $event"
      @update:signatory-name="form.agreement.signatoryFullName = $event"
      @update:scrolled-to-end="form.depositAgreement.scrolledToEnd = $event"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AgreementReviewPanel from './AgreementReviewPanel.vue'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'

defineProps<{ attempted?: boolean }>()
const form = usePurchaseOrderFormStore()

/** The provider's name appears in the rendered text as the first bold party; fall back to a generic label. */
const providerName = computed(() => {
  const m = /\*\*([^*]+)\*\*/.exec(form.promiseAgreement?.content ?? '')
  return m ? m[1] : 'the provider'
})
</script>

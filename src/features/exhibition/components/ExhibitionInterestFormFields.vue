<template>
  <div class="space-y-5">
    <div>
      <label :for="`${fieldIdPrefix}-email`" class="block text-sm font-medium text-gray-400 mb-1">{{
        $t('exhibition.registerInterest.email')
      }}</label>
      <input
        :id="`${fieldIdPrefix}-email`"
        v-model="form.email"
        type="email"
        required
        class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
        :placeholder="$t('exhibition.registerInterest.emailPlaceholder')"
      />
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-phone`" class="block text-sm font-medium text-gray-400 mb-1">{{
        $t('exhibition.registerInterest.phone')
      }}</label>
      <CountryCodePhoneInput
        v-model:country-code="form.phoneCountryCode"
        v-model:number="form.phoneNumber"
        :placeholder="$t('exhibition.registerInterest.phonePlaceholder')"
      />
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-org-type`" class="block text-sm font-medium text-gray-400 mb-1">{{
        $t('exhibition.registerInterest.organizationType')
      }}</label>
      <select
        :id="`${fieldIdPrefix}-org-type`"
        v-model="form.organizationType"
        required
        class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
      >
        <option value="" disabled>{{ $t('exhibition.registerInterest.selectOrganizationType') }}</option>
        <option value="REAL_ESTATE_COMPANY">{{ $t('exhibition.registerInterest.orgTypeRealEstate') }}</option>
        <option value="CONTRACTOR">{{ $t('exhibition.registerInterest.orgTypeContractor') }}</option>
        <option value="DEVELOPER">{{ $t('exhibition.registerInterest.orgTypeDeveloper') }}</option>
        <option value="SUPPLIER">{{ $t('exhibition.registerInterest.orgTypeSupplier') }}</option>
        <option value="CONSULTANT_ARCHITECT">{{ $t('exhibition.registerInterest.orgTypeConsultantArchitect') }}</option>
        <option value="FINISHING_CONTRACTOR">{{ $t('exhibition.registerInterest.orgTypeFinishingContractor') }}</option>
      </select>
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-interest-type`" class="block text-sm font-medium text-gray-400 mb-1">{{
        $t('exhibition.registerInterest.interestType')
      }}</label>
      <select
        :id="`${fieldIdPrefix}-interest-type`"
        v-model="form.interestType"
        required
        class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
      >
        <option value="" disabled>{{ $t('exhibition.registerInterest.selectType') }}</option>
        <option value="exhibitor">{{ $t('exhibition.registerInterest.asExhibitor') }}</option>
        <option value="visitor">{{ $t('exhibition.registerInterest.asVisitor') }}</option>
      </select>
    </div>
    <div v-if="form.interestType === 'exhibitor'">
      <label :for="`${fieldIdPrefix}-package`" class="block text-sm font-medium text-gray-400 mb-1">{{
        $t('exhibition.registerInterest.sponsorshipPackage')
      }}</label>
      <select
        :id="`${fieldIdPrefix}-package`"
        v-model="form.sponsorshipId"
        :required="form.interestType === 'exhibitor'"
        class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
      >
        <option value="" disabled>{{ $t('exhibition.registerInterest.selectSponsorshipPackage') }}</option>
        <option v-for="pkg in interestPackages" :key="pkg.id" :value="pkg.id">{{ pkg.name }}</option>
      </select>
      <p v-if="interestPackagesLoading" class="mt-2 text-xs text-gray-500">
        {{ $t('exhibition.registerInterest.packagesLoading') }}
      </p>
      <p v-else-if="form.interestType === 'exhibitor' && interestPackages.length === 0" class="mt-2 text-sm text-amber-400/90">
        {{ $t('exhibition.registerInterest.packagesLoadEmpty') }}
      </p>
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-company`" class="block text-sm font-medium text-gray-400 mb-1">{{
        $t('exhibition.registerInterest.companyOptional')
      }}</label>
      <input
        :id="`${fieldIdPrefix}-company`"
        v-model="form.company"
        type="text"
        class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
        :placeholder="$t('exhibition.registerInterest.companyPlaceholder')"
      />
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-message`" class="block text-sm font-medium text-gray-400 mb-1">{{
        $t('exhibition.registerInterest.messageOptional')
      }}</label>
      <textarea
        :id="`${fieldIdPrefix}-message`"
        v-model="form.message"
        rows="3"
        class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
        :placeholder="$t('exhibition.registerInterest.messagePlaceholder')"
      />
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'

const form = defineModel({ type: Object, required: true })

defineProps({
  interestPackages: { type: Array, default: () => [] },
  interestPackagesLoading: { type: Boolean, default: false },
  fieldIdPrefix: { type: String, default: 'exhibition-interest' }
})

watch(
  () => form.value.interestType,
  (v) => {
    if (v !== 'exhibitor') form.value.sponsorshipId = ''
  }
)
</script>

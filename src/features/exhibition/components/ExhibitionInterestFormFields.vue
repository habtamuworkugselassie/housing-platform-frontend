<template>
  <div class="space-y-5">
    <div>
      <label :for="`${fieldIdPrefix}-email`" :class="['block text-sm font-medium mb-1', labelCls]">{{
        $t('exhibition.registerInterest.email')
      }}</label>
      <input
        :id="`${fieldIdPrefix}-email`"
        v-model="form.email"
        type="email"
        required
        :class="['w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400', inputCls]"
        :placeholder="$t('exhibition.registerInterest.emailPlaceholder')"
      />
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-phone`" :class="['block text-sm font-medium mb-1', labelCls]">{{
        $t('exhibition.registerInterest.phone')
      }}</label>
      <CountryCodePhoneInput
        v-model:country-code="form.phoneCountryCode"
        v-model:number="form.phoneNumber"
        :placeholder="$t('exhibition.registerInterest.phonePlaceholder')"
      />
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-interest-type`" :class="['block text-sm font-medium mb-1', labelCls]">{{
        $t('exhibition.registerInterest.interestType')
      }}</label>
      <select
        :id="`${fieldIdPrefix}-interest-type`"
        v-model="form.interestType"
        required
        :class="['w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400', inputCls]"
      >
        <option value="" disabled>{{ $t('exhibition.registerInterest.selectType') }}</option>
        <option value="exhibitor">{{ $t('exhibition.registerInterest.asExhibitor') }}</option>
        <option value="partner">{{ $t('exhibition.registerInterest.asPartner') }}</option>
        <option value="visitor">{{ $t('exhibition.registerInterest.asVisitor') }}</option>
      </select>
    </div>
    <div v-if="form.interestType === 'partner'" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label :for="`${fieldIdPrefix}-partner-role`" :class="['block text-sm font-medium mb-1', labelCls]">
          {{ $t('exhibition.registerInterest.partnerRole') }}
        </label>
        <select
          :id="`${fieldIdPrefix}-partner-role`"
          v-model="form.partnerRole"
          required
          :class="['w-full px-3 py-3 rounded-lg', inputCls]"
        >
          <option value="SPONSOR">{{ $t('exhibition.registerInterest.roleSponsor') }}</option>
          <option value="MEDIA_PARTNER">{{ $t('exhibition.registerInterest.roleMediaPartner') }}</option>
        </select>
      </div>
      <div>
        <label :for="`${fieldIdPrefix}-visibility`" :class="['block text-sm font-medium mb-1', labelCls]">
          {{ $t('exhibition.registerInterest.visibility') }}
        </label>
        <select
          :id="`${fieldIdPrefix}-visibility`"
          v-model="form.visibilityScope"
          required
          :class="['w-full px-3 py-3 rounded-lg', inputCls]"
        >
          <option value="EXHIBITION">{{ $t('exhibition.registerInterest.visibilityExhibition') }}</option>
          <option value="PLATFORM">{{ $t('exhibition.registerInterest.visibilityPlatform') }}</option>
          <option value="BOTH">{{ $t('exhibition.registerInterest.visibilityBoth') }}</option>
        </select>
      </div>
      <div>
        <label :for="`${fieldIdPrefix}-contribution`" :class="['block text-sm font-medium mb-1', labelCls]">
          {{ $t('exhibition.registerInterest.contribution') }}
        </label>
        <select
          :id="`${fieldIdPrefix}-contribution`"
          v-model="form.contributionMode"
          required
          :class="['w-full px-3 py-3 rounded-lg', inputCls]"
        >
          <option value="CASH">{{ $t('exhibition.registerInterest.contributionCash') }}</option>
          <option value="IN_KIND">{{ $t('exhibition.registerInterest.contributionInKind') }}</option>
          <option value="HYBRID">{{ $t('exhibition.registerInterest.contributionHybrid') }}</option>
        </select>
      </div>
    </div>
    <div v-if="form.interestType === 'exhibitor' || form.interestType === 'partner'">
      <label :for="`${fieldIdPrefix}-package`" :class="['block text-sm font-medium mb-1', labelCls]">{{
        $t('exhibition.registerInterest.sponsorshipPackage')
      }}</label>
      <select
        :id="`${fieldIdPrefix}-package`"
        v-model="form.sponsorshipId"
        :required="form.interestType === 'exhibitor'"
        :class="['w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400', inputCls]"
      >
        <option value="">{{ form.interestType === 'partner' ? $t('exhibition.registerInterest.customPartnership') : $t('exhibition.registerInterest.selectSponsorshipPackage') }}</option>
        <option v-for="pkg in interestPackages" :key="pkg.id" :value="pkg.id">{{ pkg.name }}</option>
      </select>
      <p v-if="interestPackagesLoading" :class="['mt-2 text-xs', mutedCls]">
        {{ $t('exhibition.registerInterest.packagesLoading') }}
      </p>
      <p v-else-if="form.interestType === 'exhibitor' && interestPackages.length === 0" :class="['mt-2 text-sm', light ? 'text-amber-600' : 'text-amber-400/90']">
        {{ $t('exhibition.registerInterest.packagesLoadEmpty') }}
      </p>
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-org-type`" :class="['block text-sm font-medium mb-1', labelCls]">{{
        $t('exhibition.registerInterest.organizationType')
      }}</label>
      <p v-if="form.interestType === 'exhibitor'" :class="['mb-2 text-xs leading-relaxed', mutedCls]">
        {{ $t('exhibition.registerInterest.organizationCategorySponsorHint') }}
      </p>
      <select
        :id="`${fieldIdPrefix}-org-type`"
        v-model="form.organizationType"
        required
        :class="['w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400', inputCls]"
      >
        <option value="" disabled>{{ $t('exhibition.registerInterest.selectOrganizationType') }}</option>
        <option v-for="opt in organizationTypeOptions" :key="opt.value" :value="opt.value">
          {{ $t(opt.labelKey) }}
        </option>
      </select>
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-company`" :class="['block text-sm font-medium mb-1', labelCls]">{{
        $t('exhibition.registerInterest.companyOptional')
      }}</label>
      <input
        :id="`${fieldIdPrefix}-company`"
        v-model="form.company"
        type="text"
        :class="['w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400', inputCls]"
        :placeholder="$t('exhibition.registerInterest.companyPlaceholder')"
      />
    </div>
    <div>
      <label :for="`${fieldIdPrefix}-message`" :class="['block text-sm font-medium mb-1', labelCls]">{{
        $t('exhibition.registerInterest.messageOptional')
      }}</label>
      <textarea
        :id="`${fieldIdPrefix}-message`"
        v-model="form.message"
        rows="3"
        :class="['w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 resize-none', inputCls]"
        :placeholder="$t('exhibition.registerInterest.messagePlaceholder')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'
import { EXHIBITION_REGISTER_INTEREST_ORGANIZATION_TYPES } from '@/features/exhibition/constants/exhibitionOrganizationTypes'

const organizationTypeOptions = EXHIBITION_REGISTER_INTEREST_ORGANIZATION_TYPES

const form = defineModel({ type: Object, required: true })

const props = defineProps({
  interestPackages: { type: Array, default: () => [] },
  interestPackagesLoading: { type: Boolean, default: false },
  fieldIdPrefix: { type: String, default: 'exhibition-interest' },
  // Render for a light surface (landing register section). Defaults to the
  // dark styling used by the sponsorship-packages band and the register page.
  light: { type: Boolean, default: false }
})

const labelCls = computed(() => (props.light ? 'text-gray-700' : 'text-white/80'))
const mutedCls = computed(() => (props.light ? 'text-gray-500' : 'text-white/70'))
const inputCls = computed(() =>
  props.light
    ? 'border border-gray-300 bg-white text-gray-900 placeholder-gray-400'
    : 'border border-white/20 bg-white/5 text-white placeholder-gray-400'
)

watch(
  () => form.value.interestType,
  (v) => {
    if (v === 'visitor') form.value.sponsorshipId = ''
    if (v !== 'partner') {
      form.value.partnerRole = 'SPONSOR'
      form.value.visibilityScope = 'BOTH'
      form.value.contributionMode = 'CASH'
    }
  }
)
</script>

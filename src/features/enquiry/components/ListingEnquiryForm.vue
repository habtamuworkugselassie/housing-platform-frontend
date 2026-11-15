<template>
  <div>
    <div v-if="sent" class="rounded-2xl bg-primary-50 p-5 text-center" data-testid="enquiry-sent">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-400 text-primary-950">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="mt-3 text-base font-bold text-gray-900">{{ $t('enquiry.sentTitle') }}</p>
      <p class="mt-1 text-sm text-gray-600">{{ $t('enquiry.sentBody', { company: companyLabel }) }}</p>
      <button
        type="button"
        class="mt-4 text-sm font-semibold text-primary-700 hover:underline"
        @click="reset"
      >
        {{ $t('enquiry.sendAnother') }}
      </button>
    </div>

    <form v-else class="space-y-4" novalidate @submit.prevent="submit">
      <div class="grid gap-4">
        <div>
          <label :for="`${uid}-name`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('enquiry.name') }}</label>
          <input
            :id="`${uid}-name`"
            v-model.trim="form.name"
            type="text"
            name="name"
            autocomplete="name"
            required
            maxlength="200"
            :placeholder="$t('enquiry.namePlaceholder')"
            :class="inputCls(errors.name)"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
        </div>
        <div>
          <label :for="`${uid}-email`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('enquiry.email') }}</label>
          <input
            :id="`${uid}-email`"
            v-model.trim="form.email"
            type="email"
            name="email"
            autocomplete="email"
            required
            maxlength="255"
            :placeholder="$t('enquiry.emailPlaceholder')"
            :class="inputCls(errors.email)"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
        </div>
      </div>

      <div>
        <label :for="`${uid}-phone`" class="mb-1 block text-sm font-medium text-gray-700">
          {{ $t('enquiry.phone') }} <span class="font-normal text-gray-400">({{ $t('enquiry.optional') }})</span>
        </label>
        <CountryCodePhoneInput
          :id="`${uid}-phone`"
          v-model:country-code="form.phoneCountryCode"
          v-model:number="form.phoneNumber"
          variant="light"
          :placeholder="$t('enquiry.phonePlaceholder')"
        />
      </div>

      <div>
        <label :for="`${uid}-message`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('enquiry.message') }}</label>
        <textarea
          :id="`${uid}-message`"
          v-model="form.message"
          name="message"
          rows="4"
          required
          maxlength="4000"
          :placeholder="messagePlaceholder"
          :class="inputCls(errors.message)"
        />
        <p v-if="errors.message" class="mt-1 text-xs text-red-600">{{ errors.message }}</p>
      </div>

      <!-- Honeypot: hidden from people, filled by bots. -->
      <div class="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label :for="`${uid}-website`">Website</label>
        <input :id="`${uid}-website`" v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
      </div>

      <p v-if="submitError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{{ submitError }}</p>

      <button
        type="submit"
        :disabled="submitting"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-3 text-sm font-semibold text-primary-950 transition-colors hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg v-if="submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span v-else class="material-icons !text-[18px] leading-none" aria-hidden="true">send</span>
        {{ submitting ? $t('enquiry.sending') : $t('enquiry.send') }}
      </button>
      <p class="text-center text-xs text-gray-500">{{ $t('enquiry.privacy') }}</p>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'
import { DEFAULT_COUNTRY_CODE } from '@/shared/data/countryCodes'
import { useAuthStore } from '@/features/auth'
import { enquiryApi } from '../api/enquiry.api'
import { trackEvent } from '@/utils/analytics'

const props = defineProps({
  /** Exactly one of propertyId / organizationId. */
  propertyId: { type: String, default: '' },
  organizationId: { type: String, default: '' },
  /** Shown in the thank-you line and used in the default message placeholder. */
  subjectTitle: { type: String, default: '' },
  companyName: { type: String, default: '' },
  /** Where the lead came from, for analytics (e.g. 'property-sidebar', 'property-modal'). */
  source: { type: String, default: '' }
})

const emit = defineEmits(['sent'])

const { t } = useI18n()
const authStore = useAuthStore()

let counter = 0
const uid = `enquiry-${++counter}-${Math.random().toString(36).slice(2, 7)}`

const form = reactive({
  name: '',
  email: '',
  phoneCountryCode: DEFAULT_COUNTRY_CODE,
  phoneNumber: '',
  message: '',
  website: ''
})
const errors = reactive({ name: '', email: '', message: '' })
const submitting = ref(false)
const submitError = ref('')
const sent = ref(false)

const companyLabel = computed(() => props.companyName || t('enquiry.theLister'))
const messagePlaceholder = computed(() =>
  props.propertyId
    ? t('enquiry.messagePlaceholderProperty', { title: props.subjectTitle || t('enquiry.thisProperty') })
    : t('enquiry.messagePlaceholderOrganization', { company: companyLabel.value })
)

function prefillFromUser() {
  const user = authStore.user
  if (!user) return
  if (!form.name) form.name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  if (!form.email && user.email) form.email = user.email
  if (!form.phoneNumber && user.phoneNumber) {
    const raw = String(user.phoneNumber).replace(/\s+/g, '')
    if (raw.startsWith(DEFAULT_COUNTRY_CODE)) {
      form.phoneNumber = raw.slice(DEFAULT_COUNTRY_CODE.length)
    } else {
      form.phoneNumber = raw
    }
  }
}
watch(() => authStore.user, prefillFromUser, { immediate: true })

function inputCls(invalid) {
  return [
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400',
    invalid ? 'border-red-400' : 'border-gray-300'
  ]
}

function validate() {
  errors.name = form.name ? '' : t('enquiry.errors.name')
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : t('enquiry.errors.email')
  errors.message = form.message.trim().length >= 10 ? '' : t('enquiry.errors.message')
  return !errors.name && !errors.email && !errors.message
}

async function submit() {
  submitError.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    const phone = form.phoneNumber.trim()
      ? (form.phoneCountryCode || DEFAULT_COUNTRY_CODE) + form.phoneNumber.replace(/\s+/g, '')
      : undefined
    const body = {
      propertyId: props.propertyId || undefined,
      organizationId: props.propertyId ? undefined : props.organizationId || undefined,
      name: form.name,
      email: form.email,
      phoneNumber: phone,
      message: form.message.trim(),
      pageUrl: typeof window !== 'undefined' ? window.location.href.slice(0, 1000) : undefined,
      website: form.website || undefined
    }
    const result = await enquiryApi.submit(body)
    sent.value = true
    trackEvent('listing_enquiry', {
      subject_type: props.propertyId ? 'property' : 'organization',
      form_source: props.source || undefined
    })
    emit('sent', result)
  } catch (e) {
    const status = e?.response?.status
    submitError.value =
      status === 429
        ? t('enquiry.errors.tooMany')
        : e?.response?.data?.message || t('enquiry.errors.generic')
  } finally {
    submitting.value = false
  }
}

function reset() {
  form.message = ''
  form.website = ''
  sent.value = false
  submitError.value = ''
}
</script>

<template>
  <section class="mt-6 rounded-xl border border-white/10 bg-zinc-900 p-6 sm:p-8" data-testid="profile-payment">
    <h2 class="text-lg font-semibold text-white">{{ $t('profile.payment.title') }}</h2>
    <p class="mt-1 text-sm text-gray-400">{{ $t('profile.payment.help') }}</p>

    <form class="mt-5 space-y-4" novalidate @submit.prevent="save">
      <DepositMethodPicker v-model="method" :methods="METHODS" name="profile-payment-method" :disabled="busy" />
      <button v-if="method" type="button" class="text-sm font-medium text-primary-600 hover:underline" data-testid="profile-payment-clear" @click="method = null">
        {{ $t('profile.payment.clear') }}
      </button>
      <div>
        <label for="payment-phone" class="mb-1.5 block text-sm font-medium text-gray-300">{{ $t('profile.payment.phone') }}</label>
        <input id="payment-phone" v-model="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="09…" class="block w-full rounded-lg border-0 py-2.5 px-4 bg-white/5 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm" />
        <p class="mt-1.5 text-xs text-gray-500">{{ $t('profile.payment.phoneHelp') }}</p>
      </div>
      <p class="text-xs text-gray-500">{{ $t('profile.payment.noCardsStored') }}</p>
      <p v-if="error" class="text-sm text-red-500" role="alert" data-testid="profile-payment-error">{{ error }}</p>
      <p v-if="done" class="text-sm text-green-500" role="status" data-testid="profile-payment-done">{{ $t('profile.payment.saved') }}</p>
      <div class="flex justify-end">
        <button type="submit" :disabled="busy" class="inline-flex items-center rounded-lg bg-violet-950 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" data-testid="profile-payment-submit">
          {{ $t('profile.payment.save') }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth'
import { authApi } from '@/features/auth/api/auth.api'
import type { PaymentMethodPreference } from '@/features/auth/api/auth.types'
import DepositMethodPicker from '@/features/purchase/components/DepositMethodPicker.vue'

const METHODS: PaymentMethodPreference[] = ['TELEBIRR', 'CBE_BIRR', 'MPESA', 'AWASH_BIRR', 'CARD']

const { t } = useI18n()
const authStore = useAuthStore()

const method = ref<PaymentMethodPreference | null>(null)
const phone = ref('')
const busy = ref(false)
const error = ref('')
const done = ref(false)

watch(
  () => [authStore.user?.preferredPaymentMethod, authStore.user?.paymentPhone] as const,
  ([m, p]) => {
    method.value = m ?? null
    phone.value = p ?? ''
  },
  { immediate: true }
)

async function save() {
  error.value = ''
  done.value = false
  busy.value = true
  try {
    await authApi.updatePaymentPreferences({
      preferredPaymentMethod: method.value,
      paymentPhone: phone.value.trim() || null
    })
    await authStore.hydrateUser()
    done.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.message || t('profile.payment.failed')
  } finally {
    busy.value = false
  }
}
</script>

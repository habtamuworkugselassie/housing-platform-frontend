<template>
  <section class="mt-6 rounded-xl border border-white/10 bg-zinc-900 p-6 sm:p-8" data-testid="profile-password">
    <h2 class="text-lg font-semibold text-white">{{ hasPassword ? $t('profile.password.changeTitle') : $t('profile.password.setTitle') }}</h2>
    <p class="mt-1 text-sm text-gray-400">{{ hasPassword ? $t('profile.password.changeHelp') : $t('profile.password.setHelp') }}</p>
    <p v-if="signInAs" class="mt-1 text-sm text-gray-400" data-testid="profile-password-sign-in-as">{{ $t('profile.password.signInAs', { who: signInAs }) }}</p>

    <form class="mt-5 space-y-4" novalidate @submit.prevent="submit">
      <div v-if="needsCurrent">
        <label for="current-password" class="mb-1.5 block text-sm font-medium text-gray-300">{{ $t('profile.password.current') }}</label>
        <input id="current-password" v-model="current" type="password" autocomplete="current-password" :class="INPUT" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="new-password" class="mb-1.5 block text-sm font-medium text-gray-300">{{ $t('profile.password.new') }}</label>
          <input id="new-password" v-model="next" type="password" autocomplete="new-password" :class="INPUT" />
        </div>
        <div>
          <label for="confirm-password" class="mb-1.5 block text-sm font-medium text-gray-300">{{ $t('profile.password.confirm') }}</label>
          <input id="confirm-password" v-model="confirm" type="password" autocomplete="new-password" :class="INPUT" />
        </div>
      </div>
      <p class="text-xs text-gray-500">{{ $t('profile.password.rules') }}</p>
      <p v-if="error" class="text-sm text-red-500" role="alert" data-testid="profile-password-error">{{ error }}</p>
      <p v-if="done" class="text-sm text-green-500" role="status" data-testid="profile-password-done">{{ $t('profile.password.saved') }}</p>
      <div class="flex justify-end">
        <button type="submit" :disabled="busy" class="inline-flex items-center rounded-lg bg-violet-950 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" data-testid="profile-password-submit">
          {{ hasPassword ? $t('profile.password.changeButton') : $t('profile.password.setButton') }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth'
import { authApi } from '@/features/auth/api/auth.api'

const INPUT =
  'block w-full rounded-lg border-0 py-2.5 px-4 bg-white/5 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm'

const { t } = useI18n()
const authStore = useAuthStore()

const current = ref('')
const next = ref('')
const confirm = ref('')
const busy = ref(false)
const error = ref('')
const done = ref(false)

const hasPassword = computed(() => authStore.user?.passwordSet === true)
/**
 * Mirrors the server: a known password must be confirmed, and so must a staff account whose state
 * was never recorded. A buyer who signed up while ordering just picks one.
 */
const needsCurrent = computed(() => {
  const set = authStore.user?.passwordSet
  if (set != null) return set
  const roles = authStore.user?.roles ?? []
  return !(roles.length === 1 && roles[0] === 'BUYER')
})
const signInAs = computed(() => authStore.user?.email || authStore.user?.phoneNumber || '')

async function submit() {
  error.value = ''
  done.value = false
  if (needsCurrent.value && !current.value) return void (error.value = t('profile.password.currentRequired'))
  if (next.value.length < 8 || !/[a-z]/.test(next.value) || !/[A-Z]/.test(next.value) || !/\d/.test(next.value)) {
    return void (error.value = t('profile.password.rules'))
  }
  if (next.value !== confirm.value) return void (error.value = t('profile.password.mismatch'))
  busy.value = true
  try {
    await authApi.changePassword({
      currentPassword: needsCurrent.value ? current.value : undefined,
      newPassword: next.value
    })
    await authStore.hydrateUser()
    current.value = next.value = confirm.value = ''
    done.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.message || t('profile.password.failed')
  } finally {
    busy.value = false
  }
}
</script>

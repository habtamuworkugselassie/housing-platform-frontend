<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm font-medium text-white">
        {{ $t('admin.accountsHeading') }}
        <span v-if="!loading" class="ml-1 text-gray-500">({{ accounts.length }})</span>
      </p>
      <button
        v-if="canManage"
        type="button"
        class="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-400"
        @click="toggleCreate"
      >
        {{ showCreate ? $t('common.cancel') : $t('admin.accountsIssueLogin') }}
      </button>
    </div>

    <p class="text-xs text-gray-500">{{ $t('admin.accountsHint') }}</p>

    <!-- A plain admin can read this list but not change it; say so rather than
         showing controls that would come back 403. -->
    <p
      v-if="!canManage"
      class="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400"
    >
      {{ $t('admin.accountsReadOnlyNotice') }}
    </p>

    <p
      v-if="error"
      class="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
      role="alert"
    >
      {{ error }}
    </p>

    <!-- Issue a new login -->
    <form
      v-if="canManage && showCreate"
      class="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      @submit.prevent="submitCreate"
    >
      <div class="grid gap-3 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-400" for="acc-first">
            {{ $t('admin.accountsFirstName') }}
          </label>
          <input
            id="acc-first"
            v-model.trim="createForm.firstName"
            type="text"
            required
            class="block w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary-400 focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-400" for="acc-last">
            {{ $t('admin.accountsLastName') }}
          </label>
          <input
            id="acc-last"
            v-model.trim="createForm.lastName"
            type="text"
            required
            class="block w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary-400 focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-gray-400" for="acc-email">
          {{ $t('admin.accountsEmail') }}
        </label>
        <input
          id="acc-email"
          v-model.trim="createForm.email"
          type="email"
          required
          class="block w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary-400 focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-gray-400">
          {{ $t('admin.accountsPhone') }}
        </label>
        <CountryCodePhoneInput
          v-model:country-code="createForm.countryCode"
          v-model:number="createForm.phoneNumber"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-gray-400" for="acc-pass">
          {{ $t('admin.accountsPassword') }}
        </label>
        <input
          id="acc-pass"
          v-model="createForm.password"
          type="password"
          required
          autocomplete="new-password"
          class="block w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary-400 focus:ring-2 focus:ring-primary-400"
        />
        <p class="mt-1 text-xs text-gray-500">{{ $t('admin.accountsPasswordRule') }}</p>
      </div>

      <label class="flex items-center gap-2 text-xs text-gray-300">
        <input
          v-model="createForm.makePrimaryContact"
          type="checkbox"
          class="rounded border-white/20 bg-white/5"
        />
        {{ $t('admin.accountsMakePrimaryOnCreate') }}
      </label>

      <div class="flex gap-2 pt-1">
        <button
          type="submit"
          :disabled="busy"
          class="rounded-md bg-violet-950/60 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 transition hover:bg-violet-950 disabled:opacity-50"
        >
          {{ busy ? $t('common.saving') : $t('admin.accountsCreateSubmit') }}
        </button>
        <button
          type="button"
          class="rounded-md border border-white/20 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5"
          @click="toggleCreate"
        >
          {{ $t('common.cancel') }}
        </button>
      </div>
    </form>

    <!-- Accounts -->
    <p v-if="loading" class="text-sm text-gray-500">{{ $t('common.loading') }}</p>
    <p v-else-if="!accounts.length" class="text-sm text-gray-500">
      {{ $t('admin.accountsEmpty') }}
    </p>

    <ul v-else class="space-y-2">
      <li
        v-for="account in accounts"
        :key="account.id"
        class="rounded-xl border border-white/10 bg-white/[0.03] p-3"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
              <span class="truncate">{{ account.firstName }} {{ account.lastName }}</span>
              <span
                v-if="account.primaryContact"
                class="rounded border border-emerald-400/40 px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wide text-emerald-300"
              >
                {{ $t('admin.accountsPrimaryBadge') }}
              </span>
              <span
                class="rounded border px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wide"
                :class="statusClass(account.status)"
              >
                {{ $t('admin.accountsStatus_' + account.status) }}
              </span>
            </p>
            <p class="truncate text-xs text-gray-400">{{ account.email }}</p>
            <p v-if="account.phoneNumber" class="text-xs text-gray-500">
              {{ account.phoneNumber }}
            </p>
          </div>

          <div v-if="canManage" class="flex flex-wrap gap-1.5">
            <button
              type="button"
              class="rounded border border-white/20 px-2 py-1 text-[0.68rem] text-gray-200 hover:bg-white/10"
              @click="openPassword(account)"
            >
              {{ $t('admin.accountsSetPassword') }}
            </button>
            <button
              type="button"
              class="rounded border border-white/20 px-2 py-1 text-[0.68rem] text-gray-200 hover:bg-white/10"
              :disabled="busy"
              @click="toggleStatus(account)"
            >
              {{
                account.status === 'ACTIVE'
                  ? $t('admin.accountsSuspend')
                  : $t('admin.accountsActivate')
              }}
            </button>
            <button
              v-if="!account.primaryContact"
              type="button"
              class="rounded border border-white/20 px-2 py-1 text-[0.68rem] text-gray-200 hover:bg-white/10"
              :disabled="busy"
              @click="makePrimary(account)"
            >
              {{ $t('admin.accountsMakePrimary') }}
            </button>
            <button
              type="button"
              class="rounded border border-red-400/40 px-2 py-1 text-[0.68rem] text-red-300 hover:bg-red-500/10"
              :disabled="busy"
              @click="confirmingUnlink = account.id"
            >
              {{ $t('admin.accountsUnlink') }}
            </button>
          </div>
        </div>

        <!-- Set password -->
        <form
          v-if="canManage && passwordFor === account.id"
          class="mt-3 space-y-2 border-t border-white/10 pt-3"
          @submit.prevent="submitPassword(account)"
        >
          <label class="block text-xs font-medium text-gray-400" :for="'pw-' + account.id">
            {{ $t('admin.accountsNewPassword') }}
          </label>
          <input
            :id="'pw-' + account.id"
            v-model="newPassword"
            type="password"
            required
            autocomplete="new-password"
            class="block w-full max-w-md rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary-400 focus:ring-2 focus:ring-primary-400"
          />
          <p class="text-xs text-gray-500">{{ $t('admin.accountsPasswordRule') }}</p>
          <div class="flex gap-2">
            <button
              type="submit"
              :disabled="busy"
              class="rounded-md bg-violet-950/60 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 hover:bg-violet-950 disabled:opacity-50"
            >
              {{ busy ? $t('common.saving') : $t('common.save') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-white/20 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5"
              @click="closePassword"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>
        </form>

        <!-- Confirm unlink -->
        <div
          v-if="canManage && confirmingUnlink === account.id"
          class="mt-3 space-y-2 border-t border-white/10 pt-3"
        >
          <p class="text-xs text-red-300">{{ $t('admin.accountsUnlinkConfirm') }}</p>
          <div class="flex gap-2">
            <button
              type="button"
              :disabled="busy"
              class="rounded-md bg-red-600/70 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
              @click="unlink(account)"
            >
              {{ busy ? $t('common.saving') : $t('admin.accountsUnlinkConfirmYes') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-white/20 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5"
              @click="confirmingUnlink = null"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth'
import { adminApi } from '@/features/admin/api/admin.api'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'

const props = defineProps({
  organizationId: { type: String, default: '' }
})

const { t } = useI18n()
const authStore = useAuthStore()

/**
 * Every mutation below is SUPER_ADMIN_SECURED. A plain admin may read the list,
 * so the controls are hidden rather than the whole panel.
 */
const canManage = computed(() => authStore.hasRole('SUPER_ADMIN'))

const accounts = ref([])
const loading = ref(false)
const busy = ref(false)
const error = ref('')

const showCreate = ref(false)
const passwordFor = ref(null)
const newPassword = ref('')
const confirmingUnlink = ref(null)

const emptyCreateForm = () => ({
  firstName: '',
  lastName: '',
  email: '',
  countryCode: '+251',
  phoneNumber: '',
  password: '',
  makePrimaryContact: false
})
const createForm = ref(emptyCreateForm())

watch(
  () => props.organizationId,
  (id) => {
    resetPanel()
    if (id) load()
  },
  { immediate: true }
)

function resetPanel() {
  accounts.value = []
  error.value = ''
  showCreate.value = false
  passwordFor.value = null
  newPassword.value = ''
  confirmingUnlink.value = null
  createForm.value = emptyCreateForm()
}

async function load() {
  if (!props.organizationId) return
  loading.value = true
  error.value = ''
  try {
    accounts.value = await adminApi.getOrganizationAccounts(props.organizationId)
  } catch (e) {
    error.value = messageFor(e, t('admin.accountsLoadFailed'))
  } finally {
    loading.value = false
  }
}

/** Surfaces the API's own message where there is one — it explains the refusal. */
function messageFor(e, fallback) {
  return e?.response?.data?.message || e?.message || fallback
}

/** Same rule the API enforces, checked here so a rejection is not a round trip. */
function passwordIsValid(value) {
  return (
    typeof value === 'string' &&
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value)
  )
}

function statusClass(status) {
  if (status === 'ACTIVE') return 'border-emerald-400/40 text-emerald-300'
  if (status === 'SUSPENDED') return 'border-red-400/40 text-red-300'
  return 'border-white/20 text-gray-400'
}

function toggleCreate() {
  showCreate.value = !showCreate.value
  error.value = ''
  if (!showCreate.value) createForm.value = emptyCreateForm()
}

function fullPhone(form) {
  const number = (form.phoneNumber || '').trim()
  if (!number) return undefined
  return `${form.countryCode}${number}`
}

async function submitCreate() {
  if (!passwordIsValid(createForm.value.password)) {
    error.value = t('admin.accountsPasswordRule')
    return
  }
  busy.value = true
  error.value = ''
  try {
    await adminApi.createOrganizationAccount(props.organizationId, {
      email: createForm.value.email,
      password: createForm.value.password,
      firstName: createForm.value.firstName,
      lastName: createForm.value.lastName,
      phoneNumber: fullPhone(createForm.value),
      makePrimaryContact: createForm.value.makePrimaryContact
    })
    createForm.value = emptyCreateForm()
    showCreate.value = false
    await load()
  } catch (e) {
    error.value = messageFor(e, t('admin.accountsCreateFailed'))
  } finally {
    busy.value = false
  }
}

function openPassword(account) {
  passwordFor.value = account.id
  newPassword.value = ''
  confirmingUnlink.value = null
  error.value = ''
}

function closePassword() {
  passwordFor.value = null
  newPassword.value = ''
}

async function submitPassword(account) {
  if (!passwordIsValid(newPassword.value)) {
    error.value = t('admin.accountsPasswordRule')
    return
  }
  busy.value = true
  error.value = ''
  try {
    await adminApi.setOrganizationAccountPassword(
      props.organizationId,
      account.id,
      newPassword.value
    )
    closePassword()
    await load()
  } catch (e) {
    error.value = messageFor(e, t('admin.accountsPasswordFailed'))
  } finally {
    busy.value = false
  }
}

async function toggleStatus(account) {
  const next = account.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
  busy.value = true
  error.value = ''
  try {
    await adminApi.setOrganizationAccountStatus(props.organizationId, account.id, next)
    await load()
  } catch (e) {
    error.value = messageFor(e, t('admin.accountsStatusFailed'))
  } finally {
    busy.value = false
  }
}

async function makePrimary(account) {
  busy.value = true
  error.value = ''
  try {
    await adminApi.makeOrganizationAccountPrimaryContact(props.organizationId, account.id)
    await load()
  } catch (e) {
    error.value = messageFor(e, t('admin.accountsPrimaryFailed'))
  } finally {
    busy.value = false
  }
}

async function unlink(account) {
  busy.value = true
  error.value = ''
  try {
    await adminApi.unlinkOrganizationAccount(props.organizationId, account.id)
    confirmingUnlink.value = null
    await load()
  } catch (e) {
    error.value = messageFor(e, t('admin.accountsUnlinkFailed'))
  } finally {
    busy.value = false
  }
}
</script>

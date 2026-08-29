<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-admin-nav/70"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-admin-surface border border-admin-line/10 rounded-lg max-w-md w-full p-6 shadow-xl">
      <h3 class="text-lg font-medium text-admin-fg mb-1">{{ title }}</h3>
      <p class="text-sm text-admin-subtle mb-4">
        {{ $t('admin.exhibitionInterests.verifyContactDialogEmailHint', { email: email || '—' }) }}
      </p>
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-admin-subtle mb-1">{{ $t('admin.exhibitionInterests.verifyContactFirstName') }}</label>
          <input
            v-model="form.firstName"
            type="text"
            autocomplete="given-name"
            class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg placeholder-admin-subtle rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          />
        </div>
        <div>
          <label class="block text-xs text-admin-subtle mb-1">{{ $t('admin.exhibitionInterests.verifyContactLastName') }}</label>
          <input
            v-model="form.lastName"
            type="text"
            autocomplete="family-name"
            class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg placeholder-admin-subtle rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          />
        </div>
        <div>
          <label class="block text-xs text-admin-subtle mb-1">{{ $t('admin.exhibitionInterests.verifyContactDialogPassword') }}</label>
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg placeholder-admin-subtle rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          />
          <p class="text-xs text-admin-faint mt-1">{{ $t('admin.exhibitionInterests.verifyContactDialogPasswordHint') }}</p>
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 text-sm rounded-md border border-admin-line/20 text-admin-muted hover:bg-admin-field/5"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t('admin.cancel') }}
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm rounded-md bg-admin-accent text-admin-accent-fg hover:bg-admin-accent-hover disabled:opacity-50"
          :disabled="!valid || busy"
          @click="submit"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  email: { type: String, default: '' },
  title: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  busy: { type: Boolean, default: false },
  /** Called when opening: return initial { firstName, lastName } */
  initialNames: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const form = ref({
  firstName: '',
  lastName: '',
  password: ''
})

const valid = computed(() => {
  const pwd = (form.value.password || '').trim()
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return (
    (form.value.firstName || '').trim().length > 0 &&
    (form.value.lastName || '').trim().length > 0 &&
    re.test(pwd)
  )
})

watch(
  () => [props.modelValue, props.initialNames],
  () => {
    if (props.modelValue && props.initialNames) {
      form.value = {
        firstName: props.initialNames.firstName || '',
        lastName: props.initialNames.lastName || '',
        password: ''
      }
    }
  },
  { immediate: true }
)

function submit() {
  if (!valid.value) return
  emit('confirm', {
    password: form.value.password.trim(),
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim()
  })
}
</script>

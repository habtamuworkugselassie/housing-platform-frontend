<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-violet-950/70"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-zinc-900 border border-white/10 rounded-lg max-w-md w-full p-6 shadow-xl">
      <h3 class="text-lg font-medium text-white mb-1">{{ title }}</h3>
      <p class="text-sm text-gray-400 mb-4">
        {{ $t('admin.exhibitionInterests.verifyContactDialogEmailHint', { email: email || '—' }) }}
      </p>
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">{{ $t('admin.exhibitionInterests.verifyContactFirstName') }}</label>
          <input
            v-model="form.firstName"
            type="text"
            autocomplete="given-name"
            class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">{{ $t('admin.exhibitionInterests.verifyContactLastName') }}</label>
          <input
            v-model="form.lastName"
            type="text"
            autocomplete="family-name"
            class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">{{ $t('admin.exhibitionInterests.verifyContactDialogPassword') }}</label>
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-black focus:border-black"
          />
          <p class="text-xs text-gray-500 mt-1">{{ $t('admin.exhibitionInterests.verifyContactDialogPasswordHint') }}</p>
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 text-sm rounded-md border border-white/20 text-gray-300 hover:bg-white/5"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t('admin.cancel') }}
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm rounded-md bg-white text-black hover:bg-violet-950 disabled:opacity-50"
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

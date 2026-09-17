<template>
  <ol class="flex items-center gap-2 sm:gap-4" aria-label="Purchase order steps">
    <li
      v-for="(s, index) in steps"
      :key="s"
      class="flex items-center gap-2"
      :aria-current="s === current ? 'step' : undefined"
    >
      <button
        type="button"
        class="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm"
        :class="chipClass(s, index)"
        :disabled="!canJump(index)"
        @click="$emit('select', s)"
      >
        <span
          class="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
          :class="index < currentIndex ? 'bg-green-600 text-white' : s === current ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'"
        >
          <svg v-if="index < currentIndex" class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span class="hidden sm:inline">{{ $t(`purchase.steps.${s}`) }}</span>
      </button>
      <span v-if="index < steps.length - 1" class="h-px w-4 bg-gray-300 sm:w-8" aria-hidden="true" />
    </li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WizardStep } from '../stores/purchaseOrderForm'

const props = defineProps<{
  steps: WizardStep[]
  current: WizardStep
  /** Steps the buyer may jump back to (everything before the first invalid one). */
  completed: Record<WizardStep, boolean>
}>()
defineEmits<{ (e: 'select', step: WizardStep): void }>()

const currentIndex = computed(() => props.steps.indexOf(props.current))

function canJump(index: number) {
  // Backwards is always allowed; forwards only across valid steps.
  if (index <= currentIndex.value) return true
  for (let i = 0; i < index; i++) if (!props.completed[props.steps[i]]) return false
  return true
}

function chipClass(s: WizardStep, index: number) {
  if (s === props.current) return 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
  if (index < currentIndex.value) return 'text-gray-700 hover:bg-gray-100'
  return 'text-gray-400'
}
</script>

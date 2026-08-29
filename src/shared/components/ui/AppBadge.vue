<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
    :class="variantClasses"
  >
    <span v-if="icon" class="material-icons !text-[13px] leading-none" aria-hidden="true">{{ icon }}</span>
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

/**
 * One badge shape for the whole app. Rule of the card: at most two badges,
 * status top-left, tier top-right, never overlapping.
 */
const props = defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (v) =>
      ['premier', 'gold', 'success', 'warning', 'danger', 'info', 'neutral'].includes(v)
  },
  icon: { type: String, default: '' }
})

const variantClasses = computed(() => ({
  premier: 'bg-primary-950 text-gold-300 ring-1 ring-gold-400/60',
  gold: 'bg-gold-400 text-primary-950 ring-1 ring-white/30',
  success: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40',
  warning: 'bg-gold-400/20 text-gold-300 ring-1 ring-gold-400/40',
  danger: 'bg-red-500/20 text-red-300 ring-1 ring-red-400/40',
  info: 'bg-primary-500/25 text-primary-200 ring-1 ring-primary-400/40',
  neutral: 'bg-white/10 text-gray-300 ring-1 ring-white/15'
})[props.variant])
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to || undefined"
    :type="to ? undefined : type"
    :disabled="disabled || undefined"
    class="inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition
           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
           disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[sizeClasses, variantClasses]"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

/**
 * The platform's three button voices. Primary is the gold CTA the public skin
 * already uses (splash ENTER, accent links); secondary is the quiet outline for
 * dark surfaces; ghost is for inline/tertiary actions.
 */
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost'].includes(v)
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  type: { type: String, default: 'button' },
  to: { type: [String, Object], default: null },
  disabled: { type: Boolean, default: false }
})

const sizeClasses = computed(() => ({
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
})[props.size])

const variantClasses = computed(() => ({
  primary: 'bg-gold-400 text-primary-950 hover:bg-gold-500 shadow-sm',
  secondary: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
  ghost: 'text-gray-300 hover:text-white hover:bg-white/5'
})[props.variant])
</script>

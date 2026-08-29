<template>
  <div
    class="rounded-xl border border-white/10 bg-white/[0.04] transition"
    :class="[padded ? 'p-4 sm:p-5' : '', hover ? 'hover:border-primary-400/50 hover:bg-primary-900/15' : '']"
  >
    <slot />
  </div>
</template>

<script setup>
/** The one dark surface panel. Same recipe as the admin panels and mdc-card. */
defineProps({
  padded: { type: Boolean, default: true },
  hover: { type: Boolean, default: false }
})
</script>

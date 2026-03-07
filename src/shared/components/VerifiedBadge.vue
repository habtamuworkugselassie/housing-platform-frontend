<template>
  <span
    v-if="displayLevel"
    class="inline-flex items-center rounded-full shrink-0 border border-blue-400/50 bg-[#1DA1F2]/20 font-semibold text-blue-300"
    :class="size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'"
    :title="displayLevel === 'FULL' ? 'Verified company' : 'Partially verified'"
  >
    <!-- Twitter-style blue check: circle with check -->
    <svg
      class="mr-1 flex-shrink-0 text-[#1DA1F2]"
      :class="size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.207 7.793a1 1 0 0 0-1.414-1.414L10 12.586 8.207 10.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l5.5-5.5z"
        clip-rule="evenodd"
      />
    </svg>
    {{ displayLevel === 'FULL' ? 'Verified' : 'Half verified' }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** Display level: FULL = all docs + numbers, HALF = one category complete (e.g. docs but numbers missing). */
const props = withDefaults(
  defineProps<{
    level?: string | null
    size?: 'sm' | 'md'
  }>(),
  { size: 'sm' }
)

const displayLevel = computed(() =>
  props.level === 'FULL' || props.level === 'HALF' ? props.level : null
)
</script>

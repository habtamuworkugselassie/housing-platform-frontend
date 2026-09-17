<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="classes">
    {{ $t(`purchase.status.${status}`) }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PurchaseOrderStatus } from '../api/purchase.types'

const props = defineProps<{ status: PurchaseOrderStatus }>()
const classes = computed(() => {
  switch (props.status) {
    case 'COMPLETED':
    case 'FINANCING_APPROVED':
      return 'bg-green-100 text-green-700'
    case 'AWAITING_PAYMENT':
      return 'bg-blue-100 text-blue-700'
    case 'FINANCING_PARTIALLY_APPROVED':
    case 'FINANCING_REJECTED':
      return 'bg-amber-100 text-amber-800'
    case 'CANCELLED':
    case 'REJECTED':
    case 'EXPIRED':
      return 'bg-gray-200 text-gray-700'
    default:
      return 'bg-primary-100 text-primary-700'
  }
})
</script>

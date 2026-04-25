<template>
  <div class="flex flex-wrap justify-end gap-1">
    <button
      type="button"
      :disabled="!!app.organizationVerifiedAt"
      class="text-xs px-2 py-1 rounded border border-white/20 bg-white/5 text-cyan-300 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed"
      @click="$emit('verify-org', app.id)"
    >
      {{ $t('admin.sponsorshipVerifyOrg') }}
    </button>
    <button
      type="button"
      :disabled="!!app.userVerifiedAt"
      class="text-xs px-2 py-1 rounded border border-white/20 bg-white/5 text-cyan-300 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed"
      @click="$emit('verify-user', app)"
    >
      {{ $t('admin.sponsorshipVerifyUser') }}
    </button>
    <button
      type="button"
      :disabled="!canApprove"
      class="text-xs px-2 py-1 rounded border border-white/20 bg-white/5 text-green-300 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed"
      @click="$emit('approve', app.id)"
    >
      {{ $t('admin.activate') }}
    </button>
    <button
      type="button"
      class="text-xs text-red-300 hover:text-black"
      @click="$emit('reject', app)"
    >
      {{ $t('admin.reject') }}
    </button>
    <button
      type="button"
      class="text-xs text-orange-300 hover:text-black"
      @click="$emit('cancel', app.id)"
    >
      {{ $t('admin.cancelPendingSponsorship') }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  app: { type: Object, required: true }
})

defineEmits(['verify-org', 'verify-user', 'approve', 'reject', 'cancel'])

const canApprove = computed(
  () => !!(props.app?.organizationVerifiedAt && props.app?.userVerifiedAt)
)
</script>

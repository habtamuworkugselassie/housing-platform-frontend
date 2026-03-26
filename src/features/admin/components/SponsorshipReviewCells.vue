<template>
  <div>
    <div class="flex flex-wrap gap-2 text-xs">
      <span :class="app.organizationVerifiedAt ? 'text-green-300' : 'text-gray-500'">
        {{ app.organizationVerifiedAt ? $t('admin.sponsorshipOrgVerified') : $t('admin.sponsorshipOrgNotVerified') }}
      </span>
      <span :class="app.userVerifiedAt ? 'text-green-300' : 'text-gray-500'">
        {{ app.userVerifiedAt ? $t('admin.sponsorshipUserVerified') : $t('admin.sponsorshipUserNotVerified') }}
      </span>
    </div>
    <p v-if="!canApprove" class="text-xs text-yellow-500/90 mt-1">
      {{ $t('admin.sponsorshipPendingApproval') }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  app: { type: Object, required: true }
})

const canApprove = computed(
  () => !!(props.app?.organizationVerifiedAt && props.app?.userVerifiedAt)
)
</script>

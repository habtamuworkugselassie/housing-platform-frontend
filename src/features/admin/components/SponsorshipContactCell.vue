<template>
  <div v-if="app.verificationUser" class="text-sm">
    {{ app.verificationUser.firstName }} {{ app.verificationUser.lastName }}
    <div class="text-xs break-all mt-0.5 text-admin-subtle">{{ app.verificationUser.email }}</div>
  </div>
  <span v-else class="text-admin-subtle text-xs">—</span>
</template>

<script setup>
defineProps({
  app: { type: Object, required: true }
})
</script>

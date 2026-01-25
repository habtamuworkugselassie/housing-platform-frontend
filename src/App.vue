<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    <PublicLayout v-if="isPublicRoute">
      <router-view />
    </PublicLayout>
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NavBar, PublicLayout } from '@/shared/components'

const route = useRoute()

// Public routes are those without requiresAuth meta
const isPublicRoute = computed(() => {
  return route.meta?.requiresAuth !== true
})
</script>

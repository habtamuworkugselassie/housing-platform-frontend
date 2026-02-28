<template>
  <div class="min-h-screen bg-black text-white">
    <NavBar />
    <PublicLayout v-if="isPublicRoute">
      <template v-if="isExhibitionLanding" #top>
        <ExhibitionTopSection />
      </template>
      <router-view />
    </PublicLayout>
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NavBar, PublicLayout } from '@/shared/components'
import ExhibitionTopSection from '@/features/exhibition/components/ExhibitionTopSection.vue'

const route = useRoute()

// Public routes are those without requiresAuth meta
const isPublicRoute = computed(() => {
  return route.meta?.requiresAuth !== true
})

// Exhibition landing (home): show sponsor carousel above content; side panels sit below it
const isExhibitionLanding = computed(() => route.path === '/')
</script>

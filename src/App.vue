<template>
  <div class="site-shell min-h-screen flex flex-col">
    <NavBar v-if="!route.meta?.hideLayout" />
    <div class="flex-1 min-h-0 flex flex-col">
      <PublicLayout v-if="isPublicRoute && !route.meta?.hideLayout">
        <template v-if="isExhibitionLanding" #top>
          <ExhibitionTopSection />
          <LandingHero />
        </template>
        <router-view />
      </PublicLayout>
      <router-view v-else />
    </div>
    <Footer v-if="!route.meta?.hideLayout" />
    <PublicSupportChat v-if="!route.meta?.hideLayout" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NavBar, PublicLayout, Footer, LandingHero, PublicSupportChat } from '@/shared/components'
import ExhibitionTopSection from '@/features/exhibition/components/ExhibitionTopSection.vue'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'

const { loadDisplaySettings } = useDisplaySettings()
loadDisplaySettings()

const route = useRoute()

// Public routes are those without requiresAuth meta
const isPublicRoute = computed(() => {
  return route.meta?.requiresAuth !== true
})

// Exhibition landing (home): show sponsor carousel above content; side panels sit below it
const isExhibitionLanding = computed(() => route.path === '/')
</script>

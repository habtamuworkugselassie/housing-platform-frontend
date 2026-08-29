<template>
  <!-- Splash: only on home "/" and only first time per session -->
  <SplashScreen
    v-if="showSplash"
    :app-title="$t('common.appName')"
    :auto-dismiss-ms="8000"
    @dismiss="onSplashDismiss"
  />
  <div class="site-shell min-h-screen flex flex-col" :class="{ 'is-revealing': isRevealing }">
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
import { NavBar, PublicLayout, Footer, LandingHero, SplashScreen, PublicSupportChat } from '@/shared/components'
import ExhibitionTopSection from '@/features/exhibition/components/ExhibitionTopSection.vue'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'

const { loadDisplaySettings } = useDisplaySettings()
loadDisplaySettings()

const SPLASH_SHOWN_KEY = 'splashShown'

const route = useRoute()

function shouldShowSplash() {
  if (typeof sessionStorage === 'undefined') return false
  return route.path === '/' && !sessionStorage.getItem(SPLASH_SHOWN_KEY)
}

const showSplash = ref(shouldShowSplash())

// Plays the staggered "the page assembles" entrance once, right after the
// splash is dismissed. Kept on only for the length of the animation so later
// re-renders don't replay it.
const isRevealing = ref(false)
let revealTimer = null

function onSplashDismiss() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SPLASH_SHOWN_KEY, '1')
  }
  showSplash.value = false
  isRevealing.value = true
  if (revealTimer) clearTimeout(revealTimer)
  revealTimer = setTimeout(() => {
    isRevealing.value = false
  }, 1800)
}

// When user navigates to "/", show splash only if not shown this session
watch(
  () => route.path,
  (path) => {
    if (path === '/' && !showSplash.value && !sessionStorage?.getItem(SPLASH_SHOWN_KEY)) {
      showSplash.value = true
    }
    if (path !== '/') {
      showSplash.value = false
    }
  },
  { immediate: false }
)

// Public routes are those without requiresAuth meta
const isPublicRoute = computed(() => {
  return route.meta?.requiresAuth !== true
})

// Exhibition landing (home): show sponsor carousel above content; side panels sit below it
const isExhibitionLanding = computed(() => route.path === '/')
</script>

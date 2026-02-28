<template>
  <div class="min-h-screen bg-black text-white flex flex-col">
    <!-- Optional full-width top (e.g. sponsor carousel) - side panels start below -->
    <div v-if="$slots.top" class="w-full flex-shrink-0">
      <slot name="top" />
    </div>

    <!-- Main row: Left Ad | Content | Right Ad -->
    <div class="flex flex-1 min-h-0">
    <!-- Left Side Ad (Desktop Only) -->
    <aside class="hidden xl:block w-80 flex-shrink-0 bg-zinc-900 border-r border-white/10 sticky top-0 h-screen overflow-y-auto text-white">
      <div class="p-4 space-y-4">
        <AdSpace 
          v-if="leftSideAd"
          size="sidebar"
          dark
          :ad-content="leftSideAd"
        />
        <AdSpace v-else size="sidebar" dark />
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-w-0 text-white">
      <slot />
    </main>

    <!-- Right Side Ad (Desktop Only) -->
    <aside class="hidden xl:block w-80 flex-shrink-0 bg-zinc-900 border-l border-white/10 sticky top-0 h-screen overflow-y-auto text-white">
      <div class="p-4 space-y-4">
        <AdSpace 
          v-if="rightSideAd"
          size="sidebar"
          dark
          :ad-content="rightSideAd"
        />
        <AdSpace v-else size="sidebar" dark />
      </div>
    </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { AdSpace } from './index'
import { useAds } from '../composables/useAds'

const { loadAllAds, sideAds, getRandomSideAd } = useAds()
const leftSideAdIndex = ref(0)
const rightSideAdIndex = ref(0)

// Get current ads for left and right sidebars (using sideAds which have lower base_price)
const leftSideAd = computed(() => {
  if (sideAds.value.length === 0) return null
  return sideAds.value[leftSideAdIndex.value % sideAds.value.length]
})

const rightSideAd = computed(() => {
  if (sideAds.value.length === 0) return null
  // Use a different index for right side to show different ads
  const rightIndex = (rightSideAdIndex.value + Math.floor(sideAds.value.length / 2)) % sideAds.value.length
  return sideAds.value[rightIndex]
})

// Rotate sidebar ads every 15 seconds
let adRotationInterval = null

onMounted(() => {
  loadAllAds(20).then(() => {
    // Start rotating ads every 15 seconds
    adRotationInterval = setInterval(() => {
      if (sideAds.value.length > 0) {
        leftSideAdIndex.value = (leftSideAdIndex.value + 1) % sideAds.value.length
        rightSideAdIndex.value = (rightSideAdIndex.value + 1) % sideAds.value.length
      }
    }, 15000)
  })
})

// Cleanup interval on unmount
onUnmounted(() => {
  if (adRotationInterval) {
    clearInterval(adRotationInterval)
  }
})
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #27272a;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #52525b;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #71717a;
}
</style>

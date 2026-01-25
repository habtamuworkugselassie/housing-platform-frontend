<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Left Side Ad (Desktop Only) - BASIC Sponsored Properties/Buildings -->
    <aside class="hidden xl:block w-80 flex-shrink-0 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
      <div class="p-4 space-y-4">
        <AdSpace 
          v-if="leftSideAd"
          size="sidebar" 
          :ad-content="leftSideAd"
        />
        <AdSpace v-else size="sidebar" />
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-w-0">
      <slot />
    </main>

    <!-- Right Side Ad (Desktop Only) - BASIC Sponsored Properties/Buildings -->
    <aside class="hidden xl:block w-80 flex-shrink-0 bg-white border-l border-gray-200 sticky top-0 h-screen overflow-y-auto">
      <div class="p-4 space-y-4">
        <AdSpace 
          v-if="rightSideAd"
          size="sidebar" 
          :ad-content="rightSideAd"
        />
        <AdSpace v-else size="sidebar" />
      </div>
    </aside>
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
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>

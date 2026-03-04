<template>
  <div class="min-h-screen bg-black text-white flex flex-col">
    <!-- Optional full-width top (e.g. sponsor carousel) - side panels start below -->
    <div v-if="$slots.top" class="w-full flex-shrink-0">
      <slot name="top" />
    </div>

    <!-- Main row: Left Ad | Content | Right Ad -->
    <div class="flex flex-1 min-h-0">
    <!-- Left Side Ad (Desktop Only) -->
    <aside class="hidden xl:block w-80 flex-shrink-0 bg-zinc-900 border-r border-white/10 text-white">
      <div class="p-4 space-y-4">
        <AdSpace
          v-for="(ad, index) in leftSideAds"
          :key="`left-ad-${ad.realEstateCompanyId || ad.id}-${index}`"
          size="sidebar"
          dark
          :ad-content="ad"
        />
        <AdSpace
          v-for="slot in leftEmptySlots"
          :key="`left-empty-${slot}`"
          size="sidebar"
          dark
        />
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-w-0 text-white">
      <slot />
    </main>

    <!-- Right Side Ad (Desktop Only) -->
    <aside class="hidden xl:block w-80 flex-shrink-0 bg-zinc-900 border-l border-white/10 text-white">
      <div class="p-4 space-y-4">
        <AdSpace
          v-for="(ad, index) in rightSideAds"
          :key="`right-ad-${ad.realEstateCompanyId || ad.id}-${index}`"
          size="sidebar"
          dark
          :ad-content="ad"
        />
        <AdSpace
          v-for="slot in rightEmptySlots"
          :key="`right-empty-${slot}`"
          size="sidebar"
          dark
        />
      </div>
    </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { AdSpace } from './index'
import { useAds } from '../composables/useAds'

const { loadAllAds, sideAds } = useAds()
const SIDE_AD_SLOTS = 4
const leftStartIndex = ref(0)
const rightStartIndex = ref(0)

// Start sponsor/carousel load immediately so it finishes before feature section loads
loadAllAds(50)

const premiumSideAds = computed(() =>
  sideAds.value.filter(ad => String(ad.sponsorshipType || '').toUpperCase() === 'PREMIUM')
)

const adKey = (ad) => ad.realEstateCompanyId || ad.id

const buildDistinctColumns = (leftSeed, rightSeed) => {
  const ads = sideAds.value
  if (!ads.length) return { left: [], right: [] }

  const left = []
  const right = []
  const usedKeys = new Set()

  const normalizeCursor = (seed, length) => ((seed % length) + length) % length

  const appendUniqueAd = (target, ad) => {
    if (!ad) return false
    const key = adKey(ad)
    if (usedKeys.has(key)) return false
    target.push(ad)
    usedKeys.add(key)
    return true
  }

  const nextUniqueFromList = (list, cursorState) => {
    if (!list.length) return null
    let attempts = 0
    while (attempts < list.length) {
      const candidate = list[cursorState.value]
      cursorState.value = (cursorState.value + 1) % list.length
      attempts += 1
      if (!candidate) continue
      const key = adKey(candidate)
      if (usedKeys.has(key)) continue
      return candidate
    }
    return null
  }

  const allLeftCursor = { value: normalizeCursor(leftSeed, ads.length) }
  const allRightCursor = {
    value: normalizeCursor(rightSeed + Math.floor(Math.max(1, ads.length) / 2), ads.length)
  }

  const premium = premiumSideAds.value
  if (premium.length > 0) {
    const premiumLeftCursor = { value: normalizeCursor(leftSeed, premium.length) }
    const premiumRightCursor = { value: normalizeCursor(rightSeed + 1, premium.length) }
    appendUniqueAd(left, nextUniqueFromList(premium, premiumLeftCursor))
    appendUniqueAd(right, nextUniqueFromList(premium, premiumRightCursor))
  }

  while ((left.length < SIDE_AD_SLOTS || right.length < SIDE_AD_SLOTS) && usedKeys.size < ads.length) {
    if (left.length < SIDE_AD_SLOTS) {
      appendUniqueAd(left, nextUniqueFromList(ads, allLeftCursor))
    }
    if (right.length < SIDE_AD_SLOTS) {
      appendUniqueAd(right, nextUniqueFromList(ads, allRightCursor))
    }
  }

  return { left, right }
}

const sideColumns = computed(() => buildDistinctColumns(leftStartIndex.value, rightStartIndex.value))

const leftSideAds = computed(() => sideColumns.value.left)
const rightSideAds = computed(() => sideColumns.value.right)

const leftEmptySlots = computed(() => Math.max(0, SIDE_AD_SLOTS - leftSideAds.value.length))
const rightEmptySlots = computed(() => Math.max(0, SIDE_AD_SLOTS - rightSideAds.value.length))

// Rotate sidebar ads every 12 seconds (start after ads have loaded)
let adRotationInterval = null
onMounted(() => {
  const startRotation = () => {
    if (adRotationInterval) return
    adRotationInterval = setInterval(() => {
      if (sideAds.value.length > 0) {
        leftStartIndex.value = (leftStartIndex.value + 1) % sideAds.value.length
        rightStartIndex.value = (rightStartIndex.value + 1) % sideAds.value.length
      }
    }, 20000)
  }
  if (sideAds.value.length > 0) startRotation()
  else {
    const stop = watch(sideAds, (v) => { if (v.length > 0) { startRotation(); stop() } }, { immediate: true })
  }
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

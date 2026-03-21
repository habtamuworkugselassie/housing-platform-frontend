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
          v-for="(ad, index) in leftSideSlots"
          :key="`left-ad-${index}`"
          size="sidebar"
          dark
          :ad-content="ad || undefined"
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
          v-for="(ad, index) in rightSideSlots"
          :key="`right-ad-${index}`"
          size="sidebar"
          dark
          :ad-content="ad || undefined"
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
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'

const { loadAllAds, sideAds } = useAds()
const { settings, loadDisplaySettings } = useDisplaySettings()
const SIDE_AD_SLOTS = 4
const leftStartIndex = ref(0)
const rightStartIndex = ref(0)

// Start sponsor/carousel load immediately so it finishes before feature section loads
loadAllAds(50)

const adKey = (ad) => ad.realEstateCompanyId || ad.id

/** Exclusive + premium — preferred for the first two sidebar rows per column. */
const isTopSidebarTier = (ad) => {
  const t = String(ad.sponsorshipType || '').trim().toUpperCase()
  return t === 'EXCLUSIVE' || t === 'PREMIUM'
}

const emptySideColumn = () => Array.from({ length: SIDE_AD_SLOTS }, () => null)

const buildDistinctColumns = (leftSeed, rightSeed) => {
  const ads = sideAds.value
  if (!ads.length) return { left: emptySideColumn(), right: emptySideColumn() }

  const topTierAds = ads.filter(isTopSidebarTier)
  const left = emptySideColumn()
  const right = emptySideColumn()
  const usedKeys = new Set()

  const normalizeCursor = (seed, length) => ((seed % length) + length) % length

  const takeUnique = (ad) => {
    if (!ad) return false
    const key = adKey(ad)
    if (usedKeys.has(key)) return false
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

  const topLen = Math.max(1, topTierAds.length)
  const topLeftCursor = { value: normalizeCursor(leftSeed, topLen) }
  const topRightCursor = { value: normalizeCursor(rightSeed + 1, topLen) }

  for (let i = 0; i < 2; i++) {
    const ad = nextUniqueFromList(topTierAds, topLeftCursor)
    if (ad && takeUnique(ad)) left[i] = ad
  }
  for (let i = 0; i < 2; i++) {
    const ad = nextUniqueFromList(topTierAds, topRightCursor)
    if (ad && takeUnique(ad)) right[i] = ad
  }

  const allLeftCursor = { value: normalizeCursor(leftSeed, ads.length) }
  const allRightCursor = {
    value: normalizeCursor(rightSeed + Math.floor(Math.max(1, ads.length) / 2), ads.length)
  }

  // When there are fewer than 4 unique exclusive/premium sponsors, top rows still have gaps —
  // fill them from all tiers (including gold) so the panel stays populated.
  const topRowsNeedBackfill = () =>
    left[0] == null || left[1] == null || right[0] == null || right[1] == null

  while (topRowsNeedBackfill() && usedKeys.size < ads.length) {
    const before = usedKeys.size
    if (left[0] == null || left[1] == null) {
      const idx = left[0] == null ? 0 : 1
      const ad = nextUniqueFromList(ads, allLeftCursor)
      if (ad && takeUnique(ad)) left[idx] = ad
    }
    if (right[0] == null || right[1] == null) {
      const idx = right[0] == null ? 0 : 1
      const ad = nextUniqueFromList(ads, allRightCursor)
      if (ad && takeUnique(ad)) right[idx] = ad
    }
    if (usedKeys.size === before) break
  }

  const bottomNeedsWork = () =>
    left[2] == null || left[3] == null || right[2] == null || right[3] == null

  while (bottomNeedsWork() && usedKeys.size < ads.length) {
    const before = usedKeys.size
    if (left[2] == null || left[3] == null) {
      const idx = left[2] == null ? 2 : 3
      const ad = nextUniqueFromList(ads, allLeftCursor)
      if (ad && takeUnique(ad)) left[idx] = ad
    }
    if (right[2] == null || right[3] == null) {
      const idx = right[2] == null ? 2 : 3
      const ad = nextUniqueFromList(ads, allRightCursor)
      if (ad && takeUnique(ad)) right[idx] = ad
    }
    if (usedKeys.size === before) break
  }

  return { left, right }
}

const sideColumns = computed(() => buildDistinctColumns(leftStartIndex.value, rightStartIndex.value))

const leftSideSlots = computed(() => sideColumns.value.left)
const rightSideSlots = computed(() => sideColumns.value.right)

// Rotate sidebar ads periodically (interval from admin display settings)
let adRotationInterval = null

function clearAdRotation() {
  if (adRotationInterval) {
    clearInterval(adRotationInterval)
    adRotationInterval = null
  }
}

function startAdRotation() {
  clearAdRotation()
  if (sideAds.value.length === 0) return
  const ms = settings.sidebarLayoutRotationMs
  if (ms <= 0) return
  adRotationInterval = setInterval(() => {
    if (sideAds.value.length > 0) {
      leftStartIndex.value = (leftStartIndex.value + 1) % sideAds.value.length
      rightStartIndex.value = (rightStartIndex.value + 1) % sideAds.value.length
    }
  }, ms)
}

onMounted(() => {
  loadDisplaySettings().then(() => {
    if (sideAds.value.length > 0) startAdRotation()
    else {
      const stop = watch(
        sideAds,
        (v) => {
          if (v.length > 0) {
            startAdRotation()
            stop()
          }
        },
        { immediate: true }
      )
    }
  })
})

watch(
  () => settings.sidebarLayoutRotationMs,
  () => {
    if (sideAds.value.length > 0) startAdRotation()
  }
)

onUnmounted(() => {
  clearAdRotation()
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

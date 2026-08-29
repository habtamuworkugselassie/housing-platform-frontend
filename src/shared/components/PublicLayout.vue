<template>
  <div class="min-h-screen bg-surface-canvas text-white flex flex-col">
    <!-- Optional full-width top (e.g. sponsor carousel) - the side panel starts below -->
    <div v-if="$slots.top" class="w-full flex-shrink-0">
      <slot name="top" />
    </div>

    <!-- Main row: Content | Right sponsor rail. One rail, not two — the same
         sponsors used to render in a left rail, a right rail and the content
         itself, three copies per page, squeezing content to half the screen. -->
    <div class="flex flex-1 min-h-0">
      <main class="flex-1 min-w-0 text-white">
        <slot />
      </main>

      <aside
        v-if="sideSlots.some(Boolean)"
        class="hidden xl:block w-80 flex-shrink-0 bg-black/20 border-l border-white/10 text-white"
      >
        <div class="p-4 space-y-4">
          <AdSpace
            v-for="(ad, index) in sideSlots"
            :key="`side-ad-${index}`"
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
const startIndex = ref(0)

// Start sponsor/carousel load immediately so it finishes before feature section loads
loadAllAds(50)

const adKey = (ad) => ad.realEstateCompanyId || ad.id

/** Exclusive + premium — preferred for the first two rows. */
const isTopSidebarTier = (ad) => {
  const t = String(ad.sponsorshipType || '').trim().toUpperCase()
  return t === 'EXCLUSIVE' || t === 'PLATINUM' || t === 'PREMIUM'
}

/** One column of up to four unique sponsors: top tiers first, then the rest. */
const sideSlots = computed(() => {
  const ads = sideAds.value
  if (!ads.length) return Array.from({ length: SIDE_AD_SLOTS }, () => null)

  const seen = new Set()
  const unique = []
  const offset = ((startIndex.value % ads.length) + ads.length) % ads.length
  const rotated = [...ads.slice(offset), ...ads.slice(0, offset)]
  for (const ad of [...rotated.filter(isTopSidebarTier), ...rotated]) {
    const key = adKey(ad)
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(ad)
    if (unique.length === SIDE_AD_SLOTS) break
  }
  while (unique.length < SIDE_AD_SLOTS) unique.push(null)
  return unique
})

// Rotate the rail periodically (interval from admin display settings)
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
      startIndex.value = (startIndex.value + 1) % sideAds.value.length
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

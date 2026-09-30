<template>
  <!-- Nothing at all outside the final stretch: a counter reading "101 days" months
       out is wallpaper, and once it has been ignored for a season it stops being
       noticed at the moment it matters. -->
  <div v-if="phase === 'counting'" class="expo-countdown" role="timer" aria-live="polite">
    <p class="expo-countdown__label">{{ $t('exhibition.countdown.label') }}</p>
    <div class="expo-countdown__units">
      <div v-for="u in units" :key="u.key" class="expo-countdown__unit">
        <!-- tabular-nums so the digits do not jitter the layout as they tick -->
        <span class="expo-countdown__value">{{ u.value }}</span>
        <span class="expo-countdown__unit-label">{{ $t(`exhibition.countdown.${u.key}`) }}</span>
      </div>
    </div>
  </div>

  <!-- The counter reaching zero and vanishing would read as a bug on the one day it
       matters most, so the open days say so instead. -->
  <div v-else-if="phase === 'live'" class="expo-countdown expo-countdown--live" role="status">
    <p class="expo-countdown__label">
      <span class="expo-countdown__pulse" aria-hidden="true" />
      {{ $t('exhibition.countdown.happeningNow') }}
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { EXPO_EVENT } from '@/features/exhibition/eventDetails'

/** Show the counter only inside the final stretch. */
const VISIBLE_WITHIN_DAYS = 10

// The stored dates carry their +03:00 offset, so these are the same instants for a
// visitor in Addis Ababa and one abroad — no local-time reinterpretation.
const startsAt = new Date(EXPO_EVENT.startDate).getTime()
const endsAt = new Date(EXPO_EVENT.endDate).getTime()

const now = ref(Date.now())
let timer = null

const msLeft = computed(() => startsAt - now.value)

const phase = computed(() => {
  if (now.value >= endsAt) return 'over'
  if (now.value >= startsAt) return 'live'
  return msLeft.value <= VISIBLE_WITHIN_DAYS * 86400000 ? 'counting' : 'waiting'
})

const pad = (n) => String(n).padStart(2, '0')

const units = computed(() => {
  const ms = Math.max(0, msLeft.value)
  const totalSeconds = Math.floor(ms / 1000)
  return [
    { key: 'days', value: String(Math.floor(totalSeconds / 86400)) },
    { key: 'hours', value: pad(Math.floor(totalSeconds / 3600) % 24) },
    { key: 'minutes', value: pad(Math.floor(totalSeconds / 60) % 60) },
    { key: 'seconds', value: pad(totalSeconds % 60) }
  ]
})

// Ticking every second only matters while something is on screen; outside the window
// this component renders nothing, so there is no timer to run.
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.expo-countdown {
  margin: 1.1rem 0 0;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #ddd6fe;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  display: inline-block;
}
.expo-countdown__label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.6rem;
  color: #5b21b6;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.expo-countdown__units {
  display: flex;
  gap: 0.5rem;
}
.expo-countdown__unit {
  min-width: 3.5rem;
  padding: 0.5rem 0.4rem;
  border-radius: 0.5rem;
  background: #ffffff;
  border: 1px solid #e9e3ff;
  text-align: center;
}
.expo-countdown__value {
  display: block;
  color: #4c1d95;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.expo-countdown__unit-label {
  display: block;
  margin-top: 0.15rem;
  color: #6b7280;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.expo-countdown--live {
  border-color: #bbf7d0;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}
.expo-countdown--live .expo-countdown__label {
  margin: 0;
  color: #15803d;
}
.expo-countdown__pulse {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #16a34a;
  animation: expo-countdown-pulse 1.6s ease-in-out infinite;
}
@keyframes expo-countdown-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.35); }
}
/* A counter that pulses once a second is motion a visitor cannot turn off. */
@media (prefers-reduced-motion: reduce) {
  .expo-countdown__pulse { animation: none; }
}

@media (max-width: 400px) {
  .expo-countdown { display: block; }
  .expo-countdown__unit { min-width: 0; flex: 1; }
}
</style>

<template>
  <section
    v-if="greeting && !dismissed"
    class="seasonal"
    :class="`seasonal--${greeting.symbol}`"
    role="region"
    :aria-label="$t(greeting.titleKey)"
  >
    <!-- A band of Adey Abeba growing along the bottom edge, the way the flower actually
         appears at Meskerem: heads on stems, some still in bud. Drawn rather than loaded —
         sharp at any width, no request, and it recolours with the banner. -->
    <div class="seasonal__meadow" aria-hidden="true">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMax slice" class="seasonal__meadow-svg">
        <g v-for="(stalk, i) in meadow" :key="i" :transform="`translate(${stalk.x} 120)`">
          <path
            :d="`M0 0 C ${stalk.bend} -${stalk.height * 0.45} ${-stalk.bend} -${stalk.height * 0.75} 0 -${stalk.height}`"
            fill="none"
            stroke="#4D7C0F"
            :stroke-width="stalk.scale * 3.4"
            stroke-linecap="round"
          />
          <ellipse
            :cx="stalk.bend * 1.5" :cy="-stalk.height * 0.5"
            :rx="stalk.scale * 7" :ry="stalk.scale * 3.2"
            :transform="`rotate(${stalk.bend > 0 ? 24 : -24} ${stalk.bend * 1.5} ${-stalk.height * 0.5})`"
            fill="#65A30D"
          />
          <g :transform="`translate(0 -${stalk.height}) scale(${stalk.scale}) rotate(${stalk.tilt})`">
            <template v-if="stalk.bud">
              <ellipse rx="6" ry="8" fill="#F59E0B" />
              <path d="M-6 0 A6 8 0 0 1 6 0 Z" fill="#EA580C" opacity="0.55" />
              <path d="M0 -8 V8" stroke="#EA580C" stroke-width="1.4" opacity="0.5" />
            </template>
            <template v-else>
              <g v-for="n in 9" :key="n" :transform="`rotate(${(n - 1) * 40})`">
                <path d="M0 -5 C -6.5 -9 -7.5 -17.5 0 -22 C 7.5 -17.5 6.5 -9 0 -5 Z" fill="#F7B32B" />
                <path d="M0 -6 C -3.5 -9 -4 -15 0 -19 C 4 -15 3.5 -9 0 -6 Z" fill="#FCD34D" opacity="0.75" />
              </g>
              <circle r="6.4" fill="#EA580C" />
              <circle r="3.1" fill="#FB923C" />
            </template>
          </g>
        </g>
      </svg>
    </div>

    <div class="seasonal__inner">
      <p class="seasonal__text">
        <span class="seasonal__title">{{ $t(greeting.titleKey) }}</span>
        <span class="seasonal__subtitle">{{ $t(greeting.subtitleKey) }}</span>
      </p>

      <button
        type="button"
        class="seasonal__dismiss"
        :aria-label="$t('seasonal.dismiss')"
        @click="dismiss"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { activeGreeting, dismissalKey } from '@/shared/seasonalGreetings'

// Re-read the clock rather than deciding once at mount: a tab left open overnight would
// otherwise still be wishing people a happy new year two days later.
const now = ref(new Date())
let timer

const greeting = computed(() => activeGreeting(now.value))

/**
 * Where each stalk stands along a 1200-wide strip, anchored to the bottom edge.
 *
 * Hand-placed rather than evenly spaced or randomised: a meadow reads as a meadow when the
 * heights and lean vary and the gaps are uneven. Buds among the open heads are how the
 * flower actually looks in Meskerem, and they give the eye somewhere to rest between blooms.
 */
const meadow = [
  { x: 24, height: 50, scale: 0.85, bend: 6, tilt: -12, bud: false },
  { x: 86, height: 32, scale: 0.62, bend: -5, tilt: 10, bud: true },
  { x: 146, height: 66, scale: 1.02, bend: 7, tilt: 5, bud: false },
  { x: 224, height: 42, scale: 0.76, bend: -6, tilt: -15, bud: false },
  { x: 300, height: 58, scale: 0.94, bend: 5, tilt: 8, bud: false },
  { x: 372, height: 28, scale: 0.58, bend: -4, tilt: -6, bud: true },
  { x: 438, height: 70, scale: 1.06, bend: 8, tilt: -7, bud: false },
  { x: 522, height: 46, scale: 0.8, bend: -6, tilt: 13, bud: false },
  { x: 598, height: 60, scale: 0.96, bend: 6, tilt: -4, bud: false },
  { x: 668, height: 30, scale: 0.6, bend: -4, tilt: 9, bud: true },
  { x: 736, height: 64, scale: 1.0, bend: 7, tilt: 6, bud: false },
  { x: 818, height: 44, scale: 0.78, bend: -5, tilt: -11, bud: false },
  { x: 892, height: 56, scale: 0.92, bend: 6, tilt: 4, bud: false },
  { x: 960, height: 30, scale: 0.6, bend: -4, tilt: -8, bud: true },
  { x: 1028, height: 68, scale: 1.04, bend: 7, tilt: -5, bud: false },
  { x: 1110, height: 48, scale: 0.82, bend: -6, tilt: 12, bud: false },
  { x: 1176, height: 36, scale: 0.68, bend: 5, tilt: -9, bud: false }
]

const dismissedIds = ref(new Set())
const dismissed = computed(() => greeting.value && dismissedIds.value.has(greeting.value.id))

function readDismissal(id) {
  try {
    return window.localStorage.getItem(dismissalKey(id)) === '1'
  } catch {
    return false
  }
}

function dismiss() {
  const id = greeting.value?.id
  if (!id) return
  // Per occasion, so closing the new year greeting does not also silence Meskel.
  try {
    window.localStorage.setItem(dismissalKey(id), '1')
  } catch {
    /* private mode — it simply reappears next visit, which is the harmless failure */
  }
  dismissedIds.value = new Set([...dismissedIds.value, id])
}

onMounted(() => {
  if (greeting.value && readDismissal(greeting.value.id)) {
    dismissedIds.value = new Set([greeting.value.id])
  }
  timer = setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
/* Warm ivory rather than the site's violet: a greeting should read as a greeting, not as
   another piece of interface. The Meskel variant shifts to ember without changing layout. */
.seasonal {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(180, 83, 9, 0.2);
}
.seasonal--adey { background: linear-gradient(180deg, #fffdf5 0%, #fef3c7 100%); }
.seasonal--demera { background: linear-gradient(180deg, #fff7ed 0%, #fed7aa 100%); }

.seasonal__meadow {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 3.4rem;
  pointer-events: none;
}
.seasonal__meadow-svg { display: block; width: 100%; height: 100%; }
.seasonal__meadow-svg > g { transform-box: fill-box; transform-origin: bottom center; }
.seasonal__meadow-svg > g:nth-child(odd) { animation: seasonal-sway 8s ease-in-out infinite; }
.seasonal__meadow-svg > g:nth-child(even) { animation: seasonal-sway 9.5s ease-in-out infinite -4s; }

.seasonal__inner {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.9rem 3rem 3.1rem;
  text-align: center;
}

.seasonal__text { margin: 0; display: flex; flex-direction: column; align-items: center; line-height: 1.2; }
.seasonal__title {
  font-size: clamp(1.35rem, 3.4vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #14532d;
}
.seasonal--demera .seasonal__title { color: #7c2d12; }
.seasonal__subtitle {
  margin-top: 0.25rem;
  font-size: clamp(0.78rem, 1.6vw, 0.95rem);
  font-weight: 500;
  color: #78350f;
}

.seasonal__dismiss {
  position: absolute;
  inset-inline-end: 0.5rem;
  top: 0.5rem;
  display: inline-flex;
  padding: 0.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: rgba(120, 53, 15, 0.6);
  cursor: pointer;
}
.seasonal__dismiss svg { width: 1.05rem; height: 1.05rem; }
.seasonal__dismiss:hover { color: #7c2d12; background: rgba(180, 83, 9, 0.12); }
.seasonal__dismiss:focus-visible { outline: 2px solid #b45309; outline-offset: 2px; }

@keyframes seasonal-sway {
  0%, 100% { transform: rotate(-1.6deg); }
  50% { transform: rotate(1.6deg); }
}
@media (prefers-reduced-motion: reduce) {
  .seasonal__meadow-svg > g { animation: none !important; }
}

@media (max-width: 640px) {
  .seasonal__meadow { height: 2.5rem; }
  .seasonal__inner { padding: 0.7rem 2.5rem 2.3rem; }
}
</style>

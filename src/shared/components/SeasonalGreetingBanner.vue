<template>
  <!-- A fixed overlay, not a bar in the layout: it floats over the page from the bottom edge
       the way Google's Enkutatash decoration does, so nothing is pushed down, it stays put
       while the page scrolls, and no page has to make room for it. pointer-events are off for
       the whole layer except the dismiss button, so content underneath stays clickable. -->
  <div
    v-if="greeting && !dismissed"
    class="seasonal"
    :class="`seasonal--${greeting.symbol}`"
    role="region"
    :aria-label="$t(greeting.titleKey)"
  >
    <!-- The words sit on a translucent chip. The layer itself is transparent, but the greeting
         has to stay readable over whatever happens to be scrolled underneath it — a white
         listing page or the dark violet footer. -->
    <div class="seasonal__chip">
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

    <!-- A band of Adey Abeba growing up out of the bottom edge, the way the flower actually
         appears at Meskerem: heads on stems, some still in bud, a paler row set back behind
         the front one for depth. Drawn rather than loaded — sharp at any width, no request.

         Each stalk is two nested groups on purpose: the outer one carries the `translate`
         that puts it in place, the inner one carries the sway. A CSS `transform` on an SVG
         element replaces its `transform` attribute outright, so animating the outer group
         would throw every stalk back to the origin. -->
    <div class="seasonal__meadow" aria-hidden="true">
      <svg viewBox="0 0 1200 130" preserveAspectRatio="xMidYMax slice" class="seasonal__meadow-svg">
        <g class="seasonal__row seasonal__row--back">
          <g v-for="(stalk, i) in backRow" :key="`b${i}`" :transform="`translate(${stalk.x} 130)`">
            <g class="seasonal__stalk" :style="swayStyle(i, 11)">
              <component :is="Stalk" v-bind="stalk" />
            </g>
          </g>
        </g>
        <g class="seasonal__row">
          <g v-for="(stalk, i) in frontRow" :key="`f${i}`" :transform="`translate(${stalk.x} 130)`">
            <g class="seasonal__stalk" :style="swayStyle(i, 8)">
              <component :is="Stalk" v-bind="stalk" />
            </g>
          </g>
        </g>
        <!-- Demera is a bonfire, so on its eve the band is one: a cone of wood lit at dusk,
             with the meadow still standing around it. Only that one evening — Meskel the next
             day keeps the ember colouring but the fire has burnt down.

             Drawn last so it stands in front of the flowers, and placed at 632 rather than at
             the middle of the strip: that is the gap between two stalks, so the flame is not
             hidden behind a flower head. It has to stay near the middle, though — `slice`
             crops to about the central third on a phone, and a fire out at the edge would
             simply not be there. -->
        <g v-if="greeting.symbol === 'demera'" class="seasonal__fires">
          <defs>
            <radialGradient id="seasonalEmberGlow">
              <stop offset="0%" stop-color="#FDBA74" stop-opacity="0.75" />
              <stop offset="60%" stop-color="#F97316" stop-opacity="0.22" />
              <stop offset="100%" stop-color="#F97316" stop-opacity="0" />
            </radialGradient>
          </defs>
          <g transform="translate(632 130) scale(0.95)">
            <ellipse cx="0" cy="-58" rx="132" ry="86" fill="url(#seasonalEmberGlow)" />
            <g stroke="#78350F" stroke-width="5" stroke-linecap="round">
              <path d="M-32 0 L 4 -52" />
              <path d="M32 0 L -4 -52" />
              <path d="M-17 0 L 9 -44" />
              <path d="M17 0 L -9 -44" />
            </g>
            <path d="M-24 -16 L 24 -16" stroke="#92400E" stroke-width="4" stroke-linecap="round" />
            <g class="seasonal__flame">
              <path
                d="M0 -40 C -18 -50 -20 -70 -8 -84 C -9 -74 -4 -70 0 -74 C -3 -86 6 -96 4 -108 C 16 -95 21 -78 16 -64 C 12 -53 7 -47 0 -40 Z"
                fill="#F97316"
              />
              <path
                d="M0 -44 C -10 -52 -11 -64 -4 -74 C -5 -67 -2 -65 0 -67 C -1 -76 4 -83 3 -91 C 10 -82 13 -70 9 -61 C 7 -53 4 -48 0 -44 Z"
                fill="#FBBF24"
              />
              <path d="M0 -48 C -5 -54 -5 -62 0 -70 C 5 -62 5 -54 0 -48 Z" fill="#FEF3C7" />
            </g>
            <circle v-for="spark in sparks" :key="spark.i" class="seasonal__spark"
              :cx="spark.cx" :cy="spark.cy" :r="spark.r" :style="spark.style" fill="#FDBA74" />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import { activeGreeting, dismissalKey } from '@/shared/seasonalGreetings'

// Re-read the clock rather than deciding once at mount: a tab left open overnight would
// otherwise still be wishing people a happy new year two days later.
const now = ref(new Date())
let timer

const greeting = computed(() => activeGreeting(now.value))

/**
 * One stalk: a curved stem with a leaf, topped by an open flower or a bud.
 *
 * A render function rather than a second .vue file — it is only ever used by the strip below,
 * and inlining it keeps the whole decoration readable in one place.
 */
function Stalk({ height, scale, bend, tilt, bud }) {
  const stem = h('path', {
    d: `M0 0 C ${bend} -${height * 0.45} ${-bend} -${height * 0.75} 0 -${height}`,
    fill: 'none',
    stroke: 'var(--seasonal-stem)',
    'stroke-width': scale * 3.4,
    'stroke-linecap': 'round'
  })
  const leaf = h('ellipse', {
    cx: bend * 1.5,
    cy: -height * 0.5,
    rx: scale * 7,
    ry: scale * 3.2,
    transform: `rotate(${bend > 0 ? 24 : -24} ${bend * 1.5} ${-height * 0.5})`,
    fill: 'var(--seasonal-leaf)'
  })
  const head = bud
    ? [
        h('ellipse', { rx: 6, ry: 8, fill: 'var(--seasonal-petal)' }),
        h('path', { d: 'M-6 0 A6 8 0 0 1 6 0 Z', fill: 'var(--seasonal-center)', opacity: 0.55 }),
        h('path', { d: 'M0 -8 V8', stroke: 'var(--seasonal-center)', 'stroke-width': 1.4, opacity: 0.5 })
      ]
    : [
        ...Array.from({ length: 9 }, (_, n) =>
          h('g', { key: n, transform: `rotate(${n * 40})` }, [
            h('path', { d: 'M0 -5 C -6.5 -9 -7.5 -17.5 0 -22 C 7.5 -17.5 6.5 -9 0 -5 Z', fill: 'var(--seasonal-petal)' }),
            h('path', { d: 'M0 -6 C -3.5 -9 -4 -15 0 -19 C 4 -15 3.5 -9 0 -6 Z', fill: 'var(--seasonal-petal-light)', opacity: 0.75 })
          ])
        ),
        h('circle', { r: 6.4, fill: 'var(--seasonal-center)' }),
        h('circle', { r: 3.1, fill: 'var(--seasonal-center-light)' })
      ]
  return h('g', [
    stem,
    leaf,
    h('g', { transform: `translate(0 -${height}) scale(${scale}) rotate(${tilt})` }, head)
  ])
}

/**
 * Where each stalk stands along a 1200-wide strip, anchored to the bottom edge.
 *
 * Hand-placed rather than evenly spaced or randomised: a meadow reads as a meadow when the
 * heights and lean vary and the gaps are uneven. Buds among the open heads are how the flower
 * actually looks in Meskerem, and they give the eye somewhere to rest between blooms.
 */
const frontRow = [
  { x: 18, height: 68, scale: 1.05, bend: 6, tilt: -12, bud: false },
  { x: 72, height: 40, scale: 0.73, bend: -5, tilt: 10, bud: true },
  { x: 118, height: 87, scale: 1.22, bend: 7, tilt: 5, bud: false },
  { x: 186, height: 57, scale: 0.93, bend: -6, tilt: -15, bud: false },
  { x: 246, height: 78, scale: 1.15, bend: 5, tilt: 8, bud: false },
  { x: 306, height: 35, scale: 0.68, bend: -4, tilt: -6, bud: true },
  { x: 356, height: 94, scale: 1.29, bend: 8, tilt: -7, bud: false },
  { x: 428, height: 61, scale: 0.98, bend: -6, tilt: 13, bud: false },
  { x: 488, height: 80, scale: 1.17, bend: 6, tilt: -4, bud: false },
  { x: 544, height: 38, scale: 0.71, bend: -4, tilt: 9, bud: true },
  { x: 594, height: 90, scale: 1.24, bend: 7, tilt: 6, bud: false },
  { x: 664, height: 59, scale: 0.95, bend: -5, tilt: -11, bud: false },
  { x: 722, height: 76, scale: 1.12, bend: 6, tilt: 4, bud: false },
  { x: 778, height: 40, scale: 0.73, bend: -4, tilt: -8, bud: true },
  { x: 828, height: 92, scale: 1.27, bend: 7, tilt: -5, bud: false },
  { x: 898, height: 64, scale: 1.0, bend: -6, tilt: 12, bud: false },
  { x: 956, height: 83, scale: 1.2, bend: 6, tilt: -3, bud: false },
  { x: 1014, height: 42, scale: 0.76, bend: -5, tilt: 7, bud: true },
  { x: 1064, height: 87, scale: 1.22, bend: 7, tilt: -9, bud: false },
  { x: 1132, height: 54, scale: 0.9, bend: -5, tilt: 11, bud: false },
  { x: 1184, height: 73, scale: 1.07, bend: 6, tilt: -6, bud: false }
]

/** A shorter, paler row set behind the front one, so the band has depth instead of a flat line. */
const backRow = [
  { x: 46, height: 47, scale: 0.61, bend: -4, tilt: 8, bud: false },
  { x: 152, height: 54, scale: 0.68, bend: 5, tilt: -6, bud: false },
  { x: 214, height: 38, scale: 0.54, bend: -3, tilt: 12, bud: true },
  { x: 278, height: 59, scale: 0.71, bend: 4, tilt: -9, bud: false },
  { x: 392, height: 45, scale: 0.61, bend: -4, tilt: 6, bud: false },
  { x: 460, height: 52, scale: 0.66, bend: 5, tilt: -11, bud: false },
  { x: 518, height: 35, scale: 0.51, bend: -3, tilt: 9, bud: true },
  { x: 630, height: 57, scale: 0.68, bend: 4, tilt: -5, bud: false },
  { x: 692, height: 42, scale: 0.59, bend: -4, tilt: 10, bud: false },
  { x: 750, height: 52, scale: 0.66, bend: 5, tilt: -8, bud: false },
  { x: 866, height: 47, scale: 0.61, bend: -4, tilt: 7, bud: false },
  { x: 926, height: 54, scale: 0.68, bend: 4, tilt: -10, bud: false },
  { x: 988, height: 35, scale: 0.51, bend: -3, tilt: 5, bud: true },
  { x: 1096, height: 57, scale: 0.71, bend: 5, tilt: -7, bud: false },
  { x: 1158, height: 45, scale: 0.61, bend: -4, tilt: 9, bud: false }
]

/** Embers lifting off the fire. Positioned by attribute, animated by transform — see above. */
const sparks = Array.from({ length: 6 }, (_, i) => ({
  i,
  cx: [-14, 9, -5, 16, -19, 4][i],
  cy: -70 - (i % 3) * 12,
  r: 1.6 + (i % 3) * 0.5,
  style: { animationDelay: `-${i * 0.9}s`, animationDuration: `${3.2 + (i % 4) * 0.6}s` }
}))

/** Stagger the sway so the band breathes unevenly instead of rocking in unison. */
function swayStyle(i, base) {
  return {
    animationDuration: `${base + (i % 5) * 0.7}s`,
    animationDelay: `-${(i % 7) * 1.3}s`
  }
}

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
/* The layer itself paints nothing. It is a transparent sheet pinned to the bottom edge of the
   viewport — fixed, so it stays there while the page scrolls, like the support chat button —
   above the page but below the cookie bar and that chat button (both z-60), so those stay
   reachable while the greeting is up. pointer-events are off for the whole sheet; only the
   dismiss button takes clicks back. */
.seasonal {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 55;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  pointer-events: none;

  --seasonal-stem: #4d7c0f;
  --seasonal-leaf: #65a30d;
  --seasonal-petal: #f7b32b;
  --seasonal-petal-light: #fcd34d;
  --seasonal-center: #ea580c;
  --seasonal-center-light: #fb923c;
}
/* Demera and Meskel keep the same flower — it is the same flower — but take the ember end
   of it. Only Demera adds the bonfire on top. */
.seasonal--demera,
.seasonal--meskel {
  --seasonal-stem: #3f6212;
  --seasonal-petal: #fb923c;
  --seasonal-petal-light: #fdba74;
  --seasonal-center: #b91c1c;
  --seasonal-center-light: #f87171;
}

/* The words need to stay readable over whatever is scrolled underneath — a white listing page
   or the dark violet footer — so they ride on a frosted chip rather than on the page itself.
   Translucent, not opaque: the content still shows through. */
.seasonal__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: min(92vw, 34rem);
  margin-bottom: -1.1rem;
  padding: 0.5rem 0.5rem 0.5rem 1.15rem;
  border-radius: 999px;
  border: 1px solid rgba(180, 83, 9, 0.22);
  background: rgba(255, 253, 245, 0.82);
  box-shadow: 0 6px 22px rgba(120, 53, 15, 0.16);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.seasonal--demera .seasonal__chip,
.seasonal--meskel .seasonal__chip {
  border-color: rgba(194, 65, 12, 0.24);
  background: rgba(255, 247, 237, 0.82);
}

.seasonal__text { margin: 0; display: flex; flex-direction: column; line-height: 1.2; text-align: center; }
.seasonal__title {
  font-size: clamp(1.05rem, 3.2vw, 1.4rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #14532d;
}
.seasonal--demera .seasonal__title,
.seasonal--meskel .seasonal__title { color: #7c2d12; }
.seasonal__subtitle {
  margin-top: 0.1rem;
  font-size: clamp(0.72rem, 1.5vw, 0.84rem);
  font-weight: 500;
  color: #78350f;
}

.seasonal__dismiss {
  flex: none;
  display: inline-flex;
  padding: 0.45rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(120, 53, 15, 0.65);
  cursor: pointer;
  /* The one part of the sheet that takes clicks. */
  pointer-events: auto;
}
.seasonal__dismiss svg { width: 1rem; height: 1rem; }
.seasonal__dismiss:hover { color: #7c2d12; background: rgba(180, 83, 9, 0.14); }
.seasonal__dismiss:focus-visible { outline: 2px solid #b45309; outline-offset: 2px; }

/* Flowers grow straight out of the bottom edge over the page, with nothing behind them. The
   strip is tall enough to clear the tallest stalk: `slice` scales to cover the width, so on a
   narrow screen it shows the middle of the band at full size rather than shrinking it. */
.seasonal__meadow { width: 100%; height: 10rem; }
.seasonal__meadow-svg {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 1px 2px rgba(120, 53, 15, 0.2));
}
.seasonal__row--back { opacity: 0.55; }
.seasonal__stalk {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation-name: seasonal-sway;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

/* The flame leans and breathes; the embers drift up off it and fade. Both animate a
   `transform`, so neither element may also carry a `transform` attribute. */
.seasonal__flame {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: seasonal-flicker 2.4s ease-in-out infinite;
}
.seasonal__spark {
  animation-name: seasonal-spark;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

@keyframes seasonal-flicker {
  0%, 100% { transform: scale(1, 1) rotate(-2deg); }
  35% { transform: scale(1.06, 0.94) rotate(2deg); }
  70% { transform: scale(0.95, 1.08) rotate(-1deg); }
}
@keyframes seasonal-spark {
  0% { transform: translateY(0); opacity: 0; }
  25% { opacity: 0.9; }
  100% { transform: translateY(-46px); opacity: 0; }
}

@keyframes seasonal-sway {
  0%, 100% { transform: rotate(-1.8deg); }
  50% { transform: rotate(1.8deg); }
}
@media (prefers-reduced-motion: reduce) {
  .seasonal__stalk,
  .seasonal__flame,
  .seasonal__spark { animation: none !important; }
  /* A still fire should still look lit rather than leave stray embers hanging over it. */
  .seasonal__spark { display: none; }
}

@media (max-width: 640px) {
  /* Keep the chip clear of the corner chat button rather than letting it run under it. */
  .seasonal__chip { max-width: calc(100vw - 6.5rem); padding-left: 0.9rem; }
  .seasonal__meadow { height: 9rem; }
}
</style>

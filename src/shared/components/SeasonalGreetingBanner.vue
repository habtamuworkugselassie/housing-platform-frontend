<template>
  <section
    v-if="greeting && !dismissed"
    class="seasonal"
    :class="`seasonal--${greeting.symbol}`"
    role="region"
    :aria-label="$t(greeting.titleKey)"
  >
    <div class="seasonal__inner">
      <!-- Adey Abeba, the yellow daisy that covers the highlands at Meskerem and is the
           image of the new year. Drawn rather than loaded: it stays sharp at any size,
           costs no request, and recolours with the banner. -->
      <span v-if="greeting.symbol === 'adey'" class="seasonal__ornament" aria-hidden="true">
        <svg viewBox="0 0 48 48" class="seasonal__flower">
          <g transform="translate(24 24)">
            <g v-for="n in 8" :key="n" :transform="`rotate(${(n - 1) * 45})`">
              <path
                d="M0 0 C-4 -8 -4 -15 0 -20 C4 -15 4 -8 0 0 Z"
                fill="currentColor"
                opacity="0.95"
              />
            </g>
            <circle r="6.5" fill="#B45309" />
            <circle r="3.4" fill="#F59E0B" />
          </g>
        </svg>
      </span>

      <!-- Demera: the bonfire lit on Meskel eve, topped with a cross. -->
      <span v-else class="seasonal__ornament" aria-hidden="true">
        <svg viewBox="0 0 48 48" class="seasonal__flower">
          <path d="M22 6h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="#FDE68A" />
          <path
            d="M24 44C12 38 13 27 21 21c0 5 3 7 5 4 5 5 9 13 5 17 4-1 6-5 6-9 3 5 3 9 1 12-2 3-7 4-14-1z"
            fill="currentColor"
          />
          <path d="M24 42c-6-3-6-9-2-13 0 3 2 4 3 2 3 3 5 8 3 10-1 1-2 2-4 1z" fill="#FEF3C7" />
        </svg>
      </span>

      <p class="seasonal__text">
        <span class="seasonal__title">{{ $t(greeting.titleKey) }}</span>
        <span class="seasonal__subtitle">{{ $t(greeting.subtitleKey) }}</span>
      </p>

      <span
        v-if="greeting.symbol === 'adey'"
        class="seasonal__ornament seasonal__ornament--trailing"
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 48" class="seasonal__flower">
          <g transform="translate(24 24)">
            <g v-for="n in 8" :key="n" :transform="`rotate(${(n - 1) * 45 + 22})`">
              <path d="M0 0 C-4 -8 -4 -15 0 -20 C4 -15 4 -8 0 0 Z" fill="currentColor" opacity="0.95" />
            </g>
            <circle r="6.5" fill="#B45309" />
            <circle r="3.4" fill="#F59E0B" />
          </g>
        </svg>
      </span>

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
.seasonal {
  --seasonal-ink: #fffbeb;
  position: relative;
  overflow: hidden;
  color: var(--seasonal-ink);
}
.seasonal--adey {
  background: linear-gradient(100deg, #064e3b 0%, #15803d 48%, #047857 100%);
}
.seasonal--demera {
  background: linear-gradient(100deg, #7c2d12 0%, #b45309 52%, #92400e 100%);
}

/* A faint band of light across the bar so it reads as celebratory rather than as an alert. */
.seasonal::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 180% at 50% -60%, rgba(253, 230, 138, 0.32), transparent 60%);
  pointer-events: none;
}

.seasonal__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.6rem 3rem 0.6rem 1rem;
}

.seasonal__ornament { display: inline-flex; flex: 0 0 auto; color: #FCD34D; }
.seasonal__flower { width: 2.1rem; height: 2.1rem; display: block; }
.seasonal--adey .seasonal__flower { animation: seasonal-sway 7s ease-in-out infinite; }
.seasonal__ornament--trailing .seasonal__flower { animation-delay: -3.5s; }

.seasonal__text { margin: 0; display: flex; flex-direction: column; align-items: center; line-height: 1.25; }
.seasonal__title {
  font-size: clamp(1.05rem, 2.6vw, 1.5rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #FDE68A;
}
.seasonal__subtitle {
  margin-top: 0.15rem;
  font-size: clamp(0.72rem, 1.5vw, 0.85rem);
  color: rgba(255, 251, 235, 0.88);
}

.seasonal__dismiss {
  position: absolute;
  inset-inline-end: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  padding: 0.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: rgba(255, 251, 235, 0.75);
  cursor: pointer;
}
.seasonal__dismiss svg { width: 1.05rem; height: 1.05rem; }
.seasonal__dismiss:hover { color: #fff; background: rgba(255, 255, 255, 0.14); }
.seasonal__dismiss:focus-visible { outline: 2px solid #FDE68A; outline-offset: 2px; }

@keyframes seasonal-sway {
  0%, 100% { transform: rotate(-7deg); }
  50% { transform: rotate(7deg); }
}
@media (prefers-reduced-motion: reduce) {
  .seasonal__flower { animation: none !important; }
}

/* One flower is plenty on a phone; the trailing one is decoration, not information. */
@media (max-width: 640px) {
  .seasonal__ornament--trailing { display: none; }
  .seasonal__inner { gap: 0.6rem; padding-inline: 0.75rem 2.5rem; }
  .seasonal__flower { width: 1.7rem; height: 1.7rem; }
}
</style>

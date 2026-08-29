<template>
  <Transition name="splash-fade">
    <div
      v-if="visible"
      class="splash-screen fixed inset-0 z-[9999] flex min-h-[100dvh] flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-8"
      aria-label="Splash screen"
      aria-modal="true"
      role="dialog"
    >
      <!-- Content: event logo (full lockup) + sr-only title + sponsor logo and name -->
      <div class="splash-screen__content flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <div
          class="splash-screen__brand max-w-[min(100%,360px)] w-full"
        >
          <!-- Transparent wordmark (not the boxed banner PNG) so the logo sits
               on the splash panel instead of showing a clashing gradient box. -->
          <img
            src="/images/branding/ethio-build-connect-wordmark.png"
            alt="Ethio Build Connect"
            width="360"
            class="mx-auto w-full max-w-[280px] h-auto object-contain select-none sm:max-w-[340px]"
            draggable="false"
          />
        </div>
        <h1 class="sr-only">{{ appTitle }}</h1>

        <!-- Exclusive sponsors: all orgs displayed horizontally -->
        <div
          v-if="exclusiveOrgs.length > 0"
          class="mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4"
        >
          <div
            v-for="org in exclusiveOrgs"
            :key="org.id || org.name"
            class="splash-screen__sponsor flex min-w-0 items-center gap-3 text-left"
          >
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 sm:h-14 sm:w-14"
            >
              <img
                v-if="org.logoUrl"
                :src="mediaUrl(org.logoUrl)"
                :alt="org.name"
                class="h-full w-full object-contain"
              />
              <span
                v-else
                class="text-lg font-bold text-white sm:text-xl"
              >
                {{ (org.name || '').charAt(0).toUpperCase() }}
              </span>
            </div>
            <p class="min-w-0 text-sm font-medium leading-snug text-white/90 sm:text-base">
              {{ org.name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Enter button at bottom -->
      <div class="flex justify-center pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-8">
        <button
          type="button"
          class="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-lg bg-[#e8b95d] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-[#102435] shadow-lg shadow-black/20 transition-colors hover:bg-[#f4c977] focus:outline-none focus:ring-2 focus:ring-[#f4c977] focus:ring-offset-2 focus:ring-offset-[#102435] disabled:opacity-50 disabled:bg-white/50"
          :disabled="dismissing"
          @click="dismiss"
        >
          {{ $t('splash.enter') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { mediaUrl } from '@/shared/api/client'
import { getExclusiveOrganizations } from '@/features/exhibition/api/exhibition.api'

const props = defineProps({
  /** App title shown on splash */
  appTitle: { type: String, default: 'Ethio Build Connect' },
  /** Auto-dismiss after this many ms (0 = disabled) */
  autoDismissMs: { type: Number, default: 5000 }
})

const emit = defineEmits(['dismiss'])

const visible = ref(true)
const dismissing = ref(false)
const exclusiveOrgs = ref([])
let autoTimer = null

// All exclusive orgs are displayed directly via exclusiveOrgs ref

function dismiss() {
  if (dismissing.value) return
  dismissing.value = true
  if (autoTimer) {
    clearTimeout(autoTimer)
    autoTimer = null
  }
  visible.value = false
  setTimeout(() => emit('dismiss'), 300)
}

onMounted(async () => {
  try {
    const list = await getExclusiveOrganizations()
    exclusiveOrgs.value = list || []
  } catch (err) {
    console.error('Failed to load exclusive organizations for splash:', err)
  }
  if (props.autoDismissMs > 0) {
    autoTimer = setTimeout(dismiss, props.autoDismissMs)
  }
})

onUnmounted(() => {
  if (autoTimer) clearTimeout(autoTimer)
})
</script>

<style scoped>
.splash-fade-enter-active {
  transition: opacity 0.3s ease;
}
/* Leave: zoom in slightly while fading, so dismissing the splash reads as
   diving into the site behind it and hands off to the page's entrance. */
.splash-fade-leave-active {
  transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}
.splash-fade-enter-from {
  opacity: 0;
}
.splash-fade-leave-to {
  opacity: 0;
  transform: scale(1.08);
}

@media (prefers-reduced-motion: reduce) {
  .splash-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .splash-fade-leave-to {
    transform: none;
  }
}

.splash-screen {
  background: linear-gradient(135deg, rgba(76, 29, 149, .28), rgba(59, 7, 100, .12));
  backdrop-filter: blur(3px);
}

.splash-screen__content {
  padding: clamp(1.5rem, 5vw, 3rem);
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 1.5rem;
  background: rgba(59, 7, 100, .8);
  box-shadow: 0 1.5rem 5rem rgba(46, 16, 101, .3);
  backdrop-filter: blur(18px);
}

.splash-screen__brand {
  padding: .75rem;
}

.splash-screen__sponsor {
  padding: .75rem;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: .85rem;
  background: rgba(255, 255, 255, .07);
}

@media (max-width: 639px) {
  .splash-screen { justify-content: center; }
  .splash-screen__content { padding: 1.25rem; }
  .splash-screen__brand { padding: .25rem; }
}
</style>

<template>
  <Transition name="splash-fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] flex flex-col bg-violet-950"
      aria-label="Splash screen"
    >
      <!-- Content: event logo (full lockup) + sr-only title + sponsor logo and name -->
      <div class="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div
          class="rounded-2xl max-w-[min(100%,520px)] w-full"
        >
          <img
            src="/images/branding/ethio-build-connect-banner.png"
            alt="Ethio Build Connect banner"
            width="520"
            class="mx-auto w-full h-auto object-contain select-none"
            draggable="false"
          />
        </div>
        <h1 class="sr-only">{{ appTitle }}</h1>

        <!-- Exclusive sponsors: all orgs displayed horizontally -->
        <div
          v-if="exclusiveOrgs.length > 0"
          class="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8"
        >
          <div
            v-for="org in exclusiveOrgs"
            :key="org.id || org.name"
            class="flex flex-row items-center gap-3 sm:gap-4"
          >
            <div
              class="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white/10 border border-white/20"
            >
              <img
                v-if="org.logoUrl"
                :src="mediaUrl(org.logoUrl)"
                :alt="org.name"
                class="h-full w-full object-contain"
              />
              <span
                v-else
                class="text-xl sm:text-2xl font-bold text-white"
              >
                {{ (org.name || '').charAt(0).toUpperCase() }}
              </span>
            </div>
            <p class="text-base sm:text-lg text-white/90 font-medium">
              {{ org.name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Enter button at bottom -->
      <div class="pb-8 sm:pb-10 flex justify-center">
        <button
          type="button"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider rounded-lg hover:bg-violet-950 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:bg-white/50"
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
.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.3s ease;
}
.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}
</style>

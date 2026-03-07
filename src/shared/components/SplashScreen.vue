<template>
  <Transition name="splash-fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] flex flex-col bg-black"
      aria-label="Splash screen"
    >
      <!-- Content: app title + sponsor logo and name (no background media) -->
      <div class="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
          {{ appTitle }}
        </h1>

        <!-- Exclusive sponsor: logo and name horizontal (no carousel) -->
        <div
          v-if="currentOrg"
          class="mt-8 sm:mt-10 flex flex-row items-center justify-center gap-4 sm:gap-5"
        >
          <div
            class="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white/10 border border-white/20"
          >
            <img
              v-if="currentOrg.logoUrl"
              :src="mediaUrl(currentOrg.logoUrl)"
              :alt="currentOrg.name"
              class="h-full w-full object-contain"
            />
            <span
              v-else
              class="text-xl sm:text-2xl font-bold text-white"
            >
              {{ (currentOrg.name || '').charAt(0).toUpperCase() }}
            </span>
          </div>
          <p class="text-base sm:text-lg text-white/90 font-medium">
            {{ currentOrg.name }}
          </p>
        </div>
      </div>

      <!-- Enter button at bottom -->
      <div class="pb-8 sm:pb-10 flex justify-center">
        <button
          type="button"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:bg-white/50"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { mediaUrl } from '@/shared/api/client'
import { getExclusiveOrganizations } from '@/features/exhibition/api/exhibition.api'

const props = defineProps({
  /** App title shown on splash */
  appTitle: { type: String, default: 'Housing Platform' },
  /** Auto-dismiss after this many ms (0 = disabled) */
  autoDismissMs: { type: Number, default: 5000 }
})

const emit = defineEmits(['dismiss'])

const visible = ref(true)
const dismissing = ref(false)
const exclusiveOrgs = ref([])
let autoTimer = null

const currentOrg = computed(() => {
  const list = exclusiveOrgs.value
  if (!list.length) return null
  return list[0]
})

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

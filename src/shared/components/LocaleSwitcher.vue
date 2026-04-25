<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-200"
      :class="open ? 'text-black bg-violet-950/10 border-black/50' : 'text-gray-300 border-white/20 hover:text-black hover:bg-violet-950/10 hover:border-black/40'"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="$t('nav.language')"
      @click.stop="toggleOpen"
    >
      <svg class="w-4 h-4 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
      <span class="hidden sm:inline tabular-nums">{{ current.flag }} {{ current.shortLabel }}</span>
      <span class="sm:hidden tabular-nums">{{ current.shortLabel }}</span>
      <svg class="w-3.5 h-3.5 shrink-0 opacity-70 hidden sm:block transition-transform duration-200" :class="{ 'rotate-180': open }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-[0.98]"
    >
      <div
        v-show="open"
        class="absolute end-0 top-full pt-2 min-w-[min(100vw-2rem,280px)] z-[60] origin-top"
      >
        <div
          class="rounded-xl border border-white/10 bg-zinc-900/98 backdrop-blur-md shadow-xl shadow-black/40 py-2 overflow-hidden"
          role="listbox"
          :aria-label="$t('nav.selectLanguage')"
        >
          <div class="px-3 pb-2 pt-1 border-b border-white/10">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{{ $t('nav.selectLanguage') }}</p>
          </div>
          <ul class="py-1 max-h-[min(70vh,320px)] overflow-y-auto">
            <li v-for="opt in LOCALE_OPTIONS" :key="opt.code">
              <button
                type="button"
                role="option"
                :aria-selected="localeStore.currentLocale === opt.code"
                class="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors duration-150 border-l-2"
                :class="localeStore.currentLocale === opt.code
                  ? 'bg-violet-950/15 text-black border-black'
                  : 'text-gray-300 border-transparent hover:bg-violet-950/15 hover:text-black hover:border-black/60'"
                @click="select(opt.code)"
              >
                <span class="text-lg leading-none shrink-0 w-7 text-center" aria-hidden="true">{{ opt.flag }}</span>
                <span class="flex-1 min-w-0">
                  <span class="block font-medium leading-tight">{{ opt.labelNative }}</span>
                  <span class="block text-xs text-gray-500 mt-0.5">{{ opt.labelEn }}</span>
                </span>
                <span v-if="localeStore.currentLocale === opt.code" class="shrink-0 text-black" aria-hidden="true">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import { LOCALE_OPTIONS, getLocaleOption } from '@/i18n/localeConfig'

const localeStore = useLocaleStore()
const open = ref(false)
const rootEl = ref(null)

const current = computed(() => getLocaleOption(localeStore.currentLocale))

const toggleOpen = () => {
  open.value = !open.value
}

const select = (code) => {
  localeStore.setLocale(code)
  open.value = false
}

const onDocPointerDown = (e) => {
  if (!open.value || !rootEl.value) return
  if (!rootEl.value.contains(e.target)) open.value = false
}

const onEscape = (e) => {
  if (e.key === 'Escape') open.value = false
}

watch(open, (v) => {
  if (v) {
    document.addEventListener('pointerdown', onDocPointerDown, true)
    document.addEventListener('keydown', onEscape)
  } else {
    document.removeEventListener('pointerdown', onDocPointerDown, true)
    document.removeEventListener('keydown', onEscape)
  }
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  document.removeEventListener('keydown', onEscape)
})
</script>

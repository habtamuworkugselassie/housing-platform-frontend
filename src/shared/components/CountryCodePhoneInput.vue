<template>
  <div class="flex gap-2">
    <div class="relative flex-shrink-0 min-w-[7rem]" ref="dropdownRef">
      <button
        type="button"
        class="w-full flex items-center gap-2 border border-white/20 bg-white/5 text-white rounded-md py-2 pl-2 pr-8 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-left cursor-pointer hover:border-white/30 transition-colors"
        :class="{ 'ring-2 ring-yellow-400 border-yellow-400': isOpen }"
        @click="isOpen = !isOpen"
      >
        <span class="flex-shrink-0">{{ flag(selectedOption?.iso2) }}</span>
        <span class="truncate">{{ selectedOption?.code ?? countryCode }}</span>
        <span class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </span>
      </button>

      <!-- Backdrop (close on click outside) -->
      <div
        v-if="isOpen"
        class="fixed inset-0 z-10"
        aria-hidden="true"
        @click="isOpen = false"
      />

      <!-- Dropdown panel -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="absolute left-0 top-full mt-1 z-20 w-72 max-h-64 flex flex-col rounded-lg border border-white/20 shadow-xl overflow-hidden country-code-dropdown"
        >
          <div class="p-2 border-b border-white/10 sticky top-0 country-code-dropdown-header">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search country or code..."
              class="w-full px-3 py-2 border border-white/20 text-white placeholder-gray-400 rounded-md text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none country-code-search-input"
              @keydown.escape="isOpen = false"
              @keydown.stop
            />
          </div>
          <ul class="overflow-y-auto py-1 flex-1 min-h-0 country-code-dropdown-list" role="listbox">
            <li
              v-for="opt in filteredOptions"
              :key="opt.code"
              role="option"
              :aria-selected="opt.code === countryCode"
              class="flex items-center gap-2 px-3 py-2 cursor-pointer text-white text-sm border-l-2 border-transparent transition-colors country-code-option"
              :class="{ 'bg-yellow-500/10 border-yellow-400': opt.code === countryCode }"
              @click="choose(opt)"
            >
              <span class="flex-shrink-0 text-lg leading-none">{{ flag(opt.iso2) }}</span>
              <span class="flex-1 truncate">{{ opt.label }}</span>
            </li>
            <li v-if="filteredOptions.length === 0" class="px-3 py-4 text-center text-gray-400 text-sm country-code-option">
              No countries match "{{ searchQuery }}"
            </li>
          </ul>
        </div>
      </transition>
    </div>
    <input
      :value="number"
      type="tel"
      :placeholder="placeholder"
      class="flex-1 min-w-0 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
      @input="$emit('update:number', $event.target.value)"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { COUNTRY_CODES, iso2ToFlag } from '@/shared/data/countryCodes'

const props = defineProps({
  countryCode: { type: String, default: '+251' },
  number: { type: String, default: '' },
  placeholder: { type: String, default: 'Phone number' }
})

const emit = defineEmits(['update:countryCode', 'update:number'])

const dropdownRef = ref(null)
const searchInputRef = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')

const selectedOption = computed(() =>
  COUNTRY_CODES.find((o) => o.code === props.countryCode)
)

const filteredOptions = computed(() => {
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return COUNTRY_CODES
  return COUNTRY_CODES.filter(
    (opt) =>
      opt.code.toLowerCase().includes(q) ||
      opt.label.toLowerCase().includes(q) ||
      (opt.iso2 && opt.iso2.toLowerCase().includes(q))
  )
})

function flag(iso2) {
  return iso2ToFlag(iso2 || '')
}

function choose(opt) {
  searchQuery.value = ''
  isOpen.value = false
  if (opt.code !== props.countryCode) {
    emit('update:countryCode', opt.code)
  }
}

watch(isOpen, (open) => {
  if (open) {
    searchQuery.value = ''
    // Focus search input when dropdown opens
    setTimeout(() => searchInputRef.value?.focus(), 50)
  }
})
</script>

<style scoped>
/* Force dark background in all browsers (some render white by default) */
.country-code-dropdown,
.country-code-dropdown-header,
.country-code-dropdown-list,
.country-code-option {
  background-color: #000;
}
.country-code-search-input {
  background-color: rgba(255, 255, 255, 0.05);
}
.country-code-option:hover {
  background-color: rgba(234, 179, 8, 0.2);
}
.country-code-option.bg-yellow-500\/10 {
  background-color: rgba(234, 179, 8, 0.1);
}
</style>

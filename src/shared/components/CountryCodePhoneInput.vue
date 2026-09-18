<template>
  <div class="flex gap-2" :class="{ 'ccpi-light': light }">
    <div class="relative flex-shrink-0 min-w-[7rem]" ref="dropdownRef">
      <button
        type="button"
        class="w-full flex items-center gap-2 border rounded-md py-2 pl-2 pr-8 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none text-left cursor-pointer transition-colors"
        :class="[
          light
            ? 'rounded-xl border-gray-300 bg-white py-3 text-gray-900 shadow-sm hover:border-gray-400 disabled:bg-gray-100'
            : 'border-white/20 bg-white/5 hover:border-white/30',
          { 'ring-2 ring-white/15 border-white/15': isOpen && !light, 'ring-2 ring-primary-400': isOpen && light },
          invalid && light ? 'border-red-400' : ''
        ]"
        :disabled="disabled"
        :aria-label="buttonLabel"
        aria-haspopup="listbox"
        :aria-expanded="isOpen ? 'true' : 'false'"
        data-testid="country-code-button"
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
        class="fixed inset-0 z-[10000]"
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
          class="absolute left-0 top-full mt-1 z-[10001] w-72 max-h-64 flex flex-col rounded-lg border shadow-xl overflow-hidden country-code-dropdown"
          :class="light ? 'border-gray-200' : 'border-white/20'"
        >
          <div class="p-2 border-b sticky top-0 country-code-dropdown-header" :class="light ? 'border-gray-100' : 'border-white/10'">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              :aria-label="searchPlaceholder"
              class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none country-code-search-input"
              :class="light ? 'border-gray-300 text-gray-900 placeholder-gray-400' : 'border-white/20 text-white placeholder-gray-400'"
              @keydown.escape="isOpen = false"
              @keydown.stop
            />
          </div>
          <ul class="overflow-y-auto py-1 flex-1 min-h-0 country-code-dropdown-list" role="listbox">
            <li
              v-for="opt in filteredOptions"
              :key="opt.code + opt.iso2"
              role="option"
              :aria-selected="opt.code === countryCode"
              class="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm border-l-2 border-transparent transition-colors country-code-option"
              :class="[
                light ? 'text-gray-900' : 'text-white',
                { 'bg-violet-950/10 border-white/15': opt.code === countryCode && !light, 'ccpi-selected': opt.code === countryCode && light }
              ]"
              :data-country-code="opt.code"
              @click="choose(opt)"
            >
              <span class="flex-shrink-0 text-lg leading-none">{{ flag(opt.iso2) }}</span>
              <span class="flex-1 truncate">{{ opt.label }}</span>
            </li>
            <li v-if="filteredOptions.length === 0" class="px-3 py-4 text-center text-gray-400 text-sm country-code-option">
              {{ noMatchLabel.replace('{query}', searchQuery) }}
            </li>
          </ul>
        </div>
      </transition>
    </div>
    <input
      :id="id || undefined"
      :value="number"
      type="tel"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="invalid ? 'true' : 'false'"
      :aria-describedby="describedby || undefined"
      class="flex-1 min-w-0 border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
      :class="[
        light
          ? 'rounded-xl bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none disabled:bg-gray-100'
          : 'border-white/20 bg-white/5 text-white placeholder-gray-400',
        light ? (invalid ? 'border-red-400' : 'border-gray-300') : ''
      ]"
      @input="$emit('update:number', $event.target.value)"
      @blur="$emit('blur', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { COUNTRY_CODES, iso2ToFlag } from '@/shared/data/countryCodes'

const props = defineProps({
  countryCode: { type: String, default: '+251' },
  number: { type: String, default: '' },
  placeholder: { type: String, default: 'Phone number' },
  /**
   * 'dark' (default) matches the auth/admin pages; 'light' matches white-card forms such as the
   * purchase wizard. Existing callers are unaffected.
   */
  variant: { type: String, default: 'dark' },
  /** id for the national-number input so a <label for> and tests can target it. */
  id: { type: String, default: '' },
  inputmode: { type: String, default: 'tel' },
  autocomplete: { type: String, default: 'tel-national' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  describedby: { type: String, default: '' },
  buttonLabel: { type: String, default: 'Country code' },
  searchPlaceholder: { type: String, default: 'Search country or code...' },
  /** `{query}` is replaced with what was typed. */
  noMatchLabel: { type: String, default: 'No countries match "{query}"' }
})

const emit = defineEmits(['update:countryCode', 'update:number', 'blur'])

const light = computed(() => props.variant === 'light')

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
  background-color: #1A1336;
}
.country-code-search-input {
  background-color: rgba(255, 255, 255, 0.05);
}
.country-code-option:hover {
  background-color: rgba(234, 179, 8, 0.2);
}
.country-code-option.bg-violet-950\/10 {
  background-color: rgba(234, 179, 8, 0.1);
}

/* Light variant: white panel, gray hover, primary tint on the selected row */
.ccpi-light .country-code-dropdown,
.ccpi-light .country-code-dropdown-header,
.ccpi-light .country-code-dropdown-list,
.ccpi-light .country-code-option {
  background-color: #ffffff;
}
.ccpi-light .country-code-search-input {
  background-color: #ffffff;
}
.ccpi-light .country-code-option:hover {
  background-color: #f3f4f6;
}
.ccpi-light .country-code-option.ccpi-selected {
  background-color: #ede9fe;
  border-left-color: #7c3aed;
}
</style>

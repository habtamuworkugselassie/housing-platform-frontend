<template>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3" data-testid="org-lookup">
    <p class="text-xs font-semibold text-gray-700">{{ $t('orgLookup.title') }}</p>
    <p class="text-[11px] text-gray-500">{{ $t('orgLookup.hint') }}</p>
    <div v-if="modelValue" class="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm" data-testid="org-lookup-selected">
      <span><span class="font-semibold text-gray-900">{{ selectedName }}</span><span class="ml-2 text-xs text-gray-500">{{ $t('orgLookup.selected') }}</span></span>
      <button type="button" class="text-xs font-semibold text-primary-700 underline" @click="clear">{{ $t('orgLookup.change') }}</button>
    </div>
    <template v-else>
      <input v-model.trim="q" type="search" :placeholder="$t('orgLookup.placeholder')" autocomplete="off" class="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" data-testid="org-lookup-input" @input="search" />
      <ul v-if="results.length" class="mt-1 max-h-44 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 bg-white text-sm" role="listbox">
        <li v-for="o in results" :key="o.id" role="option">
          <button type="button" class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-violet-50" :data-testid="`org-lookup-${o.id}`" @click="pick(o)">
            <span class="text-gray-900">{{ o.name }}<span v-if="o.city" class="ml-1 text-xs text-gray-500">· {{ o.city }}</span></span>
            <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="o.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">{{ o.status === 'APPROVED' ? $t('orgLookup.approved') : $t('orgLookup.pending') }}</span>
          </button>
        </li>
      </ul>
      <p v-else-if="q.length >= 2 && !searching" class="mt-1 text-[11px] text-gray-500">{{ $t('orgLookup.none') }}</p>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/shared/api/client'

/**
 * Public typeahead over GET /organizations/lookup. v-model is the chosen organization id;
 * `select` carries the whole item so a form can prefill from it, `clear` undoes the pick.
 */
const props = defineProps({ modelValue: { type: String, default: '' }, initialName: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue', 'select', 'clear'])
const q = ref('')
const results = ref([])
const searching = ref(false)
const selectedName = ref(props.initialName)
let timer = null
function search() {
  clearTimeout(timer)
  if (q.value.length < 2) {
    results.value = []
    return
  }
  const term = q.value
  timer = setTimeout(async () => {
    searching.value = true
    try {
      const res = await api.get('/organizations/lookup', { params: { q: term } })
      results.value = res.data || []
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 250)
}
function pick(o) {
  selectedName.value = o.name
  results.value = []
  q.value = ''
  emit('update:modelValue', o.id)
  emit('select', o)
}
function clear() {
  selectedName.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>

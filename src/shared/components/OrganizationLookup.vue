<template>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3" data-testid="org-lookup">
    <p class="text-xs font-semibold text-gray-700">{{ $t('orgLookup.title') }}</p>
    <p class="text-[11px] text-gray-500">{{ $t('orgLookup.hint') }}</p>
    <div v-if="modelValue" class="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm" data-testid="org-lookup-selected">
      <span><span class="font-semibold text-gray-900">{{ selectedName }}</span><span class="ml-2 text-xs text-gray-500">{{ $t('orgLookup.selected') }}</span></span>
      <button type="button" class="text-xs font-semibold text-primary-700 underline" @click="clear">{{ $t('orgLookup.change') }}</button>
    </div>
    <div v-else-if="suggestion" class="mt-2 rounded-lg border border-gold-300 bg-gold-50 px-3 py-2 text-sm" data-testid="org-lookup-suggestion">
      <p class="text-gray-900">{{ $t('orgLookup.found', { name: suggestion.name }) }} <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="suggestion.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">{{ suggestion.status === 'APPROVED' ? $t('orgLookup.approved') : $t('orgLookup.pending') }}</span></p>
      <p class="text-[11px] text-gray-600">{{ $t(`orgLookup.matchedBy.${suggestion.matchedBy || 'name'}`) }}</p>
      <div class="mt-2 flex gap-2">
        <button type="button" class="rounded-full bg-primary-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-700" data-testid="org-lookup-use" @click="pick(suggestion)">{{ $t('orgLookup.useThis') }}</button>
        <button type="button" class="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white" @click="dismiss">{{ $t('orgLookup.notUs') }}</button>
      </div>
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
import { ref, watch } from 'vue'
import api from '@/shared/api/client'

/**
 * Public typeahead over GET /organizations/lookup. v-model is the chosen organization id;
 * `select` carries the whole item so a form can prefill from it, `clear` undoes the pick.
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  initialName: { type: String, default: '' },
  /** What the user typed elsewhere on the form: { name, email, phone }. A match is offered, never forced. */
  hints: { type: Object, default: null }
})
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
const suggestion = ref(null)
const dismissed = new Set()
let matchTimer = null
watch(
  () => [props.hints?.name || '', props.hints?.email || '', props.hints?.phone || ''],
  ([name, email, phone]) => {
    clearTimeout(matchTimer)
    if (props.modelValue) return
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const phoneOk = phone.replace(/\D/g, '').length >= 9
    const nameOk = name.trim().length >= 3
    if (!emailOk && !phoneOk && !nameOk) {
      suggestion.value = null
      return
    }
    matchTimer = setTimeout(async () => {
      try {
        const params = {}
        if (nameOk) params.name = name.trim()
        if (emailOk) params.email = email.trim()
        if (phoneOk) params.phone = phone.trim()
        const res = await api.get('/organizations/match', { params })
        const hit = res.status === 204 || !res.data || !res.data.id ? null : res.data
        suggestion.value = hit && !dismissed.has(hit.id) ? hit : null
      } catch {
        suggestion.value = null
      }
    }, 600)
  },
  { deep: true }
)
function dismiss() {
  if (suggestion.value) dismissed.add(suggestion.value.id)
  suggestion.value = null
}
function pick(o) {
  suggestion.value = null
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

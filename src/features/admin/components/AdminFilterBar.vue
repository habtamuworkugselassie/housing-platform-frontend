<template>
  <div class="flex flex-wrap items-center gap-2" data-testid="filter-bar">
    <template v-for="f in fields" :key="f.key">
      <input
        v-if="f.type === 'search'"
        :value="modelValue[f.key] || ''"
        type="search"
        :placeholder="f.placeholder || $t('admin.filters.search')"
        :aria-label="f.label || f.placeholder || $t('admin.filters.search')"
        class="w-full rounded-lg border border-admin-line/20 bg-admin-surface px-3 py-2 text-sm text-admin-fg sm:w-64"
        :data-testid="`filter-${f.key}`"
        @input="set(f.key, $event.target.value)"
        @keyup.enter="$emit('apply')"
      />
      <select
        v-else
        :value="modelValue[f.key] || ''"
        :aria-label="f.label"
        class="rounded-lg border border-admin-line/20 bg-admin-surface px-3 py-2 text-sm text-admin-fg"
        :data-testid="`filter-${f.key}`"
        @change="set(f.key, $event.target.value, true)"
      >
        <option value="">{{ f.allLabel || f.label }}</option>
        <option v-for="o in f.options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </template>
    <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60" data-testid="filter-apply" @click="$emit('apply')">{{ $t('admin.filters.apply') }}</button>
    <button v-if="active" type="button" class="text-xs font-semibold text-admin-nav underline" data-testid="filter-clear" @click="clear">{{ $t('admin.filters.clear') }}</button>
    <span v-if="count != null" class="text-xs text-admin-subtle" data-testid="filter-count">{{ $t('admin.table.count', { n: count }) }}</span>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * The one filter row for admin lists: search boxes apply on Enter or Apply, selects apply at
 * once, Clear resets everything. `fields`: { key, type: 'search' | 'select', label, placeholder,
 * allLabel, options: [{ value, label }] }. v-model is a plain object keyed by field.
 */
const props = defineProps({
  modelValue: { type: Object, required: true },
  fields: { type: Array, required: true },
  count: { type: Number, default: null }
})
const emit = defineEmits(['update:modelValue', 'apply', 'clear'])
const active = computed(() => props.fields.some((f) => props.modelValue[f.key]))
function set(key, value, applyNow = false) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
  if (applyNow) emit('apply')
}
function clear() {
  const next = {}
  props.fields.forEach((f) => (next[f.key] = ''))
  emit('update:modelValue', next)
  emit('clear')
  emit('apply')
}
</script>

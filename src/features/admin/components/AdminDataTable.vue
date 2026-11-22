<template>
  <div class="overflow-hidden rounded-lg border border-admin-line/10 bg-admin-surface">
    <div v-if="loading" class="py-12 text-center"><div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-admin-line/15" /></div>
    <div v-else-if="!rows.length" class="px-6 py-12 text-center text-sm text-admin-subtle" data-testid="table-empty">{{ emptyText }}</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full divide-y divide-admin-line/10 rtable" :style="minWidth ? { minWidth } : undefined">
        <thead class="bg-admin-raised">
          <tr>
            <th v-if="selectable" scope="col" class="w-8 px-3 py-3">
              <input type="checkbox" :checked="allSelected" :aria-label="$t('admin.table.selectAll')" data-testid="select-all" @change="toggleAll" />
            </th>
            <th
              v-for="c in columns"
              :key="c.key"
              scope="col"
              :class="['px-4 py-3 text-xs font-semibold uppercase tracking-wider text-admin-subtle', c.align === 'right' ? 'text-right' : 'text-left']"
              :style="c.width ? { width: c.width } : undefined"
            >
              {{ c.label }}
            </th>
            <th v-if="$slots.expanded" scope="col" class="w-10 px-2 py-3"><span class="sr-only">{{ $t('admin.table.details') }}</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-admin-line/10">
          <template v-for="row in rows" :key="rowKey(row)">
            <tr
              :class="['align-top transition-colors hover:bg-admin-nav/5', isOpen(row) ? 'bg-admin-nav/5' : '', rowClass ? rowClass(row) : '']"
              :data-testid="rowTestId ? rowTestId(row) : undefined"
            >
              <td v-if="selectable" class="px-3 py-3">
                <input type="checkbox" :checked="selected.has(rowKey(row))" :aria-label="$t('admin.table.selectRow')" @change="toggleSelect(row)" />
              </td>
              <td
                v-for="c in columns"
                :key="c.key"
                :data-label="c.label"
                :class="['px-4 py-3 text-sm text-admin-muted', c.align === 'right' ? 'text-right' : '', c.nowrap ? 'whitespace-nowrap' : '']"
              >
                <slot :name="`cell-${c.key}`" :row="row" :value="row[c.key]">{{ row[c.key] ?? '—' }}</slot>
              </td>
              <td v-if="$slots.expanded" class="px-2 py-3 text-right">
                <button
                  type="button"
                  class="rounded-md border border-admin-line/20 px-2 py-1 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60"
                  :aria-expanded="isOpen(row) ? 'true' : 'false'"
                  :data-testid="`toggle-${rowKey(row)}`"
                  @click="toggle(row)"
                >
                  {{ isOpen(row) ? $t('admin.table.hide') : $t('admin.table.details') }}
                </button>
              </td>
            </tr>
            <tr v-if="$slots.expanded && isOpen(row)" class="bg-admin-sunken/40" :data-testid="`expanded-${rowKey(row)}`">
              <td :colspan="columns.length + 1 + (selectable ? 1 : 0)" class="px-4 py-4"><slot name="expanded" :row="row" /></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-admin-line/10 px-4 py-3 text-xs text-admin-subtle">
      <span v-if="total != null">{{ $t('admin.table.count', { n: total }) }}</span>
      <div class="ml-auto flex items-center gap-3">
        <button type="button" :disabled="page === 0" class="font-semibold text-admin-nav disabled:opacity-40" @click="$emit('page', page - 1)">‹ {{ $t('admin.table.prev') }}</button>
        <span>{{ page + 1 }} / {{ totalPages }}</span>
        <button type="button" :disabled="page >= totalPages - 1" class="font-semibold text-admin-nav disabled:opacity-40" @click="$emit('page', page + 1)">{{ $t('admin.table.next') }} ›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

/**
 * The admin list: a real table on desktop with an optional expandable detail row, stacked cards
 * with labels on phones (see `.rtable` in style.css). Columns: { key, label, align, width, nowrap }.
 */
const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: Boolean,
  emptyText: { type: String, default: '—' },
  rowId: { type: Function, default: (r) => r.id },
  rowTestId: { type: Function, default: null },
  minWidth: { type: String, default: '' },
  page: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  total: { type: Number, default: null },
  /** Row checkboxes; `selected` is a Set of row keys, updated through update:selected. */
  selectable: Boolean,
  selected: { type: Set, default: () => new Set() },
  /** Extra classes for a row, e.g. to tint a secondary kind of row. */
  rowClass: { type: Function, default: null }
})
const emit = defineEmits(['page', 'update:selected'])

const allSelected = computed(() => props.rows.length > 0 && props.rows.every((r) => props.selected.has(rowKey(r))))
function toggleSelect(row) {
  const next = new Set(props.selected)
  const k = rowKey(row)
  if (next.has(k)) next.delete(k)
  else next.add(k)
  emit('update:selected', next)
}
function toggleAll() {
  emit('update:selected', allSelected.value ? new Set() : new Set(props.rows.map(rowKey)))
}

const open = ref(new Set())
const rowKey = (row) => String(props.rowId(row))
const isOpen = (row) => open.value.has(rowKey(row))
function toggle(row) {
  const k = rowKey(row)
  const next = new Set(open.value)
  if (next.has(k)) next.delete(k)
  else next.add(k)
  open.value = next
}
defineExpose({ toggle, isOpen })
</script>

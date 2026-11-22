<template>
  <div class="overflow-hidden rounded-lg border border-admin-line/10 bg-admin-surface">
    <div v-if="loading" class="py-12 text-center"><div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-admin-line/15" /></div>
    <div v-else-if="!rows.length" class="px-6 py-12 text-center text-sm text-admin-subtle" data-testid="table-empty">{{ emptyText }}</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full divide-y divide-admin-line/10 rtable" :style="minWidth ? { minWidth } : undefined">
        <thead class="bg-admin-raised">
          <tr>
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
              :class="['align-top transition-colors hover:bg-admin-nav/5', isOpen(row) ? 'bg-admin-nav/5' : '']"
              :data-testid="rowTestId ? rowTestId(row) : undefined"
            >
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
              <td :colspan="columns.length + 1" class="px-4 py-4"><slot name="expanded" :row="row" /></td>
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
import { ref } from 'vue'

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
  total: { type: Number, default: null }
})
defineEmits(['page'])

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

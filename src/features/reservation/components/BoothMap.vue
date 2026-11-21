<template>
  <div class="booth-map">
    <div class="booth-map__scroll">
    <svg :viewBox="`0 0 ${W} ${H}`" class="booth-map__svg h-auto w-full select-none" role="img" :aria-label="$t('booth.mapAria')">
      <!-- hall -->
      <rect x="0" y="0" :width="W" :height="H" rx="10" fill="#faf9fd" stroke="#d9d2ea" />
      <!-- fixtures -->
      <g font-family="Roboto, Helvetica, Arial, sans-serif" font-size="9" fill="#5b4b85" text-anchor="middle">
        <rect :x="pad" :y="pad" :width="topW" :height="topH" fill="#efeaf8" stroke="#d9d2ea" />
        <text :x="pad + topW / 2" :y="pad + topH / 2 + 3" font-weight="700">{{ $t('booth.entrance') }}</text>
        <rect :x="pad" :y="pad + topH + 6" :width="sideW" :height="leftFeatureH" fill="#efeaf8" stroke="#d9d2ea" />
        <text :x="pad + sideW / 2" :y="pad + topH + 6 + leftFeatureH / 2 + 3">{{ $t('booth.featureArea') }}</text>
        <rect :x="pad" :y="H - pad - stageH" :width="sideW" :height="stageH" fill="#2e1065" />
        <text :x="pad + sideW / 2" :y="H - pad - stageH / 2 + 3" fill="#fde047" font-weight="700">{{ $t('booth.stage') }}</text>
        <rect :x="W - pad - sideW" :y="pad + topH + 6" :width="sideW" :height="aidH" fill="#fff1f2" stroke="#fecdd3" />
        <text :x="W - pad - sideW / 2" :y="pad + topH + 6 + aidH / 2 + 3" fill="#be123c" font-weight="700">{{ $t('booth.firstAid') }}</text>
        <rect :x="W - pad - sideW" :y="H - pad - stageH" :width="sideW" :height="stageH" fill="#efeaf8" stroke="#d9d2ea" />
        <text :x="W - pad - sideW / 2" :y="H - pad - stageH / 2 + 3">{{ $t('booth.cafeteria') }}</text>
        <text :x="W / 2" :y="H - 4" font-size="8" fill="#8b7fb0">{{ $t('booth.vipEntrance') }}</text>
        <text v-for="b in blockLabels" :key="b.label" :x="b.x" :y="gridY + gridH + 11" font-weight="800" fill="#6d28d9">{{ b.label }}</text>
      </g>
      <!-- booths -->
      <g v-for="b in placed" :key="b.code" :class="['booth', b.status.toLowerCase(), { selected: isSelected(b.code), pickable: canPick(b) }]" :tabindex="canPick(b) ? 0 : -1" role="button" :aria-pressed="isSelected(b.code)" :aria-label="`${b.code} ${$t('booth.status.' + b.status)}`" @click="toggle(b)" @keydown.enter.prevent="toggle(b)" @keydown.space.prevent="toggle(b)">
        <rect :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="2" :fill="fill(b)" :stroke="stroke(b)" :stroke-width="isSelected(b.code) ? 2 : 1" />
        <text :x="b.x + b.w / 2" :y="b.y + b.h / 2 + 3" font-size="7.5" font-family="Roboto, Helvetica, Arial, sans-serif" font-weight="600" text-anchor="middle" :fill="textFill(b)">{{ b.code }}</text>
      </g>
    </svg>
    </div>
    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
      <span class="inline-flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm border border-violet-300 bg-white"></i>{{ $t('booth.status.AVAILABLE') }}</span>
      <span class="inline-flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm bg-amber-300"></i>{{ $t('booth.status.HELD') }}</span>
      <span class="inline-flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm bg-gray-400"></i>{{ $t('booth.status.SOLD') }}</span>
      <span v-if="selectable" class="inline-flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm bg-primary-600"></i>{{ $t('booth.selectedLegend') }}</span>
      <span class="inline-flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm border-2 border-amber-500 bg-white"></i>{{ $t('booth.type.PREMIUM') }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** [{ code, block, col, row, boothType, status }] */
  booths: { type: Array, default: () => [] },
  selectable: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  maxSelect: { type: Number, default: 0 },
  /** Admin mode: any booth is clickable, selection rules do not apply. */
  adminPick: { type: Boolean, default: false }
})
const emit = defineEmits(['update:selected', 'pick'])

// Geometry (SVG units). Columns: 0 = left perimeter, 1-2 A, 3-5 B, 6-8 C, 9-10 D, 11 = right perimeter.
const W = 640
const H = 420
const pad = 8
const sideW = 74
const topH = 34
const topW = W - 2 * pad
const leftFeatureH = 70
const stageH = 70
const aidH = 48
const cell = 30
const gap = 3
const blockGap = 14
const gridY = pad + topH + 14
const gridH = 10 * cell + 9 * gap

const colX = computed(() => {
  const xs = {}
  let x = pad + sideW + 10
  xs[0] = x
  x += cell + blockGap
  for (const [cols, w] of [[[1, 2], 2], [[3, 4, 5], 3], [[6, 7, 8], 3], [[9, 10], 2]]) {
    cols.forEach((c, i) => { xs[c] = x + i * (cell + gap) })
    x += w * (cell + gap) - gap + blockGap
  }
  xs[11] = x
  return xs
})

const blockLabels = computed(() => [
  { label: 'A', x: colX.value[1] + cell + gap / 2 },
  { label: 'B', x: colX.value[4] + cell / 2 },
  { label: 'C', x: colX.value[7] + cell / 2 },
  { label: 'D', x: colX.value[9] + cell + gap / 2 }
])

const placed = computed(() =>
  props.booths.map((b) => {
    const perimeter = b.col === 0 || b.col === 11
    const slots = b.col === 0 ? 11 : 9
    const h = perimeter ? (gridH - (slots - 1) * gap) / slots : cell
    const y = perimeter ? gridY + (b.row - 1) * (h + gap) : gridY + (b.row - 1) * (cell + gap)
    return { ...b, x: colX.value[b.col] ?? 0, y, w: cell, h }
  })
)

function isSelected(code) {
  return props.selected.includes(code)
}
function canPick(b) {
  if (props.adminPick) return true
  if (!props.selectable) return false
  return b.status === 'AVAILABLE' || isSelected(b.code)
}
function toggle(b) {
  if (props.adminPick) {
    emit('pick', b)
    return
  }
  if (!canPick(b)) return
  const next = isSelected(b.code) ? props.selected.filter((c) => c !== b.code) : [...props.selected, b.code]
  if (!isSelected(b.code) && props.maxSelect > 0 && next.length > props.maxSelect) return
  emit('update:selected', next)
  emit('pick', b)
}
function fill(b) {
  if (isSelected(b.code)) return '#6d28d9'
  if (b.status === 'SOLD') return '#9ca3af'
  if (b.status === 'HELD') return '#fcd34d'
  if (b.status === 'BLOCKED') return '#e5e7eb'
  return '#ffffff'
}
function stroke(b) {
  if (isSelected(b.code)) return '#4c1d95'
  if (b.boothType === 'PREMIUM') return '#d97706'
  return '#c4b5fd'
}
function textFill(b) {
  if (isSelected(b.code)) return '#ffffff'
  if (b.status === 'SOLD') return '#ffffff'
  return '#2e1065'
}
</script>

<style scoped>
/* Phones: keep the codes legible and let the plan scroll sideways instead of shrinking. */
.booth-map__scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.booth-map__svg { min-width: 600px; }
@media (min-width: 640px) { .booth-map__svg { min-width: 0; } }
.booth.pickable { cursor: pointer; }
.booth.pickable:hover rect { filter: brightness(0.95); }
.booth:not(.pickable) { cursor: default; }
.booth:focus { outline: none; }
.booth:focus rect { stroke: #4c1d95; stroke-width: 2; }
</style>

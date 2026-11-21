<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-end justify-center bg-violet-950/75 backdrop-blur-md sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="$emit('close')"
    >
      <div class="relative flex max-h-[min(94dvh,920px)] w-full max-w-lg min-h-0 flex-col overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl sm:mx-4 sm:rounded-3xl">
        <div class="h-1.5 w-full shrink-0 bg-gold-400" />
        <div class="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-5 sm:px-6">
          <div class="min-w-0">
            <p class="mb-1.5 text-xs font-semibold text-primary-700">{{ $t('reservation.eyebrow') }}</p>
            <h3 :id="titleId" class="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">{{ $t('reservation.title') }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-gray-600">{{ $t('reservation.subtitle') }}</p>
          </div>
          <button type="button" class="shrink-0 rounded-xl p-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400" :aria-label="$t('reservation.close')" @click="$emit('close')">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
          <SponsorshipReservationForm :key="pkg ? pkg.id : 'none'" :pkg="pkg" source="site" @done="$emit('close')" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import SponsorshipReservationForm from './SponsorshipReservationForm.vue'

defineProps({
  open: { type: Boolean, default: false },
  pkg: { type: Object, default: null }
})
defineEmits(['close'])
const titleId = `rsv-title-${Math.random().toString(36).slice(2, 8)}`
</script>

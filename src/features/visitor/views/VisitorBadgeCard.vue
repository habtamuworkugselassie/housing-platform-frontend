<template>
  <div class="text-center space-y-4" data-testid="visitor-badge">
    <p v-if="already" class="rounded-lg bg-gold-400/20 px-3 py-2 text-sm text-gold-200">{{ $t('visitor.alreadyRegistered') }}</p>
    <h2 class="text-xl font-bold text-white">{{ $t('visitor.badgeTitle', { name: firstName }) }}</h2>
    <p class="text-sm text-white/80">{{ $t('visitor.badgeBody') }}</p>

    <div class="badge-card mx-auto max-w-xs rounded-2xl bg-white p-5 text-primary-950 shadow-xl">
      <img :src="qrSrc" :alt="$t('visitor.qrAlt')" width="220" height="220" class="mx-auto h-56 w-56 rounded-lg" />
      <p class="mt-3 text-2xl font-extrabold tracking-[0.12em]" data-testid="badge-code">{{ badge.code }}</p>
      <p class="mt-1 text-base font-semibold">{{ badge.fullName }}</p>
      <p v-if="badge.organization" class="text-sm text-gray-600">{{ badge.organization }}</p>
      <p class="mt-1 text-xs uppercase tracking-wide text-gray-500">{{ $t(`visitor.types.${badge.visitorType}`) }}</p>
      <p class="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-600">{{ $t('visitor.factDateValue') }} · {{ $t('visitor.factVenueValue') }}</p>
    </div>

    <div class="flex flex-wrap justify-center gap-3 no-print">
      <a :href="badge.badgeUrl" class="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">{{ $t('visitor.openBadge') }}</a>
      <button type="button" class="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20" @click="print">{{ $t('visitor.print') }}</button>
      <a :href="qrSrc" :download="`ethio-build-connect-badge-${badge.code}.png`" class="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">{{ $t('visitor.download') }}</a>
    </div>
    <p class="text-xs text-white/60">{{ $t('visitor.emailed') }}</p>
    <button type="button" class="text-xs text-white/70 underline no-print" @click="$emit('again')">{{ $t('visitor.registerAnother') }}</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { visitorQrUrl } from '@/features/visitor/api/visitor.api'

const props = defineProps({
  badge: { type: Object, required: true },
  already: { type: Boolean, default: false }
})
defineEmits(['again'])

const qrSrc = computed(() => visitorQrUrl(props.badge.code))
const firstName = computed(() => String(props.badge.fullName || '').trim().split(/\s+/)[0] || '')

function print() {
  if (typeof window !== 'undefined') window.print()
}
</script>

<style scoped>
@media print {
  .no-print { display: none !important; }
  .badge-card { box-shadow: none; border: 1px solid #ddd; }
}
</style>

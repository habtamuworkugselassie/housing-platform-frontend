<template>
  <nav class="flex flex-wrap items-center gap-1 rounded-lg border border-admin-line/10 bg-admin-surface px-2 py-1.5 text-xs" :aria-label="$t('admin.expo.workflow')" data-testid="expo-workspace">
    <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-admin-subtle">{{ $t('admin.expo.workflow') }}</span>
    <template v-for="(step, i) in steps" :key="step.path">
      <span v-if="i > 0" class="text-admin-subtle" aria-hidden="true">›</span>
      <router-link
        :to="step.path"
        :class="[
          'rounded-md px-2.5 py-1 font-semibold transition-colors',
          step.path === current ? 'bg-admin-nav text-white' : 'text-admin-muted hover:bg-admin-sunken/60 hover:text-admin-fg'
        ]"
        :aria-current="step.path === current ? 'page' : undefined"
      >
        <span class="mr-1 text-[10px] opacity-70">{{ i + 1 }}</span>{{ step.label }}
      </router-link>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/** The expo funnel, one page per stage; `current` is the page showing the bar. */
const props = defineProps({ current: { type: String, required: true } })
const { t } = useI18n()
const steps = computed(() => [
  { path: '/admin/outreach', label: t('admin.nav.outreach') },
  { path: '/admin/exhibition-interests', label: t('admin.nav.leads') },
  { path: '/admin/sponsorship-reservations', label: t('admin.nav.reservations') },
  { path: '/admin/sponsorships', label: t('admin.nav.sponsors') },
  { path: '/admin/visitors', label: t('admin.nav.visitors') }
])
const current = computed(() => props.current)
</script>

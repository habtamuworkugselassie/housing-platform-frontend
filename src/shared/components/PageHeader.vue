<template>
  <!-- The opening block of every inner page: a small eyebrow pill, a large tight title (the
       page's h1 unless told otherwise), a lead, and room on the right for a count or an
       action. Same proportions as SectionHeader, one size up. -->
  <div :class="['page-head', compact ? 'mb-6' : 'mb-8 lg:mb-10']">
    <div class="md:flex md:items-end md:justify-between md:gap-10">
      <div class="max-w-3xl">
        <p
          v-if="eyebrow"
          class="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary-700"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
          {{ eyebrow }}
        </p>
        <component
          :is="as"
          class="text-3xl font-extrabold leading-[1.06] tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
        >
          {{ title }}<template v-if="accent">
            {{ ' ' }}<span class="text-primary-600">{{ accent }}</span></template>
        </component>
        <p v-if="subtitle" class="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots.aside" class="mt-4 shrink-0 md:mt-0">
        <slot name="aside" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  /** Heading element. The page's main heading should stay an h1 for search engines. */
  as: { type: String, default: 'h1' },
  compact: { type: Boolean, default: false },
})
</script>

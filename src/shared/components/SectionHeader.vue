<template>
  <div :class="['section-head mb-10 lg:mb-12', align === 'center' ? 'text-center' : '']">
    <div :class="align === 'center' ? '' : 'md:flex md:items-end md:justify-between md:gap-10'">
      <div :class="align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl'">
        <p v-if="eyebrow" class="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-primary-600">
          {{ eyebrow }}
        </p>
        <h2 class="text-3xl font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
          {{ title }}<template v-if="accent">
            {{ ' ' }}<span class="text-primary-600">{{ accent }}</span></template>
        </h2>
        <p v-if="subtitle" class="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
          {{ subtitle }}
        </p>
      </div>
      <p
        v-if="$slots.aside"
        class="mt-4 text-sm leading-relaxed text-gray-500 md:mt-0 md:max-w-xs md:shrink-0 md:text-right"
      >
        <slot name="aside" />
      </p>
    </div>
  </div>
</template>

<script setup>
/**
 * The heading block every landing section opens with: a small uppercase eyebrow, a
 * large tight title whose tail can be set in the brand violet, a lead paragraph, and
 * an optional note that sits to the right on wide screens.
 */
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  align: { type: String, default: 'left' }, // 'left' | 'center'
})
</script>

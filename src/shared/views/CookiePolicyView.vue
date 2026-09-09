<template>
  <div class="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-3xl mx-auto">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-2">
      {{ $t('legal.badge') }}
    </p>
    <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
      {{ $t('legal.cookies.title') }}
    </h1>
    <!-- Its own date, not the shared `legal.lastUpdated` the other policies use: this one
         was written later, and a policy that misstates when it last changed is misleading
         about the very thing a reader checks the date for. -->
    <p class="mt-2 text-sm text-white/60">{{ $t('legal.cookies.lastUpdated') }}</p>
    <p class="mt-6 text-sm text-white/80 leading-relaxed">{{ $t('legal.operator') }}</p>
    <p class="mt-4 text-sm text-white/80 leading-relaxed">{{ $t('legal.cookies.intro') }}</p>

    <section
      v-for="(block, idx) in sections"
      :key="idx"
      class="mt-10 border-t border-white/10 pt-8"
    >
      <h2 class="text-lg font-semibold text-white">{{ block.heading }}</h2>
      <p class="mt-3 text-sm text-white/75 leading-relaxed whitespace-pre-line">{{ block.body }}</p>

      <!-- Wide tables scroll inside their own container so the page body never does. -->
      <div v-if="block.rows" class="mt-5 overflow-x-auto">
        <table class="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr class="border-y border-white/10">
              <th
                v-for="column in block.columns"
                :key="column"
                scope="col"
                class="py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-white/60"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in block.rows" :key="i" class="border-b border-white/10 align-top">
              <th scope="row" class="py-3 pr-4 font-medium text-white break-words">{{ row[0] }}</th>
              <td
                v-for="(cell, j) in row.slice(1)"
                :key="j"
                class="py-3 pr-4 text-white/75 leading-relaxed"
              >
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="mt-12 text-sm text-white/60">
      {{ $t('legal.cookies.contactLabel') }}
      <a
        :href="supportMailto"
        class="inline-block py-2 -my-1 text-white underline hover:no-underline"
        >{{ supportEmail }}</a
      >
    </p>
    <p class="mt-4 text-sm text-white/60">
      <RouterLink to="/privacy" class="text-white underline hover:no-underline">
        {{ $t('legal.navPrivacy') }}
      </RouterLink>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { tm, rt } = useI18n()

/**
 * `tm` rather than `t` because these are structured blocks, not strings — each carries a
 * heading, a body, and for two of them a table of rows. `rt` is vue-i18n's companion for
 * resolving what `tm` hands back, and is used on every leaf rather than relying on the
 * shape of the object: a message with no placeholders comes back as a plain string, one
 * that has them comes back compiled, and `rt` renders both.
 */
const sections = computed(() => {
  const raw = tm('legal.cookies.sections')
  if (!Array.isArray(raw)) return []
  return raw.map((block) => ({
    heading: rt(block.heading),
    body: rt(block.body),
    columns: Array.isArray(block.columns) ? block.columns.map((c) => rt(c)) : null,
    rows: Array.isArray(block.rows) ? block.rows.map((row) => row.map((cell) => rt(cell))) : null
  }))
})

const supportEmail = computed(
  () => import.meta.env.VITE_SUPPORT_EMAIL || 'info@ethiobuildconnect.et'
)
const supportMailto = computed(() => `mailto:${supportEmail.value}`)
</script>

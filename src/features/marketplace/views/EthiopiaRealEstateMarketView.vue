<template>
  <!-- lang="en": the rest of the app is bilingual, this long-form guide is not (see the
       note in marketOverviewContent.js), so the document has to say which language it
       is actually in rather than inheriting the switcher's choice. -->
  <div lang="en" class="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-3xl mx-auto">
    <Breadcrumbs :crumbs="trail" />

    <h1 class="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
      {{ content.h1 }}
    </h1>
    <p class="mt-4 text-base sm:text-lg leading-relaxed text-gray-600">
      {{ content.standfirst }}
    </p>

    <nav class="mt-8 border-y border-gray-200 py-4" aria-label="On this page">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3">
        On this page
      </p>
      <ul class="grid gap-2 sm:grid-cols-2 text-sm">
        <li v-if="statistics">
          <a
            :href="`#${statistics.id}`"
            class="text-primary-700 underline decoration-primary-200 hover:decoration-primary-700"
          >
            {{ statistics.heading }}
          </a>
        </li>
        <li v-for="section in content.sections" :key="section.id">
          <a
            :href="`#${section.id}`"
            class="text-primary-700 underline decoration-primary-200 hover:decoration-primary-700"
          >
            {{ section.heading }}
          </a>
        </li>
      </ul>
    </nav>

    <!-- Placed before the prose: it is the only thing on this page no other site can
         publish, and the reason the page has a chance of ranking at all. -->
    <section v-if="statistics" :id="statistics.id" class="mt-12 scroll-mt-24">
      <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
        {{ statistics.heading }}
      </h2>
      <p class="mt-4 text-[15px] leading-relaxed text-gray-700">{{ statistics.standfirst }}</p>
      <p class="mt-2 text-sm text-gray-500">
        Figures as of <time :datetime="statistics.generatedOn">{{ statistics.generatedOn }}</time>.
      </p>

      <dl class="mt-6 grid gap-4 sm:grid-cols-2">
        <div
          v-for="item in statistics.headline"
          :key="item.key"
          class="rounded-lg border border-gray-200 bg-white p-4"
        >
          <dt class="text-sm text-gray-600">{{ item.label }}</dt>
          <dd class="mt-1 text-xl font-bold tracking-tight text-gray-900">{{ item.value }}</dd>
          <dd class="mt-0.5 text-xs text-gray-500">{{ item.note }}</dd>
        </div>
      </dl>

      <!-- Wide tables scroll inside their own container; the page body must not. -->
      <div v-for="table in statistics.tables" :key="table.id" class="mt-8 overflow-x-auto">
        <table class="w-full min-w-[32rem] border-collapse text-left text-[15px]">
          <caption class="mb-2 text-left text-sm font-semibold text-gray-900">
            {{ table.caption }}
          </caption>
          <thead>
            <tr class="border-y border-gray-200">
              <th
                v-for="column in table.columns"
                :key="column"
                scope="col"
                class="py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in table.rows" :key="i" class="border-b border-gray-100">
              <th scope="row" class="py-2.5 pr-4 font-medium text-gray-900">{{ row[0] }}</th>
              <td v-for="(cell, j) in row.slice(1)" :key="j" class="py-2.5 pr-4 text-gray-700">
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="mt-5 text-sm leading-relaxed text-gray-500">{{ statistics.footnote }}</p>
    </section>

    <section
      v-for="section in content.sections"
      :id="section.id"
      :key="section.id"
      class="mt-12 scroll-mt-24"
    >
      <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
        {{ section.heading }}
      </h2>

      <p
        v-for="(paragraph, i) in section.paragraphs"
        :key="i"
        class="mt-4 text-[15px] leading-relaxed text-gray-700"
      >
        {{ paragraph }}
      </p>

      <dl v-if="section.list" class="mt-5 space-y-4">
        <div v-for="item in section.list" :key="item.term">
          <dt class="text-[15px] font-semibold text-gray-900">{{ item.term }}</dt>
          <dd class="mt-1 text-[15px] leading-relaxed text-gray-700">{{ item.detail }}</dd>
        </div>
      </dl>

      <ul v-if="section.links" class="mt-5 space-y-2 text-[15px]">
        <li v-for="link in section.links" :key="link.to">
          <RouterLink
            :to="link.to"
            class="font-medium text-primary-700 underline decoration-primary-200 hover:decoration-primary-700"
          >
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Breadcrumbs } from '@/shared/components'
import {
  MARKET_OVERVIEW,
  MARKET_OVERVIEW_PATH
} from '@/features/marketplace/marketOverviewContent'
import {
  MARKET_STATISTICS_SEED_KEY,
  buildMarketStatisticsView
} from '@/features/marketplace/marketStatisticsView'
import { getMarketStatistics } from '@/features/marketplace/api/marketStatistics.api'
import {
  canonicalUrlForPath,
  setBreadcrumbJsonLd,
  removeBreadcrumbJsonLd,
  setJsonLdById,
  removeJsonLdById
} from '@/utils/seo'

const ARTICLE_JSON_LD_ID = 'market-overview-jsonld'

const content = MARKET_OVERVIEW

/**
 * Seeded from the snapshot the prerenderer baked into the page, then refreshed.
 *
 * Without the seed the section would vanish the moment Vue mounts — `mount()` clears the
 * container — and reappear a request later, which is a content jump on the one section
 * worth reading. Starting from the prerendered figures means the section never blinks, and
 * the live fetch below only ever corrects them.
 */
function seededStatistics() {
  if (typeof window === 'undefined') return null
  try {
    return buildMarketStatisticsView(window[MARKET_STATISTICS_SEED_KEY])
  } catch {
    return null
  }
}

const statistics = ref(seededStatistics())

async function loadStatistics() {
  try {
    statistics.value = buildMarketStatisticsView(await getMarketStatistics()) || statistics.value
  } catch {
    // Keep whatever the prerendered snapshot gave us; the prose does not depend on this.
  }
}

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Ethiopia real estate market' }
]

// Article rather than FAQPage: this is one continuous explainer, and the headings are
// statements ("How purchases and projects get financed") rather than the questions an
// FAQ rich result is defined around. No datePublished is asserted — the page carries no
// visible date, and inventing one to satisfy the schema would be a claim about content
// that has not been reviewed on that date.
onMounted(() => {
  loadStatistics()
  setBreadcrumbJsonLd(trail)
  setJsonLdById(ARTICLE_JSON_LD_ID, {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.h1,
    description: content.standfirst,
    inLanguage: 'en',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrlForPath(MARKET_OVERVIEW_PATH)
    },
    about: [
      { '@type': 'Thing', name: 'Real estate in Ethiopia' },
      { '@type': 'Thing', name: 'Construction in Ethiopia' }
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Ethio Build Connect',
      url: canonicalUrlForPath('/')
    }
  })
})

onUnmounted(() => {
  removeJsonLdById(ARTICLE_JSON_LD_ID)
  removeBreadcrumbJsonLd()
})
</script>

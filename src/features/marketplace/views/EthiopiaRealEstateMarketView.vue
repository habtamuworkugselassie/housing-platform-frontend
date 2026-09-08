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
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Breadcrumbs } from '@/shared/components'
import {
  MARKET_OVERVIEW,
  MARKET_OVERVIEW_PATH
} from '@/features/marketplace/marketOverviewContent'
import {
  canonicalUrlForPath,
  setBreadcrumbJsonLd,
  removeBreadcrumbJsonLd,
  setJsonLdById,
  removeJsonLdById
} from '@/utils/seo'

const ARTICLE_JSON_LD_ID = 'market-overview-jsonld'

const content = MARKET_OVERVIEW

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

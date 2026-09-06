<template>
  <section id="faq" class="py-16 lg:py-24 bg-white text-gray-900 scroll-mt-24">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 mb-2 text-center">
        {{ t('exhibition.faq.eyebrow') }}
      </p>
      <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3 text-center">
        {{ t('exhibition.faq.title') }}
      </h2>
      <p class="text-gray-600 text-center mb-10">{{ t('exhibition.faq.subtitle') }}</p>

      <dl class="divide-y divide-gray-200 border-y border-gray-200">
        <div v-for="(item, i) in faqs" :key="item.id">
          <dt>
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 py-5 text-start text-base font-semibold text-gray-900 hover:text-primary-700"
              :aria-expanded="openIndex === i"
              :aria-controls="`faq-answer-${item.id}`"
              @click="toggle(i)"
            >
              <span>{{ item.question }}</span>
              <span
                class="material-icons !text-[22px] shrink-0 leading-none text-primary-600 transition-transform duration-200"
                :class="openIndex === i ? 'rotate-180' : ''"
                aria-hidden="true"
              >expand_more</span>
            </button>
          </dt>
          <dd :id="`faq-answer-${item.id}`" v-show="openIndex === i" class="pb-5 -mt-1">
            <p class="text-sm leading-relaxed text-gray-600">{{ item.answer }}</p>
          </dd>
        </div>
      </dl>

      <p class="mt-10 text-center text-sm text-gray-600">
        {{ t('exhibition.faq.moreQuestions') }}
        <a :href="supportMailto" class="inline-block py-2 -my-1 font-semibold text-primary-700 underline hover:no-underline">
          {{ supportEmail }}
        </a>
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { setJsonLdById, removeJsonLdById } from '@/utils/seo'

const FAQ_JSON_LD_ID = 'dynamic-faq-jsonld'

// Answers are drawn from what the site itself states — the expo dates and venue
// from the hero, who exhibits from the planning section, and the access rules from
// the router's own route guards — so the rich result cannot claim more than the
// page does.
const FAQ_IDS = ['whenWhere', 'whoExhibits', 'howRegister', 'browsingCost', 'listProperty', 'contactCompany', 'languages']

const { t, locale } = useI18n()

const faqs = computed(() =>
  FAQ_IDS.map((id) => ({
    id,
    question: t(`exhibition.faq.items.${id}.q`),
    answer: t(`exhibition.faq.items.${id}.a`)
  }))
)

// One open at a time, the first open by default: a visitor sees an answer straight
// away rather than a wall of closed rows.
const openIndex = ref(0)

function toggle(i) {
  openIndex.value = openIndex.value === i ? -1 : i
}

const supportEmail = computed(
  () => import.meta.env.VITE_SUPPORT_EMAIL || 'info@ethiobuildconnect.et'
)
const supportMailto = computed(() => `mailto:${supportEmail.value}`)

function syncFaqJsonLd() {
  setJsonLdById(FAQ_JSON_LD_ID, {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.value.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  })
}

onMounted(syncFaqJsonLd)
// Switching language rewrites every answer, so the schema has to follow.
watch(locale, syncFaqJsonLd)
onUnmounted(() => removeJsonLdById(FAQ_JSON_LD_ID))
</script>

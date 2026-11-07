<template>
  <section
    id="sponsorship-packages"
    class="relative scroll-mt-20 bg-white py-16 lg:py-24 text-gray-900"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        v-reveal
        :eyebrow="$t('exhibition.sponsorshipPackages.eyebrow')"
        :title="$t('exhibition.sponsorshipPackages.title')"
        :subtitle="$t('exhibition.sponsorshipPackages.subtitle')"
      />

      <div v-if="loading" class="flex justify-center py-16">
        <div
          class="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"
          aria-hidden="true"
        />
      </div>

      <p v-else-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
        <button type="button" class="ml-2 underline hover:text-red-900" @click="loadPackages">
          {{ $t('exhibition.sponsorshipPackages.retry') }}
        </button>
      </p>

      <p v-else-if="!sortedPackages.length" class="text-center text-sm text-gray-500 py-12">
        {{ $t('exhibition.sponsorshipPackages.empty') }}
      </p>

      <div v-else v-reveal data-stagger class="grid gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
        <article
          v-for="pkg in sortedPackages"
          :key="pkg.id"
          class="group flex h-full flex-col"
        >
          <div
            class="hover-lift relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white"
            :class="tierAccent(pkg).ring"
          >
            <!-- Tier accent bar -->
            <div class="h-1.5 w-full shrink-0 bg-gradient-to-r" :class="tierAccent(pkg).bar" />
            <!-- Header: tier chip + price -->
            <div class="shrink-0 border-b border-gray-100 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                  :class="tierAccent(pkg).chip"
                >
                  <SparklesIcon
                    v-if="tierAccent(pkg).featured"
                    class="h-3.5 w-3.5 shrink-0 opacity-90"
                    aria-hidden="true"
                  />
                  {{ formatTierLabel(pkg.type) }}
                </span>
                <p
                  v-if="showSponsorshipPackagePrices"
                  class="text-right text-xl font-extrabold tabular-nums leading-tight tracking-tight sm:text-2xl"
                  :class="tierAccent(pkg).price"
                >
                  {{ formatPriceEt(pkg.basePrice) }}
                </p>
              </div>
            </div>
            <div class="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-5 sm:px-6">
              <h3 class="shrink-0 text-xl font-extrabold tracking-tight text-gray-900 leading-snug mb-2">
                {{ pkg.name }}
              </h3>
              <p
                v-if="pkg.description"
                class="shrink-0 text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3"
              >
                {{ pkg.description }}
              </p>
              <!-- Scroll features only so payment notes + CTA stay fully visible in equal-height grid rows -->
              <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-0.5 [-webkit-overflow-scrolling:touch]">
                <p class="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {{ $t('exhibition.sponsorshipPackages.benefitsHeading') }}
                </p>
                <ul class="space-y-2.5 pb-1 text-sm leading-relaxed text-gray-700">
                  <li v-for="(line, idx) in featurePreviewBullets(pkg)" :key="idx" class="flex items-start gap-2.5">
                    <span
                      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                      :class="tierAccent(pkg).chip"
                      aria-hidden="true"
                    >
                      <CheckIcon class="h-3 w-3" stroke-width="3" />
                    </span>
                    <span class="min-w-0">{{ line }}</span>
                  </li>
                </ul>
                <button
                  v-if="hasTruncatedFeatures(pkg)"
                  type="button"
                  class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 underline-offset-4 transition-colors hover:text-primary-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
                  @click="openDetailsModal(pkg)"
                >
                  {{ $t('exhibition.sponsorshipPackages.seeMore') }}
                </button>
                <button
                  v-else-if="featureBullets(pkg.features).length === 0 && (pkg.description || pkg.notes)"
                  type="button"
                  class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 underline-offset-4 transition-colors hover:text-primary-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
                  @click="openDetailsModal(pkg)"
                >
                  {{ $t('exhibition.sponsorshipPackages.viewDetails') }}
                </button>
              </div>
              <div
                v-if="pkg.notes"
                class="mt-4 shrink-0 rounded-2xl border border-primary-100 bg-violet-50 px-4 py-3 text-xs leading-relaxed text-gray-700 break-words [overflow-wrap:anywhere]"
              >
                {{ pkg.notes }}
              </div>
              <button
                type="button"
                class="mt-5 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-white"
                :class="tierAccent(pkg).cta"
                @click="openRegisterModal(pkg)"
              >
                {{ $t('exhibition.sponsorshipPackages.enquireCta') }}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 6l6 6-6 6M5 12h14" /></svg>
              </button>
            </div>
          </div>
        </article>
      </div>

      <div
        v-reveal
        class="mt-12 flex flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-primary-100 bg-violet-50 px-6 py-8 sm:flex-row"
      >
        <button
          type="button"
          class="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-white"
          @click="openRegisterModal(null)"
        >
          {{ $t('exhibition.cta.standEnquiry') }}
        </button>
        <a
          :href="brochureHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-primary-300 bg-white px-8 py-3.5 text-sm font-bold text-primary-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-white"
        >
          {{ $t('exhibition.cta.viewBrochure') }}
        </a>
      </div>
    </div>

    <!-- Package details modal (tier-themed: gradient frame, glow, accent stripe — common premium pricing patterns) -->
    <Teleport to="body">
      <div
        v-if="detailsModalPackage"
        class="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-violet-950/75 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="detailsTitleId"
        @click.self="closeDetailsModal"
      >
        <div class="relative w-full max-w-lg sm:max-w-2xl max-h-[min(92vh,900px)] flex flex-col sm:mx-4">
          <div class="relative w-full rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <div
              class="relative flex max-h-[min(92vh,900px)] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-gray-200 bg-white"
            >
              <div
                class="h-1.5 w-full shrink-0 sm:rounded-t-[13px]"
                :class="detailsModalTheme.stripe"
              />
              <div
                class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-5 sm:px-6"
              >
                <div class="relative min-w-0">
                  <p
                    class="text-xs font-semibold mb-1.5"
                    :class="detailsModalTheme.eyebrow"
                  >
                    {{ formatTierLabel(detailsModalPackage.type) }}
                  </p>
                  <h3 :id="detailsTitleId" class="text-xl font-extrabold text-gray-900 leading-tight tracking-tight sm:text-2xl">
                    {{ detailsModalPackage.name }}
                  </h3>
                  <p
                    v-if="showSponsorshipPackagePrices"
                    class="mt-3 text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl"
                    :class="detailsModalTheme.price"
                  >
                    {{ formatPriceEt(detailsModalPackage.basePrice) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="flex-shrink-0 rounded-xl p-2.5 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  :class="detailsModalTheme.closeHover"
                  :aria-label="$t('exhibition.sponsorshipPackages.close')"
                  @click="closeDetailsModal"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>
              <div class="flex-1 overflow-y-auto space-y-6 px-5 pt-5 pb-8 sm:px-6 sm:pt-6 sm:pb-10">
                <p v-if="detailsModalPackage.description" class="text-sm text-gray-600 leading-relaxed">
                  {{ detailsModalPackage.description }}
                </p>
                <div>
                  <p class="text-xs font-semibold text-gray-500 mb-3">
                    {{ $t('exhibition.sponsorshipPackages.benefitsHeading') }}
                  </p>
                  <ul class="space-y-2.5 text-sm leading-relaxed text-gray-700">
                    <li v-for="(line, idx) in featureBullets(detailsModalPackage.features)" :key="idx" class="flex items-start gap-2.5">
                      <span
                        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                        :class="detailsModalTheme.hintChip"
                        aria-hidden="true"
                      >
                        <CheckIcon class="h-3 w-3" stroke-width="3" />
                      </span>
                      <span class="min-w-0">{{ line }}</span>
                    </li>
                  </ul>
                  <p
                    v-if="!featureBullets(detailsModalPackage.features).length"
                    class="text-sm text-gray-500 italic"
                  >
                    {{ $t('exhibition.sponsorshipPackages.noFeaturesListed') }}
                  </p>
                </div>
                <div
                  v-if="detailsModalPackage.notes"
                  class="rounded-xl border p-4"
                  :class="detailsModalTheme.notesBox"
                >
                  <p class="text-xs font-semibold mb-2" :class="detailsModalTheme.notesLabel">
                    {{ $t('exhibition.sponsorshipPackages.notesHeading') }}
                  </p>
                  <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {{ detailsModalPackage.notes }}
                  </p>
                </div>
              </div>
              <div
                class="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-3 border-t border-gray-200 px-5 py-4 sm:px-6 sm:justify-end bg-gray-50"
              >
                <button
                  type="button"
                  class="w-full rounded-full border px-5 py-3 text-sm font-semibold transition-colors sm:w-auto"
                  :class="detailsModalTheme.secondaryCta"
                  @click="closeDetailsModal"
                >
                  {{ $t('exhibition.sponsorshipPackages.close') }}
                </button>
                <button
                  type="button"
                  class="w-full rounded-full px-5 py-3 text-sm font-bold shadow-lg transition-all sm:w-auto"
                  :class="detailsModalTheme.primaryCta"
                  @click="openRegisterFromDetails"
                >
                  {{ $t('exhibition.sponsorshipPackages.enquireCta') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Register interest modal (theme follows selected package tier, or brand default) -->
    <Teleport to="body">
      <div
        v-if="registerModalOpen"
        class="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-violet-950/75 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="registerTitleId"
        @click.self="closeRegisterModal"
      >
        <div class="relative w-full max-w-lg max-h-[min(94vh,920px)] flex flex-col sm:mx-4">
          <div class="relative w-full rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <div
              class="relative z-[1] flex max-h-[min(94vh,920px)] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-gray-200 bg-white"
            >
              <div
                class="h-1.5 w-full shrink-0 sm:rounded-t-[13px]"
                :class="registerModalTheme.stripe"
              />
              <div
                class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-5 sm:px-6"
              >
                <div class="min-w-0">
                  <p
                    class="text-xs font-semibold mb-1.5"
                    :class="registerModalTheme.eyebrow"
                  >
                    {{ $t('exhibition.registerInterest.eyebrow') }}
                  </p>
                  <h3 :id="registerTitleId" class="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
                    {{ $t('exhibition.sponsorshipPackages.registerModalTitle') }}
                  </h3>
                  <p class="mt-1.5 text-sm text-gray-600 leading-relaxed">
                    {{ $t('exhibition.sponsorshipPackages.registerModalSubtitle') }}
                  </p>
                  <p
                    v-if="registerPackageHint"
                    class="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold"
                    :class="registerModalTheme.hintChip"
                  >
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="registerModalTheme.hintDot" />
                    {{ $t('exhibition.sponsorshipPackages.registerPackageHint', { name: registerPackageHint }) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="flex-shrink-0 rounded-xl p-2.5 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  :class="registerModalTheme.closeHover"
                  :aria-label="$t('exhibition.sponsorshipPackages.close')"
                  @click="closeRegisterModal"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <div class="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                <div
                  v-if="registerSubmitted"
                  class="rounded-xl border border-green-200 bg-green-50 p-8 text-center"
                >
                  <div
                    class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-green-300 bg-green-100"
                  >
                    <CheckIcon class="h-8 w-8 text-green-600" />
                  </div>
                  <p class="text-green-700 font-semibold mb-2">{{ $t('exhibition.registerInterest.successTitle') }}</p>
                  <p class="text-sm text-gray-600">{{ $t('exhibition.registerInterest.successMessage') }}</p>
                  <button
                    type="button"
                    class="mt-6 rounded-full px-6 py-3 text-sm font-bold transition-colors"
                    :class="registerModalTheme.primaryCta"
                    @click="closeRegisterModal"
                  >
                    {{ $t('exhibition.sponsorshipPackages.close') }}
                  </button>
                </div>
                <form v-else class="space-y-5" @submit.prevent="submitRegisterModal">
                  <div class="rounded-xl border p-5 sm:p-6" :class="registerModalTheme.formPanel">
                    <ExhibitionInterestFormFields
                      v-model="registerForm"
                      :interest-packages="sortedPackages"
                      :interest-packages-loading="false"
                      field-id-prefix="sp-modal-register"
                      light
                    />
                  </div>
                  <p v-if="registerError" class="text-sm text-red-600">{{ registerError }}</p>
                  <button
                    type="submit"
                    :disabled="registerSubmitting"
                    class="w-full rounded-full px-6 py-3.5 text-sm font-bold shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
                    :class="registerModalTheme.primaryCta"
                  >
                    {{
                      registerSubmitting ? $t('exhibition.registerInterest.submitting') : $t('exhibition.registerInterest.submit')
                    }}
                  </button>
                  <a
                    href="#register"
                    class="block text-center text-sm transition-colors"
                    :class="registerModalTheme.linkMuted"
                    @click="closeRegisterModal"
                  >
                    {{ $t('exhibition.sponsorshipPackages.openFullPageForm') }}
                  </a>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { XMarkIcon, SparklesIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { getActiveSponsorshipPackages, exhibitionApi } from '@/features/exhibition/api/exhibition.api'
import { listingSortTierRank } from '@/shared/utils/sponsorshipTier'
import { normalizeSponsorshipTierKey } from '@/shared/utils/exhibitionSponsorshipTierTheme'

/**
 * Light card accents for the packages grid. The shared getTierModalTheme is a
 * dark palette (used by the sponsor carousel and ad badges on dark surfaces);
 * the grid now sits on a white section, so it uses these clean per-tier
 * accents instead — a top bar, a chip, the price colour, a bullet marker, and
 * a solid CTA, with no dark gradients or glows.
 */
const LIGHT_TIER_ACCENTS = {
  DEFAULT: {
    bar: 'from-primary-400 to-primary-600',
    chip: 'border-primary-200 bg-primary-50 text-primary-700',
    price: 'text-primary-700',
    marker: 'marker:text-primary-400',
    cta: 'bg-primary-600 text-white hover:bg-primary-700',
    ring: '',
    featured: false,
  },
  EXCLUSIVE: {
    bar: 'from-gold-300 via-gold-400 to-gold-600',
    chip: 'border-gold-300 bg-gold-100 text-gold-800',
    price: 'text-gold-700',
    marker: 'marker:text-gold-500',
    cta: 'bg-gold-400 text-primary-950 hover:bg-gold-300',
    ring: 'ring-2 ring-gold-400 shadow-[0_24px_60px_-30px_rgba(217,159,63,0.55)]',
    featured: true,
  },
  PLATINUM: {
    bar: 'from-fuchsia-400 to-purple-500',
    chip: 'border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800',
    price: 'text-fuchsia-700',
    marker: 'marker:text-fuchsia-500',
    cta: 'bg-fuchsia-600 text-white hover:bg-fuchsia-700',
    ring: '',
    featured: false,
  },
  GOLD: {
    bar: 'from-orange-400 to-amber-500',
    chip: 'border-orange-300 bg-orange-100 text-orange-800',
    price: 'text-orange-700',
    marker: 'marker:text-orange-500',
    cta: 'bg-orange-500 text-white hover:bg-orange-600',
    ring: '',
    featured: false,
  },
  SILVER: {
    bar: 'from-slate-300 to-slate-500',
    chip: 'border-slate-300 bg-slate-100 text-slate-700',
    price: 'text-slate-700',
    marker: 'marker:text-slate-400',
    cta: 'bg-slate-600 text-white hover:bg-slate-700',
    ring: '',
    featured: false,
  },
  SPECIAL: {
    bar: 'from-sky-400 to-blue-500',
    chip: 'border-sky-300 bg-sky-100 text-sky-800',
    price: 'text-sky-700',
    marker: 'marker:text-sky-500',
    cta: 'bg-sky-600 text-white hover:bg-sky-700',
    ring: '',
    featured: false,
  },
}

function tierAccent(pkg) {
  return LIGHT_TIER_ACCENTS[normalizeSponsorshipTierKey(pkg?.type)] || LIGHT_TIER_ACCENTS.DEFAULT
}

/**
 * Light theme for the details / register modals, derived from the per-tier
 * light accents above. The modals sit on a white card now, so we drop the dark
 * gradient frame, glow orbs and sparkles and keep only a tier-coloured accent
 * stripe, eyebrow, price, bullet marker and CTA.
 */
function lightModalTheme(type) {
  const a = LIGHT_TIER_ACCENTS[normalizeSponsorshipTierKey(type)] || LIGHT_TIER_ACCENTS.DEFAULT
  return {
    stripe: `bg-gradient-to-r ${a.bar}`,
    eyebrow: a.price,
    price: a.price,
    bulletMarker: a.marker,
    primaryCta: a.cta,
    secondaryCta: 'border-gray-300 text-gray-700 hover:bg-gray-50',
    closeHover: 'hover:bg-gray-100',
    notesBox: 'border-gray-200 bg-gray-50',
    notesLabel: 'text-gray-500',
    hintChip: a.chip,
    hintDot: a.price.replace('text-', 'bg-'),
    formPanel: 'border-gray-200 bg-gray-50',
    linkMuted: 'text-gray-500 hover:text-primary-600'
  }
}
import ExhibitionInterestFormFields from '@/features/exhibition/components/ExhibitionInterestFormFields.vue'
import SectionHeader from '@/shared/components/SectionHeader.vue'
import { DEFAULT_COUNTRY_CODE } from '@/shared/data/countryCodes'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'
import { coerceDisplayBool } from '@/shared/utils/displaySettingsBooleans'

const PREVIEW_BULLET_COUNT = 4

const { t, locale } = useI18n()
const { settings } = useDisplaySettings()
const showSponsorshipPackagePrices = computed(() =>
  coerceDisplayBool(settings.exhibitionSponsorshipPackagePricesVisible, true)
)

const brochureHref = computed(() =>
  locale.value === 'am'
    ? '/docs/ethio-build-connect-expo-2027-brochure-am.html'
    : '/docs/ethio-build-connect-expo-2027-brochure.html'
)

const packages = ref([])
const loading = ref(true)
const errorMessage = ref('')

const detailsModalPackage = ref(null)
const detailsTitleId = 'sp-package-details-title'

const registerModalOpen = ref(false)
const registerTitleId = 'sp-register-interest-title'
const registerForm = ref(emptyRegisterForm())
const registerError = ref('')
const registerSubmitting = ref(false)
const registerSubmitted = ref(false)

function emptyRegisterForm() {
  return {
    email: '',
    phoneCountryCode: DEFAULT_COUNTRY_CODE,
    phoneNumber: '',
    organizationType: '',
    interestType: 'exhibitor',
    partnerRole: 'MEDIA_PARTNER',
    visibilityScope: 'BOTH',
    contributionMode: 'IN_KIND',
    sponsorshipId: '',
    company: '',
    message: ''
  }
}

const sortedPackages = computed(() => {
  const list = [...packages.value]
  list.sort((a, b) => {
    const ra = listingSortTierRank(a.type)
    const rb = listingSortTierRank(b.type)
    if (ra !== rb) return ra - rb
    return (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0)
  })
  return list
})

const registerPackageHint = computed(() => {
  const id = (registerForm.value.sponsorshipId || '').trim()
  if (!id) return ''
  const p = sortedPackages.value.find((x) => x.id === id)
  return p?.name || ''
})

const detailsModalTheme = computed(() => lightModalTheme(detailsModalPackage.value?.type))

const registerModalTheme = computed(() => {
  const id = (registerForm.value.sponsorshipId || '').trim()
  const pkg = sortedPackages.value.find((x) => x.id === id)
  return lightModalTheme(pkg?.type)
})

function featureBullets(features) {
  if (!features || !String(features).trim()) return []
  const raw = String(features).trim()
  const bySemi = raw
    .split(/;\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (bySemi.length > 1) return bySemi
  const byPeriod = raw
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (byPeriod.length > 1) {
    return byPeriod.map((s) => (s.endsWith('.') ? s : `${s}.`))
  }
  return [raw]
}

function featurePreviewBullets(pkg) {
  const all = featureBullets(pkg.features)
  return all.slice(0, PREVIEW_BULLET_COUNT)
}

function hasTruncatedFeatures(pkg) {
  return featureBullets(pkg.features).length > PREVIEW_BULLET_COUNT
}

function formatPriceEt(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return `ETB ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function formatTierLabel(type) {
  const u = String(type || '').toUpperCase()
  const key = `exhibition.sponsorshipPackages.tier.${u}`
  const translated = t(key)
  if (translated !== key) return translated
  return u || '—'
}

function openDetailsModal(pkg) {
  detailsModalPackage.value = pkg
}

function closeDetailsModal() {
  detailsModalPackage.value = null
}

function openRegisterModal(pkg) {
  registerForm.value = emptyRegisterForm()
  registerForm.value.interestType = 'exhibitor'
  if (pkg?.id) {
    registerForm.value.sponsorshipId = pkg.id
  }
  registerError.value = ''
  registerSubmitted.value = false
  registerModalOpen.value = true
}

function openRegisterFromDetails() {
  const pkg = detailsModalPackage.value
  closeDetailsModal()
  openRegisterModal(pkg || null)
}

function closeRegisterModal() {
  registerModalOpen.value = false
  registerError.value = ''
}

async function submitRegisterModal() {
  registerError.value = ''
  const it = registerForm.value.interestType || 'visitor'
  if (it === 'exhibitor' && !(registerForm.value.sponsorshipId || '').trim()) {
    registerError.value = t('exhibition.registerInterest.sponsorshipPackageRequired')
    return
  }
  if (!(registerForm.value.organizationType || '').trim()) {
    registerError.value = t('exhibition.registerInterest.organizationCategoryRequired')
    return
  }
  registerSubmitting.value = true
  try {
    const combinedPhone = (registerForm.value.phoneNumber || '').trim()
      ? (registerForm.value.phoneCountryCode || DEFAULT_COUNTRY_CODE) + (registerForm.value.phoneNumber || '').trim()
      : undefined
    const payload = {
      email: registerForm.value.email,
      phoneNumber: combinedPhone,
      organizationType: registerForm.value.organizationType,
      interestType: it,
      company: registerForm.value.company || undefined,
      message: registerForm.value.message || undefined
    }
    if ((it === 'exhibitor' || it === 'partner') && registerForm.value.sponsorshipId) {
      payload.sponsorshipId = registerForm.value.sponsorshipId
    }
    if (it === 'partner') {
      payload.partnerRole = registerForm.value.partnerRole
      payload.visibilityScope = registerForm.value.visibilityScope
      payload.contributionMode = registerForm.value.contributionMode
    }
    await exhibitionApi.registerInterest(payload)
    registerSubmitted.value = true
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || true
    registerError.value = typeof msg === 'string' ? msg : t('exhibition.registerInterest.errorGeneric')
  } finally {
    registerSubmitting.value = false
  }
}

async function loadPackages() {
  loading.value = true
  errorMessage.value = ''
  try {
    packages.value = await getActiveSponsorshipPackages()
  } catch {
    packages.value = []
    errorMessage.value = t('exhibition.sponsorshipPackages.loadError')
  } finally {
    loading.value = false
  }
}

let escapeHandler = null

function syncBodyScrollLock() {
  const open = Boolean(detailsModalPackage.value) || registerModalOpen.value
  document.documentElement.classList.toggle('overflow-hidden', open)
}

function attachModalListeners() {
  if (escapeHandler) {
    window.removeEventListener('keydown', escapeHandler)
    escapeHandler = null
  }
  const anyOpen = Boolean(detailsModalPackage.value) || registerModalOpen.value
  syncBodyScrollLock()
  if (!anyOpen) return
  escapeHandler = (e) => {
    if (e.key !== 'Escape') return
    if (registerModalOpen.value) closeRegisterModal()
    else closeDetailsModal()
  }
  window.addEventListener('keydown', escapeHandler)
}

watch([detailsModalPackage, registerModalOpen], attachModalListeners, { flush: 'post' })

onMounted(() => {
  loadPackages()
})

onUnmounted(() => {
  if (escapeHandler) window.removeEventListener('keydown', escapeHandler)
  document.documentElement.classList.remove('overflow-hidden')
})
</script>

<style scoped>
/* Subtle “premium stripe” pulse — common on highlighted SaaS / pricing tiers */
@keyframes tier-modal-stripe-shimmer {
  0%,
  100% {
    opacity: 0.88;
    filter: brightness(1);
  }
  50% {
    opacity: 1;
    filter: brightness(1.12);
  }
}
.tier-modal-stripe-shimmer {
  animation: tier-modal-stripe-shimmer 2.8s ease-in-out infinite;
}
</style>

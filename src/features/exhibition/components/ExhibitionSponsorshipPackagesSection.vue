<template>
  <section
    id="sponsorship-packages"
    class="relative scroll-mt-20 border-t-2 border-black/50 bg-gradient-to-b from-violet-900 to-violet-950 py-16 lg:py-24 text-white"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mb-10 lg:mb-14">
        <p class="text-white text-xs font-semibold uppercase tracking-[0.2em] mb-3">
          {{ $t('exhibition.sponsorshipPackages.eyebrow') }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-4">
          {{ $t('exhibition.sponsorshipPackages.title') }}
        </h2>
        <p class="text-white/80 text-base leading-relaxed">
          {{ $t('exhibition.sponsorshipPackages.subtitle') }}
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div
          class="h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent"
          aria-hidden="true"
        />
      </div>

      <p v-else-if="errorMessage" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {{ errorMessage }}
        <button type="button" class="ml-2 underline hover:text-white" @click="loadPackages">
          {{ $t('exhibition.sponsorshipPackages.retry') }}
        </button>
      </p>

      <p v-else-if="!sortedPackages.length" class="text-center text-sm text-white/70 py-12">
        {{ $t('exhibition.sponsorshipPackages.empty') }}
      </p>

      <div v-else class="grid gap-6 lg:gap-8 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="pkg in sortedPackages"
          :key="pkg.id"
          class="group flex h-full flex-col motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1"
        >
          <div
            class="relative flex min-h-0 flex-1 flex-col rounded-2xl p-px bg-gradient-to-br transition-shadow duration-300 group-hover:shadow-2xl"
            :class="[cardTheme(pkg).borderGradient, cardTheme(pkg).shadowGlow]"
          >
            <div
              class="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              aria-hidden="true"
            >
              <div
                class="absolute -top-10 -right-8 h-28 w-28 rounded-full blur-2xl opacity-[0.55] motion-safe:group-hover:opacity-80 motion-safe:transition-opacity"
                :class="cardTheme(pkg).orb1"
              />
              <div
                class="absolute -bottom-14 -left-10 h-36 w-36 rounded-full blur-2xl opacity-40"
                :class="cardTheme(pkg).orb2"
              />
            </div>
            <div
              class="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[15px] border border-white/10 bg-zinc-950/92 backdrop-blur-sm"
            >
              <div
                class="h-1 w-full shrink-0"
                :class="[cardTheme(pkg).stripe, cardTheme(pkg).stripeAnimate ? 'tier-modal-stripe-shimmer' : '']"
              />
              <div
                class="shrink-0 border-b border-white/5 px-5 pb-3 pt-4 sm:px-6 sm:pt-5"
                :class="cardTheme(pkg).headerBg"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <span
                    class="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                    :class="cardTheme(pkg).hintChip"
                  >
                    <SparklesIcon
                      v-if="cardTheme(pkg).showSparkles"
                      class="h-3.5 w-3.5 shrink-0 opacity-90"
                      aria-hidden="true"
                    />
                    {{ formatTierLabel(pkg.type) }}
                  </span>
                  <p
                    v-if="showSponsorshipPackagePrices"
                    class="text-right text-lg font-bold tabular-nums leading-tight tracking-tight"
                    :class="cardTheme(pkg).price"
                  >
                    {{ formatPriceEt(pkg.basePrice) }}
                  </p>
                </div>
              </div>
              <div class="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4 sm:px-6">
                <h3 class="shrink-0 text-lg font-semibold text-white leading-snug mb-2">
                  {{ pkg.name }}
                </h3>
                <p
                  v-if="pkg.description"
                  class="shrink-0 text-sm text-white/80 leading-relaxed mb-4 line-clamp-3"
                >
                  {{ pkg.description }}
                </p>
                <!-- Scroll features only so payment notes + CTA stay fully visible in equal-height grid rows -->
                <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-0.5 [-webkit-overflow-scrolling:touch]">
                  <p class="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                    {{ $t('exhibition.sponsorshipPackages.benefitsHeading') }}
                  </p>
                  <ul
                    class="space-y-2 text-sm text-white/85 leading-relaxed list-disc pl-4 pb-1"
                    :class="cardTheme(pkg).bulletMarker"
                  >
                    <li v-for="(line, idx) in featurePreviewBullets(pkg)" :key="idx">
                      {{ line }}
                    </li>
                  </ul>
                  <button
                    v-if="hasTruncatedFeatures(pkg)"
                    type="button"
                    class="mt-3 text-sm font-semibold underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-sm hover:underline"
                    :class="cardTheme(pkg).linkMuted"
                    @click="openDetailsModal(pkg)"
                  >
                    {{ $t('exhibition.sponsorshipPackages.seeMore') }}
                  </button>
                  <button
                    v-else-if="featureBullets(pkg.features).length === 0 && (pkg.description || pkg.notes)"
                    type="button"
                    class="mt-3 text-sm font-semibold underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-sm hover:underline"
                    :class="cardTheme(pkg).linkMuted"
                    @click="openDetailsModal(pkg)"
                  >
                    {{ $t('exhibition.sponsorshipPackages.viewDetails') }}
                  </button>
                </div>
                <div
                  v-if="pkg.notes"
                  class="mt-4 shrink-0 rounded-lg border px-3 py-3 text-xs leading-relaxed text-white/85 break-words [overflow-wrap:anywhere]"
                  :class="cardTheme(pkg).notesBox"
                >
                  {{ pkg.notes }}
                </div>
                <button
                  type="button"
                  class="mt-5 shrink-0 inline-flex w-full items-center justify-center px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md group-hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-zinc-950"
                  :class="cardTheme(pkg).primaryCta"
                  @click="openRegisterModal(pkg)"
                >
                  {{ $t('exhibition.sponsorshipPackages.enquireCta') }}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div
        class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/5 px-6 py-8"
      >
        <button
          type="button"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-950 font-semibold text-sm uppercase tracking-wider hover:bg-violet-100 hover:text-violet-950 transition-colors min-w-[200px] rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-zinc-900"
          @click="openRegisterModal(null)"
        >
          {{ $t('exhibition.cta.standEnquiry') }}
        </button>
        <a
          :href="brochureHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm uppercase tracking-wider hover:bg-white/10 hover:text-white transition-colors min-w-[200px] rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900"
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
          <div
            class="relative w-full rounded-t-2xl sm:rounded-2xl p-px bg-gradient-to-br shadow-2xl"
            :class="[detailsModalTheme.borderGradient, detailsModalTheme.shadowGlow]"
          >
            <div
              class="pointer-events-none absolute inset-0 overflow-hidden rounded-t-2xl sm:rounded-2xl rounded-b-none sm:rounded-b-2xl"
              aria-hidden="true"
            >
              <div
                class="absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl motion-safe:animate-pulse"
                :class="detailsModalTheme.orb1"
              />
              <div
                class="absolute -bottom-28 -left-16 h-72 w-72 rounded-full blur-3xl opacity-80"
                :class="detailsModalTheme.orb2"
              />
              <div
                v-if="detailsModalTheme.showSparkles"
                class="absolute top-16 right-12 h-px w-24 rotate-45 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              <div
                v-if="detailsModalTheme.showSparkles"
                class="absolute top-24 right-8 h-px w-16 -rotate-12 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"
              />
            </div>
            <div
              class="relative flex max-h-[min(92vh,900px)] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl"
            >
              <div
                class="h-1.5 w-full shrink-0 sm:rounded-t-[13px]"
                :class="[detailsModalTheme.stripe, detailsModalTheme.stripeAnimate ? 'tier-modal-stripe-shimmer' : '']"
              />
              <div
                class="flex-shrink-0 flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6 border-white/10"
                :class="detailsModalTheme.headerBg"
              >
                <div class="relative min-w-0">
                  <SparklesIcon
                    v-if="detailsModalTheme.showSparkles"
                    class="absolute -left-1 -top-1 h-5 w-5 text-amber-300/80 motion-safe:animate-pulse"
                    aria-hidden="true"
                  />
                  <p
                    class="text-xs font-bold uppercase tracking-[0.2em] mb-1.5 pl-0 sm:pl-6"
                    :class="detailsModalTheme.eyebrow"
                  >
                    {{ formatTierLabel(detailsModalPackage.type) }}
                  </p>
                  <h3 :id="detailsTitleId" class="text-xl font-bold text-white leading-tight tracking-tight">
                    {{ detailsModalPackage.name }}
                  </h3>
                  <p
                    v-if="showSponsorshipPackagePrices"
                    class="mt-3 text-2xl font-bold tabular-nums tracking-tight"
                    :class="detailsModalTheme.price"
                  >
                    {{ formatPriceEt(detailsModalPackage.basePrice) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="flex-shrink-0 rounded-xl p-2.5 text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-black"
                  :class="detailsModalTheme.closeHover"
                  :aria-label="$t('exhibition.sponsorshipPackages.close')"
                  @click="closeDetailsModal"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>
              <div class="flex-1 overflow-y-auto space-y-6 px-5 pt-5 pb-8 sm:px-6 sm:pt-6 sm:pb-10">
                <p v-if="detailsModalPackage.description" class="text-sm text-white/85 leading-relaxed">
                  {{ detailsModalPackage.description }}
                </p>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
                    {{ $t('exhibition.sponsorshipPackages.benefitsHeading') }}
                  </p>
                  <ul
                    class="space-y-2.5 text-sm text-white/85 leading-relaxed list-disc pl-4"
                    :class="detailsModalTheme.bulletMarker"
                  >
                    <li v-for="(line, idx) in featureBullets(detailsModalPackage.features)" :key="idx">
                      {{ line }}
                    </li>
                  </ul>
                  <p
                    v-if="!featureBullets(detailsModalPackage.features).length"
                    class="text-sm text-white/70 italic"
                  >
                    {{ $t('exhibition.sponsorshipPackages.noFeaturesListed') }}
                  </p>
                </div>
                <div
                  v-if="detailsModalPackage.notes"
                  class="rounded-xl border p-4"
                  :class="detailsModalTheme.notesBox"
                >
                  <p class="text-xs font-semibold uppercase tracking-wider mb-2" :class="detailsModalTheme.notesLabel">
                    {{ $t('exhibition.sponsorshipPackages.notesHeading') }}
                  </p>
                  <p class="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
                    {{ detailsModalPackage.notes }}
                  </p>
                </div>
              </div>
              <div
                class="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-3 border-t border-white/10 px-5 py-4 sm:px-6 sm:justify-end bg-zinc-950/80"
              >
                <button
                  type="button"
                  class="w-full sm:w-auto px-5 py-3 border text-white text-sm font-semibold rounded-xl transition-colors"
                  :class="detailsModalTheme.secondaryCta"
                  @click="closeDetailsModal"
                >
                  {{ $t('exhibition.sponsorshipPackages.close') }}
                </button>
                <button
                  type="button"
                  class="w-full sm:w-auto px-5 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg"
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
          <div
            class="relative w-full rounded-t-2xl sm:rounded-2xl p-px bg-gradient-to-br shadow-2xl"
            :class="[registerModalTheme.borderGradient, registerModalTheme.shadowGlow]"
          >
            <div
              class="pointer-events-none absolute inset-0 overflow-hidden rounded-t-2xl sm:rounded-2xl rounded-b-none sm:rounded-b-2xl z-0"
              aria-hidden="true"
            >
              <div
                class="absolute -top-20 -right-16 h-56 w-56 rounded-full blur-3xl motion-safe:animate-pulse"
                :class="registerModalTheme.orb1"
              />
              <div
                class="absolute bottom-0 -left-12 h-48 w-48 rounded-full blur-3xl opacity-70"
                :class="registerModalTheme.orb2"
              />
            </div>
            <div
              class="relative z-[1] flex max-h-[min(94vh,920px)] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl"
            >
              <div
                class="h-1.5 w-full shrink-0 sm:rounded-t-[13px]"
                :class="[registerModalTheme.stripe, registerModalTheme.stripeAnimate ? 'tier-modal-stripe-shimmer' : '']"
              />
              <div
                class="flex-shrink-0 flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6 border-white/10"
                :class="registerModalTheme.headerBg"
              >
                <div class="min-w-0">
                  <p
                    class="text-xs font-bold uppercase tracking-[0.2em] mb-1.5"
                    :class="registerModalTheme.eyebrow"
                  >
                    {{ $t('exhibition.registerInterest.eyebrow') }}
                  </p>
                  <h3 :id="registerTitleId" class="text-xl font-bold text-white tracking-tight">
                    {{ $t('exhibition.sponsorshipPackages.registerModalTitle') }}
                  </h3>
                  <p class="mt-1.5 text-sm text-white/80 leading-relaxed">
                    {{ $t('exhibition.sponsorshipPackages.registerModalSubtitle') }}
                  </p>
                  <p
                    v-if="registerPackageHint"
                    class="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
                    :class="registerModalTheme.hintChip"
                  >
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="registerModalTheme.hintDot" />
                    {{ $t('exhibition.sponsorshipPackages.registerPackageHint', { name: registerPackageHint }) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="flex-shrink-0 rounded-xl p-2.5 text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-black"
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
                  class="rounded-xl border border-green-500/30 bg-gradient-to-b from-green-500/15 to-zinc-900/50 p-8 text-center"
                >
                  <div
                    class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-green-400/40 bg-green-500/20"
                  >
                    <CheckIcon class="h-8 w-8 text-green-300" />
                  </div>
                  <p class="text-green-200 font-semibold mb-2">{{ $t('exhibition.registerInterest.successTitle') }}</p>
                  <p class="text-sm text-white/80">{{ $t('exhibition.registerInterest.successMessage') }}</p>
                  <button
                    type="button"
                    class="mt-6 px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-colors"
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
                    />
                  </div>
                  <p v-if="registerError" class="text-sm text-red-400">{{ registerError }}</p>
                  <button
                    type="submit"
                    :disabled="registerSubmitting"
                    class="w-full py-3.5 px-6 font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:shadow-none"
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
import { getTierModalTheme } from '@/shared/utils/exhibitionSponsorshipTierTheme'
import ExhibitionInterestFormFields from '@/features/exhibition/components/ExhibitionInterestFormFields.vue'
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
    ? '/docs/ethio-build-connect-expo-2026-brochure-am.html'
    : '/docs/ethio-build-connect-expo-2026-brochure.html'
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

/** Same palette as modals — keeps cards and dialogs visually aligned per tier. */
function cardTheme(pkg) {
  return getTierModalTheme(pkg?.type)
}

const detailsModalTheme = computed(() => getTierModalTheme(detailsModalPackage.value?.type))

const registerModalTheme = computed(() => {
  const id = (registerForm.value.sponsorshipId || '').trim()
  const pkg = sortedPackages.value.find((x) => x.id === id)
  return getTierModalTheme(pkg?.type)
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
    if (it === 'exhibitor' && registerForm.value.sponsorshipId) {
      payload.sponsorshipId = registerForm.value.sponsorshipId
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

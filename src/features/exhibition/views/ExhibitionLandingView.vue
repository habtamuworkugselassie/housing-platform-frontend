<template>
  <div class="exhibition-landing overflow-x-hidden bg-black text-white">
    <!-- Planning the exhibition — professional intro for market -->
    <section id="planning" class="relative border-b border-white/10 bg-gradient-to-b from-zinc-900 to-black py-12 sm:py-16 lg:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl border-l-2 border-yellow-400 pl-6 sm:pl-8">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400 mb-4">
            {{ $t('exhibition.planning.badge') }}
          </p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
            {{ $t('exhibition.planning.title') }}
          </h2>
          <p class="mt-4 text-base sm:text-lg text-gray-400 leading-relaxed">
            {{ $t('exhibition.planning.body') }}
          </p>
          <p class="mt-4 text-sm text-gray-500">
            {{ $t('exhibition.planning.whoShowcases') }}
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#register"
              class="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors"
            >
              {{ $t('exhibition.planning.cta') }}
            </a>
            <a
              href="#show-features"
              class="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white font-semibold text-sm uppercase tracking-wider hover:bg-white/10 hover:border-yellow-400 transition-colors"
            >
              {{ $t('exhibition.keyShowFeatures.exploreMore') }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured properties (real estate listings — scroll target for "Browse listings" from hero) -->
    <section id="main-listings" class="bg-zinc-950 border-t border-white/10 py-12 lg:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400 mb-2">
          {{ $t('exhibition.featuredListings.eyebrow') }}
        </p>
        <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">
          {{ $t('property.properties') }}
        </h2>
        <p class="text-sm text-gray-500 max-w-2xl mb-6">
          {{ $t('exhibition.featuredListings.subtext') }}
        </p>
        <div v-if="propertiesLoading" class="flex justify-center py-12">
          <div class="inline-block h-10 w-10 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
        </div>
        <div v-else-if="propertiesList.length" class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          <a
            v-for="item in propertiesList"
            :key="item.id"
            :href="`/properties/${item.id}`"
            class="group flex flex-col overflow-hidden rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/10 hover:shadow-lg hover:shadow-yellow-400/5"
          >
            <div class="relative aspect-[5/3] flex-shrink-0 overflow-hidden bg-zinc-800">
              <img
                v-if="item.images?.[0]?.imageUrl || item.imageUrls?.[0]"
                :src="item.images?.[0]?.imageUrl || item.imageUrls?.[0]"
                :alt="item.title"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div v-else class="flex h-full items-center justify-center text-3xl text-gray-500">🏠</div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
              <span class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {{ item.city }}{{ item.country ? `, ${item.country}` : '' }}
              </span>
            </div>
            <div class="flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
              <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-yellow-400/95">
                {{ item.title }}
              </h3>
              <p v-if="item.priceETB || item.priceUSD" class="mt-1.5 text-sm font-bold text-yellow-400">
                {{ item.priceETB ? formatPrice(item.priceETB, 'ETB') : '' }}
                <span v-if="item.priceETB && item.priceUSD" class="font-normal text-gray-500">/</span>
                {{ item.priceUSD ? formatPrice(item.priceUSD, 'USD') : '' }}
              </p>
            </div>
          </a>
        </div>
        <p v-else class="py-8 text-center text-sm text-gray-400">
          {{ $t('property.noProperties') }}
        </p>
        <!-- Pagination -->
        <div v-if="propertiesTotalPages > 1" class="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            :disabled="propertiesPage === 0"
            class="rounded border border-white/30 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50 disabled:text-gray-500"
            @click="propertiesPage = Math.max(0, propertiesPage - 1)"
          >
            {{ $t('common.previous') }}
          </button>
          <span class="px-4 text-sm text-gray-300">
            {{ $t('common.page') }} {{ propertiesPage + 1 }} {{ $t('common.of') }} {{ propertiesTotalPages }}
          </span>
          <button
            type="button"
            :disabled="propertiesPage >= propertiesTotalPages - 1"
            class="rounded border border-white/30 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50 disabled:text-gray-500"
            @click="propertiesPage = Math.min(propertiesTotalPages - 1, propertiesPage + 1)"
          >
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </section>

    <!-- What to expect (3 cards with icons + numbers) -->
    <section class="py-16 lg:py-24 bg-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400 mb-2">
          {{ $t('exhibition.whatToExpect.eyebrow') }}
        </p>
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white mb-3">
          {{ $t('exhibition.whatHappened.title') }}
        </h2>
        <p class="text-gray-400 max-w-2xl mb-10">
          {{ $t('exhibition.whatHappened.subtitle') }}
        </p>
        <div class="grid md:grid-cols-3 gap-5 lg:gap-6">
          <div
            v-for="(card, index) in whatToExpectCards"
            :key="card.titleKey"
            class="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-6 sm:p-7 transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/10"
          >
            <div class="mb-4 flex items-center justify-between">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-400/20 text-yellow-400 transition-colors group-hover:bg-yellow-400/30">
                <component :is="card.icon" class="h-6 w-6" aria-hidden="true" />
              </div>
              <span class="text-2xl font-bold tabular-nums text-white/25" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <h3 class="text-base font-bold uppercase tracking-tight text-white mb-2 group-hover:text-yellow-400/95">
              {{ $t(card.titleKey) }}
            </h3>
            <p class="text-sm text-gray-400 leading-relaxed flex-1">
              {{ $t(card.bodyKey) }}
            </p>
          </div>
        </div>
        <div class="mt-10 text-center">
          <a href="#register" class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-yellow-400 hover:text-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1">
            {{ $t('exhibition.planning.cta') }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- Why participate / Key show features -->
    <section id="show-features" class="py-16 lg:py-24 bg-zinc-950 border-t border-white/10 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400 mb-2">
          {{ $t('exhibition.keyShowFeatures.eyebrow') }}
        </p>
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-3 text-white">
          {{ $t('exhibition.keyShowFeatures.title') }}
        </h2>
        <p class="text-gray-400 max-w-2xl mb-2">
          {{ $t('exhibition.keyShowFeatures.subtitle') }}
        </p>
        <p class="text-sm text-gray-500 max-w-2xl mb-10">
          {{ $t('exhibition.keyShowFeatures.intro') }}
        </p>
        <PillarGrid compact dark />
        <div class="mt-12 rounded-xl border border-white/10 bg-white/5 px-6 py-8 sm:px-8 sm:py-10 text-center">
          <p class="text-sm text-gray-400 max-w-xl mx-auto mb-5">
            {{ $t('exhibition.keyShowFeatures.exploreMoreHint') }}
          </p>
          <a
            href="#who-attends"
            class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white font-semibold text-sm uppercase tracking-wider text-black rounded-lg hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            {{ $t('exhibition.keyShowFeatures.exploreMoreLabel') }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- Who Attends -->
    <section id="who-attends" class="py-20 lg:py-28 bg-zinc-950 border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400 mb-2">
          {{ $t('exhibition.whoAttends.eyebrow') }}
        </p>
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-4 text-white">{{ $t('exhibition.whoAttends.title') }}</h2>
        <p class="text-gray-400 max-w-2xl mb-12">
          {{ $t('exhibition.whoAttends.subtitle') }}
        </p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="audience in whoAttends"
            :key="audience.key"
            class="block p-6 rounded-lg bg-white/5 border border-white/10 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-300 group border-l-2 border-l-transparent group-hover:border-l-yellow-400"
          >
            <h3 class="text-sm font-bold uppercase tracking-tight text-white mb-1">{{ $t(audience.titleKey) }}</h3>
            <p class="text-xs text-gray-500 group-hover:text-gray-400">{{ $t(audience.descKey) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Value chain / Sectors -->
    <ValueChainGrid />

    <!-- Testimonial -->
    <section class="py-20 lg:py-24 bg-black border-t border-white/10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400 mb-4 text-center">
          {{ $t('exhibition.testimonial.eyebrow') }}
        </p>
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white mb-10 text-center">
          {{ $t('exhibition.testimonial.title') }}
        </h2>
        <blockquote class="pl-6 sm:pl-8 border-l-4 border-yellow-400 text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
          {{ $t('exhibition.testimonial.quote') }}
        </blockquote>
        <p class="text-sm text-gray-500 uppercase tracking-wider">{{ $t('exhibition.testimonial.author') }}</p>
      </div>
    </section>

    <!-- Plan your visit -->
    <section class="py-20 lg:py-28 bg-zinc-950 border-t border-white/10 text-white">
      <div class="max-w-3xl mx-auto px-4 text-center rounded-2xl border border-white/10 bg-white/5 py-16 sm:py-20">
        <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-4 text-white">{{ $t('exhibition.planVisit.title') }}</h2>
        <p class="text-lg text-gray-400 mb-10">
          {{ $t('exhibition.planVisit.body') }}
        </p>
        <a href="#register" class="inline-flex px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-zinc-950">
          {{ $t('exhibition.planVisit.planYourVisit') }}
        </a>
      </div>
    </section>

    <!-- Register your interest (scroll target for #register) -->
    <section id="register" class="py-20 lg:py-28 bg-black border-t border-white/10 text-white scroll-mt-20">
      <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400 mb-2 text-center">
          {{ $t('exhibition.registerInterest.eyebrow') }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-4 text-white text-center">
          {{ $t('exhibition.registerInterest.title') }}
        </h2>
        <p class="text-gray-400 text-center mb-10">
          {{ $t('exhibition.registerInterest.subtitle') }}
        </p>
        <form
          v-if="!interestSubmitted"
          class="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8"
          @submit.prevent="submitInterest"
        >
          <div>
            <label for="interest-email" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('exhibition.registerInterest.email') }}</label>
            <input
              id="interest-email"
              v-model="interestForm.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              :placeholder="$t('exhibition.registerInterest.emailPlaceholder')"
            />
          </div>
          <div>
            <label for="interest-phone" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('exhibition.registerInterest.phone') }}</label>
            <input
              id="interest-phone"
              v-model="interestForm.phoneNumber"
              type="tel"
              class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              :placeholder="$t('exhibition.registerInterest.phonePlaceholder')"
            />
          </div>
          <div>
            <label for="interest-org-type" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('exhibition.registerInterest.organizationType') }}</label>
            <select
              id="interest-org-type"
              v-model="interestForm.organizationType"
              required
              class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="" disabled>{{ $t('exhibition.registerInterest.selectOrganizationType') }}</option>
              <option value="REAL_ESTATE_COMPANY">{{ $t('exhibition.registerInterest.orgTypeRealEstate') }}</option>
              <option value="CONTRACTOR">{{ $t('exhibition.registerInterest.orgTypeContractor') }}</option>
              <option value="DEVELOPER">{{ $t('exhibition.registerInterest.orgTypeDeveloper') }}</option>
              <option value="SUPPLIER">{{ $t('exhibition.registerInterest.orgTypeSupplier') }}</option>
              <option value="CONSULTANT">{{ $t('exhibition.registerInterest.orgTypeConsultant') }}</option>
              <option value="ARCHITECT">{{ $t('exhibition.registerInterest.orgTypeArchitect') }}</option>
              <option value="FINISHING_CONTRACTOR">{{ $t('exhibition.registerInterest.orgTypeFinishingContractor') }}</option>
            </select>
          </div>
          <div>
            <label for="interest-type" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('exhibition.registerInterest.interestType') }}</label>
            <select
              id="interest-type"
              v-model="interestForm.interestType"
              required
              class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="" disabled>{{ $t('exhibition.registerInterest.selectType') }}</option>
              <option value="exhibitor">{{ $t('exhibition.registerInterest.asExhibitor') }}</option>
              <option value="visitor">{{ $t('exhibition.registerInterest.asVisitor') }}</option>
            </select>
          </div>
          <div>
            <label for="interest-company" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('exhibition.registerInterest.companyOptional') }}</label>
            <input
              id="interest-company"
              v-model="interestForm.company"
              type="text"
              class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              :placeholder="$t('exhibition.registerInterest.companyPlaceholder')"
            />
          </div>
          <div>
            <label for="interest-message" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('exhibition.registerInterest.messageOptional') }}</label>
            <textarea
              id="interest-message"
              v-model="interestForm.message"
              rows="3"
              class="w-full px-4 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
              :placeholder="$t('exhibition.registerInterest.messagePlaceholder')"
            />
          </div>
          <p v-if="interestError" class="text-sm text-red-400">{{ interestError }}</p>
          <button
            type="submit"
            :disabled="interestSubmitting"
            class="w-full py-3 px-6 bg-white text-black font-semibold text-sm uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:bg-white/50"
          >
            {{ interestSubmitting ? $t('exhibition.registerInterest.submitting') : $t('exhibition.registerInterest.submit') }}
          </button>
        </form>
        <div
          v-else
          class="rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center"
        >
          <p class="text-green-200 font-semibold mb-2">{{ $t('exhibition.registerInterest.successTitle') }}</p>
          <p class="text-sm text-gray-400">{{ $t('exhibition.registerInterest.successMessage') }}</p>
        </div>
      </div>
    </section>

    <!-- Foundation Partners -->
    <section id="partners" class="py-16 bg-zinc-950 border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-yellow-400/90 text-xs font-semibold uppercase tracking-[0.25em] mb-8">{{ $t('exhibition.partners.foundationPartners') }}</p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center">
          <div v-for="i in 6" :key="i" class="h-14 w-32 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 text-xs">
            {{ $t('exhibition.partners.slotAvailable') }}
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="relative py-20 lg:py-24 bg-gradient-to-b from-zinc-900 to-black border-t-2 border-yellow-400/50">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <p class="text-yellow-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">{{ $t('exhibition.cta.eyebrow') }}</p>
        <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-4">{{ $t('exhibition.cta.title') }}</h2>
        <p class="text-gray-400 mb-10">
          {{ $t('exhibition.cta.body') }}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#register" class="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors min-w-[200px] rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black">
            {{ $t('exhibition.cta.standEnquiry') }}
          </a>
          <a href="#brochure" class="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors min-w-[200px] rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
            {{ $t('exhibition.cta.viewBrochure') }}
          </a>
        </div>
      </div>
    </section>

    <!-- Message carousel (Why exhibit / Why visit) — at end for optional engagement -->
    <ExhibitionMessageCarousel />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { propertyApi } from '@/features/property/api/property.api'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'
import { formatPrice } from '@/shared/utils'
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'
import PillarGrid from '../components/PillarGrid.vue'
import ValueChainGrid from '../components/ValueChainGrid.vue'
import ExhibitionMessageCarousel from '../components/ExhibitionMessageCarousel.vue'

const route = useRoute()

const whatToExpectCards = [
  { titleKey: 'exhibition.whatHappened.card1Title', bodyKey: 'exhibition.whatHappened.card1Body', icon: BuildingOffice2Icon },
  { titleKey: 'exhibition.whatHappened.card2Title', bodyKey: 'exhibition.whatHappened.card2Body', icon: UserGroupIcon },
  { titleKey: 'exhibition.whatHappened.card3Title', bodyKey: 'exhibition.whatHappened.card3Body', icon: LightBulbIcon }
]
const { t } = useI18n()

// Register interest form (exhibition) – creates Organization and ExhibitionInterest in backend
const interestForm = ref({
  email: '',
  phoneNumber: '',
  organizationType: '',
  interestType: '',
  company: '',
  message: ''
})
const interestSubmitting = ref(false)
const interestSubmitted = ref(false)
const interestError = ref('')
async function submitInterest() {
  interestError.value = ''
  interestSubmitting.value = true
  try {
    await exhibitionApi.registerInterest({
      email: interestForm.value.email,
      phoneNumber: interestForm.value.phoneNumber || undefined,
      organizationType: interestForm.value.organizationType,
      interestType: interestForm.value.interestType || 'visitor',
      company: interestForm.value.company || undefined,
      message: interestForm.value.message || undefined
    })
    interestSubmitted.value = true
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || true
    interestError.value = typeof msg === 'string' ? msg : t('exhibition.registerInterest.errorGeneric')
  } finally {
    interestSubmitting.value = false
  }
}

// Paged properties list
const propertiesList = ref([])
const propertiesLoading = ref(false)
const propertiesPage = ref(0)
const propertiesTotalPages = ref(0)
const propertiesPageSize = 12

const loadProperties = async () => {
  propertiesLoading.value = true
  try {
    const res = await propertyApi.getProperties(
      { status: 'AVAILABLE' },
      { page: propertiesPage.value, size: propertiesPageSize }
    )
    const content = res.content ?? (Array.isArray(res) ? res : [])
    propertiesList.value = content
    propertiesTotalPages.value = res.totalPages ?? (Math.ceil((res.totalElements ?? 0) / propertiesPageSize) || 1)
  } catch (err) {
    console.error('Failed to load properties:', err)
    propertiesList.value = []
    propertiesTotalPages.value = 0
  } finally {
    propertiesLoading.value = false
  }
}


watch(propertiesPage, loadProperties)
onMounted(loadProperties)

function scrollToHash() {
  const hash = route.hash || (typeof window !== 'undefined' ? window.location.hash : '')
  if (!hash) return
  const id = hash.replace(/^#/, '')
  nextTick(() => {
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  })
}

onMounted(scrollToHash)
watch(() => route.hash, scrollToHash)

const whoAttends = [
  { key: 'developers', titleKey: 'exhibition.whoAttends.developers', descKey: 'exhibition.whoAttends.developersDesc' },
  { key: 'proptech', titleKey: 'exhibition.whoAttends.proptech', descKey: 'exhibition.whoAttends.proptechDesc' },
  { key: 'architects', titleKey: 'exhibition.whoAttends.architects', descKey: 'exhibition.whoAttends.architectsDesc' },
  { key: 'government', titleKey: 'exhibition.whoAttends.government', descKey: 'exhibition.whoAttends.governmentDesc' },
  { key: 'construction', titleKey: 'exhibition.whoAttends.construction', descKey: 'exhibition.whoAttends.constructionDesc' },
  { key: 'brokers', titleKey: 'exhibition.whoAttends.brokers', descKey: 'exhibition.whoAttends.brokersDesc' },
  { key: 'investors', titleKey: 'exhibition.whoAttends.investors', descKey: 'exhibition.whoAttends.investorsDesc' },
  { key: 'homebuyers', titleKey: 'exhibition.whoAttends.homebuyers', descKey: 'exhibition.whoAttends.homebuyersDesc' }
]
</script>

<style scoped>
.exhibition-landing {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>

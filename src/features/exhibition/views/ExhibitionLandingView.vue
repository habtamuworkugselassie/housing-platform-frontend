<template>
  <div class="exhibition-landing overflow-x-hidden bg-black text-white">
    <!-- Paged properties list (main content below the two carousels) -->
    <section id="properties" class="bg-zinc-950 border-t border-white/10 py-10 lg:py-14">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl sm:text-2xl font-bold text-white mb-6">
          {{ $t('property.properties') }}
        </h2>
        <div v-if="propertiesLoading" class="flex justify-center py-12">
          <div class="inline-block h-12 w-12 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
        </div>
        <div v-else-if="propertiesList.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          <a
            v-for="item in propertiesList"
            :key="item.id"
            :href="`/properties/${item.id}`"
            class="group overflow-hidden rounded-lg bg-white/5 border border-white/10 shadow transition hover:bg-yellow-500/20 hover:border-yellow-400"
          >
            <div class="aspect-[4/3] bg-zinc-800">
              <img
                v-if="item.images?.[0]?.imageUrl || item.imageUrls?.[0]"
                :src="item.images?.[0]?.imageUrl || item.imageUrls?.[0]"
                :alt="item.title"
                class="h-full w-full object-cover transition group-hover:scale-105"
              />
              <div v-else class="flex h-full items-center justify-center text-4xl text-gray-500">🏠</div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-white">{{ item.title }}</h3>
              <p class="mt-1 text-sm text-gray-400">
                {{ item.city }}{{ item.country ? `, ${item.country}` : '' }}
              </p>
              <p v-if="item.priceETB || item.priceUSD" class="mt-2 text-lg font-bold text-primary-400">
                {{ item.priceETB ? formatPrice(item.priceETB, 'ETB') : '' }}
                <span v-if="item.priceETB && item.priceUSD"> / </span>
                {{ item.priceUSD ? formatPrice(item.priceUSD, 'USD') : '' }}
              </p>
            </div>
          </a>
        </div>
        <p v-else class="py-8 text-center text-gray-400">
          {{ $t('property.noProperties') }}
        </p>
        <!-- Pagination -->
        <div v-if="propertiesTotalPages > 1" class="mt-8 flex items-center justify-center gap-2">
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

    <!-- What Happened (Cityscape-style 3 cards) -->
    <section class="py-20 lg:py-28 bg-zinc-950 border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white/90 mb-12">
          {{ $t('exhibition.whatHappened.title') }}
        </h2>
        <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
          <div class="bg-white/5 border border-white/10 p-8 hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors">
            <h3 class="text-lg font-bold uppercase tracking-tight text-white mb-3">{{ $t('exhibition.whatHappened.card1Title') }}</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              {{ $t('exhibition.whatHappened.card1Body') }}
            </p>
          </div>
          <div class="bg-white/5 border border-white/10 p-8 hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors">
            <h3 class="text-lg font-bold uppercase tracking-tight text-white mb-3">{{ $t('exhibition.whatHappened.card2Title') }}</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              {{ $t('exhibition.whatHappened.card2Body') }}
            </p>
          </div>
          <div class="bg-white/5 border border-white/10 p-8 hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors">
            <h3 class="text-lg font-bold uppercase tracking-tight text-white mb-3">{{ $t('exhibition.whatHappened.card3Title') }}</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              {{ $t('exhibition.whatHappened.card3Body') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Show Features -->
    <section id="show-features" class="py-20 lg:py-28 bg-zinc-950 border-t border-white/10 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-4 text-white">{{ $t('exhibition.keyShowFeatures.title') }}</h2>
        <p class="text-gray-400 max-w-2xl mb-10">
          {{ $t('exhibition.keyShowFeatures.subtitle') }}
        </p>
        <PillarGrid compact dark />
        <div class="mt-10 text-center">
          <a href="#features" class="inline-flex px-8 py-4 bg-white font-semibold text-sm uppercase tracking-wider text-black hover:bg-yellow-400 transition-colors">
            {{ $t('exhibition.keyShowFeatures.exploreMore') }}
          </a>
        </div>
      </div>
    </section>

    <!-- Who Attends (Cityscape-style audience cards) -->
    <section id="who-attends" class="py-20 lg:py-28 bg-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-4">{{ $t('exhibition.whoAttends.title') }}</h2>
        <p class="text-gray-400 max-w-2xl mb-12">
          {{ $t('exhibition.whoAttends.subtitle') }}
        </p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <a
            v-for="audience in whoAttends"
            :key="audience.key"
            href="#"
            class="block p-6 bg-white/5 border border-white/10 hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors group"
          >
            <h3 class="text-sm font-bold uppercase tracking-tight text-white group-hover:text-white mb-1">{{ $t(audience.titleKey) }}</h3>
            <p class="text-xs text-gray-500">{{ $t(audience.descKey) }}</p>
          </a>
        </div>
      </div>
    </section>

    <!-- Value chain / Sectors -->
    <ValueChainGrid />

    <!-- Testimonial strip (Cityscape-style) -->
    <section class="py-20 bg-zinc-950 border-t border-white/10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white/90 mb-8">
          {{ $t('exhibition.testimonial.title') }}
        </h2>
        <blockquote class="text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
          "{{ $t('exhibition.testimonial.quote') }}"
        </blockquote>
        <p class="text-sm text-gray-500 uppercase tracking-wider">{{ $t('exhibition.testimonial.author') }}</p>
      </div>
    </section>

    <!-- Plan your visit -->
    <section class="py-20 lg:py-28 bg-zinc-950 border-t border-white/10 text-white">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-4 text-white">{{ $t('exhibition.planVisit.title') }}</h2>
        <p class="text-lg text-gray-400 mb-10">
          {{ $t('exhibition.planVisit.body') }}
        </p>
        <a href="#register" class="inline-flex px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors">
          {{ $t('exhibition.planVisit.planYourVisit') }}
        </a>
      </div>
    </section>

    <!-- Foundation Partners -->
    <section id="partners" class="py-16 bg-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-white/50 text-xs font-semibold uppercase tracking-[0.25em] mb-8">{{ $t('exhibition.partners.foundationPartners') }}</p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          <div v-for="i in 6" :key="i" class="h-10 w-28 bg-white/10 flex items-center justify-center text-white/40 text-xs">
            {{ $t('exhibition.partners.partner') }} {{ i }}
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 bg-zinc-900 border-t border-white/10">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-4">{{ $t('exhibition.cta.title') }}</h2>
        <p class="text-gray-400 mb-10">
          {{ $t('exhibition.cta.body') }}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#register" class="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors min-w-[200px]">
            {{ $t('exhibition.cta.standEnquiry') }}
          </a>
          <a href="#brochure" class="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors min-w-[200px] border-2 border-white">
            {{ $t('exhibition.cta.viewBrochure') }}
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-10 bg-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-gray-500 text-sm">{{ $t('exhibition.footer.copyright') }}</p>
        <div class="flex items-center gap-8 text-sm text-gray-500">
          <a href="#" class="hover:text-yellow-400 transition">{{ $t('exhibition.footer.privacy') }}</a>
          <a href="#" class="hover:text-yellow-400 transition">{{ $t('exhibition.footer.terms') }}</a>
          <a href="#" class="hover:text-white transition">{{ $t('exhibition.footer.contact') }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { propertyApi } from '@/features/property/api/property.api'
import { formatPrice } from '@/shared/utils'
import PillarGrid from '../components/PillarGrid.vue'
import ValueChainGrid from '../components/ValueChainGrid.vue'

const route = useRoute()

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

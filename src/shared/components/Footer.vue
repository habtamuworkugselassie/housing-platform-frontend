<template>
  <footer class="flex-shrink-0 border-t border-white/10 bg-zinc-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        <!-- Brand / logo (Expo-style anchor column) -->
        <div class="sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
          <RouterLink
            :to="{ name: 'Home' }"
            class="inline-block w-fit hover:opacity-90 transition-opacity"
          >
            <img
              src="/images/exhibition/ethio-build-connect-expo-logo-full.png"
              :alt="$t('exhibition.hero.eventName')"
              class="h-11 sm:h-12 w-auto max-w-[220px] object-contain object-left"
            />
          </RouterLink>
          <p class="text-sm text-gray-400 leading-relaxed max-w-sm">
            {{ address }}
          </p>
          <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
            <a
              :href="`tel:${phoneRaw}`"
              class="hover:text-yellow-400 transition-colors"
            >
              {{ phone }}
            </a>
            <a
              :href="websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-yellow-400 transition-colors"
            >
              {{ website }}
            </a>
          </div>
        </div>

        <!-- Business -->
        <div>
          <h3 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-4">
            {{ $t('exhibition.footer.columns.business') }}
          </h3>
          <ul class="space-y-3 text-sm">
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#planning' }"
                class="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {{ $t('exhibition.footer.links.aboutExhibition') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#register' }"
                class="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {{ $t('exhibition.footer.links.registerInterest') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#partners' }"
                class="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {{ $t('exhibition.footer.links.partners') }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Media -->
        <div>
          <h3 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-4">
            {{ $t('exhibition.footer.columns.media') }}
          </h3>
          <ul class="space-y-3 text-sm">
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#brochure' }"
                class="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {{ $t('exhibition.footer.links.brochure') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#main-listings' }"
                class="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {{ $t('exhibition.footer.links.featuredListings') }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-4">
            {{ $t('exhibition.footer.columns.support') }}
          </h3>
          <ul class="space-y-3 text-sm">
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#show-features' }"
                class="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {{ $t('exhibition.footer.links.faq') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#register' }"
                class="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {{ $t('exhibition.footer.links.contactUs') }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar: copyright · legal · language (Expo-style) -->
      <div
        class="mt-10 lg:mt-12 pt-8 border-t border-white/10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
      >
        <p class="text-sm text-gray-400 order-3 lg:order-1 text-center lg:text-start">
          {{ $t('exhibition.footer.copyright') }}
        </p>
        <nav
          class="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400 order-1 lg:order-2"
          aria-label="Legal"
        >
          <a href="#" class="hover:text-yellow-400 transition-colors">{{ $t('exhibition.footer.privacy') }}</a>
          <a href="#" class="hover:text-yellow-400 transition-colors">{{ $t('exhibition.footer.terms') }}</a>
          <a href="#" class="hover:text-yellow-400 transition-colors">{{ $t('exhibition.footer.legal') }}</a>
        </nav>
        <div class="flex justify-center lg:justify-end order-2 lg:order-3 shrink-0">
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import LocaleSwitcher from '@/shared/components/LocaleSwitcher.vue'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'

/** Used when display-settings has not loaded yet or no approved footer org is configured */
const FALLBACK = {
  address: 'Addis Ababa, Ethiopia',
  phoneDisplay: '+251 913 504 097',
  phoneTel: '251913504097',
  websiteLabel: 'www.dreamteam.com',
  websiteUrl: 'https://www.dreamteam.com'
}

const { settings } = useDisplaySettings()

const address = computed(() => settings.footer?.address || FALLBACK.address)
const phone = computed(() => settings.footer?.phoneDisplay || FALLBACK.phoneDisplay)
const phoneRaw = computed(() => settings.footer?.phoneTel || FALLBACK.phoneTel)
const website = computed(() => settings.footer?.websiteLabel || FALLBACK.websiteLabel)
const websiteUrl = computed(() => settings.footer?.websiteUrl || FALLBACK.websiteUrl)
</script>

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
              class="hover:text-black transition-colors"
            >
              {{ phone }}
            </a>
          </div>
          <a
            :href="websiteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 transition-colors hover:border-black"
            aria-label="Open Ethio Build Connect portal"
          >
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Fethiobuildconnect.et%2F"
              alt="QR code to open Ethio Build Connect portal"
              class="h-20 w-20 rounded bg-white p-1"
            />
            <span class="text-xs leading-relaxed text-gray-300">
              Scan to visit
              <span class="block font-medium text-white">{{ website }}</span>
            </span>
          </a>
          <div class="flex flex-wrap items-center gap-2 text-gray-400">
            <a
              v-for="item in socialLinks"
              :key="item.label"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              :title="item.label"
              :aria-label="item.label"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:border-black hover:text-black"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="item.iconPath" />
              </svg>
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
                class="text-gray-300 hover:text-black transition-colors"
              >
                {{ $t('exhibition.footer.links.aboutExhibition') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#register' }"
                class="text-gray-300 hover:text-black transition-colors"
              >
                {{ $t('exhibition.footer.links.registerInterest') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#partners' }"
                class="text-gray-300 hover:text-black transition-colors"
              >
                {{ $t('exhibition.footer.links.partners') }}
              </RouterLink>
            </li>
            <li v-if="showSponsorshipPackagesNavLink">
              <RouterLink
                :to="{ name: 'Home', hash: '#sponsorship-packages' }"
                class="text-gray-300 hover:text-black transition-colors"
              >
                {{ $t('exhibition.footer.links.sponsorshipPackages') }}
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
                class="text-gray-300 hover:text-black transition-colors"
              >
                {{ $t('exhibition.footer.links.brochure') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#main-listings' }"
                class="text-gray-300 hover:text-black transition-colors"
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
                class="text-gray-300 hover:text-black transition-colors"
              >
                {{ $t('exhibition.footer.links.faq') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#register' }"
                class="text-gray-300 hover:text-black transition-colors"
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
          <a href="#" class="hover:text-black transition-colors">{{ $t('exhibition.footer.privacy') }}</a>
          <a href="#" class="hover:text-black transition-colors">{{ $t('exhibition.footer.terms') }}</a>
          <a href="#" class="hover:text-black transition-colors">{{ $t('exhibition.footer.legal') }}</a>
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
  websiteLabel: 'ethiobuildconnect.et',
  websiteUrl: 'https://ethiobuildconnect.et/'
}

const { settings } = useDisplaySettings()

const showSponsorshipPackagesNavLink = computed(
  () => settings.exhibitionSponsorshipPackagesVisible !== false
)

const address = computed(() => settings.footer?.address || FALLBACK.address)
const phone = computed(() => settings.footer?.phoneDisplay || FALLBACK.phoneDisplay)
const phoneRaw = computed(() => settings.footer?.phoneTel || FALLBACK.phoneTel)
const website = computed(() => settings.footer?.websiteLabel || FALLBACK.websiteLabel)
const websiteUrl = computed(() => settings.footer?.websiteUrl || FALLBACK.websiteUrl)
const socialLinks = [
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/ethiobuildconnect?igsh=MTdiazV2d25wZzdjMQ%3D%3D&utm_source=qr',
    iconPath:
      'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
  },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/ethio-build-connect-941838400?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
    iconPath:
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
  },
  {
    label: 'Facebook',
    url: 'https://www.facebook.com/share/1CZjQJ54BG/?mibextid=wwXIfr',
    iconPath:
      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
  },
  {
    label: 'TikTok',
    url: 'https://www.tiktok.com/@ethiobuildconnect?_r=1&_t=ZS-95kvdiGuABl',
    iconPath:
      'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.69 1.62 4.24 1.79v4.03c-1.43-.04-2.86-.35-4.17-.97-.57-.27-1.1-.61-1.62-.95-.01 2.92.02 5.84-.02 8.75-.08 1.4-.54 2.78-1.35 3.94-1.31 1.9-3.52 3.19-5.81 3.42-1.4.15-2.83.02-4.16-.5-2.21-.86-4-2.66-4.79-4.9-.42-1.17-.56-2.43-.48-3.67.23-2.68 1.88-5.16 4.31-6.32 1.84-.89 3.98-1.13 5.95-.66.02 1.48-.04 2.96-.04 4.44-.9-.29-1.92-.35-2.83-.03-1.31.43-2.34 1.52-2.74 2.84-.27.93-.24 1.93.1 2.84.48 1.25 1.62 2.24 2.9 2.56.85.21 1.76.19 2.6-.06 1.2-.36 2.22-1.29 2.7-2.44.2-.47.3-.98.3-1.49.01-6.61-.01-13.22.02-19.83z'
  }
]
</script>

<template>
  <footer class="site-footer flex-shrink-0 border-t border-white/10 text-white">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div class="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-12">
        <!-- Brand column: wordmark, a frosted contact card, the app button, account pills. -->
        <div class="col-span-2 lg:col-span-1 flex flex-col gap-5">
          <RouterLink :to="{ name: 'Home' }" class="inline-flex w-fit transition-opacity hover:opacity-90">
            <img
              src="/images/branding/ethio-build-connect-wordmark.png"
              :alt="$t('exhibition.hero.eventName')"
              class="h-12 w-auto object-contain lg:h-14"
            />
          </RouterLink>
          <p class="max-w-sm text-sm leading-relaxed text-white/70">
            {{ $t('exhibition.footer.tagline') }}
          </p>

          <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-300">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-6.3 7-11.5A7 7 0 005 9.5C5 14.7 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              </span>
              <span class="text-white/80">{{ address }}</span>
            </div>
            <div class="mt-3 flex items-start gap-3">
              <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-300">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h2.2a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.25 1.03L7.6 9.4a12 12 0 006.99 6.99l1.4-1.4a1 1 0 011.03-.25l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 5z" /></svg>
              </span>
              <span class="flex flex-wrap gap-x-4 gap-y-1">
                <a v-for="line in phones" :key="line.tel" :href="`tel:${line.tel}`" class="font-semibold text-white transition-colors hover:text-gold-300">
                  {{ line.display }}
                </a>
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <a
              v-for="item in socialLinks"
              :key="item.label"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              :title="item.label"
              :aria-label="item.label"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/80 transition-all hover:-translate-y-0.5 hover:border-gold-400/60 hover:text-gold-300"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="item.iconPath" /></svg>
            </a>
          </div>

          <a
            :href="downloadHref"
            class="inline-flex w-fit items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-primary-950 shadow-[0_10px_24px_-12px_rgba(244,201,119,0.9)] transition-all hover:-translate-y-0.5 hover:bg-gold-300"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></svg>
            {{ $t('nav.getApp') }}
          </a>
          <!-- Account: its own row, the two pills side by side. -->
          <div v-if="!isAuthenticated" class="flex items-center gap-3">
            <RouterLink
              to="/login"
              class="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-gold-400/60 hover:text-gold-300"
            >
              {{ $t('nav.login') }}
            </RouterLink>
            <RouterLink
              to="/register"
              class="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
            >
              {{ $t('nav.register') }}
            </RouterLink>
          </div>

          <a
            :href="websiteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden lg:inline-flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 transition-colors hover:border-gold-400/60"
            aria-label="Open Ethio Build Connect portal"
          >
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Fethiobuildconnect.et%2F"
              alt="QR code to open Ethio Build Connect portal"
              class="h-20 w-20 rounded-xl bg-white p-1"
            />
            <span class="text-xs leading-relaxed text-white/70">
              Scan to visit
              <span class="block font-semibold text-white">{{ website }}</span>
            </span>
          </a>
        </div>

        <!-- Business -->
        <div>
          <h3 class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 lg:mb-4">
              <span class="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
            {{ $t('exhibition.footer.columns.business') }}
          </h3>
          <ul class="space-y-2 text-[15px] lg:space-y-2.5 lg:text-sm">
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#planning' }"
                class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
              >
                {{ $t('exhibition.footer.links.aboutExhibition') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#register' }"
                class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
              >
                {{ $t('exhibition.footer.links.registerInterest') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'Home', hash: '#partners' }"
                class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
              >
                {{ $t('exhibition.footer.links.partners') }}
              </RouterLink>
            </li>
            <li v-if="showSponsorshipPackagesNavLink">
              <RouterLink
                :to="{ name: 'Home', hash: '#sponsorship-packages' }"
                class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
              >
                {{ $t('exhibition.footer.links.sponsorshipPackages') }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Media + Support share a column on phones; lg:contents restores
             them as two separate columns in the desktop grid. -->
        <div class="flex flex-col gap-8 lg:contents">
          <!-- Media -->
          <div>
            <h3 class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 lg:mb-4">
              <span class="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              {{ $t('exhibition.footer.columns.media') }}
            </h3>
            <ul class="space-y-2 text-[15px] lg:space-y-2.5 lg:text-sm">
              <li>
                <RouterLink
                  :to="{ name: 'Home', hash: '#brochure' }"
                  class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
                >
                  {{ $t('exhibition.footer.links.brochure') }}
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  :to="{ name: 'Home', hash: '#main-listings' }"
                  class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
                >
                  {{ $t('exhibition.footer.links.featuredListings') }}
                </RouterLink>
              </li>
              <!-- The market guide is reachable from nowhere else in the interface, and a
                   page with no internal links is a page search engines treat as
                   peripheral however good it is. The footer renders on every route. -->
              <li>
                <RouterLink
                  to="/ethiopia-real-estate-market"
                  class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
                >
                  {{ $t('nav.ethiopiaRealEstateMarket') }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h3 class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 lg:mb-4">
              <span class="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              {{ $t('exhibition.footer.columns.support') }}
            </h3>
            <ul class="space-y-2 text-[15px] lg:space-y-2.5 lg:text-sm">
              <li>
                <RouterLink
                  :to="{ name: 'Home', hash: '#faq' }"
                  class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
                >
                  {{ $t('exhibition.footer.links.faq') }}
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  :to="{ name: 'Home', hash: '#register' }"
                  class="inline-block py-0.5 text-white/80 transition-colors hover:text-gold-300"
                >
                  {{ $t('exhibition.footer.links.contactUs') }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom bar: copyright · legal · language (Expo-style) -->
      <div
        class="mt-10 lg:mt-12 pt-8 border-t border-white/10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
      >
        <p class="order-3 text-center text-xs text-white/50 lg:order-1 lg:text-start lg:text-sm">
          {{ $t('exhibition.footer.copyright') }}
        </p>
        <nav
          class="order-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/70 lg:order-2"
          aria-label="Legal"
        >
          <RouterLink to="/privacy" class="transition-colors hover:text-gold-300">{{
            $t('exhibition.footer.privacy')
          }}</RouterLink>
          <RouterLink to="/terms" class="transition-colors hover:text-gold-300">{{
            $t('exhibition.footer.terms')
          }}</RouterLink>
          <RouterLink to="/cookies" class="transition-colors hover:text-gold-300">{{
            $t('legal.navCookies')
          }}</RouterLink>
          <RouterLink to="/legal" class="transition-colors hover:text-gold-300">{{
            $t('exhibition.footer.legal')
          }}</RouterLink>
        </nav>
        <div class="flex justify-center lg:justify-end order-2 lg:order-3 shrink-0">
          <LocaleSwitcher placement="top" align="center" />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/shared/components/LocaleSwitcher.vue'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'
import { useAuthStore } from '@/features/auth'

const { locale } = useI18n()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

/** Used when display-settings has not loaded yet or no approved footer org is configured */
const FALLBACK = {
  address: 'Addis Ababa, Ethiopia',
  phones: [
    { display: '+251 913 504 097', tel: '251913504097' },
    { display: '+251 920 783 807', tel: '251920783807' }
  ],
  websiteLabel: 'ethiobuildconnect.et',
  websiteUrl: 'https://ethiobuildconnect.et/'
}

const { settings } = useDisplaySettings()

const showSponsorshipPackagesNavLink = computed(
  () => settings.exhibitionSponsorshipPackagesVisible !== false
)

const address = computed(() => settings.footer?.address || FALLBACK.address)
// The API gained `phones` so an organization can publish more than one line; the
// singular pair is what an older deployment still returns.
const phones = computed(() => {
  const footer = settings.footer
  if (footer?.phones?.length) return footer.phones
  if (footer?.phoneDisplay) {
    return [{ display: footer.phoneDisplay, tel: footer.phoneTel || '' }]
  }
  return FALLBACK.phones
})
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

// The download page is bilingual; Amharic visitors get the Amharic copy.
const downloadHref = computed(() => (locale.value === 'am' ? '/am/download.html' : '/download.html'))
</script>

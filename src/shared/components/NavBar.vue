<template>
  <!-- A floating pill: the nav is a transparent sticky frame with a little inset, and the
       rounded bar inside it carries the dark surface (styles/public-design.css). -->
  <nav class="site-nav sticky top-0 z-[70] text-white px-2 pt-2 sm:px-4 sm:pt-3">
    <div class="site-nav__bar max-w-7xl mx-auto rounded-2xl px-3 sm:px-5 lg:px-6">
      <div class="flex justify-between items-center h-16 gap-2">
        <div class="flex items-center min-w-0">
          <!-- Mobile menu button -->
          <!-- The icon stays the hamburger while the drawer is open: tapping it again
               collapses the menu, so it is one main-menu toggle rather than a button
               that turns into a separate X. focus-visible (not focus) keeps the ring
               for keyboard users without boxing the button after every tap. -->
          <button
            type="button"
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden p-2 rounded-md text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
            :aria-label="$t('nav.toggleMenu')"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-nav-panel"
          >
            <span class="material-icons" aria-hidden="true">menu</span>
          </button>
          
          <router-link
            to="/"
            class="flex items-center gap-2 px-2 py-2 text-lg sm:text-xl font-bold text-white hover:text-primary-400"
          >
            <img
              src="/images/branding/ethio-build-connect-wordmark.png"
              alt=""
              width="65"
              height="40"
              class="h-9 w-auto sm:h-10 object-contain shrink-0"
            />
            <span class="sr-only">{{ $t('common.appName') }}</span>
          </router-link>
          
          <!-- Marketplace dropdown (fluid, hover + click) -->
          <div
            class="hidden lg:ml-6 lg:flex relative"
            @mouseenter="marketplaceDropdownOpen = true"
            @mouseleave="marketplaceDropdownOpen = false"
          >
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="marketplaceDropdownOpen ? 'text-black bg-violet-950/10' : 'text-gray-300 hover:text-primary-400 hover:bg-white/5'"
              :aria-expanded="marketplaceDropdownOpen"
              aria-haspopup="true"
              @click="marketplaceDropdownOpen = !marketplaceDropdownOpen"
              @blur="onMarketplaceBlur"
            >
              <span class="material-icons !text-[18px] leading-none" aria-hidden="true">storefront</span>
              {{ $t('nav.marketplace') }}
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': marketplaceDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 -translate-y-1 scale-[0.98]"
            >
              <div
                v-show="marketplaceDropdownOpen"
                class="absolute left-0 top-full pt-2 min-w-[240px] z-50 origin-top-left"
              >
                <div class="rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-md shadow-xl shadow-black/30 py-1.5 overflow-hidden">
                  <router-link
                    v-for="cat in marketplaceCategories"
                    :key="cat.to"
                    :to="cat.to"
                    class="group/item flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-150 border-l-2 border-transparent hover:border-primary-400"
                    @click="marketplaceDropdownOpen = false"
                  >
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary-400 ring-1 ring-white/10 transition-colors group-hover/item:bg-primary-500 group-hover/item:text-white group-hover/item:ring-primary-500">
                      <span class="material-icons !text-[18px] leading-none" aria-hidden="true">{{ cat.icon }}</span>
                    </span>
                    {{ $t(cat.labelKey) }}
                  </router-link>
                </div>
              </div>
            </Transition>
          </div>

          <div class="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-6">
            <template v-if="isExhibitionPage">
              <router-link to="/#show-features" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-primary-400">{{ $t('nav.showFeatures') }}</router-link>
              <router-link to="/#who-attends" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-primary-400">{{ $t('nav.whoAttends') }}</router-link>
            </template>
            <!-- Live is a site-wide entry point, not exhibition-landing-only, so viewers can
                 always find an in-progress stream from any page. -->
            <router-link to="/live" class="inline-flex items-center gap-1.5 px-1 pt-1 text-sm font-semibold text-red-400 hover:text-red-300">
              <span class="h-1.5 w-1.5 rounded-full bg-red-500 motion-safe:animate-pulse" aria-hidden="true" />
              {{ $t('nav.live') }}
            </router-link>
          </div>
        </div>

        <!-- Public "Get the app" — a normal flex child (not absolutely positioned) so it sits
             between the nav and the controls and can never overlap them. Guests only; signed-in
             users reach the download via the footer link and the mobile menu. -->
        <a
          v-if="!authStore.isAuthenticated"
          href="/download.html"
          class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold-400 px-3.5 py-2 text-xs font-bold text-primary-950 shadow-[0_8px_20px_-10px_rgba(244,201,119,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 sm:gap-2 sm:px-4 sm:text-sm"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" />
          </svg>
          {{ $t('nav.getAppShort') }}
        </a>

        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/buildings"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                {{ $t('nav.buildings') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/submit-property"
                class="px-3 py-2 text-sm font-medium text-primary-950 bg-gold-400 rounded-md hover:bg-gold-500"
              >
                {{ $t('nav.submitProperty') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/agent/messages"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                Messages
              </router-link>
              <router-link
                v-if="authStore.isAdmin"
                to="/go-live"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" aria-hidden="true" />
                {{ $t('nav.goLive') }}
              </router-link>
              <router-link
                v-if="authStore.isAdmin"
                to="/admin"
                class="px-3 py-2 text-sm font-medium text-primary-950 bg-gold-400 rounded-md hover:bg-gold-500"
              >
                {{ $t('nav.admin') }}
              </router-link>
              <router-link
                v-if="authStore.isAdmin"
                to="/sponsorships"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                {{ $t('nav.sponsorships') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('BANKER')"
                to="/banking/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                {{ $t('nav.banking') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('BUYER')"
                to="/loan-applications"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                {{ $t('nav.myLoans') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('BUYER')"
                to="/purchase-orders"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                {{ $t('nav.myPurchases') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/construction/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                {{ $t('nav.construction') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('SUPPLIER')"
                to="/supplier/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                {{ $t('nav.supplier') }}
              </router-link>
              <router-link
                v-if="!authStore.isAdmin"
                to="/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary-400"
              >
                {{ $t('nav.dashboard') }}
              </router-link>
              
              <div class="flex items-center gap-2 pl-4 border-l border-white/20">
                <UserDropdown />
              </div>
            </template>
          </div>
          
          <LocaleSwitcher />
        </div>
      </div>
    </div>

    <!-- Mobile menu: a sheet from the right edge, above the bar (z 72 > nav 70), with its
         own close control — so it reads as one surface rather than a panel hanging off the
         bar. Teleported to <body> because .site-nav's descendants would otherwise be
         measured against the bar. The strip of page left showing beside it is the backdrop,
         which is what makes tap-outside-to-close reachable at all. -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity ease-out duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity ease-in duration-150"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileMenuOpen"
          data-nav-backdrop
          class="lg:hidden fixed inset-0 z-[71] bg-primary-950/55 backdrop-blur-[2px]"
          aria-hidden="true"
          @click="mobileMenuOpen = false"
        />
      </Transition>

      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-x-6"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-6"
      >
        <div
          v-if="mobileMenuOpen"
          id="mobile-nav-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('nav.menuTitle')"
          class="lg:hidden fixed end-0 top-0 bottom-0 z-[72] flex w-[88%] max-w-[23rem] flex-col overflow-y-auto overscroll-contain rounded-s-3xl bg-[#f7f6fb] text-gray-900 shadow-[0_0_80px_rgba(17,4,39,0.5)]"
        >
          <div class="flex items-start justify-between gap-4 px-6 pb-1 pt-5">
            <div>
              <p class="text-2xl font-bold tracking-tight text-gray-900">{{ $t('nav.menuTitle') }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ $t('nav.menuSubtitle') }}</p>
            </div>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold-400 text-gray-700 transition-colors hover:bg-gold-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              :aria-label="$t('common.close')"
              @click="mobileMenuOpen = false"
            >
              <span class="material-icons !text-[22px] leading-none" aria-hidden="true">close</span>
            </button>
          </div>

          <!-- The page's sections, big and flat -->
          <ul class="px-3 pt-3">
            <li v-for="link in jumpLinks" :key="link.key">
              <router-link
                :to="link.to"
                class="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[17px] font-medium text-gray-900 transition-colors hover:bg-white"
                :class="isCurrent(link.to) ? 'bg-white' : ''"
                :aria-current="isCurrent(link.to) ? 'page' : undefined"
                @click="mobileMenuOpen = false"
              >
                <span>{{ link.label }}</span>
                <span v-if="link.live" class="h-2 w-2 rounded-full bg-red-500 motion-safe:animate-pulse" aria-hidden="true" />
              </router-link>
            </li>
          </ul>

          <!-- Marketplace: every category, as a compact two-column grid of chips -->
          <div class="px-6 pt-5">
            <p class="text-[12px] font-bold uppercase tracking-[0.14em] text-gray-500">{{ $t('nav.marketplace') }}</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <router-link
                v-for="cat in marketplaceCategories"
                :key="cat.to"
                :to="cat.to"
                class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-800 transition-colors hover:border-primary-300 hover:bg-primary-50"
                :class="isCurrent(cat.to) ? 'border-primary-300 bg-primary-50 text-primary-900' : ''"
                :aria-current="isCurrent(cat.to) ? 'page' : undefined"
                @click="mobileMenuOpen = false"
              >
                <span class="material-icons !text-[18px] leading-none text-primary-600" aria-hidden="true">{{ cat.icon }}</span>
                <span class="min-w-0 truncate">{{ $t(cat.labelKey) }}</span>
              </router-link>
            </div>
          </div>

          <!-- Signed-in destinations -->
          <div v-if="accountItems.length" class="px-6 pt-6">
            <p class="text-[12px] font-bold uppercase tracking-[0.14em] text-gray-500">{{ $t('nav.account') }}</p>
            <ul class="mt-2 -mx-3">
              <li v-for="item in accountItems" :key="item.key">
                <button
                  v-if="item.action === 'logout'"
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] text-gray-800 hover:bg-white"
                  @click="handleLogout"
                >
                  <span class="material-icons !text-[20px] leading-none text-gray-500" aria-hidden="true">{{ item.icon }}</span>
                  <span class="min-w-0 truncate">{{ item.label }}</span>
                </button>
                <router-link
                  v-else
                  :to="item.to"
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px]"
                  :class="isCurrent(item.to) ? 'bg-white font-medium text-primary-900' : 'text-gray-800 hover:bg-white'"
                  :aria-current="isCurrent(item.to) ? 'page' : undefined"
                  @click="mobileMenuOpen = false"
                >
                  <span class="material-icons !text-[20px] leading-none" :class="isCurrent(item.to) ? 'text-primary-700' : 'text-gray-500'" aria-hidden="true">{{ item.icon }}</span>
                  <span class="min-w-0 truncate">{{ item.label }}</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Pinned to the bottom: the two calls to action, then the legal links. The pb
               clears the iOS home indicator. -->
          <div class="mt-auto space-y-2.5 px-6 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-5">
            <router-link
              :to="{ path: '/', query: { interest: 'exhibitor' }, hash: '#register' }"
              class="flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-5 py-3.5 text-[15px] font-bold text-primary-950 transition-colors hover:bg-gold-300"
              @click="mobileMenuOpen = false"
            >
              {{ $t('exhibition.hero.registerInterest') }}
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 6l6 6-6 6M5 12h14" /></svg>
            </router-link>
            <a
              href="/download.html"
              class="flex w-full items-center justify-center gap-2 rounded-full bg-primary-950 px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-900"
            >
              {{ $t('nav.getAppShort') }}
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M9 7h8v8" /></svg>
            </a>
            <div class="flex items-center gap-6 pt-1 text-[13px] text-gray-500">
              <router-link to="/privacy" class="hover:text-gray-800" @click="mobileMenuOpen = false">
                {{ $t('legal.navPrivacy') }}
              </router-link>
              <router-link to="/terms" class="hover:text-gray-800" @click="mobileMenuOpen = false">
                {{ $t('legal.navTerms') }}
              </router-link>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth'
import { useRouter, useRoute } from 'vue-router'
import { stripLocale } from '@/i18n/localeRoutes'
import LocaleSwitcher from '@/shared/components/LocaleSwitcher.vue'
import UserDropdown from '@/shared/components/UserDropdown.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const mobileMenuOpen = ref(false)
const marketplaceDropdownOpen = ref(false)

// Single source of truth for the marketplace categories so the desktop
// dropdown and the mobile menu share one consistent icon set (Material Icons,
// no mismatched emoji).
const marketplaceCategories = [
  // `/real-estate`, not `/marketplace/real-estate`: the two render the same view and
  // the marketplace path canonicalises to this one, so internal links point here.
  { to: '/real-estate', labelKey: 'nav.marketplaceRealEstate', icon: 'home_work' },
  { to: '/marketplace/banks', labelKey: 'nav.marketplaceBanks', icon: 'account_balance' },
  { to: '/marketplace/insurance', labelKey: 'nav.marketplaceInsurance', icon: 'shield' },
  { to: '/marketplace/contractors', labelKey: 'nav.marketplaceContractors', icon: 'engineering' },
  { to: '/marketplace/consultants-and-architects', labelKey: 'nav.marketplaceConsultantsArchitects', icon: 'architecture' },
  { to: '/marketplace/suppliers', labelKey: 'nav.marketplaceSuppliers', icon: 'inventory_2' },
  { to: '/marketplace/finishing-work', labelKey: 'nav.marketplaceFinishingWork', icon: 'format_paint' }
]

const onMarketplaceBlur = () => {
  setTimeout(() => { marketplaceDropdownOpen.value = false }, 150)
}

const isExhibitionPage = computed(() => {
  const path = stripLocale(route.path)
  return path === '/' || path === '/exhibition'
})

// The drawer is one grouped, collapsible list: a section header per group, its rows
// underneath, a divider between groups. Every row carries an icon and a label, so
// they read as one list rather than the two mismatched styles the menu used to mix.
//
// Show Features and Who Attends are anchors into the landing page, so they only
// appear where those sections exist. Live is site-wide.
// The page's own sections first (on the landing), then the two destinations that exist
// everywhere. Big flat rows, the way a one-page site's menu reads.
const jumpLinks = computed(() => {
  const links = []
  if (isExhibitionPage.value) {
    links.push(
      { key: 'show-features', to: '/#show-features', label: t('nav.showFeatures') },
      { key: 'who-attends', to: '/#who-attends', label: t('nav.whoAttends') },
      { key: 'sectors', to: '/#sectors', label: t('nav.sectors') },
      { key: 'get-involved', to: '/#get-involved', label: t('exhibition.cta.eyebrow') },
      { key: 'register', to: '/#register', label: t('exhibition.registerInterest.title') }
    )
  }
  links.push(
    { key: 'properties', to: '/properties', label: t('nav.properties') },
    { key: 'live', to: '/live', label: t('nav.live'), live: true }
  )
  return links
})

const accountItems = computed(() => {
  if (!authStore.isAuthenticated) return []
  const isRealtor = authStore.hasRole('REALTOR')
  const account = [
    { key: 'buildings', to: '/buildings', icon: 'domain', label: t('nav.buildings'), show: isRealtor },
    { key: 'submit-property', to: '/submit-property', icon: 'add_home_work', label: t('nav.submitProperty'), show: isRealtor },
    { key: 'messages', to: '/agent/messages', icon: 'forum', label: 'Messages', show: isRealtor },
    { key: 'go-live', to: '/go-live', icon: 'sensors', label: t('nav.goLive'), show: authStore.isAdmin },
    { key: 'admin', to: '/admin', icon: 'admin_panel_settings', label: t('nav.adminPortal'), show: authStore.isAdmin },
    { key: 'sponsorships', to: '/sponsorships', icon: 'handshake', label: t('nav.sponsorships'), show: authStore.isAdmin },
    { key: 'banking', to: '/banking/dashboard', icon: 'account_balance', label: t('nav.banking'), show: authStore.hasRole('BANKER') },
    { key: 'loans', to: '/loan-applications', icon: 'request_quote', label: t('nav.myLoans'), show: authStore.hasRole('BUYER') },
    { key: 'purchases', to: '/purchase-orders', icon: 'receipt_long', label: t('nav.myPurchases'), show: authStore.hasRole('BUYER') },
    { key: 'construction', to: '/construction/dashboard', icon: 'construction', label: t('nav.construction'), show: isRealtor },
    { key: 'supplier', to: '/supplier/dashboard', icon: 'local_shipping', label: t('nav.supplier'), show: authStore.hasRole('SUPPLIER') },
    { key: 'dashboard', to: '/dashboard', icon: 'dashboard', label: t('nav.dashboard'), show: !authStore.isAdmin },
    { key: 'profile', to: '/profile', icon: 'person', label: t('common.profile') || 'Profile', show: true }
  ].filter((e) => e.show)
  account.push({ key: 'logout', action: 'logout', icon: 'logout', label: t('nav.logout') })
  return account
})

function isCurrent(to) {
  if (typeof to !== 'string' || to.includes('#')) return false
  // Links are written unprefixed, so the active check compares against the stripped path.
  return stripLocale(route.path) === to
}

// --- Drawer open/close side effects -------------------------------------------
// The page behind the drawer used to keep scrolling under it. Locking the body
// while it is open also keeps the scroll position, since the drawer scrolls its
// own content instead.
let previousBodyOverflow = ''

function lockBodyScroll(lock) {
  if (typeof document === 'undefined') return
  if (lock) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') mobileMenuOpen.value = false
}

// Crossing into the lg layout hides the drawer via its own `lg:hidden`, which would
// otherwise leave the body locked with no visible way to unlock it (rotate a tablet
// to landscape and the page freezes).
const desktopQuery =
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(min-width: 1024px)') : null

function onDesktopChange(e) {
  if (e.matches) mobileMenuOpen.value = false
}

watch(mobileMenuOpen, (open) => {
  lockBodyScroll(open)
  if (typeof document === 'undefined') return
  if (open) {
    document.addEventListener('keydown', onKeydown)
    desktopQuery?.addEventListener?.('change', onDesktopChange)
  } else {
    document.removeEventListener('keydown', onKeydown)
    desktopQuery?.removeEventListener?.('change', onDesktopChange)
  }
})

// Anchor links inside the drawer (/#show-features) navigate without unmounting the
// row, so closing on every route change is what actually dismisses them.
watch(() => route.fullPath, () => { mobileMenuOpen.value = false })

onBeforeUnmount(() => {
  lockBodyScroll(false)
  if (typeof document !== 'undefined') document.removeEventListener('keydown', onKeydown)
  desktopQuery?.removeEventListener?.('change', onDesktopChange)
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
  mobileMenuOpen.value = false
}
</script>

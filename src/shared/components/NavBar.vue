<template>
  <nav class="site-nav border-b border-white/10 sticky top-0 z-[70] text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          class="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:border-primary-400 hover:text-primary-400"
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

    <!-- Mobile menu.
         Teleported to <body> because .site-nav sets backdrop-filter, which makes the
         nav a containing block for fixed-position descendants — a drawer left inside
         it would be measured against the 64px bar instead of the viewport. It used to
         be an in-flow block that simply pushed the bar taller: it ended partway down
         the screen with the page showing through underneath, could not scroll when the
         list outgrew the viewport, and left the page behind it scrollable.
         z-order: backdrop 65 < panel 68 < nav 70, so the bar and its close button stay
         above the drawer, and both cover the support-chat bubble at z-60. -->
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
          class="lg:hidden fixed inset-0 z-[65] bg-black/50"
          aria-hidden="true"
          @click="mobileMenuOpen = false"
        />
      </Transition>

      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
      >
        <!-- A side panel, not a full-width sheet: the strip of page left showing
             beside it is the backdrop, which is what makes tap-outside-to-close
             reachable at all. -->
        <div
          v-if="mobileMenuOpen"
          id="mobile-nav-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('nav.toggleMenu')"
          class="lg:hidden fixed start-0 top-16 bottom-0 z-[68] w-[86%] max-w-[22rem] flex flex-col overflow-y-auto overscroll-contain border-e border-gray-200 bg-white text-gray-900 shadow-2xl"
        >
          <div class="flex-1 py-3">
            <section
              v-for="(group, gi) in menuGroups"
              :key="group.key"
              :class="gi > 0 ? 'mt-1 border-t border-gray-200 pt-1' : ''"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-left text-[15px] font-normal text-gray-800 hover:bg-gray-100"
                :aria-expanded="!collapsedGroups[group.key]"
                :aria-controls="`nav-group-${group.key}`"
                @click="toggleGroup(group.key)"
              >
                <span>{{ group.label }}</span>
                <span
                  class="material-icons !text-[20px] leading-none text-gray-600 transition-transform duration-200"
                  :class="collapsedGroups[group.key] ? 'rotate-180' : ''"
                  aria-hidden="true"
                >expand_less</span>
              </button>

              <ul v-show="!collapsedGroups[group.key]" :id="`nav-group-${group.key}`" class="pb-1">
                <li v-for="item in group.items" :key="item.key">
                  <!-- Signing out is the one row that is not a link. -->
                  <button
                    v-if="item.action === 'logout'"
                    type="button"
                    class="flex w-full items-center gap-4 rounded-full py-3 pe-4 ps-5 text-left text-[15px] text-gray-800 hover:bg-gray-100"
                    @click="handleLogout"
                  >
                    <span class="material-icons !text-[22px] leading-none text-gray-600" aria-hidden="true">{{ item.icon }}</span>
                    <span class="min-w-0 truncate">{{ item.label }}</span>
                  </button>
                  <router-link
                    v-else
                    :to="item.to"
                    class="flex items-center gap-4 rounded-full py-3 pe-4 ps-5 text-[15px]"
                    :class="isCurrent(item.to)
                      ? 'bg-sky-100 font-medium text-sky-900'
                      : 'text-gray-800 hover:bg-gray-100'"
                    :aria-current="isCurrent(item.to) ? 'page' : undefined"
                    @click="mobileMenuOpen = false"
                  >
                    <span
                      class="material-icons !text-[22px] leading-none"
                      :class="isCurrent(item.to) ? 'text-sky-800' : 'text-gray-600'"
                      aria-hidden="true"
                    >{{ item.icon }}</span>
                    <span class="min-w-0 truncate">{{ item.label }}</span>
                  </router-link>
                </li>
              </ul>
            </section>

          </div>

          <!-- Pinned to the bottom of the panel. The pb clears the iOS home
               indicator, which otherwise sits on top of these links. -->
          <div class="mt-auto border-t border-gray-200 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            <div class="flex items-center gap-6 text-[13px] text-gray-500">
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

const isExhibitionPage = computed(() => route.path === '/' || route.path === '/exhibition')

// The drawer is one grouped, collapsible list: a section header per group, its rows
// underneath, a divider between groups. Every row carries an icon and a label, so
// they read as one list rather than the two mismatched styles the menu used to mix.
//
// Show Features and Who Attends are anchors into the landing page, so they only
// appear where those sections exist. Live is site-wide.
const menuGroups = computed(() => {
  const groups = [
    {
      key: 'marketplace',
      label: t('nav.marketplace'),
      items: marketplaceCategories.map((cat) => ({
        key: cat.to,
        to: cat.to,
        icon: cat.icon,
        label: t(cat.labelKey)
      }))
    },
    {
      key: 'browse',
      label: t('nav.browse'),
      items: [
        { key: 'properties', to: '/properties', icon: 'apartment', label: t('nav.properties') },
        ...(isExhibitionPage.value
          ? [
              { key: 'show-features', to: '/#show-features', icon: 'view_carousel', label: t('nav.showFeatures') },
              { key: 'who-attends', to: '/#who-attends', icon: 'groups', label: t('nav.whoAttends') }
            ]
          : []),
        { key: 'live', to: '/live', icon: 'sensors', label: t('nav.live') }
      ]
    }
  ]

  if (authStore.isAuthenticated) {
    const isRealtor = authStore.hasRole('REALTOR')
    // Gated by role exactly as the desktop bar gates the same destinations.
    const account = [
      { key: 'buildings', to: '/buildings', icon: 'domain', label: t('nav.buildings'), show: isRealtor },
      { key: 'submit-property', to: '/submit-property', icon: 'add_home_work', label: t('nav.submitProperty'), show: isRealtor },
      { key: 'messages', to: '/agent/messages', icon: 'forum', label: 'Messages', show: isRealtor },
      { key: 'go-live', to: '/go-live', icon: 'sensors', label: t('nav.goLive'), show: authStore.isAdmin },
      { key: 'admin', to: '/admin', icon: 'admin_panel_settings', label: t('nav.adminPortal'), show: authStore.isAdmin },
      { key: 'sponsorships', to: '/sponsorships', icon: 'handshake', label: t('nav.sponsorships'), show: authStore.isAdmin },
      { key: 'banking', to: '/banking/dashboard', icon: 'account_balance', label: t('nav.banking'), show: authStore.hasRole('BANKER') },
      { key: 'loans', to: '/loan-applications', icon: 'request_quote', label: t('nav.myLoans'), show: authStore.hasRole('BUYER') },
      { key: 'construction', to: '/construction/dashboard', icon: 'construction', label: t('nav.construction'), show: isRealtor },
      { key: 'supplier', to: '/supplier/dashboard', icon: 'local_shipping', label: t('nav.supplier'), show: authStore.hasRole('SUPPLIER') },
      { key: 'dashboard', to: '/dashboard', icon: 'dashboard', label: t('nav.dashboard'), show: !authStore.isAdmin },
      { key: 'profile', to: '/profile', icon: 'person', label: t('common.profile') || 'Profile', show: true }
    ].filter((e) => e.show)

    account.push({ key: 'logout', action: 'logout', icon: 'logout', label: t('nav.logout') })
    groups.push({ key: 'account', label: t('nav.account'), items: account })
  }

  return groups
})

// Every group starts expanded; collapsing is a per-session convenience for the
// signed-in lists, which run long.
const collapsedGroups = ref({})

function toggleGroup(key) {
  collapsedGroups.value = { ...collapsedGroups.value, [key]: !collapsedGroups.value[key] }
}

// Highlights the row for the page you are on. Anchor entries (/#who-attends) share
// the landing page's path, so matching on path alone would light up all of them at
// once — they are deliberately never marked current.
function isCurrent(to) {
  if (typeof to !== 'string' || to.includes('#')) return false
  return route.path === to
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

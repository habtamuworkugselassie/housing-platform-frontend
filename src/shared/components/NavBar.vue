<template>
  <nav class="site-nav border-b border-white/10 sticky top-0 z-[70] text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 relative">
        <!-- Public "Get the app" — centered in the header (all screens) -->
        <a
          href="/download.html"
          class="inline-flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:border-primary-400 hover:text-primary-400"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" />
          </svg>
          {{ $t('nav.getAppShort') }}
        </a>
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="sm:hidden p-2 rounded-md text-gray-400 hover:text-primary-400 hover:bg-violet-950/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
            :aria-label="$t('nav.toggleMenu')"
          >
            <span class="material-icons">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
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
            class="hidden sm:ml-6 sm:flex relative"
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
              <span class="text-base" aria-hidden="true">🏪</span>
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

          <div v-if="isExhibitionPage" class="hidden md:ml-6 md:flex md:space-x-6">
            <router-link to="/#show-features" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-primary-400">{{ $t('nav.showFeatures') }}</router-link>
            <router-link to="/#who-attends" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-primary-400">{{ $t('nav.whoAttends') }}</router-link>
          </div>
        </div>
        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Desktop Navigation -->
          <div class="hidden sm:flex items-center space-x-4">
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
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden border-t border-white/10 bg-primary-950/95 backdrop-blur-sm">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('nav.marketplace') }}</div>
          <router-link
            v-for="cat in marketplaceCategories"
            :key="cat.to"
            :to="cat.to"
            @click="mobileMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2 pl-5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary-400 ring-1 ring-white/10">
              <span class="material-icons !text-[16px] leading-none" aria-hidden="true">{{ cat.icon }}</span>
            </span>
            {{ $t(cat.labelKey) }}
          </router-link>
          <router-link
            to="/properties"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
          >
            {{ $t('nav.properties') }}
          </router-link>
          <template v-if="isExhibitionPage">
            <router-link to="/#show-features" @click="mobileMenuOpen = false" class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md">{{ $t('nav.showFeatures') }}</router-link>
            <router-link to="/#who-attends" @click="mobileMenuOpen = false" class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md">{{ $t('nav.whoAttends') }}</router-link>
          </template>
          <template v-if="authStore.isAuthenticated">
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/buildings"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              {{ $t('nav.buildings') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/submit-property"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-primary-950 bg-gold-400 hover:bg-gold-500 rounded-md"
            >
              {{ $t('nav.submitProperty') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/agent/messages"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              Messages
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/go-live"
              @click="mobileMenuOpen = false"
              class="flex items-center gap-2 px-3 py-2 text-base font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" aria-hidden="true" />
              {{ $t('nav.goLive') }}
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/admin"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-primary-950 bg-gold-400 hover:bg-gold-500 rounded-md"
            >
              {{ $t('nav.adminPortal') }}
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/sponsorships"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              {{ $t('nav.sponsorships') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('BANKER')"
              to="/banking/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              {{ $t('nav.banking') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('BUYER')"
              to="/loan-applications"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              {{ $t('nav.myLoans') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/construction/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              {{ $t('nav.construction') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('SUPPLIER')"
              to="/supplier/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              {{ $t('nav.supplier') }}
            </router-link>
            <router-link
              v-if="!authStore.isAdmin"
              to="/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              {{ $t('nav.dashboard') }}
            </router-link>
            
            <!-- User Info in Mobile Menu -->
            <div class="px-3 py-2 border-t border-white/10 mt-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-semibold overflow-hidden shrink-0">
                  <img v-if="authStore.user?.profileImageUrl" :src="mediaUrl(authStore.user.profileImageUrl)" alt="Profile" class="w-full h-full object-cover" />
                  <template v-else>{{ (authStore.user?.firstName?.[0] || 'U').toUpperCase() }}</template>
                </div>
                <div>
                  <div class="text-sm font-medium text-white">{{ authStore.user?.firstName || 'User' }} {{ authStore.user?.lastName }}</div>
                  <div class="text-xs text-gray-400">{{ authStore.user?.email }}</div>
                </div>
              </div>
            </div>
            
            <router-link
              to="/profile"
              @click="mobileMenuOpen = false"
              class="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-violet-950/20 rounded-md"
            >
              <div class="flex items-center gap-2">
                <span class="material-icons text-xl" aria-hidden="true">person</span>
                <span>{{ $t('common.profile') || 'Profile' }}</span>
              </div>
            </router-link>
            
            <button
              @click="handleLogout"
              class="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-md"
            >
              <div class="flex items-center gap-2">
                <span class="material-icons text-xl" aria-hidden="true">logout</span>
                <span>{{ $t('nav.logout') }}</span>
              </div>
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/features/auth'
import { mediaUrl } from '@/shared/api/client'
import { useRouter, useRoute } from 'vue-router'
import LocaleSwitcher from '@/shared/components/LocaleSwitcher.vue'
import UserDropdown from '@/shared/components/UserDropdown.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const mobileMenuOpen = ref(false)
const marketplaceDropdownOpen = ref(false)

// Single source of truth for the marketplace categories so the desktop
// dropdown and the mobile menu share one consistent icon set (Material Icons,
// no mismatched emoji).
const marketplaceCategories = [
  { to: '/marketplace/real-estate', labelKey: 'nav.marketplaceRealEstate', icon: 'home_work' },
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

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
  mobileMenuOpen.value = false
}
</script>

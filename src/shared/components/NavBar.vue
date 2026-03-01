<template>
  <nav class="bg-black border-b border-white/10 sticky top-0 z-50 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="sm:hidden p-2 rounded-md text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-400"
            :aria-label="$t('nav.toggleMenu')"
          >
            <span class="material-icons">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
          </button>
          
          <router-link to="/" class="flex items-center px-2 py-2 text-lg sm:text-xl font-bold text-white hover:text-yellow-400">
            🏠 <span class="hidden xs:inline">{{ $t('common.appName') }}</span>
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
              :class="marketplaceDropdownOpen ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:text-yellow-400 hover:bg-white/5'"
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
                    to="/marketplace/real-estate"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 transition-colors duration-150 border-l-2 border-transparent hover:border-yellow-400"
                    @click="marketplaceDropdownOpen = false"
                  >
                    <span class="text-lg" aria-hidden="true">🏠</span>
                    {{ $t('nav.marketplaceRealEstate') }}
                  </router-link>
                  <router-link
                    to="/marketplace/banks"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 transition-colors duration-150 border-l-2 border-transparent hover:border-yellow-400"
                    @click="marketplaceDropdownOpen = false"
                  >
                    <span class="text-lg" aria-hidden="true">🏦</span>
                    {{ $t('nav.marketplaceBanks') }}
                  </router-link>
                  <router-link
                    to="/marketplace/insurance"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 transition-colors duration-150 border-l-2 border-transparent hover:border-yellow-400"
                    @click="marketplaceDropdownOpen = false"
                  >
                    <span class="text-lg" aria-hidden="true">🛡️</span>
                    {{ $t('nav.marketplaceInsurance') }}
                  </router-link>
                  <router-link
                    to="/marketplace/contractors"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 transition-colors duration-150 border-l-2 border-transparent hover:border-yellow-400"
                    @click="marketplaceDropdownOpen = false"
                  >
                    <span class="text-lg" aria-hidden="true">👷</span>
                    {{ $t('nav.marketplaceContractors') }}
                  </router-link>
                  <router-link
                    to="/marketplace/consultants-and-architects"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 transition-colors duration-150 border-l-2 border-transparent hover:border-yellow-400"
                    @click="marketplaceDropdownOpen = false"
                  >
                    <span class="text-lg" aria-hidden="true">📐</span>
                    {{ $t('nav.marketplaceConsultantsArchitects') }}
                  </router-link>
                  <router-link
                    to="/marketplace/suppliers"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 transition-colors duration-150 border-l-2 border-transparent hover:border-yellow-400"
                    @click="marketplaceDropdownOpen = false"
                  >
                    <span class="text-lg" aria-hidden="true">📦</span>
                    {{ $t('nav.marketplaceSuppliers') }}
                  </router-link>
                  <router-link
                    to="/marketplace/finishing-work"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 transition-colors duration-150 border-l-2 border-transparent hover:border-yellow-400"
                    @click="marketplaceDropdownOpen = false"
                  >
                    <span class="text-lg" aria-hidden="true">✨</span>
                    {{ $t('nav.marketplaceFinishingWork') }}
                  </router-link>
                </div>
              </div>
            </Transition>
          </div>

          <div v-if="isExhibitionPage" class="hidden md:ml-6 md:flex md:space-x-6">
            <router-link to="/#show-features" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-yellow-400">{{ $t('nav.showFeatures') }}</router-link>
            <router-link to="/#who-attends" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-yellow-400">{{ $t('nav.whoAttends') }}</router-link>
          </div>
        </div>
        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Desktop Navigation -->
          <div class="hidden sm:flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/buildings"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                {{ $t('nav.buildings') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/submit-property"
                class="px-3 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-yellow-400"
              >
                {{ $t('nav.submitProperty') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('ADMIN')"
                to="/admin"
                class="px-3 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-yellow-400"
              >
                {{ $t('nav.admin') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('ADMIN')"
                to="/sponsorships"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                {{ $t('nav.sponsorships') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('BANKER')"
                to="/banking/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                {{ $t('nav.banking') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('BUYER')"
                to="/loan-applications"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                {{ $t('nav.myLoans') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/construction/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                {{ $t('nav.construction') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('SUPPLIER')"
                to="/supplier/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                {{ $t('nav.supplier') }}
              </router-link>
              <router-link
                :to="authStore.hasRole('ADMIN') ? '/admin' : '/dashboard'"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                {{ $t('nav.dashboard') }}
              </router-link>
              
              <!-- User Profile Section -->
              <div class="flex items-center gap-2 pl-4 border-l border-white/20">
                <div class="text-right hidden md:block">
                  <div class="text-sm font-medium text-white">{{ authStore.user?.firstName || $t('common.user') }}</div>
                  <div class="text-xs text-gray-400">{{ authStore.user?.phoneNumber || '+251 9XX XXX XXX' }}</div>
                </div>
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center font-semibold text-sm sm:text-base">
                  {{ (authStore.user?.firstName?.[0] || 'U').toUpperCase() }}
                </div>
              </div>
              
              <button
                @click="handleLogout"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                <span class="hidden sm:inline">{{ $t('nav.logout') }}</span>
                <span class="material-icons sm:hidden">logout</span>
              </button>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400"
              >
                <span class="hidden sm:inline">{{ $t('nav.login') }}</span>
                <span class="sm:hidden">{{ $t('nav.login') }}</span>
              </router-link>
              <router-link
                to="/register"
                class="px-3 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-yellow-400"
              >
                <span class="hidden sm:inline">{{ $t('nav.register') }}</span>
                <span class="sm:hidden">{{ $t('nav.signUp') }}</span>
              </router-link>
            </template>
          </div>
          
          <!-- Language Switcher -->
          <button
            @click="toggleLanguage"
            class="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-yellow-400 border border-white/30 rounded-md hover:bg-yellow-500/20 hover:border-yellow-400"
            :title="$t('nav.language')"
          >
            <span class="hidden sm:inline">{{ localeStore.currentLocale === 'en' ? '🇬🇧 EN' : '🇪🇹 አማ' }}</span>
            <span class="sm:hidden">{{ localeStore.currentLocale === 'en' ? 'EN' : 'አማ' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden border-t border-white/10 bg-zinc-900/95">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('nav.marketplace') }}</div>
          <router-link to="/marketplace/real-estate" @click="mobileMenuOpen = false" class="block px-3 py-2 pl-5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.marketplaceRealEstate') }}</router-link>
          <router-link to="/marketplace/banks" @click="mobileMenuOpen = false" class="block px-3 py-2 pl-5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.marketplaceBanks') }}</router-link>
          <router-link to="/marketplace/insurance" @click="mobileMenuOpen = false" class="block px-3 py-2 pl-5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.marketplaceInsurance') }}</router-link>
          <router-link to="/marketplace/contractors" @click="mobileMenuOpen = false" class="block px-3 py-2 pl-5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.marketplaceContractors') }}</router-link>
          <router-link to="/marketplace/consultants-and-architects" @click="mobileMenuOpen = false" class="block px-3 py-2 pl-5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.marketplaceConsultantsArchitects') }}</router-link>
          <router-link to="/marketplace/suppliers" @click="mobileMenuOpen = false" class="block px-3 py-2 pl-5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.marketplaceSuppliers') }}</router-link>
          <router-link to="/marketplace/finishing-work" @click="mobileMenuOpen = false" class="block px-3 py-2 pl-5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.marketplaceFinishingWork') }}</router-link>
          <router-link
            to="/properties"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
          >
            {{ $t('nav.properties') }}
          </router-link>
          <template v-if="isExhibitionPage">
            <router-link to="/#show-features" @click="mobileMenuOpen = false" class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.showFeatures') }}</router-link>
            <router-link to="/#who-attends" @click="mobileMenuOpen = false" class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md">{{ $t('nav.whoAttends') }}</router-link>
          </template>
          <template v-if="authStore.isAuthenticated">
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/buildings"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.buildings') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/submit-property"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-black bg-white hover:bg-yellow-400 rounded-md"
            >
              {{ $t('nav.submitProperty') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('ADMIN')"
              to="/admin"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-black bg-white hover:bg-yellow-400 rounded-md"
            >
              {{ $t('nav.adminPortal') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('ADMIN')"
              to="/sponsorships"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.sponsorships') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('BANKER')"
              to="/banking/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.banking') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('BUYER')"
              to="/loan-applications"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.myLoans') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/construction/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.construction') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('SUPPLIER')"
              to="/supplier/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.supplier') }}
            </router-link>
            <router-link
              :to="authStore.hasRole('ADMIN') ? '/admin' : '/dashboard'"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.dashboard') }}
            </router-link>
            
            <!-- User Info in Mobile Menu -->
            <div class="px-3 py-2 border-t border-white/10 mt-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-semibold">
                  {{ (authStore.user?.firstName?.[0] || 'U').toUpperCase() }}
                </div>
                <div>
                  <div class="text-sm font-medium text-white">{{ authStore.user?.firstName || 'User' }} {{ authStore.user?.lastName }}</div>
                  <div class="text-xs text-gray-400">{{ authStore.user?.email }}</div>
                </div>
              </div>
            </div>
            
            <button
              @click="handleLogout; mobileMenuOpen = false"
              class="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.logout') }}
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md"
            >
              {{ $t('nav.login') }}
            </router-link>
            <router-link
              to="/register"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-black bg-white hover:bg-yellow-400 rounded-md"
            >
              {{ $t('nav.register') }}
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/features/auth'
import { useLocaleStore } from '@/stores/locale'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const localeStore = useLocaleStore()
const router = useRouter()
const route = useRoute()
const mobileMenuOpen = ref(false)
const marketplaceDropdownOpen = ref(false)

const onMarketplaceBlur = () => {
  setTimeout(() => { marketplaceDropdownOpen.value = false }, 150)
}

const isExhibitionPage = computed(() => route.path === '/' || route.path === '/exhibition')

const toggleLanguage = () => {
  localeStore.toggleLocale()
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
  mobileMenuOpen.value = false
}
</script>

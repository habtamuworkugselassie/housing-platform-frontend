<template>
  <nav class="bg-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            aria-label="Toggle menu"
          >
            <span class="material-icons">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
          </button>
          
          <router-link to="/" class="flex items-center px-2 py-2 text-lg sm:text-xl font-bold text-primary-600">
            🏠 <span class="hidden xs:inline">{{ $t('common.appName') }}</span>
          </router-link>
          
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              to="/properties"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
            >
              {{ $t('nav.properties') }}
            </router-link>
          </div>
        </div>
        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Desktop Navigation -->
          <div class="hidden sm:flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/buildings"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                {{ $t('nav.buildings') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/submit-property"
                class="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                {{ $t('nav.submitProperty') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('ADMIN')"
                to="/admin"
                class="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Admin
              </router-link>
              <router-link
                v-if="authStore.hasRole('ADMIN')"
                to="/sponsorships"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                {{ $t('nav.sponsorships') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('BANKER')"
                to="/banking/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                {{ $t('nav.banking') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('BUYER')"
                to="/loan-applications"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                {{ $t('nav.myLoans') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('REALTOR')"
                to="/construction/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                {{ $t('nav.construction') }}
              </router-link>
              <router-link
                v-if="authStore.hasRole('SUPPLIER')"
                to="/supplier/dashboard"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                {{ $t('nav.supplier') }}
              </router-link>
              <router-link
                :to="authStore.hasRole('ADMIN') ? '/admin' : '/dashboard'"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                {{ $t('nav.dashboard') }}
              </router-link>
              
              <!-- User Profile Section -->
              <div class="flex items-center gap-2 pl-4 border-l border-gray-300">
                <div class="text-right hidden md:block">
                  <div class="text-sm font-medium text-gray-900">{{ authStore.user?.firstName || 'User' }}</div>
                  <div class="text-xs text-gray-500">{{ authStore.user?.phoneNumber || '+251 9XX XXX XXX' }}</div>
                </div>
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                  {{ (authStore.user?.firstName?.[0] || 'U').toUpperCase() }}
                </div>
              </div>
              
              <button
                @click="handleLogout"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                <span class="hidden sm:inline">{{ $t('nav.logout') }}</span>
                <span class="material-icons sm:hidden">logout</span>
              </button>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                <span class="hidden sm:inline">{{ $t('nav.login') }}</span>
                <span class="sm:hidden">Login</span>
              </router-link>
              <router-link
                to="/register"
                class="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                <span class="hidden sm:inline">{{ $t('nav.register') }}</span>
                <span class="sm:hidden">Sign Up</span>
              </router-link>
            </template>
          </div>
          
          <!-- Language Switcher -->
          <button
            @click="toggleLanguage"
            class="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-primary-600 border border-gray-300 rounded-md hover:bg-gray-50"
            :title="$t('nav.language')"
          >
            <span class="hidden sm:inline">{{ localeStore.currentLocale === 'en' ? '🇬🇧 EN' : '🇪🇹 አማ' }}</span>
            <span class="sm:hidden">{{ localeStore.currentLocale === 'en' ? 'EN' : 'አማ' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden border-t border-gray-200">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link
            to="/properties"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600 hover:bg-gray-50 rounded-md"
          >
            {{ $t('nav.properties') }}
          </router-link>
          
          <template v-if="authStore.isAuthenticated">
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/buildings"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.buildings') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/submit-property"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
            >
              {{ $t('nav.submitProperty') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('ADMIN')"
              to="/admin"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
            >
              Admin Portal
            </router-link>
            <router-link
              v-if="authStore.hasRole('ADMIN')"
              to="/sponsorships"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.sponsorships') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('BANKER')"
              to="/banking/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.banking') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('BUYER')"
              to="/loan-applications"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.myLoans') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/construction/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.construction') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('SUPPLIER')"
              to="/supplier/dashboard"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.supplier') }}
            </router-link>
            <router-link
              :to="authStore.hasRole('ADMIN') ? '/admin' : '/dashboard'"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.dashboard') }}
            </router-link>
            
            <!-- User Info in Mobile Menu -->
            <div class="px-3 py-2 border-t border-gray-200 mt-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {{ (authStore.user?.firstName?.[0] || 'U').toUpperCase() }}
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ authStore.user?.firstName || 'User' }} {{ authStore.user?.lastName }}</div>
                  <div class="text-xs text-gray-500">{{ authStore.user?.email }}</div>
                </div>
              </div>
            </div>
            
            <button
              @click="handleLogout; mobileMenuOpen = false"
              class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.logout') }}
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {{ $t('nav.login') }}
            </router-link>
            <router-link
              to="/register"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
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
import { ref } from 'vue'
import { useAuthStore } from '@/features/auth'
import { useLocaleStore } from '@/stores/locale'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const localeStore = useLocaleStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

const toggleLanguage = () => {
  localeStore.toggleLocale()
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
  mobileMenuOpen.value = false
}
</script>

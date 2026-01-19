<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <router-link to="/" class="flex items-center px-2 py-2 text-xl font-bold text-primary-600">
            🏠 {{ $t('common.appName') }}
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
        <div class="flex items-center space-x-4">
          <template v-if="authStore.isAuthenticated">
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/buildings"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.buildings') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/submit-property"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              {{ $t('nav.submitProperty') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('ADMIN')"
              to="/admin"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Admin Portal
            </router-link>
            <router-link
              v-if="authStore.hasRole('ADMIN')"
              to="/sponsorships"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.sponsorships') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('BANKER')"
              to="/banking/dashboard"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.banking') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('BUYER')"
              to="/loan-applications"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.myLoans') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('REALTOR')"
              to="/construction/dashboard"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.construction') }}
            </router-link>
            <router-link
              v-if="authStore.hasRole('SUPPLIER')"
              to="/supplier/dashboard"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.supplier') }}
            </router-link>
            <router-link
              :to="authStore.hasRole('ADMIN') ? '/admin' : '/dashboard'"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.dashboard') }}
            </router-link>
            
            <!-- User Profile Section -->
            <div class="flex items-center gap-2 pl-4 border-l border-gray-300">
              <div class="text-right hidden sm:block">
                <div class="text-sm font-medium text-gray-900">{{ authStore.user?.firstName || 'User' }}</div>
                <div class="text-xs text-gray-500">{{ authStore.user?.phoneNumber || '+251 9XX XXX XXX' }}</div>
              </div>
              <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {{ (authStore.user?.firstName?.[0] || 'U').toUpperCase() }}
              </div>
            </div>
            
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.logout') }}
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {{ $t('nav.login') }}
            </router-link>
            <router-link
              to="/register"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              {{ $t('nav.register') }}
            </router-link>
          </template>
          <div class="flex">
            <!-- Language Switcher -->
            <button
                @click="toggleLanguage"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 border border-gray-300 rounded-md hover:bg-gray-50"
                :title="$t('nav.language')"
            >
              {{ localeStore.currentLocale === 'en' ? '🇬🇧 EN' : '🇪🇹 አማ' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/features/auth'
import { useLocaleStore } from '@/stores/locale'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const localeStore = useLocaleStore()
const router = useRouter()

const toggleLanguage = () => {
  localeStore.toggleLocale()
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

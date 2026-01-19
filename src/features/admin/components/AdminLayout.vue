<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:inset-0'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo/Brand -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">H</span>
            </div>
            <span class="ml-3 text-xl font-semibold text-gray-900">Admin Portal</span>
          </div>
          <button
            @click="sidebarOpen = false"
            class="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.path"
            :class="[
              'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
              isActive(item.path)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.iconPath" />
            </svg>
            {{ item.name }}
            <span
              v-if="item.badge"
              class="ml-auto px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-gray-600 font-medium">{{ userInitials }}</span>
              </div>
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
              <p class="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="mt-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center justify-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-0">
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="flex-1 flex items-center justify-end space-x-4">
          <!-- Search -->
          <div class="hidden md:block relative">
            <input
              type="text"
              placeholder="Search..."
              class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Notifications -->
          <button class="relative p-2 text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              v-if="pendingApprovals > 0"
              class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
            ></span>
          </button>

          <!-- Theme Toggle -->
          <button class="p-2 text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
        <slot />
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const pendingApprovals = ref(0) // TODO: Load from stats

const userName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName} ${user.lastName}` : 'Admin'
})

const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return 'A'
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'A'
})

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Navigation items
const navigation = [
  {
    name: 'Dashboard',
    path: '/admin',
    iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    badge: null
  },
  {
    name: 'Users',
    path: '/admin/users',
    iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    badge: null
  },
  {
    name: 'Organizations',
    path: '/admin/organizations',
    iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    badge: pendingApprovals.value > 0 ? pendingApprovals.value : null
  },
  {
    name: 'Properties',
    path: '/admin/properties',
    iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    badge: null
  },
  {
    name: 'Buildings',
    path: '/admin/buildings',
    iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    badge: null
  },
  {
    name: 'Construction',
    path: '/admin/construction',
    iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    badge: null
  },
  {
    name: 'Banking',
    path: '/admin/banking',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    badge: null
  },
  {
    name: 'Loans',
    path: '/admin/loans',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    badge: null
  },
  {
    name: 'Sponsorships',
    path: '/admin/sponsorships',
    iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    badge: null
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    badge: null
  }
]
</script>

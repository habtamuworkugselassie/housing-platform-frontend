<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold text-white">Dashboard</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('admin.overviewSubtitle') }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Total Users</p>
              <p class="text-2xl font-semibold text-white">{{ stats?.totalUsers || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Organizations</p>
              <p class="text-2xl font-semibold text-white">{{ stats?.totalOrganizations || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Properties</p>
              <p class="text-2xl font-semibold text-white">{{ stats?.totalProperties || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Pending Approvals</p>
              <p class="text-2xl font-semibold text-white">{{ stats?.pendingApprovals || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Activity Chart -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <h3 class="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start space-x-3"
            >
              <div class="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white">{{ activity.description }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatTime(activity.timestamp) }}</p>
              </div>
            </div>
            <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
              No recent activity
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div class="grid grid-cols-2 gap-4">
            <router-link
              to="/admin/organizations"
              class="p-4 border-2 border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors text-white"
            >
              <div class="text-center">
                <svg class="w-8 h-8 text-yellow-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm font-medium text-white">Approve Organizations</p>
              </div>
            </router-link>

            <router-link
              to="/admin/users"
              class="p-4 border-2 border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors text-white"
            >
              <div class="text-center">
                <svg class="w-8 h-8 text-yellow-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p class="text-sm font-medium text-white">Manage Users</p>
              </div>
            </router-link>

            <router-link
              to="/admin/properties"
              class="p-4 border-2 border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors text-white"
            >
              <div class="text-center">
                <svg class="w-8 h-8 text-yellow-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <p class="text-sm font-medium text-white">Manage Properties</p>
              </div>
            </router-link>

            <router-link
              to="/admin/sponsorships"
              class="p-4 border-2 border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors text-white"
            >
              <div class="text-center">
                <svg class="w-8 h-8 text-yellow-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p class="text-sm font-medium text-white">Sponsorships</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Additional Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <h3 class="text-lg font-semibold text-white mb-4">Buildings</h3>
          <p class="text-3xl font-bold text-white">{{ stats?.totalBuildings || 0 }}</p>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <h3 class="text-lg font-semibold text-white mb-4">Construction Projects</h3>
          <p class="text-3xl font-bold text-white">{{ stats?.totalProjects || 0 }}</p>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <h3 class="text-lg font-semibold text-white mb-4">Loan Applications</h3>
          <p class="text-3xl font-bold text-white">{{ stats?.totalLoanApplications || 0 }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdmin } from '../composables/useAdmin'

const admin = useAdmin()
// Access refs directly to preserve reactivity
const stats = admin.stats
const loading = admin.loading
const error = admin.error
const { loadStats } = admin

const recentActivity = computed(() => {
  return stats.value?.recentActivity || []
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadStats()
})
</script>

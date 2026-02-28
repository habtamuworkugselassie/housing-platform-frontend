<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">User Management</h1>
          <p class="mt-2 text-sm text-gray-400">Manage platform users and their roles</p>
        </div>
        <button
          class="px-4 py-2 bg-white text-black rounded-lg hover:bg-yellow-400 font-medium transition-colors"
        >
          + Add User
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-gray-300">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search users..."
              @input="loadUsersData"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Role</label>
            <select
              v-model="filters.role"
              @change="loadUsersData"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Roles</option>
              <option value="BUYER">Buyer</option>
              <option value="REALTOR">Realtor</option>
              <option value="BANKER">Banker</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Status</label>
            <select
              v-model="filters.status"
              @change="loadUsersData"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-white/10">
          <thead class="bg-zinc-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Roles</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <template v-if="loading">
              <tr>
                <td colspan="6" class="px-6 py-12 text-center bg-zinc-900">
                  <div class="flex flex-col items-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-2"></div>
                    <span class="text-sm text-gray-400">Loading users...</span>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="error">
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-sm text-red-200 bg-zinc-900">
                  <div class="space-y-2">
                    <div class="font-semibold">Error loading users:</div>
                    <div>{{ error }}</div>
                    <div class="text-xs text-gray-400 mt-2">
                      Please check your browser console for more details.
                    </div>
                  </div>
                  <button @click="loadUsersData" class="mt-4 px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors">
                    Retry
                  </button>
                </td>
              </tr>
            </template>
            <template v-else-if="!users || users.length === 0">
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-400 bg-zinc-900">
                  No users found
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="user in users"
                :key="user.id"
                class="bg-zinc-900 hover:bg-yellow-500/10 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span class="text-white font-medium text-sm">
                          {{ getUserInitials(user) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-sm text-gray-400">{{ user.phoneNumber || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="role in user.roles"
                      :key="role"
                      class="px-2 py-1 text-xs font-medium bg-blue-500/30 text-blue-200 rounded"
                    >
                      {{ role }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      isUserActive(user) ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
                    ]"
                  >
                    {{ getUserStatusText(user) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="viewUser(user)"
                    class="text-white hover:text-yellow-400 mr-4 transition-colors"
                  >
                    View
                  </button>
                  <button
                    @click="editUser(user)"
                    class="text-blue-300 hover:text-yellow-400 mr-4 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    :class="isUserActive(user) ? 'text-red-300 hover:text-yellow-400' : 'text-green-300 hover:text-yellow-400'"
                  >
                    {{ isUserActive(user) ? 'Disable' : 'Enable' }}
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="bg-zinc-800 px-6 py-4 border-t border-white/10">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-300">
              Page {{ currentPage + 1 }} of {{ totalPages }}
            </div>
            <div class="flex space-x-2">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 0"
                class="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-yellow-500/20 hover:border-yellow-400 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages - 1"
                class="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-yellow-500/20 hover:border-yellow-400 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View User Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">User Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingUser" class="space-y-4">
              <div class="flex items-center space-x-4 mb-4">
                <div class="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                  <span class="text-white font-medium text-xl">
                    {{ getUserInitials(viewingUser) }}
                  </span>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-white">
                    {{ viewingUser.firstName }} {{ viewingUser.lastName }}
                  </h4>
                  <p class="text-sm text-gray-400">{{ viewingUser.email }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">First Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingUser.firstName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Last Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingUser.lastName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Email</label>
                  <p class="mt-1 text-sm text-white">{{ viewingUser.email || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Phone</label>
                  <p class="mt-1 text-sm text-white">{{ viewingUser.phoneNumber || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Roles</label>
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span
                      v-for="role in viewingUser.roles"
                      :key="role"
                      class="px-2 py-1 text-xs font-medium bg-blue-500/30 text-blue-200 rounded"
                    >
                      {{ role }}
                    </span>
                    <span v-if="!viewingUser.roles || viewingUser.roles.length === 0" class="text-sm text-gray-400">N/A</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      isUserActive(viewingUser) ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
                    ]"
                  >
                    {{ getUserStatusText(viewingUser) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Enabled</label>
                  <p class="mt-1 text-sm text-white">{{ viewingUser.enabled !== false ? 'Yes' : 'No' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Joined</label>
                  <p class="mt-1 text-sm text-white">{{ formatDate(viewingUser.createdAt) }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewDialog = false"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminUsers } from '../composables/useAdmin'

const { users, loading, error, currentPage, totalPages, loadUsers, updateUser } = useAdminUsers()

const filters = ref({
  search: '',
  role: '',
  status: ''
})

const showViewDialog = ref(false)
const viewingUser = ref(null)

const loadUsersData = async () => {
  await loadUsers(filters.value, { size: 20 })
}

const clearFilters = () => {
  filters.value = { search: '', role: '', status: '' }
  currentPage.value = 0
  loadUsersData()
}

const changePage = (page) => {
  currentPage.value = page
  loadUsersData()
}

const getUserInitials = (user) => {
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const viewUser = (user) => {
  viewingUser.value = user
  showViewDialog.value = true
}

const editUser = (user) => {
  // TODO: Open edit modal
  console.log('Edit user:', user)
}

const isUserActive = (user) => {
  return user.status === 'ACTIVE' || (user.enabled !== false && user.status !== 'INACTIVE' && user.status !== 'SUSPENDED')
}

const getUserStatusText = (user) => {
  if (user.status === 'ACTIVE') return 'Active'
  if (user.status === 'INACTIVE') return 'Inactive'
  if (user.status === 'SUSPENDED') return 'Suspended'
  if (user.status === 'PENDING_VERIFICATION') return 'Pending'
  return user.enabled !== false ? 'Enabled' : 'Disabled'
}

const toggleUserStatus = async (user) => {
  try {
    const newStatus = isUserActive(user) ? 'INACTIVE' : 'ACTIVE'
    await updateUser(user.id, { 
      enabled: !isUserActive(user),
      status: newStatus
    })
    await loadUsersData()
  } catch (err) {
    console.error('Failed to toggle user status:', err)
  }
}

onMounted(() => {
  loadUsersData()
})
</script>

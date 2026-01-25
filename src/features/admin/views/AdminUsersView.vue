<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
          <p class="mt-2 text-sm text-gray-600">Manage platform users and their roles</p>
        </div>
        <button
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          + Add User
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search users..."
              @input="loadUsersData"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Role</label>
            <select
              v-model="filters.role"
              @change="loadUsersData"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
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
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="filters.status"
              @change="loadUsersData"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">All</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-if="loading">
              <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                    <span class="text-sm text-gray-500">Loading users...</span>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="error">
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-sm text-red-500">
                  <div class="space-y-2">
                    <div class="font-semibold">Error loading users:</div>
                    <div>{{ error }}</div>
                    <div class="text-xs text-gray-500 mt-2">
                      Please check your browser console for more details.
                    </div>
                  </div>
                  <button @click="loadUsersData" class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                    Retry
                  </button>
                </td>
              </tr>
            </template>
            <template v-else-if="!users || users.length === 0">
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                  No users found
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-gray-600 font-medium text-sm">
                          {{ getUserInitials(user) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.phoneNumber || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="role in user.roles"
                      :key="role"
                      class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                    >
                      {{ role }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      isUserActive(user) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ getUserStatusText(user) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="viewUser(user)"
                    class="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    View
                  </button>
                  <button
                    @click="editUser(user)"
                    class="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    :class="isUserActive(user) ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  >
                    {{ isUserActive(user) ? 'Disable' : 'Enable' }}
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Page {{ currentPage + 1 }} of {{ totalPages }}
            </div>
            <div class="flex space-x-2">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 0"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages - 1"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="showViewDialog = false"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">User Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-gray-500"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingUser" class="space-y-4">
              <div class="flex items-center space-x-4 mb-4">
                <div class="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-gray-600 font-medium text-xl">
                    {{ getUserInitials(viewingUser) }}
                  </span>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">
                    {{ viewingUser.firstName }} {{ viewingUser.lastName }}
                  </h4>
                  <p class="text-sm text-gray-500">{{ viewingUser.email }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingUser.firstName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingUser.lastName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingUser.email || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingUser.phoneNumber || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Roles</label>
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span
                      v-for="role in viewingUser.roles"
                      :key="role"
                      class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                    >
                      {{ role }}
                    </span>
                    <span v-if="!viewingUser.roles || viewingUser.roles.length === 0" class="text-sm text-gray-500">N/A</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      isUserActive(viewingUser) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ getUserStatusText(viewingUser) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Enabled</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingUser.enabled !== false ? 'Yes' : 'No' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Joined</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(viewingUser.createdAt) }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewDialog = false"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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

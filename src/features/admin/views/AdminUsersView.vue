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
              @input="loadUsers"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Role</label>
            <select
              v-model="filters.role"
              @change="loadUsers"
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
              @change="loadUsers"
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
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else>
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
                      user.enabled !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ user.enabled !== false ? 'Enabled' : 'Disabled' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editUser(user)"
                    class="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    :class="user.enabled !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  >
                    {{ user.enabled !== false ? 'Disable' : 'Enable' }}
                  </button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                  No users found
                </td>
              </tr>
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

const editUser = (user) => {
  // TODO: Open edit modal
  console.log('Edit user:', user)
}

const toggleUserStatus = async (user) => {
  try {
    await updateUser(user.id, { enabled: user.enabled === false })
    await loadUsersData()
  } catch (err) {
    console.error('Failed to toggle user status:', err)
  }
}

onMounted(() => {
  loadUsersData()
})
</script>

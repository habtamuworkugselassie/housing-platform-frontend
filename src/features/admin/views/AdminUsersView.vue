<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">User Management</h1>
          <p class="mt-2 text-sm text-gray-400">{{ $t('admin.manageUsers') }}</p>
        </div>
        <button
          @click="openCreateUser"
          class="px-4 py-2 bg-white text-black rounded-lg hover:bg-violet-950 font-medium transition-colors"
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
              :placeholder="$t('admin.searchUsers')"
              @input="loadUsersData"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Role</label>
            <select
              v-model="filters.role"
              @change="loadUsersData"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-black focus:border-black"
            >
              <option value="">All Roles</option>
              <option value="BUYER">Buyer</option>
              <option value="REALTOR">Realtor</option>
              <option value="BANKER">Banker</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="ADMIN">{{ $t('nav.admin') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Status</label>
            <select
              v-model="filters.status"
              @change="loadUsersData"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-black focus:border-black"
            >
              <option value="">All</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-violet-950/20 hover:border-black transition-colors"
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <template v-if="loading">
              <tr>
                <td colspan="7" class="px-6 py-12 text-center bg-zinc-900">
                  <div class="flex flex-col items-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
                    <span class="text-sm text-gray-400">{{ $t('admin.loadingUsers') }}</span>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="error">
              <tr>
                <td colspan="7" class="px-6 py-12 text-center text-sm text-red-200 bg-zinc-900">
                  <div class="space-y-2">
                    <div class="font-semibold">{{ $t('admin.errorLoadingUsers') }}</div>
                    <div>{{ error }}</div>
                    <div class="text-xs text-gray-400 mt-2">
                      Please check your browser console for more details.
                    </div>
                  </div>
                  <button @click="loadUsersData" class="mt-4 px-4 py-2 bg-white text-black rounded-md hover:bg-violet-950 transition-colors">
                    Retry
                  </button>
                </td>
              </tr>
            </template>
            <template v-else-if="!users || users.length === 0">
              <tr>
                <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-400 bg-zinc-900">
                  No users found
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="user in users"
                :key="user.id"
                class="bg-zinc-900 hover:bg-violet-950/10 transition-colors"
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
                <td class="px-6 py-4 text-sm max-w-xs">
                  <template v-for="cell in [linkedOrganizationCell(user)]" :key="`org-cell-${user.id}`">
                    <template v-if="cell.kind === 'linked'">
                      <RouterLink
                        :to="{ name: 'OrganizationDetail', params: { id: cell.org.id } }"
                        class="font-medium text-white hover:text-black hover:underline"
                      >
                        {{ cell.org.name || 'Organization' }}
                      </RouterLink>
                      <div v-if="cell.typeLabel" class="text-xs text-gray-400 mt-0.5">
                        {{ cell.typeLabel }}
                      </div>
                    </template>
                    <span v-else-if="cell.kind === 'missing'" class="text-amber-200/90">Not linked</span>
                    <span v-else class="text-gray-500">—</span>
                  </template>
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
                    class="text-white hover:text-black mr-4 transition-colors"
                  >
                    View
                  </button>
                  <button
                    @click="editUser(user)"
                    class="text-blue-300 hover:text-black mr-4 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    :class="isUserActive(user) ? 'text-red-300 hover:text-black' : 'text-green-300 hover:text-black'"
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
                class="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-violet-950/20 hover:border-black disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages - 1"
                class="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-violet-950/20 hover:border-black disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create User Modal -->
      <div
        v-if="showCreateDialog"
        class="fixed inset-0 bg-violet-950/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="closeCreateUser"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-lg shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Create User</h3>
              <button
                @click="closeCreateUser"
                class="text-gray-400 hover:text-black transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form @submit.prevent="submitCreateUser" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">First name *</label>
                  <input
                    v-model="createForm.firstName"
                    type="text"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Last name *</label>
                  <input
                    v-model="createForm.lastName"
                    type="text"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">Email *</label>
                <input
                  v-model="createForm.email"
                  type="email"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">Password *</label>
                <input
                  v-model="createForm.password"
                  type="password"
                  required
                  minlength="8"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Min 8 chars, upper, lower, number"
                />
                <p class="mt-1 text-xs text-gray-400">At least 8 characters, one uppercase, one lowercase, one number</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">Phone</label>
                <input
                  v-model="createForm.phoneNumber"
                  type="text"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">Roles *</label>
                <div class="mt-2 flex flex-wrap gap-3">
                  <label
                    v-for="opt in roleOptions"
                    :key="opt.value"
                    class="inline-flex items-center cursor-pointer"
                  >
                    <input
                      v-model="createForm.roles"
                      type="checkbox"
                      :value="opt.value"
                      class="rounded border-white/20 bg-white/5 text-black focus:ring-black"
                    />
                    <span class="ml-2 text-sm text-gray-300">{{ opt.label }}</span>
                  </label>
                </div>
                <p v-if="createError" class="mt-2 text-sm text-red-400">{{ createError }}</p>
              </div>

              <!-- Organization: list filtered by role — realtor → real estate, banker → bank, supplier → supplier -->
              <div v-if="showOrganizationSelect" class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Organization</label>
                <p class="text-xs text-gray-400">
                  All organizations matching the selected role(s) are listed (any approval status), grouped by type.
                  Register a new one in
                  <RouterLink
                    to="/admin/organizations"
                    class="text-black hover:underline"
                    @click="closeCreateUser"
                  >
                    Organization management
                  </RouterLink>
                  , then reopen Add User to refresh.
                </p>
                <p v-if="organizationFilterSummary" class="text-xs text-black/90 font-medium">
                  {{ organizationFilterSummary }}
                </p>
                <select
                  v-model="createForm.organizationId"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="">None (optional)</option>
                  <template v-for="group in organizationsGroupedForCreate" :key="group.type">
                    <optgroup :label="group.label">
                      <option v-for="org in group.orgs" :key="org.id" :value="org.id">
                        {{ organizationSelectLabel(org) }}
                      </option>
                    </optgroup>
                  </template>
                </select>
                <p v-if="organizationsForCreateSelect.length === 0" class="text-xs text-amber-200/90">
                  No organizations for this role filter yet. Add one in Organization management.
                </p>
              </div>
              <div class="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  @click="closeCreateUser"
                  class="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-violet-950/20 hover:border-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="createSubmitting"
                  class="px-4 py-2 bg-white text-black rounded-md hover:bg-violet-950 disabled:opacity-50 disabled:bg-white/50 transition-colors"
                >
                  {{ createSubmitting ? 'Creating…' : 'Create User' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div
        v-if="showEditDialog"
        class="fixed inset-0 bg-violet-950/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="closeEditUser"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-lg shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Edit User</h3>
              <button
                type="button"
                @click="closeEditUser"
                class="text-gray-400 hover:text-black transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form @submit.prevent="submitEditUser" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">First name *</label>
                  <input
                    v-model="editForm.firstName"
                    type="text"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Last name *</label>
                  <input
                    v-model="editForm.lastName"
                    type="text"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">Email *</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">Phone</label>
                <input
                  v-model="editForm.phoneNumber"
                  type="text"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">Status *</label>
                <select
                  v-model="editForm.status"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option v-for="s in userStatusOptions" :key="s" :value="s">{{ s.replace(/_/g, ' ') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">Roles *</label>
                <div class="mt-2 flex flex-wrap gap-3">
                  <label
                    v-for="opt in roleOptions"
                    :key="`edit-${opt.value}`"
                    class="inline-flex items-center cursor-pointer"
                  >
                    <input
                      v-model="editForm.roles"
                      type="checkbox"
                      :value="opt.value"
                      class="rounded border-white/20 bg-white/5 text-black focus:ring-black"
                    />
                    <span class="ml-2 text-sm text-gray-300">{{ opt.label }}</span>
                  </label>
                </div>
                <p class="mt-2 text-xs text-gray-400">
                  Saved roles apply to the account right away. JWT scopes for that user update after they sign in again
                  or when the client refreshes the access token.
                </p>
                <p v-if="editError" class="mt-2 text-sm text-red-400">{{ editError }}</p>
              </div>
              <div v-if="showOrganizationSelectEdit" class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Organization</label>
                <p class="text-xs text-gray-400">
                  All organizations for the selected role(s) (any status). Manage orgs in
                  <RouterLink
                    to="/admin/organizations"
                    class="text-black hover:underline"
                    @click="closeEditUser"
                  >
                    Organization management
                  </RouterLink>
                  .
                </p>
                <p v-if="organizationFilterSummaryEdit" class="text-xs text-black/90 font-medium">
                  {{ organizationFilterSummaryEdit }}
                </p>
                <select
                  v-model="editForm.organizationId"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="">None (optional)</option>
                  <template v-for="group in organizationsGroupedForEdit" :key="`edit-${group.type}`">
                    <optgroup :label="group.label">
                      <option v-for="org in group.orgs" :key="org.id" :value="org.id">
                        {{ organizationSelectLabel(org) }}
                      </option>
                    </optgroup>
                  </template>
                </select>
                <p v-if="organizationsForEditSelect.length === 0" class="text-xs text-amber-200/90">
                  No organizations for this role filter yet.
                </p>
              </div>
              <div class="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  @click="closeEditUser"
                  class="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-violet-950/20 hover:border-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="editSubmitting"
                  class="px-4 py-2 bg-white text-black rounded-md hover:bg-violet-950 disabled:opacity-50 disabled:bg-white/50 transition-colors"
                >
                  {{ editSubmitting ? 'Saving…' : 'Save changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- View User Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-violet-950/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">User Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-black transition-colors"
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
                <div v-if="userExpectsOrganizationLink(viewingUser.roles)" class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Linked organization</label>
                  <template v-for="cell in [linkedOrganizationCell(viewingUser)]" :key="`view-org-${viewingUser.id}`">
                    <div v-if="cell.kind === 'linked'" class="mt-1">
                      <RouterLink
                        :to="{ name: 'OrganizationDetail', params: { id: cell.org.id } }"
                        class="text-sm font-medium text-white hover:text-black hover:underline"
                      >
                        {{ cell.org.name || 'Organization' }}
                      </RouterLink>
                      <p v-if="cell.typeLabel" class="text-xs text-gray-400 mt-0.5">{{ cell.typeLabel }}</p>
                    </div>
                    <p v-else-if="cell.kind === 'missing'" class="mt-1 text-sm text-amber-200/90">Not linked</p>
                  </template>
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
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-violet-950 transition-colors"
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
import { ref, onMounted, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminUsers, useAdminOrganizations } from '../composables/useAdmin'

const { t } = useI18n()
const { users, loading, error, currentPage, totalPages, loadUsers, updateUser, createUser } = useAdminUsers()
const { organizations, loadOrganizations } = useAdminOrganizations()

/** Roles that are tied to a marketplace organization (real estate, bank, supplier). */
const ROLES_WITH_ORGANIZATION = new Set(['REALTOR', 'BANKER', 'SUPPLIER'])

const ORG_TYPE_LABEL_KEYS = {
  REAL_ESTATE_COMPANY: 'admin.typeRealEstate',
  BANK: 'nav.marketplaceBanks',
  SUPPLIER: 'nav.marketplaceSuppliers',
  CONTRACTOR: 'nav.marketplaceContractors',
  DEVELOPER: 'admin.typeDeveloper',
  INSURANCE: 'nav.marketplaceInsurance',
  FINISHING_CONTRACTOR: 'nav.marketplaceFinishingWork'
}

function organizationTypeLabel(type) {
  if (!type) return ''
  if (type === 'CONSULTANT_ARCHITECT') return t('nav.marketplaceConsultantsArchitects')
  return ORG_TYPE_LABEL_KEYS[type] ? t(ORG_TYPE_LABEL_KEYS[type]) : type
}

const organizationById = computed(() => {
  const map = new Map()
  for (const org of organizations.value || []) {
    if (org?.id != null) map.set(String(org.id), org)
  }
  return map
})

function userExpectsOrganizationLink(roles) {
  if (!Array.isArray(roles)) return false
  return roles.some((r) => ROLES_WITH_ORGANIZATION.has(r))
}

/**
 * @returns {{ kind: 'na' } | { kind: 'missing' } | { kind: 'linked', org: { id: string, name?: string }, typeLabel: string }}
 */
function linkedOrganizationCell(user) {
  if (!userExpectsOrganizationLink(user?.roles)) return { kind: 'na' }
  const id = user?.organizationId
  if (!id) return { kind: 'missing' }
  const org = organizationById.value.get(String(id))
  if (!org) {
    return {
      kind: 'linked',
      org: { id, name: 'Unknown organization' },
      typeLabel: ''
    }
  }
  return {
    kind: 'linked',
    org,
    typeLabel: organizationTypeLabel(org.type)
  }
}

const filters = ref({
  search: '',
  role: '',
  status: ''
})

const showViewDialog = ref(false)
const viewingUser = ref(null)

const showCreateDialog = ref(false)
const createSubmitting = ref(false)
const createError = ref('')
const createForm = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  roles: [],
  organizationId: ''
})

const ROLE_TO_ORG_TYPES = {
  REALTOR: ['REAL_ESTATE_COMPANY'],
  BANKER: ['BANK'],
  SUPPLIER: ['SUPPLIER']
}

const ORG_TYPES_IN_ORDER = ['REAL_ESTATE_COMPANY', 'BANK', 'SUPPLIER']

const userStatusOptions = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']

function orgTypesForRoles(roles) {
  const types = new Set()
  for (const role of roles || []) {
    const mapped = ROLE_TO_ORG_TYPES[role]
    if (mapped) mapped.forEach((t) => types.add(t))
  }
  return types
}

/** Admin can link users to any org of the right type (not only APPROVED). */
function filteredOrgsForRoles(roles) {
  const types = orgTypesForRoles(roles)
  if (types.size === 0) return []
  return (organizations.value || []).filter((org) => org?.type && types.has(org.type))
}

function groupedOrgsForRoles(roles) {
  const types = orgTypesForRoles(roles)
  const groups = []
  for (const type of ORG_TYPES_IN_ORDER) {
    if (!types.has(type)) continue
    const orgs = (organizations.value || []).filter((org) => org?.type === type)
    groups.push({
      type,
      label: organizationTypeLabel(type),
      orgs
    })
  }
  return groups
}

function organizationSelectLabel(org) {
  const name = org?.name || 'Organization'
  const st = org?.status
  if (st == null || st === '') return name
  return `${name} (${st})`
}

function organizationFilterSummaryForRoles(roles) {
  const r = roles || []
  const parts = []
  if (r.includes('REALTOR')) parts.push(`Realtor → ${organizationTypeLabel('REAL_ESTATE_COMPANY')}`)
  if (r.includes('BANKER')) parts.push(`Banker → ${organizationTypeLabel('BANK')}`)
  if (r.includes('SUPPLIER')) parts.push(`Supplier → ${organizationTypeLabel('SUPPLIER')}`)
  return parts.length ? `Showing: ${parts.join(' · ')}` : ''
}

const showOrganizationSelect = computed(() => {
  return createForm.value.roles.some((role) => ROLES_WITH_ORGANIZATION.has(role))
})

const organizationsForCreateSelect = computed(() =>
  filteredOrgsForRoles(createForm.value.roles)
)

const organizationsGroupedForCreate = computed(() =>
  groupedOrgsForRoles(createForm.value.roles)
)

const organizationFilterSummary = computed(() =>
  organizationFilterSummaryForRoles(createForm.value.roles)
)

const showEditDialog = ref(false)
const editingUserId = ref(null)
const editingUserSnapshot = ref(null)
const editSubmitting = ref(false)
const editError = ref('')
const editForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  roles: [],
  status: 'ACTIVE',
  organizationId: ''
})

const showOrganizationSelectEdit = computed(() =>
  (editForm.value.roles || []).some((role) => ROLES_WITH_ORGANIZATION.has(role))
)

const organizationsForEditSelect = computed(() =>
  filteredOrgsForRoles(editForm.value.roles)
)

const organizationsGroupedForEdit = computed(() =>
  groupedOrgsForRoles(editForm.value.roles)
)

const organizationFilterSummaryEdit = computed(() =>
  organizationFilterSummaryForRoles(editForm.value.roles)
)

function normalizeUserRoles(roles) {
  if (Array.isArray(roles)) return [...roles]
  if (roles && typeof roles === 'object') return Object.values(roles)
  return []
}

watch(
  () => [...(createForm.value.roles || [])],
  () => {
    const allowed = new Set(
      filteredOrgsForRoles(createForm.value.roles).map((o) => String(o.id))
    )
    const id = createForm.value.organizationId
    if (id && !allowed.has(String(id))) {
      createForm.value.organizationId = ''
    }
  }
)

watch(
  () => [...(editForm.value.roles || [])],
  () => {
    const allowed = new Set(
      filteredOrgsForRoles(editForm.value.roles).map((o) => String(o.id))
    )
    const id = editForm.value.organizationId
    if (id && !allowed.has(String(id))) {
      editForm.value.organizationId = ''
    }
  }
)

const roleOptions = [
  { value: 'BUYER', label: 'Buyer' },
  { value: 'REALTOR', label: 'Realtor' },
  { value: 'BANKER', label: 'Banker' },
  { value: 'SUPPLIER', label: 'Supplier' },
  { value: 'ADMIN', label: 'Admin' }
]

const openCreateUser = async () => {
  createError.value = ''
  createForm.value = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roles: [],
    organizationId: ''
  }
  showCreateDialog.value = true
  
  if (!organizations.value || organizations.value.length === 0) {
    await loadOrganizations({ size: 1000 })
  }
}

const closeCreateUser = () => {
  showCreateDialog.value = false
  createError.value = ''
}

const submitCreateUser = async () => {
  if (!createForm.value.roles || createForm.value.roles.length === 0) {
    createError.value = 'Select at least one role.'
    return
  }
  createError.value = ''
  createSubmitting.value = true
  try {
    await createUser({
      email: createForm.value.email.trim(),
      password: createForm.value.password,
      firstName: createForm.value.firstName.trim(),
      lastName: createForm.value.lastName.trim(),
      phoneNumber: createForm.value.phoneNumber?.trim() || undefined,
      roles: createForm.value.roles,
      organizationId: createForm.value.organizationId || undefined
    })
    closeCreateUser()
    await loadUsersData()
  } catch (err) {
    const msg =
      err?.response?.data?.message || err?.message || err?.error || 'Failed to create user.'
    createError.value = typeof msg === 'string' ? msg : 'Failed to create user.'
  } finally {
    createSubmitting.value = false
  }
}

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

function rolesIncludeOrgLinked(roles) {
  return (roles || []).some((r) => ROLES_WITH_ORGANIZATION.has(r))
}

const openEditUser = async (user) => {
  editError.value = ''
  editingUserId.value = user.id
  const roles = normalizeUserRoles(user.roles)
  const rawStatus = user.status || (user.enabled !== false ? 'ACTIVE' : 'INACTIVE')
  const status = userStatusOptions.includes(rawStatus) ? rawStatus : 'ACTIVE'
  const orgId = user.organizationId != null ? String(user.organizationId) : ''
  editingUserSnapshot.value = { organizationId: orgId || null }
  editForm.value = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    roles,
    status,
    organizationId: orgId
  }
  showEditDialog.value = true
  if (!organizations.value || organizations.value.length === 0) {
    await loadOrganizations({ size: 1000 })
  }
}

const closeEditUser = () => {
  showEditDialog.value = false
  editingUserId.value = null
  editingUserSnapshot.value = null
  editError.value = ''
}

const submitEditUser = async () => {
  if (!editForm.value.roles || editForm.value.roles.length === 0) {
    editError.value = 'Select at least one role.'
    return
  }
  editError.value = ''
  editSubmitting.value = true
  try {
    const rolesNormalized = (editForm.value.roles || []).map((r) => String(r).toUpperCase())
    const payload = {
      firstName: editForm.value.firstName.trim(),
      lastName: editForm.value.lastName.trim(),
      email: editForm.value.email.trim(),
      phoneNumber: editForm.value.phoneNumber?.trim() || undefined,
      roles: rolesNormalized,
      status: editForm.value.status
    }
    if (showOrganizationSelectEdit.value) {
      if (editForm.value.organizationId) {
        payload.organizationId = editForm.value.organizationId
      } else {
        payload.clearOrganization = true
      }
    } else if (
      editingUserSnapshot.value?.organizationId &&
      !rolesIncludeOrgLinked(editForm.value.roles)
    ) {
      payload.clearOrganization = true
    }
    await updateUser(editingUserId.value, payload)
    closeEditUser()
    await loadUsersData()
  } catch (err) {
    const msg =
      err?.response?.data?.message || err?.message || err?.error || 'Failed to update user.'
    editError.value = typeof msg === 'string' ? msg : 'Failed to update user.'
  } finally {
    editSubmitting.value = false
  }
}

const editUser = (user) => {
  openEditUser(user)
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

onMounted(async () => {
  await Promise.all([loadUsersData(), loadOrganizations({})])
})
</script>

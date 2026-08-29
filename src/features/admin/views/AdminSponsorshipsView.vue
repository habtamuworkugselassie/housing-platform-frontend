<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white">Sponsorship Management</h1>
          <p class="mt-2 text-sm text-gray-400">{{ $t('admin.manageSponsorshipsSubtitle') }}</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="activeTab = 'applications'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'applications'
                ? 'bg-white text-black'
                : 'border border-white/20 text-white hover:bg-violet-950/20 hover:border-primary-400'
            ]"
          >
            Applications ({{ pendingApplicationsCount }})
          </button>
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-white text-black rounded-lg hover:bg-primary-100 font-medium transition-colors"
          >
            + Create Package
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-white/10">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'packages'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'packages'
                ? 'border-white/15 text-white'
                : 'border-transparent text-gray-400 hover:text-primary-400 hover:border-white/30'
            ]"
          >
            Sponsorship Packages
          </button>
          <button
            @click="activeTab = 'applications'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm relative transition-colors',
              activeTab === 'applications'
                ? 'border-white/15 text-white'
                : 'border-transparent text-gray-400 hover:text-primary-400 hover:border-white/30'
            ]"
          >
            Applications
            <span
              v-if="pendingApplicationsCount > 0"
              class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/30 text-red-200"
            >
              {{ pendingApplicationsCount }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Sponsorship Packages Tab -->
      <div v-if="activeTab === 'packages'" class="space-y-6">
        <!-- Filters -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-300">Status</label>
              <select
                v-model="filters.status"
                @change="loadPackages"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">Type</label>
              <select
                v-model="filters.type"
                @change="loadPackages"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
              >
                <option value="">All Types</option>
                <option value="EXCLUSIVE">Exclusive</option>
                <option value="PLATINUM">Platinum (1st tier)</option>
                <option value="GOLD">Gold (2nd tier)</option>
                <option value="SILVER">Silver (3rd tier)</option>
                <option value="SPECIAL">Special participant</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="w-full px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-primary-100/20 hover:border-primary-400 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Packages Table -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/15"></div>
          </div>

          <div v-else>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[56rem] divide-y divide-white/10 rtable">
              <thead class="bg-zinc-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Package Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Partnership</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Base Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Features</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr v-for="pkg in packages" :key="pkg.id" class="hover:bg-violet-950/10 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div>
                        <div class="text-sm font-medium text-white">{{ pkg.name }}</div>
                        <div class="text-xs text-gray-500">{{ pkg.description || 'No description' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded',
                        pkg.type === 'EXCLUSIVE' ? 'bg-violet-950/40 text-white' :
                        pkg.type === 'PLATINUM' ? 'bg-purple-500/30 text-purple-200' :
                        pkg.type === 'GOLD' ? 'bg-violet-950/30 text-white' :
                        pkg.type === 'SILVER' ? 'bg-slate-500/30 text-slate-200' :
                        pkg.type === 'SPECIAL' ? 'bg-blue-500/30 text-blue-200' :
                        'bg-slate-500/30 text-slate-200'
                      ]"
                    >
                      {{ pkg.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-white">{{ formatEnum(pkg.partnerRole) }}</div>
                    <div class="text-xs text-gray-400">
                      {{ formatEnum(pkg.visibilityScope) }} · {{ formatEnum(pkg.contributionMode) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-white">
                    {{ formatPrice(pkg.basePrice) }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded',
                        pkg.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-200'
                      ]"
                    >
                      {{ pkg.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-400">
                    {{ pkg.features ? pkg.features.substring(0, 50) + '...' : 'N/A' }}
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        @click="viewPackage(pkg)"
                        class="text-white hover:text-primary-400"
                      >
                        View
                      </button>
                      <button
                        @click="editPackage(pkg)"
                        class="text-white hover:text-primary-400"
                      >
                        Edit
                      </button>
                      <button
                        @click="togglePackageStatus(pkg)"
                        :class="pkg.status === 'ACTIVE' ? 'text-white hover:text-primary-400' : 'text-green-400 hover:text-green-300'"
                      >
                        {{ pkg.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button
                        @click="deletePackage(pkg.id)"
                        class="text-red-400 hover:text-primary-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="packages.length === 0">
                  <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500">
                    No sponsorship packages found
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Applications Tab -->
      <div v-if="activeTab === 'applications'" class="space-y-6">
        <!-- Filters -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-400">Status</label>
              <select
                v-model="applicationFilters.status"
                @change="loadApplications"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="loadApplications"
                class="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-primary-100"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Applications Table -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
          <div v-if="loadingApplications" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/15"></div>
          </div>

          <div v-else>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[56rem] divide-y divide-white/10 rtable">
              <thead class="bg-zinc-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Organization</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sponsorship Package</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Period</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Applied</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr v-for="app in applications" :key="app.id" class="hover:bg-violet-950/10 transition-colors">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-white">{{ app.organizationName }}</div>
                    <div class="text-xs text-gray-500">{{ app.organizationEmail || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-white">{{ app.sponsorshipName }}</div>
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-medium rounded mt-1',
                      app.sponsorship?.type === 'EXCLUSIVE' ? 'bg-violet-950 text-white' :
                      app.sponsorship?.type === 'PLATINUM' ? 'bg-purple-500/30 text-purple-200' :
                      app.sponsorship?.type === 'GOLD' ? 'bg-violet-950 text-white' :
                      app.sponsorship?.type === 'SILVER' ? 'bg-slate-500/30 text-slate-200' :
                      app.sponsorship?.type === 'SPECIAL' ? 'bg-blue-500/30 text-blue-200' :
                      'bg-slate-500/30 text-slate-200'
                    ]"
                    >
                      {{ app.sponsorship?.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-white">
                    <div>{{ formatDate(app.startDate) }}</div>
                    <div class="text-xs text-gray-500">to {{ formatDate(app.endDate) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded',
                        getApplicationStatusClass(app.status)
                      ]"
                    >
                      {{ app.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ formatDate(app.createdAt) }}
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        @click="viewApplication(app)"
                        class="text-white hover:text-primary-400"
                      >
                        View
                      </button>
                      <div v-if="app.status === 'PENDING'">
                        <button
                          @click="approveApplication(app)"
                          class="text-green-400 hover:text-primary-400"
                        >
                          Approve
                        </button>
                        <button
                          @click="showRejectModal(app)"
                          class="text-red-400 hover:text-primary-400"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="applications.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                    No applications found
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Package Modal -->
      <div
        v-if="showCreateModal || editingPackage"
        class="fixed inset-0 bg-violet-950/70 overflow-y-auto h-full w-full z-50"
        @click.self="closeModal"
      >
        <div class="relative top-20 mx-auto p-5 w-full max-w-2xl">
          <div class="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 class="text-lg font-medium text-white">
                {{ editingPackage ? 'Edit Sponsorship Package' : 'Create New Sponsorship Package' }}
              </h3>
            </div>

            <form @submit.prevent="savePackage" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Package Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  :placeholder="$t('admin.placeholderPackageName')"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  :placeholder="$t('admin.placeholderDescribeBenefits')"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Type *</label>
                  <select
                    v-model="form.type"
                    required
                    class="w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  >
                    <option value="">{{ $t('propertyTypes.selectType') }}</option>
                    <option value="EXCLUSIVE">Exclusive</option>
                    <option value="PLATINUM">Platinum (1st tier)</option>
                    <option value="GOLD">Gold (2nd tier)</option>
                    <option value="SILVER">Silver (3rd tier)</option>
                    <option value="SPECIAL">Special participant</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Base Price *</label>
                  <input
                    v-model="form.basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Partner role *</label>
                  <select
                    v-model="form.partnerRole"
                    required
                    class="w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3"
                  >
                    <option value="SPONSOR">Sponsor</option>
                    <option value="MEDIA_PARTNER">Media partner</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Visibility *</label>
                  <select
                    v-model="form.visibilityScope"
                    required
                    class="w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3"
                  >
                    <option value="BOTH">Exhibition and platform</option>
                    <option value="EXHIBITION">Exhibition only</option>
                    <option value="PLATFORM">Platform only</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Contribution *</label>
                  <select
                    v-model="form.contributionMode"
                    required
                    class="w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3"
                  >
                    <option value="CASH">Cash</option>
                    <option value="IN_KIND">In kind</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Features</label>
                <textarea
                  v-model="form.features"
                  rows="4"
                  class="w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  :placeholder="$t('admin.placeholderFeatures')"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  class="w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  :placeholder="$t('admin.placeholderInternalNotes')"
                />
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 bg-white text-black rounded-md hover:bg-primary-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {{ editingPackage ? 'Update' : 'Create' }} Package
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- View Package Modal -->
      <div
        v-if="showViewPackageDialog"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="showViewPackageDialog = false"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 border-white/10">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Sponsorship Package Details</h3>
              <button
                @click="showViewPackageDialog = false"
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingPackage" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">Name</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingPackage.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Type</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      viewingPackage.type === 'EXCLUSIVE' ? 'bg-violet-950 text-white' :
                      viewingPackage.type === 'PLATINUM' ? 'bg-purple-500/30 text-purple-200' :
                      viewingPackage.type === 'GOLD' ? 'bg-violet-950 text-white' :
                      viewingPackage.type === 'SILVER' ? 'bg-slate-500/30 text-slate-200' :
                      viewingPackage.type === 'SPECIAL' ? 'bg-blue-500/30 text-blue-200' :
                      'bg-slate-500/30 text-slate-200'
                    ]"
                  >
                    {{ viewingPackage.type || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Base Price</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingPackage.basePrice != null ? formatPrice(viewingPackage.basePrice) : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      viewingPackage.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-200'
                    ]"
                  >
                    {{ viewingPackage.status || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Partner role</label>
                  <p class="mt-1 text-sm text-gray-100">{{ formatEnum(viewingPackage.partnerRole) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Visibility</label>
                  <p class="mt-1 text-sm text-gray-100">{{ formatEnum(viewingPackage.visibilityScope) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Contribution</label>
                  <p class="mt-1 text-sm text-gray-100">{{ formatEnum(viewingPackage.contributionMode) }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-300">Description</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingPackage.description || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-300">Features</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingPackage.features || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-300">Notes</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingPackage.notes || 'N/A' }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewPackageDialog = false"
                class="px-4 py-2 bg-white/10 text-gray-200 rounded-md hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View Application Modal -->
      <div
        v-if="showViewApplicationDialog"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="showViewApplicationDialog = false"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 border-white/10">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Sponsorship Application Details</h3>
              <button
                @click="showViewApplicationDialog = false"
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingApplication" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">Organization</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingApplication.organizationName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Organization Email</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingApplication.organizationEmail || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Sponsorship Package</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingApplication.sponsorshipName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Type</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      viewingApplication.sponsorship?.type === 'EXCLUSIVE' ? 'bg-violet-950 text-white' :
                      viewingApplication.sponsorship?.type === 'PLATINUM' ? 'bg-purple-500/30 text-purple-200' :
                      viewingApplication.sponsorship?.type === 'GOLD' ? 'bg-violet-950 text-white' :
                      viewingApplication.sponsorship?.type === 'SILVER' ? 'bg-slate-500/30 text-slate-200' :
                      viewingApplication.sponsorship?.type === 'SPECIAL' ? 'bg-blue-500/30 text-blue-200' :
                      'bg-slate-500/30 text-slate-200'
                    ]"
                  >
                    {{ viewingApplication.sponsorship?.type || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Start Date</label>
                  <p class="mt-1 text-sm text-gray-100">{{ formatDate(viewingApplication.startDate) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">End Date</label>
                  <p class="mt-1 text-sm text-gray-100">{{ formatDate(viewingApplication.endDate) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      getApplicationStatusClass(viewingApplication.status)
                    ]"
                  >
                    {{ viewingApplication.status || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Applied Date</label>
                  <p class="mt-1 text-sm text-gray-100">{{ formatDate(viewingApplication.createdAt) }}</p>
                </div>
                <div class="col-span-2" v-if="viewingApplication.notes">
                  <label class="block text-sm font-medium text-gray-300">Notes</label>
                  <p class="mt-1 text-sm text-gray-100">{{ viewingApplication.notes }}</p>
                </div>
                <div class="col-span-2" v-if="viewingApplication.rejectionReason">
                  <label class="block text-sm font-medium text-gray-300">Rejection Reason</label>
                  <p class="mt-1 text-sm text-red-300">{{ viewingApplication.rejectionReason }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewApplicationDialog = false"
                class="px-4 py-2 bg-white/10 text-gray-200 rounded-md hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reject Application Modal -->
      <div
        v-if="showRejectDialog"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="showRejectDialog = false"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-zinc-900 border-white/10">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-white mb-4">Reject Sponsorship Application</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Reason *</label>
              <textarea
                v-model="rejectReason"
                rows="3"
                required
                class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2"
                :placeholder="$t('admin.placeholderRejectionReason')"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="showRejectDialog = false"
                class="px-4 py-2 border border-white/20 rounded-md text-gray-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                @click="rejectApplication"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import api from '@/shared/api/client'

const activeTab = ref('packages')
const loading = ref(false)
const loadingApplications = ref(false)
const showCreateModal = ref(false)
const editingPackage = ref(null)
const packages = ref([])
const applications = ref([])

const filters = ref({
  status: '',
  type: ''
})

const applicationFilters = ref({
  status: ''
})

const form = ref({
  name: '',
  description: '',
  type: '',
  basePrice: '',
  features: '',
  notes: '',
  partnerRole: 'SPONSOR',
  visibilityScope: 'BOTH',
  contributionMode: 'CASH'
})

const showRejectDialog = ref(false)
const selectedApplication = ref(null)
const rejectReason = ref('')

const showViewPackageDialog = ref(false)
const viewingPackage = ref(null)

const showViewApplicationDialog = ref(false)
const viewingApplication = ref(null)

const pendingApplicationsCount = computed(() => {
  return applications.value.filter(app => app.status === 'PENDING').length
})

const loadPackages = async () => {
  loading.value = true
  try {
    const response = await api.get('/sponsorships')
    let data = response.data

    if (filters.value.status) {
      data = data.filter(p => p.status === filters.value.status)
    }
    if (filters.value.type) {
      data = data.filter(p => p.type === filters.value.type)
    }

    packages.value = data
  } catch (err) {
    console.error('Failed to load packages:', err)
  } finally {
    loading.value = false
  }
}

const loadApplications = async () => {
  loadingApplications.value = true
  try {
    const response = await api.get('/sponsorships/applications')
    let data = response.data

    if (applicationFilters.value.status) {
      data = data.filter(app => app.status === applicationFilters.value.status)
    }

    applications.value = data
  } catch (err) {
    console.error('Failed to load applications:', err)
  } finally {
    loadingApplications.value = false
  }
}

const clearFilters = () => {
  filters.value = { status: '', type: '' }
  loadPackages()
}

const savePackage = async () => {
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description || null,
      type: form.value.type,
      basePrice: parseFloat(form.value.basePrice),
      features: form.value.features || null,
      notes: form.value.notes || null,
      partnerRole: form.value.partnerRole,
      visibilityScope: form.value.visibilityScope,
      contributionMode: form.value.contributionMode
    }

    if (editingPackage.value) {
      await api.put(`/sponsorships/${editingPackage.value.id}`, payload)
    } else {
      await api.post('/sponsorships', payload)
    }

    closeModal()
    loadPackages()
  } catch (err) {
    console.error('Failed to save package:', err)
    alert(err.response?.data?.message || 'Failed to save sponsorship package')
  }
}

const viewPackage = (pkg) => {
  viewingPackage.value = pkg
  showViewPackageDialog.value = true
}

const editPackage = (pkg) => {
  editingPackage.value = pkg
  form.value = {
    name: pkg.name || '',
    description: pkg.description || '',
    type: pkg.type || '',
    basePrice: pkg.basePrice?.toString() || '',
    features: pkg.features || '',
    notes: pkg.notes || '',
    partnerRole: pkg.partnerRole || 'SPONSOR',
    visibilityScope: pkg.visibilityScope || 'BOTH',
    contributionMode: pkg.contributionMode || 'CASH'
  }
  showCreateModal.value = true
}

const togglePackageStatus = async (pkg) => {
  try {
    const newStatus = pkg.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await api.put(`/sponsorships/${pkg.id}`, { status: newStatus })
    loadPackages()
  } catch (err) {
    console.error('Failed to update package status:', err)
    alert(err.response?.data?.message || 'Failed to update package status')
  }
}

const deletePackage = async (id) => {
  if (!confirm('Are you sure you want to delete this sponsorship package? This action cannot be undone.')) {
    return
  }

  try {
    await api.delete(`/sponsorships/${id}`)
    loadPackages()
  } catch (err) {
    console.error('Failed to delete package:', err)
    alert(err.response?.data?.message || 'Failed to delete package')
  }
}

const viewApplication = (app) => {
  viewingApplication.value = app
  showViewApplicationDialog.value = true
}

const approveApplication = async (app) => {
  if (!confirm(`Approve sponsorship application for ${app.organizationName}?`)) {
    return
  }

  try {
    await api.put(`/sponsorships/applications/${app.id}/approve`, { notes: 'Approved by admin' })
    await loadApplications()
    if (activeTab.value === 'packages') {
      activeTab.value = 'applications'
    }
  } catch (err) {
    console.error('Failed to approve application:', err)
    alert(err.response?.data?.message || 'Failed to approve application')
  }
}

const showRejectModal = (app) => {
  selectedApplication.value = app
  rejectReason.value = ''
  showRejectDialog.value = true
}

const rejectApplication = async () => {
  if (!selectedApplication.value || !rejectReason.value.trim()) {
    return
  }

  try {
    await api.put(`/sponsorships/applications/${selectedApplication.value.id}/reject`, {
      reason: rejectReason.value
    })
    showRejectDialog.value = false
    selectedApplication.value = null
    rejectReason.value = ''
    await loadApplications()
  } catch (err) {
    console.error('Failed to reject application:', err)
    alert(err.response?.data?.message || 'Failed to reject application')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingPackage.value = null
  form.value = {
    name: '',
    description: '',
    type: '',
    basePrice: '',
    features: '',
    notes: '',
    partnerRole: 'SPONSOR',
    visibilityScope: 'BOTH',
    contributionMode: 'CASH'
  }
}

const formatPrice = (price) => {
  if (price == null || Number.isNaN(Number(price))) return 'ETB 0.00'
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatEnum = (value) => {
  if (!value) return 'N/A'
  return String(value)
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const getApplicationStatusClass = (status) => {
  const classes = {
    PENDING: 'bg-violet-950/30 text-white',
    APPROVED: 'bg-green-500/30 text-green-200',
    REJECTED: 'bg-red-500/30 text-red-200',
    CANCELLED: 'bg-gray-500/30 text-gray-200'
  }
  return classes[status] || 'bg-gray-500/30 text-gray-200'
}

onMounted(() => {
  loadPackages()
  loadApplications()
})
</script>

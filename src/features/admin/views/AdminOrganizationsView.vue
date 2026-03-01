<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white">{{ $t('admin.organizationManagement') }}</h1>
          <p class="mt-2 text-sm text-gray-400">{{ $t('admin.manageOrganizations') }}</p>
        </div>
        <button
          type="button"
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium bg-white text-black hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:bg-white/50 transition-colors"
        >
          <span class="mr-2">+</span>
          {{ $t('admin.registerOrganization') }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Pending</p>
              <p class="text-2xl font-semibold text-white">{{ pendingCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Approved</p>
              <p class="text-2xl font-semibold text-white">{{ approvedCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Real Estate</p>
              <p class="text-2xl font-semibold text-white">{{ realEstateCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Banks</p>
              <p class="text-2xl font-semibold text-white">{{ bankCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-gray-300">Search</label>
            <input
              v-model="filters.search"
              type="text"
              :placeholder="$t('admin.searchOrganizations')"
              @input="loadOrgs"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Type</label>
            <select
              v-model="filters.type"
              @change="loadOrgs"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Types</option>
              <option value="REAL_ESTATE_COMPANY">{{ $t('admin.typeRealEstate') }}</option>
              <option value="BANK">{{ $t('admin.typeBank') }}</option>
              <option value="SUPPLIER">{{ $t('admin.typeSupplier') }}</option>
              <option value="CONTRACTOR">{{ $t('admin.typeContractor') }}</option>
              <option value="DEVELOPER">{{ $t('admin.typeDeveloper') }}</option>
              <option value="INSURANCE">{{ $t('admin.typeInsurance') }}</option>
              <option value="CONSULTANT">{{ $t('admin.typeConsultant') }}</option>
              <option value="ARCHITECT">{{ $t('admin.typeArchitect') }}</option>
              <option value="FINISHING_CONTRACTOR">{{ $t('admin.typeFinishingContractor') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Status</label>
            <select
              v-model="filters.status"
              @change="loadOrgs"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
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

      <!-- Organizations Table -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-white/10">
          <thead class="bg-zinc-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center bg-zinc-900">
                <div class="flex flex-col items-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-2"></div>
                  <span class="text-sm text-gray-400">{{ $t('admin.loadingOrganizations') }}</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-red-200 bg-zinc-900">
                <div>Error: {{ error }}</div>
                <button @click="loadOrgs" class="mt-2 px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors">
                  Retry
                </button>
              </td>
            </tr>
            <tr v-else-if="!organizations || !Array.isArray(organizations) || organizations.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-400 bg-zinc-900">
                No organizations found
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="org in organizations"
                :key="org?.id || org?.name || Math.random()"
                class="hover:bg-yellow-500/10 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">{{ org.name }}</div>
                  <div class="text-sm text-gray-400">{{ org.city }}, {{ org.country }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium bg-gray-500/30 text-gray-300 rounded">
                    {{ getTypeLabel(org.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ org.email || 'N/A' }}</div>
                  <div class="text-sm text-gray-400">{{ org.phoneNumber || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      org.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' :
                      (org.status === 'PENDING_APPROVAL' || org.status === 'PENDING') ? 'bg-yellow-500/30 text-yellow-200' :
                      org.status === 'SUSPENDED' ? 'bg-orange-500/30 text-orange-200' :
                      'bg-red-500/30 text-red-200'
                    ]"
                  >
                    {{ org.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {{ formatDate(org.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      v-if="org.status === 'PENDING_APPROVAL' || org.status === 'PENDING'"
                      @click="approveOrg(org.id)"
                      class="text-green-300 hover:text-yellow-400 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      v-if="org.status === 'PENDING_APPROVAL' || org.status === 'PENDING'"
                      @click="showRejectModal(org)"
                      class="text-red-300 hover:text-yellow-400 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      v-if="org.status === 'APPROVED'"
                      @click="showSuspendModal(org)"
                      class="text-orange-300 hover:text-yellow-400 transition-colors"
                    >
                      Suspend
                    </button>
                    <button
                      @click="viewOrg(org)"
                      class="text-white hover:text-yellow-400 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- View Organization Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Organization Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingOrg" class="space-y-4">
              <!-- Logo & media -->
              <div class="col-span-2 rounded-lg border border-white/10 bg-white/5 p-4">
                <label class="block text-sm font-medium text-gray-400 mb-2">{{ $t('admin.logoAndMedia') }}</label>
                <div v-if="viewingOrg.logoUrl" class="mb-3">
                  <img
                    :src="mediaUrl(viewingOrg.logoUrl)"
                    alt="Logo"
                    class="h-20 w-20 object-contain rounded border border-white/20"
                  />
                </div>
                <div v-else class="mb-3 text-sm text-gray-500">{{ $t('admin.noLogo') }}</div>
                <div v-if="viewingOrg.media && viewingOrg.media.length" class="flex flex-wrap gap-2 mb-3">
                  <div
                    v-for="m in viewingOrg.media"
                    :key="m.id"
                    class="flex items-center gap-2 rounded border border-white/20 bg-white/5 px-2 py-1"
                  >
                    <span class="text-xs text-gray-400">{{ m.mediaKind }}</span>
                    <button
                      type="button"
                      @click="deleteMedia(viewingOrg.id, m.id)"
                      class="text-red-300 hover:text-red-200 text-xs"
                    >
                      {{ $t('admin.delete') }}
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <label class="px-3 py-1.5 rounded border border-white/20 bg-white/5 text-sm text-white hover:bg-yellow-500/20 hover:border-yellow-400 cursor-pointer">
                    {{ $t('admin.uploadLogo') }}
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="onUploadLogo($event, viewingOrg.id)"
                    />
                  </label>
                  <label class="px-3 py-1.5 rounded border border-white/20 bg-white/5 text-sm text-white hover:bg-yellow-500/20 hover:border-yellow-400 cursor-pointer">
                    {{ $t('admin.uploadVideo') }}
                    <input
                      type="file"
                      accept="video/*"
                      class="hidden"
                      @change="onUploadVideo($event, viewingOrg.id)"
                    />
                  </label>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Type</label>
                  <p class="mt-1 text-sm text-white">{{ getTypeLabel(viewingOrg.type) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      viewingOrg.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' :
                      (viewingOrg.status === 'PENDING_APPROVAL' || viewingOrg.status === 'PENDING') ? 'bg-yellow-500/30 text-yellow-200' :
                      viewingOrg.status === 'SUSPENDED' ? 'bg-orange-500/30 text-orange-200' :
                      'bg-red-500/30 text-red-200'
                    ]"
                  >
                    {{ viewingOrg.status }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Registration Number</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.registrationNumber || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Email</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.email || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Phone</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.phoneNumber || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">City</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.city || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Country</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.country || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Address</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.address || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.description || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Website</label>
                  <p class="mt-1 text-sm text-white">
                    <a v-if="viewingOrg.website" :href="viewingOrg.website" target="_blank" class="text-yellow-400 hover:underline">
                      {{ viewingOrg.website }}
                    </a>
                    <span v-else>N/A</span>
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Created</label>
                  <p class="mt-1 text-sm text-white">{{ formatDate(viewingOrg.createdAt) }}</p>
                </div>
              </div>

              <!-- Sponsorship management -->
              <div class="mt-6 rounded-lg border border-white/10 bg-zinc-800/50 p-4 sm:p-5">
                <h4 class="text-sm font-semibold text-white mb-3">{{ $t('admin.sponsorshipManagement') }}</h4>
                <div v-if="orgSponsorshipApplications.length" class="space-y-2 mb-4">
                  <div
                    v-for="app in orgSponsorshipApplications"
                    :key="app.id"
                    class="flex flex-wrap items-center justify-between gap-2 rounded border border-white/20 bg-white/5 px-3 py-2"
                  >
                    <div class="min-w-0">
                      <span class="text-sm text-white">{{ app.sponsorshipName }}</span>
                      <span class="ml-2 text-xs text-gray-400">({{ app.sponsorship?.type }})</span>
                      <span
                        :class="[
                          'ml-2 px-2 py-0.5 text-xs rounded',
                          app.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' :
                          app.status === 'PENDING' ? 'bg-yellow-500/30 text-yellow-200' :
                          'bg-red-500/30 text-red-200'
                        ]"
                      >
                        {{ app.status }}
                      </span>
                      <span v-if="app.isActive" class="ml-2 text-xs text-green-300">(active)</span>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                      <button
                        v-if="app.status === 'PENDING'"
                        @click="approveSponsorshipApp(app.id)"
                        class="text-xs text-green-300 hover:text-yellow-400"
                      >
                        Approve
                      </button>
                      <button
                        v-if="app.status === 'PENDING'"
                        @click="rejectSponsorshipApp(app)"
                        class="text-xs text-red-300 hover:text-yellow-400"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 mb-4">{{ $t('admin.noSponsorshipApplications') }}</div>
                <div class="rounded border border-white/10 bg-white/5 p-3 sm:p-4 space-y-4">
                  <p class="text-xs font-medium text-gray-400">{{ $t('admin.assignNewSponsorship') }}</p>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-400">{{ $t('admin.packageName') }}</label>
                      <select
                        v-model="assignSponsorship.sponsorshipId"
                        class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      >
                        <option value="">— {{ $t('admin.selectPackage') }} —</option>
                        <option v-for="pkg in activeSponsorshipsList" :key="pkg.id" :value="pkg.id">
                          {{ pkg.name }} ({{ pkg.type }})
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-400">{{ $t('admin.startDate') }}</label>
                      <input
                        v-model="assignSponsorship.startDate"
                        type="date"
                        class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-400">{{ $t('admin.endDate') }}</label>
                      <input
                        v-model="assignSponsorship.endDate"
                        type="date"
                        class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      />
                    </div>
                  </div>
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
                    <label class="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input v-model="assignSponsorship.autoApprove" type="checkbox" class="rounded border-white/20 text-yellow-400 focus:ring-yellow-400" />
                      {{ $t('admin.autoApprove') }}
                    </label>
                    <button
                      type="button"
                      :disabled="!assignSponsorship.sponsorshipId || !assignSponsorship.startDate || !assignSponsorship.endDate || assigningSponsorship"
                      @click="submitAssignSponsorship"
                      class="w-full sm:w-auto px-4 py-2.5 rounded-md bg-white text-black text-sm font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50 transition-colors"
                    >
                      {{ assigningSponsorship ? $t('admin.saving') : $t('admin.assignSponsorship') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6 flex flex-wrap justify-end gap-3">
              <button
                v-if="viewingOrg?.status === 'APPROVED'"
                @click="showSuspendModal(viewingOrg)"
                class="px-4 py-2 border border-orange-500/50 rounded-md text-orange-300 hover:bg-orange-500/20 transition-colors"
              >
                {{ $t('admin.suspend') }}
              </button>
              <button
                @click="openEditModal(viewingOrg)"
                class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
              >
                {{ $t('admin.edit') }}
              </button>
              <button
                @click="showViewDialog = false"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors"
              >
                {{ $t('admin.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create / Edit Organization Modal -->
      <div
        v-if="showFormDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-12 pb-12"
        @click.self="showFormDialog = false"
      >
        <div class="relative mx-auto p-6 border border-white/10 w-full max-w-2xl shadow-lg rounded-lg bg-zinc-900 text-white">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-white">
              {{ formMode === 'create' ? $t('admin.registerOrganization') : $t('admin.editOrganization') }}
            </h3>
            <button
              type="button"
              @click="showFormDialog = false"
              class="text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form @submit.prevent="submitOrganizationForm" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label for="org-name" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgName') }} *</label>
                <input
                  id="org-name"
                  v-model="form.name"
                  type="text"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label for="org-reg" class="block text-sm font-medium text-gray-300">{{ $t('admin.registrationNumber') }}</label>
                <input
                  id="org-reg"
                  v-model="form.registrationNumber"
                  type="text"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label for="org-type" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgType') }} *</label>
                <select
                  id="org-type"
                  v-model="form.type"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="REAL_ESTATE_COMPANY">{{ $t('admin.typeRealEstate') }}</option>
                  <option value="BANK">{{ $t('admin.typeBank') }}</option>
                  <option value="SUPPLIER">{{ $t('admin.typeSupplier') }}</option>
                  <option value="CONTRACTOR">{{ $t('admin.typeContractor') }}</option>
                  <option value="DEVELOPER">{{ $t('admin.typeDeveloper') }}</option>
                  <option value="INSURANCE">{{ $t('admin.typeInsurance') }}</option>
                  <option value="CONSULTANT">{{ $t('admin.typeConsultant') }}</option>
                  <option value="ARCHITECT">{{ $t('admin.typeArchitect') }}</option>
                  <option value="FINISHING_CONTRACTOR">{{ $t('admin.typeFinishingContractor') }}</option>
                </select>
              </div>
              <div v-if="formMode === 'create'" class="sm:col-span-2">
                <label for="org-initial-status" class="block text-sm font-medium text-gray-300">{{ $t('admin.initialStatus') }}</label>
                <select
                  id="org-initial-status"
                  v-model="form.initialStatus"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="PENDING_APPROVAL">{{ $t('admin.statusPendingApproval') }}</option>
                  <option value="APPROVED">{{ $t('admin.statusApproved') }}</option>
                </select>
              </div>
              <div>
                <label for="org-email" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgEmail') }}</label>
                <input
                  id="org-email"
                  v-model="form.email"
                  type="email"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label for="org-phone" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgPhone') }}</label>
                <input
                  id="org-phone"
                  v-model="form.phoneNumber"
                  type="tel"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label for="org-address" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgAddress') }}</label>
                <input
                  id="org-address"
                  v-model="form.address"
                  type="text"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label for="org-city" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgCity') }}</label>
                <input
                  id="org-city"
                  v-model="form.city"
                  type="text"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label for="org-country" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgCountry') }}</label>
                <input
                  id="org-country"
                  v-model="form.country"
                  type="text"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div class="sm:col-span-2">
                <label for="org-website" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgWebsite') }}</label>
                <input
                  id="org-website"
                  v-model="form.website"
                  type="url"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div class="sm:col-span-2">
                <label for="org-description" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgDescription') }}</label>
                <textarea
                  id="org-description"
                  v-model="form.description"
                  rows="3"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>
            <div v-if="formError" class="rounded-md bg-red-500/30 border border-red-500/50 p-3 text-sm text-red-200">
              {{ formError }}
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                @click="showFormDialog = false"
                class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
              >
                {{ $t('admin.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="formSaving"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50 transition-colors"
              >
                {{ formSaving ? $t('admin.saving') : (formMode === 'create' ? $t('admin.registerOrganization') : $t('admin.updateOrganization')) }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Reject Modal -->
      <div
        v-if="showRejectDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showRejectDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-md shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-white mb-4">Reject Organization</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-400 mb-2">Reason</label>
              <textarea
                v-model="rejectReason"
                rows="3"
                class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                :placeholder="$t('admin.enterRejectionReason')"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="showRejectDialog = false"
                class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="rejectOrg"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Suspend Organization Modal -->
      <div
        v-if="showSuspendDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showSuspendDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-md shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-white mb-4">{{ $t('admin.suspendOrganization') }}</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-400 mb-2">{{ $t('admin.reasonOptional') }}</label>
              <textarea
                v-model="suspendReason"
                rows="3"
                class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                :placeholder="$t('admin.enterRejectionReason')"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="showSuspendDialog = false"
                class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="suspendOrg"
                class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-500 transition-colors"
              >
                {{ $t('admin.suspend') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reject Sponsorship Application Modal -->
      <div
        v-if="showRejectSponsorshipDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showRejectSponsorshipDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-md shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-white mb-4">{{ $t('admin.rejectSponsorshipApplication') }}</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-400 mb-2">{{ $t('admin.reasonOptional') }}</label>
              <textarea
                v-model="rejectSponsorshipReason"
                rows="3"
                class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="showRejectSponsorshipDialog = false"
                class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="confirmRejectSponsorship"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
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
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminOrganizations } from '../composables/useAdmin'

const { t } = useI18n()
const adminOrgs = useAdminOrganizations()
// Access refs directly to preserve reactivity
const organizations = adminOrgs.organizations
const loading = adminOrgs.loading
const error = adminOrgs.error
const {
  loadOrganizations,
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
  createOrganization,
  updateOrganization,
  getOrganizationById,
  uploadOrganizationMedia,
  deleteOrganizationMedia,
  getActiveSponsorships,
  getSponsorshipApplicationsByOrganization,
  assignOrganizationToSponsorship,
  approveSponsorshipApplication,
  rejectSponsorshipApplication
} = adminOrgs


const filters = ref({
  search: '',
  type: '',
  status: ''
})

const showRejectDialog = ref(false)
const selectedOrg = ref(null)
const rejectReason = ref('')

const showSuspendDialog = ref(false)
const suspendReason = ref('')
const selectedOrgForSuspend = ref(null)

const orgSponsorshipApplications = ref([])
const activeSponsorshipsList = ref([])
const assignSponsorship = ref({
  sponsorshipId: '',
  startDate: '',
  endDate: '',
  autoApprove: true
})
const assigningSponsorship = ref(false)

const showRejectSponsorshipDialog = ref(false)
const rejectSponsorshipReason = ref('')
const selectedSponsorshipAppToReject = ref(null)

const pendingCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(org => org.status === 'PENDING_APPROVAL' || org.status === 'PENDING').length
})

const approvedCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(org => org.status === 'APPROVED').length
})

const realEstateCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(org => org.type === 'REAL_ESTATE_COMPANY').length
})

const bankCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(org => org.type === 'BANK').length
})

const loadOrgs = async () => {
  await loadOrganizations(filters.value)
}

const clearFilters = () => {
  filters.value = { search: '', type: '', status: '' }
  loadOrgs()
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const TYPE_LABEL_KEYS = {
  REAL_ESTATE_COMPANY: 'admin.typeRealEstate',
  BANK: 'admin.typeBank',
  SUPPLIER: 'admin.typeSupplier',
  CONTRACTOR: 'admin.typeContractor',
  DEVELOPER: 'admin.typeDeveloper',
  INSURANCE: 'admin.typeInsurance',
  CONSULTANT: 'admin.typeConsultant',
  ARCHITECT: 'admin.typeArchitect',
  FINISHING_CONTRACTOR: 'admin.typeFinishingContractor'
}
const getTypeLabel = (type) => (type && TYPE_LABEL_KEYS[type]) ? t(TYPE_LABEL_KEYS[type]) : (type || '')

const approveOrg = async (id) => {
  try {
    await approveOrganization(id)
    await loadOrgs()
  } catch (err) {
    console.error('Failed to approve organization:', err)
  }
}

const showRejectModal = (org) => {
  selectedOrg.value = org
  rejectReason.value = ''
  showRejectDialog.value = true
}

const rejectOrg = async () => {
  if (!selectedOrg.value || !rejectReason.value.trim()) {
    return
  }
  try {
    await rejectOrganization(selectedOrg.value.id, rejectReason.value)
    showRejectDialog.value = false
    selectedOrg.value = null
    rejectReason.value = ''
    await loadOrgs()
  } catch (err) {
    console.error('Failed to reject organization:', err)
  }
}

const showViewDialog = ref(false)
const viewingOrg = ref(null)

const viewOrg = async (org) => {
  viewingOrg.value = org
  showViewDialog.value = true
  assignSponsorship.value = { sponsorshipId: '', startDate: '', endDate: '', autoApprove: true }
  try {
    const full = await getOrganizationById(org.id)
    viewingOrg.value = full
    await loadSponsorshipData(full.id)
  } catch (e) {
    console.error('Failed to load organization details:', e)
  }
}

async function loadSponsorshipData(organizationId) {
  if (!organizationId) return
  try {
    const [apps, packages] = await Promise.all([
      getSponsorshipApplicationsByOrganization(organizationId),
      getActiveSponsorships()
    ])
    orgSponsorshipApplications.value = apps || []
    activeSponsorshipsList.value = packages || []
  } catch (e) {
    console.error('Failed to load sponsorship data:', e)
    orgSponsorshipApplications.value = []
    activeSponsorshipsList.value = []
  }
}

async function submitAssignSponsorship() {
  if (!viewingOrg.value?.id || !assignSponsorship.value.sponsorshipId || !assignSponsorship.value.startDate || !assignSponsorship.value.endDate) return
  assigningSponsorship.value = true
  try {
    await assignOrganizationToSponsorship({
      organizationId: viewingOrg.value.id,
      sponsorshipId: assignSponsorship.value.sponsorshipId,
      startDate: assignSponsorship.value.startDate,
      endDate: assignSponsorship.value.endDate,
      notes: undefined,
      autoApprove: !!assignSponsorship.value.autoApprove
    })
    await loadSponsorshipData(viewingOrg.value.id)
    assignSponsorship.value = { sponsorshipId: '', startDate: '', endDate: '', autoApprove: true }
  } catch (e) {
    console.error('Assign sponsorship failed:', e)
  } finally {
    assigningSponsorship.value = false
  }
}

async function approveSponsorshipApp(applicationId) {
  try {
    await approveSponsorshipApplication(applicationId)
    if (viewingOrg.value?.id) await loadSponsorshipData(viewingOrg.value.id)
  } catch (e) {
    console.error('Approve sponsorship failed:', e)
  }
}

function rejectSponsorshipApp(app) {
  selectedSponsorshipAppToReject.value = app
  rejectSponsorshipReason.value = ''
  showRejectSponsorshipDialog.value = true
}

async function confirmRejectSponsorship() {
  if (!selectedSponsorshipAppToReject.value?.id) return
  try {
    await rejectSponsorshipApplication(selectedSponsorshipAppToReject.value.id, rejectSponsorshipReason.value || 'Rejected by admin')
    showRejectSponsorshipDialog.value = false
    selectedSponsorshipAppToReject.value = null
    if (viewingOrg.value?.id) await loadSponsorshipData(viewingOrg.value.id)
  } catch (e) {
    console.error('Reject sponsorship failed:', e)
  }
}

function showSuspendModal(org) {
  selectedOrgForSuspend.value = org
  suspendReason.value = ''
  showViewDialog.value = false
  showSuspendDialog.value = true
}

async function suspendOrg() {
  if (!selectedOrgForSuspend.value?.id) return
  try {
    await suspendOrganization(selectedOrgForSuspend.value.id, suspendReason.value || undefined)
    showSuspendDialog.value = false
    selectedOrgForSuspend.value = null
    suspendReason.value = ''
    await loadOrgs()
  } catch (e) {
    console.error('Suspend organization failed:', e)
  }
}

const mediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_BASE_URL?.trim() || ''
  if (!base) return path
  const p = path.replace(/^\/api\/v1/, '')
  return base.replace(/\/$/, '') + (p.startsWith('/') ? p : '/' + p)
}

const onUploadLogo = async (ev, orgId) => {
  const files = ev.target?.files
  if (!files?.length || !orgId) return
  try {
    const updated = await uploadOrganizationMedia(orgId, Array.from(files), 'LOGO')
    if (updated) {
      viewingOrg.value = updated
    } else {
      const full = await getOrganizationById(orgId)
      viewingOrg.value = full
    }
    await loadOrgs()
  } catch (e) {
    console.error('Upload logo failed:', e)
  }
  ev.target.value = ''
}

const onUploadVideo = async (ev, orgId) => {
  const files = ev.target?.files
  if (!files?.length || !orgId) return
  try {
    const updated = await uploadOrganizationMedia(orgId, Array.from(files), 'VIDEO')
    if (updated) {
      viewingOrg.value = updated
    } else {
      const full = await getOrganizationById(orgId)
      viewingOrg.value = full
    }
    await loadOrgs()
  } catch (e) {
    console.error('Upload video failed:', e)
  }
  ev.target.value = ''
}

const deleteMedia = async (orgId, attachmentId) => {
  if (!orgId || !attachmentId) return
  try {
    const updated = await deleteOrganizationMedia(orgId, attachmentId)
    if (updated) {
      viewingOrg.value = updated
    } else {
      const full = await getOrganizationById(orgId)
      viewingOrg.value = full
    }
    await loadOrgs()
  } catch (e) {
    console.error('Delete media failed:', e)
  }
}

// Create / Edit organization form
const showFormDialog = ref(false)
const formMode = ref('create') // 'create' | 'edit'
const editingOrgId = ref(null)
const formSaving = ref(false)
const formError = ref('')
const form = ref({
  name: '',
  registrationNumber: '',
  type: 'REAL_ESTATE_COMPANY',
  address: '',
  city: '',
  country: '',
  phoneNumber: '',
  email: '',
  website: '',
  description: '',
  initialStatus: 'PENDING_APPROVAL'
})

function resetForm() {
  form.value = {
    name: '',
    registrationNumber: '',
    type: 'REAL_ESTATE_COMPANY',
    address: '',
    city: '',
    country: '',
    phoneNumber: '',
    email: '',
    website: '',
    description: '',
    initialStatus: 'PENDING_APPROVAL'
  }
  editingOrgId.value = null
  formError.value = ''
}

function openCreateModal() {
  formMode.value = 'create'
  resetForm()
  showFormDialog.value = true
}

function openEditModal(org) {
  formMode.value = 'edit'
  editingOrgId.value = org.id
  form.value = {
    name: org.name ?? '',
    registrationNumber: org.registrationNumber ?? '',
    type: org.type ?? 'REAL_ESTATE_COMPANY',
    address: org.address ?? '',
    city: org.city ?? '',
    country: org.country ?? '',
    phoneNumber: org.phoneNumber ?? '',
    email: org.email ?? '',
    website: org.website ?? '',
    description: org.description ?? '',
    initialStatus: 'PENDING_APPROVAL'
  }
  formError.value = ''
  showViewDialog.value = false
  showFormDialog.value = true
}

async function submitOrganizationForm() {
  formError.value = ''
  formSaving.value = true
  try {
    if (formMode.value === 'create') {
      await createOrganization({
        name: form.value.name,
        registrationNumber: form.value.registrationNumber || undefined,
        type: form.value.type,
        address: form.value.address || undefined,
        city: form.value.city || undefined,
        country: form.value.country || undefined,
        phoneNumber: form.value.phoneNumber || undefined,
        email: form.value.email || undefined,
        website: form.value.website || undefined,
        description: form.value.description || undefined,
        initialStatus: form.value.initialStatus
      })
      showFormDialog.value = false
      await loadOrgs()
    } else {
      await updateOrganization(editingOrgId.value, {
        name: form.value.name,
        registrationNumber: form.value.registrationNumber || undefined,
        type: form.value.type,
        address: form.value.address || undefined,
        city: form.value.city || undefined,
        country: form.value.country || undefined,
        phoneNumber: form.value.phoneNumber || undefined,
        email: form.value.email || undefined,
        website: form.value.website || undefined,
        description: form.value.description || undefined
      })
      showFormDialog.value = false
      await loadOrgs()
    }
  } catch (err) {
    formError.value = err?.response?.data?.message || err?.message || 'Failed to save organization'
  } finally {
    formSaving.value = false
  }
}

onMounted(async () => {
  await loadOrgs()
})
</script>

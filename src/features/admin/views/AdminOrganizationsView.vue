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
              @input="onSearchInput"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Type</label>
            <select
              v-model="filters.type"
              @change="onTypeOrStatusChange"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Types</option>
              <option
                v-for="type in organizationTypeFilterOptions"
                :key="`filter-type-${type}`"
                :value="type"
              >
                {{ getOrganizationTypeLabel(type) }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Status</label>
            <select
              v-model="filters.status"
              @change="onTypeOrStatusChange"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SPONSORSHIP_PENDING">Sponsorship review</option>
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
            <tr v-else-if="!filteredOrganizations.length">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-400 bg-zinc-900">
                No organizations found
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="org in paginatedOrganizations"
                :key="org?.id || org?.name || Math.random()"
                class="hover:bg-yellow-500/10 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white flex items-center gap-2 flex-wrap">
                    {{ org.name }}
                    <VerifiedBadge :level="getVerificationLevel(org)" size="sm" />
                  </div>
                  <div class="text-sm text-gray-400">{{ org.city }}, {{ org.country }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium bg-gray-500/30 text-gray-300 rounded">
                    {{ getTypeLabel(org.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ org.email || 'N/A' }}</div>
                  <div class="text-sm text-gray-400">{{ formatOrganizationPhones(org).join(', ') || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      org.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' :
                      (org.status === 'PENDING_APPROVAL' || org.status === 'PENDING') ? 'bg-yellow-500/30 text-yellow-200' :
                      org.status === 'SPONSORSHIP_PENDING' ? 'bg-amber-500/30 text-amber-100' :
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
                      v-if="org.status === 'SUSPENDED'"
                      @click="reactivateOrg(org)"
                      class="text-green-300 hover:text-yellow-400 transition-colors"
                    >
                      {{ $t('admin.reactivate') }}
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
        <div
          v-if="!loading && !error && filteredOrganizations.length > 0"
          class="border-t border-white/10 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-zinc-900"
        >
          <p class="text-xs text-gray-400">
            Showing {{ paginationStart }}-{{ paginationEnd }} of {{ filteredOrganizations.length }} organizations
          </p>
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-400">Rows</label>
            <select
              v-model.number="pageSize"
              @change="onPageSizeChange"
              class="border border-white/20 bg-white/5 text-white rounded-md py-1.5 px-2 text-xs focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option
                v-for="size in pageSizeOptions"
                :key="`page-size-${size}`"
                :value="size"
              >
                {{ size }}
              </option>
            </select>
            <button
              type="button"
              @click="goToPreviousPage"
              :disabled="currentPage <= 1"
              class="px-2.5 py-1.5 border border-white/20 rounded-md text-xs text-white hover:bg-yellow-500/20 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-xs text-gray-300">Page {{ currentPage }} / {{ totalPages }}</span>
            <button
              type="button"
              @click="goToNextPage"
              :disabled="currentPage >= totalPages"
              class="px-2.5 py-1.5 border border-white/20 rounded-md text-xs text-white hover:bg-yellow-500/20 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- View Organization Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 px-4 pb-12 pt-10 backdrop-blur-[2px]"
        @click.self="showViewDialog = false"
      >
        <div
          class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-white shadow-2xl shadow-black/50 ring-1 ring-white/5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-org-view-title"
          @click.stop
        >
          <div
            class="border-b border-white/10 bg-gradient-to-br from-yellow-500/[0.12] via-zinc-900 to-zinc-950 px-6 py-5 sm:px-7 sm:py-6"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 flex-1 items-start gap-4">
                <div
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/40 bg-yellow-500/15 shadow-inner shadow-yellow-900/20"
                >
                  <svg class="h-8 w-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div class="min-w-0 pt-0.5">
                  <h3 id="admin-org-view-title" class="text-xl font-semibold tracking-tight text-white">
                    {{ $t('admin.organizationDetails') }}
                  </h3>
                  <p v-if="viewingOrg" class="mt-1 truncate text-base text-gray-200">{{ viewingOrg.name }}</p>
                  <div v-if="viewingOrg" class="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1',
                        viewingOrg.status === 'APPROVED'
                          ? 'bg-green-500/25 text-green-200 ring-green-400/30'
                          : viewingOrg.status === 'SUSPENDED'
                            ? 'bg-orange-500/25 text-orange-200 ring-orange-400/30'
                            : viewingOrg.status === 'PENDING_APPROVAL' || viewingOrg.status === 'PENDING'
                              ? 'bg-yellow-500/25 text-yellow-200 ring-yellow-400/30'
                              : 'bg-red-500/25 text-red-200 ring-red-400/30'
                      ]"
                    >
                      {{ viewingOrg.status }}
                    </span>
                    <span
                      class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-200 ring-1 ring-white/15"
                    >
                      {{ getTypeLabel(viewingOrg.type) }}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="showViewDialog = false"
                class="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="max-h-[min(72vh,calc(100vh-10rem))] overflow-y-auto px-6 py-6 sm:px-7">
            <div v-if="viewingOrg" class="space-y-6">
              <!-- Logo & media -->
              <section class="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-5 shadow-inner">
                <h4 class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <span class="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow shadow-yellow-500/50" />
                  {{ $t('admin.sectionMedia') }}
                </h4>
                <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">{{ $t('admin.logoAndMedia') }}</label>
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
                    <template v-if="m.url && (m.mediaKind === 'IMAGE' || m.mediaKind === 'LOGO')">
                      <img
                        :src="mediaUrl(m.url)"
                        :alt="m.mediaKind"
                        class="h-10 w-10 object-cover rounded border border-white/20"
                        loading="lazy"
                      />
                    </template>
                    <template v-else-if="m.url && m.mediaKind === 'VIDEO'">
                      <video
                        :src="mediaUrl(m.url)"
                        class="h-10 w-10 object-cover rounded border border-white/20"
                        muted
                        playsinline
                      />
                    </template>
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
                    {{ $t('admin.uploadImages') }}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      class="hidden"
                      @change="onUploadImages($event, viewingOrg.id)"
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
              </section>

              <section class="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
                <h4 class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <span class="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow shadow-yellow-500/50" />
                  {{ $t('admin.sectionOverview') }}
                </h4>
                <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Registration Number</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.registrationNumber || 'N/A' }}</p>
                </div>
                </div>
              </section>

              <section class="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
                <h4 class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <span class="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow shadow-yellow-500/50" />
                  {{ $t('admin.sectionCompliance') }}
                </h4>
                <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Business Registration</label>
                  <p v-if="viewingOrg.businessRegistrationNumber" class="mt-1 text-sm text-white">Number: {{ viewingOrg.businessRegistrationNumber }}</p>
                  <p class="mt-1 text-sm text-white">
                    <a v-if="isDocumentUrl(viewingOrg.businessRegistration)" :href="mediaUrl(viewingOrg.businessRegistration)" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">View document</a>
                    <span v-else>{{ viewingOrg.businessRegistration || 'N/A' }}</span>
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">License</label>
                  <p v-if="viewingOrg.licenseNumber" class="mt-1 text-sm text-white">Number: {{ viewingOrg.licenseNumber }}</p>
                  <p class="mt-1 text-sm text-white">
                    <a v-if="isDocumentUrl(viewingOrg.license)" :href="mediaUrl(viewingOrg.license)" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">View document</a>
                    <span v-else>{{ viewingOrg.license || 'N/A' }}</span>
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">VAT Registration</label>
                  <p v-if="viewingOrg.vatNumber" class="mt-1 text-sm text-white">Number: {{ viewingOrg.vatNumber }}</p>
                  <p class="mt-1 text-sm text-white">
                    <a v-if="isDocumentUrl(viewingOrg.vatRegistration)" :href="mediaUrl(viewingOrg.vatRegistration)" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">View document</a>
                    <span v-else>{{ viewingOrg.vatRegistration || 'N/A' }}</span>
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">TIN Registration</label>
                  <p v-if="viewingOrg.tinNumber" class="mt-1 text-sm text-white">Number: {{ viewingOrg.tinNumber }}</p>
                  <p class="mt-1 text-sm text-white">
                    <a v-if="isDocumentUrl(viewingOrg.tinRegistration)" :href="mediaUrl(viewingOrg.tinRegistration)" target="_blank" rel="noopener" class="text-yellow-400 hover:underline">View document</a>
                    <span v-else>{{ viewingOrg.tinRegistration || 'N/A' }}</span>
                  </p>
                </div>
                </div>
              </section>

              <section class="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
                <h4 class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <span class="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow shadow-yellow-500/50" />
                  {{ $t('admin.sectionContact') }}
                </h4>
                <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Email</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.email || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Phone</label>
                  <p class="mt-1 text-sm text-white">{{ formatOrganizationPhones(viewingOrg).join(', ') || 'N/A' }}</p>
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
                </div>
              </section>

              <section class="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
                <h4 class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <span class="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow shadow-yellow-500/50" />
                  {{ $t('admin.sectionOnline') }}
                </h4>
                <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="mt-1 text-sm leading-relaxed text-white">{{ viewingOrg.description || 'N/A' }}</p>
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
                <div class="col-span-2">
                  <div v-if="hasSocialOnOrg(viewingOrg)" class="flex flex-wrap gap-2">
                    <OrganizationSocialLinks
                      :facebook-url="viewingOrg.facebookUrl"
                      :instagram-url="viewingOrg.instagramUrl"
                      :linkedin-url="viewingOrg.linkedinUrl"
                      :twitter-url="viewingOrg.twitterUrl"
                      :youtube-url="viewingOrg.youtubeUrl"
                    />
                  </div>
                  <p v-else class="mt-1 text-sm text-gray-500">N/A</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Created</label>
                  <p class="mt-1 text-sm text-white">{{ formatDate(viewingOrg.createdAt) }}</p>
                </div>
                </div>
              </section>

              <!-- Sponsorship management -->
              <div class="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.06] to-zinc-950/40 p-4 sm:p-5 shadow-inner">
                <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-yellow-500/20 text-yellow-300">
                    <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                  {{ $t('admin.sponsorshipManagement') }}
                </h4>
                <div v-if="orgSponsorshipApplications.length" class="space-y-2 mb-4">
                  <div
                    v-for="app in orgSponsorshipApplications"
                    :key="app.id"
                    class="rounded border border-white/20 bg-white/5 px-3 py-2 space-y-2"
                  >
                    <div class="flex flex-wrap items-center justify-between gap-2">
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
                      <div v-if="app.status !== 'PENDING'" class="flex gap-2 flex-shrink-0">
                        <button
                          v-if="app.status === 'APPROVED'"
                          @click="cancelSponsorshipApp(app)"
                          class="text-xs text-orange-300 hover:text-yellow-400"
                        >
                          {{ $t('admin.cancel') }}
                        </button>
                      </div>
                    </div>
                    <div v-if="app.status === 'PENDING'" class="border-t border-white/10 pt-2 space-y-2">
                      <p v-if="app.organizationStatus" class="text-xs text-gray-400">
                        {{ $t('admin.orgStatus') }}:
                        <span class="text-amber-200/90">{{ app.organizationStatus }}</span>
                      </p>
                      <p v-if="app.verificationUser" class="text-xs text-gray-400 break-words">
                        {{ $t('admin.sponsorshipContactToVerify') }}:
                        {{ app.verificationUser.firstName }} {{ app.verificationUser.lastName }}
                        · {{ app.verificationUser.email }}
                      </p>
                      <div class="flex flex-wrap gap-3 text-xs">
                        <span :class="app.organizationVerifiedAt ? 'text-green-300' : 'text-gray-500'">
                          {{ app.organizationVerifiedAt ? $t('admin.sponsorshipOrgVerified') : $t('admin.sponsorshipOrgNotVerified') }}
                        </span>
                        <span :class="app.userVerifiedAt ? 'text-green-300' : 'text-gray-500'">
                          {{ app.userVerifiedAt ? $t('admin.sponsorshipUserVerified') : $t('admin.sponsorshipUserNotVerified') }}
                        </span>
                      </div>
                      <p v-if="!canApproveSponsorshipApplication(app)" class="text-xs text-yellow-500/90">
                        {{ $t('admin.sponsorshipPendingApproval') }}
                      </p>
                      <div class="flex flex-wrap gap-2">
                        <button
                          type="button"
                          :disabled="!!app.organizationVerifiedAt"
                          @click="verifyOrgSponsorshipApp(app.id)"
                          class="text-xs px-2 py-1 rounded border border-white/20 bg-white/5 text-cyan-300 hover:border-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {{ $t('admin.sponsorshipVerifyOrg') }}
                        </button>
                        <button
                          type="button"
                          :disabled="!!app.userVerifiedAt"
                          @click="verifyUserSponsorshipApp(app)"
                          class="text-xs px-2 py-1 rounded border border-white/20 bg-white/5 text-cyan-300 hover:border-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {{ $t('admin.sponsorshipVerifyUser') }}
                        </button>
                        <button
                          type="button"
                          :disabled="!canApproveSponsorshipApplication(app)"
                          @click="approveSponsorshipApp(app.id)"
                          class="text-xs px-2 py-1 rounded border border-white/20 bg-white/5 text-green-300 hover:border-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {{ $t('admin.activate') }}
                        </button>
                        <button
                          type="button"
                          @click="rejectSponsorshipApp(app)"
                          class="text-xs text-red-300 hover:text-yellow-400"
                        >
                          {{ $t('admin.reject') }}
                        </button>
                        <button
                          type="button"
                          @click="cancelPendingSponsorshipApp(app)"
                          class="text-xs text-orange-300 hover:text-yellow-400"
                        >
                          {{ $t('admin.cancelPendingSponsorship') }}
                        </button>
                      </div>
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
          </div>
          <div
            class="flex flex-wrap justify-end gap-2 border-t border-white/10 bg-zinc-950/70 px-6 py-4 sm:gap-3 sm:px-7"
          >
            <button
              v-if="viewingOrg?.status === 'APPROVED'"
              type="button"
              @click="showSuspendModal(viewingOrg)"
              class="rounded-lg border border-orange-500/40 px-4 py-2.5 text-sm font-medium text-orange-200 transition-colors hover:bg-orange-500/20"
            >
              {{ $t('admin.suspend') }}
            </button>
            <button
              v-if="viewingOrg?.status === 'SUSPENDED'"
              type="button"
              @click="reactivateOrg(viewingOrg)"
              class="rounded-lg border border-green-500/40 px-4 py-2.5 text-sm font-medium text-green-200 transition-colors hover:bg-green-500/20"
            >
              {{ $t('admin.reactivate') }}
            </button>
            <button
              type="button"
              @click="openEditModal(viewingOrg)"
              class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-yellow-400 hover:bg-yellow-500/15"
            >
              {{ $t('admin.edit') }}
            </button>
            <button
              type="button"
              @click="showViewDialog = false"
              class="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-yellow-400"
            >
              {{ $t('admin.close') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Create / Edit Organization Modal -->
      <div
        v-if="showFormDialog"
        class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 px-4 pb-12 pt-10 backdrop-blur-[2px]"
        @click.self="showFormDialog = false"
      >
        <div
          class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-white shadow-2xl shadow-black/50 ring-1 ring-white/5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-org-form-title"
          @click.stop
        >
          <div
            class="border-b border-white/10 bg-gradient-to-br from-yellow-500/[0.12] via-zinc-900 to-zinc-950 px-6 py-5 sm:px-7 sm:py-6"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 flex-1 items-start gap-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/35 bg-yellow-500/15 shadow-inner sm:h-14 sm:w-14"
                >
                  <svg class="h-7 w-7 text-yellow-300 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div class="min-w-0 pt-0.5">
                  <h3 id="admin-org-form-title" class="text-xl font-semibold tracking-tight text-white">
                    {{ formMode === 'create' ? $t('admin.registerOrganization') : $t('admin.editOrganization') }}
                  </h3>
                  <p class="mt-1.5 max-w-lg text-sm leading-relaxed text-gray-400">
                    {{
                      formMode === 'create' ? $t('admin.orgFormCreateSubtitle') : $t('admin.orgFormEditSubtitle')
                    }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                @click="showFormDialog = false"
                class="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <form @submit.prevent="submitOrganizationForm" class="flex max-h-[min(78vh,calc(100vh-7rem))] flex-col">
            <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-7">
              <div class="space-y-5">
            <div
              class="flex flex-wrap gap-1.5 rounded-xl bg-zinc-950/80 p-1.5 ring-1 ring-white/10"
              role="tablist"
              :aria-label="$t('admin.organizationManagement')"
            >
              <button
                type="button"
                role="tab"
                :aria-selected="orgFormTab === 'profile'"
                class="rounded-lg px-3.5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
                :class="
                  orgFormTab === 'profile'
                    ? 'bg-yellow-500/25 text-yellow-100 shadow-sm ring-1 ring-yellow-400/40'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                "
                @click="orgFormTab = 'profile'"
              >
                {{ $t('admin.orgFormTabProfile') }}
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="orgFormTab === 'contact'"
                class="rounded-lg px-3.5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
                :class="
                  orgFormTab === 'contact'
                    ? 'bg-yellow-500/25 text-yellow-100 shadow-sm ring-1 ring-yellow-400/40'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                "
                @click="orgFormTab = 'contact'"
              >
                {{ $t('admin.orgFormTabContact') }}
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="orgFormTab === 'online'"
                class="rounded-lg px-3.5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
                :class="
                  orgFormTab === 'online'
                    ? 'bg-yellow-500/25 text-yellow-100 shadow-sm ring-1 ring-yellow-400/40'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                "
                @click="orgFormTab = 'online'"
              >
                {{ $t('admin.orgFormTabOnline') }}
              </button>
            </div>
            <div v-show="orgFormTab === 'profile'" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <label for="org-bus-reg" class="block text-sm font-medium text-gray-300">Business Registration</label>
                <input id="org-bus-reg-number" v-model="form.businessRegistrationNumber" type="text" placeholder="Registration number" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                <input
                  id="org-bus-reg"
                  v-model="form.businessRegistration"
                  type="text"
                  placeholder="Document URL or upload below"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <div v-if="formMode === 'edit' && editingOrgId" class="mt-1 flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,image/*,.doc,.docx"
                    class="hidden"
                    :ref="el => { docInputRefs.businessRegistration = el }"
                    @change="ev => onUploadDocument(ev, editingOrgId, 'BUSINESS_REGISTRATION', 'businessRegistration')"
                  />
                  <button type="button" :disabled="docUploading.businessRegistration" class="text-sm px-2 py-1 border border-white/20 rounded text-gray-300 hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50" @click="docInputRefs.businessRegistration?.click()">
                    {{ docUploading.businessRegistration ? 'Uploading…' : 'Upload document' }}
                  </button>
                  <a v-if="isDocumentUrl(form.businessRegistration)" :href="mediaUrl(form.businessRegistration)" target="_blank" rel="noopener" class="text-sm text-yellow-400 hover:underline">View document</a>
                </div>
              </div>
              <div>
                <label for="org-license" class="block text-sm font-medium text-gray-300">License</label>
                <input id="org-license-number" v-model="form.licenseNumber" type="text" placeholder="License number" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                <input
                  id="org-license"
                  v-model="form.license"
                  type="text"
                  placeholder="Document URL or upload below"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <div v-if="formMode === 'edit' && editingOrgId" class="mt-1 flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,image/*,.doc,.docx"
                    class="hidden"
                    :ref="el => { docInputRefs.license = el }"
                    @change="ev => onUploadDocument(ev, editingOrgId, 'LICENSE', 'license')"
                  />
                  <button type="button" :disabled="docUploading.license" class="text-sm px-2 py-1 border border-white/20 rounded text-gray-300 hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50" @click="docInputRefs.license?.click()">
                    {{ docUploading.license ? 'Uploading…' : 'Upload document' }}
                  </button>
                  <a v-if="isDocumentUrl(form.license)" :href="mediaUrl(form.license)" target="_blank" rel="noopener" class="text-sm text-yellow-400 hover:underline">View document</a>
                </div>
              </div>
              <div>
                <label for="org-vat-reg" class="block text-sm font-medium text-gray-300">VAT Registration</label>
                <input id="org-vat-number" v-model="form.vatNumber" type="text" placeholder="VAT number" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                <input
                  id="org-vat-reg"
                  v-model="form.vatRegistration"
                  type="text"
                  placeholder="Document URL or upload below"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <div v-if="formMode === 'edit' && editingOrgId" class="mt-1 flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,image/*,.doc,.docx"
                    class="hidden"
                    :ref="el => { docInputRefs.vatRegistration = el }"
                    @change="ev => onUploadDocument(ev, editingOrgId, 'VAT_REGISTRATION', 'vatRegistration')"
                  />
                  <button type="button" :disabled="docUploading.vatRegistration" class="text-sm px-2 py-1 border border-white/20 rounded text-gray-300 hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50" @click="docInputRefs.vatRegistration?.click()">
                    {{ docUploading.vatRegistration ? 'Uploading…' : 'Upload document' }}
                  </button>
                  <a v-if="isDocumentUrl(form.vatRegistration)" :href="mediaUrl(form.vatRegistration)" target="_blank" rel="noopener" class="text-sm text-yellow-400 hover:underline">View document</a>
                </div>
              </div>
              <div>
                <label for="org-tin-reg" class="block text-sm font-medium text-gray-300">TIN Registration</label>
                <input id="org-tin-number" v-model="form.tinNumber" type="text" placeholder="TIN number" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                <input
                  id="org-tin-reg"
                  v-model="form.tinRegistration"
                  type="text"
                  placeholder="Document URL or upload below"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <div v-if="formMode === 'edit' && editingOrgId" class="mt-1 flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,image/*,.doc,.docx"
                    class="hidden"
                    :ref="el => { docInputRefs.tinRegistration = el }"
                    @change="ev => onUploadDocument(ev, editingOrgId, 'TIN_REGISTRATION', 'tinRegistration')"
                  />
                  <button type="button" :disabled="docUploading.tinRegistration" class="text-sm px-2 py-1 border border-white/20 rounded text-gray-300 hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50" @click="docInputRefs.tinRegistration?.click()">
                    {{ docUploading.tinRegistration ? 'Uploading…' : 'Upload document' }}
                  </button>
                  <a v-if="isDocumentUrl(form.tinRegistration)" :href="mediaUrl(form.tinRegistration)" target="_blank" rel="noopener" class="text-sm text-yellow-400 hover:underline">View document</a>
                </div>
              </div>
              <div>
                <label for="org-type" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgType') }} *</label>
                <select
                  id="org-type"
                  v-model="form.type"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option
                    v-for="type in organizationTypeFormOptions"
                    :key="`form-type-${type}`"
                    :value="type"
                  >
                    {{ getMarketplaceOrganizationTypeLabel(type) }}
                  </option>
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
            </div>
            <div v-show="orgFormTab === 'contact'" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="org-email" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgEmail') }}</label>
                <input
                  id="org-email"
                  v-model="form.email"
                  type="email"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('admin.orgPhone') }}</label>
                <div class="space-y-2">
                  <div
                    v-for="(phone, idx) in form.phoneNumbers"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <CountryCodePhoneInput
                      :country-code="phone.countryCode"
                      :number="phone.number"
                      :placeholder="$t('admin.orgPhonePlaceholder')"
                      class="flex-1"
                      @update:country-code="phone.countryCode = $event"
                      @update:number="phone.number = $event"
                    />
                    <button
                      v-if="form.phoneNumbers.length > 1"
                      type="button"
                      class="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 rounded border border-white/20 hover:border-red-400 transition-colors"
                      :aria-label="$t('admin.removePhone')"
                      @click="form.phoneNumbers.splice(idx, 1)"
                    >
                      ×
                    </button>
                  </div>
                  <button
                    type="button"
                    class="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                    @click="form.phoneNumbers.push({ countryCode: DEFAULT_COUNTRY_CODE, number: '' })"
                  >
                    + {{ $t('admin.addPhone') }}
                  </button>
                </div>
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
                <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('property.locationMap') }} / {{ $t('admin.pickLocation') }}</label>
                <OsmMapPicker
                  :model-value="(form.latitude != null && form.longitude != null) ? { lat: form.latitude, lng: form.longitude } : null"
                  @update:latitude="(v) => (form.latitude = v)"
                  @update:longitude="(v) => (form.longitude = v)"
                  height="260px"
                  :hint-text="$t('admin.pickLocationHint')"
                />
                <p v-if="form.latitude != null && form.longitude != null" class="mt-1 text-xs text-gray-400">
                  {{ form.latitude?.toFixed(5) }}, {{ form.longitude?.toFixed(5) }}
                </p>
              </div>
            </div>
            <div v-show="orgFormTab === 'online'" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label for="org-website" class="block text-sm font-medium text-gray-300">{{ $t('admin.orgWebsite') }}</label>
                <input
                  id="org-website"
                  v-model="form.website"
                  type="url"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div class="sm:col-span-2 border-t border-white/10 pt-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label for="org-fb" class="block text-xs font-medium text-gray-400">{{ $t('organization.facebook') }}</label>
                    <input id="org-fb" v-model="form.facebookUrl" type="url" placeholder="https://…" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                  </div>
                  <div>
                    <label for="org-ig" class="block text-xs font-medium text-gray-400">{{ $t('organization.instagram') }}</label>
                    <input id="org-ig" v-model="form.instagramUrl" type="url" placeholder="https://…" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                  </div>
                  <div>
                    <label for="org-li" class="block text-xs font-medium text-gray-400">{{ $t('organization.linkedin') }}</label>
                    <input id="org-li" v-model="form.linkedinUrl" type="url" placeholder="https://…" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                  </div>
                  <div>
                    <label for="org-xt" class="block text-xs font-medium text-gray-400">{{ $t('organization.twitter') }}</label>
                    <input id="org-xt" v-model="form.twitterUrl" type="url" placeholder="https://…" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                  </div>
                  <div class="sm:col-span-2">
                    <label for="org-yt" class="block text-xs font-medium text-gray-400">{{ $t('organization.youtube') }}</label>
                    <input id="org-yt" v-model="form.youtubeUrl" type="url" placeholder="https://…" class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
                  </div>
                </div>
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
              </div>
            </div>
            <div class="shrink-0 space-y-3 border-t border-white/10 bg-zinc-950/70 px-6 py-4 sm:px-7">
            <div v-if="formError" class="rounded-lg border border-red-500/40 bg-red-500/20 p-3 text-sm text-red-100">
              {{ formError }}
            </div>
            <div class="flex flex-wrap justify-end gap-2 sm:gap-3">
              <button
                type="button"
                @click="showFormDialog = false"
                class="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-yellow-400 hover:bg-yellow-500/15"
              >
                {{ $t('admin.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="formSaving"
                class="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-yellow-400 disabled:bg-white/50 disabled:opacity-50"
              >
                {{ formSaving ? $t('admin.saving') : (formMode === 'create' ? $t('admin.registerOrganization') : $t('admin.updateOrganization')) }}
              </button>
            </div>
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
    <ProvisionPrimaryUserModal
      v-model="showProvisionPrimaryUserModal"
      :email="provisionPrimaryUserEmail"
      :title="t('admin.exhibitionInterests.verifyContactDialogTitle')"
      :confirm-label="t('admin.sponsorshipVerifyUser')"
      :busy="provisionPrimaryUserBusy"
      :initial-names="provisionPrimaryUserNames"
      @confirm="onProvisionPrimaryUserConfirm"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { mediaUrl } from '@/shared/api/client'
import { useMediaWarmup } from '@/shared/composables/useMediaWarmup'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'
import { DEFAULT_COUNTRY_CODE } from '@/shared/data/countryCodes'
import { formatOrganizationPhones, getVerificationLevel } from '@/shared/utils'
import { VerifiedBadge, OsmMapPicker } from '@/shared/components'
import OrganizationSocialLinks from '@/shared/components/OrganizationSocialLinks.vue'
import AdminLayout from '../components/AdminLayout.vue'
import ProvisionPrimaryUserModal from '../components/ProvisionPrimaryUserModal.vue'
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
  reactivateOrganization,
  createOrganization,
  updateOrganization,
  getOrganizationById,
  uploadOrganizationMedia,
  deleteOrganizationMedia,
  uploadOrganizationDocument,
  getActiveSponsorships,
  getSponsorshipApplicationsByOrganization,
  assignOrganizationToSponsorship,
  approveSponsorshipApplication,
  verifyOrganizationForSponsorshipApplication,
  verifyUserForSponsorshipApplication,
  rejectSponsorshipApplication,
  cancelSponsorshipApplication
} = adminOrgs


const filters = ref({
  search: '',
  type: '',
  status: ''
})
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 20, 50]

const marketplaceOrganizationTypeOptions = [
  'REAL_ESTATE_COMPANY',
  'BANK',
  'INSURANCE',
  'CONTRACTOR',
  'CONSULTANT_ARCHITECT',
  'SUPPLIER',
  'FINISHING_CONTRACTOR'
]

const organizationTypeFilterOptions = [
  ...marketplaceOrganizationTypeOptions,
  'DEVELOPER'
]

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

const showProvisionPrimaryUserModal = ref(false)
const provisionPrimaryUserEmail = ref('')
const provisionPrimaryUserNames = ref({ firstName: '', lastName: '' })
const provisionPrimaryUserApp = ref(null)
const provisionPrimaryUserBusy = ref(false)

const pendingCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(
    org =>
      org.status === 'PENDING_APPROVAL' ||
      org.status === 'PENDING' ||
      org.status === 'SPONSORSHIP_PENDING'
  ).length
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

const filteredOrganizations = computed(() => {
  const list = Array.isArray(organizations.value) ? organizations.value : []
  const selectedType = (filters.value.type || '').trim()
  const selectedStatus = (filters.value.status || '').trim().toUpperCase()
  return list.filter((org) => {
    const typeMatch = !selectedType || org.type === selectedType
    if (!typeMatch) return false
    if (!selectedStatus) return true
    if (selectedStatus === 'PENDING') {
      return org.status === 'PENDING' || org.status === 'PENDING_APPROVAL'
    }
    return org.status === selectedStatus
  })
})

const totalPages = computed(() => {
  const pages = Math.ceil(filteredOrganizations.value.length / pageSize.value)
  return pages > 0 ? pages : 1
})

const paginatedOrganizations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredOrganizations.value.slice(start, start + pageSize.value)
})

const paginationStart = computed(() => {
  if (filteredOrganizations.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  if (filteredOrganizations.value.length === 0) return 0
  return Math.min(currentPage.value * pageSize.value, filteredOrganizations.value.length)
})

watch(totalPages, (newTotalPages) => {
  if (currentPage.value > newTotalPages) {
    currentPage.value = newTotalPages
  }
})

const loadOrgs = async () => {
  const search = (filters.value.search || '').trim()
  await loadOrganizations(search ? { search } : {})
}

const clearFilters = () => {
  filters.value = { search: '', type: '', status: '' }
  currentPage.value = 1
  loadOrgs()
}

const onSearchInput = async () => {
  currentPage.value = 1
  await loadOrgs()
}

const onTypeOrStatusChange = () => {
  currentPage.value = 1
}

const onPageSizeChange = () => {
  currentPage.value = 1
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

function hasSocialOnOrg(org) {
  if (!org) return false
  return ['facebookUrl', 'instagramUrl', 'linkedinUrl', 'twitterUrl', 'youtubeUrl'].some((k) =>
    String(org[k] || '').trim()
  )
}


const TYPE_LABEL_KEYS = {
  REAL_ESTATE_COMPANY: 'admin.typeRealEstate',
  BANK: 'nav.marketplaceBanks',
  SUPPLIER: 'nav.marketplaceSuppliers',
  CONTRACTOR: 'nav.marketplaceContractors',
  DEVELOPER: 'admin.typeDeveloper',
  INSURANCE: 'nav.marketplaceInsurance',
  FINISHING_CONTRACTOR: 'nav.marketplaceFinishingWork'
}

const MARKETPLACE_TYPE_LABEL_KEYS = {
  REAL_ESTATE_COMPANY: 'nav.marketplaceRealEstate',
  BANK: 'nav.marketplaceBanks',
  INSURANCE: 'nav.marketplaceInsurance',
  CONTRACTOR: 'nav.marketplaceContractors',
  CONSULTANT_ARCHITECT: 'nav.marketplaceConsultantsArchitects',
  SUPPLIER: 'nav.marketplaceSuppliers',
  FINISHING_CONTRACTOR: 'nav.marketplaceFinishingWork'
}

const getOrganizationTypeLabel = (type) => {
  if (!type) return ''
  if (type === 'CONSULTANT_ARCHITECT') {
    return t('nav.marketplaceConsultantsArchitects')
  }
  return TYPE_LABEL_KEYS[type] ? t(TYPE_LABEL_KEYS[type]) : type
}

const getMarketplaceOrganizationTypeLabel = (type) => {
  if (!type) return ''
  return MARKETPLACE_TYPE_LABEL_KEYS[type] ? t(MARKETPLACE_TYPE_LABEL_KEYS[type]) : getOrganizationTypeLabel(type)
}

const getTypeLabel = (type) => getOrganizationTypeLabel(type)

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

const viewingOrgMediaUrlsForWarmup = computed(() => {
  const o = viewingOrg.value
  if (!o) return []
  const urls = []
  if (o.logoUrl) urls.push(o.logoUrl)
  if (Array.isArray(o.media)) {
    o.media.forEach((m) => {
      if (m?.url) urls.push(m.url)
    })
  }
  return urls
})

useMediaWarmup(viewingOrgMediaUrlsForWarmup)

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

function canApproveSponsorshipApplication(app) {
  return !!(app?.organizationVerifiedAt && app?.userVerifiedAt)
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
    try {
      viewingOrg.value = await getOrganizationById(viewingOrg.value.id)
    } catch (_) {
      /* keep existing */
    }
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
    if (viewingOrg.value?.id) {
      await loadSponsorshipData(viewingOrg.value.id)
      try {
        viewingOrg.value = await getOrganizationById(viewingOrg.value.id)
      } catch (_) {
        /* keep */
      }
    }
  } catch (e) {
    console.error('Approve sponsorship failed:', e)
  }
}

async function verifyOrgSponsorshipApp(applicationId) {
  try {
    await verifyOrganizationForSponsorshipApplication(applicationId)
    if (viewingOrg.value?.id) await loadSponsorshipData(viewingOrg.value.id)
  } catch (e) {
    console.error('Verify organization failed:', e)
  }
}

function defaultProvisionFirstName(app) {
  const c = (app?.organizationName || '').trim()
  if (c) {
    const parts = c.split(/\s+/).filter(Boolean)
    return parts[0] || 'Contact'
  }
  return 'Contact'
}

function defaultProvisionLastName(app) {
  const c = (app?.organizationName || '').trim()
  if (c) {
    const parts = c.split(/\s+/).filter(Boolean)
    if (parts.length > 1) {
      return parts.slice(1).join(' ')
    }
  }
  return 'User'
}

async function verifyUserSponsorshipApp(app) {
  if (!app?.id) return
  if (app.verificationUser?.id) {
    try {
      await verifyUserForSponsorshipApplication(app.id)
      if (viewingOrg.value?.id) await loadSponsorshipData(viewingOrg.value.id)
      try {
        viewingOrg.value = await getOrganizationById(viewingOrg.value.id)
      } catch (_) {
        /* keep */
      }
    } catch (e) {
      console.error('Verify user failed:', e)
    }
    return
  }
  provisionPrimaryUserApp.value = app
  provisionPrimaryUserEmail.value = app.verificationUser?.email || ''
  provisionPrimaryUserNames.value = {
    firstName: defaultProvisionFirstName(app),
    lastName: defaultProvisionLastName(app)
  }
  showProvisionPrimaryUserModal.value = true
}

async function onProvisionPrimaryUserConfirm(payload) {
  if (!provisionPrimaryUserApp.value?.id) return
  provisionPrimaryUserBusy.value = true
  try {
    await verifyUserForSponsorshipApplication(provisionPrimaryUserApp.value.id, payload)
    showProvisionPrimaryUserModal.value = false
    provisionPrimaryUserApp.value = null
    if (viewingOrg.value?.id) {
      await loadSponsorshipData(viewingOrg.value.id)
      try {
        viewingOrg.value = await getOrganizationById(viewingOrg.value.id)
      } catch (_) {
        /* keep */
      }
    }
  } catch (e) {
    console.error('Verify user failed:', e)
  } finally {
    provisionPrimaryUserBusy.value = false
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
    if (viewingOrg.value?.id) {
      await loadSponsorshipData(viewingOrg.value.id)
      try {
        viewingOrg.value = await getOrganizationById(viewingOrg.value.id)
      } catch (_) {
        /* keep */
      }
    }
  } catch (e) {
    console.error('Reject sponsorship failed:', e)
  }
}

async function cancelSponsorshipApp(app) {
  if (!app?.id) return
  try {
    await cancelSponsorshipApplication(app.id)
    if (viewingOrg.value?.id) {
      await loadSponsorshipData(viewingOrg.value.id)
      try {
        viewingOrg.value = await getOrganizationById(viewingOrg.value.id)
      } catch (_) {
        /* keep */
      }
    }
  } catch (e) {
    console.error('Cancel sponsorship failed:', e)
  }
}

async function cancelPendingSponsorshipApp(app) {
  if (!app?.id) return
  try {
    await cancelSponsorshipApplication(app.id)
    if (viewingOrg.value?.id) {
      await loadSponsorshipData(viewingOrg.value.id)
      try {
        viewingOrg.value = await getOrganizationById(viewingOrg.value.id)
      } catch (_) {
        /* keep */
      }
    }
  } catch (e) {
    console.error('Cancel pending sponsorship failed:', e)
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
  const suspendedId = selectedOrgForSuspend.value.id
  try {
    await suspendOrganization(suspendedId, suspendReason.value || undefined)
    showSuspendDialog.value = false
    selectedOrgForSuspend.value = null
    suspendReason.value = ''
    await loadOrgs()
    if (viewingOrg.value?.id === suspendedId) {
      viewingOrg.value = (await getOrganizationById(suspendedId)) || viewingOrg.value
    }
  } catch (e) {
    console.error('Suspend organization failed:', e)
  }
}

async function reactivateOrg(org) {
  if (!org?.id) return
  try {
    await reactivateOrganization(org.id)
    if (viewingOrg.value?.id === org.id) {
      const full = await getOrganizationById(org.id)
      viewingOrg.value = full
    }
    await loadOrgs()
  } catch (e) {
    console.error('Reactivate organization failed:', e)
  }
}

const onUploadLogo = async (ev, orgId) => {
  const files = ev.target?.files
  if (!files?.length || !orgId) return
  try {
    await uploadOrganizationMedia(orgId, Array.from(files), 'LOGO')
    const full = await getOrganizationById(orgId)
    viewingOrg.value = full
    await loadOrgs()
  } catch (e) {
    console.error('Upload logo failed:', e)
  }
  ev.target.value = ''
}

const onUploadImages = async (ev, orgId) => {
  const files = ev.target?.files
  if (!files?.length || !orgId) return
  try {
    await uploadOrganizationMedia(orgId, Array.from(files), 'IMAGE')
    const full = await getOrganizationById(orgId)
    viewingOrg.value = full
    await loadOrgs()
  } catch (e) {
    console.error('Upload images failed:', e)
  }
  ev.target.value = ''
}

const onUploadVideo = async (ev, orgId) => {
  const files = ev.target?.files
  if (!files?.length || !orgId) return
  try {
    await uploadOrganizationMedia(orgId, Array.from(files), 'VIDEO')
    const full = await getOrganizationById(orgId)
    viewingOrg.value = full
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

function isDocumentUrl(value) {
  if (value == null || typeof value !== 'string') return false
  const v = value.trim()
  return v.startsWith('/api/') || v.startsWith('http://') || v.startsWith('https://')
}

const docInputRefs = { businessRegistration: null, license: null, vatRegistration: null, tinRegistration: null }
const docUploading = ref({ businessRegistration: false, license: false, vatRegistration: false, tinRegistration: false })

const onUploadDocument = async (ev, orgId, documentType, formKey) => {
  const file = ev.target?.files?.[0]
  if (!file || !orgId) {
    ev.target.value = ''
    return
  }
  docUploading.value[formKey] = true
  try {
    const updated = await uploadOrganizationDocument(orgId, documentType, file)
    if (updated && updated[formKey] != null) {
      form.value[formKey] = updated[formKey]
    }
    if (viewingOrg.value?.id === orgId) {
      viewingOrg.value = updated || await getOrganizationById(orgId)
    }
    await loadOrgs()
  } catch (e) {
    console.error('Upload document failed:', e)
  } finally {
    docUploading.value[formKey] = false
    ev.target.value = ''
  }
}

// Create / Edit organization form
const showFormDialog = ref(false)
const formMode = ref('create') // 'create' | 'edit'
const editingOrgId = ref(null)
const formSaving = ref(false)
const formError = ref('')
/** Tab: profile | contact | online */
const orgFormTab = ref('profile')
const form = ref({
  name: '',
  registrationNumber: '',
  businessRegistration: '',
  license: '',
  vatRegistration: '',
  tinRegistration: '',
  businessRegistrationNumber: '',
  licenseNumber: '',
  vatNumber: '',
  tinNumber: '',
  type: 'REAL_ESTATE_COMPANY',
  address: '',
  city: '',
  country: '',
  phoneNumbers: [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }],
  email: '',
  website: '',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  description: '',
  initialStatus: 'PENDING_APPROVAL'
})

const organizationTypeFormOptions = computed(() => {
  const options = [...marketplaceOrganizationTypeOptions]
  const currentType = form.value.type
  if (formMode.value === 'edit' && currentType && !options.includes(currentType)) {
    options.push(currentType)
  }
  return options
})

function resetForm() {
  form.value = {
    name: '',
    registrationNumber: '',
  businessRegistration: '',
  license: '',
  vatRegistration: '',
  tinRegistration: '',
  businessRegistrationNumber: '',
  licenseNumber: '',
  vatNumber: '',
  tinNumber: '',
  type: 'REAL_ESTATE_COMPANY',
  address: '',
  city: '',
  country: '',
  latitude: null,
  longitude: null,
  phoneNumbers: [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }],
    email: '',
    website: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    description: '',
    initialStatus: 'PENDING_APPROVAL'
}
  editingOrgId.value = null
  formError.value = ''
  orgFormTab.value = 'profile'
}

async function openCreateModal() {
  formMode.value = 'create'
  resetForm()
  showFormDialog.value = true
  await nextTick()
  document.getElementById('org-name')?.focus()
}

async function openEditModal(org) {
  formMode.value = 'edit'
  editingOrgId.value = org.id
  form.value = {
    name: org.name ?? '',
    registrationNumber: org.registrationNumber ?? '',
    businessRegistration: org.businessRegistration ?? '',
    license: org.license ?? '',
    vatRegistration: org.vatRegistration ?? '',
    tinRegistration: org.tinRegistration ?? '',
    businessRegistrationNumber: org.businessRegistrationNumber ?? '',
    licenseNumber: org.licenseNumber ?? '',
    vatNumber: org.vatNumber ?? '',
    tinNumber: org.tinNumber ?? '',
    type: org.type ?? 'REAL_ESTATE_COMPANY',
    address: org.address ?? '',
    city: org.city ?? '',
    country: org.country ?? '',
    latitude: org.latitude ?? null,
    longitude: org.longitude ?? null,
    phoneNumbers: (org.phoneNumbers && org.phoneNumbers.length > 0)
      ? org.phoneNumbers.map(p => ({ countryCode: p.countryCode || DEFAULT_COUNTRY_CODE, number: p.number || '' }))
      : (org.phoneNumber ? [{ countryCode: DEFAULT_COUNTRY_CODE, number: org.phoneNumber }] : [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }]),
    email: org.email ?? '',
    website: org.website ?? '',
    facebookUrl: org.facebookUrl ?? '',
    instagramUrl: org.instagramUrl ?? '',
    linkedinUrl: org.linkedinUrl ?? '',
    twitterUrl: org.twitterUrl ?? '',
    youtubeUrl: org.youtubeUrl ?? '',
    description: org.description ?? '',
    initialStatus: 'PENDING_APPROVAL'
  }
  formError.value = ''
  orgFormTab.value = 'profile'
  showViewDialog.value = false
  showFormDialog.value = true
  await nextTick()
  document.getElementById('org-name')?.focus()
}

async function submitOrganizationForm() {
  formError.value = ''
  formSaving.value = true
  try {
    if (formMode.value === 'create') {
      await createOrganization({
        name: form.value.name,
        registrationNumber: form.value.registrationNumber || undefined,
        businessRegistration: form.value.businessRegistration || undefined,
        license: form.value.license || undefined,
        vatRegistration: form.value.vatRegistration || undefined,
        tinRegistration: form.value.tinRegistration || undefined,
        businessRegistrationNumber: form.value.businessRegistrationNumber || undefined,
        licenseNumber: form.value.licenseNumber || undefined,
        vatNumber: form.value.vatNumber || undefined,
        tinNumber: form.value.tinNumber || undefined,
        type: form.value.type,
        address: form.value.address || undefined,
        city: form.value.city || undefined,
        country: form.value.country || undefined,
        latitude: form.value.latitude ?? undefined,
        longitude: form.value.longitude ?? undefined,
        phoneNumbers: form.value.phoneNumbers?.filter(p => (p.number || '').trim()).map(p => ({ countryCode: p.countryCode || DEFAULT_COUNTRY_CODE, number: (p.number || '').trim() })) || [],
        email: form.value.email || undefined,
        website: form.value.website || undefined,
        facebookUrl: form.value.facebookUrl || undefined,
        instagramUrl: form.value.instagramUrl || undefined,
        linkedinUrl: form.value.linkedinUrl || undefined,
        twitterUrl: form.value.twitterUrl || undefined,
        youtubeUrl: form.value.youtubeUrl || undefined,
        description: form.value.description || undefined,
        initialStatus: form.value.initialStatus
      })
      showFormDialog.value = false
      await loadOrgs()
    } else {
      await updateOrganization(editingOrgId.value, {
        name: form.value.name,
        registrationNumber: form.value.registrationNumber || undefined,
        businessRegistration: form.value.businessRegistration || undefined,
        license: form.value.license || undefined,
        vatRegistration: form.value.vatRegistration || undefined,
        tinRegistration: form.value.tinRegistration || undefined,
        businessRegistrationNumber: form.value.businessRegistrationNumber || undefined,
        licenseNumber: form.value.licenseNumber || undefined,
        vatNumber: form.value.vatNumber || undefined,
        tinNumber: form.value.tinNumber || undefined,
        type: form.value.type,
        address: form.value.address || undefined,
        city: form.value.city || undefined,
        country: form.value.country || undefined,
        latitude: form.value.latitude ?? undefined,
        longitude: form.value.longitude ?? undefined,
        phoneNumbers: form.value.phoneNumbers?.filter(p => (p.number || '').trim()).map(p => ({ countryCode: p.countryCode || DEFAULT_COUNTRY_CODE, number: (p.number || '').trim() })) || [],
        email: form.value.email || undefined,
        website: form.value.website || undefined,
        facebookUrl: form.value.facebookUrl || undefined,
        instagramUrl: form.value.instagramUrl || undefined,
        linkedinUrl: form.value.linkedinUrl || undefined,
        twitterUrl: form.value.twitterUrl || undefined,
        youtubeUrl: form.value.youtubeUrl || undefined,
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

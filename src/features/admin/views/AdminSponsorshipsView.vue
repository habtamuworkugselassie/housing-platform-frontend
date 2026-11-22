<template>
  <AdminLayout>
    <div class="space-y-6">
      <ExpoWorkspaceBar current="/admin/sponsorships" />
      <!-- Page Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.nav.sponsors') }}</h1>
          <p class="mt-2 text-sm text-admin-subtle">{{ $t('admin.expo.sponsorsSubtitle') }}</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="activeTab = 'applications'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'applications'
                ? 'bg-admin-accent text-admin-accent-fg'
                : 'border border-admin-line/20 text-admin-fg hover:bg-admin-nav/20 hover:border-primary-400'
            ]"
          >
            {{ $t('admin.expo.applications') }} ({{ pendingApplicationsCount }})
          </button>
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-admin-accent text-admin-accent-fg rounded-lg hover:bg-admin-accent-hover font-medium transition-colors"
          >
            + {{ $t('admin.expo.createPackage') }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-admin-line/10">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'packages'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'packages'
                ? 'border-admin-line/15 text-admin-fg'
                : 'border-transparent text-admin-subtle hover:text-primary-400 hover:border-admin-line/30'
            ]"
          >
            {{ $t('admin.expo.packages') }}
          </button>
          <button
            @click="activeTab = 'applications'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm relative transition-colors',
              activeTab === 'applications'
                ? 'border-admin-line/15 text-admin-fg'
                : 'border-transparent text-admin-subtle hover:text-primary-400 hover:border-admin-line/30'
            ]"
          >
            {{ $t('admin.expo.applications') }}
            <span
              v-if="pendingApplicationsCount > 0"
              class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/30 text-admin-danger"
            >
              {{ pendingApplicationsCount }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Sponsorship Packages Tab -->
      <div v-if="activeTab === 'packages'" class="space-y-6">
        <AdminFilterBar v-model="packageFilterValues" :fields="packageFilterFields" :count="packages.length" @apply="loadPackages" />

        <!-- Packages Table -->
        <AdminDataTable
          :columns="packageColumns"
          :rows="packages"
          :loading="loading"
          :empty-text="$t('admin.expo.noPackages')"
          :row-test-id="(r) => `package-${r.id}`"
          min-width="56rem"
        >
          <template #cell-name="{ row }">
            <div class="text-sm font-medium text-admin-fg">{{ row.name }}</div>
            <div class="text-xs text-admin-faint line-clamp-2">{{ row.description || $t('admin.expo.noDescription') }}</div>
          </template>
          <template #cell-type="{ row }">
            <span :class="['px-2 py-1 text-xs font-medium rounded', row.type === 'EXCLUSIVE' ? 'bg-admin-nav/40 text-admin-fg' : row.type === 'PLATINUM' ? 'bg-purple-500/30 text-purple-200' : row.type === 'GOLD' ? 'bg-admin-nav/30 text-admin-fg' : row.type === 'SPECIAL' ? 'bg-blue-500/30 text-blue-200' : 'bg-slate-500/30 text-slate-200']">{{ row.type }}</span>
          </template>
          <template #cell-partnerRole="{ row }">
            <div class="text-sm font-medium text-admin-fg">{{ formatEnum(row.partnerRole) }}</div>
            <div class="text-xs text-admin-subtle">{{ formatEnum(row.visibilityScope) }} · {{ formatEnum(row.contributionMode) }}</div>
          </template>
          <template #cell-basePrice="{ row }"><span class="text-admin-fg">{{ formatPrice(row.basePrice) }}</span></template>
          <template #cell-status="{ row }">
            <span :class="['px-2 py-1 text-xs font-medium rounded', row.status === 'ACTIVE' ? 'bg-green-500/30 text-admin-ok' : 'bg-gray-500/30 text-admin-muted']">{{ row.status }}</span>
          </template>
          <template #cell-features="{ row }"><span class="text-xs">{{ row.features ? row.features.substring(0, 50) + '…' : '—' }}</span></template>
          <template #cell-actions="{ row }">
            <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs font-medium">
              <button type="button" class="text-admin-fg hover:text-primary-400" @click="viewPackage(row)">{{ $t('admin.expo.view') }}</button>
              <button type="button" class="text-admin-fg hover:text-primary-400" @click="editPackage(row)">{{ $t('admin.expo.edit') }}</button>
              <button type="button" :class="row.status === 'ACTIVE' ? 'text-admin-fg hover:text-primary-400' : 'text-admin-ok'" @click="togglePackageStatus(row)">{{ row.status === 'ACTIVE' ? $t('admin.expo.deactivate') : $t('admin.expo.activate') }}</button>
              <button type="button" class="text-admin-danger hover:text-primary-400" @click="deletePackage(row.id)">{{ $t('admin.expo.delete') }}</button>
            </div>
          </template>
        </AdminDataTable>
      </div>

      <!-- Applications Tab -->
      <div v-if="activeTab === 'applications'" class="space-y-6">
        <!-- Filters -->
        <AdminFilterBar v-model="applicationFilterValues" :fields="applicationFilterFields" :count="applications.length" @apply="loadApplications" />

        <!-- Applications Table -->
        <AdminDataTable
          :columns="applicationColumns"
          :rows="applications"
          :loading="loadingApplications"
          :empty-text="$t('admin.expo.noApplications')"
          :row-test-id="(r) => `application-${r.id}`"
          min-width="56rem"
        >
          <template #cell-organizationName="{ row }">
            <div class="text-sm font-medium text-admin-fg">{{ row.organizationName }}</div>
            <div class="text-xs text-admin-faint">{{ row.organizationEmail || '—' }}</div>
          </template>
          <template #cell-sponsorshipName="{ row }">
            <div class="text-sm font-medium text-admin-fg">{{ row.sponsorshipName }}</div>
            <span :class="['inline-flex px-2 py-1 text-xs font-medium rounded mt-1', row.sponsorship?.type === 'EXCLUSIVE' || row.sponsorship?.type === 'GOLD' ? 'bg-violet-950 text-white' : row.sponsorship?.type === 'PLATINUM' ? 'bg-purple-500/30 text-purple-200' : row.sponsorship?.type === 'SPECIAL' ? 'bg-blue-500/30 text-blue-200' : 'bg-slate-500/30 text-slate-200']">{{ row.sponsorship?.type }}</span>
          </template>
          <template #cell-startDate="{ row }">
            <div class="text-admin-fg">{{ formatDate(row.startDate) }}</div>
            <div class="text-xs text-admin-faint">{{ $t('admin.expo.until', { d: formatDate(row.endDate) }) }}</div>
          </template>
          <template #cell-status="{ row }">
            <span :class="['px-2 py-1 text-xs font-medium rounded', getApplicationStatusClass(row.status)]">{{ row.status }}</span>
          </template>
          <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
          <template #cell-actions="{ row }">
            <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs font-medium">
              <button type="button" class="text-admin-fg hover:text-primary-400" @click="viewApplication(row)">{{ $t('admin.expo.view') }}</button>
              <template v-if="row.status === 'PENDING'">
                <button type="button" class="text-admin-ok hover:text-primary-400" @click="approveApplication(row)">{{ $t('admin.expo.approve') }}</button>
                <button type="button" class="text-admin-danger hover:text-primary-400" @click="showRejectModal(row)">{{ $t('admin.expo.reject') }}</button>
              </template>
            </div>
          </template>
        </AdminDataTable>
      </div>

      <!-- Create/Edit Package Modal -->
      <div
        v-if="showCreateModal || editingPackage"
        class="fixed inset-0 bg-admin-nav/70 overflow-y-auto h-full w-full z-50"
        @click.self="closeModal"
      >
        <div class="relative top-20 mx-auto p-5 w-full max-w-2xl">
          <div class="bg-admin-surface border border-admin-line/10 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 text-admin-fg mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 class="text-lg font-medium text-admin-fg">
                {{ editingPackage ? 'Edit Sponsorship Package' : 'Create New Sponsorship Package' }}
              </h3>
            </div>

            <form @submit.prevent="savePackage" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-admin-subtle mb-1">Package Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg placeholder-admin-subtle rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  :placeholder="$t('admin.placeholderPackageName')"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-admin-subtle mb-1">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg placeholder-admin-subtle rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  :placeholder="$t('admin.placeholderDescribeBenefits')"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-admin-subtle mb-1">Type *</label>
                  <select
                    v-model="form.type"
                    required
                    class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
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
                  <label class="block text-sm font-medium text-admin-subtle mb-1">Base Price *</label>
                  <input
                    v-model="form.basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label class="block text-sm font-medium text-admin-subtle mb-1">Partner role *</label>
                  <select
                    v-model="form.partnerRole"
                    required
                    class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3"
                  >
                    <option value="SPONSOR">Sponsor</option>
                    <option value="MEDIA_PARTNER">Media partner</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-subtle mb-1">Visibility *</label>
                  <select
                    v-model="form.visibilityScope"
                    required
                    class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3"
                  >
                    <option value="BOTH">Exhibition and platform</option>
                    <option value="EXHIBITION">Exhibition only</option>
                    <option value="PLATFORM">Platform only</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-subtle mb-1">Contribution *</label>
                  <select
                    v-model="form.contributionMode"
                    required
                    class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3"
                  >
                    <option value="CASH">Cash</option>
                    <option value="IN_KIND">In kind</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-admin-subtle mb-1">Features</label>
                <textarea
                  v-model="form.features"
                  rows="4"
                  class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  :placeholder="$t('admin.placeholderFeatures')"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-admin-subtle mb-1">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  :placeholder="$t('admin.placeholderInternalNotes')"
                />
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 bg-admin-accent text-admin-accent-fg rounded-md hover:bg-admin-accent-hover"
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
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-admin-surface border-admin-line/10">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-admin-fg">Sponsorship Package Details</h3>
              <button
                @click="showViewPackageDialog = false"
                class="text-admin-subtle hover:text-admin-fg"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingPackage" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Name</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingPackage.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Type</label>
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
                  <label class="block text-sm font-medium text-admin-muted">Base Price</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingPackage.basePrice != null ? formatPrice(viewingPackage.basePrice) : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      viewingPackage.status === 'ACTIVE' ? 'bg-green-500/30 text-admin-ok' : 'bg-gray-500/30 text-admin-muted'
                    ]"
                  >
                    {{ viewingPackage.status || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Partner role</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ formatEnum(viewingPackage.partnerRole) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Visibility</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ formatEnum(viewingPackage.visibilityScope) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Contribution</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ formatEnum(viewingPackage.contributionMode) }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-admin-muted">Description</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingPackage.description || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-admin-muted">Features</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingPackage.features || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-admin-muted">Notes</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingPackage.notes || 'N/A' }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewPackageDialog = false"
                class="px-4 py-2 bg-admin-field/10 text-admin-muted rounded-md hover:bg-admin-field/20"
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
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-admin-surface border-admin-line/10">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-admin-fg">Sponsorship Application Details</h3>
              <button
                @click="showViewApplicationDialog = false"
                class="text-admin-subtle hover:text-admin-fg"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingApplication" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Organization</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingApplication.organizationName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Organization Email</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingApplication.organizationEmail || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Sponsorship Package</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingApplication.sponsorshipName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Type</label>
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
                  <label class="block text-sm font-medium text-admin-muted">Start Date</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ formatDate(viewingApplication.startDate) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">End Date</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ formatDate(viewingApplication.endDate) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-admin-muted">Status</label>
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
                  <label class="block text-sm font-medium text-admin-muted">Applied Date</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ formatDate(viewingApplication.createdAt) }}</p>
                </div>
                <div class="col-span-2" v-if="viewingApplication.notes">
                  <label class="block text-sm font-medium text-admin-muted">Notes</label>
                  <p class="mt-1 text-sm text-admin-fg">{{ viewingApplication.notes }}</p>
                </div>
                <div class="col-span-2" v-if="viewingApplication.rejectionReason">
                  <label class="block text-sm font-medium text-admin-muted">Rejection Reason</label>
                  <p class="mt-1 text-sm text-admin-danger">{{ viewingApplication.rejectionReason }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewApplicationDialog = false"
                class="px-4 py-2 bg-admin-field/10 text-admin-muted rounded-md hover:bg-admin-field/20"
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
        <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-admin-surface border-admin-line/10">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-admin-fg mb-4">Reject Sponsorship Application</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-admin-muted mb-2">Reason *</label>
              <textarea
                v-model="rejectReason"
                rows="3"
                required
                class="w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg placeholder-admin-subtle rounded-md px-3 py-2"
                :placeholder="$t('admin.placeholderRejectionReason')"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="showRejectDialog = false"
                class="px-4 py-2 border border-admin-line/20 rounded-md text-admin-muted hover:bg-admin-field/10"
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
import AdminFilterBar from '../components/AdminFilterBar.vue'
import AdminDataTable from '../components/AdminDataTable.vue'
import ExpoWorkspaceBar from '../components/ExpoWorkspaceBar.vue'
import api from '@/shared/api/client'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const packageColumns = computed(() => [
  { key: 'name', label: t('admin.expo.colPackageName') },
  { key: 'type', label: t('admin.expo.colType') },
  { key: 'partnerRole', label: t('admin.expo.colPartnership') },
  { key: 'basePrice', label: t('admin.expo.colBasePrice'), nowrap: true },
  { key: 'status', label: t('admin.expo.colStatus') },
  { key: 'features', label: t('admin.expo.colFeatures') },
  { key: 'actions', label: t('admin.expo.colActions'), align: 'right' }
])
const applicationColumns = computed(() => [
  { key: 'organizationName', label: t('admin.expo.colOrganization') },
  { key: 'sponsorshipName', label: t('admin.expo.colPackage') },
  { key: 'startDate', label: t('admin.expo.colPeriod'), nowrap: true },
  { key: 'status', label: t('admin.expo.colStatus') },
  { key: 'createdAt', label: t('admin.expo.colApplied'), nowrap: true },
  { key: 'actions', label: t('admin.expo.colActions'), align: 'right' }
])
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
const packageFilterFields = computed(() => [
  { key: 'status', type: 'select', label: t('admin.filters.status'), allLabel: t('admin.filters.allStatuses'), options: [{ value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }] },
  { key: 'type', type: 'select', label: t('admin.filters.type'), allLabel: t('admin.filters.allTypes'), options: ['EXCLUSIVE', 'PLATINUM', 'GOLD', 'SILVER', 'SPECIAL'].map((v) => ({ value: v, label: v })) }
])
const packageFilterValues = computed({
  get: () => ({ status: filters.value.status, type: filters.value.type }),
  set: (v) => {
    filters.value = { status: v.status || '', type: v.type || '' }
  }
})
const applicationFilterFields = computed(() => [
  { key: 'status', type: 'select', label: t('admin.filters.status'), allLabel: t('admin.filters.allStatuses'), options: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((v) => ({ value: v, label: v })) }
])
const applicationFilterValues = computed({
  get: () => ({ status: applicationFilters.value.status }),
  set: (v) => {
    applicationFilters.value = { status: v.status || '' }
  }
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
    PENDING: 'bg-admin-nav/30 text-admin-fg',
    APPROVED: 'bg-green-500/30 text-admin-ok',
    REJECTED: 'bg-red-500/30 text-admin-danger',
    CANCELLED: 'bg-gray-500/30 text-admin-muted'
  }
  return classes[status] || 'bg-gray-500/30 text-admin-muted'
}

onMounted(() => {
  loadPackages()
  loadApplications()
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white">{{ $t('admin.exhibitionInterests.title') }}</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('admin.exhibitionInterests.subtitleUnified') }}</p>
        <div
          v-if="!loading && !error"
          class="mt-4 rounded-lg border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm"
        >
          <p class="text-white font-medium">
            {{ $t('admin.exhibitionInterests.pendingSponsorshipCount', { count: sponsorshipApps.length }) }}
          </p>
          <p class="mt-1 text-gray-400">{{ $t('admin.exhibitionInterests.howToSeeVerification') }}</p>
        </div>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>

        <div v-else-if="error" class="px-6 py-8 text-center text-red-300 text-sm">
          {{ error }}
        </div>

        <div v-else-if="!rows.length && !orphanSponsorshipApps.length" class="px-6 py-12 text-center text-gray-400 text-sm">
          {{ $t('admin.exhibitionInterests.empty') }}
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-white/10">
            <thead class="bg-zinc-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colDate') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colContact') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colInterest') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colPackage') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colOrganization') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colMessage') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colSponsorshipStatus') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colContactToVerify') }}
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colActions') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <!-- Exhibition registrations (same list as before), augmented with marketplace sponsorship review -->
              <tr
                v-for="row in rows"
                :key="`ex-${row.id}`"
                class="hover:bg-violet-950/5 transition-colors align-top"
              >
                <td class="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                  {{ formatDate(row.createdAt) }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="text-white font-medium">{{ row.email }}</div>
                  <div v-if="row.phoneNumber" class="text-gray-400 text-xs mt-0.5">{{ row.phoneNumber }}</div>
                  <div v-if="row.company" class="text-gray-500 text-xs mt-0.5">{{ row.company }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-200 capitalize">{{ row.interestType }}</td>
                <td class="px-4 py-3 text-sm text-gray-300">
                  {{ row.sponsorshipPackageName || '—' }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="text-white">{{ row.organizationName || '—' }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">
                    <span v-if="row.organizationType">{{ row.organizationType }}</span>
                    <span v-if="row.organizationType && row.organizationStatus"> · </span>
                    <span v-if="row.organizationStatus" class="text-gray-400">{{ row.organizationStatus }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-400 max-w-[12rem]">
                  <span class="line-clamp-2" :title="row.message || ''">{{ row.message || '—' }}</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <SponsorshipReviewCells
                    v-if="sponsorshipAppForOrg(row.organizationId)"
                    :app="sponsorshipAppForOrg(row.organizationId)"
                  />
                  <div
                    v-else-if="showExhibitionPendingOrgReview(row)"
                    class="flex flex-wrap gap-1 text-xs"
                  >
                    <span
                      v-if="row.contactVerifiedAt"
                      class="inline-flex px-2 py-0.5 rounded bg-green-500/30 text-green-200"
                    >
                      {{ $t('admin.exhibitionInterests.badgeContactVerified') }}
                    </span>
                    <span
                      v-else
                      class="inline-flex px-2 py-0.5 rounded bg-amber-500/30 text-amber-200"
                    >
                      {{ $t('admin.exhibitionInterests.badgeContactPending') }}
                    </span>
                    <span
                      class="inline-flex px-2 py-0.5 rounded bg-zinc-700 text-gray-200 font-mono text-[10px] uppercase tracking-wide"
                    >
                      {{ row.organizationStatus }}
                    </span>
                  </div>
                  <span v-else class="text-gray-500 text-xs leading-snug">{{ $t('admin.exhibitionInterests.cellNoPendingSponsorship') }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-400 max-w-[11rem]">
                  <SponsorshipContactCell
                    v-if="sponsorshipAppForOrg(row.organizationId)"
                    :app="sponsorshipAppForOrg(row.organizationId)"
                  />
                  <div v-else-if="showExhibitionPendingOrgReview(row)" class="text-xs text-gray-300 space-y-1">
                    <p class="text-white">{{ row.email }}</p>
                    <p v-if="row.phoneNumber" class="text-gray-500">{{ row.phoneNumber }}</p>
                    <p class="text-gray-500 leading-snug">{{ $t('admin.exhibitionInterests.exhibitionLeadVerifyContactHint') }}</p>
                  </div>
                  <span v-else class="text-gray-500 text-xs">{{ $t('admin.exhibitionInterests.cellNoPendingSponsorship') }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <div class="flex flex-col items-end gap-2">
                    <router-link
                      v-if="row.organizationId"
                      :to="`/organizations/${row.organizationId}`"
                      class="text-black hover:text-black text-xs underline-offset-2 hover:underline"
                    >
                      {{ $t('admin.exhibitionInterests.viewOrg') }}
                    </router-link>
                    <SponsorshipActionButtons
                      v-if="sponsorshipAppForOrg(row.organizationId)"
                      :app="sponsorshipAppForOrg(row.organizationId)"
                      @verify-org="verifyOrgApp"
                      @verify-user="verifyUserApp"
                      @approve="approveSponsorshipApp"
                      @reject="openRejectSponsorship"
                      @cancel="cancelPendingSponsorshipApp"
                    />
                    <template v-else-if="showExhibitionPendingOrgReview(row)">
                      <button
                        type="button"
                        :disabled="exhibitionVerifyDisabled(row) || exhibitionBusyKey === rowKey(row)"
                        class="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 bg-white text-black hover:bg-violet-950 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        @click="openVerifyExhibitionContact(row)"
                      >
                        {{ $t('admin.exhibitionInterests.verifyRegistrantContact') }}
                      </button>
                      <button
                        type="button"
                        :disabled="!row.contactVerifiedAt || exhibitionBusyKey === rowKey(row)"
                        class="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 bg-white/5 text-white hover:bg-violet-950/20 hover:border-black disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        @click="approveExhibitionOrg(row)"
                      >
                        {{ $t('admin.exhibitionInterests.verifyApproveOrganization') }}
                      </button>
                      <button
                        type="button"
                        :disabled="exhibitionBusyKey === rowKey(row)"
                        class="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-400/40 text-red-200 hover:bg-red-500/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        @click="openRejectExhibitionOrg(row)"
                      >
                        {{ $t('admin.exhibitionInterests.rejectOrganization') }}
                      </button>
                    </template>
                  </div>
                </td>
              </tr>

              <!-- Marketplace-only pending sponsorships (no exhibition registration for that org) -->
              <tr
                v-for="app in orphanSponsorshipApps"
                :key="`mkt-${app.id}`"
                class="hover:bg-violet-950/5 align-top bg-zinc-950/40"
              >
                <td class="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                  {{ formatDate(app.createdAt) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-500 text-xs" colspan="3">
                  <span class="text-amber-200/90 font-medium">{{ $t('admin.exhibitionInterests.rowMarketplaceOnly') }}</span>
                  <span class="block mt-1 text-gray-500">{{ $t('admin.exhibitionInterests.rowMarketplaceOnlyHint') }}</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="text-white font-medium">{{ app.organizationName }}</div>
                  <div v-if="app.organizationStatus" class="text-xs text-amber-200/90 mt-0.5">{{ app.organizationStatus }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">—</td>
                <td class="px-4 py-3 text-sm">
                  <SponsorshipReviewCells :app="app" />
                </td>
                <td class="px-4 py-3 text-sm text-gray-400 max-w-[11rem]">
                  <SponsorshipContactCell :app="app" />
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <div class="flex flex-col items-end gap-2">
                    <router-link
                      v-if="app.organizationId"
                      :to="`/organizations/${app.organizationId}`"
                      class="text-black hover:text-black text-xs underline-offset-2 hover:underline"
                    >
                      {{ $t('admin.exhibitionInterests.viewOrg') }}
                    </router-link>
                    <SponsorshipActionButtons
                      :app="app"
                      @verify-org="verifyOrgApp"
                      @verify-user="verifyUserApp"
                      @approve="approveSponsorshipApp"
                      @reject="openRejectSponsorship"
                      @cancel="cancelPendingSponsorshipApp"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="rows.length > 0"
          class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-white/10 bg-zinc-950/50"
        >
          <p class="text-xs text-gray-500">
            {{ $t('admin.exhibitionInterests.pageOf', { current: page + 1, total: Math.max(1, totalPages) }) }}
          </p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="page <= 0 || loading"
              class="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 bg-white/5 text-white hover:bg-violet-950/20 hover:border-black disabled:opacity-40 disabled:pointer-events-none transition-colors"
              @click="goPrev"
            >
              {{ $t('common.previous') }}
            </button>
            <button
              type="button"
              :disabled="page >= totalPages - 1 || loading"
              class="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 bg-white/5 text-white hover:bg-violet-950/20 hover:border-black disabled:opacity-40 disabled:pointer-events-none transition-colors"
              @click="goNext"
            >
              {{ $t('common.next') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <ProvisionPrimaryUserModal
      v-model="showProvisionModal"
      :email="provisionEmail"
      :title="$t('admin.exhibitionInterests.verifyContactDialogTitle')"
      :confirm-label="$t('admin.exhibitionInterests.verifyRegistrantContact')"
      :busy="!!exhibitionBusyKey"
      :initial-names="provisionInitialNames"
      @confirm="onProvisionPrimaryUserConfirm"
    />

    <!-- Reject organization (exhibition lead — PENDING_APPROVAL / SPONSORSHIP_PENDING without pending app row) -->
    <div
      v-if="showRejectExhibitionOrgDialog"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-violet-950/70"
      @click.self="showRejectExhibitionOrgDialog = false"
    >
      <div class="bg-zinc-900 border border-white/10 rounded-lg max-w-md w-full p-6 shadow-xl">
        <h3 class="text-lg font-medium text-white mb-1">{{ $t('admin.exhibitionInterests.rejectExhibitionOrganization') }}</h3>
        <p class="text-sm text-gray-400 mb-4">{{ $t('admin.exhibitionInterests.rejectExhibitionOrganizationHint') }}</p>
        <textarea
          v-model="rejectExhibitionOrgReason"
          rows="3"
          class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-black focus:border-black"
          :placeholder="$t('admin.placeholderRejectionReason')"
        />
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 text-sm rounded-md border border-white/20 text-gray-300 hover:bg-white/5"
            @click="showRejectExhibitionOrgDialog = false"
          >
            {{ $t('admin.cancel') }}
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm rounded-md bg-white text-black hover:bg-violet-950"
            @click="confirmRejectExhibitionOrg"
          >
            {{ $t('admin.reject') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reject marketplace sponsorship -->
    <div
      v-if="showRejectSponsorshipDialog"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-violet-950/70"
      @click.self="showRejectSponsorshipDialog = false"
    >
      <div class="bg-zinc-900 border border-white/10 rounded-lg max-w-md w-full p-6 shadow-xl">
        <h3 class="text-lg font-medium text-white mb-4">{{ $t('admin.rejectSponsorshipApplication') }}</h3>
        <textarea
          v-model="rejectSponsorshipReason"
          rows="3"
          class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-black focus:border-black"
          :placeholder="$t('admin.placeholderRejectionReason')"
        />
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 text-sm rounded-md border border-white/20 text-gray-300 hover:bg-white/5"
            @click="showRejectSponsorshipDialog = false"
          >
            {{ $t('admin.cancel') }}
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm rounded-md bg-white text-black hover:bg-violet-950"
            @click="confirmRejectSponsorship"
          >
            {{ $t('admin.reject') }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { adminApi } from '../api/admin.api'
import SponsorshipReviewCells from '../components/SponsorshipReviewCells.vue'
import SponsorshipContactCell from '../components/SponsorshipContactCell.vue'
import SponsorshipActionButtons from '../components/SponsorshipActionButtons.vue'
import ProvisionPrimaryUserModal from '../components/ProvisionPrimaryUserModal.vue'

const { locale } = useI18n()

const loading = ref(true)
const error = ref('')
const rows = ref([])
const page = ref(0)
const pageSize = 20
const totalPages = ref(0)

const sponsorshipApps = ref([])
/** Org IDs that appear in at least one exhibition interest (snapshot, used for marketplace-only rows). */
const exhibitionOrgIdSet = ref(new Set())

const showRejectSponsorshipDialog = ref(false)
const rejectSponsorshipReason = ref('')
const selectedSponsorshipApp = ref(null)

const showRejectExhibitionOrgDialog = ref(false)
const rejectExhibitionOrgReason = ref('')
const selectedExhibitionRow = ref(null)
const showProvisionModal = ref(false)
const provisionEmail = ref('')
const provisionInitialNames = ref({ firstName: '', lastName: '' })
/** { type: 'exhibition', row } | { type: 'sponsorship', app } */
const provisionContext = ref(null)
/** `ex:${id}` or `mkt:${appId}` while a mutation runs */
const exhibitionBusyKey = ref(null)

/** Normalize UUID strings so exhibition + sponsorship rows match reliably. */
function normalizeOrgId(id) {
  if (id == null || id === '') return null
  return String(id).trim().toLowerCase()
}

const pendingByOrgId = computed(() => {
  const m = new Map()
  for (const app of sponsorshipApps.value) {
    const k = normalizeOrgId(app.organizationId)
    if (k) {
      m.set(k, app)
    }
  }
  return m
})

/** Pending marketplace applications whose organization never registered via exhibition interest. */
const orphanSponsorshipApps = computed(() => {
  const set = exhibitionOrgIdSet.value
  return sponsorshipApps.value.filter((app) => {
    const k = normalizeOrgId(app.organizationId)
    return k && !set.has(k)
  })
})

function sponsorshipAppForOrg(orgId) {
  const k = normalizeOrgId(orgId)
  if (!k) return null
  return pendingByOrgId.value.get(k) ?? null
}

function rowKey(row) {
  return row?.id != null ? `ex:${row.id}` : ''
}

const EXHIBITION_LEAD_PENDING_ORG_STATUSES = ['PENDING_APPROVAL', 'SPONSORSHIP_PENDING']

/** Exhibition lead org still awaiting review; same actions as PENDING_APPROVAL when no pending marketplace app is loaded for this org. */
function showExhibitionPendingOrgReview(row) {
  if (!row?.organizationId) return false
  if (sponsorshipAppForOrg(row.organizationId)) return false
  const s = row.organizationStatus
  return typeof s === 'string' && EXHIBITION_LEAD_PENDING_ORG_STATUSES.includes(s)
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString(locale.value || undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch {
    return String(iso)
  }
}

/** Load a large slice of exhibition interests to know which orgs have an exhibition row (for orphan detection). */
async function loadExhibitionOrgIdSnapshot() {
  const size = 500
  const res = await adminApi.getExhibitionInterests({
    page: 0,
    size,
    sort: 'createdAt,desc'
  })
  const data = res.data
  const ids = new Set()
  const addRows = (content) => {
    for (const row of content) {
      const k = normalizeOrgId(row.organizationId)
      if (k) {
        ids.add(k)
      }
    }
  }
  const content = Array.isArray(data?.content) ? data.content : []
  addRows(content)
  const total = typeof data?.totalElements === 'number' ? data.totalElements : content.length
  const totalPagesSnap = typeof data?.totalPages === 'number' ? data.totalPages : 1
  for (let p = 1; p < totalPagesSnap; p += 1) {
    const r = await adminApi.getExhibitionInterests({
      page: p,
      size,
      sort: 'createdAt,desc'
    })
    addRows(Array.isArray(r.data?.content) ? r.data.content : [])
    if (ids.size >= total) break
  }
  exhibitionOrgIdSet.value = ids
}

async function loadExhibitionPage() {
  const res = await adminApi.getExhibitionInterests({
    page: page.value,
    size: pageSize,
    sort: 'createdAt,desc'
  })
  const data = res.data
  rows.value = Array.isArray(data?.content) ? data.content : []
  totalPages.value = typeof data?.totalPages === 'number' ? data.totalPages : 0
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    await loadExhibitionPage()
  } catch (e) {
    rows.value = []
    error.value = e?.response?.data?.message || e?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

async function loadPendingSponsorship() {
  try {
    const data = await adminApi.getPendingSponsorshipApplications()
    sponsorshipApps.value = Array.isArray(data) ? data : []
  } catch {
    sponsorshipApps.value = []
  }
}

async function refreshAll() {
  loading.value = true
  error.value = ''
  try {
    await Promise.all([loadExhibitionPage(), loadPendingSponsorship(), loadExhibitionOrgIdSnapshot()])
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to load'
    rows.value = []
  } finally {
    loading.value = false
  }
}

function goPrev() {
  if (page.value <= 0) return
  page.value -= 1
  load()
}

function goNext() {
  if (page.value >= totalPages.value - 1) return
  page.value += 1
  load()
}

async function verifyOrgApp(id) {
  try {
    await adminApi.verifyOrganizationForSponsorshipApplication(id)
    await afterSponsorshipMutation()
  } catch (e) {
    console.error(e)
  }
}

async function verifyUserApp(app) {
  if (!app?.id) return
  if (app.verificationUser?.id) {
    try {
      await adminApi.verifyUserForSponsorshipApplication(app.id)
      await afterSponsorshipMutation()
    } catch (e) {
      console.error(e)
    }
    return
  }
  provisionContext.value = { type: 'sponsorship', app }
  provisionEmail.value = app.verificationUser?.email || ''
  provisionInitialNames.value = {
    firstName: defaultVerifyFirstName({ company: app.organizationName }),
    lastName: defaultVerifyLastName({ company: app.organizationName })
  }
  showProvisionModal.value = true
}

async function approveSponsorshipApp(id) {
  try {
    await adminApi.approveSponsorshipApplication(id)
    await afterSponsorshipMutation()
  } catch (e) {
    console.error(e)
  }
}

function openRejectSponsorship(app) {
  selectedSponsorshipApp.value = app
  rejectSponsorshipReason.value = ''
  showRejectSponsorshipDialog.value = true
}

async function confirmRejectSponsorship() {
  if (!selectedSponsorshipApp.value?.id) return
  try {
    await adminApi.rejectSponsorshipApplication(
      selectedSponsorshipApp.value.id,
      rejectSponsorshipReason.value || 'Rejected by admin'
    )
    showRejectSponsorshipDialog.value = false
    selectedSponsorshipApp.value = null
    await afterSponsorshipMutation()
  } catch (e) {
    console.error(e)
  }
}

async function cancelPendingSponsorshipApp(id) {
  try {
    await adminApi.cancelSponsorshipApplication(id)
    await afterSponsorshipMutation()
  } catch (e) {
    console.error(e)
  }
}

async function afterSponsorshipMutation() {
  try {
    await Promise.all([loadExhibitionPage(), loadPendingSponsorship(), loadExhibitionOrgIdSnapshot()])
  } catch (e) {
    console.error(e)
  }
}

function exhibitionVerifyDisabled(row) {
  return !!(row?.contactVerifiedAt && row?.primaryContactUserId)
}

function defaultVerifyFirstName(row) {
  const c = (row?.company || row?.organizationName || '').trim()
  if (c) {
    const parts = c.split(/\s+/).filter(Boolean)
    return parts[0] || 'Contact'
  }
  return 'Contact'
}

function defaultVerifyLastName(row) {
  const c = (row?.company || row?.organizationName || '').trim()
  if (c) {
    const parts = c.split(/\s+/).filter(Boolean)
    if (parts.length > 1) {
      return parts.slice(1).join(' ')
    }
  }
  return 'User'
}

function openVerifyExhibitionContact(row) {
  provisionContext.value = { type: 'exhibition', row }
  provisionEmail.value = row?.email || ''
  provisionInitialNames.value = {
    firstName: defaultVerifyFirstName(row),
    lastName: defaultVerifyLastName(row)
  }
  showProvisionModal.value = true
}

async function onProvisionPrimaryUserConfirm(payload) {
  const ctx = provisionContext.value
  if (!ctx) return
  if (ctx.type === 'exhibition') {
    exhibitionBusyKey.value = rowKey(ctx.row)
  } else {
    exhibitionBusyKey.value = ctx.app?.id ? `mkt:${ctx.app.id}` : null
  }
  try {
    if (ctx.type === 'exhibition') {
      await adminApi.verifyExhibitionInterestContact(ctx.row.id, payload)
      await loadExhibitionPage()
    } else {
      await adminApi.verifyUserForSponsorshipApplication(ctx.app.id, payload)
      await afterSponsorshipMutation()
    }
    showProvisionModal.value = false
    provisionContext.value = null
  } catch (e) {
    console.error(e)
  } finally {
    exhibitionBusyKey.value = null
  }
}

async function approveExhibitionOrg(row) {
  if (!row?.organizationId || !row.contactVerifiedAt) return
  exhibitionBusyKey.value = rowKey(row)
  try {
    await adminApi.approveOrganization(row.organizationId)
    await loadExhibitionPage()
  } catch (e) {
    console.error(e)
  } finally {
    exhibitionBusyKey.value = null
  }
}

function openRejectExhibitionOrg(row) {
  selectedExhibitionRow.value = row
  rejectExhibitionOrgReason.value = ''
  showRejectExhibitionOrgDialog.value = true
}

async function confirmRejectExhibitionOrg() {
  const orgId = selectedExhibitionRow.value?.organizationId
  if (!orgId) return
  exhibitionBusyKey.value = rowKey(selectedExhibitionRow.value)
  try {
    await adminApi.rejectOrganization(orgId, rejectExhibitionOrgReason.value || 'Rejected by admin')
    showRejectExhibitionOrgDialog.value = false
    selectedExhibitionRow.value = null
    await loadExhibitionPage()
  } catch (e) {
    console.error(e)
  } finally {
    exhibitionBusyKey.value = null
  }
}

onMounted(() => {
  refreshAll()
})
</script>

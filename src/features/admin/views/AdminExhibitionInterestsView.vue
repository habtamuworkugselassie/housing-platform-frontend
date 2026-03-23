<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white">{{ $t('admin.exhibitionInterests.title') }}</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('admin.exhibitionInterests.subtitle') }}</p>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
        </div>

        <div v-else-if="error" class="px-6 py-8 text-center text-red-300 text-sm">
          {{ error }}
        </div>

        <div v-else-if="!rows.length" class="px-6 py-12 text-center text-gray-400 text-sm">
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
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ $t('admin.exhibitionInterests.colActions') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="row in rows" :key="row.id" class="hover:bg-yellow-500/5 transition-colors">
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
                <td class="px-4 py-3 text-sm text-gray-400 max-w-[14rem]">
                  <span class="line-clamp-2" :title="row.message || ''">{{ row.message || '—' }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-right whitespace-nowrap">
                  <router-link
                    v-if="row.organizationId"
                    :to="`/organizations/${row.organizationId}`"
                    class="text-yellow-400 hover:text-yellow-300 underline-offset-2 hover:underline"
                  >
                    {{ $t('admin.exhibitionInterests.viewOrg') }}
                  </router-link>
                  <span v-else class="text-gray-600">—</span>
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
              class="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 bg-white/5 text-white hover:bg-yellow-500/20 hover:border-yellow-400 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              @click="goPrev"
            >
              {{ $t('common.previous') }}
            </button>
            <button
              type="button"
              :disabled="page >= totalPages - 1 || loading"
              class="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 bg-white/5 text-white hover:bg-yellow-500/20 hover:border-yellow-400 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              @click="goNext"
            >
              {{ $t('common.next') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { adminApi } from '../api/admin.api'

const { locale } = useI18n()

const loading = ref(true)
const error = ref('')
const rows = ref([])
const page = ref(0)
const pageSize = 20
const totalPages = ref(0)

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

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await adminApi.getExhibitionInterests({
      page: page.value,
      size: pageSize,
      sort: 'createdAt,desc'
    })
    const data = res.data
    rows.value = Array.isArray(data?.content) ? data.content : []
    totalPages.value = typeof data?.totalPages === 'number' ? data.totalPages : 0
  } catch (e) {
    rows.value = []
    error.value = e?.response?.data?.message || e?.message || 'Failed to load'
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

onMounted(() => {
  load()
})
</script>

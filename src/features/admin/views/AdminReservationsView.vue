<template>
  <AdminLayout>
    <div class="space-y-6">
      <ExpoWorkspaceBar current="/admin/sponsorship-reservations" />
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.reservations.title') }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-admin-subtle">{{ $t('admin.reservations.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-lg bg-gold-400 px-3 py-2 text-xs font-semibold text-primary-950 hover:bg-gold-500" data-testid="new-reservation" @click="openCreate">{{ $t('admin.reservations.newReservation') }}</button>
          <button type="button" :class="['rounded-lg px-3 py-2 text-xs font-semibold', tab === 'pipeline' ? 'bg-admin-nav text-white' : 'border border-admin-line/20 text-admin-muted hover:bg-admin-sunken/60']" @click="tab = 'pipeline'">{{ $t('admin.reservations.tabPipeline') }}</button>
          <button type="button" :class="['rounded-lg px-3 py-2 text-xs font-semibold', tab === 'map' ? 'bg-admin-nav text-white' : 'border border-admin-line/20 text-admin-muted hover:bg-admin-sunken/60']" data-testid="tab-map" @click="openMap">{{ $t('admin.reservations.tabMap') }}</button>
          <button type="button" :class="['rounded-lg px-3 py-2 text-xs font-semibold', tab === 'uploads' ? 'bg-admin-nav text-white' : 'border border-admin-line/20 text-admin-muted hover:bg-admin-sunken/60']" data-testid="tab-uploads" @click="openUploads">{{ $t('admin.reservations.tabUploads') }}<span v-if="pendingMedia.length" class="ml-1 rounded-full bg-gold-400 px-1.5 text-[10px] text-primary-950">{{ pendingMedia.length }}</span></button>
          <a :href="reserveLink" target="_blank" rel="noopener" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60">{{ $t('admin.reservations.openForm') }}</a>
        </div>
      </div>

      <!-- Exhibitor uploads waiting for review -->
      <div v-if="tab === 'uploads'" class="space-y-3" data-testid="uploads-panel">
        <p class="text-sm text-admin-subtle">{{ $t('admin.reservations.uploadsHint') }}</p>
        <p v-if="!pendingMedia.length" class="rounded-lg border border-admin-line/10 bg-admin-surface px-4 py-6 text-center text-sm text-admin-subtle">{{ $t('admin.reservations.noUploads') }}</p>
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="m in pendingMedia" :key="m.id" class="rounded-lg border border-admin-line/10 bg-admin-surface p-3" :data-testid="`upload-${m.id}`">
            <div class="aspect-video overflow-hidden rounded bg-admin-sunken/60">
              <video v-if="m.mediaKind === 'VIDEO'" :src="mediaUrl(m.url)" class="h-full w-full object-cover" muted playsinline controls></video>
              <img v-else :src="mediaUrl(m.url)" :alt="m.organizationName || ''" class="h-full w-full object-contain" />
            </div>
            <p class="mt-2 text-sm font-semibold text-admin-fg">{{ m.organizationName }}</p>
            <p class="text-[11px] text-admin-subtle">{{ $t(`admin.reservations.mediaKind.${m.mediaKind}`) }} · {{ formatDate(m.createdAt) }}</p>
            <input v-model="reviewNotes[m.id]" type="text" :placeholder="$t('admin.reservations.rejectReason')" class="mt-2 w-full rounded-lg border border-admin-line/20 px-2 py-1 text-xs text-admin-fg" />
            <div class="mt-2 flex gap-2 text-xs">
              <button type="button" class="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700" :disabled="busyId === m.id" :data-testid="`approve-${m.id}`" @click="review(m, 'APPROVED')">{{ $t('admin.reservations.approve') }}</button>
              <button type="button" class="rounded-lg border border-red-300 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50" :disabled="busyId === m.id" @click="review(m, 'REJECTED')">{{ $t('admin.reservations.reject') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Floor plan -->
      <div v-if="tab === 'map'" class="grid gap-4 lg:grid-cols-3" data-testid="map-panel">
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4 lg:col-span-2">
          <p class="mb-2 text-xs text-admin-subtle">{{ $t('admin.reservations.mapHint') }}</p>
          <BoothMap v-if="booths.length" :booths="booths" admin-pick @pick="selectBooth" />
          <p v-else class="py-8 text-center text-sm text-admin-subtle">{{ $t('booth.loading') }}</p>
        </div>
        <div class="space-y-3 rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <div v-if="pipeline && pipeline.booths" class="grid grid-cols-2 gap-2 text-center text-xs">
            <div class="rounded-lg bg-admin-sunken/40 p-2"><p class="text-lg font-bold text-admin-fg">{{ pipeline.booths.AVAILABLE || 0 }}</p>{{ $t('booth.status.AVAILABLE') }}</div>
            <div class="rounded-lg bg-amber-50 p-2"><p class="text-lg font-bold text-amber-800">{{ pipeline.booths.HELD || 0 }}</p>{{ $t('booth.status.HELD') }}</div>
            <div class="rounded-lg bg-gray-100 p-2"><p class="text-lg font-bold text-gray-700">{{ pipeline.booths.SOLD || 0 }}</p>{{ $t('booth.status.SOLD') }}</div>
            <div class="rounded-lg bg-admin-sunken/40 p-2"><p class="text-lg font-bold text-admin-fg">{{ pipeline.booths.BLOCKED || 0 }}</p>{{ $t('booth.status.BLOCKED') }}</div>
          </div>
          <div v-if="activeBooth" data-testid="booth-editor">
            <p class="text-lg font-bold text-admin-fg">{{ activeBooth.code }} <span class="text-xs font-normal text-admin-subtle">{{ $t('booth.block') }} {{ activeBooth.block }} · {{ activeBooth.sizeSqm }} m²</span></p>
            <p v-if="activeBooth.reservationId" class="text-xs text-admin-muted">{{ $t('admin.reservations.heldBy', { ref: reservationRef(activeBooth.reservationId) }) }}<span v-if="activeBooth.holdExpiresAt"> · {{ $t('admin.reservations.holdUntil', { d: formatDate(activeBooth.holdExpiresAt) }) }}</span></p>
            <label class="mt-2 block text-xs text-admin-subtle">{{ $t('admin.reservations.boothStatus') }}
              <select :value="activeBooth.status" class="mt-1 w-full rounded-lg border border-admin-line/20 px-2 py-1.5 text-sm text-admin-fg" data-testid="booth-status" @change="saveBooth({ status: $event.target.value })">
                <option v-for="s in ['AVAILABLE', 'HELD', 'SOLD', 'BLOCKED']" :key="s" :value="s">{{ $t(`booth.status.${s}`) }}</option>
              </select>
            </label>
            <label class="mt-2 block text-xs text-admin-subtle">{{ $t('admin.reservations.boothType') }}
              <select :value="activeBooth.boothType" class="mt-1 w-full rounded-lg border border-admin-line/20 px-2 py-1.5 text-sm text-admin-fg" @change="saveBooth({ boothType: $event.target.value })">
                <option v-for="s in ['STANDARD', 'CORNER', 'PREMIUM']" :key="s" :value="s">{{ $t(`booth.type.${s}`) }}</option>
              </select>
            </label>
            <label class="mt-2 block text-xs text-admin-subtle">{{ $t('admin.reservations.notes') }}
              <input :value="activeBooth.notes || ''" type="text" class="mt-1 w-full rounded-lg border border-admin-line/20 px-2 py-1.5 text-sm text-admin-fg" @change="saveBooth({ notes: $event.target.value })" />
            </label>
          </div>
          <p v-else class="text-sm text-admin-subtle">{{ $t('admin.reservations.pickBooth') }}</p>
        </div>
      </div>

      <!-- Manual reservation -->
      <div v-if="creating" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" @click.self="creating = false">
        <form class="max-h-[92vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-xl bg-white p-5 text-gray-900" data-testid="create-form" @submit.prevent="submitCreate">
          <div>
            <p class="text-lg font-bold">{{ $t('admin.reservations.newReservation') }}</p>
            <p class="text-sm text-gray-600">{{ $t('admin.reservations.newHint') }}</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block text-xs font-medium text-gray-700 sm:col-span-2">{{ $t('admin.reservations.package') }}
              <select v-model="createForm.sponsorshipId" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" data-testid="create-package">
                <option value="" disabled>{{ $t('reservation.choose') }}</option>
                <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.name }} · {{ money(p.basePrice) }} ETB</option>
              </select>
            </label>
            <div class="sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-3" data-testid="org-picker">
              <p class="text-xs font-semibold text-gray-700">{{ $t('admin.reservations.orgTitle') }}</p>
              <p class="text-[11px] text-gray-500">{{ $t('admin.reservations.orgHint') }}</p>
              <div v-if="createForm.organizationId" class="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm" data-testid="org-selected">
                <span><span class="font-semibold">{{ createForm.organizationName }}</span><span class="ml-2 text-xs text-gray-500">{{ $t('admin.reservations.orgLinked') }}</span></span>
                <button type="button" class="text-xs text-primary-700 underline" @click="clearOrg">{{ $t('admin.reservations.orgChange') }}</button>
              </div>
              <template v-else>
                <input v-model.trim="orgQuery" type="search" :placeholder="$t('admin.reservations.orgSearch')" class="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" data-testid="org-search" @input="searchOrgs" />
                <ul v-if="orgResults.length" class="mt-1 max-h-40 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 bg-white text-sm">
                  <li v-for="o in orgResults" :key="o.id">
                    <button type="button" class="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-primary-50" :data-testid="`org-option-${o.id}`" @click="pickOrg(o)">
                      <span>{{ o.name }}<span v-if="o.city" class="ml-1 text-xs text-gray-500">· {{ o.city }}</span></span>
                      <span class="text-[10px] uppercase text-gray-500">{{ o.status }}</span>
                    </button>
                  </li>
                </ul>
                <p v-else-if="orgQuery.length >= 2 && !orgSearching" class="mt-1 text-[11px] text-gray-500">{{ $t('admin.reservations.orgNone') }}</p>
              </template>
            </div>
            <label class="block text-xs font-medium text-gray-700 sm:col-span-2">{{ $t('reservation.company') }}<input v-model.trim="createForm.company" required type="text" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" data-testid="create-company" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('reservation.contactName') }}<input v-model.trim="createForm.contactName" required type="text" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" data-testid="create-contact" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('reservation.email') }}<input v-model.trim="createForm.email" required type="email" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" data-testid="create-email" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('reservation.phone') }}<input v-model.trim="createForm.phone" type="tel" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('reservation.tin') }}<input v-model.trim="createForm.tin" type="text" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('admin.reservations.stage') }}
              <select v-model="createForm.status" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" data-testid="create-status">
                <option v-for="s in STATUSES.filter((x) => x !== 'CANCELLED')" :key="s" :value="s">{{ $t(`admin.reservations.status.${s}`) }}</option>
              </select>
            </label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('admin.reservations.paid') }} (ETB)<input v-model.number="createForm.amountPaid" type="number" min="0" step="1000" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('admin.reservations.agreedAmount') }}<input v-model.number="createForm.amount" type="number" min="0" step="1000" :placeholder="selectedPackage ? money(selectedPackage.basePrice) : ''" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('admin.reservations.language') }}
              <select v-model="createForm.locale" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="en">English</option><option value="am">አማርኛ</option></select>
            </label>
            <label class="block text-xs font-medium text-gray-700 sm:col-span-2">{{ $t('admin.reservations.notes') }}<textarea v-model.trim="createForm.adminNotes" rows="2" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"></textarea></label>
          </div>
          <div v-if="selectedPackage && createBoothsIncluded > 0" class="min-w-0 overflow-hidden">
            <p class="text-sm font-medium text-gray-700">{{ $t('booth.pick', { n: createBoothsIncluded }) }}</p>
            <BoothMap v-model:selected="createCodes" :booths="booths" selectable :max-select="createBoothsIncluded" :allowed-types="boothTypesForPackage(selectedPackage.type)" />
            <p v-if="createCodes.length" class="mt-1 text-sm font-semibold text-primary-800">{{ $t('booth.picked', { codes: createCodes.join(', ') }) }}</p>
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-700"><input v-model="createForm.sendEmail" type="checkbox" data-testid="create-send-email" /> {{ $t('admin.reservations.sendEmailNow') }}</label>
          <p v-if="createError" class="text-sm text-red-600" role="alert">{{ createError }}</p>
          <div class="flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" @click="creating = false">{{ $t('reservation.close') }}</button>
            <button type="submit" :disabled="createBusy" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" data-testid="create-save">{{ createBusy ? $t('reservation.submitting') : $t('admin.reservations.createSave') }}</button>
          </div>
        </form>
      </div>

      <!-- Assign booths to a reservation -->
      <div v-if="assigning" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" @click.self="assigning = null">
        <div class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 text-gray-900">
          <p class="text-lg font-bold">{{ $t('admin.reservations.assignTitle', { ref: assigning.reference, company: assigning.company }) }}</p>
          <p class="text-sm text-gray-600">{{ $t('booth.pick', { n: assigning.boothsIncluded }) }}</p>
          <div class="my-3 min-w-0 overflow-hidden"><BoothMap v-model:selected="assignCodes" :booths="assignBooths" selectable :max-select="assigning.boothsIncluded" :allowed-types="boothTypesForPackage(assigning.packageType)" /></div>
          <p class="text-sm font-semibold text-primary-800">{{ assignCodes.length ? $t('booth.picked', { codes: assignCodes.join(', ') }) : $t('admin.reservations.noBooths') }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" @click="assigning = null">{{ $t('reservation.close') }}</button>
            <button type="button" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white" data-testid="assign-save" @click="saveAssignment">{{ $t('admin.reservations.assignSave') }}</button>
          </div>
        </div>
      </div>

      <div v-if="pipeline && tab === 'pipeline'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="pipeline">
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.reservations.openPipeline') }}</p>
          <p class="mt-1 text-2xl font-bold text-admin-fg">{{ money(pipeline.openValue) }} <span class="text-sm font-normal text-admin-subtle">ETB</span></p>
          <p class="mt-1 text-xs text-admin-subtle">{{ $t('admin.reservations.openCount', { n: pipeline.openCount }) }}</p>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.reservations.collected') }}</p>
          <p class="mt-1 text-2xl font-bold text-emerald-700">{{ money(pipeline.paidValue) }} <span class="text-sm font-normal text-admin-subtle">ETB</span></p>
          <p class="mt-1 text-xs text-admin-subtle">{{ $t('admin.reservations.paidCount', { n: pipeline.byStatus.PAID?.count || 0 }) }}</p>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4 lg:col-span-2">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.reservations.byStage') }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="s in STATUSES" :key="s" type="button" :class="['rounded-full px-3 py-1 text-xs font-semibold', statusFilter === s ? 'bg-admin-nav text-white' : statusCls(s)]" @click="setStatus(s)">
              {{ $t(`admin.reservations.status.${s}`) }} · {{ pipeline.byStatus[s]?.count || 0 }}
            </button>
          </div>
        </div>
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ error }}</p>
      <p v-if="notice" class="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ notice }}</p>

      <AdminFilterBar v-if="tab === 'pipeline'" v-model="filterValues" :fields="filterFields" :count="total" @apply="reload" />

      <AdminDataTable
        v-if="tab === 'pipeline'"
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :empty-text="$t('admin.reservations.empty')"
        :row-test-id="(r) => `reservation-${r.reference}`"
        :page="page"
        :total-pages="totalPages"
        :total="total"
        min-width="72rem"
        @page="load"
      >
        <template #cell-reference="{ row }">
          <p class="font-mono text-xs font-semibold text-admin-fg">{{ row.reference }}</p>
          <p class="text-xs text-admin-subtle">{{ formatDate(row.createdAt) }}</p>
          <p v-if="row.source" class="text-[10px] uppercase tracking-wide text-admin-subtle">{{ row.source }}</p>
        </template>
        <template #cell-company="{ row }">
          <p class="font-semibold text-admin-fg">{{ row.company }}</p>
          <router-link v-if="row.organizationId" :to="`/organizations/${row.organizationId}`" class="inline-flex items-center gap-1 text-[11px] text-admin-nav hover:underline" :data-testid="`org-${row.reference}`">{{ row.organizationName || $t('admin.reservations.orgLinked') }}</router-link>
          <button v-else type="button" class="text-[11px] text-amber-700 underline" :disabled="busyId === 'link'" @click="linkAll">{{ $t('admin.reservations.orgMissing') }}</button>
          <p class="text-xs text-admin-muted">{{ row.contactName }}</p>
          <a :href="`mailto:${row.email}`" class="block text-xs text-admin-subtle hover:underline break-all">{{ row.email }}</a>
          <p v-if="row.phone" class="text-xs text-admin-subtle">{{ row.phone }}</p>
        </template>
        <template #cell-packageName="{ row }">
          <p class="font-semibold text-admin-fg">{{ row.packageName }}</p>
          <p class="text-xs text-admin-muted">{{ money(row.amount) }} {{ row.currency }}</p>
          <p class="mt-1 text-xs">
            <span v-if="row.boothCodes && row.boothCodes.length" class="font-mono font-semibold text-admin-fg">{{ row.boothCodes.join(', ') }}</span>
            <span v-else-if="row.boothsIncluded > 0" class="text-amber-700">{{ $t('admin.reservations.noBooths') }}</span>
          </p>
        </template>
        <template #cell-status="{ row }">
          <span class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="statusCls(row.status)">{{ $t(`admin.reservations.status.${row.status}`) }}</span>
          <p v-if="row.organizationId && row.exhibitorInvitedAt" class="mt-1 text-[11px] text-emerald-700">{{ $t('admin.reservations.portalReady') }}</p>
          <p v-if="row.reminderCount" class="text-[11px] text-admin-subtle">{{ $t('admin.reservations.reminders', { n: row.reminderCount }) }}</p>
        </template>
        <template #cell-amountPaid="{ row }">
          <p class="font-semibold" :class="Number(row.amountPaid) >= Number(row.amount) && Number(row.amount) > 0 ? 'text-emerald-700' : 'text-admin-fg'">{{ money(row.amountPaid) }}</p>
          <p class="text-[11px] text-admin-subtle">/ {{ money(row.amount) }}</p>
        </template>
        <template #cell-assignedTo="{ row }"><span class="text-admin-fg">{{ row.assignedTo || '—' }}</span></template>
        <template #cell-actions="{ row }">
          <div class="flex flex-wrap justify-end gap-2">
            <button type="button" class="rounded-lg bg-admin-nav px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90" :data-testid="`edit-${row.reference}`" @click="openEdit(row)">{{ $t('admin.reservations.edit') }}</button>
          </div>
        </template>
      </AdminDataTable>

      <!-- Edit one reservation: stage, money, owner, notes, and the actions on it -->
      <div v-if="editing" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" @click.self="editing = null">
        <form class="max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl bg-white p-5 text-gray-900" data-testid="edit-form" @submit.prevent="saveEdit">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-mono text-xs font-semibold text-gray-500">{{ editing.reference }}</p>
              <p class="text-lg font-bold">{{ editing.company }}</p>
              <p class="text-sm text-gray-600">{{ editing.packageName }} · {{ money(editing.amount) }} {{ editing.currency }}</p>
            </div>
            <button type="button" class="text-sm text-gray-500 hover:text-gray-900" @click="editing = null">{{ $t('reservation.close') }}</button>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block text-xs font-medium text-gray-700">{{ $t('admin.reservations.stage') }}
              <select v-model="editForm.status" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" :data-testid="`status-${editing.reference}`">
                <option v-for="s in STATUSES" :key="s" :value="s">{{ $t(`admin.reservations.status.${s}`) }}</option>
              </select>
            </label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('admin.reservations.paid') }} (ETB)<input v-model.number="editForm.amountPaid" type="number" min="0" step="1000" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" :data-testid="`paid-${editing.reference}`" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('admin.reservations.agreedAmount') }}<input v-model.number="editForm.amount" type="number" min="0" step="1000" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
            <label class="block text-xs font-medium text-gray-700">{{ $t('admin.reservations.owner') }}<input v-model.trim="editForm.assignedTo" type="text" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
            <label class="block text-xs font-medium text-gray-700 sm:col-span-2">{{ $t('admin.reservations.booth') }}<input v-model.trim="editForm.boothPreference" type="text" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
            <label class="block text-xs font-medium text-gray-700 sm:col-span-2">{{ $t('admin.reservations.notes') }}<textarea v-model="editForm.adminNotes" rows="4" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"></textarea></label>
          </div>
          <div class="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            <p v-if="editing.message" class="italic">“{{ editing.message }}”</p>
            <p v-if="editing.tin">TIN {{ editing.tin }}</p>
            <p v-if="editing.agreementSentAt">{{ $t('admin.reservations.agreementSentAt', { d: formatDate(editing.agreementSentAt) }) }}</p>
            <p v-if="editing.paidAt">{{ $t('admin.reservations.paidAt', { d: formatDate(editing.paidAt) }) }}</p>
            <p v-if="editing.exhibitorInvitedAt">{{ $t('admin.reservations.exhibitorInvited', { d: formatDate(editing.exhibitorInvitedAt) }) }}</p>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <button v-if="editing.boothsIncluded > 0 && editing.status !== 'CANCELLED'" type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50" :data-testid="`assign-${editing.reference}`" @click="openAssign(editing)">{{ $t('admin.reservations.assign') }}</button>
            <button type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50" :disabled="busyId === editing.id" @click="sendAgreement(editing)">{{ $t('admin.reservations.sendAgreement') }}</button>
            <button type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50" :disabled="busyId === editing.id || editing.status === 'PAID' || editing.status === 'CANCELLED'" @click="remind(editing)">{{ $t('admin.reservations.remind') }}</button>
            <button v-if="editing.status === 'PAID' || editing.status === 'DEPOSIT_PAID'" type="button" class="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700" :disabled="busyId === editing.id" :data-testid="`exhibitor-${editing.reference}`" @click="exhibitorAccount(editing)">{{ editing.organizationId && editing.exhibitorInvitedAt ? $t('admin.reservations.reinviteExhibitor') : $t('admin.reservations.createExhibitor') }}</button>
          </div>
          <p v-if="editError" class="text-sm text-red-600" role="alert">{{ editError }}</p>
          <div class="flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" @click="editing = null">{{ $t('reservation.close') }}</button>
            <button type="submit" :disabled="busyId === editing.id" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" data-testid="edit-save">{{ $t('admin.reservations.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import AdminFilterBar from '../components/AdminFilterBar.vue'
import BoothMap from '@/features/reservation/components/BoothMap.vue'
import AdminDataTable from '../components/AdminDataTable.vue'
import ExpoWorkspaceBar from '../components/ExpoWorkspaceBar.vue'
import { reservationApi, RESERVATION_STATUSES, boothTypesForPackage, boothsForPackage } from '@/features/reservation/api/reservation.api'
import { getActiveSponsorshipPackages } from '@/features/exhibition/api/exhibition.api'
import { exhibitorApi } from '@/features/exhibitor/api/exhibitor.api'
import { adminApi } from '@/features/admin/api/admin.api'
import { mediaUrl } from '@/shared/api/client'
import { useRoute } from 'vue-router'

const { t, locale } = useI18n()
const STATUSES = RESERVATION_STATUSES
const columns = computed(() => [
  { key: 'reference', label: t('admin.reservations.colReference'), nowrap: true },
  { key: 'company', label: t('admin.reservations.colSponsor') },
  { key: 'packageName', label: t('admin.reservations.colPackage') },
  { key: 'status', label: t('admin.reservations.colStage') },
  { key: 'amountPaid', label: t('admin.reservations.colPaid') },
  { key: 'assignedTo', label: t('admin.reservations.colOwner') },
  { key: 'actions', label: t('admin.reservations.colActions'), align: 'right' }
])

const pipeline = ref(null)
const rows = ref([])
const total = ref(0)
const page = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')
const notice = ref('')
const q = ref('')
const statusFilter = ref('')
const busyId = ref('')
const filterFields = computed(() => [
  { key: 'q', type: 'search', placeholder: t('admin.reservations.search') },
  { key: 'status', type: 'select', label: t('admin.filters.stage'), allLabel: t('admin.filters.allStages'), options: STATUSES.map((s) => ({ value: s, label: t(`admin.reservations.status.${s}`) })) }
])
const filterValues = computed({
  get: () => ({ q: q.value, status: statusFilter.value }),
  set: (v) => {
    q.value = v.q || ''
    statusFilter.value = v.status || ''
  }
})

const route = useRoute()
const tab = ref(route.query.tab === 'uploads' ? 'uploads' : 'pipeline')
const pendingMedia = ref([])
const reviewNotes = ref({})

async function loadPendingMedia() {
  try {
    pendingMedia.value = await exhibitorApi.pendingMedia()
  } catch {
    pendingMedia.value = []
  }
}
function openUploads() {
  tab.value = 'uploads'
  loadPendingMedia()
}
async function review(m, status) {
  busyId.value = m.id
  try {
    await exhibitorApi.review(m.organizationId, m.id, status, reviewNotes.value[m.id])
    pendingMedia.value = pendingMedia.value.filter((x) => x.id !== m.id)
    notice.value = t(status === 'APPROVED' ? 'admin.reservations.approved' : 'admin.reservations.rejected', { org: m.organizationName })
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}
async function exhibitorAccount(row) {
  busyId.value = row.id
  try {
    const updated = await reservationApi.exhibitorAccount(row.id)
    Object.assign(row, updated)
    notice.value = t('admin.reservations.exhibitorInvitedNotice', { email: row.email })
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}
const booths = ref([])
const activeBooth = ref(null)
const assigning = ref(null)
const assignCodes = ref([])
const assignBooths = computed(() => {
  // Booths this reservation already holds count as pickable for it.
  if (!assigning.value) return booths.value
  return booths.value.map((b) => (b.reservationId === assigning.value.id ? { ...b, status: 'AVAILABLE' } : b))
})

async function loadBooths() {
  try {
    booths.value = await reservationApi.adminBooths()
    if (activeBooth.value) activeBooth.value = booths.value.find((b) => b.code === activeBooth.value.code) || null
  } catch (e) {
    fail(e)
  }
}
async function openMap() {
  tab.value = 'map'
  await loadBooths()
}
function selectBooth(b) {
  activeBooth.value = booths.value.find((x) => x.code === b.code) || b
}
async function saveBooth(body) {
  if (!activeBooth.value) return
  try {
    const updated = await reservationApi.updateBooth(activeBooth.value.code, body)
    const i = booths.value.findIndex((b) => b.code === updated.code)
    if (i >= 0) booths.value.splice(i, 1, updated)
    activeBooth.value = updated
    loadPipeline()
  } catch (e) {
    fail(e)
  }
}
function reservationRef(id) {
  const r = rows.value.find((x) => x.id === id)
  return r ? `${r.reference} · ${r.company}` : id.slice(0, 8)
}
async function openAssign(row) {
  await loadBooths()
  assigning.value = row
  assignCodes.value = [...(row.boothCodes || [])]
}
async function saveAssignment() {
  if (!assigning.value) return
  try {
    const updated = await reservationApi.assignBooths(assigning.value.id, assignCodes.value)
    const row = rows.value.find((r) => r.id === updated.id)
    if (row) Object.assign(row, updated)
    assigning.value = null
    notice.value = t('admin.reservations.assigned', { codes: (updated.boothCodes || []).join(', ') || '—' })
    loadPipeline()
  } catch (e) {
    fail(e)
  }
}

const creating = ref(false)
const createBusy = ref(false)
const createError = ref('')
const packages = ref([])
const createCodes = ref([])
const emptyCreate = () => ({ sponsorshipId: '', organizationId: '', organizationName: '', company: '', contactName: '', email: '', phone: '', tin: '', status: 'REQUESTED', amountPaid: 0, amount: null, locale: 'en', adminNotes: '', sendEmail: true })
const createForm = ref(emptyCreate())

// Organization picker: search existing organizations; the form fills from the pick.
const orgQuery = ref('')
const orgResults = ref([])
const orgSearching = ref(false)
let orgTimer = null
function searchOrgs() {
  clearTimeout(orgTimer)
  const q = orgQuery.value
  if (q.length < 2) {
    orgResults.value = []
    return
  }
  orgTimer = setTimeout(async () => {
    orgSearching.value = true
    try {
      const res = await adminApi.getOrganizations({ search: q })
      orgResults.value = (res.data || []).slice(0, 8)
    } catch {
      orgResults.value = []
    } finally {
      orgSearching.value = false
    }
  }, 250)
}
function pickOrg(o) {
  createForm.value.organizationId = o.id
  createForm.value.organizationName = o.name
  if (!createForm.value.company) createForm.value.company = o.name
  if (!createForm.value.email && o.email) createForm.value.email = o.email
  if (!createForm.value.phone && o.phoneNumbers?.length) createForm.value.phone = o.phoneNumbers[0].number || ''
  if (!createForm.value.tin && o.tinNumber) createForm.value.tin = o.tinNumber
  orgResults.value = []
  orgQuery.value = ''
}
function clearOrg() {
  createForm.value.organizationId = ''
  createForm.value.organizationName = ''
}
async function linkAll() {
  busyId.value = 'link'
  try {
    const { linked } = await reservationApi.linkOrganizations()
    notice.value = t('admin.reservations.orgLinkedAll', { n: linked })
    await load(page.value)
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}
const selectedPackage = computed(() => packages.value.find((p) => p.id === createForm.value.sponsorshipId) || null)
const createBoothsIncluded = computed(() => boothsForPackage(selectedPackage.value?.type))
watch(() => createForm.value.sponsorshipId, () => { createCodes.value = [] })

async function openCreate() {
  createForm.value = emptyCreate()
  orgQuery.value = ''
  orgResults.value = []
  createCodes.value = []
  createError.value = ''
  creating.value = true
  try {
    if (!packages.value.length) packages.value = (await getActiveSponsorshipPackages()).sort((a, b) => (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0))
  } catch {
    packages.value = []
  }
  loadBooths()
}
async function submitCreate() {
  createError.value = ''
  createBusy.value = true
  try {
    const f = createForm.value
    const created = await reservationApi.create({
      sponsorshipId: f.sponsorshipId,
      organizationId: f.organizationId || undefined,
      company: f.company,
      contactName: f.contactName,
      email: f.email,
      phone: f.phone || undefined,
      tin: f.tin || undefined,
      locale: f.locale,
      status: f.status,
      amountPaid: Number(f.amountPaid) || 0,
      amount: f.amount === null || f.amount === '' ? undefined : Number(f.amount),
      adminNotes: f.adminNotes || undefined,
      boothCodes: createCodes.value.length ? [...createCodes.value] : undefined,
      sendEmail: !!f.sendEmail
    })
    creating.value = false
    notice.value = t('admin.reservations.created', { ref: created.reference })
    await Promise.all([load(0), loadPipeline()])
  } catch (e) {
    createError.value = e?.response?.data?.message || e?.message || t('admin.reservations.loadError')
  } finally {
    createBusy.value = false
  }
}

const reserveLink = computed(() => (typeof window !== 'undefined' ? `${window.location.origin}/reserve` : '/reserve'))

function fail(e) {
  error.value = e?.response?.data?.message || e?.message || t('admin.reservations.loadError')
}
async function loadPipeline() {
  try {
    pipeline.value = await reservationApi.pipeline()
  } catch (e) {
    fail(e)
  }
}
async function load(p = 0) {
  loading.value = true
  error.value = ''
  try {
    const data = await reservationApi.list({ q: q.value, status: statusFilter.value, page: p, size: 50 })
    rows.value = data?.content || []
    total.value = data?.totalElements || 0
    totalPages.value = data?.totalPages || 0
    page.value = p
  } catch (e) {
    fail(e)
  } finally {
    loading.value = false
  }
}
function reload() {
  load(0)
}
function setStatus(s) {
  statusFilter.value = statusFilter.value === s ? '' : s
  load(0)
}
async function save(row, body) {
  busyId.value = row.id
  error.value = ''
  try {
    const updated = await reservationApi.update(row.id, body)
    Object.assign(row, updated)
    loadPipeline()
  } catch (e) {
    fail(e)
    throw e
  } finally {
    busyId.value = ''
  }
}
const editing = ref(null)
const editError = ref('')
const editForm = ref({})
function openEdit(row) {
  editing.value = row
  editError.value = ''
  editForm.value = { status: row.status, amountPaid: row.amountPaid ?? 0, amount: row.amount ?? 0, assignedTo: row.assignedTo || '', boothPreference: row.boothPreference || '', adminNotes: row.adminNotes || '' }
}
/** Sends only what changed, so an untouched field never overwrites a concurrent edit. */
async function saveEdit() {
  const row = editing.value
  if (!row) return
  const f = editForm.value
  const body = {}
  if (f.status !== row.status) body.status = f.status
  if (Number(f.amountPaid) !== Number(row.amountPaid ?? 0)) body.amountPaid = Number(f.amountPaid) || 0
  if (Number(f.amount) !== Number(row.amount ?? 0)) body.amount = Number(f.amount) || 0
  if ((f.assignedTo || '') !== (row.assignedTo || '')) body.assignedTo = f.assignedTo
  if ((f.boothPreference || '') !== (row.boothPreference || '')) body.boothPreference = f.boothPreference
  if ((f.adminNotes || '') !== (row.adminNotes || '')) body.adminNotes = f.adminNotes
  if (!Object.keys(body).length) {
    editing.value = null
    return
  }
  editError.value = ''
  try {
    await save(row, body)
    notice.value = t('admin.reservations.saved', { ref: row.reference })
    editing.value = null
  } catch (e) {
    editError.value = e?.response?.data?.message || e?.message || ''
  }
}
async function sendAgreement(row) {
  busyId.value = row.id
  try {
    await reservationApi.sendAgreement(row.id)
    notice.value = t('admin.reservations.agreementSent', { email: row.email })
    setTimeout(() => Promise.all([load(page.value), loadPipeline()]), 1500)
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}
async function remind(row) {
  busyId.value = row.id
  try {
    const updated = await reservationApi.remind(row.id)
    Object.assign(row, updated)
    notice.value = t('admin.reservations.reminded', { email: row.email })
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}
function money(v) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}
function statusCls(s) {
  if (s === 'PAID') return 'bg-emerald-100 text-emerald-800'
  if (s === 'DEPOSIT_PAID' || s === 'SIGNED') return 'bg-blue-100 text-blue-800'
  if (s === 'CANCELLED') return 'bg-admin-sunken/60 text-admin-subtle'
  if (s === 'AGREEMENT_SENT') return 'bg-violet-100 text-violet-800'
  return 'bg-gold-400 text-primary-950'
}
function formatDate(v) {
  if (!v) return ''
  try {
    return new Date(v).toLocaleDateString(locale.value === 'am' ? 'am-ET' : 'en-GB', { dateStyle: 'medium' })
  } catch {
    return String(v)
  }
}
onMounted(() => {
  if (typeof route.query.q === 'string') q.value = route.query.q
  return Promise.all([load(0), loadPipeline(), loadPendingMedia()])
})
</script>

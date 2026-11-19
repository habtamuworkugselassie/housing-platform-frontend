<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.outreach.title') }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-admin-subtle">{{ $t('admin.outreach.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.value"
            :class="['rounded-full px-3 py-1.5 text-xs font-semibold transition-colors', activeTab === tab.value ? 'bg-admin-nav text-white' : 'bg-admin-sunken/60 text-admin-muted hover:bg-admin-sunken']"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Status strip -->
      <div v-if="stats" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="outreach-stats">
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.outreach.scheduler') }}</p>
              <p class="mt-1 text-sm font-semibold" :class="stats.enabled && stats.mailConfigured ? 'text-emerald-600' : 'text-amber-600'" data-testid="scheduler-state">
                {{ stats.enabled ? (stats.mailConfigured ? $t('admin.outreach.sendingOn') : $t('admin.outreach.sendingOnNoMail')) : $t('admin.outreach.sendingOff') }}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="stats.enabled"
              :aria-label="$t('admin.outreach.scheduler')"
              :disabled="savingSettings"
              :class="['relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60', stats.enabled ? 'bg-emerald-600' : 'bg-admin-sunken']"
              data-testid="scheduler-toggle"
              @click="toggleScheduler"
            >
              <span :class="['inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform', stats.enabled ? 'translate-x-5' : 'translate-x-0.5']"></span>
            </button>
          </div>
          <p class="mt-1 text-xs text-admin-subtle">
            {{ stats.mailConfigured ? $t('admin.outreach.fromReply', { from: stats.senderEmail, replyTo: stats.replyTo }) : $t('admin.outreach.mailNotConfigured') }}
          </p>
          <p class="mt-1 text-xs" :class="stats.autoQueueNew ? 'text-emerald-700' : 'text-admin-subtle'" data-testid="auto-queue-state">
            {{ stats.autoQueueNew ? $t('admin.outreach.autoQueueOn') : $t('admin.outreach.autoQueueOff') }}
          </p>
          <button type="button" class="mt-2 text-xs font-semibold text-admin-nav hover:underline" data-testid="settings-toggle" @click="openSettings">
            {{ settingsOpen ? $t('admin.outreach.hideSettings') : $t('admin.outreach.editSettings') }}
          </button>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.outreach.today') }}</p>
          <p class="mt-1 text-2xl font-bold text-admin-fg">{{ stats.sentToday }} <span class="text-sm font-normal text-admin-subtle">/ {{ stats.dailyCap }}</span></p>
          <p class="mt-1 text-xs text-admin-subtle">{{ $t('admin.outreach.window', { start: stats.sendWindowStart, end: stats.sendWindowEnd, tz: stats.timezone }) }}</p>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.outreach.inSequence') }}</p>
          <p class="mt-1 text-2xl font-bold text-admin-fg">{{ (stats.byStatus.QUEUED || 0) + (stats.byStatus.SENT || 0) }}</p>
          <p class="mt-1 text-xs text-admin-subtle">{{ $t('admin.outreach.queuedSent', { queued: stats.byStatus.QUEUED || 0, sent: stats.byStatus.SENT || 0 }) }}</p>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.outreach.outcomes') }}</p>
          <p class="mt-1 text-2xl font-bold text-admin-fg">{{ (stats.byStatus.REPLIED || 0) + (stats.byStatus.REGISTERED || 0) }}</p>
          <p class="mt-1 text-xs text-admin-subtle">{{ stats.replyReaderConfigured ? '' : $t('admin.outreach.manualReplies') + ' ' }}{{ $t('admin.outreach.outcomesDetail', { replied: stats.byStatus.REPLIED || 0, registered: stats.byStatus.REGISTERED || 0, optedOut: stats.byStatus.OPTED_OUT || 0, bounced: stats.byStatus.BOUNCED || 0 }) }}</p>
        </div>
      </div>

      <form v-if="stats && settingsOpen" class="grid gap-3 rounded-lg border border-admin-line/10 bg-admin-surface p-4 sm:grid-cols-5" data-testid="settings-form" @submit.prevent="saveSettings">
        <label class="block text-xs font-medium text-admin-muted">
          {{ $t('admin.outreach.dailyCap') }}
          <input v-model.number="settingsForm.dailyCap" type="number" min="1" max="200" class="mt-1 w-full rounded-lg border border-admin-line/20 px-2 py-1.5 text-sm text-admin-fg" />
        </label>
        <label class="block text-xs font-medium text-admin-muted">
          {{ $t('admin.outreach.hourlyCap') }}
          <input v-model.number="settingsForm.hourlyCap" type="number" min="1" max="50" class="mt-1 w-full rounded-lg border border-admin-line/20 px-2 py-1.5 text-sm text-admin-fg" />
        </label>
        <label class="block text-xs font-medium text-admin-muted">
          {{ $t('admin.outreach.windowStart') }}
          <input v-model.number="settingsForm.sendWindowStart" type="number" min="0" max="23" class="mt-1 w-full rounded-lg border border-admin-line/20 px-2 py-1.5 text-sm text-admin-fg" />
        </label>
        <label class="block text-xs font-medium text-admin-muted">
          {{ $t('admin.outreach.windowEnd') }}
          <input v-model.number="settingsForm.sendWindowEnd" type="number" min="1" max="24" class="mt-1 w-full rounded-lg border border-admin-line/20 px-2 py-1.5 text-sm text-admin-fg" />
        </label>
        <label class="block text-xs font-medium text-admin-muted">
          {{ $t('admin.outreach.followUpDays') }}
          <input v-model.number="settingsForm.followUpAfterDays" type="number" min="1" max="30" class="mt-1 w-full rounded-lg border border-admin-line/20 px-2 py-1.5 text-sm text-admin-fg" />
        </label>
        <label class="flex items-start gap-2 text-xs text-admin-muted sm:col-span-5">
          <input v-model="settingsForm.autoQueueNew" type="checkbox" class="mt-0.5" data-testid="auto-queue-input" />
          <span><span class="font-medium text-admin-fg">{{ $t('admin.outreach.autoQueue') }}</span> {{ $t('admin.outreach.autoQueueHelp') }}</span>
        </label>
        <div class="flex items-end gap-2 sm:col-span-5">
          <button type="submit" :disabled="savingSettings" class="rounded-lg bg-admin-nav px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60" data-testid="settings-save">
            {{ savingSettings ? $t('admin.outreach.saving') : $t('admin.outreach.saveSettings') }}
          </button>
          <p class="text-xs text-admin-subtle">{{ $t('admin.outreach.settingsHint', { tz: stats.timezone }) }}</p>
        </div>
      </form>

      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ error }}</p>
      <p v-if="notice" class="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ notice }}</p>

      <!-- Contacts tab -->
      <div v-if="activeTab === 'contacts'" class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-admin-nav px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
            <input type="file" accept=".csv,text/csv" class="hidden" data-testid="import-input" @change="onImport" />
            {{ importing ? $t('admin.outreach.importing') : $t('admin.outreach.importCsv') }}
          </label>
          <input
            v-model="q"
            type="search"
            :placeholder="$t('admin.outreach.search')"
            class="rounded-lg border border-admin-line/20 bg-admin-surface px-3 py-2 text-sm text-admin-fg"
            @keyup.enter="load(0)"
          />
          <select v-model="statusFilter" class="rounded-lg border border-admin-line/20 bg-admin-surface px-3 py-2 text-sm text-admin-fg" @change="load(0)">
            <option value="">{{ $t('admin.outreach.allStatuses') }}</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
          </select>
          <select v-model="sectorFilter" class="rounded-lg border border-admin-line/20 bg-admin-surface px-3 py-2 text-sm text-admin-fg" @change="load(0)">
            <option value="">{{ $t('admin.outreach.allSectors') }}</option>
            <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
          </select>
          <span class="flex-1" />
          <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60" :disabled="syncing" @click="sync">
            {{ syncing ? $t('admin.outreach.syncing') : $t('admin.outreach.syncReplies') }}
          </button>
          <button type="button" class="rounded-lg bg-gold-400 px-3 py-2 text-xs font-semibold text-primary-950 hover:bg-gold-500 disabled:opacity-50" :disabled="!selected.size" data-testid="queue-selected" @click="queueSelected">
            {{ $t('admin.outreach.queueSelected', { n: selected.size }) }}
          </button>
          <button type="button" class="rounded-lg border border-gold-400 px-3 py-2 text-xs font-semibold text-primary-950 hover:bg-gold-400/30 disabled:opacity-50" :disabled="!(stats && stats.byStatus.NEW)" data-testid="queue-all" @click="queueAll">
            {{ $t('admin.outreach.queueAll', { n: stats ? stats.byStatus.NEW || 0 : 0 }) }}
          </button>
          <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60 disabled:opacity-50" :disabled="!selected.size" @click="pauseSelected">
            {{ $t('admin.outreach.pauseSelected') }}
          </button>
        </div>

        <div class="overflow-hidden rounded-lg border border-admin-line/10 bg-admin-surface">
          <div v-if="loading" class="py-12 text-center"><div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-admin-line/15" /></div>
          <div v-else-if="!rows.length" class="px-6 py-12 text-center text-sm text-admin-subtle">{{ $t('admin.outreach.empty') }}</div>
          <div v-else class="overflow-x-auto">
            <table class="rtable w-full min-w-[72rem] divide-y divide-admin-line/10">
              <thead class="bg-admin-raised">
                <tr>
                  <th class="px-3 py-3"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
                  <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-subtle">{{ $t('admin.outreach.colOrganization') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-subtle">{{ $t('admin.outreach.colSector') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-subtle">{{ $t('admin.outreach.colHook') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-subtle">{{ $t('admin.outreach.colStatus') }}</th>
                  <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-subtle">{{ $t('admin.outreach.colNext') }}</th>
                  <th class="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-admin-subtle">{{ $t('admin.outreach.colActions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-admin-line/10">
                <tr v-for="row in rows" :key="row.id" class="align-top transition-colors hover:bg-admin-nav/5" :data-testid="`contact-${row.id}`">
                  <td class="px-3 py-3"><input type="checkbox" :checked="selected.has(row.id)" @change="toggle(row.id)" /></td>
                  <td class="px-3 py-3 text-sm">
                    <div class="font-medium text-admin-fg">{{ row.name }}</div>
                    <div class="text-xs text-admin-subtle break-all">{{ row.email }}</div>
                    <div v-if="row.confidence && !row.confidence.startsWith('Verified')" class="mt-0.5 text-[11px] text-amber-700">{{ row.confidence }}</div>
                  </td>
                  <td class="px-3 py-3 text-sm text-admin-muted">
                    <div>{{ row.sector }}</div>
                    <div class="text-xs text-admin-subtle">{{ row.effectiveTemplateKey }} · {{ row.locale.toUpperCase() }}</div>
                  </td>
                  <td class="max-w-xs px-3 py-3 text-sm text-admin-muted">
                    <span v-if="row.hook">{{ row.hook }}</span>
                    <span v-else class="text-amber-700">{{ $t('admin.outreach.noHook') }}</span>
                  </td>
                  <td class="px-3 py-3 text-sm">
                    <span :class="['inline-block rounded-full px-2 py-0.5 text-xs font-semibold', statusCls(row.status)]">{{ statusLabel(row.status) }}</span>
                    <div v-if="row.lastError" class="mt-1 max-w-[14rem] text-[11px] text-red-600">{{ row.lastError }}</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-3 text-xs text-admin-subtle">
                    <div v-if="row.nextActionAt">{{ formatDate(row.nextActionAt) }}</div>
                    <div v-if="row.lastSentAt">{{ $t('admin.outreach.sentAt', { date: formatDate(row.lastSentAt) }) }}</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-3 text-right text-sm">
                    <button type="button" class="rounded-lg border border-admin-line/20 px-2.5 py-1 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60" @click="openDrawer(row)">{{ $t('admin.outreach.edit') }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!loading && totalPages > 1" class="flex items-center justify-between border-t border-admin-line/10 px-4 py-3 text-sm text-admin-subtle">
            <span>{{ $t('admin.enquiries.pageOf', { page: page + 1, total: totalPages }) }}</span>
            <div class="flex gap-2">
              <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-1 disabled:opacity-40" :disabled="page === 0" @click="load(page - 1)">‹</button>
              <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-1 disabled:opacity-40" :disabled="page + 1 >= totalPages" @click="load(page + 1)">›</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Templates tab -->
      <div v-else class="space-y-4">
        <p class="text-sm text-admin-subtle">{{ $t('admin.outreach.templatesHelp') }}</p>
        <div v-for="t in templates" :key="t.id" class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-bold text-admin-fg">{{ t.templateKey }} · {{ t.locale.toUpperCase() }}</h2>
            <button type="button" class="rounded-lg bg-admin-nav px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50" :disabled="savingTemplate === t.id" @click="saveTemplate(t)">
              {{ savingTemplate === t.id ? $t('admin.outreach.saving') : $t('admin.outreach.save') }}
            </button>
          </div>
          <input v-model="t.subject" class="mt-3 w-full rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-3 py-2 text-sm text-admin-fg" />
          <textarea v-model="t.body" rows="10" class="mt-2 w-full rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-3 py-2 font-mono text-xs text-admin-fg" />
        </div>
      </div>
    </div>

    <!-- Contact drawer -->
    <div v-if="drawer" class="fixed inset-0 z-[100] flex justify-end bg-violet-950/60" @click.self="drawer = null">
      <div class="flex h-full w-full max-w-xl flex-col overflow-hidden bg-admin-surface shadow-2xl" data-testid="contact-drawer">
        <div class="flex items-center justify-between border-b border-admin-line/10 px-5 py-4">
          <div>
            <h2 class="text-lg font-bold text-admin-fg">{{ drawer.name }}</h2>
            <p class="text-xs text-admin-subtle">{{ drawer.email }} · {{ drawer.phone || '—' }}</p>
          </div>
          <button type="button" class="rounded-full p-2 text-admin-muted hover:bg-admin-sunken/60" @click="drawer = null">✕</button>
        </div>
        <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="text-xs font-medium text-admin-subtle">{{ $t('admin.outreach.fieldContactName') }}</span>
              <input v-model="edit.contactName" class="mt-1 w-full rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-3 py-2 text-admin-fg" />
            </label>
            <label class="block">
              <span class="text-xs font-medium text-admin-subtle">{{ $t('admin.outreach.fieldLocale') }}</span>
              <select v-model="edit.locale" class="mt-1 w-full rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-3 py-2 text-admin-fg">
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
              </select>
            </label>
            <label class="block">
              <span class="text-xs font-medium text-admin-subtle">{{ $t('admin.outreach.fieldTemplate') }}</span>
              <select v-model="edit.templateKey" class="mt-1 w-full rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-3 py-2 text-admin-fg">
                <option value="">{{ $t('admin.outreach.templateAuto', { key: drawer.effectiveTemplateKey }) }}</option>
                <option v-for="k in templateKeys" :key="k" :value="k">{{ k }}</option>
              </select>
            </label>
            <label class="block">
              <span class="text-xs font-medium text-admin-subtle">{{ $t('admin.outreach.fieldOwner') }}</span>
              <input v-model="edit.owner" class="mt-1 w-full rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-3 py-2 text-admin-fg" />
            </label>
          </div>
          <label class="block">
            <span class="text-xs font-medium text-admin-subtle">{{ $t('admin.outreach.fieldHook') }}</span>
            <textarea v-model="edit.hook" rows="2" class="mt-1 w-full rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-3 py-2 text-admin-fg" :placeholder="$t('admin.outreach.hookPlaceholder')" />
          </label>
          <label class="block">
            <span class="text-xs font-medium text-admin-subtle">{{ $t('admin.outreach.fieldNotes') }}</span>
            <textarea v-model="edit.notes" rows="2" class="mt-1 w-full rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-3 py-2 text-admin-fg" />
          </label>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="rounded-lg bg-admin-nav px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" :disabled="saving" data-testid="save-contact" @click="saveContact">{{ saving ? $t('admin.outreach.saving') : $t('admin.outreach.save') }}</button>
            <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted" @click="loadPreview(1)">{{ $t('admin.outreach.previewFirst') }}</button>
            <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted" @click="loadPreview(2)">{{ $t('admin.outreach.previewFollowUp') }}</button>
            <select v-model="edit.status" class="rounded-lg border border-admin-line/20 bg-admin-sunken/40 px-2 py-2 text-xs text-admin-fg">
              <option v-for="s in statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
            </select>
          </div>
          <div v-if="preview" class="rounded-lg border border-admin-line/10 bg-admin-sunken/30 p-3" data-testid="compose">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-xs text-admin-subtle">{{ $t('admin.outreach.previewTo', { to: preview.to }) }} · {{ preview.templateKey }} · {{ preview.locale.toUpperCase() }}</p>
              <div class="flex gap-1" role="tablist">
                <button type="button" role="tab" :aria-selected="composeMode === 'preview'" :class="['rounded-full px-3 py-1 text-xs font-semibold', composeMode === 'preview' ? 'bg-admin-nav text-white' : 'bg-admin-sunken/60 text-admin-muted']" data-testid="mode-preview" @click="composeMode = 'preview'">{{ $t('admin.outreach.modePreview') }}</button>
                <button type="button" role="tab" :aria-selected="composeMode === 'edit'" :class="['rounded-full px-3 py-1 text-xs font-semibold', composeMode === 'edit' ? 'bg-admin-nav text-white' : 'bg-admin-sunken/60 text-admin-muted']" data-testid="mode-edit" @click="composeMode = 'edit'">{{ $t('admin.outreach.modeEdit') }}</button>
              </div>
            </div>

            <div v-show="composeMode === 'preview'" class="mt-2 overflow-hidden rounded-lg border border-admin-line/10 bg-white">
              <iframe :srcdoc="previewHtml" sandbox="" title="Email preview" class="block h-[36rem] w-full" data-testid="preview-frame" />
            </div>
            <div v-show="composeMode === 'edit'" class="mt-2">
              <p class="mb-2 text-[11px] text-admin-subtle">{{ $t('admin.outreach.composeHint') }}</p>
              <input v-model="compose.subject" class="w-full rounded-lg border border-admin-line/20 bg-admin-surface px-3 py-2 text-sm font-semibold text-admin-fg" data-testid="compose-subject" @input="scheduleRender" />
              <textarea v-model="compose.body" rows="16" class="mt-2 w-full rounded-lg border border-admin-line/20 bg-admin-surface px-3 py-2 font-sans text-sm text-admin-fg" data-testid="compose-body" @input="scheduleRender" />
            </div>

            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-admin-muted">
              <label class="inline-flex items-center gap-1"><input v-model="compose.includePackages" type="checkbox" @change="scheduleRender" /> {{ $t('admin.outreach.optPackages') }}</label>
              <label class="inline-flex items-center gap-1"><input v-model="compose.attachBrochure" type="checkbox" /> {{ $t('admin.outreach.optBrochure') }}</label>
              <label class="inline-flex items-center gap-1"><input v-model="compose.attachSponsorship" type="checkbox" /> {{ $t('admin.outreach.optSponsorship') }}</label>
              <label class="inline-flex items-center gap-1"><input v-model="compose.attachAgreement" type="checkbox" /> {{ $t('admin.outreach.optAgreement') }}</label>
              <label v-if="drawer.step === 0" class="inline-flex items-center gap-1"><input v-model="compose.scheduleFollowUp" type="checkbox" /> {{ $t('admin.outreach.optFollowUp') }}</label>
            </div>
            <p v-if="attachmentNames.length" class="mt-2 text-[11px] text-admin-subtle">{{ $t('admin.outreach.attachmentsLine', { list: attachmentNames.join(' · ') }) }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" class="rounded-lg bg-gold-400 px-3 py-2 text-xs font-semibold text-primary-950 hover:bg-gold-500 disabled:opacity-50" :disabled="sending || !stats?.mailConfigured" data-testid="send-now" @click="sendNow">
                {{ sending ? $t('admin.outreach.sending') : $t('admin.outreach.sendNow', { to: preview.to }) }}
              </button>
              <input v-model="testTo" type="email" :placeholder="$t('admin.outreach.testTo')" class="rounded-lg border border-admin-line/20 bg-admin-surface px-3 py-1.5 text-xs text-admin-fg" />
              <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-1.5 text-xs font-semibold text-admin-muted" :disabled="!testTo" @click="sendTest">{{ $t('admin.outreach.sendTest') }}</button>
            </div>
          </div>
          <div v-if="history.length">
            <p class="text-xs font-medium uppercase tracking-wide text-admin-subtle">{{ $t('admin.outreach.history') }}</p>
            <div v-for="m in history" :key="m.id" class="mt-2 rounded-lg border border-admin-line/10 p-3">
              <p class="text-xs text-admin-subtle">{{ $t('admin.outreach.step', { step: m.step }) }} · {{ formatDate(m.sentAt) }}</p>
              <p class="font-semibold text-admin-fg">{{ m.subject }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { outreachApi } from '@/features/outreach/api/outreach.api'

const { t, locale } = useI18n()

const statuses = ['NEW', 'QUEUED', 'SENT', 'FOLLOWED_UP', 'REPLIED', 'REGISTERED', 'OPTED_OUT', 'BOUNCED', 'PAUSED']
const templateKeys = ['REAL_ESTATE', 'BANK', 'INSURANCE', 'CONTRACTOR', 'ASSOCIATION', 'MEDIA', 'CONSULTANCY']
const sectors = ['Real estate developer', 'Real estate agency', 'Bank', 'Mortgage bank', 'Insurance', 'Reinsurance', 'Contractor', 'Cement', 'Steel', 'Building materials', 'Construction equipment', 'Paints & finishing', 'Chamber', 'Association', 'Government', 'Media', 'Architecture & engineering consultancy', 'Events & venues']

const tabs = computed(() => [
  { value: 'contacts', label: t('admin.outreach.tabContacts') },
  { value: 'templates', label: t('admin.outreach.tabTemplates') }
])
const activeTab = ref('contacts')

const stats = ref(null)
const settingsOpen = ref(false)
const savingSettings = ref(false)
const settingsForm = reactive({ dailyCap: 30, hourlyCap: 8, sendWindowStart: 9, sendWindowEnd: 17, followUpAfterDays: 5, autoQueueNew: true })
const rows = ref([])
const loading = ref(true)
const error = ref('')
const notice = ref('')
const page = ref(0)
const totalPages = ref(0)
const q = ref('')
const statusFilter = ref('')
const sectorFilter = ref('')
const selected = ref(new Set())
const importing = ref(false)
const syncing = ref(false)
const templates = ref([])
const savingTemplate = ref('')

const drawer = ref(null)
const edit = reactive({ contactName: '', locale: 'en', templateKey: '', owner: '', hook: '', notes: '', status: 'NEW' })
const saving = ref(false)
const preview = ref(null)
const compose = reactive({ subject: '', body: '', includePackages: true, attachBrochure: true, attachSponsorship: true, attachAgreement: true, scheduleFollowUp: true })
const sending = ref(false)
const composeMode = ref('preview')
const previewHtml = ref('')
let renderTimer = null
const history = ref([])
const testTo = ref('')

const allSelected = computed(() => rows.value.length > 0 && rows.value.every((r) => selected.value.has(r.id)))

function fail(e) {
  error.value = e?.response?.data?.message || e?.message || t('admin.outreach.genericError')
}

async function loadStats() {
  try {
    stats.value = await outreachApi.stats()
  } catch (e) {
    fail(e)
  }
}

async function load(p = 0) {
  loading.value = true
  error.value = ''
  page.value = p
  try {
    const data = await outreachApi.list({ status: statusFilter.value, sector: sectorFilter.value, q: q.value, page: p, size: 50 })
    rows.value = data.content || []
    totalPages.value = data.totalPages || 0
    selected.value = new Set()
  } catch (e) {
    fail(e)
  } finally {
    loading.value = false
  }
}

async function loadTemplates() {
  try {
    templates.value = await outreachApi.templates()
  } catch (e) {
    fail(e)
  }
}

function toggle(id) {
  const s = new Set(selected.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selected.value = s
}

function toggleAll() {
  selected.value = allSelected.value ? new Set() : new Set(rows.value.map((r) => r.id))
}

async function onImport(ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  importing.value = true
  error.value = ''
  try {
    const r = await outreachApi.importCsv(file)
    notice.value = t('admin.outreach.importResult', r)
    await Promise.all([load(0), loadStats()])
  } catch (e) {
    fail(e)
  } finally {
    importing.value = false
    ev.target.value = ''
  }
}

async function queueAll() {
  if (!window.confirm(t('admin.outreach.queueAllConfirm', { n: stats.value?.byStatus.NEW || 0 }))) return
  try {
    const n = await outreachApi.queueAll()
    notice.value = t('admin.outreach.queued', { n })
    await Promise.all([load(page.value), loadStats()])
  } catch (e) {
    fail(e)
  }
}

async function queueSelected() {
  try {
    const n = await outreachApi.queue([...selected.value])
    notice.value = t('admin.outreach.queued', { n })
    await Promise.all([load(page.value), loadStats()])
  } catch (e) {
    fail(e)
  }
}

async function pauseSelected() {
  try {
    const n = await outreachApi.pause([...selected.value])
    notice.value = t('admin.outreach.paused', { n })
    await Promise.all([load(page.value), loadStats()])
  } catch (e) {
    fail(e)
  }
}

function openSettings() {
  if (!settingsOpen.value && stats.value) {
    Object.assign(settingsForm, {
      dailyCap: stats.value.dailyCap,
      hourlyCap: stats.value.hourlyCap,
      sendWindowStart: stats.value.sendWindowStart,
      sendWindowEnd: stats.value.sendWindowEnd,
      followUpAfterDays: stats.value.followUpAfterDays,
      autoQueueNew: !!stats.value.autoQueueNew
    })
  }
  settingsOpen.value = !settingsOpen.value
}

async function applySettings(body) {
  savingSettings.value = true
  error.value = ''
  try {
    stats.value = await outreachApi.updateSettings(body)
    return true
  } catch (e) {
    fail(e)
    return false
  } finally {
    savingSettings.value = false
  }
}

async function toggleScheduler() {
  const next = !stats.value.enabled
  if (await applySettings({ enabled: next })) {
    notice.value = next ? t('admin.outreach.schedulerTurnedOn') : t('admin.outreach.schedulerTurnedOff')
  }
}

async function saveSettings() {
  if (await applySettings({ ...settingsForm })) notice.value = t('admin.outreach.settingsSaved')
}

async function sync() {
  syncing.value = true
  try {
    await outreachApi.sync()
    await Promise.all([load(page.value), loadStats()])
  } catch (e) {
    fail(e)
  } finally {
    syncing.value = false
  }
}

async function openDrawer(row) {
  drawer.value = row
  preview.value = null
  history.value = []
  Object.assign(edit, {
    contactName: row.contactName || '',
    locale: row.locale || 'en',
    templateKey: row.templateKey || '',
    owner: row.owner || '',
    hook: row.hook || '',
    notes: row.notes || '',
    status: row.status
  })
  try {
    history.value = await outreachApi.messages(row.id)
  } catch {
    history.value = []
  }
}

async function saveContact() {
  if (!drawer.value) return
  saving.value = true
  try {
    const updated = await outreachApi.update(drawer.value.id, { ...edit })
    const i = rows.value.findIndex((r) => r.id === updated.id)
    if (i >= 0) rows.value[i] = updated
    drawer.value = updated
    notice.value = t('admin.outreach.savedContact')
    loadStats()
  } catch (e) {
    fail(e)
  } finally {
    saving.value = false
  }
}

const attachmentNames = computed(() => {
  const lang = (drawer.value?.locale || 'en') === 'am' ? 'Amharic' : 'English'
  const names = []
  if (compose.attachBrochure) names.push(`Brochure (${lang})`)
  if (compose.attachSponsorship) names.push(`Sponsorship packages (${lang})`)
  if (compose.attachAgreement) names.push(`Exhibitor agreement (${lang})`)
  return names
})

function scheduleRender() {
  if (renderTimer) clearTimeout(renderTimer)
  renderTimer = setTimeout(refreshRender, 600)
}

async function refreshRender() {
  if (!drawer.value || !preview.value) return
  try {
    previewHtml.value = await outreachApi.render(drawer.value.id, { subject: compose.subject, body: compose.body, includePackages: compose.includePackages })
  } catch (e) {
    fail(e)
  }
}

async function loadPreview(step) {
  if (!drawer.value) return
  try {
    preview.value = await outreachApi.preview(drawer.value.id, step)
    previewHtml.value = preview.value.html || ''
    composeMode.value = 'preview'
    compose.subject = preview.value.subject
    compose.body = preview.value.body
    const first = step === 1
    compose.includePackages = first
    compose.attachBrochure = first
    compose.attachSponsorship = first
    compose.attachAgreement = first
    compose.scheduleFollowUp = first
  } catch (e) {
    fail(e)
  }
}

async function sendNow() {
  if (!drawer.value || !preview.value) return
  if (!window.confirm(t('admin.outreach.confirmSend', { to: preview.value.to }))) return
  sending.value = true
  try {
    const updated = await outreachApi.sendNow(drawer.value.id, { ...compose })
    const i = rows.value.findIndex((r) => r.id === updated.id)
    if (i >= 0) rows.value[i] = updated
    drawer.value = updated
    notice.value = t('admin.outreach.sentNow', { to: updated.email })
    history.value = await outreachApi.messages(updated.id)
    loadStats()
  } catch (e) {
    fail(e)
  } finally {
    sending.value = false
  }
}

async function sendTest() {
  if (!drawer.value || !preview.value) return
  try {
    await outreachApi.sendTest(drawer.value.id, testTo.value, preview.value.templateKey === 'FOLLOW_UP' ? 2 : 1)
    notice.value = t('admin.outreach.testSent', { to: testTo.value })
  } catch (e) {
    fail(e)
  }
}

async function saveTemplate(tpl) {
  savingTemplate.value = tpl.id
  try {
    const saved = await outreachApi.updateTemplate(tpl.id, { subject: tpl.subject, body: tpl.body })
    Object.assign(tpl, saved)
    notice.value = t('admin.outreach.savedTemplate')
  } catch (e) {
    fail(e)
  } finally {
    savingTemplate.value = ''
  }
}

function statusLabel(s) {
  return t(`admin.outreach.status.${s}`)
}

function statusCls(s) {
  switch (s) {
    case 'QUEUED': return 'bg-blue-100 text-blue-800'
    case 'SENT': case 'FOLLOWED_UP': return 'bg-violet-100 text-violet-800'
    case 'REPLIED': case 'REGISTERED': return 'bg-emerald-100 text-emerald-800'
    case 'OPTED_OUT': case 'BOUNCED': return 'bg-red-100 text-red-800'
    case 'PAUSED': return 'bg-amber-100 text-amber-800'
    default: return 'bg-admin-sunken/60 text-admin-subtle'
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(locale.value || undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

onMounted(() => {
  load(0)
  loadStats()
  loadTemplates()
})
</script>

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AdminOutreachView from './AdminOutreachView.vue'
import { outreachApi } from '@/features/outreach/api/outreach.api'

vi.mock('@/features/outreach/api/outreach.api', () => ({
  outreachApi: {
    stats: vi.fn(), updateSettings: vi.fn(), queueAll: vi.fn(), list: vi.fn(), templates: vi.fn(), queue: vi.fn(), pause: vi.fn(),
    update: vi.fn(), preview: vi.fn(), messages: vi.fn(), sendTest: vi.fn(), sendNow: vi.fn(), render: vi.fn(), importCsv: vi.fn(), sync: vi.fn(), updateTemplate: vi.fn()
  }
}))

const contact = (o: Record<string, unknown> = {}) => ({
  id: 'c1', name: 'Noah Real Estate', contactName: null, sector: 'Real estate developer', templateKey: null,
  effectiveTemplateKey: 'REAL_ESTATE', email: 'info@noah.et', phone: '6100', website: null, city: 'Addis Ababa',
  locale: 'en', confidence: 'Verified on official site/NBE', sourceUrl: null, notes: null, hook: null, owner: null,
  status: 'NEW', step: 0, nextActionAt: null, lastSentAt: null, repliedAt: null, threadId: null, lastError: null,
  createdAt: '2026-11-18T10:00:00', updatedAt: '2026-11-18T10:00:00', ...o
})

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })

function mountView() {
  return mount(AdminOutreachView, {
    global: { plugins: [createPinia(), i18n], stubs: { AdminLayout: { template: '<div><slot /></div>' } } }
  })
}

describe('AdminOutreachView', () => {
  beforeEach(() => {
    vi.mocked(outreachApi.stats).mockResolvedValue({
      byStatus: { NEW: 2, QUEUED: 1, SENT: 3, FOLLOWED_UP: 0, REPLIED: 1, REGISTERED: 1, OPTED_OUT: 0, BOUNCED: 0, PAUSED: 0 },
      sentToday: 4, sentLastHour: 1, dailyCap: 30, hourlyCap: 8, enabled: true, mailConfigured: true, replyReaderConfigured: true, insideSendWindow: true,
      senderEmail: 'partnerships@ethiobuildconnect.et', replyTo: 'ethiobuildconnectexpo@gmail.com', timezone: 'Africa/Addis_Ababa', sendWindowStart: 9, sendWindowEnd: 17, followUpAfterDays: 5, autoQueueNew: true
    })
    vi.mocked(outreachApi.list).mockResolvedValue({ content: [contact(), contact({ id: 'c2', name: 'Awash Bank', sector: 'Bank', effectiveTemplateKey: 'BANK', hook: 'Your diaspora mortgage', status: 'SENT', lastSentAt: '2026-11-18T09:00:00', nextActionAt: '2026-11-25T09:00:00' })], totalElements: 2, totalPages: 1, number: 0, size: 50 })
    vi.mocked(outreachApi.templates).mockResolvedValue([{ id: 't1', templateKey: 'BANK', locale: 'en', subject: 'S', body: 'B' }])
    vi.mocked(outreachApi.queue).mockReset()
    vi.mocked(outreachApi.update).mockReset()
  })

  it('shows stats and contacts, flags a missing opening line, and queues the selection', async () => {
    vi.mocked(outreachApi.queue).mockResolvedValue(1)
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="outreach-stats"]').text()).toContain('4')
    expect(w.find('[data-testid="contact-c1"]').text()).toContain('admin.outreach.noHook')
    expect(w.find('[data-testid="contact-c2"]').text()).toContain('Your diaspora mortgage')

    await w.find('[data-testid="contact-c1"] input[type="checkbox"]').setValue(true)
    await w.find('[data-testid="queue-selected"]').trigger('click')
    await flushPromises()
    expect(outreachApi.queue).toHaveBeenCalledWith(['c1'])
  })

  it('opens a contact, edits the opening line and previews the email', async () => {
    vi.mocked(outreachApi.messages).mockResolvedValue([])
    vi.mocked(outreachApi.update).mockResolvedValue(contact({ hook: 'Saw your Atlas launch' }) as any)
    vi.mocked(outreachApi.preview).mockResolvedValue({ to: 'info@noah.et', subject: 'Noah at the expo', body: 'Dear Noah team,', html: '<html><body><h1>Noah at the expo</h1></body></html>', templateKey: 'REAL_ESTATE', locale: 'en', attachments: ['Brochure (English)'] })
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="contact-c1"] button').trigger('click')
    await flushPromises()
    const drawer = w.find('[data-testid="contact-drawer"]')
    expect(drawer.exists()).toBe(true)
    await drawer.find('textarea').setValue('Saw your Atlas launch')
    await drawer.find('[data-testid="save-contact"]').trigger('click')
    await flushPromises()
    expect(outreachApi.update).toHaveBeenCalledWith('c1', expect.objectContaining({ hook: 'Saw your Atlas launch', locale: 'en', status: 'NEW' }))

    const buttons = drawer.findAll('button').filter((b) => b.text() === 'admin.outreach.previewFirst')
    await buttons[0].trigger('click')
    await flushPromises()
    expect(outreachApi.preview).toHaveBeenCalledWith('c1', 1)
    expect(w.find('[data-testid="preview-frame"]').attributes('srcdoc')).toContain('<h1>Noah at the expo</h1>')
    await w.find('[data-testid="mode-edit"]').trigger('click')
    expect((w.find('[data-testid="compose-subject"]').element as HTMLInputElement).value).toBe('Noah at the expo')

    vi.mocked(outreachApi.sendNow).mockResolvedValue(contact({ status: 'SENT', step: 1 }) as any)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await w.find('[data-testid="compose-subject"]').setValue('Noah at the expo (edited)')
    await w.find('[data-testid="send-now"]').trigger('click')
    await flushPromises()
    expect(outreachApi.sendNow).toHaveBeenCalledWith('c1', expect.objectContaining({
      subject: 'Noah at the expo (edited)', body: 'Dear Noah team,', includePackages: true, attachBrochure: true, attachSponsorship: true, attachAgreement: true, scheduleFollowUp: true
    }))
    expect(w.find('[data-testid="contact-c1"]').text()).toContain('admin.outreach.status.SENT')
  })

  it('switches scheduled sending off from the header and saves caps', async () => {
    vi.mocked(outreachApi.updateSettings).mockImplementation(async (body) => ({
      ...(await vi.mocked(outreachApi.stats).getMockImplementation()!()), enabled: body.enabled ?? false, dailyCap: body.dailyCap ?? 30
    }))
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="scheduler-state"]').text()).toBe('admin.outreach.sendingOn')
    await w.find('[data-testid="scheduler-toggle"]').trigger('click')
    await flushPromises()
    expect(outreachApi.updateSettings).toHaveBeenCalledWith({ enabled: false })
    expect(w.find('[data-testid="scheduler-state"]').text()).toBe('admin.outreach.sendingOff')

    await w.find('[data-testid="settings-toggle"]').trigger('click')
    const daily = w.find('[data-testid="settings-form"] input')
    await daily.setValue('12')
    await w.find('[data-testid="settings-form"]').trigger('submit')
    await flushPromises()
    expect(outreachApi.updateSettings).toHaveBeenLastCalledWith(expect.objectContaining({ dailyCap: 12, hourlyCap: 8, sendWindowStart: 9, sendWindowEnd: 17, followUpAfterDays: 5 }))
    expect(w.find('[data-testid="outreach-stats"]').text()).toContain('/ 12')
  })

  it('queues every new contact in one click after confirming', async () => {
    vi.mocked(outreachApi.queueAll).mockResolvedValue(2)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="auto-queue-state"]').text()).toBe('admin.outreach.autoQueueOn')
    await w.find('[data-testid="queue-all"]').trigger('click')
    await flushPromises()
    expect(outreachApi.queueAll).toHaveBeenCalled()
  })
})

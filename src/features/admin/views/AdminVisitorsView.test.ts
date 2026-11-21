import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AdminVisitorsView from './AdminVisitorsView.vue'
import { visitorApi } from '@/features/visitor/api/visitor.api'

vi.mock('@/features/visitor/api/visitor.api', async (orig) => {
  const actual = await orig<typeof import('@/features/visitor/api/visitor.api')>()
  return { ...actual, visitorApi: { adminStats: vi.fn(), adminList: vi.fn(), checkIn: vi.fn(), setStatus: vi.fn(), resend: vi.fn(), exportCsv: vi.fn() } }
})
vi.mock('html5-qrcode', () => ({ Html5Qrcode: class { start() { return Promise.resolve() } stop() { return Promise.resolve() } } }))

const row = (o: Record<string, unknown> = {}) => ({
  id: 'v1', code: 'EBC-K7M2PX', fullName: 'Sara Tesfaye', email: 'sara@example.com', phone: null, organization: 'Acme', visitorType: 'INVESTOR',
  interests: null, locale: 'en', status: 'REGISTERED', source: 'web', checkedInAt: null, checkedInBy: null, badgeSentAt: '2026-11-21T10:00:00', createdAt: '2026-11-21T10:00:00', ...o
})
const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })

function mountView() {
  return mount(AdminVisitorsView, { global: { plugins: [createPinia(), i18n], stubs: { AdminLayout: { template: '<div><slot /></div>' } } } })
}

describe('AdminVisitorsView', () => {
  beforeEach(() => {
    vi.mocked(visitorApi.adminStats).mockResolvedValue({ total: 12, checkedIn: 3, today: 2, checkedInToday: 1, last7Days: 9, byType: { INVESTOR: 5, HOMEBUYER: 7 }, byDay: [{ day: '2026-11-21', count: 2 }] })
    vi.mocked(visitorApi.adminList).mockResolvedValue({ content: [row()], totalElements: 1, totalPages: 1, number: 0, size: 50 })
    vi.mocked(visitorApi.checkIn).mockReset()
  })

  it('shows stats and rows, and checks a visitor in from the row', async () => {
    vi.mocked(visitorApi.checkIn).mockResolvedValue(row({ status: 'CHECKED_IN', checkedInAt: '2026-11-21T11:00:00' }) as any)
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="visitor-stats"]').text()).toContain('12')
    expect(w.find('[data-testid="visitor-EBC-K7M2PX"]').text()).toContain('Sara Tesfaye')
    await w.find('[data-testid="visitor-EBC-K7M2PX"] button').trigger('click')
    await flushPromises()
    expect(visitorApi.checkIn).toHaveBeenCalledWith('EBC-K7M2PX')
  })

  it('checks in a typed code from the scanner panel and shows the result', async () => {
    vi.mocked(visitorApi.checkIn).mockResolvedValue(row({ status: 'CHECKED_IN', checkedInAt: '2026-11-21T11:00:00' }) as any)
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="scanner-toggle"]').trigger('click')
    await flushPromises()
    await w.find('[data-testid="manual-code"]').setValue('k7m2px')
    await w.find('[data-testid="manual-check-in"]').trigger('submit')
    await flushPromises()
    expect(visitorApi.checkIn).toHaveBeenCalledWith('k7m2px')
    expect(w.find('[data-testid="check-in-result"]').text()).toContain('Sara Tesfaye')
  })

  it('shows the refusal when a badge was already used', async () => {
    vi.mocked(visitorApi.checkIn).mockRejectedValue({ response: { data: { message: 'Already checked in at 2026-11-21T11:00 (Sara Tesfaye)' } } })
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="scanner-toggle"]').trigger('click')
    await flushPromises()
    await w.find('[data-testid="manual-code"]').setValue('EBC-K7M2PX')
    await w.find('[data-testid="manual-check-in"]').trigger('submit')
    await flushPromises()
    expect(w.find('[data-testid="check-in-result"]').text()).toContain('Already checked in')
  })
})

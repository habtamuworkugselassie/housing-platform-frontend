import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AdminReservationsView from './AdminReservationsView.vue'
import { reservationApi } from '@/features/reservation/api/reservation.api'

vi.mock('@/features/reservation/api/reservation.api', async (orig) => {
  const actual = await orig<typeof import('@/features/reservation/api/reservation.api')>()
  return { ...actual, reservationApi: { pipeline: vi.fn(), list: vi.fn(), update: vi.fn(), sendAgreement: vi.fn(), remind: vi.fn() } }
})

const row = (o: Record<string, unknown> = {}) => ({
  id: 'r1', reference: 'RSV-K7M2PX', sponsorshipId: 'p1', packageName: 'Tier 2 · Gold', packageType: 'GOLD', amount: 900000, currency: 'ETB',
  company: 'Noah Real Estate', contactName: 'Sara', email: 'sara@noah.et', phone: null, tin: null, boothPreference: null, message: null, locale: 'en',
  status: 'AGREEMENT_SENT', amountPaid: 0, adminNotes: null, assignedTo: null, source: 'site', agreementSentAt: '2026-11-21T10:00:00', signedAt: null, paidAt: null,
  lastReminderAt: null, reminderCount: 0, statusChangedAt: '2026-11-21T10:00:00', createdAt: '2026-11-21T10:00:00', updatedAt: '2026-11-21T10:00:00', ...o
})
const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const mountView = () => mount(AdminReservationsView, { global: { plugins: [createPinia(), i18n], stubs: { AdminLayout: { template: '<div><slot /></div>' } } } })

describe('AdminReservationsView', () => {
  beforeEach(() => {
    vi.mocked(reservationApi.pipeline).mockResolvedValue({ openCount: 3, openValue: 2600000, paidValue: 900000, byStatus: { REQUESTED: { count: 1, value: 1700000, paid: 0 }, AGREEMENT_SENT: { count: 1, value: 900000, paid: 0 }, PAID: { count: 1, value: 900000, paid: 900000 } } })
    vi.mocked(reservationApi.list).mockResolvedValue({ content: [row()], totalElements: 1, totalPages: 1, number: 0, size: 50 })
    vi.mocked(reservationApi.update).mockReset()
  })

  it('shows the pipeline totals and the reservation rows', async () => {
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="pipeline"]').text()).toContain('2,600,000')
    expect(w.find('[data-testid="reservation-RSV-K7M2PX"]').text()).toContain('Noah Real Estate')
  })

  it('records a deposit and moves the stage from the row', async () => {
    vi.mocked(reservationApi.update).mockResolvedValue(row({ status: 'DEPOSIT_PAID', amountPaid: 300000 }) as any)
    const w = mountView()
    await flushPromises()
    const paid = w.find('[data-testid="paid-RSV-K7M2PX"]')
    await paid.setValue('300000')
    await paid.trigger('change')
    await flushPromises()
    expect(reservationApi.update).toHaveBeenCalledWith('r1', { amountPaid: 300000 })
    expect(w.find('[data-testid="reservation-RSV-K7M2PX"]').text()).toContain('admin.reservations.status.DEPOSIT_PAID')

    await w.find('[data-testid="status-RSV-K7M2PX"]').setValue('SIGNED')
    await flushPromises()
    expect(reservationApi.update).toHaveBeenLastCalledWith('r1', { status: 'SIGNED' })
  })
})

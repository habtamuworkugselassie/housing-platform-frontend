import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AdminReservationsView from './AdminReservationsView.vue'
import { reservationApi } from '@/features/reservation/api/reservation.api'

vi.mock('@/features/reservation/api/reservation.api', async (orig) => {
  const actual = await orig<typeof import('@/features/reservation/api/reservation.api')>()
  return { ...actual, reservationApi: { pipeline: vi.fn(), list: vi.fn(), update: vi.fn(), sendAgreement: vi.fn(), remind: vi.fn(), adminBooths: vi.fn(), updateBooth: vi.fn(), assignBooths: vi.fn(), create: vi.fn(), exhibitorAccount: vi.fn(), linkOrganizations: vi.fn() } }
})

vi.mock('@/features/exhibitor/api/exhibitor.api', () => ({ exhibitorApi: { pendingMedia: vi.fn().mockResolvedValue([{ id: 'm1', url: '/api/v1/uploads/organizations/o1/logo.png', mediaKind: 'LOGO', reviewStatus: 'PENDING', organizationId: 'o1', organizationName: 'Abay Steel PLC', createdAt: '2026-11-22T10:00:00' }]), review: vi.fn().mockResolvedValue(undefined) } }))
vi.mock('@/features/admin/api/admin.api', () => ({ adminApi: { getOrganizations: vi.fn().mockResolvedValue({ data: [{ id: 'o9', name: 'Existing Cement SC', city: 'Adama', status: 'APPROVED', email: 'info@cement.et', phoneNumbers: [{ countryCode: '+251', number: '0911222333' }] }] }) } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }), useRouter: () => ({ push: vi.fn() }) }))

vi.mock('@/features/exhibition/api/exhibition.api', () => ({ getActiveSponsorshipPackages: vi.fn().mockResolvedValue([{ id: 'p1', name: 'Tier 2 · Gold', type: 'GOLD', basePrice: 900000, status: 'ACTIVE' }]) }))

const row = (o: Record<string, unknown> = {}) => ({
  id: 'r1', reference: 'RSV-K7M2PX', sponsorshipId: 'p1', packageName: 'Tier 2 · Gold', packageType: 'GOLD', amount: 900000, currency: 'ETB',
  company: 'Noah Real Estate', contactName: 'Sara', email: 'sara@noah.et', phone: null, tin: null, boothPreference: null, message: null, locale: 'en',
  status: 'AGREEMENT_SENT', amountPaid: 0, adminNotes: null, assignedTo: null, source: 'site', agreementSentAt: '2026-11-21T10:00:00', signedAt: null, paidAt: null,
  lastReminderAt: null, reminderCount: 0, statusChangedAt: '2026-11-21T10:00:00', createdAt: '2026-11-21T10:00:00', updatedAt: '2026-11-21T10:00:00', boothCodes: [], boothsIncluded: 2, ...o
})
const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const mountView = () => mount(AdminReservationsView, { global: { plugins: [createPinia(), i18n], stubs: { AdminLayout: { template: '<div><slot /></div>' } } } })

describe('AdminReservationsView', () => {
  beforeEach(() => {
    vi.mocked(reservationApi.pipeline).mockResolvedValue({ openCount: 3, openValue: 2600000, paidValue: 900000, byStatus: { REQUESTED: { count: 1, value: 1700000, paid: 0 }, AGREEMENT_SENT: { count: 1, value: 900000, paid: 0 }, PAID: { count: 1, value: 900000, paid: 900000 } }, booths: { AVAILABLE: 117, HELD: 2, SOLD: 1, BLOCKED: 0, TOTAL: 120 } })
    vi.mocked(reservationApi.adminBooths).mockResolvedValue([
      { code: 'B104', block: 'B', col: 3, row: 2, boothType: 'CORNER', sizeSqm: 9, status: 'AVAILABLE' },
      { code: 'B105', block: 'B', col: 4, row: 2, boothType: 'STANDARD', sizeSqm: 9, status: 'AVAILABLE' }
    ] as any)
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

  it('assigns booths to a reservation from the map', async () => {
    vi.mocked(reservationApi.assignBooths).mockResolvedValue(row({ boothCodes: ['B104', 'B105'] }) as any)
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="reservation-RSV-K7M2PX"]').text()).toContain('admin.reservations.noBooths')
    await w.find('[data-testid="assign-RSV-K7M2PX"]').trigger('click')
    await flushPromises()
    const cells = w.findAll('g.booth')
    expect(cells).toHaveLength(2)
    await cells[0].trigger('click')
    await cells[1].trigger('click')
    await w.find('[data-testid="assign-save"]').trigger('click')
    await flushPromises()
    expect(reservationApi.assignBooths).toHaveBeenCalledWith('r1', ['B104', 'B105'])
    expect(w.find('[data-testid="reservation-RSV-K7M2PX"]').text()).toContain('B104, B105')
  })

  it('edits a booth from the floor plan tab', async () => {
    vi.mocked(reservationApi.updateBooth).mockResolvedValue({ code: 'B101', block: 'B', col: 3, row: 1, boothType: 'PREMIUM', sizeSqm: 9, status: 'BLOCKED' } as any)
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="tab-map"]').trigger('click')
    await flushPromises()
    await w.findAll('g.booth')[0].trigger('click')
    await w.find('[data-testid="booth-status"]').setValue('BLOCKED')
    await flushPromises()
    expect(reservationApi.updateBooth).toHaveBeenCalledWith('B104', { status: 'BLOCKED' })
  })

  it('enters a manual reservation with a booth and a starting stage', async () => {
    vi.mocked(reservationApi.create).mockResolvedValue(row({ reference: 'RSV-MANUAL', status: 'SIGNED', boothCodes: ['B104'], source: 'manual' }) as any)
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="new-reservation"]').trigger('click')
    await flushPromises()
    await w.find('[data-testid="create-package"]').setValue('p1')
    await w.find('[data-testid="create-company"]').setValue('Walk-in PLC')
    await w.find('[data-testid="create-contact"]').setValue('Dawit')
    await w.find('[data-testid="create-email"]').setValue('dawit@walkin.et')
    await w.find('[data-testid="create-status"]').setValue('SIGNED')
    await w.find('[data-testid="create-send-email"]').setValue(false)
    await flushPromises()
    await w.find('g.booth').trigger('click')
    await w.find('[data-testid="create-form"]').trigger('submit')
    await flushPromises()
    expect(reservationApi.create).toHaveBeenCalledWith(expect.objectContaining({ sponsorshipId: 'p1', company: 'Walk-in PLC', contactName: 'Dawit', email: 'dawit@walkin.et', status: 'SIGNED', boothCodes: ['B104'], sendEmail: false }))
    expect(w.text()).toContain('admin.reservations.created')
  })

  it('offers the exhibitor account on a paid row and reviews pending uploads', async () => {
    vi.mocked(reservationApi.list).mockResolvedValue({ content: [row({ status: 'DEPOSIT_PAID', amountPaid: 75000 })], totalElements: 1, totalPages: 1, number: 0, size: 50 })
    vi.mocked(reservationApi.exhibitorAccount).mockResolvedValue(row({ status: 'DEPOSIT_PAID', organizationId: 'o1', exhibitorInvitedAt: '2026-11-22T10:00:00' }) as any)
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="toggle-r1"]').trigger('click')
    await w.find('[data-testid="exhibitor-RSV-K7M2PX"]').trigger('click')
    await flushPromises()
    expect(reservationApi.exhibitorAccount).toHaveBeenCalledWith('r1')
    expect(w.find('[data-testid="exhibitor-RSV-K7M2PX"]').text()).toBe('admin.reservations.reinviteExhibitor')

    expect(w.find('[data-testid="tab-uploads"]').text()).toContain('1')
    await w.find('[data-testid="tab-uploads"]').trigger('click')
    await flushPromises()
    expect(w.find('[data-testid="uploads-panel"]').text()).toContain('Abay Steel PLC')
    await w.find('[data-testid="approve-m1"]').trigger('click')
    await flushPromises()
    const { exhibitorApi } = await import('@/features/exhibitor/api/exhibitor.api')
    expect(exhibitorApi.review).toHaveBeenCalledWith('o1', 'm1', 'APPROVED', undefined)
    expect(w.find('[data-testid="upload-m1"]').exists()).toBe(false)
  })

  it('lets the admin attach an existing organization to a manual reservation', async () => {
    vi.useFakeTimers()
    vi.mocked(reservationApi.create).mockResolvedValue(row({ reference: 'RSV-NEW001', organizationId: 'o9', organizationName: 'Existing Cement SC' }) as any)
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="new-reservation"]').trigger('click')
    await flushPromises()
    await w.find('[data-testid="org-search"]').setValue('cem')
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
    await w.find('[data-testid="org-option-o9"]').trigger('click')
    expect(w.find('[data-testid="org-selected"]').text()).toContain('Existing Cement SC')
    expect((w.find('[data-testid="create-company"]').element as HTMLInputElement).value).toBe('Existing Cement SC')
    expect((w.find('[data-testid="create-email"]').element as HTMLInputElement).value).toBe('info@cement.et')
    await w.find('[data-testid="create-package"]').setValue('p1')
    await w.find('[data-testid="create-contact"]').setValue('Dawit')
    await w.find('[data-testid="create-form"]').trigger('submit.prevent')
    await flushPromises()
    expect(reservationApi.create).toHaveBeenCalledWith(expect.objectContaining({ organizationId: 'o9', company: 'Existing Cement SC' }))
    vi.useRealTimers()
  })
})

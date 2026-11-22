import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ReservationStatusView from './ReservationStatusView.vue'
import { reservationApi } from '@/features/reservation/api/reservation.api'

vi.mock('@/features/reservation/api/reservation.api', async (orig) => {
  const actual = await orig<typeof import('@/features/reservation/api/reservation.api')>()
  return { ...actual, reservationApi: { status: vi.fn(), checkout: vi.fn() } }
})
const query: Record<string, string> = { email: 'sara@noah.et' }
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { reference: 'RSV-K7M2PX' }, query }), useRouter: () => ({ push: vi.fn() }) }))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const status = (o: Record<string, unknown> = {}) => ({
  reference: 'RSV-K7M2PX', packageName: 'Gold', company: 'Noah', contactName: 'Sara', amount: 900000, amountPaid: 0, outstanding: 900000,
  depositAmount: 270000, depositPercent: 30, depositPaid: false, currency: 'ETB', status: 'AGREEMENT_SENT', locale: 'en', boothCodes: ['B104'],
  checkoutAvailable: true, payments: [], bankAccounts: [{ bank: 'CBE', number: '1000314847467' }], payee: 'Dream Team Trading PLC', ...o
})
const mountView = () => mount(ReservationStatusView, { global: { plugins: [createPinia(), i18n], stubs: { LocaleSwitcher: true, RouterLink: { template: '<a><slot /></a>' } } } })

describe('ReservationStatusView', () => {
  beforeEach(() => {
    vi.mocked(reservationApi.status).mockReset()
    vi.mocked(reservationApi.checkout).mockReset()
    delete query.return
  })

  it('offers the deposit and sends the sponsor to Chapa', async () => {
    vi.mocked(reservationApi.status).mockResolvedValue(status() as any)
    vi.mocked(reservationApi.checkout).mockResolvedValue({ txRef: 'RSV-K7M2PX-D-AAAA', checkoutUrl: 'https://checkout.chapa.co/x', amount: 270000, currency: 'ETB', purpose: 'DEPOSIT' })
    const assign = vi.fn()
    Object.defineProperty(window, 'location', { value: { assign }, writable: true })
    const w = mountView()
    await flushPromises()
    expect(reservationApi.status).toHaveBeenCalledWith('RSV-K7M2PX', 'sara@noah.et', false)
    expect(w.find('[data-testid="pay-box"]').exists()).toBe(true)
    await w.find('[data-testid="pay-deposit"]').trigger('click')
    await flushPromises()
    expect(reservationApi.checkout).toHaveBeenCalledWith('RSV-K7M2PX', 'sara@noah.et', 'DEPOSIT', 'TELEBIRR')
    expect(assign).toHaveBeenCalledWith('https://checkout.chapa.co/x')
  })

  it('on return it refreshes and shows the deposit as paid with the balance offered', async () => {
    query.return = '1'
    vi.mocked(reservationApi.status).mockResolvedValue(status({ amountPaid: 270000, outstanding: 630000, depositPaid: true, status: 'DEPOSIT_PAID', payments: [{ txRef: 'RSV-K7M2PX-D-AAAA', purpose: 'DEPOSIT', amount: 270000, currency: 'ETB', status: 'PAID', checkoutUrl: null, method: 'telebirr', paidAt: '2026-11-22T10:00:00', createdAt: '2026-11-22T09:59:00' }] }) as any)
    const w = mountView()
    await flushPromises()
    expect(reservationApi.status).toHaveBeenCalledWith('RSV-K7M2PX', 'sara@noah.et', true)
    expect(w.find('[data-testid="return-banner"]').text()).toContain('reservation.paymentOk')
    expect(w.find('[data-testid="pay-deposit"]').exists()).toBe(false)
    expect(w.find('[data-testid="pay-balance"]').exists()).toBe(true)
  })
})

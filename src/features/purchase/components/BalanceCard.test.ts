import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import BalanceCard from './BalanceCard.vue'
import { purchaseApi } from '../api/purchase.api'
import type { PurchaseBalanceResponse } from '../api/purchase.types'

const query: Record<string, string> = {}
vi.mock('vue-router', () => ({ useRoute: () => ({ query }) }))
vi.mock('../api/purchase.api', () => ({
  purchaseApi: {
    getBalance: vi.fn(),
    payBalanceOnline: vi.fn(),
    confirmBalance: vi.fn(),
    reportBalanceTransfer: vi.fn(),
    reviewBalanceTransfer: vi.fn(),
    recordBalancePayment: vi.fn(),
    setBalanceSchedule: vi.fn(),
    balanceSlipPath: vi.fn(() => '/x')
  }
}))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en } })

const BALANCE: PurchaseBalanceResponse = {
  currency: 'ETB',
  listedPrice: 3_200_000,
  depositCredit: 32_000,
  loanAmount: 0,
  balanceDue: 3_168_000,
  paid: 0,
  inProgress: 0,
  remaining: 3_168_000,
  fullyPaid: false,
  payable: true,
  checkoutAvailable: true,
  paymentMethods: ['TELEBIRR', 'CBE_BIRR', 'MPESA', 'AWASH_BIRR', 'CARD'],
  bankAccount: { bankName: 'Commercial Bank of Ethiopia', accountName: 'Dream Teams Trading PLC', accountNumber: '1000123456789', branch: 'Bole' },
  transferReference: 'PPO-2026-1F99D681-BAL',
  instalments: [
    { id: 'i1', sequence: 1, label: 'On signing', amount: 1_168_000, dueDate: '2026-10-01', covered: 0, paid: false, overdue: false },
    { id: 'i2', sequence: 2, label: 'Handover', amount: 2_000_000, dueDate: '2027-01-01', covered: 0, paid: false, overdue: false }
  ],
  payments: [],
  fees: null
}

function mountCard(props: Record<string, unknown> = {}) {
  return mount(BalanceCard, { props: { orderId: 'o1', isBuyer: true, ...props }, global: { plugins: [i18n] } })
}

describe('BalanceCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    delete query.balance
    vi.mocked(purchaseApi.getBalance).mockResolvedValue(structuredClone(BALANCE))
  })

  it('shows what is left and suggests the next instalment', async () => {
    const w = mountCard()
    await flushPromises()
    expect(w.find('[data-testid="balance-due"]').text()).toContain('3,168,000')
    expect(w.text()).toContain('On signing')
    expect((w.find('[data-testid="balance-amount"]').element as HTMLInputElement).value).toBe('1168000')
    expect(w.text()).not.toContain('Cash')
  })

  it('pays part of the balance online with the chosen method', async () => {
    vi.mocked(purchaseApi.payBalanceOnline).mockResolvedValue({ checkoutUrl: 'https://checkout/x' } as any)
    const navigate = vi.fn()
    const w = mountCard({ navigate })
    await flushPromises()
    await w.find('[data-testid="balance-amount"]').setValue(150000)
    await w.find('[data-testid="deposit-method-TELEBIRR"] input').setValue(true)
    await w.find('[data-testid="balance-pay-online"]').trigger('click')
    await flushPromises()
    expect(purchaseApi.payBalanceOnline).toHaveBeenCalledWith('o1', 150000, 'TELEBIRR', 'BALANCE')
    expect(navigate).toHaveBeenCalledWith('https://checkout/x')
  })

  it('shows the bank account and sends a transfer with its receipt', async () => {
    vi.mocked(purchaseApi.reportBalanceTransfer).mockResolvedValue({ ...BALANCE, inProgress: 1_168_000 } as any)
    const w = mountCard()
    await flushPromises()
    await w.find('[data-testid="balance-tab-transfer"]').trigger('click')
    expect(w.find('[data-testid="bank-account"]').text()).toContain('1000123456789')
    expect(w.text()).toContain('PPO-2026-1F99D681-BAL')
    await w.find('[data-testid="transfer-reference"]').setValue('FT26092512')
    const slip = new File(['%PDF'], 'receipt.pdf', { type: 'application/pdf' })
    const input = w.find('[data-testid="transfer-slip"]')
    Object.defineProperty(input.element, 'files', { value: [slip] })
    await input.trigger('change')
    await w.find('[data-testid="transfer-submit"]').trigger('click')
    await flushPromises()
    expect(purchaseApi.reportBalanceTransfer).toHaveBeenCalledWith('o1', expect.objectContaining({ amount: 1168000, reference: 'FT26092512', slip }))
  })

  it('confirms online payments when coming back from Chapa', async () => {
    query.balance = 'return'
    vi.mocked(purchaseApi.confirmBalance).mockResolvedValue({
      ...BALANCE,
      paid: 150000,
      remaining: 3_018_000,
      payments: [{ id: 'p1', channel: 'ONLINE', status: 'PAID', amount: 150000, currency: 'ETB' } as any]
    })
    const w = mountCard()
    await flushPromises()
    expect(purchaseApi.confirmBalance).toHaveBeenCalledWith('o1')
    expect(w.text()).toContain('Payment received')
  })

  it('tells the buyer to wait for the seller before paying', async () => {
    vi.mocked(purchaseApi.getBalance).mockResolvedValue({ ...BALANCE, payable: false })
    const w = mountCard()
    await flushPromises()
    expect(w.find('[data-testid="balance-pay"]').exists()).toBe(false)
    expect(w.text()).toContain('once the seller accepts')
  })

  it('lets the seller confirm a transfer and set a schedule that adds up', async () => {
    vi.mocked(purchaseApi.getBalance).mockResolvedValue({
      ...BALANCE,
      inProgress: 1_168_000,
      payments: [{ id: 't1', channel: 'BANK_TRANSFER', status: 'SUBMITTED', amount: 1_168_000, currency: 'ETB', reference: 'FT1', hasSlip: true } as any]
    })
    vi.mocked(purchaseApi.reviewBalanceTransfer).mockResolvedValue({ ...BALANCE, paid: 1_168_000, remaining: 2_000_000 } as any)
    const w = mountCard({ isBuyer: false, isSeller: true })
    await flushPromises()
    await w.find('[data-testid="approve-t1"]').trigger('click')
    await flushPromises()
    expect(purchaseApi.reviewBalanceTransfer).toHaveBeenCalledWith('o1', 't1', true, undefined)
    expect(w.find('[data-testid="balance-remaining"]').text()).toContain('2,000,000')
  })

  it('keeps the schedule save disabled until the lines match the balance', async () => {
    const w = mountCard({ isBuyer: false, isSeller: true })
    await flushPromises()
    await w.find('[data-testid="open-schedule"]').trigger('click')
    expect(w.find('[data-testid="schedule-save"]').attributes('disabled')).toBeUndefined()
    await w.find('[data-testid="line-amount-0"]').setValue(1000)
    expect(w.find('[data-testid="schedule-save"]').attributes('disabled')).toBeDefined()
    expect(w.find('[data-testid="schedule-total"]').text()).toContain('2,001,000')
  })

  it('opens with the service fee and pays it with purpose FEES', async () => {
    vi.mocked(purchaseApi.getBalance).mockResolvedValue({
      ...structuredClone(BALANCE),
      fees: { markupPercent: 2, markupAmount: 64000, vatRate: 15, vatAmount: 489600, total: 553600, paid: 0, inProgress: 0, remaining: 553600, fullyPaid: false }
    })
    vi.mocked(purchaseApi.payBalanceOnline).mockResolvedValue({ checkoutUrl: 'https://checkout/f' } as any)
    const navigate = vi.fn()
    const w = mountCard({ navigate })
    await flushPromises()
    expect(w.find('[data-testid="fees-total"]').text()).toContain('553,600')
    expect((w.find('[data-testid="balance-amount"]').element as HTMLInputElement).value).toBe('553600')
    await w.find('[data-testid="deposit-method-CBE_BIRR"] input').setValue(true)
    await w.find('[data-testid="balance-pay-online"]').trigger('click')
    await flushPromises()
    expect(purchaseApi.payBalanceOnline).toHaveBeenCalledWith('o1', 553600, 'CBE_BIRR', 'FEES')

    await w.find('[data-testid="purpose-BALANCE"]').trigger('click')
    expect((w.find('[data-testid="balance-amount"]').element as HTMLInputElement).value).toBe('1168000')
  })
})

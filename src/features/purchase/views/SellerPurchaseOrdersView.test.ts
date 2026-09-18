import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import SellerPurchaseOrdersView from './SellerPurchaseOrdersView.vue'
import { purchaseApi } from '../api/purchase.api'

vi.mock('../api/purchase.api', () => ({
  purchaseApi: { received: vi.fn(), accept: vi.fn(), reject: vi.fn(), complete: vi.fn() }
}))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })

const order = (overrides: Record<string, unknown> = {}) => ({
  id: 'o1',
  orderNumber: 'PPO-2026-000001',
  status: 'PENDING_SELLER_REVIEW',
  purchaseType: 'CASH',
  property: { id: 'p1', title: 'Bole 3BR', city: 'Addis Ababa' },
  buyer: { id: 'u1', fullName: 'Abebe Kebede', contactPhone: '+251911223344', contactEmail: 'abebe@example.com' },
  pricing: { listedPrice: 8500000, currency: 'ETB' },
  financing: null,
  deposit: null,
  buyerMessage: 'Can I view on Saturday?',
  pendingSignatures: 0,
  createdAt: '2026-09-18T10:00:00',
  expiresAt: '2026-09-25T10:00:00',
  ...overrides
})
const pageOf = (content: unknown[]) => ({ content, totalElements: content.length, totalPages: 1, size: 50, number: 0, first: true, last: true })

function mountView() {
  return mount(SellerPurchaseOrdersView, {
    global: { plugins: [i18n], stubs: { RouterLink: { props: ['to'], template: '<a><slot /></a>' } } }
  })
}

describe('SellerPurchaseOrdersView', () => {
  beforeEach(() => {
    vi.mocked(purchaseApi.received).mockReset()
    vi.mocked(purchaseApi.received).mockImplementation(async (params: any) => {
      if (params?.size === 1) return pageOf([order()]) as any // the "needs review" counter
      return pageOf([order(), order({ id: 'o2', orderNumber: 'PPO-2026-000002', status: 'COMPLETED' })]) as any
    })
  })

  it('lists received orders with buyer contact, message and inline seller actions', async () => {
    const wrapper = mountView()
    await flushPromises()
    const cards = wrapper.findAll('[data-testid="order-card"]')
    expect(cards).toHaveLength(2)
    expect(cards[0].text()).toContain('Abebe Kebede')
    expect(cards[0].text()).toContain('+251911223344')
    expect(cards[0].text()).toContain('Can I view on Saturday?')
    expect(cards[0].find('[data-testid="accept"]').exists()).toBe(true)
    expect(cards[1].find('[data-testid="accept"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="pending-count"]').text()).toContain('purchase.seller.needsReview')
  })

  it('the review tab asks the API for PENDING_SELLER_REVIEW only', async () => {
    const wrapper = mountView()
    await flushPromises()
    await wrapper.find('[data-testid="filter-review"]').trigger('click')
    await flushPromises()
    expect(purchaseApi.received).toHaveBeenLastCalledWith({ status: 'PENDING_SELLER_REVIEW', page: 0, size: 50 })
  })

  it('the closed tab filters client-side across cancelled, rejected and expired', async () => {
    vi.mocked(purchaseApi.received).mockResolvedValue(
      pageOf([order({ status: 'REJECTED' }), order({ id: 'o3', status: 'EXPIRED' }), order({ id: 'o4', status: 'COMPLETED' })]) as any
    )
    const wrapper = mountView()
    await flushPromises()
    await wrapper.find('[data-testid="filter-closed"]').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('[data-testid="order-card"]')).toHaveLength(2)
  })

  it('swaps the card in place after an action', async () => {
    vi.mocked(purchaseApi.accept).mockResolvedValue(order({ status: 'AWAITING_PAYMENT' }) as any)
    const wrapper = mountView()
    await flushPromises()
    await wrapper.find('[data-testid="accept"]').trigger('click')
    await wrapper.find('[data-testid="accept-confirm"]').trigger('submit')
    await flushPromises()
    expect(wrapper.findAll('[data-testid="order-card"]')[0].text()).toContain('purchase.status.AWAITING_PAYMENT')
  })

  it('shows the empty state', async () => {
    vi.mocked(purchaseApi.received).mockResolvedValue(pageOf([]) as any)
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.text()).toContain('purchase.seller.empty')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import SellerOrderActions from './SellerOrderActions.vue'
import { purchaseApi } from '../api/purchase.api'

vi.mock('../api/purchase.api', () => ({
  purchaseApi: { accept: vi.fn(), reject: vi.fn(), complete: vi.fn() }
}))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })

const order = (overrides: Record<string, unknown> = {}) =>
  ({ id: 'o1', status: 'PENDING_SELLER_REVIEW', pendingSignatures: 0, deposit: null, ...overrides }) as any

function mountActions(o = order()) {
  return mount(SellerOrderActions, { props: { order: o }, global: { plugins: [i18n] } })
}

describe('SellerOrderActions', () => {
  beforeEach(() => {
    vi.mocked(purchaseApi.accept).mockReset()
    vi.mocked(purchaseApi.reject).mockReset()
    vi.mocked(purchaseApi.complete).mockReset()
  })

  it('accepts with an optional note and emits the updated order', async () => {
    vi.mocked(purchaseApi.accept).mockResolvedValue(order({ status: 'AWAITING_PAYMENT' }))
    const wrapper = mountActions()
    await wrapper.find('[data-testid="accept"]').trigger('click')
    await wrapper.find('textarea').setValue('Bring your ID')
    await wrapper.find('[data-testid="accept-confirm"]').trigger('submit')
    await flushPromises()

    expect(purchaseApi.accept).toHaveBeenCalledWith('o1', 'Bring your ID')
    expect(wrapper.emitted('updated')?.[0]?.[0]).toMatchObject({ status: 'AWAITING_PAYMENT' })
  })

  it('refuses to reject without a reason, then rejects with it', async () => {
    vi.mocked(purchaseApi.reject).mockResolvedValue(order({ status: 'REJECTED' }))
    const wrapper = mountActions()
    await wrapper.find('[data-testid="reject"]').trigger('click')
    await wrapper.find('form').trigger('submit')
    expect(purchaseApi.reject).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('purchase.seller.rejectReasonRequired')

    await wrapper.find('textarea').setValue('Sold elsewhere')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(purchaseApi.reject).toHaveBeenCalledWith('o1', 'Sold elsewhere')
    expect(wrapper.emitted('updated')?.[0]?.[0]).toMatchObject({ status: 'REJECTED' })
  })

  it('blocks completion while agreements are unsigned or the deposit is unpaid', async () => {
    const unsigned = mountActions(order({ status: 'AWAITING_PAYMENT', pendingSignatures: 1 }))
    expect(unsigned.find('[data-testid="blocked"]').text()).toContain('purchase.seller.blockedSignatures')
    expect(unsigned.find('[data-testid="complete"]').attributes('disabled')).toBeDefined()

    const unpaid = mountActions(order({ status: 'AWAITING_PAYMENT', deposit: { status: 'DUE' } }))
    expect(unpaid.find('[data-testid="blocked"]').text()).toContain('purchase.seller.blockedDeposit')
    expect(unpaid.find('[data-testid="complete"]').attributes('disabled')).toBeDefined()
  })

  it('completes with a payment reference once nothing blocks it', async () => {
    vi.mocked(purchaseApi.complete).mockResolvedValue(order({ status: 'COMPLETED' }))
    const wrapper = mountActions(order({ status: 'AWAITING_PAYMENT', deposit: { status: 'PAID' } }))
    expect(wrapper.find('[data-testid="blocked"]').exists()).toBe(false)
    await wrapper.find('[data-testid="complete"]').trigger('click')
    await wrapper.find('input').setValue('CBE-12345')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(purchaseApi.complete).toHaveBeenCalledWith('o1', 'CBE-12345')
    expect(wrapper.emitted('updated')?.[0]?.[0]).toMatchObject({ status: 'COMPLETED' })
  })

  it('shows the server message when an action fails and keeps the form open', async () => {
    vi.mocked(purchaseApi.accept).mockRejectedValue({ response: { data: { message: 'Property already reserved' } } })
    const wrapper = mountActions()
    await wrapper.find('[data-testid="accept"]').trigger('click')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Property already reserved')
    expect(wrapper.find('[data-testid="accept-confirm"]').exists()).toBe(true)
    expect(wrapper.emitted('updated')).toBeUndefined()
  })

  it('renders nothing actionable for statuses the seller cannot act on', () => {
    const wrapper = mountActions(order({ status: 'AWAITING_FINANCING' }))
    expect(wrapper.find('button').exists()).toBe(false)
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { purchaseApi } from '../api/purchase.api'
import type { PurchaseDepositResponse } from '../api/purchase.types'
import { isDepositReturn, outcomeFor, useDepositCheckout } from './useDepositCheckout'

vi.mock('../api/purchase.api', () => ({
  purchaseApi: { startDepositCheckout: vi.fn(), confirmDeposit: vi.fn() }
}))

const deposit = (status: PurchaseDepositResponse['status']): PurchaseDepositResponse => ({
  amount: 85000, currency: 'ETB', status, dueAt: null, provider: 'CHAPA', txRef: 'PPO-1-DEP1-X', checkoutUrl: null,
  providerReference: null, paymentMethod: null, paidAt: null, failureReason: null, attempts: 1,
  termsPending: false, checkoutAvailable: true, refundReference: null, refundedAt: null, waiveReason: null
})

describe('useDepositCheckout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends the buyer to the provider checkout URL', async () => {
    vi.mocked(purchaseApi.startDepositCheckout).mockResolvedValue({ checkoutUrl: 'https://checkout.chapa.co/x', txRef: 't', amount: 85000, currency: 'ETB', provider: 'CHAPA' })
    const navigate = vi.fn()
    const c = useDepositCheckout(ref('order-1'), navigate)
    await c.pay()
    expect(purchaseApi.startDepositCheckout).toHaveBeenCalledWith('order-1', undefined)
    expect(navigate).toHaveBeenCalledWith('https://checkout.chapa.co/x')
    expect(c.error.value).toBeNull()
  })

  it('surfaces the server message when checkout cannot start', async () => {
    vi.mocked(purchaseApi.startDepositCheckout).mockRejectedValue({ response: { data: { message: 'sign the terms first' } } })
    const navigate = vi.fn()
    const c = useDepositCheckout(ref('order-1'), navigate)
    await c.pay()
    expect(navigate).not.toHaveBeenCalled()
    expect(c.error.value).toBe('sign the terms first')
  })

  it('confirms on return and maps the outcome', async () => {
    vi.mocked(purchaseApi.confirmDeposit).mockResolvedValue(deposit('PAID'))
    const c = useDepositCheckout(ref('order-1'), vi.fn())
    const d = await c.confirmOnReturn()
    expect(d?.status).toBe('PAID')
    expect(c.outcome.value).toBe('paid')
    expect(outcomeFor(deposit('FAILED'))).toBe('failed')
    expect(outcomeFor(deposit('PENDING'))).toBe('pending')
    expect(outcomeFor(deposit('DUE'))).toBeNull()
  })

  it('recognises the provider return query', () => {
    expect(isDepositReturn({ deposit: 'return' })).toBe(true)
    expect(isDepositReturn({ created: '1' })).toBe(false)
  })
})

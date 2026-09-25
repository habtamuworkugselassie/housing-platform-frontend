/**
 * Pay-the-deposit flow for the order details page.
 *
 * The buyer is sent to the provider's hosted checkout (Chapa) in the same tab; the provider
 * redirects back to the order page with `?deposit=return`, where `confirmOnReturn` asks the
 * server to verify the transaction. Card data never touches this app.
 */
import { computed, ref, type Ref } from 'vue'
import type { LocationQuery } from 'vue-router'
import { purchaseApi } from '../api/purchase.api'
import type { DepositPaymentMethod, PurchaseDepositResponse } from '../api/purchase.types'

export type DepositOutcome = 'paid' | 'failed' | 'pending' | null

export function isDepositReturn(query: LocationQuery): boolean {
  return query.deposit === 'return'
}

export function outcomeFor(deposit: PurchaseDepositResponse | null | undefined): DepositOutcome {
  if (!deposit) return null
  if (deposit.status === 'PAID') return 'paid'
  if (deposit.status === 'FAILED') return 'failed'
  if (deposit.status === 'PENDING') return 'pending'
  return null
}

export function useDepositCheckout(orderId: Ref<string>, navigate: (url: string) => void = (url) => window.location.assign(url)) {
  const starting = ref(false)
  const confirming = ref(false)
  const error = ref<string | null>(null)
  const outcome = ref<DepositOutcome>(null)

  const busy = computed(() => starting.value || confirming.value)

  /** {@code method} replaces the one picked when the order was placed (a pending checkout resumes). */
  async function pay(method?: DepositPaymentMethod | null) {
    starting.value = true
    error.value = null
    try {
      const checkout = await purchaseApi.startDepositCheckout(orderId.value, method)
      navigate(checkout.checkoutUrl)
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'purchase.deposit.errors.startFailed'
    } finally {
      starting.value = false
    }
  }

  /** Returns the refreshed deposit so the caller can merge it into the order. */
  async function confirmOnReturn(): Promise<PurchaseDepositResponse | null> {
    confirming.value = true
    error.value = null
    try {
      const deposit = await purchaseApi.confirmDeposit(orderId.value)
      outcome.value = outcomeFor(deposit)
      return deposit
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'purchase.deposit.errors.confirmFailed'
      return null
    } finally {
      confirming.value = false
    }
  }

  return { starting, confirming, busy, error, outcome, pay, confirmOnReturn }
}

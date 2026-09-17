import { describe, expect, it } from 'vitest'
import type { FinancingOption } from '../api/purchase.types'
import { computeSplit, monthlyInstallment, validateFinancedAmount, validateTenure } from './financing'

export const OFFER: FinancingOption = {
  financingOfferId: 'offer-1',
  bankId: 'bank-1',
  bankName: 'Awash Bank',
  creditProductId: 'product-1',
  creditProductName: 'Home Purchase Loan',
  offerLevel: 'PROPERTY',
  interestRate: 14.5,
  ltvRatio: 0.8,
  minTenureMonths: 12,
  maxTenureMonths: 240,
  minFinanceableAmount: 500_000,
  maxFinanceableAmount: 6_800_000,
  minimumDownPayment: 1_700_000,
  partialFinancingAllowed: true,
  recommended: true
}
const PRICE = 8_500_000

describe('monthlyInstallment', () => {
  it('matches the backend amortisation figures', () => {
    expect(monthlyInstallment(6_800_000, 14.5, 240)).toBe(87039.85)
    expect(monthlyInstallment(4_250_000, 14.5, 180)).toBe(58033.79)
  })
  it('degenerates to straight-line at zero rate and to 0 for empty input', () => {
    expect(monthlyInstallment(1_200_000, 0, 120)).toBe(10000)
    expect(monthlyInstallment(0, 14.5, 120)).toBe(0)
    expect(monthlyInstallment(1000, 14.5, 0)).toBe(0)
  })
})

describe('computeSplit', () => {
  it('classifies the maximum as MAXIMUM mode', () => {
    const s = computeSplit(OFFER, PRICE, 6_800_000, 240)
    expect(s).toMatchObject({ mode: 'MAXIMUM', financedAmount: 6_800_000, cashPortion: 1_700_000, coverageRatio: 0.8, tenureMonths: 240 })
  })
  it('classifies anything below the maximum as PARTIAL', () => {
    const s = computeSplit(OFFER, PRICE, 4_250_000, 180)
    expect(s).toMatchObject({ mode: 'PARTIAL', cashPortion: 4_250_000, coverageRatio: 0.5, installment: 58033.79 })
  })
  it('clamps amount and tenure into the offer range', () => {
    expect(computeSplit(OFFER, PRICE, 9_000_000, 240).financedAmount).toBe(6_800_000)
    expect(computeSplit(OFFER, PRICE, 100, 240).financedAmount).toBe(500_000)
    expect(computeSplit(OFFER, PRICE, 4_000_000, 600).tenureMonths).toBe(240)
    expect(computeSplit(OFFER, PRICE, 4_000_000, 1).tenureMonths).toBe(12)
  })
})

describe('validation', () => {
  it('reports the range violations the server would', () => {
    expect(validateFinancedAmount(OFFER, 300_000)).toBe('purchase.errors.financedAmountBelowMin')
    expect(validateFinancedAmount(OFFER, 7_000_000)).toBe('purchase.errors.financedAmountAboveMax')
    expect(validateFinancedAmount(OFFER, NaN)).toBe('purchase.errors.financedAmountRequired')
    expect(validateFinancedAmount(OFFER, 4_250_000)).toBeNull()
    expect(validateTenure(OFFER, 6)).toBe('purchase.errors.tenureOutOfRange')
    expect(validateTenure(OFFER, 12.5)).toBe('purchase.errors.tenureRequired')
    expect(validateTenure(OFFER, 180)).toBeNull()
  })
})

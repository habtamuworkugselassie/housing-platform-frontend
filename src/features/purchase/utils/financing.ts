/**
 * Client-side financing maths for live previews while the buyer moves the slider. The backend
 * recomputes and stores the authoritative figures; these only have to agree with it.
 */
import type { FinancingOption } from '../api/purchase.types'

/** Standard amortised instalment; a zero rate degenerates to principal / months. */
export function monthlyInstallment(principal: number, annualRatePercent: number, months: number): number {
  if (!principal || months <= 0) return 0
  if (!annualRatePercent) return round2(principal / months)
  const i = annualRatePercent / 100 / 12
  const factor = Math.pow(1 + i, months)
  return round2((principal * i) / (1 - 1 / factor))
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function clampFinancedAmount(option: FinancingOption, wanted: number): number {
  return Math.min(option.maxFinanceableAmount, Math.max(option.minFinanceableAmount, wanted))
}

export interface FinancingSplit {
  financedAmount: number
  cashPortion: number
  coverageRatio: number
  tenureMonths: number
  installment: number
  mode: 'MAXIMUM' | 'PARTIAL'
}

export function computeSplit(
  option: FinancingOption,
  listedPrice: number,
  financedAmount: number,
  tenureMonths: number
): FinancingSplit {
  const financed = round2(clampFinancedAmount(option, financedAmount))
  const tenure = Math.min(option.maxTenureMonths, Math.max(option.minTenureMonths, tenureMonths))
  return {
    financedAmount: financed,
    cashPortion: round2(listedPrice - financed),
    coverageRatio: listedPrice ? Math.round((financed / listedPrice) * 10000) / 10000 : 0,
    tenureMonths: tenure,
    installment: monthlyInstallment(financed, option.interestRate, tenure),
    mode: financed >= option.maxFinanceableAmount ? 'MAXIMUM' : 'PARTIAL'
  }
}

/** Validation the server will also apply; returns an i18n key or null. */
export function validateFinancedAmount(option: FinancingOption, financedAmount: number): string | null {
  if (!Number.isFinite(financedAmount) || financedAmount <= 0) return 'purchase.errors.financedAmountRequired'
  if (financedAmount < option.minFinanceableAmount) return 'purchase.errors.financedAmountBelowMin'
  if (financedAmount > option.maxFinanceableAmount) return 'purchase.errors.financedAmountAboveMax'
  return null
}

export function validateTenure(option: FinancingOption, tenureMonths: number): string | null {
  if (!Number.isInteger(tenureMonths)) return 'purchase.errors.tenureRequired'
  if (tenureMonths < option.minTenureMonths || tenureMonths > option.maxTenureMonths) {
    return 'purchase.errors.tenureOutOfRange'
  }
  return null
}

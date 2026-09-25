/**
 * Purchase Order API Types — mirror of the backend `purchase` module DTOs.
 */
import type { Currency } from '@/shared/types'

export type PurchaseType = 'CASH' | 'BANK_FINANCED'

export type PurchaseOrderStatus =
  | 'PENDING_SELLER_REVIEW'
  | 'AWAITING_FINANCING'
  | 'FINANCING_APPROVED'
  | 'FINANCING_PARTIALLY_APPROVED'
  | 'FINANCING_REJECTED'
  | 'AWAITING_PAYMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED'

export type FinancingMode = 'MAXIMUM' | 'PARTIAL'
export type OfferLevel = 'PROPERTY' | 'BUILDING'
export type FinancingStatus =
  | 'APPLICATION_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'WITHDRAWN'

export type AgreementType =
  | 'PROMISE_TO_PURCHASE'
  | 'SALE_AGREEMENT'
  | 'FINANCING_ACKNOWLEDGEMENT'
  | 'HANDOVER_AGREEMENT'
  | 'OTHER'

export type AgreementStatus =
  | 'PENDING_BUYER_SIGNATURE'
  | 'PENDING_PROVIDER_SIGNATURE'
  | 'FULLY_SIGNED'
  | 'VOID'

export interface FinancingOption {
  financingOfferId: string
  bankId: string
  bankName: string | null
  creditProductId: string
  creditProductName: string | null
  offerLevel: OfferLevel
  interestRate: number
  ltvRatio: number
  minTenureMonths: number
  maxTenureMonths: number
  minFinanceableAmount: number
  maxFinanceableAmount: number
  minimumDownPayment: number
  partialFinancingAllowed: boolean
  recommended: boolean
}

export interface AgreementPreview {
  templateId: string
  type: AgreementType
  version: number
  title: string
  /** Rendered Markdown. */
  content: string
}

/** How the buyer pays the reservation deposit; each steers Chapa's hosted checkout. */
export type DepositPaymentMethod = 'TELEBIRR' | 'CBE_BIRR' | 'MPESA' | 'AWASH_BIRR' | 'CARD'

export interface DepositQuote {
  amount: number
  currency: Currency
  /** False when online checkout is not configured on the server. */
  checkoutAvailable: boolean
  paymentMethods: DepositPaymentMethod[]
}

export interface PurchasePreviewResponse {
  propertyId: string
  listedPrice: number
  currency: Currency
  purchaseType: PurchaseType
  financingAvailable: boolean
  financingOffers: FinancingOption[]
  agreementsToSign: AgreementPreview[]
  /** The reservation deposit paid when placing the order; null when deposits are disabled. */
  deposit?: DepositQuote | null
}

export interface AgreementSignatureRequest {
  templateId: string
  accepted: boolean
  signatoryFullName: string
}

export interface FinancingSelection {
  financingOfferId?: string
  financedAmount?: number
  downPaymentAmount?: number
  requestedTenureMonths?: number
}

export interface CreatePurchaseOrderRequest {
  propertyId: string
  contactPhone: string
  contactEmail?: string
  currency?: Currency
  buyerMessage?: string
  /** null = automatic, false = cash even if financing exists, true = financing required. */
  useFinancing?: boolean | null
  financing?: FinancingSelection
  promiseToPurchase: AgreementSignatureRequest
  /** Signs the Reservation Deposit Terms with the order so the deposit can be paid right away. */
  depositTerms?: AgreementSignatureRequest
  depositPaymentMethod?: DepositPaymentMethod
}

export interface UpdatePurchaseFinancingRequest {
  financedAmount?: number
  downPaymentAmount?: number
  requestedTenureMonths?: number
}

export interface PurchaseAgreementResponse {
  id: string
  purchaseOrderId: string
  templateId: string
  type: AgreementType
  templateVersion: number
  sequence: number
  title: string
  content: string | null
  contentHash: string
  status: AgreementStatus
  blocksCompletion: boolean
  issuedAt: string
  buyerSignatoryName: string | null
  buyerSignatureMethod: string | null
  buyerSignedAt: string | null
  providerName: string
  providerSignatoryName: string | null
  providerSignatoryTitle: string | null
  providerSignedAt: string | null
  voidedAt: string | null
  voidReason: string | null
}

export interface FinancingDetails {
  financingStatus: FinancingStatus
  financingOfferId: string
  offerLevel: OfferLevel
  bankId: string
  bankName: string | null
  creditProductId: string
  creditProductName: string | null
  appliedInterestRate: number
  appliedLtvRatio: number
  minFinanceableAmount: number
  maxFinanceableAmount: number
  financingMode: FinancingMode
  financedAmount: number
  cashPortionAmount: number
  financingCoverageRatio: number
  tenureMonths: number
  estimatedMonthlyInstallment: number | null
  loanApplicationId: string | null
  approvedAmount: number | null
  approvedInterestRate: number | null
  approvedTenureMonths: number | null
  proposedCashPortionAmount: number | null
  nextSteps: string[]
}

export type DepositStatus =
  | 'DUE'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'WAIVED'
  | 'REFUND_PENDING'
  | 'REFUNDED'

/** Reservation deposit owed to the provider after seller acceptance. */
export interface PurchaseDepositResponse {
  amount: number
  currency: Currency
  status: DepositStatus
  dueAt: string | null
  provider: string
  txRef: string | null
  checkoutUrl: string | null
  providerReference: string | null
  paymentMethod: string | null
  /** The method the buyer picked on our side. */
  preferredMethod?: DepositPaymentMethod | null
  paidAt: string | null
  failureReason: string | null
  attempts: number
  termsPending: boolean
  checkoutAvailable: boolean
  refundReference: string | null
  refundedAt: string | null
  waiveReason: string | null
}

export interface DepositCheckoutResponse {
  checkoutUrl: string
  txRef: string
  amount: number
  currency: Currency
  provider: string
}

export interface PurchaseOrderResponse {
  id: string
  orderNumber: string
  status: PurchaseOrderStatus
  purchaseType: PurchaseType
  property: {
    id: string
    title: string | null
    city: string | null
    unitNumber: string | null
    realEstateCompanyId: string | null
    realEstateCompanyName: string | null
    agentId: string | null
  }
  buyer: { id: string; fullName: string | null; contactPhone: string; contactEmail: string | null }
  pricing: { listedPrice: number; currency: Currency }
  financing: FinancingDetails | null
  buyerMessage: string | null
  expiresAt: string | null
  cancellationReason: string | null
  rejectionReason: string | null
  paymentReference: string | null
  warnings: string[]
  agreements: PurchaseAgreementResponse[]
  pendingSignatures: number
  deposit: PurchaseDepositResponse | null
  createdAt: string
  updatedAt: string
  statusHistory: Array<{
    fromStatus: PurchaseOrderStatus | null
    toStatus: PurchaseOrderStatus
    changedBy: string | null
    changedAt: string
    notes: string | null
  }>
}

// ---- admin

export interface AdminPurchaseOrderFilter {
  status?: PurchaseOrderStatus | ''
  purchaseType?: PurchaseType | ''
  realEstateCompanyId?: string
  bankId?: string
  buyerId?: string
  /** Substring of the order number, contact phone or contact email. */
  q?: string
  /** ISO dates (YYYY-MM-DD); from inclusive, to inclusive of that day. */
  createdFrom?: string
  createdTo?: string
}

export interface PurchaseOrderStatsResponse {
  total: number
  open: number
  byStatus: Record<PurchaseOrderStatus, number>
}

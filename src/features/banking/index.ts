/**
 * Banking Feature Module
 */
export { bankingApi } from './api/banking.api'
export type {
  CreditProductRequest,
  CreditProductResponse,
  FinancingOfferRequest,
  FinancingOfferResponse
} from './api/banking.types'

// Views
export { default as BankingDashboardView } from './views/BankingDashboardView.vue'
export { default as CreditProductsView } from './views/CreditProductsView.vue'
export { default as FinancingOffersView } from './views/FinancingOffersView.vue'
export { default as BankLoanApplicationsView } from './views/BankLoanApplicationsView.vue'

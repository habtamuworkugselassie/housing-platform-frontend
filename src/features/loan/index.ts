/**
 * Loan Feature Module
 */
export { loanApi } from './api/loan.api'
export type {
  LoanApplicationRequest,
  LoanApplicationResponse,
  LoanApprovalRequest
} from './api/loan.types'

// Views
export { default as LoanApplicationsView } from './views/LoanApplicationsView.vue'
export { default as LoanApplicationDetailsView } from './views/LoanApplicationDetailsView.vue'

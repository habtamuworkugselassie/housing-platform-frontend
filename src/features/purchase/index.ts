/**
 * Purchase Feature Module
 *
 * Property purchase orders with optional (partial) bank financing and the buyer–provider
 * agreements signed along the way.
 */
export { purchaseApi } from './api/purchase.api'
export type * from './api/purchase.types'
export { usePurchaseOrderFormStore } from './stores/purchaseOrderForm'
export { normalizePhone, isValidPhone, isValidEmail } from './utils/phone'

export { default as PurchaseOrderCreateView } from './views/PurchaseOrderCreateView.vue'
export { default as PurchaseOrderDetailsView } from './views/PurchaseOrderDetailsView.vue'
export { default as PurchaseOrdersView } from './views/PurchaseOrdersView.vue'

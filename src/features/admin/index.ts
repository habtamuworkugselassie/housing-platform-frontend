/**
 * Admin Feature Module
 */
export { default as SponsorshipsView } from './views/SponsorshipsView.vue'
export { default as AdminSponsorshipsView } from './views/AdminSponsorshipsView.vue'
export { default as AdminDashboardView } from './views/AdminDashboardView.vue'
export { default as AdminUsersView } from './views/AdminUsersView.vue'
export { default as AdminOrganizationsView } from './views/AdminOrganizationsView.vue'
export { default as AdminLayout } from './components/AdminLayout.vue'

export * from './api/admin.api'
export * from './api/admin.types'
export * from './composables/useAdmin'

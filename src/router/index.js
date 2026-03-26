import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/features/exhibition/views/ExhibitionLandingView.vue')
  },
  {
    path: '/real-estate',
    name: 'RealEstateSearch',
    component: () => import('@/features/property/views/HomeView.vue')
  },
  // Marketplace: real estate = current home/property search; others = organization list by type
  {
    path: '/marketplace/real-estate',
    name: 'MarketplaceRealEstate',
    component: () => import('@/features/property/views/HomeView.vue')
  },
  {
    path: '/marketplace/banks',
    name: 'MarketplaceBanks',
    component: () => import('@/features/marketplace/views/MarketplaceOrganizationsView.vue')
  },
  {
    path: '/marketplace/insurance',
    name: 'MarketplaceInsurance',
    component: () => import('@/features/marketplace/views/MarketplaceOrganizationsView.vue')
  },
  {
    path: '/marketplace/contractors',
    name: 'MarketplaceContractors',
    component: () => import('@/features/marketplace/views/MarketplaceOrganizationsView.vue')
  },
  {
    path: '/marketplace/consultants-and-architects',
    name: 'MarketplaceConsultantsArchitects',
    component: () => import('@/features/marketplace/views/MarketplaceOrganizationsView.vue')
  },
  {
    path: '/marketplace/suppliers',
    name: 'MarketplaceSuppliers',
    component: () => import('@/features/marketplace/views/MarketplaceOrganizationsView.vue')
  },
  {
    path: '/marketplace/finishing-work',
    name: 'MarketplaceFinishingWork',
    component: () => import('@/features/marketplace/views/MarketplaceOrganizationsView.vue')
  },
  {
    path: '/organizations/:id',
    name: 'OrganizationDetail',
    component: () => import('@/features/marketplace/views/OrganizationDetailView.vue')
  },
  {
    path: '/properties',
    name: 'Properties',
    component: () => import('@/features/property/views/PropertiesView.vue')
  },
  {
    path: '/properties/:id',
    name: 'PropertyDetails',
    component: () => import('@/features/property/views/PropertyDetailsView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/features/auth/views/RegisterView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/features/auth/views/LoginView.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/features/auth/views/ForgotPasswordView.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/features/auth/views/ResetPasswordView.vue')
  },
  {
    path: '/register-company',
    name: 'RegisterCompany',
    component: () => import('@/features/identity/views/RegisterCompanyView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/register-agent',
    name: 'RegisterAgent',
    component: () => import('@/features/identity/views/RegisterAgentView.vue'),
    meta: { requiresAuth: true, requiresRealtor: true }
  },
  {
    path: '/create-agent',
    name: 'CreateAgent',
    component: () => import('@/features/identity/views/CreateAgentView.vue'),
    meta: { requiresAuth: true, requiresRealtor: true }
  },
  {
    path: '/submit-property',
    name: 'SubmitProperty',
    component: () => import('@/features/property/views/SubmitPropertyView.vue'),
    meta: { requiresAuth: true, requiresRealtor: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/features/dashboard/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/features/identity/views/UserProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sponsorships',
    name: 'Sponsorships',
    component: () => import('@/features/admin/views/SponsorshipsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Admin Portal Routes
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/features/admin/views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/features/admin/views/AdminUsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/organizations',
    name: 'AdminOrganizations',
    component: () => import('@/features/admin/views/AdminOrganizationsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/properties',
    name: 'AdminProperties',
    component: () => import('@/features/admin/views/AdminPropertiesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/buildings',
    name: 'AdminBuildings',
    component: () => import('@/features/admin/views/AdminBuildingsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/construction',
    name: 'AdminConstruction',
    component: () => import('@/features/admin/views/AdminConstructionView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/banking',
    name: 'AdminBanking',
    component: () => import('@/features/admin/views/AdminBankingView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/loans',
    name: 'AdminLoans',
    component: () => import('@/features/admin/views/AdminLoansView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/sponsorships',
    name: 'AdminSponsorships',
    component: () => import('@/features/admin/views/AdminSponsorshipsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/exhibition-interests',
    name: 'AdminExhibitionInterests',
    component: () => import('@/features/admin/views/AdminExhibitionInterestsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/settings',
    name: 'AdminDisplaySettings',
    component: () => import('@/features/admin/views/AdminDisplaySettingsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/banking/dashboard',
    name: 'BankingDashboard',
    component: () => import('@/features/banking/views/BankingDashboardView.vue'),
    meta: { requiresAuth: true, requiresBanker: true }
  },
  {
    path: '/banking/:bankId/credit-products',
    name: 'CreditProducts',
    component: () => import('@/features/banking/views/CreditProductsView.vue'),
    meta: { requiresAuth: true, requiresBanker: true }
  },
  {
    path: '/banking/:bankId/financing-offers',
    name: 'FinancingOffers',
    component: () => import('@/features/banking/views/FinancingOffersView.vue'),
    meta: { requiresAuth: true, requiresBanker: true }
  },
  {
    path: '/loan-applications',
    name: 'LoanApplications',
    component: () => import('@/features/loan/views/LoanApplicationsView.vue'),
    meta: { requiresAuth: true, requiresBuyer: true }
  },
  {
    path: '/loan-applications/:id',
    name: 'LoanApplicationDetails',
    component: () => import('@/features/loan/views/LoanApplicationDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/banking/loan-applications',
    name: 'BankLoanApplications',
    component: () => import('@/features/banking/views/BankLoanApplicationsView.vue'),
    meta: { requiresAuth: true, requiresBanker: true }
  },
  {
    path: '/buildings',
    name: 'Buildings',
    component: () => import('@/features/property/views/BuildingsView.vue')
  },
  {
    path: '/buildings/:id',
    name: 'BuildingDetails',
    component: () => import('@/features/property/views/BuildingDetailsView.vue')
  },
  {
    path: '/construction/dashboard',
    name: 'ConstructionDashboard',
    component: () => import('@/features/construction/views/ConstructionDashboardView.vue'),
    meta: { requiresAuth: true, requiresRealtor: true }
  },
  {
    path: '/construction/projects',
    name: 'ConstructionProjects',
    component: () => import('@/features/construction/views/ConstructionProjectsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/construction/projects/:id',
    name: 'ConstructionProjectDetails',
    component: () => import('@/features/construction/views/ConstructionProjectDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/construction/orders',
    name: 'MaterialOrders',
    component: () => import('@/features/construction/views/MaterialOrdersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/construction/orders/:id',
    name: 'MaterialOrderDetails',
    component: () => import('@/features/construction/views/MaterialOrdersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/construction/inventory',
    name: 'MaterialInventory',
    component: () => import('@/features/construction/views/MaterialInventoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/construction/usage',
    name: 'MaterialUsage',
    component: () => import('@/features/construction/views/MaterialUsageView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/supplier/dashboard',
    name: 'SupplierDashboard',
    component: () => import('@/features/construction/views/SupplierDashboardView.vue'),
    meta: { requiresAuth: true, requiresSupplier: true }
  },
  {
    path: '/exhibition',
    name: 'ExhibitionLanding',
    component: () => import('@/features/exhibition/views/ExhibitionLandingView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, _savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

const defaultSeo = {
  title: 'Ethio Build Connect - Ethiopia Real Estate and Construction Marketplace',
  description:
    'Find Addis Ababa real estate, betoch, apartments, developers, contractors, and suppliers in one Ethiopia marketplace.'
}

const seoByRouteName = {
  Home: {
    title: 'Ethio Build Connect - Addis Ababa Real Estate, Betoch and Construction',
    description:
      'Search Addis Ababa real estate, betoch for sale or rent, and trusted construction companies in Ethiopia.'
  },
  RealEstateSearch: {
    title: 'Addis Ababa Real Estate Listings - Ethio Build Connect',
    description:
      'Browse Ethiopia property listings including houses, apartments, and betoch in Addis Ababa.'
  },
  MarketplaceRealEstate: {
    title: 'Ethiopia Real Estate Marketplace - Ethio Build Connect',
    description:
      'Discover verified real estate opportunities, developers, and agents across Ethiopia.'
  },
  MarketplaceContractors: {
    title: 'Construction Contractors in Ethiopia - Ethio Build Connect',
    description:
      'Find construction contractors and project partners for residential and commercial development.'
  },
  MarketplaceSuppliers: {
    title: 'Construction Material Suppliers in Ethiopia - Ethio Build Connect',
    description:
      'Connect with trusted construction suppliers and material partners in Addis Ababa and beyond.'
  },
  Properties: {
    title: 'Property Listings Ethiopia - Houses, Betoch and Apartments',
    description:
      'Explore verified property listings in Ethiopia, including Addis Ababa houses and apartments.'
  },
  PropertyDetails: {
    title: 'Property Details - Ethio Build Connect',
    description:
      'View complete property information, media, and location insights on Ethio Build Connect.'
  }
}

const ensureMetaTag = (name, attr = 'name') => {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  return tag
}

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresRealtor && !authStore.hasRole('REALTOR')) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresAdmin && !authStore.hasRole('ADMIN')) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresBanker && !authStore.hasRole('BANKER')) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresBuyer && !authStore.hasRole('BUYER')) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresSupplier && !authStore.hasRole('SUPPLIER')) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

router.afterEach((to) => {
  const seo = seoByRouteName[to.name] || defaultSeo
  document.title = seo.title

  const descriptionTag = ensureMetaTag('description')
  descriptionTag.setAttribute('content', seo.description)

  const ogTitleTag = ensureMetaTag('og:title', 'property')
  ogTitleTag.setAttribute('content', seo.title)

  const ogDescriptionTag = ensureMetaTag('og:description', 'property')
  ogDescriptionTag.setAttribute('content', seo.description)
})

export default router

<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Material Design App Bar -->
    <div class="mdc-top-app-bar">
      <span class="material-icons">dashboard</span>
      <span class="mdc-top-app-bar__title">{{ $t('nav.dashboard') }}</span>
    </div>

    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p class="mt-4 mdc-typography--body1 text-gray-400">{{ $t('dashboard.loadingDashboard') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mdc-card mb-6 bg-red-900/30 border border-red-500/30 rounded-lg p-4">
        <div class="flex items-center">
          <span class="material-icons text-red-400 mr-2">error</span>
          <div class="mdc-typography--body1 text-red-200">{{ error }}</div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- User Info Cards -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <!-- Account Card -->
          <div class="mdc-card">
            <div class="flex items-center mb-4">
              <span class="material-icons text-blue-600 mr-2">account_circle</span>
              <h2 class="mdc-typography--headline6 m-0">{{ $t('dashboard.yourAccount') }}</h2>
            </div>
            <dl class="space-y-3">
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.nameLabel') }}:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</dd>
              </div>
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.emailLabel') }}:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ authStore.user?.email }}</dd>
              </div>
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.rolesLabel') }}:</dt>
                <dd class="mdc-typography--body1">
                  <span v-for="role in authStore.user?.roles" :key="role" class="mdc-chip mdc-chip--primary mr-1">
                    {{ role }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Agent Info Card -->
          <div v-if="agent" class="mdc-card">
            <div class="flex items-center mb-4">
              <span class="material-icons text-green-600 mr-2">badge</span>
              <h2 class="mdc-typography--headline6 m-0">{{ $t('dashboard.agentProfile') }}</h2>
            </div>
            <dl class="space-y-3">
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.statusLabel') }}:</dt>
                <dd class="mdc-typography--body1">
                  <span :class="{
                    'mdc-chip mdc-chip--success': agent.status === 'ACTIVE',
                    'mdc-chip': agent.status === 'INACTIVE',
                    'mdc-chip mdc-chip--error': agent.status === 'SUSPENDED'
                  }">
                    {{ agent.status }}
                  </span>
                </dd>
              </div>
              <div v-if="agent.licenseNumber" class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.licenseLabel') }}:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ agent.licenseNumber }}</dd>
              </div>
              <div v-if="agent.isSuperAgent" class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.roleLabel') }}:</dt>
                <dd class="mdc-chip mdc-chip--primary">{{ $t('dashboard.superAgent') }}</dd>
              </div>
            </dl>
          </div>

          <!-- Company Info Card -->
          <div v-if="organization" class="mdc-card">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center">
                <span class="material-icons text-purple-600 mr-2">business</span>
                <h2 class="mdc-typography--headline6 m-0">{{ $t('dashboard.yourCompany') }}</h2>
              </div>
              <button
                v-if="isSuperAgent"
                @click="openEditOrganizationModal"
                class="mdc-button mdc-button--text"
              >
                <span class="material-icons mr-1" style="font-size: 18px;">edit</span>
                {{ $t('common.edit') }}
              </button>
            </div>
            <dl class="space-y-3">
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.nameLabel') }}:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ organization.name }}</dd>
              </div>
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.statusLabel') }}:</dt>
                <dd class="mdc-typography--body1">
                  <span :class="{
                    'mdc-chip mdc-chip--warning': organization.status === 'PENDING_APPROVAL',
                    'mdc-chip mdc-chip--success': organization.status === 'APPROVED',
                    'mdc-chip mdc-chip--error': organization.status === 'REJECTED'
                  }">
                    {{ organization.status }}
                  </span>
                </dd>
              </div>
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">{{ $t('dashboard.emailLabel') }}:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ organization.email }}</dd>
              </div>
              <div v-if="hasSocialOnOrg(organization)" class="flex items-center">
                <dt class="sr-only">Social profiles</dt>
                <dd class="m-0 p-0 flex-1 min-w-0">
                  <OrganizationSocialLinks
                    compact
                    :facebook-url="organization.facebookUrl"
                    :instagram-url="organization.instagramUrl"
                    :linkedin-url="organization.linkedinUrl"
                    :twitter-url="organization.twitterUrl"
                    :youtube-url="organization.youtubeUrl"
                  />
                </dd>
              </div>
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">City:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ organization.city }}</dd>
              </div>
            </dl>
          </div>

          <!-- Register Company Card -->
          <div v-else-if="authStore.hasRole('REALTOR')" class="mdc-card">
            <div class="flex items-center mb-4">
              <span class="material-icons text-blue-600 mr-2">add_business</span>
              <h2 class="mdc-typography--headline6 m-0">{{ $t('dashboard.registerYourCompany') }}</h2>
            </div>
            <p class="mdc-typography--body2 text-gray-600 mb-4">
              {{ $t('dashboard.registerCompanyDescription') }}
            </p>
            <router-link
              to="/register-company"
              class="mdc-button mdc-button--raised"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">add</span>
              {{ $t('dashboard.registerCompany') }}
            </router-link>
          </div>
        </div>

        <!-- Sponsorship Section (for super agents) -->
        <div v-if="organization && isSuperAgent" class="mdc-card mb-8">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <span class="material-icons text-amber-600 mr-2">star</span>
              <h2 class="mdc-typography--headline6 m-0">{{ $t('dashboard.sponsorships') }}</h2>
            </div>
            <button
              @click="showSponsorshipModal = true"
              class="mdc-button mdc-button--raised"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">add</span>
              {{ $t('dashboard.applyForSponsorship') }}
            </button>
          </div>
          <div v-if="sponsorshipApplications.length === 0" class="text-center py-8">
            <span class="material-icons text-gray-400" style="font-size: 48px;">star_border</span>
            <p class="mdc-typography--body1 text-gray-500 mt-2">{{ $t('dashboard.noSponsorshipApplications') }}</p>
            <p class="mdc-typography--body2 text-gray-400">{{ $t('dashboard.clickApplySponsorship') }}</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="app in sponsorshipApplications" :key="app.id" class="mdc-card" style="padding: 16px;">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="mdc-typography--subtitle1 font-medium text-gray-900 mb-1">{{ app.sponsorshipName }}</h3>
                  <p class="mdc-typography--body2 text-gray-500 mb-2">
                    <span class="material-icons" style="font-size: 14px; vertical-align: middle;">event</span>
                    {{ formatDate(app.startDate) }} - {{ formatDate(app.endDate) }}
                  </p>
                  <span :class="{
                    'mdc-chip mdc-chip--warning': app.status === 'PENDING',
                    'mdc-chip mdc-chip--success': app.status === 'APPROVED',
                    'mdc-chip mdc-chip--error': app.status === 'REJECTED',
                    'mdc-chip': app.status === 'CANCELLED'
                  }">
                    {{ app.status }}
                  </span>
                </div>
                <button
                  v-if="app.status === 'PENDING'"
                  @click="cancelApplication(app.id)"
                  class="mdc-button mdc-button--text"
                  style="color: #f44336;"
                >
                  <span class="material-icons" style="font-size: 18px;">cancel</span>
                </button>
              </div>
              <div v-if="app.rejectionReason" class="mt-3 p-2 rounded" style="background-color: #ffebee;">
                <p class="mdc-typography--caption text-red-600">
                  <span class="material-icons" style="font-size: 14px; vertical-align: middle;">info</span>
                  {{ $t('dashboard.rejectionReasonLabel') }}: {{ app.rejectionReason }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Agents Section (for super agents) -->
        <div v-if="organization && isSuperAgent" class="mdc-card mb-8">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
            <div class="flex items-center">
              <span class="material-icons text-indigo-600 mr-2">people</span>
              <h2 class="mdc-typography--headline6 m-0">{{ $t('dashboard.agents') }}</h2>
            </div>
            <button
              @click="$router.push('/create-agent')"
              class="mdc-button mdc-button--raised w-full sm:w-auto"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">person_add</span>
              <span class="hidden sm:inline">{{ $t('dashboard.createAgent') }}</span>
              <span class="sm:hidden">{{ $t('dashboard.createShort') }}</span>
            </button>
          </div>
          <div v-if="agentsLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <p class="mdc-typography--body2 text-gray-400 mt-2">{{ $t('dashboard.loadingAgents') }}</p>
          </div>
          <div v-else-if="agents.length === 0" class="text-center py-8">
            <span class="material-icons text-gray-400" style="font-size: 48px;">people_outline</span>
            <p class="mdc-typography--body1 text-gray-500 mt-2">{{ $t('dashboard.noAgentsYet') }}</p>
            <p class="mdc-typography--body2 text-gray-400">{{ $t('dashboard.clickCreateAgent') }}</p>
          </div>
          <template v-else>
            <!-- Mobile Card View -->
            <div class="block sm:hidden space-y-3">
              <div v-for="agent in agents" :key="agent.id" class="bg-zinc-900 border border-white/10 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center mb-1">
                      <span class="material-icons mr-2 text-gray-400" style="font-size: 20px;">person</span>
                      <span class="font-semibold text-white">{{ agent.user?.firstName }} {{ agent.user?.lastName }}</span>
                    </div>
                    <p class="text-sm text-gray-400 ml-7">{{ agent.user?.email }}</p>
                  </div>
                  <button
                    @click="editAgent(agent)"
                    class="p-2 text-gray-400 hover:text-yellow-400"
                  >
                    <span class="material-icons" style="font-size: 20px;">edit</span>
                  </button>
                </div>
                <div class="flex flex-wrap gap-2 ml-7">
                  <span :class="{
                    'px-2 py-1 rounded text-xs font-medium bg-green-500/30 text-green-200': agent.status === 'ACTIVE',
                    'px-2 py-1 rounded text-xs font-medium bg-gray-500/30 text-gray-200': agent.status === 'INACTIVE',
                    'px-2 py-1 rounded text-xs font-medium bg-red-500/30 text-red-200': agent.status === 'SUSPENDED'
                  }">
                    {{ agent.status }}
                  </span>
                  <span v-if="agent.isSuperAgent" class="px-2 py-1 rounded text-xs font-medium bg-blue-500/30 text-blue-200">{{ $t('dashboard.superAgent') }}</span>
                </div>
              </div>
            </div>
            
            <!-- Desktop Table View -->
            <div class="hidden sm:block overflow-x-auto">
            <table class="mdc-data-table min-w-full">
              <thead class="mdc-data-table__header-row">
                <tr>
                  <th class="mdc-data-table__header-cell">{{ $t('dashboard.nameLabel') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('dashboard.emailLabel') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('dashboard.statusLabel') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('dashboard.superAgent') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('dashboard.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="agent in agents" :key="agent.id" class="mdc-data-table__row">
                  <td class="mdc-data-table__cell">
                    <div class="flex items-center">
                      <span class="material-icons mr-2" style="font-size: 20px; color: #666;">person</span>
                      {{ agent.user?.firstName }} {{ agent.user?.lastName }}
                    </div>
                  </td>
                  <td class="mdc-data-table__cell">{{ agent.user?.email }}</td>
                  <td class="mdc-data-table__cell">
                    <span :class="{
                      'mdc-chip mdc-chip--success': agent.status === 'ACTIVE',
                      'mdc-chip': agent.status === 'INACTIVE',
                      'mdc-chip mdc-chip--error': agent.status === 'SUSPENDED'
                    }">
                      {{ agent.status }}
                    </span>
                  </td>
                  <td class="mdc-data-table__cell">
                    <span v-if="agent.isSuperAgent" class="mdc-chip mdc-chip--primary">{{ $t('common.yes') }}</span>
                    <span v-else class="mdc-typography--body2 text-gray-500">{{ $t('common.no') }}</span>
                  </td>
                  <td class="mdc-data-table__cell">
                    <button
                      @click="editAgent(agent)"
                      class="mdc-button mdc-button--text"
                    >
                      <span class="material-icons" style="font-size: 18px;">edit</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </template>
        </div>

        <!-- Properties Section (for all agents) -->
        <div v-if="agent || (organization && isSuperAgent)" class="mdc-card">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
            <div class="flex items-center">
              <span class="material-icons text-teal-600 mr-2">home</span>
              <h2 class="mdc-typography--headline6 m-0">
                {{ isSuperAgent ? $t('dashboard.companyProperties') : $t('dashboard.myProperties') }}
              </h2>
            </div>
            <button
              @click="$router.push('/submit-property')"
              class="mdc-button mdc-button--raised w-full sm:w-auto"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">add</span>
              <span class="hidden sm:inline">{{ $t('property.submitProperty') }}</span>
              <span class="sm:hidden">{{ $t('dashboard.submitShort') }}</span>
            </button>
          </div>
          <div v-if="propertiesLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <p class="mdc-typography--body2 text-gray-400 mt-2">{{ $t('dashboard.loadingProperties') }}</p>
          </div>
          <div v-else-if="properties.length === 0" class="text-center py-8">
            <span class="material-icons text-gray-400" style="font-size: 48px;">home_work</span>
            <p class="mdc-typography--body1 text-gray-500 mt-2">{{ $t('dashboard.noPropertiesYet') }}</p>
            <p class="mdc-typography--body2 text-gray-400">{{ $t('dashboard.clickSubmitProperty') }}</p>
          </div>
          <template v-else>
            <!-- Mobile Card View -->
            <div class="block sm:hidden space-y-3">
              <div v-for="property in properties" :key="property.id" class="bg-zinc-900 border border-white/10 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center mb-1">
                      <span class="material-icons mr-2 text-gray-400" style="font-size: 20px;">home</span>
                      <span class="font-semibold text-white">{{ property.title }}</span>
                    </div>
                    <p class="text-sm text-gray-400 ml-7">{{ property.city }}</p>
                  </div>
                  <div class="flex gap-1">
                    <router-link
                      :to="`/properties/${property.id}`"
                      class="p-2 text-gray-400 hover:text-yellow-400"
                    >
                      <span class="material-icons" style="font-size: 20px;">visibility</span>
                    </router-link>
                    <button
                      @click="editProperty(property)"
                      class="p-2 text-gray-400 hover:text-yellow-400"
                    >
                      <span class="material-icons" style="font-size: 20px;">edit</span>
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 ml-7">
                  <span class="px-2 py-1 rounded text-xs font-medium bg-blue-500/30 text-blue-200">{{ property.type }}</span>
                  <div class="flex flex-col gap-0.5">
                    <span v-if="property.priceETB" class="px-2 py-1 rounded text-xs font-medium font-semibold text-white">{{ formatPrice(property.priceETB, 'ETB') }}</span>
                    <span v-if="property.priceUSD" class="px-2 py-1 rounded text-xs font-medium text-gray-400">{{ formatPrice(property.priceUSD, 'USD') }}</span>
                  </div>
                  <span :class="{
                    'px-2 py-1 rounded text-xs font-medium bg-green-500/30 text-green-200': property.status === 'AVAILABLE',
                    'px-2 py-1 rounded text-xs font-medium bg-yellow-500/30 text-yellow-200': property.status === 'RESERVED',
                    'px-2 py-1 rounded text-xs font-medium bg-gray-500/30 text-gray-200': property.status === 'SOLD'
                  }">
                    {{ property.status }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Desktop Table View -->
            <div class="hidden sm:block overflow-x-auto">
            <table class="mdc-data-table min-w-full">
              <thead class="mdc-data-table__header-row">
                <tr>
                  <th class="mdc-data-table__header-cell">{{ $t('property.propertyTitle') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('property.type') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('property.price') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('property.city') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('property.status') }}</th>
                  <th class="mdc-data-table__header-cell">{{ $t('dashboard.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="property in properties" :key="property.id" class="mdc-data-table__row">
                  <td class="mdc-data-table__cell">
                    <div class="flex items-center">
                      <span class="material-icons mr-2" style="font-size: 20px; color: #666;">home</span>
                      <span class="mdc-typography--subtitle2">{{ property.title }}</span>
                    </div>
                  </td>
                  <td class="mdc-data-table__cell">
                    <span class="mdc-chip">{{ property.type }}</span>
                  </td>
                  <td class="mdc-data-table__cell">
                    <div class="flex flex-col gap-0.5">
                      <span v-if="property.priceETB" class="mdc-typography--subtitle2 font-medium">{{ formatPrice(property.priceETB, 'ETB') }}</span>
                      <span v-if="property.priceUSD" class="mdc-typography--body2 text-gray-600">{{ formatPrice(property.priceUSD, 'USD') }}</span>
                    </div>
                  </td>
                  <td class="mdc-data-table__cell">{{ property.city }}</td>
                  <td class="mdc-data-table__cell">
                    <span :class="{
                      'mdc-chip mdc-chip--success': property.status === 'AVAILABLE',
                      'mdc-chip mdc-chip--warning': property.status === 'RESERVED',
                      'mdc-chip': property.status === 'SOLD'
                    }">
                      {{ property.status }}
                    </span>
                  </td>
                  <td class="mdc-data-table__cell">
                    <div class="flex space-x-2">
                      <router-link
                        :to="`/properties/${property.id}`"
                        class="mdc-button mdc-button--text"
                      >
                        <span class="material-icons" style="font-size: 18px;">visibility</span>
                      </router-link>
                      <button
                        @click="editProperty(property)"
                        class="mdc-button mdc-button--text"
                      >
                        <span class="material-icons" style="font-size: 18px;">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </template>
        </div>
      </div>
      <!-- End Main Content -->

      <!-- Modals -->
      <!-- Edit Organization Modal -->
      <div
        v-if="showEditOrganizationModal"
        class="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/70 pt-8 pb-12 px-4"
        @click.self="showEditOrganizationModal = false"
      >
        <div
          class="relative w-full max-w-2xl rounded-lg border border-white/10 bg-zinc-900 p-6 text-white shadow-xl ring-1 ring-white/5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dash-org-form-title"
          @click.stop
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-center gap-2 min-w-0">
              <span class="material-icons text-yellow-400 shrink-0">business</span>
              <h3 id="dash-org-form-title" class="text-lg font-semibold text-white">{{ $t('dashboard.editOrganization') }}</h3>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              @click="showEditOrganizationModal = false"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
          <form @submit.prevent="updateOrganization" class="space-y-4">
            <div class="flex flex-wrap gap-2 border-b border-white/10 pb-3" role="tablist">
              <button
                type="button"
                role="tab"
                :aria-selected="organizationFormTab === 'profile'"
                class="rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                :class="
                  organizationFormTab === 'profile'
                    ? 'border border-yellow-400/50 bg-yellow-500/20 text-yellow-300'
                    : 'border border-transparent text-gray-400 hover:border-white/20 hover:text-white'
                "
                @click="organizationFormTab = 'profile'"
              >
                {{ $t('admin.orgFormTabProfile') }}
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="organizationFormTab === 'contact'"
                class="rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                :class="
                  organizationFormTab === 'contact'
                    ? 'border border-yellow-400/50 bg-yellow-500/20 text-yellow-300'
                    : 'border border-transparent text-gray-400 hover:border-white/20 hover:text-white'
                "
                @click="organizationFormTab = 'contact'"
              >
                {{ $t('admin.orgFormTabContact') }}
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="organizationFormTab === 'online'"
                class="rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                :class="
                  organizationFormTab === 'online'
                    ? 'border border-yellow-400/50 bg-yellow-500/20 text-yellow-300'
                    : 'border border-transparent text-gray-400 hover:border-white/20 hover:text-white'
                "
                @click="organizationFormTab = 'online'"
              >
                {{ $t('admin.orgFormTabOnline') }}
              </button>
            </div>

            <div v-show="organizationFormTab === 'profile'" class="space-y-4">
              <OrgDocumentReviewsSummary v-if="organization" :org="organization" />
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="dash-org-name" class="block text-sm font-medium text-gray-300">{{ $t('dashboard.nameLabel') }} *</label>
                  <input
                    id="dash-org-name"
                    v-model="organizationForm.name"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label for="dash-org-reg" class="block text-sm font-medium text-gray-300">{{ $t('dashboard.registrationNumber') }}</label>
                  <input
                    id="dash-org-reg"
                    v-model="organizationForm.registrationNumber"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-400">Business Registration</label>
                  <input
                    v-model="organizationForm.businessRegistrationNumber"
                    type="text"
                    placeholder="Registration number"
                    class="mb-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <input
                    v-model="organizationForm.businessRegistration"
                    type="text"
                    placeholder="Document URL or upload below"
                    class="block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <div class="mt-1 flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,image/*,.doc,.docx"
                      class="hidden"
                      :ref="(el) => { orgDocInputRefs.businessRegistration = el }"
                      @change="(ev) => onUploadOrgDocument(ev, 'BUSINESS_REGISTRATION', 'businessRegistration')"
                    />
                    <button
                      type="button"
                      :disabled="orgDocUploading.businessRegistration"
                      class="rounded border border-white/20 px-2 py-1 text-sm text-gray-300 transition-colors hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50"
                      @click="orgDocInputRefs.businessRegistration?.click()"
                    >
                      {{ orgDocUploading.businessRegistration ? 'Uploading…' : 'Upload document' }}
                    </button>
                    <a
                      v-if="isDocumentUrl(organizationForm.businessRegistration)"
                      :href="mediaUrl(organizationForm.businessRegistration)"
                      target="_blank"
                      rel="noopener"
                      class="text-sm text-yellow-400 hover:underline"
                      >View document</a
                    >
                  </div>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-400">License</label>
                  <input
                    v-model="organizationForm.licenseNumber"
                    type="text"
                    placeholder="License number"
                    class="mb-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <input
                    v-model="organizationForm.license"
                    type="text"
                    placeholder="Document URL or upload below"
                    class="block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <div class="mt-1 flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,image/*,.doc,.docx"
                      class="hidden"
                      :ref="(el) => { orgDocInputRefs.license = el }"
                      @change="(ev) => onUploadOrgDocument(ev, 'LICENSE', 'license')"
                    />
                    <button
                      type="button"
                      :disabled="orgDocUploading.license"
                      class="rounded border border-white/20 px-2 py-1 text-sm text-gray-300 transition-colors hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50"
                      @click="orgDocInputRefs.license?.click()"
                    >
                      {{ orgDocUploading.license ? 'Uploading…' : 'Upload document' }}
                    </button>
                    <a
                      v-if="isDocumentUrl(organizationForm.license)"
                      :href="mediaUrl(organizationForm.license)"
                      target="_blank"
                      rel="noopener"
                      class="text-sm text-yellow-400 hover:underline"
                      >View document</a
                    >
                  </div>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-400">VAT Registration</label>
                  <input
                    v-model="organizationForm.vatNumber"
                    type="text"
                    placeholder="VAT number"
                    class="mb-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <input
                    v-model="organizationForm.vatRegistration"
                    type="text"
                    placeholder="Document URL or upload below"
                    class="block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <div class="mt-1 flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,image/*,.doc,.docx"
                      class="hidden"
                      :ref="(el) => { orgDocInputRefs.vatRegistration = el }"
                      @change="(ev) => onUploadOrgDocument(ev, 'VAT_REGISTRATION', 'vatRegistration')"
                    />
                    <button
                      type="button"
                      :disabled="orgDocUploading.vatRegistration"
                      class="rounded border border-white/20 px-2 py-1 text-sm text-gray-300 transition-colors hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50"
                      @click="orgDocInputRefs.vatRegistration?.click()"
                    >
                      {{ orgDocUploading.vatRegistration ? 'Uploading…' : 'Upload document' }}
                    </button>
                    <a
                      v-if="isDocumentUrl(organizationForm.vatRegistration)"
                      :href="mediaUrl(organizationForm.vatRegistration)"
                      target="_blank"
                      rel="noopener"
                      class="text-sm text-yellow-400 hover:underline"
                      >View document</a
                    >
                  </div>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-400">TIN Registration</label>
                  <input
                    v-model="organizationForm.tinNumber"
                    type="text"
                    placeholder="TIN number"
                    class="mb-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <input
                    v-model="organizationForm.tinRegistration"
                    type="text"
                    placeholder="Document URL or upload below"
                    class="block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <div class="mt-1 flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,image/*,.doc,.docx"
                      class="hidden"
                      :ref="(el) => { orgDocInputRefs.tinRegistration = el }"
                      @change="(ev) => onUploadOrgDocument(ev, 'TIN_REGISTRATION', 'tinRegistration')"
                    />
                    <button
                      type="button"
                      :disabled="orgDocUploading.tinRegistration"
                      class="rounded border border-white/20 px-2 py-1 text-sm text-gray-300 transition-colors hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50"
                      @click="orgDocInputRefs.tinRegistration?.click()"
                    >
                      {{ orgDocUploading.tinRegistration ? 'Uploading…' : 'Upload document' }}
                    </button>
                    <a
                      v-if="isDocumentUrl(organizationForm.tinRegistration)"
                      :href="mediaUrl(organizationForm.tinRegistration)"
                      target="_blank"
                      rel="noopener"
                      class="text-sm text-yellow-400 hover:underline"
                      >View document</a
                    >
                  </div>
                </div>
              </div>
              <div>
                <label for="dash-org-address" class="block text-sm font-medium text-gray-300">{{ $t('property.address') }}</label>
                <input
                  id="dash-org-address"
                  v-model="organizationForm.address"
                  type="text"
                  class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="dash-org-city" class="block text-sm font-medium text-gray-300">{{ $t('property.city') }}</label>
                  <input
                    id="dash-org-city"
                    v-model="organizationForm.city"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label for="dash-org-country" class="block text-sm font-medium text-gray-300">{{ $t('property.country') }}</label>
                  <input
                    id="dash-org-country"
                    v-model="organizationForm.country"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-300">{{ $t('property.locationMap') }} / {{ $t('admin.pickLocation') }}</label>
                <OsmMapPicker
                  :model-value="
                    organizationForm.latitude != null && organizationForm.longitude != null
                      ? { lat: organizationForm.latitude, lng: organizationForm.longitude }
                      : null
                  "
                  @update:latitude="(v) => (organizationForm.latitude = v)"
                  @update:longitude="(v) => (organizationForm.longitude = v)"
                  height="240px"
                  :hint-text="$t('admin.pickLocationHint')"
                />
              </div>
            </div>

            <div v-show="organizationFormTab === 'contact'" class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">{{ $t('auth.phoneNumber') }}</label>
                <div v-for="(phone, idx) in organizationForm.phoneNumbers" :key="idx" class="flex items-center gap-2">
                  <CountryCodePhoneInput
                    :country-code="phone.countryCode"
                    :number="phone.number"
                    :placeholder="$t('admin.orgPhonePlaceholder')"
                    class="min-w-0 flex-1"
                    @update:country-code="phone.countryCode = $event"
                    @update:number="phone.number = $event"
                  />
                  <button
                    v-if="organizationForm.phoneNumbers.length > 1"
                    type="button"
                    class="flex-shrink-0 rounded border border-white/20 p-2 text-gray-400 transition-colors hover:border-red-400 hover:text-red-400"
                    :aria-label="$t('admin.removePhone')"
                    @click="organizationForm.phoneNumbers.splice(idx, 1)"
                  >
                    ×
                  </button>
                </div>
                <button
                  type="button"
                  class="text-sm text-yellow-400 transition-colors hover:text-yellow-300"
                  @click="organizationForm.phoneNumbers.push({ countryCode: DEFAULT_COUNTRY_CODE, number: '' })"
                >
                  + {{ $t('admin.addPhone') }}
                </button>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="dash-org-email" class="block text-sm font-medium text-gray-300">{{ $t('dashboard.emailLabel') }}</label>
                  <input
                    id="dash-org-email"
                    v-model="organizationForm.email"
                    type="email"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label for="dash-org-web" class="block text-sm font-medium text-gray-300">{{ $t('dashboard.website') }}</label>
                  <input
                    id="dash-org-web"
                    v-model="organizationForm.website"
                    type="url"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>

            <div v-show="organizationFormTab === 'online'" class="space-y-4">
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label for="dash-org-fb" class="block text-xs font-medium text-gray-400">{{ $t('organization.facebook') }}</label>
                  <input
                    id="dash-org-fb"
                    v-model="organizationForm.facebookUrl"
                    type="url"
                    placeholder="https://…"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label for="dash-org-ig" class="block text-xs font-medium text-gray-400">{{ $t('organization.instagram') }}</label>
                  <input
                    id="dash-org-ig"
                    v-model="organizationForm.instagramUrl"
                    type="url"
                    placeholder="https://…"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label for="dash-org-li" class="block text-xs font-medium text-gray-400">{{ $t('organization.linkedin') }}</label>
                  <input
                    id="dash-org-li"
                    v-model="organizationForm.linkedinUrl"
                    type="url"
                    placeholder="https://…"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label for="dash-org-tw" class="block text-xs font-medium text-gray-400">{{ $t('organization.twitter') }}</label>
                  <input
                    id="dash-org-tw"
                    v-model="organizationForm.twitterUrl"
                    type="url"
                    placeholder="https://…"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div class="sm:col-span-2">
                  <label for="dash-org-yt" class="block text-xs font-medium text-gray-400">{{ $t('organization.youtube') }}</label>
                  <input
                    id="dash-org-yt"
                    v-model="organizationForm.youtubeUrl"
                    type="url"
                    placeholder="https://…"
                    class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div>
                <label for="dash-org-desc" class="block text-sm font-medium text-gray-300">{{ $t('property.description') }}</label>
                <textarea
                  id="dash-org-desc"
                  v-model="organizationForm.description"
                  rows="4"
                  class="mt-1 min-h-[100px] w-full rounded-md border border-white/20 bg-white/5 py-2 px-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div v-if="organizationFormError" class="rounded-md border border-red-500/50 bg-red-500/30 p-3 text-sm text-red-200">
              {{ organizationFormError }}
            </div>
            <div class="flex flex-col justify-end gap-3 border-t border-white/10 pt-4 sm:flex-row">
              <button
                type="button"
                class="w-full rounded-md border border-white/20 px-4 py-2.5 text-white transition-colors hover:border-yellow-400 hover:bg-yellow-500/20 sm:w-auto"
                @click="showEditOrganizationModal = false"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="organizationFormSaving"
                class="inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-2.5 font-medium text-black transition-colors hover:bg-yellow-400 disabled:bg-white/50 disabled:opacity-50 sm:w-auto"
              >
                <span class="material-icons mr-1" style="font-size: 18px">save</span>
                {{ organizationFormSaving ? $t('admin.saving') : $t('common.update') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Agent Modal -->
      <div v-if="showEditAgentModal" class="mdc-dialog fixed inset-0 z-[1100] overflow-y-auto" @click.self="showEditAgentModal = false">
        <div class="mdc-dialog__surface m-4 sm:m-8" style="max-width: 500px; margin-left: auto; margin-right: auto;">
          <div class="flex items-center mb-4">
            <span class="material-icons text-green-600 mr-2">badge</span>
            <h3 class="mdc-dialog__title">{{ $t('dashboard.editAgent') }}</h3>
          </div>
        <form @submit.prevent="updateAgent" class="space-y-4">
          <div class="mdc-text-field">
            <input
              :value="editingAgent?.user ? `${editingAgent.user.firstName} ${editingAgent.user.lastName}` : ''"
              type="text"
              disabled
              placeholder=" "
              class="mdc-text-field__input"
              style="background-color: #f5f5f5;"
            />
            <label class="mdc-text-field__label">{{ $t('dashboard.agentName') }}</label>
          </div>
          <div class="mdc-text-field">
            <input
              :value="editingAgent?.user?.email || ''"
              type="email"
              disabled
              placeholder=" "
              class="mdc-text-field__input"
              style="background-color: #f5f5f5;"
            />
            <label class="mdc-text-field__label">{{ $t('dashboard.emailLabel') }}</label>
          </div>
          <div class="mdc-text-field">
            <input
              v-model="agentForm.licenseNumber"
              type="text"
              placeholder=" "
              class="mdc-text-field__input"
            />
            <label class="mdc-text-field__label">{{ $t('dashboard.licenseNumber') }}</label>
          </div>
          <div class="mdc-text-field">
            <select
              v-model="agentForm.status"
              :disabled="editingAgent?.isSuperAgent"
              class="mdc-text-field__input"
            >
              <option value="ACTIVE">{{ $t('dashboard.active') }}</option>
              <option value="INACTIVE">{{ $t('dashboard.inactive') }}</option>
              <option value="SUSPENDED">{{ $t('dashboard.suspended') }}</option>
            </select>
            <label class="mdc-text-field__label">{{ $t('dashboard.statusLabel') }}</label>
            <p v-if="editingAgent?.isSuperAgent" class="mdc-typography--caption text-gray-500 mt-1">{{ $t('dashboard.superAgentStatusCannotChange') }}</p>
          </div>
          <div class="mdc-text-field">
            <textarea
              v-model="agentForm.notes"
              rows="3"
              placeholder=" "
              class="mdc-text-field__input"
              style="min-height: 80px;"
            ></textarea>
            <label class="mdc-text-field__label">{{ $t('dashboard.notesLabel') }}</label>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <button
              type="button"
              @click="showEditAgentModal = false"
              class="mdc-button mdc-button--outlined w-full sm:w-auto"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="mdc-button mdc-button--raised w-full sm:w-auto"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">save</span>
              {{ $t('common.update') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Property Modal -->
    <div v-if="showEditPropertyModal" class="fixed inset-0 z-[1100] overflow-y-auto bg-black/70" @click.self="showEditPropertyModal = false">
      <div class="bg-zinc-900 border border-white/10 rounded-lg m-4 sm:m-8 p-6" style="max-width: 700px; max-height: 90vh; overflow-y: auto; margin-left: auto; margin-right: auto;">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <span class="material-icons text-yellow-400 mr-2">home</span>
            <h3 class="text-xl font-semibold text-white">{{ $t('property.editProperty') }}</h3>
          </div>
          <button
            type="button"
            @click="showEditPropertyModal = false"
            class="text-gray-400 hover:text-yellow-400"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <form @submit.prevent="updateProperty" class="space-y-4">
          <div>
            <label for="edit-title" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.propertyTitle') }} *</label>
            <input
              id="edit-title"
              v-model="propertyForm.title"
              type="text"
              required
              class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label for="edit-description" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.description') }}</label>
            <textarea
              id="edit-description"
              v-model="propertyForm.description"
              rows="3"
              class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              style="min-height: 80px;"
            ></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="edit-type" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.type') }} *</label>
              <select
                id="edit-type"
                v-model="propertyForm.type"
                required
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">{{ $t('propertyTypes.selectType') }}</option>
                <option value="APARTMENT">{{ $t('propertyTypes.apartment') }}</option>
                <option value="HOUSE">{{ $t('propertyTypes.house') }}</option>
                <option value="VILLA">{{ $t('propertyTypes.villa') }}</option>
                <option value="CONDOMINIUM">{{ $t('propertyTypes.condominium') }}</option>
                <option value="TOWNHOUSE">{{ $t('propertyTypes.townhouse') }}</option>
                <option value="LAND">{{ $t('propertyTypes.land') }}</option>
                <option value="COMMERCIAL">{{ $t('dashboard.commercial') }}</option>
              </select>
            </div>
          </div>
          
          <!-- Price Fields -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">{{ $t('property.price') }} *</label>
            <p class="text-xs text-gray-500">{{ $t('dashboard.priceRequiredHint') }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="edit-priceETB" class="block text-xs font-medium text-gray-400 mb-1">{{ $t('dashboard.priceETBBirr') }}</label>
                <input
                  id="edit-priceETB"
                  v-model.number="propertyForm.priceETB"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label for="edit-priceUSD" class="block text-xs font-medium text-gray-400 mb-1">{{ $t('dashboard.priceUSDDollar') }}</label>
                <input
                  id="edit-priceUSD"
                  v-model.number="propertyForm.priceUSD"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>
            <p class="text-xs text-gray-500">{{ $t('dashboard.atLeastOnePriceRequired') }}</p>
          </div>
          <div class="border border-white/10 rounded-lg p-4 space-y-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h4 class="text-sm font-semibold text-white">Property Credit Offers</h4>
                <p class="text-xs text-gray-400">Add new bank offers while editing this property.</p>
              </div>
              <button
                type="button"
                @click="addEditCreditOfferRow"
                :disabled="!approvedBanks.length"
                class="px-3 py-1.5 rounded-md border border-white/20 text-xs text-gray-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Offer
              </button>
            </div>
            <p v-if="!approvedBanks.length" class="text-xs text-yellow-300">
              No approved banks are currently available.
            </p>
            <div v-if="editExistingCreditOffers.length" class="space-y-2">
              <p class="text-xs font-medium text-gray-400">Existing offers</p>
              <div
                v-for="offer in editExistingCreditOffers"
                :key="offer.id"
                class="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2"
              >
                <p class="text-sm text-white">{{ getBankName(offer.bankId) }}</p>
                <p class="text-sm text-gray-300 sm:text-right">
                  {{ formatOfferCoverage(offer) != null ? `${formatOfferCoverage(offer)}%` : 'Coverage N/A' }}
                </p>
              </div>
            </div>
            <div
              v-for="(offer, index) in editNewCreditOffers"
              :key="`dashboard-edit-offer-${index}`"
              class="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-end"
            >
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">Bank</label>
                <select
                  v-model="offer.bankId"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="">Select bank</option>
                  <option v-for="bank in approvedBanks" :key="bank.id" :value="bank.id">
                    {{ bank.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">Coverage (%)</label>
                <input
                  v-model.number="offer.coveragePercentage"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <button
                type="button"
                @click="removeEditCreditOfferRow(index)"
                class="px-3 py-2 rounded-md border border-red-300 text-xs text-red-300 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          </div>
          <div>
            <label for="edit-address" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.address') }} *</label>
            <input
              id="edit-address"
              v-model="propertyForm.address"
              type="text"
              required
              class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="edit-city" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.city') }} *</label>
              <input
                id="edit-city"
                v-model="propertyForm.city"
                type="text"
                required
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div>
              <label for="edit-country" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.country') }} *</label>
              <input
                id="edit-country"
                v-model="propertyForm.country"
                type="text"
                required
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label for="edit-area" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('dashboard.areaSqm') }} *</label>
              <input
                id="edit-area"
                v-model.number="propertyForm.area"
                type="number"
                step="0.01"
                min="0"
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div>
              <label for="edit-bedrooms" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.bedrooms') }}</label>
              <input
                id="edit-bedrooms"
                v-model.number="propertyForm.bedrooms"
                type="number"
                min="0"
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div>
              <label for="edit-bathrooms" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.bathrooms') }}</label>
              <input
                id="edit-bathrooms"
                v-model.number="propertyForm.bathrooms"
                type="number"
                min="0"
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="edit-floorNumber" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('dashboard.floorNumberLabel') }}</label>
              <input
                id="edit-floorNumber"
                v-model.number="propertyForm.floorNumber"
                type="number"
                min="0"
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div>
              <label for="edit-totalFloors" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('dashboard.totalFloorsLabel') }}</label>
              <input
                id="edit-totalFloors"
                v-model.number="propertyForm.totalFloors"
                type="number"
                min="0"
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>
          
          <div>
            <label for="edit-constructionPercentage" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('dashboard.constructionPercentageLabel') }}</label>
            <input
              id="edit-constructionPercentage"
              v-model.number="propertyForm.constructionPercentage"
              type="number"
              min="0"
              max="100"
              class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div class="flex items-center">
            <input
              v-model="propertyForm.isFullyFurnished"
              type="checkbox"
              id="isFullyFurnished"
              class="w-4 h-4 text-yellow-400 border-white/30 rounded focus:ring-yellow-400"
            />
            <label for="isFullyFurnished" class="ml-2 text-sm text-gray-700">{{ $t('property.isFullyFurnished') }}</label>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="edit-constructionStatus" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.constructionStatus') }} *</label>
              <select
                id="edit-constructionStatus"
                v-model="propertyForm.constructionStatus"
                required
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">{{ $t('submitProperty.selectStatus') }}</option>
                <option value="COMPLETED">{{ $t('dashboard.completed') }}</option>
                <option value="UNDER_CONSTRUCTION">{{ $t('dashboard.underConstruction') }}</option>
                <option value="PLANNED">{{ $t('dashboard.planned') }}</option>
                <option value="READY_TO_MOVE">{{ $t('property.readyToMove') }}</option>
              </select>
            </div>
            <div>
              <label for="edit-category" class="block text-sm font-medium text-gray-400 mb-1">{{ $t('property.category') }}</label>
              <select
                id="edit-category"
                v-model="propertyForm.category"
                class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">{{ $t('submitProperty.selectCategory') }}</option>
                <option value="FOR_SALE">{{ $t('property.forSale') }}</option>
                <option value="FOR_RENTAL">{{ $t('property.forRental') }}</option>
              </select>
            </div>
          </div>
          
          <!-- Image/Video Upload Section -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('dashboard.photosVideos') }}</label>
            <div class="space-y-3">
              <!-- Existing Images -->
              <div v-if="editingProperty && editingProperty.images && editingProperty.images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                <div v-for="image in editingProperty.images" :key="image.id" class="relative group">
                  <img v-if="!isVideoUrl(image.imageUrl)" :src="mediaUrl(image.imageUrl)" :alt="image.caption || $t('property.propertyImage')" class="w-full h-24 object-cover rounded border border-white/20" />
                  <video v-else :src="mediaUrl(image.imageUrl)" class="w-full h-24 object-cover rounded border border-white/20" muted playsinline></video>
                  <button
                    type="button"
                    @click="deletePropertyImage(editingProperty.id, image.id)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"
                  >
                    <span class="material-icons" style="font-size: 16px;">close</span>
                  </button>
                  <div v-if="image.isPrimary" class="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">{{ $t('dashboard.primary') }}</div>
                </div>
              </div>
              
              <!-- File Upload -->
              <div class="border-2 border-dashed border-white/20 rounded-lg p-4">
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileSelect"
                  multiple
                  accept="image/*,video/*"
                  class="hidden"
                  id="property-file-upload"
                />
                <label for="property-file-upload" class="cursor-pointer flex flex-col items-center justify-center">
                  <span class="material-icons text-gray-400 mb-2" style="font-size: 48px;">cloud_upload</span>
                  <span class="text-sm text-gray-600 mb-1">{{ $t('dashboard.clickToUploadPhotosVideos') }}</span>
                  <span class="text-xs text-gray-500">{{ $t('dashboard.supportsFormats') }}</span>
                </label>
              </div>
              
              <!-- Selected Files Preview -->
              <div v-if="selectedFiles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div v-for="(file, index) in selectedFiles" :key="index" class="relative">
                  <div v-if="file.type.startsWith('image/')" class="relative">
                    <img :src="file.preview" :alt="file.name" class="w-full h-24 object-cover rounded border border-white/20" />
                    <button
                      type="button"
                      @click="removeSelectedFile(index)"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"
                    >
                      <span class="material-icons" style="font-size: 16px;">close</span>
                    </button>
                  </div>
                  <div v-else class="relative bg-white/10 rounded border border-white/20 h-24 flex items-center justify-center">
                    <span class="material-icons text-gray-400">videocam</span>
                    <button
                      type="button"
                      @click="removeSelectedFile(index)"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"
                    >
                      <span class="material-icons" style="font-size: 16px;">close</span>
                    </button>
                  </div>
                  <p class="text-xs text-gray-600 mt-1 truncate">{{ file.name }}</p>
                </div>
              </div>
            </div>
          </div>
        <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
          <button
            type="button"
            @click="showEditPropertyModal = false"
            class="mdc-button mdc-button--outlined w-full sm:w-auto"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="mdc-button mdc-button--raised w-full sm:w-auto"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">save</span>
            {{ $t('common.update') }}
          </button>
        </div>
        </form>
      </div>
    </div>

  <!-- Sponsorship Application Modal -->
  <div v-if="showSponsorshipModal" class="mdc-dialog" @click.self="showSponsorshipModal = false">
    <div class="mdc-dialog__surface" style="max-width: 500px;">
      <div class="flex items-center mb-4">
        <span class="material-icons text-amber-600 mr-2">star</span>
        <h3 class="mdc-dialog__title">{{ $t('dashboard.applyForSponsorship') }}</h3>
      </div>
        <form @submit.prevent="submitSponsorshipApplication" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ $t('dashboard.sponsorshipPackage') }}</label>
            <select
              v-model="sponsorshipForm.sponsorshipId"
              required
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">{{ $t('dashboard.selectPackage') }}</option>
              <option v-for="sponsorship in availableSponsorships" :key="sponsorship.id" :value="sponsorship.id">
                {{ sponsorship.name }} ({{ sponsorship.type }}) — ETB {{ Number(sponsorship.basePrice).toLocaleString() }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ $t('dashboard.startDate') }}</label>
            <input
              v-model="sponsorshipForm.startDate"
              type="datetime-local"
              required
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ $t('dashboard.endDate') }}</label>
            <input
              v-model="sponsorshipForm.endDate"
              type="datetime-local"
              required
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ $t('dashboard.notesOptional') }}</label>
            <textarea
              v-model="sponsorshipForm.notes"
              rows="3"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showSponsorshipModal = false"
              class="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-yellow-400"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 text-sm font-medium"
            >
              {{ $t('dashboard.apply') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- End Sponsorship Application Modal -->
    <!-- End Modals -->
    
    <!-- Quick Actions (if not registered as agent) -->
    <div v-if="!agent && !isSuperAgent && authStore.hasRole('REALTOR')" class="mdc-card mb-8">
        <div class="flex items-center mb-4">
          <span class="material-icons text-blue-600 mr-2">dashboard</span>
          <h2 class="mdc-typography--headline6 m-0">{{ $t('dashboard.quickActions') }}</h2>
        </div>
        <div class="space-y-3">
          <router-link
            to="/register-company"
            class="mdc-button mdc-button--outlined w-full mb-2"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">add_business</span>
            {{ $t('dashboard.registerRealEstateCompany') }}
          </router-link>
          <router-link
            to="/register-agent"
            class="mdc-button mdc-button--outlined w-full mb-2"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">person_add</span>
            {{ $t('dashboard.registerAsAgentShort') }}
          </router-link>
          <router-link
            to="/submit-property"
            class="mdc-button mdc-button--outlined w-full mb-2"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">add</span>
            {{ $t('property.submitProperty') }}
          </router-link>
          <router-link
            to="/properties"
            class="mdc-button mdc-button--outlined w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">home</span>
            {{ $t('nav.properties') }}
          </router-link>
        </div>
      </div>

      <!-- Admin Quick Access Card -->
      <div v-if="authStore.hasRole('ADMIN')" class="mdc-card mb-6">
        <div class="flex items-center mb-4">
          <span class="material-icons text-red-600 mr-2">admin_panel_settings</span>
          <h2 class="mdc-typography--headline6 m-0">{{ $t('admin.portalTitle') }}</h2>
        </div>
        <p class="mdc-typography--body2 text-gray-600 mb-4">
          {{ $t('admin.portalSubtitle') }}
        </p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <router-link
            to="/admin"
            class="mdc-button mdc-button--raised w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">dashboard</span>
            {{ $t('nav.dashboard') }}
          </router-link>
          <router-link
            to="/admin/users"
            class="mdc-button mdc-button--outlined w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">people</span>
            {{ $t('admin.users') }}
          </router-link>
          <router-link
            to="/admin/organizations"
            class="mdc-button mdc-button--outlined w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">business</span>
            {{ $t('admin.organizations') }}
          </router-link>
          <router-link
            to="/admin/sponsorships"
            class="mdc-button mdc-button--outlined w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">star</span>
            {{ $t('nav.sponsorships') }}
          </router-link>
        </div>
      </div>
    </div>
    <!-- End max-w-7xl -->
  </div>
  <!-- End min-h-screen -->
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth'
import { useRouter } from 'vue-router'
import api, { mediaUrl } from '@/shared/api/client'
import CountryCodePhoneInput from '@/shared/components/CountryCodePhoneInput.vue'
import { OsmMapPicker } from '@/shared/components'
import OrganizationSocialLinks from '@/shared/components/OrganizationSocialLinks.vue'
import OrgDocumentReviewsSummary from '@/shared/components/OrgDocumentReviewsSummary.vue'
import { DEFAULT_COUNTRY_CODE } from '@/shared/data/countryCodes'
import { formatPrice as formatCurrencyPrice, isVideoUrl } from '@/shared/utils'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const organization = ref(null)
const agent = ref(null)
const agents = ref([])
const properties = ref([])
const agentsLoading = ref(false)
const propertiesLoading = ref(false)
const isSuperAgent = ref(false)
const availableSponsorships = ref([])
const sponsorshipApplications = ref([])
const showSponsorshipModal = ref(false)
const showEditOrganizationModal = ref(false)
const organizationFormTab = ref('profile')
const organizationFormSaving = ref(false)
const organizationFormError = ref('')
const showEditAgentModal = ref(false)
const showEditPropertyModal = ref(false)
const editingAgent = ref(null)
const editingProperty = ref(null)
const sponsorshipForm = ref({
  sponsorshipId: '',
  startDate: '',
  endDate: '',
  notes: ''
})
const organizationForm = ref({
  name: '',
  registrationNumber: '',
  businessRegistration: '',
  license: '',
  vatRegistration: '',
  tinRegistration: '',
  businessRegistrationNumber: '',
  licenseNumber: '',
  vatNumber: '',
  tinNumber: '',
  address: '',
  city: '',
  country: '',
  latitude: null,
  longitude: null,
  phoneNumbers: [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }],
  email: '',
  website: '',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  description: ''
})
const orgDocUploading = ref({ businessRegistration: false, license: false, vatRegistration: false, tinRegistration: false })
const orgDocInputRefs = { businessRegistration: null, license: null, vatRegistration: null, tinRegistration: null }
const agentForm = ref({
  licenseNumber: '',
  notes: '',
  status: 'ACTIVE'
})
const propertyForm = ref({
  title: '',
  description: '',
  type: '',
  priceETB: null,
  priceUSD: null,
  address: '',
  city: '',
  country: '',
  bedrooms: null,
  bathrooms: null,
  area: null,
  floorNumber: null,
  totalFloors: null,
  constructionStatus: '',
  category: '',
  constructionPercentage: null,
  isFullyFurnished: false
})
const selectedFiles = ref([])
const fileInput = ref(null)
const approvedBanks = ref([])
const editExistingCreditOffers = ref([])
const editNewCreditOffers = ref([])

const newEditCreditOffer = () => ({
  bankId: '',
  coveragePercentage: 80
})

const loadDashboardData = async () => {
  if (!authStore.hasRole('REALTOR')) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    // First, try to get current agent profile
    try {
      const agentResponse = await api.get('/real-estate-agents/me')
      agent.value = agentResponse.data
      
      // Resolve org from agent, then GET full org (includes member-only fields such as document reviews)
      if (agent.value.organization) {
        organization.value = agent.value.organization
      } else if (agent.value.organizationId) {
        organization.value = { id: agent.value.organizationId }
      }
      if (organization.value?.id) {
        try {
          const fullOrg = await api.get(`/organizations/${organization.value.id}`)
          organization.value = fullOrg.data
        } catch (err) {
          console.error('Failed to load organization:', err)
        }
      }
      
      isSuperAgent.value = agent.value.isSuperAgent || false
      await loadApprovedBanks()
      
      // Load data based on role
      if (isSuperAgent.value) {
        // Super agent: load all agents, all organization properties, and sponsorships
        await Promise.all([
          loadAgents(),
          loadProperties(),
          loadSponsorships(),
          loadSponsorshipApplications()
        ])
      } else {
        // Regular agent: load only their properties
        await loadMyProperties()
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // User is not registered as an agent yet
        agent.value = null
        organization.value = null
        isSuperAgent.value = false
        
        // Check if they're a super agent (have an organization)
        try {
          const orgResponse = await api.get('/organizations/my-company')
          organization.value = orgResponse.data
          isSuperAgent.value = true
          await loadApprovedBanks()
          await Promise.all([
            loadAgents(),
            loadProperties()
          ])
        } catch (orgErr) {
          // Not a super agent either
        }
      } else {
        throw err
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

const loadAgents = async () => {
  if (!organization.value) return
  
  agentsLoading.value = true
  try {
    const response = await api.get(`/real-estate-agents/organization/${organization.value.id}`)
    agents.value = response.data
  } catch (err) {
    console.error('Failed to load agents:', err)
  } finally {
    agentsLoading.value = false
  }
}

const loadProperties = async () => {
  if (!organization.value) return
  
  propertiesLoading.value = true
  try {
    const response = await api.get(`/properties/organization/${organization.value.id}`)
    properties.value = response.data
  } catch (err) {
    console.error('Failed to load properties:', err)
  } finally {
    propertiesLoading.value = false
  }
}

const loadMyProperties = async () => {
  if (!agent.value) return
  
  propertiesLoading.value = true
  try {
    const response = await api.get(`/properties/agent/${agent.value.id}`)
    properties.value = response.data
  } catch (err) {
    console.error('Failed to load my properties:', err)
  } finally {
    propertiesLoading.value = false
  }
}

const loadApprovedBanks = async () => {
  try {
    const response = await api.get('/organizations', {
      params: {
        type: 'BANK',
        status: 'APPROVED'
      }
    })
    approvedBanks.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to load banks:', err)
    approvedBanks.value = []
  }
}

const loadPropertyFinancingOffers = async (propertyId) => {
  if (!propertyId) {
    editExistingCreditOffers.value = []
    return
  }
  try {
    const response = await api.get(`/properties/${propertyId}/financing-offers`)
    editExistingCreditOffers.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to load property financing offers:', err)
    editExistingCreditOffers.value = []
  }
}

const addEditCreditOfferRow = () => {
  editNewCreditOffers.value.push(newEditCreditOffer())
}

const removeEditCreditOfferRow = (index) => {
  editNewCreditOffers.value.splice(index, 1)
}

const getBankName = (bankId) => {
  if (!bankId) return 'Unknown bank'
  const match = approvedBanks.value.find((bank) => bank.id === bankId)
  return match?.name || 'Unknown bank'
}

const formatOfferCoverage = (offer) => {
  const ratio = offer?.specialLTVRatio ?? offer?.maxLoanToValueRatio
  if (ratio == null) return null
  return Number((Number(ratio) * 100).toFixed(2))
}

const validateEditCreditOffers = () => {
  const offers = editNewCreditOffers.value.map((offer) => ({
    bankId: (offer.bankId || '').trim(),
    coveragePercentage: Number(offer.coveragePercentage)
  }))

  if (!offers.length) {
    return { validOffers: [], validationError: '' }
  }

  const existingBankIds = new Set(
    editExistingCreditOffers.value
      .map((offer) => offer.bankId)
      .filter(Boolean)
      .map((bankId) => String(bankId))
  )
  const seenBanks = new Set()
  for (let i = 0; i < offers.length; i += 1) {
    const offer = offers[i]
    if (!offer.bankId) {
      return { validOffers: [], validationError: `Credit offer ${i + 1}: bank is required` }
    }
    if (!offer.coveragePercentage || offer.coveragePercentage <= 0 || offer.coveragePercentage > 100) {
      return { validOffers: [], validationError: `Credit offer ${i + 1}: coverage must be between 0 and 100` }
    }
    if (existingBankIds.has(offer.bankId)) {
      return { validOffers: [], validationError: `Credit offer ${i + 1}: selected bank already has an offer` }
    }
    if (seenBanks.has(offer.bankId)) {
      return { validOffers: [], validationError: `Credit offer ${i + 1}: duplicate bank selected` }
    }
    seenBanks.add(offer.bankId)
  }

  return { validOffers: offers, validationError: '' }
}

const loadSponsorships = async () => {
  try {
    const response = await api.get('/sponsorships/active')
    availableSponsorships.value = response.data
  } catch (err) {
    console.error('Failed to load sponsorships:', err)
  }
}

const loadSponsorshipApplications = async () => {
  if (!organization.value) return
  
  try {
    const response = await api.get('/sponsorships/applications/my-organization')
    sponsorshipApplications.value = response.data
  } catch (err) {
    console.error('Failed to load sponsorship applications:', err)
  }
}

const submitSponsorshipApplication = async () => {
  try {
    await api.post('/sponsorships/applications', {
      sponsorshipId: sponsorshipForm.value.sponsorshipId,
      startDate: new Date(sponsorshipForm.value.startDate).toISOString(),
      endDate: new Date(sponsorshipForm.value.endDate).toISOString(),
      notes: sponsorshipForm.value.notes || null
    })
    showSponsorshipModal.value = false
    sponsorshipForm.value = { sponsorshipId: '', startDate: '', endDate: '', notes: '' }
    await loadSponsorshipApplications()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to submit application')
  }
}

const cancelApplication = async (id) => {
  if (!confirm('Are you sure you want to cancel this application?')) return
  
  try {
    await api.put(`/sponsorships/applications/${id}/cancel`)
    await loadSponsorshipApplications()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to cancel application')
  }
}

const openEditOrganizationModal = async () => {
  if (!organization.value) return
  organizationFormError.value = ''
  organizationFormTab.value = 'profile'
  organizationForm.value = {
    name: organization.value.name || '',
    registrationNumber: organization.value.registrationNumber || '',
    businessRegistration: organization.value.businessRegistration || '',
    license: organization.value.license || '',
    vatRegistration: organization.value.vatRegistration || '',
    tinRegistration: organization.value.tinRegistration || '',
    businessRegistrationNumber: organization.value.businessRegistrationNumber || '',
    licenseNumber: organization.value.licenseNumber || '',
    vatNumber: organization.value.vatNumber || '',
    tinNumber: organization.value.tinNumber || '',
    address: organization.value.address || '',
    city: organization.value.city || '',
    country: organization.value.country || '',
    latitude: organization.value.latitude ?? null,
    longitude: organization.value.longitude ?? null,
    phoneNumbers: (organization.value.phoneNumbers && organization.value.phoneNumbers.length > 0)
      ? organization.value.phoneNumbers.map((p) => ({ countryCode: p.countryCode || DEFAULT_COUNTRY_CODE, number: p.number || '' }))
      : (organization.value.phoneNumber ? [{ countryCode: DEFAULT_COUNTRY_CODE, number: organization.value.phoneNumber.replace(/^\+\d+\s*/, '') }] : [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }]),
    email: organization.value.email || '',
    website: organization.value.website || '',
    facebookUrl: organization.value.facebookUrl || '',
    instagramUrl: organization.value.instagramUrl || '',
    linkedinUrl: organization.value.linkedinUrl || '',
    twitterUrl: organization.value.twitterUrl || '',
    youtubeUrl: organization.value.youtubeUrl || '',
    description: organization.value.description || ''
  }
  showEditOrganizationModal.value = true
  await nextTick()
  document.getElementById('dash-org-name')?.focus()
}

function hasSocialOnOrg(org) {
  if (!org) return false
  return ['facebookUrl', 'instagramUrl', 'linkedinUrl', 'twitterUrl', 'youtubeUrl'].some((k) =>
    String(org[k] || '').trim()
  )
}

function isDocumentUrl(value) {
  if (value == null || typeof value !== 'string') return false
  const v = value.trim()
  return v.startsWith('/api/') || v.startsWith('http://') || v.startsWith('https://')
}

const onUploadOrgDocument = async (ev, documentType, formKey) => {
  const file = ev.target?.files?.[0]
  if (!file || !organization.value?.id) {
    ev.target.value = ''
    return
  }
  orgDocUploading.value[formKey] = true
  try {
    const formData = new FormData()
    formData.append('documentType', documentType)
    formData.append('file', file)
    const { data } = await api.post(`/organizations/${organization.value.id}/documents`, formData)
    organization.value = data
    organizationForm.value[formKey] = data[formKey] ?? ''
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to upload document')
  } finally {
    orgDocUploading.value[formKey] = false
    ev.target.value = ''
  }
}

const updateOrganization = async () => {
  if (!organization.value) return
  organizationFormError.value = ''
  organizationFormSaving.value = true
  try {
    const phoneNumbers = (organizationForm.value.phoneNumbers || [])
      .filter((p) => (p.number || '').trim())
      .map((p) => ({ countryCode: p.countryCode || DEFAULT_COUNTRY_CODE, number: (p.number || '').trim() }))
    const response = await api.put(`/organizations/${organization.value.id}`, {
      name: organizationForm.value.name,
      registrationNumber: organizationForm.value.registrationNumber || undefined,
      businessRegistration: organizationForm.value.businessRegistration || undefined,
      license: organizationForm.value.license || undefined,
      vatRegistration: organizationForm.value.vatRegistration || undefined,
      tinRegistration: organizationForm.value.tinRegistration || undefined,
      businessRegistrationNumber: organizationForm.value.businessRegistrationNumber || undefined,
      licenseNumber: organizationForm.value.licenseNumber || undefined,
      vatNumber: organizationForm.value.vatNumber || undefined,
      tinNumber: organizationForm.value.tinNumber || undefined,
      address: organizationForm.value.address || undefined,
      city: organizationForm.value.city || undefined,
      country: organizationForm.value.country || undefined,
      latitude: organizationForm.value.latitude ?? undefined,
      longitude: organizationForm.value.longitude ?? undefined,
      phoneNumbers: phoneNumbers.length ? phoneNumbers : [{ countryCode: DEFAULT_COUNTRY_CODE, number: '' }],
      email: organizationForm.value.email || undefined,
      website: organizationForm.value.website || undefined,
      facebookUrl: organizationForm.value.facebookUrl || undefined,
      instagramUrl: organizationForm.value.instagramUrl || undefined,
      linkedinUrl: organizationForm.value.linkedinUrl || undefined,
      twitterUrl: organizationForm.value.twitterUrl || undefined,
      youtubeUrl: organizationForm.value.youtubeUrl || undefined,
      description: organizationForm.value.description || undefined,
      type: organization.value.type
    })
    organization.value = response.data
    showEditOrganizationModal.value = false
    alert('Organization updated successfully')
  } catch (err) {
    organizationFormError.value = err.response?.data?.message || err.message || 'Failed to update organization'
  } finally {
    organizationFormSaving.value = false
  }
}

const editAgent = (agentData) => {
  editingAgent.value = agentData
  agentForm.value = {
    licenseNumber: agentData.licenseNumber || '',
    notes: agentData.notes || '',
    status: agentData.status || 'ACTIVE'
  }
  showEditAgentModal.value = true
}

const updateAgent = async () => {
  if (!editingAgent.value) return
  
  try {
    await api.put(`/real-estate-agents/${editingAgent.value.id}`, agentForm.value)
    await loadAgents()
    showEditAgentModal.value = false
    editingAgent.value = null
    alert('Agent updated successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update agent')
  }
}

const editProperty = async (propertyData) => {
  if (!approvedBanks.value.length) {
    await loadApprovedBanks()
  }
  editingProperty.value = propertyData
  propertyForm.value = {
    title: propertyData.title || '',
    description: propertyData.description || '',
    type: propertyData.type || '',
    priceETB: propertyData.priceETB || null,
    priceUSD: propertyData.priceUSD || null,
    address: propertyData.address || '',
    city: propertyData.city || '',
    country: propertyData.country || '',
    bedrooms: propertyData.bedrooms || null,
    bathrooms: propertyData.bathrooms || null,
    area: propertyData.area || null,
    floorNumber: propertyData.floorNumber || null,
    totalFloors: propertyData.totalFloors || null,
    constructionStatus: propertyData.constructionStatus || '',
    category: propertyData.category || '',
    constructionPercentage: propertyData.constructionPercentage || null,
    isFullyFurnished: propertyData.isFullyFurnished || false
  }
  editExistingCreditOffers.value = []
  editNewCreditOffers.value = []
  await loadPropertyFinancingOffers(propertyData.id)
  selectedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  showEditPropertyModal.value = true
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} exceeds 10MB limit`)
      return
    }
    
    const fileObj = {
      file: file,
      name: file.name,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }
    selectedFiles.value.push(fileObj)
  })
}

const removeSelectedFile = (index) => {
  if (selectedFiles.value[index].preview) {
    URL.revokeObjectURL(selectedFiles.value[index].preview)
  }
  selectedFiles.value.splice(index, 1)
}

const deletePropertyImage = async (propertyId, imageId) => {
  if (!confirm('Are you sure you want to delete this image?')) return
  
  try {
    const res = await api.delete(`/properties/${propertyId}/images/${imageId}`)
    const updated = res?.data
    if (updated && editingProperty.value?.id === propertyId) {
      editingProperty.value = updated
    }
    await loadProperties()
    const inList = properties.value?.find(p => p.id === propertyId)
    if (inList && updated?.images) {
      inList.images = updated.images
    }
    alert('Image deleted successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete image')
  }
}

const updateProperty = async () => {
  if (!editingProperty.value) return
  
  try {
    const { validOffers: validEditOffers, validationError } = validateEditCreditOffers()
    if (validationError) {
      alert(validationError)
      return
    }

    // First update property details
    const payload = {
      title: propertyForm.value.title,
      description: propertyForm.value.description || null,
      type: propertyForm.value.type,
      priceETB: propertyForm.value.priceETB != null ? (typeof propertyForm.value.priceETB === 'number' ? propertyForm.value.priceETB : parseFloat(propertyForm.value.priceETB)) : null,
      priceUSD: propertyForm.value.priceUSD != null ? (typeof propertyForm.value.priceUSD === 'number' ? propertyForm.value.priceUSD : parseFloat(propertyForm.value.priceUSD)) : null,
      address: propertyForm.value.address,
      city: propertyForm.value.city,
      country: propertyForm.value.country,
      bedrooms: propertyForm.value.bedrooms != null ? (typeof propertyForm.value.bedrooms === 'number' ? propertyForm.value.bedrooms : parseInt(propertyForm.value.bedrooms)) : null,
      bathrooms: propertyForm.value.bathrooms != null ? (typeof propertyForm.value.bathrooms === 'number' ? propertyForm.value.bathrooms : parseInt(propertyForm.value.bathrooms)) : null,
      area: propertyForm.value.area != null ? (typeof propertyForm.value.area === 'number' ? propertyForm.value.area : parseFloat(propertyForm.value.area)) : null,
      floorNumber: propertyForm.value.floorNumber != null ? (typeof propertyForm.value.floorNumber === 'number' ? propertyForm.value.floorNumber : parseInt(propertyForm.value.floorNumber)) : null,
      totalFloors: propertyForm.value.totalFloors != null ? (typeof propertyForm.value.totalFloors === 'number' ? propertyForm.value.totalFloors : parseInt(propertyForm.value.totalFloors)) : null,
      constructionPercentage: propertyForm.value.constructionPercentage != null ? (typeof propertyForm.value.constructionPercentage === 'number' ? propertyForm.value.constructionPercentage : parseInt(propertyForm.value.constructionPercentage)) : null,
      isFullyFurnished: propertyForm.value.isFullyFurnished || false,
      realEstateCompanyId: organization.value.id,
      constructionStatus: propertyForm.value.constructionStatus,
      category: propertyForm.value.category || null
    }
    
    // Validate that at least one price is provided
    if (!payload.priceETB && !payload.priceUSD) {
      alert('Please provide at least one price (ETB or USD)')
      return
    }
    
    await api.put(`/properties/${editingProperty.value.id}`, payload)
    
    // Then upload new files if any and use response so new images show
    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach(fileObj => {
        formData.append('files', fileObj.file)
      })
      
      // Do not set Content-Type: let the browser set multipart/form-data with boundary
      const uploadRes = await api.post(`/properties/${editingProperty.value.id}/images`, formData)
      const updatedWithImages = uploadRes?.data
      if (updatedWithImages?.images) {
        editingProperty.value = updatedWithImages
      }
    }

    let failedOffersCount = 0
    if (validEditOffers.length > 0) {
      const offerResults = await Promise.allSettled(
        validEditOffers.map((offer) =>
          api.post(
            `/properties/${editingProperty.value.id}/financing-offers`,
            { coveragePercentage: offer.coveragePercentage },
            { params: { bankId: offer.bankId } }
          )
        )
      )
      failedOffersCount = offerResults.filter((result) => result.status === 'rejected').length
    }
    
    await loadProperties()
    showEditPropertyModal.value = false
    editingProperty.value = null
    editExistingCreditOffers.value = []
    editNewCreditOffers.value = []
    selectedFiles.value = []
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    alert(
      failedOffersCount > 0
        ? `Property updated, but ${failedOffersCount} credit offer(s) failed to save.`
        : 'Property updated successfully'
    )
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update property')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

onMounted(() => {
  loadDashboardData()
})
</script>

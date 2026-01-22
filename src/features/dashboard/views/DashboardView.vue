<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Material Design App Bar -->
    <div class="mdc-top-app-bar">
      <span class="material-icons">dashboard</span>
      <span class="mdc-top-app-bar__title">Dashboard</span>
    </div>

    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 mdc-typography--body1 text-gray-600">Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mdc-card mb-6" style="background-color: #ffebee; border-left: 4px solid #f44336;">
        <div class="flex items-center">
          <span class="material-icons text-red-600 mr-2">error</span>
          <div class="mdc-typography--body1 text-red-800">{{ error }}</div>
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
              <h2 class="mdc-typography--headline6 m-0">Your Account</h2>
            </div>
            <dl class="space-y-3">
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">Name:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</dd>
              </div>
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">Email:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ authStore.user?.email }}</dd>
              </div>
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">Roles:</dt>
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
              <h2 class="mdc-typography--headline6 m-0">Agent Profile</h2>
            </div>
            <dl class="space-y-3">
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">Status:</dt>
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
                <dt class="mdc-typography--body2 text-gray-600 w-32">License:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ agent.licenseNumber }}</dd>
              </div>
              <div v-if="agent.isSuperAgent" class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">Role:</dt>
                <dd class="mdc-chip mdc-chip--primary">Super Agent</dd>
              </div>
            </dl>
          </div>

          <!-- Company Info Card -->
          <div v-if="organization" class="mdc-card">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center">
                <span class="material-icons text-purple-600 mr-2">business</span>
                <h2 class="mdc-typography--headline6 m-0">Your Company</h2>
              </div>
              <button
                v-if="isSuperAgent"
                @click="openEditOrganizationModal"
                class="mdc-button mdc-button--text"
              >
                <span class="material-icons mr-1" style="font-size: 18px;">edit</span>
                Edit
              </button>
            </div>
            <dl class="space-y-3">
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">Name:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ organization.name }}</dd>
              </div>
              <div class="flex items-center">
                <dt class="mdc-typography--body2 text-gray-600 w-32">Status:</dt>
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
                <dt class="mdc-typography--body2 text-gray-600 w-32">Email:</dt>
                <dd class="mdc-typography--body1 text-gray-900">{{ organization.email }}</dd>
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
              <h2 class="mdc-typography--headline6 m-0">Register Your Company</h2>
            </div>
            <p class="mdc-typography--body2 text-gray-600 mb-4">
              Register your real estate company to start managing agents and properties.
            </p>
            <router-link
              to="/register-company"
              class="mdc-button mdc-button--raised"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">add</span>
              Register Company
            </router-link>
          </div>
        </div>

        <!-- Sponsorship Section (for super agents) -->
        <div v-if="organization && isSuperAgent" class="mdc-card mb-8">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <span class="material-icons text-amber-600 mr-2">star</span>
              <h2 class="mdc-typography--headline6 m-0">Sponsorships</h2>
            </div>
            <button
              @click="showSponsorshipModal = true"
              class="mdc-button mdc-button--raised"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">add</span>
              Apply for Sponsorship
            </button>
          </div>
          <div v-if="sponsorshipApplications.length === 0" class="text-center py-8">
            <span class="material-icons text-gray-400" style="font-size: 48px;">star_border</span>
            <p class="mdc-typography--body1 text-gray-500 mt-2">No sponsorship applications yet.</p>
            <p class="mdc-typography--body2 text-gray-400">Click "Apply for Sponsorship" to get started.</p>
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
                  Rejection reason: {{ app.rejectionReason }}
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
              <h2 class="mdc-typography--headline6 m-0">Agents</h2>
            </div>
            <button
              @click="$router.push('/create-agent')"
              class="mdc-button mdc-button--raised w-full sm:w-auto"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">person_add</span>
              <span class="hidden sm:inline">Create Agent</span>
              <span class="sm:hidden">Create</span>
            </button>
          </div>
          <div v-if="agentsLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mdc-typography--body2 text-gray-500 mt-2">Loading agents...</p>
          </div>
          <div v-else-if="agents.length === 0" class="text-center py-8">
            <span class="material-icons text-gray-400" style="font-size: 48px;">people_outline</span>
            <p class="mdc-typography--body1 text-gray-500 mt-2">No agents registered yet.</p>
            <p class="mdc-typography--body2 text-gray-400">Click "Create Agent" to add one.</p>
          </div>
          <template v-else>
            <!-- Mobile Card View -->
            <div class="block sm:hidden space-y-3">
              <div v-for="agent in agents" :key="agent.id" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center mb-1">
                      <span class="material-icons mr-2 text-gray-600" style="font-size: 20px;">person</span>
                      <span class="font-semibold text-gray-900">{{ agent.user?.firstName }} {{ agent.user?.lastName }}</span>
                    </div>
                    <p class="text-sm text-gray-600 ml-7">{{ agent.user?.email }}</p>
                  </div>
                  <button
                    @click="editAgent(agent)"
                    class="p-2 text-gray-600 hover:text-primary-600"
                  >
                    <span class="material-icons" style="font-size: 20px;">edit</span>
                  </button>
                </div>
                <div class="flex flex-wrap gap-2 ml-7">
                  <span :class="{
                    'px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800': agent.status === 'ACTIVE',
                    'px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800': agent.status === 'INACTIVE',
                    'px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800': agent.status === 'SUSPENDED'
                  }">
                    {{ agent.status }}
                  </span>
                  <span v-if="agent.isSuperAgent" class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Super Agent</span>
                </div>
              </div>
            </div>
            
            <!-- Desktop Table View -->
            <div class="hidden sm:block overflow-x-auto">
            <table class="mdc-data-table min-w-full">
              <thead class="mdc-data-table__header-row">
                <tr>
                  <th class="mdc-data-table__header-cell">Name</th>
                  <th class="mdc-data-table__header-cell">Email</th>
                  <th class="mdc-data-table__header-cell">Status</th>
                  <th class="mdc-data-table__header-cell">Super Agent</th>
                  <th class="mdc-data-table__header-cell">Actions</th>
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
                    <span v-if="agent.isSuperAgent" class="mdc-chip mdc-chip--primary">Yes</span>
                    <span v-else class="mdc-typography--body2 text-gray-500">No</span>
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
                {{ isSuperAgent ? 'Company Properties' : 'My Properties' }}
              </h2>
            </div>
            <button
              @click="$router.push('/submit-property')"
              class="mdc-button mdc-button--raised w-full sm:w-auto"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">add</span>
              <span class="hidden sm:inline">Submit Property</span>
              <span class="sm:hidden">Submit</span>
            </button>
          </div>
          <div v-if="propertiesLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mdc-typography--body2 text-gray-500 mt-2">Loading properties...</p>
          </div>
          <div v-else-if="properties.length === 0" class="text-center py-8">
            <span class="material-icons text-gray-400" style="font-size: 48px;">home_work</span>
            <p class="mdc-typography--body1 text-gray-500 mt-2">No properties listed yet.</p>
            <p class="mdc-typography--body2 text-gray-400">Click "Submit Property" to add one.</p>
          </div>
          <template v-else>
            <!-- Mobile Card View -->
            <div class="block sm:hidden space-y-3">
              <div v-for="property in properties" :key="property.id" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center mb-1">
                      <span class="material-icons mr-2 text-gray-600" style="font-size: 20px;">home</span>
                      <span class="font-semibold text-gray-900">{{ property.title }}</span>
                    </div>
                    <p class="text-sm text-gray-600 ml-7">{{ property.city }}</p>
                  </div>
                  <div class="flex gap-1">
                    <router-link
                      :to="`/properties/${property.id}`"
                      class="p-2 text-gray-600 hover:text-primary-600"
                    >
                      <span class="material-icons" style="font-size: 20px;">visibility</span>
                    </router-link>
                    <button
                      @click="editProperty(property)"
                      class="p-2 text-gray-600 hover:text-primary-600"
                    >
                      <span class="material-icons" style="font-size: 20px;">edit</span>
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 ml-7">
                  <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">{{ property.type }}</span>
                  <div class="flex flex-col gap-0.5">
                    <span v-if="property.priceETB" class="px-2 py-1 rounded text-xs font-medium font-semibold text-gray-900">{{ formatPrice(property.priceETB, 'ETB') }}</span>
                    <span v-if="property.priceUSD" class="px-2 py-1 rounded text-xs font-medium text-gray-700">{{ formatPrice(property.priceUSD, 'USD') }}</span>
                  </div>
                  <span :class="{
                    'px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800': property.status === 'AVAILABLE',
                    'px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800': property.status === 'RESERVED',
                    'px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800': property.status === 'SOLD'
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
                  <th class="mdc-data-table__header-cell">Title</th>
                  <th class="mdc-data-table__header-cell">Type</th>
                  <th class="mdc-data-table__header-cell">Price</th>
                  <th class="mdc-data-table__header-cell">City</th>
                  <th class="mdc-data-table__header-cell">Status</th>
                  <th class="mdc-data-table__header-cell">Actions</th>
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
        <div v-if="showEditOrganizationModal" class="mdc-dialog fixed inset-0 z-50 overflow-y-auto" @click.self="showEditOrganizationModal = false">
          <div class="mdc-dialog__surface m-4 sm:m-8" style="max-width: 600px; margin-left: auto; margin-right: auto;">
            <div class="flex items-center mb-4">
              <span class="material-icons text-blue-600 mr-2">business</span>
              <h3 class="mdc-dialog__title">Edit Organization</h3>
            </div>
        <form @submit.prevent="updateOrganization" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="mdc-text-field">
              <input
                v-model="organizationForm.name"
                type="text"
                required
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Name *</label>
            </div>
            <div class="mdc-text-field">
              <input
                v-model="organizationForm.registrationNumber"
                type="text"
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Registration Number</label>
            </div>
          </div>
          <div class="mdc-text-field">
            <input
              v-model="organizationForm.address"
              type="text"
              placeholder=" "
              class="mdc-text-field__input"
            />
            <label class="mdc-text-field__label">Address</label>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="mdc-text-field">
              <input
                v-model="organizationForm.city"
                type="text"
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">City</label>
            </div>
            <div class="mdc-text-field">
              <input
                v-model="organizationForm.country"
                type="text"
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Country</label>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="mdc-text-field">
              <input
                v-model="organizationForm.phoneNumber"
                type="text"
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Phone Number</label>
            </div>
            <div class="mdc-text-field">
              <input
                v-model="organizationForm.email"
                type="email"
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Email</label>
            </div>
          </div>
          <div class="mdc-text-field">
            <input
              v-model="organizationForm.website"
              type="url"
              placeholder=" "
              class="mdc-text-field__input"
            />
            <label class="mdc-text-field__label">Website</label>
          </div>
          <div class="mdc-text-field">
            <textarea
              v-model="organizationForm.description"
              rows="3"
              placeholder=" "
              class="mdc-text-field__input"
              style="min-height: 80px;"
            ></textarea>
            <label class="mdc-text-field__label">Description</label>
          </div>
            <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              <button
                type="button"
                @click="showEditOrganizationModal = false"
                class="mdc-button mdc-button--outlined w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="mdc-button mdc-button--raised w-full sm:w-auto"
              >
                <span class="material-icons mr-1" style="font-size: 18px;">save</span>
                Update
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Agent Modal -->
      <div v-if="showEditAgentModal" class="mdc-dialog fixed inset-0 z-50 overflow-y-auto" @click.self="showEditAgentModal = false">
        <div class="mdc-dialog__surface m-4 sm:m-8" style="max-width: 500px; margin-left: auto; margin-right: auto;">
          <div class="flex items-center mb-4">
            <span class="material-icons text-green-600 mr-2">badge</span>
            <h3 class="mdc-dialog__title">Edit Agent</h3>
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
            <label class="mdc-text-field__label">Agent Name</label>
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
            <label class="mdc-text-field__label">Email</label>
          </div>
          <div class="mdc-text-field">
            <input
              v-model="agentForm.licenseNumber"
              type="text"
              placeholder=" "
              class="mdc-text-field__input"
            />
            <label class="mdc-text-field__label">License Number</label>
          </div>
          <div class="mdc-text-field">
            <select
              v-model="agentForm.status"
              :disabled="editingAgent?.isSuperAgent"
              class="mdc-text-field__input"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <label class="mdc-text-field__label">Status</label>
            <p v-if="editingAgent?.isSuperAgent" class="mdc-typography--caption text-gray-500 mt-1">Super agent status cannot be changed</p>
          </div>
          <div class="mdc-text-field">
            <textarea
              v-model="agentForm.notes"
              rows="3"
              placeholder=" "
              class="mdc-text-field__input"
              style="min-height: 80px;"
            ></textarea>
            <label class="mdc-text-field__label">Notes</label>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <button
              type="button"
              @click="showEditAgentModal = false"
              class="mdc-button mdc-button--outlined w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="mdc-button mdc-button--raised w-full sm:w-auto"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">save</span>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Property Modal -->
    <div v-if="showEditPropertyModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50" @click.self="showEditPropertyModal = false">
      <div class="bg-white rounded-lg shadow-xl m-4 sm:m-8 p-6" style="max-width: 700px; max-height: 90vh; overflow-y: auto; margin-left: auto; margin-right: auto;">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <span class="material-icons text-teal-600 mr-2">home</span>
            <h3 class="text-xl font-semibold text-gray-900">Edit Property</h3>
          </div>
          <button
            type="button"
            @click="showEditPropertyModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <form @submit.prevent="updateProperty" class="space-y-4">
          <div>
            <label for="edit-title" class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              id="edit-title"
              v-model="propertyForm.title"
              type="text"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="edit-description"
              v-model="propertyForm.description"
              rows="3"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              style="min-height: 80px;"
            ></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="edit-type" class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                id="edit-type"
                v-model="propertyForm.type"
                required
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select type</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="CONDOMINIUM">Condominium</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
          </div>
          
          <!-- Price Fields -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Price *</label>
            <p class="text-xs text-gray-500">Provide at least one price (ETB or USD)</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="edit-priceETB" class="block text-xs font-medium text-gray-600 mb-1">Price (ETB/Birr)</label>
                <input
                  id="edit-priceETB"
                  v-model.number="propertyForm.priceETB"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label for="edit-priceUSD" class="block text-xs font-medium text-gray-600 mb-1">Price (USD/Dollar)</label>
                <input
                  id="edit-priceUSD"
                  v-model.number="propertyForm.priceUSD"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <p class="text-xs text-gray-500">At least one price (ETB or USD) is required</p>
          </div>
          <div>
            <label for="edit-address" class="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              id="edit-address"
              v-model="propertyForm.address"
              type="text"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="edit-city" class="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                id="edit-city"
                v-model="propertyForm.city"
                type="text"
                required
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label for="edit-country" class="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                id="edit-country"
                v-model="propertyForm.country"
                type="text"
                required
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label for="edit-area" class="block text-sm font-medium text-gray-700 mb-1">Area (sqm) *</label>
              <input
                id="edit-area"
                v-model.number="propertyForm.area"
                type="number"
                step="0.01"
                min="0"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label for="edit-bedrooms" class="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                id="edit-bedrooms"
                v-model.number="propertyForm.bedrooms"
                type="number"
                min="0"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label for="edit-bathrooms" class="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input
                id="edit-bathrooms"
                v-model.number="propertyForm.bathrooms"
                type="number"
                min="0"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="edit-floorNumber" class="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
              <input
                id="edit-floorNumber"
                v-model.number="propertyForm.floorNumber"
                type="number"
                min="0"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label for="edit-totalFloors" class="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
              <input
                id="edit-totalFloors"
                v-model.number="propertyForm.totalFloors"
                type="number"
                min="0"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label for="edit-constructionPercentage" class="block text-sm font-medium text-gray-700 mb-1">Construction Percentage (0-100)</label>
            <input
              id="edit-constructionPercentage"
              v-model.number="propertyForm.constructionPercentage"
              type="number"
              min="0"
              max="100"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div class="flex items-center">
            <input
              v-model="propertyForm.isFullyFurnished"
              type="checkbox"
              id="isFullyFurnished"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="isFullyFurnished" class="ml-2 text-sm text-gray-700">Fully Furnished</label>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="edit-constructionStatus" class="block text-sm font-medium text-gray-700 mb-1">Construction Status *</label>
              <select
                id="edit-constructionStatus"
                v-model="propertyForm.constructionStatus"
                required
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select status</option>
                <option value="COMPLETED">Completed</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="PLANNED">Planned</option>
                <option value="READY_TO_MOVE">Ready to Move</option>
              </select>
            </div>
            <div>
              <label for="edit-category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="edit-category"
                v-model="propertyForm.category"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select category</option>
                <option value="FOR_SALE">For Sale</option>
                <option value="FOR_RENTAL">For Rental</option>
              </select>
            </div>
          </div>
          
          <!-- Image/Video Upload Section -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Photos/Videos</label>
            <div class="space-y-3">
              <!-- Existing Images -->
              <div v-if="editingProperty && editingProperty.images && editingProperty.images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                <div v-for="image in editingProperty.images" :key="image.id" class="relative group">
                  <img :src="image.imageUrl" :alt="image.caption || 'Property image'" class="w-full h-24 object-cover rounded border border-gray-300" />
                  <button
                    type="button"
                    @click="deletePropertyImage(editingProperty.id, image.id)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"
                  >
                    <span class="material-icons" style="font-size: 16px;">close</span>
                  </button>
                  <div v-if="image.isPrimary" class="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">Primary</div>
                </div>
              </div>
              
              <!-- File Upload -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                  <span class="text-sm text-gray-600 mb-1">Click to upload photos or videos</span>
                  <span class="text-xs text-gray-500">Supports: JPG, PNG, GIF, MP4, MOV (Max 10MB each)</span>
                </label>
              </div>
              
              <!-- Selected Files Preview -->
              <div v-if="selectedFiles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div v-for="(file, index) in selectedFiles" :key="index" class="relative">
                  <div v-if="file.type.startsWith('image/')" class="relative">
                    <img :src="file.preview" :alt="file.name" class="w-full h-24 object-cover rounded border border-gray-300" />
                    <button
                      type="button"
                      @click="removeSelectedFile(index)"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"
                    >
                      <span class="material-icons" style="font-size: 16px;">close</span>
                    </button>
                  </div>
                  <div v-else class="relative bg-gray-100 rounded border border-gray-300 h-24 flex items-center justify-center">
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
            Cancel
          </button>
          <button
            type="submit"
            class="mdc-button mdc-button--raised w-full sm:w-auto"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">save</span>
            Update
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
        <h3 class="mdc-dialog__title">Apply for Sponsorship</h3>
      </div>
        <form @submit.prevent="submitSponsorshipApplication" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Sponsorship Package</label>
            <select
              v-model="sponsorshipForm.sponsorshipId"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a package</option>
              <option v-for="sponsorship in availableSponsorships" :key="sponsorship.id" :value="sponsorship.id">
                {{ sponsorship.name }} ({{ sponsorship.type }}) - ${{ sponsorship.basePrice }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              v-model="sponsorshipForm.startDate"
              type="datetime-local"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">End Date</label>
            <input
              v-model="sponsorshipForm.endDate"
              type="datetime-local"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              v-model="sponsorshipForm.notes"
              rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showSponsorshipModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
            >
              Apply
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
          <h2 class="mdc-typography--headline6 m-0">Quick Actions</h2>
        </div>
        <div class="space-y-3">
          <router-link
            to="/register-company"
            class="mdc-button mdc-button--outlined w-full mb-2"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">add_business</span>
            Register Real Estate Company
          </router-link>
          <router-link
            to="/register-agent"
            class="mdc-button mdc-button--outlined w-full mb-2"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">person_add</span>
            Register as Agent
          </router-link>
          <router-link
            to="/submit-property"
            class="mdc-button mdc-button--outlined w-full mb-2"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">add</span>
            Submit Property
          </router-link>
          <router-link
            to="/properties"
            class="mdc-button mdc-button--outlined w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">home</span>
            Browse Properties
          </router-link>
        </div>
      </div>

      <!-- Admin Quick Access Card -->
      <div v-if="authStore.hasRole('ADMIN')" class="mdc-card mb-6">
        <div class="flex items-center mb-4">
          <span class="material-icons text-red-600 mr-2">admin_panel_settings</span>
          <h2 class="mdc-typography--headline6 m-0">Admin Portal</h2>
        </div>
        <p class="mdc-typography--body2 text-gray-600 mb-4">
          Access the admin portal to manage users, organizations, properties, and more.
        </p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <router-link
            to="/admin"
            class="mdc-button mdc-button--raised w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">dashboard</span>
            Dashboard
          </router-link>
          <router-link
            to="/admin/users"
            class="mdc-button mdc-button--outlined w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">people</span>
            Users
          </router-link>
          <router-link
            to="/admin/organizations"
            class="mdc-button mdc-button--outlined w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">business</span>
            Organizations
          </router-link>
          <router-link
            to="/admin/sponsorships"
            class="mdc-button mdc-button--outlined w-full"
          >
            <span class="material-icons mr-1" style="font-size: 18px;">star</span>
            Sponsorships
          </router-link>
        </div>
      </div>
    </div>
    <!-- End max-w-7xl -->
  </div>
  <!-- End min-h-screen -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/features/auth'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

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
  address: '',
  city: '',
  country: '',
  phoneNumber: '',
  email: '',
  website: '',
  description: ''
})
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
      
      // Get organization from agent
      if (agent.value.organization) {
        organization.value = agent.value.organization
      } else if (agent.value.organizationId) {
        // Fetch organization details if not included
        try {
          const orgResponse = await api.get(`/organizations/${agent.value.organizationId}`)
          organization.value = orgResponse.data
        } catch (err) {
          console.error('Failed to load organization:', err)
        }
      }
      
      isSuperAgent.value = agent.value.isSuperAgent || false
      
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

const openEditOrganizationModal = () => {
  if (!organization.value) return
  organizationForm.value = {
    name: organization.value.name || '',
    registrationNumber: organization.value.registrationNumber || '',
    address: organization.value.address || '',
    city: organization.value.city || '',
    country: organization.value.country || '',
    phoneNumber: organization.value.phoneNumber || '',
    email: organization.value.email || '',
    website: organization.value.website || '',
    description: organization.value.description || ''
  }
  showEditOrganizationModal.value = true
}

const updateOrganization = async () => {
  if (!organization.value) return
  
  try {
    const response = await api.put(`/organizations/${organization.value.id}`, {
      ...organizationForm.value,
      type: organization.value.type
    })
    organization.value = response.data
    showEditOrganizationModal.value = false
    alert('Organization updated successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update organization')
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

const editProperty = (propertyData) => {
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
    await api.delete(`/properties/${propertyId}/images/${imageId}`)
    await loadProperties()
    // Update editingProperty to reflect deleted image
    if (editingProperty.value && editingProperty.value.images) {
      editingProperty.value.images = editingProperty.value.images.filter(img => img.id !== imageId)
    }
    alert('Image deleted successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete image')
  }
}

const updateProperty = async () => {
  if (!editingProperty.value) return
  
  try {
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
    
    // Then upload new files if any
    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach(fileObj => {
        formData.append('files', fileObj.file)
      })
      
      await api.post(`/properties/${editingProperty.value.id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    
    await loadProperties()
    showEditPropertyModal.value = false
    editingProperty.value = null
    selectedFiles.value = []
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    alert('Property updated successfully')
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

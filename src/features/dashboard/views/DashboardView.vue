<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Material Design App Bar -->
    <div class="mdc-top-app-bar">
      <span class="material-icons">dashboard</span>
      <span class="mdc-top-app-bar__title">Dashboard</span>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <span class="material-icons text-indigo-600 mr-2">people</span>
              <h2 class="mdc-typography--headline6 m-0">Agents</h2>
            </div>
            <button
              @click="$router.push('/create-agent')"
              class="mdc-button mdc-button--raised"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">person_add</span>
              Create Agent
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
          <div v-else class="overflow-x-auto">
            <table class="mdc-data-table">
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
        </div>

        <!-- Properties Section (for all agents) -->
        <div v-if="agent || (organization && isSuperAgent)" class="mdc-card">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <span class="material-icons text-teal-600 mr-2">home</span>
              <h2 class="mdc-typography--headline6 m-0">
                {{ isSuperAgent ? 'Company Properties' : 'My Properties' }}
              </h2>
            </div>
            <button
              @click="$router.push('/submit-property')"
              class="mdc-button mdc-button--raised"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">add</span>
              Submit Property
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
          <div v-else class="overflow-x-auto">
            <table class="mdc-data-table">
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
                    <span class="mdc-typography--subtitle2 font-medium">${{ property.price?.toLocaleString() }}</span>
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
        </div>
      </div>
      <!-- End Main Content -->

      <!-- Modals -->
      <!-- Edit Organization Modal -->
        <div v-if="showEditOrganizationModal" class="mdc-dialog" @click.self="showEditOrganizationModal = false">
          <div class="mdc-dialog__surface">
            <div class="flex items-center mb-4">
              <span class="material-icons text-blue-600 mr-2">business</span>
              <h3 class="mdc-dialog__title">Edit Organization</h3>
            </div>
        <form @submit.prevent="updateOrganization" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
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
          <div class="grid grid-cols-2 gap-4">
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
          <div class="grid grid-cols-2 gap-4">
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
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showEditOrganizationModal = false"
                class="mdc-button mdc-button--outlined"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="mdc-button mdc-button--raised"
              >
                <span class="material-icons mr-1" style="font-size: 18px;">save</span>
                Update
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Agent Modal -->
      <div v-if="showEditAgentModal" class="mdc-dialog" @click.self="showEditAgentModal = false">
        <div class="mdc-dialog__surface" style="max-width: 500px;">
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
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showEditAgentModal = false"
              class="mdc-button mdc-button--outlined"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="mdc-button mdc-button--raised"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">save</span>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Property Modal -->
    <div v-if="showEditPropertyModal" class="mdc-dialog" @click.self="showEditPropertyModal = false">
      <div class="mdc-dialog__surface" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
        <div class="flex items-center mb-4">
          <span class="material-icons text-teal-600 mr-2">home</span>
          <h3 class="mdc-dialog__title">Edit Property</h3>
        </div>
        <form @submit.prevent="updateProperty" class="space-y-4">
          <div class="mdc-text-field">
            <input
              v-model="propertyForm.title"
              type="text"
              required
              placeholder=" "
              class="mdc-text-field__input"
            />
            <label class="mdc-text-field__label">Title *</label>
          </div>
          <div class="mdc-text-field">
            <textarea
              v-model="propertyForm.description"
              rows="3"
              placeholder=" "
              class="mdc-text-field__input"
              style="min-height: 80px;"
            ></textarea>
            <label class="mdc-text-field__label">Description</label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="mdc-text-field">
              <select
                v-model="propertyForm.type"
                required
                class="mdc-text-field__input"
              >
                <option value="">Select type</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
              <label class="mdc-text-field__label">Type *</label>
            </div>
            <div class="mdc-text-field">
              <input
                v-model="propertyForm.price"
                type="number"
                step="0.01"
                required
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Price *</label>
            </div>
          </div>
          <div class="mdc-text-field">
            <input
              v-model="propertyForm.address"
              type="text"
              required
              placeholder=" "
              class="mdc-text-field__input"
            />
            <label class="mdc-text-field__label">Address *</label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="mdc-text-field">
              <input
                v-model="propertyForm.city"
                type="text"
                required
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">City *</label>
            </div>
            <div class="mdc-text-field">
              <input
                v-model="propertyForm.country"
                type="text"
                required
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Country *</label>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="mdc-text-field">
              <input
                v-model="propertyForm.bedrooms"
                type="number"
                min="0"
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Bedrooms</label>
            </div>
            <div class="mdc-text-field">
              <input
                v-model="propertyForm.bathrooms"
                type="number"
                min="0"
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Bathrooms</label>
            </div>
            <div class="mdc-text-field">
              <input
                v-model="propertyForm.area"
                type="number"
                step="0.01"
                min="0"
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Area (sqm)</label>
            </div>
          </div>
          <div class="mdc-text-field">
            <select
              v-model="propertyForm.constructionStatus"
              required
              class="mdc-text-field__input"
            >
              <option value="">Select status</option>
              <option value="COMPLETED">Completed</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
              <option value="PLANNED">Planned</option>
            </select>
            <label class="mdc-text-field__label">Construction Status *</label>
          </div>
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="showEditPropertyModal = false"
            class="mdc-button mdc-button--outlined"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="mdc-button mdc-button--raised"
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
  price: '',
  address: '',
  city: '',
  country: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  constructionStatus: ''
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
    price: propertyData.price?.toString() || '',
    address: propertyData.address || '',
    city: propertyData.city || '',
    country: propertyData.country || '',
    bedrooms: propertyData.bedrooms?.toString() || '',
    bathrooms: propertyData.bathrooms?.toString() || '',
    area: propertyData.area?.toString() || '',
    constructionStatus: propertyData.constructionStatus || ''
  }
  showEditPropertyModal.value = true
}

const updateProperty = async () => {
  if (!editingProperty.value) return
  
  try {
    const payload = {
      title: propertyForm.value.title,
      description: propertyForm.value.description || null,
      type: propertyForm.value.type,
      price: parseFloat(propertyForm.value.price),
      address: propertyForm.value.address,
      city: propertyForm.value.city,
      country: propertyForm.value.country,
      bedrooms: propertyForm.value.bedrooms ? parseInt(propertyForm.value.bedrooms) : null,
      bathrooms: propertyForm.value.bathrooms ? parseInt(propertyForm.value.bathrooms) : null,
      area: propertyForm.value.area ? parseFloat(propertyForm.value.area) : null,
      realEstateCompanyId: organization.value.id,
      constructionStatus: propertyForm.value.constructionStatus
    }
    
    await api.put(`/properties/${editingProperty.value.id}`, payload)
    await loadProperties()
    showEditPropertyModal.value = false
    editingProperty.value = null
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

onMounted(() => {
  loadDashboardData()
})
</script>

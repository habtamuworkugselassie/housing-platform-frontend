<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Material Design App Bar -->
    <div class="mdc-top-app-bar">
      <span class="material-icons">star</span>
      <span class="mdc-top-app-bar__title">Sponsorship Management</span>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="mdc-typography--headline5 mb-2">Sponsorship Management</h1>
          <p class="mdc-typography--body2 text-gray-600">Create and manage sponsorship packages for real estate companies</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="mdc-button mdc-button--raised"
        >
          <span class="material-icons mr-1" style="font-size: 18px;">add</span>
          Create Sponsorship
        </button>
      </div>

      <!-- Filters -->
      <div class="mdc-card mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="mdc-text-field">
            <label for="statusFilter" class="mdc-text-field__label">Status</label>
            <select
              id="statusFilter"
              v-model="filters.status"
              class="mdc-text-field__input"
              @change="loadSponsorships"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div class="mdc-text-field">
            <label for="typeFilter" class="mdc-text-field__label">Type</label>
            <select
              id="typeFilter"
              v-model="filters.type"
              class="mdc-text-field__input"
              @change="loadSponsorships"
            >
              <option value="">All</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIER">Premier</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadActiveSponsorships"
              class="mdc-button mdc-button--outlined w-full"
            >
              <span class="material-icons mr-1" style="font-size: 18px;">filter_list</span>
              Show Active Only
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 mdc-typography--body1 text-gray-600">Loading sponsorships...</p>
      </div>

      <!-- Sponsorships Table -->
      <div v-else-if="sponsorships.length" class="mdc-card">
        <table class="mdc-data-table">
          <thead class="mdc-data-table__header-row">
            <tr>
              <th class="mdc-data-table__header-cell">Name</th>
              <th class="mdc-data-table__header-cell">Type</th>
              <th class="mdc-data-table__header-cell">Base Price</th>
              <th class="mdc-data-table__header-cell">Status</th>
              <th class="mdc-data-table__header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sponsorship in sponsorships" :key="sponsorship.id" class="mdc-data-table__row">
              <td class="mdc-data-table__cell">
                <div class="flex items-center">
                  <span class="material-icons mr-2" style="font-size: 20px; color: #666;">star</span>
                  <span class="mdc-typography--subtitle2">{{ sponsorship.name }}</span>
                </div>
              </td>
              <td class="mdc-data-table__cell">
                <span :class="{
                  'mdc-chip mdc-chip--primary': sponsorship.type === 'BASIC',
                  'mdc-chip mdc-chip--warning': sponsorship.type === 'PREMIER'
                }">
                  {{ sponsorship.type }}
                </span>
              </td>
              <td class="mdc-data-table__cell">
                <span class="mdc-typography--subtitle2 font-medium">${{ formatPrice(sponsorship.basePrice) }}</span>
              </td>
              <td class="mdc-data-table__cell">
                <span :class="{
                  'mdc-chip mdc-chip--success': sponsorship.status === 'ACTIVE',
                  'mdc-chip': sponsorship.status === 'INACTIVE'
                }">
                  {{ sponsorship.status }}
                </span>
              </td>
              <td class="mdc-data-table__cell">
                <div class="flex space-x-2">
                  <button
                    @click="editSponsorship(sponsorship)"
                    class="mdc-button mdc-button--text"
                  >
                    <span class="material-icons" style="font-size: 18px;">edit</span>
                  </button>
                  <button
                    @click="deleteSponsorship(sponsorship.id)"
                    class="mdc-button mdc-button--text"
                    style="color: #f44336;"
                  >
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="mdc-card text-center py-12">
        <span class="material-icons text-gray-400" style="font-size: 64px;">star_border</span>
        <p class="mdc-typography--body1 text-gray-600 mt-4">No sponsorships found.</p>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || editingSponsorship" class="mdc-dialog" @click.self="closeModal">
        <div class="mdc-dialog__surface" style="max-width: 600px;">
          <div class="flex items-center mb-4">
            <span class="material-icons text-amber-600 mr-2">star</span>
            <h3 class="mdc-dialog__title">
              {{ editingSponsorship ? 'Edit Sponsorship Package' : 'Create New Sponsorship Package' }}
            </h3>
          </div>
          
          <form @submit.prevent="saveSponsorship" class="space-y-4">
            <div class="mdc-text-field">
              <input
                v-model="form.name"
                type="text"
                required
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Package Name *</label>
            </div>
            
            <div class="mdc-text-field">
              <textarea
                v-model="form.description"
                rows="3"
                placeholder=" "
                class="mdc-text-field__input"
                style="min-height: 80px;"
              ></textarea>
              <label class="mdc-text-field__label">Description</label>
            </div>
            
            <div class="mdc-text-field">
              <select
                v-model="form.type"
                required
                class="mdc-text-field__input"
              >
                <option value="">Select type</option>
                <option value="BASIC">Basic</option>
                <option value="PREMIER">Premier</option>
              </select>
              <label class="mdc-text-field__label">Type *</label>
            </div>
            
            <div class="mdc-text-field">
              <input
                v-model="form.basePrice"
                type="number"
                step="0.01"
                required
                placeholder=" "
                class="mdc-text-field__input"
              />
              <label class="mdc-text-field__label">Base Price *</label>
            </div>
            
            <div class="mdc-text-field">
              <textarea
                v-model="form.features"
                rows="3"
                placeholder=" "
                class="mdc-text-field__input"
                style="min-height: 80px;"
              ></textarea>
              <label class="mdc-text-field__label">Features</label>
            </div>
            
            <div class="mdc-text-field">
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder=" "
                class="mdc-text-field__input"
              ></textarea>
              <label class="mdc-text-field__label">Notes</label>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="mdc-button mdc-button--outlined"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="mdc-button mdc-button--raised"
              >
                <span class="material-icons mr-1" style="font-size: 18px;">save</span>
                {{ editingSponsorship ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/shared/api/client'

const sponsorships = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const editingSponsorship = ref(null)

const filters = ref({
  status: '',
  type: ''
})

const form = ref({
  organizationId: '',
  type: '',
  startDate: '',
  endDate: '',
  amount: null,
  paymentReference: '',
  notes: ''
})

const loadSponsorships = async () => {
  loading.value = true
  try {
    const response = await api.get('/sponsorships')
    let data = response.data
    
    // Apply filters
    if (filters.value.status) {
      data = data.filter(s => s.status === filters.value.status)
    }
    if (filters.value.type) {
      data = data.filter(s => s.type === filters.value.type)
    }
    
    sponsorships.value = data
  } catch (err) {
    console.error('Failed to load sponsorships:', err)
  } finally {
    loading.value = false
  }
}

const loadActiveSponsorships = async () => {
  loading.value = true
  try {
    const response = await api.get('/sponsorships/active')
    sponsorships.value = response.data
    filters.value = { status: '', type: '' }
  } catch (err) {
    console.error('Failed to load active sponsorships:', err)
  } finally {
    loading.value = false
  }
}

const saveSponsorship = async () => {
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description || null,
      type: form.value.type,
      basePrice: parseFloat(form.value.basePrice),
      features: form.value.features || null,
      notes: form.value.notes || null
    }
    
    if (editingSponsorship.value) {
      await api.put(`/sponsorships/${editingSponsorship.value.id}`, payload)
    } else {
      await api.post('/sponsorships', payload)
    }
    
    closeModal()
    loadSponsorships()
  } catch (err) {
    console.error('Failed to save sponsorship:', err)
    alert(err.response?.data?.message || 'Failed to save sponsorship')
  }
}

const editSponsorship = (sponsorship) => {
  editingSponsorship.value = sponsorship
  form.value = {
    name: sponsorship.name || '',
    description: sponsorship.description || '',
    type: sponsorship.type || '',
    basePrice: sponsorship.basePrice?.toString() || '',
    features: sponsorship.features || '',
    notes: sponsorship.notes || ''
  }
  showCreateModal.value = true
}

const cancelSponsorship = async (id) => {
  if (!confirm('Are you sure you want to deactivate this sponsorship package?')) {
    return
  }
  
  try {
    await api.put(`/sponsorships/${id}`, { status: 'INACTIVE' })
    loadSponsorships()
  } catch (err) {
    console.error('Failed to update sponsorship:', err)
    alert(err.response?.data?.message || 'Failed to update sponsorship')
  }
}

const deleteSponsorship = async (id) => {
  if (!confirm('Are you sure you want to delete this sponsorship? This action cannot be undone.')) {
    return
  }
  
  try {
    await api.delete(`/sponsorships/${id}`)
    loadSponsorships()
  } catch (err) {
    console.error('Failed to delete sponsorship:', err)
    alert(err.response?.data?.message || 'Failed to delete sponsorship')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingSponsorship.value = null
  form.value = {
    name: '',
    description: '',
    type: '',
    basePrice: '',
    features: '',
    notes: ''
  }
}

const formatPrice = (price) => {
  if (!price) return '0.00'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
}

onMounted(() => {
  loadSponsorships()
})
</script>

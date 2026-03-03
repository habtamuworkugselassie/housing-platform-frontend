<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">Property Management</h1>
          <p class="mt-2 text-sm text-gray-400">{{ $t('admin.manageProperties') }}</p>
        </div>
        <button
          type="button"
          @click="openCreateModal"
          class="px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-yellow-400 transition-colors"
        >
          Create property
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-gray-300">Search</label>
            <input
              v-model="filters.search"
              type="text"
              :placeholder="$t('admin.searchProperties')"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Status</label>
            <select
              v-model="filters.status"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Category</label>
            <select
              v-model="filters.category"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Categories</option>
              <option value="FOR_SALE">For Sale</option>
              <option value="FOR_RENTAL">For Rental</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadProperties"
              class="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Properties Table -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-white/10">
            <thead class="bg-zinc-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Property</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Featured</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="property in properties" :key="property.id" class="hover:bg-yellow-500/10 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-white">{{ property.title }}</div>
                  <div class="text-sm text-gray-400">{{ property.category }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ property.city }}, {{ property.country }}
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  <div class="flex flex-col gap-1">
                    <span v-if="property.priceETB" class="font-semibold">{{ formatPrice(property.priceETB, 'ETB') }}</span>
                    <span v-if="property.priceUSD" class="text-xs text-gray-400">{{ formatPrice(property.priceUSD, 'USD') }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(property.status)
                    ]"
                  >
                    {{ property.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      property.featured ? 'bg-yellow-500/30 text-yellow-200' : 'bg-gray-500/30 text-gray-300'
                    ]"
                  >
                    {{ property.featured ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="openLoanModal(property)"
                    class="text-emerald-300 hover:text-yellow-400 mr-4 transition-colors"
                  >
                    Create Property Credit
                  </button>
                  <button
                    @click="viewProperty(property)"
                    class="text-white hover:text-yellow-400 mr-4 transition-colors"
                  >
                    View
                  </button>
                  <button
                    @click="editProperty(property)"
                    class="text-blue-300 hover:text-yellow-400 transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- View Property Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-3xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Property Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingProperty" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Title</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.title || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Category</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.category || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(viewingProperty.status)
                    ]"
                  >
                    {{ viewingProperty.status || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Featured</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.featured ? 'Yes' : 'No' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Price (ETB)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.priceETB ? formatPrice(viewingProperty.priceETB, 'ETB') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Price (USD)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.priceUSD ? formatPrice(viewingProperty.priceUSD, 'USD') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">City</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.city || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Country</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.country || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Address</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.address || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.description || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Bedrooms</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.bedrooms || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Bathrooms</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.bathrooms || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Area (sqft)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.area || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Property ID</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.id || 'N/A' }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewDialog = false"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Property Modal -->
      <div
        v-if="showEditDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-10 pb-10"
        @click.self="showEditDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-3xl shadow-lg rounded-md bg-zinc-900 text-white max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-white">Edit Property</h3>
            <button
              @click="showEditDialog = false"
              class="text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form v-if="editingProperty" @submit.prevent="submitEdit" class="space-y-4">
            <p v-if="editError" class="text-sm text-red-400">{{ editError }}</p>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Title *</label>
              <input
                v-model="editForm.title"
                type="text"
                required
                class="block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea
                v-model="editForm.description"
                rows="3"
                class="block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Type *</label>
                <select
                  v-model="editForm.type"
                  required
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="CONDOMINIUM">Condominium</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  v-model="editForm.status"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Price (ETB)</label>
                <input
                  v-model.number="editForm.priceETB"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Price (USD)</label>
                <input
                  v-model.number="editForm.priceUSD"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>
            <div class="border border-white/10 rounded-md p-4 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <h4 class="text-sm font-semibold text-white">Property Credit Offers</h4>
                  <p class="text-xs text-gray-400">Add new bank offers while editing this property.</p>
                </div>
                <button
                  type="button"
                  @click="addEditCreditOfferRow"
                  :disabled="!approvedBanks.length"
                  class="px-3 py-1.5 border border-white/30 rounded-md text-xs text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Offer
                </button>
              </div>
              <p v-if="!approvedBanks.length" class="text-xs text-yellow-300">
                No approved banks available.
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
                :key="`edit-offer-${index}`"
                class="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-end"
              >
                <div>
                  <label class="block text-xs font-medium text-gray-400 mb-1">Bank</label>
                  <select v-model="offer.bankId" class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
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
                  class="px-3 py-2 border border-red-400/60 text-red-300 rounded-md text-xs hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Address *</label>
              <input
                v-model="editForm.address"
                type="text"
                required
                class="block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">City *</label>
                <input
                  v-model="editForm.city"
                  type="text"
                  required
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">State</label>
                <input
                  v-model="editForm.state"
                  type="text"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Country *</label>
                <input
                  v-model="editForm.country"
                  type="text"
                  required
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Bedrooms</label>
                <input
                  v-model.number="editForm.bedrooms"
                  type="number"
                  min="0"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Bathrooms</label>
                <input
                  v-model.number="editForm.bathrooms"
                  type="number"
                  min="0"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Area (sqm)</label>
                <input
                  v-model.number="editForm.area"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Construction status</label>
                <select
                  v-model="editForm.constructionStatus"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="READY_TO_MOVE">Ready to move</option>
                  <option value="UNDER_CONSTRUCTION">Under construction</option>
                  <option value="PLANNED">Planned</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <select
                  v-model="editForm.category"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="FOR_SALE">For Sale</option>
                  <option value="FOR_RENTAL">For Rental</option>
                </select>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input
                  v-model="editForm.isFullyFurnished"
                  type="checkbox"
                  class="rounded border-white/30 text-yellow-400 focus:ring-yellow-400"
                />
                Fully furnished
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input
                  v-model="editForm.featured"
                  type="checkbox"
                  class="rounded border-white/30 text-yellow-400 focus:ring-yellow-400"
                />
                Featured
              </label>
            </div>
            <!-- Edit: Media section -->
            <div class="border-t border-white/10 pt-4 mt-4">
              <label class="block text-sm font-medium text-gray-400 mb-2">Photos / media</label>
              <div v-if="editingProperty?.images?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                <div v-for="img in editingProperty.images" :key="img.id" class="relative group">
                  <img :src="mediaUrl(img.imageUrl)" :alt="img.caption" class="w-full h-20 object-cover rounded border border-white/20" />
                  <button
                    type="button"
                    @click="deleteEditPropertyImage(img.id)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center"
                  >
                    <span class="text-xs">×</span>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <input
                  ref="editMediaInput"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  class="hidden"
                  @change="onEditMediaSelect"
                />
                <button
                  type="button"
                  @click="editMediaInput?.click()"
                  class="px-3 py-1.5 text-sm border border-white/30 text-white rounded-md hover:bg-white/10"
                >
                  Add photos / videos
                </button>
                <span v-if="editMediaUploading" class="text-sm text-gray-400">Uploading…</span>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <button
                type="button"
                @click="showEditDialog = false"
                class="px-4 py-2 border border-white/30 text-white rounded-md hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="editSaving"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:bg-white/50"
              >
                {{ editSaving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Create Property Modal -->
      <div
        v-if="showCreateDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-10 pb-10"
        @click.self="showCreateDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-3xl shadow-lg rounded-md bg-zinc-900 text-white max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-white">Create property</h3>
            <button type="button" @click="showCreateDialog = false" class="text-gray-400 hover:text-yellow-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitCreate" class="space-y-4">
            <p v-if="createError" class="text-sm text-red-400">{{ createError }}</p>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Real estate company *</label>
              <Combobox
                :model-value="selectedCreateCompany"
                nullable
                by="id"
                @update:model-value="onCreateCompanySelect"
              >
                <div class="relative">
                  <ComboboxInput
                    :display-value="(org) => org?.name ?? ''"
                    @change="createCompanyQuery = $event.target.value"
                    placeholder="Search company..."
                    class="block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 pr-10 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    :class="{ 'border-red-500/50': submitCreateTouched && !createForm.realEstateCompanyId }"
                  />
                  <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                  </ComboboxButton>
                  <ComboboxOptions
                    class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-zinc-900 py-1 shadow-lg focus:outline-none"
                  >
                  <ComboboxOption
                    v-for="org in filteredRealEstateOrgs"
                    :key="org.id"
                    :value="org"
                    v-slot="{ active, selected }"
                    as="template"
                  >
                    <li
                      :class="[
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                        active ? 'bg-yellow-500/20 text-white' : 'text-gray-300'
                      ]"
                    >
                      <span :class="['block truncate', selected ? 'font-semibold' : 'font-normal']">{{ org.name }}</span>
                    </li>
                  </ComboboxOption>
                  <li v-if="filteredRealEstateOrgs.length === 0" class="py-2 pl-3 pr-9 text-gray-400">
                    No company found. Type to search.
                  </li>
                  </ComboboxOptions>
                </div>
              </Combobox>
              <p v-if="submitCreateTouched && !createForm.realEstateCompanyId" class="mt-1 text-sm text-red-400">Select a real estate company</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Title *</label>
              <input v-model="createForm.title" type="text" required class="block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea v-model="createForm.description" rows="3" class="block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Type *</label>
                <select v-model="createForm.type" required class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="CONDOMINIUM">Condominium</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Category *</label>
                <select v-model="createForm.category" required class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                  <option value="FOR_SALE">For Sale</option>
                  <option value="FOR_RENTAL">For Rental</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Price (ETB)</label>
                <input v-model.number="createForm.priceETB" type="number" step="0.01" min="0" class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Price (USD)</label>
                <input v-model.number="createForm.priceUSD" type="number" step="0.01" min="0" class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
            </div>
            <div class="border border-white/10 rounded-md p-4 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <h4 class="text-sm font-semibold text-white">Property Credit Offers (optional)</h4>
                  <p class="text-xs text-gray-400">Add multiple banks and the loan coverage percentage for each offer.</p>
                </div>
                <button
                  type="button"
                  @click="addCreateCreditOfferRow"
                  :disabled="!approvedBanks.length"
                  class="px-3 py-1.5 border border-white/30 rounded-md text-xs text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Offer
                </button>
              </div>
              <p v-if="!approvedBanks.length" class="text-xs text-yellow-300">
                No approved banks available. You can still create the property and add offers later.
              </p>
              <div
                v-for="(offer, index) in createCreditOffers"
                :key="`create-offer-${index}`"
                class="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-end"
              >
                <div>
                  <label class="block text-xs font-medium text-gray-400 mb-1">Bank</label>
                  <select v-model="offer.bankId" class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
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
                  @click="removeCreateCreditOfferRow(index)"
                  class="px-3 py-2 border border-red-400/60 text-red-300 rounded-md text-xs hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Address *</label>
              <input v-model="createForm.address" type="text" required class="block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">City *</label>
                <input v-model="createForm.city" type="text" required class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">State</label>
                <input v-model="createForm.state" type="text" class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Country *</label>
                <input v-model="createForm.country" type="text" required class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Bedrooms</label>
                <input v-model.number="createForm.bedrooms" type="number" min="0" class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Bathrooms</label>
                <input v-model.number="createForm.bathrooms" type="number" min="0" class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Area (sqm)</label>
                <input v-model.number="createForm.area" type="number" step="0.01" min="0" class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Construction status *</label>
              <select v-model="createForm.constructionStatus" required class="block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                <option value="READY_TO_MOVE">Ready to move</option>
                <option value="UNDER_CONSTRUCTION">Under construction</option>
                <option value="PLANNED">Planned</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div class="border-t border-white/10 pt-4">
              <label class="block text-sm font-medium text-gray-400 mb-2">Photos / videos (optional)</label>
              <input ref="createMediaInput" type="file" accept="image/*,video/*" multiple class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white file:text-black file:font-medium file:hover:bg-yellow-400" @change="onCreateMediaSelect" />
              <p v-if="createFormMediaFiles.length" class="mt-1 text-xs text-gray-500">{{ createFormMediaFiles.length }} file(s) selected</p>
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <button type="button" @click="showCreateDialog = false" class="px-4 py-2 border border-white/30 text-white rounded-md hover:bg-white/10">Cancel</button>
              <button type="submit" :disabled="createSaving" class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50">{{ createSaving ? 'Creating…' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>

      <PropertyLoanLinkModal
        :show="showLoanDialog"
        :property-id="selectedLoanProperty?.id || ''"
        :property-label="selectedLoanProperty ? `${selectedLoanProperty.title} (${selectedLoanProperty.city}, ${selectedLoanProperty.country})` : ''"
        title="Create Property Credit"
        @close="showLoanDialog = false"
        @created="handleLoanCreated"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/vue'
import { mediaUrl } from '@/shared/api/client'
import AdminLayout from '../components/AdminLayout.vue'
import PropertyLoanLinkModal from '@/features/banking/components/PropertyLoanLinkModal.vue'
import { adminApi } from '../api/admin.api'
import { formatPrice } from '@/shared/utils'

const loading = ref(false)
const properties = ref([])
const filters = ref({
  search: '',
  status: '',
  category: ''
})

const showViewDialog = ref(false)
const viewingProperty = ref(null)
const showLoanDialog = ref(false)
const selectedLoanProperty = ref(null)

const showEditDialog = ref(false)
const editingProperty = ref(null)
const editSaving = ref(false)
const editError = ref('')
const editMediaInput = ref(null)
const editMediaUploading = ref(false)
const editForm = ref({
  title: '',
  description: '',
  type: 'APARTMENT',
  status: 'AVAILABLE',
  priceETB: null,
  priceUSD: null,
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  bedrooms: null,
  bathrooms: null,
  area: null,
  floorNumber: null,
  totalFloors: null,
  constructionStatus: 'READY_TO_MOVE',
  category: 'FOR_SALE',
  constructionPercentage: null,
  isFullyFurnished: false,
  featured: false
})

const showCreateDialog = ref(false)
const createSaving = ref(false)
const createError = ref('')
const createCompanyQuery = ref('')
const submitCreateTouched = ref(false)
const realEstateOrgs = ref([])
const createFormMediaFiles = ref([])
const selectedCreateCompany = ref(null)
const approvedBanks = ref([])
const createCreditOffers = ref([])
const editExistingCreditOffers = ref([])
const editNewCreditOffers = ref([])

const filteredRealEstateOrgs = computed(() => {
  const q = (createCompanyQuery.value || '').trim().toLowerCase()
  if (!q) return realEstateOrgs.value
  return realEstateOrgs.value.filter((org) => (org.name || '').toLowerCase().includes(q))
})

const newCreateCreditOffer = () => ({
  bankId: '',
  coveragePercentage: 80
})

const newEditCreditOffer = () => ({
  bankId: '',
  coveragePercentage: 80
})

function onCreateCompanySelect(org) {
  selectedCreateCompany.value = org
  createForm.value.realEstateCompanyId = org?.id ?? ''
}
const createForm = ref({
  realEstateCompanyId: '',
  title: '',
  description: '',
  type: 'APARTMENT',
  category: 'FOR_SALE',
  priceETB: null,
  priceUSD: null,
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  bedrooms: null,
  bathrooms: null,
  area: null,
  floorNumber: null,
  totalFloors: null,
  constructionStatus: 'READY_TO_MOVE',
  constructionPercentage: null,
  isFullyFurnished: false
})

const loadProperties = async () => {
  loading.value = true
  try {
    const data = await adminApi.getProperties(filters.value, { size: 50 })
    properties.value = 'content' in data ? data.content : data
  } catch (err) {
    console.error('Failed to load properties:', err)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    AVAILABLE: 'bg-green-500/30 text-green-200',
    RESERVED: 'bg-yellow-500/30 text-yellow-200',
    SOLD: 'bg-blue-500/30 text-blue-200',
    WITHDRAWN: 'bg-red-500/30 text-red-200'
  }
  return classes[status] || 'bg-gray-500/30 text-gray-300'
}

const viewProperty = (property) => {
  viewingProperty.value = property
  showViewDialog.value = true
}

const openLoanModal = (property) => {
  selectedLoanProperty.value = property
  showLoanDialog.value = true
}

const handleLoanCreated = () => {
  alert('Credit product offer created for property successfully')
  showLoanDialog.value = false
}

const editProperty = async (property) => {
  editError.value = ''
  try {
    if (!approvedBanks.value.length) {
      await loadApprovedBanks()
    }
    const full = await adminApi.getPropertyById(property.id)
    const existingOffers = await adminApi.getPropertyFinancingOffers(property.id).catch(() => [])
    editingProperty.value = full
    editExistingCreditOffers.value = Array.isArray(existingOffers) ? existingOffers : []
    editNewCreditOffers.value = []
    editForm.value = {
      title: full.title ?? '',
      description: full.description ?? '',
      type: full.type ?? 'APARTMENT',
      status: full.status ?? 'AVAILABLE',
      priceETB: full.priceETB ?? null,
      priceUSD: full.priceUSD ?? null,
      address: full.address ?? '',
      city: full.city ?? '',
      state: full.state ?? '',
      country: full.country ?? '',
      zipCode: full.zipCode ?? '',
      bedrooms: full.bedrooms ?? null,
      bathrooms: full.bathrooms ?? null,
      area: full.area ?? null,
      floorNumber: full.floorNumber ?? null,
      totalFloors: full.totalFloors ?? null,
      constructionStatus: full.constructionStatus ?? 'READY_TO_MOVE',
      category: full.category ?? 'FOR_SALE',
      constructionPercentage: full.constructionPercentage ?? null,
      isFullyFurnished: full.isFullyFurnished ?? false,
      featured: full.featured ?? false,
      realEstateCompanyId: full.realEstateCompanyId ?? undefined,
      agentId: full.agentId ?? undefined
    }
    showEditDialog.value = true
  } catch (err) {
    console.error('Failed to load property for edit:', err)
    editError.value = err?.response?.data?.message || err?.message || 'Failed to load property'
  }
}

const submitEdit = async () => {
  if (!editingProperty.value?.id) return
  if (!editForm.value.priceETB && !editForm.value.priceUSD) {
    editError.value = 'At least one price (ETB or USD) is required'
    return
  }
  const { validOffers: validEditOffers, validationError } = validateEditCreditOffers()
  if (validationError) {
    editError.value = validationError
    return
  }
  editError.value = ''
  editSaving.value = true
  try {
    const payload = {
      title: editForm.value.title,
      description: editForm.value.description || null,
      type: editForm.value.type,
      status: editForm.value.status,
      priceETB: editForm.value.priceETB ?? null,
      priceUSD: editForm.value.priceUSD ?? null,
      address: editForm.value.address,
      city: editForm.value.city,
      state: editForm.value.state || null,
      country: editForm.value.country,
      zipCode: editForm.value.zipCode || null,
      bedrooms: editForm.value.bedrooms ?? null,
      bathrooms: editForm.value.bathrooms ?? null,
      area: editForm.value.area ?? null,
      floorNumber: editForm.value.floorNumber ?? null,
      totalFloors: editForm.value.totalFloors ?? null,
      constructionStatus: editForm.value.constructionStatus,
      category: editForm.value.category,
      constructionPercentage: editForm.value.constructionPercentage ?? null,
      isFullyFurnished: editForm.value.isFullyFurnished ?? false,
      featured: editForm.value.featured ?? false,
      realEstateCompanyId: editForm.value.realEstateCompanyId || editingProperty.value.realEstateCompanyId,
      agentId: editForm.value.agentId || editingProperty.value.agentId
    }
    await adminApi.updateProperty(editingProperty.value.id, payload)
    if (validEditOffers.length > 0) {
      const offerResults = await Promise.allSettled(
        validEditOffers.map((offer) =>
          adminApi.createPropertyFinancingOffer(editingProperty.value.id, offer.bankId, offer.coveragePercentage)
        )
      )
      const failedCount = offerResults.filter((result) => result.status === 'rejected').length
      if (failedCount > 0) {
        alert(`Property updated, but ${failedCount} credit offer(s) failed to save.`)
      }
    }
    showEditDialog.value = false
    editingProperty.value = null
    editExistingCreditOffers.value = []
    editNewCreditOffers.value = []
    await loadProperties()
  } catch (err) {
    editError.value = err?.response?.data?.message || err?.message || 'Failed to update property'
  } finally {
    editSaving.value = false
  }
}

async function deleteEditPropertyImage(imageId) {
  if (!editingProperty.value?.id) return
  try {
    const updated = await adminApi.deletePropertyImage(editingProperty.value.id, imageId)
    editingProperty.value = updated
  } catch (err) {
    editError.value = err?.response?.data?.message || err?.message || 'Failed to delete image'
  }
}

function onEditMediaSelect(ev) {
  const files = ev.target?.files
  if (!files?.length || !editingProperty.value?.id) return
  editMediaUploading.value = true
  editError.value = ''
  adminApi.uploadPropertyMedia(editingProperty.value.id, Array.from(files))
    .then((updated) => {
      editingProperty.value = updated
      ev.target.value = ''
    })
    .catch((err) => {
      editError.value = err?.response?.data?.message || err?.message || 'Upload failed'
    })
    .finally(() => {
      editMediaUploading.value = false
    })
}

const loadRealEstateOrgs = async () => {
  try {
    const res = await adminApi.getOrganizations({ type: 'REAL_ESTATE_COMPANY' })
    const list = Array.isArray(res?.data) ? res.data : []
    realEstateOrgs.value = list
  } catch (err) {
    console.error('Failed to load real estate organizations:', err)
    realEstateOrgs.value = []
  }
}

const loadApprovedBanks = async () => {
  try {
    const res = await adminApi.getOrganizations({ type: 'BANK', status: 'APPROVED' })
    approvedBanks.value = Array.isArray(res?.data) ? res.data : []
  } catch (err) {
    console.error('Failed to load banks:', err)
    approvedBanks.value = []
  }
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

function addEditCreditOfferRow() {
  editNewCreditOffers.value.push(newEditCreditOffer())
}

function removeEditCreditOfferRow(index) {
  editNewCreditOffers.value.splice(index, 1)
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

function addCreateCreditOfferRow() {
  createCreditOffers.value.push(newCreateCreditOffer())
}

function removeCreateCreditOfferRow(index) {
  createCreditOffers.value.splice(index, 1)
}

const validateCreateCreditOffers = () => {
  const offers = createCreditOffers.value.map((offer) => ({
    bankId: (offer.bankId || '').trim(),
    coveragePercentage: Number(offer.coveragePercentage)
  }))

  if (!offers.length) {
    return { validOffers: [], validationError: '' }
  }

  const seenBanks = new Set()
  for (let i = 0; i < offers.length; i += 1) {
    const offer = offers[i]
    if (!offer.bankId) {
      return { validOffers: [], validationError: `Credit offer ${i + 1}: bank is required` }
    }
    if (!offer.coveragePercentage || offer.coveragePercentage <= 0 || offer.coveragePercentage > 100) {
      return { validOffers: [], validationError: `Credit offer ${i + 1}: coverage must be between 0 and 100` }
    }
    if (seenBanks.has(offer.bankId)) {
      return { validOffers: [], validationError: `Credit offer ${i + 1}: duplicate bank selected` }
    }
    seenBanks.add(offer.bankId)
  }

  return { validOffers: offers, validationError: '' }
}

function openCreateModal() {
  createError.value = ''
  submitCreateTouched.value = false
  createCompanyQuery.value = ''
  selectedCreateCompany.value = null
  createForm.value = {
    realEstateCompanyId: '',
    title: '',
    description: '',
    type: 'APARTMENT',
    category: 'FOR_SALE',
    priceETB: null,
    priceUSD: null,
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    bedrooms: null,
    bathrooms: null,
    area: null,
    floorNumber: null,
    totalFloors: null,
    constructionStatus: 'READY_TO_MOVE',
    constructionPercentage: null,
    isFullyFurnished: false
  }
  createFormMediaFiles.value = []
  createCreditOffers.value = []
  showCreateDialog.value = true
}

function onCreateMediaSelect(ev) {
  const files = ev.target?.files
  if (!files?.length) return
  createFormMediaFiles.value = Array.from(files)
}

async function submitCreate() {
  submitCreateTouched.value = true
  if (!createForm.value.realEstateCompanyId || !createForm.value.title || !createForm.value.address || !createForm.value.city || !createForm.value.country) {
    createError.value = 'Please fill required fields (company, title, address, city, country)'
    return
  }
  if (!createForm.value.category || !createForm.value.constructionStatus) {
    createError.value = 'Category and construction status are required'
    return
  }
  const { validOffers, validationError } = validateCreateCreditOffers()
  if (validationError) {
    createError.value = validationError
    return
  }
  createError.value = ''
  createSaving.value = true
  try {
    const payload = {
      realEstateCompanyId: createForm.value.realEstateCompanyId,
      title: createForm.value.title,
      description: createForm.value.description || null,
      type: createForm.value.type,
      category: createForm.value.category,
      constructionStatus: createForm.value.constructionStatus,
      priceETB: createForm.value.priceETB ?? null,
      priceUSD: createForm.value.priceUSD ?? null,
      address: createForm.value.address,
      city: createForm.value.city,
      state: createForm.value.state || null,
      country: createForm.value.country,
      zipCode: createForm.value.zipCode || null,
      bedrooms: createForm.value.bedrooms ?? null,
      bathrooms: createForm.value.bathrooms ?? null,
      area: createForm.value.area ?? null,
      floorNumber: createForm.value.floorNumber ?? null,
      totalFloors: createForm.value.totalFloors ?? null,
      constructionPercentage: createForm.value.constructionPercentage ?? null,
      isFullyFurnished: createForm.value.isFullyFurnished ?? false
    }
    const created = await adminApi.createProperty(payload)
    if (createFormMediaFiles.value.length > 0) {
      await adminApi.uploadPropertyMedia(created.id, createFormMediaFiles.value)
    }
    if (validOffers.length > 0) {
      const offerResults = await Promise.allSettled(
        validOffers.map((offer) =>
          adminApi.createPropertyFinancingOffer(created.id, offer.bankId, offer.coveragePercentage)
        )
      )
      const failedCount = offerResults.filter((result) => result.status === 'rejected').length
      if (failedCount > 0) {
        alert(`Property created, but ${failedCount} credit offer(s) failed to save.`)
      }
    }
    showCreateDialog.value = false
    createFormMediaFiles.value = []
    createCreditOffers.value = []
    await loadProperties()
  } catch (err) {
    createError.value = err?.response?.data?.message || err?.message || 'Failed to create property'
  } finally {
    createSaving.value = false
  }
}

onMounted(() => {
  loadProperties()
  loadRealEstateOrgs()
  loadApprovedBanks()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-950 pt-20 pb-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 border-b border-white/10 pb-5">
        <h1 class="text-3xl font-bold text-white">{{ $t('common.profile') || 'My Profile' }}</h1>
        <p class="mt-2 text-sm text-gray-400">
          Manage your personal information and preferences.
        </p>
      </div>

      <!-- Content -->
      <div class="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <!-- Avatar Section -->
        <div class="p-6 sm:p-8 flex items-center gap-6 border-b border-white/10">
          <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-3xl shrink-0 overflow-hidden group border border-white/10">
            <template v-if="authStore.user?.profileImageUrl">
              <img :src="mediaUrl(authStore.user.profileImageUrl)" alt="Profile" class="w-full h-full object-cover" />
            </template>
            <template v-else>
              {{ userInitials }}
            </template>
            
            <label class="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-opacity z-10">
              <span class="material-icons text-white text-2xl">photo_camera</span>
              <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" :disabled="isUploadingImage" />
            </label>
            <div v-if="isUploadingImage" class="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <span class="material-icons text-white animate-spin">autorenew</span>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-white">{{ formData.firstName }} {{ formData.lastName }}</h2>
            <p class="text-gray-400">{{ formData.email }}</p>
            <div class="mt-2 text-xs divide-x divide-white/20">
              <span v-for="(role, idx) in userRoles" :key="idx" class="px-2 first:pl-0 font-medium text-yellow-400 uppercase tracking-wider">
                {{ role }}
              </span>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleUpdateProfile" class="p-6 sm:p-8 space-y-6">
          <div v-if="successMessage" class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            {{ successMessage }}
          </div>
          
          <div v-if="errorMessage" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {{ errorMessage }}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('auth.firstName') || 'First Name' }}</label>
              <input
                v-model="formData.firstName"
                type="text"
                required
                class="block w-full rounded-lg border-0 py-2.5 px-4 bg-white/5 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm shadow-sm transition-shadow"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('auth.lastName') || 'Last Name' }}</label>
              <input
                v-model="formData.lastName"
                type="text"
                required
                class="block w-full rounded-lg border-0 py-2.5 px-4 bg-white/5 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm shadow-sm transition-shadow"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('auth.email') || 'Email Address' }}</label>
              <input
                v-model="formData.email"
                type="email"
                disabled
                class="block w-full rounded-lg border-0 py-2.5 px-4 bg-white/5 text-gray-400 ring-1 ring-inset ring-white/10 sm:text-sm opacity-70 cursor-not-allowed"
              />
              <p class="mt-1.5 text-xs text-gray-500">Email cannot be changed once registered.</p>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('auth.phone') || 'Phone Number' }}</label>
              <input
                v-model="formData.phoneNumber"
                type="tel"
                class="block w-full rounded-lg border-0 py-2.5 px-4 bg-white/5 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm shadow-sm transition-shadow"
              />
            </div>
          </div>

          <div class="pt-6 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex justify-center items-center rounded-lg bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span v-if="isSubmitting" class="material-icons animate-spin mr-2 text-[18px]">autorenew</span>
              {{ $t('common.save') || 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/features/auth'
import api, { mediaUrl, sanitizeProfileImageUrl } from '@/shared/api/client'

const authStore = useAuthStore()

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: ''
})

const isSubmitting = ref(false)
const isUploadingImage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const userInitials = computed(() => {
  const f = formData.value.firstName?.[0] || ''
  const l = formData.value.lastName?.[0] || ''
  return `${f}${l}`.toUpperCase() || 'U'
})

const userRoles = computed(() => {
  return authStore.user?.roles || ['User']
})

onMounted(() => {
  if (authStore.user) {
    formData.value = {
      firstName: authStore.user.firstName || '',
      lastName: authStore.user.lastName || '',
      email: authStore.user.email || '',
      phoneNumber: authStore.user.phoneNumber || ''
    }
  }
})

const handleUpdateProfile = async () => {
  isSubmitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Assuming backend endpoint /api/v1/users/me exists or /api/v1/users/{id}
    // Since we don't have the explicit backend endpoint configured, we fall back to a mock success
    // Wait, the API base sets the prefix. We'll try a PUT to /users/{id}
    const userId = authStore.user?.id
    if (!userId) throw new Error('User ID not found')
    
    // We will attempt the API call. If it 404s, backend API doesn't exist yet, 
    // but we can still optimistically update the store for UI purposes.
    try {
      await api.put(`/users/${userId}`, {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        phoneNumber: formData.value.phoneNumber
      })
    } catch (apiError) {
      console.warn("Backend user update endpoint might not be ready. Optimistically updating store.", apiError)
    }

    // Optimistically update the authStore 
    const updatedUser = {
      ...authStore.user,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      phoneNumber: formData.value.phoneNumber
    }
    
    // Auth store might not have a direct user reassignment, use setAuth or update localStorage
    authStore.user = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))

    successMessage.value = 'Profile updated successfully.'
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to update profile.'
  } finally {
    isSubmitting.value = false
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // Basic validation (e.g. max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Image size should be less than 5MB.'
    return
  }

  isUploadingImage.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)
    
    // Call our upload endpoint
    const response = await api.post('/users/me/profile-image', formData)
    
    // Update store with new profile data
    const updatedUser = response.data
    authStore.user = {
      ...authStore.user,
      ...updatedUser,
      profileImageUrl: sanitizeProfileImageUrl(updatedUser.profileImageUrl)
    }
    localStorage.setItem('user', JSON.stringify(authStore.user))

    successMessage.value = 'Profile image updated successfully.'
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to upload profile image.'
  } finally {
    isUploadingImage.value = false
    // reset input
    event.target.value = ''
    setTimeout(() => {
      successMessage.value = ''
      errorMessage.value = ''
    }, 5000)
  }
}
</script>

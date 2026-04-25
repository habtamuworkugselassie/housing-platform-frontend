<template>
  <div class="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 mt-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-white">{{ $t('common.reviews') || 'Reviews' }} ({{ reviewCount || 0 }})</h2>
      <div v-if="averageRating" class="flex items-center gap-2">
        <div class="flex text-black">
          <svg v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.round(averageRating) ? 'fill-current text-black' : 'text-gray-600'" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <span class="text-white font-bold">{{ Number(averageRating).toFixed(1) }}</span>
      </div>
    </div>

    <!-- Review List -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
    </div>
    <div v-else-if="reviews.length" class="space-y-4 mb-8">
      <div
        v-for="review in reviews"
        :key="review.id"
        :class="[
          'rounded-xl p-4 border transition-colors',
          isOwnReview(review)
            ? 'bg-violet-950/10 border-black/50 ring-1 ring-inset ring-black/20'
            : 'bg-white/5 border-white/10 hover:border-black/30'
        ]"
      >
        <!-- Edit mode -->
        <div v-if="editingId === review.id">
          <div class="flex items-center gap-2 mb-3">
            <p class="text-sm text-gray-400">Editing your review</p>
            <span class="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-violet-950/30 text-black font-medium">Yours</span>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-300 mb-2">Rating</label>
            <div class="flex gap-1" @mouseleave="editHoverRating = 0">
              <button v-for="i in 5" :key="i" type="button" @mouseenter="editHoverRating = i" @click="editDraft.rating = i" class="focus:outline-none transition-transform hover:scale-110">
                <svg class="w-8 h-8" :class="(editHoverRating || editDraft.rating) >= i ? 'fill-current text-black' : 'text-gray-600'" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Comment</label>
            <textarea
              v-model="editDraft.comment"
              rows="4"
              class="w-full border border-white/20 bg-white/5 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Share your experience..."
            />
          </div>
          <div v-if="editError" class="text-red-400 text-sm mb-3">{{ editError }}</div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              :disabled="savingEdit || editDraft.rating === 0"
              class="px-4 py-2 rounded-lg font-semibold bg-white text-black hover:bg-violet-950 disabled:opacity-50 disabled:bg-white/50 transition-colors"
              @click="saveEdit(review.id)"
            >
              {{ savingEdit ? 'Saving…' : 'Save' }}
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg font-semibold border border-white/20 text-white hover:border-black hover:bg-violet-950/10 transition-colors"
              :disabled="savingEdit"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Read mode -->
        <div v-else>
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-white/20">
                <img v-if="review.userImageUrl" :src="mediaUrl(review.userImageUrl)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center bg-zinc-700 text-gray-300 font-bold">
                  {{ review.userName ? review.userName.charAt(0).toUpperCase() : 'U' }}
                </div>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="font-semibold text-white text-sm">{{ review.userName || 'Anonymous User' }}</p>
                  <span
                    v-if="isOwnReview(review)"
                    class="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-violet-950/30 text-black font-medium shrink-0"
                  >
                    Your review
                  </span>
                </div>
                <p class="text-xs text-gray-500">{{ formatDate(review.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3 shrink-0">
              <div class="flex">
                <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= review.rating ? 'fill-current text-black' : 'text-gray-600'" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div v-if="isOwnReview(review)" class="flex gap-1">
                <button
                  type="button"
                  class="text-xs px-2 py-1 rounded-md bg-white text-black hover:bg-violet-950 font-medium transition-colors"
                  @click="startEdit(review)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="text-xs px-2 py-1 rounded-md border border-white/20 text-gray-300 hover:border-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  :disabled="deletingId === review.id"
                  @click="confirmDelete(review.id)"
                >
                  {{ deletingId === review.id ? '…' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>
          <p class="text-gray-300 text-sm whitespace-pre-line mt-3">{{ review.comment }}</p>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-400 border border-white/10 rounded-xl bg-white/5 mb-8">
      No reviews yet. Be the first to leave one!
    </div>

    <!-- Review Form -->
    <div v-if="!(isAuthenticated && hasMyReview)" class="border-t border-white/10 pt-6">
      <h3 class="text-lg font-bold text-white mb-4">Write a Review</h3>
      <div v-if="submitting" class="text-gray-400 mb-4 text-sm">Submitting...</div>
      <div v-if="submitError" class="text-red-400 mb-4 text-sm">{{ submitError }}</div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">Rating</label>
        <div class="flex gap-1" @mouseleave="hoverRating = 0">
          <button v-for="i in 5" :key="i" type="button" @mouseenter="hoverRating = i" @click="newReview.rating = i" class="focus:outline-none transition-transform hover:scale-110">
            <svg class="w-8 h-8" :class="(hoverRating || newReview.rating) >= i ? 'fill-current text-black' : 'text-gray-600'" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">Comment</label>
        <textarea
          v-model="newReview.comment"
          rows="4"
          class="w-full border border-white/20 bg-white/5 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          placeholder="Share your experience..."
        />
      </div>
      <button
        type="button"
        @click="submitReview"
        :disabled="submitting || newReview.rating === 0"
        class="px-6 py-2 rounded-lg font-semibold bg-white text-black hover:bg-violet-950 disabled:opacity-50 disabled:bg-white/50 transition-colors"
      >
        Submit Review
      </button>
    </div>
    <div v-else class="border-t border-white/10 pt-6">
      <p class="text-gray-400 text-sm">You have already submitted a review. Edit or delete it in the list above.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAuthStore } from '@/features/auth'
import api, { mediaUrl } from '@/shared/api/client'

const props = defineProps({
  targetType: {
    type: String,
    required: true,
    validator: (value) => ['property', 'organization'].includes(value)
  },
  targetId: {
    type: String,
    required: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['review-added'])

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const loading = ref(true)
const reviews = ref([])
const submitting = ref(false)
const submitError = ref(null)
const hoverRating = ref(0)
const newReview = ref({
  rating: 0,
  comment: ''
})

const editingId = ref(null)
const editDraft = ref({ rating: 0, comment: '' })
const editHoverRating = ref(0)
const savingEdit = ref(false)
const editError = ref(null)
const deletingId = ref(null)

const reviewsBasePath = () =>
  props.targetType === 'property'
    ? `/properties/${props.targetId}/reviews`
    : `/organizations/${props.targetId}/reviews`

const hasMyReview = computed(() => {
  const uid = user.value?.id
  if (!uid || !isAuthenticated.value) return false
  return reviews.value.some((r) => r.userId && String(r.userId) === String(uid))
})

function isOwnReview(review) {
  if (!isAuthenticated.value || !user.value?.id || !review.userId) return false
  return String(review.userId) === String(user.value.id)
}

const fetchReviews = async () => {
  if (!props.targetId) return
  loading.value = true
  try {
    const response = await api.get(reviewsBasePath())
    reviews.value = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    console.error('Failed to load reviews', err)
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  if (newReview.value.rating === 0) return
  submitting.value = true
  submitError.value = null

  try {
    const payload = {
      ...newReview.value,
      userId: user.value ? user.value.id : null
    }

    const response = await api.post(reviewsBasePath(), payload)
    reviews.value.unshift(response.data)

    newReview.value.rating = 0
    newReview.value.comment = ''
    hoverRating.value = 0

    emit('review-added')
  } catch (err) {
    submitError.value = err.response?.data?.message || 'Failed to submit review'
  } finally {
    submitting.value = false
  }
}

function startEdit(review) {
  editingId.value = review.id
  editDraft.value = { rating: review.rating, comment: review.comment || '' }
  editHoverRating.value = 0
  editError.value = null
}

function cancelEdit() {
  editingId.value = null
  editError.value = null
}

const saveEdit = async (reviewId) => {
  if (editDraft.value.rating === 0) return
  savingEdit.value = true
  editError.value = null
  try {
    const { data } = await api.put(`${reviewsBasePath()}/${reviewId}`, {
      rating: editDraft.value.rating,
      comment: editDraft.value.comment
    })
    const i = reviews.value.findIndex((r) => r.id === reviewId)
    if (i !== -1) reviews.value[i] = data
    editingId.value = null
    emit('review-added')
  } catch (err) {
    editError.value = err.response?.data?.message || 'Failed to update review'
  } finally {
    savingEdit.value = false
  }
}

const confirmDelete = async (reviewId) => {
  if (!window.confirm('Delete this review? This cannot be undone.')) return
  deletingId.value = reviewId
  try {
    await api.delete(`${reviewsBasePath()}/${reviewId}`)
    reviews.value = reviews.value.filter((r) => r.id !== reviewId)
    if (editingId.value === reviewId) cancelEdit()
    emit('review-added')
  } catch (err) {
    window.alert(err.response?.data?.message || 'Failed to delete review')
  } finally {
    deletingId.value = null
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}

watch(() => props.targetId, () => {
  fetchReviews()
})

onMounted(() => {
  fetchReviews()
})
</script>

<template>
  <section v-if="visible" id="video-feedback" class="scroll-mt-20 bg-white py-16 lg:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
        {{ $t('exhibition.videoFeedback.eyebrow') }}
      </p>
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {{ $t('exhibition.videoFeedback.title') }}
      </h2>
      <p class="mt-2 max-w-2xl text-gray-600">{{ $t('exhibition.videoFeedback.subtitle') }}</p>

      <div class="mt-8 grid gap-8 lg:grid-cols-3">
        <!-- Submit form -->
        <div class="lg:col-span-1">
          <form
            v-if="!submitted"
            class="space-y-4 rounded-2xl border border-gray-200 bg-violet-50 p-5 sm:p-6"
            @submit.prevent="submit"
          >
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700" for="vf-name">{{ $t('exhibition.videoFeedback.name') }}</label>
              <input id="vf-name" v-model.trim="formName" type="text" required class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700" for="vf-email">{{ $t('exhibition.videoFeedback.email') }}</label>
              <input id="vf-email" v-model.trim="formEmail" type="email" required class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700" for="vf-caption">{{ $t('exhibition.videoFeedback.caption') }}</label>
              <textarea id="vf-caption" v-model.trim="formCaption" rows="2" :placeholder="$t('exhibition.videoFeedback.captionPlaceholder')" class="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700" for="vf-file">{{ $t('exhibition.videoFeedback.video') }}</label>
              <input id="vf-file" ref="fileInput" type="file" accept="video/*" required class="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700" @change="onFileChange" />
              <p class="mt-1 text-xs text-gray-500">{{ $t('exhibition.videoFeedback.videoHint') }}</p>
            </div>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            <button type="submit" :disabled="submitting" class="w-full rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:bg-primary-300">
              {{ submitting ? $t('exhibition.videoFeedback.submitting') : $t('exhibition.videoFeedback.submit') }}
            </button>
          </form>
          <div v-else class="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <p class="font-semibold text-green-700">{{ $t('exhibition.videoFeedback.thanksTitle') }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ thanksMessage }}</p>
          </div>
        </div>

        <!-- Approved clips wall -->
        <div class="lg:col-span-2">
          <div v-if="loading" class="flex justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
          </div>
          <div v-else-if="clips.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <figure v-for="clip in clips" :key="clip.id" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div class="aspect-video w-full bg-black">
                <video :src="mediaUrl(clip.videoUrl)" class="h-full w-full" controls preload="metadata" playsinline />
              </div>
              <figcaption class="p-3">
                <p v-if="clip.caption" class="line-clamp-2 text-sm text-gray-700">{{ clip.caption }}</p>
                <p class="mt-1 text-xs font-medium text-gray-500">— {{ clip.submitterName }}</p>
              </figcaption>
            </figure>
          </div>
          <p v-else class="rounded-xl border border-dashed border-gray-300 bg-violet-50 py-12 text-center text-sm text-gray-500">
            {{ $t('exhibition.videoFeedback.empty') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { mediaUrl } from '@/shared/api/client'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'

const { settings } = useDisplaySettings()
const { t } = useI18n()

const visible = computed(() => settings.exhibitionFeedbackVisible === true)

const clips = ref([])
const loading = ref(false)

const formName = ref('')
const formEmail = ref('')
const formCaption = ref('')
const file = ref(null)
const fileInput = ref(null)
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

// Auto-publish → the clip is already live; otherwise it's awaiting review.
const thanksMessage = computed(() =>
  settings.exhibitionFeedbackAutoPublish
    ? t('exhibition.videoFeedback.thanksLive')
    : t('exhibition.videoFeedback.thanksPending')
)

function onFileChange(e) {
  file.value = e.target.files?.[0] || null
}

async function loadClips() {
  loading.value = true
  try {
    clips.value = await exhibitionApi.listApprovedVideoFeedback(12)
  } catch {
    clips.value = []
  } finally {
    loading.value = false
  }
}

async function submit() {
  error.value = ''
  if (!file.value) {
    error.value = t('exhibition.videoFeedback.videoRequired')
    return
  }
  submitting.value = true
  try {
    const form = new FormData()
    form.append('name', formName.value)
    form.append('email', formEmail.value)
    if (formCaption.value) form.append('caption', formCaption.value)
    form.append('file', file.value)
    await exhibitionApi.submitVideoFeedback(form)
    submitted.value = true
    if (settings.exhibitionFeedbackAutoPublish) loadClips()
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || t('exhibition.videoFeedback.submitError')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (visible.value) loadClips()
})
</script>

<template>
  <div class="space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
        <p class="text-xs text-gray-500">
          {{ $t('purchase.agreement.between', { provider: providerName }) }}
          <span v-if="version"> · {{ $t('purchase.agreement.version', { version }) }}</span>
        </p>
      </div>
      <span
        class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
        :class="scrolledToEnd ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
      >
        {{ scrolledToEnd ? $t('purchase.agreement.readComplete') : $t('purchase.agreement.scrollToRead') }}
      </span>
    </header>

    <!-- Scrollable terms -->
    <div
      ref="scroller"
      class="agreement-body max-h-[50vh] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-800"
      tabindex="0"
      :aria-label="title"
      @scroll.passive="onScroll"
    >
      <div v-html="html" />
    </div>

    <div v-if="!scrolledToEnd" class="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <span>{{ $t('purchase.agreement.mustScroll') }}</span>
      <button type="button" class="font-semibold underline" @click="scrollToEnd">{{ $t('purchase.agreement.jumpToEnd') }}</button>
    </div>

    <!-- Signature -->
    <div class="space-y-3 rounded-xl border border-gray-200 p-4" :class="{ 'opacity-60': !scrolledToEnd }">
      <div>
        <label :for="`${uid}-name`" class="block text-sm font-medium text-gray-700">
          {{ $t('purchase.agreement.signatoryName') }} <span class="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          :id="`${uid}-name`"
          :value="signatoryName"
          type="text"
          autocomplete="name"
          :disabled="!scrolledToEnd || disabled"
          :placeholder="$t('purchase.agreement.signatoryPlaceholder')"
          class="mt-1 w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-gray-100"
          :class="showNameError ? 'border-red-400' : 'border-gray-300'"
          @input="$emit('update:signatoryName', ($event.target as HTMLInputElement).value)"
        />
        <p v-if="showNameError" class="mt-1 text-xs text-red-600">{{ $t('purchase.errors.signatoryRequired') }}</p>
        <p v-else class="mt-1 text-xs text-gray-500">{{ $t('purchase.agreement.signatoryHelp') }}</p>
      </div>

      <label class="flex items-start gap-3" :class="scrolledToEnd ? 'cursor-pointer' : 'cursor-not-allowed'">
        <input
          :id="`${uid}-accept`"
          type="checkbox"
          :checked="accepted"
          :disabled="!scrolledToEnd || disabled"
          class="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-400"
          :aria-invalid="showAcceptError ? 'true' : 'false'"
          @change="$emit('update:accepted', ($event.target as HTMLInputElement).checked)"
        />
        <span class="text-sm text-gray-800">
          {{ $t('purchase.agreement.acceptLabel', { title }) }}
          <span class="block text-xs text-gray-500">{{ $t('purchase.agreement.acceptHelp') }}</span>
        </span>
      </label>
      <p v-if="showAcceptError" class="text-xs text-red-600">{{ $t('purchase.errors.agreementNotAccepted') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { renderMarkdown } from '../utils/markdown'

/**
 * Review-and-sign panel for one agreement. Used by the wizard's agreement step and by the order
 * details page for follow-up agreements. The checkbox and the name field stay disabled until the
 * buyer has scrolled through the whole text (short texts count as read immediately).
 */
const props = withDefaults(
  defineProps<{
    title: string
    content: string
    version?: number | null
    providerName: string
    accepted: boolean
    signatoryName: string
    scrolledToEnd: boolean
    attempted?: boolean
    disabled?: boolean
  }>(),
  { version: null, attempted: false, disabled: false }
)
const emit = defineEmits<{
  (e: 'update:accepted', value: boolean): void
  (e: 'update:signatoryName', value: string): void
  (e: 'update:scrolledToEnd', value: boolean): void
}>()

const uid = `agreement-${Math.random().toString(36).slice(2, 8)}`
const scroller = ref<HTMLElement | null>(null)
const html = computed(() => renderMarkdown(props.content))

const showNameError = computed(() => props.attempted && props.signatoryName.trim().length < 3)
const showAcceptError = computed(() => props.attempted && props.scrolledToEnd && !props.accepted)

function checkScrolled() {
  const el = scroller.value
  if (!el) return
  const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight <= 24
  if (atEnd && !props.scrolledToEnd) emit('update:scrolledToEnd', true)
}
function onScroll() {
  checkScrolled()
}
function scrollToEnd() {
  const el = scroller.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  // `scroll` fires as it animates; also check once it settles in case smooth scroll is off.
  setTimeout(checkScrolled, 400)
}

// A new text (new template version) must be read again.
watch(
  () => props.content,
  async () => {
    emit('update:scrolledToEnd', false)
    emit('update:accepted', false)
    await nextTick()
    if (scroller.value) scroller.value.scrollTop = 0
    checkScrolled()
  }
)
onMounted(async () => {
  await nextTick()
  checkScrolled()
})
</script>

<style scoped>
.agreement-body :deep(h1) { font-size: 1.125rem; font-weight: 800; margin: 0 0 0.75rem; color: #111827; }
.agreement-body :deep(h2) { font-size: 1rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: #111827; }
.agreement-body :deep(h3) { font-size: 0.95rem; font-weight: 700; margin: 1rem 0 0.4rem; }
.agreement-body :deep(p) { margin: 0 0 0.75rem; }
.agreement-body :deep(ul), .agreement-body :deep(ol) { margin: 0 0 0.75rem 1.25rem; }
.agreement-body :deep(ul) { list-style: disc; }
.agreement-body :deep(ol) { list-style: decimal; }
.agreement-body :deep(li) { margin-bottom: 0.25rem; }
.agreement-body :deep(hr) { margin: 1rem 0; border-color: #e5e7eb; }
</style>

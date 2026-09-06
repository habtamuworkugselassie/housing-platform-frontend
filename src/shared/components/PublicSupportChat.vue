<template>
  <div
    v-if="showWidget && isPublicRoute"
    class="pointer-events-none fixed bottom-0 right-0 z-[60] flex flex-col items-end gap-3 p-4 sm:p-6 md:p-8"
  >
    <Transition
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-3 scale-95"
    >
      <div
        v-show="open"
        class="pointer-events-auto relative flex min-h-0 max-h-[92vh] max-w-[min(100vw-1rem,75rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-violet-950/20"
        role="dialog"
        :aria-label="$t('common.supportChat.title')"
        :style="{ width: `${panelWidth}px`, height: `${panelHeight}px` }"
      >
        <!-- Drag to resize. Pointer-only affordance, so it is hidden on touch
             where there is no cursor to express the drag. -->
        <div
          class="absolute left-0 top-0 z-20 hidden h-8 w-8 cursor-nwse-resize select-none items-start justify-start rounded-br-lg text-white/70 hover:text-white sm:flex"
          :aria-label="$t('common.supportChat.resizeHandle')"
          role="separator"
          aria-orientation="both"
          @mousedown.prevent="onResizeStart"
        >
          <ArrowsPointingOutIcon class="pointer-events-none m-1.5 h-4 w-4" aria-hidden="true" />
        </div>

        <!-- Header: brand band, so the panel reads as part of the product
             rather than a generic chat box. -->
        <div class="flex items-center justify-between gap-3 bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3.5 pl-11 text-white sm:pl-12">
          <div class="flex min-w-0 items-center gap-3">
            <span class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
              <ChatBubbleLeftRightIcon class="h-5 w-5" aria-hidden="true" />
              <span
                class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-primary-700 bg-green-400"
                aria-hidden="true"
              />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold tracking-tight sm:text-base">
                {{ $t('common.supportChat.title') }}
              </span>
              <span class="block truncate text-[11px] text-white/75 sm:text-xs">
                {{ $t('common.supportChat.subtitle') }}
              </span>
            </span>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            :aria-label="$t('common.close')"
            @click="open = false"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Shortcut chips -->
        <div class="border-b border-gray-200 bg-gray-50/80 px-4 py-2.5">
          <div class="flex flex-wrap gap-1.5 text-[13px]">
            <RouterLink
              v-for="link in shortcutLinks"
              :key="link.labelKey"
              :to="link.to"
              class="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800"
              @click="open = false"
            >
              {{ $t(link.labelKey) }}
            </RouterLink>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="scrollEl"
          class="relative min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50/40 px-4 py-4 text-[15px] leading-relaxed"
          @scroll="onScroll"
        >
          <TransitionGroup
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div
              v-for="(m, i) in messages"
              :key="i"
              class="flex items-end gap-2"
              :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <span
                v-if="m.role !== 'user'"
                class="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
                aria-hidden="true"
              >
                <ChatBubbleLeftRightIcon class="h-4 w-4" />
              </span>
              <div
                class="max-w-[85%] px-4 py-2.5 text-left shadow-sm"
                :class="
                  m.role === 'user'
                    ? 'rounded-2xl rounded-br-md bg-primary-600 text-white'
                    : 'rounded-2xl rounded-bl-md border border-gray-200 bg-white text-gray-800'
                "
              >
                <div
                  v-if="m.role === 'user'"
                  class="whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                >
                  {{ m.content }}
                </div>
                <div
                  v-else
                  class="support-chat-assistant break-words text-[15px] leading-relaxed [overflow-wrap:anywhere]"
                  v-html="formatAssistantHtml(m.content)"
                />
              </div>
            </div>
          </TransitionGroup>

          <!-- Typing indicator: an animated bubble reads as "someone is there"
               in a way a line of static text does not. -->
          <div v-if="loading" class="flex items-end gap-2">
            <span
              class="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
              aria-hidden="true"
            >
              <ChatBubbleLeftRightIcon class="h-4 w-4" />
            </span>
            <div class="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <span class="sr-only">{{ $t('common.supportChat.typing') }}</span>
              <span class="flex items-center gap-1" aria-hidden="true">
                <i class="typing-dot" />
                <i class="typing-dot" style="animation-delay: 0.15s" />
                <i class="typing-dot" style="animation-delay: 0.3s" />
              </span>
            </div>
          </div>
        </div>

        <!-- Jump to latest, only while the reader is scrolled away from it. -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0 translate-y-1"
        >
          <button
            v-if="!atBottom"
            type="button"
            class="absolute bottom-[8.5rem] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gray-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-md backdrop-blur transition-colors hover:border-primary-400 hover:text-primary-700"
            @click="scrollToBottom(true)"
          >
            <ChevronDownIcon class="h-4 w-4" aria-hidden="true" />
            {{ $t('common.supportChat.scrollLatest') }}
          </button>
        </Transition>

        <!-- Quick replies: open by default while the conversation is still
             empty, since that is when a prompt actually helps. -->
        <div class="border-t border-gray-200 bg-white px-4 pb-1 pt-1">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-2 text-left text-xs font-medium text-gray-500 transition-colors hover:text-gray-800 sm:text-sm"
            :aria-expanded="quickRepliesExpanded"
            :aria-controls="quickRepliesPanelId"
            @click="quickRepliesExpanded = !quickRepliesExpanded"
          >
            <span>{{ $t('common.supportChat.quickRepliesLabel') }}</span>
            <ChevronDownIcon
              class="h-4 w-4 shrink-0 transition-transform duration-200"
              :class="{ '-rotate-180': quickRepliesExpanded }"
              aria-hidden="true"
            />
          </button>
          <div :id="quickRepliesPanelId" v-show="quickRepliesExpanded" class="pb-2 pt-0.5">
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="key in quickReplyKeys"
                :key="key"
                type="button"
                :disabled="loading"
                class="rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-left text-[13px] text-primary-800 transition-colors hover:border-primary-400 hover:bg-primary-100 disabled:pointer-events-none disabled:opacity-50"
                @click="sendQuickReply(key)"
              >
                {{ $t('common.supportChat.quickReplies.' + key) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Composer -->
        <form class="border-t border-gray-200 bg-white p-3 sm:p-4" @submit.prevent="send">
          <div class="flex items-end gap-2">
            <label class="sr-only" for="support-chat-input">{{ $t('common.supportChat.placeholder') }}</label>
            <input
              id="support-chat-input"
              ref="inputEl"
              v-model="draft"
              type="text"
              autocomplete="off"
              maxlength="2000"
              :disabled="loading"
              :placeholder="$t('common.supportChat.placeholder')"
              class="min-w-0 flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-[15px] text-gray-900 placeholder-gray-500 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50"
            />
            <button
              type="submit"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary-600"
              :disabled="loading || !draft.trim()"
              :aria-label="$t('common.supportChat.send')"
            >
              <PaperAirplaneIcon class="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- One-time nudge: shown until the widget has been opened once, so a
         first-time visitor knows the button is a way to get help. -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 translate-x-2"
    >
      <div
        v-if="showHint"
        class="pointer-events-auto flex items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pl-4 pr-2 shadow-lg"
      >
        <button type="button" class="text-sm font-medium text-gray-800" @click="toggleOpen">
          {{ $t('common.supportChat.hint') }}
        </button>
        <button
          type="button"
          class="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          :aria-label="$t('common.close')"
          @click="dismissHint"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </Transition>

    <button
      type="button"
      class="support-chat-launcher pointer-events-auto relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-xl shadow-violet-950/30 transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 active:scale-95 sm:h-[4.25rem] sm:w-[4.25rem]"
      :class="{ 'is-attention': showHint }"
      :aria-label="open ? $t('common.close') : $t('common.supportChat.open')"
      :aria-expanded="open"
      @click="toggleOpen"
    >
      <Transition
        mode="out-in"
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 rotate-90 scale-75"
        leave-active-class="transition duration-100 ease-in"
        leave-to-class="opacity-0 -rotate-90 scale-75"
      >
        <XMarkIcon v-if="open" key="close" class="h-8 w-8" aria-hidden="true" />
        <ChatBubbleLeftRightIcon v-else key="chat" class="h-8 w-8" aria-hidden="true" />
      </Transition>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ArrowsPointingOutIcon
} from '@heroicons/vue/24/solid'
import api from '@/shared/api/client'

const { t } = useI18n()
const route = useRoute()

const showWidget = import.meta.env.VITE_SUPPORT_CHAT_ENABLED !== 'false'

const isPublicRoute = computed(() => route.meta?.requiresAuth !== true)

const open = ref(false)
const draft = ref('')
const loading = ref(false)
const scrollEl = ref(null)
const inputEl = ref(null)
/** False while the reader has scrolled up, which is when "jump to latest" helps. */
const atBottom = ref(true)

/** The nav shortcuts, so the row is one loop rather than five near-identical links. */
const shortcutLinks = [
  { to: { name: 'MarketplaceRealEstate' }, labelKey: 'common.supportChat.browseMarketplaceRealEstate' },
  { to: { name: 'Properties' }, labelKey: 'common.supportChat.browseProperties' },
  { to: { name: 'Properties', query: { city: 'Addis Ababa' } }, labelKey: 'common.supportChat.exampleCity' },
  { to: { name: 'Home', hash: '#faq' }, labelKey: 'common.supportChat.faq' },
  { to: { name: 'Home', hash: '#register' }, labelKey: 'common.supportChat.contact' }
]

/** Open while the conversation is still just the greeting — that is when a
 *  suggested question is worth the space — and collapsed once it is underway. */
const quickRepliesExpanded = ref(true)
const quickRepliesPanelId = 'support-chat-quick-replies'
const messages = ref([{ role: 'assistant', content: t('common.supportChat.welcome') }])

const MIN_PANEL_W = 300
const MIN_PANEL_H = 320
const DEFAULT_PANEL_W = 440
const DEFAULT_PANEL_H = 580
const PANEL_SIZE_STORAGE_KEY = 'housing.supportChat.panelSize'
const HINT_SEEN_KEY = 'housing.supportChat.hintSeen'

/** The one-time nudge beside the launcher, and the pulse on the launcher itself.
 *  Both stop for good once the widget has been opened or the nudge dismissed. */
const hintDismissed = ref(true)
const showHint = computed(() => !hintDismissed.value && !open.value)

function dismissHint() {
  hintDismissed.value = true
  try {
    localStorage.setItem(HINT_SEEN_KEY, '1')
  } catch {
    /* private mode — the nudge simply returns next visit */
  }
}

const panelWidth = ref(DEFAULT_PANEL_W)
const panelHeight = ref(DEFAULT_PANEL_H)

function clampPanelSize(w, h) {
  const maxW = Math.min(1200, Math.max(MIN_PANEL_W, window.innerWidth - 24))
  const maxH = Math.min(window.innerHeight - 48, window.innerHeight * 0.92)
  return {
    w: Math.min(maxW, Math.max(MIN_PANEL_W, w)),
    h: Math.min(maxH, Math.max(MIN_PANEL_H, h))
  }
}

function loadPanelSize() {
  try {
    const raw = localStorage.getItem(PANEL_SIZE_STORAGE_KEY)
    if (!raw) return
    const { w, h } = JSON.parse(raw)
    if (typeof w !== 'number' || typeof h !== 'number') return
    const c = clampPanelSize(w, h)
    panelWidth.value = c.w
    panelHeight.value = c.h
  } catch {
    /* ignore */
  }
}

function persistPanelSize() {
  try {
    localStorage.setItem(
      PANEL_SIZE_STORAGE_KEY,
      JSON.stringify({ w: panelWidth.value, h: panelHeight.value })
    )
  } catch {
    /* ignore */
  }
}

function onViewportResize() {
  const c = clampPanelSize(panelWidth.value, panelHeight.value)
  panelWidth.value = c.w
  panelHeight.value = c.h
}

let resizeActive = false
let resizeStartX = 0
let resizeStartY = 0
let resizeStartW = 0
let resizeStartH = 0

function onResizeStart(e) {
  resizeActive = true
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeStartW = panelWidth.value
  resizeStartH = panelHeight.value
  document.body.style.cursor = 'nwse-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e) {
  if (!resizeActive) return
  const dx = resizeStartX - e.clientX
  const dy = resizeStartY - e.clientY
  const c = clampPanelSize(resizeStartW + dx, resizeStartH + dy)
  panelWidth.value = c.w
  panelHeight.value = c.h
}

function onResizeEnd() {
  if (!resizeActive) return
  resizeActive = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
  persistPanelSize()
}

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) open.value = false
}

onMounted(() => {
  loadPanelSize()
  window.addEventListener('resize', onViewportResize)
  window.addEventListener('keydown', onKeydown)
  try {
    // Held back a few seconds: appearing the instant the page paints reads as an
    // interruption, and competes with the content the visitor came for.
    if (!localStorage.getItem(HINT_SEEN_KEY)) {
      setTimeout(() => { hintDismissed.value = false }, 4000)
    }
  } catch {
    /* storage blocked — skip the nudge rather than showing it every route change */
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onViewportResize)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})

const quickReplyKeys = ['neighborhood', 'rent', 'buy', 'howCityFilter']

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function linkifyEscaped(t) {
  return t.replace(/(https?:\/\/[^\s§<]+)/g, (full) => {
    let u = full.replace(/[.,;:!?)]+$/g, '')
    const rest = full.slice(u.length)
    const safeHref = u.replace(/"/g, '&quot;')
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${u}</a>${rest}`
  })
}

function formatInline(s) {
  const codes = []
  let t = escapeHtml(s)
  t = t.replace(/`([^`]+)`/g, (_, inner) => {
    const idx = codes.length
    codes.push(
      '<code class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] text-gray-800">' +
        inner +
        '</code>'
    )
    return `§§C${idx}§§`
  })
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
  // Single-asterisk italics, after bold so `**x**` is not mistaken for it. The
  // model emits these and they were rendering as literal asterisks.
  t = t.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>')
  t = t.replace(/(^|[\s(])_([^_\n]+)_(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>')
  t = linkifyEscaped(t)
  codes.forEach((html, idx) => {
    t = t.split(`§§C${idx}§§`).join(html)
  })
  return t
}

function formatMarkdownBlocks(text) {
  if (!text.trim()) return ''
  const lines = text.split('\n')
  const blocks = []
  let i = 0
  const paraBuf = []

  function flushPara() {
    if (!paraBuf.length) return
    const body = paraBuf.join('\n')
    blocks.push(
      '<p class="mb-3 last:mb-0 leading-relaxed">' +
        formatInline(body).replace(/\n/g, '<br>') +
        '</p>'
    )
    paraBuf.length = 0
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushPara()
      i++
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushPara()
      blocks.push('<hr class="my-3 border-gray-200" />')
      i++
      continue
    }

    const hm = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (hm) {
      flushPara()
      const level = hm[1].length
      const tag = level <= 2 ? 'h3' : level <= 4 ? 'h4' : 'h5'
      const cls =
        level <= 2
          ? 'text-lg font-semibold tracking-tight text-gray-900 mt-4 mb-2 first:mt-0'
          : 'text-base font-semibold tracking-tight text-gray-900 mt-3 mb-1.5 first:mt-0'
      blocks.push(`<${tag} class="${cls}">${formatInline(hm[2])}</${tag}>`)
      i++
      continue
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushPara()
      const items = []
      while (i < lines.length) {
        const t = lines[i].trim()
        if (!t) break
        const m = t.match(/^\d+\.\s+(.*)$/)
        if (!m) break
        items.push(`<li class="leading-relaxed">${formatInline(m[1])}</li>`)
        i++
      }
      blocks.push(
        '<ol class="my-2 list-decimal space-y-2 pl-5 marker:font-medium marker:text-primary-700">' +
          items.join('') +
          '</ol>'
      )
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushPara()
      const items = []
      while (i < lines.length) {
        const t = lines[i].trim()
        if (!t) break
        const m = t.match(/^[-*]\s+(.*)$/)
        if (!m) break
        items.push(`<li class="leading-relaxed">${formatInline(m[1])}</li>`)
        i++
      }
      blocks.push(
        '<ul class="my-2 list-disc space-y-2 pl-5 marker:text-primary-600">' + items.join('') + '</ul>'
      )
      continue
    }

    paraBuf.push(trimmed)
    i++
  }
  flushPara()
  return blocks.join('')
}

/**
 * Renders assistant plain text as safe HTML: fenced ``` code ```, headings, lists, hr, paragraphs,
 * inline `code`, **bold**, and links.
 */
function formatAssistantHtml(raw) {
  const text = String(raw || '').replace(/\r\n/g, '\n')
  const chunks = text.split('```')
  const parts = []
  for (let c = 0; c < chunks.length; c++) {
    if (c % 2 === 0) {
      parts.push(formatMarkdownBlocks(chunks[c]))
    } else {
      let code = chunks[c]
      const firstNl = code.indexOf('\n')
      if (firstNl > 0) {
        const firstLine = code.slice(0, firstNl).trim()
        if (/^[\w#.+-]+$/.test(firstLine)) {
          code = code.slice(firstNl + 1)
        }
      }
      const trimmedCode = code.replace(/\n$/, '')
      parts.push(
        '<pre class="my-3 max-h-64 overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-[13px] text-gray-800 sm:text-sm"><code class="block font-mono whitespace-pre leading-relaxed">' +
          escapeHtml(trimmedCode) +
          '</code></pre>'
      )
    }
  }
  return parts.join('')
}

function toggleOpen() {
  open.value = !open.value
}

watch(open, (v) => {
  if (!v) return
  dismissHint()
  nextTick(() => {
    scrollToBottom()
    // Only on a pointer device: focusing on touch raises the keyboard over the
    // conversation the moment it opens.
    if (window.matchMedia?.('(pointer: fine)').matches) inputEl.value?.focus()
  })
})

function onScroll() {
  const el = scrollEl.value
  if (!el) return
  atBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 40
}

function scrollToBottom(smooth = false) {
  const el = scrollEl.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  atBottom.value = true
}

function sendQuickReply(key) {
  const text = t(`common.supportChat.quickReplies.${key}`)
  sendWithText(text)
}

async function sendWithText(text) {
  const trimmed = (text || '').trim()
  if (!trimmed || loading.value) return

  messages.value.push({ role: 'user', content: trimmed })
  quickRepliesExpanded.value = false
  loading.value = true
  await nextTick()
  scrollToBottom()

  try {
    const payload = {
      messages: messages.value.map((m) => ({
        role: m.role,
        content: m.content
      }))
    }
    const { data } = await api.post('/public/support/chat', payload)
    const reply = data?.reply ?? ''
    messages.value.push({
      role: 'assistant',
      content: reply || t('common.supportChat.error')
    })
  } catch {
    messages.value.push({ role: 'assistant', content: t('common.supportChat.error') })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

async function send() {
  const text = draft.value.trim()
  if (!text || loading.value) return
  draft.value = ''
  await sendWithText(text)
}
</script>

<style scoped>
/* Assistant HTML from formatAssistantHtml(). The bubble is white now, so the
   link colour moves from the old on-dark yellow to the brand violet. */
.support-chat-assistant :deep(a) {
  color: rgb(109 40 217);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.support-chat-assistant :deep(a:hover) {
  color: rgb(76 29 149);
}
.support-chat-assistant :deep(code) {
  background: rgb(243 244 246);
  border-radius: 0.25rem;
  padding: 0.05rem 0.3rem;
  font-size: 0.9em;
}
.support-chat-assistant :deep(pre code) {
  background: none;
  padding: 0;
}

/* Typing indicator. Three dots rising in sequence reads as a person composing;
   `prefers-reduced-motion` gets a static row instead. */
.typing-dot {
  display: block;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 9999px;
  background: rgb(167 139 250);
  animation: support-chat-bounce 1s ease-in-out infinite;
}
@keyframes support-chat-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.55; }
  30%           { transform: translateY(-0.3rem); opacity: 1; }
}

/* A slow halo on the launcher while the first-visit nudge is up. It stops for
   good once the chat has been opened, so it never becomes a permanent flicker. */
.support-chat-launcher.is-attention::before {
  content: '';
  position: absolute;
  inset: -0.35rem;
  border-radius: 9999px;
  border: 2px solid rgb(139 92 246);
  animation: support-chat-halo 2.4s ease-out infinite;
}
@keyframes support-chat-halo {
  0%   { transform: scale(0.92); opacity: 0.75; }
  70%  { transform: scale(1.18); opacity: 0; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .typing-dot,
  .support-chat-launcher.is-attention::before {
    animation: none;
  }
  .typing-dot { opacity: 0.8; }
  .support-chat-launcher { transition: none; }
}
</style>

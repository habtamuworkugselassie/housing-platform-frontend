<template>
  <div v-if="showWidget && isPublicRoute" class="pointer-events-none fixed bottom-0 right-0 z-[60] flex flex-col items-end gap-4 p-4 sm:p-6 md:p-8">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-show="open"
        class="pointer-events-auto relative flex min-h-0 max-h-[92vh] max-w-[min(100vw-1rem,75rem)] flex-col overflow-hidden rounded-xl border-2 border-black/30 bg-zinc-900 shadow-2xl shadow-black/50 ring-2 ring-black/20"
        role="dialog"
        :aria-label="$t('common.supportChat.title')"
        :style="{ width: `${panelWidth}px`, height: `${panelHeight}px` }"
      >
        <div
          class="absolute left-0 top-0 z-20 flex h-10 w-10 cursor-nwse-resize select-none items-start justify-start rounded-br-lg border border-white/10 bg-zinc-800/90 text-gray-400 hover:border-black/40 hover:bg-violet-950/10 hover:text-black"
          :aria-label="$t('common.supportChat.resizeHandle')"
          role="separator"
          aria-orientation="both"
          @mousedown.prevent="onResizeStart"
        >
          <ArrowsPointingOutIcon class="pointer-events-none m-1.5 h-5 w-5" aria-hidden="true" />
        </div>
        <div class="flex items-center justify-between border-b border-white/10 px-5 py-4 pl-12">
          <div class="flex items-center gap-3 text-white">
            <ChatBubbleLeftRightIcon class="h-6 w-6 shrink-0 text-black" aria-hidden="true" />
            <span class="text-base font-semibold tracking-tight sm:text-lg">{{ $t('common.supportChat.title') }}</span>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-gray-400 hover:border hover:border-black/50 hover:bg-violet-950/10 hover:text-white"
            :aria-label="$t('common.close')"
            @click="open = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="border-b border-white/10 px-5 py-3">
          <div class="flex flex-wrap gap-2 text-sm">
            <RouterLink
              :to="{ name: 'MarketplaceRealEstate' }"
              class="rounded-md border border-white/20 px-3 py-1.5 text-gray-300 hover:border-black hover:bg-violet-950/10 hover:text-white"
              @click="open = false"
            >
              {{ $t('common.supportChat.browseMarketplaceRealEstate') }}
            </RouterLink>
            <RouterLink
              :to="{ name: 'Properties' }"
              class="rounded-md border border-white/20 px-3 py-1.5 text-gray-300 hover:border-black hover:bg-violet-950/10 hover:text-white"
              @click="open = false"
            >
              {{ $t('common.supportChat.browseProperties') }}
            </RouterLink>
            <RouterLink
              :to="{ name: 'Properties', query: { city: 'Addis Ababa' } }"
              class="rounded-md border border-white/20 px-3 py-1.5 text-gray-300 hover:border-black hover:bg-violet-950/10 hover:text-white"
              @click="open = false"
            >
              {{ $t('common.supportChat.exampleCity') }}
            </RouterLink>
            <RouterLink
              :to="{ name: 'Home', hash: '#show-features' }"
              class="rounded-md border border-white/20 px-3 py-1.5 text-gray-300 hover:border-black hover:bg-violet-950/10 hover:text-white"
              @click="open = false"
            >
              {{ $t('common.supportChat.faq') }}
            </RouterLink>
            <RouterLink
              :to="{ name: 'Home', hash: '#register' }"
              class="rounded-md border border-white/20 px-3 py-1.5 text-gray-300 hover:border-black hover:bg-violet-950/10 hover:text-white"
              @click="open = false"
            >
              {{ $t('common.supportChat.contact') }}
            </RouterLink>
          </div>
        </div>

        <div
          ref="scrollEl"
          class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-[15px] leading-relaxed sm:text-base"
        >
          <div
            v-for="(m, i) in messages"
            :key="i"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[96%] rounded-xl px-4 py-3 text-left sm:max-w-[92%] sm:px-5 sm:py-3.5"
              :class="
                m.role === 'user'
                  ? 'bg-white text-black'
                  : 'border border-white/15 bg-white/5 text-gray-200'
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
                class="support-chat-assistant text-[15px] leading-relaxed break-words [overflow-wrap:anywhere] sm:text-base"
                v-html="formatAssistantHtml(m.content)"
              />
            </div>
          </div>
          <p v-if="loading" class="text-sm text-gray-400">{{ $t('common.supportChat.typing') }}</p>
        </div>

        <div class="border-t border-white/10 px-5 pb-1 pt-1">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-2 text-left text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200 sm:text-sm"
            :aria-expanded="quickRepliesExpanded"
            :aria-controls="quickRepliesPanelId"
            @click="quickRepliesExpanded = !quickRepliesExpanded"
          >
            <span class="font-medium text-gray-300">{{ $t('common.supportChat.quickRepliesLabel') }}</span>
            <ChevronDownIcon
              class="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200"
              :class="{ '-rotate-180': quickRepliesExpanded }"
              aria-hidden="true"
            />
          </button>
          <div
            :id="quickRepliesPanelId"
            v-show="quickRepliesExpanded"
            class="pb-2 pt-1"
          >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="key in quickReplyKeys"
                :key="key"
                type="button"
                :disabled="loading"
                class="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-left text-sm text-gray-200 hover:border-black hover:bg-violet-950/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                @click="sendQuickReply(key)"
              >
                {{ $t('common.supportChat.quickReplies.' + key) }}
              </button>
            </div>
          </div>
        </div>

        <form class="border-t border-white/10 p-4 sm:p-5" @submit.prevent="send">
          <div class="flex gap-3">
            <label class="sr-only" for="support-chat-input">{{ $t('common.supportChat.placeholder') }}</label>
            <input
              id="support-chat-input"
              v-model="draft"
              type="text"
              autocomplete="off"
              maxlength="2000"
              :disabled="loading"
              :placeholder="$t('common.supportChat.placeholder')"
              class="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            />
            <button
              type="submit"
              class="flex-shrink-0 rounded-lg bg-white px-4 py-3 text-black hover:bg-violet-950 disabled:opacity-50"
              :disabled="loading || !draft.trim()"
              :aria-label="$t('common.supportChat.send')"
            >
              <PaperAirplaneIcon class="h-6 w-6" />
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <button
      type="button"
      class="pointer-events-auto flex h-[4.25rem] w-[4.25rem] sm:h-[4.75rem] sm:w-[4.75rem] items-center justify-center rounded-full border-2 border-black/50 bg-white text-black shadow-2xl shadow-black/40 ring-4 ring-black/25 hover:bg-violet-950 hover:ring-black/40 focus:outline-none focus:ring-4 focus:ring-black"
      :aria-label="$t('common.supportChat.open')"
      @click="toggleOpen"
    >
      <ChatBubbleLeftRightIcon class="h-9 w-9 sm:h-10 sm:w-10" aria-hidden="true" />
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
/** Collapsed by default so the message area gets more vertical space. */
const quickRepliesExpanded = ref(false)
const quickRepliesPanelId = 'support-chat-quick-replies'
const messages = ref([{ role: 'assistant', content: t('common.supportChat.welcome') }])

const MIN_PANEL_W = 300
const MIN_PANEL_H = 320
const DEFAULT_PANEL_W = 440
const DEFAULT_PANEL_H = 580
const PANEL_SIZE_STORAGE_KEY = 'housing.supportChat.panelSize'

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

onMounted(() => {
  loadPanelSize()
  window.addEventListener('resize', onViewportResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onViewportResize)
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
      '<code class="rounded bg-violet-950/50 px-1.5 py-0.5 font-mono text-[0.9em] text-black">' +
        inner +
        '</code>'
    )
    return `§§C${idx}§§`
  })
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
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
      '<p class="mb-3 last:mb-0 leading-relaxed text-gray-200">' +
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
      blocks.push('<hr class="my-3 border-white/20" />')
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
          ? 'text-lg font-semibold tracking-tight text-white mt-4 mb-2 first:mt-0'
          : 'text-base font-semibold tracking-tight text-white mt-3 mb-1.5 first:mt-0'
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
        '<ol class="my-2 list-decimal space-y-2 pl-5 marker:font-medium marker:text-black/90">' +
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
        '<ul class="my-2 list-disc space-y-2 pl-5 marker:text-black">' + items.join('') + '</ul>'
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
        '<pre class="my-3 max-h-64 overflow-x-auto overflow-y-auto rounded-lg border border-white/15 bg-violet-950/50 p-3 text-[13px] text-gray-200 sm:text-sm"><code class="block font-mono whitespace-pre leading-relaxed">' +
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
  if (v) {
    nextTick(() => scrollToBottom())
  }
})

function scrollToBottom() {
  const el = scrollEl.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

function sendQuickReply(key) {
  const text = t(`common.supportChat.quickReplies.${key}`)
  sendWithText(text)
}

async function sendWithText(text) {
  const trimmed = (text || '').trim()
  if (!trimmed || loading.value) return

  messages.value.push({ role: 'user', content: trimmed })
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
/* Assistant HTML from formatAssistantHtml(): links if ever added by the model */
.support-chat-assistant :deep(a) {
  color: rgb(250 204 21);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.support-chat-assistant :deep(a:hover) {
  color: rgb(253 224 71);
}
</style>

<template>
  <div class="min-h-screen bg-violet-950 px-4 py-6 text-white sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Buyer messages</h1>
          <p class="mt-1 text-sm text-gray-400">Conversations about your assigned property listings.</p>
        </div>
        <button
          type="button"
          class="rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-200 hover:border-black hover:text-black"
          :disabled="loadingConversations"
          @click="loadConversations"
        >
          Refresh
        </button>
      </div>

      <p v-if="error" class="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
        {{ error }}
      </p>

      <div class="grid min-h-[560px] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl lg:grid-cols-[320px_1fr]">
        <aside class="border-b border-white/10 lg:border-b-0 lg:border-r">
          <div class="border-b border-white/10 px-4 py-3 text-sm font-medium text-gray-300">Conversations</div>
          <div v-if="loadingConversations" class="p-4 text-sm text-gray-400">Loading messages…</div>
          <div v-else-if="conversations.length === 0" class="p-4 text-sm text-gray-400">
            No buyer messages yet.
          </div>
          <button
            v-for="conversation in conversations"
            :key="conversation.id"
            type="button"
            class="w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
            :class="selectedConversation?.id === conversation.id ? 'bg-violet-950/30' : ''"
            @click="selectConversation(conversation)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="truncate font-medium text-white">{{ conversation.buyerName }}</span>
              <span class="shrink-0 text-xs text-gray-500">{{ formatDate(conversation.updatedAt) }}</span>
            </div>
            <p class="mt-1 truncate text-xs text-gray-400">{{ conversation.propertyTitle }}</p>
          </button>
        </aside>

        <section class="flex min-h-[420px] flex-col">
          <template v-if="selectedConversation">
            <header class="border-b border-white/10 px-5 py-4">
              <p class="font-medium text-white">{{ selectedConversation.buyerName }}</p>
              <p class="mt-1 text-sm text-gray-400">Regarding: {{ selectedConversation.propertyTitle }}</p>
            </header>

            <div ref="messageList" class="flex-1 space-y-3 overflow-y-auto p-5">
              <p v-if="loadingMessages" class="text-sm text-gray-400">Loading conversation…</p>
              <p v-else-if="messages.length === 0" class="text-sm text-gray-400">No messages in this conversation.</p>
              <div
                v-for="message in messages"
                :key="message.id"
                class="flex"
                :class="isMine(message) ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[70%]"
                  :class="isMine(message) ? 'bg-black text-zinc-900' : 'bg-white/10 text-white'"
                >
                  <p class="mb-1 text-xs opacity-70">{{ message.senderName }}</p>
                  <p class="whitespace-pre-wrap">{{ message.message }}</p>
                  <p class="mt-2 text-right text-xs opacity-60">{{ formatDate(message.createdAt) }}</p>
                </div>
              </div>
            </div>

            <form class="border-t border-white/10 p-4" @submit.prevent="sendMessage">
              <div class="flex gap-3">
                <textarea
                  v-model="draft"
                  rows="2"
                  maxlength="4000"
                  placeholder="Write a reply…"
                  class="min-h-[48px] flex-1 resize-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-black focus:outline-none"
                />
                <button
                  type="submit"
                  class="self-end rounded-lg bg-black px-4 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="sending || !draft.trim()"
                >
                  {{ sending ? 'Sending…' : 'Send' }}
                </button>
              </div>
            </form>
          </template>
          <div v-else class="flex flex-1 items-center justify-center p-8 text-center text-sm text-gray-400">
            Select a buyer conversation to read and reply.
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useAuthStore } from '@/features/auth'
import {
  propertyConversationsApi,
  type PropertyConversation,
  type PropertyConversationMessage
} from '../api/propertyConversations.api'

const authStore = useAuthStore()
const conversations = ref<PropertyConversation[]>([])
const selectedConversation = ref<PropertyConversation | null>(null)
const messages = ref<PropertyConversationMessage[]>([])
const loadingConversations = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)
const draft = ref('')
const error = ref('')
const messageList = ref<HTMLElement | null>(null)

async function loadConversations() {
  loadingConversations.value = true
  error.value = ''
  try {
    conversations.value = await propertyConversationsApi.getConversations()
    if (selectedConversation.value) {
      const updated = conversations.value.find((item) => item.id === selectedConversation.value?.id)
      if (updated) selectedConversation.value = updated
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to load conversations.'
  } finally {
    loadingConversations.value = false
  }
}

async function selectConversation(conversation: PropertyConversation) {
  selectedConversation.value = conversation
  loadingMessages.value = true
  error.value = ''
  try {
    messages.value = await propertyConversationsApi.getMessages(conversation.id)
    await scrollToLatest()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to load messages.'
  } finally {
    loadingMessages.value = false
  }
}

async function sendMessage() {
  const message = draft.value.trim()
  if (!message || !selectedConversation.value || sending.value) return
  sending.value = true
  error.value = ''
  try {
    const sent = await propertyConversationsApi.sendMessage(selectedConversation.value.id, message)
    messages.value.push(sent)
    draft.value = ''
    await loadConversations()
    await scrollToLatest()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to send message.'
  } finally {
    sending.value = false
  }
}

function isMine(message: PropertyConversationMessage) {
  return message.senderUserId === authStore.user?.id
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

async function scrollToLatest() {
  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
}

onMounted(loadConversations)
</script>

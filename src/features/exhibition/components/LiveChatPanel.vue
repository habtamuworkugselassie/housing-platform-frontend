<template>
  <div class="flex h-full min-h-0 flex-col bg-zinc-900/95 text-white">
    <div class="flex items-center justify-between border-b border-white/10 px-3 py-2">
      <p class="text-sm font-semibold">{{ $t('live.chat.title') }}</p>
      <span class="text-xs text-white/50">{{ messages.length }}</span>
    </div>

    <div ref="scroller" class="flex-1 min-h-0 space-y-2 overflow-y-auto px-3 py-3">
      <p v-if="!messages.length" class="mt-6 text-center text-xs text-white/40">
        {{ $t('live.chat.empty') }}
      </p>
      <div v-for="m in messages" :key="m.id" class="text-sm leading-snug">
        <span
          class="font-semibold"
          :class="m.self ? 'text-primary-300' : 'text-gold-300'"
        >{{ m.sender }}</span>
        <span class="text-white/40"> · </span>
        <span class="break-words text-white/90">{{ m.text }}</span>
      </div>
    </div>

    <form
      class="flex items-center gap-2 border-t border-white/10 p-2"
      @submit.prevent="submit"
    >
      <input
        v-model="draft"
        type="text"
        maxlength="500"
        :placeholder="$t('live.chat.placeholder')"
        class="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/40 focus:border-primary-400 focus:outline-none"
      />
      <button
        type="submit"
        :disabled="!draft.trim()"
        class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
        :aria-label="$t('live.chat.send')"
      >
        <span class="material-icons !text-[18px]">send</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  messages: { type: Array, required: true },
})
const emit = defineEmits(['send'])

const draft = ref('')
const scroller = ref(null)

function submit() {
  const t = draft.value.trim()
  if (!t) return
  emit('send', t)
  draft.value = ''
}

// Keep pinned to the newest message.
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  },
)
</script>

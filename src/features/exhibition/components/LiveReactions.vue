<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <!-- Floating reactions rising from the reaction bar -->
    <transition-group name="float" tag="div">
      <span
        v-for="r in reactions"
        :key="r.id"
        class="float-emoji absolute bottom-16 select-none text-3xl"
        :style="{ left: leftFor(r.id) }"
      >{{ r.emoji }}</span>
    </transition-group>

    <!-- Reaction bar -->
    <div class="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur">
      <button
        v-for="e in emojis"
        :key="e"
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:scale-125 hover:bg-white/10 active:scale-95"
        @click="$emit('react', e)"
        :aria-label="$t('live.reactions.send')"
      >{{ e }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reactions: { type: Array, required: true },
})
defineEmits(['react'])

const emojis = ['❤️', '👏', '🔥', '😮', '🎉']

// Deterministic-ish horizontal spread from the reaction's id so each floats a
// slightly different column without re-randomizing on every render.
function leftFor(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return `${35 + (h % 30)}%`
}
</script>

<style scoped>
.float-emoji {
  animation: floatUp 2.6s ease-out forwards;
}
@keyframes floatUp {
  0% {
    transform: translateY(0) scale(0.6);
    opacity: 0;
  }
  15% {
    opacity: 1;
    transform: translateY(-10px) scale(1.1);
  }
  100% {
    transform: translateY(-220px) scale(1);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .float-emoji {
    animation-duration: 0.6s;
  }
}
</style>

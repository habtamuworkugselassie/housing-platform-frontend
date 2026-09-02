<template>
  <div class="relative h-full w-full overflow-hidden bg-black">
    <video
      ref="el"
      class="h-full w-full bg-black object-contain"
      autoplay
      playsinline
      :muted="muted"
    />
    <span
      v-if="label"
      class="absolute bottom-2 left-2 max-w-[80%] truncate rounded bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur"
    >{{ label }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// Renders a single LiveKit video track (remote publisher or a local preview) into its own
// <video>. Attaching is imperative in LiveKit, so we (re)attach whenever the track changes.
const props = defineProps({
  track: { type: Object, required: true },
  label: { type: String, default: '' },
  // Local preview tiles must be muted to avoid echo; remote tiles carry the room audio.
  muted: { type: Boolean, default: false },
})

const el = ref(null)

function attach(track) {
  if (el.value && track?.attach) track.attach(el.value)
}
function detach(track) {
  try {
    track?.detach?.(el.value)
  } catch {
    /* ignore */
  }
}

onMounted(() => attach(props.track))
watch(
  () => props.track,
  (next, prev) => {
    if (prev) detach(prev)
    attach(next)
  },
)
onBeforeUnmount(() => detach(props.track))
</script>

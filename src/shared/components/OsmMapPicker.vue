<template>
  <div class="osm-map-picker rounded-xl overflow-hidden border border-white/10 bg-zinc-900" :style="{ height: height }">
    <div ref="mapRef" class="w-full h-full min-h-[200px] cursor-crosshair"></div>
    <p v-if="showHint" class="text-xs text-gray-400 px-3 py-2 border-t border-white/10">
      {{ hintText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Map, Marker } from 'leaflet'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: { lat: number; lng: number } | null
    /** Initial map center when no coordinates (e.g. Addis Ababa). */
    defaultLat?: number
    defaultLng?: number
    zoom?: number
    height?: string
    showHint?: boolean
    hintText?: string
  }>(),
  {
    defaultLat: 9.032,
    defaultLng: 38.747,
    zoom: 13,
    height: '280px',
    showHint: true,
    hintText: 'Click on the map to set the location. Latitude and longitude will be saved with the address.'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: { lat: number; lng: number } | null]
  'update:latitude': [value: number | null]
  'update:longitude': [value: number | null]
}>()

const mapRef = ref<HTMLElement | null>(null)
let map: Map | null = null
let marker: Marker | null = null

const leafletLib = ref<typeof import('leaflet').default | null>(null)

const currentLat = computed(() => props.modelValue?.lat ?? null)
const currentLng = computed(() => props.modelValue?.lng ?? null)

const centerLat = computed(() => currentLat.value ?? props.defaultLat)
const centerLng = computed(() => currentLng.value ?? props.defaultLng)

function initMap(L: typeof import('leaflet').default) {
  if (!mapRef.value) return

  map = L.map(mapRef.value).setView([centerLat.value, centerLng.value], props.zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map)

  if (currentLat.value != null && currentLng.value != null) {
    marker = L.marker([currentLat.value, currentLng.value]).addTo(map)
  }

  map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
    const { lat, lng } = e.latlng
    if (!marker) {
      marker = L.marker([lat, lng]).addTo(map!)
    } else {
      marker.setLatLng([lat, lng])
    }
    emit('update:modelValue', { lat, lng })
    emit('update:latitude', lat)
    emit('update:longitude', lng)
  })
}

function destroyMap() {
  if (marker) {
    marker.remove()
    marker = null
  }
  if (map) {
    map.off('click')
    map.remove()
    map = null
  }
}

onMounted(() => {
  import('leaflet').then((L) => {
    const LDefault = L.default
    delete (LDefault.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl
    LDefault.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    })
    import('leaflet/dist/leaflet.css')
    leafletLib.value = LDefault
    initMap(LDefault)
  })
})

onUnmounted(destroyMap)

watch(
  () => [props.modelValue?.lat, props.modelValue?.lng],
  () => {
    if (!leafletLib.value || !map) return
    if (props.modelValue?.lat != null && props.modelValue?.lng != null) {
      if (!marker) {
        marker = leafletLib.value.marker([props.modelValue.lat, props.modelValue.lng]).addTo(map)
      } else {
        marker.setLatLng([props.modelValue.lat, props.modelValue.lng])
      }
    } else if (marker) {
      marker.remove()
      marker = null
    }
  },
  { deep: true }
)
</script>

<template>
  <!-- `isolate` is load-bearing: Leaflet gives its panes z-index 400 and its zoom
       controls 1000, which are absolute values in whatever stacking context they land
       in. With no context of its own here, the map competed directly with the sticky
       nav (z-70) in the root context and painted over it on scroll. Isolating pins all
       of Leaflet's internals inside this wrapper. -->
  <div
    class="osm-map-wrapper relative isolate z-0 rounded-xl overflow-hidden border border-white/10 bg-zinc-900"
    :style="{ height: height }"
  >
    <div ref="mapRef" class="w-full h-full min-h-[200px]"></div>
  </div>
</template>

<script setup lang="ts">
import type { Map, Marker } from 'leaflet'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    latitude: number
    longitude: number
    zoom?: number
    height?: string
    markerTitle?: string
  }>(),
  { zoom: 15, height: '280px', markerTitle: '' }
)

const mapRef = ref<HTMLElement | null>(null)
let map: Map | null = null
let marker: Marker | null = null

function initMap(L: typeof import('leaflet').default) {
  if (!mapRef.value) return

  map = L.map(mapRef.value).setView([props.latitude, props.longitude], props.zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map)

  marker = L.marker([props.latitude, props.longitude])
  if (props.markerTitle) marker.bindTooltip(props.markerTitle, { permanent: false })
  marker.addTo(map)
}

function destroyMap() {
  if (marker) {
    marker.remove()
    marker = null
  }
  if (map) {
    map.remove()
    map = null
  }
}

const leafletLib = ref<typeof import('leaflet').default | null>(null)

onMounted(() => {
  import('leaflet').then((L) => {
    const LDefault = L.default
    // Fix default marker icon when using bundler (Vite)
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
  () => [props.latitude, props.longitude],
  () => {
    if (!leafletLib.value) return
    destroyMap()
    initMap(leafletLib.value)
  }
)
</script>

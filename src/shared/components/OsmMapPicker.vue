<template>
  <div class="osm-map-picker rounded-xl overflow-hidden border border-white/10 bg-zinc-900 flex flex-col" :style="{ height }">
    <!-- Search bar -->
    <div v-if="searchable" class="flex gap-2 p-2 border-b border-white/10 shrink-0">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="searchPlaceholder"
        class="flex-1 min-w-0 border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-black focus:border-black"
        @keydown.enter.prevent="doSearch"
      />
      <button
        type="button"
        :disabled="searching"
        class="px-3 py-2 rounded-lg bg-white text-black hover:bg-violet-950 disabled:opacity-50 disabled:bg-white/50 text-sm font-medium shrink-0"
        @click="doSearch"
      >
        {{ searching ? '…' : 'Search' }}
      </button>
    </div>
    <p v-if="searchable && searchError" class="text-xs text-red-400 px-3 py-1 shrink-0">{{ searchError }}</p>
    <div ref="mapRef" class="w-full min-h-[180px] cursor-crosshair" :class="searchable ? 'flex-1' : ''" :style="!searchable ? { height: mapHeight } : {}"></div>
    <p v-if="showHint" class="text-xs text-gray-400 px-3 py-2 border-t border-white/10 shrink-0">
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
    /** Show search input and allow geocoding via Nominatim. */
    searchable?: boolean
    searchPlaceholder?: string
  }>(),
  {
    defaultLat: 9.032,
    defaultLng: 38.747,
    zoom: 13,
    height: '280px',
    showHint: true,
    hintText: 'Click on the map to set the location. Latitude and longitude will be saved with the address.',
    searchable: true,
    searchPlaceholder: 'Search address or place…'
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

const searchQuery = ref('')
const searching = ref(false)
const searchError = ref('')

/** When not searchable, map fills the given height. When searchable, map uses flex-1. */
const mapHeight = computed(() => props.height || '280px')

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

  ;(map as Map).on('click', (e: { latlng: { lat: number; lng: number } }) => {
    const { lat, lng } = e.latlng
    if (!marker && map) {
      marker = L.marker([lat, lng]).addTo(map)
    } else if (marker) {
      marker.setLatLng([lat, lng])
    }
    emit('update:modelValue', { lat, lng })
    emit('update:latitude', lat)
    emit('update:longitude', lng)
  })
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_UA = 'EthioBuildConnect/1.0 (Address search)'

async function doSearch() {
  const q = (searchQuery.value || '').trim()
  if (!q) {
    searchError.value = 'Enter an address or place name.'
    return
  }
  searchError.value = ''
  searching.value = true
  try {
    const params = new URLSearchParams({
      q,
      format: 'json',
      limit: '1',
      addressdetails: '0'
    })
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': NOMINATIM_UA }
    })
    if (!res.ok) throw new Error('Search failed')
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) {
      searchError.value = 'No results found. Try a different search.'
      return
    }
    const first = data[0]
    const lat = parseFloat(first.lat)
    const lng = parseFloat(first.lon)
    if (Number.isNaN(lat) || Number.isNaN(lng)) throw new Error('Invalid result')
    if (map) {
      map.flyTo([lat, lng], Math.max(props.zoom, 15))
      const L = leafletLib.value
      if (L) {
        if (!marker) {
          marker = L.marker([lat, lng]).addTo(map)
        } else {
          marker.setLatLng([lat, lng])
        }
      }
    }
    emit('update:modelValue', { lat, lng })
    emit('update:latitude', lat)
    emit('update:longitude', lng)
  } catch (e) {
    searchError.value = e instanceof Error ? e.message : 'Search failed. Try again.'
  } finally {
    searching.value = false
  }
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

<template>
  <div class="min-h-screen bg-violet-50 py-8 px-4 text-gray-900 sm:px-6">
    <div class="mx-auto max-w-5xl space-y-6">
      <p v-if="loading" class="py-16 text-center text-sm text-gray-500" data-testid="loading">{{ $t('exhibitor.loading') }}</p>

      <div v-else-if="!org" class="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm" data-testid="no-organization">
        <h1 class="text-2xl font-extrabold tracking-tight">{{ $t('exhibitor.noOrgTitle') }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ $t('exhibitor.noOrgBody') }}</p>
        <div class="mt-5 flex flex-wrap justify-center gap-3">
          <router-link to="/reserve" class="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700">{{ $t('exhibitor.reserveCta') }}</router-link>
          <router-link to="/dashboard" class="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">{{ $t('exhibitor.goDashboard') }}</router-link>
        </div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6" data-testid="exhibitor-header">
          <div class="flex items-center gap-4">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img v-if="logo" :src="mediaUrl(logo.url)" :alt="org.name" class="h-full w-full object-contain" />
              <span v-else class="material-icons text-3xl text-gray-300" aria-hidden="true">storefront</span>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">{{ $t('exhibitor.eyebrow') }}</p>
              <h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl">{{ org.name }}</h1>
              <p class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span v-if="org.sponsorshipType" class="rounded-full bg-gold-400 px-2 py-0.5 font-bold text-primary-950">{{ org.sponsorshipType }}</span>
                <span class="rounded-full px-2 py-0.5 font-semibold" :class="org.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'" data-testid="org-status">{{ org.status === 'APPROVED' ? $t('exhibitor.live') : $t('exhibitor.underReview') }}</span>
              </p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <router-link :to="`/organizations/${org.id}`" class="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{{ $t('exhibitor.viewPublic') }}</router-link>
          </div>
        </div>

        <p v-if="notice" class="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800" data-testid="notice">{{ notice }}</p>
        <p v-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" data-testid="error">{{ error }}</p>

        <!-- Reservations -->
        <section v-if="reservations.length" class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" data-testid="reservations">
          <h2 class="text-lg font-bold">{{ $t('exhibitor.reservationsTitle') }}</h2>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <div v-for="r in reservations" :key="r.reference" class="rounded-xl border border-gray-200 p-4">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-extrabold tracking-[0.1em] text-primary-900">{{ r.reference }}</p>
                  <p class="text-sm font-semibold">{{ r.packageName }}</p>
                  <p v-if="r.boothCodes.length" class="text-sm text-primary-800">{{ $t('booth.picked', { codes: r.boothCodes.join(', ') }) }}</p>
                  <p v-else-if="r.boothsIncluded > 0" class="text-sm text-amber-700">{{ $t('exhibitor.boothsPending') }}</p>
                </div>
                <span class="rounded-full px-2 py-0.5 text-[11px] font-bold" :class="statusCls(r.status)">{{ $t(`admin.reservations.status.${r.status}`) }}</span>
              </div>
              <p class="mt-2 text-sm text-gray-600">{{ $t('exhibitor.paidOf', { paid: money(r.amountPaid), total: money(r.amount) }) }}</p>
              <router-link :to="`/reserve/${r.reference}?email=${encodeURIComponent(r.email)}`" class="mt-2 inline-block text-sm font-semibold text-primary-700 hover:underline">{{ r.status === 'PAID' ? $t('exhibitor.viewReservation') : $t('exhibitor.payBalance') }}</router-link>
            </div>
          </div>
        </section>

        <!-- Logo -->
        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" data-testid="logo-section">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold">{{ $t('exhibitor.logoTitle') }}</h2>
              <p class="text-sm text-gray-600">{{ $t('exhibitor.logoHint') }}</p>
            </div>
            <label class="cursor-pointer rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700">
              {{ logo ? $t('exhibitor.replaceLogo') : $t('exhibitor.uploadLogo') }}
              <input type="file" accept="image/*" class="sr-only" data-testid="logo-input" :disabled="busy" @change="onPick($event, 'LOGO')" />
            </label>
          </div>
          <div v-if="logos.length" class="mt-4 flex flex-wrap gap-3">
            <MediaTile v-for="m in logos" :key="m.id" :item="m" :busy="busy" @remove="remove" />
          </div>
        </section>

        <!-- Profile -->
        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" data-testid="profile-section">
          <h2 class="text-lg font-bold">{{ $t('exhibitor.profileTitle') }}</h2>
          <p class="text-sm text-gray-600">{{ $t('exhibitor.profileHint') }}</p>
          <form class="mt-4 grid gap-4 sm:grid-cols-2" @submit.prevent="saveProfile">
            <label class="block text-sm sm:col-span-2"><span class="font-semibold">{{ $t('exhibitor.fields.name') }}</span><input v-model="form.name" required type="text" class="input" data-testid="name" /></label>
            <label class="block text-sm"><span class="font-semibold">{{ $t('exhibitor.fields.type') }}</span>
              <select v-model="form.type" class="input">
                <option v-for="tp in ORGANIZATION_TYPES" :key="tp" :value="tp">{{ $t(`exhibitor.types.${tp}`) }}</option>
              </select>
            </label>
            <label class="block text-sm"><span class="font-semibold">{{ $t('exhibitor.fields.phone') }}</span><input v-model="form.phone" type="tel" class="input" placeholder="09xx xxx xxx" /></label>
            <label class="block text-sm sm:col-span-2"><span class="font-semibold">{{ $t('exhibitor.fields.description') }}</span><textarea v-model="form.description" rows="4" class="input" data-testid="description" :placeholder="$t('exhibitor.fields.descriptionHint')"></textarea></label>
            <label class="block text-sm"><span class="font-semibold">{{ $t('exhibitor.fields.email') }}</span><input v-model="form.email" type="email" class="input" /></label>
            <label class="block text-sm"><span class="font-semibold">{{ $t('exhibitor.fields.website') }}</span><input v-model="form.website" type="url" class="input" placeholder="https://" /></label>
            <label class="block text-sm"><span class="font-semibold">{{ $t('exhibitor.fields.address') }}</span><input v-model="form.address" type="text" class="input" /></label>
            <label class="block text-sm"><span class="font-semibold">{{ $t('exhibitor.fields.city') }}</span><input v-model="form.city" type="text" class="input" /></label>
            <label class="block text-sm"><span class="font-semibold">Facebook</span><input v-model="form.facebookUrl" type="url" class="input" placeholder="https://facebook.com/…" /></label>
            <label class="block text-sm"><span class="font-semibold">Instagram</span><input v-model="form.instagramUrl" type="url" class="input" placeholder="https://instagram.com/…" /></label>
            <label class="block text-sm"><span class="font-semibold">LinkedIn</span><input v-model="form.linkedinUrl" type="url" class="input" placeholder="https://linkedin.com/company/…" /></label>
            <label class="block text-sm"><span class="font-semibold">YouTube</span><input v-model="form.youtubeUrl" type="url" class="input" placeholder="https://youtube.com/@…" /></label>
            <div class="sm:col-span-2">
              <button type="submit" :disabled="busy" class="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50" data-testid="save-profile">{{ busy ? $t('exhibitor.saving') : $t('exhibitor.saveProfile') }}</button>
            </div>
          </form>
        </section>

        <!-- Gallery -->
        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" data-testid="gallery-section">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold">{{ $t('exhibitor.galleryTitle') }}</h2>
              <p class="text-sm text-gray-600">{{ $t('exhibitor.galleryHint') }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <label class="cursor-pointer rounded-full border border-primary-600 px-4 py-2 text-sm font-bold text-primary-700 hover:bg-primary-50">
                {{ $t('exhibitor.addPhotos') }}
                <input type="file" accept="image/*" multiple class="sr-only" data-testid="photo-input" :disabled="busy" @change="onPick($event, 'IMAGE')" />
              </label>
              <label class="cursor-pointer rounded-full border border-primary-600 px-4 py-2 text-sm font-bold text-primary-700 hover:bg-primary-50">
                {{ $t('exhibitor.addVideo') }}
                <input type="file" accept="video/*" class="sr-only" data-testid="video-input" :disabled="busy" @change="onPick($event, 'VIDEO')" />
              </label>
            </div>
          </div>
          <p v-if="!gallery.length" class="mt-4 rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">{{ $t('exhibitor.galleryEmpty') }}</p>
          <div v-else class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <MediaTile v-for="m in gallery" :key="m.id" :item="m" :busy="busy" @remove="remove" />
          </div>
        </section>

        <p class="text-center text-xs text-gray-500">{{ $t('exhibitor.reviewNote') }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { exhibitorApi, ORGANIZATION_TYPES } from '../api/exhibitor.api'
import { reservationApi } from '@/features/reservation/api/reservation.api'
import { mediaUrl } from '@/shared/api/client'

const { t } = useI18n()

const loading = ref(true)
const busy = ref(false)
const org = ref(null)
const reservations = ref([])
const notice = ref('')
const error = ref('')
const form = ref(emptyForm())

function emptyForm() {
  return { name: '', type: 'SUPPLIER', description: '', email: '', website: '', address: '', city: '', phone: '', facebookUrl: '', instagramUrl: '', linkedinUrl: '', youtubeUrl: '' }
}

const media = computed(() => org.value?.media || [])
const logos = computed(() => media.value.filter((m) => m.mediaKind === 'LOGO'))
const logo = computed(() => logos.value.find((m) => m.reviewStatus === 'APPROVED') || logos.value[0] || null)
const gallery = computed(() => media.value.filter((m) => m.mediaKind !== 'LOGO'))

/** One tile for a logo, photo or video, with its review state. */
const MediaTile = defineComponent({
  props: { item: { type: Object, required: true }, busy: Boolean },
  emits: ['remove'],
  setup(props, { emit }) {
    const { t: tt } = useI18n()
    const chip = (s) =>
      s === 'APPROVED' ? 'bg-green-100 text-green-800' : s === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
    return () =>
      h('div', { class: 'relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50', 'data-testid': `media-${props.item.id}` }, [
        props.item.mediaKind === 'VIDEO'
          ? h('video', { src: mediaUrl(props.item.url), class: 'aspect-video w-full object-cover', muted: true, playsinline: true, controls: true })
          : h('img', { src: mediaUrl(props.item.url), alt: props.item.caption || '', class: props.item.mediaKind === 'LOGO' ? 'h-28 w-40 object-contain p-2' : 'aspect-video w-full object-cover' }),
        h('span', { class: `absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${chip(props.item.reviewStatus)}`, 'data-testid': 'review-chip' }, tt(`exhibitor.review.${props.item.reviewStatus || 'APPROVED'}`)),
        h('button', { type: 'button', class: 'absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-red-700 hover:bg-white', disabled: props.busy, 'aria-label': tt('exhibitor.remove'), onClick: () => emit('remove', props.item) }, tt('exhibitor.remove')),
        props.item.reviewStatus === 'REJECTED' && props.item.reviewNote
          ? h('p', { class: 'px-2 py-1 text-[11px] text-red-700' }, props.item.reviewNote)
          : null
      ])
  }
})

function fill(o) {
  const phone = o.phoneNumbers && o.phoneNumbers.length ? o.phoneNumbers[0].number || '' : ''
  form.value = {
    name: o.name || '',
    type: o.type || 'SUPPLIER',
    description: o.description || '',
    email: o.email || '',
    website: o.website || '',
    address: o.address || '',
    city: o.city || '',
    phone,
    facebookUrl: o.facebookUrl || '',
    instagramUrl: o.instagramUrl || '',
    linkedinUrl: o.linkedinUrl || '',
    youtubeUrl: o.youtubeUrl || ''
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [o, rs] = await Promise.all([exhibitorApi.myOrganization(), reservationApi.mine().catch(() => [])])
    org.value = o
    reservations.value = rs || []
    if (o) fill(o)
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('exhibitor.loadFailed')
  } finally {
    loading.value = false
  }
}

function flash(msg) {
  notice.value = msg
  error.value = ''
  setTimeout(() => {
    if (notice.value === msg) notice.value = ''
  }, 4000)
}
function fail(e) {
  error.value = e?.response?.data?.message || e?.message || t('exhibitor.failed')
  notice.value = ''
}

async function saveProfile() {
  busy.value = true
  try {
    const f = form.value
    const body = {
      name: f.name.trim(),
      type: f.type,
      description: f.description.trim(),
      email: f.email.trim(),
      website: f.website.trim(),
      address: f.address.trim(),
      city: f.city.trim(),
      facebookUrl: f.facebookUrl.trim(),
      instagramUrl: f.instagramUrl.trim(),
      linkedinUrl: f.linkedinUrl.trim(),
      youtubeUrl: f.youtubeUrl.trim(),
      phoneNumbers: f.phone.trim() ? [{ countryCode: '+251', number: f.phone.trim() }] : []
    }
    org.value = await exhibitorApi.updateProfile(org.value.id, body)
    fill(org.value)
    flash(t('exhibitor.profileSaved'))
  } catch (e) {
    fail(e)
  } finally {
    busy.value = false
  }
}

async function onPick(event, kind) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return
  busy.value = true
  try {
    org.value = await exhibitorApi.upload(org.value.id, files, kind)
    flash(t('exhibitor.uploaded', { n: files.length }))
  } catch (e) {
    fail(e)
  } finally {
    busy.value = false
  }
}

async function remove(item) {
  if (typeof window !== 'undefined' && window.confirm && !window.confirm(t('exhibitor.removeConfirm'))) return
  busy.value = true
  try {
    org.value = await exhibitorApi.remove(org.value.id, item.id)
    flash(t('exhibitor.removed'))
  } catch (e) {
    fail(e)
  } finally {
    busy.value = false
  }
}

function money(v) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' ETB'
}
function statusCls(s) {
  if (s === 'PAID') return 'bg-green-100 text-green-800'
  if (s === 'DEPOSIT_PAID' || s === 'SIGNED') return 'bg-blue-100 text-blue-800'
  if (s === 'CANCELLED') return 'bg-gray-100 text-gray-600'
  return 'bg-gold-400 text-primary-950'
}

onMounted(load)
</script>

<style scoped>
.input {
  @apply mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500;
}
</style>

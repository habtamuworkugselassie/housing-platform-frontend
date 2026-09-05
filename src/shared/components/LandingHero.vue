<template>
  <section class="landing-hero" aria-label="Ethio Build Connect">
    <div class="landing-hero__content">
      <div class="landing-hero__copy">
        <p class="landing-hero__eyebrow">{{ $t('home.heroEyebrow') }}</p>
        <h1>{{ $t('home.heroHeadline') }}</h1>
        <p class="landing-hero__lead">{{ $t('home.heroSubtext') }}</p>

        <p class="landing-hero__trust" aria-live="polite">
          <span class="landing-hero__trust-dot" aria-hidden="true" />
          <template v-if="listingCount != null && companyCount != null">
            <strong>{{ formatNumber(listingCount) }}</strong>&nbsp;{{ listingCount === 1 ? $t('home.trustListingsOne') : $t('home.trustListings') }}
            <span class="landing-hero__trust-sep" aria-hidden="true">·</span>
            <strong>{{ formatNumber(companyCount) }}</strong>&nbsp;{{ $t('home.partnerCompanies') }}
          </template>
          <template v-else>{{ $t('home.heroTrustLine') }}</template>
        </p>
      </div>

      <form class="landing-hero__search" role="search" :aria-label="$t('home.searchTitle')" @submit.prevent="search">
        <p class="landing-hero__search-title">{{ $t('home.searchTitle') }}</p>

        <label class="landing-hero__field">
          <span class="landing-hero__label">{{ $t('home.searchLocation') }}</span>
          <span class="landing-hero__input-wrap">
            <svg class="landing-hero__input-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" />
            </svg>
            <input
              v-model.trim="city"
              type="text"
              name="city"
              list="landing-hero-cities"
              autocomplete="off"
              :placeholder="$t('home.searchLocationPlaceholder')"
            />
            <datalist id="landing-hero-cities">
              <option v-for="c in cities" :key="c" :value="c" />
            </datalist>
          </span>
        </label>

        <button type="submit" class="landing-hero__submit">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          {{ $t('home.searchButton') }}
        </button>

        <p class="landing-hero__quick">
          <span>{{ $t('home.quickLinks') }}</span>
          <router-link to="/properties">{{ $t('nav.properties') }}</router-link>
          <router-link to="/buildings">{{ $t('nav.buildings') }}</router-link>
          <router-link to="/real-estate">{{ $t('home.companiesLink') }}</router-link>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { propertyApi } from '@/features/property/api/property.api'
import { getSponsoredOrganizations } from '@/features/exhibition/api/exhibition.api'

const router = useRouter()

const city = ref('')
const listingCount = ref(null)
const companyCount = ref(null)

// Common search areas; the listings page filters by free-text city so anything typed works.
const cities = [
  'Addis Ababa', 'Bole', 'CMC', 'Kazanchis', 'Megenagna', 'Old Airport', 'Sarbet',
  'Ayat', 'Summit', 'Gerji', 'Jemo', 'Lebu', 'Piassa', 'Bishoftu', 'Adama', 'Hawassa', 'Bahir Dar',
]

function search() {
  router.push({ path: '/properties', query: city.value ? { city: city.value } : {} })
}

function formatNumber(n) {
  try {
    return Number(n).toLocaleString()
  } catch {
    return String(n)
  }
}

// Real figures for the trust line, loaded quietly; the copy falls back to a factual line until then.
onMounted(async () => {
  const [props, orgs] = await Promise.allSettled([
    propertyApi.getProperties(undefined, { page: 0, size: 1 }),
    getSponsoredOrganizations(),
  ])
  if (props.status === 'fulfilled' && typeof props.value?.totalElements === 'number') {
    listingCount.value = props.value.totalElements
  }
  if (orgs.status === 'fulfilled' && Array.isArray(orgs.value)) {
    companyCount.value = orgs.value.length
  }
})
</script>

<style scoped>
.landing-hero {
  position: relative;
  color: #fff;
  background: linear-gradient(180deg, #4c1d95 0%, #3b1578 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.landing-hero__content {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(20rem, 0.8fr);
  gap: 3.5rem;
  align-items: center;
  max-width: 80rem;
  margin: 0 auto;
  padding: clamp(3.5rem, 7vw, 6.5rem) 1.5rem;
}
.landing-hero__copy { max-width: 40rem; }
.landing-hero__eyebrow {
  margin: 0 0 1rem;
  color: #f4c977;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  font-size: clamp(2.25rem, 4.6vw, 3.75rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.08;
}
.landing-hero__lead {
  max-width: 36rem;
  margin: 1.25rem 0 0;
  color: #e9e1ff;
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  line-height: 1.65;
}
.landing-hero__trust {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 1.75rem 0 0;
  color: #d8ccf5;
  font-size: 0.9rem;
}
.landing-hero__trust strong { color: #fff; font-weight: 700; }
.landing-hero__trust-sep { color: #a58fd6; }
.landing-hero__trust-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #6ee7b7;
}

/* Search card */
.landing-hero__search {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #fff;
  color: #111827;
  box-shadow: 0 1.5rem 3.5rem rgba(20, 5, 45, 0.28);
}
.landing-hero__search-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: #111827; }
.landing-hero__field { display: grid; gap: 0.4rem; }
.landing-hero__label { font-size: 0.8rem; font-weight: 600; color: #4b5563; }
.landing-hero__input-wrap { position: relative; display: block; }
.landing-hero__input-icon {
  position: absolute;
  top: 50%;
  left: 0.85rem;
  width: 1.1rem;
  height: 1.1rem;
  transform: translateY(-50%);
  fill: none;
  stroke: #6b7280;
  stroke-width: 1.8;
  pointer-events: none;
}
.landing-hero__input-wrap input {
  width: 100%;
  min-height: 3rem;
  padding: 0 0.9rem 0 2.6rem;
  border: 1px solid #d1d5db;
  border-radius: 0.6rem;
  background: #fff;
  color: #111827;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.landing-hero__input-wrap input::placeholder { color: #9ca3af; }
.landing-hero__input-wrap input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18); }
.landing-hero__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 3rem;
  border: 0;
  border-radius: 0.6rem;
  background: #7c3aed;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.landing-hero__submit:hover { background: #6d28d9; }
.landing-hero__submit svg { width: 1.1rem; height: 1.1rem; fill: none; stroke: currentColor; stroke-width: 2; }
.landing-hero__quick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.9rem;
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}
.landing-hero__quick a { color: #5b21b6; font-weight: 600; text-decoration: none; }
.landing-hero__quick a:hover { text-decoration: underline; }

@media (max-width: 860px) {
  .landing-hero__content { grid-template-columns: 1fr; gap: 2.25rem; padding-top: 3rem; padding-bottom: 3rem; }
  .landing-hero__search { max-width: 34rem; }
}
</style>

<template>
  <section class="landing-hero" aria-label="Ethio Build Connect Exhibition">
    <div class="landing-hero__content">
      <div class="landing-hero__copy">
        <p class="landing-hero__eyebrow">{{ $t('home.expoEyebrow') }}</p>
        <h1>{{ $t('home.expoHeadline') }}</h1>
        <p class="landing-hero__lead">{{ $t('exhibition.planning.body') }}</p>
        <p class="landing-hero__who">{{ $t('exhibition.planning.whoShowcases') }}</p>

        <p class="landing-hero__trust" aria-live="polite">
          <span class="landing-hero__trust-dot" aria-hidden="true" />
          <template v-if="companyCount != null && companyCount > 0">
            <strong>{{ formatNumber(companyCount) }}</strong>&nbsp;{{ $t('home.partnerCompanies') }}
            <span class="landing-hero__trust-sep" aria-hidden="true">·</span>
          </template>
          {{ $t('home.expoRegistrationsOpen') }}
        </p>
      </div>

      <aside class="landing-hero__card" :aria-label="$t('home.expoCardTitle')">
        <div class="landing-hero__card-head">
          <p class="landing-hero__card-title">{{ $t('home.expoCardTitle') }}</p>
          <span class="landing-hero__badge">{{ $t('exhibition.planning.badge') }}</span>
        </div>

        <router-link
          v-for="opt in options"
          :key="opt.key"
          :to="{ path: '/', query: { interest: opt.interest }, hash: '#register' }"
          class="landing-hero__option"
        >
          <span class="landing-hero__option-icon" aria-hidden="true">
            <span class="material-icons !text-[20px] leading-none">{{ opt.icon }}</span>
          </span>
          <span class="landing-hero__option-text">
            <strong>{{ $t(opt.titleKey) }}</strong>
            <small>{{ $t(opt.hintKey) }}</small>
          </span>
          <svg class="landing-hero__option-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </router-link>

        <router-link to="/properties" class="landing-hero__marketplace">
          {{ $t('home.expoMarketplaceLink') }} →
        </router-link>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSponsoredOrganizations } from '@/features/exhibition/api/exhibition.api'

const companyCount = ref(null)

// Each option deep-links to the register form with the matching interest preselected.
const options = [
  { key: 'exhibit', interest: 'exhibitor', icon: 'storefront', titleKey: 'home.expoExhibit', hintKey: 'home.expoExhibitHint' },
  { key: 'visit', interest: 'visitor', icon: 'confirmation_number', titleKey: 'home.expoVisit', hintKey: 'home.expoVisitHint' },
  { key: 'sponsor', interest: 'partner', icon: 'workspace_premium', titleKey: 'home.expoSponsor', hintKey: 'home.expoSponsorHint' },
]

function formatNumber(n) {
  try { return Number(n).toLocaleString() } catch { return String(n) }
}

onMounted(async () => {
  try {
    const orgs = await getSponsoredOrganizations()
    if (Array.isArray(orgs)) companyCount.value = orgs.length
  } catch { /* trust line falls back to the registrations-open note */ }
})
</script>

<style scoped>
.landing-hero { position: relative; color: #111827; background: #ffffff; border-bottom: 1px solid #e5e7eb; }
.landing-hero__content {
  display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(21rem, 0.85fr); gap: 3.5rem; align-items: center;
  max-width: 80rem; margin: 0 auto; padding: clamp(3.5rem, 7vw, 6.5rem) 1.5rem;
}
.landing-hero__copy { max-width: 40rem; }
.landing-hero__eyebrow { margin: 0 0 1rem; color: #6d28d9; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1 { margin: 0; color: #111827; font-size: clamp(2.2rem, 4.4vw, 3.6rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.08; }
.landing-hero__lead { max-width: 36rem; margin: 1.25rem 0 0; color: #374151; font-size: clamp(1rem, 1.4vw, 1.125rem); line-height: 1.65; }
.landing-hero__who { max-width: 36rem; margin: 0.9rem 0 0; color: #6b7280; font-size: 0.95rem; line-height: 1.6; }
.landing-hero__trust { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin: 1.75rem 0 0; color: #6b7280; font-size: 0.9rem; }
.landing-hero__trust strong { color: #111827; font-weight: 700; }
.landing-hero__trust-sep { color: #9ca3af; }
.landing-hero__trust-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #10b981; }

/* Take-part card */
.landing-hero__card { display: grid; gap: 0.6rem; padding: 1.25rem; border: 1px solid #e5e7eb; border-radius: 1rem; background: #fff; box-shadow: 0 0.75rem 2rem rgba(17, 24, 39, 0.08); }
.landing-hero__card-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.35rem; }
.landing-hero__card-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: #111827; }
.landing-hero__badge { display: inline-flex; align-items: center; padding: 0.25rem 0.6rem; border-radius: 999px; background: #f5f3ff; color: #6d28d9; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
.landing-hero__option {
  display: grid; grid-template-columns: 2.5rem 1fr 1.1rem; align-items: center; gap: 0.85rem;
  padding: 0.85rem 0.9rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; color: #111827; text-decoration: none;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
}
.landing-hero__option:hover { border-color: #c4b5fd; background: #faf5ff; transform: translateY(-1px); }
.landing-hero__option-icon { display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 0.6rem; background: #f5f3ff; color: #6d28d9; }
.landing-hero__option-text { display: grid; gap: 0.15rem; min-width: 0; }
.landing-hero__option-text strong { font-size: 0.95rem; font-weight: 700; }
.landing-hero__option-text small { color: #6b7280; font-size: 0.8rem; line-height: 1.4; }
.landing-hero__option-arrow { width: 1.1rem; height: 1.1rem; fill: none; stroke: #9ca3af; stroke-width: 2; }
.landing-hero__option:hover .landing-hero__option-arrow { stroke: #6d28d9; }
.landing-hero__marketplace { display: block; margin-top: 0.35rem; padding: 0.625rem 0.5rem; text-align: center; color: #5b21b6; font-size: 0.85rem; font-weight: 600; text-decoration: none; }
.landing-hero__marketplace:hover { text-decoration: underline; }

@media (max-width: 860px) {
  .landing-hero__content { grid-template-columns: 1fr; gap: 2.25rem; padding-top: 3rem; padding-bottom: 3rem; }
  .landing-hero__card { max-width: 34rem; }
}
</style>

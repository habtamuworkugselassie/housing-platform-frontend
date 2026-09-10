<template>
  <!-- role="region" rather than a modal dialog: this is a choice, not a gate. Trapping
       focus or covering the page would pressure people into clicking whichever button
       makes it go away, which is the opposite of freely given consent. -->
  <section
    v-if="visible"
    class="cookie-consent"
    role="region"
    :aria-label="$t('cookieConsent.title')"
  >
    <div class="cookie-consent__inner">
      <div class="cookie-consent__copy">
        <p class="cookie-consent__title">{{ $t('cookieConsent.title') }}</p>
        <p class="cookie-consent__body">
          {{ $t('cookieConsent.message') }}
          <RouterLink to="/cookies" class="cookie-consent__link">
            {{ $t('legal.navCookies') }}
          </RouterLink>
        </p>
      </div>

      <!-- Both buttons carry the same weight. A prominent Accept beside a greyed-out
           Reject is a dark pattern, and a consent record collected that way is worth
           nothing. -->
      <div class="cookie-consent__actions">
        <button type="button" class="cookie-consent__button" @click="choose(CONSENT_DENIED)">
          {{ $t('cookieConsent.reject') }}
        </button>
        <button type="button" class="cookie-consent__button" @click="choose(CONSENT_GRANTED)">
          {{ $t('cookieConsent.accept') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  CONSENT_DENIED,
  CONSENT_GRANTED,
  hasChosen,
  onConsentChange,
  setConsent
} from '@/utils/cookieConsent'

// Shown until a choice exists. Read once at setup: the only thing that changes it during
// a visit is one of the two buttons below, or the control on the cookie policy page,
// which reaches this through onConsentChange.
const visible = ref(!hasChosen())

onConsentChange(() => {
  visible.value = false
})

function choose(choice) {
  setConsent(choice)
  visible.value = false
}
</script>

<style scoped>
.cookie-consent {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 60;
  padding: 0.9rem 1rem calc(0.9rem + env(safe-area-inset-bottom, 0px));
  background: #1f1b2e;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 -0.5rem 1.5rem rgba(17, 24, 39, 0.25);
  color: #f5f3ff;
}
.cookie-consent__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
}
.cookie-consent__copy { min-width: min(100%, 18rem); flex: 1 1 28rem; }
.cookie-consent__title { margin: 0 0 0.2rem; font-size: 0.9rem; font-weight: 700; }
.cookie-consent__body { margin: 0; font-size: 0.85rem; line-height: 1.55; color: rgba(245, 243, 255, 0.82); }
.cookie-consent__link { color: #fff; text-decoration: underline; }
.cookie-consent__link:hover { text-decoration: none; }
.cookie-consent__actions { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.cookie-consent__button {
  /* Identical styling for both, on purpose — see the template comment. */
  min-width: 8.5rem;
  padding: 0.6rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 0.5rem;
  background: transparent;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.cookie-consent__button:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.6); }
.cookie-consent__button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

@media (max-width: 560px) {
  .cookie-consent__actions { width: 100%; }
  .cookie-consent__button { flex: 1 1 0; min-width: 0; }
}
</style>

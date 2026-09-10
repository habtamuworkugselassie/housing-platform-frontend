import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { initAnalytics } from './utils/analytics'
import { analyticsAllowed, onConsentChange, CONSENT_GRANTED } from './utils/cookieConsent'
import './style.css'
import './styles/reveal.css'
import './styles/admin-theme.css'
import './styles/material.css'
import './styles/material-icons.css'
// Before public-design.css on purpose: the page-specific rules there must still
// win on pages that already had a considered light treatment.
import './styles/light-app.css'
import './styles/public-design.css'

// Analytics runs only for a visitor who has said yes.
//
// This used to be an unconditional `initAnalytics()`, so Google Analytics loaded on
// arrival for everyone. It is now gated on the stored choice, and `initAnalytics` is
// idempotent, so the listener simply starts it the moment consent is given without
// waiting for a reload. A visitor who declines never loads gtag.js at all — the tag is
// not loaded-then-silenced, it is never fetched, which is also why declining costs them
// a request they would otherwise make to googletagmanager.com.
//
// Runs before mount so a returning, consenting visitor's first page_view is not lost.
if (analyticsAllowed()) initAnalytics()
onConsentChange((choice) => {
  if (choice === CONSENT_GRANTED) initAnalytics()
})

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(head)
app.use(router)
app.use(i18n)

app.mount('#app')

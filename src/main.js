import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { initAnalytics } from './utils/analytics'
import './style.css'
import './styles/reveal.css'
import './styles/admin-theme.css'
import './styles/material.css'
import './styles/material-icons.css'
import './styles/public-design.css'

// No-op unless VITE_GA_MEASUREMENT_ID is set. Runs before mount so the router's
// first afterEach already has a configured tag to send its page_view to.
initAnalytics()

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(head)
app.use(router)
app.use(i18n)

app.mount('#app')

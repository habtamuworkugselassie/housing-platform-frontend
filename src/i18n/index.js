import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import am from './locales/am.json'
import { normalizeLocale } from './localeConfig'

const savedLocale = normalizeLocale(localStorage.getItem('locale'))

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    am,
    // Until dedicated catalogs exist, Oromo and Arabic use English copy (all keys resolve).
    om: en,
    ar: en
  }
})

export default i18n

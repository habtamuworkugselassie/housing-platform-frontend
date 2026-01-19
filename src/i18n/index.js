import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import am from './locales/am.json'

// Get saved locale from localStorage or default to 'en'
const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    am
  }
})

export default i18n

import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'
import { normalizeLocale, applyDocumentLocale } from '@/i18n/localeConfig'

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref(normalizeLocale(localStorage.getItem('locale')))

  i18n.global.locale.value = currentLocale.value
  applyDocumentLocale(currentLocale.value)

  const setLocale = (locale) => {
    const next = normalizeLocale(locale)
    currentLocale.value = next
    i18n.global.locale.value = next
    localStorage.setItem('locale', next)
    applyDocumentLocale(next)
  }

  return {
    currentLocale,
    setLocale
  }
})

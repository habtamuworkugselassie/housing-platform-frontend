import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref(localStorage.getItem('locale') || 'en')

  const setLocale = (locale) => {
    currentLocale.value = locale
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
  }

  const toggleLocale = () => {
    const newLocale = currentLocale.value === 'en' ? 'am' : 'en'
    setLocale(newLocale)
  }

  return {
    currentLocale,
    setLocale,
    toggleLocale
  }
})

import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ar from './locales/ar.json'

const messages = {
  en,
  ar
}

// Get saved language from localStorage or default to 'en'
const savedLocale = localStorage.getItem('app-locale') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,         // use saved language
  fallbackLocale: 'en', // fallback
  messages,
})

// Save language changes to localStorage
i18n.global.onBeforeLanguageSwitch = (locale) => {
  localStorage.setItem('app-locale', locale)
}

export default i18n

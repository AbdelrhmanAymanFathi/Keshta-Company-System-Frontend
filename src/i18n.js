import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ar from './locales/ar.json'

const messages = {
  en,
  ar
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',         // default language
  fallbackLocale: 'en', // fallback
  messages,
})

export default i18n

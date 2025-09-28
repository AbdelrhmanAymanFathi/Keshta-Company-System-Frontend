// src/main.js
import { createApp, watch } from 'vue'
import App from './App.vue'
import './assets/main.css'
import i18n from './i18n'
import axios from 'axios'

const app = createApp(App)

// use i18n
app.use(i18n)

// mount app
app.mount('#app')

/**
 * Set document <html> lang and dir based on locale
 * (required so browser/UA widgets and CSS direction behave correctly)
 */
function setDocumentLocale(locale) {
  if (!locale) locale = 'en'
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
}

// initial set (use i18n.global.locale.value because legacy: false)
setDocumentLocale(i18n.global.locale.value)

// watch for changes and update dir/lang automatically
watch(
  () => i18n.global.locale.value,
  (newLocale) => {
    setDocumentLocale(newLocale)
  }
)

const token = localStorage.getItem('accessToken')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

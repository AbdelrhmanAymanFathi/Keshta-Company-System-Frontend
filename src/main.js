// src/main.js
import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import i18n from './i18n'
import authManager from './auth'
import { initializeAuthStore } from './composables/authStore'
import './api' // Initialize API with token management

// Initialize auth store immediately on app load
initializeAuthStore()

const app = createApp(App)
const pinia = createPinia()

// use pinia
app.use(pinia)
// use i18n
app.use(i18n)
// use router
app.use(router)

// Provide auth manager globally
app.provide('authManager', authManager)

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

// Listen for auth state changes
authManager.addListener((event, data) => {
  console.log('Auth event:', event, data);
  
  if (event === 'auth:logout') {
    // Handle logout - redirect to login if not already there
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }
});

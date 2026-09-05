// src/main.js
import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { initThemePlatform } from '@acme/platform'
import { ThemeIcon } from '@acme/icon-packs'
import { iconRevision, ICON_REVISION_KEY } from '@acme/icon-packs'
import { themeRevision, THEME_REVISION_KEY } from '@acme/theme-engine'
import i18n from './i18n'
import authManager from './auth'
import { isAuthenticated, initializeAuthStore } from './composables/authStore'
import { realtimeService } from './services/realtimeService'
import { buildVersionService } from './services/buildVersionService'
import { tokenManager } from './api' // Initialize API with token management
import { installHeaderMotion } from './utils/headerMotionMount'

// Initialize auth store immediately on app load
initializeAuthStore()
initThemePlatform()

const app = createApp(App)
const pinia = createPinia()

app.component('ThemeIcon', ThemeIcon)
app.provide(ICON_REVISION_KEY, iconRevision)
app.provide(THEME_REVISION_KEY, themeRevision)

// Register TanStack Vue Query plugin (optional - install @tanstack/vue-query)
const queryClient = new QueryClient()
app.use(VueQueryPlugin, { queryClient })

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
installHeaderMotion(router)

// Watch for new builds and force a hard refresh (Ctrl+F5 equivalent) automatically
buildVersionService.start()

// Initialize realtime SSE connection after mount
if (isAuthenticated.value) {
  realtimeService.init(() => {
    try { return tokenManager.getToken() } catch { return null }
  })
}

// Watch auth changes to init/destroy SSE
watch(isAuthenticated, (val) => {
  if (val) {
    realtimeService.init(() => {
      try { return tokenManager.getToken() } catch { return null }
    })
  } else {
    realtimeService.destroy()
  }
})

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
    realtimeService.destroy()
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }
});

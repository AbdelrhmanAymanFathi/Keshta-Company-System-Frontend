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
import { isAuthenticated, initializeAuthStore, user } from './composables/authStore'
import { realtimeService } from './services/realtimeService'
import { buildVersionService } from './services/buildVersionService'
import { tokenManager } from './api' // Initialize API with token management
import { installHeaderMotion } from './utils/headerMotionMount'
import appTable from './directives/appTable'
import { playChatSound } from './utils/notificationSound'

// Initialize auth store immediately on app load
initializeAuthStore()
initThemePlatform()

const app = createApp(App)
const pinia = createPinia()

app.component('ThemeIcon', ThemeIcon)
app.directive('app-table', appTable)
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
let unsubscribeChatNotifications = null
function startRealtime() {
  realtimeService.init(() => {
    try { return tokenManager.getToken() } catch { return null }
  })
  unsubscribeChatNotifications?.()
  unsubscribeChatNotifications = realtimeService.subscribe('chat', ['message.new', 'call.incoming'], (event, data) => {
    if (event === 'message.new' && data?.message?.senderId !== Number(user.value?.id || user.value?.userId)) {
      playChatSound('messageReceived')
    }
    if (typeof Notification === 'undefined' || document.visibilityState === 'visible' || Notification.permission !== 'granted') return
    if (event === 'call.incoming') {
      const call = data?.call
      const caller = call?.participants?.find((participant) => participant.userId === call?.createdById)?.user?.name
      const notification = new Notification(i18n.global.t('messaging.incomingCall'), {
        body: `${caller || i18n.global.t('messaging.unknownCaller')} · ${i18n.global.t(call?.type === 'VIDEO' ? 'messaging.callVideo' : 'messaging.callAudio')}`,
        tag: `chat-call-${call?.id || 'incoming'}`,
      })
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } else {
      const notification = new Notification(i18n.global.t('messaging.title'), { body: i18n.global.t('messaging.newMessages') })
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  })
}

if (isAuthenticated.value) {
  startRealtime()
}

// Watch auth changes to init/destroy SSE
watch(isAuthenticated, (val) => {
  if (val) {
    startRealtime()
  } else {
    unsubscribeChatNotifications?.()
    unsubscribeChatNotifications = null
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

<template>
  <div :class="{'dir-rtl': isRTL}" class="min-h-screen bg-background">
    <!-- Loading Screen -->
    <AppLoader v-if="isAppLoading" :label="loaderLabel" />

    <!-- Main Content -->
    <router-view />
    
    <!-- Toast Notifications -->
    <Toast :host="true" />
    <!-- Global error overlay (e.g. 502 Bad Gateway from backend) -->
    <ErrorOverlay />
    <GlobalIncomingCallHost v-if="isLoggedIn" />
    <!-- Global search (Ctrl+H) command palette -->
    <GlobalSearchModal v-if="isLoggedIn" />
    <!-- First-visit startup splash + "Play Intro Sound" fallback (non-blocking) -->
    <StartupIntroOverlay />
  </div>
</template>

<script>
import './assets/shadcn-theme.css'
import Toast from './components/shared/Toast.vue'
import ErrorOverlay from './components/shared/ErrorOverlay.vue'
import AppLoader from './components/shared/AppLoader.vue'
import GlobalIncomingCallHost from './components/shared/GlobalIncomingCallHost.vue'
import GlobalSearchModal from './components/shared/GlobalSearchModal.vue'
import StartupIntroOverlay from './components/shared/StartupIntroOverlay.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from './composables/useAuth'
import { useRouteLoader } from './composables/useRouteLoader'
import { useRealtime } from './composables/useRealtime'
import { useNotificationStore } from './stores/useNotificationStore'
import { playNotificationSound } from './utils/notificationSound'
import { debounce } from './utils/debounce'

export default {
  name: 'AppRoot',
  components: { Toast, ErrorOverlay, AppLoader, GlobalIncomingCallHost, GlobalSearchModal, StartupIntroOverlay },
  setup() {
    const { locale, t } = useI18n()
    const { isLoggedIn, isLoading, currentUser } = useAuth()
    const { isRouteLoading } = useRouteLoader()
    const isAppLoading = computed(() => isLoading.value || isRouteLoading.value)
    const loaderLabel = computed(() => isLoading.value ? t('auth.login.loading') : t('labels.loading'))

    const notificationStore = useNotificationStore()
    notificationStore.fetchUnreadCount()

    const debouncedFetchUnread = debounce(() => notificationStore.fetchUnreadCount(), 300)
    // A burst (e.g. saving 20 rows at once) shows a single popup
    const debouncedAlert = debounce(() => {
      if (window.$toast) {
        window.$toast('إشعار جديد', 'info', 5000)
      }
      playNotificationSound()
    }, 500)

    useRealtime({
      channel: 'notifications',
      events: ['notification_created'],
      handler: (eventName, data) => {
        const myId = currentUser.value?.id
        // Only process notifications for the current user or broadcast (userId: null)
        if (data?.userId && data.userId !== myId) {
          return
        }
        debouncedFetchUnread()
        // Broadcast activity from other users only updates the bell, so it never covers someone's work
        if (data?.userId || (myId && data?.actorId === myId)) {
          debouncedAlert()
        }
      },
    })
    
    return { 
      locale,
      isLoggedIn,
      isLoading,
      isAppLoading,
      loaderLabel
    }
  },
  computed: {
    isRTL() { return this.locale === 'ar' }
  },
  watch: {
    locale(newVal) {
      document.documentElement.dir = newVal === 'ar' ? 'rtl' : 'ltr'
    }
  },
  mounted() {
    document.documentElement.dir = this.locale === 'ar' ? 'rtl' : 'ltr'
  }
}
</script>

<style>
.dir-rtl { direction: rtl; }
</style>

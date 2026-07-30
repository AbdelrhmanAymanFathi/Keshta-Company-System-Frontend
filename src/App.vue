<template>
  <div :class="{'dir-rtl': isRTL}" class="min-h-screen bg-gray-50">
    <!-- Loading Screen -->
    <AppLoader v-if="isAppLoading" :label="loaderLabel" />

    <!-- Main Content -->
    <router-view />
    
    <!-- Toast Notifications -->
    <Toast />
    <!-- Global error overlay (e.g. 502 Bad Gateway from backend) -->
    <ErrorOverlay />
  </div>
</template>

<script>
import Toast from './components/shared/Toast.vue'
import ErrorOverlay from './components/shared/ErrorOverlay.vue'
import AppLoader from './components/shared/AppLoader.vue'
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
  components: { Toast, ErrorOverlay, AppLoader },
  setup() {
    const { locale, t } = useI18n()
    const { isLoggedIn, isLoading } = useAuth()
    const { isRouteLoading } = useRouteLoader()
    const isAppLoading = computed(() => isLoading.value || isRouteLoading.value)
    const loaderLabel = computed(() => isLoading.value ? t('auth.login.loading') : t('labels.loading'))

    const notificationStore = useNotificationStore()
    notificationStore.fetchUnreadCount()

    const debouncedFetchUnread = debounce(() => notificationStore.fetchUnreadCount(), 300)

    useRealtime({
      channel: 'notifications',
      events: ['notification_created'],
      handler: () => {
        if (window.$toast) {
          window.$toast('إشعار جديد', 'info', 5000)
        }
        playNotificationSound()
        debouncedFetchUnread()
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

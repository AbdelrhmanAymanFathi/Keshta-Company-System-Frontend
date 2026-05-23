<template>
  <div :class="{'dir-rtl': isRTL}" class="min-h-screen bg-gray-50">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent mx-auto mb-4"></div>
        <p class="theme-text-secondary">{{ $t('auth.login.loading') }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <router-view v-else />
    
    <!-- Toast Notifications -->
    <Toast />
    <!-- Global error overlay (e.g. 502 Bad Gateway from backend) -->
    <ErrorOverlay />
  </div>
</template>

<script>
import Toast from './components/shared/Toast.vue'
import ErrorOverlay from './components/shared/ErrorOverlay.vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from './composables/useAuth'

export default {
  name: 'AppRoot',
  components: { Toast, ErrorOverlay },
  setup() {
    const { locale } = useI18n()
    const { isLoggedIn, isLoading } = useAuth()
    
    return { 
      locale,
      isLoggedIn,
      isLoading
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
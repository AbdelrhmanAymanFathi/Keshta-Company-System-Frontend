<template>
  <div :class="{'dir-rtl': isRTL}" class="min-h-screen bg-gray-50">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-600">{{ $t('auth.login.loading') }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <component
      v-else
      :is="isAuthenticated ? 'Dashboard' : currentAuthComponent"
      @auth-success="onAuthSuccess"
      @switch-auth="switchAuth"
    />
  </div>
</template>

<script>
import Dashboard from './components/dashboard/Dashboard.vue'
import AuthLogin from './components/auth/Login.vue'
import AuthRegister from './components/auth/Register.vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from './composables/useAuth'

export default {
  name: 'AppRoot',
  components: { Dashboard, AuthLogin, AuthRegister },
  setup() {
    const { locale } = useI18n()
    const { isLoggedIn, isLoading } = useAuth()
    
    return { 
      locale,
      isLoggedIn,
      isLoading
    }
  },
  data() {
    return {
      showRegister: false
    }
  },
  computed: {
    isRTL() { return this.locale === 'ar' },
    isAuthenticated() { return this.isLoggedIn },
    currentAuthComponent() { return this.showRegister ? 'AuthRegister' : 'AuthLogin' }
  },
  methods: {
    onAuthSuccess() {
      // Token is already handled by the auth system
      // Just reload to refresh the app state
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    },
    switchAuth(type) {
      this.showRegister = type === 'register'
    }
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

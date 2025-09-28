<template>
  <div :class="{'dir-rtl': isRTL}" class="min-h-screen bg-gray-50">
    <component
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

export default {
  name: 'AppRoot',
  components: { Dashboard, AuthLogin, AuthRegister },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  data() {
    return {
      isAuthenticated: !!localStorage.getItem('accessToken'),
      showRegister: false
    }
  },
  computed: {
    isRTL() { return this.locale === 'ar' },
    currentAuthComponent() { return this.showRegister ? 'AuthRegister' : 'AuthLogin' }
  },
  methods: {
    onAuthSuccess(token) {
      localStorage.setItem('accessToken', token)
      this.isAuthenticated = true
      window.location.reload()
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
  mounted(){
    document.documentElement.dir = this.locale === 'ar' ? 'rtl' : 'ltr'
  }
}
</script>

<style>
.dir-rtl { direction: rtl; }
</style>

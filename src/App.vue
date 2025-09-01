<template>
  <div :class="{'dir-rtl': isRTL}" class="min-h-screen bg-gray-50">
    <component :is="loggedIn ? 'Dashboard' : 'LoginPage'" @login-success="onLogin" />
  </div>
</template>

<script>
import LoginPage from './components/Login.vue'
import Dashboard from './components/dashboard/Dashboard.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AppRoot',
  components: { LoginPage, Dashboard },
  data() { return { loggedIn: false } },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  computed: {
    isRTL() { return this.locale === 'ar' }
  },
  methods: {
    onLogin() { this.loggedIn = true }
  },
  watch: {
    // عند تغيير اللغة ضيف/شيل dir على المستند
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

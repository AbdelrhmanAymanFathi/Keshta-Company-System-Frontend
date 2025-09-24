<template>
  <div :class="{'dir-rtl': isRTL}" class="min-h-screen bg-gray-50">
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from './components/dashboard/Dashboard.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AppRoot',
  components: { Dashboard },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  computed: {
    isRTL() { return this.locale === 'ar' }
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

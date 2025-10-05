<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('auth.logout.title') }}</h2>
        <p class="text-gray-600">{{ $t('auth.logout.message') }}</p>
      </div>

      <!-- User Info -->
      <div v-if="user" class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ user.name || user.email }}</p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          :disabled="loading"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
        >
          {{ $t('auth.logout.cancel') }}
        </button>
        <button
          @click="handleLogout"
          :disabled="loading"
          class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? $t('auth.login.loading') : $t('auth.logout.button') }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AuthLogout',
  emits: ['cancel', 'logout-success'],
  setup() {
    const { logout: authLogout, currentUser, loading } = useAuth()
    const { locale } = useI18n()
    
    return {
      authLogout,
      currentUser,
      loading,
      locale
    }
  },
  data() {
    return {
      error: ''
    }
  },
  computed: {
    isRTL() {
      return this.locale === 'ar'
    },
    user() {
      return this.currentUser
    }
  },
  methods: {
    async handleLogout() {
      this.error = ''
      
      try {
        await this.authLogout()
        this.$emit('logout-success')
      } catch (error) {
        console.error('Logout error:', error)
        this.error = this.$t('common.error')
      }
    }
  }
}
</script>



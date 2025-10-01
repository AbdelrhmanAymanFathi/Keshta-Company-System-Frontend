<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
    <!-- Language switcher -->
    <div class="absolute top-4 right-4 flex gap-2">
      <button 
        @click="switchLang('en')" 
        :class="btnClass('en')" 
        class="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200"
        :title="$t('auth.login.title')"
      >
        <img src="/flags/us.png" alt="EN" class="w-6 h-6" />
      </button>
      <button 
        @click="switchLang('ar')" 
        :class="btnClass('ar')" 
        class="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200"
        :title="$t('auth.login.title')"
      >
        <img src="/flags/eg.png" alt="AR" class="w-6 h-6" />
      </button>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('auth.login.title') }}</h1>
          <p class="text-gray-600">{{ $t('auth.login.subtitle') }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="submit" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('auth.login.email') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
              <input
                v-model="email"
                type="email"
                autocomplete="username"
                :placeholder="$t('auth.login.email')"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                :class="{ 'border-red-500': emailError }"
                required
              />
            </div>
            <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('auth.login.password') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :placeholder="$t('auth.login.password')"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                :class="{ 'border-red-500': passwordError }"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">{{ $t('auth.login.rememberMe') }}</span>
            </label>
            <a href="#" class="text-sm text-indigo-600 hover:text-indigo-500">
              {{ $t('auth.login.forgotPassword') }}
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? $t('auth.login.loading') : $t('auth.login.button') }}
          </button>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
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

          <!-- Success Message -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-800">{{ success }}</p>
              </div>
            </div>
          </div>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            {{ $t('auth.login.noAccount') }}
            <a 
              href="#" 
              @click.prevent="$emit('switch-auth', 'register')" 
              class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {{ $t('auth.login.register') }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AuthLogin',
  emits: ['auth-success', 'switch-auth'],
  setup() {
    const { login: authLogin, loading } = useAuth()
    const { locale } = useI18n()
    
    return {
      authLogin,
      loading,
      locale
    }
  },
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      error: '',
      success: '',
      emailError: '',
      passwordError: ''
    }
  },
  computed: {
    isRTL() {
      return this.locale === 'ar'
    }
  },
  methods: {
    async submit() {
      this.clearErrors()
      
      // Validate form
      if (!this.validateForm()) {
        return
      }

      try {
        const credentials = {
          email: this.email.trim().toLowerCase(),
          password: this.password
        }

        const result = await this.authLogin(credentials)
        
        if (result.success) {
          this.success = this.$t('auth.login.success')
          
          // Store remember me preference
          if (this.rememberMe) {
            localStorage.setItem('rememberMe', 'true')
          } else {
            localStorage.removeItem('rememberMe')
          }
          
          // Emit success event
          this.$emit('auth-success', result.data.accessToken)
        }
      } catch (error) {
        this.handleLoginError(error)
      }
    },

    validateForm() {
      let isValid = true

      // Email validation
      if (!this.email) {
        this.emailError = this.$t('auth.login.errors.required')
        isValid = false
      } else if (!this.isValidEmail(this.email)) {
        this.emailError = this.$t('auth.login.errors.invalidEmail')
        isValid = false
      }

      // Password validation
      if (!this.password) {
        this.passwordError = this.$t('auth.login.errors.required')
        isValid = false
      } else if (this.password.length < 6) {
        this.passwordError = this.$t('auth.login.errors.weakPassword')
        isValid = false
      }

      return isValid
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    handleLoginError(error) {
      console.error('Login error:', error)
      
      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.message || error.response.data?.error
        
        switch (status) {
          case 401:
            this.error = this.$t('auth.login.errors.invalidCredentials')
            break
          case 400:
            this.error = message || this.$t('auth.login.errors.invalidCredentials')
            break
          case 500:
            this.error = this.$t('auth.login.errors.serverError')
            break
          default:
            this.error = message || this.$t('auth.login.errors.serverError')
        }
      } else if (error.request) {
        this.error = this.$t('auth.login.errors.networkError')
      } else {
        this.error = this.$t('auth.login.errors.serverError')
      }
    },

    clearErrors() {
      this.error = ''
      this.success = ''
      this.emailError = ''
      this.passwordError = ''
    },

    switchLang(lang) {
      this.$i18n.locale = lang
    },

    btnClass(lang) {
      return this.$i18n.locale === lang ? 'ring-2 ring-indigo-400' : ''
    }
  },

  mounted() {
    // Check if user wants to be remembered
    if (localStorage.getItem('rememberMe') === 'true') {
      this.rememberMe = true
    }
  }
}
</script>

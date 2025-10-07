<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
    <!-- Language switcher -->
    <div class="absolute top-4 right-4 flex gap-2">
      <button 
        @click="switchLang('en')" 
        :class="btnClass('en')" 
        class="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200"
        :title="$t('auth.register.title')"
      >
        <img src="/flags/us.png" alt="EN" class="w-6 h-6" />
      </button>
      <button 
        @click="switchLang('ar')" 
        :class="btnClass('ar')" 
        class="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200"
        :title="$t('auth.register.title')"
      >
        <img src="/flags/eg.png" alt="AR" class="w-6 h-6" />
      </button>
    </div>

    <!-- Register Card -->
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('auth.register.title') }}</h1>
          <p class="text-gray-600">{{ $t('auth.register.subtitle') }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="submit" class="space-y-6">
          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <!-- First Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('auth.register.firstName') }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input
                  v-model="firstName"
                  type="text"
                  autocomplete="given-name"
                  :placeholder="$t('auth.register.firstName')"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  :class="{ 'border-red-500': firstNameError }"
                  required
                />
              </div>
              <p v-if="firstNameError" class="mt-1 text-sm text-red-600">{{ firstNameError }}</p>
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('auth.register.lastName') }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input
                  v-model="lastName"
                  type="text"
                  autocomplete="family-name"
                  :placeholder="$t('auth.register.lastName')"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  :class="{ 'border-red-500': lastNameError }"
                  required
                />
              </div>
              <p v-if="lastNameError" class="mt-1 text-sm text-red-600">{{ lastNameError }}</p>
            </div>
          </div>

          <!-- Phone Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('auth.register.phone') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 16.72V20a2 2 0 01-2 2h-1C9.163 22 2 14.837 2 6V5a2 2 0 011-1.732z" />
                </svg>
              </div>
              <input
                v-model="phone"
                type="tel"
                autocomplete="tel"
                :placeholder="$t('auth.register.phone')"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                :class="{ 'border-red-500': phoneError }"
                required
              />
            </div>
            <p v-if="phoneError" class="mt-1 text-sm text-red-600">{{ phoneError }}</p>
          </div>

          <!-- Email Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('auth.register.email') }}
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
                autocomplete="email"
                :placeholder="$t('auth.register.email')"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                :class="{ 'border-red-500': emailError }"
                required
              />
            </div>
            <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('auth.register.password') }}
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
                autocomplete="new-password"
                :placeholder="$t('auth.register.password')"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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

          <!-- Confirm Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('auth.register.confirmPassword') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :placeholder="$t('auth.register.confirmPassword')"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                :class="{ 'border-red-500': confirmPasswordError }"
                required
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">{{ confirmPasswordError }}</p>
          </div>

          <!-- Terms Agreement -->
          <div class="flex items-center">
            <input
              v-model="agreeTerms"
              type="checkbox"
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              required
            />
            <label class="ml-2 text-sm text-gray-700">
              {{ $t('auth.register.agreeTerms') }}
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? $t('auth.register.loading') : $t('auth.register.button') }}
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

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            {{ $t('auth.register.hasAccount') }}
            <a 
              href="#" 
              @click.prevent="$emit('switch-auth', 'login')" 
              class="font-medium text-green-600 hover:text-green-500 transition-colors"
            >
              {{ $t('auth.register.login') }}
            </a>
          </p>
      </div>
      </div>
      </div>
  </div>
</template>

<script>
import { register } from '../../api'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AuthRegister',
  emits: ['auth-success', 'switch-auth'],
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  data() {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      error: '',
      success: '',
      firstNameError: '',
      lastNameError: '',
      phoneError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: ''
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

      this.loading = true

      try {
        const userData = {
          name: `${this.firstName} ${this.lastName}`.trim(),
          phone: this.phone.trim(),
          email: this.email.trim().toLowerCase(),
          password: this.password
        }

        await register(userData)
        
        this.success = this.$t('auth.register.success')
        
        // Switch to login after successful registration
        setTimeout(() => {
        this.$emit('switch-auth', 'login')
        }, 2000)
        
      } catch (error) {
        this.handleRegisterError(error)
      } finally {
        this.loading = false
      }
    },

    validateForm() {
      let isValid = true

      // First name validation
      if (!this.firstName.trim()) {
        this.firstNameError = this.$t('auth.register.errors.required')
        isValid = false
      }

      // Last name validation
      if (!this.lastName.trim()) {
        this.lastNameError = this.$t('auth.register.errors.required')
        isValid = false
      }

      // Email validation
      if (!this.email.trim()) {
        this.emailError = this.$t('auth.register.errors.required')
        isValid = false
      } else if (!this.isValidEmail(this.email)) {
        this.emailError = this.$t('auth.register.errors.invalidEmail')
        isValid = false
      }

      // Phone validation (basic)
      if (!this.phone.trim()) {
        this.phoneError = this.$t('auth.register.errors.required')
        isValid = false
      } else if (!this.isValidPhone(this.phone)) {
        this.phoneError = this.$t('auth.register.errors.invalidPhone')
        isValid = false
      }

      // Password validation
      if (!this.password) {
        this.passwordError = this.$t('auth.register.errors.required')
        isValid = false
      } else if (this.password.length < 8) {
        this.passwordError = this.$t('auth.register.errors.weakPassword')
        isValid = false
      }

      // Confirm password validation
      if (!this.confirmPassword) {
        this.confirmPasswordError = this.$t('auth.register.errors.required')
        isValid = false
      } else if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = this.$t('auth.register.errors.passwordMismatch')
        isValid = false
      }

      // Terms agreement validation
      if (!this.agreeTerms) {
        this.error = this.$t('auth.register.errors.required')
        isValid = false
      }

      return isValid
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    isValidPhone(phone) {
      const digitsOnly = phone.replace(/\D/g, '')
      return digitsOnly.length >= 10 && digitsOnly.length <= 15
    },

    handleRegisterError(error) {
      console.error('Register error:', error)
      
      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.message || error.response.data?.error
        
        switch (status) {
          case 400:
            this.error = message || this.$t('auth.register.errors.emailExists')
            break
          case 409:
            this.error = this.$t('auth.register.errors.emailExists')
            break
          case 500:
            this.error = this.$t('auth.register.errors.serverError')
            break
          default:
            this.error = message || this.$t('auth.register.errors.serverError')
        }
      } else if (error.request) {
        this.error = this.$t('auth.register.errors.networkError')
      } else {
        this.error = this.$t('auth.register.errors.serverError')
      }
    },

    clearErrors() {
      this.error = ''
      this.success = ''
      this.firstNameError = ''
      this.lastNameError = ''
      this.phoneError = ''
      this.emailError = ''
      this.passwordError = ''
      this.confirmPasswordError = ''
    },

    switchLang(lang) {
      this.$i18n.locale = lang
    },

    btnClass(lang) {
      return this.$i18n.locale === lang ? 'ring-2 ring-green-400' : ''
    }
  }
}
</script>



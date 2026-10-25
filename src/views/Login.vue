<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'"
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl"></div>
      <div class="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl"></div>
    </div>
    <!-- Language switcher -->
    <div class="absolute right-4 top-4 z-10 flex gap-2 sm:right-6 sm:top-6">
      <Button variant="outline" size="icon" @click="switchLang('en')" :class="btnClass('en')"
        class="rounded-lg bg-white shadow-sm hover:shadow-md"
        :title="$t('auth.login.title')">
        <img src="/flags/us.png" alt="EN" class="w-6 h-6" />
      </Button>
      <Button variant="outline" size="icon" @click="switchLang('ar')" :class="btnClass('ar')"
        class="rounded-lg bg-white shadow-sm hover:shadow-md"
        :title="$t('auth.login.title')">
        <img src="/flags/eg.png" alt="AR" class="w-6 h-6" />
      </Button>
    </div>

    <!-- Login Card -->
    <Card class="relative z-0 w-full max-w-md overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/50">
      <CardContent class="p-6 sm:p-8">
        <!-- Header -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm">
            <svg class="w-8 h-8 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h1 class="mb-2 text-2xl font-bold tracking-tight text-slate-900">{{ $t('auth.login.title') }}</h1>
          <p class="text-sm leading-6 text-slate-500">{{ $t('auth.login.subtitle') }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="submit" class="space-y-5">
          <!-- Email Field -->
          <div class="space-y-2">
            <Label class="text-sm font-semibold text-slate-700">
              {{ $t('auth.login.email') }}
            </Label>
            <div class="relative">
              <div :class="isRTL ? 'right-0 pr-3' : 'left-0 pl-3'"
                class="pointer-events-none absolute inset-y-0 flex items-center">
                <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207">
                  </path>
                </svg>
              </div>
              <Input v-model="email" type="email" autocomplete="username" :placeholder="$t('auth.login.email')"
                :class="[isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4', 'h-12 rounded-xl border-slate-200 bg-slate-50/70 text-sm shadow-none transition focus-visible:bg-white focus-visible:ring-violet-500/20', { 'border-red-500': emailError }]"
                required />
            </div>
            <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <Label class="text-sm font-semibold text-slate-700">
              {{ $t('auth.login.password') }}
            </Label>
            <div class="relative">
              <div :class="isRTL ? 'right-0 pr-3' : 'left-0 pl-3'"
                class="pointer-events-none absolute inset-y-0 flex items-center">
                <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                  </path>
                </svg>
              </div>
              <Input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password"
                :placeholder="$t('auth.login.password')"
                :class="[isRTL ? 'pl-12 pr-10' : 'pl-10 pr-12', 'h-12 rounded-xl border-slate-200 bg-slate-50/70 text-sm shadow-none transition focus-visible:bg-white focus-visible:ring-violet-500/20', { 'border-red-500': passwordError }]"
                required />
              <Button variant="ghost" size="icon" type="button" @click="showPassword = !showPassword"
                :class="isRTL ? 'left-1.5' : 'right-1.5'"
                class="absolute inset-y-0 my-auto h-9 w-9 rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                :aria-label="showPassword ? (isRTL ? 'إخفاء كلمة المرور' : 'Hide password') : (isRTL ? 'إظهار كلمة المرور' : 'Show password')">
                <svg v-if="showPassword" class="h-5 w-5 theme-caption" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21">
                  </path>
                </svg>
                <svg v-else class="h-5 w-5 theme-caption" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                  </path>
                </svg>
              </Button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between gap-3 pt-1">
            <Label class="cursor-pointer gap-2 text-sm font-normal text-slate-600">
              <Checkbox v-model="rememberMe" />
              {{ $t('auth.login.rememberMe') }}
            </Label>
            <a href="#" class="text-sm font-medium text-violet-600 transition hover:text-violet-700 hover:underline">
              {{ $t('auth.login.forgotPassword') }}
            </a>
          </div>

          <!-- Submit Button -->
          <Button v-if="step === 'credentials'" type="submit" :disabled="loading"
            class="h-12 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/25">
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 theme-text-light" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ loading ? $t('auth.login.loading') : $t('auth.login.button') }}
          </Button>

          <!-- TOTP submit (shown when server asks for 2FA) -->
          <div v-if="step === 'totp'" class="space-y-4">
            <div>
                <Label class="mb-2 text-sm font-medium text-slate-700">{{ $t('auth.login.totpLabel') || 'Authenticator code' }}</Label>
                <Input v-model="totpCode" type="text" maxlength="6" inputmode="numeric" pattern="[0-9]*"
                  class="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 shadow-none focus-visible:bg-white" />
            </div>
            <div class="flex gap-3">
              <Button variant="outline" @click.prevent="restartLogin" class="h-11 flex-1 rounded-xl">{{ $t('labels.cancel') }}</Button>
              <Button @click.prevent="submitTotp" :disabled="loading" class="h-11 flex-1 rounded-xl bg-violet-600 text-white hover:bg-violet-700">{{ $t('auth.login.button') }}</Button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
        <!-- <div class="mt-6 text-center">
          <p class="text-sm theme-text-secondary">
            {{ $t('auth.login.noAccount') }}
            <a href="#" @click.prevent="$emit('switch-auth', 'register')"
              class="font-medium theme-link transition-colors">
              {{ $t('auth.login.register') }}
            </a>
          </p>
        </div> -->
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
import { isAuthenticated, user } from '@/composables/authStore';
import router from '@/router';
import { login as apiLogin, loginWith2fa, tokenManager } from '@/api'
import authManager from '@/auth'

export default {
  name: 'AuthLogin',
  components: { Card, CardContent, Input, Button, Label, Checkbox },
  emits: ['auth-success', 'switch-auth'],
  setup() {
    const { loading } = useAuth()
    const { locale } = useI18n()

    if (isAuthenticated.value && !loading.value) {
      router.replace('/dashboard');
    }

    return {
      
      loading,
      locale
    }
  },
  data() {
    return {
      email: '',
      password: '',
      // 2FA state
      step: 'credentials', // 'credentials' or 'totp'
      loginToken: null,
      totpCode: '',
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
    landingRoute(user) {
      const roles = Array.isArray(user?.roles) ? user.roles : []
      return roles.some(role => role.roleId === 1)
        ? { name: 'admin-statistics' }
        : { name: 'supplies-list' }
    },
    async submit() {
      this.clearErrors()

      // Validate form
      if (!this.validateForm()) {
        // Show first validation error as a toast for better visibility
        const firstError = this.emailError || this.passwordError
        if (firstError && window.$toast) window.$toast(firstError, 'error')
        return
      }

      try {
        const credentials = { email: this.email.trim().toLowerCase(), password: this.password }
        const resp = await apiLogin(credentials)
        const data = resp.data || {}

        // If server indicates TOTP required, move to second step
        if (data.totpRequired) {
          this.step = 'totp'
          this.loginToken = data.loginToken
          // Optionally keep user info for display
          this.success = ''
          return
        }

        // Otherwise, expect accessToken
        if (data.accessToken) {
          // Set token and user state via authManager/tokenManager
          tokenManager.setToken(data.accessToken)
          tokenManager.scheduleTokenRefresh(data.accessToken)
          if (data.user) {
            authManager.setAuthState(true, data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
          } else {
            authManager.setAuthState(true, null)
          }

          this.success = this.$t('auth.login.success')
          if (window.$toast) window.$toast(this.success, 'success')

          if (this.rememberMe) localStorage.setItem('rememberMe', 'true')
          else localStorage.removeItem('rememberMe')

          this.$router.push(this.landingRoute(data.user || user.value))
        } else {
          throw new Error('Invalid login response')
        }
      } catch (error) {
        this.handleLoginError(error)
      }
    },

    async submitTotp() {
      this.clearErrors()
      if (!this.totpCode || !/^[0-9]{6}$/.test(this.totpCode)) {
        if (window.$toast) window.$toast(this.$t('auth.login.errors.invalidTotp') || 'Enter a valid 6-digit code', 'error')
        return
      }

      try {
        const resp = await loginWith2fa({ loginToken: this.loginToken, token: this.totpCode })
        const data = resp.data || {}
        if (data.accessToken) {
          tokenManager.setToken(data.accessToken)
          tokenManager.scheduleTokenRefresh(data.accessToken)
          if (data.user) {
            authManager.setAuthState(true, data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
          } else {
            authManager.setAuthState(true, null)
          }
          if (window.$toast) window.$toast(this.$t('auth.login.success'), 'success')
          this.$router.push(this.landingRoute(data.user || user.value))
        } else {
          throw new Error('Invalid 2FA response')
        }
      } catch (err) {
        // Detect expired/consumed challenge and restart login flow
        const resp = err?.response
        const msg = (resp?.data?.message || resp?.data?.error || '').toString().toLowerCase()
        const status = resp?.status
        if (status === 410 || msg.includes('expired') || msg.includes('consumed') || msg.includes('challenge')) {
          if (window.$toast) window.$toast(this.$t('auth.login.errors.challengeExpired') || 'Login challenge expired or used — please sign in again', 'error')
          this.restartLogin()
          return
        }
        this.handleLoginError(err)
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

    restartLogin() {
      // Keep email so user doesn't need to retype, but clear sensitive fields
      this.step = 'credentials'
      this.loginToken = null
      this.totpCode = ''
      this.password = ''
      // Optionally focus email or password input in UI - left to browser
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    handleLoginError(error) {
      console.error('Login error:', error)
      if (error.response) {
        const status = error.response.status
        let message = error.response.data?.message || error.response.data?.error

        // Prefer translating common English server messages to local i18n keys
        if (message) {
          const serverMsg = String(message).trim()

          // Map fragments (case-insensitive) to i18n keys
          const mappings = [
            { match: 'invalid totp', key: 'auth.login.errors.invalidTotp' },
            { match: 'invalid credentials', key: 'auth.login.errors.invalidCredentials' },
            { match: 'challenge expired', key: 'auth.login.errors.challengeExpired' },
            { match: 'login challenge expired', key: 'auth.login.errors.challengeExpired' }
          ]

          let translated = null
          const lower = serverMsg.toLowerCase()
          for (const m of mappings) {
            if (lower.includes(m.match)) {
              translated = this.$t(m.key)
              break
            }
          }

          // Show translated text when mapping exists, otherwise show server message
          this.error = translated || serverMsg
          if (window.$toast) window.$toast(this.error, 'error')
          return
        }

        // Fallback to local translations when server message isn't present
        switch (status) {
          case 401:
            this.error = this.$t('auth.login.errors.invalidCredentials')
            break
          case 400:
            this.error = this.$t('auth.login.errors.invalidCredentials')
            break
          case 500:
            this.error = this.$t('auth.login.errors.serverError')
            break
          default:
            this.error = this.$t('auth.login.errors.serverError')
        }
        if (window.$toast) window.$toast(this.error, 'error')
      } else if (error.request) {
        this.error = this.$t('auth.login.errors.networkError')
        if (window.$toast) window.$toast(this.error, 'error')
      } else {
        this.error = this.$t('auth.login.errors.serverError')
        if (window.$toast) window.$toast(this.error, 'error')
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
      return this.$i18n.locale === lang ? 'theme-ring-active' : ''
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

<template>
  <div class="flex items-center justify-center min-h-screen px-4 bg-indigo-50">
    <div class="max-w-md w-full bg-white shadow rounded-lg p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-extrabold text-gray-800">{{ $t('login.title') }}</h2>
        <div class="flex gap-2">
          <button @click="switchLang('en')" :class="btnClass('en')" class="p-2 rounded-md bg-white">
            <img src="/flags/us.png" alt="EN" class="w-6 h-6" />
          </button>
          <button @click="switchLang('ar')" :class="btnClass('ar')" class="p-2 rounded-md bg-white">
            <img src="/flags/eg.png" alt="AR" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="text-sm font-medium block mb-1">{{ $t('login.email') }}</label>
          <input
            v-model="email"
            type="email"
            autocomplete="username"
            placeholder="example@example.com"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>
        <div>
          <label class="text-sm font-medium block mb-1">{{ $t('login.password') }}</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-60"
        >
          {{ $t('login.button') }}
        </button>
      </form>

      <div v-if="error" class="error text-red-500 text-sm text-center">{{ error }}</div>
      <p class="text-xs text-center text-gray-400">شركة قشطة للمقاولات</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { login } from '@/api'

export default {
  name: 'LoginPage',
  emits: ['auth-success'],
  data () {
    return { email: '', password: '', error: null, loading: false }
  },
  methods: {
    async handleLogin () {
      this.loading = true
      this.error = null
      try {
        const payload = {
          email: this.email.trim().toLowerCase(),
          password: this.password
        }
        const res = await login(payload)

        const token = res?.data?.accessToken
        if (!token) {
          this.error = 'No accessToken in response'
          return
        }

        localStorage.setItem('accessToken', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // emit TOKEN to be consistent with App.vue
        this.$emit('auth-success', token)
      } catch (err) {
        const apiMsg = err?.response?.data?.message || err?.response?.data?.error || ''
        this.error = apiMsg || (err?.response?.status === 401 ? 'Invalid email or password' : 'Login failed')
      } finally {
        this.loading = false
      }
    },
    switchLang (lang) { this.$i18n.locale = lang },
    btnClass (lang) { return this.$i18n.locale === lang ? 'ring-2 ring-indigo-400' : '' }
  }
}
</script>

<style scoped>
/* Tailwind handles responsiveness & shadows */
</style>

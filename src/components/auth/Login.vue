<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <form @submit.prevent="submit" class="bg-white p-6 rounded shadow w-80">
      <h2 class="text-xl font-bold mb-4">{{ $t('login.title') }}</h2>

      <div class="mb-3">
        <label class="block mb-1">{{ $t('login.email') }}</label>
        <input
          v-model="email"
          type="email"
          autocomplete="username"
          class="w-full border rounded px-2 py-1"
          required
        />
      </div>

      <div class="mb-3">
        <label class="block mb-1">{{ $t('login.password') }}</label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          class="w-full border rounded px-2 py-1"
          required
        />
      </div>

      <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded">
        {{ $t('login.button') }}
      </button>

      <div v-if="error" class="text-red-600 mt-2 text-sm">{{ error }}</div>

      <div class="mt-3 text-sm text-center">
        {{ $t('login.noAccount') }}
        <a href="#" @click.prevent="$emit('switch-auth', 'register')" class="text-indigo-600">
          {{ $t('login.register') }}
        </a>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { login } from '@/api'

export default {
  name: 'AuthLogin',
  emits: ['auth-success', 'switch-auth'],
  data () {
    return { email: '', password: '', error: '' }
  },
  methods: {
    async submit () {
      this.error = ''
      try {
        // normalize email to avoid backend case/space mismatches
        const payload = {
          email: this.email.trim().toLowerCase(),
          password: this.password
        }

        const res = await login(payload)

        // backend shape: { accessToken, user: {...} }
        const token = res?.data?.accessToken
        if (!token) {
          this.error = 'No accessToken in response'
          return
        }

        // persist & set auth header
        localStorage.setItem('accessToken', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // App.vue expects a TOKEN string here
        this.$emit('auth-success', token)
      } catch (e) {
        const apiMsg = e?.response?.data?.message || e?.response?.data?.error || ''
        this.error = apiMsg || (e?.response?.status === 401 ? 'Invalid email or password' : 'Login failed')
      }
    }
  }
}
</script>

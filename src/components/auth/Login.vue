<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <form @submit.prevent="submit" class="bg-white p-6 rounded shadow w-80">
      <h2 class="text-xl font-bold mb-4">{{ $t('login.title') }}</h2>
      <div class="mb-3">
        <label class="block mb-1">{{ $t('login.username') }}</label>
        <input v-model="email" type="email" class="w-full border rounded px-2 py-1" required />
      </div>
      <div class="mb-3">
        <label class="block mb-1">{{ $t('login.password') }}</label>
        <input v-model="password" type="password" class="w-full border rounded px-2 py-1" required />
      </div>
      <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded">{{ $t('login.button') }}</button>
      <div v-if="error" class="text-red-600 mt-2 text-sm">{{ error }}</div>
      <div class="mt-3 text-sm text-center">
        {{ $t('login.noAccount') }}
        <a href="#" @click.prevent="$emit('switch-auth', 'register')" class="text-indigo-600">{{ $t('login.register') }}</a>
      </div>
    </form>
  </div>
</template>

<script>
import { login } from '../../api'
import axios from 'axios'
export default {
  name: 'AuthLogin',
  emits: ['auth-success', 'switch-auth'],
  data() {
    return { email: '', password: '', error: '' }
  },
  methods: {
    async submit() {
      this.error = ''
      try {
        const res = await login({ email: this.email, password: this.password })
        const token = res.data.accessToken || res.data.token || (res.data.data && res.data.data.token)
        if (token) {
          localStorage.setItem('accessToken', token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          this.$emit('auth-success', token)
        } else {
          this.error = 'No token in response'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || 'Login failed'
      }
    }
  }
}
</script>

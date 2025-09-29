<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <form @submit.prevent="submit" class="bg-white p-6 rounded shadow w-80">
      <h2 class="text-xl font-bold mb-4">{{ $t('register.title') }}</h2>
      <div class="mb-3">
        <label class="block mb-1">{{ $t('register.name') }}</label>
        <input v-model="name" type="text" class="w-full border rounded px-2 py-1" required />
      </div>
      <div class="mb-3">
        <label class="block mb-1">{{ $t('register.email') }}</label>
        <input v-model="email" type="email" class="w-full border rounded px-2 py-1" required />
      </div>
      <div class="mb-3">
        <label class="block mb-1">{{ $t('register.phone') }}</label>
        <input v-model="phone" type="text" class="w-full border rounded px-2 py-1" required />
      </div>
      <div class="mb-3">
        <label class="block mb-1">{{ $t('register.password') }}</label>
        <input v-model="password" type="password" class="w-full border rounded px-2 py-1" required minlength="6" />
      </div>
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded">{{ $t('register.button') }}</button>
      <div v-if="error" class="text-red-600 mt-2 text-sm">{{ error }}</div>
      <div class="mt-3 text-sm text-center">
        {{ $t('register.haveAccount') }}
        <a href="#" @click.prevent="$emit('switch-auth', 'login')" class="text-indigo-600">{{ $t('register.login') }}</a>
      </div>
    </form>
  </div>
</template>
<script>
import { register } from '../../api'
export default {
  name: 'AuthRegister',
  emits: ['auth-success', 'switch-auth'],
  data() {
    return { name: '', email: '', phone: '', password: '', error: '' }
  },
  methods: {
    async submit() {
      this.error = ''
      if (this.password.length < 6) {
        this.error = 'Password must be at least 6 characters.'
        return
      }
      try {
        await register({
          name: this.name,
          email: this.email,
          phone: this.phone,
          password: this.password
        })
        // Optionally auto-login after register
        this.$emit('switch-auth', 'login')
      } catch (e) {
        // Try to show backend validation error if available
        const backendMsg = Array.isArray(e?.response?.data) && e.response.data[0]?.message
          ? e.response.data[0].message
          : e?.response?.data?.message || 'Register failed'
        this.error = backendMsg
      }
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4">
    <div class="max-w-md w-full card space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-extrabold">{{ $t('login.title') }}</h2>
        <div class="flex gap-2">
          <button @click="switchLang('en')" :class="btnClass('en')" class="p-2 rounded-md">
            <img src="/flags/us.png" alt="EN" class="w-6 h-6"/>
          </button>
          <button @click="switchLang('ar')" :class="btnClass('ar')" class="p-2 rounded-md">
            <img src="/flags/eg.png" alt="AR" class="w-6 h-6"/>
          </button>
        </div>
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="text-sm font-medium block mb-1">{{ $t('login.username') }}</label>
          <input v-model="username" type="text" placeholder="example" class="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400"/>
        </div>
        <div>
          <label class="text-sm font-medium block mb-1">{{ $t('login.password') }}</label>
          <input v-model="password" type="password" placeholder="••••••" class="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400"/>
        </div>
        <button type="submit" class="w-full btn-gradient">
          {{ $t('login.button') }}
        </button>
      </form>

      <p class="text-xs text-center text-gray-400">Responsive & modern — متجاوب وعصري</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  emits: ['login-success'],
  data() {
    return { username: '', password: '' }
  },
  methods: {
    login() {
      console.log('login', this.username, this.password)
      this.$emit('login-success')
    },
    switchLang(lang) {
      this.$i18n.locale = lang
    },
    btnClass(lang) {
      return this.$i18n.locale === lang ? 'ring-2 ring-teal-400' : ''
    }
  }
}
</script>

<style scoped>
/* small local tweaks */
</style>

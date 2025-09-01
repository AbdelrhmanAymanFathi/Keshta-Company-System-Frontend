<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">{{ $t('login.title') }}</h2>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label class="block mb-1 font-medium text-gray-700">{{ $t('login.username') }}</label>
          <input v-model="username" type="text" placeholder="Enter username"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        </div>
        <div class="mb-6">
          <label class="block mb-1 font-medium text-gray-700">{{ $t('login.password') }}</label>
          <input v-model="password" type="password" placeholder="Enter password"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        </div>
        <button type="submit"
                class="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition">
          {{ $t('login.button') }}
        </button>
      </form>

      <!-- زر تغيير اللغة -->
      <div class="mt-4 text-center">
        <button @click="switchLang('en')" class="mx-2 px-3 py-1 border rounded">English</button>
        <button @click="switchLang('ar')" class="mx-2 px-3 py-1 border rounded">عربي</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: ""
    }
  },
  methods: {
    login() {
      alert(`Logged in as: ${this.username}`)
    },
    switchLang(lang) {
      this.$i18n.locale = lang
    }
  }
}
</script>

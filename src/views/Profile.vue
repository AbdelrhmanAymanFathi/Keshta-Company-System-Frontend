<template>
  <div class="p-4">
    <h2 class="text-2xl font-semibold mb-4">{{ $t('profile.title') || 'Profile' }}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-medium mb-2">{{ $t('profile.account') || 'Account' }}</h3>
        <div class="space-y-2">
          <div><strong>{{ $t('profile.email') || 'Email' }}:</strong> {{ user?.email }}</div>
          <div><strong>{{ $t('profile.name') || 'Name' }}:</strong> {{ user?.name || user?.fullName || '-' }}</div>
        </div>
      </div>

      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-medium mb-2">{{ $t('profile.security') || 'Security' }}</h3>
        <div class="space-y-3">
          <div class="flex flex-col gap-3 max-w-sm">
            <button @click="showChangeModal = true" class="px-3 py-2 bg-indigo-600 text-white rounded-md">{{ $t('profile.changePassword') }}</button>
            <button @click="showTotpModal = true" class="px-3 py-2 border rounded-md">{{ $t('profile.totpTitle') }}</button>
          </div>
          <p class="text-sm text-gray-500">{{ $t('profile.totpIntro') }}</p>
        </div>

        <!-- Change Password Modal -->
        <div v-if="showChangeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6" :class="isRTL ? 'text-right' : 'text-left'">
            <h3 class="text-lg font-semibold mb-4">{{ $t('profile.changePassword') }}</h3>
            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('profile.currentPassword') }}</label>
                <input v-model="currentPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('profile.newPassword') }}</label>
                <input v-model="newPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('profile.confirmPassword') }}</label>
                <input v-model="confirmPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div class="flex gap-3 pt-4" :class="isRTL ? 'flex-row-reverse' : ''">
                <button type="button" @click="closeChangeModal" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{{ $t('labels.cancel') }}</button>
                <button type="submit" :disabled="changing" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{ changing ? $t('labels.saving') : $t('profile.changePassword') }}</button>
              </div>
            </form>
          </div>
        </div>

        <!-- TOTP Modal -->
        <div v-if="showTotpModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" :class="isRTL ? 'text-right' : 'text-left'">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">{{ $t('profile.totpTitle') }}</h3>
              <button @click="showTotpModal = false" class="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <TotpManager />
            <div class="mt-4 text-right">
              <button @click="showTotpModal = false" class="px-3 py-2 border rounded-md">{{ $t('labels.close') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TotpManager from '@/components/auth/TotpManager.vue'
import { useAuth } from '@/composables/useAuth'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { changePassword } from '@/api'

export default {
  name: 'ProfileView',
  components: { TotpManager },
  setup() {
    const auth = useAuth()
    const { t } = useI18n()
    const user = auth.user
    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const changing = ref(false)
    const showChangeModal = ref(false)
    const showTotpModal = ref(false)
    const { locale } = useI18n()
    const isRTL = computed(() => locale.value === 'ar')

    function clearPasswordForm() {
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    }

    function closeChangeModal() {
      showChangeModal.value = false
      clearPasswordForm()
    }

    async function handleChangePassword() {
      const min = 8
      if (!newPassword.value || newPassword.value.length < min) {
        if (window.$toast) window.$toast(t('profile.passwordTooShort', { min }) || `Password must be at least ${min} characters`, 'error')
        return
      }
      if (newPassword.value !== confirmPassword.value) {
        if (window.$toast) window.$toast(t('profile.passwordMismatch') || 'Passwords do not match', 'error')
        return
      }
      changing.value = true
      try {
        await changePassword({ currentPassword: currentPassword.value, newPassword: newPassword.value })
        if (window.$toast) window.$toast(t('profile.changeSuccess') || 'Password changed', 'success')
        closeChangeModal()
      } catch (err) {
        console.error('Change password error', err)
        if (window.$toast) window.$toast(t('profile.changeError') || 'Failed to change password', 'error')
      } finally {
        changing.value = false
      }
    }
    return { user, currentPassword, newPassword, confirmPassword, changing, handleChangePassword, clearPasswordForm, showChangeModal, showTotpModal, closeChangeModal, isRTL }
  }
}
</script>

<style scoped>
</style>

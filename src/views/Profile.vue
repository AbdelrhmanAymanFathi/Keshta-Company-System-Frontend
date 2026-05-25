<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0">
    <div class="max-w-5xl mx-auto">
      <!-- Header Section -->
      <div class="app-page-header theme-header theme-animated-surface theme-glow mb-6 rounded-2xl border border-gray-100 p-5 shadow-lg shadow-slate-200/50">
        <div>
          <h1 class="text-2xl font-semibold theme-text-primary mb-2">{{ $t('profile.title') || 'Profile' }}</h1>
          <p class="text-sm theme-text-secondary">{{ $t('profile.account') || 'Account' }} & {{ $t('profile.security') || 'Security' }}</p>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Account Card -->
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          <!-- Card Header -->
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <InformationCircleIcon class="w-6 h-6 theme-text-light" />
              </div>
              <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.account') || 'Account' }}</h2>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-6 sm:p-8 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-4 border-b border-gray-200">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-12 w-12 rounded-lg theme-icon-bg">
                  <EnvelopeIcon class="h-6 w-6 theme-text" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm theme-text-secondary font-medium">{{ $t('profile.email') || 'Email' }}</p>
                <p class="text-sm sm:text-base theme-text-primary font-semibold truncate">{{ user?.email || '-' }}</p>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-12 w-12 rounded-lg theme-icon-bg">
                  <UserIcon class="h-6 w-6 theme-text" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm theme-text-secondary font-medium">{{ $t('profile.name') || 'Name' }}</p>
                <p class="text-sm sm:text-base theme-text-primary font-semibold truncate">{{ user?.name || user?.fullName || '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style="margin-top: 0 !important;">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 sm:p-8 max-h-[90vh] overflow-y-auto" :class="isRTL ? 'text-right' : 'text-left'">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold theme-text-primary">{{ $t('profile.changePassword') }}</h3>
          <button @click="closeChangeModal" class="theme-caption hover:theme-text-secondary transition">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold theme-text-secondary mb-2">{{ $t('profile.currentPassword') }}</label>
            <input 
              v-model="currentPassword" 
              type="password" 
              :placeholder="$t('profile.currentPassword')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg theme-input-focus transition" 
            />
          </div>
          <div>
            <label class="block text-sm font-semibold theme-text-secondary mb-2">{{ $t('profile.newPassword') }}</label>
            <input 
              v-model="newPassword" 
              type="password" 
              :placeholder="$t('profile.newPassword')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg theme-input-focus transition" 
            />
          </div>
          <div>
            <label class="block text-sm font-semibold theme-text-secondary mb-2">{{ $t('profile.confirmPassword') }}</label>
            <input 
              v-model="confirmPassword" 
              type="password" 
              :placeholder="$t('profile.confirmPassword')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg theme-input-focus transition" 
            />
          </div>
          <div class="pt-4 flex gap-3" :class="isRTL ? 'flex-row-reverse' : ''">
            <button 
              type="button" 
              @click="closeChangeModal" 
              class="flex-1 px-4 py-2 border border-gray-300 theme-text-secondary font-medium rounded-lg hover:bg-gray-50 transition"
            >
              {{ $t('labels.cancel') }}
            </button>
            <button 
              type="submit" 
              :disabled="changing" 
              class="flex-1 px-4 py-2 theme-button font-medium rounded-lg disabled:opacity-50 transition whitespace-nowrap"
            >
              {{ changing ? $t('labels.saving') : $t('profile.changePassword') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- TOTP Modal -->
    <div v-if="showTotpModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style="margin-top: 0 !important;">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto" :class="isRTL ? 'text-right' : 'text-left'">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold theme-text-primary">{{ $t('profile.totpTitle') }}</h3>
          <button @click="showTotpModal = false" class="theme-caption hover:theme-text-secondary transition">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <TotpManager />
        <div class="mt-6 flex justify-end">
          <button 
            @click="showTotpModal = false" 
            class="px-6 py-2 bg-gray-200 theme-text-primary font-medium rounded-lg hover:bg-gray-300 transition"
          >
            {{ $t('labels.close') }}
          </button>
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
import { InformationCircleIcon, EnvelopeIcon, UserIcon, XMarkIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'ProfileView',
  components: { 
    TotpManager,
    InformationCircleIcon,
    EnvelopeIcon,
    UserIcon,
    XMarkIcon
  },
  setup() {
    const auth = useAuth()
    const { t, locale } = useI18n()
    const user = auth.user
    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const changing = ref(false)
    const showChangeModal = ref(false)
    const showTotpModal = ref(false)
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

    /* theme moved to Settings view */

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
    return {
      user,
      currentPassword,
      newPassword,
      confirmPassword,
      changing,
      handleChangePassword,
      clearPasswordForm,
      showChangeModal,
      showTotpModal,
      closeChangeModal,
      isRTL,
      t
    }
  }
}
</script>

<style scoped>
</style>

<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-0 sm:p-0.5 md:p-1 lg:p-0">
    <div class="max-w-5xl mx-auto">
      <!-- Header Section -->
      <div class="app-page-header theme-header theme-animated-surface theme-glow mb-6 rounded-2xl border border-gray-100 p-5 shadow-lg shadow-slate-200/50">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 mb-2">{{ $t('profile.title') || 'Profile' }}</h1>
          <p class="text-sm text-gray-600">{{ $t('profile.account') || 'Account' }} & {{ $t('profile.security') || 'Security' }}</p>
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
                <InformationCircleIcon class="w-6 h-6 text-white" />
              </div>
              <h2 class="text-lg sm:text-xl font-bold text-white">{{ $t('profile.account') || 'Account' }}</h2>
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
                <p class="text-sm text-gray-600 font-medium">{{ $t('profile.email') || 'Email' }}</p>
                <p class="text-sm sm:text-base text-gray-900 font-semibold truncate">{{ user?.email || '-' }}</p>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-12 w-12 rounded-lg theme-icon-bg">
                  <UserIcon class="h-6 w-6 theme-text" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-600 font-medium">{{ $t('profile.name') || 'Name' }}</p>
                <p class="text-sm sm:text-base text-gray-900 font-semibold truncate">{{ user?.name || user?.fullName || '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Card -->
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          <!-- Card Header -->
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <ShieldCheckIcon class="w-6 h-6 text-white" />
              </div>
              <h2 class="text-lg sm:text-xl font-bold text-white">{{ $t('profile.security') || 'Security' }}</h2>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-6 sm:p-8 space-y-4">
            <p class="text-sm text-gray-600">{{ $t('profile.totpIntro') }}</p>
            <div class="flex flex-col gap-3">
              <button 
                @click="showChangeModal = true" 
                class="w-full px-4 py-3 theme-button font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <span class="flex items-center justify-center gap-2">
                  <KeyIcon class="w-5 h-5" />
                  {{ $t('profile.changePassword') }}
                </span>
              </button>
              <button 
                @click="showTotpModal = true" 
                class="w-full px-4 py-3 theme-button font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <span class="flex items-center justify-center gap-2">
                  <DevicePhoneMobileIcon class="w-5 h-5" />
                  {{ $t('profile.totpTitle') }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <div class="w-6 h-6 rounded-full bg-white bg-opacity-30"></div>
              </div>
              <h2 class="text-lg sm:text-xl font-bold text-white">{{ $t('profile.themeTitle') || 'Theme Accent' }}</h2>
            </div>
          </div>
          <div class="p-6 sm:p-8 space-y-4">
            <p class="text-sm text-gray-600">{{ $t('profile.themeDescription') || 'Pick a primary accent color and animation style. Buttons, headers, and motion update instantly across the app.' }}</p>
            <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">{{ $t('profile.accentColor') || 'Accent Color' }}</label>
                <input
                  type="color"
                  v-model="themeColor"
                  class="w-full h-14 p-0 border border-gray-300 rounded-lg theme-input-focus cursor-pointer"
                />
              </div>
              <div class="flex items-center gap-3">
                <div class="h-14 w-14 rounded-lg shadow-sm theme-glow" :style="{ backgroundColor: themeColor }"></div>
                <div>
                  <p class="text-sm text-gray-500">{{ themeColor }}</p>
                  <p class="text-xs text-gray-400">{{ $t('profile.themePreview') || 'Live preview' }}</p>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">{{ $t('profile.animationPreset') || 'Animation Style' }}</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <button
                  v-for="preset in animationPresets"
                  :key="preset"
                  type="button"
                  @click="themeAnimation = preset"
                  :class="[
                    'rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition theme-motion-soft',
                    themeAnimation === preset
                      ? 'theme-selected border-transparent shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:theme-hover-soft'
                  ]"
                >
                  {{ animationLabel(preset) }}
                </button>
              </div>
              <p class="mt-2 text-xs text-gray-400">{{ $t('profile.animationHint') || 'Affects page headers and ambient UI motion.' }}</p>
            </div>
            <div class="rounded-xl border theme-border theme-dashboard-bg-soft p-4 overflow-hidden">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ $t('profile.headerPreview') || 'Header preview' }}</p>
              <div class="app-page-header theme-page-header-bar theme-animated-surface theme-glow rounded-xl p-4 min-h-[4.5rem] flex items-center">
                <span class="text-sm font-semibold theme-text-strong">{{ animationLabel(themeAnimation) }}</span>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                @click="resetThemeColor"
                class="theme-button w-full sm:w-auto px-4 py-3 font-medium rounded-lg transition shadow-sm hover:shadow-md"
              >
                {{ $t('profile.resetTheme') || 'Reset Theme' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style="margin-top: 0 !important;">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 sm:p-8 max-h-[90vh] overflow-y-auto" :class="isRTL ? 'text-right' : 'text-left'">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">{{ $t('profile.changePassword') }}</h3>
          <button @click="closeChangeModal" class="text-gray-400 hover:text-gray-600 transition">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">{{ $t('profile.currentPassword') }}</label>
            <input 
              v-model="currentPassword" 
              type="password" 
              :placeholder="$t('profile.currentPassword')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg theme-input-focus transition" 
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">{{ $t('profile.newPassword') }}</label>
            <input 
              v-model="newPassword" 
              type="password" 
              :placeholder="$t('profile.newPassword')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg theme-input-focus transition" 
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">{{ $t('profile.confirmPassword') }}</label>
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
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
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
          <h3 class="text-xl font-bold text-gray-900">{{ $t('profile.totpTitle') }}</h3>
          <button @click="showTotpModal = false" class="text-gray-400 hover:text-gray-600 transition">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <TotpManager />
        <div class="mt-6 flex justify-end">
          <button 
            @click="showTotpModal = false" 
            class="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
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
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ANIMATION_PRESETS,
  applyTheme,
  loadTheme,
  resetTheme,
  saveTheme,
  DEFAULT_THEME
} from '@/theme'
import { changePassword } from '@/api'
import { InformationCircleIcon, EnvelopeIcon, UserIcon, ShieldCheckIcon, KeyIcon, DevicePhoneMobileIcon, XMarkIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'ProfileView',
  components: { 
    TotpManager,
    InformationCircleIcon,
    EnvelopeIcon,
    UserIcon,
    ShieldCheckIcon,
    KeyIcon,
    DevicePhoneMobileIcon,
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
    const savedTheme = loadTheme()
    const themeColor = ref(savedTheme.primary || DEFAULT_THEME.primary)
    const themeAnimation = ref(savedTheme.animation || DEFAULT_THEME.animation)
    const animationPresets = ANIMATION_PRESETS
    const isRTL = computed(() => locale.value === 'ar')

    function animationLabel(preset) {
      const labels = {
        bubbles: t('profile.animBubbles') || 'Bubbles',
        aurora: t('profile.animAurora') || 'Aurora',
        grid: t('profile.animGrid') || 'Grid',
        liquid: t('profile.animLiquid') || 'Liquid',
        minimal: t('profile.animMinimal') || 'Minimal',
        particles: t('profile.animParticles') || 'Particles',
        truck: t('profile.animTruck') || 'City Truck',
        'smart-city': t('profile.animSmartCity') || 'Smart City',
        construction: t('profile.animConstruction') || 'Construction',
        blueprint: t('profile.animBlueprint') || 'Blueprint'
      }
      return labels[preset] || preset
    }

    function persistTheme() {
      const nextTheme = {
        primary: themeColor.value || DEFAULT_THEME.primary,
        animation: themeAnimation.value || DEFAULT_THEME.animation
      }
      applyTheme(nextTheme)
      saveTheme(nextTheme)
    }

    watch([themeColor, themeAnimation], persistTheme, { immediate: true })

    function clearPasswordForm() {
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    }

    function closeChangeModal() {
      showChangeModal.value = false
      clearPasswordForm()
    }

    function resetThemeColor() {
      const reset = resetTheme()
      themeColor.value = reset.primary
      themeAnimation.value = reset.animation
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
      themeColor,
      themeAnimation,
      animationPresets,
      animationLabel,
      resetThemeColor,
      t
    }
  }
}
</script>

<style scoped>
</style>

<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-0 sm:p-0.5 md:p-1 lg:p-0">
    <div class="max-w-5xl mx-auto">
      <div class="app-page-header theme-header theme-animated-surface theme-glow mb-6 rounded-2xl border border-gray-100 p-5 shadow-lg shadow-slate-200/50">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 mb-2">{{ $t('profile.settings') || 'Settings' }}</h1>
          <p class="text-sm text-gray-600">{{ $t('profile.settingsDescription') || 'Application settings and preferences' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
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
  </div>
</template>

<script>
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

export default {
  name: 'ProfileSettingsView',
  setup() {
    const { t, locale } = useI18n()
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

    function resetThemeColor() {
      const reset = resetTheme()
      themeColor.value = reset.primary
      themeAnimation.value = reset.animation
    }

    return {
      themeColor,
      themeAnimation,
      animationPresets,
      animationLabel,
      resetThemeColor,
      isRTL,
      t
    }
  }
}
</script>

<style scoped>
</style>

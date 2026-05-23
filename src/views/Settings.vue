<template>

  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 theme-typography-transition">

    <div class="max-w-5xl mx-auto">

      <div class="app-page-header theme-header theme-animated-surface theme-glow mb-6 rounded-2xl border border-gray-100 p-5 shadow-lg shadow-slate-200/50">

        <div>

          <h1 class="text-2xl font-semibold theme-heading mb-2">{{ $t('profile.settings') || 'Settings' }}</h1>

          <p class="text-sm theme-text-secondary">{{ $t('profile.settingsDescription') || 'Application settings and preferences' }}</p>

        </div>

      </div>



      <div class="grid grid-cols-1 gap-6">

        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">

          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">

            <div class="flex items-center gap-3">

              <div class="bg-white bg-opacity-20 rounded-lg p-2">

                <div class="w-6 h-6 rounded-full bg-white bg-opacity-30"></div>

              </div>

              <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.themeTitle') || 'Theme Accent' }}</h2>

            </div>

          </div>



          <div class="p-6 sm:p-8 space-y-4">

            <p class="text-sm theme-text-secondary">{{ $t('profile.themeDescription') || 'Pick a primary accent color and animation style. Buttons, headers, and motion update instantly across the app.' }}</p>

            <div class="rounded-2xl border border-gray-200 bg-slate-50 p-4">
              <label class="block text-sm font-semibold mb-3 theme-label">{{ $t('profile.accentColor') || 'Accent Color' }}</label>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  v-model="themeColor"
                  class="theme-color-input"
                  :style="colorPickerStyle(themeColor)"
                />
                <div>
                  <p class="text-sm font-mono theme-text-muted">{{ themeColor }}</p>
                  <p class="text-xs theme-caption">{{ $t('profile.themePreview') || 'Live preview' }}</p>
                </div>
              </div>
            </div>

            <div>

              <label class="block text-sm font-semibold theme-label mb-2">{{ $t('profile.animationPreset') || 'Animation Style' }}</label>

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

                      : 'border-gray-200 bg-white theme-text-secondary hover:theme-hover-soft'

                  ]"

                >

                  {{ animationLabel(preset) }}

                </button>

              </div>

              <p class="mt-2 text-xs theme-caption">{{ $t('profile.animationHint') || 'Affects page headers and ambient UI motion.' }}</p>

            </div>

            <div class="rounded-3xl border theme-border theme-dashboard-bg-soft p-4 overflow-hidden">

              <p class="text-xs font-semibold theme-text-muted uppercase tracking-wide mb-2">{{ $t('profile.headerPreview') || 'Header preview' }}</p>

              <div class="app-page-header theme-page-header-bar theme-animated-surface theme-glow rounded-2xl p-4 h-20 flex items-center">

                <span class="text-sm font-semibold theme-accent-strong">{{ animationLabel(themeAnimation) }}</span>

              </div>

            </div>

          </div>

        </div>



        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">

          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">

            <div class="flex items-center gap-3">

              <div class="bg-white bg-opacity-20 rounded-lg p-2">

                <div class="w-6 h-6 rounded-full bg-white bg-opacity-30"></div>

              </div>

              <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.typographyTitle') || 'Typography' }}</h2>

            </div>

          </div>



          <div class="p-6 sm:p-8 space-y-6">

            <p class="text-sm theme-text-secondary">{{ $t('profile.typographyDescription') || 'Customize fonts and text colors across the entire application. Changes apply instantly.' }}</p>



            <div>

              <label class="block text-sm font-semibold theme-label mb-2">{{ $t('profile.fontFamily') || 'Font Family' }}</label>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">

                <button

                  v-for="font in fontPresets"

                  :key="font.id"

                  type="button"

                  @click="selectFont(font.id)"

                  :class="[

                    'rounded-xl border px-3 py-2.5 text-sm font-medium transition theme-motion-soft text-start',

                    themeFontPreset === font.id

                      ? 'theme-selected border-transparent shadow-sm'

                      : 'border-gray-200 bg-white theme-text-secondary hover:theme-hover-soft'

                  ]"

                  :style="{ fontFamily: font.family }"

                >

                  {{ font.label }}

                  <span v-if="font.rtl" class="ms-1 text-xs theme-caption">RTL</span>

                </button>

              </div>

            </div>



            <div class="rounded-3xl border theme-border theme-dashboard-bg-soft p-5 space-y-3">

              <p class="text-xs font-semibold theme-text-muted uppercase tracking-wide">{{ $t('profile.typographyPreview') || 'Typography preview' }}</p>

              <h3 class="text-xl font-bold theme-heading" :style="previewFontStyle">{{ $t('profile.previewHeading') || 'Dashboard heading' }}</h3>

              <p class="theme-text-primary" :style="previewFontStyle">{{ $t('profile.previewBody') || 'Primary body text for lists, forms, and tables.' }}</p>

              <p class="theme-text-secondary" :style="previewFontStyle">{{ $t('profile.previewSecondary') || 'Secondary text for descriptions and metadata.' }}</p>

              <p class="theme-text-muted" :style="previewFontStyle">{{ $t('profile.previewMuted') || 'Muted text for hints and captions.' }}</p>

              <a href="#" class="theme-link text-sm font-medium" :style="previewFontStyle" @click.prevent>{{ $t('profile.previewLink') || 'Themed link' }}</a>

              <div class="rounded-xl theme-button px-4 py-2 text-sm font-medium inline-block mt-1">

                {{ $t('profile.previewButton') || 'Accent button' }}

              </div>

            </div>



            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div v-for="field in typographyColorFields" :key="field.key">

                <label class="block text-sm font-semibold theme-label mb-2">{{ field.label }}</label>

                <div class="flex items-center gap-3">
                  <input
                    type="color"
                    v-model="typographyColors[field.key]"
                    class="theme-color-input"
                    :style="colorPickerStyle(typographyColors[field.key])"
                  />
                  <span class="text-xs font-mono theme-text-muted">{{ typographyColors[field.key] }}</span>
                </div>

              </div>

            </div>

          </div>

        </div>



        <div class="flex flex-col sm:flex-row gap-3 px-1 pb-2">

          <button type="button" @click="resetThemeColor" class="theme-button w-full sm:w-auto px-4 py-3 font-medium rounded-lg transition shadow-sm hover:shadow-md">

            {{ $t('profile.resetTheme') || 'Reset Theme' }}

          </button>

        </div>

      </div>

    </div>

  </div>

</template>



<script>

import { ref, computed, watch, reactive } from 'vue'

import { useI18n } from 'vue-i18n'

import {

  ANIMATION_PRESETS,

  applyTheme,

  loadTheme,

  resetTheme,

  saveTheme,

  DEFAULT_THEME,

  FONT_PRESETS,

  getFontPresets,

  colorPickerStyle

} from '@/theme'



export default {

  name: 'ProfileSettingsView',

  setup() {

    const { t, locale } = useI18n()

    const savedTheme = loadTheme()

    const themeColor = ref(savedTheme.primary || DEFAULT_THEME.primary)

    const themeAnimation = ref(savedTheme.animation || DEFAULT_THEME.animation)

    const themeFontPreset = ref(savedTheme.fontPreset || DEFAULT_THEME.fontPreset)

    const animationPresets = ANIMATION_PRESETS

    const fontPresets = getFontPresets()

    const isRTL = computed(() => locale.value === 'ar')



    const typographyColors = reactive({

      textPrimary: savedTheme.textPrimary || DEFAULT_THEME.textPrimary,

      textSecondary: savedTheme.textSecondary || DEFAULT_THEME.textSecondary,

      textMuted: savedTheme.textMuted || DEFAULT_THEME.textMuted,

      headingColor: savedTheme.headingColor || DEFAULT_THEME.headingColor,

      textLight: savedTheme.textLight || DEFAULT_THEME.textLight,

      sidebarText: savedTheme.sidebarText || DEFAULT_THEME.sidebarText,

      cardText: savedTheme.cardText || DEFAULT_THEME.cardText

    })



    const typographyColorFields = computed(() => [

      { key: 'headingColor', label: t('profile.headingColor') || 'Heading color' },

      { key: 'textPrimary', label: t('profile.textPrimary') || 'Primary text' },

      { key: 'textSecondary', label: t('profile.textSecondary') || 'Secondary text' },

      { key: 'textMuted', label: t('profile.textMuted') || 'Muted text' },

      { key: 'textLight', label: t('profile.textLight') || 'Light text' },

      { key: 'sidebarText', label: t('profile.sidebarText') || 'Sidebar text' },

      { key: 'cardText', label: t('profile.cardText') || 'Card text' }

    ])



    const previewFontStyle = computed(() => ({

      fontFamily: FONT_PRESETS[themeFontPreset.value]?.family || DEFAULT_THEME.fontFamily

    }))



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



    function selectFont(presetId) {

      themeFontPreset.value = presetId

    }



    function buildThemePayload() {

      return {

        primary: themeColor.value || DEFAULT_THEME.primary,

        animation: themeAnimation.value || DEFAULT_THEME.animation,

        fontPreset: themeFontPreset.value,

        fontFamily: FONT_PRESETS[themeFontPreset.value]?.family || DEFAULT_THEME.fontFamily,

        textPrimary: typographyColors.textPrimary,

        textSecondary: typographyColors.textSecondary,

        textMuted: typographyColors.textMuted,

        headingColor: typographyColors.headingColor,

        textLight: typographyColors.textLight,

        textLightSecondary: savedTheme.textLightSecondary || DEFAULT_THEME.textLightSecondary,

        textLightMuted: savedTheme.textLightMuted || DEFAULT_THEME.textLightMuted,

        sidebarText: typographyColors.sidebarText,

        cardText: typographyColors.cardText

      }

    }



    function persistTheme() {

      const nextTheme = buildThemePayload()

      applyTheme(nextTheme)

      saveTheme(nextTheme)

    }



    watch([themeColor, themeAnimation, themeFontPreset], persistTheme, { immediate: true })

    watch(typographyColors, persistTheme, { deep: true })



    function resetThemeColor() {

      const reset = resetTheme()

      themeColor.value = reset.primary

      themeAnimation.value = reset.animation

      themeFontPreset.value = reset.fontPreset

      typographyColors.textPrimary = reset.textPrimary

      typographyColors.textSecondary = reset.textSecondary

      typographyColors.textMuted = reset.textMuted

      typographyColors.headingColor = reset.headingColor

      typographyColors.textLight = reset.textLight

      typographyColors.sidebarText = reset.sidebarText

      typographyColors.cardText = reset.cardText

    }



    return {

      themeColor,

      themeAnimation,

      themeFontPreset,

      typographyColors,

      typographyColorFields,

      animationPresets,

      fontPresets,

      previewFontStyle,

      animationLabel,

      selectFont,

      resetThemeColor,

      colorPickerStyle,

      isRTL,

      t

    }

  }

}

</script>

<template>

  <div :dir="isRTL ? 'rtl' : 'ltr'" class="settings-shell theme-typography-transition">

    <div class="settings-panel responsive-stack">

      <div class="app-page-header theme-header theme-animated-surface theme-glow rounded-2xl border border-gray-100 p-5 shadow-lg shadow-slate-200/50">

        <div>

          <h1 class="text-2xl font-semibold theme-heading mb-2">{{ $t('profile.settings') || 'Settings' }}</h1>

          <p class="text-sm theme-text-secondary">{{ $t('profile.settingsDescription') || 'Application settings and preferences' }}</p>

        </div>

      </div>



      <div class="responsive-stack">

        <div class="settings-card">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-white bg-opacity-20 p-2">
                <svg class="h-5 w-5 theme-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.5 15.2A8.5 8.5 0 018.8 3.5 8.5 8.5 0 1020.5 15.2Z" />
                </svg>
              </div>
              <h2 class="text-lg font-bold theme-text-light">{{ $t('profile.appearanceTitle') }}</h2>
            </div>
          </div>
          <div class="settings-card__body space-y-4">
            <p class="text-sm theme-text-secondary">{{ $t('profile.appearanceDescription') }}</p>
            <div class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold theme-text-primary">{{ $t('profile.darkModeLabel') }}</p>
                <p class="text-xs theme-caption">
                  {{ colorMode === 'dark' ? $t('profile.darkModeOn') : $t('profile.darkModeOff') }}
                </p>
              </div>
              <Switch
                :checked="colorMode === 'dark'"
                :aria-label="$t('profile.darkModeLabel')"
                class="shrink-0"
                @update:checked="setColorMode($event ? 'dark' : 'light')"
              />
            </div>
          </div>
        </div>

        <div class="settings-card">

          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">

            <div class="flex items-center gap-3">

              <div class="bg-white bg-opacity-20 rounded-lg p-2">

                <div class="w-6 h-6 rounded-full bg-white bg-opacity-30"></div>

              </div>

              <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.themeTitle') || 'Theme Accent' }}</h2>

            </div>

          </div>



          <div class="settings-card__body space-y-4">

            <p class="text-sm theme-text-secondary">{{ $t('profile.themeDescription') || 'Pick a primary accent color and animation style. Buttons, headers, and motion update instantly across the app.' }}</p>

            <div class="theme-surface">
              <label class="block text-sm font-semibold mb-3 theme-label">{{ $t('profile.accentColor') || 'Accent Color' }}</label>
              <div class="settings-control-row">
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

              <div class="settings-option-grid settings-option-grid--compact">

                <ShadcnButton variant="outline" size="native"

                  v-for="preset in animationPresets"

                  :key="preset"

                  type="button"

                  :aria-pressed="themeAnimation === preset"

                  @click="themeAnimation = preset"

                  :class="[

                    'rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition theme-motion-soft',

                    themeAnimation === preset

                      ? 'theme-selected !text-white border-transparent shadow-sm'

                      : 'border-gray-200 bg-white theme-text-secondary hover:theme-hover-soft'

                  ]"

                >

                  {{ animationLabel(preset) }}

                </ShadcnButton>

              </div>

              <p class="mt-2 text-xs theme-caption">{{ $t('profile.animationHint') || 'Affects page headers and ambient UI motion.' }}</p>

            </div>

            <div class="theme-surface overflow-hidden">

              <p class="text-xs font-semibold theme-text-muted uppercase tracking-wide mb-2">{{ $t('profile.headerPreview') || 'Header preview' }}</p>

              <div class="app-page-header theme-page-header-bar theme-animated-surface theme-glow rounded-2xl p-4 h-20 flex items-center">

                <span class="text-sm font-semibold theme-accent-strong">{{ animationLabel(themeAnimation) }}</span>

              </div>

            </div>

          </div>

        </div>



        <div class="settings-card">

          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">

            <div class="flex items-center gap-3">

              <div class="bg-white bg-opacity-20 rounded-lg p-2">

                <div class="w-6 h-6 rounded-full bg-white bg-opacity-30"></div>

              </div>

              <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.typographyTitle') || 'Typography' }}</h2>

            </div>

          </div>



          <div class="settings-card__body space-y-6">

            <p class="text-sm theme-text-secondary">{{ $t('profile.typographyDescription') || 'Customize fonts and text colors across the entire application. Changes apply instantly.' }}</p>



            <div>

              <label class="block text-sm font-semibold theme-label mb-2">{{ $t('profile.fontFamily') || 'Font Family' }}</label>

              <div class="settings-option-grid">

                <ShadcnButton variant="outline" size="native"

                  v-for="font in fontPresets"

                  :key="font.id"

                  type="button"

                  :aria-pressed="themeFontPreset === font.id"

                  @click="selectFont(font.id)"

                  :class="[

                    'rounded-xl border px-3 py-2.5 text-sm font-medium transition theme-motion-soft text-start',

                    themeFontPreset === font.id

                      ? 'theme-selected !text-white border-transparent shadow-sm'

                      : 'border-gray-200 bg-white theme-text-secondary hover:theme-hover-soft'

                  ]"

                  :style="{ fontFamily: font.family }"

                >

                  {{ font.label }}

                  <span v-if="font.rtl" class="ms-1 text-xs theme-caption">RTL</span>

                </ShadcnButton>

              </div>

            </div>



            <div class="theme-surface space-y-3">

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



            <div class="settings-control-grid">

              <div v-for="field in typographyColorFields" :key="field.key">

                <label class="block text-sm font-semibold theme-label mb-2">{{ field.label }}</label>

                <div class="settings-control-row">
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

        <div class="settings-card">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.sidebarLayoutTitle') }}</h2>
          </div>
          <div class="settings-card__body space-y-4">
            <p class="text-sm theme-text-secondary">{{ $t('profile.sidebarLayoutDescription') }}</p>
            <div class="settings-option-grid settings-option-grid--compact">
              <ShadcnButton variant="outline" size="native"
                v-for="opt in sidebarOptions"
                :key="opt.id"
                type="button"
                :aria-pressed="themeSidebarType === opt.id"
                @click="themeSidebarType = opt.id"
                :class="[
                  'rounded-xl border px-3 py-2 text-sm font-medium transition theme-motion-soft text-start',
                  themeSidebarType === opt.id ? 'theme-selected !text-white border-transparent' : 'border-gray-200 bg-white theme-text-secondary hover:theme-hover-soft'
                ]"
              >
                {{ opt.label }}
              </ShadcnButton>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.surfaceTokensTitle') }}</h2>
          </div>
          <div class="settings-card__body settings-control-grid">
            <div>
              <label class="block text-sm font-semibold theme-label mb-2">{{ $t('profile.radius') }}</label>
              <select v-model="themeRadius" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus">
                <option v-for="r in radiusPresets" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold theme-label mb-2">{{ $t('profile.density') }}</label>
              <select v-model="themeDensity" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus">
                <option v-for="d in densityPresets" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold theme-label mb-2">{{ $t('profile.shadows') }}</label>
              <select v-model="themeShadows" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus">
                <option v-for="s in shadowPresets" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <svg class="w-5 h-5 theme-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
              </div>
              <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.presenceTitle') || 'Live Presence' }}</h2>
            </div>
          </div>
          <div class="settings-card__body space-y-4">
            <p class="text-sm theme-text-secondary">{{ $t('profile.presenceDescription') || 'Show your live cursor and avatar to other users on the same page — and see theirs — in real time (like Figma).' }}</p>
            <div class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold theme-text-primary">{{ $t('profile.presenceToggleLabel') || 'Enable live presence & cursor' }}</p>
                <p class="text-xs theme-caption">
                  {{ presenceEnabled
                    ? ($t('profile.presenceOn') || 'On — others can see your cursor and avatar')
                    : ($t('profile.presenceOff') || 'Off — you are hidden from other users') }}
                </p>
              </div>
              <Switch
                :checked="presenceEnabled"
                :aria-label="$t('profile.presenceToggleLabel') || 'Enable live presence'"
                class="shrink-0"
                @update:checked="togglePresence"
              />
            </div>
          </div>
        </div>

        <div class="settings-card">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <svg class="w-5 h-5 theme-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5 6 9H2v6h4l5 4V5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </div>
              <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.startupSoundTitle') || 'Startup Sound' }}</h2>
            </div>
          </div>
          <div class="settings-card__body space-y-4">
            <p class="text-sm theme-text-secondary">{{ $t('profile.startupSoundDescription') || 'Play a short cinematic intro with the company name the first time the app opens.' }}</p>

            <div class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold theme-text-primary">{{ $t('profile.startupSoundToggleLabel') || 'Enable startup intro sound' }}</p>
                <p class="text-xs theme-caption">
                  {{ introEnabled
                    ? ($t('profile.startupSoundOn') || 'On — plays once on your first visit')
                    : ($t('profile.startupSoundOff') || 'Off — the app opens silently') }}
                </p>
              </div>
              <Switch
                :checked="introEnabled"
                :aria-label="$t('profile.startupSoundToggleLabel') || 'Enable startup intro sound'"
                class="shrink-0"
                @update:checked="toggleStartupSound"
              />
            </div>

            <ShadcnButton variant="default" size="native"
              type="button"
              @click="previewStartupSound"
              class="rounded-xl"
            >
              {{ $t('profile.startupSoundPreview') || 'Preview intro sound' }}
            </ShadcnButton>
          </div>
        </div>

        <div class="settings-actions px-1 pb-2">

          <ShadcnButton variant="outline" size="native" type="button" @click="resetThemeColor" class="theme-button w-full sm:w-auto px-4 py-3 font-medium rounded-lg transition shadow-sm hover:shadow-md">

            {{ $t('profile.resetTheme') || 'Reset Theme' }}

          </ShadcnButton>

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

  colorPickerStyle,
  RADIUS_PRESETS,
  DENSITY_PRESETS,
  SHADOW_PRESETS
} from '@acme/platform'
import { getSidebarOptions } from '@acme/layout-engine'
import { Switch } from '@/components/ui/switch'
import { colorMode, setColorMode } from '@/utils/colorMode'
import { presenceEnabled, savePresenceSettings } from '@/composables/usePresenceSettings'
import { introEnabled, toggleStartupSound, previewStartupSound } from '@/composables/useStartupIntro'



export default {
  name: 'ProfileSettingsView',
  components: { Switch },
  setup() {

    const { t, locale } = useI18n()

    const savedTheme = loadTheme()

    const themeColor = ref(savedTheme.primary || DEFAULT_THEME.primary)

    const themeAnimation = ref(savedTheme.animation || DEFAULT_THEME.animation)

    const themeFontPreset = ref(savedTheme.fontPreset || DEFAULT_THEME.fontPreset)
    const themeSidebarType = ref(savedTheme.sidebarType || DEFAULT_THEME.sidebarType)
    const themeRadius = ref(savedTheme.radius || DEFAULT_THEME.radius)
    const themeDensity = ref(savedTheme.density || DEFAULT_THEME.density)
    const themeShadows = ref(savedTheme.shadows || DEFAULT_THEME.shadows)
    const animationPresets = ANIMATION_PRESETS
    const fontPresets = getFontPresets()
    const sidebarOptions = getSidebarOptions()
    const radiusPresets = RADIUS_PRESETS
    const densityPresets = DENSITY_PRESETS
    const shadowPresets = SHADOW_PRESETS

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

        iconPack: 'lucide',
        sidebarType: themeSidebarType.value || DEFAULT_THEME.sidebarType,
        radius: themeRadius.value || DEFAULT_THEME.radius,
        density: themeDensity.value || DEFAULT_THEME.density,
        shadows: themeShadows.value || DEFAULT_THEME.shadows,

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



    watch(
      [themeColor, themeAnimation, themeFontPreset, themeSidebarType, themeRadius, themeDensity, themeShadows],
      persistTheme,
      { immediate: true }
    )

    watch(typographyColors, persistTheme, { deep: true })



    function resetThemeColor() {

      const reset = resetTheme()

      themeColor.value = reset.primary

      themeAnimation.value = reset.animation

      themeFontPreset.value = reset.fontPreset

      themeSidebarType.value = reset.sidebarType
      themeRadius.value = reset.radius
      themeDensity.value = reset.density
      themeShadows.value = reset.shadows

      typographyColors.textPrimary = reset.textPrimary

      typographyColors.textSecondary = reset.textSecondary

      typographyColors.textMuted = reset.textMuted

      typographyColors.headingColor = reset.headingColor

      typographyColors.textLight = reset.textLight

      typographyColors.sidebarText = reset.sidebarText

      typographyColors.cardText = reset.cardText

    }

    function togglePresence(enabled) {
      savePresenceSettings(enabled)
    }

    return {

      themeColor,

      themeAnimation,

      themeFontPreset,

      themeSidebarType,
      themeRadius,
      themeDensity,
      themeShadows,

      sidebarOptions,
      radiusPresets,
      densityPresets,
      shadowPresets,


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

      t,

      presenceEnabled,

      togglePresence,

      colorMode,

      setColorMode,

      introEnabled,

      toggleStartupSound,

      previewStartupSound,

    }

  }

}

</script>

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

        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <ThemeIcon name="grid" class="w-5 h-5 theme-text-light" />
              </div>
              <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.iconPackTitle') || 'Icon Pack' }}</h2>
            </div>
          </div>
          <div class="p-6 sm:p-8 space-y-6">
            <p class="text-sm theme-text-secondary">{{ $t('profile.iconPackDescription') || 'Switch the entire app icon style instantly — sidebar, tables, and actions.' }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <button
                v-for="pack in iconPackOptions"
                :key="pack.id"
                type="button"
                @click="themeIconPack = pack.id"
                :class="[
                  'rounded-xl border px-3 py-3 text-start transition theme-motion-soft',
                  themeIconPack === pack.id
                    ? 'theme-selected border-transparent shadow-sm'
                    : 'border-gray-200 bg-white hover:theme-hover-soft'
                ]"
              >
                <span class="flex items-center gap-3">
                  <span class="theme-icon-container theme-dashboard-bg-soft h-10 w-10">
                    <ThemeIcon name="vehicle" class="h-5 w-5 theme-accent-strong" />
                  </span>
                  <span>
                    <span class="block text-sm font-semibold theme-text-primary">{{ getIconPackLabel(pack.id) }}</span>
                    <span class="block text-xs theme-caption">{{ getIconPackDescription(pack.id) }}</span>
                  </span>
                </span>
              </button>
            </div>
            <div>
              <label class="block text-sm font-semibold theme-label mb-2">{{ $t('profile.themePersonality') || 'UI personalities' }}</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  v-for="personality in themePersonalities"
                  :key="personality.id"
                  type="button"
                  @click="applyPersonality(personality.id)"
                  class="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium theme-text-secondary hover:theme-hover-soft transition theme-motion-soft text-start"
                >
                  <span class="block font-semibold theme-text-primary">{{ getPersonalityLabel(personality.id) }}</span>
                  <span class="block text-xs theme-caption">{{ personality.description }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.themeBotTitle') }}</h2>
          </div>
          <div class="p-6 sm:p-8 space-y-4">
            <p class="text-sm theme-text-secondary">{{ $t('profile.themeBotDescription') }}</p>
            <form class="flex flex-col sm:flex-row gap-2" @submit.prevent="runThemeBot">
              <input
                v-model="themeBotQuery"
                type="text"
                class="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus"
                :placeholder="$t('profile.themeBotPlaceholder')"
              />
              <button type="submit" class="theme-button rounded-xl px-4 py-2 text-sm font-medium">{{ $t('profile.themeBotApply') }}</button>
            </form>
            <div v-if="botSuggestions.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                v-for="s in botSuggestions"
                :key="s.presetId"
                type="button"
                @click="applyBotSuggestion(s)"
                class="rounded-xl border border-gray-200 px-3 py-2 text-start hover:theme-hover-soft transition text-sm"
              >
                <span class="font-semibold theme-text-primary">{{ s.name }}</span>
                <span class="block text-xs theme-caption">{{ Math.round(s.confidence * 100) }}% — {{ s.preview.iconPack }}</span>
              </button>
            </div>
            <router-link
              :to="{ name: 'theme-studio' }"
              class="inline-flex theme-link text-sm font-medium"
            >
              {{ $t('profile.openThemeStudio') }} →
            </router-link>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.sidebarLayoutTitle') }}</h2>
          </div>
          <div class="p-6 sm:p-8 space-y-4">
            <p class="text-sm theme-text-secondary">{{ $t('profile.sidebarLayoutDescription') }}</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <button
                v-for="opt in sidebarOptions"
                :key="opt.id"
                type="button"
                @click="themeSidebarType = opt.id"
                :class="[
                  'rounded-xl border px-3 py-2 text-sm font-medium transition theme-motion-soft text-start',
                  themeSidebarType === opt.id ? 'theme-selected border-transparent' : 'border-gray-200 bg-white theme-text-secondary hover:theme-hover-soft'
                ]"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          <div class="theme-card-header px-6 py-4 sm:px-8 sm:py-6">
            <h2 class="text-lg sm:text-xl font-bold theme-text-light">{{ $t('profile.surfaceTokensTitle') }}</h2>
          </div>
          <div class="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
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

  colorPickerStyle,
  applyThemePersonality,
  applyThemePreset,
  getThemePersonalities,
  recommendThemes,
  RADIUS_PRESETS,
  DENSITY_PRESETS,
  SHADOW_PRESETS
} from '@/theme'
import { getIconPackOptions } from '@/theme/icons'
import { getSidebarOptions } from '@/theme/sidebar/layouts'
import ThemeIcon from '@/components/shared/ThemeIcon.vue'



export default {
  name: 'ProfileSettingsView',
  components: { ThemeIcon },
  setup() {

    const { t, locale } = useI18n()

    const savedTheme = loadTheme()

    const themeColor = ref(savedTheme.primary || DEFAULT_THEME.primary)

    const themeAnimation = ref(savedTheme.animation || DEFAULT_THEME.animation)

    const themeFontPreset = ref(savedTheme.fontPreset || DEFAULT_THEME.fontPreset)
    const themeIconPack = ref(savedTheme.iconPack || DEFAULT_THEME.iconPack)
    const themeSidebarType = ref(savedTheme.sidebarType || DEFAULT_THEME.sidebarType)
    const themeRadius = ref(savedTheme.radius || DEFAULT_THEME.radius)
    const themeDensity = ref(savedTheme.density || DEFAULT_THEME.density)
    const themeShadows = ref(savedTheme.shadows || DEFAULT_THEME.shadows)
    const themeBotQuery = ref('')
    const botSuggestions = ref([])

    const animationPresets = ANIMATION_PRESETS
    const fontPresets = getFontPresets()
    const iconPackOptions = getIconPackOptions()
    const sidebarOptions = getSidebarOptions()
    const themePersonalities = getThemePersonalities()
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

        iconPack: themeIconPack.value || DEFAULT_THEME.iconPack,
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



    function syncFromTheme(next) {
      themeColor.value = next.primary
      themeAnimation.value = next.animation
      themeFontPreset.value = next.fontPreset
      themeIconPack.value = next.iconPack
      themeSidebarType.value = next.sidebarType
      themeRadius.value = next.radius
      themeDensity.value = next.density
      themeShadows.value = next.shadows
      typographyColors.textPrimary = next.textPrimary
      typographyColors.textSecondary = next.textSecondary
      typographyColors.textMuted = next.textMuted
      typographyColors.headingColor = next.headingColor
      typographyColors.textLight = next.textLight
      typographyColors.sidebarText = next.sidebarText
      typographyColors.cardText = next.cardText
    }

    function applyPersonality(personalityId) {
      const next = applyThemePreset(personalityId) || applyThemePersonality(personalityId)
      syncFromTheme(next)
    }

    function runThemeBot() {
      const q = themeBotQuery.value.trim()
      if (!q) return
      botSuggestions.value = recommendThemes(q)
    }

    function applyBotSuggestion(s) {
      if (s.presetId) applyThemePreset(s.presetId)
      syncFromTheme(loadTheme())
    }

    watch(
      [themeColor, themeAnimation, themeFontPreset, themeIconPack, themeSidebarType, themeRadius, themeDensity, themeShadows],
      persistTheme,
      { immediate: true }
    )

    watch(typographyColors, persistTheme, { deep: true })



    function resetThemeColor() {

      const reset = resetTheme()

      themeColor.value = reset.primary

      themeAnimation.value = reset.animation

      themeFontPreset.value = reset.fontPreset

      themeIconPack.value = reset.iconPack
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

    function getIconPackLabel(packId) {
      return t(`profile.iconPack_${packId}`) || packId
    }

    function getIconPackDescription(packId) {
      return t(`profile.iconPackDesc_${packId}`) || ''
    }

    function getPersonalityLabel(personalityId) {
      return t(`profile.preset_${personalityId}`) || t(`profile.personality_${personalityId}`) || personalityId
    }

    return {

      themeColor,

      themeAnimation,

      themeFontPreset,

      themeIconPack,
      themeSidebarType,
      themeRadius,
      themeDensity,
      themeShadows,
      themeBotQuery,
      botSuggestions,

      iconPackOptions,
      sidebarOptions,
      radiusPresets,
      densityPresets,
      shadowPresets,

      themePersonalities,

      applyPersonality,
      runThemeBot,
      applyBotSuggestion,

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

      getIconPackLabel,

      getIconPackDescription,

      getPersonalityLabel

    }

  }

}

</script>

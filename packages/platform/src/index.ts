import {
  themeEngine,
  applyTheme,
  loadTheme,
  saveTheme,
  resetTheme,
  applyThemePatch,
  exportThemePreset,
  importThemePreset,
  registerTheme,
  normalizeTheme,
  normalizeAnimation,
  getFontPresets,
  ensureReadableText,
  contrastRatio,
  colorPickerStyle,
  DEFAULT_THEME,
  DEFAULT_ANIMATION,
  DEFAULT_ICON_PACK,
  DEFAULT_FONT_PRESET,
  DEFAULT_SIDEBAR_TYPE,
  FONT_PRESETS,
  FONT_PRESET_IDS,
  TYPOGRAPHY_DEFAULTS,
  ANIMATION_PRESETS,
  RADIUS_PRESETS,
  DENSITY_PRESETS,
  SHADOW_PRESETS,
  themeRevision,
  currentTheme,
  THEME_REVISION_KEY
} from '@acme/theme-engine'
import { iconPlugin, getThemeIcon, getMenuIcon, getIconPackOptions, iconRevision, ICON_REVISION_KEY } from '@acme/icon-packs'
import { layoutPlugin, getSidebarOptions } from '@acme/layout-engine'
import { motionPlugin, getMotionPresets } from '@acme/motion-engine'
import { getPresetTheme, getPresetThemeList, PRESET_THEMES, PERSONALITY_TO_PRESET } from '@acme/ui-presets'
import { recommendThemes, recommendThemesWithAI } from '@acme/theme-ai'

let bootstrapped = false

export function bootstrapThemePlatform() {
  if (bootstrapped) return themeEngine
  themeEngine.use(iconPlugin).use(layoutPlugin).use(motionPlugin)
  bootstrapped = true
  return themeEngine
}

export function initThemePlatform() {
  const engine = bootstrapThemePlatform()
  if (typeof document !== 'undefined') {
    void engine.applyTheme(engine.loadTheme())
  }
  return engine
}

export function applyThemePreset(presetId: string) {
  bootstrapThemePlatform()
  const preset = getPresetTheme(presetId)
  if (!preset) return applyTheme(loadTheme())
  const next = normalizeTheme({ ...DEFAULT_THEME, ...preset })
  saveTheme(next)
  return applyTheme(next)
}

export function applyThemePersonality(personalityId: string) {
  return applyThemePreset(PERSONALITY_TO_PRESET[personalityId] || personalityId)
}

export function getThemePersonalities() {
  return getPresetThemeList()
}

/** @deprecated legacy alias */
export const THEME_PERSONALITIES = PRESET_THEMES

export {
  themeEngine,
  applyTheme,
  loadTheme,
  saveTheme,
  resetTheme,
  applyThemePatch,
  exportThemePreset,
  importThemePreset,
  registerTheme,
  normalizeTheme,
  normalizeAnimation,
  getFontPresets,
  ensureReadableText,
  contrastRatio,
  colorPickerStyle,
  DEFAULT_THEME,
  DEFAULT_ANIMATION,
  DEFAULT_ICON_PACK,
  DEFAULT_FONT_PRESET,
  DEFAULT_SIDEBAR_TYPE,
  FONT_PRESETS,
  FONT_PRESET_IDS,
  TYPOGRAPHY_DEFAULTS,
  ANIMATION_PRESETS,
  RADIUS_PRESETS,
  DENSITY_PRESETS,
  SHADOW_PRESETS,
  themeRevision,
  currentTheme,
  THEME_REVISION_KEY,
  getThemeIcon,
  getMenuIcon,
  getIconPackOptions,
  iconRevision,
  ICON_REVISION_KEY,
  getSidebarOptions,
  getMotionPresets,
  getPresetTheme,
  getPresetThemeList,
  PRESET_THEMES,
  recommendThemes,
  recommendThemesWithAI
}

if (typeof document !== 'undefined') {
  initThemePlatform()
}

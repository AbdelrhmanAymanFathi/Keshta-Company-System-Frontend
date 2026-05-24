export * from './types'
export * from './constants'
export * from './normalize'
export {
  THEME_REVISION_KEY,
  themeRevision,
  currentTheme,
  bumpThemeRevision,
  getRegisteredTheme,
  listRegisteredThemes,
  getDefaultThemeSnapshot
} from './store'
export * from './persistence'
export * from './engine'
export { useTheme } from './composables/useTheme'

import { FONT_PRESETS } from './constants'

export function getFontPresets() {
  return Object.keys(FONT_PRESETS).map((id) => ({
    id,
    label: FONT_PRESETS[id].label,
    family: FONT_PRESETS[id].family,
    rtl: Boolean(FONT_PRESETS[id].rtl)
  }))
}

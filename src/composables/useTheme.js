import { computed, inject } from 'vue'
import {
  applyTheme,
  applyThemePreset,
  loadTheme,
  saveTheme,
  getPresetThemeList,
  recommendThemes
} from '@/theme'
import { themeRevision, currentTheme, THEME_REVISION_KEY } from '@/theme/state'

export { THEME_REVISION_KEY }

export function useTheme() {
  const revision = inject(THEME_REVISION_KEY, themeRevision)

  const theme = computed(() => {
    void revision.value
    return currentTheme.value || loadTheme()
  })

  function setTheme(patch) {
    const next = applyTheme({ ...loadTheme(), ...patch })
    saveTheme(next)
    return next
  }

  function applyPreset(presetId) {
    return applyThemePreset(presetId)
  }

  function askThemeBot(query) {
    return recommendThemes(query)
  }

  return {
    theme,
    themeRevision: revision,
    setTheme,
    applyPreset,
    askThemeBot,
    presetThemes: getPresetThemeList
  }
}

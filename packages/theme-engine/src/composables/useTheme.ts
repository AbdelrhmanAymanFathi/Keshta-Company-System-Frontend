import { computed, inject } from 'vue'
import type { ThemeDefinition } from '../types'
import { themeEngine } from '../engine'
import { themeRevision, currentTheme, THEME_REVISION_KEY } from '../store'

export function useTheme() {
  const revision = inject(THEME_REVISION_KEY, themeRevision)

  const theme = computed(() => {
    void revision.value
    return currentTheme.value || themeEngine.loadTheme()
  })

  function setTheme(patch: ThemeDefinition) {
    return themeEngine.applyPatch(patch)
  }

  function applyPreset(preset: ThemeDefinition) {
    return themeEngine.applyTheme(preset)
  }

  return {
    theme,
    themeRevision: revision,
    setTheme,
    applyPreset,
    engine: themeEngine
  }
}

export { THEME_REVISION_KEY }

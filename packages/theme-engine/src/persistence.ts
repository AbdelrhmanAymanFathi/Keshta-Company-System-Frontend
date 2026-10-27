import type { NormalizedTheme, ThemeDefinition } from './types'
import { DEFAULT_THEME } from './constants'
import { normalizeTheme } from './normalize'

export function createPersistence(storageKey: string) {
  function loadTheme(): NormalizedTheme {
    if (typeof window === 'undefined') return normalizeTheme({ ...DEFAULT_THEME })
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return normalizeTheme({ ...DEFAULT_THEME })
      const savedTheme = JSON.parse(saved) as ThemeDefinition
      const previousDefaultColors = ['#7c5ce7', '#4f7dcc', '#0f766e', '#1e3a5f', '#18181b']
      if (savedTheme.primary && previousDefaultColors.includes(savedTheme.primary.toLowerCase())) {
        savedTheme.primary = DEFAULT_THEME.primary
      }
      if (savedTheme.linkColor && previousDefaultColors.includes(savedTheme.linkColor.toLowerCase())) {
        savedTheme.linkColor = DEFAULT_THEME.primary
      }
      if (savedTheme.colors?.primary && previousDefaultColors.includes(savedTheme.colors.primary.toLowerCase())) {
        savedTheme.colors.primary = DEFAULT_THEME.primary
      }
      return normalizeTheme({ ...DEFAULT_THEME, ...savedTheme })
    } catch {
      return normalizeTheme({ ...DEFAULT_THEME })
    }
  }

  function saveTheme(theme: NormalizedTheme | ThemeDefinition) {
    if (typeof window === 'undefined') return
    localStorage.setItem(storageKey, JSON.stringify(normalizeTheme(theme)))
  }

  function exportTheme(theme: NormalizedTheme | ThemeDefinition = loadTheme()) {
    return JSON.stringify(normalizeTheme(theme), null, 2)
  }

  function importTheme(json: string | ThemeDefinition) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json
    const next = normalizeTheme({ ...DEFAULT_THEME, ...parsed })
    saveTheme(next)
    return next
  }

  return { loadTheme, saveTheme, exportTheme, importTheme }
}

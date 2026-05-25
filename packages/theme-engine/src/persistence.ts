import type { NormalizedTheme, ThemeDefinition } from './types'
import { DEFAULT_THEME } from './constants'
import { normalizeTheme } from './normalize'

export function createPersistence(storageKey: string) {
  function loadTheme(): NormalizedTheme {
    if (typeof window === 'undefined') return normalizeTheme({ ...DEFAULT_THEME })
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return normalizeTheme({ ...DEFAULT_THEME })
      return normalizeTheme({ ...DEFAULT_THEME, ...JSON.parse(saved) })
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

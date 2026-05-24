import { ref, shallowRef } from 'vue'
import type { NormalizedTheme, ThemeDefinition } from './types'
import { DEFAULT_THEME } from './constants'
import { normalizeTheme } from './normalize'

export const THEME_REVISION_KEY = Symbol('themeRevision')

export const themeRevision = ref(0)
export const currentTheme = shallowRef<NormalizedTheme | null>(null)

const registeredThemes = new Map<string, ThemeDefinition>()

export function bumpThemeRevision(theme: NormalizedTheme) {
  currentTheme.value = theme
  themeRevision.value += 1
}

export function registerTheme(theme: ThemeDefinition) {
  const normalized = normalizeTheme(theme)
  registeredThemes.set(normalized.id, theme)
  return normalized
}

export function getRegisteredTheme(id: string) {
  return registeredThemes.get(id)
}

export function listRegisteredThemes() {
  return [...registeredThemes.entries()].map(([id, theme]) => ({
    id,
    name: theme.name || id
  }))
}

export function getDefaultThemeSnapshot(): NormalizedTheme {
  return normalizeTheme({ ...DEFAULT_THEME })
}

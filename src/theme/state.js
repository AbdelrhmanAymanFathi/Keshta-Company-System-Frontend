import { ref, shallowRef } from 'vue'

export const THEME_REVISION_KEY = Symbol('themeRevision')

/** Incremented on every applyTheme — drives reactive UI updates */
export const themeRevision = ref(0)

/** Latest normalized theme snapshot */
export const currentTheme = shallowRef(null)

export function bumpThemeRevision(theme) {
  currentTheme.value = theme
  themeRevision.value += 1
}

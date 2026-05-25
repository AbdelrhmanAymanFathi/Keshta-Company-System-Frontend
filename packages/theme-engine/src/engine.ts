import type { ApplyContext, NormalizedTheme, ThemeDefinition, ThemeEngineOptions, ThemePlugin } from './types'
import { DEFAULT_THEME } from './constants'
import {
  applyCoreColors,
  applySurfaceTokens,
  applyTypography,
  normalizeTheme
} from './normalize'
import { createPersistence } from './persistence'
import { bumpThemeRevision, registerTheme as registerThemeInStore, currentTheme } from './store'

export class ThemeEngine {
  private plugins: ThemePlugin[] = []
  private persistence: ReturnType<typeof createPersistence>
  private options: ThemeEngineOptions
  private hydrated = false

  constructor(options: ThemeEngineOptions = {}) {
    this.options = options
    this.persistence = createPersistence(options.storageKey || 'app-theme')
  }

  use(plugin: ThemePlugin) {
    if (this.plugins.some((p) => p.name === plugin.name)) return this
    plugin.install(this)
    this.plugins.push(plugin)
    return this
  }

  getPlugins() {
    return [...this.plugins]
  }

  registerTheme(theme: ThemeDefinition) {
    return registerThemeInStore(theme)
  }

  loadTheme() {
    return this.persistence.loadTheme()
  }

  saveTheme(theme: NormalizedTheme | ThemeDefinition) {
    this.persistence.saveTheme(theme)
  }

  exportTheme(theme?: NormalizedTheme | ThemeDefinition) {
    return this.persistence.exportTheme(theme || this.loadTheme())
  }

  importTheme(json: string | ThemeDefinition) {
    const next = this.persistence.importTheme(json)
    return this.applyTheme(next)
  }

  async applyTheme(theme: ThemeDefinition = {}) {
    const normalized = normalizeTheme({ ...DEFAULT_THEME, ...theme })
    const previous = currentTheme.value
    const ctx: ApplyContext = {
      engine: this,
      previous,
      isSSR: Boolean(this.options.ssr) || typeof document === 'undefined'
    }

    if (!ctx.isSSR) {
      applyCoreColors(normalized)
      applyTypography({ ...normalized, linkColor: normalized.linkColor || normalized.primary })
      applySurfaceTokens(normalized)
      document.documentElement.dataset.themePreset = normalized.id
    }

    for (const plugin of this.plugins) {
      await plugin.apply?.(normalized, ctx)
    }

    const applied = { ...normalized, linkColor: normalized.linkColor || normalized.primary }
    bumpThemeRevision(applied)

    if (!ctx.isSSR) {
      this.saveTheme(applied)
    }

    return applied
  }

  applyPatch(patch: ThemeDefinition) {
    return this.applyTheme({ ...this.loadTheme(), ...patch })
  }

  resetTheme() {
    this.persistence.saveTheme(DEFAULT_THEME)
    return this.applyTheme(DEFAULT_THEME)
  }

  hydrate() {
    if (this.hydrated || this.options.hydrate === false) return
    if (typeof document !== 'undefined') {
      void this.applyTheme(this.loadTheme())
    }
    this.hydrated = true
  }
}

export const themeEngine = new ThemeEngine()

export function applyTheme(theme: ThemeDefinition = {}) {
  return themeEngine.applyTheme(theme)
}

export function loadTheme() {
  return themeEngine.loadTheme()
}

export function saveTheme(theme: ThemeDefinition) {
  themeEngine.saveTheme(theme)
}

export function resetTheme() {
  return themeEngine.resetTheme()
}

export function applyThemePatch(patch: ThemeDefinition) {
  return themeEngine.applyPatch(patch)
}

export function exportThemePreset(theme?: ThemeDefinition) {
  return themeEngine.exportTheme(theme)
}

export function importThemePreset(json: string | ThemeDefinition) {
  return themeEngine.importTheme(json)
}

export function registerTheme(theme: ThemeDefinition) {
  return themeEngine.registerTheme(theme)
}

import type {
  AnimationPreset,
  DensityPreset,
  IconPackId,
  NormalizedTheme,
  RadiusPreset,
  ShadowPreset,
  SidebarType,
  ThemeDefinition
} from './types'
import {
  ANIMATION_PRESETS,
  DEFAULT_ANIMATION,
  DEFAULT_DENSITY,
  DEFAULT_FONT_PRESET,
  DEFAULT_ICON_PACK,
  DEFAULT_RADIUS,
  DEFAULT_SHADOWS,
  DEFAULT_SIDEBAR_TYPE,
  DEFAULT_THEME,
  FONT_PRESETS,
  SIDEBAR_TYPES,
  RADIUS_PRESETS,
  DENSITY_PRESETS,
  SHADOW_PRESETS,
  TYPOGRAPHY_DEFAULTS,
  RADIUS_CSS,
  DENSITY_CSS,
  SHADOW_CSS
} from './constants'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function normalizeHex(hex: string | undefined, fallback = DEFAULT_THEME.primary) {
  if (!hex) return fallback
  let h = hex.trim().toLowerCase()
  if (h.startsWith('#')) h = h.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return /^[0-9a-f]{6}$/.test(h) ? `#${h}` : fallback
}

export function normalizeAnimation(animation?: string): AnimationPreset {
  const value = (animation || DEFAULT_ANIMATION).toString().trim().toLowerCase()
  return (ANIMATION_PRESETS as readonly string[]).includes(value)
    ? (value as AnimationPreset)
    : DEFAULT_ANIMATION
}

export function normalizeIconPack(pack?: string): IconPackId {
  const value = (pack || DEFAULT_ICON_PACK).toString().trim().toLowerCase()
  const ids: IconPackId[] = ['heroicons', 'lucide', 'phosphor', 'remix', 'futuristic']
  return ids.includes(value as IconPackId) ? (value as IconPackId) : DEFAULT_ICON_PACK
}

export function normalizeSidebarType(value?: string): SidebarType {
  const v = (value || DEFAULT_SIDEBAR_TYPE).toString().trim().toLowerCase()
  return (SIDEBAR_TYPES as readonly string[]).includes(v) ? (v as SidebarType) : DEFAULT_SIDEBAR_TYPE
}

export function normalizeRadius(value?: string): RadiusPreset {
  const v = (value || DEFAULT_RADIUS).toString().trim().toLowerCase()
  return (RADIUS_PRESETS as readonly string[]).includes(v) ? (v as RadiusPreset) : DEFAULT_RADIUS
}

export function normalizeDensity(value?: string): DensityPreset {
  const v = (value || DEFAULT_DENSITY).toString().trim().toLowerCase()
  return (DENSITY_PRESETS as readonly string[]).includes(v) ? (v as DensityPreset) : DEFAULT_DENSITY
}

export function normalizeShadows(value?: string): ShadowPreset {
  const v = (value || DEFAULT_SHADOWS).toString().trim().toLowerCase()
  return (SHADOW_PRESETS as readonly string[]).includes(v) ? (v as ShadowPreset) : DEFAULT_SHADOWS
}

function normalizeFontPreset(fontPreset?: string, fontFamily?: string) {
  const ids = Object.keys(FONT_PRESETS)
  if (fontPreset && ids.includes(fontPreset)) return fontPreset
  if (fontFamily) {
    const match = ids.find((id) => FONT_PRESETS[id].family === fontFamily)
    if (match) return match
  }
  return DEFAULT_FONT_PRESET
}

function normalizeFontFamily(fontPreset: string, fontFamily?: string) {
  if (fontFamily?.trim()) return fontFamily.trim()
  return FONT_PRESETS[fontPreset]?.family || TYPOGRAPHY_DEFAULTS.fontFamily
}

export function normalizeTheme(theme: ThemeDefinition = {}): NormalizedTheme {
  const primary = normalizeHex(theme.colors?.primary ?? theme.primary)
  const fontPreset = normalizeFontPreset(
    theme.typography?.fontPreset ?? theme.fontPreset,
    theme.typography?.fontFamily ?? theme.fontFamily
  )
  const fontFamily = normalizeFontFamily(fontPreset, theme.typography?.fontFamily ?? theme.fontFamily)

  const pick = (key: keyof typeof TYPOGRAPHY_DEFAULTS, fallback: string) =>
    normalizeHex(
      (theme.colors as Record<string, string | undefined>)?.[key] ??
        (theme.typography as Record<string, string | undefined>)?.[key] ??
        (theme as Record<string, string | undefined>)[key],
      fallback
    )

  return {
    id: theme.id || theme.personality || 'custom',
    name: theme.name || 'Custom',
    personality: theme.personality,
    primary,
    animation: normalizeAnimation(theme.animation),
    iconPack: normalizeIconPack(theme.iconPack),
    sidebarType: normalizeSidebarType(theme.sidebarType),
    radius: normalizeRadius(theme.radius),
    density: normalizeDensity(theme.density),
    shadows: normalizeShadows(theme.shadows),
    effects: theme.effects || {},
    fontPreset,
    fontFamily,
    textPrimary: pick('textPrimary', TYPOGRAPHY_DEFAULTS.textPrimary),
    textSecondary: pick('textSecondary', TYPOGRAPHY_DEFAULTS.textSecondary),
    textMuted: pick('textMuted', TYPOGRAPHY_DEFAULTS.textMuted),
    textLight: pick('textLight', TYPOGRAPHY_DEFAULTS.textLight),
    textLightSecondary: pick('textLightSecondary', TYPOGRAPHY_DEFAULTS.textLightSecondary),
    textLightMuted: pick('textLightMuted', TYPOGRAPHY_DEFAULTS.textLightMuted),
    headingColor: pick('headingColor', TYPOGRAPHY_DEFAULTS.headingColor),
    linkColor: theme.linkColor ? normalizeHex(theme.linkColor, primary) : primary,
    sidebarText: pick('sidebarText', TYPOGRAPHY_DEFAULTS.sidebarText),
    cardText: pick('cardText', TYPOGRAPHY_DEFAULTS.cardText)
  }
}

export function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex).slice(1)
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  }
}

export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }) {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rr:
        h = (gg - bb) / d + (gg < bb ? 6 : 0)
        break
      case gg:
        h = (bb - rr) / d + 2
        break
      default:
        h = (rr - gg) / d + 4
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToRgb({ h, s, l }: { h: number; s: number; l: number }) {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const hh = h / 360
  const ss = s / 100
  const ll = l / 100
  if (ss === 0) {
    const v = Math.round(ll * 255)
    return { r: v, g: v, b: v }
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
  const p = 2 * ll - q
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255)
  }
}

export function adjustLightness(hex: string, amount: number) {
  const hsl = rgbToHsl(hexToRgb(hex))
  return rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: clamp(hsl.l + amount, 0, 100) }))
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const srgb = [r, g, b].map((value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

export function getContrastColor(hex: string) {
  return relativeLuminance(hexToRgb(hex)) > 0.5 ? '#111827' : '#ffffff'
}

export function contrastRatio(hexA: string, hexB: string) {
  const l1 = relativeLuminance(hexToRgb(hexA))
  const l2 = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function ensureReadableText(foreground: string, background: string, minRatio = 4.5) {
  if (contrastRatio(foreground, background) >= minRatio) return foreground
  const fgLum = relativeLuminance(hexToRgb(foreground))
  return fgLum > relativeLuminance(hexToRgb(background)) ? '#111827' : '#ffffff'
}

export function colorPickerStyle(color: string, fallback = DEFAULT_THEME.primary) {
  return { '--picker-color': normalizeHex(color, fallback) }
}

export function setThemeShadeVars(primary: string) {
  const shades: Record<string, string> = {
    50: adjustLightness(primary, 64),
    100: adjustLightness(primary, 50),
    200: adjustLightness(primary, 40),
    300: adjustLightness(primary, 30),
    400: adjustLightness(primary, 18),
    500: primary,
    600: adjustLightness(primary, -10),
    700: adjustLightness(primary, -18),
    800: adjustLightness(primary, -26),
    900: adjustLightness(primary, -34)
  }
  if (typeof document === 'undefined') return shades
  const root = document.documentElement.style
  Object.entries(shades).forEach(([key, value]) => {
    const rgb = hexToRgb(value)
    root.setProperty(`--theme-primary-${key}`, `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  })
  return shades
}

const loadedFontFamilies = new Set<string>()

export function ensureGoogleFontLink(presetId: string) {
  if (typeof document === 'undefined') return
  const preset = FONT_PRESETS[presetId]
  if (!preset?.googleFamily || loadedFontFamilies.has(preset.googleFamily)) return
  const linkId = 'theme-google-fonts'
  let link = document.getElementById(linkId) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  const families = new Set(Object.values(FONT_PRESETS).map((p) => p.googleFamily).filter(Boolean))
  link.href = `https://fonts.googleapis.com/css2?${[...families]
    .map((f) => `family=${f}`)
    .join('&')}&display=swap`
  loadedFontFamilies.add(preset.googleFamily)
}

const TYPOGRAPHY_CSS_MAP: [string, keyof NormalizedTheme][] = [
  ['--theme-font-family', 'fontFamily'],
  ['--theme-text-primary', 'textPrimary'],
  ['--theme-text-secondary', 'textSecondary'],
  ['--theme-text-muted', 'textMuted'],
  ['--theme-text-light', 'textLight'],
  ['--theme-text-light-secondary', 'textLightSecondary'],
  ['--theme-text-light-muted', 'textLightMuted'],
  ['--theme-heading-color', 'headingColor'],
  ['--theme-link-color', 'linkColor'],
  ['--theme-sidebar-text', 'sidebarText'],
  ['--theme-card-text', 'cardText']
]

export function applyCoreColors(theme: NormalizedTheme) {
  if (typeof document === 'undefined') return
  const primary = theme.primary
  const primaryDark = adjustLightness(primary, -18)
  const primaryRgb = hexToRgb(primary)
  const primaryDarkRgb = hexToRgb(primaryDark)
  const shadeVars = setThemeShadeVars(primary)
  const root = document.documentElement.style
  root.setProperty('--theme-primary', primary)
  root.setProperty('--theme-primary-dark', primaryDark)
  root.setProperty('--theme-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
  root.setProperty('--theme-primary-dark-rgb', `${primaryDarkRgb.r}, ${primaryDarkRgb.g}, ${primaryDarkRgb.b}`)
  root.setProperty('--theme-primary-500', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
  root.setProperty('--theme-on-primary', getContrastColor(primary))
  root.setProperty('--theme-primary-soft', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.14)`)
  root.setProperty('--theme-primary-border', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.18)`)
  if (shadeVars[700]) {
    const s700 = hexToRgb(shadeVars[700])
    root.setProperty('--theme-primary-dark', `rgb(${s700.r}, ${s700.g}, ${s700.b})`)
  }
}

export function applyTypography(theme: NormalizedTheme) {
  if (typeof document === 'undefined') return theme
  ensureGoogleFontLink(theme.fontPreset)
  const withLink = { ...theme, linkColor: theme.linkColor || theme.primary }
  const root = document.documentElement.style
  TYPOGRAPHY_CSS_MAP.forEach(([cssVar, key]) => {
    const val = withLink[key]
    if (val) root.setProperty(cssVar, String(val))
  })
  document.documentElement.dataset.themeFont = theme.fontPreset
  return withLink
}

export function applySurfaceTokens(theme: Pick<NormalizedTheme, 'radius' | 'density' | 'shadows'>) {
  if (typeof document === 'undefined') return
  const r = normalizeRadius(theme.radius)
  const d = normalizeDensity(theme.density)
  const s = normalizeShadows(theme.shadows)
  const style = document.documentElement.style

  const radiusScale = {
    none: { sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '0px' },
    sm: { sm: '0.125rem', md: '0.25rem', lg: '0.375rem', xl: '0.5rem', full: '9999px' },
    md: { sm: '0.25rem', md: '0.5rem', lg: '0.625rem', xl: '0.75rem', full: '9999px' },
    lg: { sm: '0.375rem', md: '0.625rem', lg: '0.75rem', xl: '1rem', full: '9999px' },
    xl: { sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.25rem', full: '9999px' },
    '2xl': { sm: '0.625rem', md: '1rem', lg: '1.25rem', xl: '1.5rem', full: '9999px' }
  }
  const scale = radiusScale[r] || radiusScale.md

  style.setProperty('--radius-sm', scale.sm)
  style.setProperty('--radius-md', scale.md)
  style.setProperty('--radius-lg', scale.lg)
  style.setProperty('--radius-xl', scale.xl)
  style.setProperty('--radius-full', scale.full)
  style.setProperty('--theme-radius', scale.md)
  style.setProperty('--theme-radius-sm', scale.sm)
  style.setProperty('--theme-radius-lg', scale.lg)

  Object.entries(DENSITY_CSS[d]).forEach(([k, v]) => style.setProperty(k, v))
  style.setProperty('--theme-navbar-py', d === 'compact' ? '0.5rem' : d === 'spacious' ? '0.875rem' : '0.625rem')
  style.setProperty('--theme-card-padding', d === 'compact' ? '0.875rem' : d === 'spacious' ? 'clamp(1rem, 2vw, 1.5rem)' : '1rem')
  style.setProperty('--theme-gap', d === 'compact' ? '0.5rem' : d === 'spacious' ? '1rem' : '0.75rem')
  style.setProperty('--theme-control-min-height', d === 'compact' ? '2.25rem' : d === 'spacious' ? '2.75rem' : '2.5rem')

  Object.entries(SHADOW_CSS[s]).forEach(([k, v]) => style.setProperty(k, v))

  const surfaceMap: Record<string, string> = {
    flat: 'flat',
    soft: 'soft',
    elevated: 'elevated',
    glow: 'glass'
  }
  const surface = surfaceMap[s] || 'soft'
  document.documentElement.dataset.themeRadius = r
  document.documentElement.dataset.themeDensity = d
  document.documentElement.dataset.themeShadows = s
  document.documentElement.dataset.themeSurface = surface
}

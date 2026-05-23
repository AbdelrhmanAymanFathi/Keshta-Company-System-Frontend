import { normalizeIconPack, setIconPack } from './theme/icons'
import { bumpThemeRevision } from './theme/state'
import {
  normalizeSidebarType,
  normalizeRadius,
  normalizeDensity,
  normalizeShadows,
  applySurfaceTokens
} from './theme/tokens'
import { applySidebarLayout } from './theme/sidebar/layouts'
import {
  PRESET_THEMES,
  getPresetTheme,
  getPresetThemeList,
  PERSONALITY_TO_PRESET
} from './theme/presets'
import { recommendThemes, recommendThemesWithAI } from './theme/intelligence/themeBot'

const THEME_STORAGE_KEY = 'app-theme'
const DEFAULT_ANIMATION = 'bubbles'
const ANIMATION_PRESETS = [
  'bubbles',
  'aurora',
  'grid',
  'liquid',
  'minimal',
  'particles',
  'truck',
  'smart-city',
  'construction',
  'blueprint'
]

/** @type {Record<string, { id: string, label: string, family: string, googleFamily: string, rtl?: boolean }>} */
const FONT_PRESETS = {
  inter: {
    id: 'inter',
    label: 'Inter',
    family: "'Inter', system-ui, sans-serif",
    googleFamily: 'Inter:wght@400;500;600;700'
  },
  poppins: {
    id: 'poppins',
    label: 'Poppins',
    family: "'Poppins', system-ui, sans-serif",
    googleFamily: 'Poppins:wght@400;500;600;700'
  },
  cairo: {
    id: 'cairo',
    label: 'Cairo',
    family: "'Cairo', system-ui, sans-serif",
    googleFamily: 'Cairo:wght@400;500;600;700',
    rtl: true
  },
  tajawal: {
    id: 'tajawal',
    label: 'Tajawal',
    family: "'Tajawal', system-ui, sans-serif",
    googleFamily: 'Tajawal:wght@400;500;700',
    rtl: true
  },
  'ibm-plex-sans': {
    id: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    family: "'IBM Plex Sans', system-ui, sans-serif",
    googleFamily: 'IBM+Plex+Sans:wght@400;500;600;700'
  },
  outfit: {
    id: 'outfit',
    label: 'Outfit',
    family: "'Outfit', system-ui, sans-serif",
    googleFamily: 'Outfit:wght@400;500;600;700'
  },
  'plus-jakarta-sans': {
    id: 'plus-jakarta-sans',
    label: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', system-ui, sans-serif",
    googleFamily: 'Plus+Jakarta+Sans:wght@400;500;600;700'
  },
  rubik: {
    id: 'rubik',
    label: 'Rubik',
    family: "'Rubik', system-ui, sans-serif",
    googleFamily: 'Rubik:wght@400;500;600;700'
  },
  geist: {
    id: 'geist',
    label: 'Geist',
    family: "'Geist', 'Inter', system-ui, sans-serif",
    googleFamily: 'Geist:wght@400;500;600;700'
  }
}

const FONT_PRESET_IDS = Object.keys(FONT_PRESETS)
const DEFAULT_FONT_PRESET = 'inter'

const TYPOGRAPHY_DEFAULTS = {
  fontPreset: DEFAULT_FONT_PRESET,
  fontFamily: FONT_PRESETS[DEFAULT_FONT_PRESET].family,
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  textLight: '#ffffff',
  textLightSecondary: '#e5e7eb',
  textLightMuted: '#d1d5db',
  headingColor: '#0f172a',
  linkColor: null,
  sidebarText: '#334155',
  cardText: '#111827'
}

const DEFAULT_ICON_PACK = 'heroicons'
const DEFAULT_SIDEBAR_TYPE = 'static'
const DEFAULT_RADIUS = 'md'
const DEFAULT_DENSITY = 'comfortable'
const DEFAULT_SHADOWS = 'soft'

/** @deprecated Use PRESET_THEMES — kept for Settings backward compatibility */
const THEME_PERSONALITIES = {
  corporate: { ...PRESET_THEMES['corporate-erp'], label: 'Corporate' },
  creative: {
    ...PRESET_THEMES['modern-startup'],
    label: 'Creative',
    iconPack: 'phosphor'
  },
  cyber: { ...PRESET_THEMES['cyber-futuristic'], label: 'Cyber' },
  minimal: { ...PRESET_THEMES['modern-startup'], label: 'Minimal' }
}

const DEFAULT_THEME = {
  id: 'default',
  name: 'Default',
  primary: '#4f46e5',
  animation: DEFAULT_ANIMATION,
  iconPack: DEFAULT_ICON_PACK,
  sidebarType: DEFAULT_SIDEBAR_TYPE,
  radius: DEFAULT_RADIUS,
  density: DEFAULT_DENSITY,
  shadows: DEFAULT_SHADOWS,
  ...TYPOGRAPHY_DEFAULTS
}

const TYPOGRAPHY_CSS_MAP = [
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

const loadedFontFamilies = new Set()

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeHex(hex, fallback = DEFAULT_THEME.primary) {
  if (!hex) return fallback
  hex = hex.trim().toLowerCase()
  if (hex.startsWith('#')) hex = hex.slice(1)
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('')
  }
  if (/^[0-9a-f]{6}$/.test(hex)) {
    return `#${hex}`
  }
  return fallback
}

function normalizeAnimation(animation) {
  const value = (animation || DEFAULT_ANIMATION).toString().trim().toLowerCase()
  return ANIMATION_PRESETS.includes(value) ? value : DEFAULT_ANIMATION
}

function normalizeFontPreset(fontPreset, fontFamily) {
  if (fontPreset && FONT_PRESET_IDS.includes(fontPreset)) {
    return fontPreset
  }
  if (fontFamily) {
    const match = FONT_PRESET_IDS.find((id) => FONT_PRESETS[id].family === fontFamily)
    if (match) return match
  }
  return DEFAULT_FONT_PRESET
}

function normalizeFontFamily(fontPreset, fontFamily) {
  const preset = normalizeFontPreset(fontPreset, fontFamily)
  if (fontFamily && typeof fontFamily === 'string' && fontFamily.trim()) {
    return fontFamily.trim()
  }
  return FONT_PRESETS[preset].family
}

function normalizeTheme(theme = {}) {
  const fontPreset = normalizeFontPreset(theme.fontPreset, theme.fontFamily)
  const fontFamily = normalizeFontFamily(fontPreset, theme.fontFamily)
  const primary = normalizeHex(theme.primary)

  return {
    id: theme.id || theme.presetId || 'custom',
    name: theme.name || 'Custom',
    primary,
    animation: normalizeAnimation(theme.animation),
    iconPack: normalizeIconPack(theme.iconPack),
    sidebarType: normalizeSidebarType(theme.sidebarType),
    radius: normalizeRadius(theme.radius),
    density: normalizeDensity(theme.density),
    shadows: normalizeShadows(theme.shadows),
    fontPreset,
    fontFamily,
    textPrimary: normalizeHex(theme.textPrimary, TYPOGRAPHY_DEFAULTS.textPrimary),
    textSecondary: normalizeHex(theme.textSecondary, TYPOGRAPHY_DEFAULTS.textSecondary),
    textMuted: normalizeHex(theme.textMuted, TYPOGRAPHY_DEFAULTS.textMuted),
    textLight: normalizeHex(theme.textLight, TYPOGRAPHY_DEFAULTS.textLight),
    textLightSecondary: normalizeHex(
      theme.textLightSecondary,
      TYPOGRAPHY_DEFAULTS.textLightSecondary
    ),
    textLightMuted: normalizeHex(theme.textLightMuted, TYPOGRAPHY_DEFAULTS.textLightMuted),
    headingColor: normalizeHex(theme.headingColor, TYPOGRAPHY_DEFAULTS.headingColor),
    linkColor: theme.linkColor ? normalizeHex(theme.linkColor, primary) : primary,
    sidebarText: normalizeHex(theme.sidebarText, TYPOGRAPHY_DEFAULTS.sidebarText),
    cardText: normalizeHex(theme.cardText, TYPOGRAPHY_DEFAULTS.cardText)
  }
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex).slice(1)
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return { r, g, b }
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHsl({ r, g, b }) {
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
      case bb:
        h = (rr - gg) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToRgb({ h, s, l }) {
  const hue2rgb = (p, q, t) => {
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
  let r = ll
  let g = ll
  let b = ll

  if (ss !== 0) {
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
    const p = 2 * ll - q
    r = hue2rgb(p, q, hh + 1 / 3)
    g = hue2rgb(p, q, hh)
    b = hue2rgb(p, q, hh - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

function adjustLightness(hex, amount) {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb)
  const nextL = clamp(hsl.l + amount, 0, 100)
  return rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: nextL }))
}

function relativeLuminance({ r, g, b }) {
  const srgb = [r, g, b].map((value) => {
    const channel = value / 255
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

function getContrastColor(hex) {
  const rgb = hexToRgb(hex)
  const lum = relativeLuminance(rgb)
  return lum > 0.5 ? '#111827' : '#ffffff'
}

function contrastRatio(hexA, hexB) {
  const l1 = relativeLuminance(hexToRgb(hexA))
  const l2 = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function ensureReadableText(foreground, background, minRatio = 4.5) {
  if (contrastRatio(foreground, background) >= minRatio) {
    return foreground
  }
  const fgLum = relativeLuminance(hexToRgb(foreground))
  return fgLum > relativeLuminance(hexToRgb(background)) ? '#111827' : '#ffffff'
}

function setThemeShadeVars(primary) {
  const shades = {
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

  const root = document.documentElement.style
  Object.entries(shades).forEach(([key, value]) => {
    const rgb = hexToRgb(value)
    root.setProperty(`--theme-primary-${key}`, `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  })

  return shades
}

function ensureGoogleFontLink(presetId) {
  if (typeof document === 'undefined') return
  const preset = FONT_PRESETS[presetId]
  if (!preset?.googleFamily || loadedFontFamilies.has(preset.googleFamily)) return

  const linkId = 'theme-google-fonts'
  let link = document.getElementById(linkId)
  if (!link) {
    link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  const families = new Set()
  FONT_PRESET_IDS.forEach((id) => {
    const p = FONT_PRESETS[id]
    if (p.googleFamily) families.add(p.googleFamily)
  })

  link.href = `https://fonts.googleapis.com/css2?${[...families]
    .map((f) => `family=${f}`)
    .join('&')}&display=swap`

  loadedFontFamilies.add(preset.googleFamily)
}

function applyTypography(theme) {
  if (typeof document === 'undefined') return theme

  const normalized = theme.fontPreset
    ? theme
    : { ...theme, fontPreset: normalizeFontPreset(theme.fontPreset, theme.fontFamily) }

  ensureGoogleFontLink(normalized.fontPreset)

  const root = document.documentElement.style
  const withLink = {
    ...normalized,
    linkColor: normalized.linkColor || normalized.primary
  }

  TYPOGRAPHY_CSS_MAP.forEach(([cssVar, key]) => {
    if (withLink[key]) {
      root.setProperty(cssVar, withLink[key])
    }
  })

  document.documentElement.dataset.themeFont = normalized.fontPreset

  return withLink
}

function clearAnimationClasses() {
  if (typeof document === 'undefined' || !document.body) return
  ANIMATION_PRESETS.forEach((preset) => {
    document.body.classList.remove(`theme-anim-${preset}`)
  })
}

function applyAnimationPreset(animation) {
  if (typeof document === 'undefined') return normalizeAnimation(animation)

  const preset = normalizeAnimation(animation)
  const apply = () => {
    if (!document.body) return
    clearAnimationClasses()
    document.body.classList.add(`theme-anim-${preset}`)
    document.documentElement.dataset.themeAnimation = preset
    document.documentElement.style.setProperty('--theme-animation', preset)
  }

  if (document.body) {
    apply()
  } else {
    document.addEventListener('DOMContentLoaded', apply, { once: true })
  }

  return preset
}

function applyTheme(theme = {}) {
  const normalized = normalizeTheme(theme)
  const primary = normalized.primary
  const primaryDark = adjustLightness(primary, -18)
  const primaryRgb = hexToRgb(primary)
  const primaryDarkRgb = hexToRgb(primaryDark)
  const onPrimary = getContrastColor(primary)
  const shadeVars = setThemeShadeVars(primary)

  const root = document.documentElement.style
  root.setProperty('--theme-primary', primary)
  root.setProperty('--theme-primary-dark', primaryDark)
  root.setProperty('--theme-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
  root.setProperty('--theme-primary-dark-rgb', `${primaryDarkRgb.r}, ${primaryDarkRgb.g}, ${primaryDarkRgb.b}`)
  root.setProperty('--theme-primary-500', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
  root.setProperty('--theme-on-primary', onPrimary)
  root.setProperty('--theme-primary-soft', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.14)`)
  root.setProperty('--theme-primary-border', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.18)`)

  if (shadeVars[700]) {
    const shade700 = hexToRgb(shadeVars[700])
    root.setProperty('--theme-primary-dark', `rgb(${shade700.r}, ${shade700.g}, ${shade700.b})`)
  }

  const typographyTheme = {
    ...normalized,
    linkColor: normalized.linkColor || primary
  }
  applyTypography(typographyTheme)
  root.setProperty('--theme-link-color', typographyTheme.linkColor)

  applyAnimationPreset(normalized.animation)

  setIconPack(normalized.iconPack)

  applySurfaceTokens(normalized)
  applySidebarLayout(normalized.sidebarType)

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.themePreset = normalized.id || 'custom'
  }

  const applied = { ...typographyTheme, linkColor: typographyTheme.linkColor }
  bumpThemeRevision(applied)
  return applied
}

function loadTheme() {
  if (typeof window === 'undefined') return { ...DEFAULT_THEME }

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (!saved) return { ...DEFAULT_THEME }
    const parsed = JSON.parse(saved)
    return normalizeTheme({ ...DEFAULT_THEME, ...parsed })
  } catch (error) {
    return { ...DEFAULT_THEME }
  }
}

function saveTheme(theme) {
  if (typeof window === 'undefined') return
  const normalized = normalizeTheme(theme)
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(normalized))
}

function resetTheme() {
  saveTheme(DEFAULT_THEME)
  return applyTheme(DEFAULT_THEME)
}

function getFontPresets() {
  return FONT_PRESET_IDS.map((id) => ({
    id,
    label: FONT_PRESETS[id].label,
    family: FONT_PRESETS[id].family,
    rtl: Boolean(FONT_PRESETS[id].rtl)
  }))
}

function applyThemePatch(patch = {}) {
  const current = loadTheme()
  return applyTheme({ ...current, ...patch })
}

/** Inline style for `input[type="color"].theme-color-input` — border matches swatch */
function colorPickerStyle(color, fallback = DEFAULT_THEME.primary) {
  return { '--picker-color': normalizeHex(color, fallback) }
}

function applyThemePreset(presetId) {
  const preset = getPresetTheme(presetId)
  if (!preset) return applyTheme(loadTheme())
  const next = normalizeTheme({ ...DEFAULT_THEME, ...preset })
  saveTheme(next)
  return applyTheme(next)
}

function applyThemePersonality(personalityId) {
  const mapped = PERSONALITY_TO_PRESET[personalityId] || personalityId
  if (PRESET_THEMES[mapped]) return applyThemePreset(mapped)
  const preset = THEME_PERSONALITIES[personalityId]
  if (!preset) return applyTheme(loadTheme())
  const current = loadTheme()
  const next = normalizeTheme({ ...current, ...preset })
  saveTheme(next)
  return applyTheme(next)
}

function getThemePersonalities() {
  return getPresetThemeList()
}

function exportThemePreset(theme = loadTheme()) {
  return JSON.stringify(normalizeTheme(theme), null, 2)
}

function importThemePreset(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json
  const next = normalizeTheme({ ...DEFAULT_THEME, ...parsed })
  saveTheme(next)
  return applyTheme(next)
}

// Apply the saved theme immediately on app load.
if (typeof document !== 'undefined') {
  applyTheme(loadTheme())
}

export {
  ANIMATION_PRESETS,
  DEFAULT_ANIMATION,
  DEFAULT_THEME,
  DEFAULT_ICON_PACK,
  DEFAULT_FONT_PRESET,
  DEFAULT_SIDEBAR_TYPE,
  FONT_PRESETS,
  FONT_PRESET_IDS,
  THEME_PERSONALITIES,
  PRESET_THEMES,
  TYPOGRAPHY_DEFAULTS,
  applyTheme,
  applyThemePatch,
  applyThemePreset,
  applyThemePersonality,
  applyTypography,
  loadTheme,
  saveTheme,
  resetTheme,
  normalizeTheme,
  normalizeAnimation,
  getFontPresets,
  getThemePersonalities,
  getPresetThemeList,
  recommendThemes,
  recommendThemesWithAI,
  exportThemePreset,
  importThemePreset,
  ensureReadableText,
  contrastRatio,
  colorPickerStyle
}

export { getThemeIcon, getMenuIcon, getIconPackOptions, iconRevision, ICON_REVISION_KEY } from './theme/icons'
export { themeRevision, currentTheme, THEME_REVISION_KEY } from './theme/state'
export { getSidebarOptions } from './theme/sidebar/layouts'
export {
  SIDEBAR_TYPES,
  RADIUS_PRESETS,
  DENSITY_PRESETS,
  SHADOW_PRESETS
} from './theme/tokens'

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

const DEFAULT_THEME = {
  primary: '#4f46e5',
  animation: DEFAULT_ANIMATION
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeHex(hex) {
  if (!hex) return DEFAULT_THEME.primary
  hex = hex.trim().toLowerCase()
  if (hex.startsWith('#')) hex = hex.slice(1)
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('')
  }
  if (/^[0-9a-f]{6}$/.test(hex)) {
    return `#${hex}`
  }
  return DEFAULT_THEME.primary
}

function normalizeAnimation(animation) {
  const value = (animation || DEFAULT_ANIMATION).toString().trim().toLowerCase()
  return ANIMATION_PRESETS.includes(value) ? value : DEFAULT_ANIMATION
}

function normalizeTheme(theme = {}) {
  return {
    primary: normalizeHex(theme.primary),
    animation: normalizeAnimation(theme.animation)
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

  applyAnimationPreset(normalized.animation)

  return normalized
}

function loadTheme() {
  if (typeof window === 'undefined') return { ...DEFAULT_THEME }

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (!saved) return { ...DEFAULT_THEME }
    const parsed = JSON.parse(saved)
    return normalizeTheme(parsed)
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

// Apply the saved theme immediately on app load.
if (typeof document !== 'undefined') {
  applyTheme(loadTheme())
}

export {
  ANIMATION_PRESETS,
  DEFAULT_ANIMATION,
  DEFAULT_THEME,
  applyTheme,
  loadTheme,
  saveTheme,
  resetTheme,
  normalizeTheme,
  normalizeAnimation
}

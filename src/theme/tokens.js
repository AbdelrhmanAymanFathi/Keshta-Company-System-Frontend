/** Layout & surface tokens for the Theme Intelligence System */

export const SIDEBAR_TYPES = [
  'static',
  'overlay',
  'slim',
  'slim-plus',
  'reveal',
  'drawer',
  'horizontal'
]

export const RADIUS_PRESETS = ['none', 'sm', 'md', 'lg', 'xl', '2xl']

export const DENSITY_PRESETS = ['compact', 'comfortable', 'spacious']

export const SHADOW_PRESETS = ['flat', 'soft', 'elevated', 'glow']

export const RADIUS_CSS = {
  none: '0px',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem'
}

export const DENSITY_CSS = {
  compact: {
    '--theme-space-unit': '0.2rem',
    '--theme-control-py': '0.35rem',
    '--theme-control-px': '0.65rem',
    '--theme-table-py': '0.4rem',
    '--theme-sidebar-gap': '0.35rem'
  },
  comfortable: {
    '--theme-space-unit': '0.25rem',
    '--theme-control-py': '0.5rem',
    '--theme-control-px': '0.875rem',
    '--theme-table-py': '0.625rem',
    '--theme-sidebar-gap': '0.5rem'
  },
  spacious: {
    '--theme-space-unit': '0.3rem',
    '--theme-control-py': '0.65rem',
    '--theme-control-px': '1rem',
    '--theme-table-py': '0.85rem',
    '--theme-sidebar-gap': '0.65rem'
  }
}

export const SHADOW_CSS = {
  flat: {
    '--theme-shadow-sm': 'none',
    '--theme-shadow-md': 'none',
    '--theme-shadow-lg': 'none',
    '--theme-shadow-card': '0 0 0 1px rgba(15, 23, 42, 0.06)'
  },
  soft: {
    '--theme-shadow-sm': '0 1px 2px rgba(15, 23, 42, 0.06)',
    '--theme-shadow-md': '0 4px 12px rgba(15, 23, 42, 0.08)',
    '--theme-shadow-lg': '0 12px 28px rgba(15, 23, 42, 0.1)',
    '--theme-shadow-card': '0 4px 14px rgba(15, 23, 42, 0.08)'
  },
  elevated: {
    '--theme-shadow-sm': '0 2px 6px rgba(15, 23, 42, 0.1)',
    '--theme-shadow-md': '0 8px 24px rgba(15, 23, 42, 0.12)',
    '--theme-shadow-lg': '0 20px 40px rgba(15, 23, 42, 0.14)',
    '--theme-shadow-card': '0 10px 30px rgba(15, 23, 42, 0.12)'
  },
  glow: {
    '--theme-shadow-sm': '0 0 12px rgba(var(--theme-primary-rgb), 0.2)',
    '--theme-shadow-md': '0 0 24px rgba(var(--theme-primary-rgb), 0.28)',
    '--theme-shadow-lg': '0 0 40px rgba(var(--theme-primary-rgb), 0.35)',
    '--theme-shadow-card': '0 8px 32px rgba(var(--theme-primary-rgb), 0.22)'
  }
}

export function normalizeSidebarType(value) {
  const v = (value || 'static').toString().trim().toLowerCase()
  return SIDEBAR_TYPES.includes(v) ? v : 'static'
}

export function normalizeRadius(value) {
  const v = (value || 'md').toString().trim().toLowerCase()
  return RADIUS_PRESETS.includes(v) ? v : 'md'
}

export function normalizeDensity(value) {
  const v = (value || 'comfortable').toString().trim().toLowerCase()
  return DENSITY_PRESETS.includes(v) ? v : 'comfortable'
}

export function normalizeShadows(value) {
  const v = (value || 'soft').toString().trim().toLowerCase()
  return SHADOW_PRESETS.includes(v) ? v : 'soft'
}

export function applySurfaceTokens({ radius, density, shadows }) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const style = root.style

  const r = normalizeRadius(radius)
  const d = normalizeDensity(density)
  const s = normalizeShadows(shadows)

  style.setProperty('--theme-radius', RADIUS_CSS[r])
  style.setProperty('--theme-radius-sm', RADIUS_CSS[r === 'none' ? 'none' : 'sm'])
  style.setProperty('--theme-radius-lg', RADIUS_CSS[r === '2xl' ? '2xl' : 'lg'])

  Object.entries(DENSITY_CSS[d]).forEach(([key, val]) => style.setProperty(key, val))
  Object.entries(SHADOW_CSS[s]).forEach(([key, val]) => style.setProperty(key, val))

  root.dataset.themeRadius = r
  root.dataset.themeDensity = d
  root.dataset.themeShadows = s
}

export const ANIMATION_PRESETS = [
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
] as const

export const SIDEBAR_TYPES = [
  'static',
  'overlay',
  'slim',
  'slim-plus',
  'reveal',
  'drawer',
  'horizontal'
] as const

export const RADIUS_PRESETS = ['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const
export const DENSITY_PRESETS = ['compact', 'comfortable', 'spacious'] as const
export const SHADOW_PRESETS = ['flat', 'soft', 'elevated', 'glow'] as const

export const DEFAULT_ANIMATION = 'bubbles'
export const DEFAULT_ICON_PACK = 'heroicons'
export const DEFAULT_SIDEBAR_TYPE = 'static'
export const DEFAULT_RADIUS = 'md'
export const DEFAULT_DENSITY = 'comfortable'
export const DEFAULT_SHADOWS = 'soft'
export const DEFAULT_FONT_PRESET = 'inter'

export const FONT_PRESETS: Record<
  string,
  { id: string; label: string; family: string; googleFamily: string; rtl?: boolean }
> = {
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

export const TYPOGRAPHY_DEFAULTS = {
  fontPreset: DEFAULT_FONT_PRESET,
  fontFamily: FONT_PRESETS[DEFAULT_FONT_PRESET].family,
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  textLight: '#ffffff',
  textLightSecondary: '#e5e7eb',
  textLightMuted: '#d1d5db',
  headingColor: '#0f172a',
  linkColor: null as string | null,
  sidebarText: '#334155',
  cardText: '#111827'
}

export const DEFAULT_THEME = {
  id: 'default',
  name: 'Default',
  primary: '#4f46e5',
  animation: DEFAULT_ANIMATION,
  iconPack: DEFAULT_ICON_PACK,
  sidebarType: DEFAULT_SIDEBAR_TYPE,
  radius: DEFAULT_RADIUS,
  density: DEFAULT_DENSITY,
  shadows: DEFAULT_SHADOWS,
  effects: {},
  ...TYPOGRAPHY_DEFAULTS
}

export const RADIUS_CSS: Record<string, string> = {
  none: '0px',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem'
}

export const DENSITY_CSS: Record<string, Record<string, string>> = {
  compact: {
    '--theme-space-unit': '0.2rem',
    '--theme-control-py': '0.45rem',
    '--theme-control-px': '0.75rem',
    '--theme-table-py': '0.4rem',
    '--theme-sidebar-gap': '0.4rem'
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
    '--theme-sidebar-gap': '0.6rem'
  }
}

export const FONT_PRESET_IDS = Object.keys(FONT_PRESETS)

export const SHADOW_CSS: Record<string, Record<string, string>> = {
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

import type { ThemeDefinition } from '@acme/theme-engine'

export const PRESET_THEMES: Record<string, ThemeDefinition> = {
  'corporate-erp': {
    id: 'corporate-erp',
    name: 'Corporate ERP',
    personality: 'corporate',
    description: 'Professional blue-gray ERP with static sidebar and minimal motion.',
    primary: '#2563eb',
    animation: 'minimal',
    iconPack: 'heroicons',
    sidebarType: 'static',
    radius: 'md',
    density: 'comfortable',
    shadows: 'soft',
    fontPreset: 'inter',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    headingColor: '#0f172a',
    sidebarText: '#334155',
    cardText: '#111827'
  },
  'modern-startup': {
    id: 'modern-startup',
    name: 'Modern Startup',
    personality: 'startup',
    description: 'Rounded gradient SaaS look with slim sidebar and smooth motion.',
    primary: '#7c3aed',
    animation: 'liquid',
    iconPack: 'lucide',
    sidebarType: 'slim-plus',
    radius: 'xl',
    density: 'comfortable',
    shadows: 'elevated',
    fontPreset: 'plus-jakarta-sans',
    textPrimary: '#18181b',
    textSecondary: '#52525b',
    textMuted: '#71717a',
    headingColor: '#09090b',
    sidebarText: '#3f3f46',
    cardText: '#18181b',
    effects: { gradient: true, intensity: 'medium' }
  },
  'construction-field': {
    id: 'construction-field',
    name: 'Construction / Field Ops',
    personality: 'construction',
    description: 'High-contrast field operations UI with drawer sidebar and bold icons.',
    primary: '#ea580c',
    animation: 'construction',
    iconPack: 'remix',
    sidebarType: 'drawer',
    radius: 'sm',
    density: 'spacious',
    shadows: 'elevated',
    fontPreset: 'ibm-plex-sans',
    textPrimary: '#1c1917',
    textSecondary: '#44403c',
    textMuted: '#57534e',
    headingColor: '#0c0a09',
    sidebarText: '#292524',
    cardText: '#1c1917'
  },
  'cyber-futuristic': {
    id: 'cyber-futuristic',
    name: 'Cyber Futuristic',
    personality: 'cyber',
    description: 'Neon cyber dashboard with overlay sidebar and grid animations.',
    primary: '#06b6d4',
    animation: 'grid',
    iconPack: 'futuristic',
    sidebarType: 'overlay',
    radius: 'lg',
    density: 'compact',
    shadows: 'glow',
    fontPreset: 'geist',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    headingColor: '#f8fafc',
    textLight: '#f8fafc',
    sidebarText: '#cbd5e1',
    cardText: '#e2e8f0',
    effects: { glow: true, intensity: 'high' }
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    personality: 'minimal',
    description: 'Clean Lucide UI with minimal motion and Plus Jakarta Sans.',
    primary: '#4f7dcc',
    animation: 'minimal',
    iconPack: 'lucide',
    sidebarType: 'static',
    radius: 'lg',
    density: 'comfortable',
    shadows: 'soft',
    fontPreset: 'plus-jakarta-sans'
  }
}

export const PRESET_THEME_IDS = Object.keys(PRESET_THEMES)

export const PERSONALITY_TO_PRESET: Record<string, string> = {
  corporate: 'corporate-erp',
  minimal: 'minimal',
  creative: 'modern-startup',
  cyber: 'cyber-futuristic',
  startup: 'modern-startup',
  construction: 'construction-field'
}

export function getPresetTheme(presetId: string) {
  const id = PERSONALITY_TO_PRESET[presetId] || presetId
  return PRESET_THEMES[id] ? { ...PRESET_THEMES[id] } : null
}

export function getPresetThemeList() {
  return PRESET_THEME_IDS.map((id) => {
    const p = PRESET_THEMES[id]
    return {
      id: p.id!,
      name: p.name!,
      description: (p as { description?: string }).description || '',
      iconPack: p.iconPack,
      sidebarType: p.sidebarType,
      animation: p.animation,
      fontPreset: p.fontPreset
    }
  })
}

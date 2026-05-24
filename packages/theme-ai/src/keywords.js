/**
 * Keyword → preset scoring rules (phase 1: rule-based, phase 2: extensible AI hook).
 */

export const KEYWORD_RULES = [
  {
    presetId: 'corporate-erp',
    weight: 1,
    keywords: [
      'corporate',
      'erp',
      'enterprise',
      'business',
      'professional',
      'office',
      'accounting',
      'finance',
      'admin',
      'formal',
      'blue',
      'gray',
      'grey'
    ]
  },
  {
    presetId: 'modern-startup',
    weight: 1,
    keywords: [
      'startup',
      'saas',
      'modern',
      'minimal',
      'clean',
      'simple',
      'gradient',
      'rounded',
      'friendly',
      'product',
      'app',
      'fresh',
      'airy'
    ]
  },
  {
    presetId: 'construction-field',
    weight: 1,
    keywords: [
      'construction',
      'field',
      'ops',
      'operations',
      'site',
      'contractor',
      'heavy',
      'industrial',
      'warehouse',
      'logistics',
      'truck',
      'equipment',
      'bold',
      'contrast',
      'outdoor'
    ]
  },
  {
    presetId: 'cyber-futuristic',
    weight: 1,
    keywords: [
      'cyber',
      'futuristic',
      'future',
      'neon',
      'glow',
      'sci-fi',
      'scifi',
      'hacker',
      'matrix',
      'dashboard',
      'dark',
      'tech',
      'digital',
      'grid'
    ]
  }
]

/** Token-level boosts for sub-features */
export const FEATURE_KEYWORDS = {
  sidebarType: {
    static: ['static', 'fixed', 'classic'],
    overlay: ['overlay', 'floating', 'glass'],
    slim: ['slim', 'narrow', 'compact sidebar'],
    'slim-plus': ['slim plus', 'slim+', 'icon rail'],
    reveal: ['reveal', 'hover expand', 'peek'],
    drawer: ['drawer', 'slide', 'mobile first'],
    horizontal: ['horizontal', 'top nav', 'navbar only']
  },
  iconPack: {
    heroicons: ['hero', 'heroicons', 'outline'],
    lucide: ['lucide', 'line'],
    phosphor: ['phosphor', 'rounded icons'],
    remix: ['remix', 'bold', 'filled', 'solid icons'],
    futuristic: ['futuristic', 'duotone', 'cyber icons']
  },
  animation: {
    minimal: ['minimal', 'subtle', 'calm', 'no animation'],
    liquid: ['liquid', 'smooth', 'fluid'],
    grid: ['grid', 'matrix'],
    construction: ['construction', 'building'],
    aurora: ['aurora', 'northern']
  }
}

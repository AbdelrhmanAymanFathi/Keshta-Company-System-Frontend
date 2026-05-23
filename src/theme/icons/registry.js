import heroiconsPack from '../icon-packs/heroicons'

export const ICON_PACK_IDS = ['heroicons', 'lucide', 'phosphor', 'remix', 'futuristic']

export const ICON_PACK_META = {
  heroicons: { label: 'Heroicons', description: 'Clean outline (default)' },
  lucide: { label: 'Lucide', description: 'Minimal line icons' },
  phosphor: { label: 'Phosphor', description: 'Rounded modern icons' },
  remix: { label: 'Bold Solid', description: 'Bold filled icons' },
  futuristic: { label: 'Futuristic', description: 'Duotone cyber glow' }
}

/** @type {Record<string, () => Promise<{ default: import('../icon-packs/_helpers').IconPack }>>} */
export const ICON_PACK_LOADERS = {
  heroicons: () => Promise.resolve({ default: heroiconsPack }),
  lucide: () => import('../icon-packs/lucide.js'),
  phosphor: () => import('../icon-packs/phosphor.js'),
  remix: () => import('../icon-packs/remix.js'),
  futuristic: () => import('../icon-packs/futuristic.js')
}

export const DEFAULT_ICON_PACK = 'heroicons'

export function normalizeIconPack(pack) {
  const value = (pack || DEFAULT_ICON_PACK).toString().trim().toLowerCase()
  return ICON_PACK_IDS.includes(value) ? value : DEFAULT_ICON_PACK
}

import heroiconsPack from './packs/heroicons.js'
import type { IconPackId } from '@acme/theme-engine'

export const ICON_PACK_IDS: IconPackId[] = ['heroicons', 'lucide', 'phosphor', 'remix', 'futuristic']

export const ICON_PACK_META: Record<IconPackId, { label: string; description: string }> = {
  heroicons: { label: 'Heroicons', description: 'Clean outline (default)' },
  lucide: { label: 'Lucide', description: 'Minimal line icons' },
  phosphor: { label: 'Phosphor', description: 'Rounded modern icons' },
  remix: { label: 'Bold Solid', description: 'Bold filled icons' },
  futuristic: { label: 'Futuristic', description: 'Duotone cyber glow' }
}

export const ICON_PACK_LOADERS: Record<
  IconPackId,
  () => Promise<{ default: typeof heroiconsPack }>
> = {
  heroicons: () => Promise.resolve({ default: heroiconsPack }),
  lucide: () => import('./packs/lucide.js'),
  phosphor: () => import('./packs/phosphor.js'),
  remix: () => import('./packs/remix.js'),
  futuristic: () => import('./packs/futuristic.js')
}

export const DEFAULT_ICON_PACK: IconPackId = 'heroicons'

export function normalizeIconPack(pack?: string): IconPackId {
  const value = (pack || DEFAULT_ICON_PACK).toString().trim().toLowerCase()
  return ICON_PACK_IDS.includes(value as IconPackId) ? (value as IconPackId) : DEFAULT_ICON_PACK
}

export function getIconPackOptions() {
  return ICON_PACK_IDS.map((id) => ({
    id,
    label: ICON_PACK_META[id]?.label || id,
    description: ICON_PACK_META[id]?.description || ''
  }))
}

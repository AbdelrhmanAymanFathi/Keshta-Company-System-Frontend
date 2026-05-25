import { ref, shallowRef, type Component } from 'vue'
import type { IconPackDefinition, NormalizedTheme, ThemePlugin } from '@acme/theme-engine'
import {
  DEFAULT_ICON_PACK,
  ICON_PACK_LOADERS,
  normalizeIconPack,
  getIconPackOptions,
  ICON_PACK_META,
  ICON_PACK_IDS
} from './registry'
import { resolveMenuIconKey } from './semantic.js'

export { resolveMenuIconKey } from './semantic.js'

export const ICON_REVISION_KEY = Symbol('themeIconRevision')
export const iconRevision = ref(0)

const activePackId = ref(DEFAULT_ICON_PACK)
const activePack = shallowRef<IconPackDefinition | null>(null)

export function getActiveIconPackId() {
  return activePackId.value
}

export function getActiveIconPack() {
  return activePack.value
}

export function getThemeIcon(name?: string): Component | null {
  if (!name) return activePack.value?.icons?.default ?? null
  return activePack.value?.icons?.[name] ?? activePack.value?.icons?.default ?? null
}

export function getMenuIcon(menuName: string) {
  return getThemeIcon(resolveMenuIconKey(menuName))
}

export async function setIconPack(packId?: string) {
  const normalized = normalizeIconPack(packId)
  const loader = ICON_PACK_LOADERS[normalized] || ICON_PACK_LOADERS[DEFAULT_ICON_PACK]
  const mod = await loader()
  const pack = (mod.default || mod) as IconPackDefinition

  activePack.value = pack
  activePackId.value = normalized
  iconRevision.value += 1

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.iconPack = normalized
    document.documentElement.style.setProperty('--theme-icon-stroke', String(pack.strokeWidth ?? 1.5))
    document.documentElement.dataset.iconStyle = pack.style || 'outline'
  }

  return pack
}

export async function initThemeIcons(packId = DEFAULT_ICON_PACK) {
  return setIconPack(packId)
}

export const iconPlugin: ThemePlugin = {
  name: 'icon-packs',
  install() {
    void initThemeIcons(DEFAULT_ICON_PACK)
  },
  async apply(theme: NormalizedTheme) {
    await setIconPack(theme.iconPack)
  }
}

export {
  ICON_PACK_IDS,
  ICON_PACK_META,
  DEFAULT_ICON_PACK,
  normalizeIconPack,
  getIconPackOptions
}

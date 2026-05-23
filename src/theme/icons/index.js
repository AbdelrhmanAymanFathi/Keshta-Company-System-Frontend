import { ref, shallowRef } from 'vue'
import heroiconsPack from '../icon-packs/heroicons'
import {
  DEFAULT_ICON_PACK,
  ICON_PACK_IDS,
  ICON_PACK_LOADERS,
  ICON_PACK_META,
  normalizeIconPack
} from './registry'
import { resolveMenuIconKey } from './semantic'

export const ICON_REVISION_KEY = Symbol('themeIconRevision')

/** Bumped when icon pack changes — reactive consumers re-render */
export const iconRevision = ref(0)

const activePackId = ref(DEFAULT_ICON_PACK)
const activePack = shallowRef(heroiconsPack)

export function getActiveIconPackId() {
  return activePackId.value
}

export function getActiveIconPack() {
  return activePack.value
}

export function getThemeIcon(name) {
  if (!name) return activePack.value?.icons?.default ?? null
  return activePack.value?.icons?.[name] ?? activePack.value?.icons?.default ?? null
}

export function getMenuIcon(menuName) {
  return getThemeIcon(resolveMenuIconKey(menuName))
}

export async function setIconPack(packId) {
  const normalized = normalizeIconPack(packId)
  const loader = ICON_PACK_LOADERS[normalized] || ICON_PACK_LOADERS[DEFAULT_ICON_PACK]
  const mod = await loader()
  const pack = mod.default || mod

  activePack.value = pack
  activePackId.value = normalized
  iconRevision.value += 1

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.iconPack = normalized
    document.documentElement.style.setProperty(
      '--theme-icon-stroke',
      String(pack.strokeWidth ?? 1.5)
    )
    document.documentElement.dataset.iconStyle = pack.style || 'outline'
  }

  return pack
}

export async function initThemeIcons(packId = DEFAULT_ICON_PACK) {
  return setIconPack(packId)
}

export function getIconPackOptions() {
  return ICON_PACK_IDS.map((id) => ({
    id,
    label: ICON_PACK_META[id]?.label || id,
    description: ICON_PACK_META[id]?.description || ''
  }))
}

export { ICON_PACK_IDS, ICON_PACK_META, DEFAULT_ICON_PACK, normalizeIconPack, resolveMenuIconKey }

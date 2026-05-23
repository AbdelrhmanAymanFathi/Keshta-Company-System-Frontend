import { markRaw } from 'vue'

/**
 * @param {{ id: string, label: string, style: string, strokeWidth?: number, icons: Record<string, import('vue').Component> }} config
 */
export function createIconPack({ id, label, style, strokeWidth = 1.5, icons }) {
  const normalized = {}
  Object.entries(icons).forEach(([key, component]) => {
    if (component) normalized[key] = markRaw(component)
  })
  if (!normalized.default && normalized.clipboard) {
    normalized.default = normalized.clipboard
  }
  return {
    id,
    label,
    style,
    strokeWidth,
    icons: normalized
  }
}

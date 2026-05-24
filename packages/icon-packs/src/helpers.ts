import { markRaw, type Component } from 'vue'
import type { IconPackDefinition } from '@acme/theme-engine'

export function createIconPack(config: {
  id: IconPackDefinition['id']
  label: string
  style: IconPackDefinition['style']
  strokeWidth?: number
  icons: Record<string, Component>
}): IconPackDefinition {
  const normalized: Record<string, Component> = {}
  Object.entries(config.icons).forEach(([key, component]) => {
    if (component) normalized[key] = markRaw(component)
  })
  if (!normalized.default && normalized.clipboard) {
    normalized.default = normalized.clipboard
  }
  return {
    id: config.id,
    label: config.label,
    style: config.style,
    strokeWidth: config.strokeWidth ?? 1.5,
    icons: normalized
  }
}

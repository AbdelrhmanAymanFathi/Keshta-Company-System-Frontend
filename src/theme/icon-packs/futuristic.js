import { defineComponent, h } from 'vue'
import phosphorPack from './phosphor'
import { createIconPack } from './_helpers'

function glowIcon(PhosphorComponent, name) {
  return defineComponent({
    name: `Futuristic${name}`,
    inheritAttrs: true,
    setup(_, { attrs }) {
      return () =>
        h(PhosphorComponent, {
          ...attrs,
          weight: 'duotone',
          class: ['theme-icon-futuristic', attrs.class]
        })
    }
  })
}

const futuristicIcons = {}
Object.entries(phosphorPack.icons).forEach(([key, component]) => {
  futuristicIcons[key] = glowIcon(component, key)
})

export default createIconPack({
  id: 'futuristic',
  label: 'Futuristic',
  style: 'duotone',
  strokeWidth: 0,
  icons: futuristicIcons
})

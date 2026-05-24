import { computed, defineComponent, h, inject } from 'vue'
import { getThemeIcon, ICON_REVISION_KEY, iconRevision } from './resolver'

export const ThemeIcon = defineComponent({
  name: 'ThemeIcon',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props, { attrs }) {
    const revision = inject(ICON_REVISION_KEY, iconRevision)
    const icon = computed(() => {
      void revision.value
      return getThemeIcon(props.name)
    })

    return () => {
      const Icon = icon.value
      if (!Icon) return null
      const classes = ['theme-icon', attrs.class].filter(Boolean)
      return h(Icon, { ...attrs, class: classes.length ? classes : undefined })
    }
  }
})

export default ThemeIcon

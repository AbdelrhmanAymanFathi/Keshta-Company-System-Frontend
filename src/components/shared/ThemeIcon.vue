<template>
  <component :is="iconComponent" v-if="iconComponent" v-bind="$attrs" :class="iconClasses" />
</template>

<script>
import { computed, inject } from 'vue'
import { getThemeIcon, ICON_REVISION_KEY } from '@/theme/icons'

export default {
  name: 'ThemeIcon',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props, { attrs }) {
    const revision = inject(ICON_REVISION_KEY, null)

    const iconComponent = computed(() => {
      if (revision) void revision.value
      return getThemeIcon(props.name)
    })

    const iconClasses = computed(() => ['theme-icon', attrs.class].filter(Boolean))

    return { iconComponent, iconClasses }
  }
}
</script>

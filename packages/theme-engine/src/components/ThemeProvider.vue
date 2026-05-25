<script setup lang="ts">
import { provide, onMounted } from 'vue'
import type { ThemeDefinition, ThemePlugin } from '../types'
import { themeEngine } from '../engine'
import { THEME_REVISION_KEY, themeRevision } from '../store'

const props = withDefaults(
  defineProps<{
    plugins?: ThemePlugin[]
    initialTheme?: ThemeDefinition
    storageKey?: string
    hydrate?: boolean
  }>(),
  { hydrate: true }
)

if (props.storageKey) {
  Object.assign(themeEngine, { persistence: undefined })
}

props.plugins?.forEach((plugin) => themeEngine.use(plugin))

provide(THEME_REVISION_KEY, themeRevision)

onMounted(async () => {
  if (props.initialTheme) {
    await themeEngine.applyTheme(props.initialTheme)
  } else if (props.hydrate !== false) {
    themeEngine.hydrate()
  }
})
</script>

<template>
  <slot />
</template>

<script setup>
import { TabsContent } from 'reka-ui'
import { cn } from 'cn'
const props = defineProps({
  value: { type: String, required: true },
  class: { type: [Boolean, null, String, Object, Array], required: false, skipCheck: true }
})
</script>
<template>
  <TabsContent
    :value="value"
    data-slot="tabs-content"
    :class="cn('flex-1 outline-none', props.class)"
  >
    <slot />
  </TabsContent>
</template>

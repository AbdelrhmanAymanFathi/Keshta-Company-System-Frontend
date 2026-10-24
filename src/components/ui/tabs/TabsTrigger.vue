<script setup>
import { TabsTrigger } from 'reka-ui'
import { cn } from 'cn'
const props = defineProps({
  value: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  class: { type: [Boolean, null, String, Object, Array], required: false, skipCheck: true }
})
</script>
<template>
  <TabsTrigger
    :value="value"
    :disabled="disabled"
    data-slot="tabs-trigger"
    :class="cn(
      'data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
      props.class
    )"
  >
    <slot />
  </TabsTrigger>
</template>

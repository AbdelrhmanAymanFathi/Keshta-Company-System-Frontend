<script setup>
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent, TooltipArrow } from 'reka-ui'
import { cn } from 'cn'

const props = defineProps({
  content: { type: String, default: '' },
  side: { type: String, default: 'top' },
  align: { type: String, default: 'center' },
  sideOffset: { type: Number, default: 4 },
  delayDuration: { type: Number, default: 700 },
  class: { type: [Boolean, null, String, Object, Array], required: false, skipCheck: true }
})
</script>

<template>
  <TooltipProvider :delay-duration="delayDuration">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipContent
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        :class="cn(
          'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[var(--layout-z-popover,220)] overflow-hidden rounded-md border px-3 py-1.5 text-xs shadow-md',
          props.class
        )"
      >
        <slot name="content">{{ content }}</slot>
        <TooltipArrow class="fill-popover" />
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
</template>

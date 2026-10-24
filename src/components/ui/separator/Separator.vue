<script setup>
import { cn } from 'cn'

const props = defineProps({
  class: { type: [Boolean, null, String, Object, Array], required: false, skipCheck: true },
  orientation: { type: String, default: 'horizontal' },
  decorative: { type: Boolean, default: true }
})
</script>

<template>
  <div
    data-slot="separator"
    role="separator"
    :aria-orientation="decorative ? undefined : orientation"
    :aria-hidden="decorative"
    :class="cn(
      'bg-border shrink-0',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      props.class
    )"
  />
</template>

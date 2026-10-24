<script setup>
import { TabsRoot, TabsList, TabsTrigger, TabsContent, TabsIndicator } from 'reka-ui'
import { cn } from 'cn'

const props = defineProps({
  modelValue: { type: String, default: undefined },
  defaultValue: { type: String, default: undefined },
  orientation: { type: String, default: 'horizontal' },
  class: { type: [Boolean, null, String, Object, Array], required: false, skipCheck: true }
})
const emits = defineEmits(['update:modelValue'])
</script>
<template>
  <TabsRoot
    :model-value="modelValue"
    :default-value="defaultValue"
    :orientation="orientation"
    data-slot="tabs"
    :class="cn('flex flex-col gap-2', props.class)"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <slot />
  </TabsRoot>
</template>

<script setup>
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { cn } from 'cn'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  checked: { type: Boolean, default: undefined },
  defaultChecked: { type: Boolean, default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  name: { type: String, default: undefined },
  id: { type: String, default: undefined },
  class: { type: [Boolean, null, String, Object, Array], required: false, skipCheck: true }
})

const emits = defineEmits(['update:modelValue', 'update:checked'])

import { computed } from 'vue'

const checkedValue = computed(() => {
  if (props.checked !== undefined) return props.checked
  return props.modelValue
})

function handleUpdate(value) {
  emits('update:modelValue', value)
  emits('update:checked', value)
}
</script>

<template>
  <SwitchRoot
    v-bind="{ id, name, disabled, required }"
    dir="ltr"
    :model-value="checkedValue"
    :default-value="defaultChecked"
    data-slot="switch"
    :class="cn(
      'peer focus-visible:border-ring focus-visible:ring-ring/50 dark:focus-visible:ring-ring/50 inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
      props.class
    )"
    @update:model-value="handleUpdate"
  >
    <SwitchThumb
      :class="cn(
        'pointer-events-none block size-6 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )"
    />
  </SwitchRoot>
</template>

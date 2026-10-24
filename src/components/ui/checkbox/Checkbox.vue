<script setup>
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'
import { cn } from 'cn'

const props = defineProps({
  modelValue: { type: [Boolean, String], default: false },
  checked: { type: [Boolean, String], default: undefined },
  defaultChecked: { type: Boolean, default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  name: { type: String, default: undefined },
  value: { type: String, default: undefined },
  id: { type: String, default: undefined },
  class: { type: [Boolean, null, String, Object, Array], required: false, skipCheck: true }
})

const emits = defineEmits(['update:modelValue', 'update:checked'])

function handleUpdate(value) {
  emits('update:modelValue', value)
  emits('update:checked', value)
}

const checkedValue = computed(() => {
  if (props.checked !== undefined) return props.checked
  return props.modelValue
})

import { computed } from 'vue'
</script>

<template>
  <CheckboxRoot
    v-bind="{ id, name, value, disabled, required }"
    :checked="checkedValue"
    :default-checked="defaultChecked"
    data-slot="checkbox"
    :class="cn(
      'peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
    @update:checked="handleUpdate"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current transition-none">
      <svg class="size-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

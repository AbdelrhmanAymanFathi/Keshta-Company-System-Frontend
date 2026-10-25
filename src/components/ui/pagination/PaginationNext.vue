<script setup>
import { ChevronRight as PhCaretRight } from '@lucide/vue'
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { PaginationNext, useForwardProps } from "reka-ui";
import { buttonVariants } from '@/components/ui/button';

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  size: { type: null, required: false, default: "default" },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});

const delegatedProps = reactiveOmit(props, "class", "size");
const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <PaginationNext
    data-slot="pagination-next"
    :class="
      cn(buttonVariants({ variant: 'ghost', size }), 'pe-1.5!', props.class)
    "
    v-bind="forwarded"
  >
    <slot>
      <span class="hidden sm:block">Next</span>
      <PhCaretRight data-icon="inline-end" class="rtl:rotate-180" />
    </slot>
  </PaginationNext>
</template>

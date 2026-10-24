<script setup>
import { PhCaretLeft } from '@phosphor-icons/vue';
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { PaginationPrev, useForwardProps } from "reka-ui";
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
  <PaginationPrev
    data-slot="pagination-previous"
    :class="
      cn(buttonVariants({ variant: 'ghost', size }), 'ps-1.5!', props.class)
    "
    v-bind="forwarded"
  >
    <slot>
      <PhCaretLeft data-icon="inline-start" class="rtl:rotate-180" />
      <span class="hidden sm:block">Previous</span>
    </slot>
  </PaginationPrev>
</template>

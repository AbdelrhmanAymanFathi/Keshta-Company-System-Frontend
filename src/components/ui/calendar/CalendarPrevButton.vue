<script setup>
import { ChevronLeft as PhCaretLeft } from '@lucide/vue'
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { CalendarPrev, useForwardProps } from "reka-ui";
import { buttonVariants } from '@/components/ui/button';

const props = defineProps({
  prevPage: { type: Function, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <CalendarPrev
    data-slot="calendar-prev-button"
    :class="
      cn(
        buttonVariants({ variant: 'outline' }),
        'pointer-events-auto size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot>
      <PhCaretLeft class="rtl:rotate-180 size-4" />
    </slot>
  </CalendarPrev>
</template>

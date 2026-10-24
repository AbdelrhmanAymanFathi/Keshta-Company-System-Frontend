<template>
  <ShadcnButton variant="outline" size="native"
    type="button"
    class="-mx-1 inline-flex items-center gap-1 rounded px-1 text-inherit transition-colors hover:text-indigo-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"
    :title="title"
    @click="$emit('toggle')"
  >
    <slot />
    <SortIcon :active="active" :dir="dir" />
  </ShadcnButton>
</template>

<script>
import SortIcon from '@/components/shared/SortIcon.vue'

export default {
  name: 'SortableDateHeader',
  components: { SortIcon },
  props: {
    active: { type: Boolean, default: false },
    dir: { type: String, default: 'asc' },
    title: { type: String, default: '' }
  },
  emits: ['toggle']
}
</script>

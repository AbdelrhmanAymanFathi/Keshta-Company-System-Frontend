<template>
  <!-- Wraps shadcn Badge with approval status variants -->
  <Badge :variant="variant" :class="badgeClass">
    <slot>{{ label }}</slot>
  </Badge>
</template>

<script>
import { Badge } from '@/components/ui/badge'
import { computed } from 'vue'

export default {
  name: 'StatusBadge',
  components: { Badge },
  props: {
    /**
     * status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive'
     * or pass any custom string that maps to a style
     */
    status: { type: String, default: 'approved' },
    label: { type: String, default: '' }
  },
  setup(props) {
    const variant = computed(() => {
      switch (props.status) {
        case 'pending': return 'outline'
        case 'rejected': return 'destructive'
        case 'approved': return 'secondary'
        case 'active': return 'secondary'
        case 'inactive': return 'outline'
        default: return 'secondary'
      }
    })

    const badgeClass = computed(() => {
      switch (props.status) {
        case 'pending':
          return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
        case 'approved':
        case 'active':
          return 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
        case 'rejected':
        case 'inactive':
          return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
        default:
          return ''
      }
    })

    return { variant, badgeClass }
  }
}
</script>

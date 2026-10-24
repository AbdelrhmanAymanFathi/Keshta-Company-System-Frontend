<template>
  <ShadcnBadge :variant="shadcnVariant" :class="['shadcn-ui', variantClasses]" :style="variantStyle">
    <slot />
  </ShadcnBadge>
</template>

<script>
import { Badge as ShadcnBadge } from '@/components/ui/badge'

export default {
  name: 'BadgeComponent',
  components: { ShadcnBadge },
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'success', 'warning', 'danger', 'info', 'company', 'external'].includes(value)
    }
  },
  computed: {
    shadcnVariant() {
      return this.variant === 'danger' ? 'destructive' : this.variant === 'info' ? 'outline' : 'secondary'
    },
    variantClasses() {
      const variants = {
        default: 'rounded-full border-transparent bg-gray-100',
        success: 'rounded-full border-transparent bg-green-100 text-green-800 hover:bg-green-100',
        warning: 'rounded-full border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        danger: 'rounded-full border-transparent bg-red-100 text-red-800 hover:bg-red-100',
        info: 'rounded-full border-transparent',
        company: 'rounded-full border-transparent bg-green-100 text-green-800 hover:bg-green-100',
        external: 'rounded-full border-transparent bg-gray-200'
      }
      return variants[this.variant] || variants.default
    },
    variantStyle() {
      if (this.variant === 'info') {
        return {
          backgroundColor: 'rgba(var(--theme-primary-rgb), 0.12)',
          color: 'rgb(var(--theme-primary-800))'
        }
      }
      if (this.variant === 'default') return { color: 'var(--theme-text-primary)' }
      if (this.variant === 'external') return { color: 'var(--theme-text-secondary)' }
      return {}
    }
  }
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses
    ]"
  >
    <slot />
  </span>
</template>

<script>
export default {
  name: 'BadgeComponent',
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'success', 'warning', 'danger', 'info', 'company', 'external'].includes(value)
    }
  },
  computed: {
    variantClasses() {
      const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        company: 'bg-green-100 text-green-800',
        external: 'bg-gray-200 text-gray-700'
      }
      return variants[this.variant] || variants.default
    }
  }
}
</script>


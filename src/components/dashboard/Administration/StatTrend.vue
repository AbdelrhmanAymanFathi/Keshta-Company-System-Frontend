<template>
  <span
    v-if="value !== null && value !== undefined"
    class="inline-flex items-center gap-0.5 text-xs font-medium"
    :class="trendClass"
  >
    <svg
      v-if="direction === 'up'"
      class="w-3 h-3"
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
    </svg>
    <svg
      v-else-if="direction === 'down'"
      class="w-3 h-3"
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
    </svg>
    {{ formatted }}
  </span>
</template>

<script>
export default {
  name: 'StatTrend',
  props: {
    value: { type: Number, default: null },
    direction: { type: String, default: 'up' },
    locale: { type: String, default: 'en-US' },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '%' },
    invert: { type: Boolean, default: false }
  },
  computed: {
    formatted() {
      if (this.value == null) return ''
      const abs = Math.abs(this.value)
      const loc = this.locale || 'en-US'
      try {
        const formatted = new Intl.NumberFormat(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(abs)
        return `${this.prefix}${formatted}${this.suffix}`
      } catch {
        return `${this.prefix}${abs.toFixed(1)}${this.suffix}`
      }
    },
    trendClass() {
      if (this.value == null) return ''
      const isPositive = this.value >= 0
      const isGood = this.invert ? !isPositive : isPositive
      if (isGood) return 'text-emerald-600'
      return 'text-red-500'
    }
  }
}
</script>

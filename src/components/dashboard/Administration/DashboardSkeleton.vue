<template>
  <div class="animate-pulse space-y-3">
    <div
      v-for="i in lines"
      :key="i"
      class="h-4 rounded bg-slate-200"
      :style="{ width: widths[i % widths.length] }"
    />
  </div>
</template>

<script>
export default {
  name: 'DashboardSkeleton',
  props: {
    lines: { type: Number, default: 3 }
  },
  data() {
    return {
      widths: ['60%', '80%', '45%', '70%', '55%', '90%']
    }
  }
}
</script>

<template>
  <div
    class="grid gap-4"
    :class="colsClass"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'DashboardGrid',
  props: {
    cols: { type: Number, default: 3 }
  },
  computed: {
    colsClass() {
      if (this.cols === 1) return 'grid-cols-1'
      if (this.cols === 2) return 'grid-cols-1 sm:grid-cols-2'
      if (this.cols === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      if (this.cols === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      if (this.cols === 5) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      if (this.cols === 6) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6'
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }
  }
}
</script>

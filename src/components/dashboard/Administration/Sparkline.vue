<template>
  <div class="sparkline-wrapper" :style="{ width: width + 'px', height: height + 'px' }">
    <apexchart
      v-if="hasData"
      :key="refreshKey"
      :type="type"
      :height="height"
      :width="width"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'DashboardSparkline',
  components: { apexchart: VueApexCharts },
  props: {
    data: { type: Array, default: () => [] },
    color: { type: String, default: '#6366f1' },
    height: { type: Number, default: 50 },
    width: { type: Number, default: 120 },
    type: { type: String, default: 'line' }
  },
  emits: ['data-dblclick', 'contextmenu'],
  data() {
    return {
      refreshKey: 0
    }
  },
  computed: {
    hasData() {
      return this.data && this.data.length > 0
    },
    chartSeries() {
      return [{ name: '', data: this.data }]
    },
    chartOptions() {
      return {
        chart: {
          type: this.type,
          sparkline: { enabled: true },
          toolbar: { show: false },
          animations: { enabled: false }
        },
        stroke: { curve: 'smooth', width: 1.5, colors: [this.color] },
        fill: { opacity: 0 },
        markers: { size: 0 },
        colors: [this.color],
        tooltip: { enabled: false },
        grid: { show: false },
        xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { show: false }
      }
    }
  },
  watch: {
    data: {
      handler() { this.refreshKey++ },
      deep: true
    }
  }
}
</script>

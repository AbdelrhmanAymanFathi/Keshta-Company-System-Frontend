<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40">
    <div v-if="loading || !mounted" class="animate-pulse space-y-4">
      <div class="h-4 w-32 rounded bg-slate-200" />
      <div class="mx-auto h-40 w-40 rounded-full bg-slate-200" />
      <div class="mx-auto h-3 w-20 rounded bg-slate-200" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center py-8">
      <DashboardError :message="error" @retry="$emit('retry')" />
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-sm font-medium theme-text-secondary">{{ title }}</p>
          <p v-if="subtitle" class="text-xs theme-text-muted mt-0.5">{{ subtitle }}</p>
        </div>
        <span v-if="badge" class="rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="badgeClass">{{ badge }}</span>
      </div>

      <div>
        <apexchart
          type="radialBar"
          :height="gaugeHeight"
          :options="chartOptions"
          :series="series"
        />
      </div>

      <p v-if="footerLabel" class="text-center text-xs theme-text-muted mt-2">{{ footerLabel }}</p>
    </template>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import DashboardError from './DashboardError.vue'

export default {
  name: 'GaugeCard',
  components: { apexchart: VueApexCharts, DashboardError },
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    value: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    color: { type: String, default: '#6366f1' },
    type: { type: String, default: 'radial' },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    badge: { type: String, default: '' },
    badgeColor: { type: String, default: 'emerald' },
    footerLabel: { type: String, default: '' },
    label: { type: String, default: '' },
    formatter: { type: Function, default: null }
  },
  emits: ['retry'],
  data() {
    return { mounted: false }
  },
  mounted() {
    this.mounted = true
  },
  computed: {
    gaugeHeight() {
      return this.type === 'semi-circle' ? 180 : 220
    },
    normalizedValue() {
      const v = Math.max(this.min, Math.min(this.max, this.value))
      return ((v - this.min) / (this.max - this.min)) * 100
    },
    series() {
      return [Math.round(this.normalizedValue)]
    },
    chartOptions() {
      const isSemi = this.type === 'semi-circle'
      return {
        chart: {
          type: 'radialBar',
          toolbar: { show: false },
          animations: { enabled: true, speed: 800, animateGradually: { enabled: true } }
        },
        colors: [this.color],
        plotOptions: {
          radialBar: {
            startAngle: isSemi ? -90 : 0,
            endAngle: isSemi ? 90 : 360,
            hollow: { margin: 15, size: '60%' },
            track: { background: '#e2e8f0', strokeWidth: '97%' },
            dataLabels: {
              show: true,
              name: { show: true, fontSize: '13px', color: '#64748b', offsetY: isSemi ? 30 : -10 },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 600,
                color: '#1e293b',
                offsetY: isSemi ? 0 : 6,
                formatter: this.formatter || (v => {
                  const raw = (this.value / (this.max || 1)) * 100
                  return raw.toFixed(1) + '%'
                })
              }
            }
          }
        },
        stroke: { lineCap: 'round' },
        labels: [this.label || ''],
        tooltip: { enabled: true, y: { formatter: v => this.value.toLocaleString() } }
      }
    },
    badgeClass() {
      const map = {
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        rose: 'bg-rose-100 text-rose-700',
        blue: 'bg-blue-100 text-blue-700',
        slate: 'bg-slate-100 text-slate-600',
        indigo: 'bg-indigo-100 text-indigo-700'
      }
      return map[this.badgeColor] || map.emerald
    }
  }
}
</script>

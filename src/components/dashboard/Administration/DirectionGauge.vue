<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40 h-full">
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-4 w-32 rounded bg-slate-200" />
      <div class="mx-auto h-36 w-36 rounded-full bg-slate-200" />
      <div class="mx-auto h-3 w-20 rounded bg-slate-200" />
    </div>

    <DashboardEmpty v-else-if="empty" :message="emptyMessage" />

    <template v-else>
      <div class="flex items-start justify-between mb-1">
        <div class="min-w-0">
          <h3 class="text-base font-semibold theme-text-primary truncate">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs theme-text-muted mt-0.5">{{ subtitle }}</p>
        </div>
        <span v-if="badge" class="rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0"
          :class="badgeClass">{{ badge }}</span>
      </div>

      <div>
        <apexchart
          type="radialBar"
          height="230"
          :options="chartOptions"
          :series="series"
        />
      </div>

      <div v-if="hasStats" class="mt-3 grid grid-cols-2 gap-2">
        <div v-for="s in stats" :key="s.label"
          class="rounded-lg bg-slate-50 px-3 py-2 text-center border border-slate-100">
          <div class="text-[11px] theme-text-muted truncate">{{ s.label }}</div>
          <div class="text-sm font-semibold theme-text-primary">{{ formatStat(s.value) }}</div>
        </div>
      </div>

      <div v-if="legendItems.length" class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-2.5">
        <span v-for="item in legendItems" :key="item.label" class="flex items-center gap-1.5 text-xs theme-text-muted">
          <span class="inline-block h-2.5 w-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
          {{ item.label }}
        </span>
      </div>
    </template>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import DashboardEmpty from './DashboardEmpty.vue'

export default {
  name: 'DirectionGauge',
  components: { apexchart: VueApexCharts, DashboardEmpty },
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    value: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
    empty: { type: Boolean, default: false },
    emptyMessage: { type: String, default: '' },
    // Label shown under the value, e.g. "Net" or "Change"
    label: { type: String, default: '' },
    // When true, negative values are "good" (green) and positive are "bad" (red)
    invert: { type: Boolean, default: false },
    positiveLabel: { type: String, default: '' },
    negativeLabel: { type: String, default: '' },
    neutralLabel: { type: String, default: '' },
    locale: { type: String, default: 'en-US' },
    stats: { type: Array, default: () => [] }
  },
  computed: {
    hasStats() {
      return (this.stats || []).length > 0
    },
    positiveColor() {
      return this.invert ? '#f87171' : '#4ade80'
    },
    negativeColor() {
      return this.invert ? '#4ade80' : '#f87171'
    },
    neutralColor() {
      return '#fbbf24'
    },
    legendItems() {
      const items = []
      if (this.positiveLabel) items.push({ color: this.positiveColor, label: this.positiveLabel })
      if (this.negativeLabel) items.push({ color: this.negativeColor, label: this.negativeLabel })
      if (this.neutralLabel) items.push({ color: this.neutralColor, label: this.neutralLabel })
      return items
    },
    safeValue() {
      const v = Number(this.value)
      return Number.isFinite(v) ? v : 0
    },
    domainMax() {
      return this.niceCeil(Math.max(Math.abs(this.safeValue), 1))
    },
    threshold() {
      return this.domainMax * 0.1
    },
    isGood() {
      return this.invert ? this.safeValue < -this.threshold : this.safeValue > this.threshold
    },
    isBad() {
      return this.invert ? this.safeValue > this.threshold : this.safeValue < -this.threshold
    },
    color() {
      if (this.isGood) return '#10b981'
      if (this.isBad) return '#ef4444'
      return '#eab308'
    },
    needleColor() {
      if (this.isGood) return '#059669'
      if (this.isBad) return '#dc2626'
      return '#94a3b8'
    },
    badge() {
      if (this.isGood) return this.positiveLabel || ''
      if (this.isBad) return this.negativeLabel || ''
      return this.neutralLabel || ''
    },
    badgeClass() {
      if (this.isGood) return 'bg-emerald-100 text-emerald-700'
      if (this.isBad) return 'bg-rose-100 text-rose-700'
      return 'bg-amber-100 text-amber-700'
    },
    series() {
      return [this.safeValue]
    },
    chartOptions() {
      return {
        chart: {
          type: 'radialBar',
          toolbar: { show: false },
          animations: { enabled: true, speed: 600 }
        },
        colors: [this.color],
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            min: -this.domainMax,
            max: this.domainMax,
            shape: 'needle',
            hollow: { margin: 14, size: '52%' },
            track: { background: '#f1f5f9', strokeWidth: '100%' },
            bands: [
              { from: -this.domainMax, to: -this.threshold, color: this.negativeColor },
              { from: -this.threshold, to: this.threshold, color: this.neutralColor },
              { from: this.threshold, to: this.domainMax, color: this.positiveColor }
            ],
            bandsStyle: { strokeWidth: '92%', linecap: 'round', gap: 1, hideTrackWhenPresent: true },
            ticks: {
              show: true,
              major: { count: 5, width: 2, color: '#64748b', length: 8, placement: 'inside' },
              minor: { count: 2, width: 1, color: '#94a3b8', length: 4 }
            },
            needle: {
              color: this.needleColor,
              length: '72%',
              baseWidth: 6,
              tipWidth: 2,
              showValueArc: true,
              animation: { enabled: true, duration: 600 }
            },
            dataLabels: {
              show: true,
              name: { show: true, fontSize: '12px', fontWeight: 500, color: '#64748b', offsetY: -16 },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 700,
                color: this.color,
                offsetY: 6,
                formatter: v => this.displayFormatter(v)
              }
            }
          }
        },
        labels: [this.label || ''],
        tooltip: { enabled: false }
      }
    }
  },
  methods: {
    niceCeil(v) {
      if (v <= 0) return 1
      const mag = Math.pow(10, Math.floor(Math.log10(v)))
      const norm = v / mag
      const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
      return nice * mag
    },
    displayFormatter(v) {
      const num = Number(v)
      if (!Number.isFinite(num)) return ''
      const formatted = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num)
      const rtl = String(this.$i18n?.locale || '').startsWith('ar')
      return rtl && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    },
    formatStat(v) {
      const num = Number(v)
      if (!Number.isFinite(num)) return '\u2014'
      const formatted = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num)
      const rtl = String(this.$i18n?.locale || '').startsWith('ar')
      return rtl && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    }
  }
}
</script>

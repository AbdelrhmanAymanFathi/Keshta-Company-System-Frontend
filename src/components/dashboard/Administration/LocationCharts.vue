<template>
  <div class="space-y-4">
    <div class="flex items-baseline justify-between gap-3 px-1">
      <div class="min-w-0">
        <h4 class="text-sm font-semibold theme-text-primary">{{ $t('adminStats.locationAnalytics') }}</h4>
        <p class="text-xs theme-text-muted mt-0.5">{{ $t('adminStats.locationAnalyticsDesc') }}</p>
      </div>
    </div>

    <DashboardGrid :cols="2">
      <!-- Stacked bar: composition per location -->
      <ChartCard
        :title="$t('adminStats.locationStacked')"
        :subtitle="$t('adminStats.locationStackedDesc')"
        :loading="loading" :empty="!hasRows" :empty-message="$t('adminStats.noData')"
      >
        <template #chart>
          <apexchart
            :key="'ls-' + rows.length"
            type="bar" :height="barsHeight"
            :options="stackedOptions" :series="perLocationSeries"
          />
        </template>
      </ChartCard>

      <!-- Grouped bar: side-by-side comparison -->
      <ChartCard
        :title="$t('adminStats.locationGrouped')"
        :subtitle="$t('adminStats.locationGroupedDesc')"
        :loading="loading" :empty="!hasRows" :empty-message="$t('adminStats.noData')"
      >
        <template #chart>
          <apexchart
            :key="'lg-' + rows.length"
            type="bar" :height="barsHeight"
            :options="groupedOptions" :series="perLocationSeries"
          />
        </template>
      </ChartCard>

      <!-- Donut: category share -->
      <ChartCard
        :title="$t('adminStats.locationShare')"
        :subtitle="$t('adminStats.locationShareDesc')"
        :loading="loading" :empty="!hasTotals" :empty-message="$t('adminStats.noData')"
      >
        <template #chart>
          <apexchart
            :key="'ld-' + donutSeries.join('-')"
            type="donut" :height="330"
            :options="donutOptions" :series="donutSeries"
          />
        </template>
      </ChartCard>

      <!-- Horizontal bar: top locations by total -->
      <ChartCard
        :title="$t('adminStats.topLocations')"
        :subtitle="$t('adminStats.topLocationsDesc')"
        :loading="loading" :empty="!hasRows" :empty-message="$t('adminStats.noData')"
      >
        <template #chart>
          <apexchart
            :key="'lt-' + topRows.length"
            type="bar" :height="topHeight"
            :options="topOptions" :series="topSeries"
          />
        </template>
      </ChartCard>
    </DashboardGrid>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import ChartCard from './ChartCard.vue'
import DashboardGrid from './DashboardGrid.vue'
import { getShadcnChartColors, shadcnChartBorderColor, shadcnChartTextColor } from '@/utils/shadcnChartTheme'

const CATEGORIES = [
  { key: 'supplies' },
  { key: 'transports' },
  { key: 'expenses' },
  { key: 'extracts' },
  { key: 'payments' }
]

const TOP_LIMIT = 10

export default {
  name: 'LocationCharts',
  components: { apexchart: VueApexCharts, ChartCard, DashboardGrid },
  props: {
    rows: { type: Array, default: () => [] },
    totals: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false }
  },
  computed: {
    isRTL() { return this.$i18n?.locale === 'ar' },
    categoryMeta() {
      return CATEGORIES.map((c, index) => ({
        ...c,
        color: getShadcnChartColors(CATEGORIES.length)[index],
        label: this.catLabel(c.key)
      }))
    },
    colors() {
      return this.categoryMeta.map((c) => c.color)
    },
    hasRows() {
      return (this.rows || []).some((r) => this.num(r?.total) > 0)
    },
    hasTotals() {
      return this.categoryMeta.some((c) => this.num(this.totals?.[c.key]?.total) > 0)
    },
    labels() {
      return (this.rows || []).map((r) => this.rowName(r))
    },
    perLocationSeries() {
      return this.categoryMeta.map((c) => ({
        name: c.label,
        data: (this.rows || []).map((r) => this.num(r?.[c.key]?.total))
      }))
    },
    barsHeight() {
      return this.rows.length > 8 ? 400 : 340
    },
    donutSeries() {
      return this.categoryMeta.map((c) => this.num(this.totals?.[c.key]?.total))
    },
    topRows() {
      return [...(this.rows || [])]
        .filter((r) => this.num(r?.total) > 0)
        .sort((a, b) => this.num(b.total) - this.num(a.total))
        .slice(0, TOP_LIMIT)
    },
    topHeight() {
      return Math.max(280, this.topRows.length * 38 + 70)
    },
    topSeries() {
      return [{ name: this.$t('adminStats.total'), data: this.topRows.map((r) => this.num(r.total)) }]
    },
    baseChart() {
      return {
        toolbar: { show: true },
        animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 350 } },
        fontFamily: 'inherit',
        foreColor: shadcnChartTextColor
      }
    },
    sharedXaxis() {
      return {
        categories: this.labels,
        labels: {
          rotate: -45,
          trim: true,
          style: { fontSize: '11px' }
        }
      }
    },
    sharedYaxis() {
      return {
        labels: { formatter: (v) => this.fmt(v) }
      }
    },
    sharedLegend() {
      return {
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '12px',
        markers: { radius: 12 },
        itemMargin: { horizontal: 8, vertical: 2 }
      }
    },
    tooltipBase() {
      return {
        y: { formatter: (v) => this.fmt(v) },
        shared: true,
        intersect: false
      }
    },
    stackedOptions() {
      return {
        chart: { ...this.baseChart, type: 'bar', stacked: true },
        colors: this.colors,
        plotOptions: {
          bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '55%' }
        },
        dataLabels: { enabled: false },
        legend: this.sharedLegend,
        xaxis: this.sharedXaxis,
        yaxis: this.sharedYaxis,
        tooltip: this.tooltipBase,
        fill: {
          type: 'gradient',
          gradient: { shadeIntensity: 1, opacityFrom: 0.95, opacityTo: 0.8, stops: [0, 100] }
        },
        grid: { borderColor: shadcnChartBorderColor, strokeDashArray: 4, padding: { left: 6, right: 6 } },
        responsive: [
          {
            breakpoint: 640,
            options: {
              chart: { height: 300 },
              plotOptions: { bar: { columnWidth: '70%' } },
              legend: { position: 'bottom' },
              xaxis: { labels: { rotate: -90, style: { fontSize: '10px' } } }
            }
          }
        ]
      }
    },
    groupedOptions() {
      return {
        chart: { ...this.baseChart, type: 'bar' },
        colors: this.colors,
        plotOptions: {
          bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '70%' }
        },
        dataLabels: { enabled: false },
        legend: this.sharedLegend,
        xaxis: this.sharedXaxis,
        yaxis: this.sharedYaxis,
        tooltip: this.tooltipBase,
        grid: { borderColor: shadcnChartBorderColor, strokeDashArray: 4, padding: { left: 6, right: 6 } },
        responsive: [
          {
            breakpoint: 640,
            options: {
              chart: { height: 300 },
              plotOptions: { bar: { columnWidth: '80%' } },
              legend: { position: 'bottom' },
              xaxis: { labels: { rotate: -90, style: { fontSize: '10px' } } }
            }
          }
        ]
      }
    },
    donutOptions() {
      return {
        chart: { ...this.baseChart, type: 'donut' },
        labels: this.categoryMeta.map((c) => c.label),
        colors: this.colors,
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '12px',
          markers: { radius: 12 },
          itemMargin: { horizontal: 8, vertical: 2 }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${Number(val).toFixed(1)}%`
        },
        stroke: { width: 2, colors: ['#ffffff'] },
        plotOptions: {
          pie: {
            donut: {
              size: '62%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: this.$t('adminStats.total'),
                  fontSize: '13px',
                  formatter: (w) => this.fmt(
                    (w?.globals?.series || []).reduce((s, v) => s + Number(v || 0), 0)
                  )
                }
              }
            }
          }
        },
        tooltip: {
          y: { formatter: (v) => this.fmt(v) }
        },
        responsive: [
          { breakpoint: 640, options: { chart: { height: 320 }, legend: { position: 'bottom' } } }
        ]
      }
    },
    topOptions() {
      return {
        chart: { ...this.baseChart, type: 'bar' },
        colors: this.colors,
        plotOptions: {
          bar: { borderRadius: 4, borderRadiusApplication: 'end', horizontal: true, barHeight: '62%' }
        },
        dataLabels: {
          enabled: true,
          formatter: (v) => this.fmt(v),
          offsetX: 6,
          style: { fontSize: '11px', fontWeight: 500 }
        },
        legend: { show: false },
        xaxis: { labels: { formatter: (v) => this.fmt(v) } },
        yaxis: {
          labels: {
            style: { fontSize: '11px' },
            formatter: (v) => { const s = String(v ?? ''); return s.length > 16 ? s.slice(0, 16) + '…' : s }
          }
        },
        tooltip: this.tooltipBase,
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4, padding: { left: 6, right: 6 } },
        fill: {
          type: 'gradient',
          gradient: { shadeIntensity: 1, opacityFrom: 0.95, opacityTo: 0.8, stops: [0, 100], gradientToColors: ['#a78bfa'] }
        }
      }
    }
  },
  methods: {
    catLabel(key) {
      const map = {
        supplies: 'adminStats.totalSupplies',
        transports: 'adminStats.totalTransports',
        expenses: 'adminStats.totalExpenses',
        extracts: 'adminStats.totalExtracts',
        payments: 'adminStats.totalPayments'
      }
      return this.$t(map[key] || key)
    },
    rowName(row) {
      if (row?.locationId == null) return this.$t('adminStats.unassignedLocation')
      return row?.locationName || '—'
    },
    num(v) {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    },
    fmt(v) {
      const n = Number(v)
      if (!Number.isFinite(n)) return ''
      const formatted = new Intl.NumberFormat('en-US').format(n)
      return this.isRTL && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    }
  }
}
</script>

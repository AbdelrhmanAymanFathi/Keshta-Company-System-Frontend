<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header -->
    <PageHeader :title="$t('adminStats.title')" :subtitle="$t('adminStats.description')">
      <button @click="refresh" :disabled="loading"
        class="flex items-center gap-1.5 rounded-xl theme-button px-4 py-2 text-sm theme-text-light transition-colors disabled:opacity-50">
        <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ $t('adminStats.refresh') }}
      </button>
    </PageHeader>

    <!-- Date Filter -->
    <DateRangeToolbar
      :start-date="fromDate"
      :end-date="toDate"
      @change="onDateChange"
    />

    <!-- KPI Cards -->
    <DashboardGrid :cols="4">
      <StatisticsCard
        :title="$t('adminStats.totalExpenses')" :value="summary?.expenses?.total"
        icon="chart" color="rose" :loading="loading" :locale="gaugeLocale"
        :error="summary === null && error ? error : ''"
        @click="goTo('report-expenses-report')"
      />
      <StatisticsCard
        :title="$t('adminStats.totalPayments')" :value="summary?.payments?.total"
        icon="currency" color="amber" :loading="loading" :locale="gaugeLocale"
        @click="goTo('payments')"
      />
      <StatisticsCard
        :title="$t('adminStats.treasuryBalance')" :value="summary?.treasury?.totalBalance"
        icon="building" color="emerald" :loading="loading" :locale="gaugeLocale"
        @click="goTo('treasury')"
      />
      <StatisticsCard
        :title="$t('adminStats.companyWallet')" :value="summary?.companyWallet?.balance"
        icon="wallet" color="indigo" :loading="loading" :locale="gaugeLocale"
        @click="goTo('report-company-transactions')"
      />
      <StatisticsCard
        :title="$t('adminStats.outstandingContractorBalance')" :value="summary?.contractorWallets?.totalOutstanding"
        icon="users" color="sky" :loading="loading" :locale="gaugeLocale"
        @click="goTo('contractors-list')"
      />
      <StatisticsCard
        :title="$t('adminStats.activeBranches')" :value="summary?.system?.activeBranches"
        icon="building" color="cyan" :loading="loading" :locale="gaugeLocale"
        @click="goTo('locations')"
      />
      <StatisticsCard
        :title="$t('adminStats.activeUsers')" :value="summary?.system?.activeUsers"
        icon="users" color="violet" :loading="loading" :locale="gaugeLocale"
        @click="goTo('users-list')"
      />
      <StatisticsCard
        :title="$t('adminStats.pendingApprovals')" :value="summary?.system?.pendingApprovals"
        icon="clipboard" color="amber" :loading="loading" :locale="gaugeLocale"
        @click="goTo('approvals-inbox')"
      />
    </DashboardGrid>

    <!-- Financial Analytics -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold theme-text-primary px-1">{{ $t('adminStats.financialAnalytics') }}</h3>
      <DashboardGrid :cols="2">
        <ChartCard :title="$t('adminStats.cashFlow')" :subtitle="$t('adminStats.cashFlowDesc')"
          :loading="loading" :empty="!cashFlow?.length" :empty-message="$t('adminStats.noData')">
          <template #chart>
            <apexchart v-if="cashFlow?.length" :key="'cf-' + cashFlow.length" type="area" height="320" :options="cashFlowOptions" :series="cashFlowSeries" />
          </template>
        </ChartCard>
        <ChartCard :title="$t('adminStats.monthlyComparison')" :subtitle="$t('adminStats.monthlyComparisonDesc')"
          :loading="loading" :empty="!monthlyComparison?.length" :empty-message="$t('adminStats.noData')">
          <template #chart>
            <apexchart v-if="monthlyComparison?.length" :key="'mc-' + monthlyComparison.length" type="bar" height="320" :options="monthlyOptions" :series="monthlySeries" />
          </template>
        </ChartCard>
      </DashboardGrid>
      <DashboardGrid :cols="2">
        <ChartCard :title="$t('adminStats.walletTrend')" :subtitle="$t('adminStats.walletTrendDesc')"
          :loading="loading" :empty="!walletTrend?.length" :empty-message="$t('adminStats.noData')">
          <template #chart>
            <apexchart v-if="walletTrend?.length" :key="'wt-' + walletTrend.length" type="area" height="320" :options="walletOptions" :series="walletSeries" />
          </template>
        </ChartCard>
        <ChartCard :title="$t('adminStats.expensesTrend')" :subtitle="$t('adminStats.expensesTrendDesc')"
          :loading="loading" :empty="!expensesTrend?.length" :empty-message="$t('adminStats.noData')">
          <template #chart>
            <apexchart v-if="expensesTrend?.length" :key="'et-' + expensesTrend.length" type="line" height="320" :options="expTrendOptions" :series="expTrendSeries" />
          </template>
        </ChartCard>
      </DashboardGrid>
    </div>

    <!-- Gauges -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold theme-text-primary px-1">{{ $t('adminStats.gauges') }}</h3>
      <DashboardGrid :cols="4">
        <GaugeCard
          :title="$t('adminStats.treasuryHealth')" :subtitle="$t('adminStats.treasuryHealthDesc')"
          :value="treasuryHealthValue" :color="treasuryHealthColor"
          :label="$t('adminStats.health')" :loading="loading" type="semi-circle"
          :badge="treasuryHealthBadge" badge-color="emerald" :locale="gaugeLocale"
        />
        <GaugeCard
          :title="$t('adminStats.budgetConsumption')" :subtitle="$t('adminStats.budgetConsumptionDesc')"
          :value="budgetConsumptionValue" color="#f59e0b"
          :label="$t('adminStats.consumed')" :loading="loading" type="semi-circle"
          :badge="budgetConsumptionBadge" badge-color="amber" :locale="gaugeLocale"
        />
        <GaugeCard
          :title="$t('adminStats.approvalCompletion')" :subtitle="$t('adminStats.approvalCompletionDesc')"
          :value="approvalCompletionValue" color="#8b5cf6"
          :label="$t('adminStats.completed')" :loading="loading" type="radial"
          :badge="approvalCompletionBadge" badge-color="indigo" :locale="gaugeLocale"
        />
        <GaugeCard
          :title="$t('adminStats.cashFlowHealth')" :subtitle="$t('adminStats.cashFlowHealthDesc')"
          :value="cashFlowHealthValue" :color="cashFlowHealthColor"
          :label="$t('adminStats.health')" :loading="loading" type="radial"
          :badge="cashFlowHealthBadge" badge-color="emerald" :locale="gaugeLocale"
        />
      </DashboardGrid>
    </div>

    <!-- Operational Analytics -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold theme-text-primary px-1">{{ $t('adminStats.operationalAnalytics') }}</h3>
      <DashboardGrid :cols="2">
        <ChartCard :title="$t('adminStats.moduleActivity')" :subtitle="$t('adminStats.moduleActivityDesc')"
          :loading="loading" :empty="!moduleActivity?.length" :empty-message="$t('adminStats.noData')">
          <template #chart>
            <apexchart v-if="moduleActivity?.length" :key="'ma-' + moduleActivity.length" type="donut" height="360" :options="moduleOptions" :series="moduleSeries" />
          </template>
        </ChartCard>
        <ChartCard :title="$t('adminStats.expenseClassification')" :subtitle="$t('adminStats.expenseClassificationDesc')"
          :loading="loading" :empty="!expenseClassifications?.length" :empty-message="$t('adminStats.noData')">
          <template #chart>
            <apexchart v-if="expenseClassifications?.length" :key="'ec-' + expenseClassifications.length" type="bar" height="360" :options="classificationOptions" :series="classificationSeries" />
          </template>
        </ChartCard>
      </DashboardGrid>
      <DashboardGrid :cols="2">
        <ChartCard :title="$t('adminStats.topContractors')" :subtitle="$t('adminStats.topContractorsDesc')"
          :loading="loading" :empty="!topContractors?.length" :empty-message="$t('adminStats.noData')">
          <template #chart>
            <apexchart v-if="topContractors?.length" :key="'tc-' + topContractors.length" type="bar" height="360" :options="contractorOptions" :series="contractorSeries" />
          </template>
        </ChartCard>
        <ChartCard :title="$t('adminStats.treasuryDistribution')" :subtitle="$t('adminStats.treasuryDistributionDesc')"
          :loading="loading" :empty="!treasuryOverview?.treasuries?.length" :empty-message="$t('adminStats.noData')">
          <template #chart>
            <apexchart v-if="treasuryOverview?.treasuries?.length" :key="'td-' + (treasuryOverview?.treasuries?.length || 0)" type="bar" height="360" :options="treasuryDistOptions" :series="treasuryDistSeries" />
          </template>
        </ChartCard>
      </DashboardGrid>
    </div>

    <!-- Recent Activity -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold theme-text-primary px-1">{{ $t('adminStats.recentActivity') }}</h3>
      <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
        <div v-if="loading" class="p-6">
          <DashboardSkeleton :lines="6" />
        </div>
        <DashboardEmpty v-else-if="!recentActivity?.length" :message="$t('adminStats.noTransactions')" />
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="theme-table-thead-gradient">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider"
                    :class="isRTL ? 'text-right' : 'text-left'">{{ $t('adminStats.txDate') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider"
                    :class="isRTL ? 'text-right' : 'text-left'">{{ $t('adminStats.txDescription') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider"
                    :class="isRTL ? 'text-right' : 'text-left'">{{ $t('adminStats.txModule') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider"
                    :class="isRTL ? 'text-right' : 'text-left'">{{ $t('adminStats.txAction') }}</th>
                <th class="px-5 py-3 text-right text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('adminStats.txAmount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="(item, i) in recentActivity" :key="item.id || i"
                  class="theme-table-row-hover transition-colors cursor-pointer" @click="drillDownActivity(item)">
                <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-primary">{{ formatDate(item.date) }}</td>
                <td class="px-5 py-3 text-sm theme-text-secondary max-w-xs truncate">{{ item.description || '—' }}</td>
                <td class="px-5 py-3 whitespace-nowrap">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="moduleBadgeClass(item.module)">{{ item.module }}</span>
                </td>
                <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ item.action }}</td>
                <td class="px-5 py-3 whitespace-nowrap text-sm font-medium text-right"
                    :class="parseFloat(item.amount) > 0 ? 'text-emerald-600' : 'text-red-500'">
                  {{ formatAmount(item.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDashboardData } from '@/composables/useDashboardData'
import { useRealtime } from '@/composables/useRealtime'
import { debounce } from '@/utils/debounce'
import PageHeader from '@/components/shared/PageHeader.vue'
import DateRangeToolbar from './DateRangeToolbar.vue'
import DashboardGrid from './DashboardGrid.vue'
import StatisticsCard from './StatisticsCard.vue'
import ChartCard from './ChartCard.vue'
import GaugeCard from './GaugeCard.vue'
import DashboardSkeleton from './DashboardSkeleton.vue'
import DashboardEmpty from './DashboardEmpty.vue'
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'AdminStatistics',
  components: {
    PageHeader, DateRangeToolbar, DashboardGrid,
    StatisticsCard, ChartCard, GaugeCard,
    DashboardSkeleton, DashboardEmpty,
    apexchart: VueApexCharts
  },
  setup() {
    const dd = useDashboardData()
    useRealtime({
      channel: 'dashboard',
      events: ['statistics_updated'],
      handler: debounce(() => { dd.fetchAll() }, 300),
    })
    return {
      loading: dd.loading,
      error: dd.error,
      summary: dd.summary,
      cashFlow: dd.cashFlow,
      expenseClassifications: dd.expenseClassifications,
      expensesByCategory: dd.expensesByCategory,
      monthlyComparison: dd.monthlyComparison,
      paymentsByType: dd.paymentsByType,
      treasuryOverview: dd.treasuryOverview,
      topContractors: dd.topContractors,
      moduleActivity: dd.moduleActivity,
      petroleumTrend: dd.petroleumTrend,
      walletTrend: dd.walletTrend,
      expensesTrend: dd.expensesTrend,
      approvalStats: dd.approvalStats,
      recentActivity: dd.recentActivity,
      fetchAll: dd.fetchAll
    }
  },
  props: {
    budgetLimit: { type: Number, default: null },
    treasuryMaxBalance: { type: Number, default: null }
  },
  data() {
    return { fromDate: '', toDate: '' }
  },
  computed: {
    isRTL() { return this.$i18n?.locale === 'ar' },
    gaugeLocale() { return 'en-US' },

    // Gauge values
    treasuryHealthValue() {
      const b = this.summary?.treasury?.totalBalance || 0
      const max = Number(this.treasuryMaxBalance) || 10000000
      return Math.min(100, (b / max) * 100)
    },
    treasuryHealthColor() {
      const v = this.treasuryHealthValue
      return v > 60 ? '#10b981' : v > 30 ? '#f59e0b' : '#ef4444'
    },
    treasuryHealthBadge() {
      const v = this.treasuryHealthValue
      return v > 60 ? this.$t('adminStats.good') : v > 30 ? this.$t('adminStats.fair') : this.$t('adminStats.low')
    },
    budgetConsumptionValue() {
      if (!this.summary?.expenses) return 0
      const total = this.summary.expenses.total || 0
      const max = Number(this.budgetLimit) || total * 5
      return max > 0 ? Math.min(100, (total / max) * 100) : 0
    },
    budgetConsumptionBadge() {
      const v = this.budgetConsumptionValue
      return v > 80 ? this.$t('adminStats.high') : v > 50 ? this.$t('adminStats.medium') : this.$t('adminStats.low')
    },
    approvalCompletionValue() {
      const s = this.approvalStats
      if (!s) return 0
      const total = (s.approved || 0) + (s.rejected || 0) + (s.pending || 0)
      return total > 0 ? Math.round(((s.approved || 0) / total) * 100) : 0
    },
    approvalCompletionBadge() {
      const v = this.approvalCompletionValue
      return v > 70 ? this.$t('adminStats.good') : v > 40 ? this.$t('adminStats.fair') : this.$t('adminStats.low')
    },
    cashFlowHealthValue() {
      const s = this.summary
      if (!s?.companyWallet) return 50
      const net = (s.companyWallet.periodIn || 0) - (s.companyWallet.periodOut || 0)
      const total = (s.companyWallet.periodIn || 0) + (s.companyWallet.periodOut || 0) || 1
      const ratio = net / total
      return Math.max(0, Math.min(100, 50 + ratio * 50))
    },
    cashFlowHealthColor() {
      const v = this.cashFlowHealthValue
      return v > 60 ? '#10b981' : v > 35 ? '#f59e0b' : '#ef4444'
    },
    cashFlowHealthBadge() {
      const v = this.cashFlowHealthValue
      return v > 60 ? this.$t('adminStats.good') : v > 35 ? this.$t('adminStats.fair') : this.$t('adminStats.low')
    },

    // Chart series / options
    cashFlowSeries() {
      if (!this.cashFlow?.length) return []
      return [
        { name: this.$t('adminStats.inflow'), data: this.cashFlow.map(m => m.in || 0) },
        { name: this.$t('adminStats.outflow'), data: this.cashFlow.map(m => m.out || 0) }
      ]
    },
    cashFlowOptions() {
      const d = this.cashFlow || []
      return {
        chart: { toolbar: { show: true }, animations: { speed: 500 } },
        colors: ['#10b981', '#ef4444'],
        labels: d.map(m => m.date || '—'),
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 0.1, opacityFrom: 0.3, opacityTo: 0 } },
        xaxis: { type: 'category', labels: { rotate: -45 } },
        yaxis: { labels: { formatter: v => this.formatChartNumber(v) } },
        tooltip: { y: { formatter: v => this.formatChartNumber(v) } },
        legend: { position: 'top' }
      }
    },

    monthlySeries() {
      if (!this.monthlyComparison?.length) return []
      return [
        { name: this.$t('adminStats.expenses'), data: this.monthlyComparison.map(m => m.expenses || 0) },
        { name: this.$t('adminStats.revenue'), data: this.monthlyComparison.map(m => m.revenue || 0) }
      ]
    },
    monthlyOptions() {
      const d = this.monthlyComparison || []
      return {
        chart: { toolbar: { show: true }, animations: { speed: 500 }, stacked: true },
        colors: ['#ef4444', '#10b981'],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
        dataLabels: { enabled: false },
        labels: d.map(m => m.month || '—'),
        xaxis: { type: 'category', labels: { rotate: -45 } },
        yaxis: { labels: { formatter: v => this.formatChartNumber(v) } },
        tooltip: { y: { formatter: v => this.formatChartNumber(v) } },
        legend: { position: 'top' }
      }
    },

    walletSeries() {
      if (!this.walletTrend?.length) return []
      return [
        { name: this.$t('adminStats.deposits'), data: this.walletTrend.map(m => m.deposits || 0) },
        { name: this.$t('adminStats.withdrawals'), data: this.walletTrend.map(m => m.withdrawals || 0) }
      ]
    },
    walletOptions() {
      const d = this.walletTrend || []
      return {
        chart: { toolbar: { show: true }, animations: { speed: 500 } },
        colors: ['#10b981', '#ef4444'],
        labels: d.map(m => m.date || '—'),
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 0.1, opacityFrom: 0.3, opacityTo: 0 } },
        xaxis: { type: 'category', labels: { rotate: -45 } },
        yaxis: { labels: { formatter: v => this.formatChartNumber(v) } },
        tooltip: { y: { formatter: v => this.formatChartNumber(v) } },
        legend: { position: 'top' }
      }
    },

    expTrendSeries() {
      if (!this.expensesTrend?.length) return []
      return [
        { name: this.$t('adminStats.expenses'), data: this.expensesTrend.map(m => m.total || 0) }
      ]
    },
    expTrendOptions() {
      const d = this.expensesTrend || []
      return {
        chart: { toolbar: { show: true }, animations: { speed: 500 } },
        colors: ['#f59e0b'],
        labels: d.map(m => m.date || '—'),
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2.5 },
        markers: { size: 4 },
        xaxis: { type: 'category', labels: { rotate: -45 } },
        yaxis: { labels: { formatter: v => this.formatChartNumber(v) } },
        tooltip: { y: { formatter: v => this.formatChartNumber(v) } },
        legend: { show: false }
      }
    },

    moduleSeries() {
      return this.moduleActivity?.map(m => m.total || m.percentage || 0) || []
    },
    moduleOptions() {
      const d = this.moduleActivity || []
      return {
        chart: { toolbar: { show: true } },
        labels: d.map(m => this.$t(`adminStats.module_${(m.name || '').toLowerCase()}`) || m.name),
        dataLabels: { enabled: true, formatter: v => v.toFixed(1) + '%' },
        tooltip: { y: { formatter: v => this.formatChartNumber(v) } },
        legend: { position: 'bottom' },
        responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }]
      }
    },

    classificationSeries() {
      if (!this.expenseClassifications?.length) return []
      return [{ name: this.$t('adminStats.total'), data: this.expenseClassifications.map(c => c.total || 0) }]
    },
    classificationOptions() {
      const d = this.expenseClassifications || []
      return {
        chart: { toolbar: { show: true }, animations: { speed: 500 } },
        colors: ['#6366f1', '#f59e0b', '#06b6d4', '#10b981'],
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        dataLabels: { enabled: true, formatter: v => this.formatChartNumber(v) },
        xaxis: { labels: { formatter: v => this.formatChartNumber(v) } },
        labels: d.map(c => c.classification || '—'),
        tooltip: { y: { formatter: v => this.formatChartNumber(v) } },
        legend: { show: false }
      }
    },

    contractorSeries() {
      if (!this.topContractors?.length) return []
      return [{ name: this.$t('adminStats.total'), data: this.topContractors.map(c => c.total || 0) }]
    },
    contractorOptions() {
      const d = this.topContractors || []
      return {
        chart: { toolbar: { show: true }, animations: { speed: 500 } },
        colors: ['#6366f1'],
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        dataLabels: { enabled: true, formatter: v => this.formatChartNumber(v) },
        xaxis: { labels: { formatter: v => this.formatChartNumber(v) } },
        yaxis: { labels: { formatter: v => v.length > 12 ? v.slice(0, 12) + '...' : v } },
        labels: d.map(c => c.name || '—'),
        tooltip: { y: { formatter: v => this.formatChartNumber(v) } },
        legend: { show: false }
      }
    },

    treasuryDistSeries() {
      const t = this.treasuryOverview?.treasuries
      if (!t?.length) return []
      return [{ name: this.$t('adminStats.balance'), data: t.map(t => t.balance || 0) }]
    },
    treasuryDistOptions() {
      const t = this.treasuryOverview?.treasuries || []
      return {
        chart: { toolbar: { show: true }, animations: { speed: 500 } },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ef4444'],
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        dataLabels: { enabled: true, formatter: v => this.formatChartNumber(v) },
        xaxis: { labels: { formatter: v => this.formatChartNumber(v) } },
        labels: t.map(t => t.name || '—'),
        tooltip: { y: { formatter: v => this.formatChartNumber(v) } },
        legend: { show: false }
      }
    }
  },
  methods: {
    onDateChange(range) {
      if (range.startDate !== this.fromDate || range.endDate !== this.toDate) {
        this.fromDate = range.startDate
        this.toDate = range.endDate
        this.fetchAll(this.fromDate, this.toDate)
      }
    },
    refresh() {
      this.fetchAll(this.fromDate, this.toDate)
    },
    goTo(name) {
      this.$router.push({ name })
    },
    drillDownActivity(item) {
      const routeMap = { supply: 'supplies-list', transport: 'transport-list', rental: 'equipment-log-list', extract: 'extracts-list', expense: 'expenses-list', payment: 'payments' }
      const route = routeMap[(item.module || '').toLowerCase()] || ''
      if (route) this.$router.push({ name: route })
    },
    formatDate(d) {
      if (!d) return '—'
      const date = new Date(d)
      if (isNaN(date.getTime())) return d
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    },
    formatAmount(v) {
      const n = parseFloat(v)
      if (isNaN(n)) return '\u2014'
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
      return this.isRTL && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    },
    formatChartNumber(v) {
      const formatted = new Intl.NumberFormat('en-US').format(v)
      return this.isRTL && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    },
    moduleBadgeClass(mod) {
      const map = {
        supply: 'bg-blue-100 text-blue-700',
        transport: 'bg-amber-100 text-amber-700',
        rental: 'bg-violet-100 text-violet-700',
        extract: 'bg-cyan-100 text-cyan-700',
        expense: 'bg-rose-100 text-rose-700',
        payment: 'bg-emerald-100 text-emerald-700'
      }
      return map[(mod || '').toLowerCase()] || 'bg-slate-100 text-slate-600'
    }
  },
  mounted() {
    const now = new Date()
    const d30 = new Date(Date.now() - 29 * 86400000)
    this.fromDate = `${d30.getFullYear()}-${String(d30.getMonth() + 1).padStart(2, '0')}-${String(d30.getDate()).padStart(2, '0')}`
    this.toDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    this.fetchAll(this.fromDate, this.toDate)
  }
}
</script>

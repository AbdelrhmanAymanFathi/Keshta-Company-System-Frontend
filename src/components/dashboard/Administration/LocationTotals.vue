<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
    <!-- Header -->
    <div class="flex flex-col gap-3 border-b border-slate-200/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h3 class="text-base font-semibold theme-text-primary truncate">{{ $t('adminStats.locationTotals') }}</h3>
        <p class="text-xs theme-text-muted mt-0.5">{{ $t('adminStats.locationTotalsDesc') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-xs font-medium theme-text-secondary whitespace-nowrap" :for="selectId">
          {{ $t('adminStats.location') }}
        </label>
        <select
          :id="selectId"
          v-model="selectedLocationId"
          @change="load"
          class="min-w-[10rem] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm theme-input-focus theme-text-primary"
        >
          <option value="">{{ $t('adminStats.allLocations') }}</option>
          <option v-for="loc in locations" :key="loc.id" :value="loc.id">
            {{ loc.depth ? '— ' + loc.name : loc.name }}
          </option>
        </select>
        <button
          type="button"
          @click="load"
          :disabled="loading"
          class="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm theme-text-secondary transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="p-5">
      <DashboardSkeleton v-if="loading && !data" :lines="5" />
      <DashboardError v-else-if="error" :message="error" @retry="load" />
      <div v-else class="space-y-5">
        <!-- Totals tiles -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="tile in tiles"
            :key="tile.key"
            class="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium theme-text-secondary">{{ tile.label }}</p>
              <div class="flex h-8 w-8 items-center justify-center rounded-lg" :class="tile.bg">
                <svg class="h-4 w-4" :class="tile.fg" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="tile.icon"></svg>
              </div>
            </div>
            <p class="mt-2 text-xl font-bold theme-text-primary">{{ formatAmount(tile.total) }}</p>
            <p class="mt-0.5 text-[11px] theme-text-muted">
              {{ $t('adminStats.records') }}: {{ formatInt(tile.count) }}
            </p>
          </div>
        </div>

        <!-- Per-location table -->
        <div class="overflow-hidden rounded-xl border border-slate-200/80">
          <table v-app-table class="app-table divide-y divide-slate-200">
            <thead class="theme-table-thead-gradient">
              <tr>
                <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-muted" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('adminStats.location') }}
                </th>
                <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-muted" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('adminStats.totalSupplies') }}
                </th>
                <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-muted" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('adminStats.totalTransports') }}
                </th>
                <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-muted" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('adminStats.totalExpenses') }}
                </th>
                <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-muted" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('adminStats.totalExtracts') }}
                </th>
                <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-muted text-right">
                  {{ $t('adminStats.total') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="(row, i) in rows"
                :key="row.locationId == null ? 'none-' + i : row.locationId"
                class="theme-table-row-hover transition-colors"
              >
                <td class="px-4 py-3 whitespace-nowrap text-sm theme-text-primary">
                  {{ rowName(row) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatAmount(row.supplies.total) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatAmount(row.transports.total) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatAmount(row.expenses.total) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatAmount(row.extracts.total) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right theme-text-primary">{{ formatAmount(row.total) }}</td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="6" class="px-4 py-6 text-center text-sm theme-text-muted">{{ $t('adminStats.noData') }}</td>
              </tr>
            </tbody>
            <tfoot v-if="rows.length" class="bg-slate-50">
              <tr class="font-semibold theme-text-primary">
                <td class="px-4 py-3 text-sm">{{ $t('adminStats.total') }}</td>
                <td class="px-4 py-3 text-sm">{{ formatAmount(totals.supplies.total) }}</td>
                <td class="px-4 py-3 text-sm">{{ formatAmount(totals.transports.total) }}</td>
                <td class="px-4 py-3 text-sm">{{ formatAmount(totals.expenses.total) }}</td>
                <td class="px-4 py-3 text-sm">{{ formatAmount(totals.extracts.total) }}</td>
                <td class="px-4 py-3 text-sm text-right">{{ formatAmount(totals.total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getLocations, getLocationTotals } from '@/api'
import DashboardSkeleton from './DashboardSkeleton.vue'
import DashboardError from './DashboardError.vue'

const ICONS = {
  supplies: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V11.25c0-2.828-2.172-6.444-4.688-7.5" />',
  transports: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />',
  expenses: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />',
  extracts: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25" />'
}

export default {
  name: 'LocationTotals',
  components: { DashboardSkeleton, DashboardError },
  props: {
    fromDate: { type: String, default: '' },
    toDate: { type: String, default: '' }
  },
  data() {
    return {
      selectId: `location-totals-${Math.random().toString(36).slice(2, 8)}`,
      locations: [],
      selectedLocationId: '',
      data: null,
      loading: false,
      error: ''
    }
  },
  computed: {
    isRTL() { return this.$i18n?.locale === 'ar' },
    rows() { return this.data?.locations || [] },
    totals() {
      return this.data?.totals || {
        supplies: { total: 0, count: 0 },
        transports: { total: 0, count: 0 },
        expenses: { total: 0, count: 0 },
        extracts: { total: 0, count: 0 },
        total: 0
      }
    },
    tiles() {
      return [
        { key: 'supplies', label: this.$t('adminStats.totalSupplies'), total: this.totals.supplies.total, count: this.totals.supplies.count, bg: 'bg-blue-100', fg: 'text-blue-600', icon: ICONS.supplies },
        { key: 'transports', label: this.$t('adminStats.totalTransports'), total: this.totals.transports.total, count: this.totals.transports.count, bg: 'bg-amber-100', fg: 'text-amber-600', icon: ICONS.transports },
        { key: 'expenses', label: this.$t('adminStats.totalExpenses'), total: this.totals.expenses.total, count: this.totals.expenses.count, bg: 'bg-rose-100', fg: 'text-rose-600', icon: ICONS.expenses },
        { key: 'extracts', label: this.$t('adminStats.totalExtracts'), total: this.totals.extracts.total, count: this.totals.extracts.count, bg: 'bg-cyan-100', fg: 'text-cyan-600', icon: ICONS.extracts }
      ]
    }
  },
  watch: {
    fromDate() { this.load() },
    toDate() { this.load() }
  },
  mounted() {
    this.loadLocations()
    this.load()
  },
  methods: {
    async loadLocations() {
      try {
        const res = await getLocations()
        const list = res?.data || []
        const flat = []
        for (const site of list) {
          if (site.parentId) continue
          flat.push({ id: site.id, name: site.name, depth: 0 })
          for (const child of site.children || []) {
            flat.push({ id: child.id, name: child.name, depth: 1 })
          }
        }
        this.locations = flat
      } catch {
        this.locations = []
      }
    },
    async load() {
      this.loading = true
      this.error = ''
      try {
        const params = {}
        if (this.fromDate) params.fromDate = this.fromDate
        if (this.toDate) params.toDate = this.toDate
        if (this.selectedLocationId !== '' && this.selectedLocationId != null) {
          params.locationId = this.selectedLocationId
        }
        const res = await getLocationTotals(params)
        this.data = res?.data?.data !== undefined ? res.data.data : (res?.data || null)
      } catch (e) {
        this.error = e?.response?.data?.message || this.$t('adminStats.loadError')
        this.data = null
      } finally {
        this.loading = false
      }
    },
    rowName(row) {
      if (row.locationId == null) return this.$t('adminStats.unassignedLocation')
      return row.locationName || '—'
    },
    formatAmount(v) {
      const n = Number(v)
      if (!Number.isFinite(n)) return '—'
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
      return this.isRTL && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    },
    formatInt(v) {
      const n = Number(v)
      if (!Number.isFinite(n)) return '0'
      return new Intl.NumberFormat('en-US').format(n)
    }
  }
}
</script>

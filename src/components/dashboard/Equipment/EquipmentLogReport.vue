<template>
  <div class="space-y-6 p-0 sm:p-0.5 md:p-1 lg:p-0">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">{{ $t('equipmentLog.report') }}</h3>
      <div>
        <button @click="exportCsv" class="theme-button px-3 py-2 rounded text-sm">
          {{ $t('equipmentLog.exportCsv') }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg p-4 border">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.dateFrom') }}</label>
          <DateField v-model="filters.from" class="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.dateTo') }}</label>
          <DateField v-model="filters.to" class="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('equipmentLog.equipment') }}</label>
          <select v-model="filters.equipmentId" class="w-full border rounded px-3 py-2 text-sm">
            <option value="">{{ $t('equipmentLog.allEquipments') }}</option>
            <option v-for="e in equipments" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('equipmentLog.equipmentType') }}</label>
          <div class="flex flex-col sm:flex-row gap-2 w-full">
            <button
              type="button"
              @click="filters.isRental = ''"
              :class="[
                'px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-1 sm:flex-none',
                filters.isRental === '' ? 'theme-button shadow-sm' : 'bg-white theme-text-secondary hover:bg-slate-50 border border-slate-200'
              ]"
            >
              {{ $t('equipmentLog.all') }}
            </button>
            <button
              type="button"
              @click="filters.isRental = 'false'"
              :class="[
                'px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-1 sm:flex-none',
                filters.isRental === 'false' ? 'bg-slate-600 theme-text-light shadow-sm shadow-slate-200' : 'bg-white theme-text-secondary hover:bg-slate-50 border border-slate-200'
              ]"
            >
              {{ $t('equipmentLog.companyOwned') }}
            </button>
            <button
              type="button"
              @click="filters.isRental = 'true'"
              :class="[
                'px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-1 sm:flex-none',
                filters.isRental === 'true' ? 'bg-slate-600 theme-text-light shadow-sm shadow-slate-200' : 'bg-white theme-text-secondary hover:bg-slate-50 border border-slate-200'
              ]"
            >
              {{ $t('equipmentLog.externalRented') }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('equipmentLog.company') }}</label>
          <select v-model="filters.companyId" class="w-full border rounded px-3 py-2 text-sm">
            <option value="">{{ $t('equipmentLog.allCompanies') }}</option>
            <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button @click="runReport" :disabled="loading"
          class="bg-green-600 hover:bg-green-700 theme-text-light px-4 py-2 rounded">{{ loading ? $t('labels.running') : $t('labels.run') }}</button>
        <button @click="clearFilters" class="px-4 py-2 border rounded">{{ $t('labels.reset') }}</button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
    </div>

    <div v-else>
      <div v-if="report.rows.length === 0" class="text-center py-8 theme-text-muted">{{ $t('equipmentLog.noReportData') }}</div>
      <div v-else class="bg-white rounded-lg p-4 border overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('equipmentLog.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('equipmentLog.equipment') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('equipmentLog.hours') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('equipmentLog.hourlyRate') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('equipmentLog.total') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="row in report.rows" :key="row.id">
              <td class="px-6 py-4 text-sm theme-text-primary">{{ formatDate(row.date) }}</td>
              <td class="px-6 py-4 text-sm theme-text-primary">{{ equipmentName(row) || '-' }}</td>
              <td class="px-6 py-4 text-sm theme-text-primary">{{ row.hours }}</td>
              <td class="px-6 py-4 text-sm theme-text-primary">{{ formatCurrency(row.hourlyRate) }}</td>
              <td class="px-6 py-4 text-sm font-semibold theme-text-primary">{{ formatCurrency(row.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getEquipmentLogs, getEquipments, getBranches } from '@/api'
import DateField from '@/components/shared/DateField.vue'

export default {
  name: 'EquipmentLogReport',
  components: { DateField },
  setup() {
    const { locale } = useI18n()
    const filters = ref({ from: '', to: '', equipmentId: '', companyId: '', isRental: '' })
    const loading = ref(false)
    const report = ref({ rows: [] })
    const equipments = ref([])
    const companies = ref([])

    const buildQueryParams = (page) => ({
      page,
      pageSize: 100,
      ...(filters.value.from ? { startDate: filters.value.from } : {}),
      ...(filters.value.to ? { endDate: filters.value.to } : {}),
      ...(filters.value.equipmentId !== '' && filters.value.equipmentId !== null && filters.value.equipmentId !== undefined ? { equipmentId: filters.value.equipmentId } : {}),
      ...(filters.value.isRental !== '' ? { isRental: filters.value.isRental === 'true' } : {})
    })

    const extractItems = (payload) => {
      if (Array.isArray(payload?.items)) return payload.items
      if (Array.isArray(payload?.data)) return payload.data
      if (Array.isArray(payload)) return payload
      return []
    }

    const runReport = async () => {
      loading.value = true
      try {
        const rows = []
        let page = 1
        let total = Number.MAX_SAFE_INTEGER
        while (page <= 200) {
          const res = await getEquipmentLogs(buildQueryParams(page))
          const payload = res?.data || {}
          const items = extractItems(payload)
          total = Number(payload?.meta?.total ?? payload?.total ?? total)
          rows.push(...items)
          if (items.length === 0 || rows.length >= total) break
          page += 1
        }
        report.value = { rows }
      } catch (e) {
        console.error('Failed to run report', e)
        report.value = { rows: [] }
      } finally {
        loading.value = false
      }
    }

    const loadMeta = async () => {
      try {
        const eq = await getEquipments()
        const eqPayload = eq?.data || {}
        equipments.value = Array.isArray(eqPayload.items)
          ? eqPayload.items
          : Array.isArray(eqPayload.data)
            ? eqPayload.data
            : Array.isArray(eqPayload) ? eqPayload : []
        const co = await getBranches()
        companies.value = co.data || []
      } catch (e) {
        equipments.value = []
        companies.value = []
      }
    }

    const clearFilters = () => {
      filters.value = { from: '', to: '', equipmentId: '', companyId: '', isRental: '' }
      runReport()
    }

    const equipmentName = (row) => {
      const eq = row?.equipment
      if (eq && typeof eq === 'object') return eq.name || ''
      if (typeof eq === 'string') return eq
      return row?.equipmentName || ''
    }

    const exportCsv = () => {
      const rows = report.value.rows || []
      if (!rows.length) return
      const header = ['date', 'equipment', 'hours', 'hourlyRate', 'total']
      const csv = [header.join(',')].concat(rows.map(r => [r.date, '"' + equipmentName(r) + '"', r.hours, r.hourlyRate, r.total].join(','))).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'equipment-logs-report.csv'
      a.click()
      URL.revokeObjectURL(url)
    }

    const formatDate = (d) => {
      if (!d) return '-'
      const date = new Date(d)
      if (isNaN(date.getTime())) return d
      return new Intl.DateTimeFormat('en-GB').format(date)
    }

    const formatCurrency = (amount) => {
      const rtl = locale?.value === 'ar'
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0)
      return rtl && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    }

    onMounted(async () => {
      await loadMeta()
      await runReport()
    })

    return { filters, loading, report, runReport, equipments, companies, clearFilters, exportCsv, formatDate, formatCurrency, equipmentName }
  }
}
</script>

<style scoped>
/* minimal styling */
</style>

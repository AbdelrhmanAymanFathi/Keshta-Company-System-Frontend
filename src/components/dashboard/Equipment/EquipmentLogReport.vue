<template>
  <div class="space-y-6 p-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">{{ $t('equipmentLog.report') }}</h3>
      <div>
        <button @click="exportCsv" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm">
          {{ $t('equipmentLog.exportCsv') }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg p-4 border">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <DateField v-model="filters.from" class="border rounded px-3 py-2 text-sm" />
        <DateField v-model="filters.to" class="border rounded px-3 py-2 text-sm" />
        <select v-model="filters.equipmentId" class="border rounded px-3 py-2 text-sm">
          <option value="">{{ $t('equipmentLog.allEquipments') }}</option>
          <option v-for="e in equipments" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
        <select v-model="filters.companyId" class="border rounded px-3 py-2 text-sm">
          <option value="">{{ $t('equipmentLog.allCompanies') }}</option>
          <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="mt-4 flex gap-2">
        <button @click="runReport" :disabled="loading"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">{{ loading ? $t('labels.running') : $t('labels.run') }}</button>
        <button @click="clearFilters" class="px-4 py-2 border rounded">{{ $t('labels.reset') }}</button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else>
      <div v-if="report.rows.length === 0" class="text-center py-8 text-gray-500">{{ $t('equipmentLog.noReportData') }}</div>
      <div v-else class="bg-white rounded-lg p-4 border overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('equipmentLog.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('equipmentLog.equipment') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('equipmentLog.hours') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('equipmentLog.hourlyRate') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('equipmentLog.total') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="row in report.rows" :key="row.id">
              <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(row.date) }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ row.equipment }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ row.hours }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ formatCurrency(row.hourlyRate) }}</td>
              <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ formatCurrency(row.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getEquipmentLogsReportData, getEquipments, getBranches } from '@/api'
import DateField from '@/components/shared/DateField.vue'

export default {
  name: 'EquipmentLogReport',
  components: { DateField },
  setup() {
    const filters = ref({ from: '', to: '', equipmentId: '', companyId: '' })
    const loading = ref(false)
    const report = ref({ rows: [] })
    const equipments = ref([])
    const companies = ref([])

    const runReport = async () => {
      loading.value = true
      try {
        const params = {
          from: filters.value.from,
          to: filters.value.to,
          equipmentId: filters.value.equipmentId,
          companyId: filters.value.companyId
        }
        const res = await getEquipmentLogsReportData(params)
        report.value = res.data || { rows: [] }
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
        equipments.value = eq.data || []
        const co = await getBranches()
        companies.value = co.data || []
      } catch (e) {
        equipments.value = []
        companies.value = []
      }
    }

    const clearFilters = () => {
      filters.value = { from: '', to: '', equipmentId: '', companyId: '' }
    }

    const exportCsv = () => {
      const rows = report.value.rows || []
      if (!rows.length) return
      const header = ['date', 'equipment', 'hours', 'hourlyRate', 'total']
      const csv = [header.join(',')].concat(rows.map(r => [r.date, '"' + (r.equipment || '') + '"', r.hours, r.hourlyRate, r.total].join(','))).join('\n')
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
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(amount || 0)
    }

    onMounted(async () => {
      await loadMeta()
    })

    return { filters, loading, report, runReport, equipments, companies, clearFilters, exportCsv, formatDate, formatCurrency }
  }
}
</script>

<style scoped>
/* minimal styling */
</style>

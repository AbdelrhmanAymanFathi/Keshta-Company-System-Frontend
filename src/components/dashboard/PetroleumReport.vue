<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <h3 class="text-lg font-semibold">{{ $t('petroleum.reportTitle') }}</h3>
      <div class="flex items-center gap-2">
        <button @click="refresh" :disabled="loading" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg">{{ $t('labels.refresh') }}</button>
        <button @click="downloadReport('xlsx')" :disabled="downloading" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          {{ downloading ? $t('labels.downloading') : $t('labels.download') }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-4 space-y-4">
      <h4 class="text-sm font-semibold text-gray-700">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.search') }}</label>
          <input v-model="filters.q" @keyup.enter="loadReport" type="text" placeholder="Search..." class="w-full px-3 py-2 border rounded text-sm" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
          <input v-model="filters.startDate" type="date" class="w-full px-3 py-2 border rounded text-sm" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
          <input v-model="filters.endDate" type="date" class="w-full px-3 py-2 border rounded text-sm" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('petroleum.supplier') }}</label>
          <select v-model="filters.supplierId" class="w-full px-3 py-2 border rounded text-sm">
            <option value="">{{ $t('labels.all') }}</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="loadReport" :disabled="loading" class="px-4 py-2 bg-indigo-600 text-white rounded">{{ $t('labels.search') }}</button>
        <button @click="clearFilters" class="px-4 py-2 bg-gray-200 rounded">{{ $t('labels.clear') }}</button>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{{ error }}</div>

    <div v-else-if="loading" class="flex justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>

    <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-4 py-3 text-sm text-gray-600">{{ $t('petroleum.reportDescription') }}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="px-6 py-3">{{ $t('petroleum.date') }}</th>
              <th class="px-6 py-3">{{ $t('petroleum.productName') }}</th>
              <th class="px-6 py-3">{{ $t('petroleum.supplyPermitNo') }}</th>
              <th class="px-6 py-3">{{ $t('petroleum.loadTons') }}</th>
              <th class="px-6 py-3">{{ $t('petroleum.tonPrice') }}</th>
              <th class="px-6 py-3">{{ $t('petroleum.supplier') }}</th>
              <th class="px-6 py-3">{{ $t('petroleum.supplierDue') }}</th>
            </tr>
          </thead>
          <tbody v-if="items.length" class="bg-white divide-y divide-gray-200 text-sm">
            <tr v-for="(it, idx) in items" :key="it.id || idx">
              <td class="px-6 py-3">{{ formatDate(it.date) }}</td>
              <td class="px-6 py-3">{{ it.productName || '-' }}</td>
              <td class="px-6 py-3">{{ it.supplyPermitNo || '-' }}</td>
              <td class="px-6 py-3">{{ it.loadTons }}</td>
              <td class="px-6 py-3">{{ formatCurrency(it.tonPrice) }}</td>
              <td class="px-6 py-3">{{ it.supplier?.name || it.supplierId || '-' }}</td>
              <td class="px-6 py-3">{{ formatCurrency(it.supplierDue) }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr><td colspan="7" class="px-6 py-8 text-center text-sm text-gray-500">{{ $t('labels.noData') }}</td></tr>
          </tbody>
        </table>
      </div>

      <div v-if="items.length > 0" class="bg-gray-50 border-t border-gray-200 px-4 py-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.totalRecords') }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ items.length }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.total') }}</p>
            <p class="text-lg font-semibold text-indigo-600">{{ formatCurrency(totalAmount) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { exportPetroleumReport, getSuppliers } from '@/api'
import { buildQueryParams } from '@/utils/buildQueryParams'

export default {
  name: 'PetroleumReport',
  setup() {
    const downloading = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const items = ref([])
    const suppliers = ref([])
    const filters = ref({ q: '', startDate: '', endDate: '', supplierId: '' })

    const totalAmount = computed(() => items.value.reduce((s, it) => s + (Number(it.supplierDue || it.total || 0) || 0), 0))

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString() } catch (e) { return d } }
    const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(v || 0)

    const loadSuppliers = async () => {
      try {
        const resp = await getSuppliers({ pageSize: 200 })
        suppliers.value = Array.isArray(resp.data.items) ? resp.data.items : (Array.isArray(resp.data) ? resp.data : [])
      } catch (e) { suppliers.value = [] }
    }

    const loadReport = async () => {
      error.value = null
      loading.value = true
      items.value = []
      try {
        const { data } = await exportPetroleumReport(buildQueryParams(filters.value), 'json')
        if (Array.isArray(data)) items.value = data
        else if (Array.isArray(data.items)) items.value = data.items
        else items.value = []
      } catch (err) {
        console.error('Error loading petroleum report:', err)
        error.value = err.response?.data?.message || 'Failed to load report'
      } finally { loading.value = false }
    }

    const downloadReport = async (format = 'xlsx') => {
      downloading.value = true
      try {
        const { data, headers } = await exportPetroleumReport(buildQueryParams(filters.value), format)
        const filename = `petroleum-${filters.value.startDate || 'all'}_${filters.value.endDate || 'all'}.${format}`
        const blob = new Blob([data], { type: headers['content-type'] || 'application/octet-stream' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Error downloading petroleum report:', err)
      } finally { downloading.value = false }
    }

    onMounted(async () => {
      await loadSuppliers()
    })

    return { downloading, loading, error, items, suppliers, filters, totalAmount, formatDate, formatCurrency, loadReport, downloadReport, clearFilters: () => { filters.value = { q: '', startDate: '', endDate: '', supplierId: '' } }, refresh: loadReport }
  }
}
</script>

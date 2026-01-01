<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('expenses.reportTitle') }}</h3>
      <div class="flex items-center gap-2">
        <button @click="refresh" :disabled="loading"
                class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
          {{ $t('labels.refresh') }}
        </button>
        <button @click="downloadReport" :disabled="downloading"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14"/>
          </svg>
          {{ downloading ? $t('labels.downloading') : $t('labels.download') }}
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4">
      <h4 class="text-sm font-semibold text-gray-700">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.search') }}</label>
          <input 
            v-model="filters.q"
            @keyup.enter="loadReport"
            type="text"
            placeholder="Search..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
          <input 
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
          <input 
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('expenses.category') }}</label>
          <select 
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">{{ $t('labels.all') }}</option>
            <option value="operational">Operational</option>
            <option value="maintenance">Maintenance</option>
            <option value="fuel">Fuel</option>
            <option value="salary">Salary</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div class="flex gap-2">
        <button 
          @click="loadReport"
          :disabled="loading"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {{ $t('labels.search') }}
        </button>
        <button 
          @click="clearFilters"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm font-medium"
        >
          {{ $t('labels.clear') }}
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-sm text-red-800">{{ error }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-4 py-3 text-sm text-gray-600">{{ $t('expenses.reportDescription') }}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 table-auto">
          <thead class="bg-gray-50">
            <tr>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.date') }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.type') || 'Type' }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('expenses.settlementDate') || 'Settlement Date' }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider" style="display: table-cell !important;">{{ $t('expenses.branch') || 'Branch' }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('expenses.location') || 'Location' }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('expenses.category') || 'Category' }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('expenses.classification') || 'Classification' }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('expenses.description') || 'Description' }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.total') || 'Amount' }}</th>
              <th class="table-cell px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('expenses.notes') || 'Notes' }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="items.length">
            <tr v-for="(expense, index) in items" :key="expense.ID || expense.id || index" class="hover:bg-gray-50">
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.id || expense.ID || index + 1 }}</td>
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(expense.date || expense.expenseDate || expense['التاريخ']) }}</td>
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.type || '-' }}</td>
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.settlementDate || '-' }}</td>
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900" style="display: table-cell !important;">{{ expense.branch || '-' }}</td>
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.locationName || expense.location?.name || '-' }}</td>
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <Badge :variant="getCategoryVariant(expense.category)">{{ expense.category || '-' }}</Badge>
              </td>
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.classification || '-' }}</td>
              <td class="table-cell px-6 py-4 text-sm text-gray-900">{{ expense.description || '-' }}</td>
              <td class="table-cell px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{ formatCurrency(expense.amount || expense.total || 0) }}</td>
              <td class="table-cell px-6 py-4 text-sm text-gray-900">{{ expense.notes || '-' }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="11" class="px-6 py-8 text-center text-sm text-gray-500">{{ $t('labels.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Section -->
      <div v-if="items.length > 0" class="bg-gray-50 border-t border-gray-200 px-4 py-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.totalRecords') }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ items.length }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.total') }}</p>
            <p class="text-lg font-semibold text-red-600">{{ formatCurrency(totalAmount) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Average Expense</p>
            <p class="text-lg font-semibold text-indigo-600">{{ formatCurrency(averageExpense) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Highest Expense</p>
            <p class="text-lg font-semibold text-orange-600">{{ formatCurrency(highestExpense) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getExpensesReportData, downloadExpensesReport } from '@/api'
import Badge from '../shared/Badge.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'

export default {
  name: 'ExpensesReport',
  components: { Badge },
  setup() {
    const downloading = ref(false)
    const error = ref(null)
    const loading = ref(false)
    const items = ref([])
    const filters = ref({
      q: '',
      startDate: '',
      endDate: '',
      category: ''
    })

    const totalAmount = computed(() => {
      return items.value.reduce((sum, item) => {
        const amount = parseFloat(String(item['المبلغ'] || item.amount || item.total || 0).replace(/,/g, '')) || 0
        return sum + amount
      }, 0)
    })

    const averageExpense = computed(() => {
      if (items.value.length === 0) return 0
      return totalAmount.value / items.value.length
    })

    const highestExpense = computed(() => {
      if (items.value.length === 0) return 0
      return Math.max(...items.value.map(item => parseFloat(String(item['المبلغ'] || item.amount || item.total || 0).replace(/,/g, '')) || 0))
    })

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      // Use Gregorian calendar (en-US) to avoid Hijri dates
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount || 0)
    }

    const getCategoryVariant = (category) => {
      // Badge.vue supports: default, success, warning, danger, info, company, external
      const variants = {
        operational: 'info',    // blue-ish
        maintenance: 'warning', // yellow
        fuel: 'danger',         // red
        salary: 'success',      // green
        other: 'default'
      }
      return variants[category] || 'default'
    }

    const loadReport = async () => {
      // Require start and end dates before loading
      error.value = null
      if (!filters.value.startDate || !filters.value.endDate) {
        items.value = []
        error.value = 'من فضلك حدد تاريخ البداية وتاريخ النهاية ثم اضغط بحث'
        return
      }

      // Ensure endDate is not before startDate
      try {
        const s = new Date(filters.value.startDate)
        const e = new Date(filters.value.endDate)
        if (e < s) {
          items.value = []
          error.value = 'تأكد أن تاريخ النهاية بعد أو يساوي تاريخ البداية'
          return
        }
      } catch (e) {
        // ignore parse error and let API handle it
      }

      loading.value = true
      error.value = null
      try {
        const response = await getExpensesReportData(
          buildQueryParams(filters.value),
          'json'
        )
        
        // Destructure data and headers from response
        const { data, headers } = response
        console.log('Raw response:', { data, headers })

        // Handle various response formats:
        // 1. Direct array: [...]
        // 2. { rows: [...] }   <-- backend returns this
        // 3. { items: [...] }
        // 4. { data: [...] }
        // 5. Nested { data: { items: [...] } }
        let parsedItems = []

        if (Array.isArray(data)) {
          parsedItems = data
        } else if (Array.isArray(data?.rows)) {
          parsedItems = data.rows
        } else if (Array.isArray(data?.items)) {
          parsedItems = data.items
        } else if (Array.isArray(data?.data)) {
          parsedItems = data.data
        } else if (typeof data === 'string') {
          // Might be stringified JSON
          try {
            const parsed = JSON.parse(data)

            if (Array.isArray(parsed)) {
              parsedItems = parsed
            } else if (Array.isArray(parsed?.rows)) {
              parsedItems = parsed.rows
            } else if (Array.isArray(parsed?.items)) {
              parsedItems = parsed.items
            } else if (Array.isArray(parsed?.data)) {
              parsedItems = parsed.data
            } else {
              parsedItems = []
            }
          } catch (_) {
            parsedItems = []
          }
        }

        items.value = parsedItems
        console.log('Parsed items count:', parsedItems.length)
        console.log('First item:', parsedItems[0])
      } catch (err) {
        console.error('Error loading expenses report:', err)
        error.value = err.response?.data?.message || 'Failed to load report'
      } finally {
        loading.value = false
      }
    }

    const refresh = async () => {
      await loadReport()
    }

    const clearFilters = () => {
      filters.value = {
        q: '',
        startDate: '',
        endDate: '',
        category: ''
      }
      // Do not auto-load after clearing filters: user must click Search
      items.value = []
    }

    const downloadReport = async () => {
      downloading.value = true
      error.value = null
      try {
        const { data, headers } = await downloadExpensesReport(
          buildQueryParams(filters.value)
        )
        
        const filename = `expenses-${filters.value.startDate}_${filters.value.endDate}.xlsx`
        const blob = new Blob([data], { type: headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Error downloading report:', err)
        error.value = err.response?.data?.message || 'Failed to download report'
      } finally {
        downloading.value = false
      }
    }

    onMounted(() => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      filters.value.endDate = endDate.toISOString().split('T')[0]
      filters.value.startDate = startDate.toISOString().split('T')[0]
      // Do not auto-load: user must click Search
    })

    return {
      downloading,
      error,
      loading,
      items,
      filters,
      totalAmount,
      averageExpense,
      highestExpense,
      formatDate,
      formatCurrency,
      getCategoryVariant,
      loadReport,
      refresh,
      clearFilters,
      downloadReport
    }
  }
}
</script>

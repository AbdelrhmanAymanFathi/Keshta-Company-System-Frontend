<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('supply.exportTableTitle') }}</h2>
      <div class="flex items-center gap-2">
        <button
          @click="refresh"
          :disabled="loading"
          class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {{ $t('labels.refresh') }}
        </button>
        <button
          @click="downloadReport"
          :disabled="downloading"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
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
          />
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      <div class="px-4 py-3 text-sm text-gray-600">Exports/Supplies Report</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.date') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.crusher') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.location') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.contractor') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.category') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.crusherTicket') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.companyTicket') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.companyCapacity') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.crusherCapacity') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.unitPrice') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.discount') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.rowTotal') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.accumulativeTotal') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.notes') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="mappedItems.length">
            <tr v-for="item in mappedItems" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(item.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.crusher }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.location }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.contractor }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.category || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.crusherTicket }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.companyTicket }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatQuantity(item.companyCapacity) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatQuantity(item.crusherCapacity) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(item.unitPrice) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" :title="`Discount: ${item.discount}`">{{ formatCurrency(item.discount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{ formatCurrency(item.rowTotal) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600" :title="`Running total up to this row`">{{ formatCurrency(item.accumulativeTotal) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.notes || '-' }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="14" class="px-6 py-8 text-center text-sm text-gray-500">{{ $t('labels.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Section -->
      <div v-if="mappedItems.length > 0" class="bg-gray-50 border-t border-gray-200 px-4 py-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.totalRecords') }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ mappedItems.length }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.rowTotal') }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalAmount) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.companyCapacity') }}</p>
            <p class="text-lg font-semibold text-indigo-600">{{ formatQuantity(totalQuantity) }} وحدة</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">متوسط السعر</p>
            <p class="text-lg font-semibold text-orange-600">{{ formatCurrency(averagePrice) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getSuppliesReportData, downloadSuppliesReport } from '@/api'
import { buildQueryParams } from '@/utils/buildQueryParams'

export default {
  name: 'SuppliesReport',
  setup() {
    const downloading = ref(false)
    const error = ref(null)
    const loading = ref(false)
    const rawItems = ref([])
    const filters = ref({
      q: '',
      startDate: '',
      endDate: ''
    })

    /**
     * Data Mapping Layer
     * Maps raw API response to standardized format
     */
    const mapItem = (rawItem) => {
      return {
        id: rawItem.id,
        date: rawItem.date,
        crusher: rawItem.crusherName,
        location: rawItem.locationName,
        contractor: rawItem.contractorName,
        category: rawItem.categoryName || '—',
        crusherTicket: rawItem.crusherTicket,
        companyTicket: rawItem.companyTicket,
        companyCapacity: parseFloat(rawItem.companyCapacity) || 0,
        crusherCapacity: parseFloat(rawItem.crusherCapacity) || 0,
        unitPrice: parseFloat(rawItem.unitPrice) || 0,
        discount: parseFloat(rawItem.discount) || 0,
        rowTotal: parseFloat(rawItem.rowTotal) || 0,
        accumulativeTotal: parseFloat(rawItem.accumulativeTotal) || 0,
        notes: rawItem.notes
      }
    }

    /**
     * Mapped and cleaned items for display
     * Sorted by date (ascending)
     */
    const mappedItems = computed(() => {
      return rawItems.value
        .map(mapItem)
        .sort((a, b) => {
          // Handle DD/MM/YYYY format
          const parseDate = (dateStr) => {
            if (dateStr.includes('/')) {
              const [day, month, year] = dateStr.split('/')
              return new Date(year, month - 1, day)
            }
            return new Date(dateStr)
          }
          return parseDate(a.date) - parseDate(b.date)
        })
    })

    /**
     * Summary Calculations
     */
    const totalAmount = computed(() => {
      return mappedItems.value.reduce((sum, item) => sum + item.rowTotal, 0)
    })

    const totalQuantity = computed(() => {
      return mappedItems.value.reduce((sum, item) => sum + item.companyCapacity, 0)
    })

    const averagePrice = computed(() => {
      if (mappedItems.value.length === 0) return 0
      return totalAmount.value / mappedItems.value.length
    })

    /**
     * Formatting Functions
     */
    const formatDate = (dateString) => {
      if (!dateString) return '-'

      // Handle DD/MM/YYYY format from API
      if (dateString.includes('/')) {
        const parts = dateString.split('/')
        if (parts.length === 3) {
          return dateString // Return as-is if already in DD/MM/YYYY
        }
      }

      // Handle YYYY-MM-DD and other standard formats
      try {
        const date = new Date(dateString)
        if (isNaN(date)) return '-'
        return date.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch {
        return '-'
      }
    }

    const formatCurrency = (amount) => {
      const numAmount = parseFloat(String(amount).replace(/,/g, '')) || 0
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numAmount)
    }

    const formatQuantity = (value) => {
      const numValue = parseFloat(String(value).replace(/,/g, '')) || 0
      return numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    /**
     * Parse API response data
     */
    const extractItemsFromResponse = (response) => {
      const { data } = response

      // Handle { rows: [...] } format (primary)
      if (Array.isArray(data?.rows)) {
        return data.rows
      }

      // Handle direct array
      if (Array.isArray(data)) {
        return data
      }

      // Handle { items: [...] } format
      if (Array.isArray(data?.items)) {
        return data.items
      }

      // Handle { data: [...] } format
      if (Array.isArray(data?.data)) {
        return data.data
      }

      // Handle stringified JSON
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed?.rows)) return parsed.rows
          if (Array.isArray(parsed)) return parsed
          if (Array.isArray(parsed?.items)) return parsed.items
          if (Array.isArray(parsed?.data)) return parsed.data
        } catch {
          // ignore parse error
        }
      }

      return []
    }

    /**
     * Load report data
     */
    const loadReport = async () => {
      error.value = null

      // Validate dates
      if (!filters.value.startDate || !filters.value.endDate) {
        rawItems.value = []
        error.value = 'من فضلك حدد تاريخ البداية وتاريخ النهاية ثم اضغط بحث'
        return
      }

      // Validate date range
      try {
        const startDate = new Date(filters.value.startDate)
        const endDate = new Date(filters.value.endDate)
        if (endDate < startDate) {
          rawItems.value = []
          error.value = 'تأكد أن تاريخ النهاية بعد أو يساوي تاريخ البداية'
          return
        }
      } catch (e) {
        // let API handle parse errors
      }

      loading.value = true
      error.value = null

      try {
        const response = await getSuppliesReportData(
          buildQueryParams(filters.value),
          'json'
        )

        const items = extractItemsFromResponse(response)
        rawItems.value = items

        console.log('✓ Loaded items count:', items.length)
        if (items.length > 0) {
          console.log('✓ First mapped item:', mapItem(items[0]))
        }
      } catch (err) {
        console.error('✗ Error loading supplies report:', err)
        error.value = err.response?.data?.message || 'Failed to load report'
      } finally {
        loading.value = false
      }
    }

    /**
     * Refresh report
     */
    const refresh = async () => {
      await loadReport()
    }

    /**
     * Clear filters
     */
    const clearFilters = () => {
      filters.value = {
        q: '',
        startDate: '',
        endDate: ''
      }
      rawItems.value = []
    }

    /**
     * Download report as Excel
     */
    const downloadReport = async () => {
      downloading.value = true
      error.value = null

      try {
        const { data, headers } = await downloadSuppliesReport(
          buildQueryParams(filters.value),
          'xlsx'
        )

        const filename = `supplies-report-${filters.value.startDate}_${filters.value.endDate}.xlsx`
        const blob = new Blob([data], {
          type: headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('✗ Error downloading report:', err)
        error.value = err.response?.data?.message || 'Failed to download report'
      } finally {
        downloading.value = false
      }
    }

    /**
     * Initialize component
     */
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
      mappedItems,
      filters,
      totalAmount,
      totalQuantity,
      averagePrice,
      formatDate,
      formatCurrency,
      formatQuantity,
      loadReport,
      refresh,
      clearFilters,
      downloadReport
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('supply.exportTableTitle') }}</h3>
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
      <div class="px-4 py-3 text-sm text-gray-600">Exports/Supplies Report</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.crusher') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.location') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.crusherTicket') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.companyTicket') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.unitPrice') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.total') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="items.length">
            <tr v-for="(supply, index) in items" :key="supply.id || index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ supply.createdAt ? formatDate(supply.createdAt) : '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ supply.crusherName || supply.crusher || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ supply.siteName || supply.site || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ supply.crusherTicket || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ supply.companyTicket || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(supply.unitPrice || 0) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{ formatCurrency(supply.totalAmount || supply.total || 0) }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="px-6 py-8 text-center text-sm text-gray-500">{{ $t('labels.noData') }}</td>
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
            <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalAmount) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Total Quantity</p>
            <p class="text-lg font-semibold text-indigo-600">{{ totalQuantity }} units</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Average Price</p>
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

export default {
  name: 'SuppliesReport',
  setup() {
    const downloading = ref(false)
    const error = ref(null)
    const loading = ref(false)
    const items = ref([])
    const filters = ref({
      q: '',
      startDate: '',
      endDate: ''
    })

    const totalAmount = computed(() => {
      return items.value.reduce((sum, item) => {
        const amount = parseFloat(String(item.totalAmount || item.total || 0).replace(/,/g, '')) || 0
        return sum + amount
      }, 0)
    })

    const totalQuantity = computed(() => {
      return items.value.reduce((sum, item) => {
        const qty = parseFloat(String(item.quantity || 0).replace(/,/g, '')) || 0
        return sum + qty
      }, 0)
    })

    const averagePrice = computed(() => {
      if (items.value.length === 0) return 0
      return totalAmount.value / items.value.length
    })

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString()
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount || 0)
    }

    const loadReport = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await getSuppliesReportData({
          q: filters.value.q,
          startDate: filters.value.startDate,
          endDate: filters.value.endDate
        })
        
        const { data } = response
        console.log('Raw response:', { data })
        
        let parsedItems = []
        if (Array.isArray(data)) {
          parsedItems = data
        } else if (data?.items && Array.isArray(data.items)) {
          parsedItems = data.items
        } else if (data?.data && Array.isArray(data.data)) {
          parsedItems = data.data
        }

        // Normalize possible header variations (Arabic / English / different keys)
        const normalize = (row) => {
          const r = {}
          // date
          r.createdAt = row.createdAt || row.date || row.Date || row['التاريخ'] || row['التاريخ'] || row['Date'] || row['date'] || row['created_at'] || row['Created At'] || row['تاريخ'] || row['التاريخ']
          // crusher / crusherName
          r.crusherName = row.crusherName || row.crusher || row['الكسارة'] || row['crusher'] || row['Crusher'] || row['crusherName']
          // site / siteName / location
          r.siteName = row.siteName || row.site || row.location || row['الموقع'] || row['location'] || row['site']
          // tickets
          r.crusherTicket = row.crusherTicket || row['تذكرة الكسارة'] || row['crusherTicket'] || row['crusher_ticket']
          r.companyTicket = row.companyTicket || row['تذكرة الشركة'] || row['companyTicket'] || row['company_ticket']
          // numeric fields
          const parseNumber = (v) => {
            if (v == null) return 0
            if (typeof v === 'number') return v
            const s = String(v).replace(/[,\s]/g, '')
            const n = parseFloat(s)
            return isNaN(n) ? 0 : n
          }
          r.unitPrice = parseNumber(row.unitPrice || row['سعر الوحدة'] || row['unitPrice'] || row.price || row['سعر الوحدة'])
          r.totalAmount = parseNumber(row.totalAmount || row.total || row['المجموع'] || row['total'] || row.amount)
          r.quantity = parseNumber(row.quantity || row.cubic || row['المكعب'] || row['quantity'])
          // preserve original id if present
          r.id = row.id || row.ID || row.Id || null
          return r
        }

        const normalized = parsedItems.map(normalize)
        items.value = normalized
        console.log('Parsed items count:', parsedItems.length)
      } catch (err) {
        console.error('Error loading supplies report:', err)
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
        endDate: ''
      }
      loadReport()
    }

    const downloadReport = async () => {
      downloading.value = true
      error.value = null
      try {
        const { data, headers } = await downloadSuppliesReport({
          q: filters.value.q,
          startDate: filters.value.startDate,
          endDate: filters.value.endDate
        })
        
        const filename = `supplies-${filters.value.startDate}_${filters.value.endDate}.xlsx`
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
      
      loadReport()
    })

    return {
      downloading,
      error,
      loading,
      items,
      filters,
      totalAmount,
      totalQuantity,
      averagePrice,
      formatDate,
      formatCurrency,
      loadReport,
      refresh,
      clearFilters,
      downloadReport
    }
  }
}
</script>

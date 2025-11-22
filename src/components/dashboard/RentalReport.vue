<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('rental.reportTitle') }}</h3>
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
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('rental.searchPlaceholder') }}</label>
          <input 
            v-model="filters.q"
            @keyup.enter="loadReport"
            type="text"
            placeholder="Equipment, Name..."
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

        <!-- Equipment Type Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('rental.type') }}</label>
          <select 
            v-model="filters.isCompanyOwned"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option :value="null">{{ $t('labels.all') }}</option>
            <option :value="true">{{ $t('rental.companyEquipment') }}</option>
            <option :value="false">{{ $t('rental.externalRental') }}</option>
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
      <div class="px-4 py-3 text-sm text-gray-600">{{ $t('rental.reportDescription') }}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('rental.date') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('rental.equipment') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('rental.name') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('rental.type') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('rental.hours') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('rental.hourlyRate') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('rental.total') }}</th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('rental.paid') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="items.length">
            <tr v-for="(rental, index) in items" :key="rental['م'] || index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ rental['التاريخ'] || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ rental['المعدة'] || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ rental['الاسم'] || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <Badge :variant="rental['النوع']?.includes('شركة') ? 'company' : 'external'">
                  {{ rental['النوع'] || '-' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ rental['ساعات التشغيل'] || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(rental['سعر الساعة'] || 0) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{ formatCurrency(rental['الإجمالي'] || 0) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span v-if="rental['المدفوع'] && rental['المدفوع'] > 0" class="text-green-600 font-medium">{{ formatCurrency(rental['المدفوع'] || 0) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="8" class="px-6 py-8 text-center text-sm text-gray-500">{{ $t('labels.noData') }}</td>
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
            <p class="text-xs text-gray-600">{{ $t('rental.totalSum') }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalAmount) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">{{ $t('rental.paid') }}</p>
            <p class="text-lg font-semibold text-green-600">{{ formatCurrency(totalPaid) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">{{ $t('rental.remaining') }}</p>
            <p class="text-lg font-semibold text-orange-600">{{ formatCurrency(totalRemaining) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getRentalReportData, downloadRentalReport } from '@/api'
import Badge from '../shared/Badge.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'

export default {
  name: 'RentalReport',
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
      isCompanyOwned: null
    })

    const totalAmount = computed(() => {
      return items.value.reduce((sum, item) => {
        const amount = parseFloat(String(item['الإجمالي'] || item.total || item.totalAmount || 0).replace(/,/g, '')) || 0
        return sum + amount
      }, 0)
    })

    const totalPaid = computed(() => {
      return items.value.reduce((sum, item) => {
        const amount = parseFloat(String(item['المدفوع'] || item.paidAmount || item.paid || 0).replace(/,/g, '')) || 0
        return sum + amount
      }, 0)
    })

    const totalRemaining = computed(() => {
      return totalAmount.value - totalPaid.value
    })

    const formatDate = (dateString) => {
      // Backend already provides formatted date, just return it
      if (!dateString) return '-'
      return dateString
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount || 0)
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
      try {
        const response = await getRentalReportData(
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

        // Normalize items to include the Arabic keys expected by the template
        const normalized = parsedItems.map(raw => {
          // Use existing Arabic keys if present, otherwise map from English keys
          const date = raw['التاريخ'] || raw.date || raw['date'] || raw.createdAt || raw.dt || ''
          const equipment = raw['المعدة'] || raw.equipment || raw.item || raw.equipmentName || ''
          const name = raw['الاسم'] || raw.name || raw.person || ''
          // Determine type label
          let typeLabel = raw['النوع'] || ''
          if (!typeLabel) {
            if (typeof raw.isCompanyOwned === 'boolean') {
              typeLabel = raw.isCompanyOwned ? 'شركة' : 'خارجية'
            } else if (raw.companyOwned || raw.ownedByCompany) {
              typeLabel = 'شركة'
            }
          }
          const hours = raw['ساعات التشغيل'] || raw.hours || raw.hourlyHours || raw.paidHours || ''
          const hourlyRate = raw['سعر الساعة'] || raw.hourlyRate || raw.rate || raw.price || 0
          const total = raw['الإجمالي'] || raw.total || raw.totalAmount || raw.amount || 0
          const paid = raw['المدفوع'] || raw.paid || raw.paidAmount || 0

          return {
            ...raw,
            'التاريخ': date,
            'المعدة': equipment,
            'الاسم': name,
            'النوع': typeLabel,
            'ساعات التشغيل': hours,
            'سعر الساعة': hourlyRate,
            'الإجمالي': total,
            'المدفوع': paid
          }
        })

        items.value = normalized
        console.log('Parsed items count:', normalized.length)
        console.log('First item:', items.value[0])
      } catch (err) {
        console.error('Error loading rental report:', err)
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
        isCompanyOwned: null
      }
      // Do not auto-load after clearing filters: user must click Search
      items.value = []
    }

    const fallbackDownload = (data, filename, headers) => {
      const blob = new Blob([data], { type: headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    }

    const downloadReport = async () => {
      downloading.value = true
      error.value = null
        try {
          const { data, headers } = await downloadRentalReport(
            buildQueryParams(filters.value),
            'xlsx'
          )
        
        const disposition = headers['content-disposition'] || headers['Content-Disposition']
        let filename = 'rentals-report.xlsx'
        if (disposition) {
          const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
          const encoded = match && (match[1] || match[2])
          if (encoded) {
            try {
              filename = decodeURIComponent(encoded)
            } catch (_) {
              filename = encoded
            }
          }
        }

        // Try File System Access API if available
        if (window.showSaveFilePicker) {
          try {
            const fileHandle = await window.showSaveFilePicker({
              suggestedName: filename,
              types: [{
                description: 'Excel Workbook',
                accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
              }]
            })
            const writable = await fileHandle.createWritable()
            await writable.write(data)
            await writable.close()
            if (window.$toast) {
              window.$toast('Download successful', 'success')
            }
          } catch (e) {
            // If user cancels or API fails, fall back to default browser download
            fallbackDownload(data, filename, headers)
          }
        } else {
          // Fallback: anchor download
          fallbackDownload(data, filename, headers)
        }
      } catch (err) {
        console.error('Error downloading report:', err)
        error.value = err.response?.data?.message || 'Failed to download report'
      } finally {
        downloading.value = false
      }
    }

    onMounted(() => {
      // Set default date range (last 30 days) but DO NOT auto-load.
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      filters.value.endDate = endDate.toISOString().split('T')[0]
      filters.value.startDate = startDate.toISOString().split('T')[0]
      // User must click Search to load data
    })

    return {
      downloading,
      error,
      loading,
      items,
      filters,
      totalAmount,
      totalPaid,
      totalRemaining,
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

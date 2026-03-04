<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('transport.reportTitle') }}</h2>
      <div class="flex items-center gap-2">
        <button @click="refresh" :disabled="loading"
          class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
          {{ $t('labels.refresh') }}
        </button>
        <button @click="downloadReport" :disabled="downloading"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
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
          <input v-model="filters.q" @keyup.enter="loadReport" type="text" :placeholder="$t('placeholders.search')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
          <input v-model="filters.startDate" type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
          <input v-model="filters.endDate" type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="loadReport" :disabled="loading"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium">
          {{ $t('labels.search') }}
        </button>
        <button @click="clearFilters"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm font-medium">
          {{ $t('labels.clear') }}
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      <div class="px-4 py-3 text-sm text-gray-600">{{ $t('transport.reportDescription') }}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-indigo-50">
            <tr>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.date') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.contractor') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.fromLocation') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.toLocation') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.vehicleName') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.numTrips') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.distanceKm') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.firstKmPrice') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.perKmPrice') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.total') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('transport.notes') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="items.length">
            <tr v-for="(transport, index) in items" :key="transport.ID || transport.id || index"
              class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transport.date ?
                formatDate(transport.date) : '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transport.contractor || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transport.from || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transport.to || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transport.vehicleName || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transport.numTrips || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transport.distance || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(transport.firstKmPrice || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(transport.perKmPrice || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{
                formatCurrency(transport.total || 0) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ transport.notes || '-' }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="11" class="px-6 py-2 text-start text-sm text-gray-500">{{ $t('labels.noData') }}</td>
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
            <p class="text-xs text-gray-600">Average First Km Price</p>
            <p class="text-lg font-semibold text-indigo-600">{{ formatCurrency(avgFirstKmPrice) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Average Per Km Price</p>
            <p class="text-lg font-semibold text-teal-600">{{ formatCurrency(avgPerKmPrice) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Total Distance</p>
            <p class="text-lg font-semibold text-orange-600">{{ totalDistance }} km</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getTransportReportData, downloadTransportReport } from '@/api'
import { buildQueryParams } from '@/utils/buildQueryParams'

export default {
  name: 'TransportReport',
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
        const amount = parseFloat(String(item.total || 0).toString().replace(/,/g, '')) || 0
        return sum + amount
      }, 0)
    })

    const totalDistance = computed(() => {
      return items.value.reduce((sum, item) => {
        const distance = parseFloat(String(item.distance || 0).toString().replace(/,/g, '')) || 0
        return sum + distance
      }, 0)
    })

    const avgFirstKmPrice = computed(() => {
      if (items.value.length === 0) return 0
      return items.value.reduce((s, it) => s + (parseFloat(String(it.firstKmPrice || 0)) || 0), 0) / items.value.length
    })

    const avgPerKmPrice = computed(() => {
      if (items.value.length === 0) return 0
      return items.value.reduce((s, it) => s + (parseFloat(String(it.perKmPrice || 0)) || 0), 0) / items.value.length
    })

    const formatDate = (dateString) => {
      if (!dateString) return '-'

      const d = new Date(dateString)
      if (isNaN(d.getTime())) return dateString

      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(d)
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
      error.value = null
      try {
        const response = await getTransportReportData(
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

        // Normalize items to a consistent shape for the template
        const normalized = parsedItems.map(raw => {
          const date = raw['التاريخ'] || raw.date || raw.createdAt || raw.created_at || raw.Date || ''
          const contractor = raw['المقاول'] || raw.contractor || raw.contractorName || raw.name || raw.supplier || ''
          const from = raw['من'] || raw.fromLocation || raw.from || raw.fromLoc || raw.origin || ''
          const to = raw['إلى'] || raw.toLocation || raw.to || raw.toLoc || raw.destination || ''
          const vehicleName = raw['المركبة'] || raw.vehicleName || raw.vehicle || raw.truckName || ''
          const numTrips = raw['عدد النقلات'] || raw.numTrips || raw.trips || raw.count || 0
          const distance = raw['المسافة (كم)'] || raw['المسافة'] || raw.distance || raw.distanceKm || raw.km || 0
          const firstKmPrice = raw['سعر أول كم'] || raw['سعر أول كيلومتر'] || raw.firstKmPrice || raw.pricing?.firstKmPrice || 0
          const perKmPrice = raw['سعر كل كم'] || raw['سعر كل كيلومتر'] || raw.perKmPrice || raw.pricing?.perKmPrice || 0
          const total = raw['الإجمالي'] || raw.total || raw.totalAmount || raw.amount || 0
          const notes = raw['الملاحظات'] || raw.notes || raw.comment || raw.description || ''
          return {
            ...raw,
            date,
            contractor,
            from,
            to,
            vehicleName,
            numTrips: Number(numTrips) || 0,
            distance: Number(distance) || 0,
            firstKmPrice: Number(firstKmPrice) || 0,
            perKmPrice: Number(perKmPrice) || 0,
            total: Number(total) || 0,
            notes
          }
        })

        items.value = normalized
        console.log('Parsed items count:', normalized.length)
        console.log('First item:', normalized[0])
      } catch (err) {
        console.error('Error loading transport report:', err)
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
      // Do not auto-load after clearing filters: user must click Search
      items.value = []
    }

    const downloadReport = async () => {
      downloading.value = true
      error.value = null
      try {
        const { data, headers } = await downloadTransportReport(
          buildQueryParams(filters.value)
        )

        const filename = `transports-${filters.value.startDate}_${filters.value.endDate}.xlsx`
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
      totalDistance,
      avgFirstKmPrice,
      avgPerKmPrice,
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

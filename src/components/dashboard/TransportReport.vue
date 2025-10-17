<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('transport.reportTitle') }}</h3>
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

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="text-sm text-red-800">{{ error }}</div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-4 py-3 text-sm text-gray-600">{{ $t('transport.reportDescription') }}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('transport.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('transport.contractor') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('transport.route') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('transport.trips') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('transport.distance') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('transport.total') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="items.length">
            <tr v-for="t in items" :key="t.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(t.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ t.contractor?.name || '-' }}</div>
                <div class="text-sm text-gray-500">{{ t.contractor?.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ t.fromLoc }} → {{ t.toLoc }}</div>
                <div class="text-sm text-gray-500">{{ t.vehicleName }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ t.numTrips }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ t.distanceKm }} km</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatCurrency(t.total) }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">{{ $t('labels.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { getTransports, getTransportReport } from '@/api'

export default {
  name: 'TransportReport',
  data() {
    return {
      downloading: false,
      error: null,
      loading: false,
      items: []
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount || 0)
    },
    async refresh() {
      this.loading = true
      this.error = null
      try {
        const { data } = await getTransports()
        this.items = data.items || []
      } catch (error) {
        this.error = error.response?.data?.message || this.$t('common.loadError')
      } finally {
        this.loading = false
      }
    },
    async downloadReport() {
      this.downloading = true
      this.error = null
      try {
        const { data, headers } = await getTransportReport()
        const disposition = headers['content-disposition'] || headers['Content-Disposition']
        let filename = 'transports.xlsx'
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
        } else {
          // Fallback: anchor download
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
      } catch (error) {
        this.error = error.response?.data?.message || this.$t('common.loadError')
      } finally {
        this.downloading = false
      }
    }
  },
  async mounted() {
    await this.refresh()
  }
}
</script>



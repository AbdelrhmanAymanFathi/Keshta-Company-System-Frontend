<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl' : ''" class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('contractors.statementTitle') }}</h2>
      <div class="flex items-center gap-2">
        <button @click="refresh" :disabled="loading"
          class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
          {{ $t('labels.refresh') }}
        </button>
        <button @click="downloadReport('xlsx')" :disabled="downloading"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
          </svg>
          {{ downloading ? $t('labels.downloading') : $t('contractors.exportExcel') }}
        </button>
        <button @click="downloadReport('csv')" :disabled="downloading"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
          </svg>
          {{ downloading ? $t('labels.downloading') : $t('contractors.exportCSV') }}
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4">
      <h4 class="text-sm font-semibold text-gray-700">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Contractor Selector -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('contractors.name') }}</label>
          <select v-model="selectedContractorId" @change="onContractorChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            <option value="">{{ $t('contractors.selectContractor') }}</option>
            <option v-for="c in contractors" :key="c.id" :value="c.id">{{ (isRTL && c.arName) ? c.arName : c.name }}</option>
          </select>
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

        <!-- Load Button -->
        <div class="flex items-end">
          <button @click="loadReport" :disabled="loading || !selectedContractorId"
            class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium">
            {{ $t('contractors.loadStatement') }}
          </button>
        </div>
      </div>

      <div class="flex gap-2">
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

    <!-- Summary Cards -->
    <div v-else-if="report && report.contractorName" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-xs text-gray-600 mb-1">{{ $t('contractors.contractorName') }}</p>
        <p class="text-lg font-semibold text-gray-900">{{ getContractorDisplayName(report) }}</p>
      </div>
      <div v-if="showSupply" class="bg-white rounded-lg shadow p-4">
        <p class="text-xs text-gray-600 mb-1">{{ $t('contractors.suppliesEarnings') }}</p>
        <p class="text-lg font-semibold text-blue-600">{{ formatCurrency(report.closingBalance ?? report.totals?.closingBalance ?? 0) }}</p>
      </div>
      <div v-if="showTransport" class="bg-white rounded-lg shadow p-4">
        <p class="text-xs text-gray-600 mb-1">{{ $t('contractors.transportEarnings') }}</p>
        <p class="text-lg font-semibold text-green-600">{{ formatCurrency(report.totals?.transportEarnings || 0) }}</p>
      </div>
      <!-- <div class="bg-white rounded-lg shadow p-4">
        <p class="text-xs text-gray-600 mb-1">{{ $t('contractors.totalEarnings') }}</p>
        <p class="text-lg font-semibold text-indigo-600">{{ formatCurrency(report.totals?.earnings || 0) }}</p>
      </div> -->
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-xs text-gray-600 mb-1">{{ translateWithFallback('contractors.depositedThisPeriod', 'contractors.totalDeposits') }}</p>
        <p class="text-lg font-semibold text-teal-600">{{ formatCurrency(report.totals?.deposits || 0) }}</p>
      </div>
      <div v-if="showDeposits" class="bg-white rounded-lg shadow p-4">
        <p class="text-xs text-gray-600 mb-1">{{ $t('contractors.totalDeposits') }}</p>
        <p class="text-lg font-semibold text-purple-600">{{ formatCurrency(report.totals?.deposits || 0) }}</p>
      </div>
      
    </div>

    <!-- Balance Owed Card -->
    <div v-if="report && report.rows && report.rows.length > 0" class="bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p class="text-xs text-gray-600 mb-1">{{ $t('contractors.openingBalance') }}</p>
          <p class="text-lg font-semibold" :class="report.openingBalance >= 0 ? 'text-gray-900' : 'text-red-600'">
            {{ formatCurrency(Math.abs(report.openingBalance || 0)) }}
            <span class="text-sm">({{ report.openingBalance >= 0 ? $t('contractors.owedByCompany') :
              $t('contractors.owedToCompany') }})</span>
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-600 mb-1">{{ $t('contractors.closingBalance') }}</p>
          <p class="text-lg font-semibold" :class="report.closingBalance >= 0 ? 'text-gray-900' : 'text-red-600'">
            {{ formatCurrency(Math.abs(report.closingBalance || 0)) }}
            <span class="text-sm">({{ report.closingBalance >= 0 ? $t('contractors.owedByCompany') :
              $t('contractors.owedToCompany') }})</span>
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-600 mb-1">{{ $t('contractors.balanceOwed') }}</p>
          <p class="text-lg font-semibold text-red-600">
            {{ formatCurrency(lastBalanceOwed) }}
          </p>
        </div>
      </div>
      <div v-if="filters.startDate || filters.endDate" class="mt-2 text-xs text-gray-500">
        {{ $t('contractors.dateRange') }}:
        {{ filters.startDate || $t('contractors.startOfTime') }}
        {{ $t('labels.to') }}
        {{ filters.endDate || $t('contractors.endOfTime') }}
      </div>
    </div>

    <!-- Statement Table -->
    <div v-if="report && report.rows && report.rows.length > 0" class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-4 py-3 text-sm text-gray-600">{{ $t('contractors.statementDescription') }}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.date') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.type') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('contractors.refId') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.description') }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-right">
                {{ $t('contractors.earnings') }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-right">
                {{ $t('contractors.payments') }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-right">
                {{ $t('contractors.balanceOwed') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(row, index) in paginatedRows" :key="index" :class="[
              'hover:bg-gray-50',
              row.type === 'DEPOSIT' ? 'bg-green-50' : '',
              row.type === 'TRANSPORT' || row.type === 'SUPPLY' ? 'bg-blue-50' : '',
              row.type === 'OPENING' ? 'bg-gray-100' : ''
            ]">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ row.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <Badge :variant="getTypeVariant(row.type)">
                  {{ getTypeLabel(row.type) }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ row.refId || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ row.description || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-green-600">
                {{ formatCurrency(row.earnings || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-red-600">
                {{ formatCurrency(row.payments || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-indigo-600">
                {{ formatCurrency(row.balanceOwed || 0) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination v-if="totalPages > 1" :current-page="currentPage" :page-size="pageSize" :total="report.rows.length"
        :total-pages="totalPages" :page-size-options="[10, 20, 50, 100]" @update:page="currentPage = $event"
        @update:pageSize="onPageSizeChange" />
    </div>

    <!-- Empty State -->
    <div v-else-if="report && (!report.rows || report.rows.length === 0)"
      class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-500">{{ $t('contractors.noStatementData') }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { getContractorReportData, downloadContractorReport, getContractors } from '@/api'
import Badge from '../shared/Badge.vue'
import Pagination from '../shared/Pagination.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'
// import { useRoute } from 'vue-router'

export default {
  name: 'ContractorStatement',
  components: { Badge, Pagination },
  props: {
    mode: {
      type: String,
      default: undefined
    }
  },

  setup(props) {
    const instance = getCurrentInstance()
    const downloading = ref(false)
    const error = ref(null)
    const loading = ref(false)
    const report = ref(null)
    const contractors = ref([])
    const selectedContractorId = ref('')
    const mode = ref(undefined)
    const filters = ref({
      startDate: '',
      endDate: ''
    })
    const currentPage = ref(1)
    const pageSize = ref(50)

    const isRTL = computed(() => {
      return instance && instance.proxy && instance.proxy.$i18n && instance.proxy.$i18n.locale === 'ar'
    })

    const t = (key, ...args) => {
      try {
        return instance.proxy.$t(key, ...args)
      } catch (e) {
        return key
      }
    }

    const parseModeInput = (input) => {
      if (!input) return ''
      const s = String(input).trim()
      if (!s) return ''
      const low = s.toLowerCase()
      if (low === 'export') return 'SUPPLY'
      if (low === 'supply') return 'SUPPLY'
      if (low === 'transport') return 'TRANSPORT'
      if (low === 'expense') return 'EXPENSE'
      if (low === 'deposit') return 'DEPOSIT'
      if (low === 'withdrawal') return 'WITHDRAWAL'
      return s.toUpperCase()
    }

    // statementMode: uppercase mode for report APIs (e.g. SUPPLY, TRANSPORT)
    const statementMode = computed(() => parseModeInput(mode.value || props.mode || ''))
    // contractorsListMode: lowercase mode for contractor list filtering (e.g. supply, transport)
    const contractorsListMode = computed(() => {
      return statementMode.value ? statementMode.value.toLowerCase() : undefined
    })

    const lastBalanceOwed = computed(() => {
      if (!report.value || !report.value.rows || report.value.rows.length === 0) return 0
      const lastRow = report.value.rows[report.value.rows.length - 1]
      return lastRow.balanceOwed || 0
    })

    // Normalize mode (use reactive mode if set, otherwise fall back to prop)
    const currentMode = computed(() => {
      // normalize to string if available
      const m = mode.value || props.mode || ''
      return m ? String(m) : ''
    })

    const normalizedMode = computed(() => (currentMode.value || '').toUpperCase())

    const showSupply = computed(() => {
      return !statementMode.value || statementMode.value === 'SUPPLY'
    })

    const showTransport = computed(() => {
      return !statementMode.value || statementMode.value === 'TRANSPORT'
    })

    const showDeposits = computed(() => {
      return !statementMode.value || statementMode.value === 'DEPOSIT'
    })

    const paginatedRows = computed(() => {
      if (!report.value || !report.value.rows) return []
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return report.value.rows.slice(start, end)
    })

    const totalPages = computed(() => {
      if (!report.value || !report.value.rows) return 0
      return Math.ceil(report.value.rows.length / pageSize.value)
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    const getTypeVariant = (type) => {
      const variants = {
        'SUPPLY': 'info',
        'TRANSPORT': 'info',
        'EXPENSE': 'danger',
        'DEPOSIT': 'success',
        'WITHDRAWAL': 'warning',
        'OPENING': 'default'
      }
      return variants[type] || 'default'
    }

    const translateWithFallback = (primaryKey, fallbackKey) => {
      const primary = t(primaryKey)
      if (primary && primary !== primaryKey) return primary
      const fallback = t(fallbackKey)
      return (fallback && fallback !== fallbackKey) ? fallback : primaryKey
    }

    const getTypeLabel = (type) => {
      const labels = {
        'SUPPLY': translateWithFallback('contractors.typeSupply', 'contractors.typeExport'),
        'TRANSPORT': translateWithFallback('contractors.typeTransport', 'contractors.typeTransport'),
        'EXPENSE': translateWithFallback('contractors.typeExpense', 'contractors.typeExpense'),
        'DEPOSIT': t('labels.deposit'),
        'WITHDRAWAL': translateWithFallback('contractors.typeWithdrawal', 'contractors.typeWithdrawal'),
        'OPENING': t('contractors.openingBalance')
      }
      return labels[type] || type
    }

    const getContractorDisplayName = (rep) => {
      if (!rep) return '-'
      const ar = rep.contractorArName || (rep.contractor && (rep.contractor.arName || rep.contractor.ar_name))
      const en = rep.contractorName || (rep.contractor && (rep.contractor.name || rep.contractor.en_name))
      if (isRTL.value) return ar || en || '-'
      return en || ar || '-'
    }

    const depositedThisPeriod = computed(() => {
      if (!report.value || !report.value.rows) return 0
      return report.value.rows.reduce((sum, row) => {
        if (!row || String(row.type || '').toUpperCase() !== 'DEPOSIT') return sum
        const amount = Number(row.payments ?? row.earnings ?? 0) || 0
        return sum + amount
      }, 0)
    })

    const loadContractors = async () => {
      try {
        const res = await getContractors({ page: 1, pageSize: 1000, mode: contractorsListMode.value || undefined })
        const payload = res.data || {}
        contractors.value = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : []
      } catch (e) {
        console.error('Error loading contractors:', e)
        contractors.value = []
      }
    }

    const loadReport = async () => {
      error.value = null

      if (!selectedContractorId.value) {
        error.value = t('contractors.selectContractorFirst')
        return
      }

      // Validate date range
      if (filters.value.startDate && filters.value.endDate) {
        try {
          const s = new Date(filters.value.startDate)
          const e = new Date(filters.value.endDate)
          if (e < s) {
            error.value = t('contractors.invalidDateRange')
            return
          }
        } catch (e) {
          // ignore parse error
        }
      }

      loading.value = true
      try {
        // build params only with provided values
        const p = {}
        if (filters.value.startDate) p.startDate = filters.value.startDate
        if (filters.value.endDate) p.endDate = filters.value.endDate
        p.format = 'json'
        if (statementMode.value) p.mode = statementMode.value

        const params = buildQueryParams(p)

        const { data } = await getContractorReportData(selectedContractorId.value, params, 'json', statementMode.value || undefined)
        report.value = data
        currentPage.value = 1
      } catch (err) {
        console.error('Error loading contractor report:', err)
        error.value = err.response?.data?.message || t('contractors.reportLoadError')
        report.value = null
      } finally {
        loading.value = false
      }
    }

    const downloadReport = async (format) => {
      if (!selectedContractorId.value) {
        error.value = t('contractors.selectContractorFirst')
        return
      }

      downloading.value = true
      error.value = null
      try {
        const p = {}
        if (filters.value.startDate) p.startDate = filters.value.startDate
        if (filters.value.endDate) p.endDate = filters.value.endDate
        p.format = format
        if (statementMode.value) p.mode = statementMode.value

        const params = buildQueryParams(p)

        const { data } = await downloadContractorReport(selectedContractorId.value, params, format, statementMode.value || undefined)

        const contractor = contractors.value.find(c => String(c.id) === String(selectedContractorId.value) || c.id === parseInt(selectedContractorId.value))
        const rawName = contractor ? ((isRTL.value && contractor.arName) ? contractor.arName : contractor.name) : String(selectedContractorId.value)
        const contractorName = String(rawName || selectedContractorId.value).replace(/[^a-zA-Z0-9]/g, '_')
        const dateRange = filters.value.startDate && filters.value.endDate
          ? `${filters.value.startDate}_${filters.value.endDate}`
          : 'all'
        const extension = format === 'csv' ? 'csv' : 'xlsx'
        const filename = `contractor-${contractorName}-statement-${dateRange}.${extension}`

        const contentType = format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

        const blob = new Blob([data], { type: contentType })
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
        error.value = err.response?.data?.message || t('contractors.reportDownloadError')
      } finally {
        downloading.value = false
      }
    }

    const refresh = async () => {
      await loadReport()
    }

    const clearFilters = () => {
      filters.value = {
        startDate: '',
        endDate: ''
      }
      report.value = null
      currentPage.value = 1
    }

    const onContractorChange = () => {
      report.value = null
      currentPage.value = 1
    }

    const onPageSizeChange = (newSize) => {
      pageSize.value = newSize
      currentPage.value = 1
    }

    onMounted(async () => {
      // const route = useRoute()
      await loadContractors()
      // Set default date range to last 30 days
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      filters.value.endDate = endDate.toISOString().split('T')[0]
      filters.value.startDate = startDate.toISOString().split('T')[0]

      // Check if contractor ID was passed via localStorage (from navigation)
      const storedContractorId = localStorage.getItem('contractor-statement-id')
      if (storedContractorId) {
        selectedContractorId.value = storedContractorId
        localStorage.removeItem('contractor-statement-id') // Clear after use
        // Optionally auto-load the report
        // await loadReport()
      }

      // Fix: use 'route' and 'mode' correctly and make mode reactive for use in template
      // const typeFromQuery = route?.query?.transaction_type
      // if (typeof typeFromQuery === 'string' && ['EXPORT', 'TRANSPORT', 'EXPENSE', 'DEPOSIT'].includes(typeFromQuery)) {
      //   mode.value = typeFromQuery
      // }

      // Then change your API calls to use mode.value || props.mode || undefined
    }
    )

    return {
      downloading,
      error,
      loading,
      report,
      contractors,
      selectedContractorId,
      showSupply,
      showTransport,
      showDeposits,
      depositedThisPeriod,
      translateWithFallback,
      filters,
      currentPage,
      pageSize,
      isRTL,
      lastBalanceOwed,
      paginatedRows,
      totalPages,
      formatCurrency,
      getTypeVariant,
      getTypeLabel,
      getContractorDisplayName,
      loadReport,
      downloadReport,
      refresh,
      clearFilters,
      onContractorChange,
      onPageSizeChange
    }
  }
}
</script>

<style scoped>
.direction-rtl input,
.direction-rtl select,
.direction-rtl textarea {
  direction: rtl;
  text-align: right;
}

.direction-rtl table th,
.direction-rtl table td {
  text-align: right;
}
</style>

<template>
  <div class="space-y-6">
    <PageHeader :title="$t('expenses.reportTitle')" :subtitle="$t('expenses.reportDescription')">
      <div class="flex flex-wrap items-center gap-2">
        <button @click="refresh" :disabled="loading"
                class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium theme-text-primary transition-colors hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:py-2 shadow-2xs">
          {{ $t('labels.refresh') }}
        </button>
        <button @click="downloadReport('xlsx')" :disabled="downloading"
                class="inline-flex items-center gap-1.5 rounded-xl theme-button px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-2xs transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14"/>
          </svg>
          Excel
        </button>
        <button @click="downloadReport('csv')" :disabled="downloading"
                class="inline-flex items-center gap-1.5 rounded-xl theme-button px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-2xs transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14"/>
          </svg>
          CSV
        </button>
        <button @click="downloadReport('pdf')" :disabled="downloading"
                class="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-2xs transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14"/>
          </svg>
          PDF
        </button>
      </div>
    </PageHeader>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4">
      <h4 class="text-sm font-semibold theme-text-secondary">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.startDate') }}</label>
          <DateField
            v-model="filters.startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
          />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.endDate') }}</label>
          <DateField
            v-model="filters.endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
          />
        </div>

        <!-- Settlement Date From -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.settlementDate') }} {{ $t('labels.startDate') }}</label>
          <DateField
            v-model="filters.settlementDateStart"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
          />
        </div>

        <!-- Settlement Date To -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.settlementDate') }} {{ $t('labels.endDate') }}</label>
          <DateField
            v-model="filters.settlementDateEnd"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
          />
        </div>

        <!-- Category (Main Term) Filter -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.mainTerm') }}</label>
          <SearchDropdown
            v-model="categorySearchText"
            :items="categories"
            :allItems="categories"
            :placeholder="$t('expenses.searchMainTerm') || $t('placeholders.search')"
            clearable
            @select="(sel) => { filters.categoryId = sel.id; categorySearchText = sel.name; filters.subCategoryId = ''; subCategorySearchText = '' }"
            @clear="() => { filters.categoryId = ''; categorySearchText = ''; filters.subCategoryId = ''; subCategorySearchText = '' }"
          />
        </div>

        <!-- SubCategory (Sub Term) Filter -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.subTerm') }}</label>
          <SearchDropdown
            v-model="subCategorySearchText"
            :items="availableSubcategories"
            :allItems="availableSubcategories"
            :placeholder="$t('expenses.searchSubTerm') || $t('placeholders.search')"
            clearable
            @select="(sel) => { filters.subCategoryId = sel.id; subCategorySearchText = sel.name }"
            @clear="() => { filters.subCategoryId = ''; subCategorySearchText = '' }"
          />
        </div>

        <!-- Location Filter -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.location') }}</label>
          <SearchDropdown
            v-model="locationSearchText"
            :items="locations"
            :allItems="locations"
            :placeholder="$t('expenses.searchLocation') || $t('placeholders.search')"
            clearable
            @select="(sel) => { filters.locationId = sel.id; locationSearchText = sel.name }"
            @clear="() => { filters.locationId = ''; locationSearchText = '' }"
          />
        </div>

        <!-- Treasury / Custody Filter -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.treasuryOrCustody') }}</label>
          <SearchDropdown
            v-model="treasurySearchText"
            :items="treasuryItems"
            :allItems="treasuryItems"
            :placeholder="$t('expenses.searchTreasury') || $t('placeholders.search')"
            clearable
            @select="(sel) => { filters.treasuryId = sel.id; treasurySearchText = sel.name }"
            @clear="() => { filters.treasuryId = ''; treasurySearchText = '' }"
          />
        </div>

        <!-- Payment Method Filter -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.paymentMethod') }}</label>
          <SearchDropdown
            v-model="paymentMethodSearchText"
            :items="paymentMethodItems"
            :allItems="paymentMethodItems"
            :placeholder="$t('expenses.searchPaymentMethod') || $t('placeholders.search')"
            clearable
            @select="(sel) => { filters.paymentMethod = sel.id; paymentMethodSearchText = sel.name }"
            @clear="() => { filters.paymentMethod = ''; paymentMethodSearchText = '' }"
          />
        </div>

        <!-- Search in Statement / Description / البحث في البيان -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.searchStatement') }}</label>
          <input 
            v-model="filters.q"
            @keyup.enter="loadReport"
            type="text"
            :placeholder="$t('expenses.searchNotesPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.searchAmount') }}</label>
          <input
            v-model="filters.amountSearch"
            @keyup.enter="loadReport"
            type="text"
            inputmode="decimal"
            :placeholder="$t('expenses.searchAmountPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button 
          @click="loadReport"
          :disabled="loading"
          class="px-4 py-2 theme-button rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {{ $t('labels.search') }}
        </button>
        <button 
          @click="clearFilters"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 theme-text-primary rounded-lg transition-colors text-sm font-medium"
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
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-4 py-3 text-sm theme-text-secondary">{{ $t('expenses.reportDescription') }}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 table-auto">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">#</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.date') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.treasuryOrCustody') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.amount') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.description') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.subTerm') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.mainTerm') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.settlementDate') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.location') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.paymentMethod') }}</th>
              <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.notes') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="items.length">
            <tr v-for="(expense, index) in items" :key="expense.id || expense.ID || index" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">{{ index + 1 }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">{{ formatDate(expense.date || expense.expenseDate || expense['التاريخ']) }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                <span v-if="expense.treasury" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {{ expense.treasury }}
                </span>
                <span v-else class="text-xs theme-caption">{{ $t('expenses.mainExpensesFallback') }}</span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{{ formatCurrency(expense.amount || expense.expense || 0) }}</td>
              <td class="px-4 py-4 text-sm theme-text-primary max-w-xs truncate">{{ expense.description || '-' }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                <span v-if="expense.classification && expense.classification !== '-'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  {{ expense.classification }}
                </span>
                <span v-else class="text-xs theme-caption">-</span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                  {{ expense.category || '-' }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">{{ formatDate(expense.settlementDate) }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                <span v-if="expense.locationName || expense.location?.name" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium theme-badge">
                  {{ expense.locationName || expense.location?.name }}
                </span>
                <span v-else class="theme-caption">-</span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {{ getPaymentMethodLabel(expense.paymentMethod) }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm theme-text-primary max-w-xs truncate">{{ expense.notes || '-' }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="11" class="px-6 py-8 text-center text-sm theme-text-muted">{{ $t('labels.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Section -->
      <div v-if="items.length > 0" class="bg-gray-50 border-t border-gray-200 px-4 py-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs theme-text-secondary">{{ $t('labels.totalRecords') }}</p>
            <p class="text-lg font-semibold theme-text-primary">{{ items.length }}</p>
          </div>
          <div>
            <p class="text-xs theme-text-secondary">{{ $t('labels.total') }}</p>
            <p class="text-lg font-semibold text-red-600">{{ formatCurrency(totalAmount) }}</p>
          </div>
          <div>
            <p class="text-xs theme-text-secondary">Average Expense</p>
            <p class="text-lg font-semibold theme-text">{{ formatCurrency(averageExpense) }}</p>
          </div>
          <div>
            <p class="text-xs theme-text-secondary">Highest Expense</p>
            <p class="text-lg font-semibold text-orange-600">{{ formatCurrency(highestExpense) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getExpensesReportData, downloadExpensesReport, getExpenseCategories, getLocations, getTreasuries } from '@/api'
import DateField from '../../shared/DateField.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'
import { downloadBlobData, getFilenameFromHeaders } from '@/utils/downloadFile'

export default {
  name: 'ExpensesReport',
  components: { DateField, PageHeader, SearchDropdown },
  setup() {
    const { locale } = useI18n()
    const downloading = ref(false)
    const error = ref(null)
    const loading = ref(false)
    const items = ref([])

    const categories = ref([])
    const locations = ref([])
    const treasuries = ref([])

    const categorySearchText = ref('')
    const subCategorySearchText = ref('')
    const locationSearchText = ref('')
    const treasurySearchText = ref('')
    const paymentMethodSearchText = ref('')

    const filters = ref({
      q: '',
      amountSearch: '',
      startDate: '',
      endDate: '',
      settlementDateStart: '',
      settlementDateEnd: '',
      categoryId: '',
      subCategoryId: '',
      locationId: '',
      treasuryId: '',
      paymentMethod: '',
      kind: ''
    })

    const availableSubcategories = computed(() => {
      const list = !filters.value.categoryId
        ? categories.value.flatMap(c => c.subCategories || c.subcategories || [])
        : ((categories.value.find(c => c.id === Number(filters.value.categoryId))?.subCategories)
          || (categories.value.find(c => c.id === Number(filters.value.categoryId))?.subcategories)
          || [])
      const seen = new Set()
      return list.filter(sub => {
        const key = String(sub?.name || '').trim().replace(/\s+/g, ' ').toLowerCase()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
    })

    const treasuryItems = computed(() => {
      return (treasuries.value || []).map(tr => ({
        id: tr.id,
        name: `${tr.name} (${tr.type === 'CUSTODY' ? 'عهدة' : 'خزينة'})`
      }))
    })

    const paymentMethodItems = computed(() => {
      return [
        { id: 'CASH', name: 'نقداً' },
        { id: 'BANK_TRANSFER', name: 'تحويل بنكي' },
        { id: 'CHEQUE', name: 'شيك' },
        { id: 'CUSTODY', name: 'عهدة' }
      ]
    })

    const totalAmount = computed(() => {
      return items.value.reduce((sum, item) => {
        const amount = parseFloat(String(item['المبلغ'] || item.amount || item.expense || item.total || 0).replace(/,/g, '')) || 0
        return sum + amount
      }, 0)
    })

    const averageExpense = computed(() => {
      if (items.value.length === 0) return 0
      return totalAmount.value / items.value.length
    })

    const highestExpense = computed(() => {
      if (items.value.length === 0) return 0
      return Math.max(...items.value.map(item => parseFloat(String(item['المبلغ'] || item.amount || item.expense || item.total || 0).replace(/,/g, '')) || 0))
    })

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      let d
      if (typeof dateString === 'string') {
        const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (m) {
          d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
        } else {
          d = new Date(dateString)
        }
      } else if (dateString instanceof Date) {
        d = dateString
      } else {
        d = new Date(dateString)
      }
      if (!d || Number.isNaN(d.getTime())) return '-'
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }

    const formatCurrency = (amount) => {
      const rtl = locale.value?.startsWith('ar')
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0)
      return rtl && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    }

    const getPaymentMethodLabel = (method) => {
      if (!method) return '-'
      if (method === 'CASH' || method === 'نقداً') return 'نقداً'
      if (method === 'BANK_TRANSFER' || method === 'تحويل بنكي') return 'تحويل بنكي'
      if (method === 'CHEQUE' || method === 'شيك') return 'شيك'
      if (method === 'CUSTODY' || method === 'عهدة') return 'عهدة'
      return method
    }

    const loadMasterData = async () => {
      try {
        const [catRes, locRes, trRes] = await Promise.all([
          getExpenseCategories().catch(() => null),
          getLocations().catch(() => null),
          getTreasuries().catch(() => null)
        ])

        if (catRes?.data) categories.value = Array.isArray(catRes.data) ? catRes.data : (catRes.data.data || [])
        if (locRes?.data) locations.value = Array.isArray(locRes.data) ? locRes.data : (locRes.data.data || [])
        if (trRes?.data) treasuries.value = Array.isArray(trRes.data) ? trRes.data : (trRes.data.data || [])
      } catch (err) {
        console.error('Error loading report master data:', err)
      }
    }

    const loadReport = async () => {
      error.value = null

      try {
        if (filters.value.startDate && filters.value.endDate) {
          const s = new Date(filters.value.startDate)
          const e = new Date(filters.value.endDate)
          if (e < s) {
            items.value = []
            error.value = 'Please make sure the end date is on or after the start date'
            return
          }
        }
      } catch (e) {
        // ignore parse error
      }

      loading.value = true
      error.value = null
      try {
        const response = await getExpensesReportData(
          buildQueryParams(filters.value),
          'json'
        )

        const { data } = response
        let parsedItems = []

        if (Array.isArray(data?.rows)) {
          parsedItems = data.rows
        } else if (Array.isArray(data)) {
          parsedItems = data
        } else if (Array.isArray(data?.items)) {
          parsedItems = data.items
        } else if (Array.isArray(data?.data)) {
          parsedItems = data.data
        }

        items.value = parsedItems
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
        amountSearch: '',
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        settlementDateStart: '',
        settlementDateEnd: '',
        categoryId: '',
        subCategoryId: '',
        locationId: '',
        treasuryId: '',
        paymentMethod: '',
        kind: ''
      }
      categorySearchText.value = ''
      subCategorySearchText.value = ''
      locationSearchText.value = ''
      treasurySearchText.value = ''
      paymentMethodSearchText.value = ''
      items.value = []
    }

    const downloadReport = async (format = 'xlsx') => {
      downloading.value = true
      error.value = null
      try {
        const { data, headers } = await downloadExpensesReport(
          buildQueryParams(filters.value),
          format
        )

        let filename = getFilenameFromHeaders(headers, null)
        if (!filename) {
          const ext = format === 'csv' ? 'csv' : (format === 'pdf' ? 'pdf' : 'xlsx')
          filename = `expenses-${filters.value.startDate || 'all'}_${filters.value.endDate || 'all'}.${ext}`
        }

        const mimeType = format === 'csv'
          ? (headers && (headers['content-type'] || headers['Content-Type']) || 'text/csv;charset=utf-8;')
          : format === 'pdf'
            ? (headers && (headers['content-type'] || headers['Content-Type']) || 'application/pdf')
            : (headers && (headers['content-type'] || headers['Content-Type']) || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

        downloadBlobData(data, filename, mimeType)
      } catch (err) {
        console.error('Error downloading report:', err)
        error.value = err.response?.data?.message || 'Failed to download report'
      } finally {
        downloading.value = false
      }
    }

    onMounted(async () => {
      await loadMasterData()
    })

    return {
      downloading,
      error,
      loading,
      items,
      categories,
      locations,
      treasuries,
      categorySearchText,
      subCategorySearchText,
      locationSearchText,
      treasurySearchText,
      paymentMethodSearchText,
      filters,
      availableSubcategories,
      treasuryItems,
      paymentMethodItems,
      totalAmount,
      averageExpense,
      highestExpense,
      formatDate,
      formatCurrency,
      getPaymentMethodLabel,
      loadReport,
      refresh,
      clearFilters,
      downloadReport
    }
  }
}
</script>

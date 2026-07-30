<template>
  <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Page Header with Export Controls -->
    <PageHeader :title="isRTL ? 'تقرير الخزينة والعهد' : 'Treasury & Custody Report'" :subtitle="isRTL ? 'تتبع وتصدير حركة الخزائن وحسابات العهد والمبالغ المصروفة والموردة' : 'Track and export treasury ledgers, custody accounts, and transaction flows'">
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

        <!-- Treasury Select -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ isRTL ? 'الخزينة / العهدة' : 'Treasury / Custody' }}</label>
          <SearchDropdown
            v-model="treasurySearchText"
            :items="treasuryOptions"
            :allItems="treasuryOptions"
            :placeholder="isRTL ? 'اختر الخزينة...' : 'Select Treasury...'"
            clearable
            @select="(sel) => { filters.treasuryId = sel.id; treasurySearchText = sel.name }"
            @clear="() => { filters.treasuryId = ''; treasurySearchText = '' }"
          />
        </div>

        <!-- Transaction Type -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ isRTL ? 'نوع العملية' : 'Transaction Type' }}</label>
          <select
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
          >
            <option value="">{{ isRTL ? 'الكل' : 'All' }}</option>
            <option value="DEPOSIT">{{ isRTL ? 'إيداع' : 'Deposit' }}</option>
            <option value="PAYMENT">{{ isRTL ? 'دفعة' : 'Payment' }}</option>
            <option value="WITHDRAW">{{ isRTL ? 'سحب' : 'Withdraw' }}</option>
            <option value="ADJUSTMENT">{{ isRTL ? 'تسوية' : 'Adjustment' }}</option>
          </select>
        </div>

        <!-- Search in Description -->
        <div class="lg:col-span-2">
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ isRTL ? 'البحث في الوصف / البيان' : 'Search in Description' }}</label>
          <input
            v-model="filters.search"
            @keyup.enter="loadReport"
            type="text"
            :placeholder="isRTL ? 'ابحث في الوصف أو رقم المرجع...' : 'Search description or reference...'"
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

    <!-- Data Table & Metrics -->
    <div v-else class="space-y-4">
      <!-- Summary Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-xs border-l-4 border-emerald-500 p-4">
          <p class="text-xs font-semibold text-slate-500 uppercase">{{ isRTL ? 'إجمالي المقبوضات / الإيداعات' : 'Total Deposits / Receipts' }}</p>
          <p class="text-xl font-bold text-emerald-600 mt-1">{{ formatCurrency(totalDeposits) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-xs border-l-4 border-red-500 p-4">
          <p class="text-xs font-semibold text-slate-500 uppercase">{{ isRTL ? 'إجمالي السحوبات / المصروفات' : 'Total Withdrawals / Expenses' }}</p>
          <p class="text-xl font-bold text-red-600 mt-1">{{ formatCurrency(totalWithdrawals) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-xs border-l-4 border-indigo-500 p-4">
          <p class="text-xs font-semibold text-slate-500 uppercase">{{ isRTL ? 'صافي حركة المبالغ' : 'Net Movement' }}</p>
          <p :class="['text-xl font-bold mt-1', netMovement >= 0 ? 'text-indigo-600' : 'text-amber-600']">
            {{ formatCurrency(netMovement) }}
          </p>
        </div>
      </div>

      <!-- Table View -->
      <div class="bg-white shadow-xs rounded-xl overflow-hidden border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 table-auto">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">#</th>
                <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.date') }}</th>
                <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ isRTL ? 'الخزينة / العهدة' : 'Treasury' }}</th>
                <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ isRTL ? 'النوع' : 'Type' }}</th>
                <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ isRTL ? 'البيان / الوصف' : 'Description' }}</th>
                <th class="px-4 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('expenses.amount') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" v-if="items.length">
              <tr v-for="(item, index) in items" :key="item.id || index" class="hover:bg-slate-50">
                <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">{{ (page - 1) * pageSize + index + 1 }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">{{ formatDate(item.date) }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {{ item.treasury?.name || item.treasuryName || '-' }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', getTypeBadgeClass(item.type)]">
                    {{ formatTypeLabel(item.type) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm theme-text-primary max-w-sm truncate">{{ item.description || item.arDescription || '-' }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-bold" :class="Number(item.amount) >= 0 ? 'text-emerald-700' : 'text-red-600'">
                  {{ formatCurrency(item.amount) }}
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-sm theme-text-muted">{{ $t('labels.noData') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="bg-slate-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div class="text-xs text-slate-500">
            {{ isRTL ? `عرض ${items.length} من أصل ${total} سجل` : `Showing ${items.length} of ${total} records` }}
          </div>
          <div class="flex gap-1">
            <button
              @click="changePage(page - 1)"
              :disabled="page <= 1"
              class="px-3 py-1 bg-white border border-slate-300 rounded text-xs disabled:opacity-50"
            >
              {{ isRTL ? 'السابق' : 'Previous' }}
            </button>
            <span class="px-3 py-1 text-xs font-semibold text-slate-700">{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
            <button
              @click="changePage(page + 1)"
              :disabled="page >= Math.ceil(total / pageSize)"
              class="px-3 py-1 bg-white border border-slate-300 rounded text-xs disabled:opacity-50"
            >
              {{ isRTL ? 'التالي' : 'Next' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/shared/PageHeader.vue'
import DateField from '@/components/shared/DateField.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { getTreasuries, getTreasuryTransactions, downloadTreasuryTransactions } from '@/api'

export default {
  name: 'TreasuryReportNew',
  components: {
    PageHeader,
    DateField,
    SearchDropdown
  },
  setup() {
    const { locale } = useI18n()
    const isRTL = computed(() => locale.value === 'ar')

    const loading = ref(false)
    const downloading = ref(false)
    const error = ref(null)

    const items = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(30)

    const treasuryOptions = ref([])
    const treasurySearchText = ref('')

    const filters = reactive({
      startDate: '',
      endDate: '',
      treasuryId: '',
      type: '',
      search: ''
    })

    const loadTreasuries = async () => {
      try {
        const res = await getTreasuries({ includeArchived: true })
        const list = res.data || []
        treasuryOptions.value = list.map(t => ({
          id: t.id,
          name: t.name
        }))
      } catch (err) {
        console.error('Failed to load treasuries', err)
      }
    }

    const loadReport = async () => {
      loading.value = true
      error.value = null
      try {
        // If specific treasury is selected, query it; otherwise default to first treasury or all
        const selectedTreasury = filters.treasuryId || (treasuryOptions.value[0]?.id || 1)
        const params = {
          page: page.value,
          pageSize: pageSize.value,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          type: filters.type || undefined,
          search: filters.search || undefined,
          lang: locale.value === 'ar' ? 'ar' : 'en'
        }
        const res = await getTreasuryTransactions(selectedTreasury, params)
        items.value = res.data?.items || []
        total.value = res.data?.total || 0
      } catch (err) {
        console.error('Failed to load treasury report', err)
        error.value = isRTL.value ? 'فشل تحميل بيانات تقرير الخزينة' : 'Failed to load treasury report data'
      } finally {
        loading.value = false
      }
    }

    const refresh = () => {
      loadReport()
    }

    const clearFilters = () => {
      filters.startDate = ''
      filters.endDate = ''
      filters.treasuryId = ''
      filters.type = ''
      filters.search = ''
      treasurySearchText.value = ''
      page.value = 1
      loadReport()
    }

    const changePage = (p) => {
      page.value = p
      loadReport()
    }

    const totalDeposits = computed(() => {
      return items.value
        .filter(i => Number(i.amount) > 0)
        .reduce((sum, i) => sum + Number(i.amount), 0)
    })

    const totalWithdrawals = computed(() => {
      return items.value
        .filter(i => Number(i.amount) < 0)
        .reduce((sum, i) => sum + Math.abs(Number(i.amount)), 0)
    })

    const netMovement = computed(() => {
      return items.value.reduce((sum, i) => sum + Number(i.amount || 0), 0)
    })

    const formatDate = (val) => {
      if (!val) return '-'
      const date = new Date(val)
      return isNaN(date.getTime()) ? String(val) : date.toISOString().slice(0, 10)
    }

    const formatCurrency = (amt) => {
      const num = Number(amt || 0)
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
      return isRTL.value && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    }

    const formatTypeLabel = (type) => {
      const t = String(type || '').toUpperCase()
      if (isRTL.value) {
        switch (t) {
          case 'DEPOSIT': return 'إيداع'
          case 'PAYMENT': return 'دفعة'
          case 'WITHDRAW': return 'سحب'
          case 'ADJUSTMENT': return 'تسوية'
          default: return type || '-'
        }
      }
      return type || '-'
    }

    const getTypeBadgeClass = (type) => {
      const t = String(type || '').toUpperCase()
      switch (t) {
        case 'DEPOSIT': return 'bg-emerald-100 text-emerald-800'
        case 'PAYMENT': return 'bg-blue-100 text-blue-800'
        case 'WITHDRAW': return 'bg-red-100 text-red-800'
        case 'ADJUSTMENT': return 'bg-purple-100 text-purple-800'
        default: return 'bg-slate-100 text-slate-700'
      }
    }

    const downloadReport = async (format = 'xlsx') => {
      downloading.value = true
      try {
        const selectedTreasury = filters.treasuryId || (treasuryOptions.value[0]?.id || 1)
        const params = {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          type: filters.type || undefined,
          search: filters.search || undefined,
          lang: locale.value === 'ar' ? 'ar' : 'en'
        }
        const res = await downloadTreasuryTransactions(selectedTreasury, params, format)
        const blob = new Blob([res.data], {
          type: format === 'pdf' ? 'application/pdf' : format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `treasury_report.${format}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error('Download failed', err)
      } finally {
        downloading.value = false
      }
    }

    onMounted(async () => {
      await loadTreasuries()
      await loadReport()
    })

    return {
      isRTL,
      loading,
      downloading,
      error,
      items,
      total,
      page,
      pageSize,
      filters,
      treasuryOptions,
      treasurySearchText,
      totalDeposits,
      totalWithdrawals,
      netMovement,
      loadReport,
      refresh,
      clearFilters,
      changePage,
      formatDate,
      formatCurrency,
      formatTypeLabel,
      getTypeBadgeClass,
      downloadReport
    }
  }
}
</script>

<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl' : ''" class="space-y-6">
    <!-- Header -->
    <div class="app-page-header flex flex-col gap-3 rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold theme-text-primary">{{ $t('contractors.statementTitle') }}</h2>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button @click="refresh" :disabled="loading"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm theme-text-secondary shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50">
          {{ $t('labels.refresh') }}
        </button>
        <button @click="downloadReport('xlsx')" :disabled="downloading"
          class="inline-flex items-center gap-1 rounded-xl theme-button px-3 py-2 text-xs sm:text-sm theme-text-light shadow-sm  transition-colors  disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
          </svg>
          {{ downloading ? $t('labels.downloading') : $t('contractors.exportExcel') }}
        </button>
        <button @click="downloadReport('csv')" :disabled="downloading"
          class="inline-flex items-center gap-1 rounded-xl theme-button px-3 py-2 text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
          </svg>
          {{ downloading ? $t('labels.downloading') : $t('contractors.exportCSV') }}
        </button>
        <button @click="downloadReport('pdf')" :disabled="downloading"
          class="inline-flex items-center gap-1 rounded-xl bg-slate-700 px-3 py-2 text-xs sm:text-sm theme-text-light shadow-sm shadow-slate-200 transition-colors hover:bg-slate-800 disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
          </svg>
          {{ downloading ? $t('labels.downloading') : $t('contractors.exportPDF') }}
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
      <h4 class="text-sm font-semibold theme-text-secondary">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Contractor Selector -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('contractors.name') }}</label>
          <select v-model="selectedContractorId" @change="onContractorChange"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none theme-input-focus">
            <option value="">{{ $t('contractors.selectContractor') }}</option>
            <option v-for="c in contractors" :key="c.id" :value="c.id">{{ (isRTL && c.arName) ? c.arName : c.name }}</option>
          </select>
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.startDate') }}</label>
          <DateField v-model="filters.startDate"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none theme-input-focus" />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.endDate') }}</label>
          <DateField v-model="filters.endDate"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none theme-input-focus" />
        </div>

        <!-- Hide Deleted Transactions Switch -->
        <div class="flex items-center gap-3 select-none min-h-[42px] pt-4 lg:pt-5">
          <label class="relative inline-flex items-center cursor-pointer group">
            <input type="checkbox" v-model="filters.onlyAddedAndReversals" class="sr-only peer" @change="loadReport">
            
            <!-- Toggle background track -->
            <div :class="[
              'relative w-11 h-6 rounded-full border transition-all duration-300 shadow-inner',
              filters.onlyAddedAndReversals 
                ? 'bg-emerald-500 border-emerald-600' 
                : 'bg-slate-100 border-slate-200'
            ]">
              <!-- Toggle indicator with icon -->
              <div :class="[
                'absolute top-[1px] w-5 h-5 bg-white rounded-full shadow transition-all duration-300 flex items-center justify-center',
                isRTL 
                  ? (filters.onlyAddedAndReversals ? 'right-[18px]' : 'right-[2px]')
                  : (filters.onlyAddedAndReversals ? 'left-[18px]' : 'left-[2px]')
              ]">
                <!-- X icon (unchecked) -->
                <svg v-if="!filters.onlyAddedAndReversals" class="w-3 h-3 text-slate-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <!-- Check icon (checked) -->
                <svg v-else class="w-3 h-3 text-emerald-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <div class="flex flex-col ms-3">
              <span class="text-xs font-semibold theme-text-primary transition-all duration-200">
                {{ isRTL ? 'إخفاء العمليات المحذوفة' : 'Hide Deleted Transactions' }}
              </span>
              <span class="text-[10px] theme-text-muted leading-tight">
                {{ filters.onlyAddedAndReversals 
                  ? (isRTL ? 'تم استبعاد حركات الحذف وعكسها' : 'Excluding deleted records & reversals')
                  : (isRTL ? 'يعرض جميع حركات الحساب' : 'Showing all ledger records') 
                }}
              </span>
            </div>
          </label>
        </div>

        <!-- Load Button -->
        <div class="flex items-end">
          <button @click="loadReport" :disabled="loading || !selectedContractorId"
            class="w-full rounded-xl theme-button px-4 py-2 text-sm font-medium theme-text-light shadow-sm  transition-colors  disabled:opacity-50">
            {{ $t('contractors.loadStatement') }}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button @click="clearFilters"
          class="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs sm:text-sm font-medium theme-text-secondary transition-colors hover:bg-slate-200">
          {{ $t('labels.clear') }}
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4">
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
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
    </div>

    <!-- Summary Cards -->
    <div v-else-if="report && report.contractorName" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
        <p class="text-xs theme-text-secondary mb-1">{{ $t('contractors.contractorName') }}</p>
        <p class="text-lg font-semibold theme-text-primary">{{ getContractorDisplayName(report) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
        <p class="text-xs theme-text-secondary mb-1">{{ translateWithFallback('contractors.debit', 'contractors.earnings') }}</p>
        <p class="text-lg font-semibold" :class="getAmountClass(totalDebits, 'text-green-600')">{{ formatCurrency(totalDebits) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
        <p class="text-xs theme-text-secondary mb-1">{{ translateWithFallback('contractors.credit', 'contractors.payments') }}</p>
        <p class="text-lg font-semibold" :class="getAmountClass(totalCredits, 'theme-text')">{{ formatCurrency(totalCredits) }}</p>
      </div>
      <!-- <div class="bg-white rounded-lg shadow p-4">
        <p class="text-xs theme-text-secondary mb-1">{{ $t('contractors.totalEarnings') }}</p>
        <p class="text-lg font-semibold theme-text">{{ formatCurrency(report.totals?.earnings || 0) }}</p>
      </div> -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
        <p class="text-xs theme-text-secondary mb-1">{{ translateWithFallback('contractors.paidToContractor', 'contractors.payments') }}</p>
        <p class="text-lg font-semibold" :class="getAmountClass(paidToContractor, 'text-teal-600')">{{ formatCurrency(paidToContractor) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
        <p class="text-xs theme-text-secondary mb-1">{{ translateWithFallback('contractors.owedToContractor', 'contractors.owedToCompany') }}</p>
        <p class="text-lg font-semibold" :class="getAmountClass(owedToContractor, 'theme-text')">{{ formatCurrency(owedToContractor) }}</p>
      </div>
      
    </div>

    <!-- Balance Owed Card -->
    <div v-if="report && report.rows && report.rows.length > 0" class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p class="text-xs theme-text-secondary mb-1">{{ $t('contractors.openingBalance') }}</p>
          <p class="text-lg font-semibold" :class="report.openingBalance >= 0 ? 'theme-text-primary' : 'text-red-600'">
            {{ formatCurrency(Math.abs(report.openingBalance || 0)) }}
            <span class="text-sm">({{ report.openingBalance >= 0 ? $t('contractors.owedByCompany') :
              $t('contractors.owedToCompany') }})</span>
          </p>
        </div>
        <div>
          <p class="text-xs theme-text-secondary mb-1">{{ $t('contractors.closingBalance') }}</p>
          <p class="text-lg font-semibold" :class="report.closingBalance >= 0 ? 'theme-text-primary' : 'text-red-600'">
            {{ formatCurrency(Math.abs(report.closingBalance || 0)) }}
            <span class="text-sm">({{ report.closingBalance >= 0 ? $t('contractors.owedByCompany') :
              $t('contractors.owedToCompany') }})</span>
          </p>
        </div>
        <div>
          <p class="text-xs theme-text-secondary mb-1">{{ translateWithFallback('contractors.balance', 'contractors.balanceOwed') }}</p>
          <p class="text-lg font-semibold" :class="getAmountClass(lastBalance, 'theme-text')">
            {{ formatCurrency(lastBalance) }}
          </p>
        </div>
      </div>
      <div v-if="filters.startDate || filters.endDate" class="mt-2 text-xs theme-text-muted">
        {{ $t('contractors.dateRange') }}:
        {{ filters.startDate || $t('contractors.startOfTime') }}
        {{ $t('labels.to') }}
        {{ filters.endDate || $t('contractors.endOfTime') }}
      </div>
    </div>

    <!-- Statement Table -->
    <div v-if="report && report.rows && report.rows.length > 0" class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <div class="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm theme-text-secondary">{{ $t('contractors.statementDescription') }}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="theme-table-thead-gradient">
            <tr>
              <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider  whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.date') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider  whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.type') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider  whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('contractors.refId') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider  whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.description') }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider  whitespace-nowrap text-right">
                {{ translateWithFallback('contractors.debit', 'contractors.earnings') }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider  whitespace-nowrap text-right">
                {{ translateWithFallback('contractors.credit', 'contractors.payments') }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider  whitespace-nowrap text-right">
                {{ translateWithFallback('contractors.balance', 'contractors.balanceOwed') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-for="(row, index) in paginatedRows" :key="index" :class="[
              isTotalsRow(row) ? 'bg-amber-50 font-semibold' : 'theme-table-row-hover',
              row.type === 'DEPOSIT' ? 'bg-emerald-50/70' : '',
              row.type === 'TRANSPORT' || row.type === 'SUPPLY' ? 'theme-dashboard-bg-soft opacity-70' : '',
              row.type === 'OPENING' ? 'bg-slate-100' : '',
              isTotalsRow(row) ? 'border-t-2 border-amber-300' : ''
            ]">
                <td class="px-6 py-4 whitespace-nowrap text-sm theme-text-primary">{{ row.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="isTotalsRow(row)" class="font-bold text-amber-900">
                    {{ getTypeLabel(row.type) }}
                  </span>
                  <Badge v-else :variant="getTypeVariant(row.type)">
                    {{ row.type === 'SUPPLY' && row.arDescription ? row.arDescription : getTypeLabel(row.type) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm theme-text-primary">{{ isTotalsRow(row) ? '-' : (row.refId || '-') }}</td>
                <td class="px-6 py-4 text-sm theme-text-primary">{{ row.description || (isTotalsRow(row) ? (getTypeLabel(row.type)) : '-') }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right" :class="getAmountClass(getRowDebit(row), 'text-green-600')">
                  {{ formatCurrency(getRowDebit(row)) }}
                </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right" :class="getAmountClass(getRowCredit(row), 'theme-text')">
                {{ formatCurrency(getRowCredit(row)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right" :class="getAmountClass(getRowBalance(row), 'theme-text')">
                {{ formatCurrency(getRowBalance(row)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination v-if="totalPages > 1" :current-page="currentPage" :page-size="pageSize" :total="statementDataRows.length"
        :total-pages="totalPages" :page-size-options="[10, 20, 50, 100]" @update:page="currentPage = $event"
        @update:pageSize="onPageSizeChange" />
    </div>

    <!-- Empty State -->
    <div v-else-if="report && (!report.rows || report.rows.length === 0)"
      class="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-lg shadow-slate-200/40">
      <p class="theme-text-muted">{{ $t('contractors.noStatementData') }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { getContractorReportData, getContractors, normalizeContractorAccountType } from '@/api'
import Badge from '../shared/Badge.vue'
import Pagination from '../shared/Pagination.vue'
import DateField from '@/components/shared/DateField.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'
import normalizeItem from '@/utils/normalizeItem'
import { formatToISODate } from '@/utils/dateUtils'
import { downloadBlobData, getFilenameFromResponse, getMimeTypeFromHeaders } from '@/utils/downloadFile'
import { isContractorStatementTotalsRow, splitFooterRow } from '@/utils/reportDefinitions'
// import { useRoute } from 'vue-router'

export default {
  name: 'ContractorStatement',
  components: { Badge, Pagination, DateField },
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
      endDate: '',
      onlyAddedAndReversals: false
    })
    const currentPage = ref(1)
    const pageSize = ref(50)

    const isRTL = computed(() => {
      return instance && instance.proxy && instance.proxy.$i18n && instance.proxy.$i18n.locale === 'ar'
    })

    const currentLang = computed(() => {
      return instance && instance.proxy && instance.proxy.$i18n && instance.proxy.$i18n.locale === 'ar' ? 'ar' : 'en'
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
      if (low === 'equipmentlogs' || low === 'equipment_logs' || low === 'equipment-logs') return 'RENTAL'
      const normalized = normalizeContractorAccountType(s)
      if (normalized) return normalized
      if (low === 'expense') return 'EXPENSE'
      if (low === 'deposit') return 'DEPOSIT'
      if (low === 'withdrawal') return 'WITHDRAWAL'
      return s.toUpperCase()
    }


    // statementMode: uppercase mode for report APIs (e.g. SUPPLY, TRANSPORT)
    const statementMode = computed(() => parseModeInput(mode.value || props.mode || ''))
    // contractorsListMode: canonical mode for GET /api/contractors (supply, transport, extract, rentals)
    const contractorsListMode = computed(() => {
      if (!statementMode.value) return undefined
      const low = String(statementMode.value).toLowerCase()
      if (low === 'supply') return 'supply'
      if (low === 'transport') return 'transport'
      if (low === 'extract') return 'extract'
      if (low === 'rentals' || low === 'rental' || low === 'equipmentlogs') return 'rentals'
      return low
    })

    const getRowDebit = (row) => Number(row?.debit ?? row?.earnings ?? 0) || 0
    const getRowCredit = (row) => Number(row?.credit ?? row?.payments ?? 0) || 0
    const getRowBalance = (row) => Number(row?.balance ?? row?.balanceOwed ?? 0) || 0
    const isTotalsRow = (row) => isContractorStatementTotalsRow(row)

    const normalizedStatementRows = computed(() => {
      const rows = Array.isArray(report.value?.rows) ? report.value.rows : []
      return splitFooterRow(rows, isTotalsRow)
    })

    const statementDataRows = computed(() => normalizedStatementRows.value.dataRows)
    const statementTotalsRow = computed(() => normalizedStatementRows.value.footerRow)

    const lastBalance = computed(() => {
      if (statementTotalsRow.value) return getRowBalance(statementTotalsRow.value)
      if (!statementDataRows.value.length) return 0
      return getRowBalance(statementDataRows.value[statementDataRows.value.length - 1])
    })

    // Normalize mode (use reactive mode if set, otherwise fall back to prop)
    // const currentMode = computed(() => {
    //   // normalize to string if available
    //   const m = mode.value || props.mode || ''
    //   return m ? String(m) : ''
    // })

    // const normalizedMode = computed(() => (currentMode.value || '').toUpperCase())

    const totalDebits = computed(() => {
      const v = report.value?.totals?.debits
      if (v !== undefined && v !== null) return Number(v) || 0
      if (statementTotalsRow.value) return getRowDebit(statementTotalsRow.value)
      const rows = statementDataRows.value || []
      return rows.reduce((sum, row) => sum + getRowDebit(row), 0)
    })

    const totalCredits = computed(() => {
      const v = report.value?.totals?.credits
      if (v !== undefined && v !== null) return Number(v) || 0
      if (statementTotalsRow.value) return getRowCredit(statementTotalsRow.value)
      const rows = statementDataRows.value || []
      return rows.reduce((sum, row) => sum + getRowCredit(row), 0)
    })

    const paidToContractor = computed(() => {
      const v = report.value?.totals?.paidToContractor
      if (v !== undefined && v !== null) return Number(v) || 0
      return totalCredits.value
    })

    const owedToContractor = computed(() => {
      const v = report.value?.totals?.owedToContractor
      if (v !== undefined && v !== null) return Number(v) || 0
      const closing = Number(report.value?.closingBalance ?? lastBalance.value ?? 0) || 0
      return closing > 0 ? closing : 0
    })

    const paginatedRows = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const pageRows = statementDataRows.value.slice(start, end)
      return statementTotalsRow.value ? [...pageRows, statementTotalsRow.value] : pageRows
    })

    const totalPages = computed(() => {
      if (!statementDataRows.value.length) return statementTotalsRow.value ? 1 : 0
      return Math.ceil(statementDataRows.value.length / pageSize.value)
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
        'OPENING': 'default',
        'TOTAL': 'warning'
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
        'RENTAL': translateWithFallback('contractors.typeRental', 'contractors.typeRental'),
        'WITHDRAWAL': translateWithFallback('contractors.typeWithdrawal', 'contractors.typeWithdrawal'),
        'OPENING': t('contractors.openingBalance'),
        'EXTRACT': translateWithFallback('contractors.typeExtract', 'contractors.typeExtract'),
        'TOTAL': t('reports.totalsLabel') || 'Totals'
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

    const getAmountClass = (value, positiveClass = 'theme-text-primary') => {
      return Number(value || 0) < 0 ? 'text-red-600' : positiveClass
    }

    const loadContractors = async () => {
      try {
        const res = await getContractors({ page: 1, pageSize: 1000, mode: contractorsListMode.value || undefined })
        const payload = res.data || {}
        let items = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : []

        contractors.value = items.map(normalizeItem)
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
        if (filters.value.onlyAddedAndReversals) p.onlyAddedAndReversals = true
        p.format = 'json'
        if (currentLang.value) p.lang = currentLang.value
        if (statementMode.value) {
          p.mode = statementMode.value
          p.transaction_type = statementMode.value
        }

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

    // buildExportRows removed (unused)

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
        if (filters.value.onlyAddedAndReversals) p.onlyAddedAndReversals = true
        p.format = format
        if (currentLang.value) p.lang = currentLang.value
        if (statementMode.value) {
          p.mode = statementMode.value
          p.transaction_type = statementMode.value
        }

        const params = buildQueryParams(p)

        // Request binary report from backend (xlsx or csv)
        const { data, headers } = await getContractorReportData(selectedContractorId.value, params, format, statementMode.value || undefined)

        // Determine filename (fall back to contractor id if name not available)
        const contractor = contractors.value.find(c => String(c.id) === String(selectedContractorId.value) || c.id === parseInt(selectedContractorId.value))
        const rawName = contractor ? ((isRTL.value && contractor.arName) ? contractor.arName : contractor.name) : String(selectedContractorId.value)
        const contractorName = String(rawName || selectedContractorId.value).replace(/[^a-zA-Z0-9]/g, '_')
        const dateRange = filters.value.startDate && filters.value.endDate
          ? `${filters.value.startDate}_${filters.value.endDate}`
          : 'all'

        const requestedExtension = format === 'csv' ? 'csv' : (format === 'pdf' ? 'pdf' : 'xlsx')
        const fallbackName = `contractor-${contractorName}-statement-${dateRange}.${requestedExtension}`
        const filename = getFilenameFromResponse(headers, fallbackName) || fallbackName

        const mimeType = getMimeTypeFromHeaders(
          headers,
          format === 'csv'
            ? 'text/csv;charset=utf-8;'
            : format === 'pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )

        downloadBlobData(data, filename, mimeType)
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
        endDate: '',
        onlyAddedAndReversals: false
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
      // No default date range — show all transactions by default

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
      totalDebits,
      totalCredits,
      paidToContractor,
      owedToContractor,
      translateWithFallback,
      filters,
      currentPage,
      pageSize,
      isRTL,
      lastBalance,
      statementDataRows,
      isTotalsRow,
      paginatedRows,
      totalPages,
      formatCurrency,
      getAmountClass,
      getRowDebit,
      getRowCredit,
      getRowBalance,
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

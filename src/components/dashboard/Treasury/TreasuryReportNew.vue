<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="flex flex-col gap-6 lg:flex-row">
    <!-- Sidebar -->
    <aside class="h-fit w-full rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm lg:sticky lg:top-4 lg:w-72">
      <div class="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <h2 class="text-base font-semibold theme-text-primary">{{ t('dashboard.treasury') }}</h2>
        <span class="text-xs theme-text-secondary">{{ visibleTreasuries.length }} {{ t('treasury.items') }}</span>
      </div>
      <div class="mt-3 space-y-3">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.view') }}</label>
          <select v-model="treasuryView" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus">
            <option value="active">{{ t('treasury.viewActive') }}</option>
            <option value="archived">{{ t('treasury.viewArchived') }}</option>
            <option value="all">{{ t('treasury.viewAll') }}</option>
          </select>
        </div>
        <input v-model="treasurySearch" type="text" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus" :placeholder="t('treasury.searchTreasuriesPlaceholder')" />
      </div>
      <div v-if="!visibleTreasuries.length" class="mt-4 rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400">
        {{ t('labels.noData') }}
      </div>
      <div v-else class="mt-3 space-y-2">
        <button
          v-for="(treasury, index) in visibleTreasuries"
          :key="treasury.id"
          @click="selectTreasury(treasury.id)"
          :class="['flex w-full items-center justify-between rounded-xl border px-3 py-2.5 transition text-left', selectedId === treasury.id ? 'border-transparent bg-indigo-50/80 ring-1 ring-indigo-200/70' : 'border-gray-200 bg-white/70 hover:bg-gray-50']"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-sm font-medium theme-text-primary">{{ treasury.name }}</p>
              <span class="text-xs font-semibold" :class="Number(treasury.balance) < 0 ? 'text-red-600' : 'text-emerald-700'">{{ formatCurrency(treasury.balance) }}</span>
            </div>
            <div class="mt-1 flex items-center gap-2 text-[11px] theme-text-secondary">
              <span>#{{ index + 1 }}</span>
              <span v-if="treasury.type === 'CUSTODY'" class="rounded-full bg-purple-100 px-2 py-0.5 font-semibold text-purple-700">{{ t('treasury.typeCustody') }}</span>
              <span v-else class="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">{{ t('treasury.typeMain') }}</span>
              <span v-if="treasury.deletedAt" class="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{{ t('treasury.archived') }}</span>
              <span v-else class="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">{{ t('treasury.active') }}</span>
            </div>
          </div>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="min-w-0 flex-1 space-y-4">
      <!-- Header + filters -->
      <div class="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-lg shadow-slate-200/50">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 class="text-xl font-semibold theme-text-primary">{{ selectedTreasury?.name || t('dashboard.treasury') }}</h1>
            <p class="mt-0.5 text-sm theme-text-secondary">{{ t('treasury.ledgerTitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium theme-text-secondary transition hover:bg-gray-50 disabled:opacity-50"
              :disabled="!selectedTreasury || !!exportingFormat || loading"
              @click="downloadReport('xlsx')"
            >
              {{ exportingFormat === 'xlsx' ? t('labels.loading') : t('reports.downloadExcel') }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium theme-text-secondary transition hover:bg-gray-50 disabled:opacity-50"
              :disabled="!selectedTreasury || !!exportingFormat || loading"
              @click="downloadReport('pdf')"
            >
              {{ exportingFormat === 'pdf' ? t('labels.loading') : t('reports.downloadPdf') }}
            </button>
          </div>
        </div>

        <!-- Date filters -->
        <div class="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.dateFrom') }}</label>
            <DateField v-model="filters.startDate" @update:modelValue="applyFilters" class="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.dateTo') }}</label>
            <DateField v-model="filters.endDate" @update:modelValue="applyFilters" class="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
          </div>
          <button class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium theme-text-secondary transition hover:bg-gray-50" @click="resetFilters">{{ t('labels.reset') }}</button>
        </div>
        <p v-if="exportError" class="mt-2 text-xs text-red-600">{{ exportError }}</p>
      </div>

      <!-- Report table -->
      <div v-if="loading" class="rounded-2xl border border-gray-100 bg-white/80 px-6 py-16 text-center text-sm theme-text-secondary shadow-lg">
        {{ t('labels.loading') }}
      </div>
      <div v-else-if="!selectedTreasury" class="rounded-2xl border border-gray-100 bg-white/80 px-6 py-16 text-center text-sm theme-text-secondary shadow-lg">
        {{ t('treasury.detailsHint') }}
      </div>
      <div v-else class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-slate-200/50">
        <table class="min-w-full border-collapse" style="direction: rtl;">
          <!-- Treasury name title row -->
          <thead>
            <tr>
              <th colspan="6" class="border border-gray-300 bg-orange-100 px-4 py-3 text-center text-base font-bold text-gray-800">
                {{ selectedTreasury.name }}
              </th>
            </tr>
            <!-- Summary row -->
            <tr class="bg-orange-50">
              <th colspan="2" class="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700">
                {{ isRTL ? 'الفرق' : 'Difference' }}
              </th>
              <th class="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700">
                {{ isRTL ? 'إجمالي (وارد)' : 'Total In' }}
              </th>
              <th class="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700">
                {{ isRTL ? 'إجمالي (صادر)' : 'Total Out' }}
              </th>
              <th colspan="2" class="border border-gray-300 px-3 py-2"></th>
            </tr>
            <tr class="bg-white">
              <td colspan="2" class="border border-gray-300 px-3 py-2 text-center text-lg font-bold text-gray-900">
                {{ formatNumber(totalIn - totalOut) }}
              </td>
              <td class="border border-gray-300 px-3 py-2 text-center text-lg font-bold text-gray-900">
                {{ formatNumber(totalIn) }}
              </td>
              <td class="border border-gray-300 px-3 py-2 text-center text-lg font-bold text-gray-900">
                {{ formatNumber(totalOut) }}
              </td>
              <td colspan="2" class="border border-gray-300 px-3 py-2"></td>
            </tr>
            <!-- Column headers -->
            <tr class="bg-orange-100">
              <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 w-56">
                {{ isRTL ? 'البيـــــــــــان' : 'Description' }}
              </th>
              <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 w-32">
                {{ isRTL ? 'الوارد (إيداع)' : 'Credit (In)' }}
              </th>
              <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 w-32">
                {{ isRTL ? 'المنصرف (سحب)' : 'Debit (Out)' }}
              </th>
              <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 w-32">
                {{ isRTL ? 'الرصيد' : 'Balance' }}
              </th>
              <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 w-28">
                {{ isRTL ? 'التاريخ' : 'Date' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Opening balance row -->
            <tr class="bg-gray-50">
              <td class="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                {{ isRTL ? 'رصيد اول الفترة' : 'Opening Balance' }}
              </td>
              <td class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-500">—</td>
              <td class="border border-gray-200 px-3 py-2 text-center text-sm font-semibold text-emerald-700">
                {{ formatNumber(openingBalance) }}
              </td>
              <td class="border border-gray-200 px-3 py-2 text-center text-sm font-semibold text-indigo-700">
                {{ formatNumber(openingBalance) }}
              </td>
              <td class="border border-gray-200 px-3 py-2 text-center text-xs text-gray-500">
                {{ filters.startDate ? formatDateShort(filters.startDate) : '—' }}
              </td>
            </tr>

            <!-- Transaction rows -->
            <tr
              v-for="(row, i) in reportRows"
              :key="row.id || i"
              class="transition hover:bg-orange-50/40"
            >
              <td class="border border-gray-200 px-3 py-2 text-sm text-gray-800">{{ row.description }}</td>
              <td class="border border-gray-200 px-3 py-2 text-center text-sm" :class="row.credit > 0 ? 'font-semibold text-emerald-700' : 'text-gray-300'">
                {{ row.credit > 0 ? formatNumber(row.credit) : '—' }}
              </td>
              <td class="border border-gray-200 px-3 py-2 text-center text-sm" :class="row.debit > 0 ? 'font-semibold text-red-600' : 'text-gray-300'">
                {{ row.debit > 0 ? formatNumber(row.debit) : '—' }}
              </td>
              <td class="border border-gray-200 px-3 py-2 text-center text-sm font-semibold" :class="row.runningBalance < 0 ? 'text-red-600' : 'text-indigo-700'">
                {{ formatNumber(row.runningBalance) }}
              </td>
              <td class="border border-gray-200 px-3 py-2 text-center text-xs text-gray-600">
                {{ formatDateShort(row.date) }}
              </td>
            </tr>

            <!-- Empty rows to fill minimum visual rows (like Excel) -->
            <tr v-for="n in emptyRows" :key="'empty-' + n" class="h-8">
              <td class="border border-gray-100 px-3 py-1"></td>
              <td class="border border-gray-100 px-3 py-1"></td>
              <td class="border border-gray-100 px-3 py-1"></td>
              <td class="border border-gray-100 px-3 py-1"></td>
              <td class="border border-gray-100 px-3 py-1"></td>
            </tr>
          </tbody>
        </table>

        <!-- No transactions message -->
        <div v-if="!loading && reportRows.length === 0" class="px-6 py-8 text-center text-sm theme-text-secondary">
          {{ t('treasury.noTransactions') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTreasuryStore } from '@/stores/useTreasuryStore'
import { downloadTreasurySummary } from '@/api'
import { downloadBlobData, getFilenameFromHeaders } from '@/utils/downloadFile'
import DateField from '@/components/shared/DateField.vue'

const MIN_ROWS = 15

export default {
  name: 'TreasuryReportNew',
  components: { DateField },
  setup() {
    const { t, locale } = useI18n()
    const store = useTreasuryStore()
    const isRTL = computed(() => locale.value?.toString().startsWith('ar'))
    const loading = computed(() => store.loading)
    const selectedTreasury = computed(() => store.activeTreasury)
    const selectedId = computed(() => store.selectedTreasuryId)
    const treasuryView = ref('active')
    const treasurySearch = ref('')
    const exportingFormat = ref('')
    const exportError = ref('')
    const filters = reactive({ startDate: '', endDate: '' })

    // All transactions (no pagination — load all for the report)
    const allTransactions = ref([])

    const normalizedSearch = computed(() => String(treasurySearch.value || '').trim().toLowerCase())
    const visibleTreasuries = computed(() => {
      const all = Array.isArray(store.treasuries) ? store.treasuries : []
      return all.filter((tr) => {
        const isArchived = !!tr.deletedAt
        if (treasuryView.value === 'active' && isArchived) return false
        if (treasuryView.value === 'archived' && !isArchived) return false
        if (normalizedSearch.value && !String(tr.name || '').toLowerCase().includes(normalizedSearch.value)) return false
        return true
      })
    })

    // ── Derived report data ────────────────────────────────────────────────
    const reportRows = computed(() => {
      let running = openingBalance.value
      return allTransactions.value.map((tx) => {
        const amt = Number(tx.amount || 0)
        const debit = amt < 0 ? Math.abs(amt) : 0
        const credit = amt > 0 ? amt : 0
        running += amt
        const desc = isRTL.value
          ? (tx.arDescription || tx.description || tx.refType || '-')
          : (tx.description || tx.refType || '-')
        return {
          id: tx.id,
          date: tx.date || tx.createdAt,
          description: desc,
          debit,
          credit,
          runningBalance: running,
        }
      })
    })

    const openingBalance = computed(() => {
      // Opening balance = current balance minus all transactions in the loaded set
      const txNet = allTransactions.value.reduce((s, tx) => s + Number(tx.amount || 0), 0)
      return Number(store.summary?.balance || 0) - txNet
    })

    const totalIn = computed(() => reportRows.value.reduce((s, r) => s + r.credit, 0))
    const totalOut = computed(() => reportRows.value.reduce((s, r) => s + r.debit, 0))

    const emptyRows = computed(() => {
      const filled = reportRows.value.length + 1 // +1 for opening balance row
      return filled < MIN_ROWS ? MIN_ROWS - filled : 0
    })

    // ── Formatters ─────────────────────────────────────────────────────────
    const formatCurrency = (v) =>
      new Intl.NumberFormat(locale.value || 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(Number(v || 0))

    const formatNumber = (v) =>
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0))

    const formatDateShort = (value) => {
      if (!value) return '—'
      const d = new Date(value)
      if (isNaN(d.getTime())) return String(value)
      const day = String(d.getDate()).padStart(2, '0')
      const month = d.toLocaleString('en-US', { month: 'short' })
      const year = String(d.getFullYear()).slice(2)
      return `${day}/${month}/${year}`
    }

    // ── Data loading ───────────────────────────────────────────────────────
    const loadAll = async () => {
      if (!store.selectedTreasuryId) return
      try {
        // Fetch all transactions (large pageSize to get everything)
        await store.fetchTransactions({
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          pageSize: 500,
          sortOrder: 'asc',
        }, store.selectedTreasuryId)
        allTransactions.value = store.transactions.items || []
        await store.fetchSummary(store.selectedTreasuryId)
      } catch (err) {
        console.error('[TreasuryReportNew] loadAll error:', err)
      }
    }

    const selectTreasury = async (id) => {
      store.selectTreasury(id)
      await loadAll()
    }

    const applyFilters = async () => {
      await loadAll()
    }

    const resetFilters = async () => {
      filters.startDate = ''
      filters.endDate = ''
      await loadAll()
    }

    const loadTreasuries = async () => {
      await store.fetchTreasuries({ includeArchived: treasuryView.value !== 'active' })
      if (!store.selectedTreasuryId && visibleTreasuries.value[0]) {
        store.selectTreasury(visibleTreasuries.value[0].id)
      }
      await loadAll()
    }

    const downloadReport = async (format = 'xlsx') => {
      if (!store.selectedTreasuryId) return
      exportError.value = ''
      exportingFormat.value = format
      try {
        const params = {
          startDate: filters.startDate || '',
          endDate: filters.endDate || '',
          sortOrder: 'asc',
        }
        const { data, headers } = await downloadTreasurySummary(store.selectedTreasuryId, params, format)
        const fallbackExt = format === 'pdf' ? 'pdf' : 'xlsx'
        const fallbackName = `treasury-report-${store.selectedTreasuryId}.${fallbackExt}`
        const filename = getFilenameFromHeaders(headers, fallbackName)
        const mimeType =
          format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        downloadBlobData(data, filename, mimeType)
      } catch (err) {
        console.error('[TreasuryReportNew] downloadReport error:', err)
        exportError.value = err?.response?.data?.message || t('reports.downloadError') || 'Download failed'
      } finally {
        exportingFormat.value = ''
      }
    }

    watch(treasuryView, () => loadTreasuries())

    onMounted(async () => {
      store.restoreSelection()
      await loadTreasuries()
    })

    return {
      t,
      isRTL,
      loading,
      selectedTreasury,
      selectedId,
      visibleTreasuries,
      treasuryView,
      treasurySearch,
      filters,
      reportRows,
      openingBalance,
      totalIn,
      totalOut,
      emptyRows,
      exportingFormat,
      exportError,
      formatCurrency,
      formatNumber,
      formatDateShort,
      selectTreasury,
      applyFilters,
      resetFilters,
      downloadReport,
    }
  },
}
</script>

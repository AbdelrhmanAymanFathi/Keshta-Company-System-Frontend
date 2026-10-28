<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(18rem,20rem)_minmax(0,1fr)]">
    <aside class="h-fit w-full min-w-0 rounded-2xl theme-surface p-4 shadow-sm sm:p-5 xl:sticky xl:top-4">
      <div class="flex items-center justify-between gap-3 border-b border-gray-200/70 pb-3">
        <h2 class="text-base font-semibold theme-heading theme-text-primary">{{ t('dashboard.treasury') }}</h2>
        <span class="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium theme-text-secondary">{{ visibleTreasuries.length }} {{ t('treasury.items') }}</span>
      </div>
      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.view') }}</label>
          <select v-model="treasuryView" class="h-10 w-full rounded-xl border border-gray-300 px-3 text-sm theme-input-focus">
            <option value="active">{{ t('treasury.viewActive') }}</option>
            <option value="archived">{{ t('treasury.viewArchived') }}</option>
            <option value="all">{{ t('treasury.viewAll') }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.search') }}</label>
          <Input v-model="treasurySearch" type="text" class="h-10 w-full rounded-xl" :placeholder="t('treasury.searchTreasuriesPlaceholder')" />
        </div>
      </div>
      <div v-if="!visibleTreasuries.length" class="mt-4 rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
        {{ t('labels.noData') }}
      </div>
      <div v-else class="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <ShadcnButton variant="outline" size="native" v-for="(treasury, index) in visibleTreasuries" :key="treasury.id" @click="selectTreasury(treasury.id)"
          :aria-pressed="store.selectedTreasuryId === treasury.id"
          :title="treasury.name"
          :class="['!h-auto !min-h-[4.5rem] !w-full !min-w-0 !shrink !justify-start !whitespace-normal rounded-xl border px-3 py-3 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2', store.selectedTreasuryId === treasury.id ? 'theme-selected-soft theme-border-accent' : 'border-gray-200 theme-hover-soft']">
          <div class="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
            <span class="line-clamp-2 min-w-0 text-start text-sm font-semibold leading-5 theme-text-primary">{{ treasury.name }}</span>
            <span dir="ltr" class="whitespace-nowrap text-end text-xs font-semibold tabular-nums" :class="Number(treasury.balance) < 0 ? 'text-red-600' : 'text-emerald-700'">{{ formatCurrency(treasury.balance) }}</span>
            <div class="col-span-2 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] theme-text-secondary">
              <span class="shrink-0">#{{ index + 1 }}</span>
              <span v-if="treasury.deletedAt" class="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{{ t('treasury.archived') }}</span>
              <span v-else class="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">{{ t('treasury.active') }}</span>
            </div>
          </div>
        </ShadcnButton>
      </div>
    </aside>

    <div class="min-w-0 space-y-5">
      <div class="rounded-2xl theme-surface p-4 shadow-sm sm:p-5">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="min-w-0">
            <h1 class="text-2xl font-semibold theme-heading theme-text-primary">{{ selectedTreasury?.name || t('dashboard.treasury') }}</h1>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <p class="text-sm theme-text-secondary">{{ t('treasury.ledgerTitle') }}</p>
              <span v-if="selectedTreasury" class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="selectedTreasuryIsArchived ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">{{ selectedTreasuryIsArchived ? t('treasury.archived') : t('treasury.active') }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 xl:justify-end">
            <div class="me-1 text-sm theme-text-secondary">{{ t('treasury.balance') }}: <span dir="ltr" class="font-semibold tabular-nums">{{ formatCurrency(store.summary.balance) }}</span></div>
            <Button size="sm" :disabled="!selectedTreasury || !!exportingFormat || loading" @click="downloadReport('csv')">{{ exportingFormat === 'csv' ? t('labels.loading') : t('reports.downloadCsv') }}</Button>
            <Button size="sm" :disabled="!selectedTreasury || !!exportingFormat || loading" @click="downloadReport('xlsx')">{{ exportingFormat === 'xlsx' ? t('labels.loading') : t('reports.downloadExcel') }}</Button>
            <Button size="sm" :disabled="!selectedTreasury || !!exportingFormat || loading" @click="downloadReport('pdf')">{{ exportingFormat === 'pdf' ? t('labels.loading') : t('reports.downloadPdf') }}</Button>
          </div>
        </div>
        <p v-if="exportError" class="mt-3 text-xs text-red-600">{{ exportError }}</p>
      </div>

      <div class="min-w-0 overflow-hidden rounded-2xl border border-gray-200 theme-surface shadow-sm">
        <div class="border-b border-gray-200 px-4 py-5 sm:px-5">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold theme-text-primary">{{ t('treasury.filtersTitle') }}</h2>
              <p class="mt-1 text-xs theme-text-secondary">{{ t('treasury.filtersHint') }}</p>
            </div>
          </div>
          <div class="grid min-w-0 grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 2xl:grid-cols-4">
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.dateFrom') }}</label>
              <DateField v-model="filters.startDate" :dir="isRTL ? 'rtl' : 'ltr'" class="h-10 w-full min-w-0 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none theme-input-focus" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.dateTo') }}</label>
              <DateField v-model="filters.endDate" :dir="isRTL ? 'rtl' : 'ltr'" class="h-10 w-full min-w-0 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none theme-input-focus" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.type') }}</label>
              <select v-model="filters.type" class="h-10 w-full rounded-xl border border-gray-300 px-3 text-sm focus:outline-none theme-input-focus">
                <option value="">{{ t('labels.all') }}</option>
                <option value="DEPOSIT">{{ t('treasury.types.deposit') }}</option>
                <option value="PAYMENT">{{ t('treasury.types.payment') }}</option>
                <option value="WITHDRAW">{{ t('treasury.types.withdraw') }}</option>
                <option value="ADJUSTMENT">{{ t('treasury.types.adjustment') }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.amount') }}</label>
              <Input v-model="filters.amount" type="number" step="0.01" class="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.search') }}</label>
              <Input v-model="filters.search" type="text" class="h-10 w-full rounded-xl" :placeholder="t('treasury.searchPlaceholder')" />
            </div>
            <div class="flex">
              <Button class="h-10 w-full sm:w-auto" @click="applyFilters">{{ t('labels.search') }}</Button>
            </div>
            <div class="flex">
              <Button variant="outline" class="h-10 w-full sm:w-auto" @click="resetFilters">{{ t('labels.reset') }}</Button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="px-6 py-12 text-center text-sm text-gray-500">{{ t('labels.loading') }}</div>
        <div v-else-if="error" class="px-6 py-12 text-center text-sm text-red-600">{{ error }}</div>
        <div v-else-if="!transactions.length" class="px-6 py-12 text-center text-sm text-gray-500">{{ t('treasury.noTransactions') }}</div>
        <div v-else class="treasury-transactions-scroll min-w-0">
          <table v-app-table class="treasury-transactions-table w-full min-w-[1225px] table-fixed divide-y divide-gray-200">
            <colgroup>
              <col style="width: 110px" />
              <col style="width: 135px" />
              <col style="width: 100px" />
              <col style="width: 130px" />
              <col style="width: 195px" />
              <col style="width: 205px" />
              <col style="width: 110px" />
              <col style="width: 110px" />
              <col style="width: 130px" />
            </colgroup>
            <thead class="bg-gray-50">
              <tr>
                <!-- The list is ordered by the operation date, so the sort toggle lives on it -->
                <th data-col="subtitle" :class="['px-3 py-3 text-xs font-semibold theme-text-secondary cursor-pointer select-none hover:opacity-80', isRTL ? 'text-right' : 'text-left']"
                  @click="toggleSortOrder">
                  {{ isRTL ? 'تاريخ العملية' : 'Operation date' }}
                  <SortIcon :active="true" :dir="sortOrder" />
                </th>
                <th :class="['px-3 py-3 text-xs font-semibold theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ isRTL ? 'تاريخ التسجيل' : 'Entered at' }}</th>
                <th :class="['px-3 py-3 text-xs font-semibold theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.type') }}</th>
                <th :class="['px-3 py-3 text-xs font-semibold theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.source') }}</th>
                <th :class="['px-3 py-3 text-xs font-semibold theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.description') }}</th>
                <th :class="['px-3 py-3 text-xs font-semibold theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ isRTL ? 'تفاصيل العملية' : 'Operation details' }}</th>
                <th :class="['px-3 py-3 text-xs font-semibold theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.createdBy') }}</th>
                <th :class="['px-3 py-3 text-xs font-semibold theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.updatedBy') }}</th>
                <th data-col="amount" class="px-3 py-3 text-end text-xs font-semibold theme-text-secondary">{{ t('treasury.amount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 theme-surface">
              <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50">
                <td dir="ltr" class="whitespace-nowrap px-3 py-3 text-start text-sm font-medium theme-text-primary">{{ formatDate(tx.date || tx.createdAt) }}</td>
                <td dir="ltr" class="whitespace-nowrap px-3 py-3 text-start text-sm theme-text-secondary">{{ formatDateTime(tx.createdAt || tx.date) }}</td>
                <td class="whitespace-nowrap px-3 py-3 text-sm">
                  <Badge variant="outline" :class="badgeClass(tx.type)">{{ txTypeLabel(tx.type) }}</Badge>
                </td>
                <td class="px-3 py-3 text-sm leading-5">
                  <span v-if="tx.refId" class="cursor-pointer font-medium text-blue-600 hover:text-blue-800 hover:underline" @click="navigateToSource(tx)">{{ formatSource(tx) }}</span>
                  <span v-else class="theme-text-primary">{{ formatSource(tx) }}</span>
                </td>
                <td class="break-words px-3 py-3 text-sm leading-5 theme-text-primary">{{ displayDescription(tx) }}</td>
                <!-- عمود تفاصيل العملية -->
                <td class="px-3 py-3 text-sm">
                  <div class="min-w-0 space-y-1.5 leading-5">
                    <div class="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                      <span class="text-xs font-semibold theme-text-muted">{{ t('treasury.type') }}:</span>
                      <span class="break-words text-xs font-bold theme-text-primary">{{ refTypeLabel(tx.refType) }}</span>
                    </div>
                    <div v-if="tx.refId" class="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                      <span class="text-xs font-semibold theme-text-muted">{{ t('company.wallet.reference') }}:</span>
                      <span dir="ltr" class="whitespace-nowrap text-xs font-bold text-indigo-600">#{{ tx.refId }}</span>
                    </div>
                    <div v-if="tx.source" class="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                      <span class="text-xs font-semibold theme-text-muted">{{ t('treasury.source') }}:</span>
                      <span class="break-words text-xs theme-text-primary">{{ tx.source }}</span>
                    </div>
                  </div>
                </td>
                <td class="break-words px-3 py-3 text-sm leading-5 theme-text-secondary">{{ tx.createdBy?.name || tx.createdByName || '-' }}</td>
                <td class="break-words px-3 py-3 text-sm leading-5 theme-text-secondary">{{ tx.updatedBy?.name || tx.updatedByName || '-' }}</td>
                <td dir="ltr" class="whitespace-nowrap px-3 py-3 text-end text-sm font-semibold tabular-nums" :class="Number(tx.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  {{ formatCurrency(tx.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="border-t border-gray-200 p-4">
          <Pagination
            :currentPage="store.transactions.page"
            :pageSize="store.transactions.pageSize"
            :total="store.transactions.total"
            :totalPages="totalPages"
            :pageSizeOptions="[10, 20, 50]"
            @update:page="onUpdatePage"
            @update:pageSize="onUpdatePageSize"
          />
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useTreasuryStore } from '@/stores/useTreasuryStore'
import { downloadTreasuryTransactions, getExpense } from '@/api'
import { downloadBlobData, getFilenameFromHeaders } from '@/utils/downloadFile'
import DateField from '@/components/shared/DateField.vue'
import Pagination from '@/components/shared/Pagination.vue'
import SortIcon from '@/components/shared/SortIcon.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default {
  name: 'TreasuryTransactions',
  components: { DateField, Pagination, SortIcon, Button, Input, Badge },
  setup() {
    const { t, locale } = useI18n()
    const { user } = useAuth()
    const store = useTreasuryStore()
    const router = useRouter()
    const isRTL = computed(() => locale.value?.toString().startsWith('ar'))
    const isAdmin = computed(() => {
      const roles = user.value?.roles || []
      return roles.some(role => role.roleId === 1)
    })
    const loading = computed(() => store.loading)
    const error = computed(() => store.error)
    const selectedTreasury = computed(() => store.activeTreasury)
    const selectedTreasuryIsArchived = computed(() => !!selectedTreasury.value?.deletedAt)
    const transactions = computed(() => store.transactions.items || [])
    const totalPages = computed(() => store.totalPages)
    const exportingFormat = ref('')
    const exportError = ref('')

    // ── Detail panel ───────────────────────────────────────────────────────
    const detailPanel = reactive({
      open: false,
      tx: null,
      linked: null,
      loading: false,
    })

    const openDetail = async (tx) => {
      detailPanel.open = true
      detailPanel.tx = tx
      detailPanel.linked = null
      detailPanel.loading = false
      if (tx.refType === 'EXPENSE' && tx.refId) {
        detailPanel.loading = true
        try {
          const res = await getExpense(tx.refId)
          detailPanel.linked = res.data || null
        } catch (_) {
          detailPanel.linked = null
        } finally {
          detailPanel.loading = false
        }
      }
    }

    const closeDetail = () => {
      detailPanel.open = false
      detailPanel.tx = null
      detailPanel.linked = null
    }

    const refTypeLabel = (refType) => {
      const map = {
        EXPENSE: t('expenses.expense'),
        TRANSFER: t('transfer'),
        TOPUP: t('treasury.types.deposit'),
        PAYMENT: t('treasury.types.payment'),
      }
      return map[refType] || refType || '—'
    }

    const formatNumber = (v) =>
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0))

    const formatDateShort = (value) => {
      if (!value) return '—'
      const d = new Date(value)
      if (isNaN(d.getTime())) return String(value)
      return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
    }
    const treasuryView = ref('active')
    const treasurySearch = ref('')
    const normalizedSearch = computed(() => String(treasurySearch.value || '').trim().toLowerCase())
    const visibleTreasuries = computed(() => {
      const all = Array.isArray(store.treasuries) ? store.treasuries : []
      return all.filter((treasury) => {
        const isArchived = !!treasury.deletedAt
        if (treasuryView.value === 'active' && isArchived) return false
        if (treasuryView.value === 'archived' && !isArchived) return false
        if (normalizedSearch.value && !String(treasury.name || '').toLowerCase().includes(normalizedSearch.value)) return false
        return true
      })
    })
    const filters = reactive({ startDate: '', endDate: '', type: '', amount: '', search: '' })
    const sortOrder = ref('desc')

    const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(Number(value || 0))
    const formatDate = (value) => {
      if (!value) return '-'
      const d = new Date(value)
      if (isNaN(d.getTime())) return value
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
    }
    const formatDateTime = (value) => {
      if (!value) return '-'
      const d = new Date(value)
      if (isNaN(d.getTime())) return value
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    }
    const txTypeLabel = (type) => {
      switch (String(type || '').toUpperCase()) {
        case 'DEPOSIT': return t('treasury.types.deposit')
        case 'PAYMENT': return t('treasury.types.payment')
        case 'WITHDRAW': return t('treasury.types.withdraw')
        case 'ADJUSTMENT': return t('treasury.types.adjustment')
        default: return String(type || '-')
      }
    }
    const badgeClass = (type) => {
      switch (String(type || '').toUpperCase()) {
        case 'DEPOSIT': return 'bg-emerald-100 text-emerald-700'
        case 'PAYMENT': return 'bg-red-100 text-red-700'
        case 'WITHDRAW': return 'bg-amber-100 text-amber-700'
        default: return 'bg-gray-100 text-gray-700'
      }
    }
    const formatSource = (tx) => {
      const label = tx.source || tx.refType || ''
      const refId = tx.refId
      if (!label) return '-'
      return refId ? `${label} #${refId}` : label
    }
    const displayDescription = (tx) => {
      if (locale.value?.startsWith('ar')) return tx.arDescription || tx.description || tx.refType || '-'
      return tx.description || tx.refType || '-'
    }
    const navigateToSource = (tx) => {
      if (!tx.refId) return
      const routeMap = {
        EXPENSE: '/dashboard/expenses',
        PAYMENT: '/dashboard/payments',
        TRANSFER: '/dashboard/treasury',
      }
      const path = routeMap[String(tx.refType || '').toUpperCase()]
      if (path) router.push(path)
    }

    const load = async () => {
      if (!store.selectedTreasuryId) return
      try {
        await store.fetchTransactions({
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          type: filters.type || undefined,
          amount: filters.amount !== '' ? filters.amount : undefined,
          search: filters.search || undefined,
          sortOrder: sortOrder.value,
        }, store.selectedTreasuryId)
      } catch (err) {
        console.error('[TreasuryTransactions] load error:', err)
      }
    }

    const selectTreasury = async (id) => {
      try {
        store.selectTreasury(id)
        await store.fetchSummary(id)
        await load()
      } catch (err) {
        console.error('[TreasuryTransactions] selectTreasury error:', err)
      }
    }

    const loadTreasuries = async () => {
      try {
        await store.fetchTreasuries({ includeArchived: treasuryView.value !== 'active' })
        if (!store.selectedTreasuryId && visibleTreasuries.value[0]) {
          store.selectTreasury(visibleTreasuries.value[0].id)
          await store.fetchSummary(visibleTreasuries.value[0].id)
        } else if (store.selectedTreasuryId && !visibleTreasuries.value.some((treasury) => treasury.id === store.selectedTreasuryId) && visibleTreasuries.value[0]) {
          store.selectTreasury(visibleTreasuries.value[0].id)
          await store.fetchSummary(visibleTreasuries.value[0].id)
        }
        await load()
      } catch (err) {
        console.error('[TreasuryTransactions] loadTreasuries error:', err)
      }
    }

    const applyFilters = async () => {
      try {
        store.setTransactionPage(1)
        await load()
      } catch (err) {
        console.error('[TreasuryTransactions] applyFilters error:', err)
      }
    }

    const downloadReport = async (format = 'xlsx') => {
      if (!store.selectedTreasuryId) return
      exportError.value = ''
      exportingFormat.value = format
      try {
        const params = {
          startDate: filters.startDate || '',
          endDate: filters.endDate || '',
          type: filters.type || '',
          amount: filters.amount !== '' ? filters.amount : '',
          search: filters.search || ''
        }
        const { data, headers } = await downloadTreasuryTransactions(store.selectedTreasuryId, params, format)
        const fallbackExt = format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx'
        const fallbackName = `treasury-ledger-${store.selectedTreasuryId}.${fallbackExt}`
        const filename = getFilenameFromHeaders(headers, fallbackName)
        const mimeType =
          format === 'csv'
            ? (headers && (headers['content-type'] || headers['Content-Type'])) || 'text/csv;charset=utf-8;'
            : format === 'pdf'
              ? (headers && (headers['content-type'] || headers['Content-Type'])) || 'application/pdf'
              : (headers && (headers['content-type'] || headers['Content-Type'])) || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        downloadBlobData(data, filename, mimeType)
      } catch (err) {
        console.error('Failed to download treasury ledger', err)
        exportError.value = err?.response?.data?.message || t('reports.downloadError') || 'Error downloading report'
      } finally {
        exportingFormat.value = ''
      }
    }

    const resetFilters = async () => {
      try {
        filters.startDate = ''
        filters.endDate = ''
        filters.type = ''
        filters.amount = ''
        filters.search = ''
        store.setTransactionPage(1)
        await load()
      } catch (err) {
        console.error('[TreasuryTransactions] resetFilters error:', err)
      }
    }

    const onUpdatePage = async (page) => {
      try {
        store.setTransactionPage(page)
        await load()
      } catch (err) {
        console.error('[TreasuryTransactions] onUpdatePage error:', err)
      }
    }

    const onUpdatePageSize = async (pageSize) => {
      try {
        store.setTransactionPageSize(pageSize)
        await load()
      } catch (err) {
        console.error('[TreasuryTransactions] onUpdatePageSize error:', err)
      }
    }

    onMounted(async () => {
      try {
        store.restoreSelection()
        await loadTreasuries()
      } catch (err) {
        console.error('[TreasuryTransactions] onMounted error:', err)
      }
    })

    watch(treasuryView, async () => {
      try {
        await loadTreasuries()
      } catch (err) {
        console.error('[TreasuryTransactions] watch treasuryView error:', err)
      }
    })

    // Auto-apply filters on change (no need to press Search button)
    watch(() => filters.type, () => { store.setTransactionPage(1); load() })
    watch(() => filters.startDate, () => { store.setTransactionPage(1); load() })
    watch(() => filters.endDate, () => { store.setTransactionPage(1); load() })

    let _filterTimer = null
    const debouncedLoad = () => {
      if (_filterTimer) clearTimeout(_filterTimer)
      _filterTimer = setTimeout(() => { store.setTransactionPage(1); load() }, 500)
    }
    watch(() => filters.search, debouncedLoad)
    watch(() => filters.amount, debouncedLoad)

    return {
      store,
      loading,
      error,
      selectedTreasury,
      selectedTreasuryIsArchived,
      transactions,
      totalPages,
      exportingFormat,
      exportError,
      filters,
      sortOrder,
      toggleSortOrder: () => { sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'; load() },
      treasuryView,
      treasurySearch,
      visibleTreasuries,
      formatCurrency,
      formatDate,
      formatDateTime,
      badgeClass,
      formatSource,
      navigateToSource,
      selectTreasury,
      applyFilters,
      downloadReport,
      resetFilters,      onUpdatePage,
      onUpdatePageSize,
      t,
      isRTL,
      txTypeLabel,
      displayDescription,
      loadTreasuries,
      isAdmin,
      detailPanel,
      openDetail,
      closeDetail,
      refTypeLabel,
      formatNumber,
      formatDateShort,
    }
  }
}
</script>

<style scoped>
.treasury-transactions-scroll {
  max-height: none;
  overflow-x: auto;
  overflow-y: clip;
  overscroll-behavior-x: contain;
}

.tx-fade-enter-active,
.tx-fade-leave-active {
  transition: opacity 0.18s ease;
}
.tx-fade-enter-from,
.tx-fade-leave-to {
  opacity: 0;
}
</style>

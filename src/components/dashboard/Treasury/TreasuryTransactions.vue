<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="flex flex-col gap-6 lg:flex-row">
    <aside class="w-full lg:w-80 rounded-lg theme-surface p-4 shadow-sm lg:sticky lg:top-4 h-fit">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-lg font-semibold theme-heading theme-text-primary">{{ t('dashboard.treasury') }}</h2>
        <span class="text-xs theme-text-secondary">{{ visibleTreasuries.length }} {{ t('treasury.items') }}</span>
      </div>
      <div class="mt-4">
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.view') }}</label>
        <select v-model="treasuryView" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm theme-input-focus">
          <option value="active">{{ t('treasury.viewActive') }}</option>
          <option value="archived">{{ t('treasury.viewArchived') }}</option>
          <option value="all">{{ t('treasury.viewAll') }}</option>
        </select>
      </div>
      <div class="mt-4">
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.search') }}</label>
        <input v-model="treasurySearch" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm theme-input-focus" :placeholder="t('treasury.searchTreasuriesPlaceholder')" />
      </div>
      <div v-if="!visibleTreasuries.length" class="mt-4 rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
        {{ t('labels.noData') }}
      </div>
      <div v-else class="mt-4 space-y-2">
        <button v-for="(treasury, index) in visibleTreasuries" :key="treasury.id" @click="selectTreasury(treasury.id)"
          :class="['w-full rounded-lg px-3 py-2 transition flex items-center justify-between', store.selectedTreasuryId === treasury.id ? 'ring-1 ring-offset-0 ring-indigo-300 bg-indigo-50' : 'border border-gray-200 hover:bg-gray-50']">
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="truncate text-sm font-medium theme-text-primary">{{ treasury.name }}</span>
              <span class="text-xs font-semibold" :class="Number(treasury.balance) < 0 ? 'text-red-600' : 'text-emerald-700'">{{ formatCurrency(treasury.balance) }}</span>
            </div>
            <div class="mt-1 flex items-center gap-2 text-[11px] theme-text-secondary">
              <span>#{{ index + 1 }}</span>
              <span v-if="treasury.deletedAt" class="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{{ t('treasury.archived') }}</span>
              <span v-else class="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">{{ t('treasury.active') }}</span>
            </div>
          </div>
        </button>
      </div>
    </aside>

    <div class="min-w-0 flex-1 space-y-6">
      <div class="rounded-lg theme-surface p-4 shadow-sm">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold theme-heading theme-text-primary">{{ selectedTreasury?.name || t('dashboard.treasury') }}</h1>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <p class="text-sm theme-text-secondary">{{ t('treasury.ledgerTitle') }}</p>
              <span v-if="selectedTreasury" class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="selectedTreasuryIsArchived ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">{{ selectedTreasuryIsArchived ? t('treasury.archived') : t('treasury.active') }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="text-sm theme-text-secondary">{{ t('treasury.balance') }}: <span class="font-semibold">{{ formatCurrency(store.summary.balance) }}</span></div>
            <button type="button" class="theme-button px-3 py-2" :disabled="!selectedTreasury || !!exportingFormat || loading" @click="downloadReport('csv')">{{ exportingFormat === 'csv' ? t('labels.loading') : t('reports.downloadCsv') }}</button>
            <button type="button" class="theme-button px-3 py-2" :disabled="!selectedTreasury || !!exportingFormat || loading" @click="downloadReport('xlsx')">{{ exportingFormat === 'xlsx' ? t('labels.loading') : t('reports.downloadExcel') }}</button>
            <button type="button" class="theme-button px-3 py-2" :disabled="!selectedTreasury || !!exportingFormat || loading" @click="downloadReport('pdf')">{{ exportingFormat === 'pdf' ? t('labels.loading') : t('reports.downloadPdf') }}</button>
          </div>
          <p v-if="exportError" class="text-xs text-red-600">{{ exportError }}</p>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 px-4 py-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-semibold text-gray-900">{{ t('treasury.filtersTitle') }}</h2>
              <p class="text-xs text-gray-500">{{ t('treasury.filtersHint') }}</p>
            </div>
          </div>
          <div class="grid gap-4 grid-cols-1 lg:grid-cols-5">
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.dateFrom') }}</label>
              <DateField v-model="filters.startDate" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.dateTo') }}</label>
              <DateField v-model="filters.endDate" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.type') }}</label>
              <select v-model="filters.type" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none theme-input-focus">
                <option value="">{{ t('labels.all') }}</option>
                <option value="DEPOSIT">{{ t('treasury.types.deposit') }}</option>
                <option value="PAYMENT">{{ t('treasury.types.payment') }}</option>
                <option value="WITHDRAW">{{ t('treasury.types.withdraw') }}</option>
                <option value="ADJUSTMENT">{{ t('treasury.types.adjustment') }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.amountFrom') }}</label>
              <input v-model="filters.amountMin" type="number" step="0.01" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.amountTo') }}</label>
              <input v-model="filters.amountMax" type="number" step="0.01" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
            </div>
          </div>
          <div class="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-[1fr_auto_auto]">
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.search') }}</label>
              <input v-model="filters.search" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none theme-input-focus" :placeholder="t('treasury.searchPlaceholder')" />
            </div>
            <div class="flex items-end">
            <button class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" @click="applyFilters">{{ t('labels.search') }}</button>
            </div>
            <div class="flex items-end">
            <button class="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" @click="resetFilters">{{ t('labels.reset') }}</button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="px-6 py-12 text-center text-sm text-gray-500">{{ t('labels.loading') }}</div>
        <div v-else-if="error" class="px-6 py-12 text-center text-sm text-red-600">{{ error }}</div>
        <div v-else-if="!transactions.length" class="px-6 py-12 text-center text-sm text-gray-500">{{ t('treasury.noTransactions') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.dateTime') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.type') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.source') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.description') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.createdBy') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.updatedBy') }}</th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">{{ t('treasury.amount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-700">{{ formatDateTime(tx.createdAt || tx.date) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="badgeClass(tx.type)">{{ txTypeLabel(tx.type) }}</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span v-if="tx.refId" class="cursor-pointer font-medium text-blue-600 hover:text-blue-800 hover:underline" @click="navigateToSource(tx)">{{ formatSource(tx) }}</span>
                  <span v-else class="text-gray-700">{{ formatSource(tx) }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ displayDescription(tx) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ tx.createdBy?.name || tx.createdByName || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ tx.updatedBy?.name || tx.updatedByName || '-' }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold" :class="Number(tx.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'">
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
import { downloadTreasuryTransactions } from '@/api'
import { downloadBlobData, getFilenameFromHeaders } from '@/utils/downloadFile'
import DateField from '@/components/shared/DateField.vue'
import Pagination from '@/components/shared/Pagination.vue'

export default {
  name: 'TreasuryTransactions',
  components: { DateField, Pagination },
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
    const filters = reactive({ startDate: '', endDate: '', type: '', amountMin: '', amountMax: '', search: '' })

    const formatCurrency = (value) => new Intl.NumberFormat(locale.value || 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(Number(value || 0))
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
          amountMin: filters.amountMin !== '' ? filters.amountMin : undefined,
          amountMax: filters.amountMax !== '' ? filters.amountMax : undefined,
          search: filters.search || undefined,
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
          amountMin: filters.amountMin !== '' ? filters.amountMin : '',
          amountMax: filters.amountMax !== '' ? filters.amountMax : '',
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
        filters.amountMin = ''
        filters.amountMax = ''
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
    watch(() => filters.amountMin, debouncedLoad)
    watch(() => filters.amountMax, debouncedLoad)

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
    }
  }
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-[2100] flex items-start justify-center bg-black/30 p-6">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-[85vh] p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">{{ $t('wallet.ledger') || 'Wallet Ledger' }}</h3>
        <div class="flex items-center gap-2">
          <button @click="$emit('close')" class="px-3 py-1 border rounded">{{ $t('labels.close') }}</button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label class="text-xs theme-text-secondary">{{ $t('labels.startDate') }}</label>
          <DateField v-model="filters.start" class="w-full px-2 py-1 border rounded" />
        </div>
        <div>
          <label class="text-xs theme-text-secondary">{{ $t('labels.endDate') }}</label>
          <DateField v-model="filters.end" class="w-full px-2 py-1 border rounded" />
        </div>
        <div>
          <label class="text-xs theme-text-secondary">{{ $t('labels.type') }}</label>
          <select v-model="filters.type" class="w-full px-2 py-1 border rounded">
            <option value="">{{ $t('labels.all') || 'All' }}</option>
            <option value="EXPORT">EXPORT</option>
            <option value="TRANSPORT">TRANSPORT</option>
            <option value="DEPOSIT">DEPOSIT</option>
            <option value="WITHDRAWAL">WITHDRAWAL</option>
            <option value="EXPENSE">EXPENSE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between mb-4">
        <div class="flex gap-2">
          <button @click="applyFilters" class="px-3 py-1 theme-button rounded">{{ $t('labels.filter') }}</button>
          <button @click="resetFilters" class="px-3 py-1 border rounded">{{ $t('labels.clear') }}</button>
        </div>
        <div class="flex gap-2">
          <button @click="downloadCsv" class="px-3 py-1 border rounded">{{ $t('labels.exportCsv') || 'Export CSV' }}</button>
        </div>
      </div>

      <div v-if="loading" class="p-6 text-center">{{ $t('labels.loading') || 'Loading...' }}</div>

      <div v-else>
        <div class="overflow-auto">
          <table class="min-w-full text-sm">
            <thead class="theme-dashboard-bg-soft">
              <tr>
                <th class="px-3 py-2 text-left">#</th>
                <th class="px-3 py-2 text-left">{{ $t('labels.date') }}</th>
                <th class="px-3 py-2 text-left">{{ $t('labels.type') }}</th>
                <th class="px-3 py-2 text-right">{{ $t('labels.amount') }}</th>
                <th class="px-3 py-2 text-right">{{ $t('labels.signedAmount') || $t('labels.amount') }}</th>
                <th class="px-3 py-2 text-left">{{ $t('labels.description') }}</th>
                <th class="px-3 py-2 text-right">{{ $t('labels.balanceAfter') || 'Balance After' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tx, idx) in items" :key="tx.id || idx" class="border-t">
                <td class="px-3 py-2">{{ (page - 1) * pageSize + idx + 1 }}</td>
                <td class="px-3 py-2">{{ formatDate(tx.createdAt || tx.date) }}</td>
                <td class="px-3 py-2">{{ tx.type }}</td>
                <td class="px-3 py-2 text-right">{{ formatCurrency(tx.amount) }}</td>
                <td class="px-3 py-2 text-right" :class="tx.signedAmount < 0 ? 'text-red-600' : 'text-green-600'">{{ (tx.signedAmount < 0 ? '-' : '+') + formatCurrency(Math.abs(tx.signedAmount)) }}</td>
                <td class="px-3 py-2">{{ tx.description || '-' }}</td>
                <td class="px-3 py-2 text-right">{{ formatCurrency(tx.balanceAfter ?? tx.balance) }}</td>
              </tr>
              <tr v-if="items.length === 0">
                <td class="p-4 text-center theme-text-muted" :colspan="7">{{ $t('payments.noPayments') || 'No transactions found' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <div>
            <small class="text-sm theme-text-secondary">{{ $t('labels.page') || 'Page' }} {{ page }} / {{ totalPages }}</small>
          </div>
          <div class="flex items-center gap-2">
            <button @click="changePage(page - 1)" :disabled="page <= 1" class="px-2 py-1 border rounded">&lt;</button>
            <button @click="changePage(page + 1)" :disabled="page >= totalPages" class="px-2 py-1 border rounded">&gt;</button>
            <select v-model.number="pageSize" @change="onPageSizeChange" class="px-2 py-1 border rounded">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getContractorWalletTransactions, getAccountTransactions } from '@/api'
import DateField from '@/components/shared/DateField.vue'
export default {
  name: 'ContractorWalletLedger',
  components: { DateField },
  props: { contractorId: { type: [String, Number], required: false }, accountId: { type: [String, Number], required: false }, visible: { type: Boolean, default: false } },
  data() {
    return {
      items: [],
      loading: false,
      page: 1,
      pageSize: 20,
      total: 0,
      filters: { start: '', end: '', type: '' }
    }
  },
  computed: {
    totalPages() { return Math.max(1, Math.ceil((this.total || 0) / this.pageSize)) }
  },
  watch: {
    visible(val) { if (val) this.load(); else { this.items = [] } },
    contractorId() { if (this.visible) this.load() }
  },
  methods: {
    async load() {
      // If accountId is provided, fetch transactions for that account
      if (!this.contractorId && !this.accountId) return
      this.loading = true
      try {
        const params = { page: this.page, pageSize: this.pageSize, start: this.filters.start, end: this.filters.end, type: this.filters.type }
        let res, data
        if (this.accountId) {
          res = await getAccountTransactions(this.accountId, params)
          data = res?.data || {}
          this.items = data.items || data || []
          this.total = (data.meta && data.meta.total) || data.total || (Array.isArray(data) ? data.length : 0)
        } else {
          res = await getContractorWalletTransactions(this.contractorId, params)
          data = res?.data || {}
          this.items = data.items || data || []
          this.total = (data.meta && data.meta.total) || data.total || (Array.isArray(data) ? data.length : 0)
        }
      } catch (e) {
        console.error('Failed to load wallet transactions', e)
        this.items = []
        this.total = 0
      } finally { this.loading = false }
    },
    applyFilters() { this.page = 1; this.load() },
    resetFilters() { this.filters = { start: '', end: '', type: '' }; this.page = 1; this.load() },
    changePage(p) { if (p < 1) p = 1; if (p > this.totalPages) p = this.totalPages; this.page = p; this.load() },
    onPageSizeChange() { this.page = 1; this.load() },
    formatDate(d) { if (!d) return '-'; try { return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d)) } catch { return d } },
    formatCurrency(v) {
      if (v === undefined || v === null) return '-'
      const rtl = this.$i18n?.locale === 'ar'
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v))
      return rtl && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    },
    downloadCsv() {
      if (!this.items || !this.items.length) return
      const rows = this.items.map(tx => ({
        date: tx.createdAt || tx.date,
        type: tx.type,
        refId: tx.refId || '',
        amount: tx.amount,
        signedAmount: tx.signedAmount,
        description: tx.description || '',
        balanceAfter: tx.balanceAfter || ''
      }))
      const header = Object.keys(rows[0])
      const csv = [header.join(',')].concat(rows.map(r => header.map(h => `"${String(r[h] ?? '')}"`).join(','))).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wallet-transactions-${this.contractorId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }
}
</script>

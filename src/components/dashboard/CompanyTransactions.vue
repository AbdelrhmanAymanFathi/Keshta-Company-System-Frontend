<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div :class="['flex items-center justify-between mb-4', isRTL ? 'flex-row-reverse' : '']">
      <h3 :class="['text-lg font-medium text-gray-900 flex items-center gap-2', isRTL ? 'text-end' : 'text-start']">
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h4l3 8 4-16 3 8h4" />
        </svg>
        <span>{{ $t('transactions') || 'Transaction History' }}</span>
      </h3>
    </div>

    <!-- Moved Summary Cards (Balance / Income / Expenses) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div :class="['bg-white rounded-lg shadow p-4 border-l-4 border-indigo-600', isRTL ? 'text-end' : 'text-start']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ $t('finance.currentBalance') }}</p>
            <p class="text-2xl font-bold text-indigo-600 mt-1">{{ formatCurrency(summary.balance) }}</p>
          </div>
          <svg class="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
            </path>
          </svg>
        </div>
      </div>
      <div :class="['bg-white rounded-lg shadow p-4 border-l-4 border-green-600', isRTL ? 'text-end' : 'text-start']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ $t('finance.last30dIn') }}</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ formatCurrency(summary.last30dIn) }}</p>
          </div>
          <svg class="w-10 h-10 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
            </path>
          </svg>
        </div>
      </div>
      <div :class="['bg-white rounded-lg shadow p-4 border-l-4 border-red-600', isRTL ? 'text-end' : 'text-start']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ $t('finance.last30dOut') }}</p>
            <p class="text-2xl font-bold text-red-600 mt-1">{{ formatCurrency(summary.last30dOut) }}</p>
          </div>
          <svg class="w-10 h-10 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
            </path>
          </svg>
        </div>
      </div>
    </div>

    <div v-if="loading" class="py-10 flex items-center justify-center">
      <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    </div>

    <div v-else-if="error" class="p-4 text-sm text-red-600">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="transactions.items.length === 0" class="p-6 text-center text-sm text-gray-600">
        {{ $t('noTransactions') || 'لا توجد عمليات مالية' }}
      </div>

      <div v-else class="overflow-hidden rounded-lg border border-gray-100">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">{{ $t('labels.date') || 'Date' }}</th>
              <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">{{ $t('labels.type') || 'Type' }}</th>
              <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">{{ $t('labels.description') || 'Description' }}</th>
              <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">{{ $t('dashboard.companyWallet') || 'Branch' }}</th>
              <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">{{ $t('labels.amount') || 'Amount' }}</th>
              <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">{{ $t('#') || 'Ref' }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tx in transactions.items" :key="tx.id" class="hover:bg-gray-50">
              <td :class="['px-6 py-4 whitespace-nowrap text-sm text-gray-900', isRTL ? 'text-end' : 'text-start']">{{ formatDate(tx.date) }}</td>
              <td :class="['px-6 py-4 whitespace-nowrap text-sm', isRTL ? 'text-end' : 'text-start']">
                <BadgeComponent :variant="badgeVariant(tx.type)">{{ badgeLabel(tx.type) }}</BadgeComponent>
              </td>
              <td :class="['px-6 py-4 text-sm text-gray-900', isRTL ? 'text-end' : 'text-start']">{{ tx.description || '-' }}</td>
              <td :class="['px-6 py-4 whitespace-nowrap text-sm text-gray-700', isRTL ? 'text-end' : 'text-start']">{{ getBranchName(tx.branchId) }}</td>
              <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold', isRTL ? 'text-end' : 'text-start']">
                <span :class="amountClass(tx.amount)">{{ amountSign(tx.amount) }}{{ formatCurrency(Math.abs(Number(tx.amount || 0))) }}</span>
              </td>
              <td :class="['px-6 py-4 text-sm text-gray-500', isRTL ? 'text-end' : 'text-start']">{{ getReferenceLabel(tx) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" :class="['mt-4', isRTL ? 'flex-row-reverse' : '']">
        <Pagination
          :currentPage="transactions.page"
          :pageSize="transactions.pageSize"
          :total="transactions.total"
          :totalPages="totalPages"
          :pageSizeOptions="[10,20,50]"
          @update:page="onUpdatePage"
          @update:pageSize="onUpdatePageSize"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCompanyFinanceStore } from '@/stores/useCompanyFinanceStore'
import BadgeComponent from '../shared/Badge.vue'
import Pagination from '../shared/Pagination.vue'

export default {
  name: 'CompanyTransactions',
  components: { BadgeComponent, Pagination },
  setup() {
    const store = useCompanyFinanceStore()

    const summary = computed(() => store.summary || { balance: 0, last30dIn: 0, last30dOut: 0 })

    const transactions = computed(() => store.transactions)
    const loading = computed(() => store.loading)
    const error = computed(() => store.error)

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    const formatCurrency = (amount) => {
      const numAmount = parseFloat(amount)
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(numAmount)
    }

    const badgeVariant = (type) => {
      switch ((type || '').toUpperCase()) {
        case 'DEPOSIT': return 'success'
        case 'WITHDRAW': return 'danger'
        case 'EXPENSE': return 'warning'
        default: return 'muted'
      }
    }

    const { t } = useI18n()

    const badgeLabel = (type) => {
      switch ((type || '').toUpperCase()) {
        case 'DEPOSIT': return t('labels.deposit') || 'إيداع'
        case 'WITHDRAW': return t('labels.withdraw') || 'سحب'
        case 'EXPENSE': return t('expenses.expense') || 'مصروف'
        default: return type || '-'
      }
    }

    const amountClass = (amt) => (Number(amt) >= 0 ? 'text-green-600' : 'text-red-600')
    const amountSign = (amt) => Number(amt) > 0 ? '+' : ''

    const getBranchName = (branchId) => {
      if (!branchId) return t('dashboard.companyWallet') || 'الخزينة الرئيسية'
      const b = store.company?.branches?.find(bb => bb.id === branchId)
      return b ? b.name : (t('dashboard.companyWallet') || 'الخزينة الرئيسية')
    }

    const getReferenceLabel = (tx) => {
      if (!tx) return ''
      if (tx.refType === 'EXPENSE' && tx.refId) return `${t('expenses.expense') || 'مصروف'} #${tx.refId}`
      if (tx.transferId) return t('transfer') || 'تحويل'
      return ''
    }

    const changePage = async (p) => {
      if (p < 1 || p > Math.ceil(transactions.value.total / transactions.value.pageSize)) return
      store.setTransactionPage(p)
      await store.fetchTransactions()
    }

    const totalPages = computed(() => store.totalPages)

    const onUpdatePage = async (p) => {
      changePage(p)
    }

    const onUpdatePageSize = async (size) => {
      store.setTransactionPageSize(size)
      await store.fetchTransactions()
    }

    onMounted(async () => {
      await store.fetchTransactions()
    })

    const isRTL = computed(() => {
      if (typeof window !== 'undefined' && window.__VUE_I18N__ && window.__VUE_I18N__.global) {
        return window.__VUE_I18N__.global.locale.value === 'ar'
      }
      if (typeof window !== 'undefined' && window.$i18n) {
        return window.$i18n.locale === 'ar'
      }
      return false
    })

    return {
      transactions,
      loading,
      error,
      formatDate,
      formatCurrency,
      badgeVariant,
      badgeLabel,
      amountClass,
      amountSign,
      getBranchName,
      getReferenceLabel,
      changePage,
      totalPages,
      onUpdatePage,
      onUpdatePageSize,
      isRTL
      ,summary
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Balance Card -->
    <div class="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-6 text-white">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-lg font-medium text-indigo-100 mb-1">{{ $t('finance.balance') }}</h3>
          <p class="text-3xl font-bold">{{ financeStore.formattedBalance }}</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="openDepositModal"
            class="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ $t('finance.deposit') }}
          </button>
          <button
            @click="openWithdrawModal"
            class="px-4 py-2 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-600 transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
            {{ $t('finance.withdraw') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Stats Bar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Current Balance -->
      <div class="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ $t('finance.currentBalance') }}</p>
            <p class="text-2xl font-bold text-indigo-600 mt-1">{{ financeStore.formattedBalance }}</p>
          </div>
          <svg class="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>

      <!-- Last 30 Days In -->
      <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ $t('finance.last30dIn') }}</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ financeStore.formattedLast30dIn }}</p>
          </div>
          <svg class="w-10 h-10 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>

      <!-- Last 30 Days Out -->
      <div class="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ $t('finance.last30dOut') }}</p>
            <p class="text-2xl font-bold text-red-600 mt-1">{{ financeStore.formattedLast30dOut }}</p>
          </div>
          <svg class="w-10 h-10 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Transactions Stats Bar -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="text-sm text-gray-600">
          {{ $t('finance.totalTransactions') }}: <span class="font-semibold">{{ financeStore.transactions.total }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <label>{{ $t('finance.pageSize') }}:</label>
          <select :value="financeStore.transactions.pageSize" @change="onPageSizeChange" 
            class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="financeStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="financeStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-red-800">{{ financeStore.error }}</span>
      </div>
    </div>

    <!-- Transactions Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- No Results Message -->
      <div v-if="financeStore.transactions.items.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('finance.noTransactions') }}</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ $t('finance.noTransactionsDesc') }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('finance.date') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('finance.type') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('finance.amount') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('finance.description') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('finance.reference') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in financeStore.transactions.items" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <Badge :variant="getTransactionVariant(transaction.type)">
                  {{ getTransactionTypeLabel(transaction.type) }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold" :class="getAmountColor(transaction.type)">
                {{ formatCurrency(transaction.amount) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ transaction.description || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <span v-if="transaction.refType && transaction.refType !== 'NONE'">
                  {{ transaction.refType }}: {{ transaction.refId || '-' }}
                </span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="financeStore.totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="changePage(financeStore.transactions.page - 1)" 
            :disabled="financeStore.transactions.page <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.previous') }}
          </button>
          <span class="text-sm text-gray-700 self-center">
            {{ financeStore.transactions.page }} / {{ financeStore.totalPages }}
          </span>
          <button @click="changePage(financeStore.transactions.page + 1)" 
            :disabled="financeStore.transactions.page >= financeStore.totalPages"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.next') }}
          </button>
        </div>

        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              {{ $t('labels.showing') }} 
              <span class="font-medium">{{ ((financeStore.transactions.page - 1) * financeStore.transactions.pageSize) + 1 }}</span>
              {{ $t('labels.to') }}
              <span class="font-medium">{{ Math.min(financeStore.transactions.page * financeStore.transactions.pageSize, financeStore.transactions.total) }}</span>
              {{ $t('labels.of') }}
              <span class="font-medium">{{ financeStore.transactions.total }}</span>
              {{ $t('labels.results') }}
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="changePage(financeStore.transactions.page - 1)" 
                :disabled="financeStore.transactions.page <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button @click="changePage(financeStore.transactions.page + 1)" 
                :disabled="financeStore.transactions.page >= financeStore.totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Deposit Modal -->
    <div v-if="showDepositModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeDepositModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('finance.deposit') }}</h3>
          <form @submit.prevent="handleDeposit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('finance.amount') }} *
              </label>
              <input
                v-model.number="depositForm.amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('finance.description') }}
              </label>
              <input
                v-model="depositForm.description"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('finance.date') }} *
              </label>
              <input
                v-model="depositForm.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeDepositModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                {{ $t('labels.cancel') }}
              </button>
              <button type="submit" :disabled="processing"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition">
                {{ processing ? $t('labels.processing') : $t('finance.deposit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Withdraw Modal -->
    <div v-if="showWithdrawModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeWithdrawModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('finance.withdraw') }}</h3>
          <form @submit.prevent="handleWithdraw" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('finance.amount') }} *
              </label>
              <input
                v-model.number="withdrawForm.amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('finance.description') }}
              </label>
              <input
                v-model="withdrawForm.description"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('finance.date') }} *
              </label>
              <input
                v-model="withdrawForm.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeWithdrawModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                {{ $t('labels.cancel') }}
              </button>
              <button type="submit" :disabled="processing"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition">
                {{ processing ? $t('labels.processing') : $t('finance.withdraw') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useCompanyFinanceStore } from '@/stores/useCompanyFinanceStore'
import Badge from '../shared/Badge.vue'

export default {
  name: 'CompanyFinance',
  components: { Badge },
  setup() {
    const financeStore = useCompanyFinanceStore()
    const showDepositModal = ref(false)
    const showWithdrawModal = ref(false)
    const processing = ref(false)

    const depositForm = ref({
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    })

    const withdrawForm = ref({
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    })

    const openDepositModal = () => {
      depositForm.value = {
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
      }
      showDepositModal.value = true
    }

    const closeDepositModal = () => {
      showDepositModal.value = false
    }

    const openWithdrawModal = () => {
      withdrawForm.value = {
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
      }
      showWithdrawModal.value = true
    }

    const closeWithdrawModal = () => {
      showWithdrawModal.value = false
    }

    const handleDeposit = async () => {
      if (!depositForm.value.amount || depositForm.value.amount <= 0) {
        if (window.$toast) {
          window.$toast('Please enter a valid amount', 'error')
        }
        return
      }

      processing.value = true
      try {
        await financeStore.deposit(
          depositForm.value.amount,
          depositForm.value.description,
          depositForm.value.date
        )
        closeDepositModal()
        if (window.$toast) {
          window.$toast('Deposit successful', 'success')
        }
      } catch (error) {
        console.error('Error depositing:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to deposit', 'error')
        }
      } finally {
        processing.value = false
      }
    }

    const handleWithdraw = async () => {
      if (!withdrawForm.value.amount || withdrawForm.value.amount <= 0) {
        if (window.$toast) {
          window.$toast('Please enter a valid amount', 'error')
        }
        return
      }

      processing.value = true
      try {
        await financeStore.withdraw(
          withdrawForm.value.amount,
          withdrawForm.value.description,
          withdrawForm.value.date
        )
        closeWithdrawModal()
        if (window.$toast) {
          window.$toast('Withdrawal successful', 'success')
        }
      } catch (error) {
        console.error('Error withdrawing:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to withdraw', 'error')
        }
      } finally {
        processing.value = false
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= financeStore.totalPages) {
        financeStore.setTransactionPage(page)
        financeStore.fetchTransactions()
      }
    }

    const onPageSizeChange = (event) => {
      financeStore.setTransactionPageSize(parseInt(event.target.value))
      financeStore.fetchTransactions()
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatCurrency = (amount) => {
      const numAmount = parseFloat(amount)
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
      }).format(numAmount)
    }

    const getTransactionVariant = (type) => {
      const variants = {
        'DEPOSIT': 'success',
        'WITHDRAW': 'danger',
        'RENT_INCOME': 'success',
        'EXPENSE': 'warning',
        'RENT_PAYOUT': 'danger'
      }
      return variants[type] || 'info'
    }

    const getTransactionTypeLabel = (type) => {
      const labels = {
        'DEPOSIT': 'Deposit',
        'WITHDRAW': 'Withdrawal',
        'RENT_INCOME': 'Rental Income',
        'EXPENSE': 'Expense',
        'RENT_PAYOUT': 'Rental Payout'
      }
      return labels[type] || type
    }

    const getAmountColor = (type) => {
      if (['DEPOSIT', 'RENT_INCOME'].includes(type)) {
        return 'text-green-600'
      } else if (['WITHDRAW', 'EXPENSE', 'RENT_PAYOUT'].includes(type)) {
        return 'text-red-600'
      }
      return 'text-gray-900'
    }

    onMounted(async () => {
      await financeStore.fetchCompany()
      await financeStore.fetchSummary()
      await financeStore.fetchTransactions()
    })

    return {
      financeStore,
      showDepositModal,
      showWithdrawModal,
      processing,
      depositForm,
      withdrawForm,
      openDepositModal,
      closeDepositModal,
      openWithdrawModal,
      closeWithdrawModal,
      handleDeposit,
      handleWithdraw,
      changePage,
      onPageSizeChange,
      formatDate,
      formatCurrency,
      getTransactionVariant,
      getTransactionTypeLabel,
      getAmountColor
    }
  }
}
</script>

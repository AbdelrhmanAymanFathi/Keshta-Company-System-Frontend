<template>
  <div class="flex gap-6">
    <!-- Sidebar for branches -->
    <aside class="w-64 bg-white rounded-lg shadow p-4 h-fit self-start sticky top-4">
      <h3 class="text-lg font-semibold mb-4">{{ $t('company.wallet.branches') || 'Branches' }}</h3>
      <ul>
        <li
          :class="['mb-2', selectedBranchId === null ? 'font-bold theme-text-strong' : 'text-gray-700', 'cursor-pointer', 'theme-hover-soft', 'rounded', 'px-2', 'py-1']"
          @click="selectBranch(null)"
        >
          <span>{{ $t('company.wallet.mainCompany') || 'Main Company' }}</span>
        </li>
        <li
          v-for="branch in branches"
          :key="branch.id"
          :class="['mb-2', selectedBranchId === branch.id ? 'font-bold theme-text-strong' : 'text-gray-700', 'cursor-pointer', 'theme-hover-soft', 'rounded', 'px-2', 'py-1', 'flex', 'justify-between', 'items-center']"
          @click="selectBranch(branch.id)"
        >
          <span>{{ branch.name }}</span>
          <span v-if="branchSummaries[branch.id]" class="text-xs text-gray-500">{{ formatCurrency(branchSummaries[branch.id].balance) }}</span>
        </li>
      </ul>
    </aside>
    <div class="flex-1 space-y-6">
      <!-- كل محتوى المحفظة الرئيسي هنا -->
      <slot />
    </div>

    <!-- Stats Bar -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="text-sm text-gray-600">
          {{ $t('company.wallet.totalTransactions') }}: <span class="font-semibold">{{ companyStore.transactions.total }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <label>{{ $t('company.wallet.pageSize') }}:</label>
          <select :value="companyStore.transactions.pageSize" @change="onPageSizeChange" 
            class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none theme-input-focus">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="companyStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="companyStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-red-800">{{ companyStore.error }}</span>
      </div>
    </div>

    <!-- Transactions Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- No Results Message -->
      <div v-if="companyStore.transactions.items.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('company.wallet.noTransactions') }}</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ $t('company.wallet.noTransactionsDesc') }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('company.wallet.date') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('company.wallet.type') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('company.wallet.amount') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('company.wallet.description') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('company.wallet.reference') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in companyStore.transactions.items" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <Badge :variant="transaction.type === 'DEPOSIT' ? 'success' : 'danger'">
                  {{ transaction.type === 'DEPOSIT' ? $t('company.wallet.deposit') : $t('company.wallet.withdraw') }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold" :class="transaction.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'">
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
      <div v-if="companyStore.totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="changePage(companyStore.transactions.page - 1)" 
            :disabled="companyStore.transactions.page <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.previous') }}
          </button>
          <span class="text-sm text-gray-700 self-center">
            {{ companyStore.transactions.page }} / {{ companyStore.totalPages }}
          </span>
          <button @click="changePage(companyStore.transactions.page + 1)" 
            :disabled="companyStore.transactions.page >= companyStore.totalPages"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.next') }}
          </button>
        </div>

        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              {{ $t('labels.showing') }} 
              <span class="font-medium">{{ ((companyStore.transactions.page - 1) * companyStore.transactions.pageSize) + 1 }}</span>
              {{ $t('labels.to') }}
              <span class="font-medium">{{ Math.min(companyStore.transactions.page * companyStore.transactions.pageSize, companyStore.transactions.total) }}</span>
              {{ $t('labels.of') }}
              <span class="font-medium">{{ companyStore.transactions.total }}</span>
              {{ $t('labels.results') }}
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="changePage(companyStore.transactions.page - 1)" 
                :disabled="companyStore.transactions.page <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button @click="changePage(companyStore.transactions.page + 1)" 
                :disabled="companyStore.transactions.page >= companyStore.totalPages"
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
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('company.wallet.deposit') }}</h3>
          <form @submit.prevent="handleDeposit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('company.wallet.amount') }} *
              </label>
              <input
                v-model.number="depositForm.amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('company.wallet.description') }}
              </label>
              <input
                v-model="depositForm.description"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('company.wallet.date') }} *
              </label>
              <DateField
                v-model="depositForm.date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus"
              />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeDepositModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                {{ $t('labels.cancel') }}
              </button>
              <button type="submit" :disabled="processing"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition">
                {{ processing ? $t('labels.processing') : $t('company.wallet.deposit') }}
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
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('company.wallet.withdraw') }}</h3>
          <form @submit.prevent="handleWithdraw" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('company.wallet.amount') }} *
              </label>
              <input
                v-model.number="withdrawForm.amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('company.wallet.description') }}
              </label>
              <input
                v-model="withdrawForm.description"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('company.wallet.date') }} *
              </label>
              <DateField
                v-model="withdrawForm.date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus"
              />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeWithdrawModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                {{ $t('labels.cancel') }}
              </button>
              <button type="submit" :disabled="processing"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition">
                {{ processing ? $t('labels.processing') : $t('company.wallet.withdraw') }}
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
import { useCompanyStore } from '@/stores/useCompanyStore'
import { getBranches, getBranchWalletSummary, getBranchWalletTransactions, depositToBranchWallet, withdrawFromBranchWallet } from '../../api'
import Badge from '../shared/Badge.vue'
import DateField from '../shared/DateField.vue'
import { getTodayISO } from '@/utils/dateUtils'

export default {
  name: 'CompanyWallet',
  components: { Badge, DateField },
  setup() {
    const companyStore = useCompanyStore()
    const showDepositModal = ref(false)
    const showWithdrawModal = ref(false)
    const processing = ref(false)

    // Sidebar state
    const branches = ref([])
    const branchSummaries = ref({})
    const selectedBranchId = ref(null) // null = main company

    // Branch wallet state
    const branchTransactions = ref({ items: [], total: 0 })
    const branchPage = ref(1)
    const branchPageSize = ref(20)
    const branchTotalPages = ref(1)
    const branchLoading = ref(false)
    const branchError = ref(null)

    // Deposit/Withdraw forms
    const depositForm = ref({
      amount: 0,
      description: '',
      date: getTodayISO()
    })
    const withdrawForm = ref({
      amount: 0,
      description: '',
      date: getTodayISO()
    })

    // Fetch branches and summaries
    const fetchBranchesAndSummaries = async () => {
      try {
        const res = await getBranches()
        branches.value = res.data
        // Fetch summary for each branch
        for (const branch of res.data) {
          getBranchWalletSummary(branch.id).then(summaryRes => {
            branchSummaries.value[branch.id] = summaryRes.data
          }).catch(() => {
            branchSummaries.value[branch.id] = { balance: 0, last30dIn: 0, last30dOut: 0 }
          })
        }
      } catch (e) {
        // ignore
      }
    }

    // Select branch (null = main company)
    const selectBranch = async (branchId) => {
      selectedBranchId.value = branchId
      if (branchId === null) {
        // Main company
        await companyStore.fetchCompany()
        await companyStore.fetchTransactions()
      } else {
        await fetchBranchTransactions()
      }
    }

    // Fetch branch transactions
    const fetchBranchTransactions = async () => {
      if (!selectedBranchId.value) return
      branchLoading.value = true
      branchError.value = null
      try {
        const res = await getBranchWalletTransactions(selectedBranchId.value, { page: branchPage.value, pageSize: branchPageSize.value })
        branchTransactions.value = res.data
        branchTotalPages.value = Math.ceil(res.data.total / branchPageSize.value)
      } catch (e) {
        branchError.value = e.message || 'Error loading branch transactions'
      } finally {
        branchLoading.value = false
      }
    }

    // Pagination
    const changePage = (page) => {
      if (selectedBranchId.value === null) {
        if (page >= 1 && page <= companyStore.totalPages) {
          companyStore.setTransactionPage(page)
          companyStore.fetchTransactions()
        }
      } else {
        if (page >= 1 && page <= branchTotalPages.value) {
          branchPage.value = page
          fetchBranchTransactions()
        }
      }
    }

    const onPageSizeChange = (event) => {
      const size = parseInt(event.target.value)
      if (selectedBranchId.value === null) {
        companyStore.setTransactionPageSize(size)
        companyStore.fetchTransactions()
      } else {
        branchPageSize.value = size
        branchPage.value = 1
        fetchBranchTransactions()
      }
    }

    // Deposit/Withdraw logic
    const openDepositModal = () => {
      depositForm.value = {
        amount: 0,
        description: '',
        date: getTodayISO()
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
        date: getTodayISO()
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
        if (selectedBranchId.value === null) {
          await companyStore.deposit(
            depositForm.value.amount,
            depositForm.value.description,
            depositForm.value.date
          )
          await companyStore.fetchCompany()
          await companyStore.fetchTransactions()
        } else {
          await depositToBranchWallet(selectedBranchId.value, {
            amount: depositForm.value.amount,
            description: depositForm.value.description,
            date: depositForm.value.date
          })
          await fetchBranchTransactions()
          await fetchBranchesAndSummaries()
        }
        closeDepositModal()
        if (window.$toast) {
          window.$toast('Deposit successful', 'success')
        }
      } catch (error) {
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
        if (selectedBranchId.value === null) {
          await companyStore.withdraw(
            withdrawForm.value.amount,
            withdrawForm.value.description,
            withdrawForm.value.date
          )
          await companyStore.fetchCompany()
          await companyStore.fetchTransactions()
        } else {
          await withdrawFromBranchWallet(selectedBranchId.value, {
            amount: withdrawForm.value.amount,
            description: withdrawForm.value.description,
            date: withdrawForm.value.date
          })
          await fetchBranchTransactions()
          await fetchBranchesAndSummaries()
        }
        closeWithdrawModal()
        if (window.$toast) {
          window.$toast('Withdrawal successful', 'success')
        }
      } catch (error) {
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to withdraw', 'error')
        }
      } finally {
        processing.value = false
      }
    }

    // Format helpers
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

    onMounted(async () => {
      await companyStore.fetchCompany()
      await companyStore.fetchTransactions()
      await fetchBranchesAndSummaries()
    })

    return {
      companyStore,
      branches,
      branchSummaries,
      selectedBranchId,
      selectBranch,
      branchTransactions,
      branchPage,
      branchPageSize,
      branchTotalPages,
      branchLoading,
      branchError,
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
      formatCurrency
    }
  }
}
</script>


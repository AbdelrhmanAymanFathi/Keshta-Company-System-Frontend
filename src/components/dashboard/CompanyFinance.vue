<template>
  <div class="flex space-y-0">

    <aside :class="['bg-white rounded-lg shadow overflow-hidden', isRTL ? 'direction-rtl' : '', isRTL ? 'text-end' : 'text-start']" style="min-width: 260px; max-width: 320px;">
      <h3 :class="['text-lg font-semibold text-indigo-700 mb-2', isRTL ? 'text-end' : 'text-start']">{{ $t('finance.wallets') }}</h3>
      <ul class="space-y-2">
        <li>
          <button @click="selectBranch(null)" :class="[selectedBranch === null ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700', 'w-full', isRTL ? 'text-end' : 'text-start', 'px-3 py-2 rounded transition']">
            <span class="font-semibold">{{ $t('finance.companyWallet') }}</span>
          </button>
        </li>
        <li v-for="branch in branches" :key="branch.id">
          <button @click="selectBranch(branch)" :class="[selectedBranch && selectedBranch.id === branch.id ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700', 'w-full', isRTL ? 'text-end' : 'text-start', 'px-3 py-2 rounded transition']">
            <span>{{ branch.name }}</span>
          </button>
        </li>
      </ul>
    </aside>
    <!-- Main Content -->
    <div :class="['flex-1 p-6 space-y-6', isRTL ? 'text-end' : 'text-start']">
    <!-- Balance Card -->

    <!-- <div class="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-6 text-white">
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
    </div> -->

    <!-- Summary Stats Bar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div :class="['bg-white rounded-lg shadow p-4 border-l-4 border-indigo-600', isRTL ? 'text-end' : 'text-start']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ $t('finance.currentBalance') }}</p>
            <p class="text-2xl font-bold text-indigo-600 mt-1">{{ formatCurrency(summary.balance) }}</p>
          </div>
          <svg class="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Transactions Stats Bar -->
    <div :class="['bg-gray-50 rounded-lg p-4', isRTL ? 'text-end' : 'text-start']">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div :class="['text-sm text-gray-600', isRTL ? 'text-end' : 'text-start']">
          {{ $t('finance.totalTransactions') }}: <span class="font-semibold">{{ transactions.total }}</span>
        </div>
        <div :class="['flex items-center gap-2 text-sm text-gray-600', isRTL ? 'justify-end' : 'justify-start']">
          <label>{{ $t('finance.pageSize') }}:</label>
          <select :value="transactions.pageSize" @change="onPageSizeChange" 
            class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading/Error/Main Content Switch -->
    <template v-if="loading">
      <div :class="['flex justify-center py-8', isRTL ? 'text-end' : 'text-start']">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    </template>
    <template v-else-if="error">
      <div :class="['bg-red-50 border border-red-200 rounded-lg p-4', isRTL ? 'text-end' : 'text-start']">
        <div :class="['flex items-center', isRTL ? 'justify-end' : 'justify-start']">
          <svg class="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Transactions Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <!-- No Results Message -->
        <div v-if="transactions.items.length === 0" :class="['text-center py-12', isRTL ? 'text-end' : 'text-start']">
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
          <table :class="['min-w-full divide-y divide-gray-200', isRTL ? 'text-end' : 'text-start']">
            <thead class="bg-gray-50">
              <tr>
                <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                  {{ $t('finance.date') }}
                </th>
                <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                  {{ $t('finance.type') }}
                </th>
                <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                  {{ $t('finance.amount') }}
                </th>
                <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                  {{ $t('finance.description') }}
                </th>
                <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                  {{ $t('finance.reference') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions.items" :key="transaction.id" class="hover:bg-gray-50">
                <td :class="['px-6 py-4 whitespace-nowrap text-sm text-gray-900', isRTL ? 'text-end' : 'text-start']">
                  {{ formatDate(transaction.date) }}
                </td>
                <td :class="['px-6 py-4 whitespace-nowrap text-sm', isRTL ? 'text-end' : 'text-start']">
                  <BadgeComponent :variant="getTransactionVariant(transaction.type)">
                    {{ getTransactionTypeLabel(transaction.type) }}
                  </BadgeComponent>
                </td>
                <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold', getAmountColor(transaction.type), isRTL ? 'text-end' : 'text-start']">
                  {{ formatCurrency(transaction.amount) }}
                </td>
                <td :class="['px-6 py-4 text-sm text-gray-900', isRTL ? 'text-end' : 'text-start']">
                  {{ transaction.description || '-' }}
                </td>
                <td :class="['px-6 py-4 text-sm text-gray-500', isRTL ? 'text-end' : 'text-start']">
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
        <div v-if="transactions.totalPages > 1" :class="['bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6', isRTL ? 'flex-row-reverse' : '']">
          <div :class="['flex-1 flex justify-between sm:hidden', isRTL ? 'flex-row-reverse' : '']">
            <button @click="changePage(transactions.page - 1)" 
              :disabled="transactions.page <= 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ $t('labels.previous') }}
            </button>
            <span :class="['text-sm text-gray-700 self-center', isRTL ? 'order-2' : '']">
              {{ transactions.page }} / {{ transactions.totalPages }}
            </span>
            <button @click="changePage(transactions.page + 1)" 
              :disabled="transactions.page >= transactions.totalPages"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ $t('labels.next') }}
            </button>
          </div>
          <div :class="['hidden sm:flex-1 sm:flex sm:items-center sm:justify-between', isRTL ? 'flex-row-reverse' : '']">
            <div>
              <p :class="['text-sm text-gray-700', isRTL ? 'text-end' : 'text-start']">
                {{ $t('labels.showing') }} 
                <span class="font-medium">{{ ((transactions.page - 1) * transactions.pageSize) + 1 }}</span>
                {{ $t('labels.to') }}
                <span class="font-medium">{{ Math.min(transactions.page * transactions.pageSize, transactions.total) }}</span>
                {{ $t('labels.of') }}
                <span class="font-medium">{{ transactions.total }}</span>
                {{ $t('labels.results') }}
              </p>
            </div>
            <div>
              <nav :class="['relative z-0 inline-flex rounded-md shadow-sm -space-x-px', isRTL ? 'flex-row-reverse' : '']">
                <button @click="changePage(transactions.page - 1)" 
                  :disabled="transactions.page <= 1"
                  :class="['relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed', isRTL ? 'rounded-r-md' : 'rounded-l-md']">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button @click="changePage(transactions.page + 1)" 
                  :disabled="transactions.page >= transactions.totalPages"
                  :class="['relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed', isRTL ? 'rounded-l-md' : 'rounded-r-md']">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Deposit Modal -->
    <div v-if="showDepositModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeDepositModal">
      <div :class="['relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white', isRTL ? 'text-end' : 'text-start']">
        <div class="mt-3">
          <h3 :class="['text-lg font-medium text-gray-900 mb-4', isRTL ? 'text-end' : 'text-start']">{{ $t('finance.deposit') }}</h3>
          <form @submit.prevent="handleDeposit" :class="['space-y-4', isRTL ? 'text-end' : 'text-start']">
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
      <div :class="['relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white', isRTL ? 'text-end' : 'text-start']">
        <div class="mt-3">
          <h3 :class="['text-lg font-medium text-gray-900 mb-4', isRTL ? 'text-end' : 'text-start']">{{ $t('finance.withdraw') }}</h3>
          <form @submit.prevent="handleWithdraw" :class="['space-y-4', isRTL ? 'text-end' : 'text-start']">
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
  </div>
</template>

<script>

import { ref, onMounted, computed } from 'vue'
import { getBranches, getBranchWalletSummary, getBranchWalletTransactions, depositToBranchWallet, withdrawFromBranchWallet } from '@/api'
import { useCompanyFinanceStore } from '@/stores/useCompanyFinanceStore'
import BadgeComponent from '../shared/Badge.vue'

export default {
  name: 'CompanyFinance',
  components: { BadgeComponent },
  setup() {
    const financeStore = useCompanyFinanceStore()
    const showDepositModal = ref(false)
    const showWithdrawModal = ref(false)
    const processing = ref(false)
    const branches = ref([])
    const selectedBranch = ref(null)
    const summary = ref({ balance: 0, last30dIn: 0, last30dOut: 0 })
    const transactions = ref({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 })

    const depositForm = ref({ amount: 0, description: '', date: new Date().toISOString().split('T')[0] })
    const withdrawForm = ref({ amount: 0, description: '', date: new Date().toISOString().split('T')[0] })

    const fetchBranches = async () => {
      try {
        const res = await getBranches()
        branches.value = res.data
      } catch (e) { branches.value = [] }
    }

    const fetchSummary = async () => {
      if (!selectedBranch.value) {
        await financeStore.fetchSummary()
        summary.value = {
          balance: financeStore.summary.balance,
          last30dIn: financeStore.summary.last30dIn,
          last30dOut: financeStore.summary.last30dOut
        }
      } else {
        const res = await getBranchWalletSummary(selectedBranch.value.id)
        summary.value = res.data
      }
    }

    const fetchTransactions = async () => {
      if (!selectedBranch.value) {
        await financeStore.fetchTransactions()
        transactions.value = { ...financeStore.transactions, totalPages: financeStore.totalPages }
      } else {
        const res = await getBranchWalletTransactions(selectedBranch.value.id, transactions.value.page, transactions.value.pageSize)
        transactions.value = {
          items: res.data.items,
          total: res.data.total,
          page: res.data.page,
          pageSize: res.data.pageSize,
          totalPages: Math.ceil(res.data.total / res.data.pageSize)
        }
      }
    }

    const selectBranch = async (branch) => {
      selectedBranch.value = branch
      transactions.value.page = 1
      await fetchSummary()
      await fetchTransactions()
    }

    const openDepositModal = () => {
      depositForm.value = { amount: 0, description: '', date: new Date().toISOString().split('T')[0] }
      showDepositModal.value = true
    }
    const closeDepositModal = () => { showDepositModal.value = false }
    const openWithdrawModal = () => {
      withdrawForm.value = { amount: 0, description: '', date: new Date().toISOString().split('T')[0] }
      showWithdrawModal.value = true
    }
    const closeWithdrawModal = () => { showWithdrawModal.value = false }

    const handleDeposit = async () => {
      if (!depositForm.value.amount || depositForm.value.amount <= 0) {
        if (window.$toast) window.$toast('Please enter a valid amount', 'error')
        return
      }
      processing.value = true
      try {
        if (!selectedBranch.value) {
          await financeStore.deposit(depositForm.value.amount, depositForm.value.description, depositForm.value.date)
        } else {
          await depositToBranchWallet(selectedBranch.value.id, depositForm.value.amount, depositForm.value.description, depositForm.value.date)
        }
        await fetchSummary()
        await fetchTransactions()
        closeDepositModal()
        if (window.$toast) window.$toast('Deposit successful', 'success')
      } catch (error) {
        if (window.$toast) window.$toast(error.response?.data?.message || 'Failed to deposit', 'error')
      } finally { processing.value = false }
    }

    const handleWithdraw = async () => {
      if (!withdrawForm.value.amount || withdrawForm.value.amount <= 0) {
        if (window.$toast) window.$toast('Please enter a valid amount', 'error')
        return
      }
      processing.value = true
      try {
        if (!selectedBranch.value) {
          await financeStore.withdraw(withdrawForm.value.amount, withdrawForm.value.description, withdrawForm.value.date)
        } else {
          await withdrawFromBranchWallet(selectedBranch.value.id, withdrawForm.value.amount, withdrawForm.value.description, withdrawForm.value.date)
        }
        await fetchSummary()
        await fetchTransactions()
        closeWithdrawModal()
        if (window.$toast) window.$toast('Withdrawal successful', 'success')
      } catch (error) {
        if (window.$toast) window.$toast(error.response?.data?.message || 'Failed to withdraw', 'error')
      } finally { processing.value = false }
    }

    const changePage = async (page) => {
      if (page >= 1 && page <= transactions.value.totalPages) {
        transactions.value.page = page
        await fetchTransactions()
      }
    }
    const onPageSizeChange = async (event) => {
      transactions.value.pageSize = parseInt(event.target.value)
      transactions.value.page = 1
      await fetchTransactions()
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    const formatCurrency = (amount) => {
      const numAmount = parseFloat(amount)
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(numAmount)
    }
    const getTransactionVariant = (type) => {
      const variants = { 'DEPOSIT': 'success', 'WITHDRAW': 'danger', 'RENT_INCOME': 'success', 'EXPENSE': 'warning', 'RENT_PAYOUT': 'danger' }
      return variants[type] || 'info'
    }
    const getTransactionTypeLabel = (type) => {
      const labels = { 'DEPOSIT': 'Deposit', 'WITHDRAW': 'Withdrawal', 'RENT_INCOME': 'Rental Income', 'EXPENSE': 'Expense', 'RENT_PAYOUT': 'Rental Payout' }
      return labels[type] || type
    }
    const getAmountColor = (type) => {
      if (["DEPOSIT", "RENT_INCOME"].includes(type)) return 'text-green-600'
      else if (["WITHDRAW", "EXPENSE", "RENT_PAYOUT"].includes(type)) return 'text-red-600'
      return 'text-gray-900'
    }

    onMounted(async () => {
      await fetchBranches()
      await fetchSummary()
      await fetchTransactions()
    })

    // Add isRTL computed property
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
      branches,
      selectedBranch,
      summary,
      transactions,
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
      getAmountColor,
      selectBranch,
      isRTL,
      // Expose loading and error for template
      loading: financeStore.loading,
      error: financeStore.error
    }
  }
}
</script>

<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl p-6' : 'p-6'">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <h1 class="text-2xl font-semibold">{{ $t('contractors.title') }}</h1>

      <div class="flex items-center gap-2">
        <!-- import excel -->
        <label class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-flex items-center cursor-pointer">
          <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onFileChange" />
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 7l4-4 4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="13" width="18" height="8" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('contractors.importExcel') }}
        </label>

        <button @click="openAdd()" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          {{ $t('contractors.add') }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('contractors.searchPlaceholder')"
             class="w-full sm:w-1/2 px-3 py-2 border rounded" />
    </div>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <div class="overflow-auto bg-white rounded shadow">
        <table class="min-w-full divide-y">
          <thead class="bg-indigo-50">
            <tr>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('labels.#') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.name') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.phone') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.bankName') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.accountNumber') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.notes') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('labels.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in filtered" :key="c.id" class="hover:bg-gray-50">
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ idx + 1 }}</td>
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ c.name }}</td>
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ c.phone || '-' }}</td>
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ c.bankName || '-' }}</td>
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ c.accountNumber || '-' }}</td>
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ c.notes || '-' }}</td>
              <td class="p-3">
                <div :class="['flex gap-2', isRTL ? 'flex-row-reverse' : '']">
                  <button @click="openWallet(c)" class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">{{ $t('contractors.wallet') || 'Wallet' }}</button>
                  <button @click="openEdit(c)" class="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white">{{ $t('labels.edit') }}</button>
                  <button @click="confirmDelete(c)" class="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white">{{ $t('labels.delete') }}</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td class="p-3" colspan="7" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.noResults') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden grid gap-3">
      <div v-for="c in filtered" :key="c.id" :class="['p-3 bg-white rounded shadow flex justify-between items-start', isRTL ? 'flex-row-reverse' : '']">
        <div :class="isRTL ? 'text-right' : ''">
          <div class="font-semibold">{{ c.name }}</div>
          <div class="text-sm text-gray-500">
            {{ c.phone || '-' }}<br>
            <span v-if="c.bankName">{{ $t('contractors.bankName') }}: {{ c.bankName }}</span><br>
            <span v-if="c.accountNumber">{{ $t('contractors.accountNumber') }}: {{ c.accountNumber }}</span><br>
            <span v-if="c.notes">{{ $t('contractors.notes') }}: {{ c.notes }}</span>
          </div>
        </div>
          <div class="flex flex-col gap-2">
          <button @click="openWallet(c)" class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs">{{ $t('contractors.wallet') || 'Wallet' }}</button>
          <button @click="openEdit(c)" class="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white text-xs">{{ $t('labels.edit') }}</button>
          <button @click="confirmDelete(c)" class="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs">{{ $t('labels.delete') }}</button>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="text-center text-gray-500">{{ $t('contractors.noResults') }}</div>
    </div>

    <!-- Modal: Add / Edit contractor -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
        <h3 class="text-lg font-semibold mb-4" :class="isRTL ? 'text-right' : ''">{{ editing ? $t('contractors.editContractor') : $t('contractors.addContractor') }}</h3>

        <div class="grid grid-cols-1 gap-3">
          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.name') }}</div>
            <input v-model="form.name" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>

          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.phone') }}</div>
            <input v-model="form.phone" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>

          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.bankName') }}</div>
            <input v-model="form.bankName" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>

          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.accountNumber') }}</div>
            <input v-model="form.accountNumber" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>

          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.notes') }}</div>
            <input v-model="form.notes" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>
        </div>

        <div class="mt-4 flex gap-2 justify-end" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="closeModal" class="px-4 py-2 rounded border">{{ $t('labels.cancel') }}</button>
          <button @click="saveContractor" :class="['px-4 py-2 rounded text-white', editing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-indigo-600 hover:bg-indigo-700']">
            {{ $t('labels.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="cancelDelete"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 z-10">
        <p class="mb-4" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?</p>
        <div class="flex justify-end gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="cancelDelete" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="doDelete" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">{{ $t('labels.delete') }}</button>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
      <!-- Mobile Pagination -->
      <div class="flex-1 flex justify-between sm:hidden">
        <button @click="changePage(page - 1)" 
          :disabled="page <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ $t('labels.previous') || 'Previous' }}
        </button>
        <span class="text-sm text-gray-700 self-center">
          {{ page }} / {{ totalPages }}
        </span>
        <button @click="changePage(page + 1)" 
          :disabled="page >= totalPages"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ $t('labels.next') || 'Next' }}
        </button>
      </div>

      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <p class="text-sm text-gray-700">
            {{ $t('labels.showing') || 'Showing' }} 
            <span class="font-medium">{{ ((page - 1) * pageSize) + 1 }}</span>
            {{ $t('labels.to') || 'to' }}
            <span class="font-medium">{{ Math.min(page * pageSize, total) }}</span>
            {{ $t('labels.of') || 'of' }}
            <span class="font-medium">{{ total }}</span>
            {{ $t('labels.results') || 'results' }}
          </p>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-700">{{ $t('labels.pageSize') || 'Page size' }}:</label>
            <select v-model="pageSize" @change="onPageSizeChange" 
              class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <!-- Page Numbers -->
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button @click="changePage(1)" 
              :disabled="page <= 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <button @click="changePage(page - 1)" 
              :disabled="page <= 1"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <template v-for="p in visiblePages" :key="p">
              <button @click="changePage(p)" 
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  p === page 
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]">
                {{ p }}
              </button>
            </template>

            <button @click="changePage(page + 1)" 
              :disabled="page >= totalPages"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <button @click="changePage(totalPages)" 
              :disabled="page >= totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10l-4.293-4.293a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Contractor Wallet Modal -->
    <div v-if="walletModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="walletModalOpen = false"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 z-10">
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-semibold" :class="isRTL ? 'text-right' : ''">{{ selectedContractor ? (selectedContractor.name) : $t('contractors.wallet') }}</h3>
          <button @click="walletModalOpen = false" class="text-gray-500">✕</button>
        </div>

        <div v-if="walletLoading" class="text-center py-8">{{ $t('labels.loading') || 'Loading...' }}</div>

        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-500">{{ $t('contractors.balance') || 'Balance' }}</div>
              <div class="text-2xl font-semibold text-red-600">{{ wallet ? wallet.balance : '-' }}</div>
            </div>
            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-500">{{ $t('contractors.totalDeposits') || 'Total Deposits' }}</div>
              <div class="text-lg font-semibold text-green-600">{{ wallet ? wallet.totalDeposits : '-' }}</div>
            </div>
            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-500">{{ $t('contractors.sources') || 'Sources' }}</div>
              <div class="text-sm">
                <div>{{ $t('contractors.exports') || 'Exports' }}: {{ wallet && wallet.sources ? wallet.sources.exports : 0 }}</div>
                <div>{{ $t('contractors.transport') || 'Transport' }}: {{ wallet && wallet.sources ? wallet.sources.transport : 0 }}</div>
                <div>{{ $t('contractors.expenses') || 'Expenses' }}: {{ wallet && wallet.sources ? wallet.sources.expenses : 0 }}</div>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold mb-2">{{ $t('contractors.transactions') || 'Transactions' }}</h4>
              <div class="overflow-auto max-h-64 bg-white rounded border">
                <table class="min-w-full">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="p-2 text-left">{{ $t('labels.type') || 'Type' }}</th>
                      <th class="p-2 text-left">{{ $t('labels.date') || 'Date' }}</th>
                      <th class="p-2 text-right">{{ $t('labels.amount') || 'Amount' }}</th>
                      <th class="p-2 text-right">{{ $t('contractors.balanceAfter') || 'Balance After' }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!wallet || !wallet.entries || wallet.entries.length === 0">
                      <td class="p-3" colspan="4">{{ $t('contractors.noTransactions') || 'No transactions' }}</td>
                    </tr>
                    <tr v-for="(e, idx) in (wallet && wallet.entries) || []" :key="idx" class="border-t">
                      <td class="p-2">{{ e.type }}</td>
                      <td class="p-2">{{ new Date(e.date).toLocaleString() }}</td>
                      <td class="p-2 text-right">{{ e.signedAmount || e.amount }}</td>
                      <td class="p-2 text-right">{{ e.balanceAfter != null ? e.balanceAfter : '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 class="font-semibold mb-2">{{ $t('contractors.deposit') || 'Deposit' }}</h4>
              <div class="grid gap-2">
                <label>
                  <div class="text-sm mb-1">{{ $t('contractors.amount') || 'Amount' }}</div>
                  <input v-model="depositForm.amount" type="number" class="w-full px-3 py-2 border rounded" />
                </label>
                <label>
                  <div class="text-sm mb-1">{{ $t('labels.date') || 'Date' }}</div>
                  <input v-model="depositForm.date" type="date" class="w-full px-3 py-2 border rounded" />
                </label>
                <label>
                  <div class="text-sm mb-1">{{ $t('labels.description') || 'Description' }}</div>
                  <input v-model="depositForm.description" class="w-full px-3 py-2 border rounded" />
                </label>

                <div class="flex justify-end gap-2 mt-2">
                  <button @click="walletModalOpen = false" class="px-4 py-2 rounded border">{{ $t('labels.cancel') }}</button>
                  <button @click="doDeposit" class="px-4 py-2 rounded bg-indigo-600 text-white">{{ $t('labels.deposit') || 'Deposit' }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { getContractors, createContractor, deleteContractor, getContractorWallet, getContractorWalletHistory, depositToContractorWallet } from '../../api'

export default {
  name: 'ContractorsList',
  data() {
    return {
      q: '',
      modalOpen: false,
      editing: false,
      form: { id: null, name: '', phone: '', bankName: '', accountNumber: '', notes: '' },
      contractors: [],
      deleteConfirm: { open: false, item: null },
      // Wallet UI
      walletModalOpen: false,
      walletLoading: false,
      wallet: null,
      selectedContractor: null,
      depositForm: { amount: '', description: '', date: '' },
      historyLoading: false,
      page: 1,
      pageSize: 20,
      total: 0
    }
  },
  computed: {
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' },
    filtered() {
      // Client-side filtering is now optional since backend handles search
      if (!this.q) return this.contractors
      const s = this.q.toLowerCase()
      return this.contractors.filter(c =>
        (c.name||'').toLowerCase().includes(s) ||
        (c.phone||'').toLowerCase().includes(s) ||
        (c.bankName||'').toLowerCase().includes(s) ||
        (c.accountNumber||'').toLowerCase().includes(s)
      )
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.page - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  async mounted() {
    await this.loadContractors()
  },
  methods: {
    async loadContractors() {
      try {
        const res = await getContractors({
          page: this.page,
          pageSize: this.pageSize,
          q: this.q
        });
        const payload = res.data || {}
        this.contractors = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : []
        const meta = payload.meta || {}
        this.total = meta.total ?? payload.total ?? this.contractors.length
        this.page = meta.page ?? this.page
        this.pageSize = meta.pageSize ?? meta.perPage ?? payload.pageSize ?? payload.perPage ?? this.pageSize
      } catch (e) {
        this.contractors = [];
        this.total = 0
      }
    },
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.loadContractors()
      }
    },
    onPageSizeChange() {
      this.page = 1
      this.loadContractors()
    },
    onSearchInput() {
      // Debounce search - reload after user stops typing
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.page = 1
        this.loadContractors()
      }, 500)
    },
    openAdd() {
      this.editing = false
      this.form = { id: null, name: '', phone: '', bankName: '', accountNumber: '', notes: '' }
      this.modalOpen = true
    },
    openEdit(c) {
      this.editing = true
      this.form = Object.assign({}, c)
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    async saveContractor() {
      const name = (this.form.name || '').trim()
      if (!name) {
        window.$toast(this.$t ? this.$t('contractors.validationName') || 'Please enter a name' : 'Please enter a name', 'warning')
        return
      }
      if (this.editing) {
        // Only update locally (no backend update API)
        const idx = this.contractors.findIndex(x => x.id === this.form.id)
        if (idx !== -1) this.contractors.splice(idx, 1, Object.assign({}, this.form))
        this.modalOpen = false
        return
      }

      // Build payload so that optional fields (like phone) are not required
      // and are omitted entirely if left empty.
      const payload = {
        name: name
      }
      if (this.form.phone && this.form.phone.toString().trim() !== '') {
        payload.phone = this.form.phone.toString().trim()
      }
      if (this.form.bankName && this.form.bankName.toString().trim() !== '') {
        payload.bankName = this.form.bankName.toString().trim()
      }
      if (this.form.accountNumber && this.form.accountNumber.toString().trim() !== '') {
        payload.accountNumber = this.form.accountNumber.toString().trim()
      }
      if (this.form.notes && this.form.notes.toString().trim() !== '') {
        payload.notes = this.form.notes.toString().trim()
      }

      try {
        const res = await createContractor(payload)
        this.contractors.push(res.data)
      } catch (e) {
        window.$toast(this.$t ? this.$t('contractors.addError') || 'Error adding contractor' : 'Error adding contractor', 'error')
      }
      this.modalOpen = false
    },
    async doDelete() {
      const id = this.deleteConfirm.item.id
      try {
        await deleteContractor(id)
        this.contractors = this.contractors.filter(c => c.id !== id)
      } catch (e) {
        window.$toast(this.$t ? this.$t('contractors.deleteError') || 'Error deleting contractor' : 'Error deleting contractor', 'error')
      }
      this.cancelDelete()
    },

    // ---------- Contractor Wallet ----------
    async openWallet(c) {
      this.selectedContractor = c
      this.walletModalOpen = true
      this.wallet = null
      this.depositForm = { amount: '', description: '', date: '' }
      await this.fetchWallet(c.id)
    },

    async fetchWallet(contractorId) {
      this.walletLoading = true
      this.historyLoading = true
      try {
        const [wRes, hRes] = await Promise.all([
          getContractorWallet(contractorId),
          getContractorWalletHistory(contractorId)
        ])
        this.wallet = wRes.data || null
        // ensure entries exist
        if (hRes && hRes.data && hRes.data.entries) {
          // attach entries on wallet object for convenience
          this.wallet.entries = hRes.data.entries
        }
      } catch (err) {
        console.error('Error fetching contractor wallet', err)
        window.$toast(this.$t ? this.$t('contractors.walletFetchError') || 'Error fetching wallet' : 'Error fetching wallet', 'error')
      } finally {
        this.walletLoading = false
        this.historyLoading = false
      }
    },

    async doDeposit() {
      if (!this.selectedContractor) return
      const amount = Number(this.depositForm.amount || 0)
      if (!amount || isNaN(amount) || amount <= 0) {
        window.$toast(this.$t ? this.$t('contractors.validationAmount') || 'Enter a valid amount' : 'Enter a valid amount', 'warning')
        return
      }
      try {
        const payload = {
          amount,
          description: this.depositForm.description || '',
          date: this.depositForm.date || undefined
        }
        const res = await depositToContractorWallet(this.selectedContractor.id, payload)
        // If API returns updated wallet, refresh local wallet
        if (res && res.data) {
          this.wallet = res.data
        }
        // refresh history as well
        await this.fetchWallet(this.selectedContractor.id)
        window.$toast(this.$t ? this.$t('contractors.depositSuccess') || 'Deposit successful' : 'Deposit successful', 'success')
        this.depositForm = { amount: '', description: '', date: '' }
      } catch (err) {
        console.error('Error depositing to wallet', err)
        window.$toast(this.$t ? this.$t('contractors.depositError') || 'Error making deposit' : 'Error making deposit', 'error')
      }
    },

    // ---------- Excel import ----------
    onFileChange(e) {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (evt) => {
        const data = evt.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        // take first sheet
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        // convert to json (first row may be header or not)
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        this.parseExcelJson(json)
      }
      reader.readAsBinaryString(file)
      // reset input so same file can be re-selected
      this.$refs.fileInput.value = null
    },
    parseExcelJson(json) {
      // json is array of rows (arrays). Find header row by searching for column containing 'مقاول' or 'Contractor'
      if (!Array.isArray(json) || json.length === 0) return
      let headerRowIndex = 0
      for (let i=0;i<Math.min(5,json.length);i++){
        const row = (json[i] || []).map(cell => (cell || '').toString())
        if (row.some(r => /مقاول|Contractor/i.test(r))) { headerRowIndex = i; break }
      }
      const header = (json[headerRowIndex] || []).map(h => (h||'').toString().trim())
      const rows = json.slice(headerRowIndex+1)
      // Find column indices
      const colIdx = {
        name: header.findIndex(h => /مقاول|Contractor/i.test(h)),
        phone: header.findIndex(h => /هاتف|Phone/i.test(h)),
        bankName: header.findIndex(h => /بنك|Bank/i.test(h)),
        accountNumber: header.findIndex(h => /حساب|Account/i.test(h)),
        notes: header.findIndex(h => /ملاحظات|Notes/i.test(h)),
      }
      const imported = []
      for (const r of rows) {
        const name = (colIdx.name !== -1 && r[colIdx.name]) ? r[colIdx.name].toString().trim() : ''
        if (name) {
          imported.push({
            name,
            phone: (colIdx.phone !== -1 && r[colIdx.phone]) ? r[colIdx.phone].toString().trim() : '',
            bankName: (colIdx.bankName !== -1 && r[colIdx.bankName]) ? r[colIdx.bankName].toString().trim() : '',
            accountNumber: (colIdx.accountNumber !== -1 && r[colIdx.accountNumber]) ? r[colIdx.accountNumber].toString().trim() : '',
            notes: (colIdx.notes !== -1 && r[colIdx.notes]) ? r[colIdx.notes].toString().trim() : ''
          })
        }
      }
      // dedupe and add to contractors list (avoid duplicates by name)
      const existingNames = new Set(this.contractors.map(c => c.name))
      let added = 0
      for (const n of imported) {
        if (!existingNames.has(n.name)) {
          try {
            createContractor(n).then(res => {
              this.contractors.push(res.data)
            })
            existingNames.add(n.name)
            added++
          } catch (e) {
            // skip on error
          }
        }
      }
      window.$toast(this.$t ? this.$t('contractors.imported', { count: added }) || (added + ' imported') : (added + ' imported'), 'success')
    },
    confirmDelete(c) {
      this.deleteConfirm = { open: true, item: c }
    },
    cancelDelete() {
      this.deleteConfirm = { open: false, item: null }
    }
  }
}
</script>

<style scoped>
/* small helper in case some elements still need forced RTL alignment */
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

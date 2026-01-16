<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center" :class="isRTL ? 'justify-between' : 'justify-between'">
      <h2 class="text-2xl font-semibold text-gray-900">{{ $t('contractors.title') }}</h2>
      <div class="flex items-center gap-3">
        <!-- Import Excel -->
        <!-- <label class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-flex items-center cursor-pointer transition-colors">
          <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onFileChange" />
          <svg class="w-5 h-5" :class="isRTL ? 'ml-2' : 'mr-2'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 7l4-4 4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="13" width="18" height="8" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('contractors.importExcel') }}
        </label> -->
        <!-- Add Button -->
        <button @click="openAdd"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('contractors.add') }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="max-w-md">
      <input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('contractors.searchPlaceholder')"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block bg-white rounded-lg shadow-sm border overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-indigo-50">
          <tr>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('labels.#') }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('contractors.name') }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('contractors.phone') }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('contractors.bankName') }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('contractors.accountNumber') }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('contractors.notes') }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(c, idx) in filtered"
            :key="c.id"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="openContextMenu($event, c)"
            @contextmenu.prevent="openContextMenu($event, c)"
          >
            <td class="px-6 py-4 text-sm text-gray-900" :class="textAlign">{{ idx + 1 }}</td>
            <td class="px-6 py-4 text-sm text-gray-900" :class="textAlign">{{ c.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-900" :class="textAlign">{{ c.phone || '-' }}</td>
            <td class="px-6 py-4 text-sm text-gray-900" :class="textAlign">{{ c.bankName || '-' }}</td>
            <td class="px-6 py-4 text-sm text-gray-900" :class="textAlign">{{ c.accountNumber || '-' }}</td>
            <td class="px-6 py-4 text-sm text-gray-900" :class="textAlign">{{ c.notes || '-' }}</td>
            <td class="px-6 py-4">
              <div class="flex gap-3" :class="isRTL ? 'justify-start' : 'justify-end'">
                <button @click.stop="openStatement(c)" class="text-purple-600 hover:text-purple-800" :title="$t('contractors.statement')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button @click.stop="openWallet(c)" class="text-blue-600 hover:text-blue-800" :title="$t('contractors.wallet')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                </button>
                <button @click.stop="openEdit(c)" class="text-yellow-600 hover:text-yellow-800" :title="$t('labels.edit')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click.stop="confirmDelete(c)" class="text-red-600 hover:text-red-800" :title="$t('labels.delete')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
              {{ $t('contractors.noResults') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="sm:hidden space-y-4">
      <div
        v-for="c in filtered"
        :key="c.id"
        class="bg-white rounded-lg shadow-sm border p-4 cursor-pointer"
        @click="openContextMenu($event, c)"
        @contextmenu.prevent="openContextMenu($event, c)"
      >
        <div class="flex justify-between items-start" :class="isRTL ? 'flex-row-reverse' : ''">
          <div :class="isRTL ? 'text-right' : 'text-left'">
            <div class="font-semibold text-gray-900">{{ c.name }}</div>
            <div class="text-sm text-gray-500">
              {{ c.phone || '-' }}<br>
              <span v-if="c.bankName">{{ $t('contractors.bankName') }}: {{ c.bankName }}</span><br>
              <span v-if="c.accountNumber">{{ $t('contractors.accountNumber') }}: {{ c.accountNumber }}</span><br>
              <span v-if="c.notes">{{ $t('contractors.notes') }}: {{ c.notes }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <button @click.stop="openStatement(c)" class="text-purple-600 text-xs">{{ $t('contractors.statement') }}</button>
            <button @click.stop="openWallet(c)" class="text-blue-600 text-xs">{{ $t('contractors.wallet') }}</button>
            <button @click.stop="openEdit(c)" class="text-yellow-600 text-xs">{{ $t('labels.edit') }}</button>
            <button @click.stop="confirmDelete(c)" class="text-red-600 text-xs">{{ $t('labels.delete') }}</button>
          </div>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="text-center py-12 text-gray-500">
        {{ $t('contractors.noResults') }}
      </div>
    </div>

    <!-- Shared Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :total-pages="totalPages"
      @update:page="changePage"
      @update:pageSize="onPageSizeChange"
    />

    <!-- Context Menu -->
    <div
      v-if="contextMenu.open"
      class="fixed bg-white rounded-lg shadow-lg py-2 z-50 border min-w-[180px]"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
      @contextmenu.prevent
    >
      <button @click="contextAction('edit')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {{ $t('labels.edit') }}
      </button>
      <button @click="contextAction('delete')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {{ $t('labels.delete') }}
      </button>
      <button @click="contextAction('wallet')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
        </svg>
        {{ $t('contractors.wallet') }}
      </button>
      <button @click="contextAction('statement')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ $t('contractors.statement') }}
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style="margin-top: 0 !important;">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            {{ editing ? $t('contractors.editContractor') : $t('contractors.addContractor') }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-1 gap-4">
          <label>
            <div class="text-sm mb-1">{{ $t('contractors.name') }}</div>
            <input v-model="form.name" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('contractors.phone') }}</div>
            <input v-model="form.phone" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('contractors.bankName') }}</div>
            <input v-model="form.bankName" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('contractors.accountNumber') }}</div>
            <input v-model="form.accountNumber" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('contractors.notes') }}</div>
            <input v-model="form.notes" class="w-full px-3 py-2 border rounded" />
          </label>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
            {{ $t('labels.cancel') }}
          </button>
          <button @click="saveContractor" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            {{ $t('labels.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Contractor Wallet Modal -->
    <div v-if="walletModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style="margin-top: 0 !important;">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 z-10">
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-semibold" :class="isRTL ? 'text-right' : ''">
            {{ selectedContractor ? selectedContractor.name : $t('contractors.wallet') }}
          </h3>
          <button @click="walletModalOpen = false" class="text-gray-500 hover:text-gray-700">✕</button>
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
                      <td class="p-3 text-center" colspan="4">{{ $t('contractors.noTransactions') || 'No transactions' }}</td>
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

    <!-- Confirm delete modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style="margin-top: 0 !important;">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 z-10">
        <p class="mb-4 text-center" :class="isRTL ? 'text-right' : 'text-left'">
          {{ $t('contractors.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?
        </p>
        <div class="flex justify-center gap-3">
          <button @click="cancelDelete" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
            {{ $t('labels.cancel') }}
          </button>
          <button @click="doDelete" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            {{ $t('labels.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { getContractors, createContractor, updateContractor, deleteContractor, getContractorWallet, getContractorWalletHistory, depositToContractorWallet } from '../../api'
import Pagination from '@/components/shared/Pagination.vue'

export default {
  name: 'ContractorsList',
  components: { Pagination },
  data() {
    return {
      q: '',
      modalOpen: false,
      editing: false,
      form: { id: null, name: '', phone: '', bankName: '', accountNumber: '', notes: '' },
      contractors: [],
      deleteConfirm: { open: false, item: null },
      contextMenu: { open: false, x: 0, y: 0, item: null },
      walletModalOpen: false,
      walletLoading: false,
      wallet: null,
      selectedContractor: null,
      depositForm: { amount: '', description: '', date: '' },
      page: 1,
      pageSize: 20,
      total: 0,
      searchTimeout: null
    }
  },
  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    textAlign() {
      return this.isRTL ? 'text-right' : 'text-left'
    },
    filtered() {
      if (!this.q) return this.contractors
      const s = this.q.toLowerCase()
      return this.contractors.filter(c =>
        (c.name || '').toLowerCase().includes(s) ||
        (c.phone || '').toLowerCase().includes(s) ||
        (c.bankName || '').toLowerCase().includes(s) ||
        (c.accountNumber || '').toLowerCase().includes(s)
      )
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    }
  },
  mounted() {
    this.loadContractors()
    document.addEventListener('click', this.closeContextMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  },
  methods: {
    async loadContractors() {
      try {
        const res = await getContractors({ page: this.page, pageSize: this.pageSize, q: this.q })
        const payload = res.data || {}
        this.contractors = Array.isArray(payload.items) ? payload.items :
                         Array.isArray(payload.data) ? payload.data :
                         Array.isArray(payload) ? payload : []
        const meta = payload.meta || {}
        this.total = meta.total ?? payload.total ?? this.contractors.length
      } catch (e) {
        this.contractors = []
        this.total = 0
      }
    },
    changePage(p) {
      if (p >= 1 && p <= this.totalPages && p !== this.page) {
        this.page = p
        this.loadContractors()
      }
    },
    onPageSizeChange(size) {
      this.pageSize = size
      this.page = 1
      this.loadContractors()
    },
    onSearchInput() {
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
      this.form = { ...c }
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    async saveContractor() {
      const name = this.form.name?.trim()
      if (!name) {
        if (window.$toast) window.$toast(this.$t('contractors.validationName') || 'Please enter a name', 'warning')
        return
      }
      const payload = { name }
      if (this.form.phone?.trim()) payload.phone = this.form.phone.trim()
      if (this.form.bankName?.trim()) payload.bankName = this.form.bankName.trim()
      if (this.form.accountNumber?.trim()) payload.accountNumber = this.form.accountNumber.trim()
      if (this.form.notes?.trim()) payload.notes = this.form.notes.trim()

      try {
        if (this.editing && this.form.id) {
          await updateContractor(this.form.id, payload)
          if (window.$toast) window.$toast(this.$t('contractors.updateSuccess') || 'Contractor updated successfully', 'success')
        } else {
          const res = await createContractor(payload)
          this.contractors.push(res.data)
          this.total++
          if (window.$toast) window.$toast(this.$t('contractors.addSuccess') || 'Contractor added successfully', 'success')
        }
        this.closeModal()
        await this.loadContractors()
      } catch (e) {
        console.error('Error saving contractor:', e)
        const errorMsg = e.response?.status === 404 
          ? (this.$t('contractors.updateError404') || 'Contractor not found or update endpoint not available')
          : (e.response?.data?.message || this.$t('contractors.addError') || 'Error saving contractor')
        if (window.$toast) window.$toast(errorMsg, 'error')
      }
    },
    async doDelete() {
      try {
        await deleteContractor(this.deleteConfirm.item.id)
        await this.loadContractors()
        this.cancelDelete()
      } catch (e) {
        if (window.$toast) window.$toast(this.$t('contractors.deleteError') || 'Error deleting contractor', 'error')
      }
    },
    confirmDelete(c) {
      this.deleteConfirm = { open: true, item: c }
    },
    cancelDelete() {
      this.deleteConfirm = { open: false, item: null }
    },
    async openWallet(c) {
      this.selectedContractor = c
      this.walletModalOpen = true
      this.wallet = null
      this.depositForm = { amount: '', description: '', date: '' }
      await this.fetchWallet(c.id)
    },
    async fetchWallet(contractorId) {
      this.walletLoading = true
      try {
        const [wRes, hRes] = await Promise.all([
          getContractorWallet(contractorId),
          getContractorWalletHistory(contractorId)
        ])
        this.wallet = wRes.data || null
        if (hRes?.data?.entries) {
          this.wallet.entries = hRes.data.entries
        }
      } catch (err) {
        console.error('Error fetching wallet', err)
        if (window.$toast) window.$toast(this.$t('contractors.walletFetchError') || 'Error fetching wallet', 'error')
      } finally {
        this.walletLoading = false
      }
    },
    async doDeposit() {
      if (!this.selectedContractor) return
      const amount = Number(this.depositForm.amount || 0)
      if (!amount || amount <= 0) {
        if (window.$toast) window.$toast(this.$t('contractors.validationAmount') || 'Enter a valid amount', 'warning')
        return
      }
      try {
        const payload = {
          amount,
          description: this.depositForm.description || '',
          date: this.depositForm.date || undefined
        }
        const res = await depositToContractorWallet(this.selectedContractor.id, payload)
        if (res?.data) this.wallet = res.data
        await this.fetchWallet(this.selectedContractor.id)
        if (window.$toast) window.$toast(this.$t('contractors.depositSuccess') || 'Deposit successful', 'success')
        this.depositForm = { amount: '', description: '', date: '' }
      } catch (err) {
        console.error('Error depositing', err)
        if (window.$toast) window.$toast(this.$t('contractors.depositError') || 'Error making deposit', 'error')
      }
    },
    onFileChange(e) {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = async (evt) => {
        const data = evt.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        await this.parseExcelJson(json)
      }
      reader.readAsBinaryString(file)
      this.$refs.fileInput.value = null
    },
    async parseExcelJson(json) {
      if (!Array.isArray(json) || json.length === 0) return
      let headerRowIndex = 0
      for (let i = 0; i < Math.min(5, json.length); i++) {
        const row = (json[i] || []).map(cell => (cell || '').toString())
        if (row.some(r => /مقاول|Contractor/i.test(r))) {
          headerRowIndex = i
          break
        }
      }
      const header = (json[headerRowIndex] || []).map(h => (h || '').toString().trim())
      const rows = json.slice(headerRowIndex + 1)
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
      const existingNames = new Set(this.contractors.map(c => c.name))
      let added = 0
      for (const n of imported) {
        if (!existingNames.has(n.name)) {
          try {
            const res = await createContractor(n)
            this.contractors.push(res.data)
            existingNames.add(n.name)
            added++
          } catch (e) {
            console.error('Failed to import:', n.name, e)
          }
        }
      }
      if (window.$toast) window.$toast(this.$t('contractors.imported', { count: added }) || `${added} contractors imported`, 'success')
    },
    openStatement(c) {
      this.$emit('navigate-statement', c.id)
    },
    openContextMenu(event, item) {
      this.contextMenu = {
        open: true,
        x: event.clientX,
        y: event.clientY,
        item
      }
    },
    closeContextMenu() {
      this.contextMenu.open = false
    },
    contextAction(action) {
      const c = this.contextMenu.item
      if (action === 'edit') this.openEdit(c)
      if (action === 'delete') this.confirmDelete(c)
      if (action === 'wallet') this.openWallet(c)
      if (action === 'statement') this.openStatement(c)
      this.closeContextMenu()
    }
  }
}
</script>

<style scoped>
[dir="rtl"] table th,
[dir="rtl"] table td {
  text-align: right;
}
</style>
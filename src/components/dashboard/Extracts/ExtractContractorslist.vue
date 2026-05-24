<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header -->
    <div class="app-page-header flex items-center rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50" :class="isRTL ? 'justify-between' : 'justify-between'">
      <h2 class="text-2xl font-semibold theme-text-primary">{{ $t('extracts.title') }}</h2>
      <div class="flex items-center gap-3">
        <!-- Import Excel -->
        <!-- <label class="theme-button px-4 py-2 rounded  inline-flex items-center cursor-pointer transition-colors">
          <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onFileChange" />
          <svg class="w-5 h-5" :class="isRTL ? 'ml-2' : 'mr-2'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 7l4-4 4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="13" width="18" height="8" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('transporters.importExcel') }}
        </label> -->
        <!-- Add Button -->
        <button @click="openAdd"
          class="theme-button px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm ">
          <PlusIcon class="w-5 h-5" />
          {{ $t('extracts.add') }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="max-w-md">
      <input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('extracts.searchPlaceholder')"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg theme-input-focus" />
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-200/80 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('labels.#') }}</th>
            <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('extracts.name') }}</th>
            <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('extracts.phone') }}</th>
            <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('extracts.bankName') }}</th>
            <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('extracts.accountNumber') }}</th>
            <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('extracts.notes') }}</th>
            <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(c, idx) in filtered"
            :key="c.id"
            class="theme-table-row-hover cursor-pointer transition-colors"
            @click="openContextMenu($event, c)"
            @contextmenu.prevent="openContextMenu($event, c)"
          >
            <td class="px-6 py-4 text-sm theme-accent-muted" :class="textAlign">{{ idx + 1 }}</td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">
              <button @click.stop="goToDetail(c)" class="theme-accent-muted hover:underline">{{ c.name }}</button>
            </td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">{{ c.phone || '-' }}</td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">{{ c.bankName || '-' }}</td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">{{ c.accountNumber || '-' }}</td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">{{ c.notes || '-' }}</td>
            <td class="px-6 py-4">
              <div class="flex gap-3" :class="isRTL ? 'justify-start' : 'justify-end'">
                <button @click.stop="openStatement(c)" class="rounded-lg theme-icon-button p-2" :title="$t('extracts.statement')">
                  <DocumentTextIcon class="h-5 w-5" />
                </button>
                <button @click.stop="openWallet(c)" class="rounded-lg border theme-border theme-dashboard-bg-soft p-2 theme-accent-strong hover:theme-icon-bg" :title="$t('extracts.wallet')">
                  <WalletIcon class="h-5 w-5" />
                </button>
                <button @click.stop="openEdit(c)" class="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100" :title="$t('labels.edit')">
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <button @click.stop="confirmDelete(c)" class="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100" :title="$t('labels.delete')">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="px-6 py-2 text-start theme-text-muted">
                {{ $t('extracts.noResults') }}
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
        class="bg-white rounded-2xl shadow-lg shadow-slate-200/30 border border-slate-200/80 p-4 cursor-pointer"
        @click="openContextMenu($event, c)"
        @contextmenu.prevent="openContextMenu($event, c)"
      >
        <div class="flex justify-between items-start" :class="isRTL ? 'flex-row-reverse' : ''">
          <div :class="isRTL ? 'text-right' : 'text-left'">
            <div class="font-semibold theme-text-primary">
              <button @click.stop="goToDetail(c)" class="hover:underline">{{ c.name }}</button>
            </div>
            <div class="text-sm theme-text-muted">
              {{ c.phone || '-' }}<br>
              <span v-if="c.bankName">{{ $t('extracts.bankName') }}: {{ c.bankName }}</span><br>
              <span v-if="c.accountNumber">{{ $t('extracts.accountNumber') }}: {{ c.accountNumber }}</span><br>
              <span v-if="c.notes">{{ $t('extracts.notes') }}: {{ c.notes }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <button @click.stop="openStatement(c)" class="theme-text text-xs">{{ $t('extracts.statement') }}</button>
            <button @click.stop="openWallet(c)" class="theme-text text-xs">{{ $t('extracts.wallet') }}</button>
            <button @click.stop="openEdit(c)" class="text-yellow-600 text-xs">{{ $t('labels.edit') }}</button>
            <button @click.stop="confirmDelete(c)" class="text-red-600 text-xs">{{ $t('labels.delete') }}</button>
          </div>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="text-center py-12 theme-text-muted">
        {{ $t('extracts.noResults') }}
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
      class="fixed bg-white rounded-xl shadow-lg py-2 z-50 border border-slate-200 min-w-[180px]"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
      @contextmenu.prevent
    >
      <button @click="contextAction('edit')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <PencilSquareIcon class="h-4 w-4" />
        {{ $t('labels.edit') }}
      </button>
      <button @click="contextAction('delete')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <TrashIcon class="h-4 w-4" />
        {{ $t('labels.delete') }}
      </button>
      <button @click="contextAction('wallet')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <WalletIcon class="h-4 w-4" />
        {{ $t('extracts.wallet') }}
      </button>
      <button @click="contextAction('statement')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <DocumentTextIcon class="h-4 w-4" />
        {{ $t('extracts.statement') }}
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm p-4" style="margin-top: 0 !important;">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm sm:max-w-lg lg:max-w-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            {{ editing ? $t('extracts.editContractor') : $t('extracts.addContractor') }}
          </h3>
          <button @click="closeModal" class="theme-caption hover:theme-text-secondary">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label class="sm:col-span-2 lg:col-span-3">
            <div class="text-sm mb-1">{{ $t('extracts.name') }}</div>
            <input v-model="form.name" :placeholder="$t('extracts.placeholders.name')" class="w-full px-3 py-2 border rounded theme-input-focus" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('extracts.phone') }}</div>
            <input v-model="form.phone" :placeholder="$t('extracts.placeholders.phone')" class="w-full px-3 py-2 border rounded theme-input-focus" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('extracts.bankName') }}</div>
            <input v-model="form.bankName" :placeholder="$t('extracts.placeholders.bankName')" class="w-full px-3 py-2 border rounded theme-input-focus" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('extracts.accountNumber') }}</div>
            <input v-model="form.accountNumber" :placeholder="$t('extracts.placeholders.accountNumber')" class="w-full px-3 py-2 border rounded theme-input-focus" />
          </label>
          <label v-if="!editing">
            <div class="text-sm mb-1">{{ $t('extracts.openingBalance') || 'Opening Balance' }}</div>
            <input v-model.number="form.openingBalance" type="number" :placeholder="$t('extracts.placeholders.openingBalance')" class="w-full px-3 py-2 border rounded theme-input-focus" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('extracts.notes') }}</div>
            <input v-model="form.notes" :placeholder="$t('extracts.placeholders.notes')" class="w-full px-3 py-2 border rounded theme-input-focus" />
          </label>
          
        </div>
        <div class="mt-6 flex justify-end gap-3 sm:col-span-2 lg:col-span-3">
          <button @click="closeModal" class="px-4 py-2 border rounded theme-text-secondary hover:bg-gray-50">
            {{ $t('labels.cancel') }}
          </button>
          <button @click="saveContractor" class="px-4 py-2 theme-button rounded">
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
            {{ selectedContractor ? selectedContractor.name : $t('extracts.wallet') }}
          </h3>
          <button @click="walletModalOpen = false" class="theme-text-muted hover:theme-text-secondary">✕</button>
        </div>
        <div v-if="walletLoading" class="text-center py-8">{{ $t('labels.loading') || 'Loading...' }}</div>
        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm theme-text-muted">{{ $t('extracts.balance') || 'Balance' }}</div>
              <div class="text-2xl font-semibold text-red-600">{{ wallet ? wallet.balance : '-' }}</div>
            </div>
            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm theme-text-muted">{{ $t('extracts.totalDeposits') || 'Total Deposits' }}</div>
              <div class="text-lg font-semibold text-green-600">{{ wallet ? wallet.totalDeposits : '-' }}</div>
            </div>
            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm theme-text-muted">{{ $t('extracts.sources') || 'Sources' }}</div>
              <div class="text-sm">
                <div>{{ $t('extracts.exports') || 'Exports' }}: {{ wallet && wallet.sources ? wallet.sources.exports : 0 }}</div>
                <div>{{ $t('extracts.transport') || 'Transport' }}: {{ wallet && wallet.sources ? wallet.sources.transport : 0 }}</div>
                <div>{{ $t('extracts.expenses') || 'Expenses' }}: {{ wallet && wallet.sources ? wallet.sources.expenses : 0 }}</div>
                <div>{{ $t('extracts.extracts') || 'Extracts' }}: {{ wallet && wallet.sources ? wallet.sources.extracts : 0 }}</div>
              </div>
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold mb-2">{{ $t('extracts.transactions') || 'Transactions' }}</h4>
              <div class="overflow-auto max-h-64 bg-white rounded border">
                <table class="min-w-full">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="p-2 text-left">{{ $t('labels.type') || 'Type' }}</th>
                      <th class="p-2 text-left">{{ $t('labels.date') || 'Date' }}</th>
                      <th class="p-2 text-right">{{ $t('labels.amount') || 'Amount' }}</th>
                      <th class="p-2 text-right">{{ $t('extracts.balanceAfter') || 'Balance After' }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!wallet || !wallet.entries || wallet.entries.length === 0">
                      <td class="p-3 text-center" colspan="4">{{ $t('extracts.noTransactions') || 'No transactions' }}</td>
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
              <h4 class="font-semibold mb-2">{{ $t('extracts.deposit') || 'Deposit' }}</h4>
              <div class="grid gap-2">
                <label>
                  <div class="text-sm mb-1">{{ $t('extracts.amount') || 'Amount' }}</div>
                  <input v-model="depositForm.amount" type="number" class="w-full px-3 py-2 border rounded" />
                </label>
                <label>
                  <div class="text-sm mb-1">{{ $t('labels.date') || 'Date' }}</div>
                  <DateField v-model="depositForm.date" class="w-full px-3 py-2 border rounded" />
                </label>
                <label>
                  <div class="text-sm mb-1">{{ $t('labels.description') || 'Description' }}</div>
                  <input v-model="depositForm.description" class="w-full px-3 py-2 border rounded" />
                </label>
                <div class="flex justify-end gap-2 mt-2">
                  <button @click="walletModalOpen = false" class="px-4 py-2 rounded border">{{ $t('labels.cancel') }}</button>
                  <button @click="doDeposit" class="px-4 py-2 rounded theme-button">{{ $t('labels.deposit') || 'Deposit' }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm" style="margin-top: 0 !important;">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 z-10">
        <p class="mb-4 text-center" :class="isRTL ? 'text-right' : 'text-left'">
          {{ $t('extracts.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?
        </p>
        <div class="flex justify-center gap-3">
          <button @click="cancelDelete" class="px-4 py-2 border rounded theme-text-secondary hover:bg-gray-50">
            {{ $t('labels.cancel') }}
          </button>
          <button @click="doDelete" class="px-4 py-2 bg-red-600 theme-text-light rounded hover:bg-red-700">
            {{ $t('labels.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { getContractors, createContractor, updateContractor, deleteContractor, getContractorWallet, getContractorWalletHistory, depositToContractorWallet } from '../../../api'
import Pagination from '@/components/shared/Pagination.vue'
import DateField from '@/components/shared/DateField.vue'
import normalizeItem from '@/utils/normalizeItem'
import { DocumentTextIcon, PencilSquareIcon, PlusIcon, TrashIcon, WalletIcon, XMarkIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'ExtractContractorsList',
  props: {
    mode: { type: String, default: 'extract' }
  },
  components: { Pagination, DateField, DocumentTextIcon, PencilSquareIcon, PlusIcon, TrashIcon, WalletIcon, XMarkIcon },
  data() {
    return {
      q: '',
      modalOpen: false,
      editing: false,
      form: { id: null, name: '', phone: '', bankName: '', accountNumber: '', notes: '', openingBalance: '' },
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
        const res = await getContractors({ page: this.page, pageSize: this.pageSize, q: this.q, mode: this.mode || 'extract' })
        const payload = res.data || {}
        const items = Array.isArray(payload.items) ? payload.items :
                         Array.isArray(payload.data) ? payload.data :
                         Array.isArray(payload) ? payload : []

        this.contractors = items.map(normalizeItem)
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
      this.form = { id: null, name: '', phone: '', bankName: '', accountNumber: '', notes: '', openingBalance: '' }
      this.modalOpen = true
    },
    openEdit(c) {
      this.editing = true
      const rest = { ...(c || {}) }
      delete rest.openingBalance
      this.form = { ...rest }
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    async saveContractor() {
      const name = this.form.name?.trim()
      if (!name) {
        if (window.$toast) window.$toast(this.$t('extracts.validationName') || 'Please enter a name', 'warning')
        return
      }
      const payload = { name }
      if (this.form.phone?.trim()) payload.phone = this.form.phone.trim()
      if (this.form.bankName?.trim()) payload.bankName = this.form.bankName.trim()
      if (this.form.accountNumber?.trim()) payload.accountNumber = this.form.accountNumber.trim()
      if (this.form.notes?.trim()) payload.notes = this.form.notes.trim()
      if (!this.editing && this.form.openingBalance !== undefined && this.form.openingBalance !== null && this.form.openingBalance !== '') payload.openingBalance = Number(this.form.openingBalance)
      // mark contractor available for extracts
      payload.availableForExtracts = true
      
      try {
        if (this.editing && this.form.id) {
          await updateContractor(this.form.id, payload)
          if (window.$toast) window.$toast(this.$t('extracts.updateSuccess') || 'Supplier updated successfully', 'success')
        } else {
          const res = await createContractor(payload)
          const created = res.normalized || (Array.isArray(res.data) ? res.data : [res.data])
          created.forEach(c => this.contractors.push(c))
          this.total += created.length
          if (created.length > 1) {
            if (window.$toast) window.$toast(this.$t('extracts.addMultipleSuccess') || 'Created separate contractor records for Extract', 'info')
          } else {
            if (window.$toast) window.$toast(this.$t('extracts.addSuccess') || 'Supplier added successfully', 'success')
          }
        }
        this.closeModal()
        await this.loadContractors()
      } catch (e) {
        console.error('Error saving contractor:', e)
        const errorMsg = e.response?.status === 404 
          ? (this.$t('extracts.updateError404') || 'Supplier not found or update endpoint not available')
          : (e.response?.data?.message || this.$t('extracts.addError') || 'Error saving supplier')
        if (window.$toast) window.$toast(errorMsg, 'error')
      }
    },
    async doDelete() {
      try {
        const params = {}
        if (this.mode) params.mode = this.mode
        const res = await deleteContractor(this.deleteConfirm.item.id, params)
        const data = res?.data ?? null
        if ((res && res.status === 204) || (data && data.deletedAt)) {
          if (window.$toast) window.$toast(this.$t('extracts.deleteSuccess') || 'Supplier deleted', 'success')
        } else if (data && !data.deletedAt && params.mode) {
          if (window.$toast) window.$toast(this.$t('extracts.availabilityRemoved') || `Availability removed for ${params.mode}`, 'success')
        } else {
          if (window.$toast) window.$toast(this.$t('extracts.deleteSuccess') || 'Supplier deleted', 'success')
        }
        await this.loadContractors()
        this.cancelDelete()
      } catch (e) {
        if (window.$toast) window.$toast(this.$t('extracts.deleteError') || 'Error deleting supplier', 'error')
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
        const historyData = hRes?.data || hRes
        if (historyData?.items) this.wallet.entries = historyData.items
        else if (historyData?.entries) this.wallet.entries = historyData.entries
        else if (Array.isArray(historyData)) this.wallet.entries = historyData
      } catch (err) {
        console.error('Error fetching wallet', err)
        if (window.$toast) window.$toast(this.$t('extracts.walletFetchError') || 'Error fetching wallet', 'error')
      } finally {
        this.walletLoading = false
      }
    },
    async doDeposit() {
      if (!this.selectedContractor) return
      const amount = Number(this.depositForm.amount || 0)
      if (!amount || amount <= 0) {
        if (window.$toast) window.$toast(this.$t('extracts.validationAmount') || 'Enter a valid amount', 'warning')
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
        if (window.$toast) window.$toast(this.$t('extracts.depositSuccess') || 'Deposit successful', 'success')
        this.depositForm = { amount: '', description: '', date: '' }
      } catch (err) {
        console.error('Error depositing', err)
        if (window.$toast) window.$toast(this.$t('extracts.depositError') || 'Error making deposit', 'error')
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
        supplier: header.findIndex(h => /مورد|Supplier|supplier/i.test(h)),
      }
      const imported = []
      for (const r of rows) {
        const name = (colIdx.name !== -1 && r[colIdx.name]) ? r[colIdx.name].toString().trim() : ''
        if (name) {
            const isSupplierFlag = (colIdx.supplier !== -1 && r[colIdx.supplier]) ? /1|true|yes|نعم/i.test(r[colIdx.supplier].toString()) : false
            imported.push({
            name,
            phone: (colIdx.phone !== -1 && r[colIdx.phone]) ? r[colIdx.phone].toString().trim() : '',
            bankName: (colIdx.bankName !== -1 && r[colIdx.bankName]) ? r[colIdx.bankName].toString().trim() : '',
            accountNumber: (colIdx.accountNumber !== -1 && r[colIdx.accountNumber]) ? r[colIdx.accountNumber].toString().trim() : '',
            notes: (colIdx.notes !== -1 && r[colIdx.notes]) ? r[colIdx.notes].toString().trim() : '',
            // set both new and legacy flags for compatibility
            availableForSupplies: isSupplierFlag,
            availableForExports: isSupplierFlag,
            availableForExtracts: isSupplierFlag
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
      if (window.$toast) window.$toast(this.$t('extracts.imported', { count: added }) || `${added} suppliers imported`, 'success')
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
    ,
    goToDetail(c) {
      if (!c || !c.id) return
      this.$router.push({ name: 'contractor-detail', params: { id: c.id }, query: { from: 'extracts' } }).catch(() => {})
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

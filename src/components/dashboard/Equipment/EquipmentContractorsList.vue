<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header -->
    <div class="app-page-header flex items-center rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-3 sm:p-5 shadow-lg shadow-slate-200/50" :class="isRTL ? 'justify-between' : 'justify-between'">
      <h2 class="text-2xl font-semibold text-gray-900">{{ $t('dashboard.contractorsList') || 'Contractors' }}</h2>
      <div class="flex items-center gap-3">
        <!-- Add Button -->
        <button @click="openAdd"
          class="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-sky-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm shadow-indigo-200 text-xs sm:text-sm">
          <PlusIcon class="w-5 h-5" />
          {{ $t('suppliers.add') }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="max-w-md">
      <input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('suppliers.searchPlaceholder')"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-200/80 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gradient-to-r from-slate-50 to-indigo-50">
          <tr>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('labels.#') }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('suppliers.name') }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('suppliers.phone') }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('suppliers.bankName') }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('suppliers.accountNumber') }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('suppliers.notes') }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(c, idx) in filtered"
            :key="c.id"
            class="hover:bg-indigo-50/40 cursor-pointer transition-colors"
            @click="openContextMenu($event, c)"
            @contextmenu.prevent="openContextMenu($event, c)"
          >
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-indigo-800 text-start">{{ idx + 1 }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900 text-start">
              <button @click.stop="goToDetail(c)" class="text-indigo-600 hover:underline">
                {{ c.name }}
              </button>
            </td>
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900 text-start">{{ c.phone || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900 text-start">{{ c.bankName || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900 text-start">{{ c.accountNumber || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900 text-start">{{ c.notes || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4">
              <div class="flex gap-3" :class="isRTL ? 'justify-start' : 'justify-end'">
                <button @click.stop="openStatement(c)" class="rounded-lg border border-violet-200 bg-violet-50 p-2 text-violet-700 hover:bg-violet-100" :title="$t('suppliers.statement')">
                  <DocumentTextIcon class="h-5 w-5" />
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
            <td colspan="7" class="px-3 py-2 sm:px-6 sm:py-3 text-start text-gray-500">
                {{ $t('suppliers.noResults') }}
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
        class="bg-white rounded-2xl shadow-lg shadow-slate-200/30 border border-slate-200/80 p-3 sm:p-4 cursor-pointer"
        @click="openContextMenu($event, c)"
        @contextmenu.prevent="openContextMenu($event, c)"
      >
        <div class="flex justify-between items-start" :class="isRTL ? 'flex-row-reverse' : ''">
          <div :class="isRTL ? 'text-right' : 'text-left'">
            <div class="font-semibold text-gray-900">
              <button @click.stop="goToDetail(c)" class="text-indigo-600 hover:underline text-left">
                {{ c.name }}
              </button>
            </div>
            <div class="text-sm text-gray-500">
              {{ c.phone || '-' }}<br>
              <span v-if="c.bankName">{{ $t('suppliers.bankName') }}: {{ c.bankName }}</span><br>
              <span v-if="c.accountNumber">{{ $t('suppliers.accountNumber') }}: {{ c.accountNumber }}</span><br>
              <span v-if="c.notes">{{ $t('suppliers.notes') }}: {{ c.notes }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <button @click.stop="openStatement(c)" class="text-purple-600 text-xs">{{ $t('suppliers.statement') }}</button>
            <button @click.stop="openWallet(c)" class="text-blue-600 text-xs">{{ $t('suppliers.wallet') }}</button>
            <button @click.stop="openEdit(c)" class="text-yellow-600 text-xs">{{ $t('labels.edit') }}</button>
            <button @click.stop="confirmDelete(c)" class="text-red-600 text-xs">{{ $t('labels.delete') }}</button>
          </div>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="text-center py-12 text-gray-500">
        {{ $t('suppliers.noResults') }}
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
      <button @click="contextAction('statement')" class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <DocumentTextIcon class="h-4 w-4" />
        {{ $t('suppliers.statement') }}
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm p-4" style="margin-top: 0 !important;">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm sm:max-w-lg lg:max-w-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            {{ editing ? $t('suppliers.editContractor') : $t('suppliers.addContractor') }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label class="sm:col-span-2 lg:col-span-3">
            <div class="text-sm mb-1">{{ $t('suppliers.name') }}</div>
            <input v-model="form.name" :placeholder="$t('suppliers.placeholders.name')" class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('suppliers.phone') }}</div>
            <input v-model="form.phone" :placeholder="$t('suppliers.placeholders.phone')" class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('suppliers.bankName') }}</div>
            <input v-model="form.bankName" :placeholder="$t('suppliers.placeholders.bankName')" class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus;border-indigo-500" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('suppliers.accountNumber') }}</div>
            <input v-model="form.accountNumber" :placeholder="$t('suppliers.placeholders.accountNumber')" class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </label>
          <label v-if="!editing">
            <div class="text-sm mb-1">{{ $t('suppliers.openingBalance') || 'Opening Balance' }}</div>
            <input v-model.number="form.openingBalance" type="number" :placeholder="$t('suppliers.placeholders.openingBalance')" class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('suppliers.notes') }}</div>
            <input v-model="form.notes" :placeholder="$t('suppliers.placeholders.notes')" class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </label>
          
        </div>
        <div class="mt-6 flex justify-end gap-3 sm:col-span-2 lg:col-span-3">
          <button @click="closeModal" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
            {{ $t('labels.cancel') }}
          </button>
          <button @click="saveContractor" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            {{ $t('labels.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm" style="margin-top: 0 !important;">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-4 sm:p-6 z-10">
        <p class="mb-4 text-center" :class="isRTL ? 'text-right' : 'text-left'">
          {{ $t('suppliers.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?
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
import { getContractors, createContractor, updateContractor, deleteContractor, getContractorWallet, getContractorWalletHistory, depositToContractorWallet } from '../../../api'
import Pagination from '@/components/shared/Pagination.vue'
import normalizeItem from '@/utils/normalizeItem'
import { DocumentTextIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'EquipmentContractorsList',
  props: {
    mode: { type: String, default: 'rentals' }
  },
  components: { Pagination, DocumentTextIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon },
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
          const res = await getContractors({ page: this.page, pageSize: this.pageSize, q: this.q, mode: this.mode })
          const payload = res.data || {}
          let items = Array.isArray(payload.items) ? payload.items :
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
        if (window.$toast) window.$toast(this.$t('suppliers.validationName') || 'Please enter a name', 'warning')
        return
      }
      const payload = { name }
      if (this.form.phone?.trim()) payload.phone = this.form.phone.trim()
      if (this.form.bankName?.trim()) payload.bankName = this.form.bankName.trim()
      if (this.form.accountNumber?.trim()) payload.accountNumber = this.form.accountNumber.trim()
      if (this.form.notes?.trim()) payload.notes = this.form.notes.trim()
      if (!this.editing && this.form.openingBalance !== undefined && this.form.openingBalance !== null && this.form.openingBalance !== '') payload.openingBalance = Number(this.form.openingBalance)
      // set availability flag based on mode (equipment / transport / export)
      if (!this.mode || this.mode === 'rentals' || this.mode === 'equipmentLogs') {
        payload.availableForEquipmentRental = true
      } else if (this.mode === 'transport') {
        payload.availableForTransports = true
      } else if (this.mode === 'supply' || this.mode === 'export' || this.mode === 'exports') {
        payload.availableForExports = true
      } else {
        payload.availableForEquipmentRental = true
      }
      try {
        if (this.editing && this.form.id) {
          await updateContractor(this.form.id, payload)
          if (window.$toast) window.$toast(this.$t('suppliers.updateSuccess') || 'Supplier updated successfully', 'success')
        } else {
          const res = await createContractor(payload)
          const created = res.normalized || (Array.isArray(res.data) ? res.data : [res.data])
          created.forEach(c => this.contractors.push(c))
          this.total += created.length
          if (created.length > 1) {
            if (window.$toast) window.$toast(this.$t('suppliers.addMultipleSuccess') || 'Created separate contractor records for Supply and Transport', 'info')
          } else {
            if (window.$toast) window.$toast(this.$t('suppliers.addSuccess') || 'Supplier added successfully', 'success')
          }
        }
        this.closeModal()
        await this.loadContractors()
      } catch (e) {
        console.error('Error saving contractor:', e)
        const errorMsg = e.response?.status === 404 
          ? (this.$t('suppliers.updateError404') || 'Supplier not found or update endpoint not available')
          : (e.response?.data?.message || this.$t('suppliers.addError') || 'Error saving supplier')
        if (window.$toast) window.$toast(errorMsg, 'error')
      }
    },
    async doDelete() {
      try {
        const params = {}
        if (this.mode === 'supply' || this.mode === 'transport') params.mode = this.mode
        const res = await deleteContractor(this.deleteConfirm.item.id, params)
        const data = res?.data ?? null
        if ((res && res.status === 204) || (data && data.deletedAt)) {
          if (window.$toast) window.$toast(this.$t('suppliers.deleteSuccess') || 'Supplier deleted', 'success')
        } else if (data && !data.deletedAt && params.mode) {
          if (window.$toast) window.$toast(this.$t('suppliers.availabilityRemoved') || `Availability removed for ${params.mode}`, 'success')
        } else {
          if (window.$toast) window.$toast(this.$t('suppliers.deleteSuccess') || 'Supplier deleted', 'success')
        }
        await this.loadContractors()
        this.cancelDelete()
      } catch (e) {
        if (window.$toast) window.$toast(this.$t('suppliers.deleteError') || 'Error deleting supplier', 'error')
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
        if (window.$toast) window.$toast(this.$t('suppliers.walletFetchError') || 'Error fetching wallet', 'error')
      } finally {
        this.walletLoading = false
      }
    },
    async doDeposit() {
      if (!this.selectedContractor) return
      const amount = Number(this.depositForm.amount || 0)
      if (!amount || amount <= 0) {
        if (window.$toast) window.$toast(this.$t('suppliers.validationAmount') || 'Enter a valid amount', 'warning')
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
        if (window.$toast) window.$toast(this.$t('suppliers.depositSuccess') || 'Deposit successful', 'success')
        this.depositForm = { amount: '', description: '', date: '' }
      } catch (err) {
        console.error('Error depositing', err)
        if (window.$toast) window.$toast(this.$t('suppliers.depositError') || 'Error making deposit', 'error')
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
        transporter: header.findIndex(h => /ناقل|Transporter|transport/i.test(h)),
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
            notes: (colIdx.notes !== -1 && r[colIdx.notes]) ? r[colIdx.notes].toString().trim() : '',
            availableForTransports: (colIdx.transporter !== -1 && r[colIdx.transporter]) ? /1|true|yes|نعم/i.test(r[colIdx.transporter].toString()) : false
          })
        }
      }
      const existingNames = new Set(this.contractors.map(c => c.name))
      let added = 0
      for (const n of imported) {
        if (!existingNames.has(n.name)) {
          try {
            const res = await createContractor(n)
            const created = res.normalized || (Array.isArray(res.data) ? res.data : [res.data])
            created.forEach(c => this.contractors.push(c))
            existingNames.add(n.name)
            added += created.length
          } catch (e) {
            console.error('Failed to import:', n.name, e)
          }
        }
      }
      if (window.$toast) window.$toast(this.$t('suppliers.imported', { count: added }) || `${added} suppliers imported`, 'success')
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
      this.$router.push({ name: 'contractor-detail', params: { id: c.id }, query: { from: 'equipmentLogs' } }).catch(() => {})
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

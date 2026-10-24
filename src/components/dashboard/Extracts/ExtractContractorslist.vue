<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header -->
    <div class="app-page-header flex items-center rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50" :class="isRTL ? 'justify-between' : 'justify-between'">
      <h2 class="text-2xl font-semibold theme-text-primary">{{ $t('extracts.title') }}</h2>
      <div class="flex items-center gap-3">
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

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-200/80">
      <table v-app-table class="app-table divide-y divide-gray-200">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('labels.#') }}</th>
            <th data-col="title" class="px-6 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :class="textAlign">{{ $t('extracts.name') }}</th>
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
            <td class="px-6 py-4 text-sm theme-accent-muted" :class="textAlign">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">
              <button @click.stop="goToDetail(c)" class="theme-accent-muted hover:underline">{{ c.name }}</button>
            </td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">{{ c.phone || '-' }}</td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">{{ c.bankName || '-' }}</td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">{{ c.accountNumber || '-' }}</td>
            <td class="px-6 py-4 text-sm theme-text-primary" :class="textAlign">{{ c.notes || '-' }}</td>
            <td class="px-6 py-4">
              <RowActions :actions="rowActions(c)" />
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
    <Modal
      :visible="modalOpen"
      :title="editing ? $t('extracts.editContractor') : $t('extracts.addContractor')"
      size="lg"
      @update:visible="modalOpen = $event"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="sm:col-span-2 lg:col-span-3">
          <Label class="text-sm mb-1 block">{{ $t('extracts.name') }}</Label>
          <Input v-model="form.name" :placeholder="$t('extracts.placeholders.name')" class="w-full" />
        </div>
        <div>
          <Label class="text-sm mb-1 block">{{ $t('extracts.phone') }}</Label>
          <Input v-model="form.phone" :placeholder="$t('extracts.placeholders.phone')" class="w-full" />
        </div>
        <div>
          <Label class="text-sm mb-1 block">{{ $t('extracts.bankName') }}</Label>
          <Input v-model="form.bankName" :placeholder="$t('extracts.placeholders.bankName')" class="w-full" />
        </div>
        <div>
          <Label class="text-sm mb-1 block">{{ $t('extracts.accountNumber') }}</Label>
          <Input v-model="form.accountNumber" :placeholder="$t('extracts.placeholders.accountNumber')" class="w-full" />
        </div>
        <div>
          <Label class="text-sm mb-1 block">{{ $t('extracts.notes') }}</Label>
          <Input v-model="form.notes" :placeholder="$t('extracts.placeholders.notes')" class="w-full" />
        </div>
        <div class="sm:col-span-2 lg:col-span-3">
          <OpeningBalanceSitesField v-model="form.openingBalanceLines" :locations="locations" />
          <p v-if="editing" class="mt-1 text-xs text-amber-700">
            <template v-if="openingBalancePending">⏳ {{ $i18n.locale === 'ar' ? 'في انتظار موافقة تعديل رصيد أول المدة إلى' : 'Opening balance change waiting for approval:' }} {{ openingBalancePending.sites || openingBalancePending.openingBalance }}<template v-if="!openingBalancePending.sites && openingBalancePending.locationName"> — {{ openingBalancePending.locationName }}</template></template>
            <template v-else>{{ $i18n.locale === 'ar' ? 'تعديل رصيد أول المدة يحتاج موافقة إدارية' : 'Changing the opening balance needs admin approval' }}</template>
          </p>
        </div>
      </div>
      <template #footer>
        <Button variant="outline" @click="closeModal">{{ $t('labels.cancel') }}</Button>
        <Button @click="saveContractor">{{ $t('labels.save') }}</Button>
      </template>
    </Modal>

    <!-- Contractor Wallet Modal -->
    <Modal
      :visible="walletModalOpen"
      :title="selectedContractor ? selectedContractor.name : $t('extracts.wallet')"
      size="lg"
      @update:visible="walletModalOpen = $event"
    >
      <WalletPanel v-if="selectedContractor" :contractorId="selectedContractor.id" />
    </Modal>

    <!-- Confirm delete modal -->
    <ConfirmDialog
      :show="deleteConfirm.open"
      :title="$t('labels.confirmDelete') || 'Confirm Delete'"
      :message="deleteConfirm.item ? ($t('labels.confirmDelete') + ' ' + deleteConfirm.item.name) : ''"
      type="danger"
      @confirm="doDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { usePagination } from '@/composables/usePagination'
import * as XLSX from 'xlsx'
import { getContractors, getContractorOpeningBalance, getLocations, createContractor, updateContractor, deleteContractor, getContractorWallet, getContractorWalletHistory, getContractorAccounts, depositToContractorWallet, normalizeContractorAccountType } from '../../../api'
import { isPendingApproval, pendingApprovalToast } from '@/utils/approval'
import Pagination from '@/components/shared/Pagination.vue'
import WalletPanel from '@/components/shared/WalletPanel.vue'
import OpeningBalanceSitesField, { emptyOpeningBalanceLine, openingBalanceLinesFromApi, openingBalanceLinesPayload, sameOpeningBalanceLines } from '@/components/shared/OpeningBalanceSitesField.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Modal from '@/components/shared/Modal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { DocumentTextIcon, PencilSquareIcon, PlusIcon, TrashIcon, WalletIcon, XMarkIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'ExtractContractorsList',
  props: {
    mode: { type: String, default: 'extract' }
  },
  components: {
    Modal,
    ConfirmDialog,
    Button,
    Input,
    Label, Pagination, WalletPanel, OpeningBalanceSitesField, RowActions, DocumentTextIcon, PencilSquareIcon, PlusIcon, TrashIcon, WalletIcon, XMarkIcon },
  setup(props) {
    const q = ref('')
    const { items: contractorsAll, page, pageSize, total, totalPages, loading, load, setPage, setPageSize } = usePagination(
      (p, ps, extra) => getContractors({ page: p, pageSize: ps, q: extra.q ?? q.value, mode: props.mode || 'extract' }),
      { initialPageSize: 20, resourceName: 'contractors-extract' }
    )

    const loadContractors = () => load({ q: q.value })

    const filtered = computed(() => {
      if (!q.value) return contractorsAll.value
      const s = q.value.toLowerCase()
      return contractorsAll.value.filter(c =>
        (c.name || '').toLowerCase().includes(s) ||
        (c.phone || '').toLowerCase().includes(s) ||
        (c.bankName || '').toLowerCase().includes(s) ||
        (c.accountNumber || '').toLowerCase().includes(s)
      )
    })

    const contractors = computed(() => contractorsAll.value)

    return { q, contractors, filtered, page, pageSize, total, totalPages, loading, loadContractors, setPage, setPageSize, contractorsAll }
  },
  data() {
    return {
      modalOpen: false,
      editing: false,
      form: { id: null, name: '', phone: '', bankName: '', accountNumber: '', notes: '', openingBalanceLines: [emptyOpeningBalanceLine()] },
      locations: [],
      deleteConfirm: { open: false, item: null },
      contextMenu: { open: false, x: 0, y: 0, item: null },
      walletModalOpen: false,
      walletLoading: false,
      wallet: null,
      selectedContractor: null,
      selectedWalletAccount: null,
      depositForm: { amount: '', description: '', date: '' },
      searchTimeout: null,
      openingBalanceLinesOriginal: null,
      openingBalancePending: null
    }
  },
  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    textAlign() {
      return this.isRTL ? 'text-right' : 'text-left'
    }
  },
  mounted() {
    this.loadContractors()
    this.loadLocations()
    document.addEventListener('click', this.closeContextMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  },
  methods: {
    async loadLocations() {
      try {
        const res = await getLocations()
        this.locations = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || [])
      } catch (e) {
        console.error('Failed to load locations:', e)
      }
    },
    changePage(p) {
      if (p >= 1 && p <= this.totalPages && p !== this.page) {
        this.setPage(p)
        this.loadContractors()
      }
    },
    onPageSizeChange(size) {
      this.setPageSize(size)
      this.loadContractors()
    },
    onSearchInput() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.setPage(1)
        this.loadContractors()
      }, 500)
    },
    rowActions(c) {
      return [
        { key: 'statement', icon: DocumentTextIcon, label: this.$t('extracts.statement'), tone: 'statement', onClick: () => this.openStatement(c) },
        { key: 'wallet', icon: WalletIcon, label: this.$t('extracts.wallet'), tone: 'wallet', onClick: () => this.openWallet(c) },
        { key: 'edit', icon: PencilSquareIcon, label: this.$t('labels.edit'), tone: 'edit', onClick: () => this.openEdit(c) },
        { key: 'delete', icon: TrashIcon, label: this.$t('labels.delete'), tone: 'delete', onClick: () => this.confirmDelete(c) },
      ]
    },
    openAdd() {
      this.editing = false
      this.form = { id: null, name: '', phone: '', bankName: '', accountNumber: '', notes: '', openingBalanceLines: [emptyOpeningBalanceLine()] }
      this.modalOpen = true
    },
    openEdit(c) {
      this.editing = true
      const rest = { ...(c || {}) }
      delete rest.openingBalance
      this.form = { ...rest }
      this.form.openingBalanceLines = [emptyOpeningBalanceLine()]
      this.openingBalanceLinesOriginal = null
      this.openingBalancePending = null
      getContractorOpeningBalance(c.id, 'EXTRACT')
        .then(({ data }) => {
          if (!this.editing || this.form.id !== c.id) return
          this.openingBalanceLinesOriginal = openingBalanceLinesFromApi(data.lines)
          this.form.openingBalanceLines = openingBalanceLinesFromApi(data.lines)
          this.openingBalancePending = data.pendingApproval
        })
        .catch(err => console.error('Failed to load opening balance:', err))
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
      const openingBalanceLines = openingBalanceLinesPayload(this.form.openingBalanceLines)
      if (!this.editing && openingBalanceLines.length) payload.openingBalanceLines = openingBalanceLines
      if (this.editing && this.openingBalanceLinesOriginal !== null && !sameOpeningBalanceLines(this.form.openingBalanceLines, this.openingBalanceLinesOriginal)) {
        payload.openingBalanceLines = openingBalanceLines
        payload.openingBalanceAccountType = 'EXTRACT'
      }
      payload.availableForExtracts = true
      try {
        if (this.editing && this.form.id) {
          const res = await updateContractor(this.form.id, payload)
          if (isPendingApproval(res) || res?.data?.pendingApproval) {
            if (window.$toast) window.$toast(pendingApprovalToast(this.$i18n.locale === 'ar'), 'info')
          } else if (window.$toast) {
            window.$toast(this.$t('extracts.updateSuccess') || 'Supplier updated successfully', 'success')
          }
          if (res?.data?.openingBalanceApproval && window.$toast) {
            window.$toast(this.$i18n.locale === 'ar' ? 'تم إرسال تعديل رصيد أول المدة للموافقة الإدارية' : 'Opening balance change sent for admin approval', 'info')
          }
        } else {
          const res = await createContractor(payload)
          const created = res.normalized || (Array.isArray(res.data) ? res.data : [res.data])
          created.forEach(c => this.contractorsAll.push(c))
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
        if (isPendingApproval(res)) {
          if (window.$toast) window.$toast(pendingApprovalToast(this.$i18n.locale === 'ar'), 'info')
          await this.loadContractors()
          this.cancelDelete()
          return
        }
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
    },
    async fetchWallet(contractorId) {
      this.walletLoading = true
      try {
        const accountType = normalizeContractorAccountType(this.mode)
        const wRes = await getContractorWallet(contractorId)
        this.wallet = wRes.data || null
        try {
          const accRes = await getContractorAccounts(contractorId)
          const raw = accRes?.data || []
          const acctArr = Array.isArray(raw) ? raw : (raw.accounts || raw.data || [])
          if (acctArr.length > 0) {
            this.wallet = this.wallet || {}
            this.wallet.accounts = acctArr
            this.selectedWalletAccount = acctArr.find(a => normalizeContractorAccountType(a.accountType) === accountType) || acctArr[0]
          }
        } catch (e) { /* ignore */ }
        try {
          const hRes = await getContractorWalletHistory(contractorId, { accountType })
          const historyData = hRes?.data || hRes
          if (this.wallet) {
            if (historyData?.items) this.wallet.entries = historyData.items
            else if (historyData?.entries) this.wallet.entries = historyData.entries
            else if (Array.isArray(historyData)) this.wallet.entries = historyData
          }
        } catch (e) { /* ignore */ }
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
        const accountType = normalizeContractorAccountType(this.mode)
        const acct = this.selectedWalletAccount
        const payload = {
          amount,
          description: this.depositForm.description || '',
          date: this.depositForm.date || undefined,
          accountId: acct?.id || undefined,
          accountType
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
    },
    goToDetail(c) {
      if (!c || !c.id) return
      try {
        localStorage.setItem(`contractor-detail-${c.id}`, JSON.stringify(c))
      } catch (e) { /* ignore */ }
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

<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header -->
    <div class="app-page-header rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50">
      <h1 class="mb-2 text-2xl font-semibold theme-text-primary">{{ $t('changes.title') }}</h1>
      <p class="theme-text-secondary">{{ $t('changes.description') }}</p>
    </div>

    <!-- Date Selector -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="mb-2 block text-sm font-medium theme-text-secondary">
            {{ $t('labels.fromDate') || 'From Date' }}
          </label>
          <DateField v-model="selectedDateFrom"
            class="w-full rounded-xl border border-slate-200 px-4 py-2 theme-input-focus" />
        </div>
        <div class="flex-1">
          <label class="mb-2 block text-sm font-medium theme-text-secondary">
            {{ $t('labels.toDate') || 'To Date' }}
          </label>
          <DateField v-model="selectedDateTo"
            class="w-full rounded-xl border border-slate-200 px-4 py-2 theme-input-focus" />
        </div>
        <button @click="loadChanges" :disabled="loading || !selectedDateFrom"
          class="rounded-xl theme-button px-6 py-2 theme-text-light shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50">
          {{ $t('changes.loadChanges') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-red-800">{{ error }}</span>
      </div>
    </div>

    <!-- Changes Display -->
    <div v-else-if="hasData" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div v-for="(module, key) in changes" :key="key"
          class="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/50"
          :class="{ 'theme-ring-active theme-border': activeModule === key }" @click="activeModule = key">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm theme-text-secondary">{{ $t(`changes.modules.${key}`) }}</p>
              <p class="text-2xl font-semibold theme-text-primary mt-1">
                {{ module.count || 0 }}
              </p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl"
              :class="module.count > 0 ? 'theme-icon-bg theme-text' : 'bg-slate-100 theme-caption'">
              <div v-html="moduleIcon(key)" class="w-7 h-7"
                :class="module.count > 0 ? 'theme-text' : 'theme-caption'"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed View -->
      <div v-if="activeModule && changes[activeModule]?.items?.length > 0"
        class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
        <div class="border-b border-slate-200 theme-table-thead-gradient px-6 py-4">
          <h2 class="text-lg font-semibold theme-text-primary">
            {{ $t(`changes.modules.${activeModule}`) }} - {{ $t('changes.changesFor') }} {{ formatDate(selectedDateFrom) }}{{ selectedDateTo && selectedDateTo !== selectedDateFrom ? ' - ' + formatDate(selectedDateTo) : '' }}
          </h2>
          <p class="mt-1 text-sm theme-text-secondary">
            {{ $t('changes.totalChanges') }}: {{ changes[activeModule].count }}
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="theme-table-thead-gradient">
              <tr>
                <th v-for="header in getHeadersForModule(activeModule)" :key="header"
                  class="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider"
                  :class="isRTL ? 'text-right' : 'text-left'">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-for="(item, idx) in changes[activeModule].items" :key="item.id || idx" class="theme-table-row-hover">
                <td v-for="field in getFieldsForModule(activeModule)" :key="field"
                  class="px-6 py-4 whitespace-nowrap text-sm theme-text-primary">
                  {{ formatField(item, field) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Changes Message -->
      <div v-else-if="selectedDateFrom && !loading" class="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-lg shadow-slate-200/40">
        <svg class="w-16 h-16 theme-caption mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
          </path>
        </svg>
        <p class="text-lg theme-text-secondary">{{ $t('changes.noChanges') }}</p>
        <p class="mt-2 text-sm theme-text-muted">{{ $t('changes.noChangesDesc') }}</p>
      </div>
    </div>

    <!-- Initial State -->
    <div v-else class="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-lg shadow-slate-200/40">
      <svg class="w-16 h-16 theme-caption mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p class="text-lg theme-text-secondary">{{ $t('changes.selectDatePrompt') }}</p>
      <p class="mt-2 text-sm theme-text-muted">{{ $t('changes.selectDateDesc') }}</p>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import {
  getExportsChanges,
  getLocationsChanges,
  getContractorsChanges,
  getCrushersChanges,
  getTransportsChanges,
  getEquipmentLogsChanges,
  getPaymentsChanges,
  getExtractsChanges,
  getVehiclesChanges,
  getCompanyWalletTransactionsChanges,
  getExpensesChanges,
  // Branches changes API
  getBranchesChanges,
  // Petroleum Materials changes API
  getPetroleumSuppliesChanges
} from '@/api'
import DateField from '@/components/shared/DateField.vue'
import { getTodayISO } from '@/utils/dateUtils'

export default {
  name: 'ChangesByDate',
  components: { DateField },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  data() {
    return {
      selectedDateFrom: getTodayISO(),
      selectedDateTo: getTodayISO(),
      loading: false,
      error: null,
      activeModule: null,
      headersAr: {
        'ID': 'المعرف',
        'Date': 'التاريخ',
        'Date From': 'من تاريخ',
        'Date To': 'إلى تاريخ',
        'Name': 'الاسم',
        'Contractor': 'المقاول',
        'Crusher': 'الكسارة',
        'Location': 'الموقع',
        'Vehicle': 'المركبة',
        'Created By': 'تم بواسطة',
        'Parent': 'الأب',
        'Phone': 'الهاتف',
        'Bank': 'البنك',
        'Account': 'الحساب',
        'From': 'من',
        'To': 'إلى',
        'Trips': 'الرحلات',
        'Total': 'الإجمالي',
        'Equipment': 'المعدة',
        'Hours': 'الساعات',
        'Site': 'الموقع',
        'Area': 'المنطقة',
        'Module': 'الوحدة',
        'Amount': 'المبلغ',
        'Payment Method': 'طريقة الدفع',
        'Treasury': 'الخزينة',
        'Notes': 'ملاحظات',
        'Actor': 'المستخدم',
        'Updated At': 'آخر تحديث',
        'Company Capacity': 'سعة الشركة',
        'Crusher Capacity': 'سعة الكسارة',
        'Type': 'النوع',
        'Description': 'الوصف',
        'Category': 'التصنيف',
        'Item': 'الصنف',
        'Quantity': 'الكمية'
      },
      changes: {
        exports: { count: 0, items: [] },
        locations: { count: 0, items: [] },
        contractors: { count: 0, items: [] },
        crushers: { count: 0, items: [] },
        transports: { count: 0, items: [] },
        rentals: { count: 0, items: [] },
        payments: { count: 0, items: [] },
        extracts: { count: 0, items: [] },
        vehicles: { count: 0, items: [] },
        companyWallet: { count: 0, items: [] },
        expenses: { count: 0, items: [] },
        // [COMMENTED OUT] Branches changes data (company branches)
        // branches: { count: 0, items: [] },
        // [COMMENTED OUT] Petroleum Materials changes data (fuel/oil supplies from contractors)
        // petroleumSupplies: { count: 0, items: [] }
      }
    }
  },
  computed: {
    isRTL() {
      return this.locale === 'ar'
    },
    hasData() {
      return Object.values(this.changes).some(c => c.count > 0)
    }
  },
  methods: {
    async loadChanges() {
      if (!this.selectedDateFrom) return
      this.loading = true
      this.error = null
      this.activeModule = null
      try {
        const dateParams = {
          fromDate: this.selectedDateFrom,
          toDate: this.selectedDateTo || this.selectedDateFrom
        }
        const promises = [
          this.loadModuleChanges('exports', () => getExportsChanges(dateParams)),
          this.loadModuleChanges('locations', () => getLocationsChanges(dateParams)),
          this.loadModuleChanges('contractors', () => getContractorsChanges(dateParams)),
          this.loadModuleChanges('crushers', () => getCrushersChanges(dateParams)),
          this.loadModuleChanges('transports', () => getTransportsChanges(dateParams)),
          this.loadModuleChanges('rentals', () => getEquipmentLogsChanges(dateParams)),
          this.loadModuleChanges('payments', () => getPaymentsChanges(dateParams)),
          this.loadModuleChanges('extracts', () => getExtractsChanges(dateParams)),
          this.loadModuleChanges('vehicles', () => getVehiclesChanges(dateParams)),
          this.loadModuleChanges('companyWallet', () => getCompanyWalletTransactionsChanges(dateParams)),
          this.loadModuleChanges('expenses', () => getExpensesChanges(dateParams)),
          // [COMMENTED OUT] Load changes for company branches
          // this.loadModuleChanges('branches', () => getBranchesChanges(dateParams)),
          // [COMMENTED OUT] Load changes for petroleum materials (fuel/oil supplies from contractors)
          // this.loadModuleChanges('petroleumSupplies', () => getPetroleumSuppliesChanges(dateParams))
        ]
        await Promise.allSettled(promises)
        const moduleWithChanges = Object.keys(this.changes).find(key => this.changes[key].count > 0)
        if (moduleWithChanges) {
          this.activeModule = moduleWithChanges
        }
      } catch (err) {
        console.error('Error loading changes:', err)
        this.error = this.$t('changes.loadError') || 'Error loading changes'
      } finally {
        this.loading = false
      }
    },
    async loadModuleChanges(moduleKey, apiCall) {
      try {
        const response = await apiCall()
        if (response.data) {
          this.changes[moduleKey] = {
            count: response.data.count || (response.data.items ? response.data.items.length : 0),
            items: response.data.items || []
          }
        }
      } catch (err) {
        console.error(`Error loading ${moduleKey} changes:`, err)
        this.changes[moduleKey] = { count: 0, items: [] }
      }
    },
    bilingualHeader(en) {
      const ar = this.headersAr[en] || en
      return this.isRTL ? `${ar} / ${en}` : `${en} / ${ar}`
    },
    getHeadersForModule(moduleKey) {
      const configs = {
        exports: ['ID', 'Date', 'Contractor', 'Crusher', 'Location', 'Vehicle', 'Created By'],
        locations: ['ID', 'Name', 'Parent', 'Created By'],
        contractors: ['ID', 'Name', 'Phone', 'Bank', 'Account', 'Created By'],
        crushers: ['ID', 'Name', 'Created By'],
        transports: ['ID', 'Date', 'Contractor', 'From', 'To', 'Trips', 'Total', 'Created By'],
        rentals: ['ID', 'Date', 'Equipment', 'Name', 'Hours', 'Total', 'Created By'],
        payments: ['ID', 'Date', 'Site', 'Area', 'Module', 'Contractor', 'Amount', 'Payment Method', 'Treasury', 'Notes', 'Actor', 'Updated At'],
        extracts: ['ID', 'Date From', 'Date To', 'Contractor', 'Location', 'Area', 'Total', 'Notes', 'Actor', 'Updated At'],
        vehicles: ['ID', 'Name', 'Contractor', 'Company Capacity', 'Crusher Capacity', 'Created By'],
        companyWallet: ['ID', 'Date', 'Type', 'Amount', 'Description', 'Created By'],
        expenses: ['ID', 'Date', 'Category', 'Amount', 'Description', 'Created By'],
        // [COMMENTED OUT] Branches: tracks branch name changes
        // branches: ['ID', 'Name', 'Created By'],
        // [COMMENTED OUT] Petroleum Materials: tracks fuel/oil supply records from contractors
        // petroleumSupplies: ['ID', 'Date', 'Contractor', 'Item', 'Quantity', 'Total', 'Created By']
      }
      return (configs[moduleKey] || []).map(h => this.bilingualHeader(h))
    },
    getFieldsForModule(moduleKey) {
      const configs = {
        exports: ['id', 'date', 'contractor.name', 'crusher.name', 'location.name', 'vehicle.name', 'createdBy.name'],
        locations: ['id', 'name', 'parentId', 'createdBy.name'],
        contractors: ['id', 'name', 'phone', 'bankName', 'accountNumber', 'createdBy.name'],
        crushers: ['id', 'name', 'createdBy.name'],
        transports: ['id', 'date', 'contractor.name', 'fromLoc', 'toLoc', 'numTrips', 'total', 'createdBy.name'],
        rentals: ['id', 'date', 'equipment', 'name', 'hours', 'total', 'createdBy.name'],
        payments: ['id', 'paidAt', 'site.name', 'area.name', 'accountType', 'contractor.name', 'amount', 'paymentMethod', 'treasury', 'notes', 'actor', 'updatedAt'],
        extracts: ['id', 'dateFrom', 'dateTo', 'contractor.name', 'location.name', 'area.name', 'total', 'notes', 'actor', 'updatedAt'],
        vehicles: ['id', 'name', 'contractor.name', 'companyCapacity', 'crusherCapacity', 'createdBy.name'],
        companyWallet: ['id', 'date', 'type', 'amount', 'description', 'createdBy.name'],
        expenses: ['id', 'date', 'category.name', 'amount', 'description', 'createdBy.name'],
        // [COMMENTED OUT] Branches: id, branch name, who created it
        // branches: ['id', 'name', 'createdBy.name'],
        // [COMMENTED OUT] Petroleum Materials: id, date, contractor, item name, quantity, total cost, who created it
        // petroleumSupplies: ['id', 'date', 'contractor.name', 'item.name', 'quantity', 'total', 'createdBy.name']
      }
      return configs[moduleKey] || []
    },
    formatPaymentModule(value) {
      const raw = String(value || '').trim().toLowerCase()
      const normalized = raw === 'rental' ? 'rentals' : raw
      const key = `payments.modules.${normalized}`
      const translated = this.$t(key)
      return translated && translated !== key ? translated : (normalized || '-')
    },
    formatPaymentMethod(value) {
      const raw = String(value || '').trim().toLowerCase()
      const key = `payments.methods.${raw}`
      const translated = this.$t(key)
      return translated && translated !== key ? translated : (raw || '-')
    },
    formatActor(item) {
      const actor = item?.actor?.name || item?.updatedBy?.name || item?.createdBy?.name || item?.actorName
      if (actor) return actor
      return this.$t('labels.system') || 'System'
    },
    formatTreasuryType(type) {
      const raw = String(type || '').toUpperCase()
      switch (raw) {
        case 'DEPOSIT': return this.$t('treasury.types.deposit')
        case 'PAYMENT': return this.$t('treasury.types.payment')
        case 'WITHDRAW': return this.$t('treasury.types.withdraw')
        case 'ADJUSTMENT': return this.$t('treasury.types.adjustment')
        default: return type || '-'
      }
    },
    formatField(item, field, moduleKey) {
      const value = this.getNestedValue(item, field)
      if ((moduleKey === 'payments' || moduleKey === 'extracts') && field === 'actor') {
        return this.formatActor(item)
      }
      if (value === null || value === undefined) return '-'
      if (typeof value === 'object') {
        if (value.name) return value.name
        if (value.email) return value.email
        return JSON.stringify(value)
      }
      if (moduleKey === 'payments') {
        if (field === 'accountType') {
          return this.formatPaymentModule(value)
        }
        if (field === 'paymentMethod') {
          return this.formatPaymentMethod(value)
        }
        if (field === 'treasury') {
          return item?.treasuryRef?.name || item?.treasury?.name || value || '-'
        }
      }
      if (moduleKey === 'companyWallet' && field === 'type') {
        return this.formatTreasuryType(value)
      }
      if (field.includes('date') || field.includes('Date') || field.includes('At')) {
        return this.formatDate(value)
      }
      return value
    },
    getNestedValue(obj, path) {
      return path.split('.').reduce((o, p) => o && o[p], obj)
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'

      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr

      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)
    },
    moduleIcon(moduleKey) {
      const icons = {
        exports: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>`,
        locations: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
        contractors: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
        crushers: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
        transports: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2m0 0V5a2 2 0 012-2h8a2 2 0 012 2v2m-12 0h4"/></svg>`,
        rentals: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        payments: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.75V7.5a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 7.5v9A2.25 2.25 0 005.25 18.75h7.5M15 19.5l3-3 3 3M18 16.5V21"/></svg>`,
        extracts: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
        vehicles: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1a4 4 0 01-4-4V6a4 4 0 014-4h6a4 4 0 014 4v6a4 4 0 01-4 4h-1"/></svg>`,
        companyWallet: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z"/></svg>`,
        expenses: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>`,
        // [COMMENTED OUT] Branch offices icon (building)
        // branches: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
        // [COMMENTED OUT] Petroleum Materials icon (lightning bolt — fuel/energy)
        // petroleumSupplies: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
      }
      return icons[moduleKey] || `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`
    }
  },
  mounted() {
    // Optional: load today on mount
    // this.loadChanges()
  }
}
</script>

<style scoped>
.direction-rtl {
  direction: rtl;
}
</style>

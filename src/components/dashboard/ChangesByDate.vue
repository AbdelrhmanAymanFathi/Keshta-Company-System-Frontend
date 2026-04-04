<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">{{ $t('changes.title') }}</h1>
      <p class="text-gray-600">{{ $t('changes.description') }}</p>
    </div>

    <!-- Date Selector -->
    <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('changes.selectDate') }}
          </label>
          <input v-model="selectedDate" type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            @change="loadChanges" />
        </div>
        <button @click="loadChanges" :disabled="loading || !selectedDate"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {{ $t('changes.loadChanges') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
          class="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
          :class="{ 'ring-2 ring-indigo-500': activeModule === key }" @click="activeModule = key">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ $t(`changes.modules.${key}`) }}</p>
              <p class="text-2xl font-semibold text-gray-900 mt-1">
                {{ module.count || 0 }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center"
              :class="module.count > 0 ? 'bg-indigo-100' : 'bg-gray-100'">
              <div v-html="moduleIcon(key)" class="w-7 h-7"
                :class="module.count > 0 ? 'text-indigo-600' : 'text-gray-400'"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed View -->
      <div v-if="activeModule && changes[activeModule]?.items?.length > 0"
        class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ $t(`changes.modules.${activeModule}`) }} - {{ $t('changes.changesFor') }} {{ formatDate(selectedDate) }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ $t('changes.totalChanges') }}: {{ changes[activeModule].count }}
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="header in getHeadersForModule(activeModule)" :key="header"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  :class="isRTL ? 'text-right' : 'text-left'">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, idx) in changes[activeModule].items" :key="item.id || idx" class="hover:bg-gray-50">
                <td v-for="field in getFieldsForModule(activeModule)" :key="field"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatField(item, field) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Changes Message -->
      <div v-else-if="selectedDate && !loading" class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
          </path>
        </svg>
        <p class="text-gray-600 text-lg">{{ $t('changes.noChanges') }}</p>
        <p class="text-gray-500 text-sm mt-2">{{ $t('changes.noChangesDesc') }}</p>
      </div>
    </div>

    <!-- Initial State -->
    <div v-else class="bg-white rounded-lg shadow-sm border p-8 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p class="text-gray-600 text-lg">{{ $t('changes.selectDatePrompt') }}</p>
      <p class="text-gray-500 text-sm mt-2">{{ $t('changes.selectDateDesc') }}</p>
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
  getExpensesChanges,
  getVehiclesChanges,
  getCompanyWalletTransactionsChanges
} from '@/api'

export default {
  name: 'ChangesByDate',
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  data() {
    return {
      selectedDate: new Date().toISOString().split('T')[0],
      loading: false,
      error: null,
      activeModule: null,
      changes: {
        exports: { count: 0, items: [] },
        locations: { count: 0, items: [] },
        contractors: { count: 0, items: [] },
        crushers: { count: 0, items: [] },
        transports: { count: 0, items: [] },
        rentals: { count: 0, items: [] },
        expenses: { count: 0, items: [] },
        vehicles: { count: 0, items: [] },
        companyWallet: { count: 0, items: [] }
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
      if (!this.selectedDate) return
      this.loading = true
      this.error = null
      this.activeModule = null
      try {
        const dateStr = this.selectedDate
        const promises = [
          this.loadModuleChanges('exports', () => getExportsChanges(dateStr)),
          this.loadModuleChanges('locations', () => getLocationsChanges(dateStr)),
          this.loadModuleChanges('contractors', () => getContractorsChanges(dateStr)),
          this.loadModuleChanges('crushers', () => getCrushersChanges(dateStr)),
          this.loadModuleChanges('transports', () => getTransportsChanges(dateStr)),
          this.loadModuleChanges('rentals', () => getEquipmentLogsChanges(dateStr)),
          this.loadModuleChanges('expenses', () => getExpensesChanges(dateStr)),
          this.loadModuleChanges('vehicles', () => getVehiclesChanges(dateStr)),
          this.loadModuleChanges('companyWallet', () => getCompanyWalletTransactionsChanges(dateStr))
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
    getHeadersForModule(moduleKey) {
      const configs = {
        exports: ['ID', 'Date', 'Contractor', 'Crusher', 'Location', 'Vehicle', 'Created By'],
        locations: ['ID', 'Name', 'Parent', 'Created By'],
        contractors: ['ID', 'Name', 'Phone', 'Bank', 'Account', 'Created By'],
        crushers: ['ID', 'Name', 'Created By'],
        transports: ['ID', 'Date', 'Contractor', 'From', 'To', 'Trips', 'Total', 'Created By'],
        rentals: ['ID', 'Date', 'Equipment', 'Name', 'Hours', 'Total', 'Created By'],
        expenses: ['ID', 'Date', 'Category', 'Description', 'Amount', 'Branch', 'Location', 'Created By'],
        vehicles: ['ID', 'Name', 'Contractor', 'Company Capacity', 'Crusher Capacity', 'Created By'],
        companyWallet: ['ID', 'Date', 'Type', 'Amount', 'Description', 'Created By']
      }
      return configs[moduleKey] || []
    },
    getFieldsForModule(moduleKey) {
      const configs = {
        exports: ['id', 'date', 'contractor.name', 'crusher.name', 'location.name', 'vehicle.name', 'createdBy.name'],
        locations: ['id', 'name', 'parentId', 'createdBy.name'],
        contractors: ['id', 'name', 'phone', 'bankName', 'accountNumber', 'createdBy.name'],
        crushers: ['id', 'name', 'createdBy.name'],
        transports: ['id', 'date', 'contractor.name', 'fromLoc', 'toLoc', 'numTrips', 'total', 'createdBy.name'],
        rentals: ['id', 'date', 'equipment', 'name', 'hours', 'total', 'createdBy.name'],
        expenses: ['id', 'date', 'category', 'description', 'amount', 'branch.name', 'location.name', 'createdBy.name'],
        vehicles: ['id', 'name', 'contractor.name', 'companyCapacity', 'crusherCapacity', 'createdBy.name'],
        companyWallet: ['id', 'date', 'type', 'amount', 'description', 'createdBy.name']
      }
      return configs[moduleKey] || []
    },
    formatField(item, field) {
      const value = this.getNestedValue(item, field)
      if (value === null || value === undefined) return '-'
      if (typeof value === 'object') {
        if (value.name) return value.name
        if (value.email) return value.email
        return JSON.stringify(value)
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
        expenses: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        vehicles: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1a4 4 0 01-4-4V6a4 4 0 014-4h6a4 4 0 014 4v6a4 4 0 01-4 4h-1"/></svg>`,
        companyWallet: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z"/></svg>`
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
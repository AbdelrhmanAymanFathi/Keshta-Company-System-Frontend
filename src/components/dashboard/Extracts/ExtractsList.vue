<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold">{{ $t('dashboard.extractsList') || 'Extracts' }}</h2>
      <ExtractsCreationModal :showTriggerButton="true" :triggerButtonText="$t('dashboard.newExtract') + ' +'" @saved="onExtractSaved"/>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4 mb-6">
      <h4 class="text-sm font-semibold text-gray-700">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
          <DateField v-model="filters.startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
          <DateField v-model="filters.endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.contractor') }}</label>
          <SearchDropdown
            v-model="filters.contractorSearch"
            :items="contractors"
            :allItems="contractors"
            :placeholder="$t('placeholders.searchContractor')"
            @select="(sel) => { filters.contractorId = sel.id; filters.contractorSearch = sel.name }"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.location') }}</label>
          <SearchDropdown
            v-model="filters.locationSearch"
            :items="locations"
            :allItems="locations"
            :placeholder="$t('placeholders.searchLocation')"
            @select="(sel) => selectLocation(sel)"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.area') }}</label>
          <SearchDropdown
            v-model="filters.areaSearch"
            :items="availableAreas"
            :allItems="availableAreas"
            :placeholder="$t('placeholders.searchArea')"
            @select="(sel) => selectArea(sel)"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.item') }}</label>
          <SearchDropdown
            v-model="filters.itemSearch"
            :items="items"
            :allItems="items"
            :placeholder="$t('placeholders.searchItem')"
            @select="(sel) => { filters.itemId = sel.id; filters.itemSearch = sel.name }"
          />
        </div>

      </div>

      <div class="flex gap-2">
        <button @click="page = 1; loadExtracts()" :disabled="loading"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium">
          {{ $t('labels.search') }}</button>
        <button @click="clearFilters"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm font-medium">{{ $t('labels.clear') }}</button>
      </div>
    </div>

    <!-- table -->
    <div class="overflow-auto bg-white rounded shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-indigo-50">
          <tr>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.dateFrom') || 'Date From' }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.dateTo') || 'Date To' }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.item') }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.quantity') }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.price') }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.discount') || 'Discount' }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.contractor') }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.location') }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.area') }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.total') }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.notes') }}</th>
            <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(extract, idx) in extracts" :key="extract.rowKey || `extract-${extract.id}`" class="hover:bg-gray-50">
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-indigo-800 uppercase tracking-wider whitespace-nowrap">{{ formatDate(extract.dateFrom || extract.date) }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-indigo-800 uppercase tracking-wider whitespace-nowrap">{{ formatDate(extract.dateTo || extract.date) }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">
              {{ formatItemWithUnit(extract.item) || extract.itemName || '-' }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ extract.itemQuantity !== null && extract.itemQuantity !== undefined ? extract.itemQuantity : '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ extract.itemPrice !== null && extract.itemPrice !== undefined ? formatCurrency(extract.itemPrice) : '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-red-600 uppercase tracking-wider whitespace-nowrap">{{ extract.itemDiscount !== null && extract.itemDiscount !== undefined ? formatCurrency(extract.itemDiscount) : '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ extract.contractorName || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ extract.locationName || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ extract.areaName || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ formatCurrency(extract.total) }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 tracking-wider">
              <div class="max-w-xs truncate">{{ extract.notes || extract.note || '-' }}</div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <button @click.stop="openDeleteConfirm(extract)" :title="$t('labels.delete')" class="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">
                <TrashIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <tr v-if="extracts.length === 0">
              <td class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" :colspan="13">
              {{ $t('extracts.noExtractsFound') || 'No extracts found' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-if="totalPages > 1" :currentPage="page" :pageSize="pageSize" :total="total" :totalPages="totalPages"
      :pageSizeOptions="[10,20,50,100]" @update:page="(p) => { page = p; loadExtracts() }" @update:pageSize="(size) => { pageSize = size; page = 1; loadExtracts() }" />

    <!-- Delete Confirm Modal -->
    <div v-if="deleteConfirmModal.show" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold mb-3 text-gray-900">{{ $t('labels.confirmDelete') || 'Confirm Delete' }}</h3>
        <p class="text-gray-600 mb-6">{{ $t('extracts.confirmDelete') || 'Are you sure you want to delete this extract?' }}</p>
        <div class="flex justify-end gap-3">
          <button @click="closeDeleteConfirm" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{{ $t('labels.cancel') }}</button>
          <button @click="handleDelete(deleteConfirmModal.id)" :disabled="deleting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">{{ deleting ? ($t('labels.deleting') || 'Deleting...') : ($t('labels.delete') || 'Delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getExtracts } from '@/services/extracts'
import { getContractors, getLocations, getExportItems } from '../../../api'
import normalizeItem from '@/utils/normalizeItem'
import ExtractsCreationModal from './ExtractsCreationModal.vue'
import Pagination from '../../shared/Pagination.vue'
import SearchDropdown from '../../shared/SearchDropdown.vue'
import { buildQueryParams } from '../../../utils/buildQueryParams'
import { TrashIcon } from '@heroicons/vue/24/outline'
import DateField from '../../shared/DateField.vue'

export default {
  name: 'ExtractsList',
  components: { ExtractsCreationModal, Pagination, SearchDropdown, TrashIcon, DateField },
  data() {
    return {
      extracts: [],
      page: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      contractors: [],
      locations: [],
      items: [],
      deleting: false,
      deleteConfirmModal: { show: false, id: null },
      filters: {
        startDate: '',
        endDate: '',
        contractorId: '',
        contractorSearch: '',
        locationId: '',
        locationSearch: '',
        areaId: '',
        areaSearch: '',
        itemId: '',
        itemSearch: ''
      }
    }
  },
  computed: {
    totalPages() { return Math.ceil(this.total / this.pageSize) },
    isRTL() { return this.$i18n?.locale === 'ar' },
    availableAreas() {
      if (!this.filters.locationId) return []
      const selected = this.locations.find(l => l.id === this.filters.locationId)
      if (selected && Array.isArray(selected.children) && selected.children.length) return selected.children
      return this.locations.filter(l => l.parentId === this.filters.locationId)
    }
  },
  async mounted() {
    await this.loadFilterData()
    await this.loadExtracts()
    document.addEventListener('click', this.closeContextMenu)
  },
  beforeUnmount() { document.removeEventListener('click', this.closeContextMenu) },
  methods: {
    normalizeExtractForList(extract) {
      const lines = Array.isArray(extract?.lines) ? extract.lines : []

      if (!lines.length) {
        return [{
          ...extract,
          rowKey: `extract-${extract.id}`,
          item: null,
          itemName: '-',
          itemQuantity: null,
          itemPrice: null,
          contractorName: extract?.contractor?.name || '-',
          locationName: extract?.location?.name || '-',
          areaName: extract?.area?.name || '-',
          total: extract?.total !== undefined && extract?.total !== null ? Number(extract.total) : extract?.total,
          extractTotal: extract?.total
        }]
      }

      return lines.map((line) => {
        const normalizedItem = normalizeItem(line?.item || null)

        return {
          ...extract,
          line,
          rowKey: `extract-${extract.id}-line-${line.id}`,
          item: normalizedItem,
          itemName: normalizedItem?.name || line?.itemName || '-',
          itemQuantity: line?.quantity !== undefined && line?.quantity !== null ? Number(line.quantity) : null,
          itemPrice: line?.price !== undefined && line?.price !== null ? Number(line.price) : null,
          itemDiscount: line?.discount !== undefined && line?.discount !== null ? Number(line.discount) : null,
          contractorName: extract?.contractor?.name || '-',
          locationName: extract?.location?.name || '-',
          areaName: extract?.area?.name || '-',
          total: line?.total !== undefined && line?.total !== null ? Number(line.total) : null,
          extractTotal: extract?.total
        }
      })
    },
    async loadFilterData() {
      try {
        const contractorsRes = await getContractors({ pageSize: 1000, mode: 'extract' })
        const payload = contractorsRes.data || {}
        const contractorsData = Array.isArray(payload.items) ? payload.items
          : Array.isArray(payload.data) ? payload.data
          : Array.isArray(payload) ? payload : []
        this.contractors = contractorsData

        const locationsRes = await getLocations()
        const locationsData = locationsRes.data?.data || locationsRes.data || []
        this.locations = Array.isArray(locationsData) ? locationsData : []

        const itemsRes = await getExportItems({ mode: 'extracts' })
        const itemsData = itemsRes.data?.items || itemsRes.data?.data || itemsRes.data || []
        this.items = Array.isArray(itemsData) ? itemsData.map(normalizeItem) : []
      } catch (err) {
        console.error('Error loading filter data:', err)
      }
    },

    clearFilters() {
      this.filters = {
        startDate: '', endDate: '', contractorId: '', contractorSearch: '', locationId: '', locationSearch: '', areaId: '', areaSearch: '', itemId: '', itemSearch: ''
      }
      this.page = 1
      this.loadExtracts()
    },

    async loadExtracts() {
      try {
        this.loading = true
        const queryParams = {
          page: this.page,
          pageSize: this.pageSize,
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
          contractorId: this.filters.contractorId,
          locationId: this.filters.locationId,
          areaId: this.filters.areaId,
          itemId: this.filters.itemId
        }
        const cleanParams = buildQueryParams(queryParams)
        const res = await getExtracts(cleanParams)
        const responseData = res.data
        if (responseData && responseData.items && Array.isArray(responseData.items)) {
          this.extracts = responseData.items.flatMap(this.normalizeExtractForList)
          this.total = responseData.meta?.total || responseData.total || this.extracts.length
          this.pageSize = responseData.meta?.pageSize || responseData.pageSize || this.pageSize
        } else if (Array.isArray(res.data)) {
          this.extracts = res.data.flatMap(this.normalizeExtractForList)
          this.total = res.data.length
        } else {
          this.extracts = []
          this.total = 0
        }
      } catch (e) {
        console.error('Error loading extracts:', e)
        this.extracts = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    onExtractSaved() {
      this.page = 1
      this.loadExtracts()
    },

    selectLocation(location) {
      this.filters.locationId = location.id
      this.filters.locationSearch = location.name
      this.filters.areaId = ''
      this.filters.areaSearch = ''
    },
    selectArea(area) {
      this.filters.areaId = area.id
      this.filters.areaSearch = area.name
    },

    openDeleteConfirm(item) {
      this.deleteConfirmModal = { show: true, id: item.id }
    },
    closeDeleteConfirm() { this.deleteConfirmModal = { show: false, id: null } },
    async handleDelete(id) {
      this.deleting = true
      try {
        // backend delete endpoint not implemented in services; attempt to call generic API
        await fetch(`/api/extracts/${id}`, { method: 'DELETE', credentials: 'include' })
        await this.loadExtracts()
        this.closeDeleteConfirm()
      } catch (e) {
        console.error('Failed to delete extract', e)
        alert(this.$t('common.deleteError') || 'Failed to delete')
      } finally {
        this.deleting = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      try { return new Intl.DateTimeFormat('en-GB').format(new Date(dateString)) } catch (e) { return dateString }
    },

    // formatNumber(v) { return Number(v).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }) },
    formatCurrency(v) {
      if (v === undefined || v === null || v === '') return '-'
      const n = Number(v)
      if (Number.isNaN(n)) return v
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(n)
    },

    formatItemWithUnit(item) {
      if (!item) return ''
      const name = item?.name || ''
      const unitName = item?.unit?.name || item?.unitName || item?.unit_name || ''
      if (!name && !unitName) return ''
      if (!unitName) return name
      if (!name) return unitName
      return `${name} (${unitName})`
    },

    onRowContextMenu() {
      // placeholder for context menu
    },

    closeContextMenu() { /* no-op for now */ }
  }
}
</script>

<style scoped>
.clickable-row { cursor: pointer }
</style>

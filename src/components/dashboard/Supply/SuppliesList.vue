<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6">
    <div class="app-page-header flex items-center justify-between rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold">{{ $t('dashboard.suppliesList') }}</h2>

      <TableModal :showTriggerButton="true" :triggerButtonText="$t('dashboard.newSupply') + ' +'" @saved="onSupplySaved"/>
    </div>

    <!-- Filters Section -->
    <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-5 space-y-4 shadow-lg shadow-slate-200/40">
      <h4 class="text-sm font-semibold text-gray-700">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
          <DateField v-model="filters.startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
          <DateField v-model="filters.endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>

        

        <!-- Contractor -->
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

        <!-- Location -->
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

        <!-- Area -->
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

        <!-- Crusher -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.crusher') }}</label>
          <SearchDropdown
            v-model="filters.crusherSearch"
            :items="crushers"
            :allItems="crushers"
            :placeholder="$t('placeholders.searchCrusher')"
            @select="(sel) => { filters.crusherId = sel.id; filters.crusherSearch = sel.name }"
          />
        </div>

        <!-- Item -->
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

        <!-- Vehicle -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.vehicle') }}</label>
          <SearchDropdown
            v-model="filters.vehicleSearch"
            :items="vehicles"
            :allItems="vehicles"
            :placeholder="$t('placeholders.searchVehicle')"
            :itemLabel="(v) => v.plateNumber || v.name"
            @select="(sel) => { filters.vehicleId = sel.id; filters.vehicleSearch = sel.plateNumber || sel.name }"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="page = 1; loadSupplies()" :disabled="loading"
          class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-sky-500 text-white rounded-xl transition-colors disabled:opacity-50 text-sm font-medium shadow-sm shadow-indigo-200">
          {{ $t('labels.search') }}
        </button>
        <button @click="clearFilters"
          class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-colors text-sm font-medium">
          {{ $t('labels.clear') }}
        </button>
      </div>
    </div>

    <!-- table -->
    <div class="overflow-auto rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gradient-to-r from-slate-50 to-indigo-50">
          <tr>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              #</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.date') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.item') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.contractor') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.crusher') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.location') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.area') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.vehicle') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.crusherTicket') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.companyTicket') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.companyCapacity') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.crusherCapacity') }}</th>
            <th
              class="px-6 py-3 min-w-[160px] text-start text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.unitPrice') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.discount') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.total') }}</th>

            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.notes') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="supplies.length > 0" style="display: none;"></tr>
          <tr v-for="(supply, idx) in supplies" :key="`supply-${supply.id}`" class="hover:bg-indigo-50/40" @contextmenu.prevent="onRowContextMenu($event, supply)">
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-indigo-800 uppercase tracking-wider whitespace-nowrap">{{ formatDate(supply.date) }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.item?.name || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ supply.contractor?.name || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.crusher?.name || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ supply.location?.name || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ getAreaName(supply) }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.vehicle?.name || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ supply.crusherTicket || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.companyTicket || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ supply.companyCapacity ?? '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.crusherCapacity ?? '-' }}</td>
            <td class="px-6 py-3 min-w-[160px] text-start text-sm font-semibold text-indigo-900 whitespace-nowrap">{{ formatCurrency(computeUnitPrice(supply)) }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-red-600 uppercase tracking-wider whitespace-nowrap">{{ supply.discount ?? '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">{{ formatCurrency(supply.total) }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 tracking-wider">
              <div class="max-w-xs truncate">{{ supply.notes || '-' }}</div>
            </td>

            <td class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <button
                @click.stop="openDeleteConfirm(supply)"
                :title="$t('labels.delete')"
                class="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 shadow-sm shadow-red-100/70 transition-all hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-md"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <tr v-if="supplies.length === 0">
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" :colspan="17">
              {{ $t('supply.noExportsFound') || 'No exports found' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment Modal removed -->
    <!--
    <PaymentModal :visible="showPaymentModal" :parentType="paymentTarget.type" :parentId="paymentTarget.id"
      @saved="handlePaymentSaved" @close="() => { showPaymentModal = false }" />
    -->

    <!-- Supply detail modal removed -->
    <!--
    <SupplyDetailModal :visible="showDetailModal" :exportId="detailExportId" @close="() => { showDetailModal = false; detailExportId = null }" />
    -->


    <Pagination v-if="totalPages > 1" :currentPage="page" :pageSize="pageSize" :total="total" :totalPages="totalPages"
      :pageSizeOptions="[10, 20, 50, 100]" @update:page="(p) => { page = p; loadSupplies() }"
      @update:pageSize="(size) => { pageSize = size; page = 1; loadSupplies() }" />

    <!-- Context menu for row actions -->
    <div v-if="contextMenu.visible" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="absolute z-50 bg-white border rounded shadow-md" @click.stop>
      <ul class="p-2">
        <li>
          <button @click="openDeleteConfirm(contextMenu.item)"
            class="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm text-red-600">{{ $t('labels.delete') }}</button>
        </li>
      </ul>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteConfirmModal.show" class="fixed inset-0 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold mb-3 text-gray-900">{{ $t('labels.confirmDelete') || 'Confirm Delete' }}</h3>
        <p class="text-gray-600 mb-6">{{ $t('supply.confirmDeleteExport') || 'Are you sure you want to delete this export?' }}</p>
        <div class="flex justify-end gap-3">
          <button @click="closeDeleteConfirm" class="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50">
            {{ $t('labels.cancel') || 'Cancel' }}
          </button>
          <button @click="handleDelete(deleteConfirmModal.id)" :disabled="deleting" class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? ($t('labels.deleting') || 'Deleting...') : ($t('labels.delete') || 'Delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl p-6 z-10">
        <h3 class="text-lg font-semibold mb-4">{{ $t('dashboard.suppliesList') }} — {{ $t('labels.edit') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <label>
            <div class="text-sm mb-1">{{ $t('labels.site') }}</div>
            <input v-model="form.site" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.area') }}</div>
            <input v-model="form.area" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.date') }}</div>
            <DateField v-model="form.date" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.contractor') }}</div>
            <input v-model="form.contractor" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.total') }}</div>
            <input v-model.number="form.grandTotal" type="number" class="w-full px-3 py-2 border rounded" />
          </label>
          <label class="col-span-2">
            <div class="text-sm mb-1">{{ $t('labels.notes') }}</div>
            <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border rounded"></textarea>
          </label>
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button @click="closeModal" class="px-4 py-2 rounded border">{{ $t('labels.cancel') }}</button>
          <button @click="saveEdit" class="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-sky-500">{{
            $t('labels.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeliveries, deleteDelivery, getContractors, getLocations, getCrushers, getExportItems, getVehicles } from '../../../api'
import normalizeItem from '@/utils/normalizeItem'
import TableModal from './SuppliesCreationModal.vue'
import Pagination from '../../shared/Pagination.vue'
import SearchDropdown from '../../shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
// import PaymentModal from '../../shared/PaymentModal.vue'
// import SupplyDetailModal from '../../shared/SupplyDetailModal.vue'
import { buildQueryParams } from '../../../utils/buildQueryParams'
import { TrashIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'SuppliesList',

  components: {
    TableModal,
    Pagination,
    SearchDropdown,
    TrashIcon,
    DateField
    // PaymentModal,
    // SupplyDetailModal
  },

  data() {
    return {
      supplies: [],
      modalOpen: false,
      form: {},
      page: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        item: null
      },
      contractors: [],
      locations: [],
      crushers: [],
      items: [],
      vehicles: [],
      deleting: false,
      deleteConfirmModal: {
        show: false,
        id: null
      },
      filters: {
        startDate: '',
        endDate: '',
        areaId: '',
        areaSearch: '',
        contractorId: '',
        contractorSearch: '',
        locationId: '',
        locationSearch: '',
        crusherId: '',
        crusherSearch: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: ''
      },
      /* payment modal state commented out
      showPaymentModal: false,
      paymentTarget: { type: null, id: null },
      */
      showDetailModal: false,
      detailExportId: null
    }
  },

  watch: {
    /* payment modal watcher commented out
    showPaymentModal(val) {
      // no-op: placeholder if needed
    }
    */
  },

  computed: {
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
    },
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    availableAreas() {
      if (!this.filters.locationId) return []
      const selected = this.locations.find(l => l.id === this.filters.locationId)
      if (selected && Array.isArray(selected.children) && selected.children.length) {
        return selected.children
      }
      return this.locations.filter(l => l.parentId === this.filters.locationId)
    },
    
  },

  async mounted() {
    await this.loadFilterData()
    await this.loadSupplies()
    // ensure payments modal data is reactive
    /* paymentTarget watcher commented out
    this.$watch(() => this.paymentTarget, (nv) => {}, { deep: true })
    */
    document.addEventListener('click', this.closeContextMenu)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  },

  methods: {
    /**
     * Load filter data from API
     */
    async loadFilterData() {
      try {
        const contractorsRes = await getContractors({ pageSize: 1000, mode: 'supply' })
        const contractorsData = contractorsRes.data?.data || contractorsRes.data || []
        this.contractors = Array.isArray(contractorsData) ? contractorsData : []

        const locationsRes = await getLocations()
        const locationsData = locationsRes.data?.data || locationsRes.data || []
        this.locations = Array.isArray(locationsData) ? locationsData : []

        const crushersRes = await getCrushers({ pageSize: 1000 })
        const crushersData = crushersRes.data?.data || crushersRes.data || []
        this.crushers = Array.isArray(crushersData) ? crushersData : []

        const itemsRes = await getExportItems({ mode: 'supply' })
        const itemsData = itemsRes.data?.items || itemsRes.data?.data || itemsRes.data || []
        this.items = Array.isArray(itemsData) ? itemsData.map(normalizeItem) : []

        const vehiclesRes = await getVehicles({ pageSize: 1000 })
        const vehiclesData = vehiclesRes.data?.data || vehiclesRes.data || []
        this.vehicles = Array.isArray(vehiclesData) ? vehiclesData : []

        console.log('✓ Filter data loaded:', {
          contractors: this.contractors.length,
          locations: this.locations.length,
          crushers: this.crushers.length,
          items: this.items.length,
          vehicles: this.vehicles.length
        })
      } catch (err) {
        console.error('✗ Error loading filter data:', err)
      }
    },

    /**
     * Clear all filters
     */
    clearFilters() {
      this.filters = {
        startDate: '',
        endDate: '',
        areaId: '',
        areaSearch: '',
        contractorId: '',
        contractorSearch: '',
        locationId: '',
        locationSearch: '',
        crusherId: '',
        crusherSearch: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: ''
      }
      this.page = 1
      this.loadSupplies()
    },

    async loadSupplies() {
      try {
        this.loading = true

        const queryParams = {
          page: this.page,
          pageSize: this.pageSize,
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
          areaId: this.filters.areaId,
          contractorId: this.filters.contractorId,
          locationId: this.filters.locationId,
          crusherId: this.filters.crusherId,
          itemId: this.filters.itemId,
          vehicleId: this.filters.vehicleId
        }

        const cleanParams = buildQueryParams(queryParams)
        console.log('🔵 Loading supplies with params:', queryParams)
        console.log('🔵 Clean params sent to API:', cleanParams)
        const res = await getDeliveries(cleanParams)

        console.log('Response received:', res)
        console.log('Response data:', res.data)

        // Extract items from response
        const responseData = res.data
        if (responseData && responseData.items && Array.isArray(responseData.items)) {
          // Explicitly create new array and use splice to trigger reactivity
          const newItems = [...responseData.items]
          console.log('📊 New items to load:', newItems)
          console.log('📊 First 3 items:', newItems.slice(0, 3))
          console.log('📊 First item details:', {
            id: newItems[0]?.id,
            date: newItems[0]?.date,
            item: newItems[0]?.item?.name,
            contractor: newItems[0]?.contractor?.name
          })

          // Log comparison with old items
          console.log('🔄 Old supplies count:', this.supplies.length)
          console.log('🔄 New supplies count:', newItems.length)
          if (this.supplies.length > 0) {
            console.log('🔄 Old first item ID:', this.supplies[0].id)
            console.log('🔄 New first item ID:', newItems[0]?.id)
          }

          // Normalize nested `item` objects so templates can rely on canonical fields
          newItems.forEach(s => { if (s && s.item) s.item = normalizeItem(s.item) })
          // In Vue 3, directly assign the array
          this.supplies = newItems

          this.total = responseData.total || newItems.length
          this.pageSize = responseData.pageSize || this.pageSize

          console.log('✓ Supplies updated:', this.supplies.length, 'items')
          console.log('✓ Supplies array is now:', this.supplies)
          console.log('✓ Component supplies data:', this.$data.supplies)
        } else {
          console.warn('⚠ Unexpected response format:', responseData)
          this.supplies = []
          this.total = 0
        }
      } catch (e) {
        console.error('✗ Error loading supplies:', e)
        this.supplies = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async onSupplySaved() {
      console.log('SUPPLY SAVED EVENT FIRED')
      this.page = 1
      await this.loadSupplies()
    },

    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.loadSupplies()
      }
    },

    onPageSizeChange() {
      this.page = 1
      this.loadSupplies()
    },

    formatNumber(v) {
      return Number(v).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })
    },

    formatCurrency(v) {
      if (v === undefined || v === null || v === '') return '-'
      const n = Number(v)
      if (Number.isNaN(n)) return v
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(n)
    },

    selectLocation(location) {
      this.filters.locationId = location.id
      this.filters.locationSearch = location.name
      this.filters.showLocationDropdown = false
      this.filters.areaId = ''
      this.filters.areaSearch = ''
    },

    selectArea(area) {
      this.filters.areaId = area.id
      this.filters.areaSearch = area.name
      this.filters.showAreaDropdown = false
    },

    getAreaName(supply) {
      if (supply?.area?.name) return supply.area.name
      if (typeof supply?.area === 'string') return supply.area
      const areaId = supply?.areaId || supply?.area?.id
      if (areaId && Array.isArray(supply?.location?.children)) {
        const match = supply.location.children.find(a => a.id === areaId)
        if (match?.name) return match.name
      }
      return '-'
    },

formatDate(dateString) {
  if (!dateString) return '-'
  try {
    return new Intl.DateTimeFormat('en-GB').format(new Date(dateString))
  } catch (e) {
    return dateString
  }
},

    calculateTotal(supply) {
      // Sum totals from exportLines when available, otherwise fallback to top-level fields
      try {
        if (supply && Array.isArray(supply.exportLines) && supply.exportLines.length) {
          return supply.exportLines.reduce((acc, l) => acc + (parseFloat(l.total || 0) || 0), 0)
        }
        const capacity = parseFloat(supply.companyCapacity || supply.crusherCapacity || 0)
        const unitPrice = parseFloat(supply.unitPrice || supply.item?.defaultSupplyPrice || supply.item?.defaultExportPrice || 0)
        const discount = parseFloat(supply.discount || 0)
        return (capacity * unitPrice) - discount
      } catch (e) {
        return 0
      }
    },

    openEdit(supply) {
      this.form = { ...supply }
      this.modalOpen = true
    },

    closeModal() {
      this.modalOpen = false
    },

    onRowContextMenu(e, item) {
      this.contextMenu.visible = true
      // position relative to viewport
      this.contextMenu.x = e.clientX
      this.contextMenu.y = e.clientY
      // normalize: if an entry with { supply, line } was passed, store the supply object for actions
      this.contextMenu.item = (item && item.supply) ? item.supply : item
    },

    openDetail(id) {
      this.detailExportId = id
      this.showDetailModal = true
    },

    openDeleteConfirm(item) {
      this.deleteConfirmModal = {
        show: true,
        id: item.id
      }
    },

    closeDeleteConfirm() {
      this.deleteConfirmModal = {
        show: false,
        id: null
      }
    },

    confirmDelete(item) {
      const confirmed = confirm(this.$t('supply.confirmDeleteExport') || 'Delete this export?')
      if (confirmed) {
        this.handleDelete(item.id)
      }
    },

    async handleDelete(id) {
      this.deleting = true
      try {
        await deleteDelivery(id)
        // backend may return 204; just reload
        await this.loadSupplies()
        this.closeDeleteConfirm()
      } catch (e) {
        console.error('Failed to delete export', e)
        alert(this.$t('common.deleteError') || 'Failed to delete')
      } finally {
        this.deleting = false
      }
    },

    computeUnitPrice(supply) {
      const p = (supply && (supply.unitPrice !== undefined && supply.unitPrice !== null)) ? Number(supply.unitPrice)
        : (supply?.item?.defaultSupplyPrice !== undefined ? Number(supply.item.defaultSupplyPrice) : (supply?.item?.defaultExportPrice !== undefined ? Number(supply.item.defaultExportPrice) : NaN))
      return Number.isNaN(p) ? 0 : p
    },

    /* payment methods commented out
    openPaymentModal(type, id) {
      this.paymentTarget = { type, id }
      this.showPaymentModal = true
    },
    async handlePaymentSaved(payment) {
      this.showPaymentModal = false
      await this.loadSupplies()
      this.$toast?.success(this.$t('labels.paymentSaved') || 'Payment saved')
    },
    */

    /**
     * Saves the edited supply and closes the modal.
     * If the edited supply already exists in the list, it will be updated.
     * Otherwise, a new supply will be added.
     * TODO: Call the API to save the changes in the backend.
     */
    async saveEdit() {
      const idx = this.supplies.findIndex(s => s.id === this.form.id)
      if (idx !== -1) {
        this.supplies[idx] = { ...this.form }
      }
      this.modalOpen = false
    }
  }
}
</script>

<style scoped>
.clickable-row { cursor: pointer; }
</style>

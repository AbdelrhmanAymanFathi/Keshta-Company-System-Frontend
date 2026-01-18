<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold">{{ $t('dashboard.suppliesList') }}</h2>

      <!-- button open modal from shared -->
      <TableModal :showTriggerButton="true" :triggerButtonText="$t('dashboard.newSupply') + ' +'"
        :modalTitle="$t('dashboard.newSupply')" @saved="onSupplySaved" />
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4 mb-6">
      <h4 class="text-sm font-semibold text-gray-700">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <!-- Contractor -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.contractor') }}</label>
          <div class="relative">
            <input
              v-model="filters.contractorSearch"
              @focus="filters.showContractorDropdown = true"
              @blur="closeDropdownDelayed('showContractorDropdown')"
              type="text"
              placeholder="ابحث عن مقاول..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <div v-if="filters.showContractorDropdown && filteredContractors.length" class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div
                v-for="contractor in filteredContractors"
                :key="contractor.id"
                @click="filters.contractorId = contractor.id; filters.contractorSearch = contractor.name; filters.showContractorDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              >
                {{ contractor.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.location') }}</label>
          <div class="relative">
            <input
              v-model="filters.locationSearch"
              @focus="filters.showLocationDropdown = true"
              @blur="closeDropdownDelayed('showLocationDropdown')"
              type="text"
              placeholder="ابحث عن موقع..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <div v-if="filters.showLocationDropdown && filteredLocations.length" class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div
                v-for="location in filteredLocations"
                :key="location.id"
                @click="filters.locationId = location.id; filters.locationSearch = location.name; filters.showLocationDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              >
                {{ location.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Crusher -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.crusher') }}</label>
          <div class="relative">
            <input
              v-model="filters.crusherSearch"
              @focus="filters.showCrusherDropdown = true"
              @blur="closeDropdownDelayed('showCrusherDropdown')"
              type="text"
              placeholder="ابحث عن كسارة..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <div v-if="filters.showCrusherDropdown && filteredCrushers.length" class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div
                v-for="crusher in filteredCrushers"
                :key="crusher.id"
                @click="filters.crusherId = crusher.id; filters.crusherSearch = crusher.name; filters.showCrusherDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              >
                {{ crusher.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Item -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.item') }}</label>
          <div class="relative">
            <input
              v-model="filters.itemSearch"
              @focus="filters.showItemDropdown = true"
              @blur="closeDropdownDelayed('showItemDropdown')"
              type="text"
              placeholder="ابحث عن صنف..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <div v-if="filters.showItemDropdown && filteredItems.length" class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                @click="filters.itemId = item.id; filters.itemSearch = item.name; filters.showItemDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Vehicle -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.vehicle') }}</label>
          <div class="relative">
            <input
              v-model="filters.vehicleSearch"
              @focus="filters.showVehicleDropdown = true"
              @blur="closeDropdownDelayed('showVehicleDropdown')"
              type="text"
              placeholder="ابحث عن سيارة..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <div v-if="filters.showVehicleDropdown && filteredVehicles.length" class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div
                v-for="vehicle in filteredVehicles"
                :key="vehicle.id"
                @click="filters.vehicleId = vehicle.id; filters.vehicleSearch = vehicle.plateNumber || vehicle.name; filters.showVehicleDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              >
                {{ vehicle.plateNumber || vehicle.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="loadSupplies"
          :disabled="loading"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {{ $t('labels.search') }}
        </button>
        <button
          @click="clearFilters"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm font-medium"
        >
          {{ $t('labels.clear') }}
        </button>
      </div>
    </div>

    <!-- table -->
    <div class="overflow-auto bg-white rounded shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-indigo-50">
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
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.unitPrice') }}</th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.discount') }}</th>
            <!-- <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.notes') }}</th> -->
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, idx) in supplies" :key="s.id" class="hover:bg-gray-50"
            @contextmenu.prevent="onRowContextMenu($event, s)">
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">
              {{ (page - 1) * pageSize + idx + 1 }}</td>
            <td
              class="px-6 py-3 text-start text-xs font-medium text-indigo-800 uppercase tracking-wider whitespace-nowrap">
              {{ formatDate(s.date) }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">
              {{ s.item?.name || '-' }}</td>
            <td
              class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ s.contractor?.name || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">
              {{ s.crusher?.name || '-' }}</td>
            <td
              class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ s.location?.name || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">
              {{ s.vehicle?.name || '-' }}</td>
            <td
              class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ s.crusherTicket || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">
              {{ s.companyTicket || '-' }}</td>
            <td
              class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ s.companyCapacity || '-' }}</td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">
              {{ s.crusherCapacity || '-' }}</td>
            <td
              class="px-6 py-3 text-start text-xs font-medium text-indigo-800 uppercase tracking-wider whitespace-nowrap">
              {{ s.unitPrice || '-' }}</td>
            <td
              class="px-6 py-3 text-start text-xs font-medium text-red-600 uppercase tracking-wider whitespace-nowrap">
              {{ s.discount || '-' }}</td>
            <!-- <td class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ s.notes || '-' }}</td> -->
            <td
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <button @click="confirmDelete(s)" class="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">
                {{ $t('labels.delete') }}
              </button>
            </td>
          </tr>
          <tr v-if="supplies.length === 0">
            <td
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              :colspan="15">
              {{ $t('supply.noExportsFound') || 'No exports found' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-if="totalPages > 1" :currentPage="page" :pageSize="pageSize" :total="total" :totalPages="totalPages"
      :pageSizeOptions="[10, 20, 50, 100]" @update:page="(p) => { page = p; loadSupplies() }"
      @update:pageSize="(size) => { pageSize = size; page = 1; loadSupplies() }" />

    <!-- Context menu for row actions -->
    <div v-if="contextMenu.visible" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="absolute z-50 bg-white border rounded shadow-md" @click.stop>
      <ul class="p-2">
        <li>
          <button @click="confirmDelete(contextMenu.item)"
            class="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm text-red-600">{{ $t('labels.delete') }}</button>
        </li>
      </ul>
    </div>

    <!-- Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
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
            <input v-model="form.date" type="date" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.contractor') }}</div>
            <input v-model="form.contractor" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.total') }}</div>
            <input v-model.number="form.grandTotal" type="number" class="w-full px-3 py-2 border rounded" />
          </label>
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button @click="closeModal" class="px-4 py-2 rounded border">{{ $t('labels.cancel') }}</button>
          <button @click="saveEdit" class="px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700">{{
            $t('labels.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeliveries, deleteDelivery, getContractors, getLocations, getCrushers, getExportItems, getVehicles } from '../../api'
import TableModal from '../shared/TableModal.vue'
import Pagination from '../shared/Pagination.vue'
import { buildQueryParams } from '../../utils/buildQueryParams'

export default {
  name: 'SuppliesList',

  components: {
    TableModal,
    Pagination
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
      filters: {
        startDate: '',
        endDate: '',
        contractorId: '',
        contractorSearch: '',
        locationId: '',
        locationSearch: '',
        crusherId: '',
        crusherSearch: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: '',
        showContractorDropdown: false,
        showLocationDropdown: false,
        showCrusherDropdown: false,
        showItemDropdown: false,
        showVehicleDropdown: false
      }
    }
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
    filteredContractors() {
      if (!this.filters.showContractorDropdown) return []
      if (!this.filters.contractorSearch) return this.contractors
      return this.contractors.filter(c =>
        c.name.toLowerCase().includes(this.filters.contractorSearch.toLowerCase())
      )
    },
    filteredLocations() {
      if (!this.filters.showLocationDropdown) return []
      if (!this.filters.locationSearch) return this.locations
      return this.locations.filter(l =>
        l.name.toLowerCase().includes(this.filters.locationSearch.toLowerCase())
      )
    },
    filteredCrushers() {
      if (!this.filters.showCrusherDropdown) return []
      if (!this.filters.crusherSearch) return this.crushers
      return this.crushers.filter(c =>
        c.name.toLowerCase().includes(this.filters.crusherSearch.toLowerCase())
      )
    },
    filteredItems() {
      if (!this.filters.showItemDropdown) return []
      if (!this.filters.itemSearch) return this.items
      return this.items.filter(i =>
        i.name.toLowerCase().includes(this.filters.itemSearch.toLowerCase())
      )
    },
    filteredVehicles() {
      if (!this.filters.showVehicleDropdown) return []
      if (!this.filters.vehicleSearch) return this.vehicles
      return this.vehicles.filter(v => {
        const displayName = v.plateNumber || v.name
        return displayName.toLowerCase().includes(this.filters.vehicleSearch.toLowerCase())
      })
    }
  },

  async mounted() {
    await this.loadFilterData()
    await this.loadSupplies()
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
        const contractorsRes = await getContractors({ pageSize: 1000 })
        const contractorsData = contractorsRes.data?.data || contractorsRes.data || []
        this.contractors = Array.isArray(contractorsData) ? contractorsData : []

        const locationsRes = await getLocations()
        const locationsData = locationsRes.data?.data || locationsRes.data || []
        this.locations = Array.isArray(locationsData) ? locationsData : []

        const crushersRes = await getCrushers({ pageSize: 1000 })
        const crushersData = crushersRes.data?.data || crushersRes.data || []
        this.crushers = Array.isArray(crushersData) ? crushersData : []

        const itemsRes = await getExportItems()
        const itemsData = itemsRes.data?.data || itemsRes.data || []
        this.items = Array.isArray(itemsData) ? itemsData : []

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
     * Close dropdown with delay
     */
    closeDropdownDelayed(dropdownName) {
      setTimeout(() => {
        this.filters[dropdownName] = false
      }, 200)
    },

    /**
     * Clear all filters
     */
    clearFilters() {
      this.filters = {
        startDate: '',
        endDate: '',
        contractorId: '',
        contractorSearch: '',
        locationId: '',
        locationSearch: '',
        crusherId: '',
        crusherSearch: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: '',
        showContractorDropdown: false,
        showLocationDropdown: false,
        showCrusherDropdown: false,
        showItemDropdown: false,
        showVehicleDropdown: false
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
          contractorId: this.filters.contractorId,
          locationId: this.filters.locationId,
          crusherId: this.filters.crusherId,
          itemId: this.filters.itemId,
          vehicleId: this.filters.vehicleId
        }

        const res = await getDeliveries(buildQueryParams(queryParams))

        this.supplies = Array.isArray(res.data.items)
          ? res.data.items
          : (Array.isArray(res.data) ? res.data : [])

        this.total = res.data.total || this.supplies.length
        this.pageSize = res.data.pageSize || this.pageSize
      } catch (e) {
        console.error('Error loading supplies:', e)
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

    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString(this.isRTL ? 'ar-EG' : 'en-US')
      } catch {
        return dateString
      }
    },

    calculateTotal(supply) {
      const capacity = parseFloat(supply.companyCapacity || supply.crusherCapacity || 0)
      const unitPrice = parseFloat(supply.unitPrice || 0)
      const discount = parseFloat(supply.discount || 0)
      return (capacity * unitPrice) - discount
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
      this.contextMenu.item = item
    },

    closeContextMenu() {
      this.contextMenu.visible = false
      this.contextMenu.item = null
    },

    confirmDelete(item) {
      const confirmed = confirm(this.$t('supply.confirmDeleteExport') || 'Delete this export?')
      if (confirmed) {
        this.handleDelete(item.id)
      }
    },

    async handleDelete(id) {
      try {
        await deleteDelivery(id)
        // backend may return 204; just reload
        await this.loadSupplies()
      } catch (e) {
        console.error('Failed to delete export', e)
        alert(this.$t('common.deleteError') || 'Failed to delete')
      }
    },

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

<style scoped></style>
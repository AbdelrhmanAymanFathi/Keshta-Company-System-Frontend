<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold">{{ $t('transport.transportList') }}</h2>

      <button @click="showAddModal = true"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
        {{ $t('transport.addTransport') }} +
      </button>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4 mb-6">
      <h4 class="text-sm font-semibold text-gray-700">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
          <input v-model="filters.startDate" type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
          <input v-model="filters.endDate" type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>

        <!-- Contractor -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.contractor') }}</label>
          <div class="relative">
            <input v-model="filters.contractorSearch" @focus="filters.showContractorDropdown = true"
              @blur="closeDropdownDelayed('showContractorDropdown')" type="text"
              :placeholder="$t('placeholders.searchContractor')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <div v-if="filters.showContractorDropdown && filteredContractors.length"
              class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div v-for="contractor in filteredContractors" :key="contractor.id"
                @click="filters.contractorId = contractor.id; filters.contractorSearch = contractor.name; filters.showContractorDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                {{ contractor.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- From Location -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('transport.fromLocation') }}</label>
          <div class="relative">
            <input v-model="filters.fromLocationSearch" @focus="filters.showFromLocationDropdown = true"
              @blur="closeDropdownDelayed('showFromLocationDropdown')" type="text"
              :placeholder="$t('placeholders.searchFromLocation')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <div v-if="filters.showFromLocationDropdown && filteredFromLocations.length"
              class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div v-for="location in filteredFromLocations" :key="location.id"
                @click="filters.fromLocationId = location.id; filters.fromLocationSearch = location.name; filters.showFromLocationDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                {{ location.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- To Location -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('transport.toLocation') }}</label>
          <div class="relative">
            <input v-model="filters.toLocationSearch" @focus="filters.showToLocationDropdown = true"
              @blur="closeDropdownDelayed('showToLocationDropdown')" type="text"
              :placeholder="$t('placeholders.searchToLocation')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <div v-if="filters.showToLocationDropdown && filteredToLocations.length"
              class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div v-for="location in filteredToLocations" :key="location.id"
                @click="filters.toLocationId = location.id; filters.toLocationSearch = location.name; filters.showToLocationDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                {{ location.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Item -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.item') }}</label>
          <div class="relative">
            <input v-model="filters.itemSearch" @focus="filters.showItemDropdown = true"
              @blur="closeDropdownDelayed('showItemDropdown')" type="text" :placeholder="$t('placeholders.searchItem')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <div v-if="filters.showItemDropdown && filteredItems.length"
              class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div v-for="item in filteredItems" :key="item.id"
                @click="filters.itemId = item.id; filters.itemSearch = item.name; filters.showItemDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Vehicle -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.vehicle') }}</label>
          <div class="relative">
            <input v-model="filters.vehicleSearch" @focus="filters.showVehicleDropdown = true"
              @blur="closeDropdownDelayed('showVehicleDropdown')" type="text"
              :placeholder="$t('placeholders.searchVehicle')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <div v-if="filters.showVehicleDropdown && filteredVehicles.length"
              class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div v-for="vehicle in filteredVehicles" :key="vehicle.id"
                @click="filters.vehicleId = vehicle.id; filters.vehicleSearch = vehicle.plateNumber || vehicle.name; filters.showVehicleDropdown = false"
                class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                {{ vehicle.plateNumber || vehicle.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="page = 1; loadTransports()" :disabled="loading"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium">
          {{ $t('labels.search') }}
        </button>
        <button @click="clearFilters"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm font-medium">
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
              {{ $t('transport.date') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.contractor') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.route') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.item') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.trips') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.distance') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.vehicleCapacity') || 'Capacity' }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.rate') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.discount') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.total') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transport, idx) in transports" :key="`transport-${transport.id}-${idx}`" class="hover:bg-gray-50"
              @contextmenu.prevent="onRowContextMenu($event, transport)">
            <td class="px-6 py-3 text-start text-xs font-medium text-indigo-800 uppercase tracking-wider whitespace-nowrap">
              {{ formatDate(transport.date) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ transport.contractor?.name || '-' }}</div>
              <div class="text-sm text-gray-500">{{ transport.contractor?.phone || '-' }}</div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              <div class="text-sm text-gray-900"><span class="font-bold">{{ transport.fromLoc }}</span> {{ $t('transport.to') }} <span class="font-bold">{{ transport.toLoc }}</span></div>
              <div class="text-sm text-gray-500">{{ getVehicleDisplay(transport) }}</div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">
              {{ transport.item?.name || '-' }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ transport.numTrips }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ transport.distanceKm }} km
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ transport.vehicleCompanyCapacity != null ? transport.vehicleCompanyCapacity : '-' }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ formatCurrency(transport.rate) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-red-600 uppercase tracking-wider whitespace-nowrap">
              <span :class="parseFloat(transport.discount) > 0 ? 'text-red-600 font-medium' : 'text-gray-500'">
                {{ transport.discount }}
              </span>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ formatCurrency(transport.total) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <div class="flex gap-3" :class="isRTL ? 'justify-start' : 'justify-end'">
                <button @click.stop="editTransport(transport)" class="text-indigo-600 hover:text-indigo-900"
                  :title="$t('common.edit')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click.stop="confirmDelete(transport)" class="text-red-600 hover:text-red-900"
                  :title="$t('common.delete')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="transports.length === 0">
            <td
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              :colspan="11">
              {{ $t('transport.noTransports') || 'No transports found' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-if="totalPages > 1" :currentPage="page" :pageSize="pageSize" :total="total" :totalPages="totalPages"
      :pageSizeOptions="[10, 20, 50, 100]" @update:page="(p) => { page = p; loadTransports() }"
      @update:pageSize="(size) => { pageSize = size; page = 1; loadTransports() }" />

    <!-- Context menu for row actions -->
    <div v-if="contextMenu.visible" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="absolute z-50 bg-white border rounded shadow-md" @click.stop>
      <ul class="p-2">
        <li>
          <button @click="editTransport(contextMenu.item)"
            class="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">{{ $t('common.edit') }}</button>
        </li>
        <li>
          <button @click="confirmDelete(contextMenu.item)"
            class="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm text-red-600">{{ $t('labels.delete') }}</button>
        </li>
      </ul>
    </div>

    <!-- Add/Edit Modal -->
    <TransportModal
      v-if="showAddModal"
      :is-open="showAddModal"
      :transport="editingTransport"
      @close="closeModal"
      @saved="handleTransportSaved"
    />
  </div>
</template>

<script>
import { getTransports, deleteTransport, getContractors, getLocations, getItems, getVehicles } from '@/api'
import Pagination from '@/components/shared/Pagination.vue'
import TransportModal from '../../shared/TransportCreationModal.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'

export default {
  name: 'TransportList',

  components: {
    Pagination,
    TransportModal
  },

  data() {
    return {
      transports: [],
      showAddModal: false,
      editingTransport: null,
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
      items: [],
      vehicles: [],
      filters: {
        startDate: '',
        endDate: '',
        contractorId: '',
        contractorSearch: '',
        fromLocationId: '',
        fromLocationSearch: '',
        toLocationId: '',
        toLocationSearch: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: '',
        showContractorDropdown: false,
        showFromLocationDropdown: false,
        showToLocationDropdown: false,
        showItemDropdown: false,
        showVehicleDropdown: false
      }
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
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
    filteredFromLocations() {
      if (!this.filters.showFromLocationDropdown) return []
      if (!this.filters.fromLocationSearch) return this.locations
      return this.locations.filter(l =>
        l.name.toLowerCase().includes(this.filters.fromLocationSearch.toLowerCase())
      )
    },
    filteredToLocations() {
      if (!this.filters.showToLocationDropdown) return []
      if (!this.filters.toLocationSearch) return this.locations
      return this.locations.filter(l =>
        l.name.toLowerCase().includes(this.filters.toLocationSearch.toLowerCase())
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
    await this.loadTransports()
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

        const itemsRes = await getItems()
        const itemsData = itemsRes.data?.data || itemsRes.data || []
        this.items = Array.isArray(itemsData) ? itemsData : []

        const vehiclesRes = await getVehicles({ pageSize: 1000 })
        const vehiclesData = vehiclesRes.data?.data || vehiclesRes.data || []
        this.vehicles = Array.isArray(vehiclesData) ? vehiclesData : []

        console.log('✓ Filter data loaded:', {
          contractors: this.contractors.length,
          locations: this.locations.length,
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
        fromLocationId: '',
        fromLocationSearch: '',
        toLocationId: '',
        toLocationSearch: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: '',
        showContractorDropdown: false,
        showFromLocationDropdown: false,
        showToLocationDropdown: false,
        showItemDropdown: false,
        showVehicleDropdown: false
      }
      this.page = 1
      this.loadTransports()
    },

    async loadTransports() {
      try {
        this.loading = true

        const queryParams = {
          page: this.page,
          pageSize: this.pageSize,
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
          contractorId: this.filters.contractorId,
          fromLocationId: this.filters.fromLocationId,
          toLocationId: this.filters.toLocationId,
          itemId: this.filters.itemId,
          vehicleId: this.filters.vehicleId
        }

        const cleanParams = buildQueryParams(queryParams)
        console.log('🔵 Loading transports with params:', queryParams)
        console.log('🔵 Clean params sent to API:', cleanParams)
        const res = await getTransports(cleanParams)

        console.log('Response received:', res)
        console.log('Response data:', res.data)

        // Extract items from response
        const responseData = res.data
        if (responseData && responseData.items && Array.isArray(responseData.items)) {
          // In Vue 3, directly assign the array
          this.transports = [...responseData.items]

          this.total = responseData.total || this.transports.length
          this.pageSize = responseData.pageSize || this.pageSize

          console.log('✓ Transports updated:', this.transports.length, 'items')
        } else {
          console.warn('⚠ Unexpected response format:', responseData)
          this.transports = []
          this.total = 0
        }
      } catch (e) {
        console.error('✗ Error loading transports:', e)
        this.transports = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async handleTransportSaved() {
      this.closeModal()
      this.page = 1
      await this.loadTransports()
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        return new Intl.DateTimeFormat('en-GB').format(new Date(dateString))
      } catch {
        return dateString
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount)
    },

    getVehicleDisplay(transport) {
      // Show vehicle name if available, otherwise show capacity
      if (transport.vehicle) {
        return transport.vehicle.name
      }
      // if (transport.vehicleCubicCapacity) {
      //   return `${transport.vehicleCubicCapacity} م³`
      // }
      return '-'
    },

    editTransport(transport) {
      this.editingTransport = { ...transport }
      this.showAddModal = true
    },

    closeModal() {
      this.showAddModal = false
      this.editingTransport = null
    },

    onRowContextMenu(e, item) {
      this.contextMenu.visible = true
      this.contextMenu.x = e.clientX
      this.contextMenu.y = e.clientY
      this.contextMenu.item = item
    },

    closeContextMenu() {
      this.contextMenu.visible = false
      this.contextMenu.item = null
    },

    confirmDelete(item) {
      const confirmed = confirm(this.$t('transport.confirmDelete') || 'Delete this transport?')
      if (confirmed) {
        this.handleDelete(item.id)
      }
    },

    async handleDelete(id) {
      try {
        await deleteTransport(id)
        await this.loadTransports()
        this.$toast?.success(this.$t('transport.deletedSuccessfully'))
      } catch (e) {
        console.error('Failed to delete transport', e)
        alert(this.$t('common.deleteError') || 'Failed to delete')
      }
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
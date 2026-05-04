<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'">
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
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'"
            @select="(contractor) => { filters.contractorId = contractor.id; filters.contractorSearch = contractor.name; filters.contractorSelected = contractor }"
          />
        </div>

        <!-- Location (parent) -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('transport.location') }}</label>
          <SearchDropdown
            v-model="filters.locationSearch"
            :items="locations.filter(l => !l.parentId)"
            :allItems="locations"
            :placeholder="$t('placeholders.searchLocation')"
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'"
            @select="(location) => { filters.locationId = location.id; filters.locationSearch = location.name; filters.locationSelected = location }"
          />
        </div>

        <!-- Area (child of selected location) -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('transport.area') }}</label>
          <SearchDropdown
            v-model="filters.areaSearch"
            :items="(filters.locationSelected && Array.isArray(filters.locationSelected.children) && filters.locationSelected.children.length) ? filters.locationSelected.children : (filters.locationId ? (locations.find(l => l.id === filters.locationId)?.children || []) : [])"
            :allItems="locations"
            :placeholder="$t('placeholders.searchArea')"
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'"
            @select="(area) => { filters.areaId = area.id; filters.areaSearch = area.name; filters.areaSelected = area }"
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
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'"
            @select="(item) => { filters.itemId = item.id; filters.itemSearch = item.name; filters.itemSelected = item }"
          />
        </div>

        <!-- Vehicle -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.vehicle') }}</label>
          <SearchDropdown
            v-model="filters.vehicleSearch"
            :items="vehicles"
            :allItems="vehicles"
            :itemLabel="(vehicle) => vehicle?.plateNumber || vehicle?.name || ''"
            :placeholder="$t('placeholders.searchVehicle')"
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'"
            @select="(vehicle) => { filters.vehicleId = vehicle.id; filters.vehicleSearch = vehicle.plateNumber || vehicle.name; filters.vehicleSelected = vehicle }"
          />
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
              {{ $t('transport.location') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.area') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.vehicle') }}
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
              {{ $t('transport.firstKmPrice') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.perKmPrice') }}
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
              {{ $t('labels.notes') }}
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
              <!-- <div class="text-sm text-gray-500">{{ transport.contractor?.phone || '-' }}</div> -->
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              <div class="text-sm text-gray-900"><span class="font-bold">{{ transport.location.name || '-' }}</span></div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              <div class="text-sm text-gray-900"><span class="font-bold">{{ transport.area.name || '-' }}</span></div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ getVehicleDisplay(transport) }}</div>
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
              {{ formatCurrency(getTransportFirstKmPrice(transport)) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ formatCurrency(getTransportPerKmPrice(transport)) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-red-600 uppercase tracking-wider whitespace-nowrap">
              <span :class="parseFloat(transport.discount) > 0 ? 'text-red-600 font-medium' : 'text-gray-500'">
                {{ transport.discount }}
              </span>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider whitespace-nowrap">
              {{ formatCurrency(transport.total) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-900 tracking-wider">
              <div class="max-w-xs truncate">{{ transport.notes || transport.note || '-' }}</div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <div class="flex gap-3" :class="isRTL ? 'justify-start' : 'justify-end'">
                <!-- <button @click.stop="editTransport(transport)" class="text-indigo-600 hover:text-indigo-900"
                  :title="$t('common.edit')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click.stop="openPaymentModal('transport', transport.id)" class="text-green-600 hover:text-green-900"
                  :title="$t('labels.addPayment')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m4-4H8" />
                  </svg>
                </button> -->
                <button @click.stop="openDeleteConfirm(transport)" class="text-red-600 hover:text-red-900"
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
              :colspan="15">
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
        <!-- <li>
          <button @click="editTransport(contextMenu.item)"
            class="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">{{ $t('common.edit') }}</button>
        </li> -->
        <li>
          <button @click="openDeleteConfirm(contextMenu.item)"
            class="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm text-red-600">{{ $t('labels.delete') }}</button>
        </li>
      </ul>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteConfirmModal.show" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold mb-3 text-gray-900">{{ $t('labels.confirmDelete') || 'Confirm Delete' }}</h3>
        <p class="text-gray-600 mb-6">{{ $t('transport.confirmDelete') || 'Are you sure you want to delete this transport?' }}</p>
        <div class="flex justify-end gap-3">
          <button @click="closeDeleteConfirm" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            {{ $t('labels.cancel') || 'Cancel' }}
          </button>
          <button @click="handleDelete(deleteConfirmModal.id)" :disabled="deleting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? ($t('labels.deleting') || 'Deleting...') : ($t('labels.delete') || 'Delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <TransportModal
      v-if="showAddModal"
      :is-open="showAddModal"
      :transport="editingTransport"
      @close="closeModal"
      @saved="handleTransportSaved"
    />
    <PaymentModal v-if="showPaymentModal" :visible="showPaymentModal" :parentType="paymentTarget.type"
      :parentId="paymentTarget.id" @close="showPaymentModal = false" @saved="handlePaymentSaved" />
  </div>
</template>

<script>
import { getTransports, deleteTransport, getContractors, getLocations, getItems, getVehicles } from '@/api'
import Pagination from '@/components/shared/Pagination.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import TransportModal from './TransportCreationModal.vue'
import PaymentModal from '@/components/shared/PaymentModal.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'

export default {
  name: 'TransportList',

  components: {
    Pagination,
    TransportModal,
    SearchDropdown,
    PaymentModal,
    DateField
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
      showPaymentModal: false,
      paymentTarget: { type: null, id: null },
      deleting: false,
      deleteConfirmModal: {
        show: false,
        id: null
      },
      filters: {
        startDate: '',
        endDate: '',
        contractorId: '',
        contractorSearch: '',
        contractorSelected: null,
        locationId: '',
        locationSearch: '',
        locationSelected: null,
        areaId: '',
        areaSearch: '',
        areaSelected: null,
        itemId: '',
        itemSearch: '',
        itemSelected: null,
        vehicleId: '',
        vehicleSearch: '',
        vehicleSelected: null
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
        const contractorsRes = await getContractors({ pageSize: 1000, mode: 'transport' })
        const contractorsData = contractorsRes.data?.data || contractorsRes.data || []
        this.contractors = Array.isArray(contractorsData) ? contractorsData : []

        const locationsRes = await getLocations()
        const locationsData = locationsRes.data?.data || locationsRes.data || []
        this.locations = Array.isArray(locationsData) ? locationsData : []

        const itemsRes = await getItems({ mode: 'transport' })
        const itemsData = itemsRes.data?.items || itemsRes.data?.data || itemsRes.data || []
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
     * Clear all filters
     */
    clearFilters() {
      this.filters = {
        startDate: '',
        endDate: '',
        contractorId: '',
        contractorSearch: '',
        contractorSelected: null,
        locationId: '',
        locationSearch: '',
        locationSelected: null,
        areaId: '',
        areaSearch: '',
        areaSelected: null,
        itemId: '',
        itemSearch: '',
        itemSelected: null,
        vehicleId: '',
        vehicleSearch: '',
        vehicleSelected: null
      }
      this.page = 1
      this.loadTransports()
    },

    async loadTransports() {
      try {
        this.loading = true

        // ensure any pending input/select updates are applied (allow emitted select/update events to propagate)
        await this.$nextTick()
        await new Promise((res) => setTimeout(res, 20))
        this.syncFilterIdsFromSearch()

        console.debug('Filters before request:', JSON.parse(JSON.stringify(this.filters)))

        const queryParams = {
          page: this.page,
          pageSize: this.pageSize,
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
          contractorId: this.filters.contractorId,
          locationId: this.filters.locationId,
          areaId: this.filters.areaId,
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

    syncFilterIdsFromSearch() {
      const normalize = (value) => String(value || '').trim().toLowerCase()
      const resolveId = (list, search, getLabel) => {
        const needle = normalize(search)
        if (!needle) return ''
        const items = Array.isArray(list) ? list : []
        const exact = items.find(item => normalize(getLabel(item)) === needle)
        if (exact) return exact.id ?? ''
        const partial = items.filter(item => normalize(getLabel(item)).includes(needle))
        return partial.length === 1 ? (partial[0].id ?? '') : ''
      }
      const useSelected = (selected, search, getLabel) => {
        if (!selected) return ''
        const needle = normalize(search)
        if (!needle) return ''
        const label = normalize(getLabel(selected))
        return label === needle ? (selected.id ?? '') : ''
      }

      this.filters.contractorId =
        useSelected(this.filters.contractorSelected, this.filters.contractorSearch, (c) => c?.name || '') ||
        resolveId(this.contractors, this.filters.contractorSearch, (c) => c?.name || '')

      // resolve parent location id (prefer selected top-level locations)
      const parentLocations = this.locations.filter(l => !l.parentId)
      this.filters.locationId =
        useSelected(this.filters.locationSelected, this.filters.locationSearch, (l) => l?.name || '') ||
        resolveId(parentLocations, this.filters.locationSearch, (l) => l?.name || '')

      // resolve area id (child of selected location if provided)
      // Prefer explicit children on the selected location object (if present),
      // otherwise try to find the parent in `locations` and use its `children`,
      // finally fall back to any locations with matching parentId.
      let areaCandidates = []
      if (this.filters.locationSelected && Array.isArray(this.filters.locationSelected.children) && this.filters.locationSelected.children.length) {
        areaCandidates = this.filters.locationSelected.children
      } else if (this.filters.locationId) {
        const parent = this.locations.find(l => l.id === this.filters.locationId)
        areaCandidates = parent?.children || this.locations.filter(l => l.parentId === this.filters.locationId)
      } else {
        areaCandidates = []
      }

      this.filters.areaId =
        useSelected(this.filters.areaSelected, this.filters.areaSearch, (l) => l?.name || '') ||
        resolveId(areaCandidates, this.filters.areaSearch, (l) => l?.name || '')

      this.filters.itemId =
        useSelected(this.filters.itemSelected, this.filters.itemSearch, (i) => i?.name || '') ||
        resolveId(this.items, this.filters.itemSearch, (i) => i?.name || '')

      this.filters.vehicleId =
        useSelected(this.filters.vehicleSelected, this.filters.vehicleSearch, (v) => v?.plateNumber || v?.name || '') ||
        resolveId(this.vehicles, this.filters.vehicleSearch, (v) => v?.plateNumber || v?.name || '')
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

    getTransportFirstKmPrice(transport) {
      return Number(transport?.pricing?.firstKmPrice ?? transport?.firstKmPrice ?? 0)
    },

    getTransportPerKmPrice(transport) {
      return Number(transport?.pricing?.perKmPrice ?? transport?.perKmPrice ?? 0)
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

    async handleDelete(id) {
      this.deleting = true
      try {
        await deleteTransport(id)
        await this.loadTransports()
        this.$toast?.success(this.$t('transport.deletedSuccessfully'))
        this.closeDeleteConfirm()
      } catch (e) {
        console.error('Failed to delete transport', e)
        alert(this.$t('common.deleteError') || 'Failed to delete')
      } finally {
        this.deleting = false
      }
    }
    ,
    openPaymentModal(type, id) {
      this.paymentTarget = { type, id }
      this.showPaymentModal = true
    },
    async handlePaymentSaved() {
      // refresh list after payment
      this.showPaymentModal = false
      await this.loadTransports()
      this.$toast?.success(this.$t('labels.paymentSaved') || 'Payment saved')
    },
  }
}
</script>

<style scoped>
[dir="rtl"] table th,
[dir="rtl"] table td {
  text-align: right;
}
</style>

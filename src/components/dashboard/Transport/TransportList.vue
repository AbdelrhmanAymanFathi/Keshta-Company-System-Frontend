<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <div class="app-page-header flex items-center justify-between rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold">{{ $t('transport.transportList') }}</h2>

      <Button class="gap-2" @click="showAddModal = true">
        {{ $t('transport.addTransport') }} +
      </Button>
    </div>

    <!-- Filters Section -->
    <Card class="shadcn-ui border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/40">
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-semibold theme-text-secondary">{{ $t('labels.filters') }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Start Date -->
          <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.startDate') }}</label>
          <DateField v-model="filters.startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.endDate') }}</label>
          <DateField v-model="filters.endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>

        <!-- Contractor -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.contractor') }}</label>
          <SearchDropdown
            v-model="filters.contractorSearch"
            :items="contractors"
            :allItems="contractors"
            :placeholder="$t('placeholders.searchContractor')"
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm'"
            @select="(contractor) => { filters.contractorId = contractor.id; filters.contractorSearch = contractor.name; filters.contractorSelected = contractor }"
          />
        </div>

        <!-- Location (parent) -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('transport.location') }}</label>
          <SearchDropdown
            v-model="filters.locationSearch"
            :items="locations.filter(l => !l.parentId)"
            :allItems="locations"
            :placeholder="$t('placeholders.searchLocation')"
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm'"
            @select="(location) => { filters.locationId = location.id; filters.locationSearch = location.name; filters.locationSelected = location }"
          />
        </div>

        <!-- Area (child of selected location) -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('transport.area') }}</label>
          <SearchDropdown
            v-model="filters.areaSearch"
            :items="(filters.locationSelected && Array.isArray(filters.locationSelected.children) && filters.locationSelected.children.length) ? filters.locationSelected.children : (filters.locationId ? (locations.find(l => l.id === filters.locationId)?.children || []) : [])"
            :allItems="locations"
            :placeholder="$t('placeholders.searchArea')"
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm'"
            @select="(area) => { filters.areaId = area.id; filters.areaSearch = area.name; filters.areaSelected = area }"
          />
        </div>

        <!-- Item -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.item') }}</label>
          <SearchDropdown
            v-model="filters.itemSearch"
            :items="items"
            :allItems="items"
            :placeholder="$t('placeholders.searchItem')"
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm'"
            @select="(item) => { filters.itemId = item.id; filters.itemSearch = item.name; filters.itemSelected = item }"
          />
        </div>

        <!-- Vehicle -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.vehicle') }}</label>
          <SearchDropdown
            v-model="filters.vehicleSearch"
            :items="vehicles"
            :allItems="vehicles"
            :itemLabel="(vehicle) => vehicle?.plateNumber || vehicle?.name || ''"
            :filterFn="vehicleFilterFn"
            :placeholder="$t('placeholders.searchVehicle')"
            :inputClass="'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm'"
            @select="(vehicle) => { filters.vehicleId = vehicle.id; filters.vehicleSearch = vehicle.plateNumber || vehicle.name; filters.vehicleSelected = vehicle }"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Button @click="page = 1; loadTransports()" :disabled="loading" class="px-4 py-2 text-sm font-medium shadow-sm">
          {{ $t('labels.search') }}
        </Button>
        <Button variant="outline" @click="clearFilters" class="px-4 py-2 text-sm font-medium">
          {{ $t('labels.clear') }}
        </Button>
      </div>
      </CardContent>
    </Card>

    <!-- table -->
    <div class="app-table-card">
      <table v-app-table class="app-table divide-y divide-gray-200">
        <colgroup>
          <col style="width: 6.5%" />
          <col style="width: 9%" />
          <col style="width: 6.5%" />
          <col style="width: 7%" />
          <col style="width: 6.5%" />
          <col style="width: 7%" />
          <col style="width: 6.5%" />
          <col style="width: 4%" />
          <col style="width: 5%" />
          <col style="width: 5%" />
          <col style="width: 6%" />
          <col style="width: 6%" />
          <col style="width: 4.5%" />
          <col style="width: 6.5%" />
          <col style="width: 7.5%" />
          <col style="width: 6.5%" />
        </colgroup>
        <thead class="theme-table-thead-gradient">
          <tr>
            <th data-col="subtitle"
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:theme-text-primary"
              @click="sortBy('date')">
              {{ $t('transport.date') }}
              <SortIcon :active="sortField === 'date'" :dir="sortOrder" />
            </th>
             <th data-col="title"
               class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
               {{ $t('transport.contractor') }}
             </th>
             <th
               class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
               {{ $t('labels.status') || 'Status' }}
             </th>
             <th
               class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
               {{ $t('transport.location') }}
             </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.area') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.vehicle') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.item') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.trips') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.distance') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.vehicleCapacity') || 'Capacity' }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.firstKmPrice') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.perKmPrice') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.discount') }}
            </th>
            <th data-col="amount"
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('transport.total') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.notes') }}
            </th>
            <th
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transport, idx) in transports" :key="`transport-${transport.id}-${idx}`" :data-focus-id="transport.id" :class="['theme-table-row-hover', { 'row-pending-review': transport.hasPendingApproval }]"
              @contextmenu.prevent="onRowContextMenu($event, transport)">
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-secondary uppercase tracking-wider whitespace-nowrap">
              {{ formatDate(transport.date) }}
            </td>
             <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
               <div class="">{{ transport.contractor?.name || '-' }}</div>
             </td>
             <td class="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider whitespace-nowrap">
               <StatusBadge
                :status="transport.hasPendingApproval ? 'pending' : 'approved'"
                :label="transport.hasPendingApproval ? ($t('labels.pendingReview') || 'Pending Review') : ($t('labels.approved') || 'Approved')"
              />
             </td>
             <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
               <div class=""><span class="">{{ transport.location?.name || '-' }}</span></div>
             </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              <div class=""><span class="">{{ transport.area?.name || '-' }}</span></div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              <div class="">{{ getVehicleDisplay(transport) }}</div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              {{ transport.item?.name || '-' }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              {{ transport.numTrips }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              {{ transport.distanceKm }} km
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              {{ transport.vehicleCompanyCapacity != null ? transport.vehicleCompanyCapacity : '-' }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              {{ formatCurrency(getTransportFirstKmPrice(transport)) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              {{ formatCurrency(getTransportPerKmPrice(transport)) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium text-red-600 uppercase tracking-wider whitespace-nowrap">
              <span :class="parseFloat(transport.discount) > 0 ? 'text-red-600 font-medium' : 'theme-text-muted'">
                {{ transport.discount }}
              </span>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              {{ formatCurrency(transport.total) }}
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-primary tracking-wider">
              <div>{{ transport.notes || transport.note || '-' }}</div>
            </td>
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              <div class="flex" :class="isRTL ? 'justify-start' : 'justify-end'">
                <RowActions :actions="rowActions(transport)" />
              </div>
            </td>
          </tr>
          <tr v-if="transports.length === 0">
            <td
              class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap"
              :colspan="16">
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
      class="fixed z-50 rounded-2xl theme-card border theme-border-accent shadow-lg shadow-slate-200/60 min-w-48 overflow-hidden" @click.stop>
      <div class="p-1">
        <Button variant="ghost" size="sm"
          class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
          :disabled="contextMenu.item?.hasPendingApproval"
          @click="openDeleteConfirm(contextMenu.item)">
          <TrashIcon class="w-4 h-4 mr-2" />
          {{ $t('labels.delete') }}
        </Button>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <ConfirmDialog
      :show="deleteConfirmModal.show"
      :title="$t('labels.confirmDelete') || 'Confirm Delete'"
      :message="$t('transport.confirmDelete') || 'Are you sure you want to delete this transport?'"
      :loading="deleting"
      type="danger"
      @confirm="handleDelete(deleteConfirmModal.id)"
      @cancel="closeDeleteConfirm"
    />

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
import SortIcon from '@/components/shared/SortIcon.vue'
import { usePagination } from '@/composables/usePagination'
import { getTransports, getTransport, deleteTransport, getContractors, getLocations, getItems, getVehicles } from '@/api'
import Pagination from '@/components/shared/Pagination.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import TransportModal from './TransportCreationModal.vue'
import PaymentModal from '@/components/shared/PaymentModal.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'
import { TrashIcon, PencilIcon } from '@acme/icon-packs/legacy'
import RowActions from '@/components/shared/RowActions.vue'
import { matchesVehicleName } from '@/utils/normalizeVehicleName'
import { realtimeService } from '@/services/realtimeService'
import { debounce } from '@/utils/debounce'
import { getFocusId, clearFocusQuery, highlightRow, notifyFocusMissing } from '@/utils/focusRecord'

export default {
  name: 'TransportList',

  components: {
    ConfirmDialog,
    StatusBadge,
    Pagination,
    TransportModal,
    RowActions,
    SearchDropdown,
    PaymentModal,
    DateField,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    TrashIcon,
    SortIcon
  },

  setup() {
    const { items: transports, page, pageSize, total, totalPages, loading, load, setPage, setPageSize } = usePagination(
      async (p, ps, extra) => {
        const queryParams = {
          page: p,
          pageSize: ps,
          sortField: extra.sortField,
          sortOrder: extra.sortOrder,
          startDate: extra.filters.startDate,
          endDate: extra.filters.endDate,
          contractorId: extra.filters.contractorId,
          locationId: extra.filters.locationId,
          areaId: extra.filters.areaId,
          itemId: extra.filters.itemId,
          vehicleId: extra.filters.vehicleId
        }

        const cleanParams = buildQueryParams(queryParams)
        const res = await getTransports(cleanParams)

        const responseData = res.data
        if (!responseData || !Array.isArray(responseData.items)) {
          console.warn('⚠ Unexpected response format:', responseData)
          return []
        }

        const order = extra.sortOrder
        const sorted = [...responseData.items].sort((a, b) => {
          const dateA = a?.date || a?.createdAt || 0
          const dateB = b?.date || b?.createdAt || 0
          const timeA = Number.isNaN(new Date(dateA).getTime()) ? 0 : new Date(dateA).getTime()
          const timeB = Number.isNaN(new Date(dateB).getTime()) ? 0 : new Date(dateB).getTime()
          return order === 'asc' ? timeA - timeB : timeB - timeA
        })

        return { ...responseData, items: sorted }
      },
      { initialPageSize: 20, resourceName: 'transports' }
    )

    return { transports, page, pageSize, total, totalPages, loading, load, setPage, setPageSize }
  },

  data() {
    return {
      showAddModal: false,
      editingTransport: null,
      sortField: 'date',
      sortOrder: 'desc',
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
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    
  },

  watch: {
    '$route.query.focus'() {
      this.openFocusedTransport()
    }
  },

  async mounted() {
    await this.loadFilterData()
    await this.loadTransports()
    this.openFocusedTransport()
    document.addEventListener('click', this.closeContextMenu)
    this.__realtimeUnsub = realtimeService.subscribe('transport', ['transport_created', 'transport_updated', 'transport_deleted'], debounce(() => { this.loadTransports() }, 300))
  },

  beforeUnmount() {
    if (this.__realtimeUnsub) { this.__realtimeUnsub(); this.__realtimeUnsub = null }
    document.removeEventListener('click', this.closeContextMenu)
  },

  methods: {
    vehicleFilterFn(item, query) {
      return matchesVehicleName(item.plateNumber || item.name, query)
    },
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
      // ensure any pending input/select updates are applied (allow emitted select/update events to propagate)
      await this.$nextTick()
      await new Promise((res) => setTimeout(res, 20))
      this.syncFilterIdsFromSearch()

      try {
        await this.load({ filters: { ...this.filters }, sortField: this.sortField, sortOrder: this.sortOrder })
      } catch (e) {
        console.error('✗ Error loading transports:', e)
        this.transports = []
        this.total = 0
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

    // Opened from a notification: flash the row if it's on this page, otherwise open it for editing
    async openFocusedTransport() {
      const id = getFocusId(this.$route)
      if (!id) return
      clearFocusQuery(this.$router, this.$route)
      if (this.transports.some(t => Number(t.id) === id)) {
        this.$nextTick(() => highlightRow(id))
        return
      }
      try {
        const { data } = await getTransport(id)
        if (!data?.id) return notifyFocusMissing()
        this.editTransport(data)
      } catch {
        notifyFocusMissing()
      }
    },

    rowActions(transport) {
      return [
        { key: 'edit', icon: PencilIcon, label: this.$t('common.edit') || 'Edit', tone: 'edit', disabled: transport.hasPendingApproval, onClick: () => this.editTransport(transport) },
        { key: 'delete', icon: TrashIcon, label: this.$t('common.delete'), tone: 'delete', disabled: transport.hasPendingApproval, onClick: () => this.openDeleteConfirm(transport) },
      ]
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
        void(window.$toast ? window.$toast(this.$t('common.deleteError') || 'Failed to delete', 'error') : alert(this.$t('common.deleteError') || 'Failed to delete'))
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

    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      } else {
        this.sortField = field
        this.sortOrder = 'desc'
      }
      this.page = 1
      this.loadTransports()
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

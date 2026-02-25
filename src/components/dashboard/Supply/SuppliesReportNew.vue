<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('supply.exportTableTitle') }}</h2>
      <div class="flex items-center gap-2">
        <button @click="refresh" :disabled="loading"
          class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
          {{ $t('labels.refresh') }}
        </button>
        <button @click="downloadReport" :disabled="downloading"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
          </svg>
          {{ downloading ? $t('labels.downloading') : $t('labels.download') }}
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4">
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

        <!-- Location -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.location') }}</label>
          <div class="relative">
            <input v-model="filters.locationSearch" @focus="filters.showLocationDropdown = true"
              @blur="closeDropdownDelayed('showLocationDropdown')" type="text"
              :placeholder="$t('placeholders.searchLocation')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <div v-if="filters.showLocationDropdown && filteredLocations.length"
              class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
              <div v-for="location in filteredLocations" :key="location.id"
                @click="filters.locationId = location.id; filters.locationSearch = location.name; filters.showLocationDropdown = false"
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
        <button @click="loadReport" :disabled="loading"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium">
          {{ $t('labels.search') }}
        </button>
        <button @click="clearFilters"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm font-medium">
          {{ $t('labels.clear') }}
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm text-red-800">{{ error }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-4 py-3 text-sm text-gray-600">Exports/Supplies Report</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-indigo-50">
            <tr>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.date') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.contractor') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.location') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.crusher') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.item') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.vehicle') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.companyTicket') }}</th>
                              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.crusherTicket') }}</th>
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
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.rowTotal') }}</th>
              <th
                class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ $t('labels.accumulativeTotal') }}</th>
              <!-- <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ $t('labels.notes') }}</th> -->
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="mappedItems.length">
            <tr v-for="item in mappedItems" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(item.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.contractor }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.location }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.crusher }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.item || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.vehicle || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.companyTicket }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.crusherTicket }}</td>

              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatQuantity(item.companyCapacity) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatQuantity(item.crusherCapacity) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(item.unitPrice) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" :title="`Discount: ${item.discount}`">{{
                formatCurrency(item.discount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{
                formatCurrency(item.rowTotal) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600"
                :title="`Running total up to this row`">{{ formatCurrency(item.accumulativeTotal) }}</td>
              <!-- <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.notes || '-' }}</td> -->
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="14" class="px-6 py-2 text-start text-sm text-gray-500">{{ $t('labels.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Section -->
      <div v-if="mappedItems.length > 0" class="bg-gray-50 border-t border-gray-200 px-4 py-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.totalRecords') }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ mappedItems.length }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.rowTotal') }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalAmount) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">{{ $t('labels.companyCapacity') }}</p>
            <p class="text-lg font-semibold text-indigo-600">{{ formatQuantity(totalQuantity) }} وحدة</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">متوسط السعر</p>
            <p class="text-lg font-semibold text-orange-600">{{ formatCurrency(averagePrice) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getSuppliesReportData, downloadSuppliesReport, getContractors, getLocations, getVehicles, getExportItems } from '@/api'
import { buildQueryParams } from '@/utils/buildQueryParams'

export default {
  name: 'SuppliesReport',
  setup() {
    const downloading = ref(false)
    const error = ref(null)
    const loading = ref(false)
    const rawItems = ref([])

    // Filter data
    const contractors = ref([])
    const locations = ref([])
    const items = ref([])
    const vehicles = ref([])

    const filters = ref({
      startDate: '',
      endDate: '',
      contractorId: '',
      contractorSearch: '',
      locationId: '',
      locationSearch: '',
      crusherId: '',
      itemId: '',
      itemSearch: '',
      vehicleId: '',
      vehicleSearch: '',
      showContractorDropdown: false,
      showLocationDropdown: false,
      showItemDropdown: false,
      showVehicleDropdown: false
    })

    /**
     * Load dropdown data
     */
    const loadFilterData = async () => {
      try {
        // Load contractors
        const contractorsRes = await getContractors({ pageSize: 1000 })
        const contractorsData = contractorsRes.data?.data || contractorsRes.data || []
        contractors.value = Array.isArray(contractorsData) ? contractorsData : []

        // Load locations
        const locationsRes = await getLocations()
        const locationsData = locationsRes.data?.data || locationsRes.data || []
        locations.value = Array.isArray(locationsData) ? locationsData : []

        // Load items
        const itemsRes = await getExportItems()
        const itemsData = itemsRes.data?.data || itemsRes.data || []
        items.value = Array.isArray(itemsData) ? itemsData : []

        // Load vehicles
        const vehiclesRes = await getVehicles({ pageSize: 1000 })
        const vehiclesData = vehiclesRes.data?.data || vehiclesRes.data || []
        vehicles.value = Array.isArray(vehiclesData) ? vehiclesData : []

        console.log('✓ Filter data loaded:', {
          contractors: contractors.value.length,
          locations: locations.value.length,
          items: items.value.length,
          vehicles: vehicles.value.length
        })
      } catch (err) {
        console.error('✗ Error loading filter data:', err)
      }
    }

    /**
     * Filtered lists for dropdowns
     */
    const filteredContractors = computed(() => {
      if (!filters.value.showContractorDropdown) return []
      if (!filters.value.contractorSearch) return contractors.value
      return contractors.value.filter(c =>
        c.name.toLowerCase().includes(filters.value.contractorSearch.toLowerCase())
      )
    })

    const filteredLocations = computed(() => {
      if (!filters.value.showLocationDropdown) return []
      if (!filters.value.locationSearch) return locations.value
      return locations.value.filter(l =>
        l.name.toLowerCase().includes(filters.value.locationSearch.toLowerCase())
      )
    })

    const filteredItems = computed(() => {
      if (!filters.value.showItemDropdown) return []
      if (!filters.value.itemSearch) return items.value
      return items.value.filter(i =>
        i.name.toLowerCase().includes(filters.value.itemSearch.toLowerCase())
      )
    })

    const filteredVehicles = computed(() => {
      if (!filters.value.showVehicleDropdown) return []
      if (!filters.value.vehicleSearch) return vehicles.value
      return vehicles.value.filter(v => {
        const displayName = v.plateNumber || v.name
        return displayName.toLowerCase().includes(filters.value.vehicleSearch.toLowerCase())
      })
    })

    /**
     * Data Mapping Layer
     * Maps raw API response to standardized format
     */
    const mapItem = (rawItem) => {
      return {
        id: rawItem.id,
        date: rawItem.date,
        crusher: rawItem.crusherName,
        location: rawItem.locationName,
        contractor: rawItem.contractorName,
        item: rawItem.itemName || '—',
        vehicle: rawItem.vehicleName || '—',
        companyTicket: rawItem.companyTicket,
        crusherTicket: rawItem.crusherTicket,
        companyCapacity: parseFloat(rawItem.companyCapacity) || 0,
        crusherCapacity: parseFloat(rawItem.crusherCapacity) || 0,
        unitPrice: parseFloat(rawItem.unitPrice) || 0,
        discount: parseFloat(rawItem.discount) || 0,
        rowTotal: parseFloat(rawItem.rowTotal) || 0,
        accumulativeTotal: parseFloat(rawItem.accumulativeTotal) || 0,
        notes: rawItem.notes
      }
    }

    /**
     * Mapped and cleaned items for display
     * Sorted by date (ascending)
     */
    const mappedItems = computed(() => {
      return rawItems.value
        .map(mapItem)
        .sort((a, b) => {
          // Handle DD/MM/YYYY format
          const parseDate = (dateStr) => {
            if (dateStr.includes('/')) {
              const [day, month, year] = dateStr.split('/')
              return new Date(year, month - 1, day)
            }
            return new Date(dateStr)
          }
          return parseDate(a.date) - parseDate(b.date)
        })
    })

    /**
     * Summary Calculations
     */
    const totalAmount = computed(() => {
      return mappedItems.value.reduce((sum, item) => sum + item.rowTotal, 0)
    })

    const totalQuantity = computed(() => {
      return mappedItems.value.reduce((sum, item) => sum + item.companyCapacity, 0)
    })

    const averagePrice = computed(() => {
      if (mappedItems.value.length === 0) return 0
      return totalAmount.value / mappedItems.value.length
    })

    /*
     =========== Formatting Functions =============
     */
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    // Handle DD/MM/YYYY format
    if (dateString.includes('/')) {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const [day, month, year] = parts
        // Basic validation
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
        }
      }
    }
    const date = new Date(dateString)
    if (isNaN(date)) return '-'
    // Use Intl.DateTimeFormat for consistent formatting
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  } catch {
    return '-'
  }
}

// Currency formatter
    const formatCurrency = (amount) => {
      const numAmount = parseFloat(String(amount).replace(/,/g, '')) || 0
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numAmount)
    }

    const formatQuantity = (value) => {
      const numValue = parseFloat(String(value).replace(/,/g, '')) || 0
      return numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    /**
     * Parse API response data
     */
    const extractItemsFromResponse = (response) => {
      const { data } = response

      // Handle { rows: [...] } format (primary)
      if (Array.isArray(data?.rows)) {
        return data.rows
      }

      // Handle direct array
      if (Array.isArray(data)) {
        return data
      }

      // Handle { items: [...] } format
      if (Array.isArray(data?.items)) {
        return data.items
      }

      // Handle { data: [...] } format
      if (Array.isArray(data?.data)) {
        return data.data
      }

      // Handle stringified JSON
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed?.rows)) return parsed.rows
          if (Array.isArray(parsed)) return parsed
          if (Array.isArray(parsed?.items)) return parsed.items
          if (Array.isArray(parsed?.data)) return parsed.data
        } catch {
          // ignore parse error
        }
      }

      return []
    }

    /**
     * Delayed dropdown close helper
     */
    const closeDropdownDelayed = (dropdownName) => {
      setTimeout(() => {
        filters.value[dropdownName] = false
      }, 200)
    }

    /**
     * Load report data
     */
    const loadReport = async () => {
      error.value = null

      // Validate dates
      if (!filters.value.startDate || !filters.value.endDate) {
        rawItems.value = []
        error.value = 'من فضلك حدد تاريخ البداية وتاريخ النهاية ثم اضغط بحث'
        return
      }

      // Validate date range
      try {
        const startDate = new Date(filters.value.startDate)
        const endDate = new Date(filters.value.endDate)
        if (endDate < startDate) {
          rawItems.value = []
          error.value = 'تأكد أن تاريخ النهاية بعد أو يساوي تاريخ البداية'
          return
        }
      } catch (e) {
        // let API handle parse errors
      }

      loading.value = true
      error.value = null

      try {
        // Prepare query params - exclude search fields
        const queryParams = {
          startDate: filters.value.startDate,
          endDate: filters.value.endDate,
          contractorId: filters.value.contractorId,
          locationId: filters.value.locationId,
          crusherId: filters.value.crusherId,
          itemId: filters.value.itemId,
          vehicleId: filters.value.vehicleId
        }

        const response = await getSuppliesReportData(
          buildQueryParams(queryParams),
          'json'
        )

        const items = extractItemsFromResponse(response)
        rawItems.value = items

        console.log('✓ Loaded items count:', items.length)
        if (items.length > 0) {
          console.log('✓ First mapped item:', mapItem(items[0]))
        }
      } catch (err) {
        console.error('✗ Error loading supplies report:', err)
        error.value = err.response?.data?.message || 'Failed to load report'
      } finally {
        loading.value = false
      }
    }

    /**
     * Refresh report
     */
    const refresh = async () => {
      await loadReport()
    }

    /**
     * Clear filters
     */
    const clearFilters = () => {
      filters.value = {
        startDate: '',
        endDate: '',
        contractorId: '',
        contractorSearch: '',
        locationId: '',
        locationSearch: '',
        crusherId: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: '',
        showContractorDropdown: false,
        showLocationDropdown: false,
        showItemDropdown: false,
        showVehicleDropdown: false
      }
      rawItems.value = []
    }

    /**
     * Download report as Excel
     */
    const downloadReport = async () => {
      downloading.value = true
      error.value = null

      try {
        // Prepare query params - exclude search fields
        const queryParams = {
          startDate: filters.value.startDate,
          endDate: filters.value.endDate,
          contractorId: filters.value.contractorId,
          locationId: filters.value.locationId,
          crusherId: filters.value.crusherId,
          itemId: filters.value.itemId,
          vehicleId: filters.value.vehicleId
        }

        const { data, headers } = await downloadSuppliesReport(
          buildQueryParams(queryParams),
          'xlsx'
        )

        const filename = `supplies-report-${filters.value.startDate}_${filters.value.endDate}.xlsx`
        const blob = new Blob([data], {
          type: headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('✗ Error downloading report:', err)
        error.value = err.response?.data?.message || 'Failed to download report'
      } finally {
        downloading.value = false
      }
    }

    /**
     * Initialize component
     */
    onMounted(() => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

      filters.value.endDate = endDate.toISOString().split('T')[0]
      filters.value.startDate = startDate.toISOString().split('T')[0]

      // Load filter data
      loadFilterData()
    })

    return {
      downloading,
      error,
      loading,
      mappedItems,
      filters,
      contractors,
      locations,
      items,
      vehicles,
      filteredContractors,
      filteredLocations,
      filteredItems,
      filteredVehicles,
      totalAmount,
      totalQuantity,
      averagePrice,
      formatDate,
      formatCurrency,
      formatQuantity,
      loadReport,
      refresh,
      clearFilters,
      downloadReport,
      loadFilterData,
      closeDropdownDelayed
    }
  }
}
</script>

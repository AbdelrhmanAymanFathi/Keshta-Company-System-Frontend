<template>
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start md:items-center justify-center"
    style="margin-top: 0%;" @click="onBackdropClick">
    <div ref="modal"
      :class="['relative mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto', { 'animate-shake': shake }]"
      @click.stop @keydown.alt.s.prevent="submitForm" @keydown.alt.c.prevent="calculateFare" tabindex="-1">
      <!-- Modal Header -->
      <div class="flex justify-between items-center pb-4 border-b">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEditing ? $t('transport.editTransport') : $t('transport.addTransport') }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="submitForm" class="mt-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.date') }} *
            </label>
            <input v-model="form.date" type="date" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

          <!-- Contractor (optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.contractor') }}
            </label>
            <select v-model="form.contractorId" @change="onContractorChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">{{ $t('transport.selectContractor') }}</option>
              <option value="__add__">+ {{ $t('contractors.addContractor') }}</option>
              <option v-for="contractor in contractors" :key="contractor.id" :value="contractor.id">
                {{ contractor.name }} - {{ contractor.phone }}
              </option>
            </select>
          </div>

          <!-- Transport Category (e.g. تربه / سن) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.category') }}
            </label>
            <select v-model="form.category" @change="onCategoryChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">{{ $t('common.select') || 'Select' }}</option>
              <option value="__add__">+ {{ $t('transport.addCategory') }}</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- From Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.fromLocation') }} *
            </label>
            <select v-model="form.fromLocId" @change="onFromLocChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required>
              <option value="">{{ $t('common.select') }}</option>
              <option value="__add__">+ {{ $t('supply.addSite') }}</option>
              <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name + (loc.parentName ? ' (' + loc.parentName + ')' : '') }}</option>
            </select>
          </div>

          <!-- To Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.toLocation') }} *
            </label>
            <select v-model="form.toLocId" @change="onToLocChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required>
              <option value="">{{ $t('common.select') }}</option>
              <option value="__add__">+ {{ $t('supply.addSite') }}</option>
              <option v-for="loc in locations" :key="loc.id + '-to'" :value="loc.id">{{ loc.name + (loc.parentName ? ' (' + loc.parentName + ')' : '') }}</option>
            </select>
          </div>

          <!-- Number of Trips -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.numTrips') }} *
            </label>
            <input v-model.number="form.numTrips" type="number" min="1" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

          <!-- Distance -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.distanceKm') }} *
            </label>
            <input v-model.number="form.distanceKm" type="number" step="0.1" min="0" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

          <!-- Pricing: First Km (hidden, fixed = 1) -->
          <!-- القيمة ثابتة للمطور ولن تظهر للمستخدم -->
          <input type="hidden" v-model.number="form.firstKm">

          <!-- Pricing: First Km Price -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.firstKmPrice') }}
            </label>
            <input v-model.number="form.firstKmPrice" type="number" step="0.01" min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

          <!-- Pricing: Per Km Price -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.perKmPrice') }}
            </label>
            <input v-model.number="form.perKmPrice" type="number" step="0.01" min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

          <!-- Discount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('labels.discount') }}
            </label>
            <input v-model.number="form.discount" type="number" step="0.01" min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

          <!-- Vehicle Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('labels.vehicle') }} *
            </label>
            <select v-model="form.vehicleId" @change="onVehicleSelectChange" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">{{ $t('transport.selectVehicle') }}</option>
              <option value="__add__">+ {{ $t('vehicles.add') }}</option>
              <option v-for="vehicle in availableVehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.name }} - {{ vehicle.company || '' }} {{ vehicle.crusherNumber ? `(${vehicle.crusherNumber})`
                  : '' }}
              </option>
            </select>
            <p v-if="vehicleCapacityMissing" class="mt-1 text-xs text-amber-600">
              {{ $t('transport.vehicleCapacityMissing') || 'Selected vehicle has no cubic capacity set. Pricing will assume capacity = 1.' }}
            </p>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('transport.notes') }}
          </label>
          <textarea v-model="form.notes" rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
        </div>

        <!-- Total Display / Fare Preview -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <div class="text-sm text-gray-600">Base per-trip fare (distance)</div>
              <div class="text-lg font-semibold text-gray-900">{{ basePerTripFareDisplay }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Vehicle cubic capacity</div>
              <div class="text-lg font-semibold text-gray-900">{{ vehicleCapacityDisplay }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Per-trip fare (after capacity)</div>
              <div class="text-lg font-semibold text-gray-900">{{ perTripFareDisplay }}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-4">
            <div>
              <div class="text-sm text-gray-600">{{ $t('transport.trips') }} × per-trip</div>
              <div class="text-lg font-semibold text-gray-900">{{ subtotalDisplay }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">{{ $t('labels.discount') }}</div>
              <div class="text-lg font-semibold text-gray-900">{{ discountDisplay }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">{{ $t('transport.total') }}</div>
              <div class="text-xl font-bold text-indigo-600">{{ totalDisplay }}</div>
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button type="button" @click="calculateFare" :disabled="calculating || !canCalculate"
              class="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors flex items-center gap-2">
              <div v-if="calculating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Calculate Fare (Alt+C)
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ $t('common.error') }}</h3>
              <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Add Contractor Dialog -->
        <div v-if="showAddContractor" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow w-96">
            <h3 class="text-lg font-bold mb-2">{{ $t('contractors.addContractor') }}</h3>
            <label class="block text-sm mb-1">{{ $t('contractors.name') }}</label>
            <input id="new-contractor-name" v-model="newContractorName" :placeholder="$t('contractors.name')" class="w-full border rounded px-2 py-1 mb-3" />
            <label class="block text-sm mb-1">{{ $t('contractors.phone') }}</label>
            <input v-model="newContractorPhone" :placeholder="$t('contractors.phone')" class="w-full border rounded px-2 py-1 mb-3" />
            <div class="flex gap-2 justify-end">
              <button @click="cancelAddContractor" class="px-3 py-1 rounded bg-gray-100">{{ $t('common.cancel') }}</button>
              <button @click="addContractor" :disabled="addingContractor" class="px-3 py-1 rounded bg-indigo-600 text-white">{{ $t('contractors.add') }}</button>
            </div>
          </div>
        </div>

        <!-- Add Vehicle Dialog -->
        <div v-if="showAddVehicle" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow w-96">
            <h3 class="text-lg font-bold mb-2">{{ $t('vehicles.addVehicle') }}</h3>
            <label class="block text-sm mb-1">{{ $t('vehicles.name') }}</label>
            <input id="new-vehicle-name" v-model="newVehicleName" :placeholder="$t('vehicles.namePlaceholder')" class="w-full border rounded px-2 py-1 mb-3" />
            <label class="block text-sm mb-1">{{ $t('vehicles.company') }}</label>
            <input v-model="newVehicleCompany" :placeholder="$t('vehicles.companyPlaceholder')" class="w-full border rounded px-2 py-1 mb-3" />
            <label class="block text-sm mb-1">{{ $t('vehicles.cubicCapacity') }}</label>
            <input v-model="newVehicleCubic" :placeholder="$t('vehicles.cubicCapacityPlaceholder')" class="w-full border rounded px-2 py-1 mb-3" />
            <div class="flex gap-2 justify-end">
              <button @click="cancelAddVehicle" class="px-3 py-1 rounded bg-gray-100">{{ $t('common.cancel') }}</button>
              <button @click="addVehicle" :disabled="addingVehicle || !form.contractorId" class="px-3 py-1 rounded bg-indigo-600 text-white">{{ $t('vehicles.addVehicle') }}</button>
            </div>
          </div>
        </div>

        <!-- Add Location Dialog -->
        <div v-if="showAddLocation" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow w-96">
            <h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3>
            <label class="block text-sm mb-1">{{ $t('supply.name') }}</label>
            <input id="new-location-name" v-model="newLocationName" :placeholder="$t('supply.siteName')" class="w-full border rounded px-2 py-1 mb-3" />
            <label class="block text-sm mb-1">{{ $t('supply.under') }}</label>
            <select v-model="newLocationParentId" class="w-full border rounded px-2 py-1 mb-3">
              <option :value="null">{{ $t('common.select') }}</option>
              <option v-for="loc in locations" :key="loc.id + '-parent'" :value="loc.id">{{ loc.name }}</option>
            </select>
            <div class="flex gap-2 justify-end">
              <button @click="cancelAddLocation" class="px-3 py-1 rounded bg-gray-100">{{ $t('common.cancel') }}</button>
              <button @click="addLocation" :disabled="addingLocation" class="px-3 py-1 rounded bg-indigo-600 text-white">{{ $t('supply.add') }}</button>
            </div>
          </div>
        </div>

        <!-- Add Location Dialog -->
        <div v-if="showAddLocation" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow w-96">
            <h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3>
            <label class="block text-sm mb-1">{{ $t('supply.name') }}</label>
            <input id="new-location-name" v-model="newLocationName" :placeholder="$t('supply.siteName')" class="w-full border rounded px-2 py-1 mb-3" />
            <label class="block text-sm mb-1">{{ $t('supply.under') }}</label>
            <select v-model="newLocationParentId" class="w-full border rounded px-2 py-1 mb-3">
              <option :value="null">{{ $t('common.select') }}</option>
              <option v-for="loc in locations" :key="loc.id + '-parent'" :value="loc.id">{{ loc.name }}</option>
            </select>
            <div class="flex gap-2 justify-end">
              <button @click="cancelAddLocation" class="px-3 py-1 rounded bg-gray-100">{{ $t('common.cancel') }}</button>
              <button @click="addLocation" :disabled="addingLocation" class="px-3 py-1 rounded bg-indigo-600 text-white">{{ $t('supply.add') }}</button>
            </div>
          </div>
        </div>

        <!-- Add Category Dialog -->
        <div v-if="showAddCategory" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow w-96">
            <h3 class="text-lg font-bold mb-2">{{ $t('transport.addCategory') }}</h3>
            <label class="block text-sm mb-1">{{ $t('transport.categoryName') }}</label>
            <input id="new-category-name" v-model="newCategoryName" :placeholder="$t('transport.categoryNamePlaceholder')" class="w-full border rounded px-2 py-1 mb-3" />
            <div class="flex gap-2 justify-end">
              <button @click="cancelAddCategory" class="px-3 py-1 rounded bg-gray-100">{{ $t('common.cancel') }}</button>
              <button @click="addCategory" :disabled="addingCategory" class="px-3 py-1 rounded bg-indigo-600 text-white">{{ $t('transport.addCategory') }}</button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors flex items-center gap-2">
            <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ isEditing ? $t('common.update') : $t('common.create') }} (Alt+S)
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import {
  createTransport,
  updateTransport,
  getContractors,
  calculateTransportFare,
  getContractorsWithVehicles,
  createContractor,
  createVehicle,
  getLocations,
  createLocation
} from '@/api'

export default {
  name: 'NewTransport',
  props: {
    transport: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        date: '',
        contractorId: '',
        category: '',
        fromLoc: '',
        toLoc: '',
        fromLocId: null,
        toLocId: null,
        numTrips: 1,
        distanceKm: 0,
        vehicleId: '',
        notes: '',
        // First Km fixed to 1 and hidden from user
        firstKm: 1,
        firstKmPrice: 0,
        perKmPrice: 0,
        discount: 0
      },
      contractors: [],
      contractorsWithVehicles: [],
      // locations for from/to
      locations: [],
      // transport categories
      categories: [],
      showAddContractor: false,
      newContractorName: '',
      newContractorPhone: '',
      addingContractor: false,
      showAddVehicle: false,
      newVehicleName: '',
      newVehicleCompany: '',
      newVehicleCubic: '',
      newVehicleCrusherNumber: '',
      addingVehicle: false,
      showAddLocation: false,
      newLocationName: '',
      newLocationParentId: null,
      addingLocation: false,
      showAddCategory: false,
      newCategoryName: '',
      addingCategory: false,
      loading: false,
      calculating: false,
      error: null,
      perTripFare: null,
      basePerTripFare: null,
      vehicleCapacitySnapshot: null,
      subtotal: null,
      effectiveRate: null,
      totalFromServer: null,
      // shake state
      shake: false
    }
  },
  computed: {
    isEditing() { return !!this.transport },
    totalDisplay() {
      const total = this.totalFromServer != null ? this.totalFromServer : 0
      return this.formatCurrency(total)
    },
    perTripFareDisplay() {
      return this.perTripFare != null ? this.formatCurrency(this.perTripFare) : '-'
    },
    basePerTripFareDisplay() {
      return this.basePerTripFare != null ? this.formatCurrency(this.basePerTripFare) : '-'
    },
    vehicleCapacityDisplay() {
      if (this.vehicleCapacitySnapshot == null) return '-'
      return this.vehicleCapacitySnapshot
    },
    subtotalDisplay() {
      return this.subtotal != null ? this.formatCurrency(this.subtotal) : '-'
    },
    discountDisplay() {
      const discount = parseFloat(this.form.discount || 0)
      return discount > 0 ? this.formatCurrency(discount) : this.formatCurrency(0)
    },
    effectiveRateDisplay() {
      return this.effectiveRate != null ? this.effectiveRate.toFixed(2) : '-'
    },
    canCalculate() {
      // firstKm is fixed so only check prices for per-km or firstKmPrice
      return this.form.distanceKm > 0 && this.form.numTrips > 0 && (this.form.firstKmPrice > 0 || this.form.perKmPrice > 0)
    },
    availableVehicles() {
      if (!this.form.contractorId) return []
      const contractor = this.contractorsWithVehicles.find(c => c.id === parseInt(this.form.contractorId))
      return contractor ? contractor.vehicles || [] : []
    },
    vehicleCapacityMissing() {
      if (!this.form.vehicleId) return false
      const vehicle = this.availableVehicles.find(v => v.id === parseInt(this.form.vehicleId))
      return !vehicle || vehicle.cubicCapacity == null
    }
  },
  async mounted() {
    await this.loadContractors()
    await this.loadLocations()
    await this.loadCategories()
    if (this.isEditing) {
      this.populateForm()
    } else {
      this.form.date = new Date().toISOString().split('T')[0]
      // ensure firstKm is always 1
      this.form.firstKm = 1
    }
  },
  methods: {
    async loadContractors() {
      try {
        const [contractorsResponse, contractorsWithVehiclesResponse] = await Promise.all([
          getContractors(),
          getContractorsWithVehicles()
        ])
        const contractorsPayload = contractorsResponse.data || {}
        this.contractors = Array.isArray(contractorsPayload.items)
          ? contractorsPayload.items
          : Array.isArray(contractorsPayload.data)
            ? contractorsPayload.data
            : Array.isArray(contractorsPayload)
              ? contractorsPayload
              : []

        const contractorsWithVehiclesPayload = contractorsWithVehiclesResponse.data || {}
        this.contractorsWithVehicles = Array.isArray(contractorsWithVehiclesPayload.items)
          ? contractorsWithVehiclesPayload.items
          : Array.isArray(contractorsWithVehiclesPayload.data)
            ? contractorsWithVehiclesPayload.data
            : Array.isArray(contractorsWithVehiclesPayload)
              ? contractorsWithVehiclesPayload
              : []
      } catch (error) {
        console.error('Error loading contractors:', error)
      }
    },

    async loadLocations() {
      try {
        const res = await getLocations()
        const payload = res.data || []
        // normalize to array of objects with id,name,parentId and attach parentName when possible
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload.items) ? payload.items : [])
        const byId = {}
        list.forEach(l => { if (l && l.id) byId[l.id] = l.name })
        this.locations = list.map(l => ({ ...l, parentName: l && l.parentId ? byId[l.parentId] : null }))
      } catch (e) {
        console.warn('Failed to load locations', e)
      }
    },

    async loadCategories() {
      // Load categories from localStorage or use defaults
      try {
        const stored = localStorage.getItem('transportCategories')
        if (stored) {
          this.categories = JSON.parse(stored)
        } else {
          // Initialize with default categories if none stored
          this.categories = ['تربه', 'سن']
          localStorage.setItem('transportCategories', JSON.stringify(this.categories))
        }
      } catch (e) {
        console.warn('Failed to load categories', e)
        this.categories = ['تربه', 'سن']
      }
    },

    onContractorChange() {
      // if user selected add marker, open add contractor dialog
      if (this.form.contractorId === '__add__') {
        this.form.contractorId = ''
        this.showAddContractor = true
        this.$nextTick(() => {
          const el = this.$el.querySelector('#new-contractor-name')
          if (el) el.focus()
        })
        return
      }
      this.form.vehicleId = ''
    },

    // Add contractor inline
    async addContractor() {
      if (!this.newContractorName) return
      this.addingContractor = true
      try {
        const payload = { name: String(this.newContractorName).trim(), phone: String(this.newContractorPhone || '').trim() }
        const { data } = await createContractor(payload)
        // reload contractors and set selected
        await this.loadContractors()
        const created = data && data.id ? data : (Array.isArray(data) ? data[0] : null)
        if (created && created.id) {
          this.form.contractorId = String(created.id)
        }
        this.showAddContractor = false
        this.newContractorName = ''
        this.newContractorPhone = ''
      } catch (e) {
        console.error('addContractor failed', e)
        this.error = e.response?.data?.message || this.$t('contractors.addError')
      } finally {
        this.addingContractor = false
      }
    },

    cancelAddContractor() {
      this.showAddContractor = false
      this.newContractorName = ''
      this.newContractorPhone = ''
    },

    populateForm() {
      let formattedDate = ''
      if (this.transport?.date) {
        try {
          const date = new Date(this.transport.date)
          formattedDate = date.toISOString().split('T')[0]
        } catch (error) {
          formattedDate = this.transport.date.split('T')[0] || ''
        }
      }

      this.form = {
        date: formattedDate,
        contractorId: this.transport?.contractorId || '',
        category: this.transport?.category || '',
        fromLoc: this.transport?.fromLoc || '',
        toLoc: this.transport?.toLoc || '',
        fromLocId: this.transport?.fromLocId || this.transport?.fromLocationId || null,
        toLocId: this.transport?.toLocId || this.transport?.toLocationId || null,
        numTrips: parseInt(this.transport?.numTrips) || 1,
        distanceKm: parseFloat(this.transport?.distanceKm) || 0,
        vehicleId: this.transport?.vehicleId || '',
        notes: this.transport?.notes || '',
        // keep firstKm from transport if present, otherwise enforce 1
        firstKm: (this.transport?.pricing?.firstKm != null) ? parseFloat(this.transport.pricing.firstKm) : 1,
        firstKmPrice: this.transport?.pricing?.firstKmPrice || 0,
        perKmPrice: this.transport?.pricing?.perKmPrice || 0,
        discount: parseFloat(this.transport?.discount || 0)
      }

      // Ensure firstKm is always 1 in runtime
      this.form.firstKm = 1

      // If ids are not present but names are, try to resolve ids from loaded locations
      if ((!this.form.fromLocId || !this.form.toLocId) && this.locations && this.locations.length) {
        if (!this.form.fromLocId && this.form.fromLoc) {
          const f = this.locations.find(l => l.name === this.form.fromLoc)
          if (f) this.form.fromLocId = f.id
        }
        if (!this.form.toLocId && this.form.toLoc) {
          const t = this.locations.find(l => l.name === this.form.toLoc)
          if (t) this.form.toLocId = t.id
        }
      }

      this.effectiveRate = this.transport?.rate ? parseFloat(this.transport.rate) : null
      this.totalFromServer = this.transport?.total ? parseFloat(this.transport.total) : null
    },

    // Vehicle add flow
    onVehicleSelectChange() {
      if (this.form.vehicleId === '__add__') {
        // open add vehicle dialog
        this.form.vehicleId = ''
        this.showAddVehicle = true
        this.$nextTick(() => {
          const el = this.$el.querySelector('#new-vehicle-name')
          if (el) el.focus()
        })
      }
    },

    async addVehicle() {
      if (!this.newVehicleName || !this.form.contractorId) return
      this.addingVehicle = true
      try {
        const payload = {
          name: String(this.newVehicleName).trim(),
          contractorId: parseInt(this.form.contractorId),
          company: this.newVehicleCompany || undefined,
          crusherNumber: this.newVehicleCrusherNumber || undefined,
          cubicCapacity: this.newVehicleCubic !== '' ? parseFloat(this.newVehicleCubic) : undefined
        }
        const { data } = await createVehicle(payload)
        // refresh contractorsWithVehicles to include new vehicle
        await this.loadContractors()
        const created = data && data.id ? data : null
        if (created && created.id) {
          this.form.vehicleId = String(created.id)
        }
        this.showAddVehicle = false
        this.newVehicleName = ''
        this.newVehicleCompany = ''
        this.newVehicleCrusherNumber = ''
        this.newVehicleCubic = ''
      } catch (e) {
        console.error('addVehicle failed', e)
        this.error = e.response?.data?.message || this.$t('vehicles.saveError')
      } finally {
        this.addingVehicle = false
      }
    },

    cancelAddVehicle() {
      this.showAddVehicle = false
      this.newVehicleName = ''
    },

    // Location add flow
    async onFromLocChange() {
      if (this.form.fromLocId === '__add__') {
        this.form.fromLocId = null
        this.showAddLocation = true
        this.$nextTick(() => {
          const el = this.$el.querySelector('#new-location-name')
          if (el) el.focus()
        })
        return
      }
      // when selecting an existing id, set the name for compatibility
      const id = this.form.fromLocId
      const loc = this.locations.find(l => String(l.id) === String(id))
      this.form.fromLoc = loc ? loc.name : ''
    },

    async onToLocChange() {
      if (this.form.toLocId === '__add__') {
        this.form.toLocId = null
        this.showAddLocation = true
        this.$nextTick(() => {
          const el = this.$el.querySelector('#new-location-name')
          if (el) el.focus()
        })
        return
      }
      const id = this.form.toLocId
      const loc = this.locations.find(l => String(l.id) === String(id))
      this.form.toLoc = loc ? loc.name : ''
    },

    async addLocation() {
      if (!this.newLocationName) return
      this.addingLocation = true
      try {
        const payload = { name: String(this.newLocationName).trim(), parentId: this.newLocationParentId || null }
        const { data } = await createLocation(payload)
        await this.loadLocations()
        const created = data && data.id ? data : null
        if (created && created.id) {
          // set current whichever field invoked dialog; user likely wants to set fromLocId or toLocId
          if (!this.form.fromLocId) {
            this.form.fromLocId = created.id
            this.form.fromLoc = created.name || ''
          } else if (!this.form.toLocId) {
            this.form.toLocId = created.id
            this.form.toLoc = created.name || ''
          }
        }
        this.showAddLocation = false
        this.newLocationName = ''
        this.newLocationParentId = null
      } catch (e) {
        console.error('addLocation failed', e)
        this.error = e.response?.data?.message || this.$t('supply.addError')
      } finally {
        this.addingLocation = false
      }
    },

    cancelAddLocation() {
      this.showAddLocation = false
      this.newLocationName = ''
      this.newLocationParentId = null
    },

    onCategoryChange() {
      // if user selected add marker, open add category dialog
      if (this.form.category === '__add__') {
        this.form.category = ''
        this.showAddCategory = true
        this.$nextTick(() => {
          const el = this.$el.querySelector('#new-category-name')
          if (el) el.focus()
        })
        return
      }
    },

    async addCategory() {
      if (!this.newCategoryName) return
      this.addingCategory = true
      try {
        const categoryName = String(this.newCategoryName).trim()
        // Check if category already exists
        if (this.categories.includes(categoryName)) {
          this.error = this.$t('transport.categoryExists')
          this.addingCategory = false
          return
        }
        // Add to categories list and save to localStorage
        this.categories.push(categoryName)
        localStorage.setItem('transportCategories', JSON.stringify(this.categories))
        // Set as selected
        this.form.category = categoryName
        this.showAddCategory = false
        this.newCategoryName = ''
      } catch (e) {
        console.error('addCategory failed', e)
        this.error = this.$t('common.saveError')
      } finally {
        this.addingCategory = false
      }
    },

    cancelAddCategory() {
      this.showAddCategory = false
      this.newCategoryName = ''
    },

    async calculateFare() {
      this.calculating = true
      this.error = null
      try {
        // enforce firstKm = 1 every time before calculating
        this.form.firstKm = 1

        const payload = {
          distanceKm: parseFloat(this.form.distanceKm),
          numTrips: parseInt(this.form.numTrips),
          firstKm: parseFloat(this.form.firstKm || 1),
          firstKmPrice: parseFloat(this.form.firstKmPrice || 0),
          perKmPrice: parseFloat(this.form.perKmPrice || 0),
          discount: parseFloat(this.form.discount || 0),
          vehicleId: this.form.vehicleId ? parseInt(this.form.vehicleId) : null
        }

        const { data } = await calculateTransportFare(payload)
        this.perTripFare = data?.perTripFare ?? null
        this.vehicleCapacitySnapshot = data?.vehicleCubicCapacity ?? null
        this.subtotal = data?.subtotal ?? null
        this.effectiveRate = data?.effectiveRate ?? null
        this.totalFromServer = data?.total ?? null

        // derive base fare per trip from capacity snapshot when available
        if (this.perTripFare != null) {
          const capacity = this.vehicleCapacitySnapshot || 1
          this.basePerTripFare = capacity > 0 ? this.perTripFare / capacity : this.perTripFare
        } else {
          this.basePerTripFare = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || this.$t('common.saveError')
      } finally {
        this.calculating = false
      }
    },

    async submitForm() {
      this.loading = true
      this.error = null

      try {
        // enforce firstKm = 1 before submit
        this.form.firstKm = 1

        const formData = {
          date: this.form.date,
          contractorId: this.form.contractorId ? parseInt(this.form.contractorId) : null,
          category: this.form.category ? this.form.category.trim() : null,
          fromLoc: this.form.fromLoc ? this.form.fromLoc.trim() : null,
          toLoc: this.form.toLoc ? this.form.toLoc.trim() : null,
          fromLocId: this.form.fromLocId ? (parseInt(this.form.fromLocId) || null) : null,
          toLocId: this.form.toLocId ? (parseInt(this.form.toLocId) || null) : null,
          numTrips: parseInt(this.form.numTrips),
          distanceKm: parseFloat(this.form.distanceKm),
          vehicleId: this.form.vehicleId ? parseInt(this.form.vehicleId) : null,
          notes: this.form.notes.trim(),
          discount: parseFloat(this.form.discount || 0)
        }

        // if pricing fields exist include them
        if (this.form.firstKm || this.form.firstKmPrice || this.form.perKmPrice) {
          formData.pricing = {
            // send firstKm explicitly as 1
            firstKm: 1,
            firstKmPrice: parseFloat(this.form.firstKmPrice || 0),
            perKmPrice: parseFloat(this.form.perKmPrice || 0)
          }
        }
        // require either id or name for from/to
        const hasFrom = !!(formData.fromLocId || (formData.fromLoc && String(formData.fromLoc).trim() !== ''))
        const hasTo = !!(formData.toLocId || (formData.toLoc && String(formData.toLoc).trim() !== ''))

        if (!formData.date || !hasFrom || !hasTo || !formData.vehicleId) {
          throw new Error('Please fill in all required fields')
        }

        if (this.isEditing) {
          await updateTransport(this.transport.id, formData)
          this.$emit('saved', { type: 'updated', transport: formData })
        } else {
          await createTransport(formData)
          this.$emit('saved', { type: 'created', transport: formData })
        }

        this.closeModal()
      } catch (error) {
        this.error = error.response?.data?.message || error.message || this.$t('common.saveError')
        console.error('Error saving transport:', error)
      } finally {
        this.loading = false
      }
    },

    closeModal() {
      this.$emit('close')
    },

    // when user clicks on backdrop — don't close, but animate shake
    onBackdropClick(e) {
      // Any click reaching here is backdrop click because modal has @click.stop
      this.triggerShake()
    },

    triggerShake() {
      if (this.shake) return // already shaking
      this.shake = true
      // remove shake class after animation duration (match CSS duration)
      setTimeout(() => {
        this.shake = false
        // return focus to modal for keyboard accessibility
        this.$nextTick(() => {
          if (this.$refs.modal && typeof this.$refs.modal.focus === 'function') {
            this.$refs.modal.focus()
          }
        })
      }, 500) // 500ms matches CSS animation duration below
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount)
    }
  }
}
</script>

<style scoped>
/* shake animation */
@keyframes shake {
  0% {
    transform: translateX(0);
  }

  10% {
    transform: translateX(-8px);
  }

  20% {
    transform: translateX(8px);
  }

  30% {
    transform: translateX(-6px);
  }

  40% {
    transform: translateX(6px);
  }

  50% {
    transform: translateX(-4px);
  }

  60% {
    transform: translateX(4px);
  }

  70% {
    transform: translateX(-2px);
  }

  80% {
    transform: translateX(2px);
  }

  90% {
    transform: translateX(-1px);
  }

  100% {
    transform: translateX(0);
  }
}

.animate-shake {
  animation: shake 0.5s ease;
  /* improve GPU rendering */
  will-change: transform;
}
</style>

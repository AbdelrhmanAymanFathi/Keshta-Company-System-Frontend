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
            <select v-model="form.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">{{ $t('common.select') || 'Select' }}</option>
              <option value="تربه">تربه</option>
              <option value="سن">سن</option>
            </select>
          </div>

          <!-- From Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.fromLocation') }} *
            </label>
            <input v-model="form.fromLoc" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

          <!-- To Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.toLocation') }} *
            </label>
            <input v-model="form.toLoc" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
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
              First Km Price
            </label>
            <input v-model.number="form.firstKmPrice" type="number" step="0.01" min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

          <!-- Pricing: Per Km Price -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Per Km Price
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
            <select v-model="form.vehicleId" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">{{ $t('transport.selectVehicle') }}</option>
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
  getContractorsWithVehicles
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

    onContractorChange() {
      this.form.vehicleId = ''
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

      this.effectiveRate = this.transport?.rate ? parseFloat(this.transport.rate) : null
      this.totalFromServer = this.transport?.total ? parseFloat(this.transport.total) : null
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
          fromLoc: this.form.fromLoc.trim(),
          toLoc: this.form.toLoc.trim(),
          numTrips: parseInt(this.form.numTrips),
          distanceKm: parseFloat(this.form.distanceKm),
          vehicleId: this.form.vehicleId ? parseInt(this.form.vehicleId) : null,
          notes: this.form.notes.trim(),
          discount: parseFloat(this.form.discount || 0)
        }

        if (this.form.firstKm || this.form.firstKmPrice || this.form.perKmPrice) {
          formData.pricing = {
            // send firstKm explicitly as 1
            firstKm: 1,
            firstKmPrice: parseFloat(this.form.firstKmPrice || 0),
            perKmPrice: parseFloat(this.form.perKmPrice || 0)
          }
        }

        if (!formData.date || !formData.fromLoc || !formData.toLoc || !formData.vehicleId) {
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

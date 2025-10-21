<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
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

          <!-- Contractor -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.contractor') }} *
            </label>
            <select v-model="form.contractorId" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">{{ $t('transport.selectContractor') }}</option>
              <option v-for="contractor in contractors" :key="contractor.id" :value="contractor.id">
                {{ contractor.name }} - {{ contractor.phone }}
              </option>
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

          <!-- Pricing: First Km -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              First Km
            </label>
            <input v-model.number="form.firstKm" type="number" step="1" min="0"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>

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

          

          <!-- Vehicle Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('transport.vehicle') }} *
            </label>
            <select v-model="form.vehicleId" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">{{ $t('transport.selectVehicle') }}</option>
              <option v-for="vehicle in availableVehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.name }} - {{ vehicle.company || '' }} {{ vehicle.crusherNumber ? `(${vehicle.crusherNumber})` : '' }}
              </option>
            </select>
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

        <!-- Total Display -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <div class="text-sm text-gray-600">Per-trip fare</div>
              <div class="text-lg font-semibold text-gray-900">{{ perTripFareDisplay }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">{{ $t('transport.rate') }}</div>
              <div class="text-lg font-semibold text-gray-900">{{ effectiveRateDisplay }}</div>
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
              Calculate Fare
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
            {{ isEditing ? $t('common.update') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { createTransport, updateTransport, getContractors, calculateTransportFare, getContractorsWithVehicles } from '@/api'

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
        fromLoc: '',
        toLoc: '',
        numTrips: 1,
        distanceKm: 0,
        vehicleId: '',
        notes: '',
        // pricing
        firstKm: 0,
        firstKmPrice: 0,
        perKmPrice: 0
      },
      contractors: [],
      contractorsWithVehicles: [],
      loading: false,
      calculating: false,
      error: null,
      // fare preview
      perTripFare: null,
      effectiveRate: null,
      totalFromServer: null
    }
  },
  computed: {
    isEditing() {
      return !!this.transport
    },
    totalDisplay() {
      const total = this.totalFromServer != null ? this.totalFromServer : 0
      return this.formatCurrency(total)
    },
    perTripFareDisplay() {
      return this.perTripFare != null ? this.formatCurrency(this.perTripFare) : '-'
    },
    effectiveRateDisplay() {
      return this.effectiveRate != null ? this.effectiveRate.toFixed(2) : '-'
    },
    canCalculate() {
      return this.form.distanceKm > 0 && this.form.numTrips > 0 && (this.form.firstKmPrice > 0 || this.form.perKmPrice > 0)
    },
    availableVehicles() {
      if (!this.form.contractorId) return []
      const contractor = this.contractorsWithVehicles.find(c => c.id === parseInt(this.form.contractorId))
      return contractor ? contractor.vehicles || [] : []
    }
  },
  async mounted() {
    await this.loadContractors()
    if (this.isEditing) {
      this.populateForm()
    } else {
      // Set default date to today
      this.form.date = new Date().toISOString().split('T')[0]
    }
  },
  methods: {
    async loadContractors() {
      try {
        const [contractorsResponse, contractorsWithVehiclesResponse] = await Promise.all([
          getContractors(),
          getContractorsWithVehicles()
        ])
        this.contractors = contractorsResponse.data || []
        this.contractorsWithVehicles = contractorsWithVehiclesResponse.data || []
      } catch (error) {
        console.error('Error loading contractors:', error)
      }
    },

    populateForm() {
      // Handle date formatting properly
      let formattedDate = ''
      if (this.transport.date) {
        try {
          const date = new Date(this.transport.date)
          formattedDate = date.toISOString().split('T')[0]
        } catch (error) {
          console.error('Error formatting date:', error)
          formattedDate = this.transport.date.split('T')[0] || ''
        }
      }

      this.form = {
        date: formattedDate,
        contractorId: this.transport.contractorId || '',
        fromLoc: this.transport.fromLoc || '',
        toLoc: this.transport.toLoc || '',
        numTrips: parseInt(this.transport.numTrips) || 1,
        distanceKm: parseFloat(this.transport.distanceKm) || 0,
        vehicleId: this.transport.vehicleId || '',
        notes: this.transport.notes || '',
        firstKm: this.transport.pricing?.firstKm || 0,
        firstKmPrice: this.transport.pricing?.firstKmPrice || 0,
        perKmPrice: this.transport.pricing?.perKmPrice || 0
      }
      // seed preview values if present
      this.effectiveRate = this.transport.rate ? parseFloat(this.transport.rate) : null
      this.totalFromServer = this.transport.total ? parseFloat(this.transport.total) : null
    },

    async calculateFare() {
      this.calculating = true
      this.error = null
      try {
        const payload = {
          distanceKm: parseFloat(this.form.distanceKm),
          numTrips: parseInt(this.form.numTrips),
          firstKm: parseFloat(this.form.firstKm || 0),
          firstKmPrice: parseFloat(this.form.firstKmPrice || 0),
          perKmPrice: parseFloat(this.form.perKmPrice || 0)
        }
        const { data } = await calculateTransportFare(payload)
        this.perTripFare = data?.perTripFare ?? null
        this.effectiveRate = data?.effectiveRate ?? null
        this.totalFromServer = data?.total ?? null
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
        // Prepare form data with proper validation
        const formData = {
          date: this.form.date,
          contractorId: parseInt(this.form.contractorId),
          fromLoc: this.form.fromLoc.trim(),
          toLoc: this.form.toLoc.trim(),
          numTrips: parseInt(this.form.numTrips),
          distanceKm: parseFloat(this.form.distanceKm),
          vehicleId: this.form.vehicleId ? parseInt(this.form.vehicleId) : null,
          notes: this.form.notes.trim()
        }

        // include pricing if provided
        if (this.form.firstKm || this.form.firstKmPrice || this.form.perKmPrice) {
          formData.pricing = {
            firstKm: parseFloat(this.form.firstKm || 0),
            firstKmPrice: parseFloat(this.form.firstKmPrice || 0),
            perKmPrice: parseFloat(this.form.perKmPrice || 0)
          }
        }
        // Do not send rate/total; backend derives them from pricing

        // Validate required fields
        if (!formData.date || !formData.contractorId || !formData.fromLoc || !formData.toLoc || !this.form.vehicleId) {
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
        console.error('Form data:', this.form)
      } finally {
        this.loading = false
      }
    },

    closeModal() {
      this.$emit('close')
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

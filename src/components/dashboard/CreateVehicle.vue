<template>
  <form class="mb-6 p-4 bg-white border rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4" @submit.prevent="onCreate">
    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.truckName') }}</label>
      <input v-model="form.name" type="text" :placeholder="$t('vehicles.truckName')" class="w-full border rounded px-3 py-2" required />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.contractor') }}</label>
      <div class="space-y-2">
        <select v-model="form.contractorId" @change="onContractorSelectChange" class="w-full border rounded px-3 py-2" required>
          <option value="">{{ $t('vehicles.selectContractor') }}</option>
          <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
          <option value="__new__">{{ $t('vehicles.addNewContractor') }}</option>
        </select>
        <input 
          v-if="form.contractorId === '__new__'"
          v-model="form.newContractorName" 
          type="text" 
          :placeholder="$t('vehicles.newContractorNamePlaceholder')" 
          class="w-full border rounded px-3 py-2" 
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.crusherNumber') }}</label>
      <div class="space-y-2">
        <select v-model="form.crusherId" @change="onCrusherSelectChange" class="w-full border rounded px-3 py-2">
          <option value="">{{ $t('vehicles.selectCrusher') }}</option>
          <option v-for="c in crushers" :key="c.id" :value="c.id">{{ c.name }}</option>
          <option value="__new__">{{ $t('vehicles.addNewCrusher') }}</option>
        </select>
        <input 
          v-if="form.crusherId === '__new__'"
          v-model="form.newCrusherName" 
          type="text" 
          :placeholder="$t('vehicles.newCrusherNamePlaceholder')" 
          class="w-full border rounded px-3 py-2" 
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.driver') || 'Driver' }}</label>
      <div class="space-y-2">
        <select v-model="form.driverId" @change="onDriverSelectChange" class="w-full border rounded px-3 py-2">
          <option value="">{{ $t('vehicles.selectDriver') || 'Select Driver' }}</option>
          <option v-for="d in drivers" :key="d.id" :value="d.id">{{ d.name }}</option>
          <option value="__new__">{{ $t('vehicles.addNewDriver') || 'Add New Driver' }}</option>
        </select>
        <input 
          v-if="form.driverId === '__new__'"
          v-model="form.newDriverName" 
          type="text" 
          :placeholder="$t('vehicles.newDriverNamePlaceholder') || 'New Driver Name'" 
          class="w-full border rounded px-3 py-2" 
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.cubicCapacity') }}</label>
      <input v-model="form.cubicCapacity" type="number" min="0.01" step="0.01" required :placeholder="$t('vehicles.cubicCapacityPlaceholder')" class="w-full border rounded px-3 py-2" />
      <p v-if="form.cubicCapacity && Number(form.cubicCapacity) <= 0" class="text-xs text-red-600 mt-1">
        {{ $t('vehicles.validationPositiveNumber') }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('labels.crusherCubic') }}</label>
      <input v-model="form.crusherCubic" type="number" min="0.01" step="0.01" required :placeholder="$t('labels.crusherCubic')" class="w-full border rounded px-3 py-2" />
      <p v-if="form.crusherCubic && Number(form.crusherCubic) <= 0" class="text-xs text-red-600 mt-1">
        {{ $t('vehicles.validationPositiveNumber') }}
      </p>
    </div>

    <div class="md:col-span-4 flex items-center gap-3">
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded" :disabled="creating">
        {{ creating ? $t('labels.saving') : $t('vehicles.createVehicle') }}
      </button>
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">{{ $t('vehicles.createdSuccessfully') }}</div>
    </div>
  </form>
</template>

<script>
import { createVehicle, getContractors, getCrushers, createCrusher, createContractor, getDrivers, createDriver } from '../../api'

export default {
  name: 'CreateVehicle',
  data() {
    return {
      contractors: [],
      crushers: [],
      drivers: [],
      form: {
        name: '',
        contractorId: '',
        newContractorName: '',
        crusherId: '',
        crusherNumber: '',
        newCrusherName: '',
        driverId: '',
        newDriverName: '',
        cubicCapacity: '',
        crusherCubic: ''
      },
      creating: false,
      error: '',
      success: false
    }
  },
  methods: {
    async loadLookups() {
      try {
        const contractorsRes = await getContractors()
        const contractorsPayload = contractorsRes.data || {}
        this.contractors = Array.isArray(contractorsPayload.items)
          ? contractorsPayload.items
          : Array.isArray(contractorsPayload.data)
            ? contractorsPayload.data
            : Array.isArray(contractorsPayload)
              ? contractorsPayload
              : []
      } catch (error) {
        console.error('Error loading contractors:', error)
        this.contractors = []
      }
      try {
        const crushersRes = await getCrushers({ pageSize: 1000 })
        const crushersPayload = crushersRes.data || {}
        this.crushers = Array.isArray(crushersPayload.items)
          ? crushersPayload.items
          : Array.isArray(crushersPayload.data)
            ? crushersPayload.data
            : Array.isArray(crushersPayload)
              ? crushersPayload
              : []
      } catch (error) {
        console.error('Error loading crushers:', error)
        this.crushers = []
      }
      try {
        const driversRes = await getDrivers({ pageSize: 1000 })
        const driversPayload = driversRes.data || {}
        this.drivers = Array.isArray(driversPayload.items)
          ? driversPayload.items
          : Array.isArray(driversPayload.data)
            ? driversPayload.data
            : Array.isArray(driversPayload)
              ? driversPayload
              : []
      } catch (error) {
        console.error('Error loading drivers:', error)
        this.drivers = []
      }
    },
    onContractorSelectChange() {
      if (this.form.contractorId === '__new__') {
        this.form.newContractorName = ''
      } else {
        this.form.newContractorName = ''
      }
    },
    onCrusherSelectChange() {
      if (this.form.crusherId && this.form.crusherId !== '__new__') {
        const selectedCrusher = this.crushers.find(c => c.id === parseInt(this.form.crusherId))
        if (selectedCrusher) {
          this.form.crusherNumber = selectedCrusher.name
        }
      } else {
        this.form.crusherNumber = ''
        this.form.newCrusherName = ''
      }
    },
    onDriverSelectChange() {
      if (this.form.driverId === '__new__') {
        this.form.newDriverName = ''
      } else {
        this.form.newDriverName = ''
      }
    },
    async onCreate() {
      this.error = ''
      this.success = false
      
      // Validate numeric fields - both are required
      const cubicCapacityValue = this.form.cubicCapacity ? Number(this.form.cubicCapacity) : null
      const crusherCubicValue = this.form.crusherCubic ? Number(this.form.crusherCubic) : null
      
      // Check if cubicCapacity is empty
      if (!this.form.cubicCapacity || this.form.cubicCapacity === '') {
        this.error = this.$t('vehicles.cubicCapacityRequired') || 'Cubic Capacity is required'
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }
      
      // Check if crusherCubic is empty
      if (!this.form.crusherCubic || this.form.crusherCubic === '') {
        this.error = this.$t('vehicles.crusherCubicRequired') || 'Crusher Cubic is required'
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }
      
      if (cubicCapacityValue !== null && cubicCapacityValue <= 0) {
        this.error = this.$t('vehicles.validationPositiveNumber')
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }
      
      if (crusherCubicValue !== null && crusherCubicValue <= 0) {
        this.error = this.$t('vehicles.validationPositiveNumber')
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }
      
      this.creating = true
      try {
        let contractorId = this.form.contractorId
        let crusherNumber = this.form.crusherNumber || null
        let driverId = null

        // If user selected "add new contractor", create it first
        if (this.form.contractorId === '__new__' && this.form.newContractorName) {
          const newContractorName = this.form.newContractorName.trim()
          if (newContractorName) {
            try {
              const newContractorRes = await createContractor({ name: newContractorName })
              contractorId = newContractorRes.data.id
              // Add to local list for future use
              this.contractors.push(newContractorRes.data)
            } catch (e) {
              this.error = e?.response?.data?.message || this.$t('vehicles.contractorCreateError')
              if (window.$toast) {
                window.$toast(this.error, 'error', 5000)
              }
              return
            }
          }
        }

        // If user selected "add new crusher", create it first
        if (this.form.crusherId === '__new__' && this.form.newCrusherName) {
          const newCrusherName = this.form.newCrusherName.trim()
          if (newCrusherName) {
            try {
              const newCrusherRes = await createCrusher({ name: newCrusherName })
              crusherNumber = newCrusherRes.data.name
              // Add to local list for future use
              this.crushers.push(newCrusherRes.data)
            } catch (e) {
              this.error = e?.response?.data?.message || this.$t('vehicles.crusherCreateError')
              if (window.$toast) {
                window.$toast(this.error, 'error', 5000)
              }
              return
            }
          }
        }

        // If user selected "add new driver", create it first
        if (this.form.driverId === '__new__' && this.form.newDriverName) {
          const newDriverName = this.form.newDriverName.trim()
          if (newDriverName) {
            try {
              const newDriverRes = await createDriver({ name: newDriverName })
              driverId = newDriverRes.data.id
              // Add to local list for future use
              this.drivers.push(newDriverRes.data)
            } catch (e) {
              this.error = e?.response?.data?.message || this.$t('vehicles.driverCreateError')
              if (window.$toast) {
                window.$toast(this.error, 'error', 5000)
              }
              return
            }
          }
        } else if (this.form.driverId && this.form.driverId !== '__new__') {
          driverId = this.form.driverId
        }

        const payload = {
          name: this.form.name,
          contractorId: contractorId,
          crusherNumber: crusherNumber
        }

        // Include driverId if selected/created
        if (driverId) {
          payload.driverId = driverId
        }
        
        // Only include cubicCapacity if it's a valid number > 0
        if (cubicCapacityValue !== null && cubicCapacityValue > 0) {
          payload.cubicCapacity = cubicCapacityValue
        }
        
        // Only include crusherCubic if it's a valid number > 0
        if (crusherCubicValue !== null && crusherCubicValue > 0) {
          payload.crusherCubic = crusherCubicValue
        }
        
        await createVehicle(payload)
        this.success = true
        if (window.$toast) {
          window.$toast(this.$t('vehicles.createdSuccessfully') || 'Vehicle created successfully', 'success')
        }
        this.$emit('created')
        this.form.name = ''
        this.form.contractorId = ''
        this.form.newContractorName = ''
        this.form.crusherId = ''
        this.form.crusherNumber = ''
        this.form.newCrusherName = ''
        this.form.driverId = ''
        this.form.newDriverName = ''
        this.form.cubicCapacity = ''
        this.form.crusherCubic = ''
      } catch (e) {
        this.error = e?.response?.data?.message || this.$t('vehicles.saveError')
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
      } finally {
        this.creating = false
      }
    }
  },
  async mounted() {
    try {
      await this.loadLookups()
    } catch (e) {
      this.contractors = []
    }
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onCreate">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="sm:col-span-2 lg:col-span-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.truckName') }}</label>
        <input v-model="form.name" type="text" :placeholder="$t('vehicles.truckName')" class="w-full border rounded px-3 py-2" required />
      </div>

      <div class="sm:col-span-2 lg:col-span-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.contractor') }}</label>
        <div class="relative">
          <input
            type="text"
            class="w-full border rounded px-3 py-2"
            :placeholder="$t('vehicles.selectContractor')"
            v-model="contractorSearch"
            @focus="openContractorDropdown"
            @input="openContractorDropdown"
            aria-autocomplete="list"
            aria-haspopup="true"
            role="combobox"
            required
          />

          <div v-if="showContractorDropdown" class="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow max-h-56 overflow-auto">
            <button
              v-for="c in filteredContractors"
              :key="c.id"
              @click.prevent="selectContractor(c)"
              class="w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              <div class="flex items-center justify-between">
                <div class="truncate">{{ c.name }}</div>
                <div class="flex items-center gap-2 ml-4">
                  <span
                    v-if="c.availableForSupplies || c.availableForExports || c.isSupplier"
                    class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                  >
                    {{ $t('labels.supplies') }}
                  </span>
                  <span
                    v-if="c.availableForTransports || c.isTransporter"
                    class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                  >
                    {{ $t('labels.transport') }}
                  </span>
                </div>
              </div>
            </button>
            <div class="border-t px-3 py-2">
              <button @click.prevent="chooseAddNewContractor" class="text-indigo-600 hover:underline">{{ $t('vehicles.addNewContractor') }}</button>
            </div>
          </div>

          <input
            v-if="form.contractorId === '__new__'"
            ref="newContractorInput"
            v-model="form.newContractorName"
            type="text"
            :placeholder="$t('vehicles.newContractorNamePlaceholder')"
            class="w-full border rounded px-3 py-2 mt-2"
          />
        </div>
      </div>

      <div class="sm:col-span-2 lg:col-span-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.crusherNumber') }}</label>
        <div class="relative">
          <input
            type="text"
            class="w-full border rounded px-3 py-2"
            :placeholder="$t('vehicles.selectCrusher')"
            v-model="crusherSearch"
            @focus="openCrusherDropdown"
            @input="openCrusherDropdown"
            aria-autocomplete="list"
            aria-haspopup="true"
            role="combobox"
          />

          <div v-if="showCrusherDropdown" class="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow max-h-56 overflow-auto">
            <button
              v-for="c in filteredCrushers"
              :key="c.id"
              @click.prevent="selectCrusher(c)"
              class="w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              {{ c.name }}
            </button>
            <div class="border-t px-3 py-2">
              <button @click.prevent="chooseAddNewCrusher" class="text-indigo-600 hover:underline">{{ $t('vehicles.addNewCrusher') }}</button>
            </div>
          </div>

          <input
            v-if="form.crusherId === '__new__'"
            ref="newCrusherInput"
            v-model="form.newCrusherName"
            type="text"
            :placeholder="$t('vehicles.newCrusherNamePlaceholder')"
            class="w-full border rounded px-3 py-2 mt-2"
          />
        </div>
      </div>

      <!-- driver field removed -->

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.companyCapacity') }}</label>
        <input v-model="form.companyCapacity" type="number" min="0.01" step="0.01" required :placeholder="$t('vehicles.companyCapacityPlaceholder')" class="w-full border rounded px-3 py-2" />
        <p v-if="form.companyCapacity && Number(form.companyCapacity) <= 0" class="text-xs text-red-600 mt-1">
          {{ $t('vehicles.validationPositiveNumber') }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('labels.crusherCapacity') }}</label>
        <input v-model="form.crusherCapacity" type="number" min="0.01" step="0.01" required :placeholder="$t('labels.crusherCapacity')" class="w-full border rounded px-3 py-2" />
        <p v-if="form.crusherCapacity && Number(form.crusherCapacity) <= 0" class="text-xs text-red-600 mt-1">
          {{ $t('vehicles.validationPositiveNumber') }}
        </p>
      </div>

      <div class="flex items-center gap-3 justify-end sm:col-span-2 lg:col-span-3">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" :disabled="creating">
          {{ creating ? $t('labels.saving') : $t('vehicles.createVehicle') }}
        </button>
      </div>
    </div>

    <div>
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">{{ $t('vehicles.createdSuccessfully') }}</div>
    </div>
  </form>
</template>

<script>
import { createVehicle, getContractors, getCrushers, createCrusher, createContractor } from '../../../api'

export default {
  name: 'CreateVehicle',
  props: {
    mode: { type: String, default: 'transport' },
    prefilledContractorId: { type: Number, default: null },
    prefilledCrusherName: { type: String, default: null }
  },
  data() {
    return {
      contractors: [],
      crushers: [],
      // Searchable dropdown state
      contractorSearch: '',
      showContractorDropdown: false,
      crusherSearch: '',
      showCrusherDropdown: false,
      form: {
        name: '',
        contractorId: '',
        newContractorName: '',
        crusherId: '',
        crusherNumber: '',
        newCrusherName: '',
        
        companyCapacity: '',
        crusherCapacity: ''
      },
      creating: false,
      error: '',
      success: false
    }
  },
  computed: {
    filteredContractors() {
      if (!this.contractorSearch) return this.contractors
      return this.contractors.filter(c => (c.name || '').toLowerCase().includes(this.contractorSearch.toLowerCase()))
    },
    filteredCrushers() {
      if (!this.crusherSearch) return this.crushers
      return this.crushers.filter(c => (c.name || '').toLowerCase().includes(this.crusherSearch.toLowerCase()))
    }
  },
  methods: {
    handleOutsideClick(e) {
      if (!this.$el) return
      if (!this.$el.contains(e.target)) {
        this.showContractorDropdown = false
        this.showCrusherDropdown = false
      }
    },
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
      // drivers removed
    },
    onContractorSelectChange() {
      if (this.form.contractorId === '__new__') {
        this.form.newContractorName = ''
      } else {
        this.form.newContractorName = ''
      }
    },
    openContractorDropdown() {
      this.showContractorDropdown = true
    },
    selectContractor(c) {
      this.form.contractorId = c.id
      this.contractorSearch = c.name
      this.showContractorDropdown = false
      this.form.newContractorName = ''
    },
    chooseAddNewContractor() {
      this.form.contractorId = '__new__'
      this.contractorSearch = ''
      this.showContractorDropdown = false
      this.$nextTick(() => {
        this.$refs.newContractorInput?.focus?.()
      })
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
    openCrusherDropdown() {
      this.showCrusherDropdown = true
    },
    selectCrusher(c) {
      this.form.crusherId = c.id
      this.form.crusherNumber = c.name
      this.crusherSearch = c.name
      this.showCrusherDropdown = false
      this.form.newCrusherName = ''
    },
    chooseAddNewCrusher() {
      this.form.crusherId = '__new__'
      this.crusherSearch = ''
      this.showCrusherDropdown = false
      this.$nextTick(() => {
        this.$refs.newCrusherInput?.focus?.()
      })
    },
    // driver selection removed
    async onCreate() {
      this.error = ''
      this.success = false
      
      // Validate numeric fields - both are required
      const companyCapacityValue = this.form.companyCapacity ? Number(this.form.companyCapacity) : null
      const crusherCapacityValue = this.form.crusherCapacity ? Number(this.form.crusherCapacity) : null
      
      // Check if companyCapacity is empty
      if (!this.form.companyCapacity || this.form.companyCapacity === '') {
        this.error = this.$t('vehicles.companyCapacityRequired') || 'Company Capacity is required'
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }
      
      // Check if crusherCapacity is empty
      if (!this.form.crusherCapacity || this.form.crusherCapacity === '') {
        this.error = this.$t('vehicles.crusherCapacityRequired') || 'Crusher Capacity is required'
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }
      
      if (companyCapacityValue !== null && companyCapacityValue <= 0) {
        this.error = this.$t('vehicles.validationPositiveNumber')
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }
      
      if (crusherCapacityValue !== null && crusherCapacityValue <= 0) {
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
        // driverId removed

        // If user selected "add new contractor", create it first
        if (this.form.contractorId === '__new__' && this.form.newContractorName) {
          const newContractorName = this.form.newContractorName.trim()
          if (newContractorName) {
            try {
              const newContractorRes = await createContractor({ name: newContractorName })
              const createdList = newContractorRes.normalized || (Array.isArray(newContractorRes.data) ? newContractorRes.data : [newContractorRes.data])
              const chosen = createdList.find(c => c.availableForTransports) || createdList[0]
              if (chosen) {
                contractorId = chosen.id
                // Add all created to local list for future use
                createdList.forEach(c => this.contractors.push(c))
              }
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

        // driver creation/assignment removed

        const payload = {
          name: this.form.name,
          contractorId: contractorId,
          crusherNumber: crusherNumber,
          mode: this.mode
        }

        // driver assignment removed
        
        // Only include companyCapacity if it's a valid number > 0
        if (companyCapacityValue !== null && companyCapacityValue > 0) {
          payload.companyCapacity = companyCapacityValue
        }
        
        // Only include crusherCapacity if it's a valid number > 0
        if (crusherCapacityValue !== null && crusherCapacityValue > 0) {
          payload.crusherCapacity = crusherCapacityValue
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
        
        this.form.companyCapacity = ''
        this.form.crusherCapacity = ''
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
      
      // Pre-fill contractor if provided
      if (this.prefilledContractorId) {
        const contractor = this.contractors.find(c => c.id === this.prefilledContractorId)
        if (contractor) {
          this.selectContractor(contractor)
        }
      }
      
      // Pre-fill crusher if provided
      if (this.prefilledCrusherName) {
        const crusher = this.crushers.find(c => c.name === this.prefilledCrusherName)
        if (crusher) {
          this.selectCrusher(crusher)
        }
      }
    } catch (e) {
      this.contractors = []
    }
    document.addEventListener('click', this.handleOutsideClick)
  }
  ,
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  }
}
</script>

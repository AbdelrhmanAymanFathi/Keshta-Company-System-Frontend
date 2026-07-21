<template>
  <div>
    <!-- Contractor Modal -->
    <CreateContractorModal 
      :isOpen="showCreateContractorModal"
      :mode="mode"
      @created="handleContractorCreated"
      @cancel="showCreateContractorModal = false"
    />

    <!-- Crusher Modal -->
    <CreateCrusherModal 
      :isOpen="showCreateCrusherModal"
      @created="handleCrusherCreated"
      @cancel="showCreateCrusherModal = false"
    />

  <form class="space-y-4" @submit.prevent="onCreate">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="sm:col-span-2 lg:col-span-3">
        <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('vehicles.truckName') }}</label>
        <input v-model="form.name" type="text" :placeholder="$t('vehicles.truckName')" class="w-full border rounded px-3 py-2" required />
      </div>

      <div class="sm:col-span-2 lg:col-span-3">
        <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('vehicles.contractor') }}</label>
        <div class="relative">
          <input
            type="text"
            class="w-full border rounded px-3 py-2"
            :placeholder="$t('vehicles.selectContractor')"
            v-model="contractorSearch"
            @focus="openContractorDropdown"
            @input="openContractorDropdown"
            @blur="closeContractorDropdown"
            @keydown="handleContractorKeydown"
            aria-autocomplete="list"
            aria-haspopup="true"
            role="combobox"
            required
          />

          <div v-if="showContractorDropdown" ref="contractorOptions" class="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow max-h-56 overflow-auto">
            <button
              v-for="(c, i) in filteredContractors"
              :key="c.id"
              ref="contractorOptionItems"
              @click.prevent="selectContractor(c)"
              @mouseenter="contractorHighlightedIndex = i"
              :class="i === contractorHighlightedIndex ? 'w-full text-left px-3 py-2 theme-icon-bg' : 'w-full text-left px-3 py-2 hover:bg-gray-100'"
            >
              <div class="flex items-center justify-between">
                <div class="truncate">{{ c.name }}</div>
                <div class="flex items-center gap-2 ml-4">
                  <span
                    v-if="c.availableForSupplies || c.availableForExports || c.isSupplier"
                    class="text-xs bg-gray-100 theme-text-secondary px-2 py-0.5 rounded"
                  >
                    {{ $t('labels.supplies') }}
                  </span>
                  <span
                    v-if="c.availableForTransports || c.isTransporter"
                    class="text-xs bg-gray-100 theme-text-secondary px-2 py-0.5 rounded"
                  >
                    {{ $t('labels.transport') }}
                  </span>
                </div>
              </div>
            </button>
            <!-- 'Add new contractor' removed -->
          </div>
        </div>
      </div>

      <div class="sm:col-span-2 lg:col-span-3">
        <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('vehicles.crusherNumber') }}</label>
        <div class="relative">
          <input
            type="text"
            class="w-full border rounded px-3 py-2"
            :placeholder="$t('vehicles.selectCrusher')"
            v-model="crusherSearch"
            @focus="openCrusherDropdown"
            @input="openCrusherDropdown"
            @blur="closeCrusherDropdown"
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
              <button @click.prevent="chooseAddNewCrusher" class="theme-text hover:underline">{{ $t('vehicles.addNewCrusher') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- driver field removed -->

      <div>
        <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('vehicles.companyCapacity') }}</label>
        <input v-model="form.companyCapacity" type="number" min="0.01" step="0.01" required :placeholder="$t('vehicles.companyCapacityPlaceholder')" class="w-full border rounded px-3 py-2" />
        <p v-if="form.companyCapacity && Number(form.companyCapacity) <= 0" class="text-xs text-red-600 mt-1">
          {{ $t('vehicles.validationPositiveNumber') }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('labels.crusherCapacity') }}</label>
        <input v-model="form.crusherCapacity" type="number" min="0.01" step="0.01" required :placeholder="$t('labels.crusherCapacity')" class="w-full border rounded px-3 py-2" />
        <p v-if="form.crusherCapacity && Number(form.crusherCapacity) <= 0" class="text-xs text-red-600 mt-1">
          {{ $t('vehicles.validationPositiveNumber') }}
        </p>
      </div>

      <div class="flex items-center gap-3 justify-end sm:col-span-2 lg:col-span-3">
        <button type="submit" class="theme-button px-4 py-2 rounded disabled:opacity-50" :disabled="creating">
          {{ creating ? $t('labels.saving') : $t('vehicles.createVehicle') }}
        </button>
      </div>
    </div>

    <div>
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">{{ $t('vehicles.createdSuccessfully') }}</div>
    </div>
  </form>
  </div>
</template>

<script>
import { createVehicle, getContractors, getCrushers, getVehicles } from '../../../api'
import normalizeItem from '@/utils/normalizeItem'
import { normalizeVehicleName } from '@/utils/normalizeVehicleName'
import CreateContractorModal from './CreateContractorModal.vue'
import CreateCrusherModal from './CreateCrusherModal.vue'

export default {
  name: 'CreateVehicle',
  components: {
    CreateContractorModal,
    CreateCrusherModal
  },
  props: {
    mode: { type: String, default: 'transport' },
    prefilledContractorId: { type: Number, default: null },
    prefilledCrusherName: { type: String, default: null }
  },
  data() {
    return {
      contractors: [],
      crushers: [],
      existingVehicles: [],
      // Searchable dropdown state
      contractorSearch: '',
      showContractorDropdown: false,
      contractorHighlightedIndex: -1,
      crusherSearch: '',
      showCrusherDropdown: false,
      // Modal states
      showCreateContractorModal: false,
      showCreateCrusherModal: false,
      form: {
        name: '',
        contractorId: '',
        crusherId: '',
        crusherNumber: '',
        
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
      let filtered = this.contractors
      
      // Filter by mode
      if (this.mode === 'transport') {
        filtered = filtered.filter(c => c.availableForTransports || c.isTransporter)
      } else if (this.mode === 'supply') {
        filtered = filtered.filter(c => c.availableForSupplies || c.isSupplier || c.availableForExports)
      } else if (this.mode === 'equipment') {
        filtered = filtered.filter(c => c.availableForEquipmentRental)
      }
      
      // Filter by search
      if (!this.contractorSearch) return filtered
      return filtered.filter(c => (c.name || '').toLowerCase().includes(this.contractorSearch.toLowerCase()))
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
    async loadExistingVehicles() {
      try {
        const vehiclesRes = await getVehicles({ page: 1, pageSize: 1000, mode: this.mode })
        const vehiclesPayload = vehiclesRes.data || {}
        const vehicles = Array.isArray(vehiclesPayload.items)
          ? vehiclesPayload.items
          : Array.isArray(vehiclesPayload.data)
            ? vehiclesPayload.data
            : Array.isArray(vehiclesPayload)
              ? vehiclesPayload
              : []
        this.existingVehicles = vehicles.map(normalizeItem)
      } catch (error) {
        console.error('Error loading vehicles:', error)
        this.existingVehicles = []
      }
    },
    async loadLookups() {
      try {
        const contractorsRes = await getContractors({ mode: this.mode })
        const contractorsPayload = contractorsRes.data || {}
        let contractors = Array.isArray(contractorsPayload.items)
          ? contractorsPayload.items
          : Array.isArray(contractorsPayload.data)
            ? contractorsPayload.data
            : Array.isArray(contractorsPayload)
              ? contractorsPayload
              : []
        this.contractors = contractors.map(normalizeItem)
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
      await this.loadExistingVehicles()
      // drivers removed
    },
    openContractorDropdown() {
      this.showContractorDropdown = true
      this.contractorHighlightedIndex = -1
    },
    closeContractorDropdown() {
      // Delay closing to allow click events on dropdown items
      setTimeout(() => {
        this.showContractorDropdown = false
        this.contractorHighlightedIndex = -1
      }, 150)
    },
    selectContractor(c) {
      this.form.contractorId = c.id
      this.contractorSearch = c.name
      this.showContractorDropdown = false
      this.contractorHighlightedIndex = -1
    },
    chooseAddNewContractor() {
      this.showCreateContractorModal = true
      this.showContractorDropdown = false
    },
    handleContractorKeydown(e) {
      if (!this.showContractorDropdown && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
        this.showContractorDropdown = true
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = this.contractorHighlightedIndex >= 0
          ? Math.min(this.contractorHighlightedIndex + 1, this.filteredContractors.length - 1)
          : 0
        this.contractorHighlightedIndex = next
        this.scrollToContractorHighlighted()
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = this.contractorHighlightedIndex > 0 ? this.contractorHighlightedIndex - 1 : 0
        this.contractorHighlightedIndex = prev
        this.scrollToContractorHighlighted()
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (this.filteredContractors.length) {
          const pick = this.contractorHighlightedIndex >= 0 && this.contractorHighlightedIndex < this.filteredContractors.length
            ? this.contractorHighlightedIndex
            : 0
          this.selectContractor(this.filteredContractors[pick])
        }
        return
      }
      if (e.key === 'Escape') {
        this.showContractorDropdown = false
      }
    },
    scrollToContractorHighlighted() {
      this.$nextTick(() => {
        const container = this.$refs.contractorOptions
        const items = this.$refs.contractorOptionItems
        if (!container || !items) return
        const list = Array.isArray(items) ? items : [items]
        const idx = this.contractorHighlightedIndex
        if (idx < 0 || idx >= list.length) return
        const el = list[idx]
        if (!el) return
        const containerTop = container.scrollTop
        const containerHeight = container.clientHeight
        const elTop = el.offsetTop
        const elHeight = el.offsetHeight
        if (elTop < containerTop) {
          container.scrollTop = elTop
        } else if (elTop + elHeight > containerTop + containerHeight) {
          container.scrollTop = elTop + elHeight - containerHeight
        }
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
    },
    chooseAddNewCrusher() {
      this.showCreateCrusherModal = true
      this.showCrusherDropdown = false
    },
    // driver selection removed
    handleContractorCreated(contractor) {
      if (contractor) {
        this.contractors.push(contractor)
        this.selectContractor(contractor)
      }
      this.showCreateContractorModal = false
    },
    handleCrusherCreated(crusher) {
      if (crusher) {
        this.crushers.push(crusher)
        this.selectCrusher(crusher)
      }
      this.showCreateCrusherModal = false
    },
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
      
      const trimmedName = String(this.form.name || '').trim()
      if (!trimmedName) {
        this.error = this.$t('vehicles.validationName') || 'Name is required'
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }

      const duplicateVehicle = this.existingVehicles.find((vehicle) => {
        const existingName = String(vehicle?.name || '').trim()
        if (!existingName) return false
        // Exact match check
        if (existingName.toLowerCase() === trimmedName.toLowerCase()) return true
        // Canonical match check (reversed slash-separated names)
        return normalizeVehicleName(existingName) === normalizeVehicleName(trimmedName)
      })

      if (duplicateVehicle) {
        const existingName = String(duplicateVehicle.name || '').trim()
        const isReversedDuplicate = existingName.toLowerCase() !== trimmedName.toLowerCase()
          && existingName.includes('/')
        if (isReversedDuplicate) {
          this.error = this.$t('vehicles.nameExistsReversed', { existingName }) 
            || `This vehicle already exists as "${existingName}". The parts are the same in different order.`
        } else {
          this.error = this.$t('vehicles.nameExists') || 'A vehicle with this name already exists'
        }
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
        return
      }

      this.creating = true
      try {
        let contractorId = this.form.contractorId
        let crusherNumber = this.form.crusherNumber?.trim() || undefined

        const payload = {
          name: trimmedName,
          contractorId: contractorId,
          crusherNumber: crusherNumber,
          mode: this.mode
        }
        
        // Only include companyCapacity if it's a valid number > 0
        if (companyCapacityValue !== null && companyCapacityValue > 0) {
          payload.companyCapacity = companyCapacityValue
        }
        
        // Only include crusherCapacity if it's a valid number > 0
        if (crusherCapacityValue !== null && crusherCapacityValue > 0) {
          payload.crusherCapacity = crusherCapacityValue
        }
        
        await createVehicle(payload)
        this.existingVehicles.push({ name: trimmedName })
        this.success = true
        if (window.$toast) {
          window.$toast(this.$t('vehicles.createdSuccessfully') || 'Vehicle created successfully', 'success')
        }
        this.$emit('created')
        this.form.name = ''
        this.form.contractorId = ''
        this.form.crusherId = ''
        this.form.crusherNumber = ''
        this.contractorSearch = ''
        this.crusherSearch = ''
        
        this.form.companyCapacity = ''
        this.form.crusherCapacity = ''
      } catch (e) {
        let errorMsg = this.$t('vehicles.saveError') || 'Save failed'
        if (e?.response?.data) {
          const data = e.response.data
          if (typeof data.message === 'string') {
            errorMsg = data.message
          } else if (Array.isArray(data.message)) {
            errorMsg = data.message.join(', ')
          } else if (typeof data.error === 'string') {
            errorMsg = data.error
          }
        } else if (e?.message) {
          errorMsg = e.message
        }
        this.error = errorMsg
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

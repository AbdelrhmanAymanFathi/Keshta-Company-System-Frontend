<template>
  <form class="mb-6 p-4 bg-white border rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4" @submit.prevent="onCreate">
    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.truckName') }}</label>
      <input v-model="form.name" type="text" :placeholder="$t('vehicles.truckName')" class="w-full border rounded px-3 py-2" required />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.contractor') }}</label>
      <select v-model.number="form.contractorId" class="w-full border rounded px-3 py-2" required>
        <option disabled value="">{{ $t('vehicles.selectContractor') }}</option>
        <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
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
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.cubicCapacity') }}</label>
      <input v-model.number="form.cubicCapacity" type="number" step="any" :placeholder="$t('vehicles.cubicCapacityPlaceholder')" class="w-full border rounded px-3 py-2" />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('labels.crusherCubic') }}</label>
      <input v-model.number="form.crusherCubic" type="number" step="any" :placeholder="$t('labels.crusherCubic')" class="w-full border rounded px-3 py-2" />
    </div>

    <div class="md:col-span-4 flex items-center gap-3">
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded" :disabled="creating">
        {{ creating ? $t('common.saving') : $t('vehicles.createVehicle') }}
      </button>
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">{{ $t('vehicles.createdSuccessfully') }}</div>
    </div>
  </form>
</template>

<script>
import { createVehicle, getContractors, getCrushers, createCrusher } from '../../api'

export default {
  name: 'CreateVehicle',
  data() {
    return {
      contractors: [],
      crushers: [],
      form: {
        name: '',
        contractorId: '',
        crusherId: '',
        crusherNumber: '',
        newCrusherName: '',
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
    async onCreate() {
      this.error = ''
      this.success = false
      this.creating = true
      try {
        let crusherNumber = this.form.crusherNumber || null

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
              return
            }
          }
        }

        const payload = {
          name: this.form.name,
          contractorId: this.form.contractorId,
          crusherNumber: crusherNumber,
          cubicCapacity: this.form.cubicCapacity ? parseFloat(this.form.cubicCapacity) : null,
          crusherCubic: this.form.crusherCubic ? parseFloat(this.form.crusherCubic) : null
        }
        await createVehicle(payload)
        this.success = true
        this.$emit('created')
        this.form.name = ''
        this.form.contractorId = ''
        this.form.crusherId = ''
        this.form.crusherNumber = ''
        this.form.newCrusherName = ''
        this.form.cubicCapacity = ''
        this.form.crusherCubic = ''
      } catch (e) {
        this.error = e?.response?.data?.message || this.$t('vehicles.saveError')
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

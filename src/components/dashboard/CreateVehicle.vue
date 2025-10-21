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
      <input v-model="form.crusherNumber" type="text" :placeholder="$t('vehicles.crusherNumberPlaceholder')" class="w-full border rounded px-3 py-2" />
    </div>

    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.company') }}</label>
      <input v-model="form.company" type="text" :placeholder="$t('vehicles.companyPlaceholder')" class="w-full border rounded px-3 py-2" />
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
import { createVehicle, getContractors } from '../../api'

export default {
  name: 'CreateVehicle',
  data() {
    return {
      contractors: [],
      form: {
        name: '',
        contractorId: '',
        crusherNumber: '',
        company: ''
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
        this.contractors = Array.isArray(contractorsRes.data) ? contractorsRes.data : []
      } catch (error) {
        console.error('Error loading contractors:', error)
        this.contractors = []
      }
    },
    async onCreate() {
      this.error = ''
      this.success = false
      this.creating = true
      try {
        const payload = {
          name: this.form.name,
          contractorId: this.form.contractorId,
          crusherNumber: this.form.crusherNumber || null,
          company: this.form.company || null
        }
        await createVehicle(payload)
        this.success = true
        this.$emit('created')
        this.form.name = ''
        this.form.contractorId = ''
        this.form.crusherNumber = ''
        this.form.company = ''
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

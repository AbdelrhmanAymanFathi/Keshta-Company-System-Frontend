<template>
  <form class="mb-6 p-4 bg-white border rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4" @submit.prevent="onCreate">
    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input v-model="form.name" type="text" placeholder="Truck name" class="w-full border rounded px-3 py-2" required />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
      <select v-model.number="form.contractorId" class="w-full border rounded px-3 py-2" required>
        <option disabled value="">Select contractor</option>
        <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Crusher</label>
      <select v-model="form.crusherNumber" class="w-full border rounded px-3 py-2">
        <option value="">No crusher</option>
        <option v-for="cr in crushers" :key="cr.id" :value="cr.name">{{ cr.name }}</option>
      </select>
    </div>

    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
      <input v-model="form.company" type="text" placeholder="Company name" class="w-full border rounded px-3 py-2" />
    </div>

    <div class="md:col-span-4 flex items-center gap-3">
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded" :disabled="creating">
        {{ creating ? 'Creating...' : 'Create Vehicle' }}
      </button>
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">Vehicle created</div>
    </div>
  </form>
</template>

<script>
import { createVehicle, getContractors, getCrushers } from '../../api'

export default {
  name: 'CreateVehicle',
  data() {
    return {
      contractors: [],
      crushers: [],
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
      const [contractorsRes, crushersRes] = await Promise.all([
        getContractors(),
        getCrushers()
      ])
      this.contractors = Array.isArray(contractorsRes.data) ? contractorsRes.data : []
      this.crushers = Array.isArray(crushersRes.data) ? crushersRes.data : []
    },
    async onCreate() {
      this.error = ''
      this.success = false
      this.creating = true
      try {
        const payload = {
          name: this.form.name,
          contractorId: this.form.contractorId,
          crusherNumber: this.form.crusherNumber || undefined,
          company: this.form.company || undefined
        }
        await createVehicle(payload)
        this.success = true
        this.$emit('created')
        this.form.name = ''
        this.form.contractorId = ''
        this.form.crusherNumber = ''
        this.form.company = ''
      } catch (e) {
        this.error = e?.response?.data?.message || 'Failed to create vehicle'
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
      this.crushers = []
    }
  }
}
</script>

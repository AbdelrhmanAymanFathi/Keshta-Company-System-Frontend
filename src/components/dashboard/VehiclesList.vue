<template>
  <div>
    <CreateVehicle @created="loadVehicles" />

    <div class="space-y-4">
      <div v-for="(v, i) in vehicles" :key="i" class="p-4 border rounded-lg bg-white flex items-center justify-between">
        <div>
          <div class="font-semibold">{{ v.name }}</div>
          <div class="text-sm text-gray-500">Crusher #: {{ v.crusherNumber || '-' }}</div>
          <div class="text-sm text-gray-500">Company: {{ v.company || '-' }}</div>
          <div class="text-sm text-gray-500" v-if="v.contractor">Contractor: {{ v.contractor.name }}</div>
        </div>
        <div class="text-sm">ID: {{ v.id }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getVehicles } from '../../api'
import CreateVehicle from './CreateVehicle.vue'

export default {
  name: 'VehiclesList',
  components: { CreateVehicle },
  data() {
    return {
      vehicles: []
    }
  },
  methods: {
    async loadVehicles() {
      const res = await getVehicles();
      this.vehicles = Array.isArray(res.data) ? res.data : [];
    }
  },
  async mounted() {
    try {
      await this.loadVehicles()
    } catch (e) {
      this.vehicles = []
    }
  }
}
</script>

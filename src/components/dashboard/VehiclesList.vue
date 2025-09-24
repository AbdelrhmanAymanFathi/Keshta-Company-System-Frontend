<template>
  <div>
    <div class="space-y-4">
      <div v-for="(v, i) in vehicles" :key="i" class="p-4 border rounded-lg bg-white flex items-center justify-between">
        <div>
          <div class="font-semibold">{{ v.name }}</div>
          <div class="text-sm text-gray-500">Registration: {{ v.reg }}</div>
        </div>
        <div class="text-sm">{{ v.status }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getVehicles } from '../../api'

export default {
  name: 'VehiclesList',
  data() {
    return {
      vehicles: []
    }
  },
  async mounted() {
    try {
      const res = await getVehicles();
      this.vehicles = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      // fallback demo data
      this.vehicles = [
        { name: 'Truck A', reg: 'ABC-123', status: 'Available' },
        { name: 'Mixer 1', reg: 'MIX-456', status: 'In Use' },
      ]
    }
  }
}
</script>

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
export default {
  name: 'VehiclesList',
  data() {
    return {
      vehicles: [
        { name: 'Truck A', reg: 'ABC-123', status: 'Available' },
        { name: 'Mixer 1', reg: 'MIX-456', status: 'In Use' },
      ]
    }
  }
}
</script>

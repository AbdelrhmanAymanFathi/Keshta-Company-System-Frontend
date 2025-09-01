<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="(c, idx) in contractors" :key="idx" class="p-4 border rounded-lg bg-white">
        <h3 class="font-semibold">{{ c.name }}</h3>
        <p class="text-sm text-gray-500">{{ c.type }}</p>
        <p class="mt-2 text-sm">Phone: {{ c.phone }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContractorsList',
  data() {
    return {
      contractors: [
        { name: 'Ali Contracting', type: 'Civil', phone: '0100-000-000' },
        { name: 'Mohamed Works', type: 'Electrical', phone: '0101-111-111' },
      ]
    }
  }
}
</script>

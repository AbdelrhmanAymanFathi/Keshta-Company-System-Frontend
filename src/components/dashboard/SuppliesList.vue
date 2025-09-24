<template>
  <div>
    <div class="overflow-auto bg-white rounded shadow">
      <table class="min-w-full divide-y">
        <thead class="bg-gray-50">
          <tr><th class="p-3 text-left">#</th><th class="p-3 text-left">Name</th><th class="p-3">Qty</th></tr>
        </thead>
        <tbody>
          <tr v-for="(delivery, index) in deliveries" :key="delivery.id" class="hover:bg-gray-50">
            <td class="p-3">{{ index + 1 }}</td>
            <td class="p-3">{{ delivery.name }}</td>
            <td class="p-3">{{ delivery.qty }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getDeliveries } from '../../api'

export default {
  name: 'SuppliesList',
  data() {
    return {
      deliveries: []
    }
  },
  async mounted() {
    try {
      const res = await getDeliveries();
      this.deliveries = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      // fallback demo data
      this.deliveries = []
    }
  }
}
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-4">Crushers</h2>
    <div class="bg-white rounded shadow p-4">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="p-2">ID</th>
            <th class="p-2">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in crushers" :key="c.id">
            <td class="p-2">{{ c.id }}</td>
            <td class="p-2">{{ c.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import { getCrushers } from '../../api'
export default {
  name: 'CrushersList',
  data() {
    return { crushers: [] }
  },
  async mounted() {
    try {
      const res = await getCrushers();
      this.crushers = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      this.crushers = []
    }
  }
}
</script>

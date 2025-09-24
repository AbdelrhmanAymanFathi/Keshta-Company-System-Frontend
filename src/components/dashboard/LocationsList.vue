<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-4">Locations</h2>
    <div class="bg-white rounded shadow p-4">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="p-2">ID</th>
            <th class="p-2">Name</th>
            <th class="p-2">Parent ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in locations" :key="l.id">
            <td class="p-2">{{ l.id }}</td>
            <td class="p-2">{{ l.name }}</td>
            <td class="p-2">{{ l.parentId }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import { getLocations } from '../../api'
export default {
  name: 'LocationsList',
  data() {
    return { locations: [] }
  },
  async mounted() {
    try {
      const res = await getLocations();
      this.locations = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      this.locations = []
    }
  }
}
</script>

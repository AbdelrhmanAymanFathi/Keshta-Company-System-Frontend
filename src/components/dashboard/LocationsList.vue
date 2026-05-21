<template>
  <div class="space-y-6 p-0 sm:p-0.5 md:p-1 lg:p-0">
    <div class="app-page-header rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold text-slate-900">Locations</h2>
    </div>
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
      <table class="min-w-full">
        <thead class="bg-gradient-to-r from-slate-50 to-indigo-50">
          <tr>
            <th class="p-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ID</th>
            <th class="p-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
            <th class="p-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Parent ID</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="l in locations" :key="l.id" class="hover:bg-indigo-50/40">
            <td class="p-3 text-sm text-slate-900">{{ l.id }}</td>
            <td class="p-3 text-sm font-medium text-slate-900">{{ l.name }}</td>
            <td class="p-3 text-sm text-slate-600">{{ l.parentId }}</td>
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

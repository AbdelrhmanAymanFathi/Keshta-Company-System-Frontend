<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-4">Users</h2>
    <div class="bg-white rounded shadow p-4">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="p-2">ID</th>
            <th class="p-2">Name</th>
            <th class="p-2">Email</th>
            <th class="p-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td class="p-2">{{ u.id }}</td>
            <td class="p-2">{{ u.name }}</td>
            <td class="p-2">{{ u.email }}</td>
            <td class="p-2">{{ u.phone }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import { getUsers } from '../../api'
export default {
  name: 'UsersList',
  data() {
    return { users: [] }
  },
  async mounted() {
    try {
      const res = await getUsers();
      this.users = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      this.users = []
    }
  }
}
</script>

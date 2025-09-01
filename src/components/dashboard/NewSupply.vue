<template>
  <div class="p-6 bg-white rounded shadow">
    <h2 class="text-2xl font-bold mb-4">{{ $t('dashboard.newSupply') }}</h2>

    <!-- Step 1: Select Site & Area -->
    <div v-if="!step2" class="space-y-4">
      <div>
        <label class="block mb-1 font-medium">{{ $t('labels.site') }}</label>
        <select v-model="site" class="border rounded px-2 py-1 w-full">
          <option value="">Select site</option>
          <option v-for="s in sites" :key="s.id" :value="s.name">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block mb-1 font-medium">{{ $t('labels.area') }}</label>
        <select v-model="area" class="border rounded px-2 py-1 w-full">
          <option value="">Select area</option>
          <option v-for="a in areas" :key="a.id" :value="a.name">{{ a.name }}</option>
        </select>
      </div>
      <button @click="goToTable" 
              :disabled="!site || !area"
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
        {{ $t('labels.next') }}
      </button>
    </div>

    <!-- Step 2: Excel-like Table -->
    <div v-else>
      <div class="mb-4 text-gray-700 font-medium">
        {{ $t('labels.site') }}: {{ site }}, {{ $t('labels.area') }}: {{ area }}
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 border">
          <thead class="bg-indigo-100 text-left">
            <tr>
              <th class="px-3 py-2">#</th>
              <th class="px-3 py-2">{{ $t('labels.date') }}</th>
              <th class="px-3 py-2">{{ $t('labels.contractor') }}</th>
              <th class="px-3 py-2">{{ $t('labels.crusher') }}</th>
              <th class="px-3 py-2">{{ $t('labels.vehicle') }}</th>
              <th class="px-3 py-2">{{ $t('labels.crusherBon') }}</th>
              <th class="px-3 py-2">{{ $t('labels.companyBon') }}</th>
              <th class="px-3 py-2">{{ $t('labels.discount') }}</th>
              <th class="px-3 py-2">{{ $t('labels.price') }}</th>
              <th class="px-3 py-2">{{ $t('labels.cubic') }}</th>
              <th class="px-3 py-2">{{ $t('labels.total') }}</th>
              <th class="px-3 py-2">{{ $t('labels.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(row, index) in rows" :key="row.id">
              <td class="px-3 py-2">{{ index + 1 }}</td>
              <td class="px-3 py-2">
                <input type="date" v-model="row.date" class="border rounded px-2 py-1 w-full" />
              </td>
              <td class="px-3 py-2">
                <select v-model="row.contractor" class="border rounded px-2 py-1 w-full">
                  <option v-for="c in contractors" :key="c.id" :value="c.name">{{ c.name }}</option>
                </select>
              </td>
              <td class="px-3 py-2">
                <select v-model="row.crusher" @change="updateVehicles(row)" class="border rounded px-2 py-1 w-full">
                  <option v-for="c in crushers" :key="c.id" :value="c.name">{{ c.name }}</option>
                </select>
              </td>
              <td class="px-3 py-2">
                <select v-model="row.vehicle" class="border rounded px-2 py-1 w-full">
                  <option v-for="v in row.availableVehicles" :key="v.id" :value="v.name">{{ v.name }}</option>
                </select>
              </td>
              <td class="px-3 py-2">
                <input type="text" v-model="row.crusherBon" class="border rounded px-2 py-1 w-full" />
              </td>
              <td class="px-3 py-2">
                <input type="text" v-model="row.companyBon" class="border rounded px-2 py-1 w-full" />
              </td>
              <td class="px-3 py-2">
                <input type="number" v-model.number="row.discount" class="border rounded px-2 py-1 w-full" />
              </td>
              <td class="px-3 py-2">
                <input type="number" v-model.number="row.price" class="border rounded px-2 py-1 w-full" />
              </td>
              <td class="px-3 py-2">
                <input type="number" v-model.number="row.cubic" class="border rounded px-2 py-1 w-full" />
              </td>
              <td class="px-3 py-2 font-bold">
                {{ totalPerRow(row) }}
              </td>
              <td class="px-3 py-2">
                <button @click="removeRow(index)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                  {{ $t('labels.actions') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Row Button -->
      <div class="mt-4">
        <button @click="addRow" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          {{ $t('labels.addRow') }}
        </button>
      </div>

      <!-- Save Button -->
      <div class="mt-4">
        <button @click="saveData" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {{ $t('labels.saveSupply') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewSupply',
  data() {
    return {
      step2: false,
      site: '',
      area: '',
      sites: [
        { id: 1, name: 'Site A' },
        { id: 2, name: 'Site B' },
      ],
      areas: [
        { id: 1, name: 'Area 1' },
        { id: 2, name: 'Area 2' },
      ],
      rows: [
        { 
          id: Date.now(),
          date: '', contractor: '', crusher: '', vehicle: '', crusherBon: '', companyBon: '', 
          discount: 0, price: 0, cubic: 0, availableVehicles: [] 
        }
      ],
      contractors: [
        { id: 1, name: 'Contractor A' },
        { id: 2, name: 'Contractor B' },
      ],
      crushers: [
        { id: 1, name: 'Crusher 1', vehicles: [{id:1,name:'Truck 101'},{id:2,name:'Truck 102'}] },
        { id: 2, name: 'Crusher 2', vehicles: [{id:3,name:'Truck 201'},{id:4,name:'Truck 202'}] },
      ]
    }
  },
  methods: {
    goToTable() { this.step2 = true },
    addRow() {
      this.rows.push({
        id: Date.now(),
        date: '', contractor: '', crusher: '', vehicle: '', crusherBon: '', companyBon: '', 
        discount: 0, price: 0, cubic: 0, availableVehicles: []
      })
    },
    removeRow(index) {
      this.rows.splice(index, 1)
    },
    updateVehicles(row) {
      const selectedCrusher = this.crushers.find(c => c.name === row.crusher)
      row.availableVehicles = selectedCrusher ? selectedCrusher.vehicles : []
      row.vehicle = ''
    },
    totalPerRow(row) {
      let total = (row.price * row.cubic) - row.discount
      return total > 0 ? total : 0
    },
    saveData() {
      console.log('Site:', this.site, 'Area:', this.area)
      console.log('Saved rows:', this.rows)
      alert('Supply saved successfully!')
      // هنا ممكن تعمل request للباك إند
    }
  }
}
</script>

<style scoped>
table input, table select {
  outline: none;
}
</style>

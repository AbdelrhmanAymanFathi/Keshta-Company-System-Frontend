<template>
  <div class="flex flex-col h-screen">
    <!-- Top horizontal navbar -->
    <header class="bg-white shadow px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="text-xl font-bold">Qeshta Co. — شركة قشطة</div>
        <nav class="hidden sm:flex gap-2">
          <button v-for="(label, key) in topMenus" :key="key"
                  @click="selectTop(key)"
                  :class="['px-3 py-1 rounded', selectedTop === key ? 'bg-teal-500 text-white' : 'hover:bg-gray-100']">
            {{ $t('navbar.' + key) }}
          </button>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-sm text-gray-600 hidden sm:block">{{ userName }}</div>
        <div class="flex gap-2">
          <button @click="toggleSidebar" class="p-2 rounded hover:bg-gray-100 sm:hidden">Menu</button>
          <button class="p-2 rounded hover:bg-gray-100" @click="logout">Logout</button>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Left vertical sidebar -->
      <aside :class="['bg-gray-50 border-r p-4 overflow-auto transition-transform duration-200', sidebarOpen ? 'block' : 'hidden sm:block']" style="width: 18rem;">
        <ul class="space-y-2">
          <li v-for="item in verticalMenu" :key="item.name">
            <button @click="selectVertical(item.name)"
                    :class="['w-full text-left px-3 py-2 rounded flex items-center gap-2',
                      selectedVertical === item.name ? 'bg-teal-500 text-white' : 'hover:bg-gray-100']">
              <span class="flex-1">{{ $t(item.label) }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-6 overflow-auto bg-white">
        <h2 class="text-2xl font-semibold mb-4">{{ $t(currentLabel) }}</h2>
        <component :is="currentComponent"></component>
      </main>
    </div>
  </div>
</template>

<script>
import NewSupply from './NewSupply.vue'
import SuppliesList from './SuppliesList.vue'
import ContractorsList from './ContractorsList.vue'
import VehiclesList from './VehiclesList.vue'

export default {
  name: 'DashboardPage', // ✅ اسم multi-word لتجنب ESLint
  components: { NewSupply, SuppliesList, ContractorsList, VehiclesList },
  data() {
    return {
      userName: 'عبدالرحمن / Abdelrhman',
      selectedTop: 'supplies',
      selectedVertical: 'newSupply',
      sidebarOpen: false,
      topMenus: { supplies: 'Supplies', transport: 'Transport', expenses: 'Expenses', equipmentRent: 'equipmentRent', companyEquipment: 'companyEquipment' },
      menuMap: {
        supplies: [
          { name: 'newSupply', label: 'dashboard.newSupply', component: 'NewSupply' },
          { name: 'suppliesList', label: 'dashboard.suppliesList', component: 'SuppliesList' },
          { name: 'contractorsList', label: 'dashboard.contractorsList', component: 'ContractorsList' },
          { name: 'vehiclesList', label: 'dashboard.vehiclesList', component: 'VehiclesList' }
        ],
        transport: [
          { name: 'transportPage', label: 'dashboard.transport', component: { template: '<div>Transport Page</div>' } }
        ],
        expenses: [
          { name: 'expensesPage', label: 'dashboard.expenses', component: { template: '<div>Expenses Page</div>' } }
        ],
        equipmentRent: [
          { name: 'equipmentRentPage', label: 'dashboard.equipmentRent', component: { template: '<div>Equipment rent content</div>' } }
        ],
        companyEquipment: [
          { name: 'companyEquipmentPage', label: 'dashboard.companyEquipment', component: { template: '<div>Company equipment content</div>' } }
        ]
      }
    }
  },
  computed: {
    verticalMenu() {
      return this.menuMap[this.selectedTop] || []
    },
    currentItem() {
      return this.verticalMenu.find(i => i.name === this.selectedVertical) || (this.verticalMenu[0] || null)
    },
    currentLabel() {
      return this.currentItem ? this.currentItem.label : ''
    },
    currentComponent() {
      if (!this.currentItem) return { template: '<div>Select an item</div>' }
      const mapping = { NewSupply, SuppliesList, ContractorsList, VehiclesList }
      if (typeof this.currentItem.component === 'string') {
        return mapping[this.currentItem.component] || { template: '<div>Component not found</div>' }
      }
      return this.currentItem.component
    }
  },
  methods: {
    selectTop(key) {
      this.selectedTop = key
      const first = (this.menuMap[key] && this.menuMap[key][0]) ? this.menuMap[key][0].name : null
      if (first) this.selectedVertical = first
      this.sidebarOpen = false
    },
    selectVertical(name) {
      this.selectedVertical = name
      this.sidebarOpen = false
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    logout() { alert('Logout (simulate)') }
  }
}
</script>

<style scoped>
/* Tailwind handle responsiveness, extra tweaks here if needed */
</style>

<template>
  <div class="flex flex-col h-screen" :class="{ 'direction-rtl': isRTL }">
    <!-- Top horizontal navbar -->
    <header class="flex items-center justify-between px-4 py-3 shadow text-white bg-indigo-800">
      <div class="flex items-center gap-4">
        <!-- Hamburger for mobile -->
        <button @click="toggleSidebar" class="sm:hidden p-2 rounded hover:bg-indigo-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
               viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <div class="text-xl font-bold">Qeshta Co. — شركة قشطة</div>
        <nav class="hidden sm:flex gap-2">
          <button v-for="(label, key) in topMenus" :key="key"
                  @click="selectTop(key)"
                  :class="['px-3 py-1 rounded', selectedTop === key ? 'bg-indigo-500 text-white' : 'hover:bg-indigo-700']">
            {{ $t('navbar.' + key) }}
          </button>
        </nav>
      </div>

      <!-- Language switch + logout -->
      <div class="flex items-center gap-3">
        <!-- Mobile icons -->
        <div class="flex sm:hidden gap-2">
          <button @click="switchLang('en')" :class="langBtnClass('en')" class="p-2 rounded-md bg-white">
            <img src="/flags/us.png" alt="EN" class="w-5 h-5"/>
          </button>
          <button @click="switchLang('ar')" :class="langBtnClass('ar')" class="p-2 rounded-md bg-white">
            <img src="/flags/eg.png" alt="AR" class="w-5 h-5"/>
          </button>
          <button class="p-2 rounded hover:bg-indigo-700" @click="logout">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"></path>
            </svg>
          </button>
        </div>

        <!-- Desktop buttons -->
        <div class="hidden sm:flex gap-2">
          <button @click="switchLang('en')" :class="langBtnClass('en')" class="p-2 rounded-md bg-white">
            <img src="/flags/us.png" alt="EN" class="w-6 h-6"/>
          </button>
          <button @click="switchLang('ar')" :class="langBtnClass('ar')" class="p-2 rounded-md bg-white">
            <img src="/flags/eg.png" alt="AR" class="w-6 h-6"/>
          </button>
          <button class="p-2 rounded hover:bg-indigo-700" @click="logout">Logout</button>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Left vertical sidebar -->
      <aside
        :class="[
          'bg-indigo-50 border-r p-4 overflow-auto transition-transform duration-200 fixed sm:relative z-50 top-0 h-full',
          sidebarOpen 
            ? 'translate-x-0' 
            : isRTL ? 'translate-x-full' : '-translate-x-full',
          'sm:translate-x-0',
          isRTL ? 'right-0' : 'left-0'
        ]"
        style="width: 18rem;"
      >
        <!-- TopMenus for mobile -->
        <div v-if="sidebarOpen && isMobile" class="sm:hidden mb-4 space-y-2">
          <button v-for="(label, key) in topMenus" :key="key"
                  @click="selectTop(key)"
                  class="w-full text-left px-3 py-2 rounded bg-indigo-100 hover:bg-indigo-200">
            {{ $t('navbar.' + key) }}
          </button>
        </div>

        <!-- Vertical menu -->
        <ul class="space-y-2">
          <li v-for="item in verticalMenu" :key="item.name">
            <button @click="selectVertical(item.name)"
                    :class="['w-full text-left px-3 py-2 rounded flex items-center gap-2',
                      selectedVertical === item.name ? 'bg-indigo-500 text-white' : 'hover:bg-indigo-100']">
              <span class="flex-1">{{ $t(item.label) }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <!-- Overlay for mobile when sidebar open -->
      <div v-if="sidebarOpen" class="fixed inset-0 bg-black opacity-25 sm:hidden" @click="toggleSidebar"></div>

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
  name: 'DashboardPage',
  components: { NewSupply, SuppliesList, ContractorsList, VehiclesList },
  data() {
    return {
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
    isRTL() { return this.$i18n.locale === 'ar' },
    isMobile() { return window.innerWidth < 640 },
    verticalMenu() { return this.menuMap[this.selectedTop] || [] },
    currentItem() { return this.verticalMenu.find(i => i.name === this.selectedVertical) || (this.verticalMenu[0] || null) },
    currentLabel() { return this.currentItem ? this.currentItem.label : '' },
    currentComponent() {
      if (!this.currentItem) return { template: '<div>Select an item</div>' }
      const mapping = { NewSupply, SuppliesList, ContractorsList, VehiclesList }
      if (typeof this.currentItem.component === 'string') return mapping[this.currentItem.component] || { template: '<div>Component not found</div>' }
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
    selectVertical(name) { this.selectedVertical = name; this.sidebarOpen = false },
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen },
    logout() { alert('Logout (simulate)') },
    switchLang(lang) { this.$i18n.locale = lang },
    langBtnClass(lang) { return this.$i18n.locale === lang ? 'ring-2 ring-indigo-400' : '' }
  }
}
</script>

<style scoped>
.direction-rtl { direction: rtl; }
</style>

<template>
  <div class="flex flex-col h-screen" :class="{ 'direction-rtl': isRTL }">
    <!-- Top horizontal navbar -->
    <header class="flex items-center justify-between px-4 py-3 shadow text-white" :class="headerGradient">
      <div class="flex items-center gap-4">
        <!-- Hamburger for mobile -->
        <button @click="toggleSidebar" class="sm:hidden p-2 rounded hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <div class="w-18 h-9 rounded-md flex items-center justify-center overflow-hidden">
            <img src="../../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-fill">
          </div>
          <div class="text-l font-bold whitespace-nowrap">{{ $t('appName') }}</div>
        </div>
        <!-- Top menus (desktop) -->
        <nav class="hidden sm:flex gap-2 ml-4">
          <button v-for="(labelKey, key) in filteredTopMenus" :key="key" @click="selectTop(key)"
            :class="['px-4 py-2 rounded text-sm font-medium transition', selectedTop === key ? 'bg-white/20' : 'hover:bg-white/10']">
            {{ $t('navbar.' + key) }}
          </button>
        </nav>
      </div>

      <!-- Right side: Language + User Avatar -->
      <div class="flex items-center gap-4">
        <!-- Language Switcher -->
        <div class="flex gap-2 bg-white/10 rounded-lg p-1">
          <button @click="switchLang('en')" :class="langBtnClass('en')" class="rounded p-1">
            <img src="/flags/us.png" alt="English" class="w-6 h-6 rounded" />
          </button>
          <button @click="switchLang('ar')" :class="langBtnClass('ar')" class="rounded p-1">
            <img src="/flags/eg.png" alt="العربية" class="w-6 h-6 rounded" />
          </button>
        </div>

        <!-- User Avatar with Dropdown -->
        <div class="relative">
          <button @click="toggleUserMenu" class="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white font-semibold text-lg hover:bg-white/30 transition">
            {{ userInitials }}
          </button>
          <!-- User Dropdown Menu -->
          <div v-if="userMenuOpen" class="absolute top-12" :class="isRTL ? 'left-0' : 'right-0'">
            <div class="bg-white rounded-lg shadow-lg py-2 min-w-[160px] border">
              <button @click="showLogoutDialog = true; userMenuOpen = false"
                class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-3 text-gray-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                {{ $t('labels.logout') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside role="navigation" :class="asideClasses">
        <!-- Desktop Brand + Collapse -->
        <div class="hidden sm:flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <!-- Logo visible only when collapsed -->
            <!-- <div v-if="effectiveCollapsed" class="w-9 h-9 rounded-md overflow-hidden">
              <img src="../../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-cover">
            </div> -->
            <!-- App name visible only when expanded -->
            <div v-if="!effectiveCollapsed" class="font-semibold text-lg">
              {{ $t('appName') }}
            </div>
          </div>
          <button v-if="!isMobile" @click="toggleCollapsed" class="p-2 rounded hover:bg-indigo-200 transition">
            <svg v-if="!effectiveCollapsed" class="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <svg v-else class="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Mobile Header -->
        <div v-if="isMobile" class="sm:hidden flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-md overflow-hidden">
              <img src="../../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-cover">
            </div>
            <div class="font-semibold text-lg">{{ $t('appName') }}</div>
          </div>
          <button @click="toggleSidebar" class="p-2 rounded hover:bg-indigo-200">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Top Menu -->
        <div v-if="isMobile" class="sm:hidden mb-4 space-y-1">
          <button v-for="(labelKey, key) in filteredTopMenus" :key="key" @click="selectTop(key)"
            :class="['w-full px-4 py-2 rounded text-sm font-medium text-left', selectedTop === key ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-100']">
            {{ $t('navbar.' + key) }}
          </button>
        </div>

        <!-- Vertical Menu -->
        <ul class="space-y-1">
          <li v-for="item in filteredVerticalMenu" :key="item.name">
            <button @click="selectVertical(item.name)"
              :class="['w-full px-4 py-3 rounded flex items-center gap-4 transition', selectedVertical === item.name ? 'bg-indigo-600 text-white shadow' : 'hover:bg-indigo-100', effectiveCollapsed ? 'justify-center px-3' : '']">
              <div class="w-5 h-5 flex-shrink-0" v-html="menuIcon(item.name, selectedVertical === item.name)"></div>
              <span v-if="!effectiveCollapsed" class="text-sm font-medium">
                {{ $t(item.label) }}
              </span>
            </button>
          </li>
        </ul>
      </aside>

      <!-- Mobile Overlay -->
      <div v-if="sidebarOpen && isMobile" class="fixed inset-0 bg-black/50 z-30" @click="toggleSidebar"></div>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <!-- <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t(currentLabel) }}</h2> -->
        <component :is="currentComponent" @navigate-report="navigateToReport" @navigate-statement="navigateToStatement" />
      </main>
    </div>

    <!-- Logout Dialog -->
    <AuthLogout v-if="showLogoutDialog" @cancel="showLogoutDialog = false" @logout-success="handleLogoutSuccess" />
  </div>
</template>

<script>
import NewSupply from './NewSupply.vue'
import SuppliesList from './SuppliesList.vue'
import SuppliesReport from './SuppliesReportNew.vue'
import ContractorsList from './ContractorsList.vue'
import ContractorStatement from './ContractorStatement.vue'
import DriversList from './DriversList.vue'
import CrushersList from './CrushersList.vue'
import VehiclesList from './VehiclesList.vue'
import TransportList from './TransportList.vue'
import TransportReport from './TransportReportNew.vue'
import ExpensesReport from './ExpensesReportNew.vue'
import RentalList from './RentalList.vue'
import RentalReport from './RentalReport.vue'
import ExpensesList from './ExpensesList.vue'
import CompanyFinance from './CompanyFinance.vue'
import ChangesByDate from './ChangesByDate.vue'
import AuthLogout from '../auth/Logout.vue'
import ComponentNotFound from '../shared/ComponentNotFound.vue'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'DashboardPage',
  components: {
    NewSupply, SuppliesList, SuppliesReport, ContractorsList, ContractorStatement,
    DriversList, CrushersList, VehiclesList, TransportList, TransportReport,
    RentalList, RentalReport, ExpensesList, ExpensesReport, CompanyFinance,
    ChangesByDate, AuthLogout, ComponentNotFound
  },
  setup() {
    const { logout: authLogout, user } = useAuth()
    return { authLogout, user }
  },
  data() {
    return {
      topMenus: { supplies: 'supplies', transport: 'transport', expenses: 'expenses', equipmentRent: 'equipmentRent', companyWallet: 'companyWallet', admin: 'admin' },
      selectedTop: localStorage.getItem('dashboard-selectedTop') || 'supplies',
      menuMap: {
        supplies: [
          { name: 'newSupply', label: 'dashboard.newSupply', component: 'NewSupply' },
          { name: 'suppliesList', label: 'dashboard.suppliesList', component: 'SuppliesList' },
          { name: 'crushersList', label: 'dashboard.crushersList', component: 'CrushersList' },
          { name: 'contractorsList', label: 'dashboard.contractorsList', component: 'ContractorsList' },
          { name: 'contractorStatement', label: 'dashboard.contractorStatement', component: 'ContractorStatement' },
          { name: 'driversList', label: 'drivers.title', component: 'DriversList' },
          { name: 'vehiclesList', label: 'dashboard.vehiclesList', component: 'VehiclesList' },
          { name: 'suppliesReport', label: 'dashboard.suppliesReport', component: 'SuppliesReport' }
        ],
        transport: [
          { name: 'transportList', label: 'dashboard.transportList', component: 'TransportList' },
          { name: 'transportReport', label: 'transport.reportMenu', component: 'TransportReport' }
        ],
        expenses: [
          { name: 'expensesList', label: 'dashboard.expenses', component: 'ExpensesList' },
          { name: 'expensesReport', label: 'expenses.report', component: 'ExpensesReport' }
        ],
        equipmentRent: [
          { name: 'rentalList', label: 'dashboard.equipmentRent', component: 'RentalList' },
          { name: 'rentalReport', label: 'rental.reportMenu', component: 'RentalReport' }
        ],
        companyWallet: [
          { name: 'companyWallet', label: 'dashboard.companyWallet', component: 'CompanyFinance' }
        ],
        admin: [
          { name: 'changesByDate', label: 'changes.title', component: 'ChangesByDate' }
        ]
      },
      selectedVertical: localStorage.getItem('dashboard-selectedVertical') || 'newSupply',
      sidebarOpen: false,
      collapsedSidebar: JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false'),
      showLogoutDialog: false,
      userMenuOpen: false,
      isMobile: window.innerWidth < 640
    }
  },
  computed: {
    isRTL() { return this.$i18n?.locale === 'ar' },
    effectiveCollapsed() { return this.isMobile ? false : this.collapsedSidebar },
    verticalMenu() { return this.menuMap[this.selectedTop] || [] },
    currentItem() {
      const menu = this.filteredVerticalMenu
      return menu.find(i => i.name === this.selectedVertical) || menu[0] || null
    },
    currentLabel() { return this.currentItem ? this.currentItem.label : '' },
    currentComponent() {
      if (!this.currentItem) return 'div'
      const mapping = {
        NewSupply, SuppliesList, SuppliesReport, ContractorsList, ContractorStatement,
        DriversList, CrushersList, VehiclesList, TransportList, TransportReport,
        RentalList, RentalReport, ExpensesList, ExpensesReport, CompanyFinance,
        ChangesByDate
      }
      return mapping[this.currentItem.component] || ComponentNotFound
    },
    isAdmin() {
      if (!this.user || !this.user.roles) return false
      return this.user.roles.some(role => role.roleId === 1)
    },
    filteredTopMenus() {
      const menus = { ...this.topMenus }
      if (!this.isAdmin) {
        delete menus.admin
      }
      return menus
    },
    filteredVerticalMenu() {
      const menu = this.verticalMenu || []
      // Filter admin menu items if user is not admin
      if (this.selectedTop === 'admin' && !this.isAdmin) {
        return []
      }
      return menu
    },
    headerGradient() { return 'bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-600' },
    userInitials() {
      if (!this.user || !this.user.name) return '??'
      const names = this.user.name.trim().split(' ')
      const first = names[0]?.[0] || ''
      const second = names[1]?.[0] || ''
      return (first + second).toUpperCase() || 'U'
    },
    langBtnClass() {
      return (lang) => this.$i18n.locale === lang ? 'ring-2 ring-white rounded' : 'opacity-70'
    },
    asideClasses() {
      const base = 'bg-indigo-50 p-4 transition-all duration-300 z-40 flex flex-col'
      if (this.isMobile) {
        const side = this.isRTL ? 'right-0' : 'left-0'
        const transform = this.sidebarOpen ? 'translate-x-0' : (this.isRTL ? 'translate-x-full' : '-translate-x-full')
        return `${base} fixed top-0 bottom-0 w-64 ${side} ${transform}`
      }
      const width = this.effectiveCollapsed ? 'w-20' : 'w-72'
      return `${base} ${width} relative`
    }
  },
  watch: {
    collapsedSidebar(v) { localStorage.setItem('sidebarCollapsed', JSON.stringify(v)) },
    sidebarOpen(v) {
      if (this.isMobile) document.body.style.overflow = v ? 'hidden' : ''
    }
  },
  methods: {
    selectTop(key) {
      this.selectedTop = key
      localStorage.setItem('dashboard-selectedTop', key)
      const first = this.menuMap[key]?.[0]?.name
      if (first) {
        this.selectedVertical = first
        localStorage.setItem('dashboard-selectedVertical', first)
      }
      this.sidebarOpen = false
    },
    selectVertical(name) {
      this.selectedVertical = name
      localStorage.setItem('dashboard-selectedVertical', name)
      if (this.isMobile) this.sidebarOpen = false
    },
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen },
    toggleCollapsed() { if (!this.isMobile) this.collapsedSidebar = !this.collapsedSidebar },
    toggleUserMenu() { this.userMenuOpen = !this.userMenuOpen },
    navigateToReport() { this.selectedVertical = 'rentalReport' },
    navigateToStatement(contractorId) {
      this.selectedTop = 'supplies'
      localStorage.setItem('dashboard-selectedTop', 'supplies')
      this.selectedVertical = 'contractorStatement'
      localStorage.setItem('dashboard-selectedVertical', 'contractorStatement')
      if (contractorId) localStorage.setItem('contractor-statement-id', contractorId.toString())
      if (this.isMobile) this.sidebarOpen = false
    },
    handleLogoutSuccess() {
      this.showLogoutDialog = false
      window.location.reload()
    },
    switchLang(lang) {
      this.$i18n.locale = lang
      localStorage.setItem('app-locale', lang)
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    },
    menuIcon(name, isActive) {
      const color = isActive ? 'text-white' : 'text-indigo-600'
      const icons = {
        newSupply: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
        suppliesList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
        crushersList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
        contractorsList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
        contractorStatement: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        driversList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
        vehiclesList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-8-4h8M3 8h18M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        transportList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2m0 0V5a2 2 0 012-2h8a2 2 0 012 2v2m-12 0h4"/></svg>`,
        expensesList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        rentalList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        companyWallet: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z"/></svg>`,
        changesByDate: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        default: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path d="M12 8v8m-4-4h8" stroke-width="2"/></svg>`
      }
      return icons[name] || icons.default
    },
    onResize() {
      this.isMobile = window.innerWidth < 640
      if (!this.isMobile) {
        document.body.style.overflow = ''
        this.sidebarOpen = false
      }
    }
  },
  mounted() {
    const savedTop = localStorage.getItem('dashboard-selectedTop')
    const savedVertical = localStorage.getItem('dashboard-selectedVertical')
    if (savedTop && this.menuMap[savedTop]) {
      this.selectedTop = savedTop
      if (savedVertical && this.menuMap[savedTop].some(i => i.name === savedVertical)) {
        this.selectedVertical = savedVertical
      }
    }
    document.documentElement.lang = this.$i18n.locale || 'en'
    document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr'
    window.addEventListener('resize', this.onResize)
    this.onResize()
    document.addEventListener('click', (e) => {
      if (!this.$el.querySelector('.relative')?.contains(e.target)) this.userMenuOpen = false
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.direction-rtl { direction: rtl; }
/* Sidebar transition */
aside {
  transition: width 0.3s ease, transform 0.3s ease;
}
</style>

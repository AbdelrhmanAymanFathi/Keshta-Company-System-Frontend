<template>
  <div class="flex min-h-screen h-dvh flex-col" :class="{ 'direction-rtl': isRTL }" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Top horizontal navbar -->
    <header class="flex items-center justify-between gap-2 px-3 py-2.5 text-white shadow sm:gap-4 sm:px-4 sm:py-3 lg:px-6" :class="headerGradient">
      <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <!-- Hamburger for mobile -->
        <button @click="toggleSidebar" class="sm:hidden p-2 rounded hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <!-- Brand -->
        <div class="flex min-w-0 items-center gap-2 sm:gap-3">
          <div class="h-8 w-14 rounded-md flex items-center justify-center overflow-hidden sm:h-9 sm:w-16">
            <img src="../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-fill">
          </div>
          <div class="truncate text-sm font-bold whitespace-nowrap sm:text-base lg:text-lg">{{ $t('appName') }}</div>
        </div>
        <!-- Top menus (desktop) -->
        <nav class="app-scrollbar hidden sm:flex ml-2 max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap lg:ml-4 lg:gap-2">
          <button v-for="(labelKey, key) in filteredTopMenus" :key="key" @click="selectTop(key)"
            :class="['rounded px-2 py-1.5 text-xs font-medium transition lg:px-4 lg:py-2 lg:text-sm', selectedTop === key ? 'bg-white/20' : 'hover:bg-white/10']">
            {{ $t('navbar.' + key) }}
          </button>
        </nav>
      </div>

      <!-- Right side: Language + User Avatar -->
      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <!-- Language Switcher -->
        <div
          class="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 p-1 shadow-sm backdrop-blur-sm"
          role="group"
          aria-label="Language switcher"
        >
          <button
            @click="switchLang('en')"
            :class="langBtnClass('en')"
            class="rounded-lg p-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-1 focus-visible:ring-offset-indigo-700"
            aria-label="Switch to English"
          >
            <img src="/flags/us.png" alt="English" class="h-5 w-5 rounded sm:h-6 sm:w-6" />
          </button>
          <button
            @click="switchLang('ar')"
            :class="langBtnClass('ar')"
            class="rounded-lg p-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-1 focus-visible:ring-offset-indigo-700"
            aria-label="التبديل إلى العربية"
          >
            <img src="/flags/eg.png" alt="العربية" class="h-5 w-5 rounded sm:h-6 sm:w-6" />
          </button>
        </div>

        <!-- User Avatar with Dropdown -->
        <div class="relative shrink-0">
          <button @click="toggleUserMenu"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white transition hover:bg-white/30 sm:h-10 sm:w-10 sm:text-lg">
            {{ userInitials }}
          </button>
          <!-- User Dropdown Menu -->
          <div v-if="userMenuOpen" class="absolute top-12 " :class="isRTL ? 'left-0' : 'right-0'" style="z-index: 60;">
            <div class="bg-white rounded-lg shadow-lg py-2 min-w-[160px] border">
              <button @click="goToProfile(); userMenuOpen = false"
                class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-3 text-gray-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.824.645 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ $t('profile.title') || 'Profile' }}
              </button>
              <button @click="showLogoutDialog = true; userMenuOpen = false"
                class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-3 text-gray-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                  </path>
                </svg>
                {{ $t('labels.logout') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Sidebar -->
      <aside role="navigation" :class="asideClasses">
        <!-- Desktop Brand + Collapse -->
        <div class="mb-4 hidden items-center justify-between sm:flex">
          <div class="flex items-center gap-3">
            <!-- Logo visible only when collapsed -->
            <!-- <div v-if="effectiveCollapsed" class="w-9 h-9 rounded-md overflow-hidden">
              <img src="../../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-cover">
            </div> -->
            <!-- App name visible only when expanded -->
            <div v-if="!effectiveCollapsed" class="font-semibold text-base lg:text-lg">
              {{ $t('appName') }}
            </div>
          </div>
          <button v-if="!isMobile" @click="toggleCollapsed" class="rounded p-2 sm:p-3 hover:bg-indigo-200 transition">
            <!-- English: collapse left, expand right | Arabic: collapse right, expand left -->
            <svg v-if="!effectiveCollapsed" class="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" :style="{ transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)' }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <svg v-else class="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" :style="{ transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)' }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Mobile Header -->
        <div v-if="isMobile" class="mb-4 flex items-center justify-between sm:hidden">
          <div class="flex min-w-0 items-center gap-3">
            <div class="w-9 h-9 rounded-md overflow-hidden">
              <img src="../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-cover">
            </div>
            <div class="truncate font-semibold text-base">{{ $t('appName') }}</div>
          </div>
          <button @click="toggleSidebar" class="p-2 rounded hover:bg-indigo-200">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Top Menu -->
        <div v-if="isMobile" class="mb-4 space-y-1 sm:hidden">
          <button v-for="(labelKey, key) in filteredTopMenus" :key="key" @click="selectTop(key)"
            :class="['w-full rounded px-3 py-2 text-left text-sm font-medium', selectedTop === key ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-100']">
            {{ $t('navbar.' + key) }}
          </button>
        </div>

        <!-- Vertical Menu -->
        <ul class="space-y-1">
          <li v-for="item in filteredVerticalMenu" :key="item.name">
            <button @click="selectVertical(item.routeName)"
              :class="['flex w-full items-center gap-3 rounded px-3 py-2.5 transition sm:px-4 sm:py-3', currentRouteName === item.routeName ? 'bg-indigo-600 text-white shadow' : 'hover:bg-indigo-100', effectiveCollapsed ? 'justify-center px-3' : '']">
              <div class="w-5 h-5 flex-shrink-0" v-html="menuIcon(item.name, currentRouteName === item.routeName)"></div>
              <span v-if="!effectiveCollapsed" class="truncate text-sm font-medium">
                {{ $t(item.label) }}
              </span>
            </button>
          </li>
          <!-- Transport module: show dynamic reports inline under the transport menu -->
          <li v-if="reportsForModule && reportsForModule.length">
            <h4 v-if="!effectiveCollapsed" class="px-4 text-xs uppercase text-gray-500 tracking-wide mt-4">{{ $t('reports.moduleReports') || 'Reports' }}</h4>
            <ul class="mt-2 space-y-1 px-1 sm:px-2">
              <li v-for="r in reportsForModule" :key="r.id">
                <button @click="openReport(r.id)" class="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm hover:bg-gray-100">
                  <div class="w-4 h-4 text-indigo-600">
                    <svg class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6M9 16h6M12 8v8"/></svg>
                  </div>
                  <span class="truncate">{{ $i18n.locale === 'ar' ? (r.arTitle || r.title) : (r.title || r.arTitle) }}</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>

        
      </aside>

      <!-- Mobile Overlay -->
      <div v-if="sidebarOpen && isMobile" class="fixed inset-0 bg-black/50 z-30" @click="toggleSidebar"></div>

      <!-- Main Content -->
      <main class="app-scrollbar flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6">
        <!-- <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t(currentLabel) }}</h2> -->
        <router-view @navigate-report="navigateToReport"
          @navigate-statement="navigateToStatement" />
      </main>
    </div>

    <!-- Logout Dialog -->
    <AuthLogout v-if="showLogoutDialog" @cancel="showLogoutDialog = false" @logout-success="handleLogoutSuccess" />
  </div>
</template>

<script>
import AuthLogout from '@/components/auth/Logout.vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { getReportDefs } from '@/api'

export default {
  name: 'DashboardLayout',
  components: { AuthLogout },
  setup() {
    const { logout: authLogout, user } = useAuth()
    const router = useRouter()
    return { authLogout, user, router }
  },
  data() {
    return {
      topMenus: { supplies: 'supplies', transport: 'transport', equipmentLog: 'equipmentLog', companyWallet: 'companyWallet', admin: 'admin' },
      menuMap: {
        supplies: [
          // { name: 'newSupply', label: 'dashboard.newSupply', routeName: 'new-supply' },
          { name: 'suppliesList', label: 'dashboard.suppliesList', routeName: 'supplies-list' },
          { name: 'suppliersList', label: 'dashboard.suppliersList', routeName: 'suppliers-list' },
          { name: 'crushersList', label: 'dashboard.crushersList', routeName: 'crushers-list' },
          
          { name:'suppliesItemList', label: 'dashboard.itemsList', routeName: 'supplies-items-list' },
          { name: 'vehiclesList', label: 'dashboard.vehiclesList', routeName: 'vehicles-list' },
          { name: 'contractorSupplyStatement', label: 'dashboard.contractorSupplyStatement', routeName: 'contractor-supply-statement' },
          // { name: 'suppliesReport', label: 'dashboard.suppliesReport', routeName: 'supplies-report' }
        ],
        transport: [
          { name: 'transportList', label: 'dashboard.transportList', routeName: 'transport-list' },
          { name: 'transportContractorsList', label: 'dashboard.transportersList', routeName: 'transport-contractors-list' },
          { name: 'crushersList', label: 'dashboard.crushersList', routeName: 'transport-crushers-list' },
          { name:'transportItemsList', label: 'dashboard.itemsList', routeName: 'transport-items-list' },
          { name: 'vehiclesList', label: 'dashboard.vehiclesList', routeName: 'transport-vehicles' },
          { name: 'contractorTransportStatement', label: 'dashboard.contractorTransportStatement', routeName: 'contractor-transport-statement' },
          // { name: 'transportReport', label: 'transport.reportMenu', routeName: 'transport-report' },

        ],
        equipmentLog: [
          { name: 'equipmentLogList', label: 'dashboard.equipmentLog', routeName: 'equipment-log-list' },
          { name: 'equipmentList', label: 'equipment.title', routeName: 'equipment-list' },
          // { name: 'equipmentReport', label: 'equipment.reportMenu', routeName: 'equipment-report' },
          { name: 'contractorsList', label: 'dashboard.contractorsList', routeName: 'equipment-contractors-list' },
          { name: 'driversList', label: 'dashboard.driversList', routeName: 'equipment-drivers-list' },
          { name: 'contractorRentals', label: 'dashboard.contractorStatement', routeName: 'equipment-contractor-statement' }
        ],
        companyWallet: [
          { name: 'companyWallet', label: 'dashboard.companyWallet', routeName: 'company-wallet' },
          { name: 'companyTransactions', label: 'transactions', routeName: 'company-transactions' },
          { name: 'expensesList', label: 'dashboard.expenses', routeName: 'expenses-list' },
          { name: 'expensesReport', label: 'expenses.report', routeName: 'expenses-report' }
        ],
        admin: [
          { name: 'changesByDate', label: 'changes.title', routeName: 'changes-by-date' },
          { name: 'usersList', label: 'users.title', routeName: 'users-list' },
          { name: 'locations', label: 'locations.title', routeName: 'locations' },
          { name: 'reportsList', label: 'Reports', routeName: 'admin-reports-list' }
        ]
      },
      sidebarOpen: false,
      collapsedSidebar: JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false'),
      showLogoutDialog: false,
      userMenuOpen: false,
      isMobile: window.innerWidth < 640,
      reports: []
    }
  },
  computed: {
    isRTL() { return this.$i18n?.locale === 'ar' },
    effectiveCollapsed() { return this.isMobile ? false : this.collapsedSidebar },
    headerGradient() { return 'bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-600' },
    userInitials() {
      if (!this.user || !this.user.name) return '??'
      const names = this.user.name.trim().split(' ')
      const first = names[0]?.[0] || ''
      const second = names[1]?.[0] || ''
      return (first + second).toUpperCase() || 'U'
    },
    langBtnClass() {
      return (lang) => this.$i18n.locale === lang
        ? 'bg-white/25 ring-2 ring-white/90 scale-105'
        : 'opacity-75 hover:opacity-100 hover:bg-white/15'
    },
    asideClasses() {
      const base = 'app-scrollbar bg-indigo-50 p-3 sm:p-4 transition-all duration-300 z-40 flex flex-col overflow-y-auto'
      if (this.isMobile) {
        const side = this.isRTL ? 'right-0' : 'left-0'
        const transform = this.sidebarOpen ? 'translate-x-0' : (this.isRTL ? 'translate-x-full' : '-translate-x-full')
        return `${base} fixed top-0 bottom-0 w-[17rem] max-w-[90vw] ${side} ${transform}`
      }
      const width = this.effectiveCollapsed ? 'w-20' : 'w-[17rem] lg:w-[18rem]'
      return `${base} ${width} relative`
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
      if (this.selectedTop === 'admin' && !this.isAdmin) {
        return []
      }
      return menu
    },
    reportsForModule() {
      if (!this.reports || !this.selectedTop) return []
      const sel = String(this.selectedTop || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      return this.reports.filter(r => {
        const m = String(r.module || '').toLowerCase()
        if (!m) return false
        const norm = m.replace(/[^a-z0-9]/g, '')
        if (norm === sel) return true
        if (norm.includes(sel)) return true
        if (sel.includes(norm)) return true
        return false
      })
    },
    currentRouteName() { return this.$route.name || '' },
    currentItem() {
      const routeName = this.currentRouteName
      for (const menuItems of Object.values(this.menuMap)) {
        const item = menuItems.find(i => i.routeName === routeName)
        if (item) return item
      }
      return null
    },
    currentLabel() { return this.currentItem ? this.currentItem.label : '' },
    selectedTop() {
      const routeName = this.currentRouteName
      // If route has explicit mode (params/query/meta) prefer it to determine the top menu
      const routeMode = (this.$route && (this.$route.params?.mode || this.$route.query?.mode || this.$route.meta?.mode)) || ''
      if (String(routeMode).toLowerCase() === 'equipment') return 'equipmentLog'
      // If we're opening a report, look up the report and use its module
      if (routeName === 'admin-reports-run') {
        const reportId = this.$route?.params?.id
        if (reportId && this.reports && this.reports.length) {
          const report = this.reports.find(r => r.id == reportId || r.id === String(reportId))
          if (report && report.module) {
            const mod = String(report.module).toLowerCase()
            if (mod.includes('supplies')) return 'supplies'
            if (mod.includes('transport')) return 'transport'
            if (mod.includes('equipment') || mod.includes('rent')) return 'equipmentLog'
            if (mod.includes('wallet') || mod.includes('expense')) return 'companyWallet'
          }
        }
      }
      // If we're on contractor detail, prefer the originating module from query param
      const from = this.$route?.query?.from
      if (routeName === 'contractor-detail' && from) {
        if (String(from).toLowerCase() === 'transport') return 'transport'
        if (String(from).toLowerCase() === 'supplies' || String(from).toLowerCase() === 'export') return 'supplies'
        if (String(from).toLowerCase() === 'equipment' || String(from).toLowerCase() === 'rental') return 'equipmentLog'
      }
      const suppliesRoutes = ['new-supply', 'supplies-list', 'supplies-report', 'supliers-list', 'contractor-supply-statement', 'crushers-list', 'vehicles-list']
      const transportRoutes = ['transport-list', 'transport-report', 'transport-items-list', 'transport-contractors-list', 'transport-vehicles', 'transport-crushers-list', 'contractor-transport-statement']
      const equipmentRoutes = ['equipment-log-list', 'equipment-report', 'equipment-list', 'equipment-drivers-list', 'equipment-contractors-list', 'equipment-contractor-statement']
      const walletRoutes = ['company-wallet', 'company-transactions', 'expenses-list', 'expenses-report']
      const adminRoutes = ['changes-by-date', 'users-list', 'locations', 'admin-reports-list', 'admin-reports-edit', 'admin-reports-run']
      if (suppliesRoutes.includes(routeName)) return 'supplies'
      if (transportRoutes.includes(routeName)) return 'transport'
      if (equipmentRoutes.includes(routeName)) return 'equipmentLog'
      if (walletRoutes.includes(routeName)) return 'companyWallet'
      if (adminRoutes.includes(routeName)) return 'admin'
      return 'supplies'
    },
    verticalMenu() { return this.menuMap[this.selectedTop] || [] }
  },
  watch: {
    collapsedSidebar(v) { localStorage.setItem('sidebarCollapsed', JSON.stringify(v)) },
    sidebarOpen(v) {
      if (this.isMobile) document.body.style.overflow = v ? 'hidden' : ''
    }
  },
  methods: {
    selectTop(key) {
      const first = this.menuMap[key]?.[0]
      if (first) {
        this.router.push({ name: first.routeName })
      }
      this.sidebarOpen = false
    },
    selectVertical(routeName) {
      if (routeName === 'contractor-supply-statement') {
        this.router.push({ 
          name: 'contractor-supply-statement',
          // query: { transaction_type: 'EXPORT' }
        })
      } else {
        this.router.push({ name: routeName })
      }
      if (this.isMobile) this.sidebarOpen = false
    },
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen },
    toggleCollapsed() { if (!this.isMobile) this.collapsedSidebar = !this.collapsedSidebar },
    toggleUserMenu() { this.userMenuOpen = !this.userMenuOpen },
    navigateToReport() { 
      this.router.push({ name: 'equipment-report' })
    },
    navigateToStatement(contractorId) {
      this.router.push({ 
        name: 'contractor-supply-statement',
        params: { id: contractorId },
        // query: { transaction_type: 'EXPORT' }
      })
      if (contractorId) localStorage.setItem('contractor-statement-id', contractorId.toString())
      if (this.isMobile) this.sidebarOpen = false
    },
    goToProfile() { this.router.push({ name: 'profile' }) },
    handleLogoutSuccess() {
      this.showLogoutDialog = false
      this.router.push({ name: 'login' })
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
        suppliersList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
        contractorStatement: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        driversList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
        vehiclesList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-8-4h8M3 8h18M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        transportList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2m0 0V5a2 2 0 012-2h8a2 2 0 012 2v2m-12 0h4"/></svg>`,
        expensesList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        equipmentLogList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        companyWallet: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z"/></svg>`,
        changesByDate: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        usersList: `<svg class="${color} w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
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
    ,
    async loadReports() {
      try {
        const res = await getReportDefs()
        this.reports = res?.data || []
      } catch (err) {
        console.error('Failed to load reports', err)
        this.reports = []
      }
    },
    openReport(reportId) {
      // Navigate to report run page with the report id
      this.router.push({ name: 'admin-reports-run', params: { id: reportId } })
      if (this.isMobile) this.sidebarOpen = false
    }
  },
  mounted() {
    document.documentElement.lang = this.$i18n.locale || 'en'
    document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr'
    window.addEventListener('resize', this.onResize)
    this.onResize()
    this.loadReports()
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
.direction-rtl {
  direction: rtl;
}

/* Sidebar transition */
aside {
  transition: width 0.3s ease, transform 0.3s ease;
}

/* Modern scrollbar style for dashboard scroll areas */
.app-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.55) transparent;
  scrollbar-gutter: stable;
}

.app-scrollbar::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}

.app-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 9999px;
}

.app-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.68), rgba(79, 70, 229, 0.8));
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.app-scrollbar:hover::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.85), rgba(79, 70, 229, 0.95));
  border: 2px solid transparent;
  background-clip: padding-box;
}
</style>

<template>
  <div class="flex min-h-screen h-dvh flex-col" :class="{ 'direction-rtl': isRTL }" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Top horizontal navbar -->
    <header class="flex items-center justify-between gap-2 px-3 py-2.5 theme-text-light shadow-lg shadow-slate-950/20 sm:gap-4 sm:px-4 sm:py-3 lg:px-6 transition-all duration-300 ease-in-out border-b border-slate-800/70 theme-dashboard-header">
      <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <!-- Hamburger for mobile -->
        <button @click="toggleSidebar" class="sm:hidden p-2 rounded-lg hover:bg-white/12 hover:scale-105 transition-all duration-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <!-- Brand -->
        <div class="flex min-w-0 items-center gap-2 sm:gap-3">
          <div class="h-8 w-14 rounded-md flex items-center justify-center overflow-hidden sm:h-9 sm:w-16 shadow-md">
            <img src="../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-fill transition-transform duration-300 hover:scale-110">
          </div>
          <div class="truncate text-sm font-bold whitespace-nowrap sm:text-base lg:text-lg">{{ $t('appName') }}</div>
        </div>
        <!-- Top menus (desktop) -->
        <nav class="hidden sm:flex ml-2 max-w-full items-center gap-1 whitespace-nowrap lg:ml-4 lg:gap-2">
          <button v-for="(labelKey, key) in filteredTopMenus" :key="key" @click="selectTop(key)"
            :class="['rounded-xl px-2 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-md lg:px-4 lg:py-2 lg:text-sm', selectedTop === key ? 'bg-white theme-text-primary shadow-md shadow-slate-950/10' : 'hover:bg-white/10 text-slate-200']">
            {{ $t('navbar.' + key) }}
          </button>
        </nav>
      </div>

      <!-- Right side: Language + User Avatar -->
      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <!-- Language Switcher -->
        <div
          class="flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 p-1 shadow-md shadow-slate-950/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/14 hover:shadow-lg"
          role="group"
          aria-label="Language switcher"
        >
          <button
            @click="switchLang('en')"
            :class="langBtnClass('en')"
            class="rounded-lg p-1 transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:theme-input-focus focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900"
            aria-label="Switch to English"
          >
            <img src="/flags/us.png" alt="English" class="h-5 w-5 rounded sm:h-6 sm:w-6" />
          </button>
          <button
            @click="switchLang('ar')"
            :class="langBtnClass('ar')"
            class="rounded-lg p-1 transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:theme-input-focus focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900"
            aria-label="التبديل إلى العربية"
          >
            <img src="/flags/eg.png" alt="العربية" class="h-5 w-5 rounded sm:h-6 sm:w-6" />
          </button>
        </div>

        <!-- User Avatar with Dropdown -->
        <div class="relative shrink-0">
          <button @click="toggleUserMenu"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold theme-text-light transition-all duration-200 hover:bg-white/16 hover:scale-105 shadow-sm shadow-slate-950/10 sm:h-10 sm:w-10 sm:text-lg">
            {{ userInitials }}
          </button>
          <!-- User Dropdown Menu -->
          <div v-if="userMenuOpen" class="absolute top-12 transition-all duration-300 ease-out transform opacity-100 scale-100" :class="isRTL ? 'left-0' : 'right-0'" style="z-index: 60;">
            <div class="min-w-[160px] animate-fade-in rounded-xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-200/60">
              <button @click="goToProfile(); userMenuOpen = false"
                class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-3 theme-text-primary transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.824.645 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ $t('profile.title') || 'Profile' }}
              </button>
              <button @click="goToSettings(); userMenuOpen = false"
                class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-3 theme-text-primary transition-colors duration-200">
                <WrenchScrewdriverIcon class="w-4 h-4" />
                {{ $t('settings') || 'Settings' }}
              </button>
              <button @click="showLogoutDialog = true; userMenuOpen = false"
                class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-3 theme-text-primary transition-colors duration-200">
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
            <transition name="sidebar-label">
              <div v-if="!effectiveCollapsed" class="font-semibold text-base lg:text-lg">
                {{ $t('appName') }}
              </div>
            </transition>
          </div>
          <button v-if="!isMobile" @click="toggleCollapsed" class="theme-sidebar-collapse-btn rounded-lg p-2 sm:p-3 hover:scale-105 transition-all duration-200">
            <!-- English: collapse left, expand right | Arabic: collapse right, expand left -->
            <svg v-if="!effectiveCollapsed" class="w-5 h-5 theme-accent-strong" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" :style="{ transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)' }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <svg v-else class="w-5 h-5 theme-accent-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" :style="{ transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)' }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Mobile Header -->
        <div v-if="isMobile" class="mb-4 flex items-center justify-between sm:hidden">
          <div class="flex min-w-0 items-center gap-3">
            <div class="w-9 h-9 rounded-md overflow-hidden shadow-md">
              <img src="../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-cover transition-transform duration-300 hover:scale-110">
            </div>
            <div class="truncate font-semibold text-base">{{ $t('appName') }}</div>
          </div>
          <button @click="toggleSidebar" class="theme-sidebar-collapse-btn p-2 rounded-lg hover:scale-105 transition-all duration-200">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Top Menu -->
        <div v-if="isMobile" class="mb-4 space-y-1 sm:hidden">
          <button v-for="(labelKey, key) in filteredTopMenus" :key="key" @click="selectTop(key)"
            :class="['w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200 hover:scale-105', selectedTop === key ? 'theme-sidebar-item-active' : 'theme-sidebar-item']">
            {{ $t('navbar.' + key) }}
          </button>
        </div>

        <!-- Vertical Menu -->
        <ul class="space-y-2.5">
          <li v-for="item in filteredVerticalMenu" :key="item.name">
            <button @click="selectVertical(item.routeName)"
              :class="['sidebar-link group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md sm:px-4 sm:py-1.5', item.routeName === 'admin-reports-list' ? (isReportsListActive ? 'sidebar-link-active theme-sidebar-item-active' : 'theme-sidebar-item') : (currentRouteName === item.routeName ? 'sidebar-link-active theme-sidebar-item-active' : 'theme-sidebar-item'), effectiveCollapsed ? 'sidebar-link-collapsed justify-center px-2.5 py-2.5' : '']">
              <div
                class="sidebar-link-icon theme-sidebar-icon flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200"
                :class="(item.routeName === 'admin-reports-list' ? isReportsListActive : currentRouteName === item.routeName) ? 'scale-110' : ''"
              >
                <component :is="menuIconComponent(item.name)" class="h-5 w-5" />
              </div>
              <transition name="sidebar-label">
                <span v-if="!effectiveCollapsed" class="truncate text-sm font-medium">
                  {{ $t(item.label) }}
                </span>
              </transition>
            </button>
          </li>
          <!-- Transport module: show dynamic reports inline under the transport menu -->
          <li v-if="reportsForModule && reportsForModule.length">
            <transition name="sidebar-label">
              <h4 v-if="!effectiveCollapsed" class="px-4 text-xs uppercase theme-text-muted tracking-wide mt-4 m:px-5 sm:py-3">{{ $t('reports.moduleReports') || 'Reports' }}</h4>
            </transition>
            <ul class=" space-y-2 ">
              <li v-for="r in reportsForModule" :key="r.id">
                <button @click="openReport(r.id)" :class="['sidebar-link group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md sm:px-4 sm:py-3', isDynamicReportActive(r) ? 'sidebar-link-active theme-sidebar-item-active' : 'theme-sidebar-item', effectiveCollapsed ? 'sidebar-link-collapsed justify-center px-2.5 py-2.5' : '']">
                  <div
                    class="sidebar-link-icon theme-sidebar-icon flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
                    :class="isDynamicReportActive(r) ? 'scale-110' : ''"
                  >
                    <DocumentTextIcon class="h-5 w-6" />
                  </div>
                  <transition name="sidebar-label">
                    <span v-if="!effectiveCollapsed" class="truncate text-sm font-medium">{{ $i18n.locale === 'ar' ? (r.arTitle || r.title) : (r.title || r.arTitle) }}</span>
                  </transition>
                </button>
              </li>
            </ul>
          </li>
        </ul>

        
      </aside>

      <!-- Mobile Overlay -->
      <div v-if="sidebarOpen && isMobile" class="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300" @click="toggleSidebar"></div>

      <!-- Main Content -->
      <main class="dashboard-module-content app-scrollbar theme-main-gradient flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
        <!-- <h2 class="text-2xl font-semibold mb-6 theme-text-primary">{{ $t(currentLabel) }}</h2> -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component
              :is="Component"
              :key="$route.fullPath"
              @navigate-report="navigateToReport"
              @navigate-statement="navigateToStatement"
            />
          </transition>
        </router-view>
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
import {
  ArchiveBoxIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentTextIcon,
  IdentificationIcon,
  MapPinIcon,
  Squares2X2Icon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon,
  WalletIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'DashboardLayout',
  components: { AuthLogout, DocumentTextIcon, WrenchScrewdriverIcon },
  setup() {
    const { logout: authLogout, user } = useAuth()
    const router = useRouter()
    return { authLogout, user, router }
  },
  data() {
    return {
      topMenus: { supplies: 'supplies', transport: 'transport', equipmentLog: 'equipmentLog', extracts: 'extracts',  admin: 'admin' },
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
          { name: 'contractorsList', label: 'dashboard.contractorsList', routeName: 'equipment-contractors-list' },
          { name: 'equipmentList', label: 'equipment.title', routeName: 'equipment-list' },
          // { name: 'equipmentReport', label: 'equipment.reportMenu', routeName: 'equipment-report' },
          { name: 'driversList', label: 'dashboard.driversList', routeName: 'equipment-drivers-list' },
          { name: 'contractorRentals', label: 'dashboard.contractorStatement', routeName: 'equipment-contractor-statement' }
        ],
        // companyWallet: [
        //   { name: 'companyWallet', label: 'dashboard.companyWallet', routeName: 'company-wallet' },
        //   { name: 'companyTransactions', label: 'transactions', routeName: 'company-transactions' },
        //   { name: 'expensesList', label: 'dashboard.expenses', routeName: 'expenses-list' },
        //   { name: 'expensesReport', label: 'expenses.report', routeName: 'expenses-report' }
        // ],
        extracts: [
          { name: 'extractsList', label: 'extracts.title', routeName: 'extracts-list' },
          { name: 'contractorsList', label: 'dashboard.contractorsList', routeName: 'extracts-contractors-list' },
          { name: 'extractItems', label: 'dashboard.extractItems', routeName: 'extracts-items' },
          { name: 'contractorStatement', label: 'dashboard.contractorStatement', routeName: 'contractor-extract-statement' },
          
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
    headerGradient() { return 'theme-dashboard-header' },
    userInitials() {
      if (!this.user || !this.user.name) return '??'
      const names = this.user.name.trim().split(' ')
      const first = names[0]?.[0] || ''
      const second = names[1]?.[0] || ''
      return (first + second).toUpperCase() || 'U'
    },
    langBtnClass() {
      return (lang) => this.$i18n.locale === lang
        ? 'bg-white/90 theme-ring-active scale-105 shadow-sm'
        : 'opacity-80 hover:opacity-100 hover:bg-white/10'
    },
    asideClasses() {
      const base = 'app-scrollbar theme-sidebar border-r p-3 sm:p-4 transition-all duration-300 z-40 flex flex-col overflow-y-auto shadow-sm'
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
      // When viewing profile-related pages, show a small profile menu
      const profileRoutes = ['profile', 'settings']
      if (profileRoutes.includes(this.currentRouteName) || ['profile', 'settings'].includes(this.$route?.meta?.module)) {
        return [
          { name: 'profile', label: 'profile.title', routeName: 'profile' },
          { name: 'settings', label: 'profile.settings', routeName: 'settings' },
          { name: 'signout', label: 'labels.signOut', routeName: 'signout' }
        ]
      }

      const menu = this.verticalMenu || []
      if (this.selectedTop === 'admin' && !this.isAdmin) {
        return []
      }
      return menu
    },
    reportsForModule() {
      if (!this.reports || !this.selectedTop) return []
      const selectedModule = this.normalizeDashboardModule(this.selectedTop)
      return this.reports.filter((r) => this.normalizeDashboardModule(r?.module) === selectedModule)
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
    isReportsListActive() {
      return this.currentRouteName === 'admin-reports-list' || String(this.currentRouteName || '').startsWith('admin-reports-')
    },
    selectedTop() {
      const routeName = this.currentRouteName
      // If the route explicitly opts out of dashboard top selection, keep no top highlight.
      const routeModule = this.$route?.meta?.module
      if (routeModule === 'profile' || routeModule === 'settings' || routeName === 'settings') return ''

      // If route has explicit mode (params/query/meta) prefer it to determine the top menu
      const routeMode = (this.$route && (this.$route.params?.mode || this.$route.query?.mode || this.$route.meta?.mode)) || ''
      if (String(routeMode).toLowerCase() === 'equipment') return 'equipmentLog'
      // If we're opening a report, look up the report and use its module
      if (routeName === 'admin-reports-run') {
        const reportId = this.$route?.params?.id
        if (reportId && this.reports && this.reports.length) {
          const report = this.reports.find(r => r.id == reportId || r.id === String(reportId))
          if (report && report.module) {
            return this.normalizeDashboardModule(report.module) || 'admin'
          }
        }
      }
      // If we're on contractor detail, prefer the originating module from query param
      const from = this.$route?.query?.from
      if (routeName === 'contractor-detail' && from) {
        const f = String(from).toLowerCase()
        if (f === 'transport') return 'transport'
        if (f === 'supplies' || f === 'export') return 'supplies'
        // Accept various legacy and new identifiers for equipment/rentals
        if (f === 'equipment' || f === 'equipmentlogs' || f === 'equipmentlog') return 'equipmentLog'
        if (f === 'extract' || f === 'extracts') return 'extracts'
      }
      // Extracts module routes
      const extractsRoutes = ['extracts-list', 'create-extract', 'extracts-detail', 'extracts-items', 'extracts-contractors-list', 'contractor-extract-statement']
      if (extractsRoutes.includes(routeName)) return 'extracts'
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
    normalizeDashboardModule(moduleName) {
      const norm = String(moduleName || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!norm) return ''
      if (['supplies', 'supply', 'exports', 'export'].includes(norm)) return 'supplies'
      if (['transport', 'transports'].includes(norm)) return 'transport'
      if ([
        'equipment',
        'equipmentlog',
        'equipmentlogs',
        'rent',
        'rents',
        'rental',
        'rentals',
        'equipmentrental',
        'equipmentrentals'
      ].includes(norm)) return 'equipmentLog'
      if ([
        'companywallet',
        'wallet',
        'companyfinance',
        'finance',
        'expenses',
        'expense',
        'transactions',
        'companytransactions'
      ].includes(norm)) return 'companyWallet'
      if (['extract', 'extracts'].includes(norm)) return 'extracts'
      if (['admin', 'administration'].includes(norm)) return 'admin'
      return norm
    },
    isDynamicReportActive(report) {
      if (!report) return false
      if (this.currentRouteName !== 'admin-reports-run') return false
      return String(this.$route?.params?.id) === String(report.id)
    },
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
        if (this.isMobile) this.sidebarOpen = false
        return
      }
      if (routeName === 'signout') {
        this.showLogoutDialog = true
        if (this.isMobile) this.sidebarOpen = false
        return
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
      let routeName = 'contractor-supply-statement'
      const top = this.selectedTop
      if (top === 'transport') routeName = 'contractor-transport-statement'
      else if (top === 'equipmentLog') routeName = 'equipment-contractor-statement'
      else if (top === 'extracts') routeName = 'contractor-extract-statement'

      this.router.push({ name: routeName, params: { id: contractorId } })
      if (contractorId) localStorage.setItem('contractor-statement-id', contractorId.toString())
      if (this.isMobile) this.sidebarOpen = false
    },
    goToProfile() { this.router.push({ name: 'profile' }) },
    goToSettings() { this.router.push({ name: 'settings' }) },
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
    menuIconComponent(name) {
      const iconTypes = {
        records: ClipboardDocumentListIcon,
        contractors: UsersIcon,
        crushers: BuildingOffice2Icon,
        items: Squares2X2Icon,
        vehicles: TruckIcon,
        statement: DocumentTextIcon,
        drivers: IdentificationIcon,
        equipment: WrenchScrewdriverIcon,
        extract: ArchiveBoxIcon,
        wallet: WalletIcon,
        money: BanknotesIcon,
        users: UserGroupIcon,
        locations: MapPinIcon,
        reports: ChartBarIcon,
        changes: ClockIcon,
        default: ClipboardDocumentListIcon
      }
      const aliases = {
        suppliesList: 'records',
        transportList: 'records',
        extractsList: 'records',
        equipmentLogList: 'records',
        suppliersList: 'contractors',
        transportContractorsList: 'contractors',
        contractorsList: 'contractors',
        crushersList: 'crushers',
        suppliesItemList: 'items',
        transportItemsList: 'items',
        extractItems: 'extract',
        vehiclesList: 'vehicles',
        contractorStatement: 'statement',
        contractorSupplyStatement: 'statement',
        contractorTransportStatement: 'statement',
        contractorRentals: 'statement',
        driversList: 'drivers',
        equipmentList: 'equipment',
        companyWallet: 'wallet',
        companyTransactions: 'wallet',
        expensesList: 'money',
        expensesReport: 'reports',
        changesByDate: 'changes',
        reportsList: 'reports',
        usersList: 'users',
        locations: 'locations'
        ,
        profile: 'users',
        settings: 'equipment',
        signout: 'users'
      }
      return iconTypes[aliases[name]] || iconTypes.default
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
        const payload = res?.data
        if (Array.isArray(payload)) this.reports = payload
        else if (Array.isArray(payload?.items)) this.reports = payload.items
        else if (Array.isArray(payload?.data)) this.reports = payload.data
        else this.reports = []
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

.sidebar-link {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.sidebar-link-collapsed {
  width: 3rem;
  min-width: 3rem;
  height: 3rem;
  min-height: 3rem;
  border-radius: 1rem;
}

.sidebar-link-collapsed:not(.sidebar-link-active) {
  background: transparent;
  box-shadow: none;
}

.sidebar-link-collapsed:not(.sidebar-link-active):hover {
  background: rgba(var(--theme-primary-rgb), 0.08);
}

.sidebar-link-collapsed .sidebar-link-icon {
  height: 2.5rem;
  width: 2.5rem;
}

.sidebar-link-collapsed:not(.sidebar-link-active) .sidebar-link-icon {
  background: transparent !important;
  color: rgb(var(--theme-primary-600)) !important;
}

.sidebar-link-collapsed:not(.sidebar-link-active):hover .sidebar-link-icon {
  background: rgba(var(--theme-primary-rgb), 0.12) !important;
  color: rgb(var(--theme-primary-700)) !important;
}

.sidebar-link::before {
  content: '';
  position: absolute;
  inset-block: 0.5rem;
  inset-inline-start: 0.2rem;
  width: 0.22rem;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.92);
  opacity: 0;
  transform: scaleY(0.35);
  transform-origin: center;
  z-index: 0;
}

.sidebar-link-active {
  animation: sidebar-active-glow 2.2s ease-in-out infinite;
}

.sidebar-link-active::before {
  opacity: 1;
  animation: sidebar-active-indicator 1.45s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

.sidebar-label-enter-active,
.sidebar-label-leave-active {
  transition: opacity 180ms ease, transform 220ms ease, max-width 220ms ease;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar-label-enter-from,
.sidebar-label-leave-to {
  opacity: 0;
  transform: translateX(-8px);
  max-width: 0;
}

.direction-rtl .sidebar-label-enter-from,
.direction-rtl .sidebar-label-leave-to {
  transform: translateX(8px);
}

.sidebar-label-enter-to,
.sidebar-label-leave-from {
  opacity: 1;
  transform: translateX(0);
  max-width: 14rem;
}

.sidebar-link-collapsed.sidebar-link-active {
  border-radius: 1rem;
  animation: none;
}

.sidebar-link-collapsed.sidebar-link-active::before {
  display: none;
  inset-block: 0.55rem;
  inset-inline-start: 0.16rem;
  width: 0.18rem;
  animation: none;
  opacity: 1;
  transform: scaleY(1);
}

.sidebar-link-collapsed.sidebar-link-active .sidebar-link-icon {
  background: transparent !important;
  box-shadow: none !important;
  color: rgb(255 255 255) !important;
  transform: none !important;
}

/* Sidebar transition */
aside {
  transition: width 0.3s ease, transform 0.3s ease;
}

/* Modern scrollbar style for dashboard scroll areas */
.app-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--theme-primary-rgb), 0.55) transparent;
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
  background: linear-gradient(180deg, rgba(var(--theme-primary-rgb), 0.68), rgba(var(--theme-primary-rgb), 0.8));
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.app-scrollbar:hover::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(var(--theme-primary-rgb), 0.85), rgba(var(--theme-primary-rgb), 0.95));
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* Fade transition for router views */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Animate fade-in for dropdown */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

@keyframes sidebar-active-glow {
  0%,
  100% {
    box-shadow: 0 8px 18px rgba(var(--theme-primary-rgb), 0.18);
  }
  50% {
    box-shadow: 0 12px 26px rgba(var(--theme-primary-rgb), 0.3);
  }
}

@keyframes sidebar-active-indicator {
  0% {
    transform: scaleY(0.45) translateY(-0.1rem);
  }
  100% {
    transform: scaleY(1) translateY(0.1rem);
  }
}
</style>

<template>
  <div class="flex flex-col h-screen" :class="{ 'direction-rtl': isRTL }">
    <!-- Top horizontal navbar (darker indigo gradient) -->
    <header class="flex items-center justify-between px-4 py-3 shadow text-white" :class="headerGradient">
      <div class="flex items-center gap-4">
        <!-- Hamburger for mobile -->
        <button @click="toggleSidebar" class="sm:hidden p-2 rounded hover:bg-white/10"
          :aria-expanded="sidebarOpen.toString()">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <!-- Brand -->
        <div class="flex items-center gap-3">
          <div :class="['w-9 h-9 rounded-md flex items-center justify-center font-bold text-white', brandGradient]">
            <img src="../../assets/logo.png" alt="logoKeshta">
          </div>
          <div class="text-xl font-bold whitespace-nowrap">{{ $t('appName') }}</div>
        </div>

        <!-- top menus (desktop) -->
        <nav class="hidden sm:flex gap-2 ml-4">
          <button v-for="(labelKey, key) in topMenus" :key="key" @click="selectTop(key)"
            :class="['px-3 py-1 rounded text-sm transition', selectedTop === key ? 'bg-white/10 backdrop-blur-sm' : 'hover:bg-white/8']">
            {{ $t('navbar.' + key) }}
          </button>
        </nav>
      </div>

      <!-- actions: language + logout -->
      <div class="flex items-center gap-3">
        <div class="flex gap-2">
          <button @click="switchLang('en')" :class="langBtnClass('en')" aria-label="English" class="rounded">
            <img src="/flags/us.png" alt="EN" class="w-6 h-6" />
          </button>
          <button @click="switchLang('ar')" :class="langBtnClass('ar')" aria-label="Arabic" class="rounded">
            <img src="/flags/eg.png" alt="AR" class="w-6 h-6" />
          </button>
        </div>

        <button @click="showLogoutDialog = true" class="px-3 py-1 rounded hover:bg-white/10 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          {{ $t('labels.logout') }}
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside role="navigation" :class="asideClasses" :aria-hidden="isMobile ? (!sidebarOpen).toString() : 'false'">
        <!-- Desktop top area: brand + collapse icon (only desktop) -->
        <div class="hidden sm:flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div :class="['w-9 h-9 rounded-md flex items-center justify-center font-bold text-white', brandGradient]">
              <img src="../../assets/logo.png" alt="logokeshta"></div>
            <div v-if="!effectiveCollapsed" class="font-semibold">{{ $t('appName') }}</div>
          </div>

          <!-- collapse icon: visible only on desktop -->
          <button v-if="!isMobile" @click="toggleCollapsed" class="p-2 rounded hover:bg-indigo-100"
            :title="effectiveCollapsed ? $t('dashboard.expand') : $t('dashboard.collapse')">
            <svg v-if="!effectiveCollapsed" class="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="none">
              <path d="M6 6h12M6 12h12M6 18h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <svg v-else class="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <!-- Mobile header inside sidebar (close button) -->
        <div v-if="isMobile" class="sm:hidden flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div :class="['w-9 h-9 rounded-md flex items-center justify-center font-bold text-white', brandGradient]">
              <img src="../../assets/logo.png" alt="logoKeshta">
            </div>
            <div class="font-semibold">{{ $t('appName') }}</div>
          </div>
          <button @click="toggleSidebar" class="p-2 rounded hover:bg-indigo-100">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- Mobile only: top menu inside sidebar -->
        <div v-if="isMobile" class="sm:hidden mb-4 space-y-2">
          <button v-for="(labelKey, key) in topMenus" :key="key" @click="selectTop(key)"
            :class="['w-full px-3 py-2 rounded', selectedTop === key ? 'bg-indigo-500 text-white' : 'bg-indigo-100 hover:bg-indigo-200', isRTL ? 'text-right' : 'text-left']">
            {{ $t('navbar.' + key) }}
          </button>
        </div>

        <!-- Vertical menu -->
        <ul class="space-y-2">
          <li v-for="item in verticalMenu" :key="item.name">
            <button @click="selectVertical(item.name)" :class="[
              'w-full px-3 py-2 rounded flex items-center gap-3 transition',
              selectedVertical === item.name ? activeItemClass : 'hover:bg-indigo-100',
              effectiveCollapsed ? 'justify-center' : '',
              isRTL ? 'flex-row-reverse text-right' : 'text-left'
            ]" :title="effectiveCollapsed ? $t(item.label) : ''">
              <span v-html="menuIcon(item.name, selectedVertical === item.name)" class="w-5 h-5 flex-shrink-0"></span>
              <span v-if="!effectiveCollapsed" class="flex-1 text-sm">
                {{ $t(item.label) }}
              </span>
            </button>
          </li>
        </ul>

        <!-- footer note (only desktop) -->
        <div class="mt-6 pt-4 border-t hidden sm:block">
          <div class="text-xs text-gray-500">
            {{ $t('appName') }}
          </div>
        </div>
      </aside>

      <!-- Overlay for mobile when sidebar open -->
      <transition name="fade">
        <div v-if="sidebarOpen && isMobile" class="fixed inset-0 bg-black/30 z-30" @click="toggleSidebar"></div>
      </transition>

      <!-- Main content -->
      <main class="flex-1 p-6 overflow-auto bg-white">
        <h2 class="text-2xl font-semibold mb-4">{{ $t(currentLabel) }}</h2>
        <component :is="currentComponent" />
      </main>
    </div>

    <!-- Logout Dialog -->
    <AuthLogout 
      v-if="showLogoutDialog"
      @cancel="showLogoutDialog = false"
      @logout-success="handleLogoutSuccess"
    />
  </div>
</template>

<script>
import NewSupply from './NewSupply.vue'
import SuppliesList from './SuppliesList.vue'
import SuppliesReport from './SuppliesReport.vue'
import ContractorsList from './ContractorsList.vue'
import CrushersList from './CrushersList.vue'
import VehiclesList from './VehiclesList.vue'
import TransportList from './TransportList.vue'
import RentalList from './RentalList.vue'
import ExpensesList from './ExpensesList.vue'
import AuthLogout from '../auth/Logout.vue'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'DashboardPage',
  components: { NewSupply, SuppliesList, SuppliesReport, ContractorsList, CrushersList, VehiclesList, TransportList, RentalList, ExpensesList, AuthLogout },
  setup() {
    const { logout: authLogout } = useAuth()
    return { authLogout }
  },
  data() {
    return {
      // menus
      topMenus: { supplies: 'supplies', transport: 'transport', expenses: 'expenses', equipmentRent: 'equipmentRent', companyEquipment: 'companyEquipment' },
      selectedTop: 'supplies',
      // vertical submenus map
      menuMap: {
        supplies: [
          { name: 'newSupply', label: 'dashboard.newSupply', component: 'NewSupply' },
          { name: 'suppliesList', label: 'dashboard.suppliesList', component: 'SuppliesList' },
          { name: 'suppliesReport', label: 'dashboard.suppliesReport', component: 'SuppliesReport' },
          { name: 'crushersList', label: 'dashboard.crushersList', component: 'CrushersList' },
          { name: 'contractorsList', label: 'dashboard.contractorsList', component: 'ContractorsList' },
          { name: 'vehiclesList', label: 'dashboard.vehiclesList', component: 'VehiclesList' }
        ],
        transport: [
          { name: 'transportList', label: 'dashboard.transportList', component: 'TransportList' }
        ],
        expenses: [
          { name: 'expensesList', label: 'dashboard.expenses', component: 'ExpensesList' }
        ],
        equipmentRent: [
          { name: 'rentalList', label: 'dashboard.equipmentRent', component: 'RentalList' }
        ],
        companyEquipment: [
          { name: 'companyEquipmentPage', label: 'dashboard.companyEquipment', component: { template: '<div>Company equipment content</div>' } }
        ]
      },

      // UI state
      selectedVertical: 'newSupply',
      sidebarOpen: false,
      collapsedSidebar: JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false'),
      showLogoutDialog: false,

      // responsive helper
      isMobile: window.innerWidth < 640
    }
  },
  computed: {
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' },

    // effective collapsed only for desktop (mobile -> always expanded)
    effectiveCollapsed() {
      return this.isMobile ? false : this.collapsedSidebar
    },

    // current vertical menu items based on selected top
    verticalMenu() {
      return this.menuMap[this.selectedTop] || []
    },

    // current item selected
    currentItem() {
      return this.verticalMenu.find(i => i.name === this.selectedVertical) || (this.verticalMenu[0] || null)
    },

    currentLabel() {
      return this.currentItem ? this.currentItem.label : ''
    },

    // produce component to render (string -> imported component; or inline component)
    currentComponent() {
      if (!this.currentItem) return { template: '<div>Select an item</div>' }
      const mapping = { NewSupply, SuppliesList, SuppliesReport, ContractorsList, CrushersList, VehiclesList, TransportList, RentalList, ExpensesList }
      const comp = this.currentItem.component
      if (typeof comp === 'string') {
        return mapping[comp] || { template: '<div>Component not found</div>' }
      }
      return comp
    },

    // header gradient classes (darker modern indigo)
    headerGradient() {
      return 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700'
    },

    brandGradient() {
      return 'bg-gradient-to-br from-indigo-800 to-indigo-600'
    },

    // classes for sidebar width (collapsed shows narrow column)
    computedSidebarWidthClass() {
      return this.effectiveCollapsed ? 'w-20' : 'w-72'
    },

    // aside classes combine desktop and mobile behavior
    asideClasses() {
      const base = 'bg-indigo-50 p-4 overflow-auto transition-transform duration-200 z-40 transform';
      // mobile (drawer) behavior
      if (this.isMobile) {
        const side = this.isRTL ? 'right-0' : 'left-0'
        const mobileWidth = 'w-64' // 16rem for drawer on mobile
        const transformClass = this.sidebarOpen ? 'translate-x-0' : (this.isRTL ? 'translate-x-full' : '-translate-x-full')
        return `${base} ${side} fixed top-0 bottom-0 ${mobileWidth} ${transformClass}`
      }
      // desktop behavior: static width (collapsed or expanded)
      return `${base} ${this.computedSidebarWidthClass} relative`
    },

    // active item style (gradient)
    activeItemClass() {
      return 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow'
    }
  },
  watch: {
    // persist collapsed state
    collapsedSidebar(v) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(v))
    },
    // when mobile sidebar opens/closes lock body scroll
    sidebarOpen(v) {
      if (this.isMobile) {
        document.body.style.overflow = v ? 'hidden' : ''
      }
    }
  },
  methods: {
    // top menu selection
    selectTop(key) {
      this.selectedTop = key
      // set first vertical child
      const first = (this.menuMap[key] && this.menuMap[key][0]) ? this.menuMap[key][0].name : null
      if (first) this.selectedVertical = first
      this.sidebarOpen = false
    },

    // vertical selection
    selectVertical(name) {
      this.selectedVertical = name
      // close sidebar on mobile for better UX
      if (this.isMobile) this.sidebarOpen = false
    },

    // toggle sidebar drawer (mobile)
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    // collapse sidebar to icons only (desktop only)
    toggleCollapsed() {
      if (this.isMobile) return
      this.collapsedSidebar = !this.collapsedSidebar
    },

    handleLogoutSuccess() {
      this.showLogoutDialog = false
      // The auth system will handle the logout and redirect
      window.location.reload()
    },

    // language switch
    switchLang(lang) {
      this.$i18n.locale = lang
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
      // keep existing collapsedSidebar state
      this.$nextTick(() => { })
    },

    langBtnClass(lang) {
      return this.$i18n.locale === lang ? 'ring-2 ring-white/60 rounded' : 'opacity-80'
    },

    // small helper to return an inline SVG per menu name (you can expand icons here)
    menuIcon(name, isActive) {
      const colorClass = isActive ? 'text-white' : 'text-indigo-600'
      const icons = {
        newSupply: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        suppliesList: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        crushersList: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`,
        contractorsList: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        vehiclesList: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><path d="M3 13h18l-2 4H5zM7 9h10l2 4H5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        transportList: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><path d="M3 13h18v-5H3v5zM5 18h2v2H5v-2zM17 18h2v2h-2v-2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        expensesList: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        rentalList: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 14h8M8 18h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
        default: `<svg class="w-5 h-5 ${colorClass}" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.4"/></svg>`
      }
      return icons[name] || icons['default']
    },

    // handle resize to update isMobile reactive flag
    onResize() {
      const nowMobile = window.innerWidth < 640
      // when switching to desktop ensure body scroll unlocked and sidebarOpen false
      if (!nowMobile) {
        document.body.style.overflow = ''
        this.sidebarOpen = false
      }
      this.isMobile = nowMobile
    }
  },

  mounted() {
    // initial vertical menu selection
    const first = (this.menuMap[this.selectedTop] && this.menuMap[this.selectedTop][0]) ? this.menuMap[this.selectedTop][0].name : null
    if (first && !this.selectedVertical) this.selectedVertical = first

    // set language dir on mount as well
    document.documentElement.lang = this.$i18n.locale || 'en'
    document.documentElement.dir = (this.$i18n.locale === 'ar') ? 'rtl' : 'ltr'

    // resize listener
    window.addEventListener('resize', this.onResize)
    // initial call to set isMobile correctly
    this.onResize()
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

/* Fade overlay transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* small visual polish */
.bg-indigo-50 {
  background-color: #eef2ff;
}

/* ensure collapsed icon buttons center */
.w-20 button {
  justify-content: center !important;
}

/* subtle hover background (supports dark indigo family) */
.hover\:bg-white\/8:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

/* RTL specific adjustments */
.direction-rtl .flex-row-reverse {
  flex-direction: row-reverse !important;
}

.direction-rtl .text-right {
  text-align: right !important;
}

.direction-rtl .text-left {
  text-align: left !important;
}

.direction-rtl button {
  text-align: right !important;
}

.direction-rtl .gap-3 {
  gap: 0.75rem !important;
}

.direction-rtl .gap-2 {
  gap: 0.5rem !important;
}

/* Force RTL layout for sidebar menu items */
.direction-rtl .space-y-2 button {
  flex-direction: row-reverse !important;
  text-align: right !important;
}

.direction-rtl .space-y-2 button span:first-child {
  order: 2 !important;
}

.direction-rtl .space-y-2 button span:last-child {
  order: 1 !important;
}

/* reduced opacity for smaller screens */
@media (max-width: 639px) {
  aside {
    width: 16rem;
  }

  /* mobile drawer width */
}
</style>

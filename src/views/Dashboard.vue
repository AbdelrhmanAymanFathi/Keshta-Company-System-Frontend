<template>
  <div class="flex min-h-screen h-dvh flex-col" :class="{ 'direction-rtl': isRTL }" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Top horizontal navbar -->
    <header :class="headerClasses">
      <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <!-- Hamburger for mobile and overlay/drawer/reveal desktop layouts -->
        <button
          @click="toggleSidebar"
          :class="[
            'p-2 theme-rounded hover:bg-white/12 transition-all',
            showDesktopMenuToggle ? '' : 'sm:hidden'
          ]"
        >
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
        <nav class="hidden md:flex ml-2 max-w-full items-center gap-1 whitespace-nowrap lg:ml-4 lg:gap-2">
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

        <!-- Notification Bell -->
        <div class="relative shrink-0">
          <button @click="toggleNotificationMenu"
            class="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm transition-all duration-200 hover:bg-white/16 hover:scale-105 shadow-sm shadow-slate-950/10 sm:h-10 sm:w-10">
            <svg class="w-5 h-5 theme-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span v-if="notificationStore.unreadCount > 0"
              class="absolute -top-1 -end-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none shadow-md shadow-red-500/40">
              {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
            </span>
          </button>
          <!-- Notification Dropdown -->
          <div v-if="notificationMenuOpen"
            class="absolute top-12 transition-all duration-300 ease-out transform opacity-100 scale-100"
            :class="isRTL ? 'left-0' : 'right-0'" style="z-index: 60;">
            <div class="w-80 animate-fade-in rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span class="text-sm font-semibold theme-text-primary">{{ $t('notifications.title') || 'Notifications' }}</span>
                <div class="flex items-center gap-2">
                  <button v-if="notificationStore.unreadCount > 0" @click="markAllRead"
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    {{ $t('notifications.markAllRead') || 'Mark all read' }}
                  </button>
                  <button @click="notificationMenuOpen = false" class="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div v-if="notifLoading" class="flex items-center justify-center py-8">
                <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div v-else-if="notifItems.length === 0" class="flex flex-col items-center justify-center py-8 text-slate-400">
                <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span class="text-sm">{{ $t('notifications.empty') || 'No notifications yet' }}</span>
              </div>
              <div v-else class="max-h-96 overflow-y-auto divide-y divide-slate-50">
                <div v-for="item in notifItems" :key="item.id"
                  @click="onNotifClick(item)"
                  class="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150"
                  :class="item.isRead ? 'hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'">
                  <div class="shrink-0 mt-0.5">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      :style="{ backgroundColor: typeColor(item.type) + '20', color: typeColor(item.type) }">
                      {{ typeAbbr(item.type) }}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm truncate" :class="item.isRead ? 'theme-text-primary' : 'font-semibold theme-text-primary'">
                      {{ item.title }}
                    </p>
                    <p class="text-xs text-slate-500 truncate mt-0.5">{{ item.message }}</p>
                    <p class="text-[10px] text-slate-400 mt-1">{{ formatNotifDate(item.createdAt) }}</p>
                  </div>
                  <div v-if="!item.isRead" class="shrink-0 mt-2">
                    <div class="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                </div>
              </div>
              <div class="border-t border-slate-100 p-2">
                <router-link :to="{ name: 'notifications' }" @click="notificationMenuOpen = false"
                  class="theme-btn-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:shadow-md active:scale-[0.97]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {{ $t('notifications.viewAll') || 'View all notifications' }}
                </router-link>
              </div>
            </div>
          </div>
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

    <div v-if="isHorizontal" class="border-b border-slate-200 bg-slate-50 px-3 py-2 sm:px-4 lg:px-6">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="item in filteredVerticalMenu"
          :key="item.routeName"
          type="button"
          @click="selectVertical(item.routeName)"
          :class="[
            'rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
            currentRouteName === item.routeName ? 'theme-sidebar-item-active' : 'theme-sidebar-item'
          ]"
        >
          {{ $t(item.label) }}
        </button>
      </div>
    </div>

    <div class="layout-shell">
      <!-- Sidebar -->
      <aside
        v-if="!isHorizontal && $route?.meta?.module !== 'notifications'"
        role="navigation"
        :class="asideClasses"
        @mouseenter="sidebarHovered = true"
        @mouseleave="sidebarHovered = false"
      >
        <!-- Desktop Brand + Collapse -->
        <div class="mb-4 hidden items-center justify-between sm:flex">
          <div class="flex items-center gap-3">
            <!-- Logo visible only when collapsed -->
            <!-- <div v-if="effectiveCollapsed" class="w-9 h-9 rounded-md overflow-hidden">
              <img src="../../assets/logo.png" alt="Keshta Logo" class="w-full h-full object-cover">
            </div> -->
            <!-- App name visible only when expanded -->
            <transition name="sidebar-label">
              <div v-if="showSidebarLabels" class="sidebar-label-text font-semibold text-base lg:text-lg">
                {{ $t('appName') }}
              </div>
            </transition>
          </div>
          <button v-if="showCollapseControl" @click="toggleCollapsed" class="theme-sidebar-collapse-btn theme-rounded p-2 sm:p-3 hover:scale-105 transition-all duration-200">
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
        <div v-if="isMobile" class="mb-4 flex items-center justify-between md:hidden">
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
        <div v-if="isMobile" class="mb-4 space-y-1 md:hidden">
          <button v-for="(labelKey, key) in filteredTopMenus" :key="key" @click="selectTop(key)"
            :class="['w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200 hover:scale-105', selectedTop === key ? 'theme-sidebar-item-active' : 'theme-sidebar-item']">
            {{ $t('navbar.' + key) }}
          </button>
        </div>

        <!-- Vertical Menu -->
        <ul class="space-y-2.5">
          <li v-for="item in filteredVerticalMenu" :key="item.name">
            <button
              @click="selectVertical(item.routeName)"
              :title="effectiveCollapsed ? $t(item.label) : undefined"
              :class="['sidebar-link group flex w-full items-center gap-3 theme-rounded px-3 py-2.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md sm:px-4 sm:py-1.5', item.routeName === 'admin-reports-list' ? (isReportsListActive ? 'sidebar-link-active theme-sidebar-item-active' : 'theme-sidebar-item') : (currentRouteName === item.routeName ? 'sidebar-link-active theme-sidebar-item-active' : 'theme-sidebar-item'), effectiveCollapsed ? 'sidebar-link-collapsed justify-center px-2.5 py-2.5' : '']">
              <div
                class="sidebar-link-icon theme-sidebar-icon flex h-9 w-9 flex-shrink-0 items-center justify-center theme-rounded transition-all duration-200"
                :class="(item.routeName === 'admin-reports-list' ? isReportsListActive : currentRouteName === item.routeName) ? 'scale-110' : ''"
              >
                <component :is="menuIconComponent(item.name)" class="h-5 w-5" />
              </div>
              <span v-if="showSidebarLabels" class="sidebar-label-text truncate text-sm font-medium">
                {{ $t(item.label) }}
              </span>
            </button>
          </li>
          <!-- Transport module: show dynamic reports inline under the transport menu -->
          <li v-if="reportsForModule && reportsForModule.length">
            <h4 v-if="showSidebarLabels" class="sidebar-label-text px-4 text-xs uppercase theme-text-muted tracking-wide mt-4 m:px-5 sm:py-3">{{ $t('reports.moduleReports') || 'Reports' }}</h4>
            <ul class=" space-y-2 ">
              <li v-for="r in reportsForModule" :key="r.id">
                <button
                  @click="openReport(r.id)"
                  :title="effectiveCollapsed ? ($i18n.locale === 'ar' ? (r.arTitle || r.title) : (r.title || r.arTitle)) : undefined"
                  :class="['sidebar-link group flex w-full items-center gap-3 theme-rounded px-3 py-2.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md sm:px-4 sm:py-3', isDynamicReportActive(r) ? 'sidebar-link-active theme-sidebar-item-active' : 'theme-sidebar-item', effectiveCollapsed ? 'sidebar-link-collapsed justify-center px-2.5 py-2.5' : '']">
                  <div
                    class="sidebar-link-icon theme-sidebar-icon flex h-9 w-9 items-center justify-center theme-rounded transition-all duration-200"
                    :class="isDynamicReportActive(r) ? 'scale-110' : ''"
                  >
                    <DocumentTextIcon class="h-5 w-6" />
                  </div>
                  <span v-if="showSidebarLabels" class="sidebar-label-text truncate text-sm font-medium">{{ $i18n.locale === 'ar' ? (r.arTitle || r.title) : (r.title || r.arTitle) }}</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>

        
      </aside>

      <div
        v-if="showSidebarOverlay"
        class="layout-backdrop"
        role="presentation"
        aria-hidden="true"
        @click="toggleSidebar"
      />

      <!-- Main Content -->
      <main :class="mainClasses">
        <!-- <h2 class="text-2xl font-semibold mb-6 theme-text-primary">{{ $t(currentLabel) }}</h2> -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in" appear>
            <div :key="$route.fullPath" class="w-full">
              <component
                :is="Component"
                @navigate-report="navigateToReport"
                @navigate-statement="navigateToStatement"
              />
            </div>
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
import { ThemeIcon } from '@acme/icon-packs'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { getReportDefs, getNotifications, markNotificationRead, markAllNotificationsRead } from '@/api'
import { DocumentTextIcon, WrenchScrewdriverIcon } from '@acme/icon-packs/legacy'
import { iconRevision, getMenuIcon } from '@acme/icon-packs'
import { themeRevision, loadTheme } from '@acme/theme-engine'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { resolveNotificationRoute } from '@/utils/notificationRouting'
import {
  getSidebarAsideClasses,
  shouldShowBackdrop,
  resolveEffectiveCollapsed,
  shouldShowSidebarLabels,
  startsClosedOnDesktop,
  showDesktopToggle,
  showCollapseControl,
  isSidebarCollapsedByDefault,
  lockBodyScroll
} from '@acme/layout-engine'

export default {
  name: 'DashboardLayout',
  components: { AuthLogout, DocumentTextIcon, WrenchScrewdriverIcon, ThemeIcon },
  setup() {
    const { logout: authLogout, user } = useAuth()
    const router = useRouter()
    const notificationStore = useNotificationStore()
    return { authLogout, user, router, notificationStore }
  },
  data() {
    return {
      topMenus: { supplies: 'supplies', transport: 'transport', equipmentLog: 'equipmentLog', extracts: 'extracts', expenses: 'expenses', payments: 'payments', treasury: 'treasury', reports: 'reports', admin: 'admin' },
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
        extracts: [
          { name: 'extractsList', label: 'extracts.title', routeName: 'extracts-list' },
          { name: 'contractorsList', label: 'dashboard.contractorsList', routeName: 'extracts-contractors-list' },
          { name: 'extractItems', label: 'dashboard.extractItems', routeName: 'extracts-items' },
          { name: 'contractorStatement', label: 'dashboard.contractorStatement', routeName: 'contractor-extract-statement' },
        ],
        payments: [
          { name: 'payments', label: 'dashboard.payments', routeName: 'payments' }
        ],
        expenses: [
          { name: 'expensesList', label: 'dashboard.expenses', routeName: 'expenses-list' },
          { name: 'expensesTerms', label: 'expenses.termsManagement', routeName: 'expenses-terms' },
          { name: 'expensesReport', label: 'expenses.report', routeName: 'expenses-report' }
        ],
        treasury: [
          { name: 'treasury', label: 'dashboard.treasury', routeName: 'treasury' },
          { name: 'companyTransactions', label: 'treasury.report', routeName: 'report-company-transactions' },
        ],
        reports: [
          { name: 'reportsLanding', label: 'navbar.reports', routeName: 'reports-landing' },
          { name: 'contractorsActivityReport', label: 'dashboard.contractorsActivityReport', routeName: 'contractors-activity-report' },
          // { name: 'suppliesReport', label: 'dashboard.suppliesReport', routeName: 'supplies-report' },
          // { name: 'transportReport', label: 'transport.reportMenu', routeName: 'transport-report' },
          // { name: 'equipmentReport', label: 'equipment.reportMenu', routeName: 'equipment-report' },
          { name: 'expensesReport', label: 'expenses.report', routeName: 'report-expenses-report' },
          { name: 'companyTransactions', label: 'treasury.report', routeName: 'report-company-transactions' },
        ],
        admin: [
          { name: 'adminStatistics', label: 'adminStats.title', routeName: 'admin-statistics' },
          { name: 'changesByDate', label: 'changes.title', routeName: 'changes-by-date' },
          { name: 'approvalsInbox', label: 'approvals.title', routeName: 'approvals-inbox' },
          { name: 'usersList', label: 'users.title', routeName: 'users-list' },
          { name: 'locations', label: 'locations.title', routeName: 'locations' },
          { name: 'units', label: 'units.title', routeName: 'admin-units-list' },
          { name: 'reportsList', label: 'Reports', routeName: 'admin-reports-list' }
        ]
      },
      sidebarOpen: false,
      collapsedSidebar: JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false'),
      sidebarHovered: false,
      showLogoutDialog: false,
      userMenuOpen: false,
      notificationMenuOpen: false,
      notifLoading: false,
      notifItems: [],
      isMobile: window.innerWidth < 768,
      reports: []
    }
  },
  computed: {
    isRTL() { return this.$i18n?.locale === 'ar' },
    iconTick() {
      return iconRevision.value
    },
    themeTick() {
      return themeRevision.value
    },
    sidebarType() {
      void this.themeTick
      return loadTheme().sidebarType || 'static'
    },
    showSidebarOverlay() {
      return shouldShowBackdrop(this.sidebarControllerState)
    },
    sidebarControllerState() {
      return {
        sidebarType: this.sidebarType,
        isMobile: this.isMobile,
        isRTL: this.isRTL,
        sidebarOpen: this.sidebarOpen,
        effectiveCollapsed: false,
        collapsedSidebar: this.collapsedSidebar,
        sidebarHovered: this.sidebarHovered,
        sidebarPinned: !this.collapsedSidebar
      }
    },
    showDesktopMenuToggle() {
      return this.isMobile || showDesktopToggle(this.sidebarType)
    },
    effectiveCollapsed() {
      return resolveEffectiveCollapsed(this.sidebarControllerState)
    },
    headerClasses() {
      return [
        'flex items-center justify-between gap-2 px-3 py-2.5 theme-text-light shadow-lg shadow-slate-950/20 sm:gap-4 sm:px-4 sm:py-3 lg:px-6 transition-all duration-300 ease-in-out border-b border-slate-800/70 theme-dashboard-header',
        this.isMobile ? 'fixed inset-x-0 top-0 z-50 w-full' : 'relative'
      ]
    },
    mainClasses() {
      return 'layout-main dashboard-module-content app-scrollbar theme-main-gradient overflow-y-auto' + (this.$route?.meta?.module === 'notifications' ? ' layout-main--full' : '')
    },
    showSidebarLabels() {
      return shouldShowSidebarLabels(this.sidebarControllerState)
    },
    showCollapseControl() {
      return !this.isMobile && showCollapseControl(this.sidebarType)
    },
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
      void this.themeTick
      return getSidebarAsideClasses(this.sidebarControllerState)
    },
    isAdmin() {
      if (!this.user || !this.user.roles) return false
      return this.user.roles.some(role => role.roleId === 1)
    },
    isHorizontal() {
      return this.sidebarType === 'horizontal'
    },
    filteredTopMenus() {
      const menus = { ...this.topMenus }
      if (!this.isAdmin) {
        delete menus.admin
      }
      return menus
    },
    filteredVerticalMenu() {
      // Notifications page — no sidebar
      if (this.$route?.meta?.module === 'notifications') return []

      // When viewing profile-related pages, show a small profile menu
      const profileRoutes = ['profile', 'settings', 'theme-studio']
      if (profileRoutes.includes(this.currentRouteName) || ['profile', 'settings'].includes(this.$route?.meta?.module)) {
        return [
          { name: 'profile', label: 'profile.title', routeName: 'profile' },
          { name: 'settings', label: 'profile.settings', routeName: 'settings' },
          { name: 'themeStudio', label: 'themeStudio.title', routeName: 'theme-studio' },
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
      if (this.selectedTop === 'reports') {
        return this.reports
      }
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
      if (routeModule === 'profile' || routeModule === 'settings' || routeName === 'settings' || routeModule === 'notifications') return ''

      if (routeName === 'reports-landing' || routeName === 'reports-run' || routeName === 'contractors-activity-report' || routeName === 'report-expenses-report' || routeName === 'report-company-transactions') return 'reports'

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
      const walletRoutes = ['treasury', 'company-transactions']
      const expensesRoutes = ['expenses-list', 'expenses-terms', 'expenses-report']
      const paymentRoutes = ['payments']
      const reportsRoutes = ['reports-landing', 'contractors-activity-report', 'admin-reports-list', 'admin-reports-run']
      const adminRoutes = ['admin-statistics', 'changes-by-date', 'approvals-inbox', 'users-list', 'locations', 'admin-units-list', 'admin-reports-list', 'admin-reports-edit', 'admin-reports-run']
      if (suppliesRoutes.includes(routeName)) return 'supplies'
      if (transportRoutes.includes(routeName)) return 'transport'
      if (equipmentRoutes.includes(routeName)) return 'equipmentLog'
      if (paymentRoutes.includes(routeName)) return 'payments'
      if (expensesRoutes.includes(routeName)) return 'expenses'
      if (walletRoutes.includes(routeName)) return 'treasury'
      if (reportsRoutes.includes(routeName)) return 'reports'
      if (adminRoutes.includes(routeName)) return 'admin'
      return 'supplies'
    },
    verticalMenu() { return this.menuMap[this.selectedTop] || [] }
  },
  watch: {
    collapsedSidebar(v) { localStorage.setItem('sidebarCollapsed', JSON.stringify(v)) },
    showSidebarOverlay(visible) {
      lockBodyScroll(this.isMobile && visible)
    },
    sidebarType() {
      this.syncSidebarOpenState()
    },
    isMobile() {
      this.syncSidebarOpenState()
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
        'treasury',
        'expenses',
        'expense',
        'transactions',
        'companytransactions'
      ].includes(norm)) return 'companyWallet'
      if (['extract', 'extracts'].includes(norm)) return 'extracts'
      if (['payment', 'payments'].includes(norm)) return 'payments'
      if (['admin', 'administration'].includes(norm)) return 'admin'
      return norm
    },
    isDynamicReportActive(report) {
      if (!report) return false
      if (this.currentRouteName !== 'admin-reports-run' && this.currentRouteName !== 'reports-run') return false
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
    toggleCollapsed() {
      if (this.isMobile) return
      this.collapsedSidebar = !this.collapsedSidebar
    },
    syncSidebarOpenState() {
      if (this.isMobile) {
        if (!this.sidebarOpen) lockBodyScroll(false)
        return
      }
      lockBodyScroll(false)
      if (startsClosedOnDesktop(this.sidebarType)) {
        this.sidebarOpen = false
      } else {
        this.sidebarOpen = true
      }
    },
    onSidebarEscape(e) {
      if (e.key === 'Escape' && this.sidebarOpen) this.sidebarOpen = false
    },
    resetSidebarHover() { this.sidebarHovered = false },
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
    toggleNotificationMenu() {
      this.notificationMenuOpen = !this.notificationMenuOpen
      if (this.notificationMenuOpen && this.notifItems.length === 0) {
        this.fetchNotifPreview()
      }
    },
    async fetchNotifPreview() {
      this.notifLoading = true
      try {
        const res = await getNotifications({ page: 1, pageSize: 10 })
        const data = res?.data
        if (Array.isArray(data)) {
          this.notifItems = data
        } else if (data?.items) {
          this.notifItems = data.items
        } else if (data?.data) {
          this.notifItems = data.data
        } else {
          this.notifItems = []
        }
      } catch {
        this.notifItems = []
      } finally {
        this.notifLoading = false
      }
    },
    async onNotifClick(item) {
      this.notificationMenuOpen = false
      if (!item.isRead) {
        try { await markNotificationRead(item.id) } catch { /* ignore */ }
        this.notificationStore.unreadCount = Math.max(0, this.notificationStore.unreadCount - 1)
        item.isRead = true
      }
      const route = resolveNotificationRoute(item)
      if (route) this.router.push(route)
    },
    async markAllRead() {
      try {
        await markAllNotificationsRead()
        this.notificationStore.unreadCount = 0
        this.notifItems.forEach(item => { item.isRead = true })
      } catch { /* ignore */ }
    },
    typeColor(type) {
      const map = {
        expense: '#ef4444', payment: '#22c55e', treasury: '#f59e0b',
        approval: '#8b5cf6', supply: '#3b82f6', transport: '#06b6d4',
        equipment: '#f97316', extract: '#14b8a6', rental: '#ec4899',
        'petroleum-supply': '#6366f1', wallet: '#10b981'
      }
      return map[type] || '#6b7280'
    },
    typeAbbr(type) {
      const map = {
        expense: 'م', payment: 'د', treasury: 'خ',
        approval: 'و', supply: 'ت', transport: 'ن',
        equipment: 'ع', extract: 'م', rental: 'إ',
        'petroleum-supply': 'ب', wallet: 'م'
      }
      return map[type] || '?'
    },
    formatNotifDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      const now = new Date()
      const diff = now - d
      if (diff < 60000) return this.$i18n.locale === 'ar' ? 'الآن' : 'now'
      if (diff < 3600000) return Math.floor(diff / 60000) + (this.$i18n.locale === 'ar' ? ' د' : 'm')
      if (diff < 86400000) return Math.floor(diff / 3600000) + (this.$i18n.locale === 'ar' ? ' س' : 'h')
      return d.toLocaleDateString(this.$i18n.locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })
    },
    menuIconComponent(name) {
      void this.iconTick
      return getMenuIcon(name)
    },
    onResize() {
      this.isMobile = window.innerWidth < 768
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
      const name = this.selectedTop === 'reports' ? 'reports-run' : 'admin-reports-run'
      this.router.push({ name, params: { id: reportId } })
      if (this.isMobile) this.sidebarOpen = false
    }
  },
  mounted() {
    document.documentElement.lang = this.$i18n.locale || 'en'
    document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr'
    if (isSidebarCollapsedByDefault(loadTheme().sidebarType) && !this.isMobile) {
      this.collapsedSidebar = true
    }
    this.syncSidebarOpenState()
    window.addEventListener('resize', this.onResize)
    this.onResize()
    document.addEventListener('keydown', this.onSidebarEscape)
    this.loadReports()
    document.addEventListener('click', (e) => {
      const relatives = this.$el.querySelectorAll('.relative')
      const inside = Array.from(relatives).some(el => el.contains(e.target))
      if (!inside) {
        this.userMenuOpen = false
        this.notificationMenuOpen = false
      }
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('keydown', this.onSidebarEscape)
    lockBodyScroll(false)
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

.layout-main--full {
  margin-inline: auto;
  max-width: 100%;
}
@media (min-width: 768px) {
  .layout-main--full {
    padding-inline: 2rem;
    max-width: 960px;
  }
}

.theme-btn-primary {
  background: rgb(var(--theme-primary-600));
  color: #fff;
}
.theme-btn-primary:hover {
  background: rgb(var(--theme-primary-700));
}
.theme-btn-primary svg {
  stroke: currentColor;
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
.layout-sidebar {
  transition:
    width var(--layout-motion-duration) var(--layout-motion-ease),
    transform var(--layout-motion-duration) var(--layout-motion-ease),
    box-shadow var(--layout-motion-duration) var(--layout-motion-ease);
}

/* Modern scrollbar style for dashboard scroll areas */
.app-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--theme-scrollbar-thumb-color) var(--theme-scrollbar-track-bg);
  scrollbar-gutter: stable;
}

.app-scrollbar::-webkit-scrollbar {
  width: var(--theme-scrollbar-size);
  height: var(--theme-scrollbar-size);
}

.app-scrollbar::-webkit-scrollbar-track {
  background: var(--theme-scrollbar-track-bg);
  border-radius: 9999px;
}

.app-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--theme-scrollbar-thumb-start), var(--theme-scrollbar-thumb-end));
  border-radius: 9999px;
  border: 2px solid var(--theme-scrollbar-thumb-border);
  background-clip: padding-box;
}

.app-scrollbar:hover::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--theme-scrollbar-thumb-hover-start), var(--theme-scrollbar-thumb-hover-end));
  border: 2px solid var(--theme-scrollbar-thumb-border);
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

import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, user, loading } from '@/composables/authStore'
import { watch } from 'vue'
import { startRouteLoading, stopRouteLoading } from '@/composables/useRouteLoader'

// Auth Pages
const Login = () => import('@/views/Login.vue')
// const Register = () => import('@/components/auth/Register.vue')

// Dashboard Layout
const Dashboard = () => import("@/views/Dashboard.vue")

// Dashboard Pages - Lazy Loading for better performance
// const NewSupply = () => import('@/components/dashboard/NewSupply.vue')
const SuppliesList = () => import('@/components/dashboard/Supply/SuppliesList.vue')
const SuppliesReport = () => import('@/components/dashboard/Supply/SuppliesReportNew.vue')
const SuppliersList = () => import('@/components/dashboard/Supply/SuppliersList.vue')
const ContractorStatement = () => import('@/components/dashboard/ContractorStatement.vue')
const ItemList = () => import('@/components/dashboard/Items/ItemList.vue')
const CrushersList = () => import('@/components/dashboard/CrushersList.vue')
const TransportCrushersList = () => import('@/components/dashboard/CrushersList.vue')
const VehiclesList = () => import('@/components/dashboard/Vehicles/VehiclesList.vue')
const TransportList = () => import('@/components/dashboard/Transport/TransportList.vue')
const TransportersList = () => import('@/components/dashboard/Transport/TransportersList.vue')
const TransportReport = () => import('@/components/dashboard/Transport/TransportReportNew.vue')
const DriversList = () => import('@/components/dashboard/DriversList.vue')
const EquipmentContractorsList = () => import('@/components/dashboard/Equipment/EquipmentContractorsList.vue')
const ContractorDetail = () => import('@/views/ContractorDetail.vue')
const ExtractContractorsList = () => import('@/components/dashboard/Extracts/ExtractContractorslist.vue')
const EquipmentLogList = () => import('@/components/dashboard/Equipment/EquipmentLogList.vue')
const EquipmentReport = () => import('@/components/dashboard/Equipment/EquipmentLogReport.vue')
const EquipmentList = () => import('@/components/dashboard/Equipment/EquipmentList.vue')
const TreasuryDashboard = () => import('@/components/dashboard/Treasury/TreasuryDashboard.vue')
const TreasuryTransactions = () => import('@/components/dashboard/Treasury/TreasuryTransactions.vue')
const TreasuryReportNew = () => import('@/components/dashboard/Treasury/TreasuryReportNew.vue')
const ExpensesList = () => import('@/components/dashboard/Expenses/ExpensesList.vue')
const ExpensesReport = () => import('@/components/dashboard/Expenses/ExpensesReportNew.vue')
const ContractorsActivityReport = () => import('@/components/dashboard/ContractorsActivityReport.vue')
const ChangesByDate = () => import('@/components/dashboard/ChangesByDate.vue')
const ApprovalsInbox = () => import('@/components/dashboard/ApprovalsInbox.vue')
const UsersList = () => import('@/components/dashboard/UsersList.vue')
const Locations = () => import('@/components/dashboard/Locations.vue')
const Profile = () => import('@/views/Profile.vue')
const Settings = () => import('@/views/Settings.vue')
const ThemeStudio = () => import('@/views/ThemeStudio.vue')
const ExtractsPage = () => import('@/views/extracts/ExtractsPage.vue')
const NotificationCenter = () => import('@/components/dashboard/NotificationCenter.vue')
const CreateExtract = () => import('@/views/extracts/CreateExtract.vue')
const ExtractDetail = () => import('@/views/extracts/ExtractDetail.vue')
// const ExtractItemsManager = () => import('@/components/dashboard/Extracts/ExtractItemsManager.vue')

const routes = [
  // ==================== Auth Routes ====================
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false, title: 'auth.login.title' }
  },

  // ==================== Dashboard Layout ====================
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, title: 'Dashboard' },
    children: [
      // ==================== Supplies Module ====================
      // {
      //   path: 'supplies/new',
      //   name: 'new-supply',
      //   component: NewSupply,
      //   meta: { title: 'dashboard.newSupply' }
      // },
      {
        path: 'supplies/list',
        name: 'supplies-list',
        component: SuppliesList,
        meta: { title: 'dashboard.suppliesList' }
      },
      {
        path: 'supplies/report',
        name: 'supplies-report',
        component: SuppliesReport,
        meta: { title: 'dashboard.suppliesReport' }
      },
      {
        path: 'supplies/suppliers',
        name: 'suppliers-list',
        component: SuppliersList,
        meta: { title: 'supply.suppliersList' }
      },
      {
        path: 'supplies/contractor-supply-statement/:id?',
        name: 'contractor-supply-statement',
        component: ContractorStatement,
        meta: { title: 'dashboard.contractorStatement' },
        props: { mode: 'supply'}
      },
      {
        path: 'contractors/:id',
        name: 'contractor-detail',
        component: ContractorDetail,
        meta: { title: 'contractors.title' }
      },
      
      {
        path: 'supplies/items',
        name: 'supplies-items-list',
        component: ItemList,
        meta: { title: 'dashboard.itemsList' },
        props: { mode: 'supply' }
      },
      {
        path: 'supplies/crushers',
        name: 'crushers-list',
        component: CrushersList,
        meta: { title: 'dashboard.crushersList' }
      },
      {
        path: 'supplies/vehicles',
        name: 'vehicles-list',
        component: VehiclesList,
        meta: { title: 'dashboard.vehiclesList' },
        props: { mode: 'supply' }
      },

      // ==================== Transport Module ====================
      {
        path: 'transport/list',
        name: 'transport-list',
        component: TransportList,
        meta: { title: 'dashboard.transportList' }
      },
      {
        path: 'transport/contractor',
        name: 'transport-contractors-list',
        component: TransportersList,
        meta: { title: 'dashboard.transportContractorsList' },
        // props: { viewMode: 'contractors' }
      },
      {
        path: 'transport/crushers',
        name: 'transport-crushers-list',
        component: TransportCrushersList,
        meta: { title: 'dashboard.crushersList' }
      },
      {
        path: 'transport/items',
        name: 'transport-items-list',
        component: ItemList,
        meta: { title: 'dashboard.itemsList' },
        props: { mode: 'transport' }
      },
      {
        path: 'transport/vehicles',
        name: 'transport-vehicles',
        component: VehiclesList,
        meta: { title: 'dashboard.vehiclesList' },
        props: { mode: 'transport' }
      },
      {
        path: 'transport/contractor-transport-statement/:id?',
        name: 'contractor-transport-statement',
        component: ContractorStatement,
        meta: { title: 'dashboard.contractorStatement' },
        props: { mode: 'transport'}
      },
      {
        path: 'transport/report',
        name: 'transport-report',
        component: TransportReport,
        meta: { title: 'transport.reportMenu' }
      },
      

      // ==================== Equipment Module ====================
      {
        path: 'equipment/logs/list',
        name: 'equipment-log-list',
        component: EquipmentLogList,
        meta: { title: 'dashboard.equipmentLog' }
      },
      {
        path: 'equipment/report',
        name: 'equipment-report',
        component: EquipmentReport,
        meta: { title: 'equipment.reportMenu' }
      },
      {
        path: 'equipment/list',
        name: 'equipment-list',
        component: EquipmentList,
        meta: { title: 'equipment.title' }
      },
      {
        path: 'equipment/drivers',
        name: 'equipment-drivers-list',
        component: DriversList,
        meta: { title: 'dashboard.driversList' },
        // props: route => ({ mode: route.params.mode || route.query.mode || (route.meta && route.meta.mode) || '' })
      },
      {
        path: 'equipment/contractors',
        name: 'equipment-contractors-list',
        component: EquipmentContractorsList,
        meta: { title: 'dashboard.contractorsList' },
        // props: route => ({ mode: route.params.mode || route.query.mode || (route.meta && route.meta.mode) || '' })
      },
      {
        path: 'equipment/contractor-statement/:id?',
        name: 'equipment-contractor-statement',
        component: ContractorStatement,
        meta: { title: 'dashboard.contractorStatement' },
        props: { mode: 'rentals' }
      },

      // ==================== Treasury Module ====================
      {
        path: 'treasury',
        name: 'treasury',
        component: TreasuryDashboard,
        meta: { title: 'dashboard.treasury' }
      },
      {
        path: 'company-transactions',
        name: 'company-transactions',
        component: TreasuryTransactions,
        meta: { title: 'transactions' }
      },
      {
        path: 'treasury-report',
        name: 'treasury-report',
        component: TreasuryReportNew,
        meta: { title: 'treasury.report' }
      },
      {
        path: 'expenses',
        name: 'expenses-list',
        component: ExpensesList,
        meta: { title: 'dashboard.expenses' }
      },
      {
        path: 'expenses/report',
        name: 'expenses-report',
        component: ExpensesReport,
        meta: { title: 'expenses.report' }
      },
      {
        path: 'expenses/terms',
        name: 'expenses-terms',
        component: () => import('@/components/dashboard/Expenses/TermsManagement.vue'),
        meta: { title: 'expenses.termsManagement' }
      },

      // ==================== Admin Module (Role Protected) ====================
      {
        path: 'admin/changes',
        name: 'changes-by-date',
        component: ChangesByDate,
        meta: { title: 'changes.title', roles: ['admin'] }
      },
      {
        path: 'admin/approvals',
        name: 'approvals-inbox',
        component: ApprovalsInbox,
        meta: { title: 'approvals.title', roles: ['admin'] }
      },
      {
        path: 'admin/users',
        name: 'users-list',
        component: UsersList,
        meta: { title: 'users.title', roles: ['admin'] }
      },
      {
        path: 'admin/locations',
        name: 'locations',
        component: Locations,
        meta: { title: 'locations.title', roles: ['admin'] }
      },
      {
        path: 'admin/units',
        name: 'admin-units-list',
        component: () => import('@/components/dashboard/UnitsList.vue'),
        meta: { title: 'units.title', roles: ['admin'] }
      },
      {
        path: 'admin/statistics',
        name: 'admin-statistics',
        component: () => import('@/components/dashboard/Administration/AdminStatistics.vue'),
        meta: { title: 'adminStats.title', roles: ['admin'] }
      },
      {
        path: 'admin/database-backup',
        name: 'admin-database-backup',
        component: () => import('@/components/dashboard/Administration/DatabaseBackup.vue'),
        meta: { title: 'admin.databaseBackup', roles: ['admin'] }
      },
      {
        path: 'admin/system-logs',
        name: 'admin-system-logs',
        component: () => import('@/components/dashboard/Administration/SystemLogs.vue'),
        meta: { title: 'systemLogs.title', roles: ['admin'] }
      },
      {
        path: 'admin/reports',
        name: 'admin-reports-list',
        component: () => import('@/components/admin/ReportsList.vue'),
        meta: { title: 'Reports', roles: ['admin'] }
      },
      {
        path: 'admin/reports/from-table/:id?',
        name: 'admin-reports-from-table',
        component: () => import('@/components/admin/DynamicReportFromTable.vue'),
        meta: { title: 'Create Report From Table', roles: ['admin'] },
        props: route => ({ reportId: route.params.id })
      },
      {
        path: 'admin/reports/:id/edit',
        name: 'admin-reports-edit',
        component: () => import('@/components/admin/ReportEditor.vue'),
        meta: { title: 'Edit Report', roles: ['admin'] },
        props: true
      },
      {
        path: 'admin/reports/run/:id',
        name: 'admin-reports-run',
        component: () => import('@/components/admin/ReportPage.vue'),
        meta: { title: 'Run Report' },
        props: route => ({ reportId: route.params.id })
      },
      {
        path: 'reports',
        name: 'reports-landing',
        component: () => import('@/components/dashboard/ReportsLanding.vue'),
        meta: { title: 'Reports' }
      },
      {
        path: 'reports/contractors-activity',
        name: 'contractors-activity-report',
        component: ContractorsActivityReport,
        meta: { title: 'dashboard.contractorsActivityReport' }
      },
      {
        path: 'reports/company-transactions',
        name: 'report-company-transactions',
        component: TreasuryTransactions,
        meta: { title: 'transactions' }
      },
      {
        path: 'reports/expenses',
        name: 'report-expenses-report',
        component: ExpensesReport,
        meta: { title: 'expenses.report' }
      },
      {
        path: 'reports/run/:id',
        name: 'reports-run',
        component: () => import('@/components/admin/ReportPage.vue'),
        meta: { title: 'Run Report' },
        props: route => ({ reportId: route.params.id })
      },
      {
        path: 'profile',
        name: 'profile',
        component: Profile,
        meta: { title: 'profile.title', module: 'profile' }
      },
      {
        path: '/dashboard/settings',
        name: 'settings',
        component: Settings,
        meta: { title: 'settings', module: 'settings' }
      },
      {
        path: 'theme-studio',
        name: 'theme-studio',
        component: ThemeStudio,
        meta: { title: 'themeStudio.title', module: 'settings' }
      },

      // ==================== Extracts Module ====================
      {
        path: 'extracts',
        name: 'extracts-list',
        component: ExtractsPage,
        meta: { title: 'extracts.title' }
      },
      {
        path: 'extracts/create',
        name: 'create-extract',
        component: CreateExtract,
        meta: { title: 'extracts.create.title' }
      },
      {
        path: 'extracts/contractors',
        name: 'extracts-contractors-list',
        component: ExtractContractorsList,
        meta: { title: 'dashboard.contractorsList' },
        props: { mode: 'extract' }
      },
      {
        path: 'extracts/contractor-statement/:id?',
        name: 'contractor-extract-statement',
        component: ContractorStatement,
        meta: { title: 'dashboard.contractorStatement' },
        props: { mode: 'extract' }
      },
      {
        path: 'extracts/items',
        name: 'extracts-items',
        component: ItemList,
        meta: { title: 'dashboard.itemsList' },
        props: { mode: 'extract' }
      },
      {
        path: 'extracts/:id',
        name: 'extracts-detail',
        component: ExtractDetail,
        meta: { title: 'extracts.detail' },
        props: true
      },
      {
        path: 'extracts/:id/edit',
        name: 'edit-extract',
        component: CreateExtract,
        meta: { title: 'extracts.edit.title' },
        props: true
      },
      {
        path: 'payments',
        name: 'payments',
        component: () => import('@/components/dashboard/payment/PaymentsPage.vue'),
        meta: { title: 'dashboard.payments' }
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: NotificationCenter,
        meta: { title: 'الإشعارات', module: 'notifications' }
      },

      // ==================== Default Redirect ====================
      { path: '', redirect: 'supplies/new' }
    ]
  },

  // ==================== Root Redirect ====================
  {
    path: '/',
    redirect: () => {
      return isAuthenticated.value ? '/dashboard/supplies/new' : '/login'
    }
  },

  // ==================== 404 Catch ====================
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ==================== Navigation Guards ====================

// Before each navigation
router.beforeEach(async (to, from, next) => {
  if (to.fullPath !== from.fullPath) {
    startRouteLoading()
  }

  // Wait for auth to initialize (avoid race conditions)
  if (loading.value) {
    await new Promise(resolve => {
      const stop = watch(loading, (val) => {
        if (!val) {
          stop()
          resolve()
        }
      })
      
    })
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  // Check if route requires authentication
  if (requiresAuth && !isAuthenticated.value) {
    // Save the intended destination for redirect after login
    localStorage.setItem('redirectPath', to.fullPath)
    next({ name: 'login' })
    return
  }

  // If authenticated and trying to access auth pages (login/register), redirect to dashboard
  if (!requiresAuth && isAuthenticated.value && ['login', 'register'].includes(to.name)) {
    next({ name: 'supplies-list' })
    return
  }

  // Check role-based access for admin routes
  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRoles = user.value?.roles || []
    const hasRequiredRole = userRoles.some(role => role.roleId === 1)

    // console.log(to.meta.roles);
    // console.log(user.value.roles.some(role => role.roleId === 1));

    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to default page
      console.warn(`Access denied: User roles [${userRoles}] don't include [${to.meta.roles}]`)
      next({ name: 'supplies-list' })
      return
    }
  }

  // Update document direction based on locale
  const locale = localStorage.getItem('app-locale') || 'en'
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'

  next()
})

// After each navigation
router.afterEach((to) => {
  stopRouteLoading()

  // Update page title if available (can use i18n here)
  if (to.meta.title) {
    const appName = 'Keshta Company'
    document.title = `${appName} - ${to.meta.title}`
  } else {
    document.title = 'Keshta Company'
  }
})

router.onError(() => {
  stopRouteLoading()
})

export default router

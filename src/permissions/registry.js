// Frontend permission registry — mirrors backend src/permissions/registry.ts
// Keys must stay identical on both sides (module.page).

const t = (en, ar) => ({ en, ar })

export const PERMISSION_REGISTRY = {
  supplies: {
    label: t('Supplies', 'التوريدات'),
    pages: {
      'supplies.list': { label: t('Supplies List', 'قائمة التوريدات'), route: 'supplies-list' },
      'supplies.report': { label: t('Supplies Report', 'تقرير التوريدات'), route: 'supplies-report' },
      'supplies.suppliers': { label: t('Suppliers List', 'قائمة الموردين'), route: 'suppliers-list' },
      'supplies.statement': { label: t('Contractor Supply Statement', 'كشف حساب مقاول التوريد'), route: 'contractor-supply-statement' },
      'supplies.items': { label: t('Items List', 'قائمة الأصناف'), route: 'supplies-items-list' },
      'supplies.crushers': { label: t('Crushers List', 'قائمة الكسارات'), route: 'crushers-list' },
      'supplies.vehicles': { label: t('Vehicles List', 'قائمة المركبات'), route: 'vehicles-list' },
      'supplies.contractor-detail': { label: t('Contractor Detail', 'تفاصيل المقاول'), route: 'contractor-detail' },
    },
  },
  transport: {
    label: t('Transport', 'النقل'),
    pages: {
      'transport.list': { label: t('Transport List', 'قائمة النقل'), route: 'transport-list' },
      'transport.contractors': { label: t('Transport Contractors List', 'قائمة شركات النقل'), route: 'transport-contractors-list' },
      'transport.crushers': { label: t('Crushers List', 'قائمة الكسارات'), route: 'transport-crushers-list' },
      'transport.items': { label: t('Items List', 'قائمة الأصناف'), route: 'transport-items-list' },
      'transport.vehicles': { label: t('Vehicles List', 'قائمة المركبات'), route: 'transport-vehicles' },
      'transport.statement': { label: t('Contractor Transport Statement', 'كشف حساب مقاول النقل'), route: 'contractor-transport-statement' },
      'transport.report': { label: t('Transport Report', 'تقرير النقل'), route: 'transport-report' },
    },
  },
  expenses: {
    label: t('Expenses', 'المصروفات'),
    pages: {
      'expenses.list': { label: t('Expenses List', 'قائمة المصروفات'), route: 'expenses-list' },
      'expenses.terms': { label: t('Expense Terms Management', 'إدارة بنود المصروفات'), route: 'expenses-terms' },
      'expenses.report': { label: t('Expenses Report', 'تقرير المصروفات'), route: 'expenses-report' },
    },
  },
  payments: {
    label: t('Payments', 'المدفوعات'),
    pages: {
      'payments.list': { label: t('Payments', 'المدفوعات'), route: 'payments' },
    },
  },
  treasury: {
    label: t('Treasury', 'الخزينة'),
    pages: {
      'treasury.dashboard': { label: t('Treasury Dashboard', 'لوحة الخزينة'), route: 'treasury' },
      'treasury.transactions': { label: t('Company Transactions', 'معاملات الشركة'), route: 'report-company-transactions' },
      'treasury.report': { label: t('Treasury Report', 'تقرير الخزينة'), route: 'treasury-report' },
    },
  },
  equipment: {
    label: t('Equipment', 'المعدات'),
    pages: {
      'equipment.logs': { label: t('Equipment Log', 'سجل المعدات'), route: 'equipment-log-list' },
      'equipment.list': { label: t('Equipment List', 'قائمة المعدات'), route: 'equipment-list' },
      'equipment.drivers': { label: t('Drivers List', 'قائمة السائقين'), route: 'equipment-drivers-list' },
      'equipment.contractors': { label: t('Equipment Contractors List', 'قائمة مقاولي المعدات'), route: 'equipment-contractors-list' },
      'equipment.rentals': { label: t('Contractor Rentals', 'إيجارات المقاولين'), route: 'equipment-contractor-statement' },
      'equipment.report': { label: t('Equipment Report', 'تقرير المعدات'), route: 'equipment-report' },
    },
  },
  extracts: {
    label: t('Extracts', 'الإستخراجات'),
    pages: {
      'extracts.list': { label: t('Extracts List', 'قائمة الإستخراجات'), route: 'extracts-list' },
      'extracts.create': { label: t('Create Extract', 'إنشاء استخراج'), route: 'create-extract' },
      'extracts.detail': { label: t('Extract Detail', 'تفاصيل الاستخراج'), route: 'extracts-detail' },
      'extracts.edit': { label: t('Edit Extract', 'تعديل استخراج'), route: 'edit-extract' },
      'extracts.contractors': { label: t('Extracts Contractors List', 'قائمة مقاولي الإستخراجات'), route: 'extracts-contractors-list' },
      'extracts.items': { label: t('Extract Items', 'أصناف الاستخراج'), route: 'extracts-items' },
      'extracts.statement': { label: t('Contractor Extract Statement', 'كشف حساب مقاول الإستخراج'), route: 'contractor-extract-statement' },
    },
  },
  reports: {
    label: t('Reports', 'التقارير'),
    pages: {
      'reports.landing': { label: t('Reports Landing', 'صفحة التقارير'), route: 'reports-landing' },
      'reports.contractors-activity': { label: t('Contractors Activity Report', 'تقرير نشاط المقاولين'), route: 'contractors-activity-report' },
      'reports.company-transactions': { label: t('Company Transactions Report', 'تقرير معاملات الشركة'), route: 'report-company-transactions' },
      'reports.expenses': { label: t('Expenses Report', 'تقرير المصروفات'), route: 'report-expenses-report' },
      'reports.run': { label: t('Run Report', 'تشغيل تقرير'), route: 'reports-run' },
    },
  },
  admin: {
    label: t('Administration', 'الإدارة'),
    pages: {
      'admin.statistics': { label: t('Admin Statistics', 'الإحصائيات'), route: 'admin-statistics' },
      'admin.changes': { label: t('Changes by Date', 'التغييرات حسب التاريخ'), route: 'changes-by-date' },
      'admin.approvals': { label: t('Approvals Inbox', 'صندوق الموافقات'), route: 'approvals-inbox' },
      'admin.users': { label: t('Users List', 'قائمة المستخدمين'), route: 'users-list' },
      'admin.locations': { label: t('Locations', 'المواقع'), route: 'locations' },
      'admin.units': { label: t('Units List', 'قائمة الوحدات'), route: 'admin-units-list' },
      'admin.backup': { label: t('Database Backup', 'نسخة احتياطية للقاعدة'), route: 'admin-database-backup' },
      'admin.logs': { label: t('System Logs', 'سجلات النظام'), route: 'admin-system-logs' },
      'admin.active-users': { label: t('Active Users', 'المستخدمون النشطون'), route: 'admin-active-users' },
      'admin.reports': { label: t('Reports List', 'قائمة التقارير'), route: 'admin-reports-list' },
    },
  },
}

export function allPermissionKeys() {
  const keys = []
  for (const module of Object.values(PERMISSION_REGISTRY)) {
    for (const key of Object.keys(module.pages)) keys.push(key)
  }
  return keys
}

export function pageDefForKey(key) {
  for (const module of Object.values(PERMISSION_REGISTRY)) {
    if (key in module.pages) return module.pages[key]
  }
  return null
}

export function moduleOfPageKey(pageKey) {
  for (const [moduleKey, module] of Object.entries(PERMISSION_REGISTRY)) {
    if (pageKey in module.pages) return moduleKey
  }
  return null
}

// route name -> page key (for router/sidebar guards)
export const routeToKey = {}
for (const module of Object.values(PERMISSION_REGISTRY)) {
  for (const [key, def] of Object.entries(module.pages)) {
    if (def.route) routeToKey[def.route] = key
  }
}

export function permissionKeyForRoute(routeName) {
  return routeToKey[routeName] || null
}

export default PERMISSION_REGISTRY

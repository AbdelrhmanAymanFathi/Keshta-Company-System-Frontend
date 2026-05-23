/** Semantic icon keys — packs map these to library-specific components */
export const SEMANTIC_ICONS = [
  'add',
  'edit',
  'delete',
  'close',
  'duplicate',
  'check',
  'arrowLeft',
  'arrowRight',
  'swap',
  'document',
  'wallet',
  'user',
  'users',
  'userGroup',
  'chart',
  'archive',
  'money',
  'building',
  'clipboard',
  'clock',
  'mapPin',
  'map',
  'identification',
  'wrench',
  'vehicle',
  'grid',
  'cube',
  'warning',
  'play',
  'info',
  'envelope',
  'shield',
  'key',
  'mobile',
  'settings',
  'logout',
  'reports',
  'dashboard',
  'contractor',
  'equipment',
  'supplies',
  'menu',
  'chevronLeft',
  'chevronRight',
  'default'
]

/** Sidebar / menu route name → semantic icon key */
export const MENU_ICON_ALIASES = {
  suppliesList: 'clipboard',
  transportList: 'clipboard',
  extractsList: 'clipboard',
  equipmentLogList: 'clipboard',
  suppliersList: 'contractor',
  transportContractorsList: 'contractor',
  contractorsList: 'contractor',
  crushersList: 'building',
  suppliesItemList: 'grid',
  transportItemsList: 'grid',
  extractItems: 'archive',
  vehiclesList: 'vehicle',
  contractorStatement: 'document',
  contractorSupplyStatement: 'document',
  contractorTransportStatement: 'document',
  contractorRentals: 'document',
  driversList: 'identification',
  equipmentList: 'equipment',
  companyWallet: 'wallet',
  companyTransactions: 'wallet',
  expensesList: 'money',
  expensesReport: 'reports',
  changesByDate: 'clock',
  reportsList: 'reports',
  locations: 'mapPin',
  users: 'userGroup',
  records: 'clipboard',
  contractors: 'contractor',
  crushers: 'building',
  items: 'grid',
  vehicles: 'vehicle',
  statement: 'document',
  drivers: 'identification',
  equipment: 'equipment',
  extract: 'archive',
  wallet: 'wallet',
  money: 'money',
  reports: 'reports',
  changes: 'clock',
  usersList: 'userGroup',
  profile: 'user',
  settings: 'settings',
  themeStudio: 'grid',
  signout: 'logout'
}

export function resolveMenuIconKey(menuName) {
  if (!menuName) return 'default'
  if (MENU_ICON_ALIASES[menuName]) return MENU_ICON_ALIASES[menuName]
  const lower = menuName.toLowerCase()
  if (lower.includes('vehicle') || lower.includes('truck')) return 'vehicle'
  if (lower.includes('contractor') || lower.includes('supplier') || lower.includes('transport'))
    return 'contractor'
  if (lower.includes('report')) return 'reports'
  if (lower.includes('wallet') || lower.includes('treasury')) return 'wallet'
  if (lower.includes('equipment')) return 'equipment'
  if (lower.includes('extract')) return 'archive'
  if (lower.includes('supply') || lower.includes('supplies')) return 'supplies'
  if (lower.includes('driver')) return 'identification'
  if (lower.includes('location')) return 'mapPin'
  if (lower.includes('user')) return 'userGroup'
  if (lower.includes('item')) return 'grid'
  if (lower.includes('crusher')) return 'building'
  if (lower.includes('expense') || lower.includes('money')) return 'money'
  if (lower.includes('list')) return 'clipboard'
  return 'default'
}

const routeMap = {
  supply: 'supplies-list',
  transport: 'transport-list',
  equipment: 'equipment-log-list',
  expense: 'expenses-list',
  payment: 'payments',
  treasury: 'treasury',
  extract: 'extracts-list',
  approval: 'approvals-inbox',
  rental: 'equipment-contractors-list',
  'petroleum-supply': 'supplies-list',
  wallet: 'treasury',
}

// Types whose list page knows how to open a single record from ?focus=<id>
const focusableTypes = new Set(['supply', 'transport', 'equipment', 'expense', 'payment', 'approval'])

export function resolveNotificationRoute(item) {
  const type = item.type || item.entityType
  const id = item.entityId

  // New notifications carry a ready-made frontend route
  if (typeof item.route === 'string' && item.route.startsWith('/dashboard')) {
    return item.route
  }

  if (type === 'extract' && id && !isDeleteNotification(item)) {
    return { name: 'extracts-detail', params: { id: String(id) } }
  }

  const name = routeMap[type]
  if (!name) return null
  if (id && focusableTypes.has(type) && !isDeleteNotification(item)) {
    return { name, query: { focus: String(id) } }
  }
  return { name }
}

function isDeleteNotification(item) {
  return typeof item.title === 'string' && item.title.includes('حذف')
}

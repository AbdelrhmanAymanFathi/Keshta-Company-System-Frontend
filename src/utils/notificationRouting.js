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

export function resolveNotificationRoute(item) {
  if (item.route && item.route !== '#' && item.route !== null) {
    return item.route.startsWith('/') ? item.route : { path: item.route }
  }
  const name = routeMap[item.type || item.entityType]
  if (name) return { name }
  return null
}

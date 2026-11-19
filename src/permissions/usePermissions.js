import { computed } from 'vue'
import { user } from '@/composables/authStore'
import { PERMISSION_REGISTRY, allPermissionKeys, moduleOfPageKey } from './registry'

const ROLE_ADMIN_ID = 1

export function usePermissions() {
  const isAdmin = computed(() =>
    Array.isArray(user.value?.roles) && user.value.roles.some((r) => Number(r.roleId) === ROLE_ADMIN_ID),
  )
  const permissions = computed(() => Array.isArray(user.value?.permissions) ? user.value.permissions : [])
  const permitted = computed(() => new Set(permissions.value))

  const can = (key) => {
    if (!key) return true
    if (isAdmin.value) return true
    return permitted.value.has(key)
  }

  const permissionsForModule = (moduleKey) => {
    const module = PERMISSION_REGISTRY[moduleKey]
    if (!module) return []
    return Object.keys(module.pages).filter((k) => can(k))
  }

  const hasAnyPage = (moduleKey) => permissionsForModule(moduleKey).length > 0

  const firstAllowedPage = () => {
    for (const key of allPermissionKeys()) {
      if (can(key)) {
        const def = pageDef(key)
        if (def && def.route) return { key, ...def }
      }
    }
    return null
  }

  return { can, permissions, isAdmin, permissionsForModule, hasAnyPage, firstAllowedPage, allKeys: allPermissionKeys }
}

export function pageDef(key) {
  for (const module of Object.values(PERMISSION_REGISTRY)) {
    if (key in module.pages) return module.pages[key]
  }
  return null
}

export default { usePermissions, pageDef, allPermissionKeys, moduleOfPageKey }

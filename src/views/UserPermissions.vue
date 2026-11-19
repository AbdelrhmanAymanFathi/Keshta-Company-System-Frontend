<template>
  <div :dir="dir" class="permissions-admin app-page-header-space p-4 sm:p-0.5 lg:p-1 min-h-[calc(100vh-var(--header-height,0))]">
    <!-- Page header -->
    <div class="app-page-header rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold theme-text-primary">{{ $t('notifications.users.permissions') }}</h2>
        <p class="text-sm theme-text-muted">{{ $t('notifications.permissions.inheritNote') }}</p>
      </div>
    </div>

    <!-- Sticky action bar -->
    <div class="sticky top-0 z-20 mt-4 border-b border-border bg-background/80 backdrop-blur-sm p-3 sm:p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <span
            v-if="dirty"
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-100 bg-amber-50 text-amber-800 text-xs font-medium"
          >
            <span class="relative flex h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            {{ $t('notifications.permissions.unsaved') }}
          </span>
          <Button
            variant="outline"
            size="xs"
            :disabled="saving || !selectedUser"
            @click="selectAll"
          >{{ $t('notifications.permissions.selectAll') }}</Button>
          <Button
            variant="outline"
            size="xs"
            :disabled="saving || !selectedUser"
            @click="clearAll"
          >{{ $t('notifications.permissions.clearAll') }}</Button>
          <Button
            variant="outline"
            size="xs"
            :disabled="saving || !dirty"
            @click="handleDiscard"
          >{{ $t('notifications.permissions.discard') }}</Button>
          <Button
            :disabled="saving || !selectedUser || !dirty"
            @click="save"
            class="px-4"
          >
            <span v-if="saving">{{ $t('notifications.permissions.saving') }}</span>
            <span v-else>{{ $t('notifications.permissions.save') }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Body: user selector panel + permissions panel -->
    <div class="flex flex-col lg:flex-row rtl:flex-row-reverse gap-4">
      <!-- User selector panel -->
      <div class="lg:w-[360px] flex-shrink-0 min-w-0">
        <Card>
          <CardHeader>
            <CardTitle class="text-sm font-semibold theme-text-primary flex items-center gap-2">
              <div class="h-5 w-5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-medium">
                U
              </div>
              {{ $t('notifications.permissions.selectUser') }}
            </CardTitle>
            <CardDescription class="text-xs theme-text-muted">
              {{ $t('notifications.permissions.noUserSelectedDesc') }}
            </CardDescription>
          </CardHeader>
          <CardContent class="p-0">
            <div class="p-3">
              <div class="relative mb-3">
                <MagnifyingGlassIcon class="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:right-2 rtl:left-auto" />
                <Input
                  v-model="searchUsers"
                  :placeholder="$t('notifications.permissions.searchUsers')"
                  class="pl-8 rtl:pl-2 rtl:pr-8"
                />
              </div>

              <div v-if="loadingUsers" class="space-y-2">
                <div class="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                <div class="h-4 w-3/4 bg-muted rounded animate-pulse mb-1"></div>
                <div class="h-3 w-1/2 bg-muted rounded animate-pulse"></div>
              </div>

              <div v-else-if="userResults.length === 0" class="text-center py-6">
                <p class="text-xs theme-text-muted">{{ pickerError || $t('notifications.permissions.noUsers') }}</p>
              </div>

              <div v-else class="space-y-1">
                <button
                  v-for="u in userResults"
                  :key="u.id"
                  type="button"
                  @click="onUserSelect(u)"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                  :class="{
                    'bg-muted border-primary': selectedUser?.id === u.id,
                    'border-border': selectedUser?.id !== u.id
                  }"
                >
                  <div class="h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                    {{ initials(u.name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm theme-text-primary truncate">{{ u.name }}</div>
                    <div class="text-xs theme-text-muted truncate">{{ u.email || '-' }}</div>
                  </div>
                  <Badge
                    :variant="isAdminUser(u) ? 'destructive' : 'secondary'"
                    class="mt-0.5 shrink-0"
                  >{{ isAdminUser(u) ? $t('notifications.permissions.roleAdmin') : $t('notifications.permissions.roleUser') }}</Badge>
                  <span
                    v-if="selectedUser?.id === u.id"
                    class="h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center shrink-0"
                  >
                    <CheckIcon class="h-2.5 w-2.5 text-primary-foreground" />
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Permissions panel -->
      <div class="flex-1 min-w-0 flex flex-col">
        <!-- Empty state -->
        <div v-if="!selectedUser" class="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div class="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground shrink-0">
            <UserGroupIcon class="h-8 w-8" />
          </div>
          <h3 class="text-base font-semibold theme-text-primary">{{ $t('notifications.permissions.noUserSelected') }}</h3>
          <p class="text-sm theme-text-muted max-w-xs mt-1">{{ $t('notifications.permissions.noUserSelectedDesc') }}</p>
        </div>

        <!-- Permissions content -->
        <div v-else class="flex-1 overflow-y-auto min-h-[300px]">
          <!-- Admin locked state -->
          <div v-if="isAdminUser(selectedUser)" class="rounded-xl border border-amber-200/60 bg-amber-50 p-4 mb-4">
            <div class="flex items-start gap-3">
              <div class="h-8 w-8 rounded bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <ShieldCheckIcon class="h-4 w-4" />
              </div>
              <div>
                <div class="text-sm font-semibold text-amber-900">{{ $t('notifications.permissions.adminLocked') }}</div>
                <div class="text-xs text-amber-700 mt-0.5">{{ $t('notifications.permissions.adminLockedDesc') }}</div>
              </div>
            </div>
          </div>

          <div v-else class="space-y-3">
            <!-- Summary -->
            <div class="flex items-center justify-between px-2">
              <div class="text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('labels.summary') }}</div>
              <div class="text-sm theme-text-primary">
                {{ $t('notifications.permissions.summary', { name: selectedUser.name, pages: totalChecked, modules: totalModules }) }}
              </div>
            </div>

            <!-- Search + presets -->
            <div class="relative mb-2">
              <MagnifyingGlassIcon class="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:right-2 rtl:left-auto" />
              <Input
                v-model="searchModules"
                :placeholder="$t('notifications.permissions.searchModules')"
                class="pl-8 rtl:pl-2 rtl:pr-8"
              />
            </div>

            <div class="flex flex-wrap gap-1 mb-1">
              <button
                v-for="p in presets"
                :key="p.key"
                type="button"
                @click="applyPreset(p)"
                :disabled="saving || !selectedUser || isAdminUser(selectedUser)"
                class="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-theme-primary hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >{{ $t(p.label) }}</button>
              <button
                v-if="dirty"
                type="button"
                @click="handleDiscard"
                :disabled="saving"
                class="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >{{ $t('notifications.permissions.discard') }}</button>
            </div>

            <div class="flex items-center justify-between mb-2">
              <Button variant="outline" size="xs" @click="expandAll">{{ $t('notifications.permissions.expandAll') }}</Button>
              <Button variant="outline" size="xs" @click="collapseAll">{{ $t('notifications.permissions.collapseAll') }}</Button>
            </div>

            <!-- Modules -->
            <div class="space-y-2">
              <div
                v-for="module in visibleModules"
                :key="module.key"
                class="module-card rounded-xl border border-border bg-card"
              >
                <div
                  class="module-header flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                  @click="toggleExpansion(module.key)"
                  role="button"
                  :aria-expanded="isExpanded(module.key)"
                  :aria-controls="`module-${module.key}`"
                  :tabindex="0"
                  @keydown.enter.prevent="toggleExpansion(module.key)"
                  @keydown.space.prevent="toggleExpansion(module.key)"
                >
                  <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <component :is="moduleIcon(module.key)" class="h-4 w-4 theme-text" />
                    <span v-if="!moduleIcon(module.key)" class="text-[10px] font-medium text-theme-muted">{{ module.key.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-semibold text-sm theme-text-primary text-start truncate">{{ moduleLabel(module) }}</span>
                      <Badge variant="outline" class="text-xs shrink-0">{{ modulePages(module.key) }}</Badge>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    role="checkbox"
                    :aria-checked="moduleTriState(module.key)"
                    :aria-label="$t('notifications.permissions.module') + ' ' + moduleLabel(module)"
                    class="peer sr-only focus-visible:outline-none"
                    :checked="moduleFullyChecked(module.key)"
                    @change="toggleModule(module.key)"
                    @click.stop
                  />
                  <div class="w-5 h-5 rounded border border-input theme-text-primary flex items-center justify-center shrink-0" :class="{
                    'bg-primary': moduleFullyChecked(module.key),
                    'border-primary': moduleIndeterminate(module.key) && !moduleFullyChecked(module.key)
                  }">
                    <span v-if="moduleFullyChecked(module.key)" class="text-[10px] text-primary-foreground">✓</span>
                    <span v-else-if="moduleIndeterminate(module.key)" class="h-[1px] w-[10px] bg-primary"></span>
                  </div>
                  <ArrowRightIcon
                    class="h-4 w-4 shrink-0 theme-text-muted transition-transform duration-200"
                    :class="{ 'rotate-90': isExpanded(module.key), 'rotate-180': dir === 'rtl' && !isExpanded(module.key) }"
                  />
                </div>

                <div v-if="isExpanded(module.key)" :id="`module-${module.key}`" class="px-3 pb-2">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    <div
                      v-for="page in visiblePages(module.key)"
                      :key="page.key"
                      class="page-row flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors"
                      role="checkbox"
                      :aria-checked="isSelected(page.key)"
                      :aria-label="pageLabel(page)"
                      tabindex="0"
                      @click="togglePage(page.key)"
                      @keydown.space.prevent="togglePage(page.key)"
                      @keydown.enter.prevent="togglePage(page.key)"
                    >
                    <input
                      type="checkbox"
                      role="checkbox"
                      :aria-checked="isSelected(page.key)"
                      :aria-label="pageLabel(page)"
                      class="peer sr-only focus-visible:outline-none"
                      :checked="isSelected(page.key)"
                      @change="togglePage(page.key)"
                      @click.stop
                    />
                    <div class="w-5 h-5 rounded border border-input theme-text-primary flex items-center justify-center shrink-0" :class="{
                      'bg-primary': isSelected(page.key),
                      'border-primary': false
                    }">
                      <span v-if="isSelected(page.key)" class="text-[10px] text-primary-foreground">✓</span>
                    </div>
                    <div class="flex items-center gap-2 min-w-0">
                        <div class="h-6 w-6 rounded bg-muted flex items-center justify-center shrink-0">
                          <component :is="moduleIcon(module.key)" class="h-3 w-3 theme-text-muted" />
                        </div>
                        <span class="text-sm theme-text-primary text-start truncate">{{ pageLabel(page) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="visibleModules.length === 0" class="text-center py-8">
              <p class="text-xs theme-text-muted">{{ $t('notifications.permissions.noResults') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm dialog (unsaved changes on user switch) -->
    <ConfirmDialog
      v-show="showConfirm"
      :title="$t('notifications.permissions.confirmLeave')"
      :message="$t('notifications.permissions.confirmLeave')"
      confirm-text="$t('notifications.permissions.confirmDiscard')"
      cancel-text="$t('labels.cancel')"
      @confirm="handleConfirmSwitch"
      @cancel="handleCancelSwitch"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { getThemeIcon } from '@acme/icon-packs'
import { ArrowRightIcon, CheckIcon, ShieldCheckIcon, UserGroupIcon, MagnifyingGlassIcon, UserIcon } from '@acme/icon-packs/legacy'
import { PERMISSION_REGISTRY } from '@/permissions/registry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { getUsers, getUserPermissions, updateUserPermissions } from '@/api/users'

const MODULE_ICONS = {
  supplies: 'supplies',
  transport: 'contractor',
  expenses: 'money',
  payments: 'money',
  treasury: 'wallet',
  equipment: 'equipment',
  extracts: 'archive',
  reports: 'reports',
  admin: 'settings'
}

const PRESETS = [
  { key: 'supplies', label: 'notifications.permissions.presetSupplies', modules: ['supplies'] },
  { key: 'transport', label: 'notifications.permissions.presetTransport', modules: ['transport'] },
  { key: 'reports', label: 'notifications.permissions.presetReports', modules: ['reports'] },
  { key: 'full', label: 'notifications.permissions.presetFull', modules: null }
]

export default {
  name: 'UserPermissions',
  components: { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, ConfirmDialog },
  props: {},
  setup() {
    const { locale, t } = useI18n()
    const dir = computed(() => (String(locale.value || '').toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'))

    const modules = computed(() => Object.entries(PERMISSION_REGISTRY).map(([key, module]) => ({
      key,
      label: module.label,
      pages: Object.entries(module.pages).map(([pageKey, page]) => ({ key: pageKey, ...page }))
    })))

    const moduleIcon = (key) => getThemeIcon(MODULE_ICONS[key] || 'default')

    const users = ref([])
    const selectedUser = ref(null)
    const selectedKeys = ref([])
    const initialKeys = ref([])
    const loadingUsers = ref(false)
    const loadingPermissions = ref(false)
    const saving = ref(false)
    const serverError = ref(null)
    const serverSuccess = ref(null)
    const pickerError = ref(null)
    const searchUsers = ref('')
    const searchModules = ref('')
    const expandedModules = ref(new Set())
    const showConfirm = ref(false)
    const pendingUser = ref(null)

    const isAdminUser = (u) => Array.isArray(u?.roles) && u.roles.some(r => Number(r.roleId ?? r.role?.id) === 1)

    const initials = (name) => {
      if (!name) return '?'
      return String(name).split(/\s+/).map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase()
    }

    const moduleLabel = (module) => {
      const d = dir.value
      return module.label[d === 'rtl' ? 'ar' : 'en'] || module.label.en
    }

    const pageLabel = (page) => {
      const d = dir.value
      return page.label[d === 'rtl' ? 'ar' : 'en'] || page.label.en
    }

    const modulePageKeys = (moduleKey) => modules.value.find(m => m.key === moduleKey)?.pages.map(p => p.key) ?? []

    const isSelected = (key) => selectedKeys.value.includes(key)

    const selectedCount = (moduleKey) => modulePageKeys(moduleKey).filter(k => isSelected(k)).length

    const moduleFullyChecked = (moduleKey) => {
      const keys = modulePageKeys(moduleKey)
      return keys.length > 0 && keys.every(k => isSelected(k))
    }

    const moduleIndeterminate = (moduleKey) => {
      const keys = modulePageKeys(moduleKey)
      if (keys.length === 0) return false
      const checked = keys.filter(k => isSelected(k))
      return checked.length > 0 && checked.length < keys.length
    }

    const moduleTriState = (moduleKey) => {
      if (moduleFullyChecked(moduleKey)) return true
      if (moduleIndeterminate(moduleKey)) return 'mixed'
      return false
    }

    const modulePages = (moduleKey) => `${selectedCount(moduleKey)} of ${modulePageKeys(moduleKey).length}`

    const togglePage = (key) => {
      if (isSelected(key)) selectedKeys.value = selectedKeys.value.filter(k => k !== key)
      else selectedKeys.value = [...selectedKeys.value, key]
    }

    const toggleModule = (moduleKey) => {
      const keys = modulePageKeys(moduleKey)
      if (moduleFullyChecked(moduleKey)) {
        selectedKeys.value = selectedKeys.value.filter(k => !keys.includes(k))
      } else {
        selectedKeys.value = [...new Set([...selectedKeys.value, ...keys])]
      }
    }

    const toggleExpansion = (key) => {
      const next = new Set(expandedModules.value)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      expandedModules.value = next
    }

    const isExpanded = (key) => expandedModules.value.has(key)

    const expandAll = () => {
      expandedModules.value = new Set(modules.value.map(m => m.key))
    }

    const collapseAll = () => {
      expandedModules.value = new Set()
    }

    const selectAll = () => {
      selectedKeys.value = modules.value.flatMap(m => modulePageKeys(m.key))
    }

    const clearAll = () => {
      selectedKeys.value = []
    }

    const applyPreset = (preset) => {
      if (saving.value || !selectedUser.value || isAdminUser(selectedUser.value)) return
      if (preset.modules === null) {
        selectAll()
      } else {
        const keys = preset.modules.flatMap(m => modulePageKeys(m))
        selectedKeys.value = [...new Set([...selectedKeys.value, ...keys])]
      }
    }

    const totalChecked = computed(() => selectedKeys.value.length)
    const totalModules = computed(() => modules.value.filter(m => selectedCount(m.key) > 0).length)

    const dirty = computed(() => {
      const a = [...selectedKeys.value].sort()
      const b = [...initialKeys.value].sort()
      return a.length !== b.length || a.some((k, i) => k !== b[i])
    })

    const userResults = computed(() => {
      const q = String(searchUsers.value || '').toLowerCase().trim()
      if (!q) return users.value
      return users.value.filter(u => String(u.name || '').toLowerCase().includes(q) || String(u.email || '').toLowerCase().includes(q))
    })

    const visibleModules = computed(() => {
      const q = String(searchModules.value || '').toLowerCase().trim()
      return modules.value.filter(m => {
        if (moduleLabel(m).toLowerCase().includes(q)) return true
        return m.pages.some(p => pageLabel(p).toLowerCase().includes(q))
      })
    })

    const visiblePages = (moduleKey) => {
      const q = String(searchModules.value || '').toLowerCase().trim()
      const module = modules.value.find(m => m.key === moduleKey)
      if (!module) return []
      if (moduleLabel(module).toLowerCase().includes(q)) return module.pages
      return module.pages.filter(p => pageLabel(p).toLowerCase().includes(q))
    }

    const loadUsers = async () => {
      loadingUsers.value = true
      pickerError.value = null
      try {
        const res = await getUsers({ page: 1, pageSize: 200 })
        const items = res.data?.items ?? res.data ?? []
        users.value = Array.isArray(items) ? items : []
      } catch (e) {
        pickerError.value = t('notifications.permissions.loadError') || 'Failed to load users'
      } finally {
        loadingUsers.value = false
      }
    }

    const loadPermissions = async (id) => {
      loadingPermissions.value = true
      serverError.value = null
      serverSuccess.value = null
      try {
        const res = await getUserPermissions(id)
        const perms = res.data?.permissions ?? []
        selectedKeys.value = Array.isArray(perms) ? [...perms] : []
        initialKeys.value = [...selectedKeys.value]
        expandedModules.value = new Set(modules.value.map(m => m.key))
      } catch (e) {
        serverError.value = t('notifications.permissions.loadError') || 'Failed to load permissions'
      } finally {
        loadingPermissions.value = false
      }
    }

    const onUserSelect = (u) => {
      if (u.id === selectedUser.value?.id) return
      if (dirty.value) {
        pendingUser.value = u
        showConfirm.value = true
        return
      }
      commitUserSelect(u)
    }

    const commitUserSelect = (u) => {
      selectedUser.value = u
      selectedKeys.value = []
      showConfirm.value = false
      pendingUser.value = null
      if (u && u.id) loadPermissions(u.id)
    }

    const handleConfirmSwitch = () => {
      commitUserSelect(pendingUser.value)
    }

    const handleCancelSwitch = () => {
      showConfirm.value = false
      pendingUser.value = null
    }

    const handleDiscard = () => {
      if (saving.value || !selectedUser.value) return
      selectedKeys.value = [...initialKeys.value]
    }

    const save = async () => {
      if (!selectedUser.value || isAdminUser(selectedUser.value) || !dirty.value) return
      saving.value = true
      serverError.value = null
      serverSuccess.value = null
      try {
        await updateUserPermissions(selectedUser.value.id, selectedKeys.value)
        initialKeys.value = [...selectedKeys.value]
        serverSuccess.value = t('notifications.permissions.saveSuccess')
        setTimeout(() => { serverSuccess.value = null }, 3000)
      } catch (e) {
        serverError.value = e?.response?.data?.message || t('notifications.permissions.saveError')
      } finally {
        saving.value = false
      }
    }

    const onBeforeUnload = (e) => {
      if (dirty.value) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    onMounted(() => {
      watch(dirty, (d) => {
        if (d) window.addEventListener('beforeunload', onBeforeUnload)
        else window.removeEventListener('beforeunload', onBeforeUnload)
      })
      if (dirty.value) window.addEventListener('beforeunload', onBeforeUnload)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', onBeforeUnload)
    })

    loadUsers()

    return {
      dir, modules, moduleIcon, ArrowRightIcon, CheckIcon, ShieldCheckIcon, UserGroupIcon,
      MagnifyingGlassIcon, UserIcon, users, selectedUser, selectedKeys, initialKeys,
      loadingUsers, loadingPermissions, saving, serverError, serverSuccess, pickerError,
      searchUsers, searchModules, expandedModules, showConfirm, pendingUser,
      isAdminUser, initials, moduleLabel, pageLabel, modulePageKeys, isSelected,
      selectedCount, moduleFullyChecked, moduleIndeterminate, moduleTriState,
      modulePages, togglePage, toggleModule, toggleExpansion, isExpanded,
      expandAll, collapseAll, selectAll, clearAll, applyPreset, totalChecked,
      totalModules, dirty, userResults, visibleModules, visiblePages,
      loadUsers, loadPermissions, onUserSelect, commitUserSelect, handleConfirmSwitch,
      handleCancelSwitch, handleDiscard, save, PRESETS
    }
  }
}
</script>

<style scoped>
.module-card { animation: none; }
.page-row { transition: all 0.15s ease; }
</style>

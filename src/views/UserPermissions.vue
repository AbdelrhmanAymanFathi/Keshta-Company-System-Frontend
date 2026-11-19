<template>
  <div :dir="dir" class="permissions-admin app-page-header-space p-4 sm:p-0.5 lg:p-1">
    <!-- Header -->
    <div class="app-page-header flex flex-wrap items-center justify-between gap-4 rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50 mb-4">
      <div>
        <h2 class="text-2xl font-semibold theme-text-primary">{{ $t('users.permissions') }}</h2>
        <p class="text-sm theme-text-muted">{{ $t('permissions.inheritNote') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          v-if="!saving"
          variant="outline"
          @click="selectAll"
          class="text-xs px-3 py-1.5"
        >{{ $t('permissions.selectAll') }}</Button>
        <Button
          v-if="!saving"
          variant="outline"
          @click="clearAll"
          class="text-xs px-3 py-1.5"
        >{{ $t('permissions.clearAll') }}</Button>
        <Button
          :disabled="saving || !selectedUser || isAdminUser(selectedUser)"
          @click="save"
          class="px-4 py-2"
        >
          <span v-if="saving">{{ $t('permissions.saving') }}</span>
          <span v-else>{{ $t('permissions.save') }}</span>
        </Button>
      </div>
    </div>

    <!-- User picker -->
    <div v-if="!loadingUsers" class="max-w-xl mb-6">
      <div class="mb-3 text-sm font-medium theme-text-primary">{{ $t('permissions.selectUser') }}</div>
      <SearchDropdown
        :items="users"
        item-key="id"
        item-label="name"
        :placeholder="$t('permissions.selectUser')"
        :model-value="selectedUser ? selectedUser.name : ''"
        @select="onUserSelect"
        clearable
      />
      <div v-if="pickerError" class="mt-2 text-xs text-red-500">{{ pickerError }}</div>
    </div>
    <div v-else class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 theme-border-accent"></div>
    </div>

    <!-- Permission tree -->
    <div v-if="selectedUser" class="space-y-3">
      <div
        class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/30"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold theme-text-primary">{{ $t('permissions.configureFor', { name: selectedUser.name }) }}</span>
          <span v-if="isAdminUser(selectedUser)" class="text-xs font-medium bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
            {{ $t('users.admin') }} - {{ $t('permissions.adminAlways') || 'always unrestricted' }}
          </span>
        </div>

        <div v-for="(module, moduleKey) in modules" :key="moduleKey" class="module-card">
          <div class="module-header flex items-center gap-2 mb-2 px-2">
            <input
              type="checkbox"
              class="w-5 h-5 rounded border-slate-300 theme-text-primary focus:ring-2 focus:ring-offset-0"
              :checked="isModuleFullyChecked(moduleKey)"
              :indeterminate="isModuleIndeterminate(moduleKey)"
              @change="(e) => toggleModule(moduleKey, e.target.checked)"
              :aria-label="$t('permissions.module') + ' ' + module.label.en"
            />
            <label class="font-medium text-sm theme-text-primary cursor-pointer select-none"
              :for="`module-${moduleKey}`"
            >{{ module.label[dir === 'rtl' ? 'ar' : 'en'] || module.label.en }}</label>
            <span class="ml-auto text-xs theme-text-muted">
              {{ selectedCount(moduleKey) }} / {{ module.pages.length }}
            </span>
          </div>
          <div class="pages-grid pl-8">
            <div
              v-for="page in module.pages"
              :key="page.key"
              class="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-50/50"
            >
              <input
                type="checkbox"
                class="w-4 h-4 rounded border-slate-300 theme-text-primary focus:ring-2 focus:ring-offset-0"
                :checked="hasKey(page.key)"
                :indeterminate="false"
                @change="(e) => togglePage(page.key, e.target.checked)"
                :id="`page-${page.key}`"
                :aria-label="page.label[dir === 'rtl' ? 'ar' : 'en'] || page.label.en"
              />
              <label
                :for="`page-${page.key}`"
                class="text-sm text-foreground cursor-pointer select-none"
              >{{ page.label[dir === 'rtl' ? 'ar' : 'en'] || page.label.en }}</label>
              <span v-if="page.route" class="ml-auto text-[10px] text-theme-muted">{{ page.route }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="serverError" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ serverError }}</div>
      <div v-if="serverSuccess" class="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{{ serverSuccess }}</div>
    </div>

    <div v-if="selectedUser && !serverError && !serverSuccess" class="mt-4 text-xs theme-text-muted">
      {{ $t('permissions.saveHint') || 'Select the pages this user may see, then save.' }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PERMISSION_REGISTRY } from '@/permissions/registry'
import { Button } from '@/components/ui/button'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { getUsers, getUserPermissions, updateUserPermissions } from '@/api/users'

export default {
  name: 'UserPermissions',
  components: { Button, SearchDropdown },
  props: {},
  setup() {
    const { locale, t } = useI18n()
    const dir = computed(() => (String(locale.value || '').toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'))
    const modules = computed(() => Object.entries(PERMISSION_REGISTRY).map(([key, module]) => ({
      key,
      label: module.label,
      pages: Object.entries(module.pages).map(([pageKey, page]) => ({ key: pageKey, ...page })),
    })))
    const users = ref([])
    const selectedUser = ref(null)
    const selectedKeys = ref([])
    const loadingUsers = ref(false)
    const saving = ref(false)
    const serverError = ref(null)
    const serverSuccess = ref(null)
    const pickerError = ref(null)

    const hasKey = (key) => selectedKeys.value.includes(key)

    const loadUsers = async () => {
      loadingUsers.value = true
      pickerError.value = null
      try {
        const res = await getUsers({ page: 1, pageSize: 200 })
        const items = res.data?.items ?? res.data ?? []
        users.value = Array.isArray(items) ? items : []
      } catch (e) {
        pickerError.value = t('permissions.loadError') || 'Failed to load users'
      } finally {
        loadingUsers.value = false
      }
    }

    const loadPermissions = async (id) => {
      selectedKeys.value = []
      serverError.value = null
      serverSuccess.value = null
      try {
        const res = await getUserPermissions(id)
        const perms = res.data?.permissions ?? []
        selectedKeys.value = Array.isArray(perms) ? [...perms] : []
      } catch (e) {
        serverError.value = t('permissions.loadError') || 'Failed to load permissions'
      }
    }

    const onUserSelect = (item) => {
      selectedUser.value = item
      selectedKeys.value = []
      if (item && item.id) loadPermissions(item.id)
    }

    const togglePage = (key, checked) => {
      if (checked) {
        if (!selectedKeys.value.includes(key)) selectedKeys.value = [...selectedKeys.value, key]
      } else {
        selectedKeys.value = selectedKeys.value.filter(k => k !== key)
      }
    }

    const modulePageKeys = (moduleKey) => modules.value.find(m => m.key === moduleKey)?.pages.map(p => p.key) ?? []

    const isModuleFullyChecked = (moduleKey) => {
      const keys = modulePageKeys(moduleKey)
      return keys.length > 0 && keys.every(k => hasKey(k))
    }

    const isModuleIndeterminate = (moduleKey) => {
      const keys = modulePageKeys(moduleKey)
      if (keys.length === 0) return false
      const checked = keys.filter(k => hasKey(k))
      return checked.length > 0 && checked.length < keys.length
    }

    const toggleModule = (moduleKey, checked) => {
      const keys = modulePageKeys(moduleKey)
      if (checked) {
        const next = [...new Set([...selectedKeys.value, ...keys])]
        selectedKeys.value = next
      } else {
        selectedKeys.value = selectedKeys.value.filter(k => !keys.includes(k))
      }
    }

    const selectedCount = (moduleKey) => modulePageKeys(moduleKey).filter(k => hasKey(k)).length

    const selectAll = () => {
      selectedKeys.value = PERMISSION_REGISTRY && Object.values(PERMISSION_REGISTRY)
        .flatMap(m => Object.keys(m.pages))
    }

    const clearAll = () => {
      selectedKeys.value = []
    }

    const save = async () => {
      if (!selectedUser.value || isAdminUser(selectedUser.value)) return
      saving.value = true
      serverError.value = null
      serverSuccess.value = null
      try {
        await updateUserPermissions(selectedUser.value.id, selectedKeys.value)
        serverSuccess.value = t('permissions.saveSuccess')
        setTimeout(() => { serverSuccess.value = null }, 3000)
      } catch (e) {
        serverError.value = e?.response?.data?.message || t('permissions.saveError')
      } finally {
        saving.value = false
      }
    }

    const isAdminUser = (u) => Array.isArray(u?.roles) && u.roles.some(r => Number(r.roleId) === 1)

    watch(() => selectedUser.value, () => { selectedKeys.value = [] })

    loadUsers()

    return {
      dir, modules, users, selectedUser, selectedKeys, loadingUsers, saving,
      serverError, serverSuccess, pickerError, hasKey, modulePageKeys,
      isModuleFullyChecked, isModuleIndeterminate, toggleModule, togglePage,
      selectedCount, selectAll, clearAll, save, onUserSelect, isAdminUser,
    }
  },
}
</script>

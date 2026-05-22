<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6 p-0 sm:p-0.5 md:p-1 lg:p-0">
    <!-- Header -->
    <div class="app-page-header flex flex-wrap items-center justify-between gap-4 rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold text-slate-900">{{ $t('users.title') }}</h2>
      <button
        @click="openAdd"
        class="flex items-center gap-2 rounded-xl theme-button px-4 py-2 text-white shadow-sm  transition-colors "
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        {{ $t('users.add') }}
      </button>
    </div>

    <!-- Search -->
    <div class="max-w-md rounded-2xl border border-slate-200/80 bg-white p-3 shadow-lg shadow-slate-200/30">
      <input
        v-model="q"
        @input="onSearchInput"
        type="search"
        :placeholder="$t('users.searchPlaceholder')"
        class="w-full rounded-xl border border-slate-200 px-4 py-2  theme-input-focus"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
    </div>

    <!-- Desktop Table -->
    <div v-if="!loading" class="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 sm:block">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="theme-table-thead-gradient">
            <tr>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('labels.#') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('users.name') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('users.email') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('users.phone') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('users.status') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('users.roles') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">{{ $t('labels.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr
              v-for="(user, idx) in users"
              :key="user.id"
              class="transition-colors theme-table-row-hover"
              @contextmenu.prevent="openContextMenu($event, user)"
            >
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900" :class="textAlign">{{ (page - 1) * pageSize + idx + 1 }}</td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900" :class="textAlign">{{ user.name }}</td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900" :class="textAlign">{{ user.email }}</td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900" :class="textAlign">{{ user.phone || '-' }}</td>
              <td class="px-6 py-4 text-sm whitespace-nowrap" :class="textAlign">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  ]"
                >
                  {{ user.isActive ? $t('users.active') : $t('users.inactive') }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm" :class="textAlign">
                <div class="flex flex-wrap gap-1" :class="'justify-start'">
                  <!-- <span
                    :class="[
                      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                      isUserAdmin(user) ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ isUserAdmin(user) ? $t('users.admin') : $t('users.user') }}
                  </span> -->
                  <span
                    v-for="role in user.roles"
                    :key="role.roleId || role.id"
                    class="inline-flex items-center rounded-lg theme-icon-bg px-2 py-1 text-xs font-medium theme-text-muted"
                  >
                    {{ role.role?.label || role.role?.name || 'N/A' }}
                  </span>
                  <span v-if="!user.roles || user.roles.length === 0" class="text-gray-400 text-xs">-</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-3" :class="'justify-start'">
                    <button @click.stop="openEdit(user)" class="text-yellow-600 hover:text-yellow-800" :title="$t('labels.edit')">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                    <button @click.stop="openReset(user)" class="theme-text hover:theme-text-muted" :title="$t('users.resetPassword')">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11V7a4 4 0 10-8 0v4M5 11h14v8H5z" />
                      </svg>
                    </button>
                  <button @click.stop="confirmDelete(user)" class="text-red-600 hover:text-red-800" :title="$t('labels.delete')">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                {{ $t('users.noResults') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div v-if="!loading" class="sm:hidden space-y-4">
      <div
        v-for="user in users"
        :key="user.id"
        class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/30"
        @contextmenu.prevent="openContextMenu($event, user)"
      >
        <div class="flex justify-between items-start" :class="isRTL ? 'flex-row-reverse' : ''">
          <div :class="isRTL ? 'text-right' : 'text-left'">
            <div class="font-semibold text-gray-900">{{ user.name }}</div>
            <div class="text-sm text-gray-500 mt-1">
              {{ user.email }}<br>
              {{ user.phone || '-' }}<br>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                  user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                ]"
              >
                {{ user.isActive ? $t('users.active') : $t('users.inactive') }}
              </span>
            </div>
            <div v-if="user.roles && user.roles.length > 0" class="flex flex-wrap gap-1 mt-2" :class="isRTL ? 'justify-end' : 'justify-start'">
              <span
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                  isUserAdmin(user) ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ isUserAdmin(user) ? $t('users.admin') : $t('users.user') }}
              </span>
              <span
                v-for="role in user.roles"
                :key="role.roleId || role.id"
                class="inline-flex items-center rounded-lg theme-icon-bg px-2 py-1 text-xs font-medium theme-text-muted"
              >
                {{ role.role?.label || role.role?.name || 'N/A' }}
              </span>
            </div>
            <div v-else class="flex flex-wrap gap-1 mt-2" :class="isRTL ? 'justify-end' : 'justify-start'">
              <span
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                  isUserAdmin(user) ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ isUserAdmin(user) ? $t('users.admin') : $t('users.user') }}
              </span>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <button @click.stop="openEdit(user)" class="text-yellow-600 text-xs">{{ $t('labels.edit') }}</button>
            <button @click.stop="confirmDelete(user)" class="text-red-600 text-xs">{{ $t('labels.delete') }}</button>
          </div>
        </div>
      </div>
      <div v-if="users.length === 0" class="text-center py-12 text-gray-500">
        {{ $t('users.noResults') }}
      </div>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :total-pages="totalPages"
      @update:page="changePage"
      @update:pageSize="onPageSizeChange"
    />

    <!-- Context Menu -->
    <div
      v-if="contextMenu.open"
      class="fixed z-50 min-w-[180px] rounded-xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-200/60"
      :style="{ top: contextMenu.y + 'px', [isRTL ? 'right' : 'left']: contextMenu.x + 'px' }"
      @click.stop
      @contextmenu.prevent
    >
      <button @click="contextAction('edit')" class="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {{ $t('labels.edit') }}
      </button>
      <button @click="contextAction('delete')" class="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-slate-50" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {{ $t('labels.delete') }}
      </button>
      <button @click="contextAction('reset')" class="flex w-full items-center gap-3 px-4 py-2 text-sm theme-text hover:bg-slate-50" :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v1h1a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2h1v-1c0-1.657 1.343-3 3-3s3 1.343 3 3v1h2v-1z" />
        </svg>
        {{ $t('users.resetPassword') }}
      </button>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="resetModalOpen" class="fixed inset-0 z-50 mt-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm" style="margin-top: 0 !important;">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" :class="isRTL ? 'text-right' : 'text-left'">
        <h3 class="text-lg font-semibold mb-4">{{ $t('users.resetModalTitle') }}</h3>
        <p class="text-gray-600 mb-4">{{ $t('users.resetConfirmMessage', { name: resetUser?.name || '' }) }}</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.password') }}</label>
            <input v-model="resetForm.newPassword" type="password" class="w-full rounded-xl border border-slate-200 px-3 py-2  theme-input-focus" />
            <p class="text-sm text-gray-500 mt-1">{{ $t('users.resetHint') }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">TOTP</label>
            <input v-model="resetForm.adminTotp" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2  theme-input-focus" />
          </div>
        </div>
        <div class="flex gap-3 mt-6" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="closeResetModal" class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50">{{ $t('labels.cancel') }}</button>
          <button @click="confirmReset" :disabled="resetting" class="flex-1 rounded-xl theme-button px-4 py-2 text-white  disabled:opacity-50">{{ resetting ? $t('labels.resetting') : $t('labels.reset') }}</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 mt-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm" style="margin-top: 0 !important;">
      <div class="max-h-[100vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" :class="isRTL ? 'text-right' : 'text-left'">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            {{ editing ? $t('users.editUser') : $t('users.addUser') }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.name') }}</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full rounded-xl border border-slate-200 px-3 py-2  theme-input-focus"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.email') }}</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full rounded-xl border border-slate-200 px-3 py-2  theme-input-focus"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.phone') }}</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full rounded-xl border border-slate-200 px-3 py-2  theme-input-focus"
            />
          </div>
          <div v-if="!editing">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.password') }}</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full rounded-xl border border-slate-200 px-3 py-2  theme-input-focus"
            />
          </div>
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="w-4 h-4 theme-text border-gray-300 rounded theme-input-focus"
              />
              <span class="text-sm font-medium text-gray-700">{{ $t('users.isActive') }}</span>
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('users.roles') }}</label>
            <div v-if="rolesLoading" class="text-sm text-slate-500">
              {{ $t('users.rolesLoading') }}
            </div>
            <div v-else class="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <label
                v-for="role in availableRoles"
                :key="role.id"
                class="flex items-start gap-2 cursor-pointer"
              >
                <input
                  v-model="form.roles"
                  :value="role.id"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 theme-text theme-input-focus"
                />
                <span class="min-w-0">
                  <span class="block text-sm text-slate-700">{{ role.label || role.name }}</span>
                  <span v-if="role.description" class="block text-xs text-slate-500">{{ role.description }}</span>
                </span>
              </label>
              <p v-if="availableRoles.length === 0" class="text-sm text-slate-500">
                {{ $t('users.noRolesAvailable') }}
              </p>
            </div>
          </div>
          <div class="flex gap-3 pt-4" :class="isRTL ? 'flex-row-reverse' : ''">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              {{ $t('labels.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 rounded-xl theme-button px-4 py-2 text-white  disabled:opacity-50"
            >
              {{ saving ? $t('labels.saving') : $t('labels.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModalOpen" class="fixed inset-0 z-50 mt-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm" style="margin-top: 0 !important;">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 class="text-lg font-semibold mb-4">{{ $t('users.deleteConfirm') }}</h3>
        <p class="text-gray-600 mb-6">
          {{ $t('users.deleteConfirmMessage', { name: userToDelete?.name || '' }) }}
        </p>
        <div class="flex gap-3" :class="isRTL ? 'flex-row-reverse' : ''">
          <button
            @click="deleteModalOpen = false"
            class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            {{ $t('labels.cancel') }}
          </button>
          <button
            @click="deleteUser"
            :disabled="deleting"
            class="flex-1 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? $t('labels.deleting') : $t('labels.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { getUsers, getUserRoles, createUser, updateUser, deleteUser, adminResetUserPassword } from '@/api'
import Pagination from '@/components/shared/Pagination.vue'

export default {
  name: 'UsersList',
  components: {
    Pagination
  },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  data() {
    return {
      users: [],
      loading: false,
      q: '',
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      modalOpen: false,
      editing: false,
      editingUserId: null,
      rolesLoading: false,
      saving: false,
      form: {
        name: '',
        email: '',
        phone: '',
        password: '',
        isActive: true,
        roles: []
      },
      contextMenu: {
        open: false,
        x: 0,
        y: 0,
        user: null
      },
      deleteModalOpen: false,
      userToDelete: null,
      deleting: false,
      // Reset password modal
      resetModalOpen: false,
      resetUser: null,
      resetting: false,
      resetForm: {
        newPassword: '',
        adminTotp: ''
      },
      availableRoles: []
    }
  },
  computed: {
    isRTL() {
      return this.locale === 'ar'
    },
    textAlign() {
      return this.isRTL ? 'text-right' : 'text-left'
    }
  },
  watch: {
    q() {
      this.page = 1
      this.loadUsers()
    }
  },
  mounted() {
    this.loadUsers()
    this.loadAvailableRoles()
    document.addEventListener('click', this.closeContextMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  },
  methods: {
    isUserAdmin(user) {
      return (user.roles || []).some(role => role.role?.name === 'ADMIN')
    },
    getAssignedRoleIds(user) {
      return (user.roles || []).map(role => role.role?.id || role.roleId || role.id).filter(Boolean)
    },
    async loadAvailableRoles() {
      this.rolesLoading = true
      try {
        const response = await getUserRoles()
        this.availableRoles = Array.isArray(response.data) ? response.data : (response.data?.items || [])
      } catch (error) {
        console.error('Error loading user roles:', error)
        if (window.$toast) {
          window.$toast(this.$t('users.rolesLoadError'), 'error')
        }
      } finally {
        this.rolesLoading = false
      }
    },
    async loadUsers() {
      this.loading = true
      try {
        const response = await getUsers({
          page: this.page,
          pageSize: this.pageSize,
          q: this.q
        })
        const data = response.data
        this.users = data.items || []
        this.total = data.total || 0
        this.totalPages = data.totalPages || Math.ceil(this.total / this.pageSize)
      } catch (error) {
        console.error('Error loading users:', error)
        if (window.$toast) {
          window.$toast(this.$t('users.loadError'), 'error')
        }
      } finally {
        this.loading = false
      }
    },
    onSearchInput() {
      // Debounce handled by watch
    },
    changePage(newPage) {
      this.page = newPage
      this.loadUsers()
    },
    onPageSizeChange(newSize) {
      this.pageSize = newSize
      this.page = 1
      this.loadUsers()
    },
    openAdd() {
      this.editing = false
      this.form = {
        name: '',
        email: '',
        phone: '',
        password: '',
        isActive: true,
        roles: []
      }
      this.editingUserId = null
      this.modalOpen = true
    },
    openEdit(user) {
      const roles = this.getAssignedRoleIds(user)
      this.editing = true
      this.editingUserId = user.id
      this.form = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        isActive: user.isActive !== undefined ? user.isActive : true,
        roles
      }
      this.contextMenu.user = user
      this.modalOpen = true
      this.closeContextMenu()
    },
    closeModal() {
      this.modalOpen = false
      this.editing = false
      this.editingUserId = null
      this.form = {
        name: '',
        email: '',
        phone: '',
        password: '',
        isActive: true,
        roles: []
      }
    },
    async saveUser() {
      this.saving = true
      try {
        const roleIds = Array.isArray(this.form.roles) ? [...this.form.roles] : []
        const payload = {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          isActive: this.form.isActive,
          isAdmin: roleIds.some(roleId => {
            const role = this.availableRoles.find(item => item.id === roleId)
            return role?.name === 'ADMIN'
          }),
          roleIds
        }
        if (!this.editing && this.form.password) {
          payload.password = this.form.password
        }
        if (this.editing) {
          await updateUser(this.editingUserId, payload)
        } else {
          await createUser(payload)
        }
        if (window.$toast) {
          window.$toast(
            this.editing ? this.$t('users.updateSuccess') : this.$t('users.addSuccess'),
            'success'
          )
        }
        this.closeModal()
        this.loadUsers()
      } catch (error) {
        console.error('Error saving user:', error)
        if (window.$toast) {
          window.$toast(this.$t('users.saveError'), 'error')
        }
      } finally {
        this.saving = false
      }
    },
    confirmDelete(user) {
      this.userToDelete = user
      this.deleteModalOpen = true
      this.closeContextMenu()
    },
    closeResetModal() {
      this.resetModalOpen = false
      this.resetUser = null
      this.resetForm = { newPassword: '', adminTotp: '' }
      this.resetting = false
    },
    openReset(user) {
      this.resetUser = user
      this.resetForm = { newPassword: '', adminTotp: '' }
      this.resetModalOpen = true
      this.closeContextMenu()
    },
    async confirmReset() {
      if (!this.resetUser) return
      const min = 8
      const pw = (this.resetForm.newPassword || '').trim()
      if (!pw) {
        if (window.$toast) window.$toast(this.$t('users.passwordRequired') || 'Password required', 'error')
        return
      }
      if (pw.length < min) {
        if (window.$toast) window.$toast(this.$t('users.passwordTooShort', { min }) || `Password must be at least ${min} characters`, 'error')
        return
      }
      this.resetting = true
      try {
        await this.$api?.adminResetUserPassword ? this.$api.adminResetUserPassword(this.resetUser.id, { newPassword: pw, adminTotp: this.resetForm.adminTotp }) : adminResetUserPassword(this.resetUser.id, { newPassword: pw, adminTotp: this.resetForm.adminTotp })
        if (window.$toast) window.$toast(this.$t('users.resetSuccess') || 'Password reset', 'success')
        this.closeResetModal()
      } catch (error) {
        console.error('Error resetting password:', error)
        if (window.$toast) window.$toast(this.$t('users.resetError') || 'Failed to reset password', 'error')
      } finally {
        this.resetting = false
      }
    },
    async deleteUser() {
      if (!this.userToDelete) return
      this.deleting = true
      try {
        await deleteUser(this.userToDelete.id)
        if (window.$toast) {
          window.$toast(this.$t('users.deleteSuccess'), 'success')
        }
        this.deleteModalOpen = false
        this.userToDelete = null
        this.loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        if (window.$toast) {
          window.$toast(this.$t('users.deleteError'), 'error')
        }
      } finally {
        this.deleting = false
      }
    },
    openContextMenu(event, user) {
      event.stopPropagation()
      this.contextMenu.user = user
      this.contextMenu.x = event.clientX
      this.contextMenu.y = event.clientY
      this.contextMenu.open = true
    },
    closeContextMenu() {
      this.contextMenu.open = false
    },
    contextAction(action) {
      if (!this.contextMenu.user) return
      if (action === 'edit') {
        this.openEdit(this.contextMenu.user)
      } else if (action === 'delete') {
        this.confirmDelete(this.contextMenu.user)
      } else if (action === 'reset') {
        this.openReset(this.contextMenu.user)
      }
      this.closeContextMenu()
    }
  }
}
</script>

<style scoped>
.direction-rtl {
  direction: rtl;
}
</style>

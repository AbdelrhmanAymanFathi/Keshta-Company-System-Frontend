<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold text-gray-900">{{ $t('dashboard.driversList') || 'Drivers' }}</h2>
      <button @click="openAdd" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        {{ $t('labels.add') || 'Add' }}
      </button>
    </div>

    <div class="max-w-md">
      <input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('placeholders.search') || 'Search...'" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-if="!loading" class="hidden sm:block bg-white rounded-lg shadow-sm border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-indigo-50">
            <tr>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('drivers.name') || 'Name' }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('drivers.phone') || 'Phone' }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('drivers.nationalId') || 'National ID' }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('labels.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(d, idx) in drivers" :key="d.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-indigo-800">{{ (page - 1) * pageSize + idx + 1 }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ d.name || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ d.phone || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ d.nationalId || '-' }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-3 justify-end">
                  <button @click.stop="openEdit(d)" class="text-yellow-600 hover:text-yellow-800" title="Edit">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click.stop="confirmDelete(d)" class="text-red-600 hover:text-red-800" title="Delete">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="drivers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">{{ $t('labels.noData') || 'No drivers found' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div v-if="!loading" class="sm:hidden space-y-4">
      <div v-for="d in drivers" :key="d.id" class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex justify-between">
          <div>
            <div class="font-semibold text-gray-900">{{ d.name }}</div>
            <div class="text-sm text-gray-500">{{ d.phone || '-' }}</div>
            <div class="text-sm text-gray-500">{{ d.nationalId || '-' }}</div>
          </div>
          <div class="flex flex-col gap-2">
            <button @click.stop="openEdit(d)" class="text-yellow-600 text-xs">{{ $t('labels.edit') }}</button>
            <button @click.stop="confirmDelete(d)" class="text-red-600 text-xs">{{ $t('labels.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <Pagination v-if="totalPages > 1" :current-page="page" :page-size="pageSize" :total="total" :total-pages="totalPages" @update:page="changePage" @update:pageSize="onPageSizeChange" />

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">{{ editing ? $t('labels.update') : $t('labels.add') }} {{ $t('drivers.singular') || 'Driver' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form @submit.prevent="saveDriver" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('drivers.name') || 'Name' }}</label>
            <input v-model="form.name" type="text" required class="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('drivers.phone') || 'Phone' }}</label>
            <input v-model="form.phone" type="tel" class="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('drivers.nationalId') || 'National ID' }}</label>
            <input v-model="form.nationalId" type="text" class="w-full px-3 py-2 border rounded" />
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">{{ $t('labels.cancel') }}</button>
            <button type="submit" :disabled="saving" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{{ saving ? $t('labels.saving') : $t('labels.save') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="deleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('labels.confirmDelete') }}</h3>
        <p class="text-gray-600 mb-6">{{ $t('messages.confirmDeleteItem') || 'Confirm delete?' }}</p>
        <div class="flex gap-3">
          <button @click="deleteModalOpen = false" class="flex-1 px-4 py-2 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="deleteDriver" :disabled="deleting" class="flex-1 px-4 py-2 bg-red-600 text-white rounded">{{ deleting ? $t('labels.deleting') : $t('labels.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/shared/Pagination.vue'
import { getDrivers, createDriver, updateDriver, deleteDriver as apiDeleteDriver } from '@/api'

export default {
  name: 'DriversList',
  components: { Pagination },
  data() {
    return {
      drivers: [],
      loading: false,
      q: '',
      page: 1,
      pageSize: 20,
      total: 0,
      modalOpen: false,
      editing: false,
      form: { id: null, name: '', phone: '', nationalId: '' },
      saving: false,
      deleteModalOpen: false,
      driverToDelete: null,
      deleting: false
    }
  },
  computed: {
    isRTL() { return this.$i18n?.locale === 'ar' },
    totalPages() { return Math.ceil(this.total / this.pageSize) }
  },
  watch: {
    q() { this.page = 1; this.loadDrivers() }
  },
  mounted() {
    this.loadDrivers()
  },
  methods: {
    async loadDrivers() {
      this.loading = true
      try {
        const res = await getDrivers({ page: this.page, pageSize: this.pageSize, q: this.q })
        const payload = res.data || {}
        this.drivers = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []))
        const meta = payload.meta || {}
        this.total = meta.total ?? payload.total ?? this.drivers.length
      } catch (e) {
        console.error('Error loading drivers', e)
        this.drivers = []
        this.total = 0
      } finally { this.loading = false }
    },
    onSearchInput() {},
    changePage(newPage) { this.page = newPage; this.loadDrivers() },
    onPageSizeChange(newSize) { this.pageSize = newSize; this.page = 1; this.loadDrivers() },
    openAdd() { this.editing = false; this.form = { id: null, name: '', phone: '', nationalId: '' }; this.modalOpen = true },
    openEdit(d) { this.editing = true; this.form = { id: d.id, name: d.name || '', phone: d.phone || '', nationalId: d.nationalId || '' }; this.modalOpen = true },
    closeModal() { this.modalOpen = false; this.editing = false; this.form = { id: null, name: '', phone: '', nationalId: '' } },
    async saveDriver() {
      this.saving = true
      try {
        const payload = { name: this.form.name, phone: this.form.phone, nationalId: this.form.nationalId }
        if (this.editing && this.form.id) {
          await updateDriver(this.form.id, payload)
        } else {
          await createDriver(payload)
        }
        if (window.$toast) window.$toast(this.$t('common.success') || 'Saved', 'success')
        this.closeModal()
        this.loadDrivers()
      } catch (e) {
        console.error('Error saving driver', e)
        if (window.$toast) window.$toast(this.$t('common.saveError') || 'Save failed', 'error')
      } finally { this.saving = false }
    },
    confirmDelete(d) { this.driverToDelete = d; this.deleteModalOpen = true },
    async deleteDriver() {
      if (!this.driverToDelete) return
      this.deleting = true
      try {
        await apiDeleteDriver(this.driverToDelete.id)
        if (window.$toast) window.$toast(this.$t('common.success') || 'Deleted', 'success')
        this.deleteModalOpen = false
        this.driverToDelete = null
        this.loadDrivers()
      } catch (e) {
        console.error('Error deleting driver', e)
        if (window.$toast) window.$toast(this.$t('common.deleteError') || 'Delete failed', 'error')
      } finally { this.deleting = false }
    }
  }
}
</script>

<style scoped>
.direction-rtl { direction: rtl; }
</style>
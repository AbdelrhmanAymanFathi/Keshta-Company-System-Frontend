<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-3 sm:p-6 space-y-6">
    <div class="app-page-header flex items-center justify-between rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-3 sm:p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold text-gray-900">{{ $t('dashboard.driversList') || 'Drivers' }}</h2>
      <button @click="openAdd" class="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-sky-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-200 text-xs sm:text-sm">
        <PlusIcon class="w-5 h-5" />
        {{ $t('labels.add') || 'Add' }}
      </button>
    </div>

    <div class="max-w-md">
      <input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('placeholders.search') || 'Search...'" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-if="!loading" class="hidden sm:block bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-200/80 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-slate-50 to-indigo-50">
            <tr>
              <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">#</th>
              <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('drivers.name') || 'Name' }}</th>
              <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('drivers.phone') || 'Phone' }}</th>
              <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('drivers.nationalId') || 'National ID' }}</th>
              <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-start">{{ $t('labels.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(d, idx) in drivers" :key="d.id" class="hover:bg-indigo-50/40">
              <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-indigo-800 text-start">{{ (page - 1) * pageSize + idx + 1 }}</td>
              <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900">{{ d.name || '-' }}</td>
              <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900">{{ d.phone || '-' }}</td>
              <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900">{{ d.nationalId || '-' }}</td>
              <td class="px-3 py-2 sm:px-6 sm:py-4">
                <div class="flex gap-3 justify-end">
                  <button @click.stop="openEdit(d)" class="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100" title="Edit">
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button @click.stop="confirmDelete(d)" class="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100" title="Delete">
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="drivers.length === 0">
              <td colspan="5" class="px-3 py-2 text-start text-gray-500">{{ $t('labels.noData') || 'No drivers found' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div v-if="!loading" class="sm:hidden space-y-4">
      <div v-for="d in drivers" :key="d.id" class="bg-white rounded-2xl shadow-lg shadow-slate-200/30 border border-slate-200/80 p-3 sm:p-4">
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
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm p-4" style="margin-top: 0 !important;">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">{{ editing ? $t('labels.update') : $t('labels.add') }} {{ $t('drivers.singular') || 'Driver' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600"><XMarkIcon class="w-5 h-5" /></button>
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
    <div v-if="deleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-4 sm:p-6">
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
import { PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'DriversList',
  components: { Pagination, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon },
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

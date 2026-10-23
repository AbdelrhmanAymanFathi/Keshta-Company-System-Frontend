<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <div class="app-page-header flex items-center justify-between rounded-2xl theme-page-header-bar p-3 sm:p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold theme-text-primary">{{ $t('dashboard.driversList') || 'Drivers' }}</h2>
      <button @click="openAdd" class="theme-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 shadow-sm  text-xs sm:text-sm">
        <PlusIcon class="w-5 h-5" />
        {{ $t('labels.add') || 'Add' }}
      </button>
    </div>

    <div class="max-w-md">
      <input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('placeholders.search') || 'Search...'" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
    </div>

    <div v-if="!loading" class="app-table-card">
      <table v-app-table class="app-table divide-y divide-gray-200">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap text-start">#</th>
            <th data-col="title" class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap text-start">{{ $t('drivers.name') || 'Name' }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap text-start">{{ $t('drivers.phone') || 'Phone' }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap text-start">{{ $t('drivers.nationalId') || 'National ID' }}</th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap text-start">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(d, idx) in drivers" :key="d.id" class="theme-table-row-hover">
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm theme-accent-muted text-start">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm theme-text-primary">{{ d.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm theme-text-primary">{{ d.phone || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm theme-text-primary">{{ d.nationalId || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4">
              <RowActions :actions="rowActions(d)" />
            </td>
          </tr>
          <tr v-if="drivers.length === 0">
            <td colspan="5" class="px-3 py-2 text-start theme-text-muted">{{ $t('labels.noData') || 'No drivers found' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-if="totalPages > 1" :current-page="page" :page-size="pageSize" :total="total" :total-pages="totalPages" @update:page="changePage" @update:pageSize="onPageSizeChange" />

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm p-4" style="margin-top: 0 !important;">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">{{ editing ? $t('labels.update') : $t('labels.add') }} {{ $t('drivers.singular') || 'Driver' }}</h3>
          <button @click="closeModal" class="theme-caption hover:theme-text-secondary"><XMarkIcon class="w-5 h-5" /></button>
        </div>
        <form @submit.prevent="saveDriver" class="space-y-4">
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('drivers.name') || 'Name' }}</label>
            <input v-model="form.name" type="text" required class="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('drivers.phone') || 'Phone' }}</label>
            <input v-model="form.phone" type="tel" class="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('drivers.nationalId') || 'National ID' }}</label>
            <input v-model="form.nationalId" type="text" class="w-full px-3 py-2 border rounded" />
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border rounded theme-text-secondary hover:bg-gray-50">{{ $t('labels.cancel') }}</button>
            <button type="submit" :disabled="saving" class="flex-1 px-4 py-2 theme-button rounded">{{ saving ? $t('labels.saving') : $t('labels.save') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="deleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-4 sm:p-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('labels.confirmDelete') }}</h3>
        <p class="theme-text-secondary mb-6">{{ $t('messages.confirmDeleteItem') || 'Confirm delete?' }}</p>
        <div class="flex gap-3">
          <button @click="deleteModalOpen = false" class="flex-1 px-4 py-2 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="deleteDriver" :disabled="deleting" class="flex-1 px-4 py-2 bg-red-600 theme-text-light rounded">{{ deleting ? $t('labels.deleting') : $t('labels.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/shared/Pagination.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { getDrivers, createDriver, updateDriver, deleteDriver as apiDeleteDriver } from '@/api'
import { PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'DriversList',
  components: { Pagination, RowActions, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon },
  setup() {
    const q = ref('')

    const { items: drivers, page, pageSize, total, totalPages, loading, load, setPage, setPageSize } = usePagination(
      (p, ps, extra) => getDrivers({ page: p, pageSize: ps, q: extra.q ?? q.value }),
      { initialPageSize: 20, resourceName: 'drivers' }
    )

    const loadDrivers = () => load({ q: q.value })

    watch(q, () => { setPage(1); loadDrivers() })

    return { q, drivers, page, pageSize, total, totalPages, loading, loadDrivers, setPage, setPageSize }
  },
  data() {
    return {
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
    isRTL() { return this.$i18n?.locale === 'ar' }
  },
  mounted() {
    this.loadDrivers()
  },
  methods: {
    onSearchInput() {},
    changePage(newPage) { this.setPage(newPage); this.loadDrivers() },
    onPageSizeChange(newSize) { this.setPageSize(newSize); this.loadDrivers() },
    rowActions(d) {
      return [
        { key: 'edit', icon: PencilSquareIcon, label: this.$t('labels.edit'), tone: 'edit', onClick: () => this.openEdit(d) },
        { key: 'delete', icon: TrashIcon, label: this.$t('labels.delete'), tone: 'delete', onClick: () => this.confirmDelete(d) },
      ]
    },
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

<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <PageHeader :title="$t('dashboard.driversList') || 'Drivers'">
      <Button class="gap-2" @click="openAdd">
        <PlusIcon class="w-5 h-5" />
        {{ $t('labels.add') || 'Add' }}
      </Button>
    </PageHeader>

    <div class="max-w-md">
      <Input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('placeholders.search') || 'Search...'" class="w-full" />
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
    <Modal
      :visible="modalOpen"
      :title="(editing ? $t('labels.update') : $t('labels.add')) + ' ' + ($t('drivers.singular') || 'Driver')"
      size="sm"
      @update:visible="modalOpen = $event"
    >
      <form @submit.prevent="saveDriver" class="space-y-4">
        <div>
          <Label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('drivers.name') || 'Name' }}</Label>
          <Input v-model="form.name" type="text" required class="w-full" />
        </div>
        <div>
          <Label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('drivers.phone') || 'Phone' }}</Label>
          <Input v-model="form.phone" type="tel" class="w-full" />
        </div>
        <div>
          <Label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('drivers.nationalId') || 'National ID' }}</Label>
          <Input v-model="form.nationalId" type="text" class="w-full" />
        </div>
      </form>
      <template #footer>
        <Button type="button" variant="outline" @click="closeModal">{{ $t('labels.cancel') }}</Button>
        <Button type="button" :disabled="saving" @click="saveDriver">{{ saving ? $t('labels.saving') : $t('labels.save') }}</Button>
      </template>
    </Modal>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="deleteModalOpen"
      :title="$t('labels.confirmDelete')"
      :message="$t('messages.confirmDeleteItem') || 'Confirm delete?'"
      :loading="deleting"
      type="danger"
      @confirm="deleteDriver"
      @cancel="deleteModalOpen = false"
    />
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { usePagination } from '@/composables/usePagination'
import PageHeader from '@/components/shared/PageHeader.vue'
import Pagination from '@/components/shared/Pagination.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Modal from '@/components/shared/Modal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { getDrivers, createDriver, updateDriver, deleteDriver as apiDeleteDriver } from '@/api'
import { PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'DriversList',
  components: {
    Modal,
    ConfirmDialog,
    PageHeader, Label, Pagination, RowActions, Button, Input, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon },
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

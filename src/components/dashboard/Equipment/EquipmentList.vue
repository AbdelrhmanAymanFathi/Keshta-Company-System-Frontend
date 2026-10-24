<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <PageHeader :title="$t('equipment.title') || 'Equipment'">
      <Button class="gap-2" @click="openCreateModal">
        <PlusIcon class="w-5 h-5" />
        {{ $t('equipment.add') || 'Add Equipment' }}
      </Button>
    </PageHeader>

    <Card class="shadcn-ui max-w-md border-border/80 bg-card shadow-lg">
      <CardContent class="flex items-center gap-2 p-3">
        <Input
          v-model="q"
          type="search"
          :placeholder="$t('equipment.searchPlaceholder')"
          class="w-full"
          @keyup.enter="search"
        />
        <Button variant="outline" @click="clearSearch">
          {{ $t('labels.clear') || 'Clear' }}
        </Button>
      </CardContent>
    </Card>

    <div class="app-table-card">
      <table v-app-table :dir="isRTL ? 'rtl' : 'ltr'" class="app-table w-full table-auto text-sm">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th data-col="title" class="px-3 py-2 text-xs font-medium theme-text-muted uppercase tracking-wider text-start whitespace-normal">{{ $t('equipment.name') || 'Name' }}</th>
            <th class="px-3 py-2 text-xs font-medium theme-text-muted uppercase tracking-wider text-start whitespace-normal">{{ $t('labels.contractor') || 'Contractor' }}</th>
            <th class="px-3 py-2 text-xs font-medium theme-text-muted uppercase tracking-wider text-start whitespace-normal">{{ $t('rental.isCompanyOwned') || 'Company Owned' }}</th>
            <th data-col="amount" class="px-3 py-2 text-xs font-medium theme-text-muted uppercase tracking-wider text-start whitespace-normal">{{ $t('rental.hourlyRate') || 'Hourly Rate' }}</th>
            <th class="px-3 py-2 text-xs font-medium theme-text-muted uppercase tracking-wider text-start whitespace-normal">{{ $t('labels.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in equipments" :key="e.id" class="border-t theme-table-row-hover" @contextmenu.prevent="openContextMenu($event, e)">
            <td class="px-3 py-3 font-medium theme-text-primary text-start">{{ e.name }}</td>
            <td class="px-3 py-3 theme-text-secondary text-start">{{ e.contractor?.name || '—' }}</td>
            <td class="px-3 py-3 theme-text-secondary text-start">
              <span
                :title="e.isCompanyOwned ? ($t('labels.yes') || 'Yes') : ($t('labels.no') || 'No')"
                class="inline-flex items-center"
              >
                <span :class="['w-3 h-3 rounded-full', e.isCompanyOwned ? 'bg-green-500' : 'bg-red-500']" aria-hidden="true"></span>
                <span class="sr-only">{{ e.isCompanyOwned ? ($t('labels.yes') || 'Yes') : ($t('labels.no') || 'No') }}</span>
              </span>
            </td>
            <td class="px-3 py-3 theme-text-secondary text-start">{{ e.hourlyRate != null ? e.hourlyRate : '—' }}</td>
            <td class="px-3 py-3">
              <RowActions :actions="rowActions(e)" />
            </td>
          </tr>
          <tr v-if="equipments.length === 0">
            <td class="px-3 py-2 text-start theme-text-muted" colspan="5">{{ $t('equipment.noResults') || 'No equipment found' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-if="totalPages > 1" :current-page="page" :page-size="pageSize" :total="total" :total-pages="totalPages" @update:page="page = $event; loadEquipments()" @update:pageSize="pageSize = $event; page = 1; loadEquipments()" />

    <!-- Create/Edit Modal -->
    <Modal
      :visible="showCreateModal || !!editingEquipment"
      :title="editingEquipment ? $t('equipment.edit') : $t('equipment.add')"
      size="sm"
      @update:visible="val => { if(!val) closeModals() }"
    >
      <form @submit.prevent="onSave" class="space-y-4">
        <div>
          <Label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('equipment.name') || 'Name' }}</Label>
          <Input v-model="form.name" type="text" class="w-full" required />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="isCompanyOwned" v-model="form.isCompanyOwned" />
          <Label for="isCompanyOwned">{{ $t('rental.isCompanyOwned') }}</Label>
        </div>
        <div v-if="!form.isCompanyOwned">
          <Label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('labels.contractor') || 'Contractor' }}</Label>
          <SearchDropdown
            v-model="form.contractorLabel"
            :items="contractors"
            :item-key="'id'"
            :item-label="'name'"
            :placeholder="$t('labels.contractor') || 'Search contractors'"
            :dir="isRTL ? 'rtl' : 'ltr'"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="onSelectContractor"
          />
        </div>
        <div>
          <Label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('rental.hourlyRate') || 'Hourly Rate' }}</Label>
          <Input v-model.number="form.hourlyRate" type="number" min="0" step="0.01" class="w-full" />
        </div>
      </form>
      <template #footer>
        <Button type="button" variant="outline" @click="closeModals">{{ $t('labels.cancel') || 'Cancel' }}</Button>
        <Button type="button" :disabled="saving" @click="onSave">{{ saving ? $t('labels.saving') : $t('labels.save') }}</Button>
      </template>
    </Modal>

    <!-- Delete Confirm -->
    <ConfirmDialog :show="showDeleteConfirm" :title="$t('labels.confirmDelete')" :message="deleteMessage" type="danger" @confirm="confirmDelete" @cancel="cancelDelete" />

    <!-- Row context menu -->
    <div v-if="contextMenu.visible" class="fixed inset-0 z-40" @click="contextMenu.visible = false"></div>
    <div
      v-if="contextMenu.visible"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[160px]"
      @click.stop
      @contextmenu.prevent
    >
      <ShadcnButton variant="outline" size="native"
        type="button"
        class="w-full px-4 py-2 text-sm theme-text-primary hover:theme-dashboard-bg-soft flex items-center gap-2 transition-colors duration-200"
        :class="isRTL ? 'flex-row-reverse text-right' : 'text-left'"
        @click="onContextEdit"
      >
        <PencilIcon class="w-4 h-4 shrink-0 theme-text-secondary" />
        {{ $t('labels.edit') }}
      </ShadcnButton>
      <ShadcnButton variant="outline" size="native"
        type="button"
        class="w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors duration-200"
        :class="isRTL ? 'flex-row-reverse text-right' : 'text-left'"
        @click="onContextDelete"
      >
        <TrashIcon class="w-4 h-4 shrink-0 text-rose-500" />
        {{ $t('labels.delete') }}
      </ShadcnButton>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { usePagination } from '@/composables/usePagination'
import { getEquipments, createEquipment, updateEquipment, deleteEquipment, getContractors } from '../../../api'
import { isPendingApproval, pendingApprovalToast } from '../../../utils/approval'
import Pagination from '../../shared/Pagination.vue'
import ConfirmDialog from '../../shared/ConfirmDialog.vue'
import SearchDropdown from '../../shared/SearchDropdown.vue'
import Modal from '@/components/shared/Modal.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PencilIcon, PlusIcon, TrashIcon } from '@acme/icon-packs/legacy'
import RowActions from '@/components/shared/RowActions.vue'

export default {
  name: 'EquipmentList',
  components: { Card, CardContent, ConfirmDialog, Modal, PageHeader, Pagination, Button, Input, Label, Checkbox, PencilIcon, PlusIcon, RowActions, SearchDropdown, TrashIcon },
  setup() {
    const q = ref('')

    const { items: equipments, page, pageSize, total, totalPages, load, setPage, setPageSize } = usePagination(
      (p, ps, extra) => getEquipments({ page: p, pageSize: ps, q: extra.q ?? q.value }),
      { initialPageSize: 20, resourceName: 'equipments' }
    )

    const loadEquipments = async () => {
      try { await load({ q: q.value }) } catch (e) { console.error('Error loading equipments', e) }
    }

    return { q, equipments, page, pageSize, total, totalPages, loadEquipments, setPage, setPageSize }
  },
  data() {
    return {
      contractors: [],
      showCreateModal: false,
      editingEquipment: null,
      form: { name: '', contractorId: '', contractorLabel: '', isCompanyOwned: false, hourlyRate: null },
      saving: false,
      deleteTarget: null,
      showDeleteConfirm: false,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        equipment: null
      }
    }
  },
  computed: {
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' },
    deleteMessage() {
      if (this.deleteTarget && this.deleteTarget.name) {
        return `${this.$t('labels.confirmDelete')} "${this.deleteTarget.name}"?`
      }
      return this.$t('equipment.deleteConfirm') || this.$t('labels.confirmDelete') || 'Are you sure?'
    }
  },
  watch: {
    'form.isCompanyOwned'(val) {
      if (!val) {
        this.form.contractorId = ''
        this.form.contractorLabel = ''
      }
    },
    'form.contractorLabel'(val) {
      if (!val) this.form.contractorId = ''
    }
  },
  methods: {
    async loadContractors() {
      try {
        const res = await getContractors({ pageSize: 1000, mode: 'rentals' })
        const payload = res.data || {}
        this.contractors = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []))
      } catch (e) { this.contractors = [] }
    },
    onSelectContractor(item) {
      this.form.contractorId = item?.id ?? ''
      this.form.contractorLabel = item ? (item.name || '') : ''
    },
    search() { this.setPage(1); this.loadEquipments() },
    clearSearch() { this.q = ''; this.search() },
    openCreateModal() { this.resetForm(); this.showCreateModal = true },
    openContextMenu(event, equipment) {
      this.contextMenu.x = event.clientX
      this.contextMenu.y = event.clientY
      this.contextMenu.equipment = equipment
      this.contextMenu.visible = true
    },
    onContextEdit() {
      const row = this.contextMenu.equipment
      this.contextMenu.visible = false
      if (row) this.openEditModal(row)
    },
    onContextDelete() {
      const row = this.contextMenu.equipment
      this.contextMenu.visible = false
      if (row) this.openDeleteConfirm(row)
    },
    rowActions(e) {
      return [
        { key: 'edit', icon: PencilIcon, label: this.$t('labels.edit') || 'Edit', tone: 'edit', onClick: () => this.openEditModal(e) },
        { key: 'delete', icon: TrashIcon, label: this.$t('labels.delete') || 'Delete', tone: 'delete', onClick: () => this.openDeleteConfirm(e) },
      ]
    },
    openEditModal(e) {
      this.editingEquipment = e
      this.form = {
        name: e.name || '',
        contractorId: e.isCompanyOwned ? '' : (e.contractor ? e.contractor.id : (e.contractorId || '')),
        contractorLabel: e.isCompanyOwned ? '' : (e.contractor ? e.contractor.name || '' : ''),
        isCompanyOwned: !!e.isCompanyOwned,
        hourlyRate: e.hourlyRate ?? null
      }
    },
    closeModals() { this.showCreateModal = false; this.editingEquipment = null; this.resetForm() },
    resetForm() { this.form = { name: '', contractorId: '', isCompanyOwned: false, hourlyRate: null } },
    async onSave() {
      if (!this.form.name) return
      this.saving = true
      try {
        const payload = { name: this.form.name, isCompanyOwned: !!this.form.isCompanyOwned }
        if (!payload.isCompanyOwned && this.form.contractorId) payload.contractorId = this.form.contractorId
        if (this.form.hourlyRate !== null && this.form.hourlyRate !== '') payload.hourlyRate = Number(this.form.hourlyRate)

        if (this.editingEquipment) {
          const res = await updateEquipment(this.editingEquipment.id, payload)
          if (isPendingApproval(res)) {
            if (window.$toast) window.$toast(pendingApprovalToast(this.$i18n?.locale?.startsWith('ar')), 'info')
          } else if (window.$toast) {
            window.$toast(this.$t('equipment.updateSuccess') || 'Equipment updated', 'success')
          }
        } else {
          await createEquipment(payload)
          if (window.$toast) window.$toast(this.$t('equipment.createSuccess') || 'Equipment created', 'success')
        }
        await this.loadEquipments()
        this.closeModals()
      } catch (e) {
        console.error('Error saving equipment', e)
        if (window.$toast) window.$toast(this.extractErrorMessage(e), 'error', 5000)
      } finally { this.saving = false }
    },
    openDeleteConfirm(e) { this.deleteTarget = e; this.showDeleteConfirm = true },
    cancelDelete() { this.deleteTarget = null; this.showDeleteConfirm = false },
    async confirmDelete() {
      if (!this.deleteTarget) return
      try {
        const res = await deleteEquipment(this.deleteTarget.id)
        if (isPendingApproval(res)) {
          if (window.$toast) window.$toast(pendingApprovalToast(this.$i18n?.locale?.startsWith('ar')), 'info')
        } else if (window.$toast) {
          window.$toast(this.$t('equipment.deleteSuccess') || 'Deleted', 'success')
        }
        await this.loadEquipments()
      } catch (e) {
        if (window.$toast) window.$toast(this.extractErrorMessage(e), 'error', 5000)
      } finally { this.cancelDelete() }
    },
    extractErrorMessage(error) {
      if (error.response?.data?.message) return error.response.data.message
      if (error.response?.data?.error) return error.response.data.error
      if (error.message) return error.message
      return this.$t('errors.unknown') || 'An error occurred'
    }
  },
  async mounted() {
    this.closeContextMenuHandler = () => {
      this.contextMenu.visible = false
    }
    document.addEventListener('click', this.closeContextMenuHandler)
    await Promise.all([this.loadEquipments(), this.loadContractors()])
  },
  beforeUnmount() {
    if (this.closeContextMenuHandler) {
      document.removeEventListener('click', this.closeContextMenuHandler)
    }
  }
}
</script>

<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6">
    <h2 class="text-2xl font-semibold mb-4 text-gray-800">{{ $t('equipment.title') || 'Equipment' }}</h2>

    <div class="flex items-center justify-between">
      <div class="flex gap-2 items-center">
        <input v-model="q" @keyup.enter="search" type="search" :placeholder="$t('equipment.searchPlaceholder')" class="border rounded px-3 py-2 text-sm" />
        <button @click="clearSearch" class="px-3 py-2 rounded border">{{ $t('labels.clear') || 'Clear' }}</button>
      </div>
      <div>
        <button @click="openCreateModal" class="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">{{ $t('equipment.add') || 'Add Equipment' }}</button>
      </div>
    </div>

    <div class="overflow-x-auto bg-white rounded border">
      <table :dir="isRTL ? 'rtl' : 'ltr'" class="min-w-full w-full table-fixed text-sm">
        <thead class="bg-indigo-50">
          <tr>
            <th class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('equipment.name') || 'Name' }}</th>
            <th class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('labels.contractor') || 'Contractor' }}</th>
            <th class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('rental.isCompanyOwned') || 'Company Owned' }}</th>
            <th class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('rental.hourlyRate') || 'Hourly Rate' }}</th>
            <th class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('labels.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in equipments" :key="e.id" class="border-t hover:bg-gray-50" @contextmenu.prevent="openContextMenu($event, e)">
            <td class="px-3 py-3 font-medium text-gray-800 text-start">{{ e.name }}</td>
            <td class="px-3 py-3 text-gray-700 text-start">{{ e.contractor?.name || '—' }}</td>
            <td class="px-3 py-3 text-gray-700 text-start">
              <span
                :title="e.isCompanyOwned ? ($t('labels.yes') || 'Yes') : ($t('labels.no') || 'No')"
                class="inline-flex items-center"
              >
                <span :class="['w-3 h-3 rounded-full', e.isCompanyOwned ? 'bg-green-500' : 'bg-red-500']" aria-hidden="true"></span>
                <span class="sr-only">{{ e.isCompanyOwned ? ($t('labels.yes') || 'Yes') : ($t('labels.no') || 'No') }}</span>
              </span>
            </td>
            <td class="px-3 py-3 text-gray-700 text-start">{{ e.hourlyRate != null ? e.hourlyRate : '—' }}</td>
            <td class="px-3 py-3">
              <div class="flex gap-2 items-center" :class="isRTL ? 'flex-row-reverse' : ''">
                <button
                  type="button"
                  class="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                  :title="$t('labels.edit') || 'Edit'"
                  :aria-label="$t('labels.edit') || 'Edit'"
                  @click.stop="openEditModal(e)"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button
                  type="button"
                  class="p-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  :title="$t('labels.delete') || 'Delete'"
                  :aria-label="$t('labels.delete') || 'Delete'"
                  @click.stop="openDeleteConfirm(e)"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="equipments.length === 0">
            <td class="px-3 py-2 text-start text-gray-500" colspan="5">{{ $t('equipment.noResults') || 'No equipment found' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-if="totalPages > 1" :current-page="page" :page-size="pageSize" :total="total" :total-pages="totalPages" @update:page="page = $event; loadEquipments()" @update:pageSize="pageSize = $event; page = 1; loadEquipments()" />

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingEquipment" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4" style="margin-top: 0 !important;">
      <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md z-50 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ editingEquipment ? $t('equipment.edit') : $t('equipment.add') }}</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="closeModals">✕</button>
        </div>
        <form @submit.prevent="onSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('equipment.name') || 'Name' }}</label>
            <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.isCompanyOwned" />
              <span>{{ $t('rental.isCompanyOwned') }}</span>
            </label>
          </div>
          <div v-if="!form.isCompanyOwned">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('labels.contractor') || 'Contractor' }}</label>
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
          <div class="flex items-center gap-3">
            
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('rental.hourlyRate') || 'Hourly Rate' }}</label>
              <input v-model.number="form.hourlyRate" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" @click="closeModals" class="px-4 py-2 rounded border">{{ $t('labels.cancel') || 'Cancel' }}</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-indigo-600 text-white">{{ saving ? $t('labels.saving') : $t('labels.save') }}</button>
          </div>
        </form>
      </div>
    </div>

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
      <button
        type="button"
        class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2 transition"
        :class="isRTL ? 'flex-row-reverse text-right' : 'text-left'"
        @click="onContextEdit"
      >
        <PencilIcon class="w-4 h-4 shrink-0" />
        {{ $t('labels.edit') }}
      </button>
      <button
        type="button"
        class="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
        :class="isRTL ? 'flex-row-reverse text-right' : 'text-left'"
        @click="onContextDelete"
      >
        <TrashIcon class="w-4 h-4 shrink-0" />
        {{ $t('labels.delete') }}
      </button>
    </div>
  </div>
</template>

<script>
import { getEquipments, createEquipment, updateEquipment, deleteEquipment, getContractors } from '../../../api'
import Pagination from '../../shared/Pagination.vue'
import ConfirmDialog from '../../shared/ConfirmDialog.vue'
import SearchDropdown from '../../shared/SearchDropdown.vue'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'EquipmentList',
  components: { Pagination, ConfirmDialog, SearchDropdown, PencilIcon, TrashIcon },
  data() {
    return {
      equipments: [],
      contractors: [],
      q: '',
      page: 1,
      pageSize: 20,
      total: 0,
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
    totalPages() { return Math.ceil(this.total / this.pageSize) }
    ,
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
    async loadEquipments() {
      try {
        const res = await getEquipments({ page: this.page, pageSize: this.pageSize, q: this.q })
        const payload = res.data || {}
        this.equipments = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []))
        const meta = payload.meta || {}
        this.total = meta.total ?? payload.total ?? this.equipments.length
      } catch (e) {
        console.error('Error loading equipments', e)
        this.equipments = []
        if (window.$toast) window.$toast(this.extractErrorMessage(e), 'error', 5000)
      }
    },
    async loadContractors() {
      try {
        const res = await getContractors({ mode: 'rentals' })
        const payload = res.data || {}
        this.contractors = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []))
      } catch (e) { this.contractors = [] }
    },
    onSelectContractor(item) {
      this.form.contractorId = item?.id ?? ''
      this.form.contractorLabel = item ? (item.name || '') : ''
    },
    search() { this.page = 1; this.loadEquipments() },
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
          await updateEquipment(this.editingEquipment.id, payload)
          if (window.$toast) window.$toast(this.$t('equipment.updateSuccess') || 'Equipment updated', 'success')
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
        await deleteEquipment(this.deleteTarget.id)
        if (window.$toast) window.$toast(this.$t('equipment.deleteSuccess') || 'Deleted', 'success')
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

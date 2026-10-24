<template>
  <div class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <PageHeader :title="$t('units.title') || 'Units of Measure'">
      <Button class="gap-2" @click="openAddModal()">
        <PlusIcon class="h-4 w-4" />
        {{ $t('units.addUnit') || 'Add Unit' }}
      </Button>
    </PageHeader>

    <Card class="shadcn-ui border-border/80 bg-card shadow-md">
      <CardContent class="flex items-center gap-4 p-4">
        <div class="relative max-w-md flex-1">
          <Input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('units.searchPlaceholder') || 'Search units...'"
            :class="['w-full', isRTL ? 'pe-10 ps-4' : 'ps-10 pe-4']"
          />
          <span class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground" :class="isRTL ? 'end-3' : 'start-3'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </CardContent>
    </Card>

    <!-- Table -->
    <div class="app-table-card">
      <table v-app-table class="app-table table-auto">
        <thead class="border-b border-slate-200 theme-table-thead-gradient">
          <tr>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">#</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('units.symbol') || 'Symbol' }}</th>
            <th data-col="title" :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('units.name') || 'Name' }}</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('units.arName') || 'Arabic Name' }}</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('units.description') || 'Description' }}</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(unit, idx) in filteredUnits" :key="unit.id" class="border-b border-slate-200 theme-table-row-hover">
            <td class="px-4 py-3">{{ idx + 1 }}</td>
            <td :class="['px-4 py-3 font-semibold', isRTL ? 'text-right' : 'text-left']">
              <span class="px-2.5 py-1 bg-slate-100 theme-text-secondary rounded-lg text-xs font-mono">
                {{ unit.symbol }}
              </span>
            </td>
            <td :class="['px-4 py-3 font-medium', isRTL ? 'text-right' : 'text-left']">{{ unit.name }}</td>
            <td :class="['px-4 py-3 font-medium', isRTL ? 'text-right' : 'text-left']">{{ unit.arName || '-' }}</td>
            <td :class="['px-4 py-3 text-slate-500', isRTL ? 'text-right' : 'text-left']">{{ unit.description || '-' }}</td>
            <td :class="['px-4 py-3', isRTL ? 'text-right' : 'text-left']">
              <RowActions :actions="rowActions(unit)" />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="loading" class="p-8 text-center theme-text-muted">
        <svg class="animate-spin h-8 w-8 mx-auto text-green-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>{{ $t('labels.loading') || 'Loading...' }}</span>
      </div>
      <div v-else-if="!filteredUnits.length" class="p-8 text-center theme-text-muted">
        {{ $t('units.noResults') || 'No units found' }}
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal
      :visible="showModal"
      :title="editing ? ($t('units.editUnit') || 'Edit Unit') : ($t('units.addUnit') || 'Add Unit')"
      size="sm"
      @update:visible="showModal = $event"
    >
      <div class="space-y-3">
        <div>
          <Label class="block text-sm theme-text-secondary mb-1">{{ $t('units.symbol') }} *</Label>
          <Input v-model="form.symbol" :disabled="editing" class="w-full" placeholder="e.g. kg, m³" />
        </div>
        <div>
          <Label class="block text-sm theme-text-secondary mb-1">{{ $t('units.name') }} *</Label>
          <Input v-model="form.name" class="w-full" placeholder="e.g. Kilogram" />
        </div>
        <div>
          <Label class="block text-sm theme-text-secondary mb-1">{{ $t('units.arName') }}</Label>
          <Input v-model="form.arName" class="w-full" placeholder="e.g. كيلوجرام" />
        </div>
        <div>
          <Label class="block text-sm theme-text-secondary mb-1">{{ $t('units.description') }}</Label>
          <Textarea v-model="form.description" rows="3" class="w-full" placeholder="Optional details..." />
        </div>
      </div>
      <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>
      <template #footer>
        <Button variant="outline" @click="closeModal">{{ $t('labels.cancel') || 'Cancel' }}</Button>
        <Button @click="save" :disabled="saving || !form.symbol.trim() || !form.name.trim()">
          {{ saving ? ($t('labels.saving') || 'Saving...') : ($t('labels.save') || 'Save') }}
        </Button>
      </template>
    </Modal>

    <!-- Delete Confirm Modal -->
    <ConfirmDialog
      :show="deleteConfirmModal.show"
      :title="$t('labels.confirmDelete') || 'Confirm Delete'"
      :message="deleteConfirmModal.message"
      :loading="deleting"
      type="danger"
      @confirm="doDelete(deleteConfirmModal.id)"
      @cancel="closeDeleteConfirm"
    />
  </div>
</template>

<script>
import { getUnits, createUnit, updateUnit, deleteUnit } from '@/api'
import PageHeader from '@/components/shared/PageHeader.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Modal from '@/components/shared/Modal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { PencilIcon, TrashIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'Units-List',
  components: {
    Modal,
    ConfirmDialog,
    Card,
    CardContent,
    PageHeader,
    Label,
    Textarea,
    RowActions,
    Button,
    Input,
    PencilIcon,
    TrashIcon
  },
  data() {
    return {
      units: [],
      loading: false,
      searchQuery: '',
      showModal: false,
      editing: false,
      form: {
        id: null,
        symbol: '',
        name: '',
        arName: '',
        description: ''
      },
      saving: false,
      error: '',
      deleting: false,
      deleteError: '',
      deleteConfirmModal: {
        show: false,
        id: null,
        message: ''
      }
    }
  },
  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    filteredUnits() {
      const query = this.searchQuery.toLowerCase().trim()
      if (!query) return this.units
      return this.units.filter(u => 
        (u.symbol || '').toLowerCase().includes(query) ||
        (u.name || '').toLowerCase().includes(query) ||
        (u.arName || '').toLowerCase().includes(query) ||
        (u.description || '').toLowerCase().includes(query)
      )
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await getUnits()
        this.units = res?.data || []
      } catch (err) {
        console.error('Failed to load units', err)
      } finally {
        this.loading = false
      }
    },
    openAddModal() {
      this.editing = false
      this.form = { id: null, symbol: '', name: '', arName: '', description: '' }
      this.error = ''
      this.showModal = true
    },
    rowActions(unit) {
      return [
        { key: 'edit', icon: PencilIcon, label: this.$t('labels.edit'), tone: 'edit', onClick: () => this.openEditModal(unit) },
        { key: 'delete', icon: TrashIcon, label: this.$t('labels.delete'), tone: 'delete', onClick: () => this.confirmDelete(unit) },
      ]
    },
    openEditModal(unit) {
      this.editing = true
      this.form = {
        id: unit.id,
        symbol: unit.symbol,
        name: unit.name,
        arName: unit.arName || '',
        description: unit.description || ''
      }
      this.error = ''
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    async save() {
      this.saving = true
      this.error = ''
      try {
        const payload = {
          symbol: this.form.symbol.trim(),
          name: this.form.name.trim(),
          arName: this.form.arName.trim() || null,
          description: this.form.description.trim() || null
        }
        if (this.editing && this.form.id) {
          await updateUnit(this.form.id, payload)
        } else {
          await createUnit(payload)
        }
        await this.load()
        this.closeModal()
      } catch (err) {
        console.error('Save unit failed', err)
        this.error = err?.response?.data?.message || err.message || this.$t('units.saveError')
      } finally {
        this.saving = false
      }
    },
    confirmDelete(unit) {
      this.deleteError = ''
      this.deleteConfirmModal = {
        show: true,
        id: unit.id,
        message: `${this.$t('units.confirmDelete') || 'Are you sure you want to delete this unit?'} (${unit.symbol})`
      }
    },
    closeDeleteConfirm() {
      this.deleteConfirmModal.show = false
    },
    async doDelete(id) {
      this.deleting = true
      this.deleteError = ''
      try {
        await deleteUnit(id)
        await this.load()
        this.closeDeleteConfirm()
      } catch (err) {
        console.error('Delete unit failed', err)
        if (err?.response?.status === 409 || err?.response?.data?.message?.includes('used')) {
          this.deleteError = this.$t('units.usedByItemsError') || 'Cannot delete unit. It is used by items.'
        } else {
          this.deleteError = err?.response?.data?.message || err.message || this.$t('units.deleteError')
        }
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style scoped>
</style>

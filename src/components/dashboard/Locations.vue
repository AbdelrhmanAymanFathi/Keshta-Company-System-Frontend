<template>
  <div class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <PageHeader :title="$t('locations.title') || 'Locations'">
      <Button class="gap-2" @click="openAddSite()">
        <PlusIcon class="h-4 w-4" />
        {{ $t('locations.addLocation') || 'Add Location' }}
      </Button>
    </PageHeader>

    <div class="app-table-card">
      <table v-app-table class="app-table table-auto">
        <thead class="border-b border-slate-200 theme-table-thead-gradient">
          <tr>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">#</th>
            <th data-col="title" :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('locations.locationName') || 'Name' }}</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.type') || 'Type' }}</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(loc, idx) in sites" :key="loc.id">
            <tr class="border-b border-slate-200 theme-table-row-hover">
              <td class="px-4 py-3">{{ idx + 1 }}</td>
              <td :class="['px-4 py-3 font-medium', isRTL ? 'text-right' : 'text-left']">{{ loc.name }}</td>
              <td class="px-4 py-3">{{ $t('locations.site') || 'Site' }}</td>
              <td :class="['px-4 py-3', isRTL ? 'text-right' : 'text-left']">
                <RowActions :actions="rowActions(loc)" size="sm" />
              </td>
            </tr>

            <tr v-for="child in loc.children" :key="child.id" class="location-area-row border-b border-slate-200 theme-table-row-hover">
              <td class="px-4 py-2">&nbsp;</td>
              <td :class="['px-4 py-2 ps-8', isRTL ? 'text-right' : 'text-left']">— {{ child.name }}</td>
              <td class="px-4 py-2">{{ $t('locations.area') || 'Area' }}</td>
              <td :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">
                <RowActions :actions="rowActions(child, loc)" size="sm" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <div v-if="!sites.length" class="p-6 text-center theme-text-muted">{{ $t('locations.noData') || 'No locations yet' }}</div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal
      :visible="showModal"
      :title="editing ? (form.parentId ? ($t('locations.editArea') || 'Edit Area') : ($t('locations.editLocation') || 'Edit Location')) : (form.parentId ? ($t('locations.addArea') || 'Add Area') : ($t('locations.addLocation') || 'Add Location'))"
      size="sm"
      @update:visible="showModal = $event"
    >
      <div>
        <Label class="block text-sm theme-text-secondary mb-1">{{ $t(form.parentId ? 'locations.areaName' : 'locations.locationName') || (form.parentId ? 'Area' : 'Name') }}</Label>
        <Input v-model="form.name" class="w-full" />
      </div>
      <p v-if="error" class="text-red-600 mt-3 text-sm">{{ error }}</p>
      <template #footer>
        <Button variant="outline" @click="closeModal">{{ $t('labels.cancel') || 'Cancel' }}</Button>
        <Button @click="save()" :disabled="saving || !form.name.trim()">{{ saving ? ($t('labels.saving')||'Saving') : ($t('labels.save')||'Save') }}</Button>
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
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/api'
import PageHeader from '@/components/shared/PageHeader.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Modal from '@/components/shared/Modal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { PencilIcon, TrashIcon, PlusIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'Location-List',
  components: {
    Modal,
    ConfirmDialog,
    Label,
    PageHeader,
    RowActions,
    Button,
    Input,
    PlusIcon
  },
  computed: {
    isRTL() { return this.$i18n?.locale === 'ar' }
  },
  data() {
    return {
      sites: [],
      loading: false,
      showModal: false,
      editing: false,
      form: {
        id: null,
        name: '',
        parentId: null
      },
      saving: false,
      error: '',
      deleting: false,
      deleteConfirmModal: {
        show: false,
        id: null,
        message: ''
      }
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await getLocations()
        const data = res?.data || []
        // group sites (parentId == null) and ensure children array
        this.sites = data.filter(l => !l.parentId).map(s => ({ ...s, children: s.children || [] }))
      } catch (err) {
        console.error('Failed to load locations', err)
      } finally {
        this.loading = false
      }
    },

    openAddSite() {
      this.editing = false
      this.form = { id: null, name: '', parentId: null }
      this.error = ''
      this.showModal = true
    },

    rowActions(loc, parent = null) {
      const actions = []
      if (!parent) {
        actions.push({ key: 'addArea', icon: PlusIcon, label: this.$t('locations.addArea') || 'Add Area', tone: 'default', onClick: () => this.openAddArea(loc) })
      }
      actions.push({ key: 'edit', icon: PencilIcon, label: this.$t('labels.edit'), tone: 'edit', onClick: () => (parent ? this.openEdit(loc, parent) : this.openEdit(loc)) })
      actions.push({ key: 'delete', icon: TrashIcon, label: this.$t('labels.delete'), tone: 'delete', onClick: () => this.confirmDelete(loc) })
      return actions
    },
    openAddArea(site) {
      this.editing = false
      this.form = { id: null, name: '', parentId: site.id }
      this.error = ''
      this.showModal = true
    },

    openEdit(loc, parent = null) {
      this.editing = true
      this.form = { id: loc.id, name: loc.name, parentId: loc.parentId || (parent ? parent.id : null) }
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
        if (this.editing && this.form.id) {
          const { data } = await updateLocation(this.form.id, { name: this.form.name, parentId: this.form.parentId })
          if (!data || data.id !== this.form.id) {
            throw new Error('Update failed: invalid response from server')
          }
          // refresh
          await this.load()
        } else {
          const payload = { name: this.form.name, parentId: this.form.parentId }
          await createLocation(payload)
          await this.load()
        }
        this.closeModal()
      } catch (err) {
        console.error('Save location failed', err)
        this.error = err?.response?.data?.message || err.message || 'Error'
      } finally {
        this.saving = false
      }
    },

    confirmDelete(loc) {
      this.deleteConfirmModal = {
        show: true,
        id: loc.id,
        message: loc.parentId 
          ? (this.$t('locations.deleteConfirmArea') || 'Are you sure you want to delete this area?')
          : (this.$t('locations.deleteConfirmLocation') || 'Are you sure you want to delete this location? All its areas will be removed.')
      }
    },

    closeDeleteConfirm() {
      this.deleteConfirmModal = {
        show: false,
        id: null,
        message: ''
      }
    },

    async doDelete(id) {
      this.deleting = true
      try {
        await deleteLocation(id)
        await this.load()
        this.closeDeleteConfirm()
      } catch (err) {
        console.error('Delete failed', err)
        void(window.$toast ? window.$toast(err?.response?.data?.message || err.message || 'Failed to delete', 'error') : alert(err?.response?.data?.message || err.message || 'Failed to delete'))
      } finally {
        this.deleting = false
      }
    }
  }
}

</script>

<style scoped>
.ps-8 { padding-inline-start: 2rem; }
</style>

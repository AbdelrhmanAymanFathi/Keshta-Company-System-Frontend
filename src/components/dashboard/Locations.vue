<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">{{ $t('locations.title') || 'Locations' }}</h2>
      <div class="flex items-center gap-3">
        <button @click="openAddSite()" class="px-4 py-2 bg-indigo-600 text-white rounded-md">+ {{ $t('locations.addLocation') || 'Add Location' }}</button>
      </div>
    </div>

    <div class="bg-white shadow rounded-md overflow-hidden">
      <table class="w-full table-auto">
        <thead class="bg-indigo-50 border-b">
          <tr>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">#</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('locations.locationName') || 'Name' }}</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.type') || 'Type' }}</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(loc, idx) in sites" :key="loc.id">
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3">{{ idx + 1 }}</td>
              <td :class="['px-4 py-3 font-medium', isRTL ? 'text-right' : 'text-left']">{{ loc.name }}</td>
              <td class="px-4 py-3">{{ $t('locations.site') || 'Site' }}</td>
              <td :class="['px-4 py-3', isRTL ? 'text-right' : 'text-left']">
                <button @click="openAddArea(loc)" :class="['text-green-600 hover:text-green-700 transition', isRTL ? 'ml-3' : 'mr-3']" :title="$t('locations.addArea')">{{ $t('locations.addArea') || 'Add Area' }}</button>
                <button @click="openEdit(loc)" :class="['text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1', isRTL ? 'ml-3' : 'mr-3']" :title="$t('labels.edit')">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(loc)" class="text-red-600 hover:text-red-700 transition inline-flex items-center gap-1" :title="$t('labels.delete')">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>

            <tr v-for="(child) in loc.children" :key="child.id" class="border-b bg-gray-50 hover:bg-gray-100">
              <td class="px-4 py-2">&nbsp;</td>
              <td :class="['px-4 py-2 ps-8', isRTL ? 'text-right' : 'text-left']">— {{ child.name }}</td>
              <td class="px-4 py-2">{{ $t('locations.area') || 'Area' }}</td>
              <td :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">
                <button @click="openEdit(child, loc)" :class="['text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1', isRTL ? 'ml-3' : 'mr-3']" :title="$t('labels.edit')">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(child)" class="text-red-600 hover:text-red-700 transition inline-flex items-center gap-1" :title="$t('labels.delete')">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <div v-if="!sites.length" class="p-6 text-center text-gray-500">{{ $t('locations.noData') || 'No locations yet' }}</div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-md shadow p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">
          {{
            editing
              ? (form.parentId ? ($t('locations.editArea') || 'Edit Area') : ($t('locations.editLocation') || 'Edit Location'))
              : (form.parentId ? ($t('locations.addArea') || 'Add Area') : ($t('locations.addLocation') || 'Add Location'))
          }}
        </h3>
        <div class="mb-4">
          <label class="block text-sm text-gray-700 mb-1">{{ $t(form.parentId ? 'locations.areaName' : 'locations.locationName') || (form.parentId ? 'Area' : 'Name') }}</label>
          <input v-model="form.name" class="w-full border rounded px-3 py-2" />
        </div>
        <div class="flex justify-end gap-3">
          <button @click="closeModal" class="px-3 py-1 border rounded">{{ $t('labels.cancel') || 'Cancel' }}</button>
          <button @click="save()" :disabled="saving || !form.name.trim()" class="px-4 py-2 bg-green-600 text-white rounded">{{ saving ? ($t('labels.saving')||'Saving') : ($t('labels.save')||'Save') }}</button>
        </div>
        <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteConfirmModal.show" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold mb-3 text-gray-900">{{ $t('labels.confirmDelete') || 'Confirm Delete' }}</h3>
        <p class="text-gray-600 mb-6">{{ deleteConfirmModal.message }}</p>
        <div class="flex justify-end gap-3">
          <button @click="closeDeleteConfirm" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            {{ $t('labels.cancel') || 'Cancel' }}
          </button>
          <button @click="doDelete(deleteConfirmModal.id)" :disabled="deleting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? ($t('labels.deleting') || 'Deleting...') : ($t('labels.delete') || 'Delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/api'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'Location-List',
  components: {
    PencilIcon,
    TrashIcon
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
        alert(err?.response?.data?.message || err.message || 'Failed to delete')
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

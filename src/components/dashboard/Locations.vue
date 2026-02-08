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
        <thead class="bg-gray-50 border-b">
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
                <button @click="openAddArea(loc)" :class="['text-green-600 hover:underline', isRTL ? 'ml-3' : 'mr-3']">{{ $t('locations.addArea') || 'Add Area' }}</button>
                <button @click="openEdit(loc)" :class="['text-blue-600 hover:underline', isRTL ? 'ml-3' : 'mr-3']">{{ $t('labels.edit') || 'Edit' }}</button>
                <button @click="confirmDelete(loc)" class="text-red-600 hover:underline">{{ $t('labels.delete') || 'Delete' }}</button>
              </td>
            </tr>

            <tr v-for="(child) in loc.children" :key="child.id" class="border-b bg-gray-50 hover:bg-gray-100">
              <td class="px-4 py-2">&nbsp;</td>
              <td :class="['px-4 py-2 ps-8', isRTL ? 'text-right' : 'text-left']">— {{ child.name }}</td>
              <td class="px-4 py-2">{{ $t('locations.area') || 'Area' }}</td>
              <td :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">
                <button @click="openEdit(child, loc)" :class="['text-blue-600 hover:underline', isRTL ? 'ml-3' : 'mr-3']">{{ $t('labels.edit') || 'Edit' }}</button>
                <button @click="confirmDelete(child)" class="text-red-600 hover:underline">{{ $t('labels.delete') || 'Delete' }}</button>
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
        <h3 class="text-lg font-bold mb-4">{{ editing ? ($t('labels.edit') || 'Edit') : ($t('labels.add') || 'Add') }}</h3>
        <div class="mb-4">
          <label class="block text-sm text-gray-700 mb-1">{{ $t('locations.locationName') || 'Name' }}</label>
          <input v-model="form.name" class="w-full border rounded px-3 py-2" />
        </div>
        <div class="flex justify-end gap-3">
          <button @click="closeModal" class="px-3 py-1 border rounded">{{ $t('labels.cancel') || 'Cancel' }}</button>
          <button @click="save()" :disabled="saving || !form.name.trim()" class="px-4 py-2 bg-green-600 text-white rounded">{{ saving ? ($t('labels.saving')||'Saving') : ($t('labels.save')||'Save') }}</button>
        </div>
        <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/api'

export default {
  name: 'Location-List',
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
      error: ''
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
      if (!confirm(this.$t('locations.confirmDelete') || 'Are you sure you want to delete this location?')) return
      this.doDelete(loc.id)
    },

    async doDelete(id) {
      try {
        await deleteLocation(id)
        await this.load()
      } catch (err) {
        console.error('Delete failed', err)
        alert(err?.response?.data?.message || err.message || 'Failed to delete')
      }
    }
  }
}

</script>

<style scoped>
.ps-8 { padding-inline-start: 2rem; }
</style>

<template>
  <div class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header -->
    <div class="app-page-header flex flex-wrap items-center justify-between gap-4 rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-xl sm:text-2xl font-bold theme-text-primary">{{ $t('units.title') || 'Units of Measure' }}</h2>
      <div class="flex items-center gap-3">
        <button @click="openAddModal()" class="rounded-xl theme-button px-4 py-2 theme-text-light shadow-sm transition">+ {{ $t('units.addUnit') || 'Add Unit' }}</button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/20">
      <div class="relative flex-1 max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('units.searchPlaceholder') || 'Search units...'"
          class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 theme-input-focus text-sm"
        />
        <span class="absolute left-3 top-2.5 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <table class="min-w-full table-auto">
        <thead class="border-b border-slate-200 theme-table-thead-gradient">
          <tr>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">#</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('units.symbol') || 'Symbol' }}</th>
            <th :class="['px-4 py-2', isRTL ? 'text-right' : 'text-left']">{{ $t('units.name') || 'Name' }}</th>
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
              <button @click="openEditModal(unit)" :class="['theme-text hover:theme-accent-muted transition inline-flex items-center gap-1', isRTL ? 'ml-3' : 'mr-3']" :title="$t('labels.edit')">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button @click="confirmDelete(unit)" class="text-red-600 hover:text-red-700 transition inline-flex items-center gap-1" :title="$t('labels.delete')">
                <TrashIcon class="w-4 h-4" />
              </button>
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
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
        <h3 class="text-lg font-bold">
          {{ editing ? ($t('units.editUnit') || 'Edit Unit') : ($t('units.addUnit') || 'Add Unit') }}
        </h3>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm theme-text-secondary mb-1">{{ $t('units.symbol') }} *</label>
            <input v-model="form.symbol" :disabled="editing" class="w-full rounded-xl border border-slate-200 px-3 py-2 theme-input-focus" placeholder="e.g. kg, m³" />
          </div>
          <div>
            <label class="block text-sm theme-text-secondary mb-1">{{ $t('units.name') }} *</label>
            <input v-model="form.name" class="w-full rounded-xl border border-slate-200 px-3 py-2 theme-input-focus" placeholder="e.g. Kilogram" />
          </div>
          <div>
            <label class="block text-sm theme-text-secondary mb-1">{{ $t('units.arName') }}</label>
            <input v-model="form.arName" class="w-full rounded-xl border border-slate-200 px-3 py-2 theme-input-focus" placeholder="e.g. كيلوجرام" />
          </div>
          <div>
            <label class="block text-sm theme-text-secondary mb-1">{{ $t('units.description') }}</label>
            <textarea v-model="form.description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 theme-input-focus" placeholder="Optional details..."></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="closeModal" class="rounded-xl border border-slate-200 px-4 py-2 theme-text-secondary hover:bg-slate-50">{{ $t('labels.cancel') || 'Cancel' }}</button>
          <button @click="save" :disabled="saving || !form.symbol.trim() || !form.name.trim()" class="rounded-xl theme-button px-5 py-2 theme-text-light font-medium">
            {{ saving ? ($t('labels.saving') || 'Saving...') : ($t('labels.save') || 'Save') }}
          </button>
        </div>
        <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteConfirmModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
      <div class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 class="text-lg font-bold mb-3 theme-text-primary">{{ $t('labels.confirmDelete') || 'Confirm Delete' }}</h3>
        <p class="theme-text-secondary mb-6">{{ deleteConfirmModal.message }}</p>
        <div class="flex justify-end gap-3">
          <button @click="closeDeleteConfirm" class="rounded-xl border border-slate-200 px-4 py-2 theme-text-secondary hover:bg-slate-50">
            {{ $t('labels.cancel') || 'Cancel' }}
          </button>
          <button @click="doDelete(deleteConfirmModal.id)" :disabled="deleting" class="rounded-xl bg-red-600 px-4 py-2 theme-text-light hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? ($t('labels.deleting') || 'Deleting...') : ($t('labels.delete') || 'Delete') }}
          </button>
        </div>
        <p v-if="deleteError" class="text-red-600 text-sm mt-3">{{ deleteError }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getUnits, createUnit, updateUnit, deleteUnit } from '@/api'
import { PencilIcon, TrashIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'Units-List',
  components: {
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

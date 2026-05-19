<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6 space-y-6">
    <div class="app-page-header flex items-center justify-between rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold">{{ $t('dashboard.items') || 'Items' }}</h2>
      <button @click="openCreateModal"
        class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-500 hover:to-sky-500 transition inline-flex items-center gap-2 shadow-sm shadow-indigo-200">
        <PlusIcon class="w-5 h-5" />
        {{ $t('dashboard.newItem') || 'Add Item' }} +
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-auto bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/40">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gradient-to-r from-slate-50 to-indigo-50">
          <tr>
            <th
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              #</th>
            <th
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.itemName') || 'Item Name' }}</th>
            <th
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.unit') || 'Unit' }}</th>
            <th v-if="mode === 'supply' || mode === 'all'"
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.defaultSupplyPrice') || 'Supply Price' }}</th>
            <th v-if="mode === 'transport' || mode === 'all'"
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.defaultTransportPrice') || 'Transport Price' }}</th>
            <th v-if="mode === 'extracts' || mode === 'all'"
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.defaultExtractPrice') || 'Default Extract Price' }}</th>
            <!-- <th
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.exports') || 'For Exports' }}</th>
            <th
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.transport') || 'For Transports' }}</th>
            <th
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.isActive') || 'Active' }}</th> -->
            <th
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.createdAt') || 'Created At' }}</th>
            <th
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="item.id" class="hover:bg-indigo-50/40"
            @contextmenu.prevent="openContextMenu($event, item)">
            <td
              class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap text-start">
              {{ item.name }}</td>
            <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ item.unit?.name || getUnitName(item.unitId) || '-' }}</td>
            <td v-if="mode === 'supply' || mode === 'all'"
              class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ formatPrice(item.defaultSupplyPrice) }}</td>
            <td v-if="mode === 'transport' || mode === 'all'"
              class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ formatPrice(item.defaultTransportPrice) }}</td>
            <td v-if="mode === 'extracts' || mode === 'all'"
              class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start">
              {{ formatPrice(item.defaultExtractPrice ?? item.currentPrice) }}</td>
            <!-- <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap text-start">
              <span v-if="item.availableForSupplies">✓</span><span v-else>-</span></td>
            <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap text-start">
              <span v-if="item.availableForTransports">✓</span><span v-else>-</span></td>
            <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap text-start">
              <span v-if="item.isActive">✓</span><span v-else>-</span></td> -->
            <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap text-start">
              {{ formatDate(item.createdAt) }}</td>
            <td
              class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start flex gap-2">
              <button @click="editItem(item)"
                class="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm">
                <PencilIcon class="w-5 h-5" />
              </button>
              <button @click="confirmDelete(item)"
                class="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm">
                <TrashIcon class="w-5 h-5" />
              </button>
            </td>
          </tr>
          <tr v-if="items.length === 0 && !loading">
            <td
              class="px-6 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start"
              :colspan="columnsCount">
              {{ $t('labels.noDataFound') || 'No items found' }}
            </td>
          </tr>
          <tr v-if="loading">
            <td
              class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start "
              :colspan="columnsCount">
              {{ $t('labels.loading') || 'Loading...' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <Pagination v-if="totalPages > 1" :currentPage="page" :pageSize="pageSize" :total="total" :totalPages="totalPages"
      :pageSizeOptions="[10, 20, 50, 100]" @update:page="(p) => { page = p; loadItems() }"
      @update:pageSize="(size) => { pageSize = size; page = 1; loadItems() }" />

    <!-- Create/Edit Modal -->
    <teleport to="body">
      <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 z-10">
          <h3 class="text-lg font-semibold mb-4">
            {{ editingItem ? ($t('labels.edit') + ' ' + $t('labels.item')) : ($t('labels.new') + ' ' + $t('labels.item'))
            }}
          </h3>

          <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Item Name -->
            <label class="block">
              <div class="text-sm font-medium mb-1">{{ $t('labels.itemName') || 'Item Name' }} *</div>
              <input v-model="form.name" type="text" required
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :placeholder="$t('placeholders.enterItemName') || 'Enter item name'" />
              <div v-if="errors.name" class="text-red-600 text-sm mt-1">{{ errors.name }}</div>
            </label>

            <!-- Unit -->
            <label class="block">
              <div class="text-sm font-medium mb-1">{{ $t('labels.unit') || 'Unit' }}</div>
              <select v-model="form.unitId"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option :value="null">-- {{ $t('placeholders.selectUnit') || 'Select unit' }} --</option>
                <option v-for="u in unitOptions" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </label>

            <!-- Prices (mode-specific) -->
            <label class="block" v-if="mode === 'supply' || mode === 'all'">
              <div class="text-sm font-medium mb-1">{{ $t('labels.defaultSupplyPrice') || 'Default Supply Price' }} {{ mode === 'supply' ? '*' : '' }}</div>
              <input v-model.number="form.defaultSupplyPrice" :required="mode === 'supply'" type="number" step="0.01" min="0"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :placeholder="$t('placeholders.enterPrice') || 'Enter price'" />

              <!-- When in supply mode allow marking also available for transport -->
              <div v-if="mode === 'supply'" class="mt-2 flex items-center gap-2">
                <input id="availTransport" type="checkbox" v-model="form.availableForTransports" class="w-4 h-4" />
                <label for="availTransport" class="text-sm">{{ $t('labels.availableForTransports') || 'Also available for transport' }}</label>
              </div>

              <!-- If checkbox set, show transport price field -->
              <label class="block mt-2" v-if="form.availableForTransports">
                <div class="text-sm font-medium mb-1">{{ $t('labels.defaultTransportPrice') || 'Default Transport Price' }}</div>
                <input v-model.number="form.defaultTransportPrice" :required="form.availableForTransports" type="number" step="0.01" min="0"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :placeholder="$t('placeholders.enterPrice') || 'Enter price'" />
              </label>
            </label>

            <label class="block" v-if="mode === 'transport' || mode === 'all'">
              <div class="text-sm font-medium mb-1">{{ $t('labels.defaultTransportPrice') || 'Default Transport Price' }} {{ mode === 'transport' ? '*' : '' }}</div>
              <input v-model.number="form.defaultTransportPrice" :required="mode === 'transport'" type="number" step="0.01" min="0"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :placeholder="$t('placeholders.enterPrice') || 'Enter price'" />

              <!-- When in transport mode allow marking also available for supply -->
              <div v-if="mode === 'transport'" class="mt-2 flex items-center gap-2">
                <input id="availSupply" type="checkbox" v-model="form.availableForSupplies" class="w-4 h-4" />
                <label for="availSupply" class="text-sm">{{ $t('labels.availableForSupplies') || 'Also available for supply' }}</label>
              </div>

              <!-- If checkbox set, show supply price field -->
              <label class="block mt-2" v-if="form.availableForSupplies">
                <div class="text-sm font-medium mb-1">{{ $t('labels.defaultSupplyPrice') || 'Default Supply Price' }}</div>
                <input v-model.number="form.defaultSupplyPrice" :required="form.availableForSupplies" type="number" step="0.01" min="0"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :placeholder="$t('placeholders.enterPrice') || 'Enter price'" />
              </label>
            </label>

            <!-- Export price (for extracts) -->
            <label class="block" v-if="mode === 'extracts' || form.availableForExtracts">
              <div class="text-sm font-medium mb-1">{{ $t('labels.defaultExtractPrice') || 'Default Extract Price' }} {{ mode === 'extracts' ? '*' : '' }}</div>
              <input v-model.number="form.defaultExtractPrice" :required="mode === 'extracts' || form.availableForExtracts" type="number" step="0.01" min="0"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :placeholder="$t('placeholders.enterPrice') || 'Enter price'" />
            </label>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button type="submit" :disabled="submitting"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition">
                {{ submitting ? ($t('labels.saving') || 'Saving...') : ($t('labels.save') || 'Save') }}
              </button>
              <button type="button" @click="closeModal"
                class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
                {{ $t('labels.cancel') || 'Cancel' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog :show="deleteDialogOpen" type="danger" :title="$t('labels.confirmDelete') || 'Confirm Delete'"
      :message="$t('messages.confirmDeleteItem') || `Are you sure you want to delete '${deleteItem?.name}'?`"
      :loading="submitting" loadingText="Deleting..." @confirm="performDelete(deleteModeChoice)" @cancel="deleteDialogOpen = false" />

    <!-- Delete mode selection removed — mode is taken from component `mode` prop -->

    <!-- Context Menu -->
    <div v-if="contextMenu.visible" class="fixed inset-0 z-40" @click="contextMenu.visible = false"></div>
    <div v-if="contextMenu.visible" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="fixed bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 min-w-[150px]" @click.stop>
      <button @click="() => { editItem(contextMenu.item); contextMenu.visible = false }"
        class="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-gray-700 flex items-center gap-2 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
          </path>
        </svg>
        {{ $t('labels.edit') }}
      </button>
      <button @click="() => { confirmDelete(contextMenu.item); contextMenu.visible = false }"
        class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
          </path>
        </svg>
        {{ $t('labels.delete') }}
      </button>
    </div>

    <!-- Toast notifications -->
    <Toast />
  </div>
</template>

<script>
import { getItems, createItem, updateItem, deleteItem, getUnits } from '@/api'
import normalizeItem from '@/utils/normalizeItem'
import Pagination from '@/components/shared/Pagination.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import Toast from '@/components/shared/Toast.vue'
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'ItemList',
  emits: ['saved'],
  components: { ConfirmDialog, Pagination, PencilIcon, PlusIcon, Toast, TrashIcon },
  props: {
    mode: { type: String, default: 'supply' } // 'supply' | 'transport' | 'extracts' | 'all'
  },
  data() {
    return {
      units: [],
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      loading: false,
      modalOpen: false,
      deleteDialogOpen: false,
      submitting: false,
      editingItem: null,
      deleteItem: null,
      form: {
        name: '',
        currentPrice: null,
        defaultExtractPrice: null,
        defaultSupplyPrice: null,
        defaultTransportPrice: null,
        unitId: null,
        notes: '',
        isActive: true,
        availableForSupplies: false,
        availableForExtracts: false,
        availableForTransports: false
      },
      errors: {
        name: '',
        currentPrice: ''
      },
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        item: null
      },
    }
  },
  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    }
    ,columnsCount() {
      // base columns: index, name, unit, suppliesFlag, transportFlag, isActive, createdAt, actions = 8
      let base = 8
      if (this.mode === 'supply' || this.mode === 'all') base += 1
      if (this.mode === 'transport' || this.mode === 'all') base += 1
      if (this.mode === 'extracts' || this.mode === 'all') base += 1
      return base
    },
    unitOptions() {
      const fallbackUnits = [
        { id: 'daily', name: 'daily' },
        { id: 'sectional', name: 'sectional' }
      ]
      const seen = new Set((this.units || []).map(u => String(u.id)))
      return [...(this.units || []), ...fallbackUnits.filter(u => !seen.has(String(u.id)))]
    }
  },
  watch: {
    '$i18n.locale'() {
      this.loadItems()
      this.loadUnits()
    }
  },
  methods: {
    async loadItems() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          mode: this.mode
        }
        const response = await getItems(params)

        // Normalize response into an items array
        let raw = []
        if (Array.isArray(response.data)) raw = response.data
        else if (response.data && response.data.items) raw = response.data.items
        else if (response.data && response.data.data) raw = response.data.data

        this.items = raw.map(normalizeItem)
        this.total = response.data?.meta?.total || this.items.length
        this.totalPages = response.data?.meta?.totalPages || Math.ceil(this.total / this.pageSize)
      } catch (error) {
        this.showToast(error.response?.data?.message || this.$t('labels.failedLoadItems') || 'Failed to load items', 'error')
      } finally {
        this.loading = false
      }
    },

    openCreateModal(preset = {}) {
      this.editingItem = null
      this.resetForm()
      // Set availability flags based on incoming mode
      if (this.mode === 'supply') {
        this.form.availableForSupplies = true
        this.form.availableForTransports = false
        this.form.availableForExtracts = false
      } else if (this.mode === 'transport') {
        this.form.availableForSupplies = false
        this.form.availableForTransports = true
        this.form.availableForExtracts = false
      } else if (this.mode === 'extracts') {
        this.form.availableForSupplies = false
        this.form.availableForTransports = false
        this.form.availableForExtracts = true
      } else {
        this.form.availableForSupplies = true
        this.form.availableForTransports = true
        this.form.availableForExtracts = true
      }
      // Apply preset flags if provided (used when reusing this modal from other components)
      if (preset.availableForSupplies !== undefined) this.form.availableForSupplies = !!preset.availableForSupplies
      if (preset.availableForTransports !== undefined) this.form.availableForTransports = !!preset.availableForTransports
      // Backwards-compatible: accept `availableForExports` as alias for `availableForExtracts`
      if (preset.availableForExports !== undefined) this.form.availableForExtracts = !!preset.availableForExports
      if (preset.availableForExtracts !== undefined) this.form.availableForExtracts = !!preset.availableForExtracts
      this.modalOpen = true
    },

    editItem(item) {
      this.editingItem = item
      this.form.name = item.name
      // support older payloads
      this.form.currentPrice = item.currentPrice !== undefined ? parseFloat(item.currentPrice) : null
      this.form.defaultExtractPrice = item.defaultExtractPrice !== undefined ? parseFloat(item.defaultExtractPrice) : null
      this.form.defaultSupplyPrice = item.defaultSupplyPrice !== undefined ? parseFloat(item.defaultSupplyPrice) : null
      this.form.defaultTransportPrice = item.defaultTransportPrice !== undefined ? parseFloat(item.defaultTransportPrice) : null
      this.form.unitId = item.unitId || null
      this.form.notes = item.notes || ''
      this.form.isActive = item.isActive !== undefined ? !!item.isActive : true
      this.form.availableForSupplies = !!item.availableForSupplies
      this.form.availableForTransports = !!item.availableForTransports
      this.form.availableForExtracts = !!item.availableForExtracts
      this.modalOpen = true
    },

    resetForm() {
      this.form = {
        name: '',
        currentPrice: null,
        defaultExtractPrice: null,
        defaultSupplyPrice: null,
        defaultTransportPrice: null,
        unitId: null,
        notes: '',
        isActive: true,
        availableForSupplies: false,
        availableForExtracts: false,
        availableForTransports: false
      }
      this.errors = {
        name: '',
        currentPrice: ''
      }
    },

    validateForm() {
      this.errors = {
        name: '',
        currentPrice: ''
      }

      if (!this.form.name || !this.form.name.trim()) {
        this.errors.name = this.$t('validation.itemNameRequired') || 'Item name is required'
      }

      // Validate prices depending on mode and availability checkboxes
      if (this.mode === 'supply') {
        if (this.form.defaultSupplyPrice === null || this.form.defaultSupplyPrice === '' || this.form.defaultSupplyPrice < 0) {
          this.errors.currentPrice = this.$t('validation.priceRequired') || 'Price is required and must be positive'
        }
        if (this.form.availableForTransports) {
          if (this.form.defaultTransportPrice === null || this.form.defaultTransportPrice === '' || this.form.defaultTransportPrice < 0) {
            this.errors.currentPrice = this.$t('validation.priceRequired') || 'Transport price is required and must be positive'
          }
        }
      } else if (this.mode === 'transport') {
        if (this.form.defaultTransportPrice === null || this.form.defaultTransportPrice === '' || this.form.defaultTransportPrice < 0) {
          this.errors.currentPrice = this.$t('validation.priceRequired') || 'Price is required and must be positive'
        }
        if (this.form.availableForSupplies) {
          if (this.form.defaultSupplyPrice === null || this.form.defaultSupplyPrice === '' || this.form.defaultSupplyPrice < 0) {
            this.errors.currentPrice = this.$t('validation.priceRequired') || 'Supply price is required and must be positive'
          }
        }
      } else if (this.mode === 'extracts') {
        if (
          this.form.defaultExtractPrice === null ||
          this.form.defaultExtractPrice === '' ||
          this.form.defaultExtractPrice < 0
        ) {
          this.errors.currentPrice =
            this.$t('validation.priceRequired') ||
            'Extract price is required and must be positive'
        }
      } else {
        // mode === 'all'
        // If availability flags are used, require the corresponding prices; otherwise require at least one price
        if (this.form.availableForSupplies && (this.form.defaultSupplyPrice === null || this.form.defaultSupplyPrice === '' || this.form.defaultSupplyPrice < 0)) {
          this.errors.currentPrice = this.$t('validation.priceRequired') || 'Supply price is required and must be positive'
        }
        if (this.form.availableForTransports && (this.form.defaultTransportPrice === null || this.form.defaultTransportPrice === '' || this.form.defaultTransportPrice < 0)) {
          this.errors.currentPrice = this.$t('validation.priceRequired') || 'Transport price is required and must be positive'
        }
        if (
          this.form.availableForExtracts &&
          (
            this.form.defaultExtractPrice === null ||
            this.form.defaultExtractPrice === '' ||
            this.form.defaultExtractPrice < 0
          )
        ) {
          this.errors.currentPrice =
            this.$t('validation.priceRequired') ||
            'Extract price is required and must be positive'
        }
        if (!this.form.availableForSupplies && !this.form.availableForTransports && !this.form.availableForExtracts) {
          // no flags set — require at least one price (supply, transport or extract)
          if ((this.form.defaultSupplyPrice === null || this.form.defaultSupplyPrice === '' || this.form.defaultSupplyPrice < 0) &&
            (this.form.defaultTransportPrice === null || this.form.defaultTransportPrice === '' || this.form.defaultTransportPrice < 0) &&
            (this.form.defaultExtractPrice === null || this.form.defaultExtractPrice === '' || this.form.defaultExtractPrice < 0)) {
            this.errors.currentPrice = this.$t('validation.priceRequired') || 'At least one price is required and must be positive'
          }
        }
      }

      return !this.errors.name && !this.errors.currentPrice
    },

    async submitForm() {
      if (!this.validateForm()) return

      this.submitting = true
      try {
        const payload = {
          name: this.form.name.trim(),
          unitId: this.form.unitId,
          notes: this.form.notes || '',
          isActive: this.form.isActive,
        }

        // Only include price fields when the corresponding availability flag is set
        if (this.form.availableForSupplies) {
          payload.defaultSupplyPrice = this.form.defaultSupplyPrice
          payload.availableForSupplies = true
        }
        if (this.form.availableForTransports) {
          payload.defaultTransportPrice = this.form.defaultTransportPrice
          payload.availableForTransports = true
        }
        if (this.form.availableForExtracts || this.mode === 'extracts') {
          // Prefer explicit defaultExtractPrice field; keep currentPrice for backward compatibility
          if (this.form.defaultExtractPrice !== null && this.form.defaultExtractPrice !== undefined) payload.defaultExtractPrice = this.form.defaultExtractPrice
          if (this.form.currentPrice !== null && this.form.currentPrice !== undefined) payload.currentPrice = this.form.currentPrice
          payload.availableForExtracts = true
        }

        let res
        if (this.editingItem) {
          res = await updateItem(this.editingItem.id, payload)
          this.showToast(this.$t('messages.itemUpdated') || 'Item updated successfully', 'success')
        } else {
          res = await createItem(payload)
          this.showToast(this.$t('messages.itemCreated') || 'Item created successfully', 'success')
        }

        this.closeModal()
        this.loadItems()
        // Emit saved event so parent components can react (e.g., refresh lists)
        this.$emit('saved', res?.data ?? res)
      } catch (error) {
        this.showToast(error.response?.data?.message || this.$t('labels.failedSaveItem') || 'Failed to save item', 'error')
      } finally {
        this.submitting = false
      }
    },

    async loadUnits() {
      try {
        const resp = await getUnits()
        if (Array.isArray(resp.data)) this.units = resp.data
        else if (resp.data && resp.data.items) this.units = resp.data.items
        else if (resp.data && resp.data.data) this.units = resp.data.data
      } catch (err) {
        // ignore silently, units optional
        console.warn('Failed to load units', err)
      }
    },

    confirmDelete(item) {
      this.deleteItem = item
      // Use component `mode` prop to determine deletion behaviour; always show confirmation
      this.deleteDialogOpen = true
    },

    async performDelete(modeArg = null) {
      this.submitting = true
      try {
        // Decide mode from component prop if not explicitly provided
        const mode = modeArg || ((this.mode === 'supply' || this.mode === 'transport') ? this.mode : 'all')
        const params = {}
        if (mode && mode !== 'all') params.mode = mode
        const res = await deleteItem(this.deleteItem.id, params)

        // Interpret response
        const data = res?.data ?? null
        if ((res && res.status === 204) || (data && data.deletedAt)) {
          this.showToast(this.$t('messages.itemDeleted') || 'Item deleted successfully', 'success')
        } else if (data && !data.deletedAt && (mode === 'supply' || mode === 'transport')) {
          this.showToast(this.$t('messages.availabilityRemoved') || `Availability removed for ${mode}`, 'success')
        } else {
          // Generic fallback
          this.showToast(this.$t('messages.itemDeleted') || 'Item deleted successfully', 'success')
        }

        this.deleteDialogOpen = false
        this.deleteModeDialogOpen = false
        this.deleteItem = null
        await this.loadItems()
      } catch (error) {
        // Handle specific error codes
        if (error.response?.status === 409 || error.response?.data?.code === 'P2025') {
          const errorMessage = this.$t('messages.itemInUse') || error.response?.data?.message || 'Cannot delete this item. It is being used elsewhere.'
          this.showToast(errorMessage, 'error')
          // Keep modal open briefly then close
          setTimeout(() => {
            this.deleteDialogOpen = false
            this.deleteModeDialogOpen = false
            this.deleteItem = null
          }, 800)
        } else if (error.response?.status === 404) {
          this.showToast(this.$t('messages.itemNotFound') || 'Item not found', 'error')
          this.deleteDialogOpen = false
          this.deleteModeDialogOpen = false
          this.deleteItem = null
          this.loadItems()
        } else {
          const errorMessage = this.$t('messages.failedDeleteItem') || error.response?.data?.message || 'Failed to delete item'
          this.showToast(errorMessage, 'error')
          this.deleteDialogOpen = false
          this.deleteModeDialogOpen = false
          this.deleteItem = null
        }
      } finally {
        this.submitting = false
      }
    },

    closeModal() {
      this.modalOpen = false
      this.editingItem = null
      this.resetForm()
    },

    showToast(message, type = 'success') {
      // استخدام الـ global toast function من الـ window
      if (window.$toast) {
        window.$toast(message, type, 3000)
      } else {
        // Fallback to console if toast not available
        console.log(`[${type.toUpperCase()}] ${message}`)
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        return new Intl.DateTimeFormat('en-GB').format(new Date(dateString))
      } catch {
        return dateString
      }
    },

    formatPrice(price) {
      if (price === null || price === undefined) return '-'
      return parseFloat(price).toFixed(2)
    },

    getUnitName(id) {
      if (!id) return null
      const u = this.unitOptions.find(x => x.id === id || x.id === Number(id))
      return u ? u.name : null
    },

    openContextMenu(event, item) {
      this.contextMenu.x = event.clientX
      this.contextMenu.y = event.clientY
      this.contextMenu.item = item
      this.contextMenu.visible = true
    }
  },
  mounted() {
    this.loadItems()
    this.loadUnits()
    // Close context menu when clicking anywhere
    this.closeContextMenuHandler = () => {
      this.contextMenu.visible = false
    }
    document.addEventListener('click', this.closeContextMenuHandler)
  },
  beforeUnmount() {
    if (this.closeContextMenuHandler) {
      document.removeEventListener('click', this.closeContextMenuHandler)
    }
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>

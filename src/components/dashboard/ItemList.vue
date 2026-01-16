<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold">{{ $t('dashboard.items') || 'Items' }}</h2>
      <button @click="openCreateModal" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
        {{ $t('dashboard.newItem') || 'Add Item' }} +
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-auto bg-white rounded shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-indigo-50">
          <tr>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">#</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">{{ $t('labels.itemName') || 'Item Name' }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">{{ $t('labels.currentPrice') || 'Current Price' }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">{{ $t('labels.createdAt') || 'Created At' }}</th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap text-start">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="item.id" class="hover:bg-gray-50" @contextmenu.prevent="openContextMenu($event, item)">
            <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap text-start">{{ item.name }}</td>
            <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start">{{ formatPrice(item.currentPrice) }}</td>
            <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap text-start">{{ formatDate(item.createdAt) }}</td>
            <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start flex gap-2">
              <button @click="editItem(item)" class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">
                {{ $t('labels.edit') }}
              </button>
              <button @click="confirmDelete(item)" class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm">
                {{ $t('labels.delete') }}
              </button>
            </td>
          </tr>
          <tr v-if="items.length === 0 && !loading">
            <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start" :colspan="5">
              {{ $t('labels.noDataFound') || 'No items found' }}
            </td>
          </tr>
          <tr v-if="loading">
            <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap text-start " :colspan="5">
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
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
        <h3 class="text-lg font-semibold mb-4">
          {{ editingItem ? ($t('labels.edit') + ' ' + $t('labels.item')) : ($t('labels.new') + ' ' + $t('labels.item')) }}
        </h3>

        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Item Name -->
          <label class="block">
            <div class="text-sm font-medium mb-1">{{ $t('labels.itemName') || 'Item Name' }} *</div>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :placeholder="$t('placeholders.enterItemName') || 'Enter item name'"
            />
            <div v-if="errors.name" class="text-red-600 text-sm mt-1">{{ errors.name }}</div>
          </label>

          <!-- Current Price -->
          <label class="block">
            <div class="text-sm font-medium mb-1">{{ $t('labels.currentPrice') || 'Current Price' }} *</div>
            <input
              v-model.number="form.currentPrice"
              type="number"
              required
              step="0.01"
              min="0"
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :placeholder="$t('placeholders.enterPrice') || 'Enter price'"
            />
            <div v-if="errors.currentPrice" class="text-red-600 text-sm mt-1">{{ errors.currentPrice }}</div>
          </label>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {{ submitting ? ($t('labels.saving') || 'Saving...') : ($t('labels.save') || 'Save') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              {{ $t('labels.cancel') || 'Cancel' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="deleteDialogOpen"
      type="danger"
      :title="$t('labels.confirmDelete') || 'Confirm Delete'"
      :message="$t('messages.confirmDeleteItem') || `Are you sure you want to delete '${deleteItem?.name}'?`"
      :loading="submitting"
      loadingText="Deleting..."
      @confirm="performDelete"
      @cancel="deleteDialogOpen = false"
    />

    <!-- Context Menu -->
    <div v-if="contextMenu.visible" class="fixed inset-0 z-40" @click="contextMenu.visible = false"></div>
    <div
      v-if="contextMenu.visible"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="fixed bg-white border border-gray-200 rounded shadow-lg z-50 py-1 min-w-[150px]"
      @click.stop
    >
      <button
        @click="() => { editItem(contextMenu.item); contextMenu.visible = false }"
        class="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-gray-700 flex items-center gap-2 transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        {{ $t('labels.edit') }}
      </button>
      <button
        @click="() => { confirmDelete(contextMenu.item); contextMenu.visible = false }"
        class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        {{ $t('labels.delete') }}
      </button>
    </div>

    <!-- Toast notifications -->
    <Toast />
  </div>
</template>

<script>
import {
  getExportItems,
  createExportItem,
  updateExportItem,
  deleteExportItem
} from '@/api'
import Pagination from '@/components/shared/Pagination.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import Toast from '@/components/shared/Toast.vue'

export default {
  name: 'ItemList',
  components: { Pagination, ConfirmDialog, Toast },
  data() {
    return {
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
        currentPrice: null
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
      }
    }
  },
  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    }
  },
  methods: {
    async loadItems() {
      this.loading = true
      try {
        const response = await getExportItems({
          page: this.page,
          pageSize: this.pageSize
        })
        
        if (Array.isArray(response.data)) {
          this.items = response.data
          this.total = response.data.length
          this.totalPages = Math.ceil(this.total / this.pageSize)
        } else if (response.data && response.data.data) {
          this.items = response.data.data
          this.total = response.data.total || response.data.data.length
          this.totalPages = response.data.totalPages || Math.ceil(this.total / this.pageSize)
        }
      } catch (error) {
        this.showToast(error.response?.data?.message || this.$t('labels.failedLoadItems') || 'Failed to load items', 'error')
      } finally {
        this.loading = false
      }
    },

    openCreateModal() {
      this.editingItem = null
      this.resetForm()
      this.modalOpen = true
    },

    editItem(item) {
      this.editingItem = item
      this.form.name = item.name
      this.form.currentPrice = parseFloat(item.currentPrice)
      this.modalOpen = true
    },

    resetForm() {
      this.form = {
        name: '',
        currentPrice: null
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

      if (this.form.currentPrice === null || this.form.currentPrice === '' || this.form.currentPrice < 0) {
        this.errors.currentPrice = this.$t('validation.priceRequired') || 'Price is required and must be positive'
      }

      return !this.errors.name && !this.errors.currentPrice
    },

    async submitForm() {
      if (!this.validateForm()) return

      this.submitting = true
      try {
        const payload = {
          name: this.form.name.trim(),
          currentPrice: this.form.currentPrice
        }

        if (this.editingItem) {
          await updateExportItem(this.editingItem.id, payload)
          this.showToast(this.$t('messages.itemUpdated') || 'Item updated successfully', 'success')
        } else {
          await createExportItem(payload)
          this.showToast(this.$t('messages.itemCreated') || 'Item created successfully', 'success')
        }

        this.closeModal()
        this.loadItems()
      } catch (error) {
        this.showToast(error.response?.data?.message || this.$t('labels.failedSaveItem') || 'Failed to save item', 'error')
      } finally {
        this.submitting = false
      }
    },

    confirmDelete(item) {
      this.deleteItem = item
      this.deleteDialogOpen = true
    },

    async performDelete() {
      this.submitting = true
      try {
        await deleteExportItem(this.deleteItem.id)
        this.showToast(this.$t('messages.itemDeleted') || 'Item deleted successfully', 'success')
        this.deleteDialogOpen = false
        this.deleteItem = null
        this.loadItems()
      } catch (error) {
        // Handle specific error codes
        if (error.response?.status === 409) {
          // Item is being used, show the specific error message
          const errorMessage = this.$t('messages.itemInUse') || error.response?.data?.message || 'Cannot delete this item. It is being used in exports.'
          this.showToast(errorMessage, 'error')
          // Close dialog automatically when item is in use
          setTimeout(() => {
            this.deleteDialogOpen = false
            this.deleteItem = null
          }, 500)
        } else if (error.response?.status === 404) {
          this.showToast(this.$t('messages.itemNotFound') || 'Item not found', 'error')
          this.deleteDialogOpen = false
          this.deleteItem = null
          this.loadItems()
        } else {
          // Other errors
          const errorMessage = this.$t('messages.failedDeleteItem') || error.response?.data?.message || 'Failed to delete item'
          this.showToast(errorMessage, 'error')
          this.deleteDialogOpen = false
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
      return new Date(dateString).toLocaleDateString(this.$i18n?.locale === 'ar' ? 'ar-EG' : 'en-US')
    },

    formatPrice(price) {
      if (price === null || price === undefined) return '-'
      return parseFloat(price).toFixed(2)
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

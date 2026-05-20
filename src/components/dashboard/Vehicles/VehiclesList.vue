<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl' : ''" class="space-y-6">
    <div class="app-page-header flex items-center justify-between rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-3 sm:p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold text-gray-800">{{ $t('vehicles.title') }}</h2>
      <div></div>
      <div>
        <button
          @click="openCreateModal"
          class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-sky-500 flex items-center gap-2 shadow-sm shadow-indigo-200 text-xs sm:text-sm"
        >
          <PlusIcon class="w-5 h-5" />
          {{ $t('vehicles.createVehicle') }}
        </button>
      </div>
    </div>

    <!-- <div v-if="vehicles.length === 0" class="p-4 bg-white rounded border text-gray-500">
      {{ $t('vehicles.noResults') }}
    </div> -->

    <!-- Table view -->
    <div class="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/40">
      <table class="min-w-full text-sm">
        <thead class="bg-gradient-to-r from-slate-50 to-indigo-50">
          <tr>
            <!-- <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">ID</th> -->
            <th :class="['px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left']">{{ $t('vehicles.truckName') || 'Truck Name' }}</th>
            <th :class="['px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left']">{{ $t('vehicles.contractor') }}</th>
            <th :class="['px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left']">{{ $t('vehicles.crusherNumber') }}</th>
            <th :class="['px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left']">{{ $t('vehicles.companyCapacity') }}</th>
            <th :class="['px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.crusherCapacity') }}</th>
            <th :class="['px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vehicles" :key="v.id"
              class="border-t hover:bg-indigo-50/40"
              @contextmenu.prevent="onRowContextMenu($event, v)"
          >
            <!-- <td class="px-3 py-3 text-gray-700">{{ v.id }}</td> -->
            <td class="px-3 py-3 font-medium text-gray-800">{{ v.name }}</td>
            <td class="px-3 py-3 text-gray-700">{{ v.contractor?.name || '—' }}</td>
            <td class="px-3 py-3 text-gray-700">{{ v.crusherNumber || '—' }}</td>
            <td class="px-3 py-3 text-gray-700">{{ v.companyCapacity != null && v.companyCapacity !== '' ? v.companyCapacity : '—' }}</td>
            <td class="px-3 py-3 text-gray-700">{{ v.crusherCapacity != null && v.crusherCapacity !== '' ? v.crusherCapacity : '—' }}</td>
            <!-- driver cell removed -->
            <td class="px-3 py-3 flex gap-2">
              <button
                class="px-3 py-1.5 text-sm rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-sky-500 inline-flex items-center gap-1.5 shadow-sm shadow-indigo-200"
                @click="openVehicleDetails(v)">
                <ArrowsRightLeftIcon class="w-4 h-4" />
                {{ $t('vehicles.changeOwner') }}
              </button>
              <button
                class="p-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                @click="openEditModal(v)"
                :title="$t('labels.edit') || 'Edit'">
                <PencilSquareIcon class="w-4 h-4" />
              </button>
              <button
                class="p-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                @click="openDeleteConfirm(v)"
                :title="$t('labels.delete') || 'Delete'">
                <TrashIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>

          <tr v-if="vehicles.length === 0">
            <td class="px-3 py-2 text-start text-gray-500" colspan="6">
              {{ $t('vehicles.noResults') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Context menu (absolute positioned) -->
    <div v-if="contextMenu && contextMenu.visible"
         ref="contextMenuRef"
         :style="{ position: 'absolute', top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
         class="w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 text-sm">
      <ul class="py-1">
        <li>
          <button
            @click="onContextMenuSelectManage"
            class="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700">
            {{ $t('vehicles.changeOwner') }}
          </button>
        </li>
        <li class="border-t border-gray-200 my-1"></li>
        <li>
          <button
            @click="onContextMenuSelectEdit"
            class="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 text-gray-700">
            {{ $t('labels.edit') || 'Edit' }}
          </button>
        </li>
        <li>
          <!-- <button
            @click="onContextMenuSelectDelete"
            class="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-700 text-gray-700">
            {{ $t('labels.delete') || 'Delete' }}
          </button> -->
        </li>
      </ul>
    </div>

    <!-- Create Vehicle Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4" style="margin-top: 0 !important;">
      <div class="relative w-full max-w-sm sm:max-w-2xl lg:max-w-3xl z-50 mx-auto">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h3 class="text-lg font-semibold text-gray-800">{{ $t('vehicles.createVehicle') }}</h3>
            <button class="text-gray-500 hover:text-gray-700" @click="closeCreateModal"><XMarkIcon class="w-5 h-5" /></button>
          </div>
          <div class="p-4 sm:p-6 overflow-y-auto">
            <CreateVehicle :mode="mode" @created="onCreatedFromModal" />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Vehicle Modal -->
    <div v-if="editingVehicle" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4" style="margin-top: 0 !important;">
      <div class="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm sm:max-w-md z-50 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ $t('labels.edit') || 'Edit' }} {{ editingVehicle.name }}</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal"><XMarkIcon class="w-5 h-5" /></button>
        </div>
        <form @submit.prevent="onSaveEdit" class="grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-4 sm:space-y-0">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.truckName') || 'Truck Name' }}</label>
            <input v-model="editForm.name" type="text" class="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.companyCapacity') }}</label>
            <input v-model="editForm.companyCapacity" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2 text-sm" />
            <p v-if="editForm.companyCapacity && Number(editForm.companyCapacity) <= 0" class="text-xs text-red-600 mt-1">
              {{ $t('vehicles.validationPositiveNumber') || 'Must be greater than 0' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('labels.crusherCapacity') }}</label>
            <input v-model="editForm.crusherCapacity" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2 text-sm" />
            <p v-if="editForm.crusherCapacity && Number(editForm.crusherCapacity) <= 0" class="text-xs text-red-600 mt-1">
              {{ $t('vehicles.validationPositiveNumber') || 'Must be greater than 0' }}
            </p>
          </div>
          <div class="flex gap-2 justify-end pt-4 sm:col-span-2">
            <button type="button" @click="closeEditModal" class="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">{{ $t('labels.cancel') || 'Cancel' }}</button>
            <button type="submit" :disabled="editLoading" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{{ editLoading ? $t('labels.saving') : $t('labels.save') || 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmVehicle" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4" style="margin-top: 0 !important;">
      <div class="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm z-50 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ $t('labels.confirmDelete') || 'Confirm Delete' }}</h3>
        <p class="text-gray-700 mb-6">{{ $t('vehicles.deleteConfirmMsg') || 'Are you sure you want to delete' }} "{{ deleteConfirmVehicle.name }}"?</p>
        <div class="flex gap-2 justify-end">
          <button @click="closeDeleteConfirm" class="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">{{ $t('labels.cancel') || 'Cancel' }}</button>
          <button @click="onConfirmDelete" :disabled="deleteLoading" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{{ deleteLoading ? $t('labels.deleting') : $t('labels.delete') || 'Delete' }}</button>
        </div>
      </div>
    </div>

    <!-- Pagination Component -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :total-pages="totalPages"
      :page-size-options="[10, 20, 50, 100]"
      @update:page="page = $event; loadVehicles()"
      @update:pageSize="pageSize = $event; page = 1; loadVehicles()"
    />

    <!-- Vehicle details modal (ownership + drivers) -->
    <div
      v-if="selectedVehicle"
      class="fixed inset-0 z-40 flex items-center justify-center"
    >
      <div class="fixed inset-0 bg-black bg-opacity-40" @click="closeVehicleDetails"></div>
      <div class="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-50">
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 class="text-lg font-semibold">
              {{ selectedVehicle.name }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ $t('vehicles.detailsSubtitle') }}
            </p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeVehicleDetails">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="px-5 pt-4 pb-5 overflow-y-auto space-y-6 max-h-[80vh]">
          <!-- Current contractor + change owner -->
          <section class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-800">
              {{ $t('vehicles.currentOwner') }}
            </h4>
            <div class="p-3 rounded border bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div class="text-sm text-gray-700">
                <div>
                  <span class="font-medium">{{ $t('vehicles.contractor') }}:</span>
                  <span class="ml-1">
                    {{ selectedVehicle.contractor ? selectedVehicle.contractor.name : $t('vehicles.noOwner') }}
                  </span>
                </div>
              </div>
              <form
                class="flex flex-col md:flex-row gap-2 items-stretch md:items-center"
                @submit.prevent="onChangeOwner"
              >
                <select
                  v-model.number="changeOwnerForm.contractorId"
                  class="border rounded px-2 py-1 text-sm min-w-[180px]"
                  required
                >
                  <option disabled value="">
                    {{ $t('vehicles.selectNewOwner') }}
                  </option>
                  <option
                    v-for="c in contractors"
                    :key="c.id"
                    :value="c.id"
                  >
                    {{ c.name }}
                  </option>
                </select>
                <DateTimeField v-model="changeOwnerForm.effectiveDate" class="border rounded px-2 py-1 text-sm" />
                <button
                  type="submit"
                  class="px-3 py-1.5 text-xs md:text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  :disabled="changeOwnerLoading"
                >
                  <span v-if="changeOwnerLoading">{{ $t('labels.saving') }}</span>
                  <span v-else>{{ $t('vehicles.changeOwner') }}</span>
                </button>
              </form>
            </div>
          </section>

          <!-- Ownership history -->
          <section class="space-y-2">
            <h4 class="text-sm font-semibold text-gray-800">
              {{ $t('vehicles.ownershipHistory') }}
            </h4>
            <div class="border rounded overflow-hidden bg-white">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('vehicles.owner') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('labels.startDate') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('labels.endDate') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="ownershipLoading">
                    <td class="px-3 py-3 text-center text-gray-500" colspan="3">
                      {{ $t('labels.loading') }}
                    </td>
                  </tr>
                  <tr v-else-if="ownershipHistory.length === 0">
                    <td class="px-3 py-3 text-center text-gray-500" colspan="3">
                      {{ $t('vehicles.noOwnershipHistory') }}
                    </td>
                  </tr>
                  <tr
                    v-for="row in ownershipHistory"
                    :key="row.id"
                    class="border-t"
                  >
                    <td class="px-3 py-2">
                      {{ row.contractor?.name || row.contractorId }}
                    </td>
                    <td class="px-3 py-2">
                      {{ formatDateTime(row.startedAt) }}
                    </td>
                    <td class="px-3 py-2">
                      {{ row.endedAt ? formatDateTime(row.endedAt) : $t('vehicles.stillOwner') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Drivers section removed -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getVehicles,
  getContractors,
  changeVehicleOwner,
  getVehicleOwnershipHistory,
  updateVehicle,
  deleteVehicle
} from '../../../api'
import CreateVehicle from './CreateVehicle.vue'
import Pagination from '../../shared/Pagination.vue'
import DateTimeField from '@/components/shared/DateTimeField.vue'
import { ArrowsRightLeftIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'VehiclesList',
  props: {
    mode: { type: String, default: 'transport' }
  },
  emits: ["navigateReport", "navigateStatement"],
  components: { ArrowsRightLeftIcon, CreateVehicle, DateTimeField, Pagination, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon },
  data() {
    return {
      vehicles: [],
      contractors: [],
      selectedVehicle: null,
      ownershipHistory: [],
      ownershipLoading: false,
      changeOwnerLoading: false,
      changeOwnerForm: {
        contractorId: '',
        effectiveDate: ''
      },
      // driver assignment removed
      page: 1,
      pageSize: 20,
      total: 0
      ,
      // Context menu state for right-click menu
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        vehicle: null
      },
      // Edit vehicle modal
      editingVehicle: null,
      editForm: {
        name: '',
        crusherCapacity: '',
        companyCapacity: ''
      },
      editLoading: false,
      // Delete confirmation modal
      deleteConfirmVehicle: null,
      deleteLoading: false
      ,
      showCreateModal: false
    }
  },
  computed: {
    isRTL() {
      return this.$i18n && this.$i18n.locale === 'ar'
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.page - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
    
  },
  methods: {
    /**
     * Extract driver name from vehicle's assignments array
     */
    // driver name helper removed
    /**
     * Extract error message from API response
     */
    extractErrorMessage(error) {
      // Check for various error response formats
      if (error.response?.data?.message) {
        return error.response.data.message
      }
      if (error.response?.data?.error) {
        return error.response.data.error
      }
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        if (Array.isArray(errors) && errors.length > 0) {
          return errors[0].message || errors[0]
        }
        if (typeof errors === 'object') {
          const firstError = Object.values(errors)[0]
          return Array.isArray(firstError) ? firstError[0] : firstError
        }
      }
      if (error.response?.statusText) {
        return `${error.response.status} ${error.response.statusText}`
      }
      if (error.message) {
        return error.message
      }
      return this.$t('errors.unknown') || 'An error occurred'
    },
    async loadVehicles() {
      try {
        const res = await getVehicles({
          page: this.page,
          pageSize: this.pageSize,
          mode: this.mode
        });
        const payload = res.data || {}
        this.vehicles = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];
        const meta = payload.meta || {}
        this.total = meta.total ?? payload.total ?? this.vehicles.length
        this.page = meta.page ?? this.page
        this.pageSize = meta.pageSize ?? meta.perPage ?? payload.pageSize ?? payload.perPage ?? this.pageSize
      } catch (e) {
        console.error('Error loading vehicles', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
        this.vehicles = []
      }
    },
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.loadVehicles()
      }
    },
    onPageSizeChange() {
      this.page = 1
      this.loadVehicles()
    },
    async loadContractors() {
      try {
        const res = await getContractors({ mode: this.mode })
        const payload = res.data || {}
        this.contractors = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : []
      } catch (e) {
        console.error('Error loading contractors', e)
        this.contractors = []
      }
    },
    async openVehicleDetails(vehicle) {
      this.selectedVehicle = vehicle
      this.changeOwnerForm = {
        contractorId: vehicle.contractor ? vehicle.contractor.id : '',
        effectiveDate: ''
      }
      // driver assignment removed; only load ownership history
      await this.refreshOwnershipHistory()
    },
    // Right-click / context menu handler for rows
    onRowContextMenu(event, vehicle) {
      // compute absolute coordinates including scroll
      const x = event.clientX + (window.scrollX || window.pageXOffset || 0) + 2
      const y = event.clientY + (window.scrollY || window.pageYOffset || 0) + 2

      // basic viewport adjustment to keep menu visible
      const menuWidth = 224 // approx w-56
      const maxX = (window.innerWidth || document.documentElement.clientWidth) + (window.scrollX || 0)
      const adjustedX = x + menuWidth > maxX ? Math.max((maxX - menuWidth - 8), 8) : x

      const menuHeightEstimate = 160
      const maxY = (window.innerHeight || document.documentElement.clientHeight) + (window.scrollY || 0)
      const adjustedY = y + menuHeightEstimate > maxY ? Math.max((maxY - menuHeightEstimate - 8), 8) : y

      this.contextMenu.x = adjustedX
      this.contextMenu.y = adjustedY
      this.contextMenu.vehicle = vehicle
      this.contextMenu.visible = true
    },

    hideContextMenu() {
      this.contextMenu.visible = false
      this.contextMenu.vehicle = null
    },

    // Click outside handler to hide the menu
    onGlobalClick(e) {
      if (!this.contextMenu.visible) return
      const menu = this.$refs.contextMenuRef
      if (menu && !menu.contains(e.target)) {
        this.hideContextMenu()
      }
    },

    // Keydown handler (Esc to close)
    onGlobalKeydown(e) {
      if (e.key === 'Escape' && this.contextMenu.visible) {
        this.hideContextMenu()
      }
    },

    // When the context menu option is clicked
    onContextMenuSelectManage() {
      if (this.contextMenu.vehicle) {
        this.openVehicleDetails(this.contextMenu.vehicle)
      }
      this.hideContextMenu()
    },
    onContextMenuSelectEdit() {
      if (this.contextMenu.vehicle) {
        this.openEditModal(this.contextMenu.vehicle)
      }
      this.hideContextMenu()
    },
    onContextMenuSelectDelete() {
      if (this.contextMenu.vehicle) {
        this.openDeleteConfirm(this.contextMenu.vehicle)
      }
      this.hideContextMenu()
    },
    // Edit vehicle modal
    openEditModal(vehicle) {
      this.editingVehicle = vehicle
      this.editForm = {
        name: vehicle.name,
        crusherCapacity: vehicle.crusherCapacity || '',
        companyCapacity: vehicle.companyCapacity || ''
      }
    },
    closeEditModal() {
      this.editingVehicle = null
      this.editForm = { name: '', crusherCapacity: '', companyCapacity: '' }
    },
    openCreateModal() {
      this.showCreateModal = true
    },
    closeCreateModal() {
      this.showCreateModal = false
    },
    onCreatedFromModal() {
      this.loadVehicles()
      this.closeCreateModal()
    },
    async onSaveEdit() {
      if (!this.editingVehicle || !this.editForm.name) return
      
      // Validate numeric fields if provided
      const companyCapacityValue = this.editForm.companyCapacity ? Number(this.editForm.companyCapacity) : null
      const crusherCapacityValue = this.editForm.crusherCapacity ? Number(this.editForm.crusherCapacity) : null
      
      if (companyCapacityValue !== null && companyCapacityValue <= 0) {
        if (window.$toast) {
          window.$toast(this.$t('vehicles.validationPositiveNumber') || 'Cubic Capacity must be greater than 0', 'error', 5000)
        }
        return
      }
      
      if (crusherCapacityValue !== null && crusherCapacityValue <= 0) {
        if (window.$toast) {
          window.$toast(this.$t('vehicles.validationPositiveNumber') || 'Crusher Cubic must be greater than 0', 'error', 5000)
        }
        return
      }
      
      this.editLoading = true
      try {
        const payload = {
          name: this.editForm.name
        }
        
        // Only include crusherCapacity if it's a valid number > 0
        if (crusherCapacityValue !== null && crusherCapacityValue > 0) {
          payload.crusherCapacity = crusherCapacityValue
        }
        
        // Only include companyCapacity if it's a valid number > 0
        if (companyCapacityValue !== null && companyCapacityValue > 0) {
          payload.companyCapacity = companyCapacityValue
        }
        
        await updateVehicle(this.editingVehicle.id, payload)
        if (window.$toast) {
          window.$toast(this.$t('vehicles.updateSuccess') || 'Vehicle updated successfully', 'success')
        }
        await this.loadVehicles()
        this.closeEditModal()
      } catch (e) {
        console.error('Error updating vehicle', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
      } finally {
        this.editLoading = false
      }
    },
    // Delete vehicle
    openDeleteConfirm(vehicle) {
      this.deleteConfirmVehicle = vehicle
    },
    closeDeleteConfirm() {
      this.deleteConfirmVehicle = null
    },
    async onConfirmDelete() {
      if (!this.deleteConfirmVehicle) return
      this.deleteLoading = true
      try {
        const params = {}
        if (this.mode === 'export' || this.mode === 'transport') params.mode = this.mode

        const res = await deleteVehicle(this.deleteConfirmVehicle.id, params)
        const data = res?.data ?? null
        const status = res?.status ?? null

        // Detect explicit failure responses even when the request did not throw
        const bodyIndicatesError = data && (data.error || data.success === false || (data.message && typeof data.message === 'string' && /error/i.test(data.message)))
        const httpError = status && status >= 400

        if (httpError || bodyIndicatesError) {
          const errorMsg = (data && (data.message || data.error)) || (this.$t('errors.unknown') || 'Delete failed')
          if (window.$toast) window.$toast(errorMsg, 'error', 5000)
        } else {
          if ((res && res.status === 204) || (data && data.deletedAt)) {
            if (window.$toast) window.$toast(this.$t('vehicles.deleteSuccess') || 'Vehicle deleted successfully', 'success')
          } else if (data && !data.deletedAt && params.mode) {
            if (window.$toast) window.$toast(this.$t('vehicles.availabilityRemoved') || `Availability removed for ${params.mode}`, 'success')
          } else {
            if (window.$toast) window.$toast(this.$t('vehicles.deleteSuccess') || 'Vehicle deleted successfully', 'success')
          }
          await this.loadVehicles()
          this.closeDeleteConfirm()
        }
      } catch (e) {
        console.error('Error deleting vehicle', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
      } finally {
        this.deleteLoading = false
      }
    },
    closeVehicleDetails() {
      this.selectedVehicle = null
      this.ownershipHistory = []
      // driver-related state removed
    },
    async refreshOwnershipHistory() {
      if (!this.selectedVehicle) return
      this.ownershipLoading = true
      try {
        const res = await getVehicleOwnershipHistory(this.selectedVehicle.id)
        this.ownershipHistory = Array.isArray(res.data) ? res.data : []
      } catch (e) {
        console.error('Error loading ownership history', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
        this.ownershipHistory = []
      } finally {
        this.ownershipLoading = false
      }
    },
    async onChangeOwner() {
      if (!this.selectedVehicle || !this.changeOwnerForm.contractorId) return
      this.changeOwnerLoading = true
      try {
        const payload = {
          contractorId: this.changeOwnerForm.contractorId
        }
        if (this.changeOwnerForm.effectiveDate) {
          payload.effectiveDate = new Date(this.changeOwnerForm.effectiveDate).toISOString()
        }
        await changeVehicleOwner(this.selectedVehicle.id, payload)
        // update UI immediately so cards show the new owner without waiting for refetch
        const contractor = this.contractors.find(c => c.id === this.changeOwnerForm.contractorId) || null
        this.applyVehicleUpdates({
          contractor,
          contractorId: contractor ? contractor.id : this.changeOwnerForm.contractorId
        })
        if (window.$toast) {
          window.$toast(this.$t('vehicles.changeOwnerSuccess') || 'Owner changed successfully', 'success')
        }
        await this.loadVehicles()
        const updated = this.vehicles.find(v => v.id === this.selectedVehicle.id)
        if (updated) {
          this.selectedVehicle = updated
        }
        await this.refreshOwnershipHistory()
        // Reset form
        this.changeOwnerForm = {
          contractorId: '',
          effectiveDate: ''
        }
      } catch (e) {
        console.error('Error changing vehicle owner', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
      } finally {
        this.changeOwnerLoading = false
      }
    },
    
    formatDateTime(value) {
      if (!value) return '-'
      try {
        const d = new Date(value)
        if (Number.isNaN(d.getTime())) return value
        return d.toLocaleString()
      } catch (e) {
        return value
      }
    },
    applyVehicleUpdates(partial) {
      if (!this.selectedVehicle) return
      const merged = { ...this.selectedVehicle, ...partial }
      const idx = this.vehicles.findIndex(v => v.id === merged.id)
      if (idx !== -1) {
        this.vehicles.splice(idx, 1, merged)
      }
      this.selectedVehicle = merged
    }
  },
  async mounted() {
    try {
      await this.loadVehicles()
      await this.loadContractors()
      // register global listeners for hiding context menu
      document.addEventListener('click', this.onGlobalClick)
      document.addEventListener('keydown', this.onGlobalKeydown)
    } catch (e) {
      this.vehicles = []
    }
  }

  ,
  beforeUnmount() {
    // cleanup listeners
    document.removeEventListener('click', this.onGlobalClick)
    document.removeEventListener('keydown', this.onGlobalKeydown)
  }
}
</script>

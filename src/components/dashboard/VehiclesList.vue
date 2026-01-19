<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl' : ''" class="space-y-6">
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('vehicles.title') }}</h2>
  </div>
  <div class="space-y-4">
    <CreateVehicle @created="loadVehicles" />

    <div v-if="vehicles.length === 0" class="p-4 bg-white rounded border text-gray-500">
      {{ $t('vehicles.noResults') }}
    </div>

    <!-- Table view -->
    <div class="overflow-x-auto bg-white rounded border">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <!-- <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">ID</th> -->
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('vehicles.truckName') || 'Truck Name' }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('vehicles.contractor') }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('vehicles.crusherNumber') }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('vehicles.cubicCapacity') }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('labels.crusherCubic') }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('vehicles.driver') || 'Driver' }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">{{ $t('labels.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vehicles" :key="v.id"
              class="border-t hover:bg-gray-50"
              @contextmenu.prevent="onRowContextMenu($event, v)"
          >
            <!-- <td class="px-3 py-3 text-gray-700">{{ v.id }}</td> -->
            <td class="px-3 py-3 font-medium text-gray-800">{{ v.name }}</td>
            <td class="px-3 py-3 text-gray-700">{{ v.contractor?.name || '—' }}</td>
            <td class="px-3 py-3 text-gray-700">{{ v.crusherNumber || '—' }}</td>
            <td class="px-3 py-3 text-gray-700">{{ v.cubicCapacity != null && v.cubicCapacity !== '' ? v.cubicCapacity : '—' }}</td>
            <td class="px-3 py-3 text-gray-700">{{ v.crusherCubic != null && v.crusherCubic !== '' ? v.crusherCubic : '—' }}</td>
            <td class="px-3 py-3 text-gray-700">{{ getDriverName(v) || '—' }}</td>
            <td class="px-3 py-3 flex gap-2">
              <button
                class="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
                @click="openVehicleDetails(v)">
                {{ $t('vehicles.manageDriversAndOwnership') }}
              </button>
              <button
                class="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                @click="openEditModal(v)"
                :title="$t('labels.edit') || 'Edit'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <!-- <button
                class="p-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                @click="openDeleteConfirm(v)"
                :title="$t('labels.delete') || 'Delete'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button> -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Context menu (absolute positioned) -->
    <div v-if="contextMenu && contextMenu.visible"
         ref="contextMenuRef"
         :style="{ position: 'absolute', top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
         class="w-56 bg-white border rounded shadow-lg z-50 text-sm">
      <ul class="py-1">
        <li>
          <button
            @click="onContextMenuSelectManage"
            class="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700">
            {{ $t('vehicles.manageDriversAndOwnership') }}
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

    <!-- Edit Vehicle Modal -->
    <div v-if="editingVehicle" class="fixed inset-0 z-40 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-40" @click="closeEditModal"></div>
      <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md z-50 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ $t('labels.edit') || 'Edit' }} {{ editingVehicle.name }}</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal">✕</button>
        </div>
        <form @submit.prevent="onSaveEdit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.truckName') || 'Truck Name' }}</label>
            <input v-model="editForm.name" type="text" class="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('vehicles.cubicCapacity') }}</label>
            <input v-model="editForm.cubicCapacity" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2 text-sm" />
            <p v-if="editForm.cubicCapacity && Number(editForm.cubicCapacity) <= 0" class="text-xs text-red-600 mt-1">
              {{ $t('vehicles.validationPositiveNumber') || 'Must be greater than 0' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('labels.crusherCubic') }}</label>
            <input v-model="editForm.crusherCubic" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2 text-sm" />
            <p v-if="editForm.crusherCubic && Number(editForm.crusherCubic) <= 0" class="text-xs text-red-600 mt-1">
              {{ $t('vehicles.validationPositiveNumber') || 'Must be greater than 0' }}
            </p>
          </div>
          <div class="flex gap-2 justify-end pt-4">
            <button type="button" @click="closeEditModal" class="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">{{ $t('labels.cancel') || 'Cancel' }}</button>
            <button type="submit" :disabled="editLoading" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{{ editLoading ? $t('labels.saving') : $t('labels.save') || 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmVehicle" class="fixed inset-0 z-40 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-40" @click="closeDeleteConfirm"></div>
      <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md z-50 p-5">
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
      <div class="relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden z-50">
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 class="text-lg font-semibold">
              {{ selectedVehicle.name }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ $t('vehicles.detailsSubtitle') }}
            </p>
          </div>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="closeVehicleDetails"
          >
            ✕
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
                <input
                  v-model="changeOwnerForm.effectiveDate"
                  type="datetime-local"
                  class="border rounded px-2 py-1 text-sm"
                />
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
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">
                      {{ $t('vehicles.owner') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">
                      {{ $t('labels.startDate') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">
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

          <!-- Drivers -->
          <section class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm font-semibold text-gray-800">
                {{ $t('vehicles.drivers') }}
              </h4>
              <form
                class="flex flex-col md:flex-row gap-2 items-stretch md:items-center"
                @submit.prevent="onAssignDriver"
              >
                <select
                  v-model.number="assignDriverForm.driverId"
                  class="border rounded px-2 py-1 text-sm min-w-[180px]"
                  required
                >
                  <option disabled value="">
                    {{ $t('vehicles.selectDriver') }}
                  </option>
                  <option
                    v-for="d in filteredAvailableDrivers"
                    :key="d.id"
                    :value="d.id"
                  >
                    {{ d.name }} {{ d.phone ? `(${d.phone})` : '' }}
                  </option>
                </select>
                <label class="inline-flex items-center text-xs md:text-sm text-gray-700">
                  <input
                    v-model="assignDriverForm.isPrimary"
                    type="checkbox"
                    class="mr-1"
                  />
                  {{ $t('vehicles.primaryDriver') }}
                </label>
                <button
                  type="submit"
                  class="px-3 py-1.5 text-xs md:text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  :disabled="assignDriverLoading"
                >
                  <span v-if="assignDriverLoading">{{ $t('labels.saving') }}</span>
                  <span v-else>{{ $t('vehicles.assignDriver') }}</span>
                </button>
              </form>
            </div>

            <div class="border rounded overflow-hidden bg-white">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">
                      {{ $t('vehicles.driver') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">
                      {{ $t('vehicles.primary') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">
                      {{ $t('labels.startDate') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">
                      {{ $t('labels.endDate') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-start">
                      {{ $t('labels.actions') || 'Actions' }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="driversLoading">
                    <td class="px-3 py-3 text-center text-gray-500" colspan="5">
                      {{ $t('labels.loading') }}
                    </td>
                  </tr>
                  <tr v-else-if="driverHistory.length === 0">
                    <td class="px-3 py-3 text-center text-gray-500" colspan="5">
                      {{ $t('vehicles.noDriverHistory') }}
                    </td>
                  </tr>
                  <tr
                    v-for="row in driverHistory"
                    :key="row.id"
                    class="border-t"
                  >
                    <td class="px-3 py-2">
                      {{ row.driver?.name || row.driverId }}
                    </td>
                    <td class="px-3 py-2">
                      <span
                        v-if="row.isPrimary === true || row.isPrimary === 'true'"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                         {{ $t('vehicles.primary') }}
                      </span>
                      <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                         {{ $t('vehicles.secondary') || 'Secondary' }}
                      </span>
                    </td>
                    <td class="px-3 py-2">
                      {{ formatDateTime(row.fromDate) }}
                    </td>
                    <td class="px-3 py-2">
                      {{ row.toDate ? formatDateTime(row.toDate) : row.isPrimary ? $t('vehicles.stillAssigned') : $t('vehicles.endDateNotSet') }}
                    </td>
                    <td class="px-3 py-2">
                      <button
                        @click="onUnassignDriver(row)"
                        :disabled="unassignDriverLoading[row.id]"
                        class="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        :title="$t('vehicles.unassignDriver') || 'Unassign Driver'"
                      >
                        {{ unassignDriverLoading[row.id] ? $t('labels.removing') || 'Removing...' : $t('vehicles.unassign') || 'Unassign' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getVehicles,
  getContractors,
  getDrivers,
  changeVehicleOwner,
  getVehicleOwnershipHistory,
  assignVehicleDriver,
  unassignVehicleDriver,
  getVehicleDriverHistory,
  updateVehicle,
  deleteVehicle
} from '../../api'
import CreateVehicle from './CreateVehicle.vue'
import Pagination from '../shared/Pagination.vue'

export default {
  name: 'VehiclesList',
  emits: ["navigateReport", "navigateStatement"],
  components: { CreateVehicle, Pagination },
  data() {
    return {
      vehicles: [],
      contractors: [],
      selectedVehicle: null,
      ownershipHistory: [],
      driverHistory: [],
      availableDrivers: [],
      ownershipLoading: false,
      driversLoading: false,
      changeOwnerLoading: false,
      assignDriverLoading: false,
      unassignDriverLoading: {},
      changeOwnerForm: {
        contractorId: '',
        effectiveDate: ''
      },
      assignDriverForm: {
        driverId: '',
        isPrimary: false
      },
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
        crusherCubic: '',
        cubicCapacity: ''
      },
      editLoading: false,
      // Delete confirmation modal
      deleteConfirmVehicle: null,
      deleteLoading: false
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
    filteredAvailableDrivers() {
      if (!this.selectedVehicle || !this.selectedVehicle.contractor) {
        return this.availableDrivers
      }
      // Filter drivers by selected vehicle's contractor
      const contractorId = this.selectedVehicle.contractor.id
      return this.availableDrivers.filter(driver => {
        return driver.contractorId === contractorId || !driver.contractorId
      })
    }
  },
  methods: {
    /**
     * Extract driver name from vehicle's assignments array
     */
    getDriverName(vehicle) {
      // Extract driver name from assignments array
      if (vehicle.assignments && vehicle.assignments.length > 0) {
        const primaryAssignment = vehicle.assignments.find(a => a.isPrimary) || vehicle.assignments[0]
        if (primaryAssignment && primaryAssignment.driver) {
          return primaryAssignment.driver.name
        }
      }
      // Fallback to old properties for backward compatibility
      return vehicle.driver?.name || vehicle.driverName || null
    },
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
          pageSize: this.pageSize
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
        const res = await getContractors()
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
      this.assignDriverForm = {
        driverId: '',
        isPrimary: false
      }
      await Promise.all([
        this.refreshOwnershipHistory(),
        this.refreshDriverHistory(),
        this.refreshAvailableDrivers()
      ])
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
        crusherCubic: vehicle.crusherCubic || '',
        cubicCapacity: vehicle.cubicCapacity || ''
      }
    },
    closeEditModal() {
      this.editingVehicle = null
      this.editForm = { name: '', crusherCubic: '', cubicCapacity: '' }
    },
    async onSaveEdit() {
      if (!this.editingVehicle || !this.editForm.name) return
      
      // Validate numeric fields if provided
      const cubicCapacityValue = this.editForm.cubicCapacity ? Number(this.editForm.cubicCapacity) : null
      const crusherCubicValue = this.editForm.crusherCubic ? Number(this.editForm.crusherCubic) : null
      
      if (cubicCapacityValue !== null && cubicCapacityValue <= 0) {
        if (window.$toast) {
          window.$toast(this.$t('vehicles.validationPositiveNumber') || 'Cubic Capacity must be greater than 0', 'error', 5000)
        }
        return
      }
      
      if (crusherCubicValue !== null && crusherCubicValue <= 0) {
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
        
        // Only include crusherCubic if it's a valid number > 0
        if (crusherCubicValue !== null && crusherCubicValue > 0) {
          payload.crusherCubic = crusherCubicValue
        }
        
        // Only include cubicCapacity if it's a valid number > 0
        if (cubicCapacityValue !== null && cubicCapacityValue > 0) {
          payload.cubicCapacity = cubicCapacityValue
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
        await deleteVehicle(this.deleteConfirmVehicle.id)
        if (window.$toast) {
          window.$toast(this.$t('vehicles.deleteSuccess') || 'Vehicle deleted successfully', 'success')
        }
        await this.loadVehicles()
        this.closeDeleteConfirm()
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
      this.driverHistory = []
      this.availableDrivers = []
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
    async refreshDriverHistory() {
      if (!this.selectedVehicle) return
      this.driversLoading = true
      try {
        const res = await getVehicleDriverHistory(this.selectedVehicle.id)
        this.driverHistory = Array.isArray(res.data) ? res.data : []
      } catch (e) {
        console.error('Error loading driver history', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
        this.driverHistory = []
      } finally {
        this.driversLoading = false
      }
    },
    async refreshAvailableDrivers() {
      try {
        // Load all drivers, not filtered by contractor
        const res = await getDrivers({ pageSize: 1000 })
        const driversPayload = res.data || {}
        this.availableDrivers = Array.isArray(driversPayload.items)
          ? driversPayload.items
          : Array.isArray(driversPayload.data)
            ? driversPayload.data
            : Array.isArray(driversPayload)
              ? driversPayload
              : []
      } catch (e) {
        console.error('Error loading available drivers', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
        this.availableDrivers = []
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
        await Promise.all([
          this.refreshOwnershipHistory(),
          this.refreshAvailableDrivers()
        ])
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
    async onAssignDriver() {
      if (!this.selectedVehicle || !this.assignDriverForm.driverId) return
      this.assignDriverLoading = true
      try {
        const payload = {
          driverId: this.assignDriverForm.driverId,
          isPrimary: !!this.assignDriverForm.isPrimary
        }
        await assignVehicleDriver(this.selectedVehicle.id, payload)
        if (window.$toast) {
          window.$toast(this.$t('vehicles.assignDriverSuccess') || 'Driver assigned successfully', 'success')
        }
        this.assignDriverForm = {
          driverId: '',
          isPrimary: false
        }
        await this.refreshDriverHistory()
      } catch (e) {
        console.error('Error assigning driver', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
      } finally {
        this.assignDriverLoading = false
      }
    },
    async onUnassignDriver(driverAssignment) {
      if (!this.selectedVehicle || !driverAssignment) return
      
      // Set loading state for this specific assignment
      this.unassignDriverLoading[driverAssignment.id] = true
      
      try {
        await unassignVehicleDriver(this.selectedVehicle.id, driverAssignment.driverId)
        if (window.$toast) {
          window.$toast(this.$t('vehicles.unassignDriverSuccess') || 'Driver unassigned successfully', 'success')
        }
        await this.refreshDriverHistory()
      } catch (e) {
        console.error('Error unassigning driver', e)
        const errorMsg = this.extractErrorMessage(e)
        if (window.$toast) {
          window.$toast(errorMsg, 'error', 5000)
        }
      } finally {
        this.unassignDriverLoading[driverAssignment.id] = false
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

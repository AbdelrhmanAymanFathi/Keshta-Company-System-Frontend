<template>
  <div class="space-y-4">
    <CreateVehicle @created="loadVehicles" />

    <div v-if="vehicles.length === 0" class="p-4 bg-white rounded border text-gray-500">
      {{ $t('vehicles.noResults') }}
    </div>

    <div class="space-y-4">
      <div
        v-for="v in vehicles"
        :key="v.id"
        class="p-4 border rounded-lg bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div>
          <div class="font-semibold text-lg">{{ v.name }}</div>
          <div class="mt-1 space-y-0.5 text-sm text-gray-600">
            <div>{{ $t('vehicles.crusherNumber') }}: <span class="font-medium">{{ v.crusherNumber || '-' }}</span></div>
            <div>{{ $t('vehicles.company') }}: <span class="font-medium">{{ v.company || '-' }}</span></div>
            <div>{{ $t('vehicles.cubicCapacity') }}: <span class="font-medium">{{ v.cubicCapacity != null && v.cubicCapacity !== '' ? v.cubicCapacity : '-' }}</span></div>
            <div v-if="v.contractor">
              {{ $t('vehicles.contractor') }}:
              <span class="font-medium">{{ v.contractor.name }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between md:justify-end gap-3">
          <div class="text-xs text-gray-400">ID: {{ v.id }}</div>
          <button
            class="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
            @click="openVehicleDetails(v)"
          >
            {{ $t('vehicles.manageDriversAndOwnership') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
      <!-- Mobile Pagination -->
      <div class="flex-1 flex justify-between sm:hidden">
        <button @click="changePage(page - 1)" 
          :disabled="page <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ $t('labels.previous') || 'Previous' }}
        </button>
        <span class="text-sm text-gray-700 self-center">
          {{ page }} / {{ totalPages }}
        </span>
        <button @click="changePage(page + 1)" 
          :disabled="page >= totalPages"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ $t('labels.next') || 'Next' }}
        </button>
      </div>

      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <p class="text-sm text-gray-700">
            {{ $t('labels.showing') || 'Showing' }} 
            <span class="font-medium">{{ ((page - 1) * pageSize) + 1 }}</span>
            {{ $t('labels.to') || 'to' }}
            <span class="font-medium">{{ Math.min(page * pageSize, total) }}</span>
            {{ $t('labels.of') || 'of' }}
            <span class="font-medium">{{ total }}</span>
            {{ $t('labels.results') || 'results' }}
          </p>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-700">{{ $t('labels.pageSize') || 'Page size' }}:</label>
            <select v-model="pageSize" @change="onPageSizeChange" 
              class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <!-- Page Numbers -->
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button @click="changePage(1)" 
              :disabled="page <= 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <button @click="changePage(page - 1)" 
              :disabled="page <= 1"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <template v-for="p in visiblePages" :key="p">
              <button @click="changePage(p)" 
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  p === page 
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]">
                {{ p }}
              </button>
            </template>

            <button @click="changePage(page + 1)" 
              :disabled="page >= totalPages"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <button @click="changePage(totalPages)" 
              :disabled="page >= totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10l-4.293-4.293a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>

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
                    v-for="d in availableDrivers"
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
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('vehicles.driver') }}
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('vehicles.primary') }}
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
                  <tr v-if="driversLoading">
                    <td class="px-3 py-3 text-center text-gray-500" colspan="4">
                      {{ $t('labels.loading') }}
                    </td>
                  </tr>
                  <tr v-else-if="driverHistory.length === 0">
                    <td class="px-3 py-3 text-center text-gray-500" colspan="4">
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
                        v-if="row.isPrimary"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {{ $t('vehicles.primary') }}
                      </span>
                      <span v-else class="text-xs text-gray-400">-</span>
                    </td>
                    <td class="px-3 py-2">
                      {{ formatDateTime(row.fromDate) }}
                    </td>
                    <td class="px-3 py-2">
                      {{ row.toDate ? formatDateTime(row.toDate) : $t('vehicles.stillAssigned') }}
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
  getVehicleDriverHistory
} from '../../api'
import CreateVehicle from './CreateVehicle.vue'

export default {
  name: 'VehiclesList',
  components: { CreateVehicle },
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
    }
  },
  computed: {
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
    }
  },
  methods: {
    async loadVehicles() {
      const res = await getVehicles({
        page: this.page,
        pageSize: this.pageSize
      });
      this.vehicles = Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
      this.total = res.data.total || this.vehicles.length
      this.pageSize = res.data.pageSize || this.pageSize
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
        this.contractors = Array.isArray(res.data) ? res.data : []
      } catch (e) {
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
        this.driverHistory = []
      } finally {
        this.driversLoading = false
      }
    },
    async refreshAvailableDrivers() {
      try {
        const params = {}
        if (this.selectedVehicle && this.selectedVehicle.contractor) {
          params.contractorId = this.selectedVehicle.contractor.id
        }
        const res = await getDrivers(params)
        this.availableDrivers = Array.isArray(res.data) ? res.data : []
      } catch (e) {
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
        await this.loadVehicles()
        const updated = this.vehicles.find(v => v.id === this.selectedVehicle.id)
        if (updated) {
          this.selectedVehicle = updated
        }
        await Promise.all([
          this.refreshOwnershipHistory(),
          this.refreshAvailableDrivers()
        ])
      } catch (e) {
        console.error('Error changing vehicle owner', e)
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
        this.assignDriverForm = {
          driverId: '',
          isPrimary: false
        }
        await this.refreshDriverHistory()
      } catch (e) {
        console.error('Error assigning driver', e)
      } finally {
        this.assignDriverLoading = false
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
    } catch (e) {
      this.vehicles = []
    }
  }
}
</script>

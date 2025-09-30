<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-start justify-between gap-4">
        <h2 class="text-2xl font-semibold">{{ $t('dashboard.newSupply') || 'New Supply' }}</h2>

        <div v-if="step2" class="hidden sm:flex flex-col items-end text-sm text-gray-600">
          <div><span class="font-medium">{{ $t('labels.site') }}:</span> {{ site ? site.name : '' }}</div>
          <div><span class="font-medium">{{ $t('labels.area') }}:</span> {{ area ? area.name : '' }}</div>
        </div>
      </div>

      <!-- Step 1: select site & area -->
      <div v-if="!step2" class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1 font-medium">{{ $t('labels.site') }}</label>
          <div class="flex gap-2">
            <select v-model="site" class="w-full border rounded-md px-3 py-2">
              <option :value="null">{{ $t('labels.site') }} —</option>
              <option v-for="s in sites" :key="s.id" :value="s">{{ s.name }}</option>
            </select>

            <!-- Add site -->
            <button @click="showAddSite = true" class="bg-green-500 text-white px-2 py-1 rounded" :title="$t('supply.addSite')">+</button>

            <!-- Edit selected site -->
            <button v-if="site" @click="editSiteDialog(site)" class="bg-yellow-400 text-white px-2 py-1 rounded" :title="$t('supply.editSite')">✎</button>
          </div>
        </div>

        <div>
          <label class="block mb-1 font-medium">{{ $t('labels.area') }}</label>
          <div class="flex gap-2">
            <select v-model="area" class="w-full border rounded-md px-3 py-2">
              <option :value="null">{{ $t('labels.area') }} —</option>
              <option v-for="a in areas" :key="a.id" :value="a">{{ a.name }}</option>
            </select>

            <!-- Add area (requires site) -->
            <button v-if="site" @click="showAddArea = true" class="bg-green-500 text-white px-2 py-1 rounded" :title="$t('supply.addArea')">+</button>

            <!-- Edit selected area -->
            <button v-if="area" @click="editAreaDialog(area)" class="bg-yellow-400 text-white px-2 py-1 rounded" :title="$t('supply.editArea')">✎</button>
          </div>
        </div>

        <div class="sm:col-span-2 flex items-center gap-3 mt-2">
          <button :disabled="!site || !area"
                  @click="goToTable"
                  class="ml-auto sm:ml-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50">
            {{ $t('labels.next') || 'Next' }}
          </button>

          <button v-if="site || area" @click="clearSiteArea" class="px-4 py-2 border rounded text-sm">
            {{ $t('labels.cancel') || 'Cancel' }}
          </button>
        </div>
      </div>

      <!-- Step 2: table -->
      <div v-else class="mt-6">
        <!-- mobile site/area row -->
        <div class="sm:hidden mb-4 text-sm text-gray-700">
          <div><span class="font-medium">{{ $t('labels.site') }}:</span> {{ site ? site.name : '' }}</div>
          <div><span class="font-medium">{{ $t('labels.area') }}:</span> {{ area ? area.name : '' }}</div>
        </div>

        <!-- ... table form omitted for brevity, kept same as before ... -->
        <!-- (Full table form + actions identical to previous working version) -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 border">
            <thead class="bg-indigo-50">
              <tr>
                <th class="px-3 py-2 w-10">#</th>
                <th class="px-3 py-2">{{ $t('labels.date') }}</th>
                <th class="px-3 py-2">{{ $t('labels.contractor') }}</th>
                <th class="px-3 py-2">{{ $t('labels.crusher') }}</th>
                <th class="px-3 py-2">{{ $t('labels.vehicle') }}</th>
                <th class="px-3 py-2">{{ $t('labels.crusherBon') }}</th>
                <th class="px-3 py-2">{{ $t('labels.companyBon') }}</th>
                <th class="px-3 py-2">{{ $t('labels.discount') }}</th>
                <th class="px-3 py-2">{{ $t('labels.price') }}</th>
                <th class="px-3 py-2">{{ $t('labels.cubic') }}</th>
                <th class="px-3 py-2">{{ $t('labels.total') }}</th>
                <th class="px-3 py-2">{{ $t('labels.actions') }}</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr v-for="(row, index) in rows" :key="row.id" class="bg-white">
                <td class="px-3 py-2 align-top text-sm">{{ index + 1 }}</td>

                <td class="px-3 py-2">
                  <input type="date" v-model="row.date" class="w-full border rounded-md px-2 py-1" />
                </td>

                <td class="px-3 py-2">
                  <select v-model="row.contractor" class="w-full border rounded-md px-2 py-1">
                    <option :value="null">{{ $t('labels.contractor') }} —</option>
                    <option v-for="c in contractors" :key="c.id" :value="c">{{ c.name }}</option>
                  </select>
                </td>

                <td class="px-3 py-2">
                  <select v-model="row.crusher" @change="updateVehicles(row)" class="w-full border rounded-md px-2 py-1">
                    <option :value="null">{{ $t('labels.crusher') }} —</option>
                    <option v-for="c in crushers" :key="c.id" :value="c">{{ c.name }}</option>
                  </select>
                </td>

                <td class="px-3 py-2">
                  <select v-model="row.vehicle" @change="onVehicleSelect(row)" class="w-full border rounded-md px-2 py-1">
                    <option :value="null">{{ $t('labels.vehicle') }} —</option>
                    <option v-for="v in row.availableVehicles" :key="v.id" :value="v">{{ v.name }}</option>
                  </select>
                </td>

                <td class="px-3 py-2">
                  <input type="text" v-model="row.crusherBon" class="w-full border rounded-md px-2 py-1" />
                </td>

                <td class="px-3 py-2">
                  <input type="text" v-model="row.companyBon" class="w-full border rounded-md px-2 py-1" />
                </td>

                <td class="px-3 py-2">
                  <input
                    type="number"
                    inputmode="numeric"
                    v-model.number="row.discount"
                    class="w-full border rounded-md px-2 py-1"
                    placeholder="0"
                  />
                </td>

                <td class="px-3 py-2">
                  <input
                    type="number"
                    step="any"
                    inputmode="decimal"
                    v-model.number="row.price"
                    class="w-full border rounded-md px-2 py-1 no-spinner"
                    placeholder="0"
                  />
                </td>

                <td class="px-3 py-2">
                  <input
                    type="number"
                    step="any"
                    inputmode="decimal"
                    v-model.number="row.cubic"
                    class="w-full border rounded-md px-2 py-1 no-spinner"
                    placeholder="0"
                  />
                </td>

                <td class="px-3 py-2 font-semibold">{{ formatNumber(totalPerRow(row)) }}</td>

                <td class="px-3 py-2">
                  <div class="flex gap-2">
                    <button @click="duplicateRow(index)" :title="$t('supply.duplicate')" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                      ⤷
                    </button>
                    <button @click="removeRow(index)" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- actions & summary -->
        <div class="mt-4 sm:flex sm:items-center sm:justify-between gap-4">
          <div class="flex gap-2">
            <button @click="addRow" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              {{ $t('labels.addRow') || 'Add row' }}
            </button>
            <button @click="resetRows" class="px-4 py-2 border rounded">{{ $t('supply.reset') }}</button>
          </div>

          <div class="mt-3 sm:mt-0 text-sm text-gray-700">
            <div><span class="font-medium">{{ $t('supply.subtotal') }}:</span> {{ formatNumber(subtotal) }}</div>
            <div><span class="font-medium">{{ $t('supply.totalDiscount') }}:</span> -{{ formatNumber(totalDiscount) }}</div>
            <div class="font-semibold mt-1">{{ $t('supply.grandTotal') }}: {{ formatNumber(grandTotal) }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ $t('supply.valuesCalculated') }}</div>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-3">
          <button @click="saveData" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {{ $t('labels.saveSupply') || 'Save' }}
          </button>
        </div>
        <div v-if="saveError" class="mt-2 text-red-600 text-sm">{{ saveError }}</div>

        <!-- Recent exports (kept from prior version) -->
        <div class="mt-8 border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">{{ $t('supply.recentExports') }}</h3>
            <div class="flex items-center gap-2">
              <button @click="fetchExports" :disabled="exportsLoading" class="px-3 py-1 border rounded bg-white hover:bg-gray-50">{{ $t('supply.refresh') }}</button>
              <div v-if="exportsLoading" class="text-sm text-gray-500">{{ $t('supply.loading') }}</div>
            </div>
          </div>

          <div class="mb-2 text-sm text-gray-600">
            {{ $t('supply.showing') }}: {{ displayedExports.length }} {{ $t('supply.of') }} {{ filteredExportsCount }}
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 border">
              <thead class="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th class="px-3 py-2">#</th>
                  <th class="px-3 py-2">Date</th>
                  <th class="px-3 py-2">Contractor</th>
                  <th class="px-3 py-2">Crusher</th>
                  <th class="px-3 py-2">Location</th>
                  <th class="px-3 py-2">Company Ticket</th>
                  <th class="px-3 py-2">Crusher Ticket</th>
                  <th class="px-3 py-2">Cubic</th>
                  <th class="px-3 py-2">Unit Price</th>
                  <th class="px-3 py-2">Discount</th>
                  <th class="px-3 py-2">Notes</th>
                  <th class="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 text-sm bg-white">
                <tr v-for="(it, idx) in displayedExports" :key="it.id">
                  <td class="px-3 py-2 align-top">{{ idx + 1 }}</td>
                  <td class="px-3 py-2 align-top">{{ formatDate(it.date) }}</td>
                  <td class="px-3 py-2 align-top">{{ it.contractor?.name || it.contractorId }}</td>
                  <td class="px-3 py-2 align-top">{{ it.crusher?.name || it.crusherId }}</td>
                  <td class="px-3 py-2 align-top">{{ it.location?.name || it.locationId }}</td>
                  <td class="px-3 py-2 align-top">{{ it.companyTicket || '-' }}</td>
                  <td class="px-3 py-2 align-top">{{ it.crusherTicket || '-' }}</td>
                  <td class="px-3 py-2 align-top">{{ it.companyCapacity || it.crusherCapacity || '-' }}</td>
                  <td class="px-3 py-2 align-top">{{ it.unitPrice || '-' }}</td>
                  <td class="px-3 py-2 align-top">{{ it.discount || '0' }}</td>
                  <td class="px-3 py-2 align-top break-words">{{ it.notes || '-' }}</td>
                  <td class="px-3 py-2 align-top">
                    <div class="flex gap-2">
                      <button @click="confirmDeleteExport(it.id)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!displayedExports || displayedExports.length === 0">
                  <td colspan="12" class="px-3 py-4 text-center text-sm text-gray-500">{{ $t('supply.noExportsFound') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 text-xs text-gray-600">{{ $t('supply.page') }}: {{ exportsData.page }} — {{ $t('supply.total') }}: {{ exportsData.total }} — {{ $t('supply.pageSize') }}: {{ exportsData.pageSize }}</div>
          
          <!-- Pagination Controls -->
          <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- Items per page selector -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">{{ $t('supply.itemsPerPage') }}:</label>
              <select v-model="itemsPerPage" @change="onItemsPerPageChange" class="border rounded px-2 py-1 text-sm">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <!-- Pagination buttons -->
            <div class="flex items-center gap-2">
              <!-- Previous button -->
              <button 
                @click="goToPreviousPage" 
                :disabled="exportsData.page <= 1"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {{ $t('supply.previous') }}
              </button>

              <!-- Page numbers -->
              <div class="flex items-center gap-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-1 text-sm border rounded',
                    page === exportsData.page 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
              </div>

              <!-- Next button -->
              <button 
                @click="goToNextPage" 
                :disabled="exportsData.page >= totalPages"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {{ $t('supply.next') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Site Dialog -->
    <div v-if="showAddSite" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3>
        <label class="block text-sm mb-1">{{ $t('supply.name') }}</label>
        <input v-model="newSiteName" :placeholder="$t('supply.siteName')" class="w-full border rounded px-2 py-1 mb-3" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddSite = false" class="px-3 py-1 border rounded">Cancel</button>
          <button @click="addSite" :disabled="!newSiteName || addingLocation" class="bg-green-600 text-white px-3 py-1 rounded">
            {{ addingLocation ? $t('supply.adding') : $t('supply.add') }}
          </button>
        </div>
        <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
      </div>
    </div>

    <!-- Add Area Dialog -->
    <div v-if="showAddArea" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-2">{{ $t('supply.addArea') }} ({{ $t('supply.under') }}: {{ site ? site.name : '-' }})</h3>
        <label class="block text-sm mb-1">{{ $t('supply.name') }}</label>
        <input v-model="newAreaName" :placeholder="$t('supply.areaName')" class="w-full border rounded px-2 py-1 mb-3" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddArea = false" class="px-3 py-1 border rounded">Cancel</button>
          <button @click="addArea" :disabled="!newAreaName || !site || addingLocation" class="bg-green-600 text-white px-3 py-1 rounded">
            {{ addingLocation ? $t('supply.adding') : $t('supply.add') }}
          </button>
        </div>
        <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
      </div>
    </div>

    <!-- Edit Site Dialog -->
    <div v-if="editSiteObj" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-2">{{ $t('supply.editSite') }}</h3>
        <label class="block text-sm mb-1">{{ $t('supply.name') }}</label>
        <input v-model="editSiteName" :placeholder="$t('supply.siteName')" class="w-full border rounded px-2 py-1 mb-3" />
        <div class="flex gap-2 justify-end">
          <button @click="editSiteObj = null" class="px-3 py-1 border rounded">Cancel</button>
          <button @click="updateSite" :disabled="!editSiteName || addingLocation" class="bg-yellow-500 text-white px-3 py-1 rounded">
            {{ addingLocation ? $t('supply.saving') : $t('supply.save') }}
          </button>
        </div>
        <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
      </div>
    </div>

    <!-- Edit Area Dialog -->
    <div v-if="editAreaObj" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-2">{{ $t('supply.editArea') }}</h3>
        <label class="block text-sm mb-1">{{ $t('supply.name') }}</label>
        <input v-model="editAreaName" :placeholder="$t('supply.areaName')" class="w-full border rounded px-2 py-1 mb-3" />
        <div class="flex gap-2 justify-end">
          <button @click="editAreaObj = null" class="px-3 py-1 border rounded">Cancel</button>
          <button @click="updateArea" :disabled="!editAreaName || addingLocation" class="bg-yellow-500 text-white px-3 py-1 rounded">
            {{ addingLocation ? $t('supply.saving') : $t('supply.save') }}
          </button>
        </div>
        <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import axios from 'axios'
import {
  createLocation,
  updateLocation,
  getLocations,
  getContractors,
  getCrushers,
  getVehicles,
  createDelivery,
  getDeliveries,
  deleteDelivery
} from '../../api'

export default {
  name: 'NewSupply',
  data() {
    return {
      step2: false,
      site: null,
      area: null,
      sites: [],
      areas: [],
      allLocations: [],

      rows: [
        {
          id: Date.now(),
          date: '',
          contractor: null,
          crusher: null,
          vehicle: null,
          crusherBon: '',
          companyBon: '',
          discount: 0,
          price: 0,
          cubic: 0,
          notes: '',
          availableVehicles: []
        }
      ],

      contractors: [],
      crushers: [],
      vehicles: [],
      saveError: '',
      locations: [],
      selectedLocation: null,
      deliveries: [],

      // dialogs and location creation state
      showAddSite: false,
      showAddArea: false,
      newSiteName: '',
      newAreaName: '',
      editSiteObj: null,
      editSiteName: '',
      editAreaObj: null,
      editAreaName: '',
      addingLocation: false,
      locationError: '',

      // exports list
      exportsData: { page: 1, pageSize: 20, total: 0, items: [] },
      exportsLoading: false,
      exportsError: '',
      
      // pagination
      itemsPerPage: 20,
      currentPage: 1
    }
  },

  async mounted() {
    // initial loads
    await this.refreshLocations();      // populates sites & areas
    await this.loadLookups();           // contractors, crushers, vehicles
    await this.fetchExports();          // recent exports
  },

  watch: {
    // when site changes update areas list
    site(newSite) {
      if (newSite && newSite.id) {
        this.areas = this.allLocations.filter(l => l.parentId === newSite.id);
      } else {
        this.areas = [];
      }
      // reset area selection when site changes
      this.area = null;
      // reset pagination when site changes
      this.currentPage = 1;
    },
    
    // reset pagination when area changes
    area() {
      this.currentPage = 1;
    }
  },

  computed: {
    isRTL() {
      return this.$i18n && this.$i18n.locale === 'ar'
    },
    subtotal() {
      return this.rows.reduce((sum, r) => sum + ((parseFloat(r.price || 0) * parseFloat(r.cubic || 0)) || 0), 0)
    },
    totalDiscount() {
      return this.rows.reduce((sum, r) => sum + (parseFloat(r.discount || 0) || 0), 0)
    },
    grandTotal() {
      const g = this.subtotal - this.totalDiscount
      return g > 0 ? g : 0
    },

    // filter exports client-side based on selected site/area
    displayedExports() {
      const items = Array.isArray(this.exportsData.items) ? this.exportsData.items : []
      let filteredItems = []
      
      if (this.area && this.area.id) {
        filteredItems = items.filter(it => Number(it.locationId) === Number(this.area.id))
      } else if (this.site && this.site.id) {
        const areaIds = this.allLocations.filter(l => l.parentId === this.site.id).map(l => Number(l.id))
        if (areaIds.length === 0) {
          filteredItems = items.filter(it => Number(it.locationId) === Number(this.site.id))
        } else {
          filteredItems = items.filter(it => areaIds.includes(Number(it.locationId)))
        }
      } else {
        filteredItems = items
      }
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      return filteredItems.slice(startIndex, endIndex)
    },
    
    // pagination computed properties
    totalPages() {
      const items = Array.isArray(this.exportsData.items) ? this.exportsData.items : []
      let filteredItems = []
      
      if (this.area && this.area.id) {
        filteredItems = items.filter(it => Number(it.locationId) === Number(this.area.id))
      } else if (this.site && this.site.id) {
        const areaIds = this.allLocations.filter(l => l.parentId === this.site.id).map(l => Number(l.id))
        if (areaIds.length === 0) {
          filteredItems = items.filter(it => Number(it.locationId) === Number(this.site.id))
        } else {
          filteredItems = items.filter(it => areaIds.includes(Number(it.locationId)))
        }
      } else {
        filteredItems = items
      }
      
      return Math.ceil(filteredItems.length / this.itemsPerPage)
    },
    
    visiblePages() {
      const total = this.totalPages
      const current = this.currentPage
      const pages = []
      
      if (total <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // Show first page
        pages.push(1)
        
        if (current > 3) {
          pages.push('...')
        }
        
        // Show pages around current page
        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)
        
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) {
            pages.push(i)
          }
        }
        
        if (current < total - 2) {
          pages.push('...')
        }
        
        // Show last page
        if (total > 1) {
          pages.push(total)
        }
      }
      
      return pages
    },
    
    filteredExportsCount() {
      const items = Array.isArray(this.exportsData.items) ? this.exportsData.items : []
      let filteredItems = []
      
      if (this.area && this.area.id) {
        filteredItems = items.filter(it => Number(it.locationId) === Number(this.area.id))
      } else if (this.site && this.site.id) {
        const areaIds = this.allLocations.filter(l => l.parentId === this.site.id).map(l => Number(l.id))
        if (areaIds.length === 0) {
          filteredItems = items.filter(it => Number(it.locationId) === Number(this.site.id))
        } else {
          filteredItems = items.filter(it => areaIds.includes(Number(it.locationId)))
        }
      } else {
        filteredItems = items
      }
      
      return filteredItems.length
    }
  },

  methods: {
    // load lookups
    async loadLookups() {
      try {
        const contRes = await getContractors(); this.contractors = Array.isArray(contRes.data) ? contRes.data : [];
      } catch (e) { console.warn('getContractors failed', e) }

      try {
        const crushersRes = await getCrushers(); this.crushers = Array.isArray(crushersRes.data) ? crushersRes.data : [];
      } catch (e) { console.warn('getCrushers failed', e) }

      try {
        const vehiclesRes = await getVehicles(); this.vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      } catch (e) { console.warn('getVehicles failed', e) }
    },

    // refresh locations from backend and keep selection by id if possible
    async refreshLocations() {
      try {
        const res = await getLocations();
        const list = Array.isArray(res.data) ? res.data : [];
        this.allLocations = list;
        // sites are those with parentId == null
        this.sites = this.allLocations.filter(l => l.parentId == null);

        // If we had a selected site/area, try to rebind the references from fresh list
        if (this.site && this.site.id) {
          const foundSite = this.allLocations.find(l => Number(l.id) === Number(this.site.id));
          this.site = foundSite || null;
        }
        if (this.site && this.site.id) {
          // update areas array for the selected site
          this.areas = this.allLocations.filter(l => l.parentId === this.site.id);
        } else {
          this.areas = [];
        }

        if (this.area && this.area.id) {
          const foundArea = this.allLocations.find(l => Number(l.id) === Number(this.area.id));
          this.area = foundArea || null;
        }

        this.locations = list;
      } catch (e) {
        console.warn('refreshLocations failed', e);
      }
    },

    // SITE / AREA CRUD — backend integration

    // create site (parentId = null)
    async addSite() {
      this.locationError = '';
      if (!this.newSiteName) return;
      this.addingLocation = true;
      try {
        const res = await createLocation({ name: String(this.newSiteName).trim(), parentId: null });
        // if server returns created object, set it immediately and refresh
        const created = res && res.data ? res.data : null;
        await this.refreshLocations();
        if (created && created.id) {
          // set selected site to the newly created record (find it in refreshed list)
          const found = this.allLocations.find(l => Number(l.id) === Number(created.id));
          if (found) this.site = found;
        }
        this.showAddSite = false;
        this.newSiteName = '';
      } catch (e) {
        console.error('addSite failed', e);
        this.locationError = 'Failed to add site.';
        // try to show message from server
        try {
          const msg = e?.response?.data?.message || e?.message;
          if (msg) this.locationError += ` ${msg}`;
        } catch {}
      } finally {
        this.addingLocation = false;
      }
    },

    // create area under selected site
    async addArea() {
      this.locationError = '';
      if (!this.newAreaName || !this.site || !this.site.id) {
        this.locationError = 'Please select a site first.';
        return;
      }
      this.addingLocation = true;
      try {
        const res = await createLocation({ name: String(this.newAreaName).trim(), parentId: Number(this.site.id) });
        const created = res && res.data ? res.data : null;
        await this.refreshLocations();
        // set area to created
        if (created && created.id) {
          const found = this.allLocations.find(l => Number(l.id) === Number(created.id));
          if (found) this.area = found;
        }
        this.showAddArea = false;
        this.newAreaName = '';
      } catch (e) {
        console.error('addArea failed', e);
        this.locationError = 'Failed to add area.';
        try {
          const msg = e?.response?.data?.message || e?.message;
          if (msg) this.locationError += ` ${msg}`;
        } catch {}
      } finally {
        this.addingLocation = false;
      }
    },

    // open edit site dialog
    editSiteDialog(site) {
      this.editSiteObj = site;
      this.editSiteName = site ? site.name : '';
    },

    // update site name
    async updateSite() {
      this.locationError = '';
      if (!this.editSiteObj || !this.editSiteName) return;
      this.addingLocation = true;
      try {
        const res = await updateLocation(this.editSiteObj.id, { name: String(this.editSiteName).trim() });
        const updated = res && res.data ? res.data : null;
        await this.refreshLocations();
        // rebind site selection to updated
        if (updated && updated.id) {
          const found = this.allLocations.find(l => Number(l.id) === Number(updated.id));
          if (found) this.site = found;
        }
        this.editSiteObj = null;
        this.editSiteName = '';
      } catch (e) {
        console.error('updateSite failed', e);
        this.locationError = 'Failed to update site.';
        try {
          const msg = e?.response?.data?.message || e?.message;
          if (msg) this.locationError += ` ${msg}`;
        } catch {}
      } finally {
        this.addingLocation = false;
      }
    },

    // open edit area dialog
    editAreaDialog(area) {
      this.editAreaObj = area;
      this.editAreaName = area ? area.name : '';
    },

    // update area name
    async updateArea() {
      this.locationError = '';
      if (!this.editAreaObj || !this.editAreaName) return;
      this.addingLocation = true;
      try {
        const res = await updateLocation(this.editAreaObj.id, { name: String(this.editAreaName).trim() });
        const updated = res && res.data ? res.data : null;
        await this.refreshLocations();
        // rebind area selection to updated
        if (updated && updated.id) {
          const found = this.allLocations.find(l => Number(l.id) === Number(updated.id));
          if (found) this.area = found;
        }
        this.editAreaObj = null;
        this.editAreaName = '';
      } catch (e) {
        console.error('updateArea failed', e);
        this.locationError = 'Failed to update area.';
        try {
          const msg = e?.response?.data?.message || e?.message;
          if (msg) this.locationError += ` ${msg}`;
        } catch {}
      } finally {
        this.addingLocation = false;
      }
    },

    // other helpers (rows, saving exports, etc.)
    goToTable() {
      if (!this.site || !this.area) return;
      this.step2 = true;
      if (this.rows && this.rows.length) {
        this.rows.forEach(r => { if (!r.date) r.date = new Date().toISOString().slice(0, 10); });
      }
    },

    clearSiteArea() { this.site = null; this.area = null; },

    addRow() {
      this.rows.push({
        id: Date.now() + Math.random(),
        date: '',
        contractor: null,
        crusher: null,
        vehicle: null,
        crusherBon: '',
        companyBon: '',
        discount: 0,
        price: 0,
        cubic: 0,
        notes: '',
        availableVehicles: []
      });
      this.$nextTick(() => {
        const tbl = this.$el.querySelector('table')
        if (tbl) tbl.scrollLeft = tbl.scrollWidth
      })
    },

    duplicateRow(index) { const src = this.rows[index]; const copy = JSON.parse(JSON.stringify(src)); copy.id = Date.now() + Math.random(); this.rows.splice(index + 1, 0, copy) },
    removeRow(index) { this.rows.splice(index, 1); if (this.rows.length === 0) this.addRow() },
    resetRows() { this.rows = [ { id: Date.now(), date: '', contractor: null, crusher: null, vehicle: null, crusherBon: '', companyBon: '', discount: 0, price: 0, cubic: 0, notes: '', availableVehicles: [] } ] },

    updateVehicles(row) {
      const selectedCrusher = row.crusher;
      row.availableVehicles = selectedCrusher ? selectedCrusher.vehicles : [];
      row.vehicle = null;
      row.cubic = 0;
    },

    onVehicleSelect(row) {
      const v = row.vehicle;
      if (v && v.cubic) row.cubic = v.cubic;
    },

    totalPerRow(row) {
      const price = parseFloat(row.price || 0) || 0;
      const cubic = parseFloat(row.cubic || 0) || 0;
      const discount = parseFloat(row.discount || 0) || 0;
      const total = (price * cubic) - discount;
      return total > 0 ? total : 0;
    },

    formatNumber(v) { return Number(v).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }) },

    async saveData() {
      this.saveError = '';
      try {
        // validate rows quickly
        const rowsToSave = this.rows.filter(r => {
          const hasAny =
            (r.date && r.date.toString().trim() !== '') ||
            (r.contractor) ||
            (r.crusher) ||
            (r.price && Number(r.price) !== 0) ||
            (r.cubic && Number(r.cubic) !== 0) ||
            (r.discount && Number(r.discount) !== 0) ||
            (r.crusherBon && r.crusherBon.toString().trim() !== '') ||
            (r.companyBon && r.companyBon.toString().trim() !== '');
          return hasAny;
        });

        if (rowsToSave.length === 0) {
          this.saveError = 'No rows to save. يرجى إدخال بيانات على الأقل في صف واحد.';
          return;
        }

        for (const [i, r] of rowsToSave.entries()) {
          const missing = [];
          if (!r.date || r.date.toString().trim() === '') missing.push('date');
          if (!r.contractor) missing.push('contractor');
          if (!r.crusher) missing.push('crusher');
          if (missing.length) {
            this.saveError = `Please fill required fields (${missing.join(', ')}) in row ${i + 1}. / من فضلك املأ: ${missing.join(', ')} في الصف ${i + 1}.`;
            return;
          }
        }

        const token = localStorage.getItem('accessToken');
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        for (const r of rowsToSave) {
          const payload = {
            crusherId: Number(r.crusher.id),
            contractorId: Number(r.contractor.id),
            locationId: this.area ? Number(this.area.id) : null,
            date: r.date,
            crusherTicket: r.crusherBon || null,
            companyTicket: r.companyBon || null,
            companyCapacity: r.cubic ? parseFloat(r.cubic) : 0,
            crusherCapacity: r.cubic ? parseFloat(r.cubic) : 0,
            unitPrice: r.price ? parseFloat(r.price) : 0,
            discount: r.discount ? parseFloat(r.discount) : 0
          };
          if (r.notes !== undefined && r.notes !== null && String(r.notes).trim() !== '') {
            payload.notes = String(r.notes);
          }
          await createDelivery(payload);
        }

        alert(this.$t('labels.saveSupply') + ' — OK');
        await this.fetchExports();
      } catch (e) {
        console.error('Error saving supply (full error):', e);
        const resp = e && e.response && e.response.data ? e.response.data : null;
        let userMsg = 'Error saving supply.';
        if (resp && resp.message) userMsg += ` ${resp.message}`;
        this.saveError = userMsg;
      }
    },

    // Exports list
    async fetchExports() {
      this.exportsError = '';
      this.exportsLoading = true;
      try {
        const res = await getDeliveries();
        if (res && res.data) {
          this.exportsData = {
            page: res.data.page || 1,
            pageSize: res.data.pageSize || (res.data.items ? res.data.items.length : 20),
            total: res.data.total || (res.data.items ? res.data.items.length : 0),
            items: Array.isArray(res.data.items) ? res.data.items : []
          };
        } else {
          this.exportsData = { page: 1, pageSize: 20, total: 0, items: [] };
        }
      } catch (e) {
        console.warn('getDeliveries failed', e);
        this.exportsError = 'Failed to load exports.';
      } finally {
        this.exportsLoading = false;
      }
    },

    confirmDeleteExport(id) {
      if (!confirm(this.$t('supply.confirmDeleteExport'))) return;
      this.deleteExport(id);
    },

    async deleteExport(id) {
      try {
        await deleteDelivery(id);
        await this.fetchExports();
      } catch (e) {
        console.warn('deleteExport failed', e);
        this.exportsError = 'Failed to delete export.';
      }
    },

    // pagination methods
    goToPage(page) {
      if (page !== '...' && page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    
    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    
    onItemsPerPageChange() {
      this.currentPage = 1 // Reset to first page when changing items per page
    },

    // small utilities
    formatDate(d) {
      if (!d) return '-';
      try {
        const dt = new Date(d);
        if (isNaN(dt)) return d;
        return dt.toISOString().slice(0, 10);
      } catch {
        return d;
      }
    }
  }
}
</script>

<style scoped>
/* remove number spinners for Chrome/Edge and Firefox so users type values only */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* RTL helpers */
.direction-rtl input,
.direction-rtl select,
.direction-rtl textarea {
  direction: rtl;
  text-align: right;
}

/* improve table readability on small screens */
@media (max-width: 639px) {
  table {
    display: none; /* hide big table on small screens (we show cards instead) */
  }
}
@media (min-width: 640px) {
  .sm\:hidden { display: none; }
}
</style>

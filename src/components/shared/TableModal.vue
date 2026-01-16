<template>
  <!-- Button to open the Modal (you can remove or change it depending on the page) -->
  <button v-if="showTriggerButton" @click="openModal"
    class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium shadow-md transition">
    {{ triggerButtonText }}
  </button>

  <!-- Modal -->
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 overflow-hidden"
      @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 class="text-2xl font-bold text-gray-800">{{ modalTitle }}</h2>
          <button @click="closeModal"
            class="text-gray-500 hover:text-gray-800 text-3xl leading-none focus:outline-none">
            ×
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Table -->
          <div class="overflow-x-auto mb-8">
            <table ref="tableRef" class="min-w-full divide-y divide-gray-200 border">
              <thead class="bg-indigo-50 sticky top-0 z-10">
                <tr>
                  <th class="px-3 py-3 text-center w-10">{{ $t('#') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.date') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.item') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.site') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.area') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.contractor') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.crusher') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.vehicle') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.crusherBon') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.companyBon') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.discount') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.price') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.cubic') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.crusherCubic') }}</th>
                  <th class="px-3 py-3 text-start">{{ $t('labels.total') }}</th>
                  <th class="px-3 py-3 text-center">{{ $t('labels.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="(row, index) in rows" :key="row.id">
                  <td class="px-3 py-2 text-center text-sm text-gray-600">{{ index + 1 }}</td>

                  <!-- Date -->
                  <td class="px-3 py-2">
                    <input type="date" v-model="row.date"
                      class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      @keydown.enter.prevent="handleEnterKey(index)" />
                  </td>

                  <!-- Item -->
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1">
                      <select v-model="row.item" @change="onItemSelect(row)"
                        class="flex-1 border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        @keydown.enter.prevent="handleEnterKey(index)">
                        <option :value="null">{{ $t('labels.item') }} —</option>
                        <option v-for="i in exportItems" :key="i.id" :value="i">{{ i.name }} ({{ i.currentPrice }})</option>
                        <option value="__new__" style="color: #10b981;">+ {{ $t('labels.addNew') }}</option>
                      </select>
                      <button v-if="row.item === '__new__'" @click="showAddExportItemDialog = true"
                        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm min-w-[32px]">
                        +
                      </button>
                    </div>
                  </td>

                  <!-- Site -->
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1">
                      <select v-model="row.site" @change="onSiteChange(row)"
                        class="flex-1 border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        @keydown.enter.prevent="handleEnterKey(index)">
                        <option :value="null">{{ $t('labels.site') }} —</option>
                        <option v-for="s in sites" :key="s.id" :value="s">{{ s.name }}</option>
                        <option value="__new__" style="color: #10b981;">+ {{ $t('supply.addNewSite') }}</option>
                      </select>
                      <button v-if="row.site === '__new__'" @click="showAddSite = true; pendingRow = row"
                        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm min-w-[32px]">
                        +
                      </button>
                    </div>
                  </td>

                  <!-- Area -->
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1">
                      <select v-model="row.area" :disabled="!row.site || row.site === '__new__'"
                        class="flex-1 border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        @keydown.enter.prevent="handleEnterKey(index)">
                        <option :value="null">{{ $t('labels.area') }} —</option>
                        <option v-for="a in row.availableAreas" :key="a.id" :value="a">{{ a.name }}</option>
                        <option value="__new__" style="color: #10b981;" :disabled="!row.site || row.site === '__new__'">
                          + {{ $t('supply.addNewArea') }}
                        </option>
                      </select>
                      <button v-if="row.area === '__new__'" @click="showAddArea = true; pendingRow = row"
                        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm min-w-[32px]">
                        +
                      </button>
                    </div>
                  </td>

                  <!-- Contractor -->
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1">
                      <select v-model="row.contractor" @change="onContractorChange(row)"
                        class="flex-1 border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        @keydown.enter.prevent="handleEnterKey(index)">
                        <option :value="null">{{ $t('labels.contractor') }} —</option>
                        <option v-for="c in contractors" :key="c.id" :value="c">{{ c.name }}</option>
                        <option value="__new__" style="color: #10b981;">+ {{ $t('labels.addNew') }}</option>
                      </select>
                      <button v-if="row.contractor === '__new__'" @click="showAddContractorDialog = true"
                        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm min-w-[32px]">
                        +
                      </button>
                    </div>
                  </td>

                  <!-- Crusher -->
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1">
                      <select v-model="row.crusher" @change="onCrusherChange(row)"
                        class="flex-1 border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        @keydown.enter.prevent="handleEnterKey(index)">
                        <option :value="null">{{ $t('labels.crusher') }} —</option>
                        <option v-for="c in crushers" :key="c.id" :value="c">{{ c.name }}</option>
                        <option value="__new__" style="color: #10b981;">+ {{ $t('labels.addNew') }}</option>
                      </select>
                      <button v-if="row.crusher === '__new__'" @click="showAddCrusherDialog = true"
                        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm min-w-[32px]">
                        +
                      </button>
                    </div>
                  </td>

                  <!-- Vehicle -->
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1">
                      <select v-model="row.vehicle" @change="onVehicleSelect(row)"
                        class="flex-1 border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        @keydown.enter.prevent="handleEnterKey(index)">
                        <option :value="null">{{ $t('labels.vehicle') }} —</option>
                        <option v-for="v in row.availableVehicles" :key="v.id" :value="v">{{ v.name }}</option>
                        <option value="__new__" style="color: #10b981;">+ {{ $t('labels.addNew') }}</option>
                      </select>
                      <button v-if="row.vehicle === '__new__'" @click="showAddVehicleDialog = true"
                        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm min-w-[32px]">
                        +
                      </button>
                    </div>
                  </td>

                  <!-- Crusher Bon -->
                  <td class="px-3 py-2">
                    <input type="text" v-model="row.crusherBon"
                      class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      @keydown.enter.prevent="handleEnterKey(index)" />
                  </td>

                  <!-- Company Bon -->
                  <td class="px-3 py-2">
                    <input type="text" v-model="row.companyBon"
                      class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      @keydown.enter.prevent="handleEnterKey(index)" />
                  </td>

                  <!-- Discount -->
                  <td class="px-3 py-2">
                    <input type="number" v-model.number="row.discount"
                      class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="0" @keydown.enter.prevent="handleEnterKey(index)" />
                  </td>

                  <!-- Price -->
                  <td class="px-3 py-2">
                    <input type="number" step="any" v-model.number="row.price"
                      class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 no-spinner"
                      placeholder="0" @keydown.enter.prevent="handleEnterKey(index)" />
                  </td>

                  <!-- Cubic -->
                  <td class="px-3 py-2">
                    <input type="number" step="any" v-model.number="row.cubic"
                      class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 no-spinner"
                      placeholder="0" @keydown.enter.prevent="handleEnterKey(index)" />
                  </td>

                  <!-- Crusher Cubic -->
                  <td class="px-3 py-2">
                    <input type="number" step="any" v-model.number="row.crusherCubic"
                      class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 no-spinner"
                      placeholder="-" @keydown.enter.prevent="handleEnterKey(index)" />
                  </td>

                  <!-- Total -->
                  <td class="px-3 py-2 font-semibold text-start">
                    {{ formatNumber(totalPerRow(row)) }}
                  </td>

                  <!-- Actions -->
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-2 justify-center">
                      <button @click="duplicateRow(index)"
                        class="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm" title="نسخ الصف">
                        ⤷
                      </button>
                      <button @click="removeRow(index)"
                        class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm" title="حذف الصف">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="mt-8 text-start space-y-1 text-sm">
            <div class="flex justify-end gap-8">
              <span class="text-gray-600">{{ $t('supply.subtotal') }}:</span>
              <span class="font-semibold text-indigo-700 w-24">{{ formatNumber(subtotal) }}</span>
            </div>
            <div class="flex justify-end gap-8">
              <span class="text-gray-600">{{ $t('supply.totalDiscount') }}:</span>
              <span class="font-semibold text-red-600 w-24">-{{ formatNumber(totalDiscount) }}</span>
            </div>
            <div class="flex justify-end gap-8 pt-2 border-t border-gray-300">
              <span class="text-gray-700 font-medium">{{ $t('supply.grandTotal') }}:</span>
              <span class="font-bold text-indigo-800 w-24">{{ formatNumber(grandTotal) }}</span>
            </div>
          </div>

          <!-- Save Button -->
          <div class="mt-10 flex justify-end">
            <button @click="saveData" :disabled="isSaving"
              class="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl text-xl font-medium shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isSaving ? $t('labels.saving') : $t('labels.saveSupply') }}
            </button>
          </div>
          <p v-if="saveError" class="mt-4 text-center text-red-600 font-medium text-lg">
            {{ saveError }}
          </p>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Dialog: Add Site -->
  <div v-if="showAddSite" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3>
      <input v-model="newSiteName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.siteName')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddSite = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
        <button @click="addSite" :disabled="!newSiteName || addingLocation"
          class="bg-green-600 text-white px-3 py-1 rounded">
          {{ addingLocation ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Area -->
  <div v-if="showAddArea" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('supply.addArea') }}</h3>
      <input v-model="newAreaName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.areaName')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddArea = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
        <button @click="addArea" :disabled="!newAreaName || addingLocation"
          class="bg-green-600 text-white px-3 py-1 rounded">
          {{ addingLocation ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Contractor -->
  <div v-if="showAddContractorDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('contractors.addContractor') }}</h3>
      <input v-model="newContractorName" class="w-full border rounded px-2 py-1 mb-3"
        :placeholder="$t('contractors.name')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddContractorDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel')
        }}</button>
        <button @click="createNewContractor" :disabled="!newContractorName || creatingContractor"
          class="bg-green-600 text-white px-3 py-1 rounded">
          {{ creatingContractor ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="contractorDialogError" class="text-red-600 text-sm mt-2">{{ contractorDialogError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Crusher -->
  <div v-if="showAddCrusherDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('crushers.addCrusher') }}</h3>
      <input v-model="newCrusherName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('crushers.name')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddCrusherDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel')
        }}</button>
        <button @click="createNewCrusher" :disabled="!newCrusherName || creatingCrusher"
          class="bg-green-600 text-white px-3 py-1 rounded">
          {{ creatingCrusher ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="crusherDialogError" class="text-red-600 text-sm mt-2">{{ crusherDialogError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Vehicle -->
  <div v-if="showAddVehicleDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-full max-w-md">
      <h3 class="text-lg font-bold mb-3">{{ $t('vehicles.addVehicle') }}</h3>
      <input v-model="newVehicleForm.name" :placeholder="$t('vehicles.name')"
        class="w-full border rounded px-2 py-1 mb-3" />
      <select v-model="newVehicleForm.contractorId" class="w-full border rounded px-2 py-1 mb-3">
        <option value="">{{ $t('labels.contractor') }} —</option>
        <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <input v-model.number="newVehicleForm.cubicCapacity" type="number" step="0.01"
        :placeholder="$t('vehicles.cubicCapacity')" class="w-full border rounded px-2 py-1 mb-3" />
      <input v-model.number="newVehicleForm.crusherCubic" type="number" step="0.01"
        :placeholder="$t('vehicles.crusherCubic') || $t('labels.crusherCubic')"
        class="w-full border rounded px-2 py-1 mb-3" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddVehicleDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel')
        }}</button>
        <button @click="createNewVehicle"
          :disabled="!newVehicleForm.name || !newVehicleForm.cubicCapacity || !newVehicleForm.crusherCubic || creatingVehicle"
          class="bg-green-600 text-white px-3 py-1 rounded">
          {{ creatingVehicle ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="vehicleDialogError" class="text-red-600 text-sm mt-2">{{ vehicleDialogError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Export Item -->
  <div v-if="showAddExportItemDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-3">{{ $t('labels.addExportItem') || 'Add Export Item' }}</h3>
      <input v-model="newExportItemForm.name" :placeholder="$t('labels.itemName') || 'Item Name'"
        class="w-full border rounded px-2 py-1 mb-3" />
      <input v-model.number="newExportItemForm.currentPrice" type="number" step="0.01"
        :placeholder="$t('labels.price')" class="w-full border rounded px-2 py-1 mb-3" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddExportItemDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel')
        }}</button>
        <button @click="createNewExportItem" :disabled="!newExportItemForm.name || !newExportItemForm.currentPrice || creatingExportItem"
          class="bg-green-600 text-white px-3 py-1 rounded">
          {{ creatingExportItem ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="exportItemDialogError" class="text-red-600 text-sm mt-2">{{ exportItemDialogError }}</div>
    </div>
  </div>
</template>

<script>
import {
  createLocation,
  getLocations,
  getContractors,
  getCrushers,
  getVehicles,
  getContractorsWithVehicles,
  createDelivery,
  createContractor,
  createCrusher,
  createVehicle,
  getExportItems,
  createExportItem
} from '@/api'

export default {
  name: 'TableModal',
  props: {
    showTriggerButton: {
      type: Boolean,
      default: true
    },
    triggerButtonText: {
      type: String,
      default() {
        return this.$t('dashboard.newSupply') + ' +'
      }
    },
    modalTitle: {
      type: String,
      default() {
        return this.$t('dashboard.newSupply')
      }
    }
  },
  data() {
    return {
      isOpen: false,
      isSaving: false,
      sites: [],
      allLocations: [],
      rows: [],
      contractors: [],
      contractorsWithVehicles: [],
      crushers: [],
      vehicles: [],
      exportItems: [],
      saveError: '',
      showAddSite: false,
      newSiteName: '',
      showAddArea: false,
      newAreaName: '',
      addingLocation: false,
      locationError: '',
      pendingRow: null,
      showAddContractorDialog: false,
      newContractorName: '',
      contractorDialogError: '',
      creatingContractor: false,
      showAddCrusherDialog: false,
      newCrusherName: '',
      crusherDialogError: '',
      creatingCrusher: false,
      showAddVehicleDialog: false,
      newVehicleForm: {
        name: '',
        contractorId: '',
        cubicCapacity: '',
        crusherCubic: ''
      },
      vehicleDialogError: '',
      creatingVehicle: false,
      showAddExportItemDialog: false,
      newExportItemForm: {
        name: '',
        currentPrice: ''
      },
      exportItemDialogError: '',
      creatingExportItem: false,
      // Reference to table element
      tableRef: null
    }
  },
  computed: {
    subtotal() {
      // Subtotal = sum of (price × cubic) for each row
      return this.rows.reduce((sum, row) => {
        const p = Number(row.price || 0)
        const c = Number(row.cubic || 0)
        return sum + (p * c)
      }, 0)
    },
    totalDiscount() {
      // Total discount = sum of (discount × price) for each row
      return this.rows.reduce((sum, row) => {
        const d = Number(row.discount || 0)
        const p = Number(row.price || 0)
        return sum + (d * p)
      }, 0)
    },
    grandTotal() {
      return Math.max(0, this.subtotal - this.totalDiscount)
    },
    isRTL() {
      return this.$i18n.locale === 'ar'
    }
  },
  async mounted() {
    // Create first row on load
    this.rows = [this.createEmptyRow()]
  },
  methods: {
    async openModal() {
      this.isOpen = true
      this.resetRows()
      await this.loadInitialData()
    },
    closeModal() {
      this.isOpen = false
      this.saveError = ''
    },
    async loadInitialData() {
      try {
        await Promise.all([
          this.refreshLocations(),
          this.loadLookups(),
          this.loadExportItems()
        ])
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    },
    createEmptyRow() {
      // Initialize empty row with default values
      return {
        id: Date.now() + Math.random(),
        date: '',
        site: null,
        area: null,
        availableAreas: [],
        contractor: null,
        crusher: null,
        vehicle: null,
        item: null,
        crusherBon: '',
        companyBon: '',
        discount: 0,
        price: 0,
        cubic: 0,
        crusherCubic: '',
        availableVehicles: []
      }
    },
    isRowEmpty(row) {
      return !row.date &&
        !row.site &&
        !row.area &&
        !row.contractor &&
        !row.crusher &&
        !row.vehicle &&
        !row.item &&
        !row.crusherBon?.trim() &&
        !row.companyBon?.trim() &&
        !row.discount &&
        !row.price &&
        !row.cubic &&
        !row.crusherCubic
    },
    // Check required fields only
    getMissingRequiredFields(row) {
      const missing = []
      if (!row.date) missing.push(this.$t('labels.date'))
      if (!row.site) missing.push(this.$t('labels.site'))
      if (!row.contractor) missing.push(this.$t('labels.contractor'))
      if (!row.crusher) missing.push(this.$t('labels.crusher'))
      if (!row.vehicle) missing.push(this.$t('labels.vehicle'))
      if (!row.item) missing.push(this.$t('labels.item') || 'item')
      if (!row.crusherBon?.trim()) missing.push(this.$t('labels.crusherBon'))
      if (!row.companyBon?.trim()) missing.push(this.$t('labels.companyBon'))
      const discount = Number(row.discount || 0)
      const price = Number(row.price || 0)
      const cubic = Number(row.cubic || 0)
      if (discount < 0) missing.push(this.$t('labels.discount') + ' (يجب أن تكون >= 0)')
      if (price <= 0) missing.push(this.$t('labels.price') + ' (يجب أن تكون > 0)')
      if (cubic <= 0) missing.push(this.$t('labels.cubic') + ' (يجب أن تكون > 0)')
      return missing
    },
    // Check warnings (warnings - do not prevent saving)
    getWarnings(row) {
      const warnings = []
      // If crusherCubic is empty, notify user
      if (!row.crusherCubic) {
        warnings.push(this.$t('labels.crusherCubic') + ' (optional)')
      }
      // If area is empty
      if (!row.area) {
        warnings.push(this.$t('labels.area') + ' (optional)')
      }
      return warnings
    },
    async refreshLocations() {
      try {
        const res = await getLocations()
        this.allLocations = Array.isArray(res.data) ? res.data : []
        this.sites = this.allLocations.filter(l => !l.parentId)
        this.rows.forEach(row => this.updateAvailableAreas(row))
      } catch (err) {
        console.warn('Failed to refresh locations', err)
      }
    },
    updateAvailableAreas(row) {
      row.availableAreas = row.site?.id
        ? this.allLocations.filter(l => l.parentId === row.site.id)
        : []
      if (row.area && !row.availableAreas.some(a => a.id === row.area?.id)) {
        row.area = null
      }
    },
    onSiteChange(row) {
      if (row.site === '__new__') {
        this.pendingRow = row
        this.showAddSite = true
        row.site = null
        return
      }
      this.updateAvailableAreas(row)
      row.area = null
    },
    async addSite() {
      if (!this.newSiteName?.trim()) return
      this.addingLocation = true
      try {
        const res = await createLocation({ name: this.newSiteName.trim(), parentId: null })
        await this.refreshLocations()
        const created = res?.data
        if (created?.id && this.pendingRow) {
          this.pendingRow.site = this.allLocations.find(l => l.id === created.id)
          this.updateAvailableAreas(this.pendingRow)
        }
        this.showAddSite = false
        this.newSiteName = ''
        this.pendingRow = null
      } catch (err) {
        this.locationError = err?.response?.data?.message || 'فشل إضافة الموقع'
      } finally {
        this.addingLocation = false
      }
    },
    async addArea() {
      if (!this.newAreaName?.trim() || !this.pendingRow?.site?.id) return
      this.addingLocation = true
      try {
        const res = await createLocation({
          name: this.newAreaName.trim(),
          parentId: this.pendingRow.site.id
        })
        await this.refreshLocations()
        const created = res?.data
        if (created?.id && this.pendingRow) {
          this.pendingRow.area = this.allLocations.find(l => l.id === created.id)
        }
        this.showAddArea = false
        this.newAreaName = ''
        this.pendingRow = null
      } catch (err) {
        this.locationError = err?.response?.data?.message || 'فشل إضافة المنطقة'
      } finally {
        this.addingLocation = false
      }
    },
    async loadExportItems() {
      try {
        const res = await getExportItems()
        this.exportItems = Array.isArray(res.data) ? res.data : []
      } catch (err) {
        console.warn('Failed to load export items', err)
      }
    },
    async loadLookups() {
      try {
        const [cRes, cvRes, crushRes, vRes] = await Promise.all([
          getContractors(),
          getContractorsWithVehicles(),
          getCrushers(),
          getVehicles()
        ])
        const extractArray = (res) => {
          const data = res?.data || res || {}
          return Array.isArray(data) ? data :
            Array.isArray(data.items) ? data.items :
              Array.isArray(data.data) ? data.data : []
        }
        this.contractors = extractArray(cRes)
        this.contractorsWithVehicles = extractArray(cvRes)
        this.crushers = extractArray(crushRes)
        this.vehicles = extractArray(vRes)
        this.rows.forEach(row => {
          row.availableVehicles = [...this.vehicles]
        })
      } catch (err) {
        console.error('loadLookups failed:', err)
      }
    },
    onContractorChange(row) {
      if (!row.contractor?.id) {
        row.availableVehicles = [...this.vehicles]
        row.vehicle = null
        return
      }
      const cv = this.contractorsWithVehicles.find(c => c.id === row.contractor.id)
      row.availableVehicles = cv?.vehicles?.length ? [...cv.vehicles] : this.vehicles.filter(v => v.contractorId === row.contractor.id)
      row.vehicle = null
    },
    onCrusherChange(row) {
      this.onContractorChange(row)
    },
    onVehicleSelect(row) {
      if (!row.vehicle) {
        row.cubic = 0
        row.crusherCubic = ''
        return
      }
      // Set cubic capacity from vehicle
      row.cubic = Number(row.vehicle.cubicCapacity ?? row.vehicle.cubic ?? 0)
      row.crusherCubic = row.vehicle.crusherCubic ? Number(row.vehicle.crusherCubic) : ''
    },
    onItemSelect(row) {
      if (!row.item || row.item === '__new__') {
        return
      }
      // Auto-populate price from item's currentPrice
      if (row.item.currentPrice) {
        row.price = Number(row.item.currentPrice)
      }
    },
    totalPerRow(row) {
      const p = Number(row.price || 0)
      const c = Number(row.cubic || 0)
      const d = Number(row.discount || 0)
      const subtotal = p * c
      // Discount = discount number × price
      const discountAmount = d * p
      return Math.max(0, subtotal - discountAmount)
    },
    formatNumber(v) {
      return Number(v || 0).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })
    },

    // Handle Enter key press in any field - add new row immediately
    handleEnterKey(rowIndex) {
      this.addRow()

      this.$nextTick(() => {
        if (!this.tableRef) return
        const allRows = this.tableRef.querySelectorAll('tbody tr')
        const newRow = allRows[rowIndex + 1]
        if (newRow) {
          const firstInput = newRow.querySelector('input[type="date"]')
          firstInput?.focus()
        }
      })
    },

    addRow() {
      this.rows.push(this.createEmptyRow())
    },
    duplicateRow(index) {
      const src = this.rows[index]
      if (!src) return
      const copy = JSON.parse(JSON.stringify(src))
      copy.id = Date.now() + Math.random()
      this.rows.splice(index + 1, 0, copy)
    },
    removeRow(index) {
      this.rows.splice(index, 1)
      if (this.rows.length === 0) this.addRow()
    },
    resetRows() {
      this.rows = [this.createEmptyRow()]
    },
    async saveData() {
      this.saveError = ''
      this.isSaving = true
      const toSave = this.rows.filter(r => !this.isRowEmpty(r))
      if (!toSave.length) {
        this.saveError = this.$t('labels.noData') || 'No data'
        this.isSaving = false
        return
      }
      // Check required fields
      for (const [i, r] of toSave.entries()) {
        const missing = this.getMissingRequiredFields(r)
        if (missing.length > 0) {
          this.saveError = `Row ${i + 1}: Required fields (${missing.join(', ')})`
          this.isSaving = false
          return
        }
      }
      try {
        for (const r of toSave) {
          const locationId = r.area?.id || r.site?.id
          if (!locationId) continue
          
          // Parse numeric values
          const price = Number(r.price || 0)
          const cubic = Number(r.cubic || 0)
          const discount = Number(r.discount || 0)
          
          await createDelivery({
            crusherId: Number(r.crusher.id),
            contractorId: Number(r.contractor.id),
            locationId: Number(locationId),
            date: r.date,
            crusherTicket: r.crusherBon || null,
            companyTicket: r.companyBon || null,
            companyCapacity: cubic > 0 ? cubic : null,
            crusherCapacity: cubic > 0 ? cubic : null,
            crusherCubic: r.crusherCubic ? Number(r.crusherCubic) : null,
            unitPrice: price > 0 ? price : null,
            discount: discount >= 0 ? discount : null,
            vehicleId: r.vehicle?.id ? Number(r.vehicle.id) : null,
            itemId: r.item?.id ? Number(r.item.id) : null
          })
        }
        alert(this.$t('labels.saved') || 'Saved successfully ✅')
        this.resetRows()
        this.closeModal()
        this.$emit('saved') // Notify parent of save
      } catch (err) {
        console.error('saveData error:', err)
        this.saveError = err?.response?.data?.message || this.$t('common.saveError') || 'Error saving'
      } finally {
        this.isSaving = false
      }
    },
    async createNewContractor() {
      const name = this.newContractorName.trim()
      if (!name) return
      this.creatingContractor = true
      this.contractorDialogError = ''
      try {
        const res = await createContractor({ name })
        const nc = res?.data
        if (!nc || !nc.id) {
          throw new Error('لم يتم إرجاع بيانات صحيحة من السيرفر')
        }
        this.contractors = [...this.contractors, nc]
        this.contractorsWithVehicles = [...this.contractorsWithVehicles, { ...nc, vehicles: [] }]
        const row = this.rows.find(r => r.contractor === '__new__')
        if (row) {
          row.contractor = nc
          this.onContractorChange(row)
        }
        this.newContractorName = ''
        this.showAddContractorDialog = false
        await this.loadLookups()
      } catch (e) {
        this.contractorDialogError = e?.response?.data?.message || e.message || this.$t('common.saveError') || 'Error'
      } finally {
        this.creatingContractor = false
      }
    },
    async createNewCrusher() {
      const name = this.newCrusherName.trim()
      if (!name) return
      this.creatingCrusher = true
      this.crusherDialogError = ''
      try {
        const res = await createCrusher({ name })
        const nc = res?.data
        if (!nc || !nc.id) {
          throw new Error('لم يتم إرجاع بيانات صحيحة من السيرفر')
        }
        this.crushers = [...this.crushers, nc]
        const row = this.rows.find(r => r.crusher === '__new__')
        if (row) {
          row.crusher = nc
          this.onCrusherChange(row)
        }
        this.newCrusherName = ''
        this.showAddCrusherDialog = false
        await this.loadLookups()
      } catch (e) {
        this.crusherDialogError = e?.response?.data?.message || e.message || this.$t('common.saveError') || 'Error'
      } finally {
        this.creatingCrusher = false
      }
    },
    async createNewVehicle() {
      const { name, contractorId, cubicCapacity, crusherCubic } = this.newVehicleForm
      if (!name.trim() || !cubicCapacity || !crusherCubic) {
        this.vehicleDialogError = this.$t('common.saveError') || 'Error'
        return
      }
      this.creatingVehicle = true
      this.vehicleDialogError = ''
      try {
        const res = await createVehicle({
          name: name.trim(),
          contractorId: contractorId ? Number(contractorId) : null,
          cubicCapacity: Number(cubicCapacity),
          crusherCubic: Number(crusherCubic)
        })
        const nv = res?.data
        if (!nv || !nv.id) {
          throw new Error('لم يتم إرجاع بيانات صحيحة من السيرفر')
        }
        this.vehicles = [...this.vehicles, nv]
        this.rows.forEach(r => {
          r.availableVehicles = [...this.vehicles]
        })
        const row = this.rows.find(r => r.vehicle === '__new__')
        if (row) {
          row.vehicle = nv
          this.onVehicleSelect(row)
        }
        this.newVehicleForm = { name: '', contractorId: '', cubicCapacity: '', crusherCubic: '' }
        this.showAddVehicleDialog = false
        await this.loadLookups()
      } catch (e) {
        this.vehicleDialogError = e?.response?.data?.message || e.message || this.$t('common.saveError') || 'Error'
      } finally {
        this.creatingVehicle = false
      }
    },
    async createNewExportItem() {
      const { name, currentPrice } = this.newExportItemForm
      if (!name.trim() || !currentPrice) {
        this.exportItemDialogError = this.$t('common.saveError') || 'Error'
        return
      }
      this.creatingExportItem = true
      this.exportItemDialogError = ''
      try {
        const res = await createExportItem({
          name: name.trim(),
          currentPrice: Number(currentPrice)
        })
        const newItem = res?.data
        if (!newItem || !newItem.id) {
          throw new Error('لم يتم إرجاع بيانات صحيحة من السيرفر')
        }
        this.exportItems = [...this.exportItems, newItem]
        const row = this.rows.find(r => r.item === '__new__')
        if (row) {
          row.item = newItem
          this.onItemSelect(row)
        }
        this.newExportItemForm = { name: '', currentPrice: '' }
        this.showAddExportItemDialog = false
        await this.loadExportItems()
      } catch (e) {
        this.exportItemDialogError = e?.response?.data?.message || e.message || this.$t('common.saveError') || 'Error'
      } finally {
        this.creatingExportItem = false
      }
    }
  }
}
</script>

<style scoped>
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner {
  -moz-appearance: textfield;
}

input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
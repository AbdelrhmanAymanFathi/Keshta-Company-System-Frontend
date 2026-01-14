<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6"
    @keydown.alt.n.prevent="addRow"
    @keydown.alt.s.prevent="saveData"
    @keydown.alt.r.prevent="resetRows"
    @keydown.alt.d.prevent="duplicateRow(rows.length - 1)">

    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-start justify-between gap-4 mb-6">
        <h2 class="text-2xl font-semibold">{{ $t('dashboard.newSupply') || 'توريد جديد' }}</h2>
      </div>

      <!-- الجدول -->
      <div class="overflow-x-auto mb-8">
        <table class="min-w-full divide-y divide-gray-200 border">
          <thead class="bg-indigo-50">
            <tr>
              <th class="px-3 py-2 w-10">#</th>
              <th class="px-3 py-2">{{ $t('labels.date') }}</th>
              <th class="px-3 py-2">{{ $t('labels.site') }}</th>
              <th class="px-3 py-2">{{ $t('labels.area') }}</th>
              <th class="px-3 py-2">{{ $t('labels.contractor') }}</th>
              <th class="px-3 py-2">{{ $t('labels.crusher') }}</th>
              <th class="px-3 py-2">{{ $t('labels.vehicle') }}</th>
              <th class="px-3 py-2">{{ $t('labels.crusherBon') }}</th>
              <th class="px-3 py-2">{{ $t('labels.companyBon') }}</th>
              <th class="px-3 py-2">{{ $t('labels.discount') }}</th>
              <th class="px-3 py-2">{{ $t('labels.price') }}</th>
              <th class="px-3 py-2">{{ $t('labels.cubic') }}</th>
              <th class="px-3 py-2">{{ $t('labels.crusherCubic') }}</th>
              <th class="px-3 py-2">{{ $t('labels.total') }}</th>
              <th class="px-3 py-2">{{ $t('labels.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(row, index) in rows" :key="row.id" class="bg-white">
              <td class="px-3 py-2 align-top text-sm">{{ index + 1 }}</td>
              <td class="px-3 py-2">
                <input type="date" v-model="row.date" class="w-full border rounded-md px-2 py-1"
                  @keydown.enter.prevent="handleEnter(index, 0)" @keydown.tab.prevent="focusNext(index, 0)" />
              </td>

              <!-- الموقع -->
              <td class="px-3 py-2">
                <div class="flex gap-1">
                  <select v-model="row.site" @change="onSiteChange(row)"
                    class="flex-1 border rounded-md px-2 py-1" @keydown.enter.prevent="handleEnter(index, 1)"
                    @keydown.tab.prevent="focusNext(index, 1)">
                    <option :value="null">{{ $t('labels.site') }} —</option>
                    <option v-for="s in sites" :key="s.id" :value="s">{{ s.name }}</option>
                    <option value="__new__" style="color: green;">+ {{ $t('supply.addNewSite') || 'إضافة موقع' }}</option>
                  </select>
                  <button v-if="row.site === '__new__'" @click="showAddSite = true; pendingRow = row"
                    class="bg-green-500 text-white px-2 py-1 rounded text-sm">+</button>
                </div>
              </td>

              <!-- المنطقة -->
              <td class="px-3 py-2">
                <div class="flex gap-1">
                  <select v-model="row.area" :disabled="!row.site || row.site === '__new__'"
                    class="flex-1 border rounded-md px-2 py-1" @keydown.enter.prevent="handleEnter(index, 2)"
                    @keydown.tab.prevent="focusNext(index, 2)">
                    <option :value="null">{{ $t('labels.area') }} —</option>
                    <option v-for="a in row.availableAreas" :key="a.id" :value="a">{{ a.name }}</option>
                    <option value="__new__" style="color: green;" :disabled="!row.site || row.site === '__new__'">+ {{ $t('supply.addNewArea') || 'إضافة منطقة' }}</option>
                  </select>
                  <button v-if="row.area === '__new__'" @click="showAddArea = true; pendingRow = row"
                    class="bg-green-500 text-white px-2 py-1 rounded text-sm">+</button>
                </div>
              </td>

              <td class="px-3 py-2">
                <div class="flex gap-1">
                  <select v-model="row.contractor" @change="onContractorChange(row)"
                    class="flex-1 border rounded-md px-2 py-1" @keydown.enter.prevent="handleEnter(index, 3)"
                    @keydown.tab.prevent="focusNext(index, 3)">
                    <option :value="null">{{ $t('labels.contractor') }} —</option>
                    <option v-for="c in contractors" :key="c.id" :value="c">{{ c.name }}</option>
                    <option value="__new__" style="color: green;">+ {{ $t('labels.addNew') }}</option>
                  </select>
                  <button v-if="row.contractor === '__new__'" @click="showAddContractorDialog = true"
                    class="bg-green-500 text-white px-2 py-1 rounded text-sm">+</button>
                </div>
              </td>

              <td class="px-3 py-2">
                <div class="flex gap-1">
                  <select v-model="row.crusher" @change="onCrusherChange(row)"
                    class="flex-1 border rounded-md px-2 py-1" @keydown.enter.prevent="handleEnter(index, 4)"
                    @keydown.tab.prevent="focusNext(index, 4)">
                    <option :value="null">{{ $t('labels.crusher') }} —</option>
                    <option v-for="c in crushers" :key="c.id" :value="c">{{ c.name }}</option>
                    <option value="__new__" style="color: green;">+ {{ $t('labels.addNew') }}</option>
                  </select>
                  <button v-if="row.crusher === '__new__'" @click="showAddCrusherDialog = true"
                    class="bg-green-500 text-white px-2 py-1 rounded text-sm">+</button>
                </div>
              </td>

              <td class="px-3 py-2">
                <div class="flex gap-1">
                  <select v-model="row.vehicle" @change="onVehicleSelect(row)"
                    class="flex-1 border rounded-md px-2 py-1" @keydown.enter.prevent="handleEnter(index, 5)"
                    @keydown.tab.prevent="focusNext(index, 5)">
                    <option :value="null">{{ $t('labels.vehicle') }} —</option>
                    <option v-for="v in row.availableVehicles" :key="v.id" :value="v">{{ v.name }}</option>
                    <option value="__new__" style="color: green;">+ {{ $t('labels.addNew') }}</option>
                  </select>
                  <button v-if="row.vehicle === '__new__'" @click="showAddVehicleDialog = true"
                    class="bg-green-500 text-white px-2 py-1 rounded text-sm">+</button>
                </div>
              </td>

              <td class="px-3 py-2">
                <input type="text" v-model="row.crusherBon" class="w-full border rounded-md px-2 py-1"
                  @keydown.enter.prevent="handleEnter(index, 6)" @keydown.tab.prevent="focusNext(index, 6)" />
              </td>

              <td class="px-3 py-2">
                <input type="text" v-model="row.companyBon" class="w-full border rounded-md px-2 py-1"
                  @keydown.enter.prevent="handleEnter(index, 7)" @keydown.tab.prevent="focusNext(index, 7)" />
              </td>

              <td class="px-3 py-2">
                <input type="number" v-model.number="row.discount" class="w-full border rounded-md px-2 py-1"
                  placeholder="0" @keydown.enter.prevent="handleEnter(index, 8)" @keydown.tab.prevent="focusNext(index, 8)" />
              </td>

              <td class="px-3 py-2">
                <input type="number" step="any" v-model.number="row.price" class="w-full border rounded-md px-2 py-1 no-spinner"
                  placeholder="0" @keydown.enter.prevent="handleEnter(index, 9)" @keydown.tab.prevent="focusNext(index, 9)" />
              </td>

              <td class="px-3 py-2">
                <input type="number" step="any" v-model.number="row.cubic" class="w-full border rounded-md px-2 py-1 no-spinner"
                  placeholder="0" @keydown.enter.prevent="handleEnter(index, 10)" @keydown.tab.prevent="focusNext(index, 10)" />
              </td>

              <td class="px-3 py-2">
                <input type="number" step="any" v-model.number="row.crusherCubic" class="w-full border rounded-md px-2 py-1 no-spinner"
                  placeholder="-" @keydown.enter.prevent="handleEnter(index, 11)" @keydown.tab.prevent="focusNext(index, 11)" />
              </td>

              <td class="px-3 py-2 font-semibold">{{ formatNumber(totalPerRow(row)) }}</td>

              <td class="px-3 py-2">
                <div class="flex gap-2">
                  <button @click="duplicateRow(index)" :title="$t('supply.duplicate')"
                    class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">⤷</button>
                  <button @click="removeRow(index)" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- أزرار + ملخص -->
      <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div class="flex gap-3 flex-wrap">
          <button @click="addRow" class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700">
            {{ $t('labels.addRow') || 'إضافة صف' }} (Alt+N)
          </button>
          <button @click="resetRows" class="px-5 py-2.5 border rounded-lg hover:bg-gray-50">
            {{ $t('supply.reset') || 'إعادة تعيين' }} (Alt+R)
          </button>
        </div>

        <div class="text-sm text-gray-700 space-y-1 text-right">
          <div><span class="font-medium">{{ $t('supply.subtotal') }}:</span> {{ formatNumber(subtotal) }}</div>
          <div><span class="font-medium">{{ $t('supply.totalDiscount') }}:</span> -{{ formatNumber(totalDiscount) }}</div>
          <div class="font-semibold text-base mt-2">{{ $t('supply.grandTotal') }}: {{ formatNumber(grandTotal) }}</div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button @click="saveData" class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700">
          {{ $t('labels.saveSupply') || 'حفظ' }} (Alt+S)
        </button>
      </div>

      <div v-if="saveError" class="mt-4 text-red-600 text-center">{{ saveError }}</div>

      <!-- Dialogs (كما هي بدون تغيير) -->
      <div v-if="showAddSite" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded shadow w-96">
          <h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3>
          <input v-model="newSiteName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.siteName')" />
          <div class="flex gap-2 justify-end">
            <button @click="showAddSite = false" class="px-3 py-1 border rounded">إلغاء</button>
            <button @click="addSite" :disabled="!newSiteName || addingLocation"
              class="bg-green-600 text-white px-3 py-1 rounded">
              {{ addingLocation ? 'جاري الإضافة...' : 'إضافة' }}
            </button>
          </div>
          <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
        </div>
      </div>

      <div v-if="showAddArea" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded shadow w-96">
          <h3 class="text-lg font-bold mb-2">{{ $t('supply.addArea') }}</h3>
          <input v-model="newAreaName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.areaName')" />
          <div class="flex gap-2 justify-end">
            <button @click="showAddArea = false" class="px-3 py-1 border rounded">إلغاء</button>
            <button @click="addArea" :disabled="!newAreaName || addingLocation"
              class="bg-green-600 text-white px-3 py-1 rounded">
              {{ addingLocation ? 'جاري الإضافة...' : 'إضافة' }}
            </button>
          </div>
          <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
        </div>
      </div>

      <div v-if="showAddContractorDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded shadow w-96">
          <h3 class="text-lg font-bold mb-2">إضافة مقاول</h3>
          <input v-model="newContractorName" class="w-full border rounded px-2 py-1 mb-3" placeholder="اسم المقاول" />
          <div class="flex gap-2 justify-end">
            <button @click="showAddContractorDialog = false" class="px-3 py-1 border rounded">إلغاء</button>
            <button @click="createNewContractor" :disabled="!newContractorName || creatingContractor"
              class="bg-green-600 text-white px-3 py-1 rounded">
              {{ creatingContractor ? 'جاري الإضافة...' : 'إضافة' }}
            </button>
          </div>
          <div v-if="contractorDialogError" class="text-red-600 text-sm mt-2">{{ contractorDialogError }}</div>
        </div>
      </div>

      <div v-if="showAddCrusherDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded shadow w-96">
          <h3 class="text-lg font-bold mb-2">إضافة كسارة</h3>
          <input v-model="newCrusherName" class="w-full border rounded px-2 py-1 mb-3" placeholder="اسم الكسارة" />
          <div class="flex gap-2 justify-end">
            <button @click="showAddCrusherDialog = false" class="px-3 py-1 border rounded">إلغاء</button>
            <button @click="createNewCrusher" :disabled="!newCrusherName || creatingCrusher"
              class="bg-green-600 text-white px-3 py-1 rounded">
              {{ creatingCrusher ? 'جاري الإضافة...' : 'إضافة' }}
            </button>
          </div>
          <div v-if="crusherDialogError" class="text-red-600 text-sm mt-2">{{ crusherDialogError }}</div>
        </div>
      </div>

      <div v-if="showAddVehicleDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded shadow w-full max-w-md">
          <h3 class="text-lg font-bold mb-3">إضافة مركبة</h3>
          <input v-model="newVehicleForm.name" placeholder="اسم المركبة" class="w-full border rounded px-2 py-1 mb-3" />
          <select v-model="newVehicleForm.contractorId" class="w-full border rounded px-2 py-1 mb-3">
            <option value="">اختر مقاول</option>
            <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <input v-model.number="newVehicleForm.cubicCapacity" type="number" step="0.01" placeholder="السعة المكعبة" class="w-full border rounded px-2 py-1 mb-3" />
          <input v-model.number="newVehicleForm.crusherCubic" type="number" step="0.01" placeholder="سعة الكسارة" class="w-full border rounded px-2 py-1 mb-3" />
          <div class="flex gap-2 justify-end">
            <button @click="showAddVehicleDialog = false" class="px-3 py-1 border rounded">إلغاء</button>
            <button @click="createNewVehicle" :disabled="!newVehicleForm.name || !newVehicleForm.cubicCapacity || !newVehicleForm.crusherCubic || creatingVehicle"
              class="bg-green-600 text-white px-3 py-1 rounded">
              {{ creatingVehicle ? 'جاري الإضافة...' : 'إضافة' }}
            </button>
          </div>
          <div v-if="vehicleDialogError" class="text-red-600 text-sm mt-2">{{ vehicleDialogError }}</div>
        </div>
      </div>
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
  createVehicle
} from '../../api'

export default {
  name: 'NewSupply',

  data() {
    return {
      sites: [],
      allLocations: [],

      rows: [
        this.createEmptyRow()
      ],

      contractors: [],
      contractorsWithVehicles: [],
      crushers: [],
      vehicles: [],

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
      creatingVehicle: false
    }
  },

  async mounted() {
    try {
      await this.refreshLocations()
      await this.loadLookups()
    } catch (err) {
      console.error('Initial load failed:', err)
    }

    // Event listeners
    this.handleContractorCreated = this.handleContractorCreated.bind(this)
    this.handleCrusherCreated = this.handleCrusherCreated.bind(this)
    this.handleVehicleCreated = this.handleVehicleCreated.bind(this)

    window.addEventListener('data:contractor:created', this.handleContractorCreated)
    window.addEventListener('data:crusher:created', this.handleCrusherCreated)
    window.addEventListener('data:vehicle:created', this.handleVehicleCreated)
  },

  beforeUnmount() {
    window.removeEventListener('data:contractor:created', this.handleContractorCreated)
    window.removeEventListener('data:crusher:created', this.handleCrusherCreated)
    window.removeEventListener('data:vehicle:created', this.handleVehicleCreated)
  },

  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },

    subtotal() {
      return this.rows.reduce((sum, r) => sum + (Number(r.price || 0) * Number(r.cubic || 0)), 0)
    },

    totalDiscount() {
      return this.rows.reduce((sum, r) => sum + Number(r.discount || 0), 0)
    },

    grandTotal() {
      const total = this.subtotal - this.totalDiscount
      return total > 0 ? total : 0
    }
  },

  methods: {
    createEmptyRow() {
      return {
        id: Date.now() + Math.random(),
        date: '',
        site: null,
        area: null,
        availableAreas: [],
        contractor: null,
        crusher: null,
        vehicle: null,
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
        !row.crusherBon?.trim() &&
        !row.companyBon?.trim() &&
        !row.discount &&
        !row.price &&
        !row.cubic &&
        !row.crusherCubic
    },

    async refreshLocations() {
      try {
        const res = await getLocations()
        this.allLocations = Array.isArray(res.data) ? res.data : []
        this.sites = this.allLocations.filter(l => !l.parentId)

        this.rows.forEach(row => this.updateAvailableAreas(row))
        console.log('Locations refreshed - sites:', this.sites.length)
      } catch (err) {
        console.warn('refreshLocations failed', err)
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
          this.$forceUpdate() // مهم لإجبار الـ reactivity
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
          this.$forceUpdate()
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

    async loadLookups() {
      try {
        const [cRes, cvRes, crushRes, vRes] = await Promise.all([
          getContractors(),
          getContractorsWithVehicles(),
          getCrushers(),
          getVehicles()
        ])

        // مرونة عالية في التعامل مع أشكال الرد المختلفة
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

        console.log('Lookups loaded:', {
          contractors: this.contractors.length,
          contractorsWithVehicles: this.contractorsWithVehicles.length,
          crushers: this.crushers.length,
          vehicles: this.vehicles.length
        })

        // تحديث الصفوف بعد التعبئة
        this.$nextTick(() => {
          this.rows.forEach(row => {
            row.availableVehicles = [...this.vehicles]
          })
          this.$forceUpdate()
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
      row.cubic = Number(row.vehicle.cubicCapacity ?? row.vehicle.cubic ?? 0)
      row.crusherCubic = row.vehicle.crusherCubic ? Number(row.vehicle.crusherCubic) : ''
    },

    totalPerRow(row) {
      const p = Number(row.price || 0)
      const c = Number(row.cubic || 0)
      const d = Number(row.discount || 0)
      return Math.max(0, p * c - d)
    },

    formatNumber(v) {
      return Number(v || 0).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })
    },

    focusNext(rowIndex, colIndex) {
      const nextCol = colIndex + 1
      if (nextCol > 11) return

      this.$nextTick(() => {
        const rowEl = this.$el.querySelectorAll('tbody tr')[rowIndex]
        if (!rowEl) return

        let selector = ''
        if (nextCol === 0) selector = 'input[type="date"]'
        else if (nextCol <= 5) selector = 'select'
        else selector = 'input'

        const input = rowEl.querySelector(selector)
        if (input) input.focus()
      })
    },

    handleEnter(rowIndex, colIndex) {
      if (colIndex !== 11) return

      if (this.isRowEmpty(this.rows[rowIndex])) return

      this.addRow()
      this.$nextTick(() => {
        const newRow = this.$el.querySelectorAll('tbody tr')[rowIndex + 1]
        newRow?.querySelector('input[type="date"]')?.focus()
      })
    },

    addRow() {
      this.rows.push(this.createEmptyRow())
      this.$nextTick(() => {
        // scroll إلى الصف الجديد إذا أردت
      })
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

      const toSave = this.rows.filter(r => !this.isRowEmpty(r))

      if (!toSave.length) {
        this.saveError = 'لا توجد بيانات لحفظها'
        return
      }

      for (const [i, r] of toSave.entries()) {
        if (!r.date || !r.site || !r.contractor || !r.crusher || !r.vehicle) {
          this.saveError = `يرجى ملء الحقول المطلوبة في الصف ${i + 1}`
          return
        }
      }

      try {
        for (const r of toSave) {
          const locationId = r.area?.id || r.site?.id
          if (!locationId) continue

          await createDelivery({
            crusherId: Number(r.crusher.id),
            contractorId: Number(r.contractor.id),
            locationId: Number(locationId),
            date: r.date,
            crusherTicket: r.crusherBon || null,
            companyTicket: r.companyBon || null,
            companyCapacity: Number(r.cubic) || 0,
            crusherCapacity: Number(r.cubic) || 0,
            crusherCubic: r.crusherCubic ? Number(r.crusherCubic) : null,
            unitPrice: Number(r.price) || 0,
            discount: Number(r.discount) || 0,
            vehicleId: r.vehicle?.id ? Number(r.vehicle.id) : null
          })
        }

        alert('تم الحفظ بنجاح')
        this.resetRows()
      } catch (err) {
        console.error('saveData error:', err)
        this.saveError = err?.response?.data?.message || 'خطأ أثناء الحفظ'
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

        // إعادة تحميل للتأكد
        await this.loadLookups()

        window.dispatchEvent(new CustomEvent('data:contractor:created', { detail: nc }))
      } catch (e) {
        console.error('createNewContractor failed:', e)
        this.contractorDialogError = e?.response?.data?.message || e.message || 'فشل إنشاء المقاول'
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

        window.dispatchEvent(new CustomEvent('data:crusher:created', { detail: nc }))
      } catch (e) {
        console.error('createNewCrusher failed:', e)
        this.crusherDialogError = e?.response?.data?.message || e.message || 'فشل إنشاء الكسارة'
      } finally {
        this.creatingCrusher = false
      }
    },

    async createNewVehicle() {
      const { name, contractorId, cubicCapacity, crusherCubic } = this.newVehicleForm
      if (!name.trim() || !cubicCapacity || !crusherCubic) {
        this.vehicleDialogError = 'يرجى ملء جميع الحقول المطلوبة'
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

        window.dispatchEvent(new CustomEvent('data:vehicle:created', { detail: nv }))
      } catch (e) {
        console.error('createNewVehicle failed:', e)
        this.vehicleDialogError = e?.response?.data?.message || e.message || 'فشل إنشاء المركبة'
      } finally {
        this.creatingVehicle = false
      }
    },

    handleContractorCreated(event) {
      this.loadLookups()
    },

    handleCrusherCreated(event) {
      this.loadLookups()
    },

    handleVehicleCreated(event) {
      this.loadLookups()
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
</style>
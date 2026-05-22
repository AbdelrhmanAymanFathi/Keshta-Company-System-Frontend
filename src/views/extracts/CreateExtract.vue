<template>
  <div :class="modalMode ? '' : 'p-4'">
    <div class="max-w-6xl mx-auto">
      <!-- Step 1: Basic Data -->
      <div v-if="currentStep === 1" class="w-full">
        <h3 class="text-lg font-bold mb-8 text-center text-gray-800">{{ $t('labels.step1BasicData') }}</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('labels.dateFrom') || 'Date From' }} <span class="text-red-600">*</span></label>
            <div class="relative">
              <CalendarDaysIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <DateField v-model="commonData.dateFrom" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('labels.dateTo') || 'Date To' }} <span class="text-red-600">*</span></label>
            <div class="relative">
              <CalendarDaysIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <DateField v-model="commonData.dateTo" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('labels.site') }} <span class="text-red-600">*</span></label>
            <div class="relative flex items-center gap-2">
              <div class="flex-1 relative">
                <SearchDropdown v-model="filters.commonSiteSearch" :items="sites" :allItems="sites" :placeholder="$t('labels.site')"
                  :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                  @select="(sel) => { commonData.site = sel; filters.commonSiteSearch = sel.name; onCommonSiteChange() }">
                  <template #prefix>
                    <MapPinIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </template>
                  <template #afterOptions>
                    <div @click="showAddSite = true; pendingRow = null" style="color: #10b981;" class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">+ {{ $t('supply.addNewSite') }}</div>
                  </template>
                </SearchDropdown>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('labels.area') }}</label>
            <div class="relative flex items-center gap-2">
              <div class="flex-1 relative">
                <SearchDropdown v-model="filters.commonAreaSearch" :items="commonAvailableAreas" :allItems="commonAvailableAreas" :placeholder="$t('labels.area')" :disabled="!commonData.site"
                  :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'"
                  @select="(sel) => { commonData.area = sel; filters.commonAreaSearch = sel.name }">
                  <template #prefix>
                    <MapIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </template>
                  <template #afterOptions>
                    <div v-if="commonData.site" @click="showAddArea = true; pendingRow = null" style="color: #10b981;" class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">+ {{ $t('supply.addNewArea') }}</div>
                  </template>
                </SearchDropdown>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('labels.contractor') }} <span class="text-red-600">*</span></label>
            <div class="relative flex items-center gap-2">
              <div class="flex-1 relative">
                <SearchDropdown v-model="filters.commonContractorSearch" :items="contractors" :allItems="contractors" :placeholder="$t('labels.contractor')"
                  :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                  @select="(sel) => { commonData.contractor = sel; filters.commonContractorSearch = sel.name; onCommonContractorChange() }">
                  <template #prefix>
                    <UserGroupIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </template>
                  <template #afterOptions>
                    <div @click="showAddContractorDialog = true" style="color: #10b981;" class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">+ {{ $t('labels.addNew') }}</div>
                  </template>
                </SearchDropdown>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('labels.crusher') }} <span class="text-red-600">*</span></label>
            <div class="relative flex items-center gap-2">
              <div class="flex-1 relative">
                <SearchDropdown v-model="filters.commonCrusherSearch" :items="crushers" :allItems="crushers" :placeholder="$t('labels.crusher')"
                  :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                  @select="(sel) => { commonData.crusher = sel; filters.commonCrusherSearch = sel.name; onCommonCrusherChange() }">
                  <template #prefix>
                    <WrenchScrewdriverIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </template>
                  <template #afterOptions>
                    <div @click="showAddCrusherDialog = true" style="color: #10b981;" class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">+ {{ $t('labels.addNew') }}</div>
                  </template>
                </SearchDropdown>
              </div>
            </div>
          </div>

          <div class="md:col-span-full">
            <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.notes') }}</label>
            <textarea v-model="commonData.notes" rows="3" class="w-full px-3 py-2 border rounded text-sm"></textarea>
          </div>
        </div>

        <!-- Next / Cancel Buttons -->
        <div class="mt-10 flex justify-end gap-6">
          <button @click="onCancel" class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition">{{ $t('labels.cancel') }}</button>
          <button @click="goToStep2" :disabled="!isStep1Valid()" class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center gap-3">{{ $t('labels.next') }} <ArrowRightIcon class="w-6 h-6 transition-transform rtl:rotate-180" /></button>
        </div>
      </div>

      <!-- Step 2: Lines -->
      <div v-else class="w-full">
        <div class="flex items-center justify-between mb-8">
          <button @click="currentStep = 1" class="flex items-center gap-3 theme-text hover:theme-text-muted font-medium transition"><ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />{{ $t('labels.back') }}</button>
          <h3 class="text-lg font-bold text-gray-800">{{ $t('labels.step2Data') }}</h3>
          <div></div>
        </div>

        <div class="theme-dashboard-bg-soft border theme-border rounded-lg p-5 mb-8">
          <h4 class="text-sm font-bold theme-text-muted mb-4">{{ $t('labels.summary') }}</h4>
          <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 text-sm">
            <div class="flex flex-col"><dt class="font-semibold text-gray-700">{{ $t('labels.dateFrom') || 'Date From' }}:</dt><dd class="text-gray-900 mt-1">{{ commonData.dateFrom || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold text-gray-700">{{ $t('labels.dateTo') || 'Date To' }}:</dt><dd class="text-gray-900 mt-1">{{ commonData.dateTo || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold text-gray-700">{{ $t('labels.site') }}:</dt><dd class="text-gray-900 mt-1">{{ commonData.site?.name || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold text-gray-700">{{ $t('labels.area') }}:</dt><dd class="text-gray-900 mt-1">{{ commonData.area?.name || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold text-gray-700">{{ $t('labels.contractor') }}:</dt><dd class="text-gray-900 mt-1">{{ commonData.contractor?.name || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold text-gray-700">{{ $t('labels.crusher') }}:</dt><dd class="text-gray-900 mt-1">{{ commonData.crusher?.name || '-' }}</dd></div>
            <div class="flex flex-col col-span-full"><dt class="font-semibold text-gray-700">{{ $t('labels.notes') }}:</dt><dd class="text-gray-900 mt-1">{{ commonData.notes || '-' }}</dd></div>
          </dl>
        </div>

        <div class="mb-6"><button @click="addRow" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium shadow-md transition">+ {{ $t('labels.addRow') }}</button></div>

        <div class="mb-8 relative border border-gray-200 rounded-lg overflow-visible p-2">
          <div class="overflow-x-auto w-full">
            <div class="space-y-2">
              <ExtractLineEditor
                v-for="(r, i) in rows"
                :key="r.id"
                v-model="rows[i]"
                :items="exportItems"
                @add-item="pendingRow = r; showAddExportItemDialog = true"
                @remove="() => removeRow(i)"
              />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-sm font-semibold">
          <div class="flex items-center justify-end gap-3"><span class="text-gray-700">{{ $t('labels.subtotal') }}:</span><span class="text-gray-900 min-w-32 text-end">{{ formatCurrency(subtotal) }}</span></div>
          <div class="mt-4 sm:mt-0"><button @click="saveData" :disabled="isSaving" class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center gap-3">{{ isSaving ? $t('labels.saving') : $t('labels.save') }} <CheckIcon class="w-6 h-6" /></button></div>
        </div>

        <p v-if="saveError" class="mt-6 text-center text-red-600 font-medium text-lg">{{ saveError }}</p>
      </div>
    </div>

    <!-- Dialogs: Add Site / Area / Contractor / Crusher / Export Item -->
    <div v-if="showAddSite" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]"><div class="bg-white p-6 rounded shadow w-96"><h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3><input v-model="newSiteName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.siteName')" /><div class="flex gap-2 justify-end"><button @click="showAddSite = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button><button @click="addSite" :disabled="!newSiteName || addingLocation" class="bg-green-600 text-white px-3 py-1 rounded">{{ addingLocation ? $t('supply.adding') : $t('labels.add') }}</button></div><div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div></div></div>

    <div v-if="showAddArea" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]"><div class="bg-white p-6 rounded shadow w-96"><h3 class="text-lg font-bold mb-2">{{ $t('supply.addArea') }}</h3><input v-model="newAreaName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.areaName')" /><div class="flex gap-2 justify-end"><button @click="showAddArea = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button><button @click="addArea" :disabled="!newAreaName || addingLocation" class="bg-green-600 text-white px-3 py-1 rounded">{{ addingLocation ? $t('supply.adding') : $t('labels.add') }}</button></div><div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div></div></div>

    <div v-if="showAddContractorDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]"><div class="bg-white p-6 rounded shadow w-96"><h3 class="text-lg font-bold mb-2">{{ $t('contractors.addContractor') }}</h3><input v-model="newContractorName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('contractors.name')" /><div class="flex gap-2 justify-end"><button @click="showAddContractorDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button><button @click="createNewContractor" :disabled="!newContractorName || creatingContractor" class="bg-green-600 text-white px-3 py-1 rounded">{{ creatingContractor ? $t('supply.adding') : $t('labels.add') }}</button></div><div v-if="contractorDialogError" class="text-red-600 text-sm mt-2">{{ contractorDialogError }}</div></div></div>

    <div v-if="showAddCrusherDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]"><div class="bg-white p-6 rounded shadow w-96"><h3 class="text-lg font-bold mb-2">{{ $t('crushers.addCrusher') }}</h3><input v-model="newCrusherName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('crushers.name')" /><div class="flex gap-2 justify-end"><button @click="showAddCrusherDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button><button @click="createNewCrusher" :disabled="!newCrusherName || creatingCrusher" class="bg-green-600 text-white px-3 py-1 rounded">{{ creatingCrusher ? $t('supply.adding') : $t('labels.add') }}</button></div><div v-if="crusherDialogError" class="text-red-600 text-sm mt-2">{{ crusherDialogError }}</div></div></div>

    <div v-if="showAddExportItemDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]"><div class="bg-white p-6 rounded shadow w-96"><h3 class="text-lg font-bold mb-3">{{ $t('labels.addExportItem') || 'Add Export Item' }}</h3><input v-model="newExportItemForm.name" :placeholder="$t('labels.itemName') || 'Item Name'" class="w-full border rounded px-2 py-1 mb-3" /><input v-model.number="newExportItemForm.currentPrice" type="number" step="0.01" :placeholder="$t('labels.price')" class="w-full border rounded px-2 py-1 mb-3" /><div class="flex gap-2 justify-end"><button @click="showAddExportItemDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button><button @click="createNewExportItem" :disabled="!newExportItemForm.name || !newExportItemForm.currentPrice || creatingExportItem" class="bg-green-600 text-white px-3 py-1 rounded">{{ creatingExportItem ? $t('supply.adding') : $t('labels.add') }}</button></div><div v-if="exportItemDialogError" class="text-red-600 text-sm mt-2">{{ exportItemDialogError }}</div></div></div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ExtractLineEditor from '@/components/dashboard/Extracts/ExtractLineEditor.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import { parseCreateExtract } from '@/validators/extracts'
import { useCreateExtract } from '@/composables/useCreateExtract'
import { getContractors, getLocations, getCrushers, getExportItems, getVehicles, createLocation, createContractor, createCrusher, createExportItem, getContractorsWithVehicles } from '@/api'
import normalizeItem from '@/utils/normalizeItem'
import {
  CalendarDaysIcon,
  MapPinIcon,
  MapIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'CreateExtractView',
  components: { ExtractLineEditor, SearchDropdown, DateField, CalendarDaysIcon, MapPinIcon, MapIcon, UserGroupIcon, WrenchScrewdriverIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon },
  props: { modalMode: { type: Boolean, default: false } },
  emits: ['submitted', 'cancelled', 'step-change'],
  setup(props, { emit }) {
    const router = useRouter()
    const { locale } = useI18n()

    const currentStep = ref(1)

    const commonData = reactive({
      dateFrom: '',
      dateTo: '',
      site: null,
      area: null,
      contractor: null,
      crusher: null,
      notes: '',
      idempotencyKey: ''
    })

    const rows = ref([])
    const isSaving = ref(false)
    const saveError = ref('')

    const items = ref([])
    const contractors = ref([])
    const locations = ref([])
    const crushers = ref([])
    const vehicles = ref([])

    // lookups + site lists
    const sites = ref([])
    const allLocations = ref([])
    const contractorsWithVehicles = ref([])

    // search filters group (used by SearchDropdown v-model)
    const filters = reactive({ commonSiteSearch: '', commonAreaSearch: '', commonContractorSearch: '', commonCrusherSearch: '' })

    // small dialog state + errors
    const showAddSite = ref(false)
    const newSiteName = ref('')
    const showAddArea = ref(false)
    const newAreaName = ref('')
    const addingLocation = ref(false)
    const pendingRow = ref(null)

    const showAddContractorDialog = ref(false)
    const newContractorName = ref('')
    const creatingContractor = ref(false)
    const contractorDialogError = ref('')

    const showAddCrusherDialog = ref(false)
    const newCrusherName = ref('')
    const creatingCrusher = ref(false)
    const crusherDialogError = ref('')

    const showAddExportItemDialog = ref(false)
    const newExportItemForm = reactive({ name: '', currentPrice: '' })
    const creatingExportItem = ref(false)
    const exportItemDialogError = ref('')

    const locationError = ref('')

    const { mutateAsync } = useCreateExtract()

    function genIdempotencyKey() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
      return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    }

    function createEmptyRow() {
      return { id: Date.now() + Math.random(), itemId: '', itemSearch: '', price: '', quantity: 1, discount: 0, total: 0 }
    }

    function addRow() { rows.value.push(createEmptyRow()) }
    function removeRow(i) { rows.value.splice(i,1); if (!rows.value.length) addRow() }
    function duplicateLastRow() { const last = rows.value[rows.value.length-1]; if (last) rows.value.push({ ...JSON.parse(JSON.stringify(last)), id: Date.now()+Math.random() }) }

    const subtotal = computed(() => rows.value.reduce((s, r) => {
      const price = Number(r.price || 0)
      const quantity = Number(r.quantity || 0)
      const discount = Math.max(0, Number(r.discount || 0))
      const total = r.total !== undefined && r.total !== null && r.total !== ''
        ? Number(r.total)
        : Math.max(0, (price * quantity) - discount)
      return s + (Number.isFinite(total) ? total : 0)
    }, 0))

    function formatCurrency(v){ if (v===undefined||v===null||v==='') return '-'; const n=Number(v); if (Number.isNaN(n)) return v; return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(n) }

    function isStep1Valid(){
      return commonData.dateFrom &&
        commonData.dateTo &&
        commonData.dateTo >= commonData.dateFrom &&
        commonData.site &&
        commonData.contractor
    }

    function onCommonSiteChange(){
      filters.commonAreaSearch = ''
      commonData.area = null
    }

    function onCommonContractorChange(){ /* placeholder for potential side-effects */ }

    function onCommonCrusherChange(){ /* placeholder for potential side-effects */ }

    async function goToStep2(){
      if (!isStep1Valid()) return
      currentStep.value = 2
      // create initial row if empty
      if (!rows.value.length) rows.value.push(createEmptyRow())
    }

    // Load locations (flat) and site list
    async function refreshLocations() {
      try {
        const res = await getLocations()
        allLocations.value = Array.isArray(res.data) ? res.data : []
        sites.value = allLocations.value.filter(l => !l.parentId)
      } catch (err) {
        console.warn('Failed to refresh locations', err)
      }
    }

    async function loadExportItems() {
      try {
        const res = await getExportItems({ mode: 'extracts' })
        let raw = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || [])
        items.value = raw.map(normalizeItem)
      } catch (err) {
        console.warn('Failed to load export items', err)
      }
    }

    // Support both flags for compatibility: some APIs use `availableForExports`,
    // others use `availableForExtracts`.
    const exportItems = computed(() => items.value.filter(i => i && (i.availableForExports === true || i.availableForExtracts === true)))

    async function loadLookups() {
      try {
        const [cRes, cvRes, crushRes, vRes] = await Promise.all([
          getContractors({ mode: 'extracts' }),
          typeof getContractorsWithVehicles === 'function' ? getContractorsWithVehicles({ mode: 'extracts' }) : Promise.resolve(null),
          getCrushers(),
          getVehicles()
        ])

        const extractArray = (res) => {
          if (!res) return []
          if (res?.data?.items) return Array.isArray(res.data.items) ? res.data.items : []
          if (res?.data) {
            if (Array.isArray(res.data)) return res.data
            if (typeof res.data === 'object') {
              const firstValue = Object.values(res.data)[0]
              return Array.isArray(firstValue) ? firstValue : []
            }
          }
          if (Array.isArray(res)) return res
          return []
        }

        contractors.value = extractArray(cRes)
        contractorsWithVehicles.value = extractArray(cvRes)
        crushers.value = extractArray(crushRes)
        vehicles.value = extractArray(vRes)

        // ensure rows have vehicle lists if present
        rows.value.forEach(row => { if (row) row.availableVehicles = [...vehicles.value] })
      } catch (err) {
        console.error('loadLookups failed:', err)
      }
    }

    async function loadInitialData() {
      try {
        await Promise.all([
          refreshLocations(),
          loadLookups(),
          loadExportItems()
        ])
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    }

    const commonAvailableAreas = computed(() => {
      if (!commonData.site) return []
      if (Array.isArray(commonData.site.children) && commonData.site.children.length) return commonData.site.children
      return allLocations.value.filter(l => l.parentId === commonData.site.id)
    })

    function toNumericId(value) {
      if (value === '' || value === null || value === undefined) return undefined
      const numericValue = Number(value)
      return Number.isFinite(numericValue) ? numericValue : undefined
    }

    async function saveData(){
      saveError.value = ''
      isSaving.value = true
      try{
        const payload = {
          dateFrom: commonData.dateFrom,
          dateTo: commonData.dateTo,
          contractorId: toNumericId(commonData.contractor?.id || commonData.contractor),
          locationId: toNumericId(commonData.site?.id),
          areaId: toNumericId(commonData.area?.id || commonData.area),
          notes: commonData.notes,
          total: subtotal.value,
          lines: rows.value.map(r => {
            const discount = Math.max(0, Number(r.discount || 0))
            const line = { itemId: toNumericId(r.itemId), quantity: Number(r.quantity || 0), discount }
            if (r.price !== null && r.price !== undefined && r.price !== '') {
              const price = Number(r.price)
              line.price = price
              line.total = Number(Math.max(0, price * Number(r.quantity || 0)).toFixed(2))
            } else if (r.total !== null && r.total !== undefined && r.total !== '' && Number(r.total) > 0) {
              line.total = Number(Math.max(0, Number(r.total)).toFixed(2))
            }
            return line
          }).filter(line => line.itemId && line.quantity > 0),
          idempotencyKey: commonData.idempotencyKey || genIdempotencyKey()
        }

        // validate
        try{ parseCreateExtract(payload) } catch(err){ console.error('Validation error', err); saveError.value = err?.message || 'Validation failed'; isSaving.value = false; return }

        const res = await mutateAsync(payload)
        if (props.modalMode) {
          emit('submitted', res)
        } else {
          const id = res?.id
          if (id) {
            router.push({ name: 'extracts-detail', params: { id } })
          } else {
            router.push({ name: 'extracts-list' })
          }
        }
      }catch(e){
        console.error('Failed to create extract', e)
        saveError.value = e?.response?.data?.message || e?.message || 'Save failed'
      }finally{ isSaving.value = false }
    }

    // === Site/Area creation helpers ===
    async function addSite() {
      if (!newSiteName.value?.trim()) return
      addingLocation.value = true
      try {
        const res = await createLocation({ name: newSiteName.value.trim(), parentId: null })
        await refreshLocations()
        const created = res?.data
        if (created?.id) {
          const newSite = allLocations.value.find(l => l.id === created.id)
          if (newSite) {
            if (currentStep.value === 1 && !pendingRow.value) {
              commonData.site = newSite
              filters.commonSiteSearch = newSite.name
            }
            if (pendingRow.value) {
              pendingRow.value.site = newSite
            }
          }
        }
        showAddSite.value = false
        newSiteName.value = ''
        pendingRow.value = null
      } catch (err) {
        locationError.value = err?.response?.data?.message || 'Failed to add site'
        console.error('addSite error:', err)
      } finally {
        addingLocation.value = false
      }
    }

    async function addArea() {
      if (!newAreaName.value?.trim()) return
      const siteId = currentStep.value === 1 ? commonData.site?.id : pendingRow.value?.site?.id
      if (!siteId) return
      addingLocation.value = true
      try {
        const res = await createLocation({ name: newAreaName.value.trim(), parentId: siteId })
        await refreshLocations()
        const created = res?.data
        if (created?.id) {
          const newArea = allLocations.value.find(l => l.id === created.id)
          if (newArea) {
            if (currentStep.value === 1 && !pendingRow.value) {
              commonData.area = newArea
              filters.commonAreaSearch = newArea.name
            }
            if (pendingRow.value) pendingRow.value.area = newArea
          }
        }
        showAddArea.value = false
        newAreaName.value = ''
        pendingRow.value = null
      } catch (err) {
        locationError.value = err?.response?.data?.message || 'Failed to add area'
        console.error('addArea error:', err)
      } finally {
        addingLocation.value = false
      }
    }

    // === Create new lookup items ===
    async function createNewContractor() {
      const name = newContractorName.value.trim()
      if (!name) return
      creatingContractor.value = true
      contractorDialogError.value = ''
      try {
        const res = await createContractor({ name })
        const createdList = res.normalized || (Array.isArray(res.data) ? res.data : [res.data])
        await loadLookups()
        const chosen = createdList.find(c => c.availableForSupplies) || createdList.find(c => c.availableForExports) || createdList[0]
        const updatedContractor = contractors.value.find(c => c.id === chosen.id)
        if (updatedContractor && currentStep.value === 1) {
          commonData.contractor = updatedContractor
          filters.commonContractorSearch = updatedContractor.name
        }
        newContractorName.value = ''
        showAddContractorDialog.value = false
      } catch (e) {
        contractorDialogError.value = e?.response?.data?.message || e?.message || 'Error'
        console.error('createNewContractor error:', e)
      } finally {
        creatingContractor.value = false
      }
    }

    async function createNewCrusher() {
      const name = newCrusherName.value.trim()
      if (!name) return
      creatingCrusher.value = true
      crusherDialogError.value = ''
      try {
        const res = await createCrusher({ name })
        const nc = res?.data
        await loadLookups()
        const updatedCrusher = crushers.value.find(c => c.id === nc?.id)
        if (updatedCrusher && currentStep.value === 1) {
          commonData.crusher = updatedCrusher
          filters.commonCrusherSearch = updatedCrusher.name
        }
        newCrusherName.value = ''
        showAddCrusherDialog.value = false
      } catch (e) {
        crusherDialogError.value = e?.response?.data?.message || e?.message || 'Error'
        console.error('createNewCrusher error:', e)
      } finally {
        creatingCrusher.value = false
      }
    }

    async function createNewExportItem() {
      const name = newExportItemForm.name?.trim()
      const currentPrice = newExportItemForm.currentPrice
      if (!name || !currentPrice) {
        exportItemDialogError.value = 'All fields required'
        return
      }
      creatingExportItem.value = true
      exportItemDialogError.value = ''
      try {
        const payload = { name, currentPrice: Number(currentPrice), defaultExtractPrice: Number(currentPrice), availableForExports: true, availableForExtracts: true }
        const res = await createExportItem(payload)
        const newItem = res?.data
        if (!newItem || !newItem.id) throw new Error('Invalid response')
        await loadExportItems()
        const updatedItem = exportItems.value.find(i => i.id === newItem.id)
        if (updatedItem && pendingRow.value && currentStep.value === 2) {
          pendingRow.value.itemId = updatedItem.id
          pendingRow.value.itemSearch = updatedItem.name || ''
          const parsed = Number(updatedItem.defaultExtractPrice ?? updatedItem.currentPrice ?? updatedItem.price ?? updatedItem.current_price)
          if (!Number.isNaN(parsed)) {
            pendingRow.value.price = parsed
            pendingRow.value.total = Number((parsed * Number(pendingRow.value.quantity || 0)).toFixed(2))
          }
        }
        newExportItemForm.name = ''
        newExportItemForm.currentPrice = ''
        pendingRow.value = null
        showAddExportItemDialog.value = false
      } catch (e) {
        exportItemDialogError.value = e?.response?.data?.message || e?.message || 'Error'
        console.error('createNewExportItem error:', e)
      } finally {
        creatingExportItem.value = false
      }
    }

    function onCancel() {
      if (props.modalMode) {
        emit('cancelled')
      } else {
        router.back()
      }
    }

    watch(currentStep, (step) => {
      emit('step-change', step)
    }, { immediate: true })

    watch(locale, async () => {
      await loadExportItems()
    })

    onMounted(() => { loadInitialData() })

    return {
      currentStep,
      commonData,
      rows,
      isSaving,
      saveError,
      items,
      contractors,
      locations,
      crushers,
      vehicles,
      sites,
      allLocations,
      contractorsWithVehicles,
      filters,
      showAddSite,
      newSiteName,
      showAddArea,
      newAreaName,
      addingLocation,
      pendingRow,
      showAddContractorDialog,
      newContractorName,
      creatingContractor,
      contractorDialogError,
      showAddCrusherDialog,
      newCrusherName,
      creatingCrusher,
      crusherDialogError,
      showAddExportItemDialog,
      newExportItemForm,
      creatingExportItem,
      exportItemDialogError,
      locationError,
      subtotal,
      formatCurrency,
      isStep1Valid,
      onCommonSiteChange,
      onCommonContractorChange,
      onCommonCrusherChange,
      exportItems,
      goToStep2,
      addRow,
      removeRow,
      duplicateLastRow,
      commonAvailableAreas,
      saveData,
      addSite,
      addArea,
      createNewContractor,
      createNewCrusher,
      createNewExportItem,
      onCancel
    }
  }
}
</script>

<style scoped>
.bg-primary { background-color: var(--theme-primary); }
</style>

<template>
  <div :class="modalMode ? '' : 'p-4'">
    <div class="max-w-6xl mx-auto">
      <!-- Step 1: Basic Data -->
      <div v-if="currentStep === 1" class="w-full">
        <h3 class="text-lg font-bold mb-8 text-center theme-text-primary">{{ $t('labels.step1BasicData') }}</h3>

        <Card class="shadcn-ui border-border/60 bg-card/80">
          <CardContent class="p-5 sm:p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <div>
                <Label class="mb-1.5 block text-sm font-medium theme-text-secondary">{{ $t('labels.dateFrom') || 'Date From' }} <span class="text-red-600">*</span></Label>
                <div class="relative">
                  <CalendarDaysIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                  <DateField v-model="commonData.dateFrom" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition" />
                </div>
              </div>

              <div>
                <Label class="mb-1.5 block text-sm font-medium theme-text-secondary">{{ $t('labels.dateTo') || 'Date To' }} <span class="text-red-600">*</span></Label>
                <div class="relative">
                  <CalendarDaysIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                  <DateField v-model="commonData.dateTo" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition" />
                </div>
              </div>

              <div>
                <Label class="mb-1.5 block text-sm font-medium theme-text-secondary">{{ $t('labels.site') }} <span class="text-red-600">*</span></Label>
                <div class="relative flex items-center gap-2">
                  <div class="flex-1 relative">
                    <SearchDropdown v-model="filters.commonSiteSearch" :items="sites" :allItems="sites" :placeholder="$t('labels.site')"
                      :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                      @select="(sel) => { commonData.site = sel; filters.commonSiteSearch = sel.name; onCommonSiteChange() }">
                      <template #prefix>
                        <MapPinIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                      </template>
                    </SearchDropdown>
                  </div>
                </div>
              </div>

              <div>
                <Label class="mb-1.5 block text-sm font-medium theme-text-secondary">{{ $t('labels.area') }}</Label>
                <div class="relative flex items-center gap-2">
                  <div class="flex-1 relative">
                    <SearchDropdown v-model="filters.commonAreaSearch" :items="commonAvailableAreas" :allItems="commonAvailableAreas" :placeholder="$t('labels.area')" :disabled="!commonData.site"
                      :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'"
                      @select="(sel) => { commonData.area = sel; filters.commonAreaSearch = sel.name }">
                      <template #prefix>
                        <MapIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                      </template>
                    </SearchDropdown>
                  </div>
                </div>
              </div>

              <div>
                <Label class="mb-1.5 block text-sm font-medium theme-text-secondary">{{ $t('labels.contractor') }} <span class="text-red-600">*</span></Label>
                <div class="relative flex items-center gap-2">
                  <div class="flex-1 relative">
                    <SearchDropdown v-model="filters.commonContractorSearch" :items="contractors" :allItems="contractors" :placeholder="$t('labels.contractor')"
                      :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                      @select="(sel) => { commonData.contractor = sel; filters.commonContractorSearch = sel.name; onCommonContractorChange() }">
                      <template #prefix>
                        <UserGroupIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                      </template>
                    </SearchDropdown>
                  </div>
                </div>
              </div>

              <div>
                <Label class="mb-1.5 block text-sm font-medium theme-text-secondary">{{ $t('labels.crusher') }} <span class="text-red-600">*</span></Label>
                <div class="relative flex items-center gap-2">
                  <div class="flex-1 relative">
                    <SearchDropdown v-model="filters.commonCrusherSearch" :items="crushers" :allItems="crushers" :placeholder="$t('labels.crusher')"
                      :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                      @select="(sel) => { commonData.crusher = sel; filters.commonCrusherSearch = sel.name; onCommonCrusherChange() }">
                      <template #prefix>
                        <WrenchScrewdriverIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                      </template>
                    </SearchDropdown>
                  </div>
                </div>
              </div>

              <div class="md:col-span-full">
                <Label class="mb-1 block text-xs font-medium theme-text-secondary">{{ $t('labels.notes') }}</Label>
                <textarea v-model="commonData.notes" rows="3" class="w-full px-3 py-2 border rounded text-sm"></textarea>
              </div>
            </div>

            <!-- Next / Cancel Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <Button variant="outline" @click="onCancel" class="px-10 py-3 font-medium transition">{{ $t('labels.cancel') }}</Button>
              <Button @click="goToStep2" :disabled="!isStep1Valid()" class="px-10 py-3 font-medium transition flex items-center gap-3">
                {{ $t('labels.next') }}
                <ArrowRightIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Step 2: Lines -->
      <div v-else class="w-full">
        <div class="flex items-center justify-between mb-8">
          <ShadcnButton variant="outline" size="native" @click="currentStep = 1" class="flex items-center gap-3 theme-text hover:theme-accent-muted font-medium transition"><ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />{{ $t('labels.back') }}</ShadcnButton>
          <h3 class="text-lg font-bold theme-text-primary">{{ $t('labels.step2Data') }}</h3>
          <div></div>
        </div>

        <div class="theme-dashboard-bg-soft border theme-border rounded-lg p-5 mb-8">
          <h4 class="text-sm font-bold theme-accent-muted mb-4">{{ $t('labels.summary') }}</h4>
          <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 text-sm">
            <div class="flex flex-col"><dt class="font-semibold theme-text-secondary">{{ $t('labels.dateFrom') || 'Date From' }}:</dt><dd class="theme-text-primary mt-1">{{ commonData.dateFrom || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold theme-text-secondary">{{ $t('labels.dateTo') || 'Date To' }}:</dt><dd class="theme-text-primary mt-1">{{ commonData.dateTo || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold theme-text-secondary">{{ $t('labels.site') }}:</dt><dd class="theme-text-primary mt-1">{{ commonData.site?.name || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold theme-text-secondary">{{ $t('labels.area') }}:</dt><dd class="theme-text-primary mt-1">{{ commonData.area?.name || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold theme-text-secondary">{{ $t('labels.contractor') }}:</dt><dd class="theme-text-primary mt-1">{{ commonData.contractor?.name || '-' }}</dd></div>
            <div class="flex flex-col"><dt class="font-semibold theme-text-secondary">{{ $t('labels.crusher') }}:</dt><dd class="theme-text-primary mt-1">{{ commonData.crusher?.name || '-' }}</dd></div>
            <div class="flex flex-col col-span-full"><dt class="font-semibold theme-text-secondary">{{ $t('labels.notes') }}:</dt><dd class="theme-text-primary mt-1">{{ commonData.notes || '-' }}</dd></div>
          </dl>
        </div>

        <div class="mb-6"><ShadcnButton variant="outline" size="native" @click="addRow" class="bg-green-600 theme-text-light px-4 py-2 rounded-lg hover:bg-green-700 font-medium shadow-md transition">+ {{ $t('labels.addRow') }}</ShadcnButton></div>

        <div class="mb-8 relative border border-gray-200 rounded-lg overflow-visible p-2">
          <div class="overflow-x-auto w-full">
            <div class="space-y-2">
              <ExtractLineEditor
                v-for="(r, i) in rows"
                :key="r.id"
                v-model="rows[i]"
                :items="exportItems"
                @remove="() => removeRow(i)"
              />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-sm font-semibold">
          <div class="flex items-center justify-end gap-3"><span class="theme-text-secondary">{{ $t('labels.subtotal') }}:</span><span class="theme-text-primary min-w-32 text-end">{{ formatCurrency(subtotal) }}</span></div>
          <div class="mt-4 sm:mt-0"><ShadcnButton variant="outline" size="native" @click="saveData" :disabled="isSaving" class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3">{{ isSaving ? $t('labels.saving') : $t('labels.save') }} <CheckIcon class="w-6 h-6" /></ShadcnButton></div>
        </div>

        <p v-if="saveError" class="mt-6 text-center text-red-600 font-medium text-lg">{{ saveError }}</p>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ExtractLineEditor from '@/components/dashboard/Extracts/ExtractLineEditor.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import { parseCreateExtract } from '@/validators/extracts'
import { useCreateExtract } from '@/composables/useCreateExtract'
import { getExtract, updateExtract } from '@/services/extracts'
import { getContractors, getLocations, getCrushers, getExportItems, getVehicles, getContractorsWithVehicles } from '@/api'
import normalizeItem from '@/utils/normalizeItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CalendarDaysIcon,
  MapPinIcon,
  MapIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon
} from '@acme/icon-packs/legacy'

export default {
  name: 'CreateExtractView',
  components: { ExtractLineEditor, SearchDropdown, DateField, Button, Card, CardContent, Input, Label, CalendarDaysIcon, MapPinIcon, MapIcon, UserGroupIcon, WrenchScrewdriverIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon },
  props: {
    modalMode: { type: Boolean, default: false },
    id: { type: [String, Number], default: null }
  },
  emits: ['submitted', 'cancelled', 'step-change'],
  setup(props, { emit }) {
    const router = useRouter()
    const { locale } = useI18n()
    const { proxy } = getCurrentInstance()

    const isEditing = computed(() => props.id != null)

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

    function formatCurrency(v) {
      if (v === undefined || v === null || v === '') return '-'
      const n = Number(v)
      if (Number.isNaN(n)) return v
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); return locale.value === 'ar' ? '\u200E' + formatted : formatted
    }

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
          getContractors({ pageSize: 1000, mode: 'extracts' }),
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

        if (isEditing.value && props.id) {
          try {
            const ext = await getExtract(props.id)
            if (ext) {
              commonData.dateFrom = ext.dateFrom ? ext.dateFrom.split('T')[0] : ''
              commonData.dateTo = ext.dateTo ? ext.dateTo.split('T')[0] : ''
              commonData.notes = ext.notes || ''

              // Resolve Site, Area, Contractor
              const findLoc = (id) => {
                if (!id) return null
                const findInTree = (list, targetId) => {
                  for (const item of list) {
                    if (item.id === targetId) return item
                    if (item.children && item.children.length) {
                      const found = findInTree(item.children, targetId)
                      if (found) return found
                    }
                  }
                  return null
                }
                return findInTree(allLocations.value, id)
              }

              commonData.site = findLoc(ext.locationId)
              filters.commonSiteSearch = commonData.site?.name || ''

              commonData.area = findLoc(ext.areaId)
              filters.commonAreaSearch = commonData.area?.name || ''

              commonData.contractor = contractors.value.find(c => c.id === ext.contractorId) || null
              filters.commonContractorSearch = commonData.contractor?.name || ''

              if (ext.lines && ext.lines.length) {
                rows.value = ext.lines.map(l => ({
                  id: l.id || (Date.now() + Math.random()),
                  itemId: l.itemId || '',
                  itemSearch: l.item?.name || '',
                  price: l.price != null ? Number(l.price) : '',
                  quantity: l.quantity != null ? Number(l.quantity) : 1,
                  discount: l.discount != null ? Number(l.discount) : 0,
                  total: l.total != null ? Number(l.total) : 0
                }))
              } else {
                rows.value = [createEmptyRow()]
              }
            }
          } catch (e) {
            console.error('Failed to load extract for editing:', e)
            saveError.value = e?.message || 'Failed to load extract'
          }
        } else {
          if (!rows.value.length) addRow()
        }
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

        if (isEditing.value) {
          await updateExtract(props.id, payload)
          const isRTL = locale.value === 'ar'
          proxy.$toast?.success(isRTL ? 'تم حفظ التعديل وإرساله للمراجعة بنجاح' : 'Edit request submitted for approval successfully')
          if (props.modalMode) {
            emit('submitted', { id: props.id })
          } else {
            router.push({ name: 'extracts-list' })
          }
        } else {
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
        }
      }catch(e){
        console.error('Failed to create extract', e)
        saveError.value = e?.response?.data?.message || e?.message || 'Save failed'
      }finally{ isSaving.value = false }
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
      isEditing,
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
      onCancel
    }
  }
}
</script>

<style scoped>
.bg-primary { background-color: var(--theme-primary); }
</style>

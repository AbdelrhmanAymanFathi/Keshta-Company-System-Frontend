<template>
  <teleport to="body">
    <transition name="kc-modal">
      <div
        v-if="isVisible"
        :dir="isRTL ? 'rtl' : 'ltr'"
        class="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-black/60 p-4"
        @click.self="closeModal"
      >
        <div class="kc-modal-panel flex max-h-[95vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
            <h2 class="text-2xl font-bold text-indigo-800">
              {{ currentStep === 1 ? ($t('dashboard.pay') || 'Pay') : ($t('payments.enterPayment') || 'Enter payment') }}
            </h2>
            <button
              type="button"
              @click="closeModal"
              class="text-3xl leading-none text-gray-500 transition hover:text-gray-800 focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div class="modal-body-container relative flex-1 overflow-y-auto p-6">
            <div v-if="currentStep === 1" class="w-full">
              <h3 class="mb-8 text-center text-lg font-bold text-gray-800">
                {{ $t('labels.step1BasicData') || 'Step 1: Basic data' }}
              </h3>

              <div class="mx-auto max-w-6xl">
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">
                      <MapPinIcon class="w-4 h-4 inline-block mr-1 text-gray-500" />
                      {{ $t('labels.site') || 'Site' }}
                    </label>
                    <div class="flex items-center gap-2">
                      <SearchDropdown
                        v-model="filters.siteSearch"
                        :items="sites"
                        :all-items="sites"
                        itemLabel="name"
                        :placeholder="$t('labels.site') || 'Site'"
                        :inputClass="fieldClass"
                        @select="handleSiteSelect"
                      />
                      <button type="button" @click="addSitePrompt" class="text-indigo-600 text-sm">
                        {{ isRTL ? (($t('labels.add') || 'Add') + ' +') : ('+ ' + ($t('labels.add') || 'Add')) }}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">
                      <BuildingLibraryIcon class="w-4 h-4 inline-block mr-1 text-gray-500" />
                      {{ $t('labels.area') || 'Area' }} <span class="text-red-600">*</span>
                    </label>
                    <div class="flex items-center gap-2">
                      <SearchDropdown
                        v-model="filters.areaSearch"
                        :items="availableAreas"
                        :all-items="areas"
                        :itemLabel="areaLabel"
                        :placeholder="$t('placeholders.searchArea') || 'Search area...'"
                        :inputClass="fieldClass"
                        @select="handleAreaSelect"
                      />
                      <button type="button" @click="addAreaPrompt" class="text-indigo-600 text-sm">
                        {{ isRTL ? (($t('labels.add') || 'Add') + ' +') : ('+ ' + ($t('labels.add') || 'Add')) }}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              <div class="mt-10 flex justify-end gap-6">
                <button
                  type="button"
                  @click="closeModal"
                  class="rounded-lg border border-gray-300 px-10 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {{ $t('labels.cancel') || 'Cancel' }}
                </button>
                <button
                  type="button"
                  @click="goToStep2"
                  :disabled="!isStep1Valid"
                  class="flex items-center gap-3 rounded-lg bg-green-600 px-10 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {{ $t('labels.next') || 'Next' }}
                  <ArrowRightIcon :class="['w-5 h-5 transition-transform', isRTL ? 'rotate-180' : '']" />
                </button>
              </div>
            </div>

            <div v-else class="w-full">
              <div class="mb-8 flex items-center justify-between">
                <button
                  type="button"
                  @click="prevStep"
                  class="flex items-center gap-3 font-medium text-indigo-600 transition hover:text-indigo-800"
                >
                  <ArrowLeftIcon :class="['w-5 h-5 transition-transform', isRTL ? 'rotate-180' : '']" />
                  {{ $t('labels.back') || 'Back' }}
                </button>
                <h3 class="text-lg font-bold text-gray-800">
                  {{ $t('labels.step2Data') || 'Step 2: Payment data' }}
                </h3>
                <div></div>
              </div>

              <div class="mb-8 rounded-lg border border-indigo-200 bg-indigo-50 p-5">
                <h4 class="mb-4 text-sm font-bold text-indigo-900">{{ $t('labels.summary') || 'Summary' }}</h4>
                <dl class="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <div class="flex flex-col">
                    <dt class="font-semibold text-gray-700">{{ $t('labels.site') || 'Site' }}:</dt>
                    <dd class="mt-1 text-gray-900">{{ selectedSite?.name || '-' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold text-gray-700">{{ $t('labels.area') || 'Area' }}:</dt>
                    <dd class="mt-1 text-gray-900">{{ selectedArea?.name || '-' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold text-gray-700">{{ $t('labels.rows') || 'Rows' }}:</dt>
                    <dd class="mt-1 text-gray-900">{{ rows.length }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold text-gray-700">{{ $t('labels.total') || 'Total' }}:</dt>
                    <dd class="mt-1 text-gray-900">{{ totalAmountDisplay }}</dd>
                  </div>
                </dl>
              </div>

              <div class="relative overflow-visible rounded-lg border border-gray-200 p-2">
                <div class="w-full overflow-x-auto">
                  <table class="w-full min-w-[1080px] divide-y divide-gray-200 rounded-lg border">
                    <thead class="sticky top-0 z-10 bg-indigo-50">
                      <tr>
                        <th class="w-12 px-4 py-3 text-center text-xs font-medium text-gray-700">#</th>
                        <th class="px-4 py-3 text-start text-xs font-medium text-gray-700">{{ $t('labels.date') || 'Date' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium text-gray-700">{{ $t('payments.module') || 'Module' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium text-gray-700">{{ $t('labels.contractor') || 'Contractor' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium text-gray-700">{{ $t('labels.amount') || 'Amount' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium text-gray-700">{{ $t('labels.paymentMethod') || 'Payment Method' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium text-gray-700">{{ $t('labels.treasury') || 'Treasury' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium text-gray-700">{{ $t('labels.notes') || 'Notes' }}</th>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-700">{{ $t('labels.actions') || 'Actions' }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="(row, index) in rows" :key="row.id">
                        <td class="px-4 py-3 text-center text-sm text-gray-600">{{ index + 1 }}</td>
                        <td class="px-3 py-2">
                          <DateField v-model="row.date" class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </td>
                        <td class="px-3 py-2">
                          <select v-model="row.module" @change="handleRowModuleChange(row)" class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                            <option value="" disabled>{{ $t('placeholders.select') || 'Select' }}</option>
                            <option v-for="option in moduleOptions" :key="option.value" :value="option.value">
                              {{ option.label }}
                            </option>
                          </select>
                        </td>
                        <td class="px-3 py-2">
                          <div class="flex items-center gap-2">
                            <SearchDropdown
                              v-model="row._contractorSearch"
                              :items="row.contractors"
                              itemLabel="name"
                              :placeholder="row.module ? ($t('placeholders.searchContractor') || 'Search contractor') : ($t('payments.selectModuleFirst') || 'Select module first')"
                              :inputClass="fieldClass"
                              :disabled="!row.module || !row.contractors.length"
                              @select="(c) => { row.contractor = c; row._contractorSearch = c?.name || '' }"
                            />
                            <button type="button" @click="addContractorPrompt(row)" class="text-indigo-600 text-sm">
                              {{ isRTL ? (($t('labels.add') || 'Add') + ' +') : ('+ ' + ($t('labels.add') || 'Add')) }}
                            </button>
                          </div>
                        </td>
                        <td class="px-3 py-2">
                          <input
                            v-model.number="row.amount"
                            type="number"
                            min="0"
                            step="0.01"
                            :placeholder="$t('labels.amount') || 'Amount'"
                            class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            @keydown="(e) => handleAmountKeydown(e, index)"
                          />
                        </td>
                        <td class="px-3 py-2">
                          <select v-model="row.paymentMethod" class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                            <option value="cash">{{ $t('payments.methods.cash') || 'Cash' }}</option>
                            <option value="bank">{{ $t('payments.methods.bank') || 'Bank' }}</option>
                          </select>
                        </td>
                        <td class="px-3 py-2">
                          <input
                            v-model="row.treasury"
                            type="text"
                            :placeholder="$t('dashboard.treasuryPlaceholder') || 'Source treasury'"
                            class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td class="px-3 py-2">
                          <input
                            v-model="row.notes"
                            type="text"
                            :placeholder="$t('labels.notes') || 'Notes'"
                            class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td class="px-3 py-2 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            @click="duplicateRow(index)"
                            class="rounded-full border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-100"
                            :aria-label="$t('labels.duplicate') || 'Duplicate row'"
                          >
                            ⎘
                          </button>
                          <button
                            type="button"
                            @click="removeRow(index)"
                            class="rounded-full border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-100"
                            :aria-label="$t('labels.remove') || 'Remove row'"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="mt-6 rounded-lg bg-gray-50 p-6">
                <div class="flex flex-wrap items-center gap-6 text-sm">
                  <div class="flex items-center gap-3">
                    <span class="font-semibold text-indigo-800">{{ $t('labels.site') || 'Site' }}:</span>
                    <span class="text-gray-900">{{ selectedSite?.name || '-' }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-semibold text-indigo-800">{{ $t('labels.area') || 'Area' }}:</span>
                    <span class="text-gray-900">{{ selectedArea?.name || '-' }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-semibold text-indigo-800">{{ $t('labels.rows') || 'Rows' }}:</span>
                    <span class="text-gray-900">{{ rows.length }}</span>
                  </div>
                  <div class="ml-auto flex items-center gap-3 text-base font-semibold text-indigo-900">
                    <span>{{ $t('labels.total') || 'Total' }}:</span>
                    <span>{{ totalAmountDisplay }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  @click="prevStep"
                  class="flex items-center gap-3 rounded-lg border border-gray-300 px-10 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <ArrowLeftIcon class="w-5 h-5" />
                  {{ $t('labels.back') || 'Back' }}
                </button>
                <button
                  type="button"
                  @click="savePayment"
                  :disabled="isSubmitDisabled"
                  class="flex items-center gap-3 rounded-lg bg-green-600 px-10 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <span>✓</span>
                  {{ $t('labels.save') || 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import DateField from '@/components/shared/DateField.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { getLocations, getContractors } from '@/api'
import { ArrowRightIcon, ArrowLeftIcon, MapPinIcon, BuildingLibraryIcon } from '@heroicons/vue/24/outline'

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const idsEqual = (left, right) => String(left ?? '') === String(right ?? '')

export default {
  name: 'PaymentCreationModal',
  components: { DateField, SearchDropdown, ArrowRightIcon, ArrowLeftIcon, MapPinIcon, BuildingLibraryIcon },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'saved'],
  setup(props, { emit }) {
    const internalVisible = ref(props.visible)
    const currentStep = ref(1)
    const locations = ref([])
    const selectedSite = ref(null)
    const selectedArea = ref(null)

    const createRow = (overrides = {}) => ({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      date: '',
      module: '',
      contractor: null,
      _contractorSearch: '',
      amount: '',
      paymentMethod: 'cash',
      treasury: '',
      notes: '',
      contractors: [],
      ...overrides
    })

    const rows = ref([createRow()])

    const filters = reactive({
      siteSearch: '',
      areaSearch: ''
    })

    const moduleOptions = [
      { value: 'supply', label: 'Supplies' },
      { value: 'transport', label: 'Transport' },
      { value: 'rentals', label: 'Equipment' },
      { value: 'extract', label: 'Extracts' }
    ]

    const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

    const isRTL = computed(() => {
      if (typeof document === 'undefined') return false
      return document.documentElement?.dir === 'rtl' || document.body?.dir === 'rtl'
    })

    const sites = computed(() => locations.value.filter(location => !location.parentId && !location.parent))

    const areas = computed(() => {
      const flattened = []
      for (const site of locations.value) {
        const children = Array.isArray(site.children) ? site.children : []
        children.forEach(area => {
          flattened.push({
            ...area,
            parentId: area.parentId ?? site.id,
            parentName: area.parentName || site.name,
            site
          })
        })
      }
      locations.value
        .filter(location => location.parentId || location.parent)
        .forEach(area => {
          if (!flattened.some(existing => idsEqual(existing.id, area.id))) {
            const site = findSiteForArea(area)
            flattened.push({
              ...area,
              parentName: area.parentName || site?.name || area.parent?.name || '',
              site
            })
          }
        })
      return flattened
    })

    const availableAreas = computed(() => {
      if (!selectedSite.value) return areas.value
      return areas.value.filter(area => idsEqual(area.parentId, selectedSite.value.id) || idsEqual(area.site?.id, selectedSite.value.id))
    })

    const isStep1Valid = computed(() => Boolean(selectedArea.value))

    const isSubmitDisabled = computed(() => {
      return rows.value.some(row => {
        return !row.date || !row.module || !row.amount || !row.contractor || !row.paymentMethod || !row.treasury
      })
    })

    const totalAmount = computed(() => {
      return rows.value.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
    })

    const totalAmountDisplay = computed(() => {
      return totalAmount.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })

    function findSiteForArea(area) {
      if (!area) return null
      if (area.site) return area.site
      if (area.parent && typeof area.parent === 'object') return area.parent
      return locations.value.find(location => idsEqual(location.id, area.parentId) || idsEqual(location.id, area.locationId))
    }

    const areaLabel = (area) => {
      if (!area) return ''
      return area.parentName ? `${area.name} (${area.parentName})` : area.name
    }

    const loadLocations = async () => {
      try {
        const res = await getLocations()
        locations.value = normalizeList(res?.data)
      } catch (error) {
        console.error('Failed to load locations', error)
        locations.value = []
      }
    }

    const loadContractorsForRow = async (row) => {
      if (!row.module) {
        row.contractors = []
        return
      }

      try {
        const res = await getContractors({
          pageSize: 1000,
          mode: row.module
        })
        row.contractors = normalizeList(res?.data)
        if (row.contractor) row._contractorSearch = row.contractor.name
      } catch (error) {
        console.error('Failed to load contractors', error)
        row.contractors = []
      }
    }

    const handleSiteSelect = (site) => {
      selectedSite.value = site
      filters.siteSearch = site?.name || ''
      selectedArea.value = null
      filters.areaSearch = ''
    }

    const handleAreaSelect = (area) => {
      selectedArea.value = area
      filters.areaSearch = area?.name || ''
      const site = findSiteForArea(area)
      if (site) {
        selectedSite.value = site
        filters.siteSearch = site.name || ''
      }
    }

    const handleRowModuleChange = async (row) => {
      row.contractor = null
      row.contractors = []
      await loadContractorsForRow(row)
    }

    const duplicateRow = (index) => {
      const source = rows.value[index]
      rows.value.splice(index + 1, 0, createRow({
        date: source.date,
        module: source.module,
        contractor: source.contractor,
        amount: source.amount,
        paymentMethod: source.paymentMethod,
        treasury: source.treasury,
        notes: source.notes,
        contractors: [...source.contractors]
      }))
    }

    const removeRow = (index) => {
      if (rows.value.length > 1) {
        rows.value.splice(index, 1)
      } else {
        rows.value[0] = createRow()
      }
    }

    const resetForm = () => {
      currentStep.value = 1
      selectedSite.value = null
      selectedArea.value = null
      filters.siteSearch = ''
      filters.areaSearch = ''
      rows.value = [createRow()]
    }

    const STORAGE_KEY = 'paymentCreationModalCommonData'

    const closeModal = () => {
      internalVisible.value = false
    }

    function saveToStorage() {
      try {
        const payload = { selectedSite: selectedSite.value, selectedArea: selectedArea.value, rows: rows.value.map(r => ({ id: r.id, date: r.date, module: r.module, contractor: r.contractor, amount: r.amount, paymentMethod: r.paymentMethod, treasury: r.treasury, notes: r.notes })) }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch (e) { console.warn('save storage failed', e) }
    }

    function loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const p = JSON.parse(raw)
        if (p.selectedSite) selectedSite.value = p.selectedSite
        if (p.selectedArea) selectedArea.value = p.selectedArea
        if (Array.isArray(p.rows) && p.rows.length) rows.value = p.rows.map(r => createRow({ id: r.id, date: r.date, module: r.module, contractor: r.contractor, amount: r.amount, paymentMethod: r.paymentMethod, treasury: r.treasury, notes: r.notes }))
      } catch (e) { console.warn('load storage failed', e) }
    }

    function addSitePrompt() {
      const name = window.prompt('New site name')
      if (!name) return
      const s = { id: Date.now(), name }
      locations.value.push(s)
      selectedSite.value = s
      filters.siteSearch = s.name
      saveToStorage()
    }

    function addAreaPrompt() {
      if (!selectedSite.value) { window.alert('Select a site first'); return }
      const name = window.prompt('New area name')
      if (!name) return
      const a = { id: Date.now(), name, parentId: selectedSite.value.id }
      locations.value.push(a)
      selectedArea.value = a
      filters.areaSearch = a.name
      saveToStorage()
    }

    function addContractorPrompt(row) {
      const name = window.prompt('New contractor name')
      if (!name) return
      const c = { id: Date.now(), name }
      row.contractors = row.contractors || []
      row.contractors.push(c)
      row.contractor = c
      row._contractorSearch = c.name
      saveToStorage()
    }

    function isRowEmpty(row) {
      return !row.date && !row.module && !row.contractor && !row.amount && !row.treasury && !row.notes
    }

    function handleAmountKeydown(e, index) {
      if (e.key === 'Enter') { e.preventDefault(); if (index === rows.value.length - 1) { rows.value.push(createRow()); saveToStorage() } }
      if (e.key === 'Tab' && !e.shiftKey && index === rows.value.length - 1) { rows.value.push(createRow()); saveToStorage() }
    }

    const prevStep = () => {
      currentStep.value = 1
    }

    const goToStep2 = () => {
      if (!isStep1Valid.value) return
      currentStep.value = 2
    }

    const savePayment = () => {
      // filter out completely empty rows
      const filtered = rows.value.filter(r => !isRowEmpty(r))
      if (!filtered.length) return
      // basic validation on remaining rows
      if (filtered.some(r => !r.date || !r.module || !r.amount || !r.contractor || !r.paymentMethod || !r.treasury)) return
      const payload = {
        site: selectedSite.value,
        location: selectedSite.value,
        area: selectedArea.value?.name || '',
        areaObject: selectedArea.value,
        areaId: selectedArea.value?.id,
        siteId: selectedSite.value?.id,
        rows: filtered.map(row => ({
          date: row.date,
          module: row.module,
          amount: Number(row.amount) || 0,
          contractor: row.contractor,
          contractorId: row.contractor?.id,
          paymentMethod: row.paymentMethod,
          treasury: row.treasury,
          notes: row.notes
        }))
      }
      // clear persisted draft
      try { localStorage.removeItem(STORAGE_KEY) } catch (e) { console.warn('remove storage failed', e) }
      emit('saved', payload)
      closeModal()
    }

    watch(() => props.visible, (value) => { internalVisible.value = value; if (value) currentStep.value = 1 })
    watch(internalVisible, (value) => { emit('update:visible', value); if (!value) resetForm() })
    watch([selectedSite, selectedArea, rows], () => saveToStorage(), { deep: true })

    onMounted(async () => { await loadLocations(); loadFromStorage() })

    return {
      isVisible: internalVisible,
      isRTL,
      currentStep,
      filters,
      sites,
      areas,
      availableAreas,
      rows,
      selectedSite,
      selectedArea,
      moduleOptions,
      fieldClass,
      areaLabel,
      isStep1Valid,
      isSubmitDisabled,
      totalAmountDisplay,
      handleSiteSelect,
      handleAreaSelect,
      handleRowModuleChange,
      duplicateRow,
      removeRow,
      goToStep2,
      prevStep,
      savePayment,
      closeModal,
      addSitePrompt,
      addAreaPrompt,
      addContractorPrompt,
      handleAmountKeydown
    }
  }
}
</script>

<style scoped>
</style>

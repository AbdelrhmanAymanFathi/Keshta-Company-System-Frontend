<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4" :dir="isRTL ? 'rtl' : 'ltr'" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 class="text-2xl font-bold text-indigo-800">{{ currentStep === 1 ? modalTitleComputed : ($t('labels.enterDetails') || 'Enter Details') }}</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-800 text-3xl leading-none focus:outline-none">×</button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 modal-body-container relative">

          <!-- ============================================ STEP 1 ============================================ -->
          <div v-if="currentStep === 1" class="w-full">
            <h3 class="text-lg font-bold mb-8 text-center text-gray-800">{{ $t('labels.step1BasicData') }}</h3>

            <div class="max-w-6xl mx-auto">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <!-- Equipment -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('equipmentLog.equipment') }} <span class="text-red-600">*</span></label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="form.equipmentLabel" :items="equipments" :allItems="equipments" :placeholder="$t('equipmentLog.equipment')" :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'" @select="selectEquipment" />
                    </div>
                  </div>
                </div>

                <!-- Hourly Rate -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('labels.price') }} <span class="text-red-600">*</span></label>
                  <div class="relative">
                    <input type="number" v-model.number="form.hourlyRate" step="0.01" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Next / Cancel Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <button @click="closeModal" class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition">{{ $t('labels.cancel') }}</button>
              <button @click="goToStep2" :disabled="!isStep1Valid()" class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center gap-3">{{ $t('labels.next') }} <ArrowRightIcon class="w-6 h-6 transition-transform rtl:rotate-180" /></button>
            </div>
          </div>

          <!-- ============================================ STEP 2 ============================================ -->
          <div v-else class="w-full">
            <!-- Back Button and Title -->
            <div class="flex items-center justify-between mb-8">
              <button @click="goBackToStep1" class="flex items-center gap-3 text-indigo-600 hover:text-indigo-800 font-medium transition"><ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />{{ $t('labels.back') }}</button>
              <h3 class="text-lg font-bold text-gray-800">{{ $t('labels.step2Data') }}</h3>
              <div></div>
            </div>

            <!-- Summary Card of Common Data -->
            <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-5 mb-8">
              <h4 class="text-sm font-bold text-indigo-900 mb-4">{{ $t('labels.summary') }}</h4>
              <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('equipmentLog.equipment') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ selectedEquipmentName || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('equipmentLog.hourlyRate') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ formatNumber(form.hourlyRate) }}</dd>
                </div>
              </dl>
            </div>

            <!-- Fields table simplified for EquipmentLog: hours, driver, notes -->
            <div class="    mb-8
    relative
    border border-gray-200 rounded-lg
    overflow-visible
    p-2">
              <div class="overflow-x-auto w-full">
                <table ref="tableRef" class="w-full  divide-y divide-gray-200 border rounded-lg">
                  <thead class="bg-indigo-50 sticky top-0 z-10">
                    <tr>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-700 w-12">{{ $t('#') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">{{ $t('labels.date') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">{{ $t('equipmentLog.equipment') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">{{ $t('labels.hours') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">{{ $t('labels.driver') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">{{ $t('labels.notes') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">{{ $t('labels.total') }}</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-700">{{ $t('labels.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="(row, index) in rows" :key="row.id">
                      <td class="px-4 py-3 text-center text-sm text-gray-600">{{ index + 1 }}</td>

                      <!-- Date (editable) -->
                      <td class="px-3 py-2">
                        <input type="date" v-model="row.date" @keydown.enter.prevent="handleEnterKey(index)" class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </td>

                      <!-- Equipment (readonly, from step 1 selection) -->
                      <td class="px-3 py-2">
                        <div class="text-sm text-gray-800">{{ selectedEquipmentName || form.equipmentLabel || '-' }}</div>
                      </td>

                      <!-- Hours -->
                      <td class="px-3 py-2">
                        <input :ref="el => row.hoursInput = el" type="number" v-model.number="row.hours" step="0.01" @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 no-spinner" />
                      </td>

                      <!-- Driver -->
                      <td class="px-3 py-2" :ref="el => row.driverCell = el">
                        <div class="relative">
                          <div
                            class="border border-gray-300 rounded px-2 py-1 flex items-center justify-between cursor-pointer focus-within:ring-1 focus-within:ring-indigo-500"
                            @click.stop="toggleDriverDropdown(row)">
                            <input v-model="row.search" type="text"
                              :placeholder="row.driverLabel || $t('labels.driver')"
                              class="outline-none flex-1 text-sm bg-transparent"
                              @keydown.enter.prevent
                              @keydown.escape="row.open = false"
                              @keydown="onDropdownKeydown($event, row, filteredDrivers(row), (sel) => selectDriverRow(row, sel))"
                              @focus="row.open = true" @blur="onInputBlur(row)" />
                            <span class="text-gray-400">▾</span>
                          </div>
                        </div>

                        <teleport to=".modal-body-container" v-if="row.open">
                          <div
                            class="absolute border border-gray-200 bg-white rounded-md max-h-40 overflow-y-auto shadow-2xl"
                            :class="getDriverDropdownClasses()" :style="getDriverDropdownStyle(row)" @click.stop>

                            <div v-for="(d, di) in filteredDrivers(row)" :key="d.id" @mousedown.prevent="selectDriverRow(row, d)"
                              @mousemove="row.highlightedIndex = di"
                              :class="['px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 text-start', di === row.highlightedIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50']">
                              {{ d.name }}
                            </div>

                            <div v-if="(!drivers || !drivers.length)" class="px-3 py-2 text-sm text-gray-500">{{ $t('labels.noResults') || 'No results' }}</div>
                          </div>
                        </teleport>
                      </td>

                      <!-- Notes -->
                      <td class="px-3 py-2">
                        <input type="text" v-model="row.notes" @keydown.enter.prevent="handleEnterKey(index)" @keydown.tab="onLastFieldTab(index, $event)"
                          class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </td>

                      <!-- Total per Row -->
                      <td class="px-3 py-2 text-sm font-semibold text-indigo-600">
                        {{ formatNumber(totalPerRow(row)) }}
                      </td>

                      <!-- Actions -->
                      <td class="px-4 py-3 text-center">
                        <div class="flex justify-center gap-3">
                          <button @click="duplicateRow(index)" class="text-blue-600 hover:text-blue-800 transition" title="Duplicate" tabindex="-1">
                            <DocumentDuplicateIcon class="w-5 h-5" />
                          </button>
                          <button @click="removeRow(index)" class="text-red-600 hover:text-red-800 transition" title="Delete" tabindex="-1">
                            <TrashIcon class="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


            <!-- Totals -->
            <div class="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-sm font-semibold">
              <div class="flex items-center justify-end gap-3">
                <span class="text-gray-700">{{ $t('labels.total') }}:</span>
                <span class="text-gray-900 min-w-32 text-end">{{ formatNumber(rowsTotal) }}</span>
              </div>
            </div>

            <!-- Save / Back Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <button @click="goBackToStep1" class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition flex items-center gap-3"><ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />{{ $t('labels.back') }}</button>
              <button @click="save" :disabled="isSaving" class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center gap-3">{{ isSaving ? $t('labels.saving') : $t('labels.save') }} <CheckIcon class="w-6 h-6" /></button>
            </div>

            <p v-if="saveError" class="mt-6 text-center text-red-600 font-medium text-lg">{{ saveError }}</p>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { CalendarDaysIcon, ArrowRightIcon, ArrowLeftIcon, CheckIcon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'EquipmentLogCreationModal',
  components: { SearchDropdown, CalendarDaysIcon, ArrowRightIcon, ArrowLeftIcon, CheckIcon, DocumentDuplicateIcon, TrashIcon },
  props: {
    isOpen: { type: Boolean, default: false },
    modalTitle: { type: String, default: '' },
    equipments: { type: Array, default: () => [] },
    drivers: { type: Array, default: () => [] },
    modelValue: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false }
  },
  emits: ['close', 'saved'],
  data() {
    return {
      currentStep: 1,
      form: {
        date: this.modelValue.date || new Date().toISOString().split('T')[0],
        equipmentId: this.modelValue.equipmentId || '',
        equipmentLabel: this.modelValue.equipmentLabel || this.modelValue.equipment || this.modelValue.equipmentLog || '',
        hourlyRate: this.modelValue.hourlyRate || 0,
        hours: this.modelValue.hours || 1,
        driverId: this.modelValue.driverId || '',
        driverLabel: this.modelValue.driverLabel || '',
        notes: this.modelValue.notes || '',
        isRental: Boolean(this.modelValue.isRental)
      },
      rows: [],
      isSaving: false,
      saveError: ''
    }
  },
  computed: {
    selectedEquipmentName() {
      const found = (this.equipments || []).find(e => Number(e.id) === Number(this.form.equipmentId))
      return found?.name || this.form.equipmentLabel || ''
    },
    modalTitleComputed() {
      return this.modalTitle || (this.$t ? this.$t('dashboard.newSupply') : 'New Equipment Log')
    },
    isRTL() {
      return this.$i18n && this.$i18n.locale === 'ar'
    },
    rowsTotal() {
      return (this.rows || []).reduce((s, r) => {
        const h = Number(r.hours || 0)
        const rate = Number(r.hourlyRate != null ? r.hourlyRate : this.form.hourlyRate || 0)
        return s + Math.max(0, h * rate)
      }, 0)
    },
    rowsHoursSum() {
      return (this.rows || []).reduce((s, r) => s + (Number(r.hours || 0) || 0), 0)
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    selectEquipment(item) {
      if (!item) { this.form.equipmentId = ''; this.form.equipmentLabel = ''; this.form.isRental = false; return }
      this.form.equipmentId = item.id != null ? Number(item.id) : ''
      this.form.equipmentLabel = item.name ?? ''
      this.form.isRental = Boolean(item.contractorId ?? item.contractor ?? false)
      if (item.hourlyRate != null && item.hourlyRate !== '') this.form.hourlyRate = Number(item.hourlyRate)
    },
    selectDriver(item) {
      if (!item) { this.form.driverId = ''; this.form.driverLabel = ''; return }
      this.form.driverId = item.id != null ? Number(item.id) : ''
      this.form.driverLabel = item.name ?? ''
    },
    isStep1Valid() {
      return (this.form.equipmentLabel || this.form.equipmentId) && Number(this.form.hourlyRate) > 0
    },
    goToStep2() {
      if (!this.isStep1Valid()) return
      this.currentStep = 2
      // initialize rows for step 2 if empty
      if (!this.rows || !this.rows.length) this.rows = [this.createEmptyRow()]
    },
    goBackToStep1() { this.currentStep = 1 },
    formatNumber(v) { return Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) },
    createEmptyRow() {
      return {
        id: Date.now() + Math.random(),
        date: this.form.date || '',
        hours: this.form.hours || 1,
        driver: null,
        driverLabel: '',
        notes: '',
        hourlyRate: this.form.hourlyRate || 0,
        open: false,
        search: '',
        highlightedIndex: -1
      }
    },
    addRow() {
      this.rows.push(this.createEmptyRow())
    },
    duplicateRow(index) {
      const src = this.rows[index]
      if (!src) return
      const copy = JSON.parse(JSON.stringify(src))
      copy.id = Date.now() + Math.random()
      copy.open = false
      copy.search = ''
      this.rows.splice(index + 1, 0, copy)
    },
    removeRow(index) {
      this.rows.splice(index, 1)
      if (this.rows.length === 0) this.addRow()
    },
    filteredDrivers(row) {
      const q = (row.search || '').toLowerCase()
      return (this.drivers || []).filter(d => (d.name || '').toLowerCase().includes(q))
    },
    selectDriverRow(row, item) {
      if (!item) { row.driver = null; row.driverLabel = ''; return }
      row.driver = item
      row.driverLabel = item.name || ''
      row.open = false
    },
    toggleDriverDropdown(row) {
      row.open = !row.open
      if (row.open) {
        row.highlightedIndex = -1
        row.search = ''
      }
    },
    getDriverDropdownStyle(row) {
      if (!row.driverCell) return {}
      const rect = row.driverCell.getBoundingClientRect()
      const containerRect = document.querySelector('.modal-body-container')?.getBoundingClientRect()
      if (!containerRect) return {}
      const relativeTop = rect.bottom - containerRect.top
      const relativeLeft = rect.left - containerRect.left
      return { top: `${relativeTop}px`, left: `${relativeLeft}px`, width: `${rect.width}px`, position: 'absolute' }
    },
    getDriverDropdownClasses() { return 'z-50' },
    onInputBlur(row) {
      // small delay to allow mousedown on dropdown items to register
      if (row._closeTimeout) clearTimeout(row._closeTimeout)
      row._closeTimeout = setTimeout(() => { row.open = false }, 150)
    },
    onDropdownKeydown(e, row, list, onConfirm) {
      const key = e.key
      const max = (list || []).length - 1
      if (key === 'ArrowDown') {
        e.preventDefault()
        row.highlightedIndex = Math.min(max, (row.highlightedIndex ||  -1) + 1)
        row.open = true
        return
      }
      if (key === 'ArrowUp') {
        e.preventDefault()
        row.highlightedIndex = Math.max(0, (row.highlightedIndex || 0) - 1)
        row.open = true
        return
      }
      if (key === 'Enter') {
        e.preventDefault()
        const hi = row.highlightedIndex
        if (hi != null && hi >= 0 && list && list[hi]) {
          onConfirm(list[hi])
        } else if (row.search) {
          // try exact match
          const found = (list || []).find(i => (i.name || '').toLowerCase() === (row.search || '').toLowerCase())
          if (found) onConfirm(found)
        }
        row.open = false
        return
      }
      if (key === 'Escape') {
        row.open = false
        return
      }
    },
    totalPerRow(row) {
      const h = Number(row.hours || 0)
      const r = Number(row.hourlyRate != null ? row.hourlyRate : this.form.hourlyRate || 0)
      return Math.max(0, h * r)
    },
    handleEnterKey(index) {
      const newRow = this.createEmptyRow()
      this.rows.splice(index + 1, 0, newRow)
    },
    onLastFieldTab(index, event) {
      if (event.shiftKey) return
      // If tabbing on the last row, create a new row and focus its hours input
      if (index === (this.rows.length - 1)) {
        event.preventDefault()
        this.addRow()
        this.$nextTick(() => {
          const newRow = this.rows[index + 1]
          if (newRow && newRow.hoursInput && typeof newRow.hoursInput.focus === 'function') {
            newRow.hoursInput.focus()
            if (typeof newRow.hoursInput.select === 'function') newRow.hoursInput.select()
          }
        })
      }
    },
    async save() {
      this.saveError = ''
      this.isSaving = true
      try {
        // Build payload
        let equipmentIdNumeric = Number(this.form.equipmentId)
        if (isNaN(equipmentIdNumeric)) {
          const found = (this.equipments || []).find(e => (e.name || String(e)).toString() === (this.form.equipmentLabel || ''))
          if (found && found.id != null) equipmentIdNumeric = Number(found.id)
        }
        if (isNaN(equipmentIdNumeric)) throw new Error(this.$t('equipmentLog.selectEquipment') || 'Please select equipment')

        let driverIdNumeric = Number(this.form.driverId)
        if (isNaN(driverIdNumeric)) {
          const foundDriver = (this.drivers || []).find(d => (d.name || String(d)).toString() === (this.form.driverLabel || ''))
          if (foundDriver && foundDriver.id != null) driverIdNumeric = Number(foundDriver.id)
        }
        if (isNaN(driverIdNumeric)) driverIdNumeric = null

        const hourlyRateNum = Number(this.form.hourlyRate || 0)

        // Build rows payload (each row: date, hours, driverId, driverLabel, notes, hourlyRate, total)
        const rowsPayload = (this.rows || []).map(r => {
          const dateVal = r.date || this.form.date || new Date().toISOString().split('T')[0]
          const hoursVal = Number(r.hours || 0)
          let driverIdVal = null
          if (r.driver && r.driver.id != null) driverIdVal = Number(r.driver.id)
          else if (r.driverLabel) {
            const found = (this.drivers || []).find(d => (d.name || '').toString() === r.driverLabel)
            if (found && found.id != null) driverIdVal = Number(found.id)
          }
          const rowHourly = Number(r.hourlyRate != null ? r.hourlyRate : this.form.hourlyRate || 0)
          const rowTotal = Number((hoursVal * rowHourly).toFixed(2))
          return {
            date: new Date(dateVal).toISOString(),
            hours: hoursVal,
            driverId: driverIdVal,
            driverLabel: r.driverLabel || '',
            notes: r.notes || '',
            hourlyRate: rowHourly,
            total: rowTotal
          }
        })

        const totalSum = rowsPayload.reduce((s, rr) => s + (Number(rr.total) || 0), 0)
        const hoursSum = rowsPayload.reduce((s, rr) => s + (Number(rr.hours) || 0), 0)

        const payload = {
          date: new Date(this.form.date).toISOString(),
          equipmentId: equipmentIdNumeric,
          hourlyRate: hourlyRateNum,
          hours: hoursSum || Number(this.form.hours || 0),
          total: Number(totalSum.toFixed(2)),
          notes: this.form.notes || '',
          isRental: Boolean(this.form.isRental),
          rows: rowsPayload
        }

        this.$emit('saved', payload)
        this.closeModal()
      } catch (e) {
        this.saveError = e?.message || (this.$t('common.saveError') || 'Error saving')
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>

<style scoped>
.modal-body-container { max-height: 70vh; overflow: auto; }
</style>

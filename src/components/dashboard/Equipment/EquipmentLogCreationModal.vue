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
        <div class="flex-1 overflow-y-auto p-6 modal-body-container relative" @scroll.passive="onDriverDropdownParentScroll">

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

                <!-- Contractor (readonly, auto-populated from equipment selection) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('vehicles.contractor') }}</label>
                  <div class="relative">
                    <input type="text" v-model="form.contractorLabel" disabled class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-4 pe-4 text-sm bg-gray-100 cursor-not-allowed text-gray-600" :placeholder="$t('vehicles.contractor') || 'Contractor'" />
                  </div>
                </div>

                <!-- Site (الموقع) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('labels.site') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonSiteSearch" :items="sites" :allItems="sites"
                        :placeholder="$t('labels.site')"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'"
                        @select="(sel) => { form.site = sel; filters.commonSiteSearch = sel.name; onCommonSiteChange() }">
                        <template #prefix>
                          <MapPinIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @click="showAddSite = true; pendingRow = null" style="color: #10b981;"
                            class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-t border-gray-100">
                            + {{ $t('supply.addNewSite') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Area (المنطقة) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('labels.area') }}
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonAreaSearch" :items="commonAvailableAreas"
                        :allItems="commonAvailableAreas" :placeholder="$t('labels.area')" :disabled="!form.site"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'"
                        @select="(sel) => { form.area = sel; filters.commonAreaSearch = sel.name }">
                        <template #prefix>
                          <MapIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div v-if="form.site" @click="showAddArea = true; pendingRow = null"
                            style="color: #10b981;"
                            class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-t border-gray-100">
                            + {{ $t('supply.addNewArea') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
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
                  <dt class="font-semibold text-gray-700">{{ $t('vehicles.contractor') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ form.contractorLabel || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('equipmentLog.hourlyRate') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ formatNumber(form.hourlyRate) }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('labels.site') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ form.site?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('labels.area') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ form.area?.name || '-' }}</dd>
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
                              :placeholder="$t('labels.driver')"
                              class="outline-none flex-1 text-sm bg-transparent text-gray-900 placeholder:text-gray-400"
                              @keydown.enter.prevent
                              @keydown.escape="row.open = false"
                              @keydown="onDropdownKeydown($event, row, filteredDrivers(row), (sel) => selectDriverRow(row, sel))"
                              @focus="onDriverFieldFocus(row)" @blur="onInputBlur(row)" />
                            <span class="text-gray-400">▾</span>
                          </div>
                        </div>

                        <teleport to="body" v-if="row.open">
                          <div
                            class="border border-gray-200 bg-white rounded-md shadow-2xl"
                            :style="getDriverDropdownStyle(row)" @click.stop>

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
</template>

<script>
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { CalendarDaysIcon, ArrowRightIcon, ArrowLeftIcon, CheckIcon, DocumentDuplicateIcon, TrashIcon, MapPinIcon, MapIcon } from '@heroicons/vue/24/outline'
import { getLocations, createLocation } from '@/api'

export default {
  name: 'EquipmentLogCreationModal',
  components: { SearchDropdown, CalendarDaysIcon, ArrowRightIcon, ArrowLeftIcon, CheckIcon, DocumentDuplicateIcon, TrashIcon, MapPinIcon, MapIcon },
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
        contractorId: this.modelValue.contractorId || '',
        contractorLabel: this.modelValue.contractorLabel || '',
        hourlyRate: this.modelValue.hourlyRate || 0,
        hours: this.modelValue.hours || 1,
        driverId: this.modelValue.driverId || '',
        driverLabel: this.modelValue.driverLabel || '',
        site: null,
        area: null,
        notes: this.modelValue.notes || '',
        isRental: Boolean(this.modelValue.isRental)
      },
      rows: [],
      isSaving: false,
      saveError: '',
      sites: [],
      allLocations: [],
      filters: {
        commonSiteSearch: '',
        commonAreaSearch: ''
      },
      showAddSite: false,
      newSiteName: '',
      showAddArea: false,
      newAreaName: '',
      addingLocation: false,
      pendingRow: null,
      locationError: ''
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
    },
    commonAvailableAreas() {
      if (!this.form.site?.id) return []
      if (Array.isArray(this.form.site.children) && this.form.site.children.length) {
        return this.form.site.children
      }
      return this.allLocations.filter(l => l.parentId === this.form.site.id)
    }
  },
  watch: {
    isOpen(val) {
      if (val) {
        this.locationError = ''
        this.$nextTick(() => {
          this.onModalOpen()
        })
      }
    }
  },
  methods: {
    async onModalOpen() {
      await this.refreshLocations()
      await this.$nextTick()
      this.syncFormLocationsFromModel()
    },
    syncFormLocationsFromModel() {
      const mv = this.modelValue || {}
      this.form.site = null
      this.form.area = null
      this.filters.commonSiteSearch = ''
      this.filters.commonAreaSearch = ''

      if (mv.site && typeof mv.site === 'object' && mv.site.id != null) {
        this.form.site = this.allLocations.find(l => l.id === mv.site.id) || mv.site
      } else if (mv.locationId != null && this.allLocations.length) {
        this.form.site = this.allLocations.find(l => l.id === Number(mv.locationId)) || null
      } else if (typeof mv.site === 'string' && mv.site.trim() && this.sites.length) {
        const found = this.sites.find(s => (s.name || '') === mv.site.trim())
        if (found) this.form.site = found
      }

      if (this.form.site) this.filters.commonSiteSearch = this.form.site.name || ''

      const areaId = mv.area?.id ?? mv.areaId
      if (this.form.site?.id && areaId != null) {
        let areas = []
        if (Array.isArray(this.form.site.children) && this.form.site.children.length) {
          areas = this.form.site.children
        } else {
          areas = this.allLocations.filter(l => l.parentId === this.form.site.id)
        }
        let found = areas.find(a => a.id === Number(areaId)) || this.allLocations.find(l => l.id === Number(areaId))
        if (found) {
          this.form.area = found
          this.filters.commonAreaSearch = found.name || ''
        }
      } else if (typeof mv.area === 'string' && mv.area.trim() && this.form.site) {
        let areas = []
        if (Array.isArray(this.form.site.children) && this.form.site.children.length) {
          areas = this.form.site.children
        } else {
          areas = this.allLocations.filter(l => l.parentId === this.form.site.id)
        }
        const found = areas.find(a => (a.name || '') === mv.area.trim())
        if (found) {
          this.form.area = found
          this.filters.commonAreaSearch = found.name || ''
        }
      }
    },
    async refreshLocations() {
      try {
        const res = await getLocations()
        this.allLocations = Array.isArray(res.data) ? res.data : []
        this.sites = this.allLocations.filter(l => !l.parentId)
      } catch (err) {
        console.warn('Failed to refresh locations', err)
      }
    },
    onCommonSiteChange() {
      if (this.form.site === '__new__') {
        this.showAddSite = true
        this.form.site = null
        this.form.area = null
        this.filters.commonSiteSearch = ''
        this.filters.commonAreaSearch = ''
        return
      }
      if (this.form.site && this.form.site.id) {
        this.form.area = null
        this.filters.commonAreaSearch = ''
      }
    },
    async addSite() {
      if (!this.newSiteName?.trim()) return
      this.addingLocation = true
      this.locationError = ''
      try {
        const res = await createLocation({ name: this.newSiteName.trim(), parentId: null })
        await this.refreshLocations()
        const created = res?.data
        if (created?.id) {
          const newSite = this.allLocations.find(l => l.id === created.id)
          if (newSite && this.currentStep === 1 && !this.pendingRow) {
            this.form.site = newSite
            this.filters.commonSiteSearch = newSite.name || ''
            this.form.area = null
            this.filters.commonAreaSearch = ''
          }
        }
        this.showAddSite = false
        this.newSiteName = ''
        this.pendingRow = null
      } catch (err) {
        this.locationError = err?.response?.data?.message || 'Failed to add site'
        console.error('addSite error:', err)
      } finally {
        this.addingLocation = false
      }
    },
    async addArea() {
      if (!this.newAreaName?.trim()) return
      const siteId = this.currentStep === 1 ? this.form.site?.id : this.pendingRow?.site?.id
      if (!siteId) return
      this.addingLocation = true
      this.locationError = ''
      try {
        const res = await createLocation({
          name: this.newAreaName.trim(),
          parentId: siteId
        })
        await this.refreshLocations()
        const created = res?.data
        if (created?.id) {
          const newArea = this.allLocations.find(l => l.id === created.id)
          if (newArea && this.currentStep === 1 && !this.pendingRow) {
            this.form.area = newArea
            this.filters.commonAreaSearch = newArea.name || ''
          }
        }
        this.showAddArea = false
        this.newAreaName = ''
        this.pendingRow = null
      } catch (err) {
        this.locationError = err?.response?.data?.message || 'Failed to add area'
        console.error('addArea error:', err)
      } finally {
        this.addingLocation = false
      }
    },
    closeModal() {
      this.$emit('close')
    },
    selectEquipment(item) {
      if (!item) { 
        this.form.equipmentId = ''
        this.form.equipmentLabel = ''
        this.form.contractorId = ''
        this.form.contractorLabel = ''
        this.form.isRental = false
        return 
      }
      this.form.equipmentId = item.id != null ? Number(item.id) : ''
      this.form.equipmentLabel = item.name ?? ''
      this.form.contractorId = item.contractorId != null ? Number(item.contractorId) : ''
      this.form.contractorLabel = item.contractorName ?? item.contractor?.name ?? ''
      this.form.isRental = Boolean(item.contractorId ?? item.contractor ?? false)
      if (item.hourlyRate != null && item.hourlyRate !== '') this.form.hourlyRate = Number(item.hourlyRate)
    },
    selectDriver(item) {
      if (!item) { this.form.driverId = ''; this.form.driverLabel = ''; return }
      this.form.driverId = item.id != null ? Number(item.id) : ''
      this.form.driverLabel = item.name ?? ''
    },
    isStep1Valid() {
      return (this.form.equipmentLabel || this.form.equipmentId) &&
        Number(this.form.hourlyRate) > 0 &&
        this.form.site &&
        this.form.site.id
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
      copy.search = copy.driverLabel || ''
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
      if (!item) {
        row.driver = null
        row.driverLabel = ''
        row.search = ''
        return
      }
      row.driver = item
      row.driverLabel = item.name || ''
      row.search = item.name || ''
      row.open = false
    },
    toggleDriverDropdown(row) {
      row.open = !row.open
      if (row.open) {
        row.highlightedIndex = -1
        row.search = row.driverLabel || ''
        this.$nextTick(() => this.scheduleDriverDropdownPosition(row))
      }
    },
    onDriverFieldFocus(row) {
      row.open = true
      this.$nextTick(() => this.scheduleDriverDropdownPosition(row))
    },
    onDriverDropdownParentScroll() {
      if ((this.rows || []).some(r => r.open)) this.$forceUpdate()
    },
    scheduleDriverDropdownPosition(row) {
      if (!row?.open) return
      requestAnimationFrame(() => {
        if (row.open) this.$forceUpdate()
      })
    },
    getDriverDropdownStyle(row) {
      if (!row.driverCell) return { display: 'none' }
      const el = row.driverCell
      const rect = el.getBoundingClientRect()
      if (!rect.width && !rect.height) return { display: 'none' }
      const gap = 4
      const maxH = 160
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
      const vh = typeof window !== 'undefined' ? window.innerHeight : 768
      let top = rect.bottom + gap
      let maxHeight = maxH
      const spaceBelow = vh - rect.bottom - gap - 8
      const spaceAbove = rect.top - 8
      if (spaceBelow < 120 && spaceAbove > spaceBelow) {
        top = Math.max(8, rect.top - gap - Math.min(maxH, spaceAbove))
        maxHeight = Math.min(maxH, Math.max(80, spaceAbove - gap))
      } else {
        maxHeight = Math.min(maxH, Math.max(80, spaceBelow))
      }
      let left = rect.left
      const width = Math.max(rect.width, 160)
      if (left + width > vw - 8) left = Math.max(8, vw - width - 8)
      if (left < 8) left = 8
      return {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`,
        overflowY: 'auto',
        zIndex: 1100
      }
    },
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
        this.$nextTick(() => this.scheduleDriverDropdownPosition(row))
        return
      }
      if (key === 'ArrowUp') {
        e.preventDefault()
        row.highlightedIndex = Math.max(0, (row.highlightedIndex || 0) - 1)
        row.open = true
        this.$nextTick(() => this.scheduleDriverDropdownPosition(row))
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
          contractorId: this.form.contractorId || null,
          hourlyRate: hourlyRateNum,
          hours: hoursSum || Number(this.form.hours || 0),
          total: Number(totalSum.toFixed(2)),
          locationId: this.form.site?.id ?? null,
          areaId: this.form.area?.id ?? null,
          site: this.form.site?.name || '',
          area: this.form.area?.name || '',
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

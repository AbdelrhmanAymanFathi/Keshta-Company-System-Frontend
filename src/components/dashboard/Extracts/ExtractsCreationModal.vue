<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'">
    <ShadcnButton variant="outline" size="native"
      v-if="showTriggerButton"
      @click="openModal"
      class="theme-button px-3 py-2 text-sm rounded-lg  font-medium shadow-md transition sm:px-6 sm:py-3"
    >
      {{ triggerText }}
    </ShadcnButton>

    <teleport to="body">
      <transition name="kc-modal">
        <div
          v-if="isOpen"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-[var(--layout-z-modal,200)] p-4 overflow-hidden"
          :dir="isRTL ? 'rtl' : 'ltr'"
          @click.self="closeModal"
        >
          <div class="kc-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h2 class="text-2xl font-bold theme-heading">
              {{ currentStep === 1 ? modalTitleComputed : ($t('labels.enterDetails') || 'Enter Details') }}
            </h2>
            <ShadcnButton variant="outline" size="native"
              @click="closeModal"
              class="theme-text-muted hover:theme-text-primary text-3xl leading-none focus:outline-none"
            >
              ×
            </ShadcnButton>
          </div>

          <div class="flex-1 overflow-y-auto p-6 modal-body-container relative">
            <div v-if="currentStep === 1" class="w-full">
              <h3 class="text-lg font-bold mb-8 text-center theme-text-primary">{{ $t('labels.step1BasicData') }}</h3>

              <div class="max-w-6xl mx-auto">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.dateFrom') || 'Date From' }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative">
                      <CalendarDaysIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                      <DateField
                        v-model="commonData.dateFrom"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.dateTo') || 'Date To' }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative">
                      <CalendarDaysIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                      <DateField
                        v-model="commonData.dateTo"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.site') }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative flex items-center gap-2">
                      <div class="flex-1 relative">
                        <SearchDropdown
                          v-model="filters.commonSiteSearch"
                          :items="sites"
                          :allItems="sites"
                          :placeholder="$t('labels.site')"
                          :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                          @select="selectSite"
                          clearable
                          :clearAriaLabel="$t('labels.clear')"
                          @clear="() => { commonData.site = null; filters.commonSiteSearch = '' }"
                        >
                          <template #prefix>
                            <MapPinIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                          </template>
                        </SearchDropdown>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">{{ $t('labels.area') }}</label>
                    <div class="relative flex items-center gap-2">
                      <div class="flex-1 relative">
                        <SearchDropdown
                          v-model="filters.commonAreaSearch"
                          :items="commonAvailableAreas"
                          :allItems="commonAvailableAreas"
                          :placeholder="$t('labels.area')"
                          :disabled="!commonData.site"
                          :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'"
                          @select="selectArea"
                          clearable
                          :clearAriaLabel="$t('labels.clear')"
                          @clear="() => { commonData.area = null; filters.commonAreaSearch = '' }"
                        >
                          <template #prefix>
                            <MapIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                          </template>
                        </SearchDropdown>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.contractor') }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative flex items-center gap-2">
                      <div class="flex-1 relative">
                        <SearchDropdown
                          v-model="filters.commonContractorSearch"
                          :items="contractors"
                          :allItems="contractors"
                          :placeholder="$t('labels.contractor')"
                          :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                          @select="selectContractor"
                          clearable
                          :clearAriaLabel="$t('labels.clear')"
                          @clear="() => { commonData.contractor = null; filters.commonContractorSearch = '' }"
                        >
                          <template #prefix>
                            <UserGroupIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                          </template>
                        </SearchDropdown>
                      </div>
                    </div>
                  </div>

                  <!-- <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.crusher') }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative flex items-center gap-2">
                      <div class="flex-1 relative">
                        <SearchDropdown
                          v-model="filters.commonCrusherSearch"
                          :items="crushers"
                          :allItems="crushers"
                          :placeholder="$t('labels.crusher')"
                          :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                          @select="selectCrusher"
                        >
                          <template #prefix>
                            <ThemeIcon name="settings" class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                          </template>
                        </SearchDropdown>
                      </div>
                    </div>
                  </div> -->

                  <div class="col-span-full">
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">{{ $t('labels.notes') }}</label>
                    <textarea
                      v-model="commonData.notes"
                      rows="3"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm theme-input-focus transition"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="mt-10 flex justify-end gap-6">
                <ShadcnButton variant="outline" size="native"
                  @click="closeModal"
                  class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition"
                >
                  {{ $t('labels.cancel') }}
                </ShadcnButton>
                <ShadcnButton variant="outline" size="native"
                  @click="goToStep2"
                  :disabled="!isStep1Valid()"
                  class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3"
                >
                  {{ $t('labels.next') }}
                  <ArrowRightIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                </ShadcnButton>
              </div>
            </div>

            <div v-else class="w-full">
              <div class="flex items-center justify-between mb-8">
                <ShadcnButton variant="outline" size="native"
                  @click="goBackToStep1"
                  class="flex items-center gap-3 theme-text hover:theme-accent-muted font-medium transition"
                >
                  <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                  {{ $t('labels.back') }}
                </ShadcnButton>
                <h3 class="text-lg font-bold theme-text-primary">{{ $t('labels.step2Data') }}</h3>
                <div></div>
              </div>

              <div class="theme-dashboard-bg-soft border theme-border rounded-lg p-5 mb-8">
                <h4 class="text-sm font-bold theme-accent-muted mb-4">{{ $t('labels.summary') }}</h4>
                <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.dateFrom') || 'Date From' }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.dateFrom || '-' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.dateTo') || 'Date To' }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.dateTo || '-' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.site') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.site?.name || '-' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.area') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.area?.name || '-' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.contractor') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.contractor?.name || '-' }}</dd>
                  </div>
                  <!-- <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.crusher') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.crusher?.name || '-' }}</dd>
                  </div> -->
                  <div class="flex flex-col col-span-full">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.notes') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.notes || '-' }}</dd>
                  </div>
                </dl>
              </div>

              <div class="mb-6">
                <ShadcnButton variant="outline" size="native"
                  @click="addRow"
                  class="bg-green-600 theme-text-light px-4 py-2 rounded-lg hover:bg-green-700 font-medium shadow-md transition"
                >
                  + {{ $t('labels.addRow') }}
                </ShadcnButton>
              </div>

              <div class="mb-8 relative border border-gray-200 rounded-lg overflow-visible p-2">
                <div class="overflow-x-auto overflow-y-visible w-full">
                  <table ref="tableRef" class="w-full divide-y divide-gray-200 border rounded-lg">
                    <thead class="theme-dashboard-bg-soft sticky top-0 z-10">
                      <tr>
                        <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary w-12">{{ $t('#') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.item') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.quantity') || 'Quantity' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.price') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.discount') || 'Discount' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.total') }}</th>
                        <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary">{{ $t('labels.actions') }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="(row, index) in rows" :key="row.id">
                        <td class="px-4 py-3 text-center text-sm theme-text-secondary">{{ index + 1 }}</td>
                        <td class="px-3 py-2">
                          <SearchDropdown
                            v-model="row.itemSearch"
                            :items="extractItems"
                            :allItems="extractItems"
                            itemLabel="name"
                            :placeholder="$t('labels.item')"
                            :inputClass="'w-full px-2 py-1 text-sm theme-input-focus'"
                            :dir="isRTL ? 'rtl' : 'ltr'"
                            teleportTarget="body"
                            clearable
                            :clearAriaLabel="$t('labels.clear')"
                            @select="(item) => selectRowItem(row, item)"
                            @clear="() => clearRowItem(row)"
                            @keydown.delete="(event) => clearRowItem(row, event)"
                          />
                        </td>
                        <td class="px-3 py-2">
                          <input
                            :ref="el => row.quantityInput = el"
                            v-model="row.quantity"
                            type="number"
                            step="1"
                            @input="syncRowTotal(row)"
                            @keydown.enter.prevent="handleEnterKey(index)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner"
                          />
                        </td>
                        
                        <td class="px-3 py-2">
                          <input
                            v-model.number="row.price"
                            type="number"
                            min="0"
                            step="0.01"
                            @input="syncRowTotal(row)"
                            @keydown.enter.prevent="handleEnterKey(index)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner"
                          />
                        </td>
                        <td class="px-3 py-2">
                          <input
                            v-model.number="row.discount"
                            type="number"
                            min="0"
                            step="0.01"
                            @input="syncRowTotal(row)"
                            @keydown.tab="onLastFieldTab(index, $event)"
                            @keydown.enter.prevent="handleEnterKey(index)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner"
                          />
                        </td>
                        <td class="px-3 py-2 text-sm font-semibold theme-text">
                          {{ formatCurrency(totalPerRow(row)) }}
                        </td>
                        <td class="px-4 py-3 text-center">
                          <div class="flex justify-center gap-3">
                            <ShadcnButton variant="outline" size="native" @click="duplicateRow(index)" class="theme-text hover:theme-accent-muted transition" title="Duplicate" tabindex="-1">
                              <DocumentDuplicateIcon class="w-5 h-5" />
                            </ShadcnButton>
                            <ShadcnButton variant="outline" size="native" @click="removeRow(index)" class="text-red-600 hover:text-red-800 transition" title="Delete" tabindex="-1">
                              <TrashIcon class="w-5 h-5" />
                            </ShadcnButton>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-sm font-semibold">
                <div class="flex items-center justify-end gap-3">
                  <span class="theme-text-secondary">{{ $t('labels.subtotal') }}:</span>
                  <span class="theme-text-primary min-w-32 text-end">{{ formatCurrency(subtotal) }}</span>
                </div>
              </div>

              <div class="mt-10 flex justify-end gap-6">
                <ShadcnButton variant="outline" size="native"
                  @click="goBackToStep1"
                  class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition flex items-center gap-3"
                >
                  <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                  {{ $t('labels.back') }}
                </ShadcnButton>
                <ShadcnButton variant="outline" size="native"
                  @click="saveData"
                  :disabled="isSaving"
                  class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3"
                >
                  {{ isSaving ? $t('labels.saving') : $t('labels.save') }}
                  <CheckIcon class="w-6 h-6" />
                </ShadcnButton>
              </div>

              <p v-if="saveError" class="mt-6 text-center text-red-600 font-medium text-lg">
                {{ saveError }}
              </p>
            </div>
          </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import {
  CalendarDaysIcon,
  MapPinIcon,
  MapIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@acme/icon-packs/legacy'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import normalizeItem from '@/utils/normalizeItem'
import { parseCreateExtract } from '@/validators/extracts'
import { createExtract, getExtract, updateExtract } from '@/services/extracts'
import {
  getContractors,
  getLocations,
  getCrushers,
  getExportItems
} from '@/api'

export default {
  name: 'ExtractsCreationModal',
  components: {
    SearchDropdown,
    DateField,
    CalendarDaysIcon,
    MapPinIcon,
    MapIcon,
    UserGroupIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    DocumentDuplicateIcon,
    TrashIcon
  },
  emits: ['saved'],
  props: {
    showTriggerButton: { type: Boolean, default: true },
    triggerButtonText: { type: String, default: '' },
    modalTitle: { type: String, default: '' },
    isEditing: { type: Boolean, default: false },
    extractId: { type: [Number, String], default: null }
  },
  data() {
    return {
      isOpen: false,
      currentStep: 1,
      isSaving: false,
      saveError: '',
      tableRef: null,
      commonData: this.getDefaultCommonData(),
      rows: [],
      items: [],
      contractors: [],
      locations: [],
      crushers: [],
      sites: [],
      allLocations: [],
      filters: {
        commonSiteSearch: '',
        commonAreaSearch: '',
        commonContractorSearch: '',
        commonCrusherSearch: ''
      }
    }
  },
  computed: {
    triggerText() {
      return this.triggerButtonText || (this.$t ? this.$t('dashboard.newExtract') + ' +' : 'New Extract +')
    },
    modalTitleComputed() {
      if (this.isEditing) {
        return this.$t ? this.$t('labels.edit') || 'Edit Extract' : 'Edit Extract'
      }
      return this.modalTitle || (this.$t ? this.$t('dashboard.newExtract') : 'New Extract')
    },
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    extractItems() {
      return this.items.filter(item => item && (item.availableForExtracts === true || item.availableForExports === true))
    },
    commonAvailableAreas() {
      if (!this.commonData.site) return []
      if (Array.isArray(this.commonData.site.children) && this.commonData.site.children.length) {
        return this.commonData.site.children
      }
      return this.allLocations.filter(location => location.parentId === this.commonData.site.id)
    },
    subtotal() {
      return this.rows.reduce((sum, row) => sum + this.totalPerRow(row), 0)
    }
  },
  watch: {
    '$i18n.locale'() {
      if (this.isOpen || this.items.length) this.loadExportItems()
    }
  },
  methods: {
    getDefaultCommonData() {
      return {
        dateFrom: '',
        dateTo: '',
        site: null,
        area: null,
        contractor: null,
        crusher: null,
        notes: '',
        idempotencyKey: ''
      }
    },
    getDefaultRow() {
      return {
        id: Date.now() + Math.random(),
        itemId: '',
        item: null,
        itemSearch: '',
        quantity: '',
        price: '',
        discount: 0,
        total: 0,
        quantityInput: null
      }
    },
    resetState() {
      this.currentStep = 1
      this.isSaving = false
      this.saveError = ''
      this.commonData = this.getDefaultCommonData()
      this.rows = []
      this.filters = {
        commonSiteSearch: '',
        commonAreaSearch: '',
        commonContractorSearch: '',
        commonCrusherSearch: ''
      }
    },
    async openModal() {
      this.resetState()
      this.isOpen = true
      await this.loadInitialData()
      if (this.isEditing && this.extractId) {
        try {
          const ext = await getExtract(this.extractId)
          if (ext) {
            this.commonData.dateFrom = ext.dateFrom ? ext.dateFrom.split('T')[0] : ''
            this.commonData.dateTo = ext.dateTo ? ext.dateTo.split('T')[0] : ''
            this.commonData.notes = ext.notes || ''
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
               return findInTree(this.allLocations, id)
             }

             this.commonData.site = findLoc(ext.locationId)
             this.filters.commonSiteSearch = this.commonData.site?.name || ''

             this.commonData.area = findLoc(ext.areaId)
             this.filters.commonAreaSearch = this.commonData.area?.name || ''

             this.commonData.contractor = this.contractors.find(c => c.id === ext.contractorId) || null
             this.filters.commonContractorSearch = this.commonData.contractor?.name || ''

            if (ext.lines && ext.lines.length) {
              this.rows = ext.lines.map(l => ({
                id: l.id || (Date.now() + Math.random()),
                itemId: l.itemId || '',
                itemSearch: l.item?.name || '',
                price: l.price != null ? Number(l.price) : '',
                quantity: l.quantity != null ? Number(l.quantity) : 1,
                discount: l.discount != null ? Number(l.discount) : 0,
                total: l.total != null ? Number(l.total) : 0
              }))
            } else {
              this.rows = [this.createEmptyRow()]
            }
            this.currentStep = 2
          }
        } catch (error) {
          console.error('Failed to load extract detail for editing:', error)
          this.saveError = error?.message || 'Failed to load extract'
        }
      } else {
        this.loadCommonDataFromStorage()
      }
    },
    closeModal() {
      if (!this.isEditing) {
        this.saveCommonDataToStorage()
      }
      this.isOpen = false
      this.resetState()
      this.$emit('close')
    },
    async loadInitialData() {
      try {
        await Promise.all([
          this.refreshLocations(),
          this.loadLookups(),
          this.loadExportItems()
        ])
      } catch (error) {
        console.error('Failed to load initial data:', error)
      }
    },
    async refreshLocations() {
      try {
        const res = await getLocations()
        this.allLocations = Array.isArray(res.data) ? res.data : []
        this.sites = this.allLocations.filter(location => !location.parentId)
      } catch (error) {
        console.warn('Failed to refresh locations', error)
      }
    },
    async loadLookups() {
      try {
        const [contractorsRes, crushersRes] = await Promise.all([
          getContractors({ pageSize: 1000, mode: 'extracts' }),
          getCrushers()
        ])

        const extractArray = (res) => {
          if (res?.data?.items) return Array.isArray(res.data.items) ? res.data.items : []
          if (Array.isArray(res?.data)) return res.data
          if (res?.data && typeof res.data === 'object') {
            const firstValue = Object.values(res.data)[0]
            return Array.isArray(firstValue) ? firstValue : []
          }
          return []
        }

        this.contractors = extractArray(contractorsRes)
        this.crushers = extractArray(crushersRes)
      } catch (error) {
        console.error('loadLookups failed:', error)
      }
    },
    async loadExportItems() {
      try {
        const res = await getExportItems({ mode: 'extracts' })
        const raw = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || [])
        this.items = raw.map(normalizeItem)
      } catch (error) {
        console.warn('Failed to load export items', error)
      }
    },
    selectRowItem(row, item) {
      if (!row || !item) return

      row.item = item
      row.itemId = item.id
      row.itemSearch = item.name

      const maybePrice =
        item.currentPrice ??
        item.defaultExtractPrice ??
        item.defaultExportPrice ??
        item.price ??
        item.current_price

      const parsedPrice = Number(maybePrice)

      if (!Number.isNaN(parsedPrice)) {
        row.price = parsedPrice
      }

      this.syncRowTotal(row)

      this.$nextTick(() => {
        row.quantityInput?.focus?.()
      })
    },
    clearRowItem(row, event) {
      if (!row.itemSearch && !row.item) return
      event?.preventDefault()
      row.item = null
      row.itemId = ''
      row.itemSearch = ''
    },
    selectSite(site) {
      this.commonData.site = site
      this.filters.commonSiteSearch = site?.name || ''
      this.commonData.area = null
      this.filters.commonAreaSearch = ''
    },
    selectArea(area) {
      this.commonData.area = area
      this.filters.commonAreaSearch = area?.name || ''
    },
    selectContractor(contractor) {
      this.commonData.contractor = contractor
      this.filters.commonContractorSearch = contractor?.name || ''
    },
    selectCrusher(crusher) {
      this.commonData.crusher = crusher
      this.filters.commonCrusherSearch = crusher?.name || ''
    },
    isStep1Valid() {
      return Boolean(
        this.commonData.dateFrom &&
        this.commonData.dateTo &&
        this.commonData.dateTo >= this.commonData.dateFrom &&
        this.commonData.site &&
        this.commonData.contractor
      )
    },
    goToStep2() {
      if (!this.isStep1Valid()) return
      this.currentStep = 2
      if (!this.rows.length) {
        this.rows = [this.getDefaultRow()]
      }
    },
    goBackToStep1() {
      this.currentStep = 1
    },
    syncRowTotal(row) {
      // const price = Number(row.price || 0)
      // const quantity = Math.max(1, Number(row.quantity || 0))
      // row.quantity = quantity
      row.total = this.totalPerRow(row)
    },
    totalPerRow(row) {
      const quantity = row.quantity === '' || row.quantity === null || row.quantity === undefined
        ? 0
        : Number(row.quantity)

      const price = row.price === '' || row.price === null || row.price === undefined
        ? 0
        : Number(row.price)

      const discount = row.discount === '' || row.discount === null || row.discount === undefined
        ? 0
        : Number(row.discount)

      return Math.max(0, (quantity * price) - Math.max(0, discount))
    },
    addRow() {
      this.rows.push(this.getDefaultRow())
    },
    duplicateRow(index) {
      const source = this.rows[index]
      if (!source) return
      const copy = {
        ...JSON.parse(JSON.stringify(source)),
        id: Date.now() + Math.random(),
        quantityInput: null
      }
      this.rows.splice(index + 1, 0, copy)
    },
    removeRow(index) {
      this.rows.splice(index, 1)
      if (!this.rows.length) this.addRow()
    },
    handleEnterKey() {
      const newRowIndex = this.rows.length
      this.addRow()
      this.$nextTick(() => {
        if (!this.tableRef) return
        const allRows = this.tableRef.querySelectorAll('tbody tr')
        const newRow = allRows[newRowIndex]
        const firstInput = newRow?.querySelector('input[type="number"]')
        firstInput?.focus()
      })
    },
    onLastFieldTab(index, event) {
      if (event.shiftKey) return
      if (event.key === 'Tab' && index === this.rows.length - 1) {
        event.preventDefault()
        const newRowIndex = this.rows.length
        this.addRow()
        this.$nextTick(() => {
          if (!this.tableRef) return
          const allRows = this.tableRef.querySelectorAll('tbody tr')
          const newRow = allRows[newRowIndex]
          const firstInput = newRow?.querySelector('input[type="number"]')
          firstInput?.focus()
        })
      }
    },
    formatCurrency(value) {
      if (value === undefined || value === null || value === '') return '-'
      const number = Number(value)
      if (Number.isNaN(number)) return value
      const rtl = this.$i18n?.locale === 'ar'
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
      return rtl && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    },
    toNumericId(value) {
      if (value === '' || value === null || value === undefined) return undefined
      const numericValue = Number(value)
      return Number.isFinite(numericValue) ? numericValue : undefined
    },
    genIdempotencyKey() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
      return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    },
    async saveData() {
      this.saveError = ''
      this.isSaving = true

      try {

        
        // const lines = this.rows
        //   .map(row => {
        //     const quantity = Number(row.quantity)
        //     const rawPrice = row.price === '' || row.price === null || row.price === undefined ? null : Number(row.price)
        //     const price = rawPrice !== null && !Number.isNaN(rawPrice) ? rawPrice : undefined

        //     if (!row.quantity || Number.isNaN(quantity) || quantity <= 0) {
        //       throw new Error('Quantity is required')
        //     }

        //     const line = {
        //       itemId: this.toNumericId(row.itemId),
        //       quantity
        //     }
        //     if (price !== undefined) {
        //       line.price = price
        //       line.total = Number((price * quantity).toFixed(2))
        //     }
        //     return line
        //   })
        //   .filter(line => line.itemId && line.quantity > 0)

        // if (!lines.length) {
        //   this.saveError = this.$t('labels.noData') || 'No data'
        //   this.isSaving = false
        //   return
        // }

        const payload = {
          dateFrom: this.commonData.dateFrom,
          dateTo: this.commonData.dateTo,
          contractorId: this.toNumericId(this.commonData.contractor?.id),
          locationId: this.toNumericId(this.commonData.site?.id),
          areaId: this.toNumericId(this.commonData.area?.id),
          notes: this.commonData.notes || '',
          total: Number(this.subtotal.toFixed(2)),
          lines: this.rows.map(row => ({
            itemId: Number(row.itemId),
            quantity: Number(row.quantity),
            price: Number(row.price),
            discount: Math.max(0, Number(row.discount || 0)),
            total: Number(Math.max(0, Number(row.price) * Number(row.quantity)).toFixed(2))
          })),
          idempotencyKey: this.commonData.idempotencyKey || this.genIdempotencyKey()
        }

        parseCreateExtract(payload)

        let res
        if (this.isEditing && this.extractId) {
          res = await updateExtract(this.extractId, payload)
          const isRTL = this.$i18n?.locale === 'ar'
          this.$toast?.success(isRTL ? 'تم حفظ التعديل وإرساله للمراجعة بنجاح' : 'Edit request submitted for approval successfully')
        } else {
          res = await createExtract(payload)
        }

        this.$emit('saved', res)
        this.closeModal()
      } catch (error) {
        console.error('Failed to create extract', error)
        this.saveError = error?.response?.data?.message || error?.message || 'Save failed'
      } finally {
        this.isSaving = false
      }
    },
    saveCommonDataToStorage() {
      try {
        const data = {
          dateFrom: this.commonData.dateFrom,
          dateTo: this.commonData.dateTo,
          site: this.commonData.site ? { id: this.commonData.site.id, name: this.commonData.site.name } : null,
          area: this.commonData.area ? { id: this.commonData.area.id, name: this.commonData.area.name } : null,
          contractor: this.commonData.contractor ? { id: this.commonData.contractor.id, name: this.commonData.contractor.name } : null,
          crusher: this.commonData.crusher ? { id: this.commonData.crusher.id, name: this.commonData.crusher.name } : null,
          notes: this.commonData.notes
        }
        localStorage.setItem('extractsCreationModalCommonData', JSON.stringify(data))
      } catch (err) {
        console.warn('Failed to save extracts data:', err)
      }
    },
    loadCommonDataFromStorage() {
      try {
        const saved = localStorage.getItem('extractsCreationModalCommonData')
        if (saved) {
          const data = JSON.parse(saved)
          this.commonData.dateFrom = data.dateFrom || ''
          this.commonData.dateTo = data.dateTo || ''
          this.commonData.notes = data.notes || ''
          
          // Restore site
          if (data.site?.id) {
            this.commonData.site = this.allLocations.find(l => l.id === data.site.id) || null
            if (this.commonData.site) this.filters.commonSiteSearch = this.commonData.site.name
          }
          
          // Restore area
          if (data.area?.id && this.commonData.site) {
            let found = null
            if (Array.isArray(this.commonData.site.children) && this.commonData.site.children.length) {
              found = this.commonData.site.children.find(c => c.id === data.area.id) || null
            }
            if (!found) found = this.allLocations.find(l => l.id === data.area.id) || null
            this.commonData.area = found
            if (this.commonData.area) this.filters.commonAreaSearch = this.commonData.area.name
          }
          
          // Restore contractor
          if (data.contractor?.id) {
            this.commonData.contractor = this.contractors.find(c => c.id === data.contractor.id) || null
            if (this.commonData.contractor) this.filters.commonContractorSearch = this.commonData.contractor.name
          }
          
          // Restore crusher
          if (data.crusher?.id) {
            this.commonData.crusher = this.crushers.find(c => c.id === data.crusher.id) || null
            if (this.commonData.crusher) this.filters.commonCrusherSearch = this.commonData.crusher.name
          }
        }
      } catch (err) {
        console.warn('Failed to load extracts data:', err)
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
  appearance: textfield;
  -moz-appearance: textfield;
}

.modal-body-container {
  max-height: 70vh;
}

</style>

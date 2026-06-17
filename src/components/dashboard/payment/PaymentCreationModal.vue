<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'">
    <teleport to="body">
      <transition name="kc-modal">
        <div
          v-if="isVisible"
          class="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-black/60 p-4"
          :dir="isRTL ? 'rtl' : 'ltr'"
          @click.self="closeModal"
        >
          <div class="kc-modal-panel flex max-h-[95vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div class="flex items-center justify-between border-b theme-dashboard-bg-soft px-6 py-4">
              <h2 class="text-2xl font-bold theme-heading theme-text-primary">
                {{ currentStep === 1 ? modalTitleComputed : enterPaymentTitle }}
              </h2>
              <button
                type="button"
                class="theme-caption hover:theme-text-secondary focus:outline-none"
                aria-label="Close"
                @click="closeModal"
              >
                &times;
              </button>
            </div>

            <div class="modal-body-container relative flex-1 overflow-y-auto p-6">
              <div v-if="currentStep === 1" class="w-full">
                <h3 class="mb-8 text-center text-lg font-bold text-gray-800">
                  {{ step1Title }}
                </h3>

                <div class="mx-auto max-w-6xl">
                  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <label class="mb-1.5 block text-sm font-medium text-gray-700">
                        {{ siteLabel }}
                      </label>
                      <SearchDropdown
                        v-model="filters.siteSearch"
                        :items="sites"
                        itemLabel="name"
                        :placeholder="searchLocationPlaceholder"
                        :inputClass="fieldClass"
                        :dir="isRTL ? 'rtl' : 'ltr'"
                        @select="handleSiteSelect"
                      />
                    </div>

                    <div>
                      <label class="mb-1.5 block text-sm font-medium text-gray-700">
                        {{ dateLabel }}
                      </label>
                      <DateField
                        v-model="selectedDate"
                        :class="[fieldClass, isRTL ? 'text-right' : 'text-left']"
                        :dir="isRTL ? 'rtl' : 'ltr'"
                      />
                    </div>

                    <div>
                      <label class="mb-1.5 block text-sm font-medium text-gray-700">
                        {{ moduleLabel }}
                      </label>
                      <select
                        v-model="selectedModule"
                        :class="[fieldClass, isRTL ? 'text-right' : 'text-left']"
                        :dir="isRTL ? 'rtl' : 'ltr'"
                      >
                        <option value="">{{ modulePlaceholder }}</option>
                        <option v-for="option in moduleOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="mt-10 flex justify-end">
                  <button
                    type="button"
                    class="theme-button inline-flex items-center gap-2 px-6 py-3"
                    :disabled="!isStep1Valid"
                    @click="goToStep2"
                  >
                    <span>{{ nextLabel }}</span>
                    <component :is="isRTL ? ArrowLeftIcon : ArrowRightIcon" class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div v-else class="w-full">
                <h3 class="mb-8 text-center text-lg font-bold theme-text-primary">
                  {{ step2Title }}
                </h3>

                <div class="overflow-x-auto rounded-xl border border-gray-200">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="sticky top-0 z-10 bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">#</th>
                        <th class="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">{{ contractorLabel }}</th>
                        <th class="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">{{ amountLabel }}</th>
                        <th class="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">{{ paymentMethodLabel }}</th>
                        <th class="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">{{ treasuryLabel }}</th>
                        <th class="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">{{ notesLabel }}</th>
                        <th class="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">{{ actionsLabel }}</th>
                      </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="(row, index) in rows" :key="row.id">
                        <td class="px-4 py-3 text-center text-sm text-gray-600">{{ index + 1 }}</td>

                        <td class="px-3 py-2">
                          <div class="flex items-center gap-2">
                            <SearchDropdown
                              v-model="row._contractorSearch"
                              :items="row.contractors"
                              itemLabel="name"
                              :placeholder="row.module ? searchContractorPlaceholder : selectModuleFirstPlaceholder"
                              :inputClass="fieldClass"
                              :dir="isRTL ? 'rtl' : 'ltr'"
                              :disabled="!row.module || !row.contractors.length"
                            teleportTarget="body"
                              @select="(contractor) => selectContractor(row, contractor)"
                            />
                          </div>
                        </td>

                        <td class="px-3 py-2">
                          <input
                            v-model.number="row.amount"
                            type="number"
                            min="0"
                            step="0.01"
                            :class="[fieldClass, isRTL ? 'text-right' : 'text-left']"
                            :dir="isRTL ? 'rtl' : 'ltr'"
                            @keydown.enter.prevent="handleEnterKey(index)"
                          />
                        </td>

                        <td class="px-3 py-2">
                          <select
                            v-model="row.paymentMethod"
                            :class="[fieldClass, isRTL ? 'text-right' : 'text-left']"
                            :dir="isRTL ? 'rtl' : 'ltr'"
                            @keydown.enter.prevent="handleEnterKey(index)"
                          >
                            <option v-for="option in paymentMethodOptions" :key="option.value" :value="option.value">
                              {{ option.label }}
                            </option>
                          </select>
                        </td>

                        <td class="px-3 py-2">
                          <SearchDropdown
                            v-model="row._treasurySearch"
                            :items="treasuryOptions"
                            itemLabel="name"
                            :placeholder="treasuryPlaceholder"
                            :inputClass="fieldClass"
                            :dir="isRTL ? 'rtl' : 'ltr'"
                            :disabled="!treasuryOptions.length"
                            teleportTarget="body"
                            @select="(treasury) => selectTreasury(row, treasury)"
                          />
                        </td>

                        <td class="px-3 py-2">
                          <input
                            v-model="row.notes"
                            type="text"
                            :class="[fieldClass, isRTL ? 'text-right' : 'text-left']"
                            :dir="isRTL ? 'rtl' : 'ltr'"
                            @keydown.enter.prevent="handleEnterKey(index)"
                            @keydown.tab="onLastFieldTab(index, $event)"
                          />
                        </td>

                        <td class="px-4 py-3 text-center">
                          <div class="flex justify-center gap-3">
                            <button
                              type="button"
                              class="theme-caption hover:theme-text-primary"
                              title="Duplicate"
                              tabindex="-1"
                              @click="duplicateRow(index)"
                            >
                              <DocumentDuplicateIcon class="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              class="theme-caption text-red-600 transition hover:text-red-800"
                              title="Delete"
                              tabindex="-1"
                              @click="removeRow(index)"
                            >
                              <TrashIcon class="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p v-if="submitError" class="mt-4 text-center text-sm font-medium text-red-600">
                  {{ submitError }}
                </p>

                <div class="mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium theme-text-secondary hover:theme-hover-soft"
                    @click="prevStep"
                  >
                    <component :is="isRTL ? ArrowRightIcon : ArrowLeftIcon" class="h-5 w-5" />
                    <span>{{ backLabel }}</span>
                  </button>

                  <div class="flex flex-col gap-3 sm:items-end">
                    <div class="text-sm font-medium theme-text-secondary">
                      {{ totalLabel }}: <span class="font-semibold theme-text-primary">{{ totalAmountDisplay }}</span>
                    </div>
                    <button
                      type="button"
                      class="theme-button inline-flex items-center justify-center gap-2 px-10 py-3"
                      :disabled="isSubmitDisabled || isSaving"
                      @click="savePayment"
                    >
                      <span>{{ isSaving ? savingLabel : saveLabel }}</span>
                      <CheckIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import DateField from '@/components/shared/DateField.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { createPayment, getContractors, getLocations, getTreasuries } from '@/api'
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const idsEqual = (left, right) => String(left ?? '') === String(right ?? '')

export default {
  name: 'PaymentCreationModal',
  components: {
    DateField,
    SearchDropdown,
    ArrowRightIcon,
    ArrowLeftIcon,
    CheckIcon,
    DocumentDuplicateIcon,
    TrashIcon
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'saved'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const internalVisible = ref(props.visible)
    const currentStep = ref(1)
    const locations = ref([])
    const treasuries = ref([])
    const selectedSite = ref(null)
    const selectedDate = ref('')
    const selectedModule = ref('')
    const submitError = ref('')
    const isSaving = ref(false)
    const skipPersistOnClose = ref(false)

    const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

    const createRow = (overrides = {}) => ({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      date: '',
      module: '',
      contractor: null,
      _contractorSearch: '',
      amount: '',
      paymentMethod: 'cash',
      treasury: null,
      treasuryId: null,
      _treasurySearch: '',
      notes: '',
      contractors: [],
      ...overrides
    })

    const rows = ref([createRow()])

    const filters = ref({
      siteSearch: ''
    })

    const labelFor = (key, fallback) => {
      const value = t(key)
      return value === key ? fallback : value
    }

    const isRTL = computed(() => {
      if (typeof document === 'undefined') return false
      return document.documentElement?.dir === 'rtl' || document.body?.dir === 'rtl'
    })

    const sites = computed(() => locations.value.filter(location => !location.parentId && !location.parent))

    const moduleOptions = computed(() => ([
      { value: 'supply', label: labelFor('supply.title', 'Supply') },
      { value: 'transport', label: labelFor('transport.transport', 'Transport') },
      { value: 'rentals', label: labelFor('rentals.rentalList', 'Equipment Logs') },
      { value: 'extract', label: labelFor('extracts.title', 'Extracts') }
    ]))

    const paymentMethodOptions = computed(() => ([
      { value: 'cash', label: labelFor('payments.cash', 'Cash') },
      { value: 'bank', label: labelFor('payments.bank', 'Bank') }
    ]))

    const treasuryOptions = computed(() => treasuries.value)

    const isStep1Valid = computed(() => Boolean(selectedSite.value && selectedDate.value && selectedModule.value))

    const rowsToSave = computed(() => rows.value.filter(row => !isRowEmpty(row)))

    const isSubmitDisabled = computed(() => {
      if (!rowsToSave.value.length) return true
      return rowsToSave.value.some(row => !row.date || !row.module || !row.amount || !row.contractor || !row.paymentMethod || !row.treasuryId)
    })

    const totalAmount = computed(() => rowsToSave.value.reduce((sum, row) => sum + (Number(row.amount) || 0), 0))

    const totalAmountDisplay = computed(() => totalAmount.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

    const enterPaymentTitle = computed(() => labelFor('payments.enterPayment', 'Enter payment'))
    const step1Title = computed(() => labelFor('labels.step1BasicData', 'Step 1: Basic data'))
    const step2Title = computed(() => labelFor('payments.enterPayment', 'Enter payment'))
    const nextLabel = computed(() => labelFor('labels.next', 'Next'))
    const backLabel = computed(() => labelFor('labels.back', 'Back'))
    const saveLabel = computed(() => labelFor('labels.save', 'Save'))
    const savingLabel = computed(() => labelFor('labels.saving', 'Saving'))
    const totalLabel = computed(() => labelFor('labels.total', 'Total'))

    const siteLabel = computed(() => labelFor('labels.site', 'Site'))
    const dateLabel = computed(() => labelFor('labels.date', 'Date'))
    const moduleLabel = computed(() => labelFor('labels.module', 'Module'))
    const contractorLabel = computed(() => labelFor('labels.contractor', 'Contractor'))
    const amountLabel = computed(() => labelFor('labels.amount', 'Amount'))
    const paymentMethodLabel = computed(() => labelFor('labels.paymentMethod', 'Payment Method'))
    const treasuryLabel = computed(() => labelFor('dashboard.treasury', 'Treasury'))
    const notesLabel = computed(() => labelFor('labels.notes', 'Notes'))
    const actionsLabel = computed(() => labelFor('labels.actions', 'Actions'))

    const searchLocationPlaceholder = computed(() => labelFor('placeholders.searchLocation', 'Search location'))
    const searchContractorPlaceholder = computed(() => labelFor('placeholders.searchContractor', 'Search contractor'))
    const selectModuleFirstPlaceholder = computed(() => labelFor('payments.selectModuleFirst', 'Select module first'))
    const treasuryPlaceholder = computed(() => labelFor('placeholders.searchTreasury', 'Search treasury'))
    const modulePlaceholder = computed(() => labelFor('labels.module', 'Module'))

    async function loadLocations() {
      try {
        const res = await getLocations()
        locations.value = normalizeList(res?.data)
      } catch (error) {
        console.error('Failed to load locations', error)
        locations.value = []
      }
    }

    async function loadTreasuries() {
      try {
        const res = await getTreasuries()
        treasuries.value = normalizeList(res?.data)
      } catch (error) {
        console.error('Failed to load treasuries', error)
        treasuries.value = []
      }
    }

    async function loadContractorsForRow(row) {
      if (!row.module) {
        row.contractors = []
        row.contractor = null
        row._contractorSearch = ''
        return
      }

      try {
        const res = await getContractors({
          pageSize: 1000,
          mode: row.module
        })
        row.contractors = normalizeList(res?.data)

        if (row.contractor?.id) {
          const match = row.contractors.find(contractor => idsEqual(contractor.id, row.contractor.id))
          row.contractor = match || row.contractor
          row._contractorSearch = row.contractor?.name || row._contractorSearch || ''
        }
      } catch (error) {
        console.error('Failed to load contractors', error)
        row.contractors = []
      }
    }

    const handleSiteSelect = (site) => {
      selectedSite.value = site
      filters.value.siteSearch = site?.name || ''
    }

    const handleRowModuleChange = async (row) => {
      row.contractor = null
      row._contractorSearch = ''
      row.contractors = []
      await loadContractorsForRow(row)
    }

    const selectContractor = (row, contractor) => {
      row.contractor = contractor
      row._contractorSearch = contractor?.name || ''
    }

    const selectTreasury = (row, treasury) => {
      row.treasury = treasury
      row.treasuryId = treasury?.id ?? null
      row._treasurySearch = treasury?.name || ''
    }

    const duplicateRow = (index) => {
      const source = rows.value[index]
      if (!source) return
      rows.value.splice(index + 1, 0, createRow({
        date: source.date,
        module: source.module,
        contractor: source.contractor,
        _contractorSearch: source._contractorSearch,
        amount: source.amount,
        paymentMethod: source.paymentMethod,
        treasury: source.treasury,
        treasuryId: source.treasuryId,
        _treasurySearch: source._treasurySearch,
        notes: source.notes,
        contractors: [...(source.contractors || [])]
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
      selectedDate.value = ''
      selectedModule.value = ''
      submitError.value = ''
      rows.value = [createRow()]
      filters.value.siteSearch = ''
    }

    function saveToStorage() {
      try {
        if (typeof window === 'undefined') return
        const payload = {
          selectedSite: selectedSite.value,
          selectedDate: selectedDate.value,
          selectedModule: selectedModule.value,
          rows: rows.value.map(row => ({
            id: row.id,
            date: row.date,
            module: row.module,
            contractor: row.contractor,
            amount: row.amount,
            paymentMethod: row.paymentMethod,
            treasury: row.treasury,
            treasuryId: row.treasuryId,
            notes: row.notes
          }))
        }
        window.localStorage.setItem('paymentCreationModalCommonData', JSON.stringify(payload))
      } catch (error) {
        console.warn('save storage failed', error)
      }
    }

    function loadFromStorage() {
      try {
        if (typeof window === 'undefined') return
        const raw = window.localStorage.getItem('paymentCreationModalCommonData')
        if (!raw) return
        const payload = JSON.parse(raw)

        if (payload.selectedSite?.id) {
          selectedSite.value = locations.value.find(location => idsEqual(location.id, payload.selectedSite.id)) || payload.selectedSite
          filters.value.siteSearch = selectedSite.value?.name || ''
        }

        if (payload.selectedDate) {
          selectedDate.value = payload.selectedDate
        }

        if (payload.selectedModule) {
          selectedModule.value = payload.selectedModule
        }

        if (Array.isArray(payload.rows) && payload.rows.length) {
          rows.value = payload.rows.map(row => {
            const treasury = row.treasuryId
              ? treasuryOptions.value.find(item => idsEqual(item.id, row.treasuryId))
              : null

            return createRow({
              id: row.id,
              date: row.date,
              module: row.module,
              contractor: row.contractor,
              _contractorSearch: row.contractor?.name || '',
              amount: row.amount,
              paymentMethod: row.paymentMethod || 'cash',
              treasury: treasury || null,
              treasuryId: treasury?.id ?? row.treasuryId ?? null,
              _treasurySearch: treasury?.name || '',
              notes: row.notes
            })
          })
        }
      } catch (error) {
        console.warn('load storage failed', error)
      }
    }

    function isRowEmpty(row) {
      return !row.contractor &&
        !row.amount &&
        !row.paymentMethod &&
        !row.treasury &&
        !row.treasuryId &&
        !row.notes
    }

    function handleEnterKey(index) {
      if (index === rows.value.length - 1) {
        rows.value.push(createRow())
      }
    }

    function onLastFieldTab(index, event) {
      if (event.shiftKey) return
      if (event.key === 'Tab' && index === rows.value.length - 1) {
        event.preventDefault()
        rows.value.push(createRow())
      }
    }

    const goToStep2 = async () => {
      if (!isStep1Valid.value) return
      currentStep.value = 2
      if (!rows.value.length) rows.value.push(createRow())
      rows.value.forEach(row => {
        row.module = selectedModule.value
        row.date = selectedDate.value
        row.contractor = null
        row._contractorSearch = ''
        row.contractors = []
      })
      await Promise.all(rows.value.map(row => loadContractorsForRow(row)))
      saveToStorage()
    }

    const prevStep = () => {
      currentStep.value = 1
    }

    const closeModal = () => {
      internalVisible.value = false
    }

    const initializeModal = async () => {
      await Promise.all([loadLocations(), loadTreasuries()])
      loadFromStorage()
      await Promise.all(rows.value.map(row => loadContractorsForRow(row)))
    }

    const savePayment = async () => {
      submitError.value = ''
      const filtered = rows.value.filter(row => !isRowEmpty(row))

      if (!filtered.length) {
        submitError.value = labelFor('common.selectAtLeastOneRow', 'Add at least one payment row')
        return
      }

      if (filtered.some(row => !row.date || !row.module || !row.amount || !row.contractor || !row.paymentMethod || !row.treasuryId)) {
        submitError.value = labelFor('common.fillRequiredFields', 'Fill all required fields')
        return
      }

      isSaving.value = true
      try {
        const payload = {
          siteId: selectedSite.value?.id,
          rows: filtered.map(row => ({
            date: row.date,
            module: row.module,
            amount: Number(row.amount) || 0,
            contractorId: row.contractor?.id,
            paymentMethod: row.paymentMethod,
            treasury: row.treasury?.name || row.treasury || '',
            treasuryId: row.treasuryId || row.treasury?.id || null,
            notes: row.notes
          }))
        }

        const res = await createPayment(payload)
        skipPersistOnClose.value = true
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('paymentCreationModalCommonData')
          }
        } catch (error) {
          console.warn('remove storage failed', error)
        }
        emit('saved', res?.data || payload)
        closeModal()
      } catch (error) {
        console.error('Failed to create payments', error)
        submitError.value = error?.response?.data?.message || labelFor('common.saveError', 'Failed to save payments')
      } finally {
        isSaving.value = false
      }
    }

    watch(() => props.visible, async (value) => {
      internalVisible.value = value
      if (value) {
        currentStep.value = 1
        await initializeModal()
      }
    }, { immediate: true })

    watch(internalVisible, (value) => {
      emit('update:visible', value)
      if (!value) {
        if (skipPersistOnClose.value) {
          skipPersistOnClose.value = false
        } else {
          saveToStorage()
        }
        resetForm()
      }
    })

    watch([selectedSite, selectedDate, selectedModule, rows], () => saveToStorage(), { deep: true })

    onMounted(async () => {
      if (internalVisible.value) {
        await initializeModal()
      } else {
        await Promise.all([loadLocations(), loadTreasuries()])
      }
    })

    return {
      isVisible: internalVisible,
      isRTL,
      currentStep,
      filters,
      sites,
      rows,
      selectedSite,
      moduleOptions,
      paymentMethodOptions,
      treasuryOptions,
      fieldClass,
      isSubmitDisabled,
      totalAmountDisplay,
      handleSiteSelect,
      handleRowModuleChange,
      selectContractor,
      selectTreasury,
      duplicateRow,
      removeRow,
      goToStep2,
      prevStep,
      savePayment,
      closeModal,
      submitError,
      selectedDate,
      selectedModule,
      handleEnterKey,
      onLastFieldTab,
      ArrowRightIcon,
      ArrowLeftIcon,
      CheckIcon,
      DocumentDuplicateIcon,
      TrashIcon,
      modalTitleComputed: computed(() => labelFor('dashboard.pay', 'Pay')),
      enterPaymentTitle,
      step1Title,
      step2Title,
      nextLabel,
      backLabel,
      saveLabel,
      savingLabel,
      totalLabel,
      siteLabel,
      dateLabel,
      moduleLabel,
      contractorLabel,
      amountLabel,
      paymentMethodLabel,
      treasuryLabel,
      notesLabel,
      actionsLabel,
      searchLocationPlaceholder,
      searchContractorPlaceholder,
      selectModuleFirstPlaceholder,
      treasuryPlaceholder,
      modulePlaceholder,
      isStep1Valid
    }
  }
}
</script>

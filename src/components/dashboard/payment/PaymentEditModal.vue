<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'">
    <teleport to="body">
      <transition name="kc-modal">
        <div
          v-if="isVisible"
          class="fixed inset-0 z-[var(--layout-z-modal,200)] flex items-center justify-center overflow-hidden bg-black/60 p-4"
          :dir="isRTL ? 'rtl' : 'ltr'"
          @click.self="closeModal"
        >
          <div v-modal-focus="{ onEscape: closeModal }" class="kc-modal-panel flex max-h-[95vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div class="flex items-center justify-between border-b theme-dashboard-bg-soft px-6 py-4">
              <h2 class="text-2xl font-bold theme-heading theme-text-primary">
                {{ editTitle }}
              </h2>
              <ShadcnButton variant="outline" size="native"
                type="button"
                class="theme-caption hover:theme-text-secondary focus:outline-none"
                aria-label="Close"
                @click="closeModal"
              >
                &times;
              </ShadcnButton>
            </div>

            <div class="modal-body-container relative flex-1 overflow-y-auto p-6">
              <div class="mx-auto max-w-6xl">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
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
                      teleportTarget="body"
                      clearable
                      :clearAriaLabel="clearLabel"
                      @select="handleSiteSelect"
                      @clear="clearSite"
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
                      @change="handleModuleChange"
                    >
                      <option value="">{{ modulePlaceholder }}</option>
                      <option v-for="option in moduleOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">
                      {{ treasuryLabel }}
                    </label>
                    <SearchDropdown
                      v-model="selectedTreasurySearch"
                      :items="treasuryOptions"
                      itemLabel="name"
                      :placeholder="treasuryPlaceholder"
                      :inputClass="fieldClass"
                      :dir="isRTL ? 'rtl' : 'ltr'"
                      teleportTarget="body"
                      clearable
                      :clearAriaLabel="clearLabel"
                      :disabled="!treasuryOptions.length"
                      @select="handleTreasurySelect"
                      @clear="clearTreasury"
                    />
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">
                      {{ paymentMethodLabel }}
                    </label>
                    <select
                      v-model="selectedPaymentMethod"
                      :class="[fieldClass, isRTL ? 'text-right' : 'text-left']"
                      :dir="isRTL ? 'rtl' : 'ltr'"
                    >
                      <option v-for="option in paymentMethodOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">
                      {{ contractorLabel }}
                    </label>
                    <SearchDropdown
                      v-model="contractorSearch"
                      :items="contractorOptions"
                      itemLabel="name"
                      :placeholder="selectedModule ? searchContractorPlaceholder : selectModuleFirstPlaceholder"
                      :inputClass="fieldClass"
                      :dir="isRTL ? 'rtl' : 'ltr'"
                      :disabled="!selectedModule || !contractorOptions.length"
                      teleportTarget="body"
                      clearable
                      :clearAriaLabel="clearLabel"
                      @select="handleContractorSelect"
                      @clear="clearContractor"
                    />
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">
                      {{ amountLabel }}
                    </label>
                    <input
                      v-model.number="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      :class="[fieldClass, isRTL ? 'text-right' : 'text-left']"
                      :dir="isRTL ? 'rtl' : 'ltr'"
                    />
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">
                      {{ notesLabel }}
                    </label>
                    <input
                      v-model="notes"
                      type="text"
                      :class="[fieldClass, isRTL ? 'text-right' : 'text-left']"
                      :dir="isRTL ? 'rtl' : 'ltr'"
                    />
                  </div>
                </div>
              </div>

              <p v-if="submitError" class="mt-6 text-center text-sm font-medium text-red-600">
                {{ submitError }}
              </p>

              <div class="mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
                <ShadcnButton variant="outline" size="native"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium theme-text-secondary hover:theme-hover-soft"
                  @click="closeModal"
                >
                  {{ cancelLabel }}
                </ShadcnButton>
                <ShadcnButton variant="outline" size="native"
                  type="button"
                  class="theme-button inline-flex items-center justify-center gap-2 px-10 py-3"
                  :disabled="isSaving"
                  @click="savePayment"
                >
                  <span>{{ isSaving ? savingLabel : saveLabel }}</span>
                  <CheckIcon class="h-5 w-5" />
                </ShadcnButton>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import { computed, nextTick, ref, watch } from 'vue'
import DateField from '@/components/shared/DateField.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { updatePayment, getContractors, getLocations, getTreasuries } from '@/api'
import { formatToISODate } from '@/utils/dateUtils'
import { Check as CheckIcon } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const idsEqual = (left, right) => String(left ?? '') === String(right ?? '')

const ACCOUNT_TYPE_TO_MODULE = {
  SUPPLY: 'supply',
  TRANSPORT: 'transport',
  RENTAL: 'rentals',
  EXTRACT: 'extract',
  EXPENSE: 'supply',
  GENERAL: 'supply',
  OTHER: 'supply'
}

export default {
  name: 'PaymentEditModal',
  components: {
    DateField,
    SearchDropdown,
    CheckIcon
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    payment: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible', 'saved'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const internalVisible = ref(props.visible)
    const locations = ref([])
    const treasuries = ref([])
    const contractorOptions = ref([])

    const filters = ref({ siteSearch: '' })
    const selectedSite = ref(null)
    const selectedDate = ref('')
    const selectedModule = ref('')
    const selectedTreasury = ref(null)
    const selectedTreasurySearch = ref('')
    const selectedPaymentMethod = ref('cash')
    const selectedContractor = ref(null)
    const contractorSearch = ref('')
    const amount = ref('')
    const notes = ref('')
    const submitError = ref('')
    const isSaving = ref(false)

    const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

    const labelFor = (key, fallback) => {
      const value = t(key)
      return value === key ? fallback : value
    }

    const isRTL = computed(() => {
      if (typeof document === 'undefined') return false
      return document.documentElement?.dir === 'rtl' || document.body?.dir === 'rtl'
    })

    const sites = computed(() => locations.value.filter(location => !location.parentId))
    const treasuryOptions = computed(() => treasuries.value)

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

    const editTitle = computed(() => labelFor('payments.editPayment', 'Edit payment'))
    const siteLabel = computed(() => labelFor('labels.site', 'Site'))
    const dateLabel = computed(() => labelFor('labels.date', 'Date'))
    const moduleLabel = computed(() => labelFor('labels.module', 'Module'))
    const contractorLabel = computed(() => labelFor('labels.contractor', 'Contractor'))
    const amountLabel = computed(() => labelFor('labels.amount', 'Amount'))
    const paymentMethodLabel = computed(() => labelFor('labels.paymentMethod', 'Payment Method'))
    const treasuryLabel = computed(() => labelFor('dashboard.treasury', 'Treasury'))
    const notesLabel = computed(() => labelFor('labels.notes', 'Notes'))
    const saveLabel = computed(() => labelFor('labels.save', 'Save'))
    const savingLabel = computed(() => labelFor('labels.saving', 'Saving'))
    const cancelLabel = computed(() => labelFor('labels.cancel', 'Cancel'))
    const searchLocationPlaceholder = computed(() => labelFor('placeholders.searchLocation', 'Search location'))
    const searchContractorPlaceholder = computed(() => labelFor('placeholders.searchContractor', 'Search contractor'))
    const selectModuleFirstPlaceholder = computed(() => labelFor('payments.selectModuleFirst', 'Select module first'))
    const treasuryPlaceholder = computed(() => labelFor('placeholders.searchTreasury', 'Search treasury'))
    const modulePlaceholder = computed(() => labelFor('labels.module', 'Module'))
    const clearLabel = computed(() => labelFor('labels.clear', 'Clear'))

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

    async function loadContractorsForModule(moduleValue) {
      if (!moduleValue) {
        contractorOptions.value = []
        return
      }

      try {
        const res = await getContractors({ pageSize: 1000, mode: moduleValue })
        contractorOptions.value = normalizeList(res?.data)
      } catch (error) {
        console.error('Failed to load contractors', error)
        contractorOptions.value = []
      }
    }

    const handleSiteSelect = (site) => {
      selectedSite.value = site
      filters.value.siteSearch = site?.name || ''
    }

    const clearSite = () => {
      selectedSite.value = null
      filters.value.siteSearch = ''
    }

    const handleTreasurySelect = (treasury) => {
      selectedTreasury.value = treasury
      selectedTreasurySearch.value = treasury?.name || ''
    }

    const clearTreasury = () => {
      selectedTreasury.value = null
      selectedTreasurySearch.value = ''
    }

    const handleContractorSelect = (contractor) => {
      selectedContractor.value = contractor
      contractorSearch.value = contractor?.name || ''
    }

    const clearContractor = () => {
      selectedContractor.value = null
      contractorSearch.value = ''
    }

    async function handleModuleChange() {
      selectedContractor.value = null
      contractorSearch.value = ''
      await loadContractorsForModule(selectedModule.value)
    }

    function resetForm() {
      filters.value.siteSearch = ''
      selectedSite.value = null
      selectedDate.value = ''
      selectedModule.value = ''
      selectedTreasury.value = null
      selectedTreasurySearch.value = ''
      selectedPaymentMethod.value = 'cash'
      selectedContractor.value = null
      contractorSearch.value = ''
      amount.value = ''
      notes.value = ''
      submitError.value = ''
      contractorOptions.value = []
    }

    async function hydrateFromPayment() {
      resetForm()
      const payment = props.payment
      if (!payment) return

      selectedDate.value = formatToISODate(payment.paidAt || payment.date || '')
      selectedPaymentMethod.value = payment.paymentMethod || 'cash'
      amount.value = payment.amount ?? ''
      notes.value = payment.notes || ''

      const moduleValue =
        payment.module ||
        ACCOUNT_TYPE_TO_MODULE[String(payment.accountType || '').toUpperCase()] ||
        ''
      selectedModule.value = moduleValue

      const siteId = payment.siteId ?? payment.site?.id ?? payment.locationId
      const site = sites.value.find(item => idsEqual(item.id, siteId)) ||
        sites.value.find(item => item.name === (payment.site?.name || payment.location))
      if (site) {
        selectedSite.value = site
        filters.value.siteSearch = site.name || ''
      }

      const treasuryId = payment.treasuryId ?? payment.treasuryRef?.id
      const treasury = treasuryOptions.value.find(item => idsEqual(item.id, treasuryId)) ||
        treasuryOptions.value.find(item => item.name === payment.treasury)
      if (treasury) {
        selectedTreasury.value = treasury
        selectedTreasurySearch.value = treasury.name || ''
      }

      if (moduleValue) {
        await loadContractorsForModule(moduleValue)
        const contractorId = payment.contractorId ?? payment.contractor?.id
        const contractor = contractorOptions.value.find(item => idsEqual(item.id, contractorId)) ||
          contractorOptions.value.find(item => item.name === (payment.contractorName || payment.contractor?.name))
        if (contractor) {
          selectedContractor.value = contractor
          contractorSearch.value = contractor.name || ''
        }
      }
    }

    async function initializeModal() {
      await Promise.all([loadLocations(), loadTreasuries()])
      await hydrateFromPayment()
      await nextTick()
    }

    const closeModal = () => {
      internalVisible.value = false
    }

    const savePayment = async () => {
      submitError.value = ''

      if (!props.payment?.id) {
        submitError.value = labelFor('payments.noPaymentSelected', 'No payment selected')
        return
      }
      if (!selectedDate.value || !selectedModule.value || !selectedContractor.value || !amount.value) {
        submitError.value = labelFor('common.fillRequiredFields', 'Fill all required fields')
        return
      }

      isSaving.value = true
      try {
        const payload = {
          paidAt: selectedDate.value,
          siteId: selectedSite.value?.id ?? null,
          accountType: String(selectedModule.value === 'rentals' ? 'RENTAL' : selectedModule.value).toUpperCase(),
          treasuryId: selectedTreasury.value?.id ?? null,
          treasury: selectedTreasury.value?.name || '',
          paymentMethod: selectedPaymentMethod.value || 'cash',
          contractorId: selectedContractor.value?.id ?? null,
          amount: Number(amount.value) || 0,
          notes: notes.value
        }

        const res = await updatePayment(props.payment.id, payload)
        emit('saved', res)
        closeModal()
      } catch (error) {
        console.error('Failed to update payment', error)
        submitError.value = error?.response?.data?.message || labelFor('common.saveError', 'Failed to save payment')
      } finally {
        isSaving.value = false
      }
    }

    watch(() => props.visible, async (value) => {
      internalVisible.value = value
      if (value) await initializeModal()
    }, { immediate: true })

    watch(internalVisible, (value) => {
      emit('update:visible', value)
      if (!value) resetForm()
    })

    return {
      isVisible: internalVisible,
      isRTL,
      filters,
      sites,
      treasuryOptions,
      contractorOptions,
      moduleOptions,
      paymentMethodOptions,
      fieldClass,
      selectedDate,
      selectedModule,
      selectedTreasurySearch,
      selectedPaymentMethod,
      contractorSearch,
      amount,
      notes,
      submitError,
      isSaving,
      handleSiteSelect,
      clearSite,
      handleTreasurySelect,
      clearTreasury,
      handleContractorSelect,
      clearContractor,
      handleModuleChange,
      savePayment,
      closeModal,
      editTitle,
      siteLabel,
      dateLabel,
      moduleLabel,
      contractorLabel,
      amountLabel,
      paymentMethodLabel,
      treasuryLabel,
      notesLabel,
      saveLabel,
      savingLabel,
      cancelLabel,
      searchLocationPlaceholder,
      searchContractorPlaceholder,
      selectModuleFirstPlaceholder,
      treasuryPlaceholder,
      modulePlaceholder,
      clearLabel
    }
  }
}
</script>

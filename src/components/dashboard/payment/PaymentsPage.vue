<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900">{{ $t('dashboard.payments') || 'Payments' }}</h2>
      </div>
      <button @click="onPay"
        class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700">
        {{ $t('dashboard.pay') || 'Pay' }}
      </button>
    </div>

    <div class="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <h4 class="text-sm font-semibold text-gray-700">{{ $t('labels.filters') || 'Filters' }}</h4>

      <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <label class="mb-2 block text-xs font-semibold text-gray-700">{{ $t('labels.dateFrom') || 'Date from' }}</label>
          <DateField
            v-model="filters.dateFrom"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-gray-700">{{ $t('labels.dateTo') || 'Date to' }}</label>
          <DateField
            v-model="filters.dateTo"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-gray-700">{{ $t('labels.site') || 'Site' }}</label>
          <SearchDropdown
            v-model="filters.siteSearch"
            :items="siteOptions"
            :all-items="siteOptions"
            itemLabel="name"
            :placeholder="$t('labels.site') || 'Site'"
            :inputClass="fieldClass"
            @select="handleSiteSelect"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-gray-700">{{ $t('labels.area') || 'Area' }}</label>
          <SearchDropdown
            v-model="filters.areaSearch"
            :items="availableAreaOptions"
            :all-items="areaOptions"
            itemLabel="name"
            :placeholder="$t('placeholders.searchArea') || 'Search area...'"
            :inputClass="fieldClass"
            @select="handleAreaSelect"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-gray-700">{{ $t('payments.module') || 'Module' }}</label>
          <SearchDropdown
            v-model="filters.moduleSearch"
            :items="moduleOptions"
            :all-items="moduleOptions"
            itemLabel="label"
            :placeholder="$t('payments.module') || 'Module'"
            :inputClass="fieldClass"
            @select="handleModuleSelect"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-gray-700">{{ $t('labels.contractor') || 'Contractor' }}</label>
          <SearchDropdown
            v-model="filters.contractorSearch"
            :items="contractorOptions"
            :all-items="contractorOptions"
            itemLabel="name"
            :placeholder="filters.moduleSelected ? ($t('placeholders.searchContractor') || 'Search contractor...') : ($t('payments.selectModuleFirst') || 'Select module first')"
            :inputClass="fieldClass"
            :disabled="!filters.moduleSelected"
            @select="handleContractorSelect"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-gray-700">{{ $t('labels.paymentMethod') || 'Payment Method' }}</label>
          <SearchDropdown
            v-model="filters.paymentMethodSearch"
            :items="paymentMethodOptions"
            :all-items="paymentMethodOptions"
            itemLabel="label"
            :placeholder="$t('payments.methodPlaceholder') || 'Payment method'"
            :inputClass="fieldClass"
            @select="handlePaymentMethodSelect"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-gray-700">{{ $t('labels.treasury') || 'Treasury' }}</label>
          <SearchDropdown
            v-model="filters.treasurySearch"
            :items="treasuryOptions"
            :all-items="treasuryOptions"
            itemLabel="name"
            :placeholder="$t('dashboard.treasuryPlaceholder') || 'Source treasury'"
            :inputClass="fieldClass"
            @select="handleTreasurySelect"
          />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <button @click="applyFilters"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700">
          {{ $t('labels.search') || 'Search' }}
        </button>
        <button @click="resetFilters"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50">
          {{ $t('labels.clear') || 'Clear' }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto bg-white rounded-3xl border border-gray-200 shadow-sm">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-indigo-50 text-left text-xs uppercase tracking-wide text-gray-600">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">{{ $t('labels.date') || 'Date' }}</th>
            <th class="px-4 py-3">{{ $t('labels.site') || 'Site' }}</th>
            <th class="px-4 py-3">{{ $t('labels.area') || 'Area' }}</th>
            <th class="px-4 py-3">{{ $t('payments.module') || 'Module' }}</th>
            <th class="px-4 py-3">{{ $t('labels.contractor') || 'Contractor' }}</th>
            <th class="px-4 py-3">{{ $t('labels.amount') || 'Amount' }}</th>
            <th class="px-4 py-3">{{ $t('labels.paymentMethod') || 'Payment Method' }}</th>
            <th class="px-4 py-3">{{ $t('dashboard.treasury') || 'Treasury' }}</th>
            <th class="px-4 py-3">{{ $t('labels.notes') || 'Notes' }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="(payment, index) in filteredPayments" :key="payment.id || index">
            <td class="px-4 py-3 text-gray-700">{{ index + 1 }}</td>
            <td class="px-4 py-3 text-gray-700">{{ formatDate(paymentDate(payment)) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentSite(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentArea(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentModule(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentContractor(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ formatAmount(payment.amount) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentMethodLabel(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentTreasury(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentNotes(payment) }}</td>
          </tr>
          <tr v-if="!filteredPayments.length">
            <td class="px-4 py-6 text-center text-gray-500" :colspan="10">{{ $t('payments.noPayments') || 'No payments found' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaymentCreationModal v-model:visible="paymentModalVisible" @saved="onPaymentCreated" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getPayments, getLocations, getContractors } from '@/api'
import PaymentCreationModal from '@/components/dashboard/payment/PaymentCreationModal.vue'
import DateField from '@/components/shared/DateField.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const idsEqual = (left, right) => String(left ?? '') === String(right ?? '')

export default {
  name: 'PaymentsPage',
  components: {
    PaymentCreationModal,
    DateField,
    SearchDropdown
  },
  setup() {
    const { locale, t } = useI18n()
    const isRTL = computed(() => locale.value?.toString().startsWith('ar'))
    const paymentModalVisible = ref(false)
    const payments = ref([])
    const locations = ref([])
    const contractorFilterOptions = ref([])
    const loading = ref(false)
    const createFilters = () => ({
      dateFrom: '',
      dateTo: '',
      siteSearch: '',
      siteSelected: null,
      areaSearch: '',
      areaSelected: null,
      moduleSearch: '',
      moduleSelected: null,
      contractorSearch: '',
      contractorSelected: null,
      paymentMethodSearch: '',
      paymentMethodSelected: null,
      treasurySearch: '',
      treasurySelected: null
    })
    const filters = ref(createFilters())
    const appliedFilters = ref(createFilters())
    const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100'

    const normalize = (value = '') => String(value || '').toLowerCase().trim()

    const textValue = (value) => {
      if (value == null || value === '') return '-'
      if (typeof value === 'string' || typeof value === 'number') return String(value)
      if (typeof value === 'object') return value.name || value.label || value.title || '-'
      return String(value)
    }

    const paymentDate = (payment) => payment.date || payment.paidAt || payment.paymentDate || payment.createdAt || payment.transactionDate || payment.dateTime || ''
    const paymentSite = (payment) => textValue(payment.location || payment.site?.name || payment.site || '-')
    const paymentArea = (payment) => textValue(payment.area || payment.areaObject?.name || payment.region || payment.zone || '-')
    const paymentModule = (payment) => {
      const rawValue = String(payment.module || payment.accountType || payment.type || '').trim().toLowerCase()

      const moduleKeyMap = {
        supply: 'supply.title',
        supplies: 'supply.title',
        export: 'supply.title',
        exports: 'supply.title',
        transport: 'transport.transport',
        transports: 'transport.transport',
        extract: 'extracts.title',
        extracts: 'extracts.title',
        rental: 'rentals.rentalList',
        rentals: 'rentals.rentalList',
        equipment: 'rentals.rentalList',
        equipmentlog: 'rentals.rentalList',
        equipmentlogs: 'rentals.rentalList'
      }

      const translationKey = moduleKeyMap[rawValue]
      return translationKey ? t(translationKey) : textValue(payment.module || payment.accountType || payment.type || '-')
    }
    const paymentContractor = (payment) => textValue(payment.contractorName || payment.contractor?.name || payment.contractor || '-')
    const paymentMethodLabel = (payment) => textValue(payment.method || payment.paymentMethod || payment.type || payment.payment_type || '-')
    const paymentTreasury = (payment) => textValue(payment.treasury || payment.sourceAccount || payment.wallet || payment.branch?.name || payment.branch || '-')
    const paymentNotes = (payment) => textValue(payment.notes || payment.reference || '-')
    const findSiteForArea = (area) => {
      if (!area) return null
      if (area.site) return area.site
      if (area.parent && typeof area.parent === 'object') return area.parent
      return locations.value.find(location => idsEqual(location.id, area.parentId) || idsEqual(location.id, area.locationId))
    }
    const uniqueByName = (items = [], labelKey = 'name') => {
      const seen = new Set()
      return items.filter(item => {
        const value = normalize(item?.[labelKey])
        if (!value || seen.has(value)) return false
        seen.add(value)
        return true
      })
    }

    const siteOptions = computed(() => locations.value.filter(location => !location.parentId && !location.parent))

    const areaOptions = computed(() => {
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

    const availableAreaOptions = computed(() => {
      if (!filters.value.siteSelected?.name) return areaOptions.value
      return areaOptions.value.filter(area =>
        idsEqual(area.parentId, filters.value.siteSelected.id) || idsEqual(area.site?.id, filters.value.siteSelected.id)
      )
    })

    const moduleOptions = computed(() => ([
      { value: 'supply', label: t('supply.title') || 'Supply' },
      { value: 'transport', label: t('transport.transport') || 'Transport' },
      { value: 'rentals', label: t('rentals.rentalList') || 'Equipment Logs' },
      { value: 'extract', label: t('extracts.title') || 'Extracts' }
    ]))

    const contractorOptions = computed(() => contractorFilterOptions.value)

    const paymentMethodOptions = computed(() => uniqueByName(
      payments.value
        .map(payment => {
          const value = String(payment.method || payment.paymentMethod || payment.payment_type || '').trim().toLowerCase()
          return { value, label: paymentMethodLabel(payment) }
        })
        .filter(item => item.value && item.label && item.label !== '-'),
      'label'
    ))

    const treasuryOptions = computed(() => uniqueByName(
      payments.value
        .map(payment => ({ id: paymentTreasury(payment), name: paymentTreasury(payment) }))
        .filter(item => item.name && item.name !== '-')
    ))

    const filteredPayments = computed(() => {
      const {
        dateFrom,
        dateTo,
        siteSearch,
        areaSearch,
        moduleSearch,
        contractorSearch,
        paymentMethodSearch,
        treasurySearch
      } = appliedFilters.value
      const lowerSite = normalize(siteSearch)
      const lowerArea = normalize(areaSearch)
      const lowerModule = normalize(moduleSearch)
      const lowerContractor = normalize(contractorSearch)
      const lowerMethod = normalize(paymentMethodSearch)
      const lowerTreasury = normalize(treasurySearch)

      return payments.value.filter(payment => {
        const dateValue = paymentDate(payment)
        const parsedDate = dateValue ? new Date(dateValue) : null
        const validDate = parsedDate && !Number.isNaN(parsedDate.getTime())
        if (dateFrom && validDate && parsedDate < new Date(dateFrom + 'T00:00:00')) return false
        if (dateTo && validDate && parsedDate > new Date(dateTo + 'T23:59:59')) return false
        if (lowerSite && !normalize(paymentSite(payment)).includes(lowerSite)) return false
        if (lowerArea && !normalize(paymentArea(payment)).includes(lowerArea)) return false
        if (lowerModule && !normalize(paymentModule(payment)).includes(lowerModule)) return false
        if (lowerContractor && !normalize(paymentContractor(payment)).includes(lowerContractor)) return false
        if (lowerMethod && !normalize(paymentMethodLabel(payment)).includes(lowerMethod)) return false
        if (lowerTreasury && !normalize(paymentTreasury(payment)).includes(lowerTreasury)) return false
        return true
      })
    })

    const loadPayments = async () => {
      loading.value = true
      try {
        const res = await getPayments()
        const data = res?.data
        if (Array.isArray(data)) {
          payments.value = data
        } else if (Array.isArray(data?.items)) {
          payments.value = data.items
        } else if (Array.isArray(data?.data)) {
          payments.value = data.data
        } else {
          payments.value = []
        }
      } catch (error) {
        console.error('Failed to load payments', error)
        payments.value = []
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      if (!payments.value.length) {
        loadPayments()
      }
      appliedFilters.value = {
        ...filters.value
      }
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

    const loadContractorOptions = async (moduleValue) => {
      if (!moduleValue) {
        contractorFilterOptions.value = []
        return
      }

      try {
        const res = await getContractors({
          pageSize: 1000,
          mode: moduleValue
        })
        contractorFilterOptions.value = normalizeList(res?.data)
      } catch (error) {
        console.error('Failed to load contractors for payment filters', error)
        contractorFilterOptions.value = []
      }
    }

    const handleSiteSelect = (site) => {
      filters.value.siteSelected = site
      filters.value.siteSearch = site?.name || ''
      filters.value.areaSelected = null
      filters.value.areaSearch = ''
    }

    const handleAreaSelect = (area) => {
      filters.value.areaSelected = area
      filters.value.areaSearch = area?.name || ''
      const site = findSiteForArea(area)
      if (site) {
        filters.value.siteSelected = site
        filters.value.siteSearch = site.name || ''
      }
    }

    const handleModuleSelect = async (module) => {
      filters.value.moduleSelected = module
      filters.value.moduleSearch = module?.label || ''
      filters.value.contractorSelected = null
      filters.value.contractorSearch = ''
      await loadContractorOptions(module?.value || '')
    }

    const handleContractorSelect = (contractor) => {
      filters.value.contractorSelected = contractor
      filters.value.contractorSearch = contractor?.name || ''
    }

    const handlePaymentMethodSelect = (method) => {
      filters.value.paymentMethodSelected = method
      filters.value.paymentMethodSearch = method?.label || ''
    }

    const handleTreasurySelect = (treasury) => {
      filters.value.treasurySelected = treasury
      filters.value.treasurySearch = treasury?.name || ''
    }

    const resetFilters = () => {
      filters.value = createFilters()
      contractorFilterOptions.value = []
    }

    const onPay = () => {
      paymentModalVisible.value = true
    }

    const onPaymentCreated = async (payment) => {
      if (Array.isArray(payment?.items) && payment.items.length) {
        payments.value = [...payment.items, ...payments.value]
        return
      }

      await loadPayments()
    }

    const formatDate = (value) => {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleDateString()
    }

    const formatAmount = (value) => {
      const amount = Number(value)
      if (Number.isNaN(amount)) return textValue(value)
      return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    return {
      isRTL,
      paymentModalVisible,
      filters,
      fieldClass,
      filteredPayments,
      siteOptions,
      areaOptions,
      availableAreaOptions,
      moduleOptions,
      contractorOptions,
      paymentMethodOptions,
      treasuryOptions,
      applyFilters,
      loadLocations,
      handleSiteSelect,
      handleAreaSelect,
      handleModuleSelect,
      handleContractorSelect,
      handlePaymentMethodSelect,
      handleTreasurySelect,
      resetFilters,
      onPay,
      onPaymentCreated,
      paymentDate,
      paymentSite,
      paymentArea,
      paymentModule,
      paymentContractor,
      paymentMethodLabel,
      paymentTreasury,
      paymentNotes,
      formatDate
      ,
      formatAmount
    }
  },
  mounted() {
    this.applyFilters()
    this.loadLocations()
  }
}
</script>

<style scoped>
</style>

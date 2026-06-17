<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6">
    <div class="app-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl theme-page-header-bar p-3 sm:p-5 shadow-lg shadow-slate-200/50">
      <div>
        <h2 class="text-2xl font-semibold theme-heading theme-text-primary">{{ $t('dashboard.payments') || 'Payments' }}</h2>
      </div>

      <div class="mt-3 sm:mt-0 flex items-center gap-2">
        <button @click="onPay" class="theme-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2">
          {{ $t('dashboard.pay') || 'Pay' }}
        </button>
      </div>
    </div>

    <div class="theme-surface rounded-lg shadow-sm p-4">
      <h4 class="text-sm font-semibold theme-text-primary">{{ $t('labels.filters') || 'Filters' }}</h4>

      <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <label class="mb-2 block text-xs font-semibold theme-text-secondary">{{ $t('labels.dateFrom') || 'Date from' }}</label>
          <DateField v-model="filters.dateFrom" :class="fieldClass" />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold theme-text-secondary">{{ $t('labels.dateTo') || 'Date to' }}</label>
          <DateField v-model="filters.dateTo" :class="fieldClass" />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold theme-text-secondary">{{ $t('labels.site') || 'Site' }}</label>
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
          <label class="mb-2 block text-xs font-semibold theme-text-secondary">{{ $t('payments.module') || 'Module' }}</label>
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
          <label class="mb-2 block text-xs font-semibold theme-text-secondary">{{ $t('labels.contractor') || 'Contractor' }}</label>
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
          <label class="mb-2 block text-xs font-semibold theme-text-secondary">{{ $t('labels.paymentMethod') || 'Payment Method' }}</label>
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
          <label class="mb-2 block text-xs font-semibold theme-text-secondary">{{ $t('labels.treasury') || 'Treasury' }}</label>
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

      <div class="mt-4 flex flex-wrap gap-2">
        <button @click="applyFilters" class="theme-button px-4 py-2">
          {{ $t('labels.search') || 'Search' }}
        </button>
        <button @click="resetFilters" class="rounded-md border border-gray-200 px-4 py-2 theme-text-secondary hover:theme-hover-soft">
          {{ $t('labels.clear') || 'Clear' }}
        </button>
      </div>
    </div>

    <!-- <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 class="text-sm font-semibold theme-text-primary">{{ $t('reports.moduleReports') || 'Payment Reports' }}</h4>
          <p class="text-xs theme-text-secondary">{{ $t('reports.moduleReportsHint') || 'Open reports built for payment records.' }}</p>
        </div>
      </div>

      <div v-if="reportsLoading" class="mt-4 text-sm theme-text-secondary">
        {{ $t('labels.loading') || 'Loading...' }}
      </div>

      <div v-else-if="paymentReports.length" class="mt-4 overflow-hidden rounded-lg border border-gray-200">
        <div
          v-for="report in paymentReports"
          :key="report.id"
          class="border-b border-gray-200 p-4 last:border-b-0 hover:theme-hover-soft"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-medium theme-text-primary">
                {{ isRTL && report.arTitle ? report.arTitle : report.title }}
              </p>
              <p class="mt-1 text-xs theme-text-secondary">{{ report.key }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="report.active" class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                {{ $t('labels.active') || 'Active' }}
              </span>
              <button
                type="button"
                @click="openReport(report.id)"
                class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                {{ $t('admin.run') || 'Run' }}
              </button>
              <router-link
                :to="{ name: 'admin-reports-edit', params: { id: report.id } }"
                class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium theme-text-secondary hover:theme-hover-soft"
              >
                {{ $t('labels.edit') || 'Edit' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="mt-4 rounded-lg border border-dashed border-gray-200 theme-dashboard-bg-soft p-4 text-sm theme-text-secondary">
        {{ $t('reports.noModuleReports') || 'No payment reports have been configured yet.' }}
      </div>
    </div> -->

    <div class="overflow-x-auto theme-surface rounded-3xl border border-gray-200 shadow-sm">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="theme-table-thead-gradient text-left text-xs uppercase tracking-wide theme-text-muted">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">{{ $t('labels.date') || 'Date' }}</th>
            <th class="px-4 py-3">{{ $t('labels.site') || 'Site' }}</th>
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
            <td class="px-4 py-3 theme-text-primary">{{ index + 1 }}</td>
            <td class="px-4 py-3 theme-text-primary">{{ formatDate(paymentDate(payment)) }}</td>
            <td class="px-4 py-3 theme-text-primary">{{ paymentSite(payment) }}</td>
            <td class="px-4 py-3 theme-text-primary">{{ paymentModule(payment) }}</td>
            <td class="px-4 py-3 theme-text-primary">{{ paymentContractor(payment) }}</td>
            <td class="px-4 py-3 theme-text-primary">{{ formatAmount(payment.amount) }}</td>
            <td class="px-4 py-3 theme-text-primary">{{ paymentMethodLabel(payment) }}</td>
            <td class="px-4 py-3 theme-text-primary">{{ paymentTreasury(payment) }}</td>
            <td class="px-4 py-3 theme-text-primary">{{ paymentNotes(payment) }}</td>
          </tr>
          <tr v-if="!filteredPayments.length">
            <td class="px-4 py-6 text-center theme-text-secondary" :colspan="9">{{ $t('payments.noPayments') || 'No payments found' }}</td>
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
import { useRouter } from 'vue-router'
import { getPayments, getLocations, getContractors, getTreasuries, getReportDefs } from '@/api'
import PaymentCreationModal from '@/components/dashboard/payment/PaymentCreationModal.vue'
import DateField from '@/components/shared/DateField.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export default {
  name: 'PaymentsPage',
  components: {
    PaymentCreationModal,
    DateField,
    SearchDropdown
  },
  setup() {
    const { locale, t } = useI18n()
    const router = useRouter()
    const isRTL = computed(() => locale.value?.toString().startsWith('ar'))
    const paymentModalVisible = ref(false)
    const payments = ref([])
    const reports = ref([])
    const locations = ref([])
    const treasuries = ref([])
    const contractorFilterOptions = ref([])
    const reportsLoading = ref(false)
    const loading = ref(false)
    const createFilters = () => ({
      dateFrom: '',
      dateTo: '',
      siteSearch: '',
      siteSelected: null,
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
    const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm theme-input-focus'

    const normalize = (value = '') => String(value || '').toLowerCase().trim()

    const textValue = (value) => {
      if (value == null || value === '') return '-'
      if (typeof value === 'string' || typeof value === 'number') return String(value)
      if (typeof value === 'object') return value.name || value.label || value.title || '-'
      return String(value)
    }

    const paymentDate = (payment) => payment.date || payment.paidAt || payment.paymentDate || payment.createdAt || payment.transactionDate || payment.dateTime || ''
    const paymentSite = (payment) => textValue(payment.location || payment.site?.name || payment.site || '-')
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
    const paymentTreasury = (payment) => textValue(payment.treasury || payment.treasuryRef?.name || payment.sourceAccount || payment.wallet || '-')
    const paymentNotes = (payment) => textValue(payment.notes || '-')
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

    const treasuryOptions = computed(() => normalizeList(treasuries.value))

    const filteredPayments = computed(() => {
      const {
        dateFrom,
        dateTo,
        siteSearch,
        moduleSearch,
        contractorSearch,
        paymentMethodSearch,
        treasurySearch
      } = appliedFilters.value
      const lowerSite = normalize(siteSearch)
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

    const loadTreasuries = async () => {
      try {
        const res = await getTreasuries()
        treasuries.value = normalizeList(res?.data)
      } catch (error) {
        console.error('Failed to load treasuries for payments', error)
        treasuries.value = []
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

    const paymentReports = computed(() => reports.value.filter(report => normalize(report?.module) === 'payments'))

    const loadReports = async () => {
      reportsLoading.value = true
      try {
        const res = await getReportDefs({ pageSize: 500 })
        const data = res?.data
        if (Array.isArray(data)) {
          reports.value = data
        } else if (Array.isArray(data?.items)) {
          reports.value = data.items
        } else if (Array.isArray(data?.data)) {
          reports.value = data.data
        } else {
          reports.value = []
        }
      } catch (error) {
        console.error('Failed to load payment reports', error)
        reports.value = []
      } finally {
        reportsLoading.value = false
      }
    }

    const openReport = (reportId) => {
      if (!reportId) return
      router.push({ name: 'admin-reports-run', params: { id: reportId } })
    }

    return {
      isRTL,
      paymentModalVisible,
      reportsLoading,
      filters,
      fieldClass,
      filteredPayments,
      paymentReports,
      siteOptions,
      moduleOptions,
      contractorOptions,
      paymentMethodOptions,
      treasuryOptions,
      applyFilters,
      loadLocations,
      loadTreasuries,
      handleSiteSelect,
      handleModuleSelect,
      handleContractorSelect,
      handlePaymentMethodSelect,
      handleTreasurySelect,
      resetFilters,
      onPay,
      onPaymentCreated,
      paymentDate,
      paymentSite,
      paymentModule,
      paymentContractor,
      paymentMethodLabel,
      paymentTreasury,
      paymentNotes,
      formatDate
      ,
      formatAmount,
      loadReports,
      openReport
    }
  },
  mounted() {
    this.applyFilters()
    this.loadLocations()
    this.loadTreasuries()
    this.loadReports()
  }
}
</script>

<style scoped>
</style>

<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900">{{ $t('dashboard.payments') || 'Payments' }}</h2>
        <p class="text-sm text-gray-500">{{ $t('dashboard.paymentsDescription') || 'Filter and review payment records.' }}</p>
      </div>
      <button @click="onPay"
        class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700">
        {{ $t('dashboard.pay') || 'Pay' }}
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-2">{{ $t('labels.dateFrom') || 'Date from' }}</label>
          <input type="date" v-model="filters.dateFrom"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-2">{{ $t('labels.dateTo') || 'Date to' }}</label>
          <input type="date" v-model="filters.dateTo"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-2">{{ $t('labels.area') || 'Area' }}</label>
          <input type="text" v-model="filters.area"
            :placeholder="$t('placeholders.searchArea')"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-2">{{ $t('labels.contractor') || 'Contractor' }}</label>
          <input type="text" v-model="filters.contractor"
            :placeholder="$t('placeholders.searchContractor')"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-2">{{ $t('labels.paymentMethod') || 'Payment Method' }}</label>
          <input type="text" v-model="filters.paymentMethod"
            :placeholder="$t('payments.methodPlaceholder') || 'Payment method'"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-2">{{ $t('labels.treasury') || 'Treasury' }}</label>
          <input type="text" v-model="filters.treasury"
            :placeholder="$t('dashboard.treasuryPlaceholder') || 'Source treasury'"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
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
            <th class="px-4 py-3">{{ $t('labels.area') || 'Area' }}</th>
            <th class="px-4 py-3">{{ $t('labels.contractor') || 'Contractor' }}</th>
            <th class="px-4 py-3">{{ $t('labels.paymentMethod') || 'Payment Method' }}</th>
            <th class="px-4 py-3">{{ $t('dashboard.treasury') || 'Treasury' }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="(payment, index) in filteredPayments" :key="payment.id || index">
            <td class="px-4 py-3 text-gray-700">{{ index + 1 }}</td>
            <td class="px-4 py-3 text-gray-700">{{ formatDate(paymentDate(payment)) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentArea(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentContractor(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentMethodLabel(payment) }}</td>
            <td class="px-4 py-3 text-gray-700">{{ paymentTreasury(payment) }}</td>
          </tr>
          <tr v-if="!filteredPayments.length">
            <td class="px-4 py-6 text-center text-gray-500" :colspan="6">{{ $t('payments.noPayments') || 'No payments found' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaymentCreationModal v-model:visible="paymentModalVisible" @saved="onPaymentCreated" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { getPayments } from '@/api'
import PaymentCreationModal from '@/components/dashboard/payment/PaymentCreationModal.vue'

export default {
  name: 'PaymentsPage',
  components: {
    PaymentCreationModal
  },
  setup() {
    const isRTL = ref(false)
    const paymentModalVisible = ref(false)
    const payments = ref([])
    const loading = ref(false)
    const filters = ref({
      dateFrom: '',
      dateTo: '',
      area: '',
      contractor: '',
      paymentMethod: '',
      treasury: ''
    })

    const normalize = (value = '') => String(value || '').toLowerCase().trim()

    const paymentDate = (payment) => payment.date || payment.paymentDate || payment.createdAt || payment.transactionDate || payment.dateTime || ''
    const paymentArea = (payment) => payment.area || payment.location || payment.site || payment.region || payment.zone || '-'
    const paymentContractor = (payment) => payment.contractorName || payment.contractor?.name || payment.contractor || '-'
    const paymentMethodLabel = (payment) => payment.method || payment.paymentMethod || payment.type || payment.payment_type || '-'
    const paymentTreasury = (payment) => payment.treasury || payment.sourceAccount || payment.wallet || payment.branch || '-'

    const filteredPayments = computed(() => {
      const { dateFrom, dateTo, area, contractor, paymentMethod, treasury } = filters.value
      const lowerArea = normalize(area)
      const lowerContractor = normalize(contractor)
      const lowerMethod = normalize(paymentMethod)
      const lowerTreasury = normalize(treasury)

      return payments.value.filter(payment => {
        const dateValue = paymentDate(payment)
        const parsedDate = dateValue ? new Date(dateValue) : null
        const validDate = parsedDate && !Number.isNaN(parsedDate.getTime())
        if (dateFrom && validDate && parsedDate < new Date(dateFrom + 'T00:00:00')) return false
        if (dateTo && validDate && parsedDate > new Date(dateTo + 'T23:59:59')) return false
        if (lowerArea && !normalize(paymentArea(payment)).includes(lowerArea)) return false
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
    }

    const resetFilters = () => {
      filters.value = { dateFrom: '', dateTo: '', area: '', contractor: '', paymentMethod: '', treasury: '' }
    }

    const onPay = () => {
      paymentModalVisible.value = true
    }

    const onPaymentCreated = (payment) => {
      payments.value.unshift({
        id: Date.now(),
        date: payment.date,
        area: payment.area,
        contractorName: payment.contractor?.name || payment.contractor,
        method: payment.paymentMethod,
        treasury: payment.treasury
      })
    }

    const formatDate = (value) => {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleDateString()
    }

    return {
      isRTL,
      paymentModalVisible,
      filters,
      filteredPayments,
      applyFilters,
      resetFilters,
      onPay,
      onPaymentCreated,
      paymentDate,
      paymentArea,
      paymentContractor,
      paymentMethodLabel,
      paymentTreasury,
      formatDate
    }
  },
  mounted() {
    this.isRTL = this.$i18n?.locale === 'ar'
    this.applyFilters()
  }
}
</script>

<style scoped>
</style>

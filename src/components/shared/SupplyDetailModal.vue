<template>
  <div v-if="visible" class="fixed inset-0 z-[2200] flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-lg p-6 w-full max-w-3xl overflow-auto max-h-[80vh]">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">{{ $t('supply.exportDetails') || 'Export Details' }}</h3>
        <div class="flex gap-2">
          <button @click="$emit('close')" class="px-3 py-1 border rounded">{{ $t('labels.close') || 'Close' }}</button>
          <button v-if="exportId" @click="togglePayments" class="px-3 py-1 border rounded bg-gray-100">{{ showPayments ? ($t('payments.hidePayments') || 'Hide payments') : ($t('payments.showPayments') || 'Show payments') }}</button>
          <button v-if="exportId" @click="openPaymentModal" class="px-3 py-1 border rounded bg-green-100 text-green-700">{{ $t('labels.addPayment') || 'Add Payment' }}</button>
        </div>
      </div>

      <div v-if="loading">Loading...</div>
      <div v-else>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div><strong>{{ $t('labels.date') }}:</strong> {{ formatDate(exportData.date) }}</div>
          <div>
            <strong>{{ $t('labels.item') }}:</strong>
            <span>{{ exportData.item?.name || '-' }}</span>
            <!-- <small class="text-sm text-gray-500 ml-2">{{ exportData.item?.defaultExportPrice ? '(' + formatCurrency(exportData.item.defaultExportPrice) + ')' : '' }}</small> -->
          </div>
          <div><strong>{{ $t('labels.contractor') }}:</strong> {{ exportData.contractor?.name || '-' }}</div>
          <div><strong>{{ $t('labels.location') }}:</strong> {{ exportData.location?.name || '-' }}</div>
          <div><strong>{{ $t('labels.area') }}:</strong> {{ exportData.area?.name || '-' }}</div>
          <div><strong>{{ $t('labels.total') }}:</strong> {{ formatCurrency(exportData.total) }}</div>
          <div><strong>{{ $t('labels.paid') }}:</strong> {{ formatCurrency(exportData.paid) }}</div>
          <div><strong>{{ $t('labels.unpaid') }}:</strong> {{ formatCurrency(exportData.unpaid) }}</div>
        </div>

        <div class="overflow-x-auto bg-gray-50 rounded p-2">
          <table class="min-w-max divide-y divide-gray-200 whitespace-nowrap">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 text-start text-xs text-gray-600">#</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.vehicle') }}</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.crusher') }}</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.crusherTicket') }}</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.companyTicket') }}</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.unitPrice') }}</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.discount') }}</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.companyCapacity') }}</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.crusherCapacity') }}</th>
                <th class="px-4 py-2 text-start text-xs text-gray-600">{{ $t('labels.total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(l, i) in exportData.exportLines || []" :key="`line-${l.id || i}`">
                <td class="px-4 py-2 text-xs">{{ i + 1 }}</td>
                <td class="px-4 py-2 text-xs">{{ l.vehicle?.name || '-' }}</td>
                <td class="px-4 py-2 text-xs">{{ exportData.crusher.name || '-' }}</td>
                <td class="px-4 py-2 text-xs">{{ l.crusherTicket || '-' }}</td>
                <td class="px-4 py-2 text-xs">{{ l.companyTicket || '-' }}</td>
                <td class="px-4 py-2 text-xs">{{ formatCurrency(l.unitPrice ?? exportData.item?.defaultExportPrice) }}</td>
                <td class="px-4 py-2 text-xs">{{ l.discount || '-' }}</td>
                <td class="px-4 py-2 text-xs">{{ l.companyCapacity || '-' }}</td>
                <td class="px-4 py-2 text-xs">{{ l.crusherCapacity || '-' }}</td>
                <td class="px-4 py-2 text-xs">{{ formatCurrency(l.total) }}</td>
              </tr>
              <tr v-if="!(exportData.exportLines && exportData.exportLines.length)">
                <td class="px-4 py-2 text-xs" :colspan="8">{{ $t('supply.noLines') || 'No lines found' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="showPayments" class="mt-4 bg-white rounded p-3 border w-full">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold">{{ $t('payments.listTitle') || 'Payments' }}</h4>
          </div>
          <div v-if="paymentsLoading">Loading payments...</div>
          <div v-else>
            <div class="overflow-x-auto w-full">
              <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2 text-start text-xs">#</th>
                  <th class="px-4 py-2 text-start text-xs">{{ $t('payments.date') || 'Date' }}</th>
                  <th class="px-4 py-2 text-start text-xs">{{ $t('payments.amount') || 'Amount' }}</th>
                  <th class="px-4 py-2 text-start text-xs">{{ $t('payments.notes') || 'Notes' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, idx) in payments" :key="p.id || idx">
                  <td class="px-4 py-2 text-xs">{{ idx + 1 }}</td>
                  <td class="px-4 py-2 text-xs">{{ formatDate(p.paidAt || p.date) }}</td>
                  <td class="px-4 py-2 text-xs">{{ formatCurrency(p.amount) }}</td>
                  <td class="px-4 py-2 text-xs">{{ p.notes || '-' }}</td>
                </tr>
                <tr v-if="!payments || !payments.length">
                  <td class="px-3 py-2 text-xs" :colspan="4">{{ $t('payments.noPayments') || 'No payments found' }}</td>
                </tr>
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PaymentModal v-if="showPaymentModal" :visible="showPaymentModal" parentType="export" :parentId="exportId" @close="showPaymentModal = false" @saved="handlePaymentSaved" />
  </div>
</template>

<script>
import { getExport, getExportPayments } from '@/api'
import normalizeItem from '@/utils/normalizeItem'
import PaymentModal from '@/components/shared/PaymentModal.vue'
export default {
  name: 'SupplyDetailModal',
  components: { PaymentModal },
  props: {
    visible: { type: Boolean, default: false },
    exportId: { type: [String, Number], default: null }
  },
  data() {
    return {
      exportData: {},
      loading: false,
      showPayments: false,
      payments: [],
      paymentsLoading: false,
      showPaymentModal: false
    }
  },
  watch: {
    exportId: {
      immediate: true,
      handler(id) {
        if (id) this.loadExport(id)
      }
    },
    visible(val) {
      if (!val) this.exportData = {}
    }
  },
  methods: {
    async loadExport(id) {
      this.loading = true
      try {
        const res = await getExport(id)
        this.exportData = res.data
        if (this.exportData && this.exportData.item) this.exportData.item = normalizeItem(this.exportData.item)
      } catch (e) {
        console.error('Failed to load export:', e)
        this.exportData = {}
      } finally {
        this.loading = false
      }
    },
    togglePayments() {
      this.showPayments = !this.showPayments
      if (this.showPayments) this.loadPayments()
    },
    async loadPayments() {
      if (!this.exportId) return
      this.paymentsLoading = true
      try {
        const res = await getExportPayments(this.exportId)
        const payload = res.data
        if (Array.isArray(payload)) this.payments = payload
        else if (payload && payload.items) this.payments = payload.items
        else this.payments = []
      } catch (e) {
        console.error('Failed to load payments:', e)
        this.payments = []
      } finally {
        this.paymentsLoading = false
      }
    },
    openPaymentModal() {
      this.showPaymentModal = true
    },
    async handlePaymentSaved(payment) {
      this.showPaymentModal = false
      if (this.exportId) await this.loadExport(this.exportId)
      if (this.showPayments) this.loadPayments()
      this.$emit('payment-saved', payment)
    },
    formatDate(d) {
      if (!d) return '-'
      const locale = (this.$i18n && this.$i18n.locale) || (navigator && navigator.language) || 'en-GB'
      try { return new Intl.DateTimeFormat(locale).format(new Date(d)) } catch { return d }
    },
    formatCurrency(v) {
      if (v === undefined || v === null || v === '') return '-'
      const n = Number(v)
      if (Number.isNaN(n)) return v
      const locale = (this.$i18n && this.$i18n.locale) || (navigator && navigator.language) || 'en-US'
      try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' }).format(n)
      } catch (e) {
        return n.toFixed(2)
      }
    }
  }
}
</script>

<style scoped>
.clickable-row { cursor: pointer; }
</style>

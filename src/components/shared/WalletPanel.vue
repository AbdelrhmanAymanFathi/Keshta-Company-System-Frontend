<template>
  <div v-if="isVisible" :dir="isRTL ? 'rtl' : 'ltr'" class="bg-white rounded shadow p-4">
    <div class="flex items-center mb-4">
      <div class="flex w-full items-center">
        <div class="w-1/3 text-start">
          <div class="text-sm text-gray-500">{{ $t('labels.balance') }}</div>
          <div class="text-2xl font-semibold" :class="(wallet && wallet.balance) < 0 ? 'text-red-600' : 'text-green-600'">{{ formatCurrency(wallet && wallet.balance) }}</div>
        </div>

        <div class="w-1/3 text-start">
          <div class="text-sm text-gray-500">{{ $t('labels.totalDeposits') }}</div>
          <div class="text-2xl font-semibold text-blue-600">{{ formatCurrency(wallet && wallet.totalDeposits) }}</div>
        </div>

        <div class="w-1/3 text-start flex items-center justify-start">
          <button @click="openDepositModal" class="px-3 py-1 bg-indigo-600 text-white rounded text-sm">{{ $t('labels.manualDeposit') }}</button>
          <button @click="openAdvanceModal" class="ml-2 px-3 py-1 border rounded text-sm">{{ $t('labels.advancePayment') || 'Advance/Payment' }}</button>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <div class="text-sm text-gray-500 mb-1">{{ $t('labels.breakdown') }}</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div v-for="(v, k) in (wallet && wallet.sources) || {}" :key="k" class="p-2 bg-gray-50 rounded">
          <div class="text-xs text-gray-500">{{ $t('labels.' + k) || k }}</div>
          <div class="font-semibold">{{ formatCurrency(v) }}</div>
        </div>
      </div>
    </div>

    <!-- <div class="grid md:grid-cols-2 gap-4"> -->
      <div>
        <h4 class="font-semibold mb-2">{{ $t('labels.history') }}</h4>
        <div v-if="loadingHistory" class="text-gray-500">{{ $t('labels.loading') }}</div>
        <div v-else class="overflow-auto max-h-64 border rounded bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th :class="['px-2 py-1', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.date') }}</th>
                <th :class="['px-2 py-1', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.type') }}</th>
                <th :class="['px-2 py-1', isRTL ? 'text-left' : 'text-right']">{{ $t('labels.signedAmount') || $t('labels.amount') }}</th>
                <th :class="['px-2 py-1', isRTL ? 'text-left' : 'text-right']">{{ $t('labels.balanceAfter') || 'Balance After' }}</th>
                <th :class="['px-2 py-1', isRTL ? 'text-left' : 'text-right']">{{ $t('labels.description') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in history" :key="entry.id" class="border-t">
                <td :class="['px-2 py-2', isRTL ? 'text-right' : 'text-left']">{{ formatDate(entry.createdAt || entry.date || entry.paidAt) }}</td>
                <td :class="['px-2 py-2', isRTL ? 'text-right' : 'text-left']">{{ (entry.type || entry.flow || entry.source || '').toString().toUpperCase() }}</td>
                <td :class="['px-2 py-2', isRTL ? 'text-left' : 'text-right']">{{ formatCurrency(entry.signedAmount ?? entry.amount) }}</td>
                <td :class="['px-2 py-2', isRTL ? 'text-left' : 'text-right']">{{ formatCurrency(entry.balanceAfter) }}</td>
                <td :class="['px-2 py-2', isRTL ? 'text-left' : 'text-right']">{{ entry.description || '-' }}</td>
              </tr>
              <tr v-if="!history || history.length === 0">
                <td colspan="5" class="p-4 text-center text-gray-500">{{ $t('payments.noPayments') || $t('contractors.noTransactions') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- <div>
        <h4 class="font-semibold mb-2">{{ $t('labels.manualDeposit') }}</h4>
        <div class="p-4 bg-gray-50 rounded text-sm text-gray-600">{{ $t('labels.manualDepositDesc') || '' }}</div>
      </div> -->
    <!-- </div> -->

    <!-- Advance Payment Modal -->
    <div v-if="advanceModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ $t('labels.advancePayment') || 'Advance / Payment' }}</h3>
          <button @click="closeAdvanceModal" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div class="grid gap-3">
          <label>
            <div class="text-sm mb-1">{{ $t('labels.amount') }}</div>
            <input v-model="advance.amount" type="number" step="0.01" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.description') }}</div>
            <input v-model="advance.description" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.date') }}</div>
            <input v-model="advance.date" type="datetime-local" class="w-full px-3 py-2 border rounded" />
          </label>
          <div v-if="advanceError" class="text-red-600">{{ advanceError }}</div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="closeAdvanceModal" class="px-3 py-1 border rounded text-gray-700">{{ $t('labels.cancel') }}</button>
          <button @click="submitAdvance" :disabled="advanceSubmitting" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{{ advanceSubmitting ? $t('labels.saving') : ($t('labels.applyAdvance') || 'Apply Advance') }}</button>
        </div>
      </div>
    </div>

    <!-- Manual Deposit Modal -->
    <div v-if="depositModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ $t('labels.manualDeposit') }}</h3>
          <button @click="closeDepositModal" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div class="grid gap-3">
          <label>
            <div class="text-sm mb-1">{{ $t('labels.amount') }}</div>
            <input v-model="deposit.amount" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.description') }}</div>
            <input v-model="deposit.description" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.date') }}</div>
            <input v-model="deposit.date" type="datetime-local" class="w-full px-3 py-2 border rounded" />
          </label>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="closeDepositModal" class="px-3 py-1 border rounded text-gray-700">{{ $t('labels.cancel') }}</button>
          <button @click="confirmDeposit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{{ $t('labels.deposit') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getContractorWallet, getContractorWalletHistory, depositToContractorWallet, advanceContractorWallet } from '@/api'

export default {
  name: 'WalletPanel',
  props: { contractorId: { type: [String, Number], required: true }, showFor: { type: [String, Array], default: null } },
  setup(props) {
    const { locale, t } = useI18n()
    const isVisible = computed(() => {
      if (!props.showFor) return true
      const current = String(locale.value || '').split('-')[0]
      if (Array.isArray(props.showFor)) return props.showFor.includes(current) || props.showFor.includes(locale.value)
      return String(props.showFor) === current || String(props.showFor) === locale.value
    })
    const isRTL = computed(() => {
      const v = String(locale.value || '')
      return v.startsWith('ar') || v === 'ar'
    })
    const wallet = ref(null)
    const history = ref([])
    const loading = ref(false)
    const loadingHistory = ref(false)
    const deposit = ref({ amount: '', description: '', date: '' })
    const depositModalOpen = ref(false)
    // Advance payment state
    const advance = ref({ amount: '', description: '', date: '' })
    const advanceModalOpen = ref(false)
    const advanceSubmitting = ref(false)
    const advanceError = ref('')

    const loadSummary = async () => {
      if (!props.contractorId) return
      loading.value = true
      try {
        const res = await getContractorWallet(props.contractorId)
        wallet.value = res?.data || null
      } catch (e) {
        console.error('Failed to load wallet summary', e)
      } finally { loading.value = false }
    }

    const loadHistory = async () => {
      if (!props.contractorId) return
      loadingHistory.value = true
      try {
        const res = await getContractorWalletHistory(props.contractorId)
        history.value = res?.data?.entries || res?.data || []
      } catch (e) {
        console.error('Failed to load wallet history', e)
      } finally { loadingHistory.value = false }
    }

    const getLocalDateTime = () => {
      const d = new Date()
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      return d.toISOString().slice(0,16)
    }

    const doDeposit = async () => {
      const amount = Number(deposit.value.amount || 0)
      if (!amount || amount <= 0) {
        if (window.$toast) window.$toast('Enter a valid amount', 'warning')
        return
      }
      try {
        const payload = { amount, description: deposit.value.description || undefined, date: deposit.value.date || undefined }
        const res = await depositToContractorWallet(props.contractorId, payload)
        if (res?.data) {
          wallet.value = res.data
        }
        await loadHistory()
        if (window.$toast) window.$toast('Deposit successful', 'success')
        window.dispatchEvent(new CustomEvent('contractor:wallet-updated', { detail: { contractorId: props.contractorId } }))
        deposit.value = { amount: '', description: '', date: '' }
      } catch (e) {
        console.error('Deposit failed', e)
        if (window.$toast) window.$toast('Deposit failed', 'error')
      }
    }

    const clearDeposit = () => { deposit.value = { amount: '', description: '', date: '' } }
    const openDepositModal = () => { deposit.value.date = getLocalDateTime(); depositModalOpen.value = true }
    const closeDepositModal = () => { depositModalOpen.value = false }
    const confirmDeposit = async () => { await doDeposit(); closeDepositModal() }

    const openAdvanceModal = () => { advance.value.date = getLocalDateTime(); advanceModalOpen.value = true }
    const closeAdvanceModal = () => { advanceModalOpen.value = false; advanceError.value = ''; advanceSubmitting.value = false }

    const submitAdvance = async () => {
      advanceError.value = ''
      const amt = Number(advance.value.amount || 0)
      if (!amt || Number.isNaN(amt)) {
        advanceError.value = (typeof t === 'function' ? t('payments.invalidAmount') : null) || 'Amount must be non-zero'
        return
      }

      // If negative (withdrawal), confirm with user
      if (amt < 0) {
        const ok = window.confirm((typeof t === 'function' ? t('payments.confirmWithdrawal') : null) || 'This will reduce contractor balance. Continue?')
        if (!ok) return
      }

      advanceSubmitting.value = true
      try {
        const payload = { amount: amt, description: advance.value.description || undefined, date: advance.value.date || undefined }
        const res = await advanceContractorWallet(props.contractorId, payload)
        if (res && res.data) {
          wallet.value = res.data
        }
        await loadHistory()
        window.dispatchEvent(new CustomEvent('contractor:wallet-updated', { detail: { contractorId: props.contractorId } }))
        advance.value = { amount: '', description: '', date: '' }
        closeAdvanceModal()
      } catch (e) {
        console.error('Advance failed', e)
        advanceError.value = e?.response?.data?.message || e?.message || 'Failed to record advance'
      } finally {
        advanceSubmitting.value = false
      }
    }

    const onExternalUpdate = (e) => {
      const id = e?.detail?.contractorId
      if (!id || String(id) === String(props.contractorId)) {
        loadSummary()
        loadHistory()
      }
    }

    onMounted(() => {
      loadSummary()
      loadHistory()
      window.addEventListener('contractor:wallet-updated', onExternalUpdate)
    })

    watch(() => props.contractorId, () => {
      loadSummary(); loadHistory()
    })

    const formatDate = (d) => {
      if (!d) return ''
      const dt = new Date(d)
      return dt.toLocaleString()
    }

    const formatCurrency = (v) => {
      if (v === undefined || v === null) return '-'
      return Number(v).toLocaleString()
    }

    return { wallet, history, loading, loadingHistory, deposit, loadSummary, loadHistory, doDeposit, clearDeposit, formatCurrency, formatDate, depositModalOpen, openDepositModal, closeDepositModal, confirmDeposit, isVisible, isRTL,
      // advance
      advance, advanceModalOpen, openAdvanceModal, closeAdvanceModal, submitAdvance, advanceSubmitting, advanceError }
  }
}
</script>

<style scoped>
</style>

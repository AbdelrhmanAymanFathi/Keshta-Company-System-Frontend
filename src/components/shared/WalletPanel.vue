<template>
  <div v-if="isVisible" :dir="isRTL ? 'rtl' : 'ltr'" class="bg-white rounded shadow p-3 sm:p-4">
    <div class="mb-4">
      <div v-if="wallet && Array.isArray(wallet.accounts)" class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <div v-for="acct in wallet.accounts" :key="acct.id" @click="selectAccount(acct)" :class="['p-2 sm:p-3 rounded cursor-pointer', selectedAccount && String(selectedAccount.id) === String(acct.id) ? 'theme-ring-active' : 'bg-gray-50']">
          <div class="text-xs theme-text-muted">{{ acct.accountType }}</div>
          <div class="font-semibold text-lg">{{ formatCurrency(acct.balance) }}</div>
        </div>
      </div>

      <div class="flex items-center">
        <div class="mr-4">
          <div class="text-sm theme-text-muted">{{ $t('labels.balance') }}</div>
          <div class="text-2xl font-semibold" :class="(displayBalance) < 0 ? 'text-red-600' : 'text-green-600'">{{ formatCurrency(displayBalance) }}</div>
        </div>
        <div class="mr-6">
          <div class="text-sm theme-text-muted">{{ $t('labels.totalDeposits') }}</div>
          <div class="text-2xl font-semibold theme-text">{{ formatCurrency(wallet && wallet.totalDeposits) }}</div>
        </div>
        <div class="ml-auto flex items-center gap-2 px-2">
          <button @click="openDepositModal" class="px-2 py-1 sm:px-3 sm:py-1 theme-button rounded text-xs sm:text-sm">{{ $t('labels.manualDeposit') }}</button>
          <button @click="openWithdrawModal" class="px-2 py-1 sm:px-3 sm:py-1 border rounded text-xs sm:text-sm">{{ $t('labels.pay') || 'Pay' }}</button>
        </div>
      </div>
    </div>

    <!-- <div class="mb-4">
      <div class="text-sm theme-text-muted mb-1">{{ $t('labels.breakdown') }}</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div v-for="(v, k) in (wallet && wallet.sources) || {}" :key="k" class="p-2 bg-gray-50 rounded">
          <div class="text-xs theme-text-muted">{{ $t('labels.' + k) || k }}</div>
          <div class="font-semibold">{{ formatCurrency(v) }}</div>
        </div>
      </div>
    </div> -->

    <!-- <div class="grid md:grid-cols-2 gap-4"> -->
      <div>
        <h4 class="font-semibold mb-2">{{ $t('labels.history') }}</h4>
        <div v-if="loadingHistory" class="theme-text-muted">{{ $t('labels.loading') }}</div>
        <div v-else class="overflow-auto max-h-64 border rounded bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
                  <tr>
                    <th :class="['px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-2 whitespace-normal', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.date') }}</th>
                    <th :class="['px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-2 whitespace-normal', isRTL ? 'text-right' : 'text-left']">{{ $t('labels.type') }}</th>
                    <th :class="['px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-2 whitespace-normal', isRTL ? 'text-left' : 'text-right']">{{ $t('labels.signedAmount') || $t('labels.amount') }}</th>
                    <th :class="['px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-2 whitespace-normal', isRTL ? 'text-left' : 'text-right']">{{ $t('labels.balanceAfter') || 'Balance After' }}</th>
                    <th :class="['px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-2 whitespace-normal', isRTL ? 'text-left' : 'text-right']">{{ $t('labels.description') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in history" :key="entry.id" class="border-t">
                    <td :class="['px-2 py-2 text-sm sm:px-3 sm:py-2', isRTL ? 'text-right' : 'text-left']">{{ formatDate(entry.createdAt || entry.date || entry.paidAt) }}</td>
                    <td :class="['px-2 py-2 text-sm sm:px-3 sm:py-2', isRTL ? 'text-right' : 'text-left']">{{ (entry.type || entry.flow || entry.source || '').toString().toUpperCase() }}</td>
                    <td :class="['px-2 py-2 text-sm sm:px-3 sm:py-2', isRTL ? 'text-left' : 'text-right']">{{ formatCurrency(entry.signedAmount ?? entry.amount) }}</td>
                    <td :class="['px-2 py-2 text-sm sm:px-3 sm:py-2', isRTL ? 'text-left' : 'text-right']">{{ formatCurrency(entry.balanceAfter) }}</td>
                    <td :class="['px-2 py-2 text-sm sm:px-3 sm:py-2', isRTL ? 'text-left' : 'text-right']">{{ entry.description || '-' }}</td>
                  </tr>
              <tr v-if="!history || history.length === 0">
                <td colspan="5" class="p-4 text-center theme-text-muted">{{ $t('payments.noPayments') || $t('contractors.noTransactions') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- <div>
        <h4 class="font-semibold mb-2">{{ $t('labels.manualDeposit') }}</h4>
        <div class="p-4 bg-gray-50 rounded text-sm theme-text-secondary">{{ $t('labels.manualDepositDesc') || '' }}</div>
      </div> -->
    <!-- </div> -->

    <!-- Withdraw Modal -->
    <div v-if="withdrawModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-full sm:max-w-md p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ $t('labels.withdraw') || 'Withdraw' }}</h3>
          <button @click="closeWithdrawModal" class="theme-caption hover:theme-text-secondary">✕</button>
        </div>
        <div class="grid gap-3">
          <label>
            <div class="text-sm mb-1">{{ $t('labels.amount') }}</div>
            <input v-model="withdrawal.amount" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.description') }}</div>
            <input v-model="withdrawal.description" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.date') }}</div>
            <DateTimeField v-model="withdrawal.date" class="w-full px-3 py-2 border rounded" />
          </label>
          <div v-if="withdrawalError" class="text-red-600">{{ withdrawalError }}</div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="closeWithdrawModal" class="px-3 py-1 border rounded theme-text-secondary text-xs sm:text-sm">{{ $t('labels.cancel') }}</button>
          <button @click="submitWithdrawal" :disabled="withdrawalSubmitting" class="px-3 py-1.5 sm:px-4 sm:py-2 theme-button rounded text-xs sm:text-sm">{{ withdrawalSubmitting ? $t('labels.saving') : ($t('labels.pay') || 'Pay') }}</button>
        </div>
      </div>
    </div>

    <!-- Manual Deposit Modal -->
    <div v-if="depositModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-full sm:max-w-md p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ $t('labels.manualDeposit') }}</h3>
          <button @click="closeDepositModal" class="theme-caption hover:theme-text-secondary">✕</button>
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
            <DateTimeField v-model="deposit.date" class="w-full px-3 py-2 border rounded" />
          </label>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="closeDepositModal" class="px-3 py-1 border rounded theme-text-secondary text-xs sm:text-sm">{{ $t('labels.cancel') }}</button>
          <button @click="confirmDeposit" class="px-3 py-1.5 sm:px-4 sm:py-2 theme-button rounded text-xs sm:text-sm">{{ $t('labels.deposit') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DateTimeField from '@/components/shared/DateTimeField.vue'
import { getContractorWallet, getContractorWalletHistory, depositToContractorWallet, withdrawFromContractorWallet, getAccountTransactions, getContractorAccounts, normalizeContractorAccountType } from '@/api'

export default {
  name: 'WalletPanel',
  components: { DateTimeField },
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
    const selectedAccount = ref(null)
    const depositModalOpen = ref(false)
    const withdrawal = ref({ amount: '', description: '', date: '' })
    const withdrawModalOpen = ref(false)
    const withdrawalSubmitting = ref(false)
    const withdrawalError = ref('')
    const selectedAccountType = computed(() => normalizeContractorAccountType(selectedAccount.value?.accountType))

    const loadSummary = async () => {
      if (!props.contractorId) return
      loading.value = true
      try {
        const res = await getContractorWallet(props.contractorId)
        wallet.value = res?.data || null
        // If rental billing feature is enabled, try to fetch accounts and ensure RENTAL account is visible
        const rentalBillingEnabled = (window.__APP_CONFIG__ && window.__APP_CONFIG__.RENTAL_BILLING_ENABLED) || (process.env && process.env.VUE_APP_RENTAL_BILLING_ENABLED === 'true')
        if (rentalBillingEnabled) {
          try {
            const accRes = await getContractorAccounts(props.contractorId)
            const accounts = accRes?.data || []
            // normalize accounts array
            const acctArr = Array.isArray(accounts) ? accounts : (accounts.accounts || (accounts.data || []))
            if (acctArr && acctArr.length > 0) {
              wallet.value = wallet.value || {}
              wallet.value.accounts = acctArr
            }
          } catch (e) {
            // ignore account fetch failures and keep fallback wallet
          }
        }
        // if accounts available, pick first as selected by default
        if (wallet.value && Array.isArray(wallet.value.accounts) && wallet.value.accounts.length > 0) {
          selectedAccount.value = wallet.value.accounts[0]
        } else {
          selectedAccount.value = null
        }
      } catch (e) {
        console.error('Failed to load wallet summary', e)
      } finally { loading.value = false }
    }

    const loadHistory = async () => {
      // If an account is selected, fetch account transactions; otherwise fetch contractor-wide history
      if (!props.contractorId && !selectedAccount.value) return
      loadingHistory.value = true
      try {
        if (selectedAccount.value && selectedAccount.value.id) {
          // lazy-load account transactions
          const res = await getAccountTransactions(selectedAccount.value.id, { pageSize: 50 })
          const data = res?.data || {}
          history.value = data.items || data || []
        } else {
          const res = await getContractorWalletHistory(props.contractorId)
          history.value = res?.data?.entries || res?.data || []
        }
      } catch (e) {
        console.error('Failed to load wallet history', e)
      } finally { loadingHistory.value = false }
    }

    const getLocalDate = () => {
      const d = new Date()
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      return d.toISOString().slice(0, 16)
    }

    const doDeposit = async () => {
      const amount = Number(deposit.value.amount || 0)
      if (!amount || amount <= 0) {
        if (window.$toast) window.$toast('Enter a valid amount', 'warning')
        return false
      }
      try {
        const payload = {
          amount,
          description: deposit.value.description || undefined,
          date: deposit.value.date || undefined,
          accountId: selectedAccount.value?.id || undefined,
          accountType: selectedAccountType.value
        }
        const res = await depositToContractorWallet(props.contractorId, payload)
        if (!res) throw new Error('No response from deposit request')
        if (res?.data) {
          wallet.value = res.data
        }
        await loadHistory()
        if (window.$toast) window.$toast('Deposit successful', 'success')
        window.dispatchEvent(new CustomEvent('contractor:wallet-updated', { detail: { contractorId: props.contractorId } }))
        deposit.value = { amount: '', description: '', date: '' }
        return true
      } catch (e) {
        console.error('Deposit failed', e)
        if (window.$toast) window.$toast('Deposit failed', 'error')
        return false
      }
    }

    const clearDeposit = () => { deposit.value = { amount: '', description: '', date: '' } }
    const openDepositModal = () => { deposit.value.date = getLocalDate(); depositModalOpen.value = true }
    const closeDepositModal = () => { depositModalOpen.value = false }
    const confirmDeposit = async () => {
      const ok = await doDeposit()
      if (ok) closeDepositModal()
    }

    const openWithdrawModal = () => { withdrawal.value.date = getLocalDate(); withdrawModalOpen.value = true }
    const closeWithdrawModal = () => { withdrawModalOpen.value = false; withdrawalError.value = ''; withdrawalSubmitting.value = false }

    const submitWithdrawal = async () => {
      withdrawalError.value = ''
      const amount = Math.abs(Number(withdrawal.value.amount || 0))
      if (!amount || Number.isNaN(amount)) {
        withdrawalError.value = (typeof t === 'function' ? t('payments.invalidAmount') : null) || 'Amount must be greater than zero'
        return
      }

      withdrawalSubmitting.value = true
      try {
        const payload = {
          amount,
          description: withdrawal.value.description || undefined,
          date: withdrawal.value.date || undefined,
          accountId: selectedAccount.value?.id || undefined,
          accountType: selectedAccountType.value
        }
        const res = await withdrawFromContractorWallet(props.contractorId, payload)
        if (res && res.data) {
          wallet.value = res.data
        }
        await loadHistory()
        window.dispatchEvent(new CustomEvent('contractor:wallet-updated', { detail: { contractorId: props.contractorId } }))
        withdrawal.value = { amount: '', description: '', date: '' }
        closeWithdrawModal()
      } catch (e) {
        console.error('Withdrawal failed', e)
        withdrawalError.value = e?.response?.data?.message || e?.message || 'Failed to withdraw'
      } finally {
        withdrawalSubmitting.value = false
      }
    }

    const selectAccount = (acct) => {
      selectedAccount.value = acct
      loadHistory()
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

    const displayBalance = computed(() => {
      if (!wallet.value) return 0
      if (selectedAccount.value && selectedAccount.value.balance !== undefined) return Number(selectedAccount.value.balance)
      if (Array.isArray(wallet.value.accounts)) return wallet.value.accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)
      return Number(wallet.value.balance || 0)
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
      withdrawal, withdrawModalOpen, openWithdrawModal, closeWithdrawModal, submitWithdrawal, withdrawalSubmitting, withdrawalError,
      selectedAccount, selectedAccountType, selectAccount, displayBalance }
  }
}
</script>

<style scoped>
</style>

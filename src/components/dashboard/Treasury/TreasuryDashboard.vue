<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="flex flex-col gap-6 lg:flex-row">
    <aside class="h-fit w-full rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm theme-surface lg:sticky lg:top-4 lg:w-80">
      <div class="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 class="text-lg font-semibold theme-heading theme-text-primary">{{ t('dashboard.treasury') }}</h2>
          <p class="text-xs theme-text-secondary">{{ visibleTreasuries.length }} {{ t('treasury.items') }}</p>
        </div>
        <button class="rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm transition theme-button" @click="openCreateModal">+ {{ t('treasury.add') }}</button>
      </div>

      <div class="mt-4 space-y-3 border-b border-gray-100 pb-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.search') }}</label>
          <input v-model="treasurySearch" type="text" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus" :placeholder="t('treasury.searchTreasuriesPlaceholder')" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.view') }}</label>
          <select v-model="treasuryView" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus">
            <option value="active">{{ t('treasury.viewActive') }}</option>
            <option value="archived">{{ t('treasury.viewArchived') }}</option>
            <option value="all">{{ t('treasury.viewAll') }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <div v-for="(treasury, index) in visibleTreasuries" :key="treasury.id" :draggable="isAdmin && treasuryView === 'active'" @dragstart="onDragStart(index, $event)" @dragover.prevent @drop.prevent="onDrop(index, $event)" @dragend="onDragEnd">
          <button @click="selectTreasury(treasury.id)" :class="['flex w-full items-center justify-between rounded-xl border px-3 py-2.5 transition', selectedId === treasury.id ? 'border-transparent bg-indigo-50/80 ring-1 ring-indigo-200/70' : 'border-gray-200 bg-white/70 hover:theme-hover-soft']">
            <span v-if="isAdmin && treasuryView === 'active'" class="cursor-grab text-gray-400">⋮⋮</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-sm font-medium theme-text-primary">{{ treasury.name }}</p>
                <span class="text-xs font-semibold" :class="Number(treasury.balance) < 0 ? 'text-red-600' : 'text-emerald-700'">{{ formatCurrency(treasury.balance) }}</span>
              </div>
              <div class="mt-1 flex items-center gap-2 text-[11px] theme-text-secondary">
                <span>#{{ index + 1 }}</span>
                <span v-if="treasury.deletedAt" class="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{{ t('treasury.archived') }}</span>
                <span v-else class="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">{{ t('treasury.active') }}</span>
              </div>
            </div>
            <div class="shrink-0">
              <button v-if="isAdmin && !treasury.deletedAt" class="rounded-md px-2 py-1 text-xs theme-text-secondary transition hover:bg-gray-100" @click.stop="openEditModal(treasury)">{{ t('treasury.edit') }}</button>
            </div>
          </button>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button class="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium theme-text-secondary transition hover:theme-hover-soft" @click="reloadTreasuries">{{ t('treasury.refresh') }}</button>
      </div>
    </aside>

    <div class="min-w-0 flex-1 space-y-6">
      <div class="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm theme-surface">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <h1 class="text-xl font-semibold theme-heading theme-text-primary sm:text-2xl">
              {{ selectedTreasury?.name || t('dashboard.treasury') }}
            </h1>
            <p class="mt-1 text-sm theme-text-secondary">{{ t('treasury.detailsHint') }}</p>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <span
              v-if="selectedTreasury"
              class="inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold sm:px-4"
              :class="selectedTreasury.deletedAt ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
            >
              {{ selectedTreasury.deletedAt ? t('treasury.archived') : t('treasury.active') }}
            </span>
            <button
              v-if="isAdmin && selectedTreasury && !selectedTreasury.deletedAt"
              class="w-full rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition theme-button sm:w-auto"
              :disabled="!selectedTreasury"
              @click="openDepositModal"
            >
              {{ t('treasury.addMoney') }}
            </button>
            <button
              v-if="isAdmin && selectedTreasury && !selectedTreasury.deletedAt"
              class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium theme-text-secondary transition hover:theme-hover-soft sm:w-auto"
              :disabled="!selectedTreasury"
              @click="openEditModal(selectedTreasury)"
            >
              {{ t('treasury.edit') }}
            </button>
            <button
              v-if="isAdmin && selectedTreasury && !selectedTreasury.deletedAt"
              class="w-full rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 sm:w-auto"
              :disabled="!selectedTreasury"
              @click="archiveSelectedTreasury"
            >
              {{ t('treasury.archive') }}
            </button>
            <button
              v-if="isAdmin && selectedTreasury && selectedTreasury.deletedAt"
              class="w-full rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 sm:w-auto"
              :disabled="!selectedTreasury"
              @click="restoreSelectedTreasury"
            >
              {{ t('treasury.unarchive') }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div class="rounded-2xl border border-gray-100 p-4 shadow-sm theme-surface">
          <p class="text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.balance') }}</p>
          <p
            class="mt-2 text-3xl font-semibold"
            :class="Number(store.summary.balance) < 0 ? 'text-red-600' : 'text-indigo-700'"
          >
            {{ formatCurrency(store.summary.balance) }}
          </p>
        </div>
        <div class="rounded-2xl border border-gray-100 p-4 shadow-sm theme-surface">
          <p class="text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.last30dIn') }}</p>
          <p class="mt-2 text-3xl font-semibold text-emerald-700">{{ formatCurrency(store.summary.last30dIn) }}</p>
        </div>
        <div class="rounded-2xl border border-gray-100 p-4 shadow-sm theme-surface">
          <p class="text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.last30dOut') }}</p>
          <p class="mt-2 text-3xl font-semibold text-red-700">{{ formatCurrency(store.summary.last30dOut) }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-100 bg-white/80 shadow-lg shadow-slate-200/50 theme-surface">
        <div class="border-b border-gray-100 px-3 py-3 sm:px-4">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <p class="text-sm font-semibold theme-text-primary">{{ t('treasury.ledgerTitle') }}</p>
              <p class="text-xs theme-text-secondary">{{ t('treasury.filtersHint') }}</p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div class="sm:col-span-2 xl:col-span-1">
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.dateFrom') }}</label>
                <DateField v-model="filters.startDate" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
              </div>
              <div class="sm:col-span-2 xl:col-span-1">
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.dateTo') }}</label>
                <DateField v-model="filters.endDate" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
              </div>
              <div class="sm:col-span-2 xl:col-span-1">
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.type') }}</label>
                <select v-model="filters.type" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none theme-input-focus">
                  <option value="">{{ t('labels.all') }}</option>
                  <option value="DEPOSIT">{{ t('treasury.types.deposit') }}</option>
                  <option value="PAYMENT">{{ t('treasury.types.payment') }}</option>
                  <option value="WITHDRAW">{{ t('treasury.types.withdraw') }}</option>
                  <option value="ADJUSTMENT">{{ t('treasury.types.adjustment') }}</option>
                </select>
              </div>
              <div class="sm:col-span-1 xl:col-span-1">
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.amountFrom') }}</label>
                <input v-model="filters.amountMin" type="number" step="0.01" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
              </div>
              <div class="sm:col-span-1 xl:col-span-1">
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.amountTo') }}</label>
                <input v-model="filters.amountMax" type="number" step="0.01" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none theme-input-focus" />
              </div>
            </div>

            <div class="flex flex-col gap-3 md:flex-row md:items-end">
              <div class="flex-1">
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide theme-text-secondary">{{ t('treasury.search') }}</label>
                <input
                  v-model="filters.search"
                  type="text"
                  class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none theme-input-focus"
                  :placeholder="t('treasury.searchPlaceholder')"
                />
              </div>
              <div class="flex flex-col gap-2 sm:flex-row md:shrink-0">
                <button class="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 sm:w-auto" @click="applyFilters">
                  {{ t('labels.search') }}
                </button>
                <button class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium theme-text-secondary transition hover:theme-hover-soft sm:w-auto" @click="resetFilters">
                  {{ t('labels.reset') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="px-6 py-12 text-center text-sm theme-text-secondary">{{ t('labels.loading') }}</div>
        <div v-else-if="error" class="px-6 py-12 text-center text-sm text-red-600">{{ error }}</div>
        <div v-else-if="!visibleTransactions.length" class="px-6 py-12 text-center text-sm theme-text-secondary">{{ t('treasury.noTransactions') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-slate-50/80">
              <tr>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.date') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.type') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider theme-text-secondary', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.description') }}</th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-secondary">{{ t('treasury.amount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/70">
              <tr v-for="tx in visibleTransactions" :key="tx.id" class="transition hover:theme-hover-soft">
                <td class="px-4 py-3 text-sm theme-text-primary">{{ formatDate(tx.date) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="badgeClass(tx.type)">
                    {{ txTypeLabel(tx.type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm theme-text-primary">{{ tx.description || tx.refType || '-' }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold" :class="Number(tx.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  {{ formatCurrency(tx.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="border-t border-gray-100 p-4">
          <Pagination
            :currentPage="store.transactions.page"
            :pageSize="store.transactions.pageSize"
            :total="store.transactions.total"
            :totalPages="totalPages"
            :pageSizeOptions="[10, 20, 50]"
            @update:page="onUpdatePage"
            @update:pageSize="onUpdatePageSize"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeModal">
    <div class="w-full max-w-md rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-sm">
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 class="text-lg font-semibold theme-text-primary">{{ modalMode === 'create' ? t('treasury.create') : t('treasury.edit') }}</h3>
        <button class="theme-caption transition hover:theme-text-secondary" @click="closeModal">×</button>
      </div>
      <form class="mt-4 space-y-4" @submit.prevent="saveTreasury">
        <div>
          <label class="mb-1 block text-sm font-medium theme-text-secondary">{{ t('treasury.name') }}</label>
          <input v-model="form.name" type="text" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium theme-text-secondary transition hover:theme-hover-soft" @click="closeModal">{{ t('labels.cancel') }}</button>
          <button type="submit" class="rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition theme-button">{{ t('labels.save') }}</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="showDeposit" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeDepositModal">
    <div class="w-full max-w-md rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-sm">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-semibold theme-text-primary">{{ t('treasury.addMoney') }}</h3>
      </div>
      <form class="mt-4 space-y-4" @submit.prevent="saveDeposit">
        <div>
          <label class="mb-1 block text-sm font-medium theme-text-secondary">{{ t('treasury.amount') }}</label>
          <input v-model.number="depositForm.amount" type="number" min="0.01" step="0.01" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium theme-text-secondary">{{ t('treasury.description') }}</label>
          <input v-model="depositForm.description" type="text" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium theme-text-secondary">{{ t('treasury.date') }}</label>
          <DateField v-model="depositForm.date" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium theme-text-secondary transition hover:theme-hover-soft" @click="closeDepositModal">{{ t('labels.cancel') }}</button>
          <button type="submit" class="rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition theme-button">{{ t('treasury.add') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useTreasuryStore } from '@/stores/useTreasuryStore'
import DateField from '@/components/shared/DateField.vue'
import Pagination from '@/components/shared/Pagination.vue'

export default {
  name: 'TreasuryDashboard',
  emits: ['navigateReport', 'navigateStatement'],
  components: { DateField, Pagination },
  setup() {
    const { t, locale } = useI18n()
    const { user } = useAuth()
    const store = useTreasuryStore()

    const isRTL = computed(() => locale.value?.toString().startsWith('ar'))
    const isAdmin = computed(() => {
      const roles = user.value?.roles || []
      return roles.some(role => role.roleId === 1)
    })

    const loading = computed(() => store.loading)
    const error = computed(() => store.error)
    const selectedTreasury = computed(() => store.activeTreasury)
    const selectedId = computed(() => store.selectedTreasuryId)
    const totalPages = computed(() => store.totalPages)
    const visibleTransactions = computed(() => store.transactions.items || [])
    const showModal = ref(false)
    const showDeposit = ref(false)
    const modalMode = ref('create')
    const form = reactive({ id: null, name: ''}) //, pinned: false })
    const depositForm = reactive({ amount: 0, description: '', date: '' })
    const dragIndex = ref(null)
    const treasurySearch = ref('')
    const treasuryView = ref('active')
    const filters = reactive({ startDate: '', endDate: '', type: '', amountMin: '', amountMax: '', search: '' })

    const formatCurrency = (value) => new Intl.NumberFormat(locale.value || 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(Number(value || 0))
    const formatDate = (value) => value ? new Date(value).toLocaleDateString(locale.value || 'en-US') : '-'
    const txTypeLabel = (type) => {
      switch (String(type || '').toUpperCase()) {
        case 'DEPOSIT': return t('treasury.types.deposit')
        case 'PAYMENT': return t('treasury.types.payment')
        case 'WITHDRAW': return t('treasury.types.withdraw')
        case 'ADJUSTMENT': return t('treasury.types.adjustment')
        default: return String(type || '-')
      }
    }
    const badgeClass = (type) => {
      switch (String(type || '').toUpperCase()) {
        case 'DEPOSIT': return 'bg-emerald-100 text-emerald-700'
        case 'PAYMENT': return 'bg-red-100 text-red-700'
        case 'WITHDRAW': return 'bg-amber-100 text-amber-700'
        default: return 'bg-gray-100 text-gray-700'
      }
    }

    const showTreasuryError = (err, fallbackMessage = t('treasury.saveError') || 'Failed to save treasury') => {
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message
      const message = typeof serverMessage === 'string' && serverMessage.trim() ? serverMessage : fallbackMessage
      const conflictMessage = t('treasury.nameExists') || 'A treasury with this name already exists'

      if (err?.response?.status === 409 || err?.status === 409) {
        if (window.$toast) window.$toast(conflictMessage, 'error', 5000)
        return
      }

      if (window.$toast) window.$toast(message, 'error', 5000)
    }

    const normalizedSearch = computed(() => String(treasurySearch.value || '').trim().toLowerCase())
    const visibleTreasuries = computed(() => {
      const all = Array.isArray(store.treasuries) ? store.treasuries : []
      return all.filter((treasury) => {
        const isArchived = !!treasury.deletedAt
        if (treasuryView.value === 'active' && isArchived) return false
        if (treasuryView.value === 'archived' && !isArchived) return false
        if (normalizedSearch.value && !String(treasury.name || '').toLowerCase().includes(normalizedSearch.value)) return false
        return true
      })
    })
    const selectedTreasuryIsArchived = computed(() => !!selectedTreasury.value?.deletedAt)

    const loadTreasuries = async () => {
      try {
        const includeArchived = treasuryView.value !== 'active'
        await store.fetchTreasuries({ includeArchived })
        if (store.selectedTreasuryId) {
          await reloadSelected()
        }
      } catch (err) {
        console.error('[TreasuryDashboard] loadTreasuries error:', err)
      }
    }

    const selectTreasury = async (id) => {
      try {
        store.selectTreasury(id)
        await reloadSelected()
      } catch (err) {
        console.error('[TreasuryDashboard] selectTreasury error:', err)
      }
    }

    const reloadSelected = async () => {
      if (!store.selectedTreasuryId) return
      try {
        await store.fetchSummary(store.selectedTreasuryId)
        await store.fetchTransactions({
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          type: filters.type || undefined,
          amountMin: filters.amountMin !== '' ? filters.amountMin : undefined,
          amountMax: filters.amountMax !== '' ? filters.amountMax : undefined,
          search: filters.search || undefined,
        }, store.selectedTreasuryId)
      } catch (err) {
        console.error('[TreasuryDashboard] reloadSelected error:', err)
      }
    }

    const reloadTreasuries = async () => {
      await loadTreasuries()
    }

    const applyFilters = async () => {
      store.setTransactionPage(1)
      await reloadSelected()
    }

    const resetFilters = async () => {
      filters.startDate = ''
      filters.endDate = ''
      filters.type = ''
      filters.amountMin = ''
      filters.amountMax = ''
      filters.search = ''
      store.setTransactionPage(1)
      await reloadSelected()
    }

    const onUpdatePage = async (page) => {
      store.setTransactionPage(page)
      await reloadSelected()
    }

    const onUpdatePageSize = async (pageSize) => {
      store.setTransactionPageSize(pageSize)
      await reloadSelected()
    }

    const openCreateModal = () => {
      modalMode.value = 'create'
      form.id = null
      form.name = ''
      // form.pinned = false
      showModal.value = true
    }

    const openEditModal = (treasury) => {
      if (!isAdmin.value || !treasury) return
      modalMode.value = 'edit'
      form.id = treasury.id
      form.name = treasury.name || ''
      // form.pinned = !!treasury.pinned
      showModal.value = true
    }

    const closeModal = () => { showModal.value = false }

    const saveTreasury = async () => {
      try {
        const payload = { name: form.name } //, pinned: form.pinned }
        if (modalMode.value === 'create') await store.createTreasuryItem(payload)
        else await store.updateTreasuryItem(form.id, payload)
        showModal.value = false
        await loadTreasuries()
      } catch (err) {
        console.error('[TreasuryDashboard] saveTreasury error:', err)
        showTreasuryError(err)
      }
    }

    const openDepositModal = () => {
      if (!selectedTreasury.value || selectedTreasuryIsArchived.value) return
      depositForm.amount = 0
      depositForm.description = ''
      depositForm.date = new Date().toISOString().slice(0, 10)
      showDeposit.value = true
    }

    const closeDepositModal = () => { showDeposit.value = false }

    const saveDeposit = async () => {
      if (!store.selectedTreasuryId || selectedTreasuryIsArchived.value) return
      try {
        await store.deposit(depositForm.amount, depositForm.description, depositForm.date, store.selectedTreasuryId)
        showDeposit.value = false
        await reloadSelected()
        await loadTreasuries()
      } catch (err) {
        console.error('[TreasuryDashboard] saveDeposit error:', err)
      }
    }

    const archiveSelectedTreasury = async () => {
      if (!isAdmin.value || !store.selectedTreasuryId) return
      if (!window.confirm(t('treasury.archiveConfirm'))) return
      try {
        await store.archiveTreasuryItem(store.selectedTreasuryId)
        await loadTreasuries()
      } catch (err) {
        console.error('[TreasuryDashboard] archiveSelectedTreasury error:', err)
      }
    }

    const restoreSelectedTreasury = async () => {
      if (!isAdmin.value || !store.selectedTreasuryId) return
      if (!window.confirm(t('treasury.restoreConfirm'))) return
      try {
        await store.restoreTreasuryItem(store.selectedTreasuryId)
        await loadTreasuries()
      } catch (err) {
        console.error('[TreasuryDashboard] restoreSelectedTreasury error:', err)
      }
    }

    const onDragStart = (index, event) => {
      if (!isAdmin.value || treasuryView.value !== 'active') return
      dragIndex.value = index
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(index))
    }

    const onDrop = async (index, event) => {
      if (!isAdmin.value || treasuryView.value !== 'active') return
      const from = dragIndex.value != null ? dragIndex.value : Number(event.dataTransfer.getData('text/plain'))
      if (from === index || from == null) return onDragEnd()
      const item = store.treasuries.splice(from, 1)[0]
      store.treasuries.splice(index, 0, item)
      await store.saveOrder(store.treasuries.map((item, idx) => ({ id: item.id, order: idx }))) //, pinned: !!item.pinned })))
      onDragEnd()
    }

    const onDragEnd = () => { dragIndex.value = null }

    watch(treasuryView, async () => {
      await loadTreasuries()
    })

    watch(() => store.selectedTreasuryId, async (id) => {
      if (id) {
        try {
          await reloadSelected()
        } catch (err) {
          console.error('[TreasuryDashboard] watch selectedTreasuryId error:', err)
        }
      }
    })

    onMounted(async () => {
      try {
        store.restoreSelection()
        await loadTreasuries()
        if (!store.selectedTreasuryId && store.treasuries[0]) {
          store.selectTreasury(store.treasuries[0].id)
        }
        await reloadSelected()
      } catch (err) {
        console.error('[TreasuryDashboard] onMounted error:', err)
      }
    })

    return {
      store,
      treasuries: visibleTreasuries,
      visibleTreasuries,
      selectedTreasury,
      selectedId,
      loading,
      error,
      totalPages,
      filters,
      visibleTransactions,
      showModal,
      showDeposit,
      modalMode,
      form,
      depositForm,
      treasurySearch,
      treasuryView,
      isAdmin,
      formatCurrency,
      formatDate,
      badgeClass,
      selectTreasury,
      reloadTreasuries,
      applyFilters,
      resetFilters,
      onUpdatePage,
      onUpdatePageSize,
      openCreateModal,
      openEditModal,
      closeModal,
      saveTreasury,
      openDepositModal,
      closeDepositModal,
      saveDeposit,
      archiveSelectedTreasury,
      restoreSelectedTreasury,
      onDragStart,
      onDrop,
      onDragEnd,
      t,
      isRTL,
      txTypeLabel,
      selectedTreasuryIsArchived,
    }
  }
}
</script>

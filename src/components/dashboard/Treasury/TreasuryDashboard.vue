<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="flex gap-6">
    <aside class="sticky top-4 h-fit w-80 shrink-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.treasury') }}</h2>
          <p class="text-xs text-gray-500">{{ visibleTreasuries.length }} {{ t('treasury.items') }}</p>
        </div>
        <button
          v-if="isAdmin"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          @click="openCreateModal"
        >
          + {{ t('treasury.add') }}
        </button>
      </div>

      <div class="mt-4 space-y-3 border-b border-gray-200 pb-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.search') }}</label>
          <input
            v-model="treasurySearch"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            :placeholder="t('treasury.searchTreasuriesPlaceholder')"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.view') }}</label>
          <select v-model="treasuryView" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="active">{{ t('treasury.viewActive') }}</option>
            <option value="archived">{{ t('treasury.viewArchived') }}</option>
            <option value="all">{{ t('treasury.viewAll') }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <div
          v-for="(treasury, index) in visibleTreasuries"
          :key="treasury.id"
          class="group flex items-center gap-2 rounded-lg border px-3 py-2 transition"
          :class="selectedId === treasury.id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'"
          :draggable="isAdmin && treasuryView === 'active'"
          @click="selectTreasury(treasury.id)"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent
          @drop.prevent="onDrop(index, $event)"
          @dragend="onDragEnd"
        >
          <span v-if="isAdmin && treasuryView === 'active'" class="cursor-grab text-gray-400">⋮⋮</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-sm font-medium text-gray-900">{{ treasury.name }}</p>
              <span
                class="text-xs font-semibold"
                :class="Number(treasury.balance) < 0 ? 'text-red-600' : 'text-emerald-700'"
              >
                {{ formatCurrency(treasury.balance) }}
              </span>
            </div>
            <div class="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
              <span>#{{ index + 1 }}</span>
              <span v-if="treasury.deletedAt" class="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{{ t('treasury.archived') }}</span>
              <span v-else class="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">{{ t('treasury.active') }}</span>
            </div>
          </div>
          <button
            v-if="isAdmin && !treasury.deletedAt"
            class="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            @click.stop="openEditModal(treasury)"
          >
            {{ t('treasury.edit') }}
          </button>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50" @click="reloadTreasuries">
          {{ t('treasury.refresh') }}
        </button>
      </div>
    </aside>

    <div class="min-w-0 flex-1 space-y-6">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">
              {{ selectedTreasury?.name || t('dashboard.treasury') }}
            </h1>
            <p class="text-sm text-gray-500">{{ t('treasury.detailsHint') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-if="selectedTreasury"
              class="rounded-full px-4 py-3 text-xs font-semibold"
              :class="selectedTreasury.deletedAt ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
            >
              {{ selectedTreasury.deletedAt ? t('treasury.archived') : t('treasury.active') }}
            </span>
            <button
              v-if="isAdmin && selectedTreasury && !selectedTreasury.deletedAt"
              class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!selectedTreasury"
              @click="openDepositModal"
            >
              {{ t('treasury.addMoney') }}
            </button>
            <button
              v-if="isAdmin && selectedTreasury && !selectedTreasury.deletedAt"
              class="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              :disabled="!selectedTreasury"
              @click="openEditModal(selectedTreasury)"
            >
              {{ t('treasury.edit') }}
            </button>
            <button
              v-if="isAdmin && selectedTreasury && !selectedTreasury.deletedAt"
              class="rounded-md border border-amber-200 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
              :disabled="!selectedTreasury"
              @click="archiveSelectedTreasury"
            >
              {{ t('treasury.archive') }}
            </button>
            <button
              v-if="isAdmin && selectedTreasury && selectedTreasury.deletedAt"
              class="rounded-md border border-emerald-200 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
              :disabled="!selectedTreasury"
              @click="restoreSelectedTreasury"
            >
              {{ t('treasury.unarchive') }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.balance') }}</p>
          <p
            class="mt-2 text-3xl font-semibold"
            :class="Number(store.summary.balance) < 0 ? 'text-red-600' : 'text-indigo-700'"
          >
            {{ formatCurrency(store.summary.balance) }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.last30dIn') }}</p>
          <p class="mt-2 text-3xl font-semibold text-emerald-700">{{ formatCurrency(store.summary.last30dIn) }}</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.last30dOut') }}</p>
          <p class="mt-2 text-3xl font-semibold text-red-700">{{ formatCurrency(store.summary.last30dOut) }}</p>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 px-4 py-3">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <p class="text-sm font-semibold text-gray-900">{{ t('treasury.ledgerTitle') }}</p>
              <p class="text-xs text-gray-500">{{ t('treasury.filtersHint') }}</p>
            </div>

            <div class="grid gap-4 xl:grid-cols-5">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.dateFrom') }}</label>
                <DateField v-model="filters.startDate" class="w-full" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.dateTo') }}</label>
                <DateField v-model="filters.endDate" class="w-full" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.type') }}</label>
                <select v-model="filters.type" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="">{{ t('labels.all') }}</option>
                  <option value="DEPOSIT">{{ t('treasury.types.deposit') }}</option>
                  <option value="PAYMENT">{{ t('treasury.types.payment') }}</option>
                  <option value="WITHDRAW">{{ t('treasury.types.withdraw') }}</option>
                  <option value="ADJUSTMENT">{{ t('treasury.types.adjustment') }}</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.amountFrom') }}</label>
                <input v-model="filters.amountMin" type="number" step="0.01" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.amountTo') }}</label>
                <input v-model="filters.amountMax" type="number" step="0.01" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>

            <div class="grid gap-4 xl:grid-cols-[1fr_auto_auto]">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('treasury.search') }}</label>
                <input
                  v-model="filters.search"
                  type="text"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  :placeholder="t('treasury.searchPlaceholder')"
                />
              </div>
              <div class="flex items-end">
                <button class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" @click="applyFilters">
                  {{ t('labels.search') }}
                </button>
              </div>
              <div class="flex items-end">
                <button class="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" @click="resetFilters">
                  {{ t('labels.reset') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="px-6 py-12 text-center text-sm text-gray-500">{{ t('labels.loading') }}</div>
        <div v-else-if="error" class="px-6 py-12 text-center text-sm text-red-600">{{ error }}</div>
        <div v-else-if="!visibleTransactions.length" class="px-6 py-12 text-center text-sm text-gray-500">{{ t('treasury.noTransactions') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.date') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.type') }}</th>
                <th :class="['px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500', isRTL ? 'text-right' : 'text-left']">{{ t('treasury.description') }}</th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">{{ t('treasury.amount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="tx in visibleTransactions" :key="tx.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(tx.date) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="badgeClass(tx.type)">
                    {{ txTypeLabel(tx.type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ tx.description || tx.refType || '-' }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold" :class="Number(tx.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  {{ formatCurrency(tx.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="border-t border-gray-200 p-4">
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
    <div class="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
      <div class="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 class="text-lg font-semibold text-gray-900">{{ modalMode === 'create' ? t('treasury.create') : t('treasury.edit') }}</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="closeModal">×</button>
      </div>
      <form class="mt-4 space-y-4" @submit.prevent="saveTreasury">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">{{ t('treasury.name') }}</label>
          <input v-model="form.name" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <!-- <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="form.pinned" type="checkbox" />
          {{ t('treasury.pinned') }}
        </label> -->
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" @click="closeModal">{{ t('labels.cancel') }}</button>
          <button type="submit" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{{ t('labels.save') }}</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="showDeposit" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeDepositModal">
    <div class="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-lg font-semibold text-gray-900">{{ t('treasury.addMoney') }}</h3>
      </div>
      <form class="mt-4 space-y-4" @submit.prevent="saveDeposit">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">{{ t('treasury.amount') }}</label>
          <input v-model.number="depositForm.amount" type="number" min="0.01" step="0.01" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">{{ t('treasury.description') }}</label>
          <input v-model="depositForm.description" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">{{ t('treasury.date') }}</label>
          <DateField v-model="depositForm.date" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" @click="closeDepositModal">{{ t('labels.cancel') }}</button>
          <button type="submit" class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">{{ t('treasury.add') }}</button>
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
      const includeArchived = treasuryView.value !== 'active'
      await store.fetchTreasuries({ includeArchived })
      if (store.selectedTreasuryId) {
        await reloadSelected()
      }
    }

    const selectTreasury = async (id) => {
      store.selectTreasury(id)
      await reloadSelected()
    }

    const reloadSelected = async () => {
      if (!store.selectedTreasuryId) return
      await store.fetchSummary(store.selectedTreasuryId)
      await store.fetchTransactions({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        type: filters.type || undefined,
        amountMin: filters.amountMin !== '' ? filters.amountMin : undefined,
        amountMax: filters.amountMax !== '' ? filters.amountMax : undefined,
        search: filters.search || undefined,
      }, store.selectedTreasuryId)
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
      if (!isAdmin.value) return
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
      const payload = { name: form.name } //, pinned: form.pinned }
      if (modalMode.value === 'create') await store.createTreasuryItem(payload)
      else await store.updateTreasuryItem(form.id, payload)
      showModal.value = false
      await loadTreasuries()
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
      await store.deposit(depositForm.amount, depositForm.description, depositForm.date, store.selectedTreasuryId)
      showDeposit.value = false
      await reloadSelected()
      await loadTreasuries()
    }

    const archiveSelectedTreasury = async () => {
      if (!isAdmin.value || !store.selectedTreasuryId) return
      if (!window.confirm(t('treasury.archiveConfirm'))) return
      await store.archiveTreasuryItem(store.selectedTreasuryId)
      await loadTreasuries()
    }

    const restoreSelectedTreasury = async () => {
      if (!isAdmin.value || !store.selectedTreasuryId) return
      if (!window.confirm(t('treasury.restoreConfirm'))) return
      await store.restoreTreasuryItem(store.selectedTreasuryId)
      await loadTreasuries()
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
      if (id) await reloadSelected()
    })

    onMounted(async () => {
      store.restoreSelection()
      await loadTreasuries()
      if (!store.selectedTreasuryId && store.treasuries[0]) {
        store.selectTreasury(store.treasuries[0].id)
      }
      await reloadSelected()
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

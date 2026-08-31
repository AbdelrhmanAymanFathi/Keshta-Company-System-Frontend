import { defineStore } from 'pinia'
import {
  getTreasuries,
  createTreasury,
  updateTreasury,
  archiveTreasury,
  restoreTreasury,
  saveTreasuriesOrder,
  getTreasurySummary,
  getTreasuryTransactions,
  depositToTreasury
} from '@/api'

const STORAGE_KEY = 'selectedTreasuryId'

export const useTreasuryStore = defineStore('treasury', {
  state: () => ({
    treasuries: [],
    selectedTreasuryId: null,
    summary: { balance: 0, last30dIn: 0, last30dOut: 0 },
    transactions: { items: [], page: 1, pageSize: 20, total: 0 },
    loading: false,
    error: null,
  }),

  getters: {
    activeTreasury: (state) => state.treasuries.find(t => String(t.id) === String(state.selectedTreasuryId)) || null,
    formattedBalance: (state) => {
      const amount = Number(state.summary.balance || 0)
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
    },
    totalPages: (state) => Math.max(1, Math.ceil((state.transactions.total || 0) / (state.transactions.pageSize || 20))),
  },

  actions: {
    _rememberSelection(id) {
      try {
        if (id === null || id === undefined || id === '') localStorage.removeItem(STORAGE_KEY)
        else localStorage.setItem(STORAGE_KEY, String(id))
      } catch (_) { /* ignore */ }
    },
    restoreSelection() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) this.selectedTreasuryId = Number(saved)
      } catch (_) { /* ignore */ }
    },
    async fetchTreasuries(options = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await getTreasuries(options)
        this.treasuries = Array.isArray(response.data) ? response.data : []
        const stillExists = this.treasuries.some(t => String(t.id) === String(this.selectedTreasuryId))
        if ((!this.selectedTreasuryId || !stillExists) && this.treasuries.length) {
          this.selectedTreasuryId = this.treasuries[0].id
          this._rememberSelection(this.selectedTreasuryId)
        }
        return this.treasuries
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch treasuries'
        throw error
      } finally {
        this.loading = false
      }
    },
    selectTreasury(id) {
      this.selectedTreasuryId = id
      this._rememberSelection(id)
    },
    async fetchSummary(treasuryId = this.selectedTreasuryId) {
      if (!treasuryId) return null
      this.loading = true
      this.error = null
      try {
        const response = await getTreasurySummary(treasuryId)
        this.summary = {
          balance: response.data.balance || 0,
          last30dIn: response.data.last30dIn || 0,
          last30dOut: response.data.last30dOut || 0
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch summary'
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchTransactions(params = {}, treasuryId = this.selectedTreasuryId) {
      if (!treasuryId) return { items: [], total: 0, page: 1, pageSize: 20 }
      this.loading = true
      this.error = null
      try {
        const response = await getTreasuryTransactions(treasuryId, {
          page: this.transactions.page,
          pageSize: this.transactions.pageSize,
          ...params
        })
        this.transactions = {
          items: response.data.items || [],
          total: response.data.total || 0,
          page: response.data.page || this.transactions.page,
          pageSize: response.data.pageSize || this.transactions.pageSize,
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch transactions'
        throw error
      } finally {
        this.loading = false
      }
    },
    async createTreasuryItem(data) {
      const response = await createTreasury(data)
      await this.fetchTreasuries()
      return response.data
    },
    async updateTreasuryItem(id, data) {
      const response = await updateTreasury(id, data)
      await this.fetchTreasuries()
      return response.data
    },
    async archiveTreasuryItem(id) {
      const response = await archiveTreasury(id)
      await this.fetchTreasuries()
      if (String(this.selectedTreasuryId) === String(id) && this.treasuries.length) {
        this.selectTreasury(this.treasuries[0].id)
      }
      return response.data
    },
    async deleteTreasuryItem(id) {
      return this.archiveTreasuryItem(id)
    },
    async restoreTreasuryItem(id) {
      const response = await restoreTreasury(id)
      await this.fetchTreasuries()
      return response.data
    },
    async unarchiveTreasuryItem(id) {
      return this.restoreTreasuryItem(id)
    },
    async saveOrder(items) {
      const response = await saveTreasuriesOrder({ items })
      await this.fetchTreasuries()
      return response.data
    },
    async deposit(amount, description, date, treasuryId = this.selectedTreasuryId, fromTreasuryId = null) {
      const treasury = this.treasuries.find(t => String(t.id) === String(treasuryId))
      const payload = { amount, description, date }
      if (treasury?.type === 'CUSTODY') {
        if (!fromTreasuryId) {
          throw new Error('إيداع العهدة يتطلب اختيار الخزينة المصدر.')
        }
        payload.fromTreasuryId = fromTreasuryId
      }
      const response = await depositToTreasury(treasuryId, payload)
      await this.fetchSummary(treasuryId)
      await this.fetchTransactions({}, treasuryId)
      await this.fetchTreasuries()
      return response.data
    },
    setTransactionPage(page) {
      this.transactions.page = page
    },
    setTransactionPageSize(pageSize) {
      this.transactions.pageSize = pageSize
      this.transactions.page = 1
    },
  }
})

import { defineStore } from 'pinia'
import { getCompany, getCompanyTransactions, depositToCompanyWallet, withdrawFromCompanyWallet, getCompanySummary } from '@/api'

export const useCompanyFinanceStore = defineStore('companyFinance', {
  state: () => ({
    company: {
      id: null,
      name: ''
    },
    summary: {
      balance: 0,
      last30dIn: 0,
      last30dOut: 0
    },
    transactions: {
      items: [],
      page: 1,
      pageSize: 10,
      total: 0
    },
    loading: false,
    error: null
  }),

  getters: {
    formattedBalance: (state) => {
      const balance = parseFloat(state.summary.balance || 0)
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
      }).format(balance)
    },

    formattedLast30dIn: (state) => {
      const amount = parseFloat(state.summary.last30dIn || 0)
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
      }).format(amount)
    },

    formattedLast30dOut: (state) => {
      const amount = parseFloat(state.summary.last30dOut || 0)
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
      }).format(amount)
    },

    totalPages: (state) => Math.ceil(state.transactions.total / state.transactions.pageSize)
  },

  actions: {
    async fetchCompany() {
      this.loading = true
      this.error = null
      try {
        const response = await getCompany()
        this.company = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching company:', error)
        this.error = error.response?.data?.message || 'Failed to fetch company'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      this.loading = true
      this.error = null
      try {
        const response = await getCompanySummary()
        this.summary = {
          balance: response.data.balance || 0,
          last30dIn: response.data.last30dIn || 0,
          last30dOut: response.data.last30dOut || 0
        }
        return response.data
      } catch (error) {
        console.error('Error fetching summary:', error)
        this.error = error.response?.data?.message || 'Failed to fetch summary'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTransactions() {
      this.loading = true
      this.error = null
      try {
        const response = await getCompanyTransactions({
          page: this.transactions.page,
          pageSize: this.transactions.pageSize
        })
        this.transactions.items = response.data.items || []
        this.transactions.total = response.data.total || 0
        this.transactions.pageSize = response.data.pageSize || this.transactions.pageSize
        return response.data
      } catch (error) {
        console.error('Error fetching transactions:', error)
        this.error = error.response?.data?.message || 'Failed to fetch transactions'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deposit(amount, description, date) {
      this.loading = true
      this.error = null
      try {
        await depositToCompanyWallet({
          amount,
          description,
          date
        })
        // Refresh summary and transactions
        await this.fetchSummary()
        await this.fetchTransactions()
        return true
      } catch (error) {
        console.error('Error depositing:', error)
        this.error = error.response?.data?.message || 'Failed to deposit'
        throw error
      } finally {
        this.loading = false
      }
    },

    async withdraw(amount, description, date) {
      this.loading = true
      this.error = null
      try {
        await withdrawFromCompanyWallet({
          amount,
          description,
          date
        })
        // Refresh summary and transactions
        await this.fetchSummary()
        await this.fetchTransactions()
        return true
      } catch (error) {
        console.error('Error withdrawing:', error)
        this.error = error.response?.data?.message || 'Failed to withdraw'
        throw error
      } finally {
        this.loading = false
      }
    },

    setTransactionPage(page) {
      this.transactions.page = page
    },

    setTransactionPageSize(pageSize) {
      this.transactions.pageSize = pageSize
      this.transactions.page = 1
    }
  }
})

import { defineStore } from 'pinia'
import { getCompany, getCompanyTransactions, depositToCompanyWallet, withdrawFromCompanyWallet } from '@/api'

export const useCompanyStore = defineStore('company', {
  state: () => ({
    company: {
      id: null,
      name: '',
      balance: '0'
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
      const balance = parseFloat(state.company.balance || 0)
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(balance)
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
        const response = await depositToCompanyWallet({
          amount,
          description,
          date
        })
        // Update company balance from response
        if (response.data) {
          this.company = response.data
        }
        // Refresh transactions
        await this.fetchTransactions()
        return response.data
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
        const response = await withdrawFromCompanyWallet({
          amount,
          description,
          date
        })
        // Update company balance from response
        if (response.data) {
          this.company = response.data
        }
        // Refresh transactions
        await this.fetchTransactions()
        return response.data
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


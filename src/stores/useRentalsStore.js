import { defineStore } from 'pinia'
import { 
  getRentals, 
  createRental, 
  updateRental, 
  deleteRental, 
  getRental,
  getRentalPayouts,
  createRentalPayout,
  deleteRentalPayout
} from '@/api'

export const useRentalsStore = defineStore('rentals', {
  state: () => ({
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    filters: {
      q: '',
      isCompanyOwned: null // null = all, true = company, false = external
    },
    loading: false,
    error: null,
    currentRental: null,
    payouts: [],
    payoutsLoading: false,
    payoutsError: null
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.total / state.pageSize),
    hasResults: (state) => state.items.length > 0
  },

  actions: {
    async fetchRentals() {
      this.loading = true
      this.error = null
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          q: this.filters.q
        }
        if (this.filters.isCompanyOwned !== null) {
          params.isCompanyOwned = this.filters.isCompanyOwned
        }
        const response = await getRentals(params)
        this.items = response.data.items || []
        this.total = response.data.total || 0
        this.pageSize = response.data.pageSize || this.pageSize
        return response.data
      } catch (error) {
        console.error('Error fetching rentals:', error)
        this.error = error.response?.data?.message || 'Failed to fetch rentals'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRental(id) {
      this.loading = true
      this.error = null
      try {
        const response = await getRental(id)
        this.currentRental = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching rental:', error)
        this.error = error.response?.data?.message || 'Failed to fetch rental'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createRental(payload) {
      this.loading = true
      this.error = null
      try {
        // Ensure isCompanyOwned defaults to true if not provided
        const data = {
          ...payload,
          isCompanyOwned: payload.isCompanyOwned !== undefined ? payload.isCompanyOwned : true
        }
        const response = await createRental(data)
        // Refresh list after creation
        await this.fetchRentals()
        return response.data
      } catch (error) {
        console.error('Error creating rental:', error)
        this.error = error.response?.data?.message || 'Failed to create rental'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateRental(id, payload) {
      this.loading = true
      this.error = null
      try {
        const response = await updateRental(id, payload)
        // Refresh list after update
        await this.fetchRentals()
        return response.data
      } catch (error) {
        console.error('Error updating rental:', error)
        this.error = error.response?.data?.message || 'Failed to update rental'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteRental(id) {
      this.loading = true
      this.error = null
      try {
        await deleteRental(id)
        // Refresh list after deletion
        await this.fetchRentals()
        return true
      } catch (error) {
        console.error('Error deleting rental:', error)
        this.error = error.response?.data?.message || 'Failed to delete rental'
        throw error
      } finally {
        this.loading = false
      }
    },

    setPage(page) {
      this.page = page
    },

    setPageSize(pageSize) {
      this.pageSize = pageSize
      this.page = 1 // Reset to first page
    },

    setSearchQuery(q) {
      this.filters.q = q
      this.page = 1 // Reset to first page
    },

    setCompanyOwnedFilter(value) {
      // value: null = all, true = company, false = external
      this.filters.isCompanyOwned = value
      this.page = 1 // Reset to first page
    },

    resetFilters() {
      this.filters = {
        q: '',
        isCompanyOwned: null
      }
      this.page = 1
    },

    // Payout actions
    async fetchRentalPayouts(rentalId) {
      this.payoutsLoading = true
      this.payoutsError = null
      try {
        const response = await getRentalPayouts(rentalId)
        this.payouts = response.data || []
        return this.payouts
      } catch (error) {
        console.error('Error fetching rental payouts:', error)
        this.payoutsError = error.response?.data?.message || 'Failed to fetch payouts'
        throw error
      } finally {
        this.payoutsLoading = false
      }
    },

    async createRentalPayout(rentalId, payload) {
      this.payoutsLoading = true
      this.payoutsError = null
      try {
        const response = await createRentalPayout(rentalId, payload)
        // Refresh payouts list
        await this.fetchRentalPayouts(rentalId)
        // Also refresh rentals to get updated paid/remaining values
        await this.fetchRentals()
        return response.data
      } catch (error) {
        console.error('Error creating payout:', error)
        this.payoutsError = error.response?.data?.message || 'Failed to create payout'
        throw error
      } finally {
        this.payoutsLoading = false
      }
    },

    async deleteRentalPayout(rentalId, payoutId) {
      this.payoutsLoading = true
      this.payoutsError = null
      try {
        await deleteRentalPayout(rentalId, payoutId)
        // Refresh payouts list
        await this.fetchRentalPayouts(rentalId)
        // Also refresh rentals to get updated paid/remaining values
        await this.fetchRentals()
        return true
      } catch (error) {
        console.error('Error deleting payout:', error)
        this.payoutsError = error.response?.data?.message || 'Failed to delete payout'
        throw error
      } finally {
        this.payoutsLoading = false
      }
    }
  }
})


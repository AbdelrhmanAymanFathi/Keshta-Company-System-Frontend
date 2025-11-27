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
          // NOTE: isCompanyOwned filter is handled client-side in RentalList.vue
          // Do NOT send it to backend - let frontend do the filtering
        }
        const response = await getRentals(params)
        // Some backends implement "soft delete" and return deleted items.
        // Filter common soft-delete indicators so deleted items don't persist in the UI.
        const items = response.data.items || []
        this.items = items.filter(item => {
          // common soft-delete flags/fields: deleted, isDeleted, is_deleted, deleted_at, deletedAt
          if (!item) return false
          const keys = Object.keys(item)
          for (const k of keys) {
            const lk = String(k).toLowerCase()
            if (['deleted', 'isdeleted', 'is_deleted'].includes(lk)) {
              const val = item[k]
              if (val === true || val === 'true' || val === 1 || String(val) === '1') return false
            }
            if (['deletedat', 'deleted_at', 'deletedon', 'deleted_on'].includes(lk)) {
              const val = item[k]
              if (val) return false
            }
          }
          return true
        })
        // total from the backend may include soft-deleted items; set to length of filtered items
        this.total = Array.isArray(response.data.items) ? this.items.length : response.data.total || 0
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
        return { success: true, alreadyDeleted: false }
      } catch (error) {
        // If the rental was not found (404) we can treat it as already deleted
        if (error?.response?.status === 404) {
          console.warn('Rental already deleted (404) — refreshing list to reflect current state')
          await this.fetchRentals()
          return { success: true, alreadyDeleted: true }
        }

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
        // Filter out soft-deleted payouts (similar to rentals)
        const items = response.data || []
        this.payouts = (Array.isArray(items) ? items : []).filter(p => {
          if (!p) return false
          const keys = Object.keys(p)
          for (const k of keys) {
            const lk = String(k).toLowerCase()
            if (['deleted', 'isdeleted', 'is_deleted'].includes(lk)) {
              const val = p[k]
              if (val === true || val === 'true' || val === 1 || String(val) === '1') return false
            }
            if (['deletedat', 'deleted_at', 'deletedon', 'deleted_on'].includes(lk)) {
              const val = p[k]
              if (val) return false
            }
          }
          return true
        })
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
        return { success: true, alreadyDeleted: false }
      } catch (error) {
        // Treat missing payout as already deleted — refresh state
        if (error?.response?.status === 404) {
          console.warn('Payout already deleted (404) — refreshing lists')
          await this.fetchRentalPayouts(rentalId).catch(() => {})
          await this.fetchRentals().catch(() => {})
          return { success: true, alreadyDeleted: true }
        }

        console.error('Error deleting payout:', error)
        this.payoutsError = error.response?.data?.message || 'Failed to delete payout'
        throw error
      } finally {
        this.payoutsLoading = false
      }
    }
  }
})


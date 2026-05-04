import { defineStore } from 'pinia'
import { 
	getEquipmentLogs,
	createRental, 
	updateRental, 
	deleteRental, 
	getRental,
	getRentalPayouts,
	createRentalPayout,
	deleteRentalPayout
} from '@/api'

export const useEquipmentLogsStore = defineStore('equipmentLogs', {
	state: () => ({
		items: [],
		page: 1,
		pageSize: 20,
		total: 0,
		filters: {
			q: '',
			isCompanyOwned: null, // null = all, true = company, false = external
			isRental: null,
			locationId: null,
			areaId: null,
			equipmentId: null,
			driverId: null,
			startDate: '',
			endDate: ''
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
					q: this.filters.q,
					...(this.filters.locationId != null && this.filters.locationId !== '' ? { locationId: this.filters.locationId } : {}),
					...(this.filters.areaId != null && this.filters.areaId !== '' ? { areaId: this.filters.areaId } : {}),
					...(this.filters.equipmentId !== undefined && this.filters.equipmentId !== null && this.filters.equipmentId !== '' ? { equipmentId: this.filters.equipmentId } : {}),
					...(this.filters.driverId !== undefined && this.filters.driverId !== null && this.filters.driverId !== '' ? { driverId: this.filters.driverId } : {}),
					...(typeof this.filters.isRental !== 'undefined' && this.filters.isRental !== null ? { isRental: this.filters.isRental } : {}),
					...(this.filters.startDate ? { startDate: this.filters.startDate } : {}),
					...(this.filters.endDate ? { endDate: this.filters.endDate } : {})
				}
				console.log('[equipmentLogsStore] fetchRentals params:', params)
				const response = await getEquipmentLogs(params)
				const payload = response?.data || {}
				const items = Array.isArray(payload.items)
					? payload.items
					: Array.isArray(payload.data)
						? payload.data
						: Array.isArray(payload)
							? payload
							: []
				this.items = items.filter(item => {
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
				const meta = payload.meta || {}
				this.total = meta.total ?? payload.total ?? this.items.length
				this.pageSize = meta.pageSize ?? payload.pageSize ?? this.pageSize
				return payload
			} catch (error) {
				console.error('Error fetching equipment logs:', error)
				this.error = error.response?.data?.message || 'Failed to fetch equipment logs'
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
				const data = {
					...payload,
					isCompanyOwned: payload.isCompanyOwned !== undefined ? payload.isCompanyOwned : true
				}
				const response = await createRental(data)
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
				await this.fetchRentals()
				return { success: true, alreadyDeleted: false }
			} catch (error) {
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
			this.page = 1
		},

		setSearchQuery(q) {
			this.filters.q = q
			this.page = 1
		},

		setCompanyOwnedFilter(value) {
			this.filters.isCompanyOwned = value
			this.page = 1
		},

		resetFilters() {
			this.filters = {
				q: '',
				isCompanyOwned: null,
				isRental: null
			}
			this.page = 1
		},

		async fetchRentalPayouts(rentalId) {
			this.payoutsLoading = true
			this.payoutsError = null
			try {
				const response = await getRentalPayouts(rentalId)
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
				await this.fetchRentalPayouts(rentalId)
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
				await this.fetchRentalPayouts(rentalId)
				await this.fetchRentals()
				return { success: true, alreadyDeleted: false }
			} catch (error) {
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

// NOTE: alias `useRentalsStore` removed — callers should use `useEquipmentLogsStore` now.

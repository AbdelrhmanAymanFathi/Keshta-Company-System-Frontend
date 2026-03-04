import { defineStore } from 'pinia'
import { getSupplies, createSupply, updateSupply, deleteSupply } from '@/api'

export const useSuppliesStore = defineStore('supplies', {
  state: () => ({
    supplies: [],
    page: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    error: null
  }),
  actions: {
    async loadSupplies(params = {}) {
      this.loading = true
      this.error = null
      try {
        const query = { page: this.page, pageSize: this.pageSize, ...params }
        const res = await getSupplies(query)
        const data = res.data || {}
        this.supplies = data.items || []
        this.total = data.total || 0
        this.pageSize = data.pageSize || this.pageSize
        return data
      } catch (err) {
        console.error('Failed to load supplies', err)
        this.error = err
        this.supplies = []
        this.total = 0
        throw err
      } finally {
        this.loading = false
      }
    },
    async createSupply(payload) {
      this.loading = true
      try {
        const res = await createSupply(payload)
        await this.loadSupplies()
        return res
      } catch (err) {
        console.error('Failed to create supply', err)
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateSupply(id, payload) {
      this.loading = true
      try {
        const res = await updateSupply(id, payload)
        await this.loadSupplies()
        return res
      } catch (err) {
        console.error('Failed to update supply', err)
        throw err
      } finally {
        this.loading = false
      }
    },
    async deleteSupply(id) {
      this.loading = true
      try {
        const res = await deleteSupply(id)
        await this.loadSupplies()
        return res
      } catch (err) {
        console.error('Failed to delete supply', err)
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})

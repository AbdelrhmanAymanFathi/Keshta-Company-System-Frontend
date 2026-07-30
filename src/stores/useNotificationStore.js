import { defineStore } from 'pinia'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/api'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [],
    unreadCount: 0,
    page: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    error: null,
    filterUnreadOnly: false,
    filterType: '',
    filterStartDate: '',
    filterEndDate: '',
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.total / state.pageSize),
    filters(state) {
      return {
        page: state.page,
        pageSize: state.pageSize,
        unreadOnly: state.filterUnreadOnly ? 'true' : undefined,
        type: state.filterType || undefined,
        startDate: state.filterStartDate || undefined,
        endDate: state.filterEndDate || undefined,
      }
    },
  },

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        const resp = await getNotifications(this.filters)
        this.items = resp.data?.items || resp.data?.data || []
        this.total = resp.data?.total || 0
      } catch (err) {
        this.error = err?.response?.data?.message || 'Failed to fetch notifications'
      } finally {
        this.loading = false
      }
    },

    async fetchUnreadCount() {
      try {
        const resp = await getUnreadNotificationCount()
        this.unreadCount = resp.data?.count ?? resp.data?.unreadCount ?? 0
      } catch {
        // silently fail
      }
    },

    async markRead(id) {
      try {
        await markNotificationRead(id)
        this.unreadCount = Math.max(0, this.unreadCount - 1)
        const item = this.items.find(i => i.id === id)
        if (item) item.isRead = true
      } catch {
        // silently fail
      }
    },

    async markAllRead() {
      try {
        await markAllNotificationsRead()
        this.unreadCount = 0
        this.items.forEach(i => { i.isRead = true })
      } catch {
        // silently fail
      }
    },

    async remove(id) {
      try {
        await deleteNotification(id)
        this.items = this.items.filter(i => i.id !== id)
        this.total = Math.max(0, this.total - 1)
      } catch {
        // silently fail
      }
    },

    setPage(page) {
      this.page = page
      this.fetchList()
    },

    setFilter(filter, value) {
      this[filter] = value
      this.page = 1
      this.fetchList()
    },

    resetFilters() {
      this.filterUnreadOnly = false
      this.filterType = ''
      this.filterStartDate = ''
      this.filterEndDate = ''
      this.page = 1
      this.fetchList()
    },
  },
})

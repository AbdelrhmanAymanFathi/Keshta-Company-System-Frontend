import { defineStore } from 'pinia'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
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
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.total / state.pageSize),
  },

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        const resp = await getNotifications({ page: this.page, pageSize: this.pageSize })
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
      } catch {
        // silently fail
      }
    },

    async markAllRead() {
      try {
        await markAllNotificationsRead()
        this.unreadCount = 0
      } catch {
        // silently fail
      }
    },
  },
})

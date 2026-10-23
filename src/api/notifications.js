// Auto-split from src/api.js — domain module: notifications.js
import axios from 'axios'
import { BASE_URL } from './http'

// --- Notifications ---
export const getNotifications = (params = {}) => {
  const { page = 1, pageSize = 20, unreadOnly, type, startDate, endDate } = params
  const q = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() })
  if (unreadOnly) q.set('unreadOnly', unreadOnly)
  if (type) q.set('type', type)
  if (startDate) q.set('startDate', startDate)
  if (endDate) q.set('endDate', endDate)
  return axios.get(`${BASE_URL}/api/notifications?${q.toString()}`)
}

export const getUnreadNotificationCount = () =>
  axios.get(`${BASE_URL}/api/notifications/unread-count`)

export const markNotificationRead = (id) =>
  axios.patch(`${BASE_URL}/api/notifications/${id}/read`)

export const markAllNotificationsRead = () =>
  axios.patch(`${BASE_URL}/api/notifications/read-all`)

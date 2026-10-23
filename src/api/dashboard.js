// Auto-split from src/api.js — domain module: dashboard.js
import axios from 'axios'
import { BASE_URL } from './http'

// --- Dashboard APIs ---
function dashParams(p) {
  const q = {}
  if (p?.fromDate) q.fromDate = p.fromDate
  if (p?.toDate) q.toDate = p.toDate
  return q
}

export const getDashboardSummary = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/summary`, { params: dashParams(params) })

export const getCashFlowTrend = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/cash-flow-trend`, { params: { ...dashParams(params), groupBy: params.groupBy || 'month' } })

export const getExpensesByClassification = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/expenses-by-classification`, { params: dashParams(params) })

export const getExpensesGrouped = (params = {}) =>
  axios.get(`${BASE_URL}/api/expenses/items/grouped`, { params: { ...dashParams(params), groupBy: params.groupBy || 'category' } })

export const getMonthlyComparison = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/monthly-comparison`, { params: { months: params.months || 12 } })

export const getPaymentsByType = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/payments-by-type`, { params: dashParams(params) })

export const getTreasuryOverview = () =>
  axios.get(`${BASE_URL}/api/dashboard/treasury-overview`)

export const getTopContractors = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/top-contractors`, { params: { ...dashParams(params), limit: params.limit || 10 } })

export const getModuleActivity = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/module-activity`, { params: dashParams(params) })

export const getLocationTotals = (params = {}) => {
  const q = dashParams(params)
  if (params.locationId != null && params.locationId !== '') q.locationId = params.locationId
  return axios.get(`${BASE_URL}/api/dashboard/location-totals`, { params: q })
}

export const getUserPreference = (key) =>
  axios.get(`${BASE_URL}/api/preferences/${encodeURIComponent(key)}`)

export const saveUserPreference = (key, value) =>
  axios.put(`${BASE_URL}/api/preferences/${encodeURIComponent(key)}`, { value })

export const getPetroleumTrend = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/petroleum-trend`, { params: { ...dashParams(params), groupBy: params.groupBy || 'month' } })

export const getWalletTrend = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/wallet-trend`, { params: { ...dashParams(params), groupBy: params.groupBy || 'month' } })

export const getExpensesTrend = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/expenses-trend`, { params: { ...dashParams(params), groupBy: params.groupBy || 'day' } })

export const getApprovalStats = () =>
  axios.get(`${BASE_URL}/api/dashboard/approval-stats`)

export const getRecentActivity = (params = {}) => {
  const q = { page: params.page || 1, pageSize: params.pageSize || 10 }
  if (params.module) q.module = params.module
  return axios.get(`${BASE_URL}/api/dashboard/recent-activity`, { params: q })
}

// Auto-split from src/api.js — domain module: reportDefinitions.js
import axios from 'axios'
import { BASE_URL, getCurrentApiLang } from './http'

// === Report Definitions (Dynamic Reports) ===
export const getReportDefs = (params = {}) => {
  const { page = 1, pageSize = 100, q = '' } = params
  const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() })
  if (q) query.append('q', q)
  return axios.get(`${BASE_URL}/api/report-defs?${query.toString()}`)
}
export const getReportDef = (id) => axios.get(`${BASE_URL}/api/report-defs/${id}`)
export const createReportDef = (data) => axios.post(`${BASE_URL}/api/report-defs`, data)
export const updateReportDef = (id, data) => axios.put(`${BASE_URL}/api/report-defs/${id}`, data)
export const deleteReportDef = (id) => axios.delete(`${BASE_URL}/api/report-defs/${id}`)
// Fetch available report modules (returns { modules: [...] })
export const getReportModules = () => axios.get(`${BASE_URL}/api/report-defs/modules`)

export const getReportParamOptions = (id, paramName, paramsObj = {}) => {
  const qs = new URLSearchParams()
  qs.append('lang', getCurrentApiLang())
  
  // Handle legacy string parameter (q) or new object format
  if (typeof paramsObj === 'string') {
    if (paramsObj) qs.append('q', paramsObj)
  } else if (typeof paramsObj === 'object' && paramsObj !== null) {
    // Add all parameters from the object (including q, contractorId, etc.)
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        qs.append(key, String(value))
      }
    })
  }
  
  return axios.get(`${BASE_URL}/api/report-defs/${id}/params/options?param=${encodeURIComponent(paramName)}${qs.toString() ? `&${qs.toString()}` : ''}`)
}

export const executeReport = (id, body, options = {}) => {
  const { format, shape, lang, ...axiosConfig } = options || {}
  const query = new URLSearchParams()
  if (format) query.append('format', format)
  if (shape) query.append('shape', shape)
  if (lang) query.append('lang', lang)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return axios.post(`${BASE_URL}/api/report-defs/${id}/execute${suffix}`, body, axiosConfig)
}

// --- Helpers for creating reports from database tables ---
export const getReportTables = () => axios.get(`${BASE_URL}/api/report-defs/tables`)
export const getTableFields = (tableName) => axios.get(`${BASE_URL}/api/report-defs/tables/${encodeURIComponent(tableName)}/fields`)
export const createReportFromTable = (data) => axios.post(`${BASE_URL}/api/report-defs/generate`, data)
export const updateReportFromTable = (id, data) => axios.put(`${BASE_URL}/api/report-defs/generate/${id}`, data)

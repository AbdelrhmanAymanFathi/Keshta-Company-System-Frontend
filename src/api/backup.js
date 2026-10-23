// Auto-split from src/api.js — domain module: backup.js
import axios from 'axios'
import { BASE_URL } from './http'

// --- Admin: Database Backup & Restore ---
export const downloadDatabaseBackup = () =>
  axios.get(`${BASE_URL}/api/admin/backup/download`, { responseType: 'blob', timeout: 0 })

export const restoreDatabaseBackup = (file, onProgress) =>
  axios.post(`${BASE_URL}/api/admin/backup/restore`, file, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Backup-Filename': encodeURIComponent(file.name || 'backup.dump')
    },
    timeout: 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    onUploadProgress: onProgress
  })

export const getDatabaseBackupLogs = (params = {}) => {
  const { page = 1, pageSize = 20 } = params
  return axios.get(`${BASE_URL}/api/admin/backup/logs`, { params: { page, pageSize } })
}

export const listDatabaseBackupFiles = () =>
  axios.get(`${BASE_URL}/api/admin/backup/files`)

export const downloadDatabaseBackupFile = (name) =>
  axios.get(`${BASE_URL}/api/admin/backup/files/${encodeURIComponent(name)}`, { responseType: 'blob', timeout: 0 })

export const getServerLogFiles = () =>
  axios.get(`${BASE_URL}/api/admin/logs`)

export const getServerLogFile = (name, lines = 200) =>
  axios.get(`${BASE_URL}/api/admin/logs/files/${encodeURIComponent(name)}`, {
    params: { lines },
  })

export const downloadServerLogFile = (name) =>
  axios.get(`${BASE_URL}/api/admin/logs/files/${encodeURIComponent(name)}/download`, { responseType: 'blob', timeout: 0 })

// Admin: active users (name + current page). Live updates arrive on the `admin`
// SSE channel; this endpoint provides the initial snapshot.
export const getActiveUsers = () =>
  axios.get(`${BASE_URL}/api/realtime/active-users`)

export const downloadUserActivityReportPdf = (userId, lang = 'ar', params = {}) =>
  axios.get(`${BASE_URL}/api/admin/user-activity/${encodeURIComponent(userId)}/pdf`, {
    params: { ...params, lang },
    responseType: 'blob'
  })

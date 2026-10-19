// Auto-split from src/api.js — domain module: equipmentLogs.js
import axios from 'axios'
import { BASE_URL, appendLangParam, withLangQuery } from './http'

// Equipment Logs (migrated from Rentals)
// NOTE: Rental resources were migrated to the equipment-logs API.
// Keep the equipment-logs helpers as the canonical API surface.
export const getRentals = (params = {}) => {
  const { page = 1, pageSize = 20, q = '', isCompanyOwned = null } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (q) {
    queryParams.append('q', q);
  }
  if (isCompanyOwned !== null && isCompanyOwned !== undefined) {
    // Map legacy isCompanyOwned -> isRental false/true if possible; keep param name
    queryParams.append('isCompanyOwned', isCompanyOwned.toString());
  }
  // Route to equipment-logs listing endpoint
  return axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs`, Object.fromEntries(queryParams.entries())));
};
export const getRental = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`));
export const createRental = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/equipment-logs`), data);
export const updateRental = (id, data) =>
  axios.patch(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`), data);
export const deleteRental = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`));
export const getRentalPayouts = (rentalId) =>
  axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs/${rentalId}/payouts`));
export const createRentalPayout = (rentalId, data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/equipment-logs/${rentalId}/payouts`), data);
export const deleteRentalPayout = (rentalId, payoutId) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/equipment-logs/${rentalId}/payouts/${payoutId}`));

// Rental Jobs
export const getRentalJobs = (rentalId) => {
  // Compatibility wrapper: fetch equipment logs by equipmentId
  return getEquipmentLogs({ equipmentId: rentalId })
}
export const createRentalJob = (rentalId, data) => {
  // Ensure payload contains equipmentId for new equipment-log
  const payload = { ...data, equipmentId: data.equipmentId || rentalId }
  return createEquipmentLog(payload)
}
export const updateRentalJob = (rentalId, jobId, data) => {
  // jobId is the equipment-log id now
  return updateEquipmentLog(jobId, data)
}
export const deleteRentalJob = (rentalId, jobId) => {
  // jobId is the equipment-log id
  return deleteEquipmentLog(jobId)
}
export const getRentalJobsSummary = (rentalId) => {
  return getEquipmentLogsSummary({ equipmentId: rentalId })
}

// Equipment Logs (new API surface replacing rental jobs)
// List: /api/equipment-logs?q=&equipmentId=&startDate=&endDate=&isRental=&driverId=&page=&pageSize=
export const getEquipmentLogs = (params = {}) => {
  const {
    page = 1,
    pageSize = 100,
    q = '',
    equipmentId,
    startDate,
    endDate,
    isRental,
    locationId,
    areaId,
    driverId,
    sortField = 'date',
    sortOrder = 'desc'
  } = params
  const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() })
  if (sortField) query.append('sortField', String(sortField))
  if (sortOrder) query.append('sortOrder', String(sortOrder))
  if (q) query.append('q', q)
  if (equipmentId !== undefined && equipmentId !== null) query.append('equipmentId', equipmentId)
  if (startDate) query.append('startDate', startDate)
  if (endDate) query.append('endDate', endDate)
  if (typeof isRental !== 'undefined' && isRental !== null) query.append('isRental', isRental ? 'true' : 'false')
  if (driverId !== undefined && driverId !== null && driverId !== '') query.append('driverId', String(driverId))
  if (locationId !== undefined && locationId !== null && locationId !== '') query.append('locationId', String(locationId))
  if (areaId !== undefined && areaId !== null && areaId !== '') query.append('areaId', String(areaId))
  // Log params and the final URL so we can trace why filters may be missing
  try { console.log('[api] getEquipmentLogs params:', params) } catch (e) { /* ignore */ }
  const url = withLangQuery(`${BASE_URL}/api/equipment-logs`, Object.fromEntries(query.entries()))
  try { console.log('[api] getEquipmentLogs URL:', url) } catch (e) { /* ignore in old browsers */ }
  return axios.get(url)
}

// Create a new equipment log (body: { equipmentId, date, hourlyRate?, hours, note, isRental })
export const createEquipmentLog = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/equipment-logs`), data)

// Update equipment log by id
export const updateEquipmentLog = (id, data) =>
  axios.patch(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`), data)

// Delete equipment log by id
export const deleteEquipmentLog = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`))

// Equipment logs summary (generic query params)
export const getEquipmentLogsSummary = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v))
  })
  return axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs/summary`, Object.fromEntries(q.entries())))
}

export const getEquipmentLogsReportData = async (params = {}, format = 'json') => {
  const url = `${BASE_URL}/api/equipment-logs/report`;
  let axiosParams = appendLangParam({ ...params });
  if (format === 'json') {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  if (format === 'xlsx' || format === 'csv' || format === 'pdf') {
    axiosParams.format = format;
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  // fallback
  const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
  return { data: resp.data, headers: resp.headers };
};

export const downloadEquipmentLogsReport = async (params = {}, format = 'xlsx') => {
  return getEquipmentLogsReportData(params, format);
};

// Auto-split from src/api.js — domain module: exports.js
import axios from 'axios'
import { BASE_URL, appendLangParam, withLangQuery } from './http'
import { normalizeItemMode, filterItemsPayload } from './items'

// Exports (Deliveries)
export const getDeliveries = (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    q = '',
    startDate = '',
    endDate = '',
    contractorId = '',
    locationId = '',
    crusherId = '',
    itemId = '',
    vehicleId = '',
    sortField = 'date',
    sortOrder = 'desc'
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });

  if (sortField) queryParams.append('sortField', String(sortField));
  if (sortOrder) queryParams.append('sortOrder', String(sortOrder));

  // Add optional filters if they have values
  if (q) queryParams.append('q', q);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (contractorId) queryParams.append('contractorId', contractorId.toString());
  if (locationId) queryParams.append('locationId', locationId.toString());
  if (crusherId) queryParams.append('crusherId', crusherId.toString());
  if (itemId) queryParams.append('itemId', itemId.toString());
  if (vehicleId) queryParams.append('vehicleId', vehicleId.toString());

  return axios.get(withLangQuery(`${BASE_URL}/api/supplies`, Object.fromEntries(queryParams.entries())));
};


export const deleteDelivery = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/supplies/${id}`));

// Exports (parent entity with lines)
export const getExports = (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    q = '',
    startDate = '',
    endDate = '',
    contractorId = '',
    locationId = '',
    areaId = '',
    itemId = '',
    vehicleId = ''
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });

  if (q) queryParams.append('q', q);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (contractorId !== undefined && contractorId !== null && contractorId !== '') queryParams.append('contractorId', contractorId.toString());
  if (locationId !== undefined && locationId !== null && locationId !== '') queryParams.append('locationId', locationId.toString());
  if (areaId !== undefined && areaId !== null && areaId !== '') queryParams.append('areaId', areaId.toString());
  if (itemId !== undefined && itemId !== null && itemId !== '') queryParams.append('itemId', itemId.toString());
  if (vehicleId !== undefined && vehicleId !== null && vehicleId !== '') queryParams.append('vehicleId', vehicleId.toString());

  return axios.get(withLangQuery(`${BASE_URL}/api/supplies`, Object.fromEntries(queryParams.entries())));
};

export const getExport = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/supplies/${id}`));

// Sanitize export payloads to the new flat shape expected by the server
function sanitizeExportPayload(payload = {}) {
  const p = { ...payload };
  // Remove line-based fields and payment flags that backend no longer expects
  delete p.exportLines;
  delete p.paid;
  delete p.unpaid;
  delete p.total; // server computes total
  return p;
}

export const createExport = (data) => {
  const payload = sanitizeExportPayload(data);
  if (!payload.accountType) payload.accountType = 'EXPORT';
  return axios.post(withLangQuery(`${BASE_URL}/api/supplies`), payload);
}

export const updateExport = (id, data) => {
  const payload = sanitizeExportPayload(data);
  return axios.put(withLangQuery(`${BASE_URL}/api/supplies/${id}`), payload);
}

export const deleteExport = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/supplies/${id}`));

export const restoreExport = (id) =>
  axios.post(withLangQuery(`${BASE_URL}/api/supplies/${id}/restore`));

// Fetch payments for a specific export (document-level endpoint)
export const getExportPayments = (exportId) => {
  if (!exportId) return Promise.resolve({ data: [] });
  return axios.get(withLangQuery(`${BASE_URL}/api/supplies/${exportId}/payments`));
};

export const getExportItems = (params = {}) => {
  const normalizedMode = normalizeItemMode(params.mode || 'supply');
  const search = new URLSearchParams(appendLangParam({ ...params, mode: normalizedMode })).toString();
  const url = `${BASE_URL}/api/items${search ? `?${search}` : ''}`;
  return axios.get(url).then(res => {
    res.data = filterItemsPayload(res.data, normalizedMode);
    return res;
  });
};

export const createExportItem = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/items`), data);

export const updateExportItem = (id, data) =>
  axios.put(withLangQuery(`${BASE_URL}/api/items/${id}`), data);

export const deleteExportItem = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/items/${id}`));

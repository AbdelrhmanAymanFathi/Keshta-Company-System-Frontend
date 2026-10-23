// Auto-split from src/api.js — domain module: transports.js
import axios from 'axios'
import { BASE_URL, appendLangParam, withLangQuery } from './http'

// Transports
export const getTransports = (params = {}) => {
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

  if (q) queryParams.append('q', q);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (contractorId !== undefined && contractorId !== null && contractorId !== '') queryParams.append('contractorId', contractorId.toString());
  if (locationId !== undefined && locationId !== null && locationId !== '') queryParams.append('locationId', locationId.toString());
  if (areaId !== undefined && areaId !== null && areaId !== '') queryParams.append('areaId', areaId.toString());
  if (itemId !== undefined && itemId !== null && itemId !== '') queryParams.append('itemId', itemId.toString());
  if (vehicleId !== undefined && vehicleId !== null && vehicleId !== '') queryParams.append('vehicleId', vehicleId.toString());

  return axios.get(withLangQuery(`${BASE_URL}/api/transports`, Object.fromEntries(queryParams.entries())));
};
export const getTransport = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/transports/${id}`));
// Sanitize transport payloads to the new flat model (remove legacy lines/flags)
function sanitizeTransportPayload(payload = {}) {
  const p = { ...payload };
  delete p.transportLines;
  delete p.paid;
  delete p.unpaid;
  delete p.total; // server computes total
  return p;
}

export const createTransport = (data) => {
  const payload = sanitizeTransportPayload(data);
  // ensure accountType is provided so backend can record transaction against correct account
  if (!payload.accountType) payload.accountType = 'TRANSPORT';
  return axios.post(withLangQuery(`${BASE_URL}/api/transports`), payload);
}

export const updateTransport = (id, data) => {
  const payload = sanitizeTransportPayload(data);
  return axios.patch(withLangQuery(`${BASE_URL}/api/transports/${id}`), payload);
}
export const deleteTransport = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/transports/${id}`));


// --- Additional Transport helpers ---
export const calculateTransportFare = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/transports/calculate-fare`), data);

export const getTransportReport = (params = {}) => {
  const search = new URLSearchParams(appendLangParam(params)).toString();
  const url = `${BASE_URL}/api/transports/report${search ? `?${search}` : ''}`;
  return axios.get(url, { responseType: 'blob' });
};

// Transport Report - Get JSON data by default (same pattern as getRentalReportData)
export const getTransportReportData = async (params = {}, options = { download: false }) => {
  const url = `${BASE_URL}/api/transports/report`;
  let axiosParams = appendLangParam({ ...params });
  if (options && options.download) {
    axiosParams.format = 'xlsx';
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  } else {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }
};

export const downloadTransportReport = async (params = {}, format = 'xlsx') => {
  const resp = await axios.get(`${BASE_URL}/api/transports/report`, {
    params: appendLangParam({ ...params, format }),
    responseType: 'arraybuffer',
    withCredentials: true
  });
  return { data: resp.data, headers: resp.headers };
};

// --- Additional API helpers ---
export const getTransportById = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/transports/${id}`));

// --- Export Items API ---

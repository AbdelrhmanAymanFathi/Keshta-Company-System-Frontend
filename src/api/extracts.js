// Auto-split from src/api.js — domain module: extracts.js
import axios from 'axios'
import { BASE_URL, appendLangParam, withLangQuery } from './http'

// Extracts
export const createExtract = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/extracts`), data);

export const updateExtract = (id, data) =>
  axios.put(withLangQuery(`${BASE_URL}/api/extracts/${id}`), data);

export const getExtract = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/extracts/${id}`));

export const deleteExtract = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/extracts/${id}`));

export const getExtractsForContractor = (contractorId, start, end) => {
  const params = {};
  if (start) params.startDate = start;
  if (end) params.endDate = end;
  return axios.get(`${BASE_URL}/api/extracts/contractor/${contractorId}`, { params: appendLangParam(params) });
};

export const getExtracts = (params = {}) => {
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
    sortField = 'dateFrom',
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
  if (contractorId) queryParams.append('contractorId', contractorId.toString());
  if (locationId) queryParams.append('locationId', locationId.toString());
  if (crusherId) queryParams.append('crusherId', crusherId.toString());
  if (itemId) queryParams.append('itemId', itemId.toString());
  if (vehicleId) queryParams.append('vehicleId', vehicleId.toString());

  return axios.get(withLangQuery(`${BASE_URL}/api/extracts`, Object.fromEntries(queryParams.entries())));
};

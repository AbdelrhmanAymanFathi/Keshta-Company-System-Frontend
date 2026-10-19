// Auto-split from src/api.js — domain module: vehicles.js
import axios from 'axios'
import { BASE_URL, withLangQuery } from './http'
import { normalizeContractorMode, filterContractorsPayload } from './contractors'

// Vehicles
export const getVehicles = (params = {}) => {
  const { page = 1, pageSize = 20, q = '' } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    perPage: pageSize.toString(),
    mode: params.mode || 'all' // pass mode if provided (e.g., 'transport' or 'export')
  });
  if (q) {
    queryParams.append('q', q);
  }
  return axios.get(withLangQuery(`${BASE_URL}/api/vehicles`, Object.fromEntries(queryParams.entries())));
};
export const createVehicle = (data) =>
  axios.post(`${BASE_URL}/api/vehicles`, data);
export const updateVehicle = (id, data) =>
  axios.patch(`${BASE_URL}/api/vehicles/${id}`, data);
export const deleteVehicle = (id, params = {}) => {
  const query = new URLSearchParams();
  if (params.mode) query.append('mode', params.mode);
  const q = query.toString();
  return axios.delete(`${BASE_URL}/api/vehicles/${id}${q ? `?${q}` : ''}`);
}

// Vehicle ownership
export const changeVehicleOwner = (vehicleId, data) =>
  axios.post(`${BASE_URL}/api/vehicles/${vehicleId}/change-owner`, data);

export const getVehicleOwnershipHistory = (vehicleId) =>
  axios.get(`${BASE_URL}/api/vehicles/${vehicleId}/ownership-history`);

// Contractors with vehicles
export const getContractorsWithVehicles = (options = true) => {
  const opts = typeof options === 'boolean' ? { onlyWithVehicles: options } : (options || {});
  const normalizedMode = normalizeContractorMode(opts.mode);
  const params = new URLSearchParams();
  if (opts.onlyWithVehicles !== false) {
    params.append('onlyWithVehicles', 'true');
  }
  if (normalizedMode) {
    params.append('mode', normalizedMode);
  }
  return axios.get(withLangQuery(`${BASE_URL}/api/contractors/with-vehicles`, Object.fromEntries(params.entries()))).then(res => {
    res.data = filterContractorsPayload(res.data, normalizedMode);
    return res;
  });
};

// --- Drivers ---
export const getDrivers = (params = {}) => {
  const { page = 1, pageSize = 20, q = '' } = params;
  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (q) queryParams.append('q', q);
  return axios.get(`${BASE_URL}/api/drivers?${queryParams.toString()}`);
};

export const createDriver = (data) =>
  axios.post(`${BASE_URL}/api/drivers`, data);

export const updateDriver = (id, data) =>
  axios.patch(`${BASE_URL}/api/drivers/${id}`, data);

export const deleteDriver = (id) =>
  axios.delete(`${BASE_URL}/api/drivers/${id}`);

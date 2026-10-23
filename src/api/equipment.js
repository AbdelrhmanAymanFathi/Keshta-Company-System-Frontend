// Auto-split from src/api.js — domain module: equipment.js
import axios from 'axios'
import { BASE_URL, withLangQuery } from './http'

// === Equipment ===
// Manage company-owned and rented equipment
export const getEquipments = (params = {}) => {
  const { page = 1, pageSize = 20, q = '' } = params;
  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (q) queryParams.append('q', q);
  // Support filtering by contractorId or isCompanyOwned flag
  if (typeof params.isCompanyOwned !== 'undefined') queryParams.append('isCompanyOwned', params.isCompanyOwned ? 'true' : 'false');
  if (params.contractorId) queryParams.append('contractorId', params.contractorId);
  return axios.get(withLangQuery(`${BASE_URL}/api/equipment`, Object.fromEntries(queryParams.entries())));
};

export const getEquipment = (id) =>
  axios.get(`${BASE_URL}/api/equipment/${id}`);

export const createEquipment = (data) =>
  axios.post(`${BASE_URL}/api/equipment`, data);

export const updateEquipment = (id, data) =>
  axios.patch(`${BASE_URL}/api/equipment/${id}`, data);

export const deleteEquipment = (id, params = {}) => {
  const query = new URLSearchParams();
  if (params.mode) query.append('mode', params.mode);
  const q = query.toString();
  return axios.delete(`${BASE_URL}/api/equipment/${id}${q ? `?${q}` : ''}`);
};

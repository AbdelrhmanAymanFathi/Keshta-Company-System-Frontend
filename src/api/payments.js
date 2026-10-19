// Auto-split from src/api.js — domain module: payments.js
import axios from 'axios'
import { BASE_URL, withLangQuery } from './http'

// Payments
export const createPayment = (data = {}) => {
  const payload = { ...data };
  // migrate exportId -> supplyId for backend compatibility
  if (payload.exportId && !payload.supplyId) {
    payload.supplyId = payload.exportId;
    delete payload.exportId;
  }
  return axios.post(`${BASE_URL}/api/payments`, payload);
}

export const getPayments = (params = {}) => {
  const query = new URLSearchParams();
  // prefer supplyId, but accept exportId for backward compatibility
  if (params.supplyId) query.append('supplyId', params.supplyId);
  else if (params.exportId) query.append('exportId', params.exportId);
  if (params.transportId) query.append('transportId', params.transportId);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  const q = query.toString();
  return axios.get(`${BASE_URL}/api/payments${q ? `?${q}` : ''}`);
};
// Cancel (delete) a payment. Backend reverses the treasury, company wallet and contractor wallet.
export const deletePayment = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/payments/${id}`));

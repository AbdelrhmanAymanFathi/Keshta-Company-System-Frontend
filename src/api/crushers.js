// Auto-split from src/api.js — domain module: crushers.js
import axios from 'axios'
import { BASE_URL } from './http'

// Crushers
export const getCrushers = (params = {}) => {
  const { page = 1, pageSize = 20, q = '' } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (q) {
    queryParams.append('q', q);
  }
  return axios.get(`${BASE_URL}/api/crushers?${queryParams.toString()}`);
};
export const createCrusher = (data) =>
  axios.post(`${BASE_URL}/api/crushers`, data);
export const deleteCrusher = (id) =>
  axios.delete(`${BASE_URL}/api/crushers/${id}`);
export const updateCrusher = (id, data) =>
  axios.put(`${BASE_URL}/api/crushers/${id}`, data);

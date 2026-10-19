// Auto-split from src/api.js — domain module: branches.js
import axios from 'axios'
import { BASE_URL } from './http'

// Branches
export const getBranches = () =>
  axios.get(`${BASE_URL}/api/branches`);
export const createBranch = (data) =>
  axios.post(`${BASE_URL}/api/branches`, data);
export const updateBranch = (id, data) => {
  if (!id) {
    return Promise.reject(new Error('Branch ID is required'))
  }
  console.log('[API] Updating branch:', id, 'Data:', data, 'URL:', `${BASE_URL}/api/branches/${id}`)
  return axios.patch(`${BASE_URL}/api/branches/${id}`, data);
};
export const deleteBranch = (id) =>
  axios.delete(`${BASE_URL}/api/branches/${id}`);
export const saveBranchesOrder = (data) =>
  axios.post(`${BASE_URL}/api/branches/save-order`, data);

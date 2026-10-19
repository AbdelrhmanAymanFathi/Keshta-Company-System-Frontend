// Auto-split from src/api.js — domain module: treasuries.js
import axios from 'axios'
import { BASE_URL, appendLangParam } from './http'

// Treasuries
export const getTreasuries = (params = {}) => {
  const { includeArchived = false } = params;
  const query = includeArchived ? `?includeArchived=true` : '';
  const url = includeArchived ? `${BASE_URL}/api/treasuries${query}` : `${BASE_URL}/api/treasuries/active`;
  return axios.get(url);
};
export const createTreasury = (data) =>
  axios.post(`${BASE_URL}/api/treasuries`, data);
export const updateTreasury = (id, data) =>
  axios.patch(`${BASE_URL}/api/treasuries/${id}`, data);
export const archiveTreasury = (id) =>
  axios.post(`${BASE_URL}/api/treasuries/${id}/archive`);
export const unarchiveTreasury = (id) =>
  axios.post(`${BASE_URL}/api/treasuries/${id}/unarchive`);
export const deleteTreasury = (id) =>
  archiveTreasury(id);
export const restoreTreasury = (id) =>
  unarchiveTreasury(id);
export const getTreasuryPurgePreview = (id) =>
  axios.get(`${BASE_URL}/api/treasuries/${id}/purge-preview`);
export const purgeTreasury = (id) =>
  axios.delete(`${BASE_URL}/api/treasuries/${id}/purge`);
export const saveTreasuriesOrder = (data) =>
  axios.post(`${BASE_URL}/api/treasuries/save-order`, data);
export const getTreasurySummary = (treasuryId) =>
  axios.get(`${BASE_URL}/api/treasuries/${treasuryId}/summary`);
export const getTreasuryTransactions = (treasuryId, params = {}) => {
  const { page = 1, pageSize = 20, startDate = '', endDate = '', type = '', search = '', amount = '', sortOrder = '' } = params;
  const queryParams = new URLSearchParams(appendLangParam({
    page: page.toString(),
    pageSize: pageSize.toString()
  }));
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (type) queryParams.append('type', type);
  if (search) queryParams.append('search', search);
  if (amount !== '' && amount !== null && amount !== undefined) queryParams.append('amount', String(amount));
  return axios.get(`${BASE_URL}/api/treasuries/${treasuryId}/transactions?${queryParams.toString()}`);
};
export const downloadTreasuryTransactions = (treasuryId, params = {}, format = 'xlsx') => {
  const sanitized = Object.fromEntries(
    Object.entries({ ...params, format }).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
  const queryParams = appendLangParam(sanitized);
  const search = new URLSearchParams(queryParams).toString();
  return axios.get(`${BASE_URL}/api/treasuries/${treasuryId}/transactions/export${search ? `?${search}` : ''}`, {
    responseType: 'arraybuffer',
    withCredentials: true
  });
};
export const downloadTreasurySummary = (treasuryId, params = {}, format = 'xlsx') => {
  const sanitized = Object.fromEntries(
    Object.entries({ ...params, format }).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
  const queryParams = appendLangParam(sanitized);
  const search = new URLSearchParams(queryParams).toString();
  return axios.get(`${BASE_URL}/api/treasuries/${treasuryId}/transactions/summary-export${search ? `?${search}` : ''}`, {
    responseType: 'arraybuffer',
    withCredentials: true
  });
};

export const depositToTreasury = (treasuryId, data) =>
  axios.post(`${BASE_URL}/api/treasuries/${treasuryId}/deposit`, data);
export const transferBetweenTreasuries = (data) =>
  axios.post(`${BASE_URL}/api/treasuries/transfer`, data);
// Direct deposits and transfers, edited/deleted from the treasury ledger
export const updateTreasuryMovement = (transactionId, data) =>
  axios.patch(`${BASE_URL}/api/treasuries/transactions/${transactionId}`, data);
export const deleteTreasuryMovement = (transactionId) =>
  axios.delete(`${BASE_URL}/api/treasuries/transactions/${transactionId}`);

// Branch Wallet APIs
export const getBranchWalletSummary = (branchId) =>
  axios.get(`${BASE_URL}/api/branches/${branchId}/wallet/summary`);
export const getBranchWalletTransactions = (branchId, params = {}) => {
  const { page = 1, pageSize = 20 } = params;
  const queryParams = new URLSearchParams(appendLangParam({
    page: page.toString(),
    pageSize: pageSize.toString()
  }));
  return axios.get(`${BASE_URL}/api/branches/${branchId}/wallet/transactions?${queryParams.toString()}`);
};
export const depositToBranchWallet = (branchId, data) =>
  axios.post(`${BASE_URL}/api/branches/${branchId}/wallet/deposit`, data);
// If withdraw endpoint exists, add it here:
export const withdrawFromBranchWallet = (branchId, data) =>
  axios.post(`${BASE_URL}/api/branches/${branchId}/wallet/withdraw`, data);
export const transferFromBranchToCompany = (branchId, data) =>
  axios.post(`${BASE_URL}/api/branches/${branchId}/wallet/transfer-to-company`, data);
export const transferFromBranchToBranch = (fromBranchId, data) =>
  axios.post(`${BASE_URL}/api/branches/${fromBranchId}/wallet/transfer-to-branch`, data);

// Auto-split from src/api.js — domain module: changes.js
import axios from 'axios'
import { BASE_URL, withLangQuery } from './http'

// Changes by Date (Admin-only endpoints) — supports fromDate/toDate range, with date fallback
function buildChangesQuery(params = {}) {
  const query = new URLSearchParams();
  if (typeof params === 'string') {
    query.append('fromDate', params);
  } else {
    if (params.fromDate) query.append('fromDate', params.fromDate);
    else if (params.date) query.append('fromDate', params.date);
    if (params.toDate) query.append('toDate', params.toDate);
  }
  return query;
}

export const getExportsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(withLangQuery(`${BASE_URL}/api/supplies/changes`, Object.fromEntries(query.entries())));
};

export const getLocationsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/locations/changes?${query.toString()}`);
};

export const getContractorsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/contractors/changes?${query.toString()}`);
};

export const getCrushersChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/crushers/changes?${query.toString()}`);
};

export const getTransportsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(withLangQuery(`${BASE_URL}/api/transports/changes`, Object.fromEntries(query.entries())));
};

export const getEquipmentLogsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs/changes`, Object.fromEntries(query.entries())));
};

export const getPaymentsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/payments/changes?${query.toString()}`);
};

export const getExtractsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/extracts/changes?${query.toString()}`);
};

export const getVehiclesChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/vehicles/changes?${query.toString()}`);
};

export const getCompanyWalletTransactionsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/company/wallet/transactions/changes?${query.toString()}`);
};

export const getExpensesChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/expenses/changes?${query.toString()}`);
};

export const getRentalsChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/rentals/changes?${query.toString()}`);
};

export const getBranchesChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/branches/changes?${query.toString()}`);
};

export const getPetroleumSuppliesChanges = (params) => {
  const query = buildChangesQuery(params);
  return axios.get(`${BASE_URL}/api/petroleum-supplies/changes?${query.toString()}`);
};

// Unified transactions — combines expenses + payments sorted by date descending
export const getTransactions = (params = {}) => {
  const { fromDate = '', toDate = '', page = 1, pageSize = 20 } = params;
  const query = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (fromDate) query.append('fromDate', fromDate);
  if (toDate) query.append('toDate', toDate);
  return axios.get(`${BASE_URL}/api/transactions?${query.toString()}`);
};

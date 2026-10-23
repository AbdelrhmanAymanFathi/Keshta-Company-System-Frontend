// Auto-split from src/api.js — domain module: company.js
import axios from 'axios'
import { BASE_URL, getCurrentApiLang } from './http'

// Company Wallet & Finance
export const getCompanyTransactions = (params = {}) => {
  const {
    page = 1,
    pageSize = 10,
    startDate = '',
    endDate = '',
    type = '',
    search = '',
  } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  queryParams.append('lang', getCurrentApiLang());
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (type) queryParams.append('type', type);
  if (search) queryParams.append('search', search);
  return axios.get(`${BASE_URL}/api/company/wallet/transactions?${queryParams.toString()}`);
};
export const depositToCompanyWallet = (data) =>
  axios.post(`${BASE_URL}/api/company/wallet/deposit`, data);
export const withdrawFromCompanyWallet = (data) =>
  axios.post(`${BASE_URL}/api/company/wallet/withdraw`, data);
export const transferFromCompanyToBranch = (data) =>
  axios.post(`${BASE_URL}/api/company/wallet/transfer-to-branch`, data);
export const getCompany = () =>
  axios.get(`${BASE_URL}/api/company`);
export const getCompanySummary = () =>
  axios.get(`${BASE_URL}/api/company/summary`);

// Company Expenses (branchId = NULL)
export const getCompanyExpenses = (params = {}) => {
  const { 
    page = 1, 
    pageSize = 20, 
    q, 
    classification, 
    branchId, 
    locationId, 
    startDate, 
    endDate,
    includeSummary 
  } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  // Only append non-empty, non-null, non-undefined values
  if (q) queryParams.append('q', q);
  if (params.categoryId !== undefined && params.categoryId !== null) queryParams.append('categoryId', params.categoryId.toString());
  if (params.subCategoryId !== undefined && params.subCategoryId !== null) queryParams.append('subCategoryId', params.subCategoryId.toString());
  if (params.kind) queryParams.append('kind', params.kind);
  if (classification) queryParams.append('classification', classification);
  if (branchId !== undefined && branchId !== null) queryParams.append('branchId', branchId.toString());
  if (locationId !== undefined && locationId !== null) queryParams.append('locationId', locationId.toString());
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (includeSummary) queryParams.append('includeSummary', '1');
  return axios.get(`${BASE_URL}/api/company/expenses?${queryParams.toString()}`);
};

// Branch Expenses
export const getBranchExpenses = (branchId, params = {}) => {
  const { 
    page = 1, 
    pageSize = 20, 
    q, 
    categoryId, 
    subCategoryId,
    kind,
    classification, 
    locationId, 
    startDate, 
    endDate,
    includeSummary 
  } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  // Only append non-empty, non-null, non-undefined values
  if (q) queryParams.append('q', q);
  if (categoryId !== undefined && categoryId !== null) queryParams.append('categoryId', categoryId.toString());
  if (subCategoryId !== undefined && subCategoryId !== null) queryParams.append('subCategoryId', subCategoryId.toString());
  if (kind) queryParams.append('kind', kind);
  if (classification) queryParams.append('classification', classification);
  if (locationId !== undefined && locationId !== null) queryParams.append('locationId', locationId.toString());
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (includeSummary) queryParams.append('includeSummary', '1');
  return axios.get(`${BASE_URL}/api/branches/${branchId}/expenses?${queryParams.toString()}`);
};

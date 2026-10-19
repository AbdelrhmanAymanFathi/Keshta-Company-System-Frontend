// Auto-split from src/api.js — domain module: expenses.js
import axios from 'axios'
import { BASE_URL } from './http'

// Expenses (general endpoint - for ExpensesList.vue)
export const getExpenses = (params = {}) => {
  const { 
    page = 1, 
    pageSize = 20, 
    q, 
    categoryId, 
    kind,
    branchId, 
    locationId, 
    treasuryId,
    paymentMethod,
    startDate, 
    endDate,
    includeSummary,
    sortField = 'date',
    sortOrder = 'desc'
  } = params;
  const subCategoryId = params.subCategoryId ?? params.subCategoryId;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  // Only append non-empty, non-null, non-undefined values
  if (sortField) queryParams.append('sortField', String(sortField));
  if (sortOrder) queryParams.append('sortOrder', String(sortOrder));
  if (q) queryParams.append('q', q);
  if (categoryId !== undefined && categoryId !== null && categoryId !== '') queryParams.append('categoryId', categoryId.toString());
  if (subCategoryId !== undefined && subCategoryId !== null && subCategoryId !== '') queryParams.append('subCategoryId', subCategoryId.toString());
  if (kind) queryParams.append('kind', kind);
  if (branchId !== undefined && branchId !== null && branchId !== '') queryParams.append('branchId', branchId.toString());
  if (locationId !== undefined && locationId !== null && locationId !== '') queryParams.append('locationId', locationId.toString());
  if (treasuryId !== undefined && treasuryId !== null && treasuryId !== '') queryParams.append('treasuryId', treasuryId.toString());
  if (paymentMethod) queryParams.append('paymentMethod', paymentMethod);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (params.settlementDateStart) queryParams.append('settlementDateStart', params.settlementDateStart);
  if (params.settlementDateEnd) queryParams.append('settlementDateEnd', params.settlementDateEnd);
  if (params.amountSearch) queryParams.append('amountSearch', String(params.amountSearch).trim());
  if (includeSummary) queryParams.append('includeSummary', '1');
  return axios.get(`${BASE_URL}/api/expenses?${queryParams.toString()}`);
};
export const getExpense = (id) =>
  axios.get(`${BASE_URL}/api/expenses/${id}`);
export const createExpense = (data) =>
  axios.post(`${BASE_URL}/api/expenses`, data);
export const updateExpense = (id, data) =>
  axios.patch(`${BASE_URL}/api/expenses/${id}`, data);
export const deleteExpense = (id) =>
  axios.delete(`${BASE_URL}/api/expenses/${id}`);
export const getExpensesReport = (params = {}, format = 'xlsx') => {
  const axiosParams = { ...params };
  if (format) axiosParams.format = format;
  const search = new URLSearchParams(axiosParams).toString();
  const url = `${BASE_URL}/api/expenses/report${search ? `?${search}` : ''}`;
  return axios.get(url, { responseType: 'blob', withCredentials: true });
};

// Expenses Report - Get JSON data by default (same pattern as getRentalReportData)
export const getExpensesReportData = async (params = {}, format = 'json') => {
  const url = `${BASE_URL}/api/expenses/report`;
  let axiosParams = { ...params };

  if (format === 'json') {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  if (format === 'xlsx' || format === 'csv' || format === 'pdf') {
    axiosParams.format = format;
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  // fallback: json
  const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
  return { data: resp.data, headers: resp.headers };

  // If HEAD indicated an Excel/zip/binary, fetch as arraybuffer and parse
  // if (contentType && (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || contentType.includes('application/zip') || contentType.includes('application/octet-stream') || contentType.includes('application/vnd.ms-excel'))) {
  //   const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
  //   const headers = resp.headers || {};
  //   try {
  //     const data = new Uint8Array(resp.data);
  //     const workbook = XLSX.read(data, { type: 'array' });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];
  //     const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
  //     return { data: { items: json }, headers };
  //   } catch (e) {
  //     console.error('Failed to parse Excel from expenses report:', e);
  //     return { data: resp.data, headers };
  //   }
  // }

  // // HEAD was inconclusive or not allowed: do a safe GET with default behaviour and fallback parsing
  // try {
  //   const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
  //   return { data: resp.data, headers: resp.headers };
  // } catch (err) {
  //   // If server responded with binary or parsing failed, try fetching arraybuffer and attempt to parse JSON or Excel
  //   if (err.response && err.response.data) {
  //     try {
  //       const resp2 = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
  //       const headers = resp2.headers || {};
  //       const ct = (headers['content-type'] || '').toLowerCase();
  //       if (ct.includes('application/json') || ct.includes('text/')) {
  //         const text = new TextDecoder('utf-8').decode(resp2.data);
  //         return { data: JSON.parse(text), headers };
  //       }
  //       // Parse as Excel
  //       try {
  //         const data = new Uint8Array(resp2.data);
  //         const workbook = XLSX.read(data, { type: 'array' });
  //         const sheetName = workbook.SheetNames[0];
  //         const sheet = workbook.Sheets[sheetName];
  //         const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
  //         return { data: { items: json }, headers };
  //       } catch (e) {
  //         console.error('Failed fallback Excel parse:', e);
  //         return { data: resp2.data, headers };
  //       }
  //     } catch (e2) {
  //       throw err; // rethrow original
  //     }
  //   }
  //   throw err;
  // }
};

// Expenses Summary - totals for all rows matching filters (not paginated)
export const getExpensesSummary = async (params = {}) => {
  const resp = await axios.get(`${BASE_URL}/api/expenses/summary`, { params });
  return resp.data;
};

export const downloadExpensesReport = async (params = {}, format = 'xlsx') => {
  return getExpensesReportData(params, format);
};

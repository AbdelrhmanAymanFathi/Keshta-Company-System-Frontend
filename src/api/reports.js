// Auto-split from src/api.js — domain module: reports.js
import axios from 'axios'
import { BASE_URL, appendLangParam } from './http'

// Reports
// Supplies/Exports Report - Get JSON data by default (same pattern as getRentalReportData)
export const getSuppliesReportData = async (params = {}, format = 'json') => {
  const url = `${BASE_URL}/api/supplies/report`;
  let axiosParams = appendLangParam({ ...params });

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
};

export const downloadSuppliesReport = async (params = {}, format = 'xlsx') => {
  return getSuppliesReportData(params, format);
};

// Deprecated: use getSuppliesReportData instead
export const getSuppliesReport = (params = {}) => {
  const search = new URLSearchParams(appendLangParam(params)).toString();
  const url = `${BASE_URL}/api/supplies/report${search ? `?${search}` : ''}`;
  return axios.get(url, { responseType: 'blob' });
};

export const getContractorsActivityReportData = async (params = {}, format = 'json') => {
  const url = `${BASE_URL}/api/reports/contractors-activity`;
  let axiosParams = appendLangParam({ ...params });

  if (format === 'json') {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  if (format === 'excel' || format === 'pdf' || format === 'xlsx') {
    const exportUrl = `${BASE_URL}/api/reports/contractors-activity/export`;
    axiosParams.format = format === 'xlsx' ? 'excel' : format;
    const resp = await axios.get(exportUrl, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
  return { data: resp.data, headers: resp.headers };
};

export const downloadContractorsActivityReport = async (params = {}, format = 'xlsx') => {
  return getContractorsActivityReportData(params, format);
};

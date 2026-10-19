// Auto-split from src/api.js — domain module: items.js
import axios from 'axios'
import { BASE_URL, getCurrentApiLang, appendLangParam, withLangQuery } from './http'

export function normalizeItemMode(mode = '') {
  const value = String(mode || '').trim().toLowerCase();
  if (!value) return '';
  if (['supply', 'supplies', 'export', 'exports'].includes(value)) return 'supply';
  if (['extract', 'extracts'].includes(value)) return 'extracts';
  if (['transport', 'transports'].includes(value)) return 'transport';
  return value;
}

export function shouldIncludeItemForMode(item, mode = '') {
  const normalizedMode = normalizeItemMode(mode);
  if (!normalizedMode) return true;

  if (normalizedMode === 'supply') {
    return item?.availableForSupplies === true;
  }
  if (normalizedMode === 'extracts') {
    return item?.availableForExtracts === true || item?.availableForExports === true;
  }
  if (normalizedMode === 'transport') {
    return item?.availableForTransports === true;
  }

  return true;
}

export function filterItemsPayload(payload, mode = '') {
  const normalizedMode = normalizeItemMode(mode);
  if (!normalizedMode) return payload;

  if (Array.isArray(payload)) {
    return payload.filter(item => shouldIncludeItemForMode(item, normalizedMode));
  }

  if (payload && Array.isArray(payload.items)) {
    return {
      ...payload,
      items: payload.items.filter(item => shouldIncludeItemForMode(item, normalizedMode))
    };
  }

  if (payload && Array.isArray(payload.data)) {
    return {
      ...payload,
      data: payload.data.filter(item => shouldIncludeItemForMode(item, normalizedMode))
    };
  }

  return payload;
}

// --- Items & Units API (used by ItemList.vue) ---
export const getItems = (params = {}) => {
  const normalizedMode = normalizeItemMode(params.mode);
  const search = new URLSearchParams(appendLangParam({ ...params, ...(normalizedMode ? { mode: normalizedMode } : {}) })).toString();
  const url = `${BASE_URL}/api/items${search ? `?${search}` : ''}`;
  return axios.get(url).then(res => {
    res.data = filterItemsPayload(res.data, normalizedMode);
    return res;
  });
}

export const createItem = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/items`), data);

export const updateItem = (id, data) =>
  axios.put(withLangQuery(`${BASE_URL}/api/items/${id}`), data);

export const deleteItem = (id, params = {}) => {
  const query = new URLSearchParams();
  if (params.mode) query.append('mode', params.mode);
  query.append('lang', getCurrentApiLang());
  const q = query.toString();
  return axios.delete(`${BASE_URL}/api/items/${id}${q ? `?${q}` : ''}`);
}

export const getUnits = (params = {}) => {
  const search = new URLSearchParams(appendLangParam(params)).toString();
  return axios.get(`${BASE_URL}/api/units${search ? `?${search}` : ''}`);
}

export const createUnit = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/units`), data);

export const updateUnit = (id, data) =>
  axios.put(withLangQuery(`${BASE_URL}/api/units/${id}`), data);

export const deleteUnit = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/units/${id}`));

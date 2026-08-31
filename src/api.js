import axios from 'axios';
// import * as XLSX from 'xlsx';

// Base URL for API requests - loaded from .env file
const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:8080';
// const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';

// Token management utilities
class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.refreshTimer = null;
    this.isRefreshing = false;
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('accessToken');
  }

  // Set token in localStorage and axios headers
  setToken(token) {
    localStorage.setItem('accessToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove token from localStorage and axios headers
  removeToken() {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
  }

  // Decode JWT token to get expiration time
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired or will expire soon (within 5 minutes)
  isTokenExpired(token) {
    if (!token) return true;
    
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const bufferTime = 5 * 60; // 5 minutes buffer
    
    return (expirationTime - currentTime) < bufferTime;
  }

  // Refresh token with retry mechanism
  async refreshToken() {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
// old async performance refresh
  // async _performRefresh() {
  //   try {
  //     console.log('Refreshing token...');
  //     const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     const newToken = response.data?.accessToken;
  //     if (newToken) {
  //       this.setToken(newToken);
  //       console.log('Token refreshed successfully');
        
  //       // Schedule next refresh
  //       this.scheduleTokenRefresh(newToken);
        
  //       return newToken;
  //     } else {
  //       throw new Error('No access token in refresh response');
  //     }
  //   } catch (error) {
  //     console.error('Token refresh failed:', error);
  //     this.removeToken();
  //     this.clearRefreshTimer();
      
  //     // Redirect to login or emit event
  //     this.handleRefreshFailure();
  //     throw error;
  //   }
  // }


  // new functhion 
  async _performRefresh() {
  const TIMEOUT_MS = 10000; // 10s timeout
  const hasAbort = typeof AbortController !== 'undefined';
  const controller = hasAbort ? new AbortController() : null;
  let timeoutId = null;
  if (controller) timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log('[API] Refreshing token (using fetch with abort support)...');

    const resp = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // important if server uses httpOnly cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: controller ? controller.signal : undefined
    });

    if (timeoutId) clearTimeout(timeoutId);

    console.debug('[API][refresh][fetch] status:', resp.status);

    // try parse as json
    let data = null;
    try {
      data = await resp.json();
    } catch (e) {
      console.warn('[API][refresh] failed to parse JSON body:', e);
    }

    const newToken = data?.accessToken || data?.access_token || data?.token || null;

    if (newToken) {
      this.setToken(newToken);
      console.log('[API] Token refreshed successfully (via fetch)');
      this.scheduleTokenRefresh(newToken);
      return newToken;
    }

    // cookie-based refresh: 200 OK and empty/absent body
    if (resp.status === 200 && (!data || Object.keys(data).length === 0)) {
      console.log('[API][refresh] 200 OK with empty body — server may use httpOnly cookie for session.');
      return null;
    }

    const text = data ? JSON.stringify(data) : await resp.text().catch(()=>null);
    throw new Error(`No access token in refresh response (status ${resp.status}) - body: ${text}`);
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);

    if (error?.name === 'AbortError' || error?.name === 'CanceledError') {
      console.error('[API][refresh] aborted (timeout).');
    } else {
      console.error('[API][refresh] fetch error or other:', error);
    }

    // cleanup and logout
    try { this.removeToken(); this.clearRefreshTimer(); } catch(e){/*ignore*/}

    this.handleRefreshFailure();

    throw error;
  }
}


  // Schedule automatic token refresh
  scheduleTokenRefresh(token) {
    this.clearRefreshTimer();
    
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const refreshTime = (expirationTime - currentTime - 5 * 60) * 1000; // 5 minutes before expiration

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch(error => {
          console.error('Scheduled token refresh failed:', error);
        });
      }, refreshTime);
      
      console.log(`Next token refresh scheduled in ${Math.floor(refreshTime / 1000 / 60)} minutes`);
    }
  }

  // Clear refresh timer
  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Handle refresh failure
  handleRefreshFailure() {
    // Clear any stored tokens
    this.removeToken();
    this.clearRefreshTimer();
    
    // Emit event or redirect to login
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'token_refresh_failed' } 
    }));
    
    // Optionally redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Initialize token management
  initialize() {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.setToken(token);
      this.scheduleTokenRefresh(token);
    } else if (token) {
      // Token exists but is expired, try to refresh
      this.refreshToken().catch(() => {
        // If refresh fails, user will be redirected to login
      });
    }
  }
}

// Create global token manager instance
const tokenManager = new TokenManager();

// Ensure cookies are sent for refresh/logout endpoints that rely on httpOnly cookies
axios.defaults.withCredentials = true;

// --- AUTH ---
export const login = (data) =>
  axios.post(`${BASE_URL}/api/auth/login`, data);

// Complete login with TOTP challenge
export const loginWith2fa = (data) =>
  axios.post(`${BASE_URL}/api/auth/login/2fa`, data);

export const register = (data) =>
  axios.post(`${BASE_URL}/api/auth/register`, data);

export const refreshToken = () =>
  axios.post(`${BASE_URL}/api/auth/refresh`);

export const logout = () => {
  tokenManager.clearRefreshTimer();
  tokenManager.removeToken();
  return axios.post(`${BASE_URL}/api/auth/logout`);
};

// Users
export const getUsers = (params = {}) => {
  const { page = 1, pageSize = 20, q = '' } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (q) {
    queryParams.append('q', q);
  }
  return axios.get(`${BASE_URL}/api/users?${queryParams.toString()}`);
};
export const getUserRoles = () =>
  axios.get(`${BASE_URL}/api/users/roles`);
export const createUser = (data) =>
  axios.post(`${BASE_URL}/api/users`, data);
export const updateUser = (id, data) =>
  axios.patch(`${BASE_URL}/api/users/${id}`, data);
export const deleteUser = (id) =>
  axios.delete(`${BASE_URL}/api/users/${id}`);

// Admin: reset a user's password
export const adminResetUserPassword = (userId, data = {}) =>
  axios.post(`${BASE_URL}/api/auth/admin/users/${userId}/reset`, data);

// User: change own password
export const changePassword = (data = {}) =>
  axios.post(`${BASE_URL}/api/auth/password/change`, data);

// Contractors — mode query values: supply | transport | rentals | extract
// Backend aliases: rental→rentals, extracts→extract, equipmentlogs→rentals
function normalizeContractorMode(mode = '') {
  const value = String(mode || '').trim().toLowerCase();
  if (!value) return '';
  if (['supply', 'supplies', 'export', 'exports'].includes(value)) return 'supply';
  if (['extract', 'extracts'].includes(value)) return 'extract';
  if (['transport', 'transports'].includes(value)) return 'transport';
  if (['rental', 'rentals', 'equipment', 'equipmentlog', 'equipmentlogs', 'equipment-logs', 'equipment_logs'].includes(value)) return 'rentals';
  return value;
}

function shouldIncludeContractorForMode(contractor, mode = '') {
  const normalizedMode = normalizeContractorMode(mode);
  if (!normalizedMode) return true;

  if (normalizedMode === 'supply') {
    return contractor?.availableForSupplies === true || contractor?.availableForExports === true;
  }
  if (normalizedMode === 'extract') {
    return contractor?.availableForExtracts === true || contractor?.availableForExports === true;
  }
  if (normalizedMode === 'transport') {
    return contractor?.availableForTransports === true;
  }
  if (normalizedMode === 'rentals') {
    return contractor?.availableForRentals === true || contractor?.availableForEquipmentRental === true;
  }

  return true;
}

function filterContractorsPayload(payload, mode = '') {
  const normalizedMode = normalizeContractorMode(mode);
  if (!normalizedMode) return payload;

  if (Array.isArray(payload)) {
    return payload.filter(contractor => shouldIncludeContractorForMode(contractor, normalizedMode));
  }

  if (payload && Array.isArray(payload.items)) {
    return {
      ...payload,
      items: payload.items.filter(contractor => shouldIncludeContractorForMode(contractor, normalizedMode))
    };
  }

  if (payload && Array.isArray(payload.data)) {
    return {
      ...payload,
      data: payload.data.filter(contractor => shouldIncludeContractorForMode(contractor, normalizedMode))
    };
  }

  return payload;
}

export const getContractors = (params = {}) => {
  const { page = 1, pageSize = 20, q = '', mode = '', unitId = '' } = params;
  const normalizedMode = normalizeContractorMode(mode);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    perPage: pageSize.toString(),
  });
  if (normalizedMode) queryParams.append('mode', normalizedMode);
  if (unitId !== undefined && unitId !== null && unitId !== '') queryParams.append('unitId', unitId.toString());
  if (q) queryParams.append('q', q);
  return axios.get(`${BASE_URL}/api/contractors?${queryParams.toString()}`).then(res => {
    res.data = filterContractorsPayload(res.data, normalizedMode);
    return res;
  });
};
export const createContractor = (data) =>
  axios.post(`${BASE_URL}/api/contractors`, data).then(res => {
    // Normalize returned data: backend may return single object or array
    try {
      res.normalized = Array.isArray(res.data) ? res.data : [res.data];
    } catch (e) {
      res.normalized = [res.data];
    }
    return res;
  });
export const updateContractor = (id, data) => {
  console.log('[API] Updating contractor:', id, 'Data:', data, 'URL:', `${BASE_URL}/api/contractors/${id}`);
  return axios.patch(`${BASE_URL}/api/contractors/${id}`, data);
};
// Fetch single contractor by id
export const getContractor = (id) => axios.get(`${BASE_URL}/api/contractors/${id}`);
// Delete contractor by id — backend expects RESTful resource path (/api/contractors/:id)
// Note: many backends return 204 No Content for successful deletes; axios will resolve
// with response.status === 204 and an empty body.
export const deleteContractor = (id, params = {}) => {
  const query = new URLSearchParams();
  const normalizedMode = normalizeContractorMode(params.mode);
  if (normalizedMode) query.append('mode', normalizedMode);
  const q = query.toString();
  return axios.delete(`${BASE_URL}/api/contractors/${id}${q ? `?${q}` : ''}`);
}

// --- Contractor Accounts / Compatibility ---
// New endpoints use `accounts`. Keep compatibility wrappers for older UI code.

export const getContractorAccounts = (contractorId) =>
  axios.get(`${BASE_URL}/api/contractors/${contractorId}/accounts`);

export const getAccountTransactions = (accountId, params = {}) => {
  const { page = 1, pageSize = 20, start = '', end = '', type = '' } = params;
  const q = new URLSearchParams(appendLangParam({ page: page.toString(), pageSize: pageSize.toString() }));
  if (start) q.append('start', start);
  if (end) q.append('end', end);
  if (type) q.append('type', type);
  return axios.get(`${BASE_URL}/api/accounts/${accountId}/transactions?${q.toString()}`);
};

export const postAccountTransaction = (accountId, payload) =>
  axios.post(`${BASE_URL}/api/accounts/${accountId}/transactions`, payload);

export const normalizeContractorAccountType = (value) => {
  if (!value) return undefined;
  const normalized = String(value).trim().toUpperCase();
  if (!normalized) return undefined;

  const aliases = {
    EXPORT: 'SUPPLY',
    SUPPLY: 'SUPPLY',
    TRANSPORT: 'TRANSPORT',
    RENTAL: 'RENTAL',
    RENTALS: 'RENTAL',
    EXTRACT: 'EXTRACT',
    EXPENSE: 'EXPENSE',
    GENERAL: 'GENERAL',
    OTHER: 'OTHER'
  };

  return aliases[normalized] || normalized;
};

const withContractorAccountContext = (data = {}) => {
  const payload = { ...data };
  const normalizedAccountType = normalizeContractorAccountType(payload.accountType || payload.mode);

  if (normalizedAccountType) {
    payload.accountType = normalizedAccountType;
    payload.mode = normalizedAccountType;
  }

  return payload;
};

// Compatibility: old wallet-style helpers. These try to use `accounts` responses when available,
// but fall back to legacy `wallet` endpoints if the server hasn't migrated yet.
export const getContractorWallet = async (contractorId, opts = {}) => {
  // opts: { accountType?: 'EXPORT'|'TRANSPORT'|..., accountId?: string }
  const { accountId } = opts || {}
  const accountType = normalizeContractorAccountType(opts?.accountType)

  // If specific accountId requested, fetch that account directly
  if (accountId) {
    try {
      const resp = await axios.get(`${BASE_URL}/api/accounts/${accountId}`)
      const acct = resp.data
      return { data: { contractorId: contractorId, balance: Number(acct.balance || 0), accounts: [acct] } }
    } catch (e) {
      // fallthrough to other methods
    }
  }

  // If accountType provided, try to fetch contractor accounts filtered by type
  if (accountType) {
    try {
      // Some backends may return a single account or array
      const res = await axios.get(`${BASE_URL}/api/contractors/${contractorId}/accounts?type=${encodeURIComponent(accountType)}`)
      const data = res.data
      const accounts = Array.isArray(data) ? data : (data && data.accounts ? data.accounts : (data ? [data] : []))
      if (accounts && accounts.length > 0) {
        const total = accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)
        return { data: { contractorId: contractorId, balance: total, accounts } }
      }
    } catch (e) {
      // fallthrough
    }
  }

  // Try to fetch full contractor resource which may include `accounts`
  try {
    const cRes = await axios.get(`${BASE_URL}/api/contractors/${contractorId}`)
    const contractor = cRes.data
    if (contractor && Array.isArray(contractor.accounts)) {
      const total = contractor.accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)
      return { data: { contractorId: contractor.id, balance: total, accounts: contractor.accounts } }
    }
  } catch (e) {
    // ignore and try legacy route
  }

  // Fallback to legacy wallet endpoint
  return axios.get(`${BASE_URL}/api/contractors/${contractorId}/wallet`)
}

export const getContractorWalletHistory = async (contractorId, opts = {}) => {
  // opts: { accountType?, accountId?, params? }
  const { accountId } = opts || {}
  const accountType = normalizeContractorAccountType(opts?.accountType)

  // If accountId provided, fetch account transactions
  if (accountId) {
    return getAccountTransactions(accountId, opts.params || {})
  }

  // If accountType provided, find the account and fetch its transactions
  if (accountType) {
    try {
      const accRes = await axios.get(withLangQuery(`${BASE_URL}/api/contractors/${contractorId}/accounts`, { type: accountType }))
      const accounts = Array.isArray(accRes.data) ? accRes.data : (accRes.data && accRes.data.accounts ? accRes.data.accounts : (accRes.data ? [accRes.data] : []))
      const acct = accounts && accounts.length > 0 ? accounts[0] : null
      if (acct && acct.id) {
        return getAccountTransactions(acct.id, opts.params || {})
      }
    } catch (e) {
      // fallthrough
    }
  }

  return axios.get(withLangQuery(`${BASE_URL}/api/contractors/${contractorId}/wallet/history`))
}

// Fetch transactions across all accounts for a contractor (merge results)
export const getContractorWalletTransactions = async (contractorId, params = {}) => {
  try {
    const accRes = await getContractorAccounts(contractorId);
    const accounts = accRes.data || [];
    // fetch transactions for each account in parallel
    const promises = accounts.map(a => getAccountTransactions(a.id, params).then(r => ({ account: a, data: r.data })).catch(() => ({ account: a, data: null })));
    const results = await Promise.all(promises);
    // Flatten into a combined structure { items: [...], accounts: [...] }
    const entries = [];
    for (const r of results) {
      if (r.data && Array.isArray(r.data.items)) {
        // include accountId on each entry if missing
        r.data.items.forEach(it => { if (!it.accountId) it.accountId = r.account.id; entries.push(it); });
      } else if (r.data && Array.isArray(r.data)) {
        r.data.forEach(it => { if (!it.accountId) it.accountId = r.account.id; entries.push(it); });
      }
    }
    return { data: { items: entries, accounts } };
  } catch (e) {
    // fallback to legacy contractor wallet transactions endpoint
    const { page = 1, pageSize = 20, start = '', end = '', type = '' } = params;
    const q = new URLSearchParams(appendLangParam({ page: page.toString(), pageSize: pageSize.toString() }));
    if (start) q.append('start', start);
    if (end) q.append('end', end);
    if (type) q.append('type', type);
    return axios.get(`${BASE_URL}/api/contractors/${contractorId}/wallet/transactions?${q.toString()}`);
  }
};

export const depositToContractorWallet = async (contractorId, data) => {
  const payload = withContractorAccountContext(data);
  console.debug('[API] depositToContractorWallet called', { contractorId, payload });

  // Case 2: if sourceTreasuryId is provided, use the direct wallet/deposit endpoint
  // which handles the atomic treasury deduction on the backend.
  if (payload && payload.sourceTreasuryId) {
    return await axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, payload);
  }

  // If caller provided accountId, use it
  if (payload && payload.accountId) {
    const accountPayload = { amount: payload.amount, type: 'CREDIT', description: payload.description, date: payload.date };
    try {
      return await postAccountTransaction(payload.accountId, accountPayload);
    } catch (err) {
      console.error('[API] depositToContractorWallet - postAccountTransaction error', {
        accountId: payload.accountId,
        accountPayload,
        error: err?.response?.data || err?.message || err
      });
      // If server error on accounts endpoint, fallback to legacy wallet deposit
      if (err?.response && err.response.status >= 500) {
        console.warn('[API] Falling back to /api/contractors/:id/wallet/deposit due to accounts endpoint error');
        try {
          return await axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, payload);
        } catch (innerErr) {
          console.error('[API] depositToContractorWallet - fallback wallet deposit also failed', innerErr?.response?.data || innerErr?.message || innerErr);
          throw innerErr;
        }
      }
      throw err;
    }
  }
  // If caller provided accountType, try to find account
  if (payload && payload.accountType) {
    try {
      const accRes = await getContractorAccounts(contractorId);
      const accounts = accRes.data || [];
      const acct = accounts.find(a => normalizeContractorAccountType(a.accountType) === payload.accountType) || accounts[0];
      if (acct) {
        try {
          return await postAccountTransaction(acct.id, { amount: payload.amount, type: 'CREDIT', description: payload.description, date: payload.date });
        } catch (err) {
          console.error('[API] depositToContractorWallet - postAccountTransaction (by accountType) error', { accountId: acct.id, error: err?.response?.data || err?.message || err });
          if (err?.response && err.response.status >= 500) {
            console.warn('[API] Falling back to /api/contractors/:id/wallet/deposit due to accounts endpoint error (accountType path)');
            try {
              return await axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, payload);
            } catch (innerErr) {
              console.error('[API] depositToContractorWallet - fallback wallet deposit also failed', innerErr?.response?.data || innerErr?.message || innerErr);
              throw innerErr;
            }
          }
          throw err;
        }
      }
    } catch (e) {
      // fallthrough
    }
  }

  // Fallback: wallet deposit endpoint
  try {
    return await axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, payload);
  } catch (err) {
    console.error('[API] depositToContractorWallet - wallet/deposit error', { contractorId, payload, error: err?.response?.data || err?.message || err });
    throw err;
  }
};

export const withdrawFromContractorWallet = async (contractorId, data) => {
  const normalized = withContractorAccountContext(data);
  const amount = Math.abs(Number(normalized?.amount || 0));
  const payload = { ...normalized, amount };

  if (payload && payload.accountId) {
    return postAccountTransaction(payload.accountId, { amount, type: 'DEBIT', description: payload.description, date: payload.date });
  }
  if (payload && payload.accountType) {
    try {
      const accRes = await getContractorAccounts(contractorId);
      const accounts = accRes.data || [];
      const acct = accounts.find(a => normalizeContractorAccountType(a.accountType) === payload.accountType) || accounts[0];
      if (acct) return postAccountTransaction(acct.id, { amount, type: 'DEBIT', description: payload.description, date: payload.date });
    } catch (e) {console.error('Error withdrawing contractor wallet with accountType:', e)}
  }

  return axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/withdraw`, payload);
};

// Contractor Report/Statement
export const getContractorReportData = async (contractorId, params = {}, format = 'json', mode = null) => {
  const url = `${BASE_URL}/api/contractors/${contractorId}/report`;
  let axiosParams = { ...params };
  const normalizedMode = normalizeContractorAccountType(mode || params.mode || params.transaction_type);

  // Add transaction_type if provided (either from params or as separate parameter)
  if (normalizedMode) {
    axiosParams.mode = normalizedMode;
    axiosParams.transaction_type = normalizedMode;
  }

  // Normalize format param and request accordingly
  if (format === 'json') {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  // Binary formats (xlsx, csv, pdf) -> request as arraybuffer
  if (format === 'xlsx' || format === 'csv' || format === 'pdf') {
    axiosParams.format = format;
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  // fallback to JSON
  const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
  return { data: resp.data, headers: resp.headers };
};

export const downloadContractorReport = async (contractorId, params = {}, format = 'xlsx') => {
  return getContractorReportData(contractorId, params, format);
};

// === Report Definitions (Dynamic Reports) ===
export const getReportDefs = (params = {}) => {
  const { page = 1, pageSize = 100, q = '' } = params
  const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() })
  if (q) query.append('q', q)
  return axios.get(`${BASE_URL}/api/report-defs?${query.toString()}`)
}
export const getReportDef = (id) => axios.get(`${BASE_URL}/api/report-defs/${id}`)
export const createReportDef = (data) => axios.post(`${BASE_URL}/api/report-defs`, data)
export const updateReportDef = (id, data) => axios.put(`${BASE_URL}/api/report-defs/${id}`, data)
export const deleteReportDef = (id) => axios.delete(`${BASE_URL}/api/report-defs/${id}`)
// Fetch available report modules (returns { modules: [...] })
export const getReportModules = () => axios.get(`${BASE_URL}/api/report-defs/modules`)

export const getReportParamOptions = (id, paramName, paramsObj = {}) => {
  const qs = new URLSearchParams()
  qs.append('lang', getCurrentApiLang())
  
  // Handle legacy string parameter (q) or new object format
  if (typeof paramsObj === 'string') {
    if (paramsObj) qs.append('q', paramsObj)
  } else if (typeof paramsObj === 'object' && paramsObj !== null) {
    // Add all parameters from the object (including q, contractorId, etc.)
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        qs.append(key, String(value))
      }
    })
  }
  
  return axios.get(`${BASE_URL}/api/report-defs/${id}/params/options?param=${encodeURIComponent(paramName)}${qs.toString() ? `&${qs.toString()}` : ''}`)
}

export const executeReport = (id, body, options = {}) => {
  const { format, shape, lang, ...axiosConfig } = options || {}
  const query = new URLSearchParams()
  if (format) query.append('format', format)
  if (shape) query.append('shape', shape)
  if (lang) query.append('lang', lang)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return axios.post(`${BASE_URL}/api/report-defs/${id}/execute${suffix}`, body, axiosConfig)
}

// --- Helpers for creating reports from database tables ---
export const getReportTables = () => axios.get(`${BASE_URL}/api/report-defs/tables`)
export const getTableFields = (tableName) => axios.get(`${BASE_URL}/api/report-defs/tables/${encodeURIComponent(tableName)}/fields`)
export const createReportFromTable = (data) => axios.post(`${BASE_URL}/api/report-defs/generate`, data)
export const updateReportFromTable = (id, data) => axios.put(`${BASE_URL}/api/report-defs/generate/${id}`, data)

// === TOTP (2FA) ===
export const startTotpRegister = (data = {}) =>
  axios.post(`${BASE_URL}/api/auth/totp/register`, data);

export const confirmTotpRegister = (data = {}) =>
  axios.post(`${BASE_URL}/api/auth/totp/confirm`, data);

export const listTotpDevices = () =>
  axios.get(`${BASE_URL}/api/auth/totp/devices`);

export const deleteTotpDevice = (id) =>
  axios.delete(`${BASE_URL}/api/auth/totp/devices/${id}`);

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

// Locations
export const getLocations = () =>
  axios.get(`${BASE_URL}/api/locations`);
// Expense Categories (hierarchical: categories with nested subCategories)
export const getExpenseCategories = () =>
  axios.get(`${BASE_URL}/api/expense-categories`);

// Expense Categories CRUD (admin)
export const createExpenseCategory = (data) =>
  axios.post(`${BASE_URL}/api/expense-categories`, data);

export const updateExpenseCategory = (id, data) =>
  axios.patch(`${BASE_URL}/api/expense-categories/${id}`, data);

export const deleteExpenseCategory = (id) =>
  axios.delete(`${BASE_URL}/api/expense-categories/${id}`);

// Expense SubCategories CRUD (admin)
export const createExpenseSubCategory = (categoryId, data) =>
  axios.post(`${BASE_URL}/api/expense-categories/${categoryId}/sub-categories`, data);

export const updateExpenseSubCategory = (id, data) =>
  axios.patch(`${BASE_URL}/api/expense-categories/sub-categories/${id}`, data);

export const deleteExpenseSubCategory = (id) =>
  axios.delete(`${BASE_URL}/api/expense-categories/sub-categories/${id}`);

export const createLocation = (data) =>
  axios.post(`${BASE_URL}/api/locations`, data);
export const updateLocation = (id, data) =>
  axios.patch(`${BASE_URL}/api/locations/${id}`, data);
export const deleteLocation = (id) =>
  axios.delete(`${BASE_URL}/api/locations`, { data: { id } });

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
export const saveTreasuriesOrder = (data) =>
  axios.post(`${BASE_URL}/api/treasuries/save-order`, data);
export const getTreasurySummary = (treasuryId) =>
  axios.get(`${BASE_URL}/api/treasuries/${treasuryId}/summary`);
export const getTreasuryTransactions = (treasuryId, params = {}) => {
  const { page = 1, pageSize = 20, startDate = '', endDate = '', type = '', search = '', amountMin = '', amountMax = '', sortOrder = '' } = params;
  const queryParams = new URLSearchParams(appendLangParam({
    page: page.toString(),
    pageSize: pageSize.toString()
  }));
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (type) queryParams.append('type', type);
  if (search) queryParams.append('search', search);
  if (amountMin !== '' && amountMin !== null && amountMin !== undefined) queryParams.append('amountMin', String(amountMin));
  if (amountMax !== '' && amountMax !== null && amountMax !== undefined) queryParams.append('amountMax', String(amountMax));
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
export const depositToTreasury = (treasuryId, data) =>
  axios.post(`${BASE_URL}/api/treasuries/${treasuryId}/deposit`, data);
export const transferBetweenTreasuries = (data) =>
  axios.post(`${BASE_URL}/api/treasuries/transfer`, data);

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

// Vehicles
export const getVehicles = (params = {}) => {
  const { page = 1, pageSize = 20, q = '' } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    perPage: pageSize.toString(),
    mode: params.mode || 'all' // pass mode if provided (e.g., 'transport' or 'export')
  });
  if (q) {
    queryParams.append('q', q);
  }
  return axios.get(withLangQuery(`${BASE_URL}/api/vehicles`, Object.fromEntries(queryParams.entries())));
};
export const createVehicle = (data) =>
  axios.post(`${BASE_URL}/api/vehicles`, data);
export const updateVehicle = (id, data) =>
  axios.patch(`${BASE_URL}/api/vehicles/${id}`, data);
export const deleteVehicle = (id, params = {}) => {
  const query = new URLSearchParams();
  if (params.mode) query.append('mode', params.mode);
  const q = query.toString();
  return axios.delete(`${BASE_URL}/api/vehicles/${id}${q ? `?${q}` : ''}`);
}

// Vehicle ownership
export const changeVehicleOwner = (vehicleId, data) =>
  axios.post(`${BASE_URL}/api/vehicles/${vehicleId}/change-owner`, data);

export const getVehicleOwnershipHistory = (vehicleId) =>
  axios.get(`${BASE_URL}/api/vehicles/${vehicleId}/ownership-history`);

// Contractors with vehicles
export const getContractorsWithVehicles = (options = true) => {
  const opts = typeof options === 'boolean' ? { onlyWithVehicles: options } : (options || {});
  const normalizedMode = normalizeContractorMode(opts.mode);
  const params = new URLSearchParams();
  if (opts.onlyWithVehicles !== false) {
    params.append('onlyWithVehicles', 'true');
  }
  if (normalizedMode) {
    params.append('mode', normalizedMode);
  }
  return axios.get(withLangQuery(`${BASE_URL}/api/contractors/with-vehicles`, Object.fromEntries(params.entries()))).then(res => {
    res.data = filterContractorsPayload(res.data, normalizedMode);
    return res;
  });
};

// --- Drivers ---
export const getDrivers = (params = {}) => {
  const { page = 1, pageSize = 20, q = '' } = params;
  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (q) queryParams.append('q', q);
  return axios.get(`${BASE_URL}/api/drivers?${queryParams.toString()}`);
};

export const createDriver = (data) =>
  axios.post(`${BASE_URL}/api/drivers`, data);

export const updateDriver = (id, data) =>
  axios.patch(`${BASE_URL}/api/drivers/${id}`, data);

export const deleteDriver = (id) =>
  axios.delete(`${BASE_URL}/api/drivers/${id}`);

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


// Exports (Deliveries)
export const getDeliveries = (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    q = '',
    startDate = '',
    endDate = '',
    contractorId = '',
    locationId = '',
    crusherId = '',
    itemId = '',
    vehicleId = ''
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });

  // Add optional filters if they have values
  if (q) queryParams.append('q', q);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (contractorId) queryParams.append('contractorId', contractorId.toString());
  if (locationId) queryParams.append('locationId', locationId.toString());
  if (crusherId) queryParams.append('crusherId', crusherId.toString());
  if (itemId) queryParams.append('itemId', itemId.toString());
  if (vehicleId) queryParams.append('vehicleId', vehicleId.toString());

  return axios.get(withLangQuery(`${BASE_URL}/api/supplies`, Object.fromEntries(queryParams.entries())));
};


export const deleteDelivery = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/supplies/${id}`));

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

// Transports
export const getTransports = (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    q = '',
    startDate = '',
    endDate = '',
    contractorId = '',
    locationId = '',
    areaId = '',
    itemId = '',
    vehicleId = ''
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });

  if (q) queryParams.append('q', q);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (contractorId !== undefined && contractorId !== null && contractorId !== '') queryParams.append('contractorId', contractorId.toString());
  if (locationId !== undefined && locationId !== null && locationId !== '') queryParams.append('locationId', locationId.toString());
  if (areaId !== undefined && areaId !== null && areaId !== '') queryParams.append('areaId', areaId.toString());
  if (itemId !== undefined && itemId !== null && itemId !== '') queryParams.append('itemId', itemId.toString());
  if (vehicleId !== undefined && vehicleId !== null && vehicleId !== '') queryParams.append('vehicleId', vehicleId.toString());

  return axios.get(withLangQuery(`${BASE_URL}/api/transports`, Object.fromEntries(queryParams.entries())));
};
export const getTransport = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/transports/${id}`));
// Sanitize transport payloads to the new flat model (remove legacy lines/flags)
function sanitizeTransportPayload(payload = {}) {
  const p = { ...payload };
  delete p.transportLines;
  delete p.paid;
  delete p.unpaid;
  delete p.total; // server computes total
  return p;
}

export const createTransport = (data) => {
  const payload = sanitizeTransportPayload(data);
  // ensure accountType is provided so backend can record transaction against correct account
  if (!payload.accountType) payload.accountType = 'TRANSPORT';
  return axios.post(withLangQuery(`${BASE_URL}/api/transports`), payload);
}

export const updateTransport = (id, data) => {
  const payload = sanitizeTransportPayload(data);
  return axios.patch(withLangQuery(`${BASE_URL}/api/transports/${id}`), payload);
}
export const deleteTransport = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/transports/${id}`));

// Extracts
export const createExtract = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/extracts`), data);

export const updateExtract = (id, data) =>
  axios.put(withLangQuery(`${BASE_URL}/api/extracts/${id}`), data);

export const getExtract = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/extracts/${id}`));

export const deleteExtract = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/extracts/${id}`));

export const getExtractsForContractor = (contractorId, start, end) => {
  const params = {};
  if (start) params.startDate = start;
  if (end) params.endDate = end;
  return axios.get(`${BASE_URL}/api/extracts/contractor/${contractorId}`, { params: appendLangParam(params) });
};

export const getExtracts = (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    q = '',
    startDate = '',
    endDate = '',
    contractorId = '',
    locationId = '',
    crusherId = '',
    itemId = '',
    vehicleId = ''
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (q) queryParams.append('q', q);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (contractorId) queryParams.append('contractorId', contractorId.toString());
  if (locationId) queryParams.append('locationId', locationId.toString());
  if (crusherId) queryParams.append('crusherId', crusherId.toString());
  if (itemId) queryParams.append('itemId', itemId.toString());
  if (vehicleId) queryParams.append('vehicleId', vehicleId.toString());

  return axios.get(withLangQuery(`${BASE_URL}/api/extracts`, Object.fromEntries(queryParams.entries())));
};

// Equipment Logs (migrated from Rentals)
// NOTE: Rental resources were migrated to the equipment-logs API.
// Keep the equipment-logs helpers as the canonical API surface.
export const getRentals = (params = {}) => {
  const { page = 1, pageSize = 20, q = '', isCompanyOwned = null } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (q) {
    queryParams.append('q', q);
  }
  if (isCompanyOwned !== null && isCompanyOwned !== undefined) {
    // Map legacy isCompanyOwned -> isRental false/true if possible; keep param name
    queryParams.append('isCompanyOwned', isCompanyOwned.toString());
  }
  // Route to equipment-logs listing endpoint
  return axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs`, Object.fromEntries(queryParams.entries())));
};
export const getRental = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`));
export const createRental = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/equipment-logs`), data);
export const updateRental = (id, data) =>
  axios.patch(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`), data);
export const deleteRental = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`));
export const getRentalPayouts = (rentalId) =>
  axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs/${rentalId}/payouts`));
export const createRentalPayout = (rentalId, data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/equipment-logs/${rentalId}/payouts`), data);
export const deleteRentalPayout = (rentalId, payoutId) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/equipment-logs/${rentalId}/payouts/${payoutId}`));

// Rental Jobs
export const getRentalJobs = (rentalId) => {
  // Compatibility wrapper: fetch equipment logs by equipmentId
  return getEquipmentLogs({ equipmentId: rentalId })
}
export const createRentalJob = (rentalId, data) => {
  // Ensure payload contains equipmentId for new equipment-log
  const payload = { ...data, equipmentId: data.equipmentId || rentalId }
  return createEquipmentLog(payload)
}
export const updateRentalJob = (rentalId, jobId, data) => {
  // jobId is the equipment-log id now
  return updateEquipmentLog(jobId, data)
}
export const deleteRentalJob = (rentalId, jobId) => {
  // jobId is the equipment-log id
  return deleteEquipmentLog(jobId)
}
export const getRentalJobsSummary = (rentalId) => {
  return getEquipmentLogsSummary({ equipmentId: rentalId })
}

// Equipment Logs (new API surface replacing rental jobs)
// List: /api/equipment-logs?q=&equipmentId=&startDate=&endDate=&isRental=&driverId=&page=&pageSize=
export const getEquipmentLogs = (params = {}) => {
  const { page = 1, pageSize = 100, q = '', equipmentId, startDate, endDate, isRental, locationId, areaId, driverId } = params
  const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() })
  if (q) query.append('q', q)
  if (equipmentId !== undefined && equipmentId !== null) query.append('equipmentId', equipmentId)
  if (startDate) query.append('startDate', startDate)
  if (endDate) query.append('endDate', endDate)
  if (typeof isRental !== 'undefined' && isRental !== null) query.append('isRental', isRental ? 'true' : 'false')
  if (driverId !== undefined && driverId !== null && driverId !== '') query.append('driverId', String(driverId))
  if (locationId !== undefined && locationId !== null && locationId !== '') query.append('locationId', String(locationId))
  if (areaId !== undefined && areaId !== null && areaId !== '') query.append('areaId', String(areaId))
  // Log params and the final URL so we can trace why filters may be missing
  try { console.log('[api] getEquipmentLogs params:', params) } catch (e) { /* ignore */ }
  const url = withLangQuery(`${BASE_URL}/api/equipment-logs`, Object.fromEntries(query.entries()))
  try { console.log('[api] getEquipmentLogs URL:', url) } catch (e) { /* ignore in old browsers */ }
  return axios.get(url)
}

// Create a new equipment log (body: { equipmentId, date, hourlyRate?, hours, note, isRental })
export const createEquipmentLog = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/equipment-logs`), data)

// Update equipment log by id
export const updateEquipmentLog = (id, data) =>
  axios.patch(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`), data)

// Delete equipment log by id
export const deleteEquipmentLog = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/equipment-logs/${id}`))

// Equipment logs summary (generic query params)
export const getEquipmentLogsSummary = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v))
  })
  return axios.get(withLangQuery(`${BASE_URL}/api/equipment-logs/summary`, Object.fromEntries(q.entries())))
}

export const getEquipmentLogsReportData = async (params = {}, format = 'json') => {
  const url = `${BASE_URL}/api/equipment-logs/report`;
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

  // fallback
  const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
  return { data: resp.data, headers: resp.headers };
};

export const downloadEquipmentLogsReport = async (params = {}, format = 'xlsx') => {
  return getEquipmentLogsReportData(params, format);
};

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
    includeSummary 
  } = params;
  const subCategoryId = params.subCategoryId ?? params.subCategoryId;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  // Only append non-empty, non-null, non-undefined values
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

// Export token manager for external use
export { tokenManager };

// Helper function to refresh and set token (backward compatibility)
export async function refreshAndSetToken() {
  return await tokenManager.refreshToken();
}

// Enhanced request interceptor
axios.interceptors.request.use(
  config => {
    const token = tokenManager.getToken();
    
    // Check if token is expired before making request
    if (token && tokenManager.isTokenExpired(token)) {
      console.log('Token expired, refreshing before request...');
      // Don't wait for refresh, let response interceptor handle it
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for PATCH/PUT requests to contractors
    if ((config.method === 'patch' || config.method === 'put') && config.url && config.url.includes('/api/contractors/')) {
      // config.url is already the full URL when using BASE_URL in the function
      console.log(`[API Request] ${config.method.toUpperCase()} to contractors:`, {
        url: config.url,
        baseURL: config.baseURL,
        fullURL: config.url.startsWith('http') ? config.url : `${config.baseURL || BASE_URL}${config.url}`,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
axios.interceptors.response.use(
  response => {
    // Update token if it's in the response (for login/refresh)
    if (response.data?.accessToken) {
      tokenManager.setToken(response.data.accessToken);
      tokenManager.scheduleTokenRefresh(response.data.accessToken);
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 304 Not Modified — browser cached version is in error.response.data
    if (error.response && error.response.status === 304) {
      return error.response;
    }

    // Log detailed error information for debugging — but ignore noisy 404s for DELETE
    if (error.response) {
      const status = error.response.status
      const method = (originalRequest && originalRequest.method) ? originalRequest.method.toLowerCase() : ''

      // Suppress console noise for expected errors like 404, 409
      if (status === 404 && (method === 'delete' || originalRequest.url?.includes('unread-count'))) {
        // Resource already deleted or unread-count endpoint not available
      } else if (status === 409) {
        // Conflict errors (e.g., item in use) - handled by component with toast
      } else {
        console.error('API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          responseData: error.response.data,
          url: originalRequest.url,
          method: originalRequest.method,
          requestData: originalRequest.data
        });
      }
    } else if (error.request) {
      console.error('API Error Request:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    
    // Handle 401 Unauthorized errors
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/api/auth/refresh') // Don't retry refresh endpoint
    ) {
      originalRequest._retry = true;
      
      try {
        console.log('Attempting to refresh token due to 401 error...');
        await tokenManager.refreshToken();
        
        // Update the authorization header with new token
        const newToken = tokenManager.getToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed, logging out user:', refreshError);
        tokenManager.handleRefreshFailure();
        return Promise.reject(refreshError);
      }
    }

    // If backend returned 502 Bad Gateway — notify the frontend to show a friendly error overlay
    if (error.response && error.response.status === 502) {
      try {
        window.dispatchEvent(new CustomEvent('app:error', { detail: { code: 502, message: error.response.data?.message || 'Bad Gateway' } }))
      } catch (e) {
        // ignore if running server-side
      }
      // suppress additional error logging for 502
    }
    
    return Promise.reject(error);
  }
);

// Initialize token management when module loads
tokenManager.initialize();

// --- Additional Transport helpers ---
export const calculateTransportFare = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/transports/calculate-fare`), data);

export const getTransportReport = (params = {}) => {
  const search = new URLSearchParams(appendLangParam(params)).toString();
  const url = `${BASE_URL}/api/transports/report${search ? `?${search}` : ''}`;
  return axios.get(url, { responseType: 'blob' });
};

// Transport Report - Get JSON data by default (same pattern as getRentalReportData)
export const getTransportReportData = async (params = {}, options = { download: false }) => {
  const url = `${BASE_URL}/api/transports/report`;
  let axiosParams = appendLangParam({ ...params });
  if (options && options.download) {
    axiosParams.format = 'xlsx';
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  } else {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }
};

export const downloadTransportReport = async (params = {}, format = 'xlsx') => {
  const resp = await axios.get(`${BASE_URL}/api/transports/report`, {
    params: appendLangParam({ ...params, format }),
    responseType: 'arraybuffer',
    withCredentials: true
  });
  return { data: resp.data, headers: resp.headers };
};

// --- Additional API helpers ---
export const getTransportById = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/transports/${id}`));

// --- Export Items API ---
// Exports (parent entity with lines)
export const getExports = (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    q = '',
    startDate = '',
    endDate = '',
    contractorId = '',
    locationId = '',
    areaId = '',
    itemId = '',
    vehicleId = ''
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });

  if (q) queryParams.append('q', q);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (contractorId !== undefined && contractorId !== null && contractorId !== '') queryParams.append('contractorId', contractorId.toString());
  if (locationId !== undefined && locationId !== null && locationId !== '') queryParams.append('locationId', locationId.toString());
  if (areaId !== undefined && areaId !== null && areaId !== '') queryParams.append('areaId', areaId.toString());
  if (itemId !== undefined && itemId !== null && itemId !== '') queryParams.append('itemId', itemId.toString());
  if (vehicleId !== undefined && vehicleId !== null && vehicleId !== '') queryParams.append('vehicleId', vehicleId.toString());

  return axios.get(withLangQuery(`${BASE_URL}/api/supplies`, Object.fromEntries(queryParams.entries())));
};

export const getExport = (id) =>
  axios.get(withLangQuery(`${BASE_URL}/api/supplies/${id}`));

// Sanitize export payloads to the new flat shape expected by the server
function sanitizeExportPayload(payload = {}) {
  const p = { ...payload };
  // Remove line-based fields and payment flags that backend no longer expects
  delete p.exportLines;
  delete p.paid;
  delete p.unpaid;
  delete p.total; // server computes total
  return p;
}

export const createExport = (data) => {
  const payload = sanitizeExportPayload(data);
  if (!payload.accountType) payload.accountType = 'EXPORT';
  return axios.post(withLangQuery(`${BASE_URL}/api/supplies`), payload);
}

export const updateExport = (id, data) => {
  const payload = sanitizeExportPayload(data);
  return axios.put(withLangQuery(`${BASE_URL}/api/supplies/${id}`), payload);
}

export const deleteExport = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/supplies/${id}`));

export const restoreExport = (id) =>
  axios.post(withLangQuery(`${BASE_URL}/api/supplies/${id}/restore`));

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
// Fetch payments for a specific export (document-level endpoint)
export const getExportPayments = (exportId) => {
  if (!exportId) return Promise.resolve({ data: [] });
  return axios.get(withLangQuery(`${BASE_URL}/api/supplies/${exportId}/payments`));
};

function getCurrentApiLang() {
  try {
    const locale = localStorage.getItem('app-locale') || 'en';
    return locale === 'ar' ? 'ar' : 'en';
  } catch (error) {
    return 'en';
  }
}

function appendLangParam(params = {}) {
  const normalized = { ...(params || {}) };
  if (!normalized.lang) normalized.lang = getCurrentApiLang();
  return normalized;
}

function withLangQuery(url, params = {}) {
  const query = new URLSearchParams(appendLangParam(params));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return `${url}${suffix}`;
}

function normalizeItemMode(mode = '') {
  const value = String(mode || '').trim().toLowerCase();
  if (!value) return '';
  if (['supply', 'supplies', 'export', 'exports'].includes(value)) return 'supply';
  if (['extract', 'extracts'].includes(value)) return 'extracts';
  if (['transport', 'transports'].includes(value)) return 'transport';
  return value;
}

function shouldIncludeItemForMode(item, mode = '') {
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

function filterItemsPayload(payload, mode = '') {
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

export const getExportItems = (params = {}) => {
  const normalizedMode = normalizeItemMode(params.mode || 'supply');
  const search = new URLSearchParams(appendLangParam({ ...params, mode: normalizedMode })).toString();
  const url = `${BASE_URL}/api/items${search ? `?${search}` : ''}`;
  return axios.get(url).then(res => {
    res.data = filterItemsPayload(res.data, normalizedMode);
    return res;
  });
};

export const createExportItem = (data) =>
  axios.post(withLangQuery(`${BASE_URL}/api/items`), data);

export const updateExportItem = (id, data) =>
  axios.put(withLangQuery(`${BASE_URL}/api/items/${id}`), data);

export const deleteExportItem = (id) =>
  axios.delete(withLangQuery(`${BASE_URL}/api/items/${id}`));

// --- Supply aliases (new names mapping to existing Export functions) ---
// These provide a migration path: prefer `getSupplies/createSupply/etc` going forward.
export const getSupplies = getExports;
export const getSupply = getExport;
export const createSupply = createExport;
export const updateSupply = updateExport;
export const deleteSupply = deleteExport;
export const restoreSupply = restoreExport;
export const createSupplyItem = createExportItem;
export const updateSupplyItem = updateExportItem;
export const deleteSupplyItem = deleteExportItem;
export const getSupplyPayments = getExportPayments;
export const getSuppliesChanges = getExportsChanges;


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

// --- Approvals API ---
export const getApprovals = (status = 'PENDING') =>
  axios.get(withLangQuery(`${BASE_URL}/api/approvals`), { params: { status } });

export const approveRequest = (id) =>
  axios.post(withLangQuery(`${BASE_URL}/api/approvals/${id}/approve`));

export const rejectRequest = (id, notes) =>
  axios.post(withLangQuery(`${BASE_URL}/api/approvals/${id}/reject`), { notes });

// --- Dashboard APIs ---
function dashParams(p) {
  const q = {}
  if (p?.fromDate) q.fromDate = p.fromDate
  if (p?.toDate) q.toDate = p.toDate
  return q
}

export const getDashboardSummary = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/summary`, { params: dashParams(params) })

export const getCashFlowTrend = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/cash-flow-trend`, { params: { ...dashParams(params), groupBy: params.groupBy || 'month' } })

export const getExpensesByClassification = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/expenses-by-classification`, { params: dashParams(params) })

export const getExpensesGrouped = (params = {}) =>
  axios.get(`${BASE_URL}/api/expenses/items/grouped`, { params: { ...dashParams(params), groupBy: params.groupBy || 'category' } })

export const getMonthlyComparison = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/monthly-comparison`, { params: { months: params.months || 12 } })

export const getPaymentsByType = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/payments-by-type`, { params: dashParams(params) })

export const getTreasuryOverview = () =>
  axios.get(`${BASE_URL}/api/dashboard/treasury-overview`)

export const getTopContractors = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/top-contractors`, { params: { ...dashParams(params), limit: params.limit || 10 } })

export const getModuleActivity = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/module-activity`, { params: dashParams(params) })

export const getPetroleumTrend = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/petroleum-trend`, { params: { ...dashParams(params), groupBy: params.groupBy || 'month' } })

export const getWalletTrend = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/wallet-trend`, { params: { ...dashParams(params), groupBy: params.groupBy || 'month' } })

export const getExpensesTrend = (params = {}) =>
  axios.get(`${BASE_URL}/api/dashboard/expenses-trend`, { params: { ...dashParams(params), groupBy: params.groupBy || 'day' } })

export const getApprovalStats = () =>
  axios.get(`${BASE_URL}/api/dashboard/approval-stats`)

export const getRecentActivity = (params = {}) => {
  const q = { page: params.page || 1, pageSize: params.pageSize || 10 }
  if (params.module) q.module = params.module
  return axios.get(`${BASE_URL}/api/dashboard/recent-activity`, { params: q })
}

// --- Notifications ---
export const getNotifications = (params = {}) => {
  const { page = 1, pageSize = 20, unreadOnly, type, startDate, endDate } = params
  const q = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() })
  if (unreadOnly) q.set('unreadOnly', unreadOnly)
  if (type) q.set('type', type)
  if (startDate) q.set('startDate', startDate)
  if (endDate) q.set('endDate', endDate)
  return axios.get(`${BASE_URL}/api/notifications?${q.toString()}`)
}

export const getUnreadNotificationCount = () =>
  axios.get(`${BASE_URL}/api/notifications/unread-count`)

export const markNotificationRead = (id) =>
  axios.patch(`${BASE_URL}/api/notifications/${id}/read`)

export const markAllNotificationsRead = () =>
  axios.patch(`${BASE_URL}/api/notifications/read-all`)

// --- Admin: Database Backup & Restore ---
export const downloadDatabaseBackup = () =>
  axios.get(`${BASE_URL}/api/admin/backup/download`, { responseType: 'blob', timeout: 0 })

export const restoreDatabaseBackup = (file, onProgress) =>
  axios.post(`${BASE_URL}/api/admin/backup/restore`, file, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Backup-Filename': encodeURIComponent(file.name || 'backup.dump')
    },
    timeout: 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    onUploadProgress: onProgress
  })

export const getDatabaseBackupLogs = (params = {}) => {
  const { page = 1, pageSize = 20 } = params
  return axios.get(`${BASE_URL}/api/admin/backup/logs`, { params: { page, pageSize } })
}

export const listDatabaseBackupFiles = () =>
  axios.get(`${BASE_URL}/api/admin/backup/files`)

export const downloadDatabaseBackupFile = (name) =>
  axios.get(`${BASE_URL}/api/admin/backup/files/${encodeURIComponent(name)}`, { responseType: 'blob', timeout: 0 })

export const getServerLogFiles = () =>
  axios.get(`${BASE_URL}/api/admin/logs`)

export const getServerLogFile = (name, lines = 200) =>
  axios.get(`${BASE_URL}/api/admin/logs/files/${encodeURIComponent(name)}`, {
    params: { lines },
  })

export const downloadServerLogFile = (name) =>
  axios.get(`${BASE_URL}/api/admin/logs/files/${encodeURIComponent(name)}/download`, { responseType: 'blob', timeout: 0 })


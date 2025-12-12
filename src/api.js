import axios from 'axios';
import * as XLSX from 'xlsx';

// Base URL for API requests - loaded from .env file
const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';

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
export const getUsers = () =>
  axios.get(`${BASE_URL}/api/users`);
export const createUser = (data) =>
  axios.post(`${BASE_URL}/api/users`, data);
export const deleteUser = (id) =>
  axios.delete(`${BASE_URL}/api/users`, { data: { id } });

// Contractors
// TODO: Backend does not yet support pagination for contractors list. Inform backend team if pagination is required.
export const getContractors = () =>
  axios.get(`${BASE_URL}/api/contractors`);
export const createContractor = (data) =>
  axios.post(`${BASE_URL}/api/contractors`, data);
// Delete contractor by id — backend expects RESTful resource path (/api/contractors/:id)
// Note: many backends return 204 No Content for successful deletes; axios will resolve
// with response.status === 204 and an empty body.
export const deleteContractor = (id) =>
  axios.delete(`${BASE_URL}/api/contractors/${id}`);

// Contractor Wallet APIs
export const getContractorWallet = (contractorId) =>
  axios.get(`${BASE_URL}/api/contractors/${contractorId}/wallet`);

export const getContractorWalletHistory = (contractorId) =>
  axios.get(`${BASE_URL}/api/contractors/${contractorId}/wallet/history`);

export const depositToContractorWallet = (contractorId, data) =>
  axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, data);

// Crushers
// TODO: Backend does not yet support pagination for crushers list. Inform backend team if pagination is required.
export const getCrushers = () =>
  axios.get(`${BASE_URL}/api/crushers`);
export const createCrusher = (data) =>
  axios.post(`${BASE_URL}/api/crushers`, data);
export const deleteCrusher = (id) =>
  axios.delete(`${BASE_URL}/api/crushers`, { data: { id } });

// Locations
export const getLocations = () =>
  axios.get(`${BASE_URL}/api/locations`);
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

// Branch Wallet APIs
export const getBranchWalletSummary = (branchId) =>
  axios.get(`${BASE_URL}/api/branches/${branchId}/wallet/summary`);
export const getBranchWalletTransactions = (branchId, params = {}) => {
  const { page = 1, pageSize = 20 } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  return axios.get(`${BASE_URL}/api/branches/${branchId}/wallet/transactions?${queryParams.toString()}`);
};
export const depositToBranchWallet = (branchId, data) =>
  axios.post(`${BASE_URL}/api/branches/${branchId}/wallet/deposit`, data);
// If withdraw endpoint exists, add it here:
export const withdrawFromBranchWallet = (branchId, data) =>
  axios.post(`${BASE_URL}/api/branches/${branchId}/wallet/withdraw`, data);

// Vehicles
// TODO: Backend does not yet support pagination for vehicles list. Inform backend team if pagination is required.
export const getVehicles = () =>
  axios.get(`${BASE_URL}/api/vehicles`);
export const createVehicle = (data) =>
  axios.post(`${BASE_URL}/api/vehicles`, data);
export const deleteVehicle = (id) =>
  axios.delete(`${BASE_URL}/api/vehicles`, { data: { id } });

// --- Drivers & Vehicle history ---
// Drivers CRUD
// TODO: Backend does not yet support pagination for drivers list. Inform backend team if pagination is required.
export const getDrivers = (params = {}) =>
  axios.get(`${BASE_URL}/api/drivers`, { params });

export const createDriver = (data) =>
  axios.post(`${BASE_URL}/api/drivers`, data);

export const updateDriver = (id, data) =>
  axios.patch(`${BASE_URL}/api/drivers/${id}`, data);

export const deleteDriver = (id) =>
  axios.delete(`${BASE_URL}/api/drivers/${id}`);

// Vehicle ownership & driver assignment
export const changeVehicleOwner = (vehicleId, data) =>
  axios.post(`${BASE_URL}/api/vehicles/${vehicleId}/change-owner`, data);

export const getVehicleOwnershipHistory = (vehicleId) =>
  axios.get(`${BASE_URL}/api/vehicles/${vehicleId}/ownership-history`);

export const assignVehicleDriver = (vehicleId, data) =>
  axios.post(`${BASE_URL}/api/vehicles/${vehicleId}/assign-driver`, data);

export const getVehicleDriverHistory = (vehicleId) =>
  axios.get(`${BASE_URL}/api/vehicles/${vehicleId}/driver-history`);

// Contractors with vehicles
export const getContractorsWithVehicles = (onlyWithVehicles = true) => {
  const params = new URLSearchParams();
  if (onlyWithVehicles) {
    params.append('onlyWithVehicles', 'true');
  }
  return axios.get(`${BASE_URL}/api/contractors/with-vehicles?${params.toString()}`);
};

// Exports (Deliveries)
// TODO: Backend does not yet support pagination for supplies/deliveries list. Inform backend team if pagination is required.
export const getDeliveries = () =>
  axios.get(`${BASE_URL}/api/exports`);
export const createDelivery = (data) =>
  axios.post(`${BASE_URL}/api/exports`, data);
export const deleteDelivery = (id) =>
  axios.delete(`${BASE_URL}/api/exports`, { data: { id } });

// Reports
// Supplies/Exports Report - Get JSON data by default (same pattern as getRentalReportData)
export const getSuppliesReportData = async (params = {}, format = 'json') => {
  const url = `${BASE_URL}/api/exports/report`;
  let axiosParams = { ...params };
  if (format === 'json') {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  } else if (format === 'xlsx') {
    axiosParams.format = 'xlsx';
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  } else {
    // fallback: just get json
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }
};

export const downloadSuppliesReport = async (params = {}) => {
  return getSuppliesReportData(params, 'xlsx');
};

// Deprecated: use getSuppliesReportData instead
export const getSuppliesReport = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/exports/report${search ? `?${search}` : ''}`;
  return axios.get(url, { responseType: 'blob' });
};

// Transports
// TODO: Backend does not yet support pagination for transports list. Inform backend team if pagination is required.
export const getTransports = () =>
  axios.get(`${BASE_URL}/api/transports`);
export const getTransport = (id) =>
  axios.get(`${BASE_URL}/api/transports/${id}`);
export const createTransport = (data) =>
  axios.post(`${BASE_URL}/api/transports`, data);
export const updateTransport = (id, data) =>
  axios.patch(`${BASE_URL}/api/transports/${id}`, data);
export const deleteTransport = (id) =>
  axios.delete(`${BASE_URL}/api/transports/${id}`);

// Rentals
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
    queryParams.append('isCompanyOwned', isCompanyOwned.toString());
  }
  return axios.get(`${BASE_URL}/api/rentals?${queryParams.toString()}`);
};
export const getRental = (id) =>
  axios.get(`${BASE_URL}/api/rentals/${id}`);
export const createRental = (data) =>
  axios.post(`${BASE_URL}/api/rentals`, data);
export const updateRental = (id, data) =>
  axios.patch(`${BASE_URL}/api/rentals/${id}`, data);
export const deleteRental = (id) =>
  axios.delete(`${BASE_URL}/api/rentals/${id}`);
export const getRentalPayouts = (rentalId) =>
  axios.get(`${BASE_URL}/api/rentals/${rentalId}/payouts`);
export const createRentalPayout = (rentalId, data) =>
  axios.post(`${BASE_URL}/api/rentals/${rentalId}/payouts`, data);
export const deleteRentalPayout = (rentalId, payoutId) =>
  axios.delete(`${BASE_URL}/api/rentals/${rentalId}/payouts/${payoutId}`);

export const getRentalReportData = async (params = {}, format = 'json') => {
  const url = `${BASE_URL}/api/rentals/report`;
  let axiosParams = { ...params };
  if (format === 'xlsx') {
    axiosParams.format = 'xlsx';
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  } else {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }
};

export const downloadRentalReport = async (params = {}) => {
  return getRentalReportData(params, 'xlsx');
};

// Company Wallet & Finance
export const getCompanyTransactions = (params = {}) => {
  const { page = 1, pageSize = 10 } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  return axios.get(`${BASE_URL}/api/company/wallet/transactions?${queryParams.toString()}`);
};
export const depositToCompanyWallet = (data) =>
  axios.post(`${BASE_URL}/api/company/wallet/deposit`, data);
export const withdrawFromCompanyWallet = (data) =>
  axios.post(`${BASE_URL}/api/company/wallet/withdraw`, data);
export const getCompany = () =>
  axios.get(`${BASE_URL}/api/company`);
export const getCompanySummary = () =>
  axios.get(`${BASE_URL}/api/company/summary`);

// Expenses
export const getExpenses = (page = 1, pageSize = 20, search = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (search) {
    params.append('q', search);
  }
  return axios.get(`${BASE_URL}/api/expenses?${params.toString()}`);
};
export const getExpense = (id) =>
  axios.get(`${BASE_URL}/api/expenses/${id}`);
export const createExpense = (data) =>
  axios.post(`${BASE_URL}/api/expenses`, data);
export const updateExpense = (id, data) =>
  axios.patch(`${BASE_URL}/api/expenses/${id}`, data);
export const deleteExpense = (id) =>
  axios.delete(`${BASE_URL}/api/expenses/${id}`);
export const getExpensesReport = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/expenses/report${search ? `?${search}` : ''}`;
  return axios.get(url, { responseType: 'blob' });
};

// Expenses Report - Get JSON data by default (same pattern as getRentalReportData)
export const getExpensesReportData = async (params = {}, format = 'json') => {
  const url = `${BASE_URL}/api/expenses/report`;
  let axiosParams = { ...params };
  if (format === 'xlsx') {
    axiosParams.format = 'xlsx';
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  } else {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  // If HEAD indicated an Excel/zip/binary, fetch as arraybuffer and parse
  if (contentType && (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || contentType.includes('application/zip') || contentType.includes('application/octet-stream') || contentType.includes('application/vnd.ms-excel'))) {
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    const headers = resp.headers || {};
    try {
      const data = new Uint8Array(resp.data);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
      return { data: { items: json }, headers };
    } catch (e) {
      console.error('Failed to parse Excel from expenses report:', e);
      return { data: resp.data, headers };
    }
  }

  // HEAD was inconclusive or not allowed: do a safe GET with default behaviour and fallback parsing
  try {
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  } catch (err) {
    // If server responded with binary or parsing failed, try fetching arraybuffer and attempt to parse JSON or Excel
    if (err.response && err.response.data) {
      try {
        const resp2 = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
        const headers = resp2.headers || {};
        const ct = (headers['content-type'] || '').toLowerCase();
        if (ct.includes('application/json') || ct.includes('text/')) {
          const text = new TextDecoder('utf-8').decode(resp2.data);
          return { data: JSON.parse(text), headers };
        }
        // Parse as Excel
        try {
          const data = new Uint8Array(resp2.data);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
          return { data: { items: json }, headers };
        } catch (e) {
          console.error('Failed fallback Excel parse:', e);
          return { data: resp2.data, headers };
        }
      } catch (e2) {
        throw err; // rethrow original
      }
    }
    throw err;
  }
};

export const downloadExpensesReport = async (params = {}) => {
  return getExpensesReportData(params, 'xlsx');
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
    
    // Log detailed error information for debugging — but ignore noisy 404s for DELETE
    if (error.response) {
      const status = error.response.status
      const method = (originalRequest && originalRequest.method) ? originalRequest.method.toLowerCase() : ''

      // Many backends return 404 for DELETE when resource already removed —
      // this is not useful noise in the console. Suppress detailed logging for
      // DELETE+404 case to reduce clutter. Keep a concise warning instead.
      if (status === 404 && method === 'delete') {
        console.warn(`API: ${method.toUpperCase()} ${originalRequest.url} -> 404 (Not Found). Resource may already be deleted.`)
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
  axios.post(`${BASE_URL}/api/transports/calculate-fare`, data);

export const getTransportReport = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/transports/report${search ? `?${search}` : ''}`;
  return axios.get(url, { responseType: 'blob' });
};

// Transport Report - Get JSON data by default (same pattern as getRentalReportData)
export const getTransportReportData = async (params = {}, options = { download: false }) => {
  const url = `${BASE_URL}/api/transports/report`;
  let axiosParams = { ...params };
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

export const downloadTransportReport = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/api/transports/report`, {
    params: { ...params, download: 'true' },
    responseType: 'blob',
    withCredentials: true
  });
  return response;
};

// --- Additional API helpers ---
export const getTransportById = (id) =>
  axios.get(`${BASE_URL}/api/transports/${id}`);
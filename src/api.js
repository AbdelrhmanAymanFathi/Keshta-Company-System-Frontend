import axios from 'axios';
// Default to current origin so requests go through nginx in prod and 
// avoid CORS
// const BASE_URL = process.env.VUE_APP_API_BASE_URL || (typeof window !== 
// 'undefined' ? window.location.origin : 'http://127.0.0.1:8080');

// Base URL for API requests
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

  async _performRefresh() {
    try {
      console.log('Refreshing token...');
      const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const newToken = response.data?.accessToken;
      if (newToken) {
        this.setToken(newToken);
        console.log('Token refreshed successfully');
        
        // Schedule next refresh
        this.scheduleTokenRefresh(newToken);
        
        return newToken;
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.removeToken();
      this.clearRefreshTimer();
      
      // Redirect to login or emit event
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
export const getContractors = () =>
  axios.get(`${BASE_URL}/api/contractors`);
export const createContractor = (data) =>
  axios.post(`${BASE_URL}/api/contractors`, data);
export const deleteContractor = (id) =>
  axios.delete(`${BASE_URL}/api/contractors`, { data: { id } });

// Crushers
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

// Vehicles
export const getVehicles = () =>
  axios.get(`${BASE_URL}/api/vehicles`);
export const createVehicle = (data) =>
  axios.post(`${BASE_URL}/api/vehicles`, data);
export const deleteVehicle = (id) =>
  axios.delete(`${BASE_URL}/api/vehicles`, { data: { id } });

// Contractors with vehicles
export const getContractorsWithVehicles = (onlyWithVehicles = true) => {
  const params = new URLSearchParams();
  if (onlyWithVehicles) {
    params.append('onlyWithVehicles', 'true');
  }
  return axios.get(`${BASE_URL}/api/contractors/with-vehicles?${params.toString()}`);
};

// Exports (Deliveries)
export const getDeliveries = () =>
  axios.get(`${BASE_URL}/api/exports`);
export const createDelivery = (data) =>
  axios.post(`${BASE_URL}/api/exports`, data);
export const deleteDelivery = (id) =>
  axios.delete(`${BASE_URL}/api/exports`, { data: { id } });

// Reports
export const getSuppliesReport = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/exports/report${search ? `?${search}` : ''}`;
  return axios.get(url, { responseType: 'blob' });
};

// Transports
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
export const getRentals = (page = 1, pageSize = 20, search = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (search) {
    params.append('search', search);
  }
  return axios.get(`${BASE_URL}/api/rentals?${params.toString()}`);
};
export const createRental = (data) =>
  axios.post(`${BASE_URL}/api/rentals`, data);
export const updateRental = (id, data) =>
  axios.patch(`${BASE_URL}/api/rentals/${id}`, data);
export const deleteRental = (id) =>
  axios.delete(`${BASE_URL}/api/rentals/${id}`);

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
    
    // Log detailed error information for debugging
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        responseData: error.response.data,
        url: originalRequest.url,
        method: originalRequest.method,
        requestData: originalRequest.data
      });
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

// --- Additional API helpers ---
export const getTransportById = (id) =>
  axios.get(`${BASE_URL}/api/transports/${id}`);
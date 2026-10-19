// Auto-split from src/api.js — domain module: http.js
import axios from 'axios'

// import * as XLSX from 'xlsx';

// Base URL for API requests - loaded from .env file
export const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';

// Token management utilities
export class TokenManager {
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

    const resp = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // important if server uses httpOnly cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: controller ? controller.signal : undefined
    });

    if (timeoutId) clearTimeout(timeoutId);

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
      this.scheduleTokenRefresh(newToken);
      return newToken;
    }

    // cookie-based refresh: 200 OK and empty/absent body
    if (resp.status === 200 && (!data || Object.keys(data).length === 0)) {
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

// --- Global search (Ctrl+H command palette) ---
export const globalSearch = (query, params = {}) => {
  const { limit = 5 } = params;
  const qs = new URLSearchParams({ q: String(query ?? ''), limit: String(limit) });
  return axios.get(`${BASE_URL}/api/search?${qs.toString()}`);
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
      // Don't wait for refresh, let response interceptor handle it
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for PATCH/PUT requests to contractors
    if ((config.method === 'patch' || config.method === 'put') && config.url && config.url.includes('/api/contractors/')) {
      // config.url is already the full URL when using BASE_URL in the function
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
export function getCurrentApiLang() {
  try {
    const locale = localStorage.getItem('app-locale') || 'en';
    return locale === 'ar' ? 'ar' : 'en';
  } catch (error) {
    return 'en';
  }
}

export function appendLangParam(params = {}) {
  const normalized = { ...(params || {}) };
  if (!normalized.lang) normalized.lang = getCurrentApiLang();
  return normalized;
}

export function withLangQuery(url, params = {}) {
  const query = new URLSearchParams(appendLangParam(params));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return `${url}${suffix}`;
}

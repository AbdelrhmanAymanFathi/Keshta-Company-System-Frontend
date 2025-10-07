// Authentication utilities and token management
import { tokenManager } from './api';

// Auth state management
class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.listeners = [];
  }

  // Add event listener
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove event listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners
  notifyListeners(event, data = {}) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  // Set authentication state
  setAuthState(isAuthenticated, user = null) {
    this.isAuthenticated = isAuthenticated;
    this.user = user;
    this.notifyListeners('auth:stateChanged', { isAuthenticated, user });
  }

  // Get current auth state
  getAuthState() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.user,
      token: tokenManager.getToken()
    };
  }

  // Check if user is authenticated
  isLoggedIn() {
    const token = tokenManager.getToken();
    return token && !tokenManager.isTokenExpired(token);
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${process.env.VUE_APP_API_BASE_URL || 'http://38.242.152.149:3000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        tokenManager.setToken(data.accessToken);
        tokenManager.scheduleTokenRefresh(data.accessToken);
        
        // Store user data if provided
        if (data.user) {
          this.user = data.user;
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        this.setAuthState(true, this.user);
        return { success: true, data };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.setAuthState(false);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      // Clear token and timers
      tokenManager.clearRefreshTimer();
      tokenManager.removeToken();
      
      // Clear user data
      this.user = null;
      localStorage.removeItem('user');
      
      // Set auth state
      this.setAuthState(false);
      
      // Notify logout event
      this.notifyListeners('auth:logout', { reason: 'user_logout' });
      
      // Call logout API if needed
      try {
        await fetch(`${process.env.VUE_APP_API_BASE_URL || 'http://38.242.152.149:3000'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (apiError) {
        console.warn('Logout API call failed:', apiError);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Initialize auth state from stored data
  initialize() {
    try {
      // Check for stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }

      // Check if token exists and is valid
      const token = tokenManager.getToken();
      if (token && !tokenManager.isTokenExpired(token)) {
        this.setAuthState(true, this.user);
        tokenManager.scheduleTokenRefresh(token);
      } else if (token) {
        // Token exists but is expired, try to refresh
        tokenManager.refreshToken()
          .then(() => {
            this.setAuthState(true, this.user);
          })
          .catch(() => {
            this.setAuthState(false);
          });
      } else {
        this.setAuthState(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.setAuthState(false);
    }
  }

  // Handle token refresh failure
  handleTokenRefreshFailure() {
    console.log('Token refresh failed, logging out user');
    this.logout();
  }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Listen for token refresh failures
window.addEventListener('auth:logout', (event) => {
  if (event.detail?.reason === 'token_refresh_failed') {
    authManager.handleTokenRefreshFailure();
  }
});

// Initialize auth manager
authManager.initialize();

export default authManager;
export { AuthManager };



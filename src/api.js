import axios from 'axios';

const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';


// --- AUTH ---
export const login = (data) =>
  axios.post(`${BASE_URL}/api/auth/login`, data);

export const register = (data) =>
  axios.post(`${BASE_URL}/api/auth/register`, data);

export const refreshToken = () =>
  axios.post(`${BASE_URL}/api/auth/refresh`);

export const logout = () =>
  axios.post(`${BASE_URL}/api/auth/logout`);

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

// Exports (Deliveries)
export const getDeliveries = () =>
  axios.get(`${BASE_URL}/api/exports`);
export const createDelivery = (data) =>
  axios.post(`${BASE_URL}/api/exports`, data);
export const deleteDelivery = (id) =>
  axios.delete(`${BASE_URL}/api/exports`, { data: { id } });

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

// Example helper to refresh and set token (call this where needed)
export async function refreshAndSetToken() {
  try {
    const res = await refreshToken();
    const token = res?.data?.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return token;
  } catch (e) {
    // handle error (e.g., logout user)
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
    throw e;
  }
}

// Attach token to every request if available
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optionally: Auto-refresh token on 401 and retry once
axios.interceptors.response.use(
  response => response,
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
    
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const { refreshAndSetToken } = await import('./api');
        await refreshAndSetToken();
        // retry original request with new token
        return axios(originalRequest);
      } catch (e) {
        // logout user if refresh fails
        localStorage.removeItem('accessToken');
        delete axios.defaults.headers.common['Authorization'];
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

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
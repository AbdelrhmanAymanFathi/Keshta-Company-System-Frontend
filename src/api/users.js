// Auto-split from src/api.js — domain module: users.js
import axios from 'axios'
import { BASE_URL } from './http'

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

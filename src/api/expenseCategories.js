// Auto-split from src/api.js — domain module: expenseCategories.js
import axios from 'axios'
import { BASE_URL } from './http'

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

// Expense SubCategories: one master list; each main category picks from it
export const getExpenseSubCategories = () =>
  axios.get(`${BASE_URL}/api/expense-categories/sub-categories`);

export const createMasterExpenseSubCategory = (data) =>
  axios.post(`${BASE_URL}/api/expense-categories/sub-categories`, data);

// Picks a sub-item from the master list by name (created if missing) and links it to the category
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

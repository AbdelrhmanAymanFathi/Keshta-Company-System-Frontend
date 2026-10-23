// Auto-split from src/api.js — domain module: totp.js
import axios from 'axios'
import { BASE_URL } from './http'

// === TOTP (2FA) ===
export const startTotpRegister = (data = {}) =>
  axios.post(`${BASE_URL}/api/auth/totp/register`, data);

export const confirmTotpRegister = (data = {}) =>
  axios.post(`${BASE_URL}/api/auth/totp/confirm`, data);

export const listTotpDevices = () =>
  axios.get(`${BASE_URL}/api/auth/totp/devices`);

export const deleteTotpDevice = (id) =>
  axios.delete(`${BASE_URL}/api/auth/totp/devices/${id}`);

// Auto-split from src/api.js — domain module: approvals.js
import axios from 'axios'
import { BASE_URL, withLangQuery } from './http'

// --- Approvals API ---
export const getApprovals = (status = 'PENDING') =>
  axios.get(withLangQuery(`${BASE_URL}/api/approvals`), { params: { status } });

export const approveRequest = (id) =>
  axios.post(withLangQuery(`${BASE_URL}/api/approvals/${id}/approve`));

export const rejectRequest = (id, notes) =>
  axios.post(withLangQuery(`${BASE_URL}/api/approvals/${id}/reject`), { notes });

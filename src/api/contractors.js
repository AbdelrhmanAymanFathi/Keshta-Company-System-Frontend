// Auto-split from src/api.js — domain module: contractors.js
import axios from 'axios'
import { BASE_URL, appendLangParam, withLangQuery } from './http'

// Contractors — mode query values: supply | transport | rentals | extract
// Backend aliases: rental→rentals, extracts→extract, equipmentlogs→rentals
export function normalizeContractorMode(mode = '') {
  const value = String(mode || '').trim().toLowerCase();
  if (!value) return '';
  if (['supply', 'supplies', 'export', 'exports'].includes(value)) return 'supply';
  if (['extract', 'extracts'].includes(value)) return 'extract';
  if (['transport', 'transports'].includes(value)) return 'transport';
  if (['rental', 'rentals', 'equipment', 'equipmentlog', 'equipmentlogs', 'equipment-logs', 'equipment_logs'].includes(value)) return 'rentals';
  return value;
}

export function shouldIncludeContractorForMode(contractor, mode = '') {
  const normalizedMode = normalizeContractorMode(mode);
  if (!normalizedMode) return true;

  if (normalizedMode === 'supply') {
    return contractor?.availableForSupplies === true || contractor?.availableForExports === true;
  }
  if (normalizedMode === 'extract') {
    return contractor?.availableForExtracts === true || contractor?.availableForExports === true;
  }
  if (normalizedMode === 'transport') {
    return contractor?.availableForTransports === true;
  }
  if (normalizedMode === 'rentals') {
    return contractor?.availableForRentals === true || contractor?.availableForEquipmentRental === true;
  }

  return true;
}

export function filterContractorsPayload(payload, mode = '') {
  const normalizedMode = normalizeContractorMode(mode);
  if (!normalizedMode) return payload;

  if (Array.isArray(payload)) {
    return payload.filter(contractor => shouldIncludeContractorForMode(contractor, normalizedMode));
  }

  if (payload && Array.isArray(payload.items)) {
    return {
      ...payload,
      items: payload.items.filter(contractor => shouldIncludeContractorForMode(contractor, normalizedMode))
    };
  }

  if (payload && Array.isArray(payload.data)) {
    return {
      ...payload,
      data: payload.data.filter(contractor => shouldIncludeContractorForMode(contractor, normalizedMode))
    };
  }

  return payload;
}

export const getContractors = (params = {}) => {
  const { page = 1, pageSize = 20, q = '', mode = '', unitId = '' } = params;
  const normalizedMode = normalizeContractorMode(mode);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    perPage: pageSize.toString(),
  });
  if (normalizedMode) queryParams.append('mode', normalizedMode);
  if (unitId !== undefined && unitId !== null && unitId !== '') queryParams.append('unitId', unitId.toString());
  if (q) queryParams.append('q', q);
  return axios.get(`${BASE_URL}/api/contractors?${queryParams.toString()}`).then(res => {
    res.data = filterContractorsPayload(res.data, normalizedMode);
    return res;
  });
};
export const createContractor = (data) =>
  axios.post(`${BASE_URL}/api/contractors`, data).then(res => {
    // Normalize returned data: backend may return single object or array
    try {
      res.normalized = Array.isArray(res.data) ? res.data : [res.data];
    } catch (e) {
      res.normalized = [res.data];
    }
    return res;
  });
export const updateContractor = (id, data) => {
  console.log('[API] Updating contractor:', id, 'Data:', data, 'URL:', `${BASE_URL}/api/contractors/${id}`);
  return axios.patch(`${BASE_URL}/api/contractors/${id}`, data);
};
// Fetch single contractor by id
export const getContractor = (id) => axios.get(`${BASE_URL}/api/contractors/${id}`);
// Contractor «رصيد أول المدة» on one account, with any change waiting for approval
export const getContractorOpeningBalance = (id, accountType) =>
  axios.get(`${BASE_URL}/api/contractors/${id}/opening-balance`, { params: { accountType } });
// Delete contractor by id — backend expects RESTful resource path (/api/contractors/:id)
// Note: many backends return 204 No Content for successful deletes; axios will resolve
// with response.status === 204 and an empty body.
export const deleteContractor = (id, params = {}) => {
  const query = new URLSearchParams();
  const normalizedMode = normalizeContractorMode(params.mode);
  if (normalizedMode) query.append('mode', normalizedMode);
  const q = query.toString();
  return axios.delete(`${BASE_URL}/api/contractors/${id}${q ? `?${q}` : ''}`);
}

// --- Contractor Accounts / Compatibility ---
// New endpoints use `accounts`. Keep compatibility wrappers for older UI code.

export const getContractorAccounts = (contractorId) =>
  axios.get(`${BASE_URL}/api/contractors/${contractorId}/accounts`);

export const getAccountTransactions = (accountId, params = {}) => {
  const { page = 1, pageSize = 20, start = '', end = '', type = '' } = params;
  const q = new URLSearchParams(appendLangParam({ page: page.toString(), pageSize: pageSize.toString() }));
  if (start) q.append('start', start);
  if (end) q.append('end', end);
  if (type) q.append('type', type);
  return axios.get(`${BASE_URL}/api/accounts/${accountId}/transactions?${q.toString()}`);
};

export const postAccountTransaction = (accountId, payload) =>
  axios.post(`${BASE_URL}/api/accounts/${accountId}/transactions`, payload);

export const normalizeContractorAccountType = (value) => {
  if (!value) return undefined;
  const normalized = String(value).trim().toUpperCase();
  if (!normalized) return undefined;

  const aliases = {
    EXPORT: 'SUPPLY',
    SUPPLY: 'SUPPLY',
    TRANSPORT: 'TRANSPORT',
    RENTAL: 'RENTAL',
    RENTALS: 'RENTAL',
    EXTRACT: 'EXTRACT',
    EXPENSE: 'EXPENSE',
    GENERAL: 'GENERAL',
    OTHER: 'OTHER'
  };

  return aliases[normalized] || normalized;
};

const withContractorAccountContext = (data = {}) => {
  const payload = { ...data };
  const normalizedAccountType = normalizeContractorAccountType(payload.accountType || payload.mode);

  if (normalizedAccountType) {
    payload.accountType = normalizedAccountType;
    payload.mode = normalizedAccountType;
  }

  return payload;
};

// Compatibility: old wallet-style helpers. These try to use `accounts` responses when available,
// but fall back to legacy `wallet` endpoints if the server hasn't migrated yet.
export const getContractorWallet = async (contractorId, opts = {}) => {
  // opts: { accountType?: 'EXPORT'|'TRANSPORT'|..., accountId?: string }
  const { accountId } = opts || {}
  const accountType = normalizeContractorAccountType(opts?.accountType)

  // If specific accountId requested, fetch that account directly
  if (accountId) {
    try {
      const resp = await axios.get(`${BASE_URL}/api/accounts/${accountId}`)
      const acct = resp.data
      return { data: { contractorId: contractorId, balance: Number(acct.balance || 0), accounts: [acct] } }
    } catch (e) {
      // fallthrough to other methods
    }
  }

  // If accountType provided, try to fetch contractor accounts filtered by type
  if (accountType) {
    try {
      // Some backends may return a single account or array
      const res = await axios.get(`${BASE_URL}/api/contractors/${contractorId}/accounts?type=${encodeURIComponent(accountType)}`)
      const data = res.data
      const accounts = Array.isArray(data) ? data : (data && data.accounts ? data.accounts : (data ? [data] : []))
      if (accounts && accounts.length > 0) {
        const total = accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)
        return { data: { contractorId: contractorId, balance: total, accounts } }
      }
    } catch (e) {
      // fallthrough
    }
  }

  // Try to fetch full contractor resource which may include `accounts`
  try {
    const cRes = await axios.get(`${BASE_URL}/api/contractors/${contractorId}`)
    const contractor = cRes.data
    if (contractor && Array.isArray(contractor.accounts)) {
      const total = contractor.accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)
      return { data: { contractorId: contractor.id, balance: total, accounts: contractor.accounts } }
    }
  } catch (e) {
    // ignore and try legacy route
  }

  // Fallback to legacy wallet endpoint
  return axios.get(`${BASE_URL}/api/contractors/${contractorId}/wallet`)
}

export const getContractorWalletHistory = async (contractorId, opts = {}) => {
  // opts: { accountType?, accountId?, params? }
  const { accountId } = opts || {}
  const accountType = normalizeContractorAccountType(opts?.accountType)

  // If accountId provided, fetch account transactions
  if (accountId) {
    return getAccountTransactions(accountId, opts.params || {})
  }

  // If accountType provided, find the account and fetch its transactions
  if (accountType) {
    try {
      const accRes = await axios.get(withLangQuery(`${BASE_URL}/api/contractors/${contractorId}/accounts`, { type: accountType }))
      const accounts = Array.isArray(accRes.data) ? accRes.data : (accRes.data && accRes.data.accounts ? accRes.data.accounts : (accRes.data ? [accRes.data] : []))
      const acct = accounts && accounts.length > 0 ? accounts[0] : null
      if (acct && acct.id) {
        return getAccountTransactions(acct.id, opts.params || {})
      }
    } catch (e) {
      // fallthrough
    }
  }

  return axios.get(withLangQuery(`${BASE_URL}/api/contractors/${contractorId}/wallet/history`))
}

// Fetch transactions across all accounts for a contractor (merge results)
export const getContractorWalletTransactions = async (contractorId, params = {}) => {
  try {
    const accRes = await getContractorAccounts(contractorId);
    const accounts = accRes.data || [];
    // fetch transactions for each account in parallel
    const promises = accounts.map(a => getAccountTransactions(a.id, params).then(r => ({ account: a, data: r.data })).catch(() => ({ account: a, data: null })));
    const results = await Promise.all(promises);
    // Flatten into a combined structure { items: [...], accounts: [...] }
    const entries = [];
    for (const r of results) {
      if (r.data && Array.isArray(r.data.items)) {
        // include accountId on each entry if missing
        r.data.items.forEach(it => { if (!it.accountId) it.accountId = r.account.id; entries.push(it); });
      } else if (r.data && Array.isArray(r.data)) {
        r.data.forEach(it => { if (!it.accountId) it.accountId = r.account.id; entries.push(it); });
      }
    }
    return { data: { items: entries, accounts } };
  } catch (e) {
    // fallback to legacy contractor wallet transactions endpoint
    const { page = 1, pageSize = 20, start = '', end = '', type = '' } = params;
    const q = new URLSearchParams(appendLangParam({ page: page.toString(), pageSize: pageSize.toString() }));
    if (start) q.append('start', start);
    if (end) q.append('end', end);
    if (type) q.append('type', type);
    return axios.get(`${BASE_URL}/api/contractors/${contractorId}/wallet/transactions?${q.toString()}`);
  }
};

export const depositToContractorWallet = async (contractorId, data) => {
  const payload = withContractorAccountContext(data);
  console.debug('[API] depositToContractorWallet called', { contractorId, payload });

  // Case 2: if sourceTreasuryId is provided, use the direct wallet/deposit endpoint
  // which handles the atomic treasury deduction on the backend.
  if (payload && payload.sourceTreasuryId) {
    return await axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, payload);
  }

  // If caller provided accountId, use it
  if (payload && payload.accountId) {
    const accountPayload = { amount: payload.amount, type: 'CREDIT', description: payload.description, date: payload.date };
    try {
      return await postAccountTransaction(payload.accountId, accountPayload);
    } catch (err) {
      console.error('[API] depositToContractorWallet - postAccountTransaction error', {
        accountId: payload.accountId,
        accountPayload,
        error: err?.response?.data || err?.message || err
      });
      // If server error on accounts endpoint, fallback to legacy wallet deposit
      if (err?.response && err.response.status >= 500) {
        console.warn('[API] Falling back to /api/contractors/:id/wallet/deposit due to accounts endpoint error');
        try {
          return await axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, payload);
        } catch (innerErr) {
          console.error('[API] depositToContractorWallet - fallback wallet deposit also failed', innerErr?.response?.data || innerErr?.message || innerErr);
          throw innerErr;
        }
      }
      throw err;
    }
  }
  // If caller provided accountType, try to find account
  if (payload && payload.accountType) {
    try {
      const accRes = await getContractorAccounts(contractorId);
      const accounts = accRes.data || [];
      const acct = accounts.find(a => normalizeContractorAccountType(a.accountType) === payload.accountType) || accounts[0];
      if (acct) {
        try {
          return await postAccountTransaction(acct.id, { amount: payload.amount, type: 'CREDIT', description: payload.description, date: payload.date });
        } catch (err) {
          console.error('[API] depositToContractorWallet - postAccountTransaction (by accountType) error', { accountId: acct.id, error: err?.response?.data || err?.message || err });
          if (err?.response && err.response.status >= 500) {
            console.warn('[API] Falling back to /api/contractors/:id/wallet/deposit due to accounts endpoint error (accountType path)');
            try {
              return await axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, payload);
            } catch (innerErr) {
              console.error('[API] depositToContractorWallet - fallback wallet deposit also failed', innerErr?.response?.data || innerErr?.message || innerErr);
              throw innerErr;
            }
          }
          throw err;
        }
      }
    } catch (e) {
      // fallthrough
    }
  }

  // Fallback: wallet deposit endpoint
  try {
    return await axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/deposit`, payload);
  } catch (err) {
    console.error('[API] depositToContractorWallet - wallet/deposit error', { contractorId, payload, error: err?.response?.data || err?.message || err });
    throw err;
  }
};

export const withdrawFromContractorWallet = async (contractorId, data) => {
  const normalized = withContractorAccountContext(data);
  const amount = Math.abs(Number(normalized?.amount || 0));
  const payload = { ...normalized, amount };

  if (payload && payload.accountId) {
    return postAccountTransaction(payload.accountId, { amount, type: 'DEBIT', description: payload.description, date: payload.date });
  }
  if (payload && payload.accountType) {
    try {
      const accRes = await getContractorAccounts(contractorId);
      const accounts = accRes.data || [];
      const acct = accounts.find(a => normalizeContractorAccountType(a.accountType) === payload.accountType) || accounts[0];
      if (acct) return postAccountTransaction(acct.id, { amount, type: 'DEBIT', description: payload.description, date: payload.date });
    } catch (e) {console.error('Error withdrawing contractor wallet with accountType:', e)}
  }

  return axios.post(`${BASE_URL}/api/contractors/${contractorId}/wallet/withdraw`, payload);
};

// Contractor entries with no site from a source record (opening balances, manual settlements) — admin only
export const getContractorUnplacedEntries = (contractorId) =>
  axios.get(`${BASE_URL}/api/contractors/${contractorId}/unplaced-entries`);

export const setContractorEntryLocation = (contractorId, transactionId, locationId) =>
  axios.patch(`${BASE_URL}/api/contractors/${contractorId}/unplaced-entries/${transactionId}`, { locationId });

// Contractor Report/Statement
export const getContractorReportData =async (contractorId, params = {}, format = 'json', mode = null) => {
  const url = `${BASE_URL}/api/contractors/${contractorId}/report`;
  let axiosParams = { ...params };
  const normalizedMode = normalizeContractorAccountType(mode || params.mode || params.transaction_type);

  // Add transaction_type if provided (either from params or as separate parameter)
  if (normalizedMode) {
    axiosParams.mode = normalizedMode;
    axiosParams.transaction_type = normalizedMode;
  }

  // Normalize format param and request accordingly
  if (format === 'json') {
    axiosParams.format = 'json';
    const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  // Binary formats (xlsx, csv, pdf) -> request as arraybuffer
  if (format === 'xlsx' || format === 'csv' || format === 'pdf') {
    axiosParams.format = format;
    const resp = await axios.get(url, { params: axiosParams, responseType: 'arraybuffer', withCredentials: true });
    return { data: resp.data, headers: resp.headers };
  }

  // fallback to JSON
  const resp = await axios.get(url, { params: axiosParams, withCredentials: true });
  return { data: resp.data, headers: resp.headers };
};

export const downloadContractorReport = async (contractorId, params = {}, format = 'xlsx') => {
  return getContractorReportData(contractorId, params, format);
};

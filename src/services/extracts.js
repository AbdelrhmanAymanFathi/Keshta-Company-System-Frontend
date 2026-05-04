import * as api from '@/api'

export async function createExtract(payload) {
  const { data } = await api.createExtract(payload)
  return data
}

export async function getExtract(id) {
  const { data } = await api.getExtract(id)
  return data
}

export async function getExtractsForContractor(contractorId, start, end) {
  const { data } = await api.getExtractsForContractor(contractorId, start, end)
  return data
}

export async function getContractorWallet(contractorId, opts) {
  const response = await api.getContractorWallet(contractorId, opts)
  return response?.data ?? response
}

export function getExtracts(params = {}) {
  return api.getExtracts(params)
}

export default {
  createExtract,
  getExtract,
  getExtractsForContractor,
  getContractorWallet,
  getExtracts
}

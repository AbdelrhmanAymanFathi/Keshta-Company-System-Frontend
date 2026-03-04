import * as api from '@/api'

// Re-export supply-named functions for new imports
export const getSupplies = api.getSupplies || api.getExports
export const getSupply = api.getSupply || api.getExport
export const createSupply = api.createSupply || api.createExport
export const updateSupply = api.updateSupply || api.updateExport
export const deleteSupply = api.deleteSupply || api.deleteExport
export const restoreSupply = api.restoreSupply || api.restoreExport
export const createSupplyItem = api.createSupplyItem || api.createExportItem
export const updateSupplyItem = api.updateSupplyItem || api.updateExportItem
export const deleteSupplyItem = api.deleteSupplyItem || api.deleteExportItem
export const getSupplyPayments = api.getSupplyPayments || api.getExportPayments
export const getSuppliesChanges = api.getSuppliesChanges || api.getExportsChanges

export default {
  getSupplies,
  getSupply,
  createSupply,
  updateSupply,
  deleteSupply,
  restoreSupply,
  createSupplyItem,
  updateSupplyItem,
  deleteSupplyItem,
  getSupplyPayments,
  getSuppliesChanges
}

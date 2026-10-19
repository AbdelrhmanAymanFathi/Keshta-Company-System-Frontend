// Auto-split from src/api.js — domain module: supplies.js
import { getExports, getExport, createExport, updateExport, deleteExport, restoreExport, createExportItem, updateExportItem, deleteExportItem, getExportPayments } from './exports'
import { getExportsChanges } from './changes'

// --- Supply aliases (new names mapping to existing Export functions) ---
// These provide a migration path: prefer `getSupplies/createSupply/etc` going forward.
export const getSupplies = getExports;
export const getSupply = getExport;
export const createSupply = createExport;
export const updateSupply = updateExport;
export const deleteSupply = deleteExport;
export const restoreSupply = restoreExport;
export const createSupplyItem = createExportItem;
export const updateSupplyItem = updateExportItem;
export const deleteSupplyItem = deleteExportItem;
export const getSupplyPayments = getExportPayments;
export const getSuppliesChanges = getExportsChanges;

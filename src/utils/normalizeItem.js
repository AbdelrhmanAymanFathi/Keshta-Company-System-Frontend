// Canonicalize item objects across the app
export default function normalizeItem(it) {
  if (!it) return it
  const currentPrice = it.currentPrice ?? it.current_price ?? it.defaultExportPrice ?? it.default_export_price ?? it.price ?? null
  const defaultSupplyPrice = it.defaultSupplyPrice ?? it.default_supply_price ?? null
  const defaultTransportPrice = it.defaultTransportPrice ?? it.default_transport_price ?? null
  const defaultExtractPrice = it.defaultExtractPrice ?? it.default_extract_price ?? it.defaultExportPrice ?? it.default_export_price ?? null
  const availableForExtracts = !!(it.availableForExtracts ?? it.available_for_extracts ?? it.availableForExports ?? it.available_for_exports)
  const availableForExports = !!(it.availableForExports ?? it.available_for_exports)

  return {
    ...it,
    currentPrice: currentPrice !== null && currentPrice !== undefined ? Number(currentPrice) : null,
    defaultSupplyPrice: defaultSupplyPrice !== null && defaultSupplyPrice !== undefined ? Number(defaultSupplyPrice) : null,
    defaultTransportPrice: defaultTransportPrice !== null && defaultTransportPrice !== undefined ? Number(defaultTransportPrice) : null,
    defaultExtractPrice: defaultExtractPrice !== null && defaultExtractPrice !== undefined ? Number(defaultExtractPrice) : null,
    availableForExtracts,
    availableForExports,
    unitId: it.unitId ?? it.unit_id ?? null,
    createdAt: it.createdAt ?? it.created_at ?? null
  }
}

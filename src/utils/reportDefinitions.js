export function normalizeImportantColumns(definition = {}) {
  const explicit = Array.isArray(definition?.importantColumns)
    ? definition.importantColumns
    : []

  const shorthandSources = [
    ...(Array.isArray(definition?.fields) ? definition.fields : []),
    ...(Array.isArray(definition?.params) ? definition.params : []),
    ...(Array.isArray(definition?.reportParameter) ? definition.reportParameter : [])
  ]

  const shorthand = shorthandSources
    .filter((item) => item && item.important === true && item.name)
    .map((item) => String(item.name))

  return Array.from(new Set([...explicit, ...shorthand].filter(Boolean)))
}

function normalizeFieldEntry(item) {
  if (!item) return null
  if (typeof item === 'string') {
    const name = String(item).trim()
    return name ? { name, label: name, arName: '', paramType: 'TEXT', dataType: '' } : null
  }

  const name = String(item.name ?? item.key ?? item.field ?? item.column ?? '').trim()
  if (!name) return null

  return {
    ...item,
    name,
    label: item.label ?? name,
    arName: item.arName ?? '',
    paramType: item.paramType ?? item.type ?? 'TEXT',
    dataType: item.dataType ?? '',
    position: typeof item.position === 'number' ? item.position : null
  }
}

function normalizeFieldList(items = []) {
  return Array.from(
    new Map(
      items
        .map((item) => normalizeFieldEntry(item))
        .filter(Boolean)
        .map((item) => [String(item.name), item])
    ).values()
  ).sort((a, b) => {
    const aPos = typeof a.position === 'number' ? a.position : Number.MAX_SAFE_INTEGER
    const bPos = typeof b.position === 'number' ? b.position : Number.MAX_SAFE_INTEGER
    if (aPos !== bPos) return aPos - bPos
    return String(a.name).localeCompare(String(b.name))
  })
}

function firstArrayFrom(definition, keys = []) {
  for (const key of keys) {
    const value = definition?.[key]
    if (Array.isArray(value)) return value
  }
  return []
}

export function normalizeReportTotals(definition = {}) {
  const explicitTotals = Array.isArray(definition?.totals)
    ? definition.totals
    : []

  if (explicitTotals.length) {
    return Array.from(new Set(explicitTotals.map(String).filter(Boolean)))
  }

  const legacyTotals = Array.isArray(definition?.importantColumns)
    ? definition.importantColumns
    : []

  if (legacyTotals.length) {
    return Array.from(new Set(legacyTotals.map(String).filter(Boolean)))
  }

  return normalizeImportantColumns(definition)
}

export function normalizeReportSelectFields(definition = {}) {
  const explicitSelect = normalizeFieldList(firstArrayFrom(definition, [
    'selectFields',
    'selectedFields',
    'outputFields',
    'displayFields'
  ]))
  if (explicitSelect.length) return explicitSelect

  const legacySources = [
    ...firstArrayFrom(definition, ['fields']),
    ...firstArrayFrom(definition, ['params']),
    ...firstArrayFrom(definition, ['reportParameter'])
  ]
  return normalizeFieldList(legacySources)
}

export function normalizeReportFilterFields(definition = {}) {
  const explicitFilter = normalizeFieldList(firstArrayFrom(definition, [
    'filterFields',
    'filters',
    'params'
  ]))
  if (explicitFilter.length) return explicitFilter

  const legacySources = [
    ...firstArrayFrom(definition, ['params']),
    ...firstArrayFrom(definition, ['reportParameter']),
    ...firstArrayFrom(definition, ['fields'])
  ]
  return normalizeFieldList(legacySources)
}

export function isDynamicReportTotalsRow(row) {
  if (!row || typeof row !== 'object') return false

  return Boolean(
    row.__isTotalsRow === true ||
      String(row.__rowType || '').toUpperCase() === 'TOTALS' ||
      (() => {
        const firstValue = Object.entries(row).find(([key]) => !String(key).startsWith('__'))?.[1]
        if (typeof firstValue === 'string') {
          const normalized = firstValue.trim().toLowerCase()
          return normalized === 'total' || normalized === 'totals'
        }
        return false
      })()
  )
}

export function isContractorStatementTotalsRow(row) {
  return Boolean(row && String(row.type || '').toUpperCase() === 'TOTAL')
}

export function splitFooterRow(rows = [], predicate = () => false) {
  const dataRows = []
  let footerRow = null

  rows.forEach((row) => {
    if (!footerRow && predicate(row)) footerRow = row
    else dataRows.push(row)
  })

  return { dataRows, footerRow }
}

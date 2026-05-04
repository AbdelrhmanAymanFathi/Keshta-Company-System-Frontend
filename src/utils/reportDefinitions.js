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

export function isDynamicReportTotalsRow(row) {
  return Boolean(
    row &&
      (row.__isTotalsRow === true || String(row.__rowType || '').toUpperCase() === 'TOTALS')
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

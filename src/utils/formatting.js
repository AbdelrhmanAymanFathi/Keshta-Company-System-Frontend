const DEFAULT_LOCALE = 'en-US'

const LRM = '\u200E'

function isRTL(locale) {
  return String(locale || '').startsWith('ar')
}

function formatRTL(formatted, rtl) {
  if (!rtl) return formatted
  if (formatted.startsWith('-')) return LRM + formatted
  if (formatted.startsWith('+') || formatted.startsWith('\u2014')) return formatted
  return formatted
}

export function formatCurrency(value, locale) {
  if (value === null || value === undefined || value === '') return '\u2014'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  const rtl = isRTL(locale)
  const formatted = new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n)
  return formatRTL(formatted, rtl)
}

export function formatNumber(value, locale, decimals = 2) {
  if (value === null || value === undefined || value === '') return '\u2014'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  const rtl = isRTL(locale)
  const formatted = new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(n)
  return formatRTL(formatted, rtl)
}

export function formatInteger(value, locale) {
  if (value === null || value === undefined || value === '') return '\u2014'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  const rtl = isRTL(locale)
  const formatted = new Intl.NumberFormat(DEFAULT_LOCALE, { maximumFractionDigits: 0 }).format(n)
  return formatRTL(formatted, rtl)
}

export function formatPercent(value, locale, decimals = 1) {
  if (value === null || value === undefined || value === '') return '\u2014'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  const formatted = new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(n / 100)
  return formatted
}

export function formatSigned(value, locale, decimals = 2) {
  if (value === null || value === undefined || value === '') return '\u2014'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  if (n === 0) return formatNumber(0, locale, decimals)
  const abs = Math.abs(n)
  const formatted = formatNumber(abs, locale, decimals)
  const rtl = isRTL(locale)
  if (n < 0) return formatRTL(`-${formatted}`, rtl)
  return `+${formatted}`
}

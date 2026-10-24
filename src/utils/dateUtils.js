function pad(n) {
  return n < 10 ? `0${n}` : String(n)
}

function isISODateString(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}($|T)/.test(s)
}

function toLocalDateFromYMD(yyyy, mm, dd) {
  const d = new Date(yyyy, mm - 1, dd)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateDMY(date) {
  if (date === null || date === undefined || date === '') return ''

  let d = null
  if (date instanceof Date) d = date
  else if (typeof date === 'string') {
    if (isISODateString(date)) {
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (match) {
        d = toLocalDateFromYMD(Number(match[1]), Number(match[2]), Number(match[3]))
      }
      if (!d) {
        d = new Date(date)
      }
    } else {
      const m = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      if (m) {
        d = toLocalDateFromYMD(Number(m[3]), Number(m[2]), Number(m[1]))
      }
      if (!d) {
        const slashMatch = date.match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
        if (slashMatch) {
          d = toLocalDateFromYMD(Number(slashMatch[1]), Number(slashMatch[2]), Number(slashMatch[3]))
        }
      }
      if (!d) {
        d = new Date(date)
      }
    }
  } else d = new Date(date)

  if (!d || Number.isNaN(d.getTime())) return ''
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function parseDateDMY(str) {
  if (!str) return null
  const value = String(str).trim()
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  const d = toLocalDateFromYMD(yyyy, mm, dd)
  if (!d) return null
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatToISODate(date) {
  if (date === null || date === undefined || date === '') return ''
  if (date instanceof Date) return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  if (typeof date === 'string') {
    if (isISODateString(date)) return date.slice(0, 10)
    const parsed = parseDateDMY(date)
    if (parsed) return parsed
    const m = date.match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
    const d = new Date(date)
    if (!Number.isNaN(d.getTime())) return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }
  return ''
}

export function parseISODateToDate(iso) {
  if (!iso) return null
  if (typeof iso === 'string') {
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const d = toLocalDateFromYMD(Number(match[1]), Number(match[2]), Number(match[3]))
      if (d) return d
      return null
    }
    const date = new Date(iso)
    if (!Number.isNaN(date.getTime())) return date
    return null
  }

  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export function getTodayISO() {
  return formatToISODate(new Date())
}

/**
 * Compare two date-like values regardless of their original format
 * (ISO, DD/MM/YYYY, Date objects, timestamps). Empty/invalid dates
 * always sort to the end.
 * Returns -1, 0 or 1 so it can be used directly with Array.prototype.sort.
 */
export function compareDates(a, b) {
  const isoA = formatToISODate(a)
  const isoB = formatToISODate(b)
  if (!isoA && !isoB) return 0
  if (!isoA) return 1
  if (!isoB) return -1
  return isoA < isoB ? -1 : isoA > isoB ? 1 : 0
}

export function formatDateTime(value) {
  if (value === null || value === undefined || value === '') return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDateTimeCairo(value, locale = 'en-GB') {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  try {
    const opts = { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }
    const parts = new Intl.DateTimeFormat(locale, opts).formatToParts(d)
    const map = {}
    for (const p of parts) map[p.type] = p.value
    return `${map.day}/${map.month}/${map.year} ${map.hour}:${map.minute}`
  } catch (e) {
    return formatDateTime(d)
  }
}

export default {
  formatDateDMY,
  parseDateDMY,
  formatToISODate,
  parseISODateToDate,
  getTodayISO,
  compareDates,
  formatDateTime, formatDateTimeCairo
}


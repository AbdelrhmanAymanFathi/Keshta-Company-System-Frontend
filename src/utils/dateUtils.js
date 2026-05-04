function pad(n) {
  return n < 10 ? `0${n}` : String(n)
}

function isISODateString(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}($|T)/.test(s)
}

export function formatDateDMY(date) {
  if (date === null || date === undefined || date === '') return ''
  let d
  if (date instanceof Date) d = date
  else if (typeof date === 'string') {
    if (isISODateString(date)) d = new Date(date)
    else {
      const m = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      if (m) {
        const dd = Number(m[1])
        const mm = Number(m[2])
        const yyyy = Number(m[3])
        d = new Date(yyyy, mm - 1, dd)
      } else d = new Date(date)
    }
  } else d = new Date(date)

  if (!d || Number.isNaN(d.getTime())) return ''
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function parseDateDMY(str) {
  if (!str) return null
  const m = String(str).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  const d = new Date(yyyy, mm - 1, dd)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatToISODate(date) {
  if (date === null || date === undefined || date === '') return ''
  if (date instanceof Date) return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  if (typeof date === 'string') {
    if (isISODateString(date)) return date.slice(0, 10)
    const parsed = parseDateDMY(date)
    if (parsed) return parsed
    const d = new Date(date)
    if (!Number.isNaN(d.getTime())) return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }
  return ''
}

export function parseISODateToDate(iso) {
  if (!iso) return null
  // Handle plain YYYY-MM-DD as local date (avoid UTC shift)
  if (typeof iso === 'string') {
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) {
      const yyyy = Number(m[1])
      const mm = Number(m[2])
      const dd = Number(m[3])
      const d = new Date(yyyy, mm - 1, dd)
      if (!Number.isNaN(d.getTime())) return d
      return null
    }
  }

  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export function getTodayISO() {
  return formatToISODate(new Date())
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
  getTodayISO
  , formatDateTime, formatDateTimeCairo
}


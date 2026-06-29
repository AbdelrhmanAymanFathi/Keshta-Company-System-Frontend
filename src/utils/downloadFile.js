// Small helper for downloading binary responses (ArrayBuffer or Blob)
export function getFilenameFromHeaders(headers, fallback = null) {
  if (!headers) return fallback
  const cd = headers['content-disposition'] || headers['Content-Disposition'] || ''
  if (!cd) return fallback
  const m = cd.match(/filename\*=UTF-8''([^;\n]+)/) || cd.match(/filename="?([^";\n]+)"?/) || cd.match(/filename=([^;\n]+)/)
  if (m && m[1]) return decodeURIComponent(m[1])
  return fallback
}

export function getExtensionFromMimeType(mimeType = '') {
  const normalized = String(mimeType || '').toLowerCase()
  if (normalized.includes('application/pdf')) return 'pdf'
  if (normalized.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) return 'xlsx'
  if (normalized.includes('application/vnd.ms-excel')) return 'xlsx'
  if (normalized.includes('text/csv')) return 'csv'
  if (normalized.includes('application/json')) return 'json'
  if (normalized.includes('application/zip')) return 'zip'
  return null
}

export function getMimeTypeFromHeaders(headers, fallback = 'application/octet-stream') {
  return (headers && (headers['content-type'] || headers['Content-Type'])) || fallback
}

export function getFilenameFromResponse(headers, fallback = 'download') {
  const fromHeaders = getFilenameFromHeaders(headers, null)
  if (fromHeaders) return fromHeaders
  const extension = getExtensionFromMimeType(getMimeTypeFromHeaders(headers, ''))
  if (!fallback || !extension) return fallback
  if (/\.[A-Za-z0-9]+$/.test(fallback)) {
    return fallback.replace(/\.[A-Za-z0-9]+$/, `.${extension}`)
  }
  return `${fallback}.${extension}`
}

export function downloadBlobData(data, filename, mimeType = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'download'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export default {
  getFilenameFromHeaders,
  getExtensionFromMimeType,
  getMimeTypeFromHeaders,
  getFilenameFromResponse,
  downloadBlobData
}

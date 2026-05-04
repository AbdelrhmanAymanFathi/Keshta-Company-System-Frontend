// Small helper for downloading binary responses (ArrayBuffer or Blob)
export function getFilenameFromHeaders(headers, fallback = null) {
  if (!headers) return fallback
  const cd = headers['content-disposition'] || headers['Content-Disposition'] || ''
  if (!cd) return fallback
  const m = cd.match(/filename\*=UTF-8''([^;\n]+)/) || cd.match(/filename="?([^";\n]+)"?/) || cd.match(/filename=([^;\n]+)/)
  if (m && m[1]) return decodeURIComponent(m[1])
  return fallback
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
  downloadBlobData
}

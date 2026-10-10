const PALETTE = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6']

export function colorFor(userId) {
  return PALETTE[Number(userId) % PALETTE.length]
}

export function initials(name) {
  const parts = (name || '?').trim().split(/\s+/)
  const first = parts[0]?.[0] ?? '?'
  const second = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + second).toUpperCase()
}
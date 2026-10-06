/**
 * Expense term (البند) name normalization.
 *
 * Folds spelling variants so "نيسان", "نيسان " and "نيسآن" compare equal.
 * Mirrors normalizeTermName() in the backend (accounting/src/utils/termName.ts),
 * which enforces uniqueness inside a shared sub-term list.
 */
export function normalizeTermName(value) {
  return String(value ?? '')
    .replace(/[ً-ٰٟـ]/g, '') // harakat, superscript alef, tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// Levenshtein distance, capped: returns max + 1 as soon as the distance is known to exceed max
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      rowMin = Math.min(rowMin, cur[j])
    }
    if (rowMin > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

/**
 * Existing names that look like a misspelling of `name` (one letter off, e.g. "نيسن" vs "نيسان").
 * Exact matches after normalization are excluded — the backend rejects those outright.
 * Names with digits are skipped: model codes and plates ("لودر 66 E" / "لودر 66 H") differ by one character on purpose.
 */
export function findSimilarTermNames(name, existingNames) {
  const key = normalizeTermName(name)
  if (key.length < 3 || /\d/.test(key)) return []
  return existingNames.filter(other => {
    const otherKey = normalizeTermName(other)
    return otherKey && otherKey !== key && otherKey.length >= 3 && !/\d/.test(otherKey) && editDistance(key, otherKey, 1) <= 1
  })
}

/**
 * Vehicle name normalization utilities.
 *
 * Vehicle names may contain '/' separators (e.g., '6747/4972').
 * Users sometimes enter parts in reversed order ('4972/6747'),
 * which should be treated as the same vehicle.
 *
 * These utilities provide canonical form comparison and
 * part-aware search matching.
 */

/**
 * Returns a canonical form of a vehicle name for duplicate comparison.
 * Splits by '/', trims and lowercases each part, sorts them,
 * and joins them back with '/'.
 *
 * @example
 *   normalizeVehicleName('6747/4972') // '4972/6747'
 *   normalizeVehicleName('4972/6747') // '4972/6747'
 *   normalizeVehicleName('ABC')       // 'abc'
 *   normalizeVehicleName('A/B/C')     // 'a/b/c'
 */
export function normalizeVehicleName(name) {
  if (!name) return ''
  const trimmed = String(name).trim()
  if (!trimmed.includes('/')) return trimmed.toLowerCase()
  return trimmed.split('/').map(p => p.trim().toLowerCase()).sort().join('/')
}

/**
 * Returns the individual parts of a vehicle name, lowercased and trimmed.
 * Useful for part-aware dropdown search: matching any individual segment.
 *
 * @example
 *   getVehicleNameParts('6747/4972') // ['6747', '4972']
 *   getVehicleNameParts('ABC')       // ['abc']
 */
export function getVehicleNameParts(name) {
  if (!name) return []
  return String(name).split('/').map(p => p.trim().toLowerCase()).filter(Boolean)
}

/**
 * Checks whether a search query matches a vehicle name,
 * considering individual parts separated by '/'.
 *
 * The query matches if it is found as a substring of the full name
 * OR if it matches the beginning of any individual part.
 *
 * @example
 *   matchesVehicleName('6747/4972', '4972') // true (matches part)
 *   matchesVehicleName('6747/4972', '67')   // true (matches part start)
 *   matchesVehicleName('6747/4972', '47')   // true (substring of full name)
 */
export function matchesVehicleName(vehicleName, query) {
  if (!query || !vehicleName) return true
  const q = String(query).trim().toLowerCase()
  if (!q) return true
  const fullName = String(vehicleName).trim().toLowerCase()
  // Standard substring match on full name
  if (fullName.includes(q)) return true
  // Part-aware match: check if query matches any individual part
  const parts = fullName.split('/').map(p => p.trim())
  return parts.some(part => part.includes(q))
}

export default normalizeVehicleName

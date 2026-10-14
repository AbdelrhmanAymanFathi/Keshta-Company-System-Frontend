import { computed, ref, unref } from 'vue'
import { compareDates } from '@/utils/dateUtils'

/**
 * Client-side date sorting helper for report tables.
 *
 * @param {import('vue').Ref|import('vue').ComputedRef|Function} source rows source (ref/computed/getter)
 * @param {Function} getDate accessor returning the date value of a row (defaults to row.date)
 * @param {Object} [options]
 * @param {'asc'|'desc'|null} [options.initial] initial sort direction (null = keep original order)
 */
export function useDateSort(source, getDate = (row) => row?.date, { initial = null } = {}) {
  const dateSortOrder = ref(initial)

  const getRows = () => {
    const value = typeof source === 'function' ? source() : unref(source)
    return Array.isArray(value) ? value : []
  }

  const sortedRows = computed(() => {
    const rows = [...getRows()]
    if (!dateSortOrder.value) return rows
    return rows.sort((a, b) => {
      const result = compareDates(getDate(a), getDate(b))
      return dateSortOrder.value === 'desc' ? -result : result
    })
  })

  const toggleDateSort = () => {
    if (dateSortOrder.value === 'asc') {
      dateSortOrder.value = 'desc'
    } else {
      dateSortOrder.value = 'asc'
    }
  }

  return {
    dateSortOrder,
    sortedRows,
    toggleDateSort
  }
}

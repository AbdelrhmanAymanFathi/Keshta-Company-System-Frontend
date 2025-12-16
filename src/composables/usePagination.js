import { ref } from 'vue'

/**
 * Generic server-driven pagination composable with safe client-side fallback.
 *
 * @param {Function} fetchFn async (page, pageSize, extra) => axiosResponse | plainObject | array
 * @param {Object} options
 * @param {number} options.initialPage
 * @param {number} options.initialPageSize
 * @param {string} [options.resourceName] optional label for console warnings/TODOs
 */
export function usePagination(fetchFn, { initialPage = 1, initialPageSize = 20, resourceName = '' } = {}) {
  const items = ref([])
  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)

  const normalize = (res) => {
    // res may be axios response ({ data: ... }) or already the payload/array
    let payload = res
    if (res && res.data !== undefined) payload = res.data

    // Plain array -> server not paginated, full array returned
    if (Array.isArray(payload)) {
      items.value = payload
      total.value = payload.length
      totalPages.value = Math.max(1, Math.ceil(total.value / pageSize.value))

      if (process.env.NODE_ENV !== 'production') {
        const label = resourceName || 'resource'
        // eslint-disable-next-line no-console
        console.warn(
          `[pagination] Backend for ${label} returned plain array without meta. ` +
            'Using client-side pagination fallback. ' +
            'TODO: Update backend to support paginated response with { items, meta } or { items, page, pageSize, total }.'
        )
      }

      return { clientFallback: true }
    }

    // Server-paginated: support { items, meta } OR { items, page, pageSize, total } shapes
    const dataArray = payload.items || payload.data || []
    items.value = dataArray

    const meta = payload.meta || {
      page: payload.page,
      pageSize: payload.pageSize,
      total: payload.total,
      totalPages: payload.totalPages
    }

    if (typeof meta.page === 'number') page.value = meta.page
    if (typeof meta.pageSize === 'number') pageSize.value = meta.pageSize

    total.value =
      typeof meta.total === 'number'
        ? meta.total
        : Array.isArray(dataArray)
        ? dataArray.length
        : 0

    totalPages.value =
      typeof meta.totalPages === 'number'
        ? meta.totalPages
        : Math.max(1, Math.ceil((total.value || 0) / (pageSize.value || 1)))

    return { clientFallback: false }
  }

  const load = async (extra = {}) => {
    loading.value = true
    try {
      const res = await fetchFn(page.value, pageSize.value, extra)
      const result = normalize(res)

      // If server returned full array (no meta), slice client-side for current page
      if (result.clientFallback) {
        const start = (page.value - 1) * pageSize.value
        const end = start + pageSize.value
        items.value = items.value.slice(start, end)
      }
    } finally {
      loading.value = false
    }
  }

  const setPage = (p) => {
    if (typeof p !== 'number' || Number.isNaN(p)) return
    page.value = p
  }

  const setPageSize = (s) => {
    if (typeof s !== 'number' || Number.isNaN(s) || s <= 0) return
    pageSize.value = s
    page.value = 1
  }

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    loading,
    load,
    setPage,
    setPageSize
  }
}



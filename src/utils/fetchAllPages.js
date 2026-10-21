/**
 * Fetch every record from a paginated list endpoint by walking pages.
 *
 * The backend caps `pageSize` at 100 for most list routes, so charts that
 * need the full dataset (org structures) must loop instead of asking for
 * one huge page.
 *
 * @param {(params: object) => Promise<any>} fetcher  API call, e.g. getTransports
 * @param {object} [baseParams]  extra query params merged into every request
 * @param {number} [pageSize]    page size per request (backend max is 100)
 */
export async function fetchAllPages(fetcher, baseParams = {}, pageSize = 100) {
  const all = []
  let page = 1
  let totalPages = 1

  do {
    const res = await fetcher({ ...baseParams, page, pageSize })
    const payload = res?.data
    let rows = []
    if (Array.isArray(payload)) {
      rows = payload
      totalPages = 1
    } else if (payload && Array.isArray(payload.items)) {
      rows = payload.items
      totalPages = payload.meta?.totalPages || 1
    } else if (payload && Array.isArray(payload.data)) {
      rows = payload.data
      totalPages = payload.meta?.totalPages || 1
    }

    all.push(...rows)
    if (!rows.length) break
    page += 1
  } while (page <= totalPages)

  return all
}

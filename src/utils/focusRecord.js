// Helpers for opening a specific record when a page is reached via ?focus=<id>
// (used by notification deep-links).

export function getFocusId(route) {
  const raw = route?.query?.focus
  const id = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

// Drop ?focus from the URL so a refresh doesn't reopen the record and
// clicking the same notification again re-triggers the watcher.
export function clearFocusQuery(router, route) {
  if (!route?.query?.focus) return
  const rest = { ...route.query }
  delete rest.focus
  router.replace({ query: rest }).catch(() => {})
}

// Scroll to and flash the visible row marked with data-focus-id="<id>".
export function highlightRow(id, attempts = 10) {
  const tryFind = (left) => {
    const el = Array.from(document.querySelectorAll(`[data-focus-id="${id}"]`))
      .find(node => node.offsetParent !== null)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.remove('notif-focus-flash')
      void el.offsetWidth
      el.classList.add('notif-focus-flash')
      setTimeout(() => el.classList.remove('notif-focus-flash'), 4000)
      return
    }
    if (left > 0) setTimeout(() => tryFind(left - 1), 200)
  }
  tryFind(attempts)
}

export function notifyFocusMissing() {
  if (window.$toast) window.$toast('العنصر غير موجود، ربما تم حذفه', 'error', 4000)
}

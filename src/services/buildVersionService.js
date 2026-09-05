const BUILD_VERSION_PATH = '/version.json'
const POLL_INTERVAL_MS = 15000
const RELOAD_DELAY_MS = 2000

function updateNotice() {
  return document.documentElement && document.documentElement.lang === 'ar'
    ? 'تم نشر نسخة جديدة، يتم تحديث الصفحة تلقائيًا...'
    : 'A new version is available, refreshing automatically...'
}

class BuildVersionService {
  constructor() {
    this.baseline = null
    this.timer = null
    this.reloading = false
    this._cleanupFns = []
  }

  async readVersion() {
    try {
      const resp = await fetch(BUILD_VERSION_PATH, { cache: 'no-store', credentials: 'omit' })
      if (!resp.ok) return null
      const data = await resp.json()
      if (!data || typeof data !== 'object') return null
      return data.buildId || data.version || null
    } catch (e) {
      return null
    }
  }

  async check() {
    if (this.reloading) return
    const current = await this.readVersion()
    if (!current) return
    if (this.baseline === null) {
      this.baseline = current
      return
    }
    if (current !== this.baseline) {
      this.reloading = true
      if (window.$toast) {
        window.$toast(updateNotice(), 'info', RELOAD_DELAY_MS + 1500)
      }
      setTimeout(() => {
        window.location.reload()
      }, RELOAD_DELAY_MS)
    }
  }

  start() {
    if (this.timer) return
    this.readVersion().then((id) => {
      if (this.reloading) return
      this.baseline = id
    })

    this.timer = setInterval(() => this.check(), POLL_INTERVAL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') this.check()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    this._cleanupFns.push(() => {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    })
  }

  destroy() {
    for (const fn of this._cleanupFns) {
      try { fn() } catch (e) { /* ignore cleanup errors */ }
    }
    this._cleanupFns = []
  }
}

export const buildVersionService = new BuildVersionService()
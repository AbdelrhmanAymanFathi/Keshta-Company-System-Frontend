import { ref } from 'vue'

class RealtimeService {
  constructor() {
    this.es = null
    this.subscriptions = new Map()
    this.reconnectTimer = null
    this.reconnectAttempt = 0
    this.reconnectDelay = 1000
    this.maxReconnectAttempts = 20
    this.baseUrl = ''
    this.isConnecting = false
    this.getToken = null
    this.controller = null
    this.reader = null
    this.sessionToken = null
    this._destroyed = false
    this._exhausted = false
    this._pageClosing = false
    this._offline = false
    this._errorFired = false
    this._cleanupFns = []
  }

  isConnected = ref(false)
  connectionError = ref(null)
  clientId = ref(null)
  subscribedChannels = ref([])

  init(getToken) {
    this._destroyed = false
    this._exhausted = false
    this.getToken = getToken
    this._setupLifecycleHooks()
    this._setupOnlineOffline()
    this.connect()
  }

  get authToken() {
    return this.getToken ? this.getToken() : null
  }

  get apiBaseUrl() {
    return this.baseUrl || process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000'
  }

  buildUrl() {
    if (!this.sessionToken) return ''
    const activeChannels = Array.from(this.subscriptions.keys())
    const channels = activeChannels.join(',')
    const base = this.apiBaseUrl
    const tokenParam = `token=${encodeURIComponent(this.sessionToken)}`
    const channelsParam = channels ? `&channels=${encodeURIComponent(channels)}` : ''
    return `${base}/api/realtime?${tokenParam}${channelsParam}`
  }

  async connect() {
    if (this._pageClosing) return
    if (this._offline) return
    if (this._destroyed) return
    if (this.es || this.isConnecting) return
    const jwt = this.authToken
    if (!jwt) return

    this.isConnecting = true
    this.connectionError.value = null
    this.controller = new AbortController()

    let handshakeOk = false
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        this.sessionToken = await this.performHandshake(jwt)
        handshakeOk = true
        break
      } catch (err) {
        if (err?.name === 'AbortError') return
        if (err?.status === 401) break
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attempt), 5000)))
        }
      }
    }

    if (!handshakeOk) {
      this.isConnected.value = false
      this.isConnecting = false
      this.es = null
      this.sessionToken = null
      this.scheduleReconnect()
      return
    }

    await this.connectWithSessionToken()
  }

  async performHandshake(jwt) {
    const resp = await fetch(`${this.apiBaseUrl}/api/realtime/handshake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: jwt }),
      credentials: 'omit',
      signal: this.controller.signal,
    })
    if (resp.status === 401) {
      const err = new Error(`Handshake failed: 401`)
      err.status = 401
      throw err
    }
    if (!resp.ok) throw new Error(`Handshake failed: ${resp.status}`)
    const data = await resp.json()
    return data.sessionToken || data.token
  }

  async connectWithSessionToken() {
    const url = this.buildUrl()
    if (!url) {
      this.isConnected.value = false
      this.isConnecting = false
      this.es = null
      this.sessionToken = null
      this.scheduleReconnect()
      return
    }

    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/event-stream' },
        credentials: 'omit',
        signal: this.controller.signal,
      })

      if (!response.ok) {
        this.isConnected.value = false
        this.isConnecting = false
        this.es = null
        this.sessionToken = null
        this.scheduleReconnect()
        return
      }

      if (!response.body) {
        this.isConnected.value = false
        this.isConnecting = false
        this.es = null
        this.sessionToken = null
        this.scheduleReconnect()
        return
      }

      this.es = this.controller
      this.reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        if (this._pageClosing) return
        if (!this.reader) return
        const { done, value } = await this.reader.read()

        if (done) {
          if (this.isConnecting) {
            return
          }
          this.isConnected.value = false
          this.clientId.value = null
          this.isConnecting = false
          this.es = null
          this.reader = null
          this.sessionToken = null
          this.scheduleReconnect()
          return
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        this.parseSSELines(lines)
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      if (this.isConnecting) {
        return
      }
      this.isConnected.value = false
      this.isConnecting = false
      this.es = null
      this.reader = null
      this.sessionToken = null
      this.scheduleReconnect()
    }
  }

  parseSSELines(lines) {
    let currentEvent = ''
    let currentData = ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim()
      } else if (line.startsWith('data: ')) {
        currentData += (currentData ? '\n' : '') + line.slice(6)
      } else if (line === '') {
        if (currentData) {
          this.handleSSEMessage(currentEvent || 'message', currentData)
        }
        currentEvent = ''
        currentData = ''
      }
    }
  }

  handleSSEMessage(eventType, data) {
    try {
      const payload = JSON.parse(data)
      if (eventType === 'connected') {
        this.clientId.value = payload.clientId
        this.subscribedChannels.value = payload.channels || []
        this.isConnected.value = true
        this.isConnecting = false
        this.reconnectAttempt = 0
        this.reconnectDelay = 1000
        this.connectionError.value = null
        this._exhausted = false
        this._errorFired = false
        return
      }
      if (eventType === 'message') {
        this.dispatch(payload.channel, payload.event, payload.data)
      }
    } catch (e) {
      /* ignore malformed SSE data */
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return
    if (this._destroyed) return
    if (this._pageClosing) return
    if (this._offline) return
    if (this._exhausted) return
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      this._exhausted = true
      this.connectionError.value = 'max_reconnect_attempts_reached'
      this._fireErrorOnce()
      return
    }

    this.reconnectAttempt++
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempt, 30000)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.close()
      this.connect()
    }, delay)
  }

  close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.reader) {
      try { this.reader.cancel() } catch (e) { /* ignore close errors */ }
      this.reader = null
    }
    if (this.controller) {
      try { this.controller.abort() } catch (e) { /* ignore close errors */ }
      this.controller = null
    }
    this.es = null
    this.isConnected.value = false
    this.clientId.value = null
    this.isConnecting = false
    this.sessionToken = null
  }

  destroy() {
    this._destroyed = true
    this._exhausted = false
    this._teardownLifecycleHooks()
    this._teardownOnlineOffline()
    this.close()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.subscriptions.clear()
    this.subscribedChannels.value = []
    this.connectionError.value = null
    this.getToken = null
  }

  resetReconnectCounters() {
    this.reconnectAttempt = 0
    this.reconnectDelay = 1000
  }

  subscribe(channel, events, callback) {
    if (this._destroyed) return () => {}

    if (this._exhausted) {
      this._exhausted = false
      this.resetReconnectCounters()
      this.connectionError.value = null
      this._errorFired = false
      this.close()
      this.connect()
    }

    const wasNewChannel = !this.subscriptions.has(channel)
    let sub = this.subscriptions.get(channel)
    if (!sub) {
      sub = { channels: new Set(), events: new Map() }
      this.subscriptions.set(channel, sub)
    }

    for (const eventName of events) {
      let cbs = sub.events.get(eventName)
      if (!cbs) {
        cbs = new Set()
        sub.events.set(eventName, cbs)
      }
      cbs.add(callback)
    }

    if (wasNewChannel) {
      this.reconnectWithNewChannels()
    }

    return () => {
      for (const eventName of events) {
        const cbs = sub?.events.get(eventName)
        if (cbs) {
          cbs.delete(callback)
          if (cbs.size === 0) sub?.events.delete(eventName)
        }
      }
      if (sub && sub.events.size === 0) {
        this.subscriptions.delete(channel)
      }
    }
  }

  reconnectWithNewChannels() {
    if (this._exhausted) {
      this._exhausted = false
      this.resetReconnectCounters()
      this.connectionError.value = null
      this._errorFired = false
      this.connect()
      return
    }
    if (!this.isConnected.value) return
    this.close()
    this.connect()
  }

  dispatch(channel, eventName, data) {
    this.subscribedChannels.value = Array.from(this.subscriptions.keys())

    const sub = this.subscriptions.get(channel)
    if (!sub) return

    const wildcardCbs = sub.events.get('*')
    if (wildcardCbs) {
      for (const cb of wildcardCbs) {
        try { cb(eventName, data) } catch (e) { /* ignore subscriber error */ }
      }
    }

    const eventCbs = sub.events.get(eventName)
    if (eventCbs) {
      for (const cb of eventCbs) {
        try { cb(eventName, data) } catch (e) { /* ignore subscriber error */ }
      }
    }
  }

  hasSubscribers(channel) {
    return this.subscriptions.has(channel)
  }

  getActiveChannels() {
    return Array.from(this.subscriptions.keys())
  }

  _setupLifecycleHooks() {
    const onBeforeUnload = () => {
      this._pageClosing = true
      this.close()
    }
    const onPageHide = () => {
      this._pageClosing = true
      this.close()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('pagehide', onPageHide)
    this._cleanupFns.push(() => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('pagehide', onPageHide)
    })
  }

  _teardownLifecycleHooks() {
    for (const fn of this._cleanupFns) {
      try { fn() } catch (e) { /* ignore cleanup errors */ }
    }
    this._cleanupFns = []
  }

  _setupOnlineOffline() {
    const onOnline = () => {
      this._offline = false
      if (this._exhausted) {
        this._exhausted = false
        this.resetReconnectCounters()
        this.connectionError.value = null
        this._errorFired = false
      }
      if (!this.isConnected.value && !this.isConnecting && !this._destroyed) {
        this._pageClosing = false
        this.close()
        this.connect()
      }
    }
    const onOffline = () => {
      this._offline = true
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    this._cleanupFns.push(() => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    })
  }

  _teardownOnlineOffline() {
    /* cleanup handled by _teardownLifecycleHooks */
  }

  _fireErrorOnce() {
    if (this._errorFired) return
    this._errorFired = true
    if (window.$toast) {
      window.$toast('تعذر الاتصال بالخادم للحدث المباشر', 'warning', 0)
    }
  }
}

export const realtimeService = new RealtimeService()

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
  }

  isConnected = ref(false)
  connectionError = ref(null)
  clientId = ref(null)
  subscribedChannels = ref([])

  init(getToken) {
    this.getToken = getToken
    this.connect()
  }

  get authToken() {
    return this.getToken ? this.getToken() : null
  }

  buildUrl() {
    const activeChannels = Array.from(this.subscriptions.keys())
    const channels = activeChannels.join(',')
    const base = this.baseUrl || import.meta.env.VITE_API_BASE_URL || ''
    return `${base}/api/realtime${channels ? `?channels=${encodeURIComponent(channels)}` : ''}`
  }

  connect() {
    if (this.es || this.isConnecting) return
    const url = this.buildUrl()
    const token = this.authToken
    if (!url || !token) return

    this.isConnecting = true
    this.connectionError.value = null
    this.controller = new AbortController()

    this.connectWithFetch(url, token)
  }

  async connectWithFetch(url, token) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        credentials: 'omit',
        signal: this.controller.signal,
      })

      if (!response.ok) {
        this.isConnected.value = false
        this.isConnecting = false
        this.es = null
        this.scheduleReconnect()
        return
      }

      if (!response.body) {
        this.isConnected.value = false
        this.isConnecting = false
        this.es = null
        this.scheduleReconnect()
        return
      }

      this.es = this.controller
      this.reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { done, value } = await this.reader.read()

        if (done) {
          this.isConnected.value = false
          this.clientId.value = null
          this.isConnecting = false
          this.es = null
          this.reader = null
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
      this.isConnected.value = false
      this.isConnecting = false
      this.es = null
      this.reader = null
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
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      this.connectionError.value = 'max_reconnect_attempts_reached'
      this.destroy()
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
  }

  destroy() {
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

  subscribe(channel, events, callback) {
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

    this.reconnectWithNewChannels()

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
      this.reconnectWithNewChannels()
    }
  }

  reconnectWithNewChannels() {
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
}

export const realtimeService = new RealtimeService()

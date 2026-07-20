import { defineStore } from 'pinia'

const STORAGE_KEY = 'modalMemory:v1'
const EXPIRY_MS = 1000 * 60 * 60 // 1 hour

function now() {
  return Date.now()
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { enabled: false, entries: {} }
    const parsed = JSON.parse(raw)
    return parsed
  } catch (e) {
    return { enabled: false, entries: {} }
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // ignore
  }
}

export const useModalMemoryStore = defineStore('modalMemory', {
  state: () => {
    const persisted = loadFromStorage()
    return {
      enabled: typeof persisted.enabled !== 'undefined' ? persisted.enabled : true,
      entries: persisted.entries || {}
    }
  },
  actions: {
    setEnabled(v) {
      this.enabled = !!v
      this._persist()
    },
    _persist() {
      saveToStorage({ enabled: this.enabled, entries: this.entries })
    },
    save(modalId, payload) {
      if (!modalId) return
      this._clearExpired()
      this.entries[modalId] = { ts: now(), data: payload }
      this._persist()
    },
    load(modalId) {
      if (!modalId) return null
      this._clearExpired()
      const entry = this.entries[modalId]
      return entry ? entry.data : null
    },
    clear(modalId) {
      if (!modalId) return
      delete this.entries[modalId]
      this._persist()
    },
    clearAll() {
      this.entries = {}
      this._persist()
    },
    _clearExpired() {
      const cutoff = now() - EXPIRY_MS
      let changed = false
      for (const k of Object.keys(this.entries)) {
        if (!this.entries[k] || !this.entries[k].ts || this.entries[k].ts < cutoff) {
          delete this.entries[k]
          changed = true
        }
      }
      if (changed) this._persist()
    }
  }
})

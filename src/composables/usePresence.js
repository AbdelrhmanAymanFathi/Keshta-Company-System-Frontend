import { ref, watch, onMounted, onUnmounted } from 'vue'
import { realtimeService } from '@/services/realtimeService'
import { tokenManager } from '@/api'
import { presenceEnabled, presenceSettingsLoaded, loadPresenceSettings } from '@/composables/usePresenceSettings'

const PRESENCE_CHANNEL = 'presence'
const PRESENCE_EVENT = 'presence_updated'
const CURSOR_THROTTLE_MS = 100
const CURSOR_MIN_DELTA = 0.4
const CURSOR_HEARTBEAT_MS = 500

function toValue(v) {
  return v && typeof v === 'object' && 'value' in v ? v.value : v
}

export function usePresence(page, recordId = null) {
  const members = ref([])

  let lastCursor = null
  let lastCursorAt = 0
  let cursorAttached = false
  let lastResyncAt = 0

  const RESYNC_COOLDOWN_MS = 5000

  function getPage() {
    return toValue(page)
  }

  function getRecordId() {
    const value = toValue(recordId)
    return Number.isSafeInteger(value) && value > 0 ? value : null
  }

  function active() {
    return presenceSettingsLoaded.value && presenceEnabled.value
  }

  async function request(method, payload) {
    const token = tokenManager.getToken()
    if (!token) return
    const sentClientId = payload.clientId
    try {
      const res = await fetch(`${realtimeService.apiBaseUrl}/api/realtime/presence`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) return
      const data = await res.json().catch(() => null)
      // The server no longer knows this clientId (restart / silent drop). Only
      // resync if we haven't already moved on to a newer SSE client, otherwise a
      // request that lost a reconnect race would needlessly drop a healthy
      // stream. Throttled so a persistently unknown client can't loop.
      if (data && data.ok === false && data.reason === 'client_not_found') {
        const now = Date.now()
        if (
          realtimeService.clientId.value === sentClientId &&
          now - lastResyncAt >= RESYNC_COOLDOWN_MS
        ) {
          lastResyncAt = now
          realtimeService.resync()
        }
      }
    } catch (e) {
      // Presence is best-effort; ignore network errors.
    }
  }

  function baseBody() {
    return { clientId: realtimeService.clientId.value, page: getPage(), recordId: getRecordId() }
  }

  function join() {
    const clientId = realtimeService.clientId.value
    if (!clientId || !getPage() || !active()) {
      if (!active()) members.value = []
      return
    }
    request('PUT', baseBody())
  }

  function leave() {
    const clientId = realtimeService.clientId.value
    if (!clientId) return
    request('DELETE', { clientId })
  }

  function sendCursor(x, y) {
    const clientId = realtimeService.clientId.value
    if (!clientId || !getPage() || !active()) return
    request('PUT', { ...baseBody(), x, y })
  }

  function handlePointerMove(evt) {
    if (!active() || document.hidden) return
    const w = window.innerWidth || document.documentElement.clientWidth || 1
    const h = window.innerHeight || document.documentElement.clientHeight || 1
    const physicalX = Math.max(0, Math.min(100, Math.round((evt.clientX / w) * 1000) / 10))
    const x = document.documentElement.dir === 'rtl' ? 100 - physicalX : physicalX
    const y = Math.max(0, Math.min(100, Math.round((evt.clientY / h) * 1000) / 10))
    const now = Date.now()
    if (now - lastCursorAt < CURSOR_THROTTLE_MS) return

    const movedEnough =
      !lastCursor ||
      Math.abs(x - lastCursor.x) >= CURSOR_MIN_DELTA ||
      Math.abs(y - lastCursor.y) >= CURSOR_MIN_DELTA
    const heartbeat = now - lastCursorAt >= CURSOR_HEARTBEAT_MS

    if (movedEnough || heartbeat) {
      lastCursor = { x, y }
      lastCursorAt = now
      sendCursor(x, y)
    }
  }

  function attachCursor() {
    if (cursorAttached) return
    cursorAttached = true
    // `pointermove` covers mouse, pen and touch input, so presence cursors now
    // work on phones/tablets (iOS Safari fires pointer events for touch).
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
  }

  function onPresence(event, data) {
    const room = data?.room
    if (!room) return
    if (room.page !== getPage()) return
    if ((room.recordId ?? null) !== getRecordId()) return
    members.value = Array.isArray(data?.members) ? data.members : []
  }

  const unsub = realtimeService.subscribe(PRESENCE_CHANNEL, [PRESENCE_EVENT], onPresence)
  attachCursor()

  // SSE reconnect hands out a new clientId — re-register presence for it.
  const stopClientWatch = watch(
    () => realtimeService.clientId.value,
    (id) => {
      if (id) join()
      else members.value = []
    }
  )

  // Moving between pages/records: leave the old room, join the new one.
  const stopRoomWatch = watch([getPage, getRecordId], () => {
    leave()
    join()
  })

  // Toggling the feature in Settings applies live.
  const stopEnabledWatch = watch(presenceEnabled, (val) => {
    if (val && presenceSettingsLoaded.value) {
      join()
    } else {
      members.value = []
      lastCursor = null
      leave()
    }
  })

  onMounted(async () => {
    await loadPresenceSettings()
    if (active()) join()
  })

  onUnmounted(() => {
    leave()
    unsub()
    if (cursorAttached) {
      window.removeEventListener('pointermove', handlePointerMove)
      cursorAttached = false
    }
    stopClientWatch()
    stopRoomWatch()
    stopEnabledWatch()
  })

  return { members }
}
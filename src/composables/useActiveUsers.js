import { ref, onMounted, onUnmounted } from 'vue'
import { realtimeService } from '@/services/realtimeService'
import { getActiveUsers } from '@/api'

const ADMIN_CHANNEL = 'admin'
const ACTIVE_USERS_EVENT = 'active_users_updated'

/**
 * Admin-only, app-wide roster of connected users.
 *
 * - Initial load: GET /api/realtime/active-users (snapshot).
 * - Live updates: the `admin` SSE channel (`active_users_updated`). The server
 *   verifies the admin role before granting the channel, so a non-admin simply
 *   never receives the payloads.
 */
export function useActiveUsers() {
  const users = ref([])
  const count = ref(0)
  const loading = ref(false)

  function apply(payload) {
    const list = Array.isArray(payload?.users) ? payload.users : []
    users.value = list
    count.value = typeof payload?.count === 'number' ? payload.count : list.length
  }

  async function loadSnapshot() {
    if (loading.value) return
    loading.value = true
    try {
      const { data } = await getActiveUsers()
      apply(data)
    } catch (e) {
      // Best-effort: the SSE push (sent on connect) will populate the list.
    } finally {
      loading.value = false
    }
  }

  function onUpdate(_event, data) {
    apply(data)
  }

  const unsub = realtimeService.subscribe(ADMIN_CHANNEL, [ACTIVE_USERS_EVENT], onUpdate)

  onMounted(loadSnapshot)
  onUnmounted(unsub)

  return { users, count, loading, refresh: loadSnapshot }
}

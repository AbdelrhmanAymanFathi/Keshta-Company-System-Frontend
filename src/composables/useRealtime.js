import { onMounted, onUnmounted } from 'vue'
import { realtimeService } from '@/services/realtimeService'

export function useRealtime(options) {
  let unsub = null

  function getChannel() {
    return typeof options.channel === 'string' ? options.channel : options.channel?.value
  }

  function getEvents() {
    return Array.isArray(options.events) ? options.events : options.events?.value || []
  }

  function isEnabled() {
    if (options.enabled === undefined || options.enabled === null) return true
    return typeof options.enabled === 'boolean' ? options.enabled : options.enabled?.value
  }

  function doSubscribe() {
    if (unsub) return
    if (!isEnabled()) return

    const channel = getChannel()
    const events = getEvents()
    if (!channel || events.length === 0) return

    unsub = realtimeService.subscribe(channel, events, options.handler)
  }

  function doUnsubscribe() {
    if (unsub) {
      unsub()
      unsub = null
    }
  }

  onMounted(() => doSubscribe())
  onUnmounted(() => doUnsubscribe())

  return {
    subscribe: doSubscribe,
    unsubscribe: doUnsubscribe,
  }
}

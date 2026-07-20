import { useModalMemoryStore } from '@/stores/useModalMemoryStore'

/**
 * useModalMemory composable
 * @param {string} modalId - explicit modal identifier (required)
 */
export default function useModalMemory(modalId) {
  if (!modalId) throw new Error('useModalMemory requires a modalId')
  const store = useModalMemoryStore()

  function save(state) {
    if (!store.enabled) return
    // store a plain-serializable snapshot
    try {
      const payload = JSON.parse(JSON.stringify(state || {}))
      payload.__ts = Date.now()
      store.save(modalId, payload)
    } catch (e) {
      // ignore serialization errors
      console.warn('useModalMemory.save serialization failed', e)
    }
  }

  function restore() {
    if (!store.enabled) return null
    const payload = store.load(modalId)
    if (!payload) return null
    // return payload without internal ts
    const p = { ...payload }
    delete p.__ts
    return p
  }

  function clear() {
    if (!store.enabled) return
    store.clear(modalId)
  }

  return { save, restore, clear, enabled: () => store.enabled }
}

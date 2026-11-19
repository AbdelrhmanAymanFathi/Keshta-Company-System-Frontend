import { watchEffect } from 'vue'
import { usePermissions } from './usePermissions'

/**
 * v-can directive: hides the element when the user lacks the permission key.
 * Usage: <button v-can="'supplies.list'">...</button>
 * Reactive: re-evaluates when the user's permissions change.
 */
export const vCan = {
  mounted(el, binding) {
    const { can } = usePermissions()
    const stop = watchEffect(() => {
      const allowed = can(binding.value)
      if (allowed) {
        el.hidden = false
        if (el.style.display === 'none') el.style.display = el._vcDisplay || ''
      } else {
        if (el.style.display !== 'none') el._vcDisplay = el.style.display || ''
        el.style.display = 'none'
        el.hidden = true
      }
    })
    el._vcStop = stop
  },
  beforeUnmount(el) {
    if (el._vcStop) el._vcStop()
  },
}

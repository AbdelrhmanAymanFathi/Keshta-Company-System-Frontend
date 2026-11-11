// v-modal-focus — keyboard containment for hand-rolled modals.
//
//   <div v-if="open" class="fixed inset-0 ...">
//     <div v-modal-focus="{ onEscape: closeModal }" class="kc-modal-panel ..."> ... </div>
//   </div>
//
// • focuses the first field when the modal is mounted
// • keeps Tab / Shift+Tab inside the modal (wraps at the edges)
// • optionally closes on Escape when binding.value.onEscape is provided
// • ignores focus that belongs to teleported layers (calendar popovers) and to
//   nested modals that carry this directive themselves

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

const FIELD_TAGS = /^(INPUT|SELECT|TEXTAREA)$/

function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
}

function focusables(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible)
}

function isCloseButton(el) {
  if (!el || el.tagName !== 'BUTTON') return false
  const label = (el.getAttribute('aria-label') || el.textContent || '').trim().toLowerCase()
  return label === '×' || label === 'x' || label === 'close' || label === 'إغلاق'
}

function firstField(root) {
  const list = focusables(root)
  const field = list.find(el => FIELD_TAGS.test(el.tagName))
  if (field) return field
  return list.find(el => !isCloseButton(el)) || list[0] || null
}

// Focus that lives in a teleported layer (calendar popover, dropdown listbox)
// is managed by that layer — never yank it back into the modal.
function isFloatingLayer(el) {
  return !!(el && el.closest && el.closest('[data-slot="popover-content"], [role="listbox"]'))
}

function isInOtherModal(el, root) {
  const owner = el && el.closest && el.closest('[data-modal-focus]')
  return !!(owner && owner !== root)
}

function focusElement(el) {
  if (!el || typeof el.focus !== 'function') return
  // SearchDropdown opens its options on focus. Autofocus must not pop the
  // list open, so flag the focus event as programmatic for that component.
  const suppress = el.tagName === 'INPUT'
  if (suppress) el.setAttribute('data-suppress-focus-open', '')
  el.focus()
  if (suppress) el.removeAttribute('data-suppress-focus-open')
}

function createHandler(el) {
  return (event) => {
    const options = el.__modalFocusOptions || {}
    const active = document.activeElement

    if (isFloatingLayer(active) || isInOtherModal(active, el)) return

    if (event.key === 'Escape') {
      if (typeof options.onEscape === 'function') {
        event.preventDefault()
        event.stopPropagation()
        options.onEscape()
      }
      return
    }

    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return

    const list = focusables(el)
    if (!list.length) {
      event.preventDefault()
      return
    }

    const first = list[0]
    const last = list[list.length - 1]

    if (!el.contains(active)) {
      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
      return
    }

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

export default {
  mounted(el, binding) {
    el.setAttribute('data-modal-focus', '')
    el.__modalFocusOptions = binding.value || {}
    el.__modalFocusHandler = createHandler(el)
    document.addEventListener('keydown', el.__modalFocusHandler, true)

    const options = el.__modalFocusOptions
    const explicit = typeof options.initialFocus === 'function' ? options.initialFocus() : null
    const target = explicit || firstField(el)
    // Wait for the browser to lay the modal out before focusing.
    el.__modalFocusFrame = requestAnimationFrame(() => focusElement(target))
  },

  updated(el, binding) {
    el.__modalFocusOptions = binding.value || {}
  },

  unmounted(el) {
    if (el.__modalFocusFrame) cancelAnimationFrame(el.__modalFocusFrame)
    if (el.__modalFocusHandler) {
      document.removeEventListener('keydown', el.__modalFocusHandler, true)
    }
    delete el.__modalFocusHandler
    delete el.__modalFocusOptions
    delete el.__modalFocusFrame
  }
}

// Open overlays that own the Escape key while they are visible: date-picker
// popovers, search dropdown listboxes and inline vehicle dropdowns. A modal
// must let those close first instead of closing itself on the same keypress.
const FLOATING_LAYER_SELECTOR = [
  '[data-slot="popover-content"]',
  '[data-slot="alert-dialog-content"]',
  '[role="listbox"]',
  '.vehicle-dropdown',
  '.dropdown-container'
].join(', ')

export function hasOpenFloatingLayer() {
  return Array.from(document.querySelectorAll(FLOATING_LAYER_SELECTOR))
    .some(el => el.getClientRects().length > 0)
}

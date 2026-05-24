import type { SidebarLayoutState, SidebarType } from '@acme/theme-engine'
import { normalizeSidebarType } from './tokens'

export interface SidebarControllerState extends SidebarLayoutState {
  collapsedSidebar: boolean
  sidebarHovered: boolean
  sidebarPinned: boolean
}

/** Desktop modes where sidebar floats over content (no flex space) */
export function isFloatingMode(type?: string) {
  const t = normalizeSidebarType(type)
  return ['overlay', 'drawer'].includes(t)
}

/** Desktop modes that start closed until toggled */
export function startsClosedOnDesktop(type?: string) {
  const t = normalizeSidebarType(type)
  return ['overlay', 'drawer'].includes(t)
}

/** Show hamburger on desktop */
export function showDesktopToggle(type?: string) {
  const t = normalizeSidebarType(type)
  return ['overlay', 'drawer', 'reveal'].includes(t)
}

/** Whether the sidebar panel is visible (open) for the current breakpoint/mode */
export function resolveSidebarOpen(state: SidebarControllerState) {
  if (state.isMobile) return state.sidebarOpen
  const type = normalizeSidebarType(state.sidebarType)
  if (isFloatingMode(type)) return state.sidebarOpen
  return true
}

export function shouldShowBackdrop(state: SidebarControllerState) {
  const type = normalizeSidebarType(state.sidebarType)
  if (type === 'horizontal') return false
  if (!resolveSidebarOpen(state)) return false
  if (state.isMobile) return true
  return ['overlay', 'drawer'].includes(type)
}

/** Desktop collapse/pin control (static + slim+) */
export function showCollapseControl(type?: string) {
  const t = normalizeSidebarType(type)
  return t === 'static' || t === 'slim-plus'
}

export function resolveEffectiveCollapsed(state: SidebarControllerState) {
  if (state.isMobile) return false
  const type = normalizeSidebarType(state.sidebarType)
  switch (type) {
    case 'slim':
      return true
    case 'slim-plus':
      return !state.sidebarPinned && !state.sidebarHovered
    case 'reveal':
      return !state.sidebarHovered && !state.sidebarOpen
    case 'overlay':
    case 'drawer':
      return false
    default:
      return state.collapsedSidebar
  }
}

export function shouldShowSidebarLabels(state: SidebarControllerState) {
  if (state.isMobile) return true
  const type = normalizeSidebarType(state.sidebarType)
  if (type === 'slim') return true
  if (type === 'reveal') return state.sidebarHovered || state.sidebarOpen
  if (type === 'slim-plus') {
    return state.sidebarPinned || state.sidebarHovered || !state.collapsedSidebar
  }
  return !resolveEffectiveCollapsed(state)
}

export function getSidebarAsideClasses(state: SidebarControllerState) {
  const type = normalizeSidebarType(state.sidebarType)
  const collapsed = resolveEffectiveCollapsed(state)
  const floating = state.isMobile || isFloatingMode(type)
  const open = resolveSidebarOpen(state)

  if (type === 'horizontal') {
    return 'layout-sidebar layout-sidebar--horizontal hidden'
  }

  const classes = [
    'layout-sidebar',
    'theme-sidebar',
    'app-scrollbar',
    `layout-sidebar--${type}`,
    state.isMobile ? 'layout-sidebar--effective-drawer' : '',
    state.isRTL ? 'layout-sidebar--rtl' : '',
    state.isMobile ? 'layout-sidebar--mobile' : 'layout-sidebar--desktop',
    open ? 'layout-sidebar--open' : 'layout-sidebar--closed',
    collapsed ? 'layout-sidebar--collapsed' : 'layout-sidebar--expanded',
    state.sidebarHovered || (type === 'reveal' && state.sidebarOpen) ? 'layout-sidebar--hovered' : '',
    state.sidebarPinned ? 'layout-sidebar--pinned' : '',
    floating ? 'layout-sidebar--floating' : 'layout-sidebar--inline'
  ]

  return classes.filter(Boolean).join(' ')
}

export function lockBodyScroll(locked: boolean) {
  if (typeof document === 'undefined') return
  document.body.style.overflow = locked ? 'hidden' : ''
}

export function getEffectiveSidebarType(state: SidebarControllerState): SidebarType {
  if (state.isMobile) return 'drawer'
  return normalizeSidebarType(state.sidebarType)
}

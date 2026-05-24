import type { NormalizedTheme, SidebarLayoutState, ThemePlugin } from '@acme/theme-engine'
import { ref } from 'vue'
import {
  SIDEBAR_TYPES,
  SIDEBAR_META,
  applyLayoutTokens,
  normalizeSidebarType
} from './tokens'
import {
  type SidebarControllerState,
  shouldShowBackdrop,
  getSidebarAsideClasses as buildSidebarClasses,
  resolveEffectiveCollapsed,
  shouldShowSidebarLabels,
  startsClosedOnDesktop,
  showDesktopToggle,
  showCollapseControl,
  resolveSidebarOpen,
  isFloatingMode,
  lockBodyScroll
} from './sidebar-controller'

export { SIDEBAR_TYPES, SIDEBAR_META, applyLayoutTokens, normalizeSidebarType }
export {
  shouldShowBackdrop,
  resolveEffectiveCollapsed,
  shouldShowSidebarLabels,
  startsClosedOnDesktop,
  showDesktopToggle,
  showCollapseControl,
  resolveSidebarOpen,
  isFloatingMode,
  lockBodyScroll,
  type SidebarControllerState
}

export const layoutRevision = ref(0)

export function getSidebarOptions() {
  return Object.entries(SIDEBAR_META).map(([id, meta]) => ({
    id: id as import('@acme/theme-engine').SidebarType,
    ...meta
  }))
}

export function applySidebarLayout(sidebarType?: string) {
  const type = normalizeSidebarType(sidebarType)
  applyLayoutTokens()
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.sidebarLayout = type
    document.documentElement.style.setProperty('--theme-sidebar-type', type)
  }
  layoutRevision.value += 1
  return type
}

export function shouldShowSidebarOverlay(
  state: Pick<SidebarLayoutState, 'sidebarType' | 'isMobile' | 'sidebarOpen'>
) {
  return shouldShowBackdrop({
    ...state,
    isRTL: false,
    effectiveCollapsed: false,
    collapsedSidebar: false,
    sidebarHovered: false,
    sidebarPinned: false
  })
}

export function getSidebarAsideClasses(state: SidebarControllerState) {
  return buildSidebarClasses(state)
}

export function isSidebarCollapsedByDefault(sidebarType?: string) {
  return ['slim', 'slim-plus'].includes(normalizeSidebarType(sidebarType))
}

export const layoutPlugin: ThemePlugin = {
  name: 'layout-engine',
  install() {
    applyLayoutTokens()
  },
  apply(theme: NormalizedTheme) {
    applySidebarLayout(theme.sidebarType)
  }
}

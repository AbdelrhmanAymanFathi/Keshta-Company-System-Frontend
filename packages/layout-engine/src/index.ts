import { computed, inject, onMounted, onUnmounted, watch } from 'vue'
import { loadTheme, THEME_REVISION_KEY } from '@acme/theme-engine'
import { themeRevision } from '@acme/theme-engine'
import {
  getSidebarAsideClasses,
  shouldShowBackdrop,
  resolveEffectiveCollapsed,
  shouldShowSidebarLabels,
  startsClosedOnDesktop,
  showDesktopToggle,
  lockBodyScroll,
  applyLayoutTokens,
  getSidebarOptions
} from './sidebar'

export function useSidebarLayout(options: {
  isMobile: { value: boolean }
  isRTL: { value: boolean }
  sidebarOpen: { value: boolean }
  collapsedSidebar: { value: boolean }
  sidebarHovered: { value: boolean }
  sidebarPinned?: { value: boolean }
}) {
  const revision = inject(THEME_REVISION_KEY, themeRevision)

  onMounted(() => applyLayoutTokens())

  const sidebarType = computed(() => {
    void revision.value
    return loadTheme().sidebarType || 'static'
  })

  const controllerState = computed(() => ({
    sidebarType: sidebarType.value,
    isMobile: options.isMobile.value,
    isRTL: options.isRTL.value,
    sidebarOpen: options.sidebarOpen.value,
    effectiveCollapsed: false,
    collapsedSidebar: options.collapsedSidebar.value,
    sidebarHovered: options.sidebarHovered.value,
    sidebarPinned: options.sidebarPinned?.value ?? !options.collapsedSidebar.value
  }))

  const asideClasses = computed(() => getSidebarAsideClasses(controllerState.value))
  const showOverlay = computed(() => shouldShowBackdrop(controllerState.value))
  const effectiveCollapsed = computed(() => resolveEffectiveCollapsed(controllerState.value))
  const showLabels = computed(() => shouldShowSidebarLabels(controllerState.value))
  const desktopToggleVisible = computed(() => showDesktopToggle(sidebarType.value))
  const startsClosed = computed(() => startsClosedOnDesktop(sidebarType.value))

  watch(showOverlay, (visible) => {
    if (options.isMobile.value) lockBodyScroll(visible)
  })

  function onEscape(e: KeyboardEvent) {
    if (e.key === 'Escape' && options.sidebarOpen.value) {
      options.sidebarOpen.value = false
    }
  }

  onMounted(() => document.addEventListener('keydown', onEscape))
  onUnmounted(() => {
    document.removeEventListener('keydown', onEscape)
    lockBodyScroll(false)
  })

  return {
    sidebarType,
    asideClasses,
    showOverlay,
    effectiveCollapsed,
    showLabels,
    desktopToggleVisible,
    startsClosed,
    sidebarOptions: getSidebarOptions
  }
}

export * from './sidebar'
export { getEffectiveSidebarType } from './sidebar-controller'
export * from './tokens'

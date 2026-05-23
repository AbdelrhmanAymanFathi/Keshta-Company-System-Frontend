import { computed, inject } from 'vue'
import { loadTheme } from '@/theme'
import { themeRevision, THEME_REVISION_KEY } from '@/theme/state'
import {
  getSidebarAsideClasses,
  shouldShowSidebarOverlay,
  isSidebarCollapsedByDefault,
  getSidebarOptions
} from '@/theme/sidebar/layouts'

export function useSidebarLayout(localState) {
  const revision = inject(THEME_REVISION_KEY, themeRevision)

  const sidebarType = computed(() => {
    void revision.value
    return loadTheme().sidebarType || 'static'
  })

  const asideClasses = computed(() =>
    getSidebarAsideClasses({
      sidebarType: sidebarType.value,
      isMobile: localState.isMobile.value,
      isRTL: localState.isRTL.value,
      sidebarOpen: localState.sidebarOpen.value,
      effectiveCollapsed: localState.effectiveCollapsed.value
    })
  )

  const showOverlay = computed(() =>
    shouldShowSidebarOverlay({
      sidebarType: sidebarType.value,
      isMobile: localState.isMobile.value,
      sidebarOpen: localState.sidebarOpen.value
    })
  )

  const isHorizontal = computed(() => sidebarType.value === 'horizontal')

  const defaultCollapsed = computed(() => isSidebarCollapsedByDefault(sidebarType.value))

  return {
    sidebarType,
    asideClasses,
    showOverlay,
    isHorizontal,
    defaultCollapsed,
    sidebarOptions: getSidebarOptions
  }
}

import { normalizeSidebarType } from '../tokens'

export const SIDEBAR_META = {
  static: {
    label: 'Static',
    description: 'Fixed sidebar always visible on desktop'
  },
  overlay: {
    label: 'Overlay',
    description: 'Sidebar floats over content with backdrop'
  },
  slim: {
    label: 'Slim',
    description: 'Icon-only rail, labels hidden'
  },
  'slim-plus': {
    label: 'Slim+',
    description: 'Compact rail with tooltips on hover'
  },
  reveal: {
    label: 'Reveal',
    description: 'Collapsed rail expands on hover'
  },
  drawer: {
    label: 'Drawer',
    description: 'Off-canvas drawer, ideal for field/mobile'
  },
  horizontal: {
    label: 'Horizontal',
    description: 'Top navigation only, no vertical sidebar'
  }
}

export function getSidebarOptions() {
  return Object.entries(SIDEBAR_META).map(([id, meta]) => ({ id, ...meta }))
}

export function applySidebarLayout(sidebarType) {
  if (typeof document === 'undefined') return normalizeSidebarType(sidebarType)

  const type = normalizeSidebarType(sidebarType)
  document.documentElement.dataset.sidebarLayout = type
  document.documentElement.style.setProperty('--theme-sidebar-type', type)
  return type
}

/**
 * Build Tailwind classes for dashboard aside based on layout + state.
 */
export function getSidebarAsideClasses({
  sidebarType,
  isMobile,
  isRTL,
  sidebarOpen,
  effectiveCollapsed
}) {
  const type = normalizeSidebarType(sidebarType)
  const base =
    'app-scrollbar theme-sidebar border-r transition-all duration-300 z-40 flex flex-col overflow-y-auto shadow-sm'

  if (type === 'horizontal') {
    return `${base} hidden`
  }

  const padding = effectiveCollapsed && !isMobile ? 'p-2' : 'p-3 sm:p-4'

  if (isMobile || type === 'overlay' || type === 'drawer') {
    const side = isRTL ? 'right-0' : 'left-0'
    const transform = sidebarOpen
      ? 'translate-x-0'
      : isRTL
        ? 'translate-x-full'
        : '-translate-x-full'
    const width =
      type === 'slim' || (effectiveCollapsed && type === 'slim-plus')
        ? 'w-[4.5rem]'
        : 'w-[17rem] max-w-[90vw]'
    return `${base} ${padding} fixed top-0 bottom-0 ${width} ${side} ${transform}`
  }

  const collapsed = effectiveCollapsed || type === 'slim'
  let width = 'w-[17rem] lg:w-[18rem]'
  if (collapsed) {
    width = type === 'slim-plus' ? 'w-[4.75rem]' : 'w-20'
  } else if (type === 'slim-plus') {
    width = 'w-[15rem]'
  }

  const reveal =
    type === 'reveal' && !isMobile
      ? 'group/sidebar hover:w-[17rem] w-[4.75rem] overflow-x-hidden'
      : ''

  return `${base} ${padding} ${width} ${reveal} relative`
}

export function shouldShowSidebarOverlay({ sidebarType, isMobile, sidebarOpen }) {
  const type = normalizeSidebarType(sidebarType)
  if (!isMobile && type === 'static') return false
  if (type === 'horizontal') return false
  return sidebarOpen && (isMobile || ['overlay', 'drawer'].includes(type))
}

export function isSidebarCollapsedByDefault(sidebarType) {
  const type = normalizeSidebarType(sidebarType)
  return ['slim', 'slim-plus', 'reveal'].includes(type)
}

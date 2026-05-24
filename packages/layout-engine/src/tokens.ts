import type { SidebarType } from '@acme/theme-engine'

/** Runtime layout tokens — applied to :root via applyLayoutTokens() */
export const LAYOUT_TOKENS = {
  sidebar: {
    slimWidth: '4.5rem',
    slimPlusWidth: '5rem',
    expandedWidth: '17rem',
    expandedWidthLg: '18rem',
    drawerWidth: '18rem',
    mobileWidth: 'clamp(260px, 82vw, 340px)'
  },
  responsive: {
    settingsMaxWidth: '72rem',
    cardMinWidth: '17.5rem',
    cardMinWidthSm: '16rem',
    safePadding: 'clamp(0.875rem, 2vw, 1.5rem)',
    mobileToolbarHeight: '3.75rem'
  },
  zIndex: {
    backdrop: 35,
    sidebar: 40,
    header: 50,
    dropdown: 60
  },
  motion: {
    duration: '280ms',
    durationFast: '180ms',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  }
} as const

export const SIDEBAR_TYPES = [
  'static',
  'overlay',
  'slim',
  'slim-plus',
  'reveal',
  'drawer',
  'horizontal'
] as const

export function normalizeSidebarType(value?: string): SidebarType {
  const v = (value || 'static').toString().trim().toLowerCase()
  return (SIDEBAR_TYPES as readonly string[]).includes(v) ? (v as SidebarType) : 'static'
}

export const SIDEBAR_META: Record<SidebarType, { label: string; description: string }> = {
  static: { label: 'Static', description: 'Fixed sidebar always visible on desktop' },
  overlay: { label: 'Overlay', description: 'Floats over content — content width unchanged' },
  slim: { label: 'Slim', description: 'Icon rail — expands on hover' },
  'slim-plus': { label: 'Slim+', description: 'Compact rail — pin or hover to expand' },
  reveal: { label: 'Reveal', description: 'Hidden rail — reveals on hover' },
  drawer: { label: 'Drawer', description: 'Floating drawer panel' },
  horizontal: { label: 'Horizontal', description: 'Top navigation only' }
}

export function applyLayoutTokens() {
  if (typeof document === 'undefined') return
  const root = document.documentElement.style
  const t = LAYOUT_TOKENS
  root.setProperty('--layout-sidebar-slim', t.sidebar.slimWidth)
  root.setProperty('--layout-sidebar-slim-plus', t.sidebar.slimPlusWidth)
  root.setProperty('--layout-sidebar-expanded', t.sidebar.expandedWidth)
  root.setProperty('--layout-sidebar-expanded-lg', t.sidebar.expandedWidthLg)
  root.setProperty('--layout-sidebar-drawer', t.sidebar.drawerWidth)
  root.setProperty('--layout-sidebar-mobile', t.sidebar.mobileWidth)
  root.setProperty('--settings-max-width', t.responsive.settingsMaxWidth)
  root.setProperty('--card-min-width', t.responsive.cardMinWidth)
  root.setProperty('--card-min-width-sm', t.responsive.cardMinWidthSm)
  root.setProperty('--theme-safe-padding', t.responsive.safePadding)
  root.setProperty('--mobile-toolbar-height', t.responsive.mobileToolbarHeight)
  root.setProperty('--layout-z-backdrop', String(t.zIndex.backdrop))
  root.setProperty('--layout-z-sidebar', String(t.zIndex.sidebar))
  root.setProperty('--layout-motion-duration', t.motion.duration)
  root.setProperty('--layout-motion-duration-fast', t.motion.durationFast)
  root.setProperty('--layout-motion-ease', t.motion.ease)
  root.setProperty('--layout-motion-ease-out', t.motion.easeOut)
}

import type { Component } from 'vue'

export type AnimationPreset =
  | 'bubbles'
  | 'aurora'
  | 'grid'
  | 'liquid'
  | 'minimal'
  | 'particles'
  | 'truck'
  | 'smart-city'
  | 'construction'
  | 'blueprint'

export type IconPackId = 'heroicons' | 'lucide' | 'phosphor' | 'remix' | 'futuristic'

export type SidebarType =
  | 'static'
  | 'overlay'
  | 'slim'
  | 'slim-plus'
  | 'reveal'
  | 'drawer'
  | 'horizontal'

export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type DensityPreset = 'compact' | 'comfortable' | 'spacious'
export type ShadowPreset = 'flat' | 'soft' | 'elevated' | 'glow'

export interface ThemeColors {
  primary: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textLight: string
  textLightSecondary: string
  textLightMuted: string
  headingColor: string
  linkColor: string | null
  sidebarText: string
  cardText: string
}

export interface ThemeTypography {
  fontPreset: string
  fontFamily: string
}

export interface ThemeEffects {
  glow?: boolean
  glass?: boolean
  gradient?: boolean
  intensity?: 'low' | 'medium' | 'high'
}

export interface ThemeDefinition {
  id?: string
  name?: string
  personality?: string
  description?: string
  /** @deprecated flat primary — prefer colors.primary */
  primary?: string
  colors?: Partial<ThemeColors>
  typography?: Partial<ThemeTypography & ThemeColors>
  animation?: AnimationPreset | string
  iconPack?: IconPackId | string
  sidebarType?: SidebarType | string
  radius?: RadiusPreset | string
  density?: DensityPreset | string
  shadows?: ShadowPreset | string
  effects?: ThemeEffects
  /** Flat legacy fields */
  fontPreset?: string
  fontFamily?: string
  textPrimary?: string
  textSecondary?: string
  textMuted?: string
  textLight?: string
  textLightSecondary?: string
  textLightMuted?: string
  headingColor?: string
  linkColor?: string | null
  sidebarText?: string
  cardText?: string
}

export interface NormalizedTheme extends ThemeColors, ThemeTypography {
  id: string
  name: string
  personality?: string
  animation: AnimationPreset
  iconPack: IconPackId
  sidebarType: SidebarType
  radius: RadiusPreset
  density: DensityPreset
  shadows: ShadowPreset
  effects: ThemeEffects
}

export interface ApplyContext {
  engine: import('./engine').ThemeEngine
  previous: NormalizedTheme | null
  isSSR: boolean
}

export interface ThemePlugin {
  name: string
  install(engine: import('./engine').ThemeEngine): void
  apply?(theme: NormalizedTheme, ctx: ApplyContext): void | Promise<void>
}

export interface ThemeEngineOptions {
  storageKey?: string
  hydrate?: boolean
  ssr?: boolean
}

export interface ThemeSuggestionPreview {
  colors: string
  typography: string
  iconPack: string
  animation: string
  sidebarType: string
  radius?: string
  density?: string
  shadows?: string
}

export interface ThemeSuggestion {
  name: string
  confidence: number
  description: string
  presetId?: string
  preview: ThemeSuggestionPreview
  theme?: ThemeDefinition
  reasons: string[]
}

export type SemanticIconName =
  | 'add'
  | 'edit'
  | 'delete'
  | 'close'
  | 'vehicle'
  | 'users'
  | 'reports'
  | 'dashboard'
  | 'settings'
  | 'logout'
  | 'wallet'
  | 'equipment'
  | 'supplies'
  | 'contractor'
  | 'default'
  | string

export interface IconPackDefinition {
  id: IconPackId
  label: string
  style: 'outline' | 'solid' | 'rounded' | 'duotone' | 'minimal' | 'futuristic'
  strokeWidth?: number
  icons: Record<string, Component>
}

export interface SidebarLayoutState {
  sidebarType: SidebarType
  isMobile: boolean
  isRTL: boolean
  sidebarOpen: boolean
  effectiveCollapsed: boolean
}
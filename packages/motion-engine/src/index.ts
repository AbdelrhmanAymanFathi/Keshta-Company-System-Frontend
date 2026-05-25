import type { AnimationPreset, NormalizedTheme, ThemePlugin } from '@acme/theme-engine'
import { ANIMATION_PRESETS, DEFAULT_ANIMATION } from '@acme/theme-engine'

export const MOTION_PRESETS = ANIMATION_PRESETS

export function normalizeAnimation(animation?: string): AnimationPreset {
  const value = (animation || DEFAULT_ANIMATION).toString().trim().toLowerCase()
  return (ANIMATION_PRESETS as readonly string[]).includes(value)
    ? (value as AnimationPreset)
    : DEFAULT_ANIMATION
}

function clearAnimationClasses() {
  if (typeof document === 'undefined' || !document.body) return
  ANIMATION_PRESETS.forEach((preset) => {
    document.body.classList.remove(`theme-anim-${preset}`)
  })
}

export function applyAnimationPreset(animation?: string) {
  const preset = normalizeAnimation(animation)
  if (typeof document === 'undefined') return preset

  const apply = () => {
    if (!document.body) return
    clearAnimationClasses()
    document.body.classList.add(`theme-anim-${preset}`)
    document.documentElement.dataset.themeAnimation = preset
    document.documentElement.style.setProperty('--theme-animation', preset)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.dataset.motionReduced = reducedMotion ? 'true' : 'false'
  }

  if (document.body) apply()
  else document.addEventListener('DOMContentLoaded', apply, { once: true })

  return preset
}

export const motionPlugin: ThemePlugin = {
  name: 'motion-engine',
  install() {},
  apply(theme: NormalizedTheme) {
    applyAnimationPreset(theme.animation)
  }
}

export function getMotionPresets() {
  return [...ANIMATION_PRESETS]
}

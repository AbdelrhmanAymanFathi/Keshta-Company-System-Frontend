import { ref, onMounted, onUnmounted, computed } from 'vue'

/** Presets rendered by HeaderMotionLayer (Vue SVG scenes) */
export const MOTION_LAYER_PRESETS = ['truck', 'smart-city', 'construction', 'blueprint']

const BODY_CLASS_BY_PRESET = {
  truck: 'theme-anim-truck',
  'smart-city': 'theme-anim-smart-city',
  construction: 'theme-anim-construction',
  blueprint: 'theme-anim-blueprint'
}

export function getActiveMotionPreset() {
  if (typeof document === 'undefined') return null
  for (const preset of MOTION_LAYER_PRESETS) {
    if (document.body.classList.contains(BODY_CLASS_BY_PRESET[preset])) {
      return preset
    }
  }
  return null
}

export function useHeaderMotion() {
  const activePreset = ref(null)
  const prefersReducedMotion = ref(false)
  let bodyObserver = null
  let motionMedia = null

  const isStatic = computed(() => prefersReducedMotion.value)

  function syncActive() {
    activePreset.value = getActiveMotionPreset()
  }

  function syncReducedMotion() {
    prefersReducedMotion.value = motionMedia?.matches ?? false
  }

  onMounted(() => {
    syncActive()
    motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    syncReducedMotion()
    motionMedia.addEventListener('change', syncReducedMotion)

    bodyObserver = new MutationObserver(syncActive)
    if (document.body) {
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    }
  })

  onUnmounted(() => {
    bodyObserver?.disconnect()
    motionMedia?.removeEventListener('change', syncReducedMotion)
  })

  return { activePreset, prefersReducedMotion, isStatic }
}

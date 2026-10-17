import { ref } from 'vue'
import {
  unlockAudio,
  playStartupIntro,
  previewIntro,
  isStartupSoundEnabled,
  setStartupSoundEnabled,
  shouldPlayIntro,
  hasPlayedIntro,
} from '@/utils/startupIntro'

/**
 * Shared (module-level) state for the startup intro so it survives component
 * remounts: the intro can be triggered exactly once per browser session and the
 * overlay only ever renders the splash animation a single time.
 */
export const introEnabled = ref(isStartupSoundEnabled())
export const introBlocked = ref(false)
export const showIntroAnimation = ref(false)
export const introAnimationDone = ref(false)
export const introPlaying = ref(false)

const INTRO_ANIM_MS = 3600

let started = false
let animationTimer = null
let attemptPromise = null

export function finishIntroAnimation() {
  introAnimationDone.value = true
  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
}

function doAttempt() {
  if (!isStartupSoundEnabled() || !shouldPlayIntro()) return Promise.resolve({ status: 'skipped' })
  return playStartupIntro()
    .then((result) => {
      if (result.status === 'blocked') {
        introBlocked.value = true
      } else if (result.status === 'playing') {
        introBlocked.value = false
        introPlaying.value = true
      }
      return result
    })
    .catch((error) => {
      console.warn('[startup-intro] playback failed:', error)
      // Offer the manual button instead of failing silently.
      introBlocked.value = true
      return { status: 'error' }
    })
}

/** Starts playback once per browser session. Safe to call repeatedly. */
export function attemptIntro() {
  if (attemptPromise) return attemptPromise
  attemptPromise = doAttempt().finally(() => {
    attemptPromise = null
  })
  return attemptPromise
}

/**
 * Called once when the app shell mounts. Non-blocking: it flips a ref for the
 * splash animation and fires playback in the background, so auth, API calls and
 * dashboard rendering are never delayed.
 */
export function startIntroIfNeeded() {
  if (started) return
  started = true
  if (!shouldPlayIntro()) return
  showIntroAnimation.value = true
  animationTimer = setTimeout(finishIntroAnimation, INTRO_ANIM_MS)
  attemptIntro()
}

/**
 * Manual playback from the "Play Intro Sound" button. The AudioContext is
 * unlocked synchronously here so the call still happens inside the user gesture.
 */
export async function playIntroManually() {
  unlockAudio()
  if (attemptPromise) {
    try {
      await attemptPromise
    } catch (e) { /* previous attempt failed — continue */ }
  }
  if (hasPlayedIntro()) return { status: 'skipped' }
  introBlocked.value = false
  return attemptIntro()
}

export function toggleStartupSound(value) {
  introEnabled.value = !!value
  setStartupSoundEnabled(introEnabled.value)
  if (!introEnabled.value) {
    introBlocked.value = false
    introPlaying.value = false
    showIntroAnimation.value = false
    introAnimationDone.value = true
    if (animationTimer) {
      clearTimeout(animationTimer)
      animationTimer = null
    }
  } else if (!hasPlayedIntro()) {
    // Not consumed yet — let the user start it whenever they want.
    introBlocked.value = true
  }
}

export async function previewStartupSound() {
  unlockAudio()
  try {
    return await previewIntro()
  } catch (error) {
    console.warn('[startup-intro] preview failed:', error)
    return { status: 'error' }
  }
}

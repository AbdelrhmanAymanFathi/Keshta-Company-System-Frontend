/**
 * Startup intro for the Keshta General Contracting Management System.
 *
 * Playback priority:
 *   1. Prerecorded master file `public/audio/startup-intro.(mp3|wav)`
 *      (preferred — guarantees consistent quality and the exact "Kesh-ta"
 *      pronunciation on every device).
 *   2. Fallback built at runtime: a synthesised futuristic FX bed (Web Audio)
 *      followed by the spoken line via the SpeechSynthesis API using the best
 *      available English voice.
 *
 * Rules enforced here:
 *   - runs once per browser tab session (sessionStorage flag): it plays when a
 *     tab is opened and replays when the tab is closed and opened again
 *   - never replays on refresh / route change / component remount
 *   - honours the browser autoplay policy: when blocked we do NOT mark the intro
 *     as played, so the UI can offer a "Play Intro Sound" button instead
 *   - a settings toggle can disable the intro entirely
 *   - nothing here is awaited by the app shell (callers fire-and-forget), so
 *     auth, API traffic and dashboard rendering are never delayed
 */

const PLAYED_KEY = 'keshta_intro_played'
const ENABLED_KEY = 'keshta_intro_sound_enabled'

/** Exact sentence spoken by the intro voice. */
export const INTRO_SPEECH_TEXT = 'Keshta General Contracting Management System.'

/** Mastered intro files (user provided) — tried in order. */
const PRERECORDED_FILES = ['audio/startup-intro.mp3', 'audio/startup-intro.wav']

/** Keep the intro comfortably below the rest of the app's UI volume. */
const MASTER_VOLUME = 0.3

/** Start speaking slightly after the riser so the FX leads in. */
const VOICE_DELAY_MS = 900

// ---------------------------------------------------------------------------
// Storage helpers (safe: private mode / disabled storage never throws)
// ---------------------------------------------------------------------------

function read(key) {
  try { return window.localStorage.getItem(key) } catch (e) { return null }
}

function write(key, value) {
  try { window.localStorage.setItem(key, value) } catch (e) { /* storage unavailable */ }
}

function readSession(key) {
  try { return window.sessionStorage.getItem(key) } catch (e) { return null }
}

function writeSession(key, value) {
  try { window.sessionStorage.setItem(key, value) } catch (e) { /* storage unavailable */ }
}

export function hasPlayedIntro() {
  return readSession(PLAYED_KEY) === '1'
}

export function markIntroPlayed() {
  writeSession(PLAYED_KEY, '1')
}

/** Exposed for QA / manual testing only. */
export function resetIntroPlayed() {
  try { window.sessionStorage.removeItem(PLAYED_KEY) } catch (e) { /* noop */ }
}

export function isStartupSoundEnabled() {
  // Enabled unless the user explicitly turned it off.
  return read(ENABLED_KEY) !== '0'
}

export function setStartupSoundEnabled(value) {
  write(ENABLED_KEY, value ? '1' : '0')
}

export function shouldPlayIntro() {
  return isStartupSoundEnabled() && !hasPlayedIntro()
}

// ---------------------------------------------------------------------------
// AudioContext lifecycle (must be unlocked from inside a user gesture)
// ---------------------------------------------------------------------------

let audioCtx = null

function getAudioContext() {
  if (audioCtx) return audioCtx
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  try { audioCtx = new Ctor() } catch (e) { return null }
  return audioCtx
}

/**
 * Try to bring the shared AudioContext to "running".
 * Outside a user gesture Chrome keeps the resume() promise pending forever, so
 * we race it against a short timeout and report whether we actually got audio.
 * Call this synchronously from a click handler so the gesture is still active.
 */
export function unlockAudio(timeoutMs = 500) {
  const ctx = getAudioContext()
  if (!ctx) return Promise.resolve(false)
  if (ctx.state === 'running') return Promise.resolve(true)
  let resumePromise
  try {
    resumePromise = ctx.resume()
  } catch {
    return Promise.resolve(false)
  }
  const resumed = Promise.resolve(resumePromise).catch(() => false)
  const timedOut = new Promise(resolve => setTimeout(() => resolve(false), timeoutMs))
  return Promise.race([resumed, timedOut]).then(() => ctx.state === 'running')
}

// ---------------------------------------------------------------------------
// SpeechSynthesis voice
// ---------------------------------------------------------------------------

function allVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return []
  try { return window.speechSynthesis.getVoices() || [] } catch (e) { return [] }
}

function withVoices(callback) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    callback([])
    return
  }
  const existing = allVoices()
  if (existing.length) {
    callback(existing)
    return
  }
  let settled = false
  const finish = () => {
    if (settled) return
    settled = true
    clearTimeout(timer)
    try { window.speechSynthesis.removeEventListener('voiceschanged', finish) } catch (e) { /* noop */ }
    callback(allVoices())
  }
  const timer = setTimeout(finish, 1500)
  try { window.speechSynthesis.addEventListener('voiceschanged', finish, { once: true }) } catch (e) { finish() }
}

/**
 * Prefer a deep English male voice; fall back to any English voice, then null
 * (system default). Names containing "female" are always skipped.
 */
function pickEnglishVoice(voices) {
  if (!voices.length) return null
  const english = voices.filter(v => /^en(-|_|$)/i.test(v.lang || ''))
  if (!english.length) return null
  const notFemale = english.filter(v => !/female|feminine/i.test(v.name || ''))
  const maleByName = notFemale.filter(v => /\b(male|daniel|david|alex|fred|george|ryan|arthur|thomas|richard|guy|jason|nick|rob|mark|lee)\b/i.test(v.name || ''))
  return maleByName[0]
    || notFemale.find(v => /en[-_]GB/i.test(v.lang || ''))
    || notFemale.find(v => /(google|microsoft|neural|natural)/i.test(v.name || ''))
    || english[0]
}

function speakIntro() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  withVoices((voices) => {
    setTimeout(() => {
      try {
        const synth = window.speechSynthesis
        synth.cancel()
        const utterance = new SpeechSynthesisUtterance(INTRO_SPEECH_TEXT)
        const voice = pickEnglishVoice(voices)
        if (voice) {
          utterance.voice = voice
          utterance.lang = voice.lang || 'en-US'
        } else {
          utterance.lang = 'en-US'
        }
        utterance.rate = 0.96
        utterance.pitch = 0.8 // deeper / more authoritative
        utterance.volume = 0.85
        synth.speak(utterance)
      } catch (e) {
        console.warn('[startup-intro] speech synthesis unavailable:', e)
      }
    }, VOICE_DELAY_MS)
  })
}

// ---------------------------------------------------------------------------
// FX bed (Web Audio) — subtle futuristic riser + corporate pad
// ---------------------------------------------------------------------------

function noiseBuffer(ctx, seconds) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
  return buffer
}

function playIntroFx(ctx) {
  const t0 = ctx.currentTime + 0.03

  const master = ctx.createGain()
  master.gain.value = MASTER_VOLUME
  master.connect(ctx.destination)

  // 1. Futuristic riser: sawtooth through a sweeping low-pass.
  const riser = ctx.createOscillator()
  const riserFilter = ctx.createBiquadFilter()
  const riserGain = ctx.createGain()
  riser.type = 'sawtooth'
  riser.frequency.setValueAtTime(132, t0)
  riser.frequency.exponentialRampToValueAtTime(792, t0 + 0.86)
  riserFilter.type = 'lowpass'
  riserFilter.Q.value = 7
  riserFilter.frequency.setValueAtTime(220, t0)
  riserFilter.frequency.exponentialRampToValueAtTime(5200, t0 + 0.9)
  riserGain.gain.setValueAtTime(0.0001, t0)
  riserGain.gain.exponentialRampToValueAtTime(0.42, t0 + 0.1)
  riserGain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.62)
  riserGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.0)
  riser.connect(riserFilter)
  riserFilter.connect(riserGain)
  riserGain.connect(master)
  riser.start(t0)
  riser.stop(t0 + 1.05)

  // 2. Airy shimmer (band-passed noise).
  const shimmer = ctx.createBufferSource()
  shimmer.buffer = noiseBuffer(ctx, 1.1)
  const shimmerFilter = ctx.createBiquadFilter()
  shimmerFilter.type = 'bandpass'
  shimmerFilter.Q.value = 1.1
  shimmerFilter.frequency.setValueAtTime(900, t0)
  shimmerFilter.frequency.exponentialRampToValueAtTime(5200, t0 + 0.95)
  const shimmerGain = ctx.createGain()
  shimmerGain.gain.setValueAtTime(0.0001, t0)
  shimmerGain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.18)
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.05)
  shimmer.connect(shimmerFilter)
  shimmerFilter.connect(shimmerGain)
  shimmerGain.connect(master)
  shimmer.start(t0)
  shimmer.stop(t0 + 1.1)

  const voiceStart = t0 + VOICE_DELAY_MS / 1000
  const padEnd = voiceStart + 3.6

  // 3. Deep sub "hit" as the voice begins.
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(84, voiceStart)
  sub.frequency.exponentialRampToValueAtTime(46, voiceStart + 0.7)
  const subGain = ctx.createGain()
  subGain.gain.setValueAtTime(0.0001, voiceStart)
  subGain.gain.exponentialRampToValueAtTime(0.45, voiceStart + 0.05)
  subGain.gain.exponentialRampToValueAtTime(0.0001, voiceStart + 1.3)
  sub.connect(subGain)
  subGain.connect(master)
  sub.start(voiceStart)
  sub.stop(voiceStart + 1.35)

  // 4. Elegant corporate pad chord underneath the whole spoken line.
  const padFilter = ctx.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = 2000
  const padGain = ctx.createGain()
  padGain.gain.setValueAtTime(0.0001, voiceStart - 0.05)
  padGain.gain.exponentialRampToValueAtTime(0.13, voiceStart + 0.5)
  padGain.gain.setValueAtTime(0.13, padEnd - 0.9)
  padGain.gain.exponentialRampToValueAtTime(0.0001, padEnd)
  padGain.connect(master)
  padFilter.connect(padGain)
  ;[261.63, 329.63, 392.0, 523.25].forEach((frequency, index) => {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    oscGain.gain.value = index === 3 ? 0.03 : 0.05
    osc.connect(oscGain)
    oscGain.connect(padFilter)
    const start = Math.max(t0, voiceStart - 0.05 - index * 0.02)
    osc.start(start)
    osc.stop(padEnd + 0.05)
  })

  // 5. Soft chime accent on the first syllable.
  const chimeGain = ctx.createGain()
  chimeGain.gain.setValueAtTime(0.0001, voiceStart)
  chimeGain.gain.exponentialRampToValueAtTime(0.1, voiceStart + 0.03)
  chimeGain.gain.exponentialRampToValueAtTime(0.0001, voiceStart + 0.7)
  chimeGain.connect(master)
  ;[987.77, 1318.51].forEach((frequency) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = frequency
    osc.connect(chimeGain)
    osc.start(voiceStart)
    osc.stop(voiceStart + 0.75)
  })

  return padEnd - t0
}

// ---------------------------------------------------------------------------
// Prerecorded master file
// ---------------------------------------------------------------------------

let prerecorded = { checked: false, url: null }

function isAudioAsset(url) {
  return fetch(url, { method: 'HEAD', cache: 'no-store' })
    .then((response) => {
      if (!response.ok) return false
      const contentType = (response.headers.get('content-type') || '').toLowerCase()
      // Missing files fall back to the SPA index.html — never treat HTML as audio.
      return !contentType.includes('text/html')
    })
    .catch(() => false)
}

function resolvePrerecordedUrl() {
  if (prerecorded.checked) return Promise.resolve(prerecorded.url)
  prerecorded.checked = true
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  const chain = PRERECORDED_FILES.reduce((promise, file) => promise.then((found) => {
    if (found) return found
    const url = `${prefix}${file}`
    return isAudioAsset(url).then((ok) => (ok ? url : null))
  }), Promise.resolve(null))
  return chain.then((url) => {
    prerecorded.url = url
    return url
  })
}

function playFile(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    let settled = false
    const done = (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      audio.removeEventListener('canplay', onReady)
      audio.removeEventListener('error', onError)
      error ? reject(error) : resolve(audio)
    }
    const onReady = () => {
      const started = audio.play()
      if (started && typeof started.then === 'function') {
        started.then(() => done(null), (error) => done(error || new Error('play-rejected')))
      } else {
        done(null)
      }
    }
    const onError = () => done(new Error('prerecorded-audio-unavailable'))
    const timer = setTimeout(() => done(new Error('prerecorded-audio-timeout')), timeoutMs)
    audio.addEventListener('canplay', onReady, { once: true })
    audio.addEventListener('error', onError, { once: true })
    audio.preload = 'auto'
    audio.volume = 0.9
    audio.src = url
    audio.load()
  })
}

/**
 * @returns {Promise<'playing'|'blocked'|'missing'>}
 */
async function playPrerecorded() {
  const url = await resolvePrerecordedUrl()
  if (!url) return 'missing'
  try {
    await playFile(url)
    return 'playing'
  } catch (error) {
    if (error && (error.name === 'NotAllowedError' || error.name === 'SecurityError')) {
      return 'blocked'
    }
    // The asset disappeared or failed to decode — fall back to the synth path.
    prerecorded.url = null
    return 'missing'
  }
}

// ---------------------------------------------------------------------------
// Playback entry points
// ---------------------------------------------------------------------------

/**
 * @returns {Promise<{status: 'playing'|'blocked'|'disabled'|'skipped'|'error', method?: 'prerecorded'|'synth'}>}
 */
async function runIntroPlayback() {
  const prerecordedResult = await playPrerecorded()
  if (prerecordedResult === 'playing') return { status: 'playing', method: 'prerecorded' }
  if (prerecordedResult === 'blocked') return { status: 'blocked' }

  // Synthesised fallback: FX bed + spoken line.
  const ctx = getAudioContext()
  const unlocked = ctx ? await unlockAudio() : false
  if (ctx && !unlocked) return { status: 'blocked' }
  if (ctx) playIntroFx(ctx)
  speakIntro()
  return { status: 'playing', method: 'synth' }
}

/** First-visit flow: checks the preference/flag, plays, then records success. */
export async function playStartupIntro() {
  if (!isStartupSoundEnabled()) return { status: 'disabled' }
  if (hasPlayedIntro()) return { status: 'skipped' }
  try {
    const result = await runIntroPlayback()
    if (result.status === 'playing') markIntroPlayed()
    return result
  } catch (error) {
    console.warn('[startup-intro] playback failed:', error)
    return { status: 'error' }
  }
}

/** Settings preview: plays regardless of the first-visit flag, records nothing. */
export async function previewIntro() {
  try {
    return await runIntroPlayback()
  } catch (error) {
    console.warn('[startup-intro] preview failed:', error)
    return { status: 'error' }
  }
}

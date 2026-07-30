let audioCtx = null

function initAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', initAudioCtx, { once: true })
  window.addEventListener('touchstart', initAudioCtx, { once: true })
}

export function playNotificationSound() {
  try {
    if (!audioCtx) return
    if (audioCtx.state === 'suspended') return
    const ctx = audioCtx
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.value = 523.25
    gain1.gain.setValueAtTime(0.0001, now)
    gain1.gain.linearRampToValueAtTime(0.08, now + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.2)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = 659.25
    gain2.gain.setValueAtTime(0.0001, now + 0.1)
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.1)
    osc2.stop(now + 0.35)
  } catch (e) {
    // audio non-critical
  }
}

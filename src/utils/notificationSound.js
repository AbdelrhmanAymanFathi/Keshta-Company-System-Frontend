let audioCtx = null
let ringtoneTimer = null

function initAudioCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', initAudioCtx, { once: true })
  window.addEventListener('touchstart', initAudioCtx, { once: true })
}

function playTones(frequencies, duration, volume) {
  if (!audioCtx || audioCtx.state !== 'running') return
  const ctx = audioCtx
  const now = ctx.currentTime
  frequencies.forEach((frequency, index) => {
    const start = now + index * 0.16
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(volume, start + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.01)
  })
}

export function playNotificationSound() {
  try {
    playTones([523.25, 659.25], 0.2, 0.07)
  } catch (error) {
    console.warn('Notification sound could not be played:', error)
  }
}

export function playChatSound(type) {
  try {
    const patterns = {
      messageReceived: { frequencies: [784, 988], duration: 0.16, volume: 0.07 },
      messageSent: { frequencies: [659], duration: 0.16, volume: 0.07 },
      incomingCall: { frequencies: [880, 660], duration: 0.24, volume: 0.12 },
      outgoingCall: { frequencies: [440, 480], duration: 0.24, volume: 0.12 },
    }
    const pattern = patterns[type]
    if (pattern) playTones(pattern.frequencies, pattern.duration, pattern.volume)
  } catch (error) {
    console.warn('Chat sound could not be played:', error)
  }
}

export function startChatRingtone(type) {
  stopChatRingtone()
  playChatSound(type)
  ringtoneTimer = window.setInterval(() => playChatSound(type), 1800)
}

export function stopChatRingtone() {
  if (ringtoneTimer) {
    window.clearInterval(ringtoneTimer)
    ringtoneTimer = null
  }
}

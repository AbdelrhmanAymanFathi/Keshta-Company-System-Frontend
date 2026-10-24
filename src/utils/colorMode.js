import { ref } from 'vue'

const COLOR_MODE_KEY = 'keshta-color-mode'

export const colorMode = ref(getColorMode())

export function getColorMode() {
  return window.localStorage.getItem(COLOR_MODE_KEY) === 'dark' ? 'dark' : 'light'
}

export function setColorMode(mode) {
  if (mode !== 'light' && mode !== 'dark') {
    throw new Error(`Unsupported color mode: ${mode}`)
  }

  window.localStorage.setItem(COLOR_MODE_KEY, mode)
  document.documentElement.classList.toggle('dark', mode === 'dark')
  colorMode.value = mode
  return mode
}

export function initializeColorMode() {
  return setColorMode(getColorMode())
}

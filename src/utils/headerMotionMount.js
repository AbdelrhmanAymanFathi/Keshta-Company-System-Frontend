import { createApp } from 'vue'
import HeaderMotionLayer from '@/components/shared/HeaderMotionLayer.vue'

const mountedHeaders = new Map()

function cleanupDetached() {
  mountedHeaders.forEach((entry, header) => {
    if (!document.contains(header)) {
      entry.app.unmount()
      entry.host.remove()
      mountedHeaders.delete(header)
    }
  })
}

export function mountHeaderMotionLayers() {
  if (typeof document === 'undefined') return

  cleanupDetached()

  document.querySelectorAll('.app-page-header').forEach((header) => {
    if (mountedHeaders.has(header)) return
    if (header.querySelector('.header-motion-layer-host')) return

    const host = document.createElement('div')
    host.className = 'header-motion-layer-host'
    header.insertBefore(host, header.firstChild)

    const app = createApp(HeaderMotionLayer)
    app.mount(host)
    mountedHeaders.set(header, { app, host })
  })
}

let observer = null
let scheduled = false

function scheduleMount() {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(() => {
    scheduled = false
    mountHeaderMotionLayers()
  })
}

export function installHeaderMotion(router) {
  mountHeaderMotionLayers()

  if (!observer && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(scheduleMount)
    observer.observe(document.body, { childList: true, subtree: true })
  }

  if (router?.afterEach) {
    router.afterEach(() => scheduleMount())
  }
}

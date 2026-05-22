<template>
  <svg class="header-motion-layer__svg" viewBox="0 0 480 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient :id="ids.fog" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" class="hm-fill-fog-a" />
        <stop offset="100%" stop-color="rgb(255 255 255)" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="480" height="72" class="hm-sc__bg" />
    <g class="hm-sc__grid">
      <line v-for="x in gridX" :key="'vx'+x" :x1="x" y1="0" :x2="x" y2="72" class="hm-sc__grid-line" />
      <line v-for="y in gridY" :key="'hy'+y" x1="0" :y1="y" x2="480" :y2="y" class="hm-sc__grid-line" />
    </g>
    <g class="hm-sc__skyline hm-sc__skyline--far">
      <path d="M0 52 L24 52 L24 38 L40 38 L40 52 L72 52 L72 28 L96 28 L96 52 L140 52 L140 20 L168 20 L168 52 L220 52 L220 32 L248 32 L248 52 L300 52 L300 24 L328 24 L328 52 L380 52 L380 30 L408 30 L408 52 L480 52 L480 72 L0 72 Z" class="hm-fill-building hm-fill-building--far" />
    </g>
    <g class="hm-sc__skyline hm-sc__skyline--mid">
      <path d="M0 56 L16 56 L16 42 L36 42 L36 56 L58 56 L58 30 L82 30 L82 56 L118 56 L118 18 L148 18 L148 56 L190 56 L190 34 L214 34 L214 56 L260 56 L260 22 L292 22 L292 56 L334 56 L334 40 L358 40 L358 56 L400 56 L400 26 L430 26 L430 56 L480 56 L480 72 L0 72 Z" class="hm-fill-building" />
      <rect v-for="(w, i) in windows" :key="i" :x="w.x" :y="w.y" width="3" height="3" class="hm-sc__window" rx="0.5" />
    </g>
    <g class="hm-sc__data-lines">
      <line x1="-40" y1="24" x2="520" y2="24" class="hm-sc__data-line" />
      <line x1="-40" y1="40" x2="520" y2="40" class="hm-sc__data-line hm-sc__data-line--b" />
      <line x1="-40" y1="48" x2="520" y2="48" class="hm-sc__data-line hm-sc__data-line--c" />
    </g>
    <rect class="hm-sc__scan" x="0" y="0" width="3" height="72" />
    <rect width="480" height="72" :fill="`url(#${ids.fog})`" opacity="0.65" />
    <g class="hm-sc__particles">
      <circle v-for="(p, i) in particles" :key="i" :cx="p.x" :cy="p.y" r="1" class="hm-sc__particle" />
    </g>
  </svg>
</template>

<script>
import { useId } from 'vue'

export default {
  name: 'SmartCityScene',
  setup() {
    const uid = useId().replace(/:/g, '')
    const ids = { fog: `hm-sc-fog-${uid}` }
    const gridX = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480]
    const gridY = [0, 18, 36, 54, 72]
    const windows = [
      { x: 62, y: 38 }, { x: 70, y: 38 }, { x: 62, y: 46 }, { x: 124, y: 28 }, { x: 132, y: 28 },
      { x: 268, y: 32 }, { x: 276, y: 32 }, { x: 340, y: 48 }, { x: 408, y: 34 }, { x: 416, y: 42 }
    ]
    const particles = [
      { x: 40, y: 16 }, { x: 120, y: 12 }, { x: 200, y: 20 }, { x: 280, y: 14 },
      { x: 360, y: 18 }, { x: 420, y: 10 }, { x: 80, y: 26 }, { x: 300, y: 22 }
    ]
    return { ids, gridX, gridY, windows, particles }
  }
}
</script>

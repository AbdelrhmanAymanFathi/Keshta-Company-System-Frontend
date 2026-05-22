<template>
  <svg class="header-motion-layer__svg" viewBox="0 0 480 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient :id="ids.sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgb(255 255 255)" stop-opacity="0" />
        <stop offset="100%" class="hm-fill-sky" />
      </linearGradient>
      <linearGradient :id="ids.road" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" class="hm-fill-road-a" />
        <stop offset="100%" class="hm-fill-road-b" />
      </linearGradient>
    </defs>
    <rect width="480" height="58" :fill="`url(#${ids.sky})`" />
    <g class="hm-truck__city">
      <rect v-for="(b, i) in buildings" :key="i" :x="b.x" :y="b.y" :width="b.w" :height="b.h" :class="['hm-fill-building', b.tier && `hm-fill-building--${b.tier}`]" rx="1" />
    </g>
    <rect y="56" width="480" height="16" :fill="`url(#${ids.road})`" />
    <line x1="0" y1="58" x2="480" y2="58" class="hm-stroke-road" />
    <g class="hm-truck__vehicle">
      <rect x="0" y="44" width="58" height="10" class="hm-fill-shadow" rx="5" />
      <rect x="4" y="38" width="34" height="14" class="hm-fill-trailer" rx="2" />
      <rect x="40" y="40" width="16" height="12" class="hm-fill-cab" rx="2" />
      <rect x="52" y="42" width="4" height="5" class="hm-fill-glass" rx="1" />
      <circle cx="14" cy="54" r="4" class="hm-fill-wheel" />
      <circle cx="14" cy="54" r="2" class="hm-fill-hub" />
      <circle cx="46" cy="54" r="4" class="hm-fill-wheel" />
      <circle cx="46" cy="54" r="2" class="hm-fill-hub" />
    </g>
    <g class="hm-truck__haze">
      <ellipse cx="120" cy="52" rx="80" ry="12" class="hm-fill-haze" />
      <ellipse cx="360" cy="48" rx="100" ry="14" class="hm-fill-haze hm-fill-haze--soft" />
    </g>
  </svg>
</template>

<script>
import { computed, useId } from 'vue'

export default {
  name: 'TruckScene',
  props: { staticScene: { type: Boolean, default: false } },
  setup() {
    const uid = useId().replace(/:/g, '')
    const ids = { sky: `hm-sky-${uid}`, road: `hm-road-${uid}` }
    const buildings = [
      { x: 8, y: 28, w: 26, h: 30 }, { x: 40, y: 18, w: 22, h: 40, tier: 'b' },
      { x: 68, y: 24, w: 30, h: 34 }, { x: 104, y: 14, w: 18, h: 44, tier: 'd' },
      { x: 128, y: 22, w: 24, h: 36 }, { x: 158, y: 10, w: 20, h: 48, tier: 'b' },
      { x: 184, y: 20, w: 28, h: 38 }, { x: 218, y: 16, w: 16, h: 42, tier: 'd' },
      { x: 240, y: 26, w: 32, h: 32 }, { x: 278, y: 12, w: 22, h: 46, tier: 'b' },
      { x: 306, y: 22, w: 26, h: 36 }, { x: 338, y: 18, w: 20, h: 40, tier: 'd' },
      { x: 364, y: 8, w: 24, h: 50, tier: 'b' }, { x: 394, y: 20, w: 28, h: 38 },
      { x: 428, y: 26, w: 22, h: 32 }, { x: 456, y: 30, w: 24, h: 28 }
    ]
    return { ids, buildings }
  }
}
</script>

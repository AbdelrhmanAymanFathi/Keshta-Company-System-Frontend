<template>
  <svg class="header-motion-layer__svg" viewBox="0 0 480 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient :id="ids.road" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" class="hm-fill-road-a" />
        <stop offset="100%" class="hm-fill-road-b" />
      </linearGradient>
    </defs>
    <rect width="480" height="72" class="hm-cn__bg" />
    <g class="hm-cn__grid">
      <line v-for="x in gridX" :key="'x'+x" :x1="x" y1="8" :x2="x" y2="72" class="hm-cn__grid-line" />
      <line v-for="y in gridY" :key="'y'+y" x1="0" :y1="y" x2="480" :y2="y" class="hm-cn__grid-line" />
    </g>
    <g class="hm-cn__skyline hm-cn__skyline--back">
      <path d="M0 54 L20 54 L20 36 L48 36 L48 54 L90 54 L90 22 L120 22 L120 54 L170 54 L170 30 L200 30 L200 54 L250 54 L250 18 L280 18 L280 54 L330 54 L330 28 L360 28 L360 54 L410 54 L410 34 L440 34 L440 54 L480 54 L480 72 L0 72 Z" class="hm-fill-building hm-fill-building--far" />
    </g>
    <g class="hm-cn__skyline hm-cn__skyline--front">
      <path d="M0 58 L28 58 L28 40 L52 40 L52 58 L88 58 L88 26 L118 26 L118 58 L162 58 L162 38 L188 38 L188 58 L230 58 L230 20 L262 20 L262 58 L310 58 L310 42 L340 42 L340 58 L388 58 L388 32 L418 32 L418 58 L480 58 L480 72 L0 72 Z" class="hm-fill-building" />
    </g>
    <g class="hm-cn__crane">
      <rect x="318" y="8" width="4" height="42" class="hm-fill-building hm-fill-building--tall" />
      <rect x="280" y="8" width="46" height="3" class="hm-fill-cab" />
      <line x1="322" y1="11" x2="322" y2="50" class="hm-cn__crane-cable" />
      <rect x="318" y="48" width="8" height="4" class="hm-fill-trailer" rx="0.5" />
    </g>
    <g class="hm-cn__glow-lines">
      <line x1="0" y1="62" x2="480" y2="62" class="hm-cn__glow-line" />
      <line x1="0" y1="64" x2="480" y2="64" class="hm-cn__glow-line hm-cn__glow-line--b" />
    </g>
    <rect y="54" width="480" height="18" :fill="`url(#${ids.road})`" />
    <rect class="hm-cn__scan-beam" x="0" y="0" width="480" height="2" />
    <g class="hm-cn__vehicle">
      <rect x="0" y="46" width="56" height="8" class="hm-fill-shadow" rx="4" />
      <rect x="4" y="40" width="32" height="12" class="hm-fill-trailer" rx="2" />
      <rect x="38" y="42" width="14" height="10" class="hm-fill-cab" rx="2" />
      <circle cx="12" cy="54" r="3.5" class="hm-fill-wheel" />
      <circle cx="12" cy="54" r="1.5" class="hm-fill-hub" />
      <circle cx="44" cy="54" r="3.5" class="hm-fill-wheel" />
      <circle cx="44" cy="54" r="1.5" class="hm-fill-hub" />
    </g>
    <ellipse cx="240" cy="60" rx="160" ry="8" class="hm-fill-haze" />
  </svg>
</template>

<script>
import { useId } from 'vue'

export default {
  name: 'ConstructionScene',
  setup() {
    const uid = useId().replace(/:/g, '')
    const ids = { road: `hm-cn-road-${uid}` }
    const gridX = Array.from({ length: 13 }, (_, i) => i * 40)
    const gridY = [12, 28, 44, 60]
    return { ids, gridX, gridY }
  }
}
</script>

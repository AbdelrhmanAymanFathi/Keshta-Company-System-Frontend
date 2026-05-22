<template>
  <svg class="header-motion-layer__svg" viewBox="0 0 480 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="480" height="72" class="hm-bp__bg" />
    <g class="hm-bp__grid">
      <line v-for="x in fineX" :key="'fx'+x" :x1="x" y1="0" :x2="x" y2="72" class="hm-bp__grid-fine" />
      <line v-for="y in fineY" :key="'fy'+y" x1="0" :y1="y" x2="480" :y2="y" class="hm-bp__grid-fine" />
      <line v-for="x in coarseX" :key="'cx'+x" :x1="x" y1="0" :x2="x" y2="72" class="hm-bp__grid-coarse" />
      <line v-for="y in coarseY" :key="'cy'+y" x1="0" :y1="y" x2="480" :y2="y" class="hm-bp__grid-coarse" />
    </g>
    <g class="hm-bp__wireframe">
      <rect x="48" y="28" width="40" height="30" class="hm-bp__outline" />
      <rect x="108" y="18" width="32" height="40" class="hm-bp__outline" />
      <rect x="156" y="24" width="48" height="34" class="hm-bp__outline" />
      <rect x="220" y="14" width="36" height="44" class="hm-bp__outline" />
      <rect x="272" y="22" width="44" height="36" class="hm-bp__outline" />
      <rect x="332" y="16" width="28" height="42" class="hm-bp__outline" />
      <rect x="376" y="26" width="52" height="32" class="hm-bp__outline" />
      <line x1="48" y1="58" x2="428" y2="58" class="hm-bp__dimension" />
      <line x1="48" y1="56" x2="48" y2="60" class="hm-bp__tick" />
      <line x1="428" y1="56" x2="428" y2="60" class="hm-bp__tick" />
      <line x1="30" y1="28" x2="30" y2="58" class="hm-bp__dimension hm-bp__dimension--v" />
    </g>
    <g class="hm-bp__markers">
      <path v-for="(m, i) in corners" :key="i" :d="m" class="hm-bp__corner" />
    </g>
    <rect class="hm-bp__scan" y="0" width="480" height="72" />
    <line x1="0" y1="36" x2="480" y2="36" class="hm-bp__guide" />
  </svg>
</template>

<script>
export default {
  name: 'BlueprintScene',
  setup() {
    const fineX = Array.from({ length: 25 }, (_, i) => i * 20)
    const fineY = Array.from({ length: 5 }, (_, i) => i * 18)
    const coarseX = Array.from({ length: 7 }, (_, i) => i * 80)
    const coarseY = [0, 36, 72]
    const corners = [
      'M44 24 L44 20 L48 20 L48 24 Z',
      'M432 24 L432 20 L436 20 L436 24 Z',
      'M44 54 L44 58 L48 58 L48 54 Z'
    ]
    return { fineX, fineY, coarseX, coarseY, corners }
  }
}
</script>

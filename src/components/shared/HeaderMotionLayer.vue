<template>
  <div
    v-if="activePreset"
    class="header-motion-layer"
    :class="[
      `header-motion-layer--${activePreset}`,
      { 'header-motion-layer--static': isStatic }
    ]"
    aria-hidden="true"
  >
    <TruckScene v-if="activePreset === 'truck'" />
    <SmartCityScene v-else-if="activePreset === 'smart-city'" />
    <ConstructionScene v-else-if="activePreset === 'construction'" />
    <BlueprintScene v-else-if="activePreset === 'blueprint'" />
  </div>
</template>

<script>
import { useHeaderMotion } from './headerMotion/useHeaderMotion'
import TruckScene from './headerMotion/scenes/TruckScene.vue'
import SmartCityScene from './headerMotion/scenes/SmartCityScene.vue'
import ConstructionScene from './headerMotion/scenes/ConstructionScene.vue'
import BlueprintScene from './headerMotion/scenes/BlueprintScene.vue'

export default {
  name: 'HeaderMotionLayer',
  components: { TruckScene, SmartCityScene, ConstructionScene, BlueprintScene },
  setup() {
    const { activePreset, isStatic } = useHeaderMotion()
    return { activePreset, isStatic }
  }
}
</script>

<template>
  <div v-if="others.length" class="flex items-center" :title="othersLabel">
    <div
      v-for="m in visible"
      :key="m.userId"
      class="presence-avatar flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
      :style="{
        backgroundColor: colorFor(m.userId),
        zIndex: 10 - m._i
      }"
      :title="m.name"
    >
      {{ initials(m.name) }}
    </div>
    <div
      v-if="overflow > 0"
      class="presence-avatar presence-avatar--more flex h-8 w-8 items-center justify-center rounded-full bg-slate-500 text-xs font-bold text-white shadow-md"
      :title="overflowLabel"
    >
      +{{ overflow }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { user } from '@/composables/authStore'
import { colorFor, initials } from '@/utils/presenceUtils'

export default {
  name: 'PresenceAvatars',
  props: {
    members: {
      type: Array,
      default: () => []
    },
    max: {
      type: Number,
      default: 4
    }
  },
  setup(props) {
    const others = computed(() => {
      const myId = user.value?.id
      return props.members
        .filter((m) => m.userId !== myId)
        .map((m, _i) => ({ ...m, _i }))
    })
    const visible = computed(() => others.value.slice(0, props.max))
    const overflow = computed(() => Math.max(0, others.value.length - props.max))
    const overflowLabel = computed(() =>
      others.value.slice(props.max).map((m) => m.name || '?').join(', ')
    )
    const othersLabel = computed(() =>
      others.value.map((m) => m.name || '?').join(', ')
    )

    return { others, visible, overflow, overflowLabel, othersLabel, colorFor, initials }
  }
}
</script>

<style scoped>
.presence-avatar {
  margin-inline-start: -8px;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.9);
  transition: transform 0.15s ease, z-index 0.15s ease;
}
.presence-avatar:first-child {
  margin-inline-start: 0;
}
.presence-avatar:hover {
  transform: translateY(-2px);
  z-index: 30 !important;
}
</style>
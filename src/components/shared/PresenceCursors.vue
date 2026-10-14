<template>
  <div v-if="activeCursors.length" class="presence-cursors" aria-hidden="true">
    <div
      v-for="m in activeCursors"
      :key="m.userId"
      class="pcursor"
      :style="{ left: displayX(m.cursor.x) + '%', top: m.cursor.y + '%', '--pc': colorFor(m.userId) }"
    >
      <svg class="pcursor__arrow" width="18" height="18" viewBox="0 0 18 18">
        <path d="M1 1 L16 7.5 L9.5 9.5 L7.5 16 Z" fill="currentColor" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round" />
      </svg>
      <span class="pcursor__avatar">{{ initials(m.name) }}</span>
      <span class="pcursor__label">{{ m.name || '?' }}</span>
    </div>
  </div>
</template>

<script>
import { computed, ref, onUnmounted } from 'vue'
import { user } from '@/composables/authStore'
import { colorFor, initials } from '@/utils/presenceUtils'

const IDLE_MS = 5000

export default {
  name: 'PresenceCursors',
  props: {
    members: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const tick = ref(0)
    const timer = setInterval(() => { tick.value++ }, 1000)
    onUnmounted(() => clearInterval(timer))

    const activeCursors = computed(() => {
      void tick.value
      const myId = Number(user.value?.id)
      const list = (props.members || []).filter((m) => {
        const memberId = Number(m.userId)
        return !(Number.isSafeInteger(myId) && Number.isSafeInteger(memberId) && memberId === myId) && m.cursor
      })
      const now = Date.now()
      return list.filter((m) => now - m.cursor.at <= IDLE_MS)
    })

    function displayX(logicalX) {
      return document.documentElement.dir === 'rtl' ? 100 - logicalX : logicalX
    }

    return { activeCursors, colorFor, displayX, initials }
  }
}
</script>

<style scoped>
.presence-cursors {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  overflow: hidden;
}
.pcursor {
  position: absolute;
  color: var(--pc, #3b82f6);
  transform: translate(-1px, -1px);
  will-change: left, top;
  transition: left 0.09s linear, top 0.09s linear;
}
.pcursor__arrow {
  position: absolute;
  top: 0;
  left: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}
.pcursor__avatar {
  position: absolute;
  top: 11px;
  left: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: var(--pc, #3b82f6);
  border: 2px solid #ffffff;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
.pcursor__label {
  position: absolute;
  top: 13px;
  left: 37px;
  max-width: 160px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--pc, #3b82f6);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
</style>
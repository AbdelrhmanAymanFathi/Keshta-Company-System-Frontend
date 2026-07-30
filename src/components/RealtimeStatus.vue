<template>
  <div v-if="!realtimeService.isConnected.value" class="realtime-status disconnected">
    <span class="dot" /> Reconnecting...
  </div>
</template>

<script>
import { realtimeService } from '@/services/realtimeService'

export default {
  name: 'RealtimeStatus',
  setup() {
    return { realtimeService }
  },
}
</script>

<style scoped>
.realtime-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.realtime-status.disconnected {
  background: #fff3cd;
  color: #856404;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffc107;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>

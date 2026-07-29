<template>
  <div
    class="relative rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 transition-all"
    :class="{ 'fixed inset-4 z-50 overflow-auto': fullscreen }"
  >
    <div class="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
      <div class="min-w-0">
        <h3 class="text-base font-semibold theme-text-primary truncate">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-xs theme-text-muted mt-0.5">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-1 ml-4 shrink-0">
        <button
          v-if="!noFullscreen"
          @click="toggleFullscreen"
          class="rounded-lg p-1.5 theme-text-secondary hover:bg-slate-100 transition-colors"
          :title="$t('dashboard.expand')"
        >
          <svg v-if="!fullscreen" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9L4 4m0 0l5 5M4 4l5 5m6-6l5 5m0 0l-5 5m5-5l-5 5m-6 6l5 5m0 0l-5-5m5 5l-5-5" />
          </svg>
        </button>
        <slot name="actions" />
      </div>
    </div>

    <div class="p-5">
      <DashboardSkeleton v-if="loading" :lines="4" />
      <DashboardEmpty v-else-if="empty" :message="emptyMessage" />
      <DashboardError v-else-if="error" :message="error" @retry="$emit('retry')" />
      <slot v-else name="chart" />
    </div>
  </div>
</template>

<script>
import DashboardSkeleton from './DashboardSkeleton.vue'
import DashboardEmpty from './DashboardEmpty.vue'
import DashboardError from './DashboardError.vue'

export default {
  name: 'ChartCard',
  components: { DashboardSkeleton, DashboardEmpty, DashboardError },
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    empty: { type: Boolean, default: false },
    emptyMessage: { type: String, default: '' },
    error: { type: String, default: '' },
    noFullscreen: { type: Boolean, default: false }
  },
  emits: ['retry'],
  data() {
    return { fullscreen: false }
  },
  methods: {
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>

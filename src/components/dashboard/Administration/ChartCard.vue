<template>
  <Card
    class="shadcn-ui relative overflow-hidden border-border/80 bg-card shadow-lg shadow-slate-200/40 transition-all"
    :class="{ 'chart-card-fullscreen fixed inset-4 overflow-auto': fullscreen }"
  >
    <CardHeader class="flex flex-row items-center justify-between space-y-0 border-b border-border/80 px-5 py-4">
      <div class="min-w-0">
        <CardTitle class="truncate text-base font-semibold">
          {{ title }}
        </CardTitle>
        <CardDescription v-if="subtitle" class="mt-0.5 text-xs">
          {{ subtitle }}
        </CardDescription>
      </div>
      <div class="ms-4 flex shrink-0 items-center gap-1">
        <Button
          v-if="!noFullscreen"
          type="button"
          variant="ghost"
          size="icon-sm"
          class="text-muted-foreground"
          :title="$t('dashboard.expand')"
          @click="toggleFullscreen"
        >
          <svg v-if="!fullscreen" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9L4 4m0 0l5 5M4 4l5 5m6-6l5 5m0 0l-5 5m5-5l-5 5m-6 6l5 5m0 0l-5-5m5 5l-5-5" />
          </svg>
        </Button>
        <slot name="actions" />
      </div>
    </CardHeader>

    <CardContent class="p-5">
      <DashboardSkeleton v-if="loading" :lines="4" />
      <DashboardEmpty v-else-if="empty" :message="emptyMessage" />
      <DashboardError v-else-if="error" :message="error" @retry="$emit('retry')" />
      <slot v-else name="chart" />
    </CardContent>
  </Card>
</template>

<script>
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardSkeleton from './DashboardSkeleton.vue'
import DashboardEmpty from './DashboardEmpty.vue'
import DashboardError from './DashboardError.vue'

export default {
  name: 'ChartCard',
  components: {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DashboardSkeleton,
    DashboardEmpty,
    DashboardError
  },
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

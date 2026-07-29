<template>
  <div class="flex flex-col items-center justify-center py-6 text-center">
    <svg class="w-10 h-10 text-red-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
    <p class="text-sm text-red-500 mb-3">{{ message || $t('adminStats.loadError') }}</p>
    <button
      @click="$emit('retry')"
      class="rounded-lg theme-button px-4 py-1.5 text-sm theme-text-light"
    >
      {{ $t('adminStats.retry') }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'DashboardError',
  props: {
    message: { type: String, default: '' }
  },
  emits: ['retry']
}
</script>

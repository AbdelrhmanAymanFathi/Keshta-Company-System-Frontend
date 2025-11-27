<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
    <div class="bg-white rounded-lg p-8 max-w-3xl w-full text-center shadow-lg">
      <div class="text-6xl font-bold text-red-600 mb-4">{{ code }}</div>
      <div class="text-xl text-gray-700 mb-6">{{ message || $t('common.error') }}</div>

      <div class="flex justify-center gap-3">
        <button @click="retry" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{{ $t('labels.retry') || 'Retry' }}</button>
        <a :href="staticPage" target="_blank" rel="noopener" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">Open static page</a>
        <button @click="dismiss" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'ErrorOverlay',
  props: {
    staticPage: {
      type: String,
      default: '/502.html'
    }
  },
  setup(props) {
    const visible = ref(false)
    const code = ref(null)
    const message = ref(null)

    const handler = (e) => {
      if (!e || !e.detail) return
      code.value = e.detail.code || 502
      message.value = e.detail.message || null
      visible.value = true
    }

    onMounted(() => {
      window.addEventListener('app:error', handler)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:error', handler)
    })

    const retry = () => {
      // Force a reload of the page so that the web app can reattempt.
      window.location.reload()
    }

    const dismiss = () => {
      visible.value = false
    }

    return { visible, code, message, retry, dismiss }
  }
}
</script>

<style scoped>
/* small style to center content */
</style>

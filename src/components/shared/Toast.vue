<template>
  <teleport to="body">
    <transition-group name="toast" tag="div" class="fixed top-4 right-4 z-[9999] space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'min-w-[300px] max-w-md rounded-lg shadow-lg p-4 flex items-start gap-3',
          toastVariantClasses[toast.type] || toastVariantClasses.info
        ]"
      >
        <div class="flex-shrink-0">
          <svg v-if="toast.type === 'success'" class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="h-5 w-5 theme-text" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium" :class="toastTextClasses[toast.type] || toastTextClasses.info">
            {{ toast.message }}
          </p>
        </div>
        <button @click="removeToast(toast.id)" class="flex-shrink-0 theme-caption hover:theme-text-secondary">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </transition-group>
  </teleport>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ToastComponent',
  setup() {
    const toasts = ref([])
    let toastIdCounter = 0

    const addToast = (message, type = 'info', duration = 3000) => {
      const id = ++toastIdCounter
      const toast = { id, message, type }
      toasts.value.push(toast)

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    }

    const removeToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }

    // Global toast function
    const showToast = (message, type, duration) => {
      return addToast(message, type, duration)
    }

    const toastVariantClasses = {
      success: 'bg-green-50 border border-green-200',
      error: 'bg-red-50 border border-red-200',
      info: 'bg-white border border-gray-300',
      warning: 'bg-yellow-50 border border-yellow-200'
    }

    const toastTextClasses = {
      success: 'text-green-800',
      error: 'text-red-800',
      info: 'text-gray-900',
      warning: 'text-yellow-800'
    }

    // Expose to window for global access
    onMounted(() => {
      window.$toast = showToast
    })

    onUnmounted(() => {
      delete window.$toast
    })

    return {
      toasts,
      addToast,
      removeToast,
      toastVariantClasses,
      toastTextClasses
    }
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>


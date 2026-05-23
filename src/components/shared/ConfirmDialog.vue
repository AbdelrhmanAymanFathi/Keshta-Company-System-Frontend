<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="handleBackdrop">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white confirm-dialog-inner" :class="{ 'animate-shake': shaking }" tabindex="-1">
      <div class="mt-3">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full" :class="iconBgClass">
          <svg class="h-6 w-6" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="type === 'danger'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="mt-2 text-center">
          <h3 class="text-lg font-medium theme-text-primary">{{ title }}</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm theme-text-muted">{{ message }}</p>
          </div>
        </div>
        <div class="flex justify-center gap-3 pt-4">
          <button @click="handleCancel"
            class="px-4 py-2 border border-gray-300 rounded-md theme-text-secondary hover:bg-gray-50 transition">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" :disabled="loading"
            :class="[
              'px-4 py-2 rounded-md theme-text-light transition disabled:opacity-50',
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'theme-button '
            ]">
            {{ loading ? loadingText : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirm Action'
    },
    message: {
      type: String,
      default: 'Are you sure you want to proceed?'
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    loadingText: {
      type: String,
      default: 'Processing...'
    },
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'danger'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    }
    ,
    // If true, clicking the backdrop will NOT cancel/close the dialog.
    // Instead it will trigger a shake animation to indicate the dialog requires an explicit action.
    preventBackdropClose: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      shaking: false
    }
  },

  computed: {
    iconBgClass() {
      return this.type === 'danger' ? 'bg-red-100' : 'theme-icon-bg'
    },
    iconColorClass() {
      return this.type === 'danger' ? 'text-red-600' : 'theme-text'
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm')
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleBackdrop() {
      if (this.preventBackdropClose) {
        // trigger shake animation instead of closing
        this.triggerShake()
      } else {
        this.handleCancel()
      }
    },
    triggerShake() {
      if (this.shaking) return
      this.shaking = true
      setTimeout(() => {
        this.shaking = false
        // restore focus to dialog
        this.$nextTick(() => {
          const modal = this.$el.querySelector('.confirm-dialog-inner')
          if (modal && typeof modal.focus === 'function') modal.focus()
        })
      }, 500)
    }
  }
}
</script>

<style scoped>
@keyframes shake {
  0% { transform: translateX(0); }
  10% { transform: translateX(-8px); }
  20% { transform: translateX(8px); }
  30% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  50% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(-1px); }
 100% { transform: translateX(0); }
}
.animate-shake { animation: shake 0.5s ease; will-change: transform; }
</style>


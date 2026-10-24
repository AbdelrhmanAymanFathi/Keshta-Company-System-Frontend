<template>
  <AlertDialog :open="show" @update:open="handleOpenChange">
    <AlertDialogContent
      ref="dialogContent"
      class="confirm-dialog-inner shadcn-ui w-[calc(100%-2rem)] max-w-sm"
      :class="{ 'animate-shake': shaking }"
      @pointer-down-outside="handleOutsidePointer"
    >
      <AlertDialogHeader class="text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full" :class="iconBgClass">
          <svg class="h-6 w-6" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path v-if="type === 'danger'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <AlertDialogTitle class="text-lg font-medium theme-text-primary">
          {{ title }}
        </AlertDialogTitle>
        <AlertDialogDescription class="text-sm theme-text-muted">
          {{ message }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter class="justify-center sm:justify-center">
        <AlertDialogCancel>{{ cancelText }}</AlertDialogCancel>
        <Button
          :variant="type === 'danger' ? 'destructive' : 'default'"
          :class="{ 'theme-button': type !== 'danger' }"
          :disabled="loading"
          @click="handleConfirm"
        >
          {{ loading ? loadingText : confirmText }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script>
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export default {
  name: 'ConfirmDialog',
  components: {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button
  },
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
    },
    // If true, clicking the backdrop will NOT cancel/close the dialog.
    // Instead it will trigger a shake animation to indicate the dialog requires an explicit action.
    preventBackdropClose: {
      type: Boolean,
      default: false
    }
  },
  emits: ['confirm', 'cancel'],
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
    handleOpenChange(open) {
      if (!open) this.$emit('cancel')
    },
    handleConfirm() {
      this.$emit('confirm')
    },
    handleOutsidePointer(event) {
      event.preventDefault()
      if (this.preventBackdropClose) {
        this.triggerShake()
      } else {
        this.$emit('cancel')
      }
    },
    triggerShake() {
      if (this.shaking) return
      this.shaking = true
      setTimeout(() => {
        this.shaking = false
        this.$nextTick(() => {
          const content = this.$refs.dialogContent
          const modal = content?.$el || content
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

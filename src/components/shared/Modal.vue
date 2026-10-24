<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogContent
      :dir="isRTL ? 'rtl' : 'ltr'"
      :class="['shadcn-ui', sizeClass]"
      :show-close-button="false"
      @escape-key-down="onEscapeKeyDown"
      @pointer-down-outside="onPointerDownOutside"
    >
      <DialogHeader class="flex shrink-0 flex-row items-center justify-between border-b border-border bg-muted/40 p-4">
        <DialogTitle class="text-lg font-semibold theme-text-primary">
          {{ title }}
        </DialogTitle>
        <DialogClose as-child>
          <Button variant="ghost" size="icon" :aria-label="$t('labels.close')">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </DialogClose>
      </DialogHeader>

      <section class="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <slot />
      </section>

      <DialogFooter v-if="$slots.footer" class="shrink-0 border-t border-border bg-muted/40 p-4 sm:justify-start">
        <slot name="footer" />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default {
  name: 'AppModal',
  components: { Button, Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle },
  props: {
    visible: { type: Boolean, required: true },
    title: { type: String, required: true },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'fullscreen'].includes(value)
    },
    closeOnEsc: { type: Boolean, default: true },
    closeOnBackdrop: { type: Boolean, default: true }
  },
  emits: ['update:visible'],
  setup(props) {
    const { locale } = useI18n()
    const isRTL = computed(() => locale.value === 'ar')
    const sizeClass = computed(() => {
      const sizes = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-2xl',
        lg: 'sm:max-w-4xl',
        fullscreen: 'h-dvh max-w-none rounded-none sm:max-w-none'
      }
      return `flex h-dvh max-h-dvh w-full max-w-none flex-col gap-0 overflow-hidden rounded-none bg-white p-0 sm:h-auto sm:max-h-[90vh] sm:rounded-lg ${sizes[props.size]}`
    })

    return { isRTL, sizeClass }
  },
  methods: {
    onOpenChange(open) {
      if (!open) this.$emit('update:visible', false)
    },
    onEscapeKeyDown(event) {
      if (!this.closeOnEsc) event.preventDefault()
    },
    onPointerDownOutside(event) {
      if (!this.closeOnBackdrop) event.preventDefault()
    }
  }
}
</script>

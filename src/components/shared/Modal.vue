<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" :dir="isRTL ? 'rtl' : 'ltr'">
      <div
        :data-modal-id="modalId || null"
        :class="[
          'relative z-10 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col',
          sizeClass
        ]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        ref="dialogRef"
      >
        <!-- Header -->
        <header class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 :id="titleId" class="text-lg font-semibold theme-text-primary">{{ title }}</h3>
          <button
            @click="closeModal"
            :aria-label="$t('labels.close')"
            class="theme-caption hover:theme-text-secondary transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Body -->
        <section class="flex-1 overflow-y-auto p-4 md:p-6">
          <slot />
        </section>

        <!-- Footer (optional) -->
        <footer v-if="$slots.footer" class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'AppModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    modalId: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'fullscreen'].includes(value)
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const { locale } = useI18n();
    const dialogRef = ref(null);
    const titleId = `modal-${Math.random().toString(36).slice(2, 8)}`;

    const isRTL = computed(() => locale.value === 'ar');

    const sizeClass = computed(() => {
      // For mobile (sm screen or less), use fullscreen
      if (window.innerWidth <= 640 || props.size === 'fullscreen') {
        return 'w-full h-full max-w-none rounded-none';
      }

      switch (props.size) {
        case 'sm':
          return 'w-full max-w-sm';
        case 'lg':
          return 'w-full max-w-4xl max-h-[90vh]';
        case 'md':
        default:
          return 'w-full max-w-2xl max-h-[90vh]';
      }
    });

    function closeModal() {
      emit('update:visible', false);
    }

    function handleKeydown(event) {
      if (event.key === 'Escape' && props.closeOnEsc && props.visible) {
        closeModal();
      }
    }

    function handleBackdropClick(event) {
      if (props.closeOnBackdrop && event.target === event.currentTarget) {
        closeModal();
      }
    }

    onMounted(() => {
      if (props.visible) {
        window.addEventListener('keydown', handleKeydown);
        document.body.style.overflow = 'hidden';
        // Focus management - focus on dialog
        setTimeout(() => {
          dialogRef.value?.focus?.();
        }, 0);
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    });

    return {
      dialogRef,
      titleId,
      sizeClass,
      isRTL,
      closeModal,
      handleBackdropClick
    };
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>

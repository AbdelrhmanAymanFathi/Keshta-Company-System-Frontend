<template>
  <Button
    variant="ghost"
    :size="buttonSize"
    type="button"
    :disabled="disabled || loading"
    :title="label"
    :aria-label="label"
    class="action-btn shadcn-ui"
    :class="[`action-btn--${tone}`, `action-btn--${size}`, { 'action-btn--disabled': disabled || loading }]"
    @click.stop="$emit('click', $event)"
  >
    <svg v-if="loading" class="action-btn__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25" />
      <path d="M4 12a8 8 0 018-8v8z" fill="currentColor" opacity="0.75" />
    </svg>
    <component :is="icon" v-else class="action-btn__icon" aria-hidden="true" />
    <span v-if="label && showLabel" class="action-btn__label">{{ label }}</span>
  </Button>
</template>

<script>
import { Button } from '@/components/ui/button'

/**
 * Unified icon action button used by every table/list row action.
 *
 * Visual language:
 *   default / view / statement -> neutral surface tone
 *   wallet                      -> accent (primary theme) tone
 *   edit                        -> amber tone
 *   delete / danger             -> red tone
 *   success                     -> emerald tone
 *
 * Every list should render its row actions through this component (directly
 * or via RowActions.vue) so buttons look and behave identically everywhere.
 */
export default {
  name: 'ActionButton',
  components: { Button },
  props: {
    icon: { type: [Object, Function], default: null },
    label: { type: String, default: '' },
    showLabel: { type: Boolean, default: false },
    tone: {
      type: String,
      default: 'default',
      validator: (v) => ['default', 'view', 'statement', 'wallet', 'edit', 'delete', 'danger', 'success'].includes(v),
    },
    size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  emits: ['click'],
  computed: {
    /**
     * Labeled buttons must not be forced into the square "icon-*" sizes,
     * otherwise the text gets clipped (e.g. "Change owner" row action).
     */
    buttonSize() {
      if (this.label && this.showLabel) {
        if (this.size === 'sm') return 'sm'
        if (this.size === 'lg') return 'lg'
        return 'default'
      }
      return this.size === 'sm' ? 'icon-sm' : this.size === 'lg' ? 'icon-lg' : 'icon'
    },
  },
}
</script>

<style scoped>
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.5rem;
  border-width: 1px;
  border-style: solid;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
  flex-shrink: 0;
}

.action-btn--sm { padding: 0.25rem; }
.action-btn--md { padding: 0.5rem; }
.action-btn--lg { padding: 0.625rem; }

.action-btn__icon { width: 1.25rem; height: 1.25rem; }
.action-btn--sm .action-btn__icon { width: 1rem; height: 1rem; }
.action-btn--lg .action-btn__icon { width: 1.5rem; height: 1.5rem; }

.action-btn__spinner { width: 1.25rem; height: 1.25rem; animation: action-btn-spin 0.8s linear infinite; }
@keyframes action-btn-spin { to { transform: rotate(360deg); } }

.action-btn__label { font-size: 0.8125rem; font-weight: 500; }

/* neutral (view / statement / default) */
.action-btn--default,
.action-btn--view,
.action-btn--statement {
  border-color: rgba(var(--theme-primary-rgb), 0.18);
  background-color: rgba(var(--theme-primary-rgb), 0.06);
  color: var(--theme-primary);
}
.action-btn--default:hover,
.action-btn--view:hover,
.action-btn--statement:hover {
  background-color: rgba(var(--theme-primary-rgb), 0.12);
}

/* accent (wallet / primary action) */
.action-btn--wallet {
  border-color: rgba(var(--theme-primary-rgb), 0.35);
  background-color: rgba(var(--theme-primary-rgb), 0.12);
  color: var(--theme-primary-dark, var(--theme-primary));
}
.action-btn--wallet:hover {
  background-color: rgba(var(--theme-primary-rgb), 0.2);
}

/* edit */
.action-btn--edit {
  border-color: rgba(245, 158, 11, 0.35);
  background-color: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
.dark .action-btn--edit {
  border-color: rgba(245, 158, 11, 0.35);
  background-color: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}
.action-btn--edit:hover {
  background-color: rgba(245, 158, 11, 0.18);
}
.dark .action-btn--edit:hover {
  background-color: rgba(245, 158, 11, 0.25);
}

/* delete / danger */
.action-btn--delete,
.action-btn--danger {
  border-color: rgba(248, 113, 113, 0.35);
  background-color: rgba(248, 113, 113, 0.1);
  color: #dc2626;
}
.dark .action-btn--delete,
.dark .action-btn--danger {
  border-color: rgba(248, 113, 113, 0.35);
  background-color: rgba(248, 113, 113, 0.15);
  color: #f87171;
}
.action-btn--delete:hover,
.action-btn--danger:hover {
  background-color: rgba(248, 113, 113, 0.18);
}
.dark .action-btn--delete:hover,
.dark .action-btn--danger:hover {
  background-color: rgba(248, 113, 113, 0.25);
}

/* success */
.action-btn--success {
  border-color: rgba(16, 185, 129, 0.35);
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
}
.dark .action-btn--success {
  border-color: rgba(16, 185, 129, 0.35);
  background-color: rgba(16, 185, 129, 0.15);
  color: #34d399;
}
.action-btn--success:hover {
  background-color: rgba(16, 185, 129, 0.18);
}
.dark .action-btn--success:hover {
  background-color: rgba(16, 185, 129, 0.25);
}

.action-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>

<template>
  <button
    type="button"
    :disabled="disabled || loading"
    :title="label"
    :aria-label="label"
    class="action-btn"
    :class="[`action-btn--${tone}`, `action-btn--${size}`, { 'action-btn--disabled': disabled || loading }]"
    @click.stop="$emit('click', $event)"
  >
    <svg v-if="loading" class="action-btn__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25" />
      <path d="M4 12a8 8 0 018-8v8z" fill="currentColor" opacity="0.75" />
    </svg>
    <component :is="icon" v-else class="action-btn__icon" aria-hidden="true" />
    <span v-if="label && showLabel" class="action-btn__label">{{ label }}</span>
  </button>
</template>

<script>
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
  border-color: #fde68a;
  background-color: #fffbeb;
  color: #b45309;
}
.action-btn--edit:hover { background-color: #fef3c7; }

/* delete / danger */
.action-btn--delete,
.action-btn--danger {
  border-color: #fecaca;
  background-color: #fef2f2;
  color: #b91c1c;
}
.action-btn--delete:hover,
.action-btn--danger:hover { background-color: #fee2e2; }

/* success */
.action-btn--success {
  border-color: #a7f3d0;
  background-color: #ecfdf5;
  color: #047857;
}
.action-btn--success:hover { background-color: #d1fae5; }

.action-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>

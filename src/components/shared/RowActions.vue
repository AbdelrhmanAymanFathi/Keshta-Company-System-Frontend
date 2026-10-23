<template>
  <div class="row-actions" :class="isRTL ? 'row-actions--rtl' : 'row-actions--ltr'">
    <ActionButton
      v-for="action in actions"
      :key="action.key"
      :icon="action.icon"
      :label="action.label"
      :tone="action.tone || 'default'"
      :size="action.size || size"
      :show-label="action.showLabel"
      :disabled="action.disabled"
      :loading="action.loading"
      @click="action.onClick && action.onClick()"
    />
  </div>
</template>

<script>
import ActionButton from './ActionButton.vue'

/**
 * Renders a consistent, RTL-aware group of row action buttons.
 *
 * Props:
 *   actions: Array<{ key, icon, label, tone?, size?, disabled?, loading?, onClick }>
 *   align:   'end' (default) | 'start' | 'center'
 *
 * Prefer this over hand-written <button> markup for every table row action
 * so the whole system shares one action-button look.
 */
export default {
  name: 'RowActions',
  components: { ActionButton },
  props: {
    actions: { type: Array, default: () => [] },
    align: { type: String, default: 'end', validator: (v) => ['start', 'end', 'center'].includes(v) },
    size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  },
  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
  },
}
</script>

<style scoped>
.row-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.row-actions--ltr { justify-content: var(--row-actions-justify, flex-end); }
.row-actions--rtl { justify-content: var(--row-actions-justify, flex-start); }
</style>

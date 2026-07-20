<template>
  <header
    class="app-page-header flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-200/50 theme-page-header-bar theme-animated-surface theme-glow sm:flex-row sm:items-center sm:justify-between sm:p-5"
    :class="isRTL ? 'text-right' : 'text-left'"
  >
    <div class="min-w-0">
      <h2 class="text-xl font-semibold text-slate-900 theme-text-primary sm:text-2xl">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-1 text-sm theme-text-secondary">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2" :class="isRTL ? 'justify-end' : 'justify-start'">
      <slot />
    </div>
  </header>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
  computed: {
    isRTL() {
      return this.$i18n && this.$i18n.locale === 'ar'
    }
  }
}
</script>

<template>
  <Card
    class="shadcn-ui app-page-header theme-page-header-bar theme-animated-surface theme-glow border-border/80 bg-card/95 shadow-lg shadow-slate-200/50"
    :class="isRTL ? 'text-right' : 'text-left'"
  >
    <CardHeader
      class="flex flex-col gap-4 space-y-0 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div class="min-w-0 space-y-1">
        <CardTitle class="text-xl font-semibold text-foreground sm:text-2xl">
          {{ title }}
        </CardTitle>
        <CardDescription v-if="subtitle" class="text-sm">
          {{ subtitle }}
        </CardDescription>
      </div>

      <div
        v-if="$slots.default"
        class="flex flex-wrap items-center gap-2"
        :class="isRTL ? 'justify-end' : 'justify-start'"
      >
        <slot />
      </div>
    </CardHeader>
  </Card>
</template>

<script>
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default {
  name: 'PageHeader',
  components: { Card, CardDescription, CardHeader, CardTitle },
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

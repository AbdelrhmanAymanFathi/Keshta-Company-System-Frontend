<template>
  <Card class="shadcn-ui border-border/60 bg-card/80">
    <CardContent class="p-6 text-center text-muted-foreground">
      <p class="text-lg font-semibold text-foreground">{{ $t('labels.selectItem') || 'Select an item' }}</p>
      <p class="mt-2 text-sm">{{ $t('labels.selectItemDesc') || 'Choose a menu item to start.' }}</p>
    </CardContent>
  </Card>
</template>

<script>
import { Card, CardContent } from '@/components/ui/card'

export default {
  name: 'SelectPlaceholder',
  components: { Card, CardContent }
}
</script>

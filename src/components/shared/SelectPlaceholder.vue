<template>
  <div class="p-6 text-center theme-text-secondary">
    <p class="text-lg font-semibold">{{ $t('labels.selectItem') || 'Select an item' }}</p>
    <p class="text-sm mt-2 theme-text-muted">{{ $t('labels.selectItemDesc') || 'Choose a menu item to start.' }}</p>
  </div>
</template>

<script>
export default {
  name: 'SelectPlaceholder'
}
</script>

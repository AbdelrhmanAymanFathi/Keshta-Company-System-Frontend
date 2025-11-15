<template>
  <div class="p-6 text-center text-gray-600">
    <p class="text-lg font-semibold">{{ $t('labels.selectItem') || 'Select an item' }}</p>
    <p class="text-sm mt-2 text-gray-500">{{ $t('labels.selectItemDesc') || 'Choose a menu item to start.' }}</p>
  </div>
</template>

<script>
export default {
  name: 'SelectPlaceholder'
}
</script>
